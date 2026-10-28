import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import delay from '../src/delay.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`delay`, function() {

    it(`should touch [then] in 2 sec. when call delay`, function() {
        delay(2000)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepStrictEqual(1, 'can not touch catch')
            })
    })

    //預設值以實測為準: 未傳ms(亦未傳opt, 即多函數呼叫之熱路徑)時延遲10ms, 假時鐘下9ms未完成、10ms完成
    it(`should wait 10ms when ms is omitted, as the default of ms`, async function() {
        let clock = useFakeClock()
        try {
            let n = 0
            delay().then(() => {
                n++
            })
            await clock.advance(9)
            let at9 = n
            await clock.advance(1)
            assert.strict.deepStrictEqual([at9, n], [0, 1])
        }
        finally {
            clock.restore()
        }
    })

    //JSDoc與程式一致: @param預設值須等於實測之預設值(10), @returns之型別括號須成對
    it(`should document the measured default of ms and a well-formed return type in the JSDoc`, function() {
        let src = fs.readFileSync(fileURLToPath(new URL('../src/delay.mjs', import.meta.url)), 'utf8')
        let m = src.match(/@param \{Number\} \[ms=(\d+)\]/)
        assert.strict.deepStrictEqual(m !== null && Number(m[1]), 10)
        assert.strict.deepStrictEqual(/@returns \{[^}\s]*\}\}/.test(src), false)
    })

})


describe(`delay 觀察回調(onTrace)`, function() {

    //「延遲多久才resolve」本身即規格, 以假時鐘推進(R-TRACE-01 P5), 並以事件斷言開始與完畢
    it(`should notify start at once and done only when the delay has elapsed, and resolve after done`, async function() {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let n = 0
            delay(100, { onTrace: tr.on }).then(() => {
                n++
            })
            //JSDoc 'start'為開始延遲(含ms)
            assert.strict.deepStrictEqual(tr.events.map((e) => [e.type, e.ms]), [['start', 100]])
            await clock.advance(99)
            //未滿100ms: 尚未完畢、尚未resolve
            assert.strict.deepStrictEqual(tr.events.map((e) => e.type), ['start'])
            assert.strict.deepStrictEqual(n, 0)
            await clock.advance(1)
            //滿100ms: 通知'done'後resolve
            assert.strict.deepStrictEqual(tr.events.map((e) => [e.type, e.ms]), [['start', 100], ['done', 100]])
            assert.strict.deepStrictEqual(n, 1)
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify the ms actually used: 10 by default or for a non-number, and clamped to the timer maximum`, async function() {
        let clock = useFakeClock()
        try {
            let got = []
            for (let ms of [undefined, 'abc', NaN, null, '25', 1e10]) {
                let tr = traceRec()
                if (ms === undefined) {
                    delay(undefined, { onTrace: tr.on })
                }
                else {
                    delay(ms, { onTrace: tr.on })
                }
                got.push(tr.events[0].ms)
            }
            //JSDoc 預設10ms; 非數字以10ms; 數字字串依其值(轉為數字); 超過計時器上限(2147483647)夾至上限
            assert.strict.deepStrictEqual(got, [10, 10, 10, 10, 25, 2147483647])
        }
        finally {
            clock.restore()
        }
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第2參數可省略, 同舊版之delay(ms)); P4: 回調之拋錯與回傳值不影響延遲、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        let rec = traceRec()
        try {
            let throws = () => {
                throw new Error('trace boom')
            }
            let rejects = () => Promise.reject(new Error('trace reject'))
            for (let args of [[], [{ onTrace: rec.on }], [{ onTrace: throws }], [{ onTrace: rejects }], [{ onTrace: 'abc' }]]) {
                let clock = useFakeClock()
                try {
                    let log = []
                    let p1 = delay(50, ...args).then((v) => {
                        log.push(['50', v])
                    })
                    let p2 = delay(undefined, ...args).then((v) => {
                        log.push(['default', v])
                    })
                    await clock.advance(9)
                    let at9 = log.length
                    await clock.advance(1)
                    let at10 = log.slice()
                    await clock.advance(39)
                    let at49 = log.length
                    await clock.advance(1)
                    await Promise.all([p1, p2])
                    rs.push({ at9, at10, at49, at50: log.slice() })
                }
                finally {
                    clock.restore()
                }
            }
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let exp = { at9: 0, at10: [['default', undefined]], at49: 1, at50: [['default', undefined], ['50', undefined]] }
        assert.strict.deepStrictEqual([rs, un], [[exp, exp, exp, exp, exp], []])
        //紀錄器確實收到事件(2次延遲各start、done)
        assert.strict.deepStrictEqual(rec.events.map((e) => [e.type, e.ms]), [['start', 50], ['start', 10], ['done', 10], ['done', 50]])
    })

    it(`should notify through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let meta = []
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                tr.on(e)
            }
            delay(5, { onTrace })
            await clock.advance(5)
            let keys = {}
            for (let e of tr.events) {
                keys[e.type] = Object.keys(e).join(',')
                assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
            }
            assert.strict.deepStrictEqual(keys, { start: 'type,ms', done: 'type,ms' })
            assert.strict.deepStrictEqual(meta, [[undefined, true], [undefined, true]])
        }
        finally {
            clock.restore()
        }
    })

})
