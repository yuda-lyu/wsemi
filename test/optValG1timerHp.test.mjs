import assert from 'assert'
import setTimeoutHp from '../src/setTimeoutHp.mjs'
import setIntervalHp from '../src/setIntervalHp.mjs'
import { defineOptParam } from './tools/optValKit.mjs'
import { resetWarned, capture } from './tools/numOptKit.mjs'
import { captureTimerCbs, probeHpInterval, probeHpFiresAt, withHrtimeMs } from './tools/g1timerKit.mjs'


//setTimeoutHp(fun, interval, opt)、setIntervalHp(fun, interval, opt): interval為opt類參數(JSDoc [interval=1], 程式碼有回退), isenum(use: 'positive', 大於0, 不設上限),
//  非預期(含0、負數、Infinity、NaN、非數字)視為未給、改用預設1毫秒並照常啟動(舊版: 不啟動、不調用fun、console.log記錄Error)
//  不設2147483647上限(主控裁定, 第221項第二批報告§8.2第1、16項): 二者以hrtime加setTimeout(loop, 1)輪詢, interval只與經過時間比較、不交給原生計時器;
//  大於2147483647之有限正數依原值等待(舊版即如此, 本輪不得變成1毫秒立即觸發)
//可觀察值: 「自建立起至少經過多久(毫秒)才到期」(以elapsed >= interval判定, 故為ceil(interval); 預設1為1)
//  做法: 攔截迴圈用setTimeout之回呼, 暫換process.hrtime.bigint(getTimeHp於Node以其計時), 二分搜尋最小經過時間(test/tools/g1timerKit.mjs之minInt), 不依賴實際等待
//  端到端(子行程, 以事件同步)之非預期案另見test/setTimeoutHp.test.mjs、test/setIntervalHp.test.mjs之interval驗證

for (let [name, fn] of [['setTimeoutHp', setTimeoutHp], ['setIntervalHp', setIntervalHp]]) {

    describe(`optVal ${name}`, function() {

        let probe = probeHpInterval(fn)

        defineOptParam({
            fn: name,
            name: 'interval',
            def: 1,
            probe,
            valid: [
                ['5', 5, 5],
                ['1.5 (can have decimals, ceil)', 1.5, 2],
                ['20', 20, 20],
                [`' 30 '`, ' 30 ', 30],
                [`'1e1'`, '1e1', 10],
                [`'+5.'`, '+5.', 5],
                ['2147483647 (old timer cap)', 2147483647, 2147483647],
                [`'2147483647'`, '2147483647', 2147483647],
                ['2147483648 (above old timer cap, no upper limit)', 2147483648, 2147483648],
                [`'2147483648'`, '2147483648', 2147483648],
            ],
            extraInvalid: [
                ['-1', -1],
                [`'-1'`, '-1'],
                ['-0.5', -0.5],
                ['0 (gt: 0)', 0],
                [`'0'`, '0'],
            ],
        })

        it(`should start with the default 1ms for an unexpected interval (old version did not start and returned without scheduling)`, function() {
            // K3(使用者2026-10-31): 非預期之輸入視為未給、改用預設1毫秒並照常啟動; 舊版回'NOSTART'(不排程)
            for (let bad of [0, -5, NaN, Infinity, -Infinity, 'abc', '', ' ', null, true, {}, [], new Number(30)]) { // eslint-disable-line no-new-wrappers
                assert.strict.deepStrictEqual(probe(bad), 1, `bad=${String(typeof bad === 'object' && bad !== null ? JSON.stringify(bad) : bad)}`)
            }
        })

        it(`should keep waiting for a finite positive interval above 2147483647 (no upper limit; not clamped, not replaced by the default)`, function() {
            // 主控裁定(§8.2第1、16項): positive不設上限; interval不交給原生計時器, 故3e9毫秒照原值等待(24.8天以上), 不變成1毫秒立即觸發
            for (let v of [2147483648, 3e9, '3e9', ' 3000000000 ']) {
                let n = Number(v)
                assert.strict.deepStrictEqual(probeHpFiresAt(fn, v, 1), false, `v=${v} should not fire after 1ms`)
                assert.strict.deepStrictEqual(probeHpFiresAt(fn, v, n - 1), false, `v=${v} just before the interval`)
                assert.strict.deepStrictEqual(probeHpFiresAt(fn, v, n), true, `v=${v} at the interval`)
            }

            // 更大之有限正數(接近安全整數上限、1e21): 不因超過舊上限而改用預設1毫秒(經過2147483664毫秒仍不到期)
            for (let v of [Number.MAX_SAFE_INTEGER, 1e21, '1e21']) {
                assert.strict.deepStrictEqual(probeHpFiresAt(fn, v, 1), false, `v=${v} should not fire after 1ms`)
                assert.strict.deepStrictEqual(probeHpFiresAt(fn, v, 2147483664), false, `v=${v} should not fire after 2147483664ms`)
            }
        })

        it(`should not log anything (no Error record) for an unexpected interval`, function() {
            // 舊版以console.log記錄Error('interval is not a positive finite number'); 新版不記錄(預設1毫秒並啟動, debug才警告)
            let logs = []
            let ol = console.log
            console.log = (...a) => {
                logs.push(a)
            }
            try {
                withHrtimeMs(() => {
                    captureTimerCbs(() => {
                        fn(() => {}, 'abc')
                        fn(() => {}, Infinity)
                        fn(() => {}, 0)
                    })
                })
            }
            finally {
                console.log = ol
            }
            assert.strict.deepStrictEqual(logs, [])
        })

        it(`should schedule the loop and keep the return type (${name === 'setTimeoutHp' ? 'null' : 'stop function'}) for an unexpected interval`, function() {
            // 回傳值不變: setTimeoutHp回傳null; setIntervalHp回傳停止函數(舊版無效時回傳no-op停止函數, 新版為真正之停止函數)
            let { r, calls } = captureTimerCbs(() => fn(() => {}, 'abc'))
            assert.strict.deepStrictEqual(calls.length, 1)
            if (name === 'setTimeoutHp') {
                assert.strict.deepStrictEqual(r, null)
            }
            else {
                assert.strict.deepStrictEqual(typeof r, 'function')
            }
        })

        it(`debug warning should use the fixed wording and warn once`, function() {
            // K3 opt.debug: 固定詞彙, 含所採之預設
            resetWarned()
            let { funLog, logs } = capture()
            probe('abc', { debug: true, funLog })
            probe('abc', { debug: true, funLog })
            assert.strict.deepStrictEqual(logs.map((l) => l.msg), [`[wsemi ${name}] invalid interval: must be a valid number (use 'positive'), using default 1`])
            resetWarned()
        })

        it(`debug should not warn for a valid interval above 2147483647`, function() {
            resetWarned()
            let { funLog, logs } = capture()
            withHrtimeMs(() => {
                captureTimerCbs(() => {
                    fn(() => {}, 3e9, { debug: true, funLog })
                })
            })
            assert.strict.deepStrictEqual(logs.length, 0)
            resetWarned()
        })

    })

}
