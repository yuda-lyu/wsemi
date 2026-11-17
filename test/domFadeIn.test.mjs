import assert from 'assert'
import { mock } from 'node:test'
import domFadeIn from '../src/domFadeIn.mjs'
import { mkQueryEnv, fadeTrace } from './tools/domArgKit.mjs'


//ws492e: N-B(主控定): domFadeIn之opt.delay與opt.opacityIni原以cdbl轉換代判定('abc'、null、包裝物件靜默變0, Infinity夾為MAX_VALUE, 超出0至1夾限), 改為isenum判定(Q1-h): delay須為0至2147483647之有效數字(可帶小數)、opacityIni須為0至1之有效數字, 非預期視為未給改用預設(delay 0、opacityIni 0), 不夾限、不報錯(K3超出範圍亦同), 通過者以Number轉換後使用(K4)
//  規格: dspec〈輸入參數之檢測機制〉K3、K4、V5、Q1-h; JSDoc原稱delay為「整數」, 實為計時毫秒(可帶小數)
//  測試作法: 以最小假DOM之元素(mkQueryEnv)與node:test之mock.timers推進假時間, 每10ms記錄ele.style.opacity; 「非預期等同未給」以與{}之觀察序列逐項相同判定; 真實淡入之畫面屬瀏覽器語義, 另以真瀏覽器實測
describe(`domFadeIn`, function() {

    let env = null
    let tr = (opt) => fadeTrace(mock, domFadeIn, env, opt)
    let firstSet = (t) => t.findIndex((v) => v !== undefined)

    beforeEach(function() {
        env = mkQueryEnv()
        mock.timers.enable({ apis: ['setTimeout', 'setInterval'], now: 0 })
    })

    afterEach(function() {
        mock.timers.reset()
        env.restore()
    })

    //BAD, 非預期之數值輸入(對delay與opacityIni皆為非預期)
    let BAD = [
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        [`'Infinity'`, 'Infinity'],
        [`'1e400'`, '1e400'],
        [`'0x10'`, '0x10'],
        [`'abc'`, 'abc'],
        [`''`, ''],
        ['true', true],
        ['false', false],
        ['{}', {}],
        ['[]', []],
        ['[0.5]', [0.5]],
        ['function', () => 0.5],
        ['Symbol', Symbol('x')],
        ['new Number(0.5)', new Number(0.5)], // eslint-disable-line no-new-wrappers
    ]

    //spec(K3): opt.delay非預期(含負數、超過計時器上限2147483647、null)視為未給, 序列與未給相同
    for (let [label, v] of [...BAD, ['-1', -1], ['2147483648', 2147483648], ['null', null], ['undefined', undefined]]) {
        it(`should treat delay ${label} as not given`, function() {
            let base = tr({})
            env.restore()
            env = mkQueryEnv()
            assert.strict.deepStrictEqual(tr({ delay: v }), base)
        })
    }

    //delayOf, 交給setTimeout之第一個延遲值(假計時器對負數與超出上限者一律改1毫秒而使序列相同, 故另以包裝觀察引數本身; 變異M38證明此案必要)
    let delayOf = (opt) => {
        let rec = []
        let raw = globalThis.setTimeout
        globalThis.setTimeout = (fn, ms, ...a) => {
            rec.push(ms)
            return raw(fn, ms, ...a)
        }
        try {
            domFadeIn(env.mk('div'), opt)
        }
        finally {
            globalThis.setTimeout = raw
        }
        return rec[0]
    }

    //spec(K3): 非預期(含負數、超過2147483647)之delay交給setTimeout者為預設0(不夾限、不原樣傳入); 有效者(含小數、數字字串)交給setTimeout者為轉換後之數字
    for (let [label, v] of [...BAD, ['-1', -1], ['2147483648', 2147483648], ['null', null], ['undefined', undefined]]) {
        it(`should hand the default 0 to setTimeout when delay is ${label}`, function() {
            assert.strict.deepStrictEqual(delayOf({ delay: v }), 0)
        })
    }
    for (let [label, v, want] of [['50', 50, 50], [`'50'`, '50', 50], [`' 50 '`, ' 50 ', 50], ['0.5', 0.5, 0.5], ['2147483647', 2147483647, 2147483647]]) {
        it(`should hand ${want} to setTimeout when delay is ${label}`, function() {
            assert.strict.deepStrictEqual(delayOf({ delay: v }), want)
        })
    }

    //spec: opt.delay有效(含小數、數字字串)依其延遲啟動, 以與預設(delay 0, 計時器以1ms排程)相差之步數判定; 每步10ms, 首次更新於delay+10ms之計時點(delay 50: 預設於第11ms、此者於第60ms, 以10ms步計相差4步; delay 100相差9步)
    for (let [label, v, steps] of [['50', 50, 4], [`'50'`, '50', 4], [`' 50 '`, ' 50 ', 4], ['100', 100, 9], ['0', 0, 0]]) {
        it(`should delay the start by ${steps} steps when delay is ${label}`, function() {
            let base = firstSet(tr({}))
            env.restore()
            env = mkQueryEnv()
            let t = tr({ delay: v })
            assert.strict.deepStrictEqual(firstSet(t) - base, steps)
        })
    }

    //spec(K3): opt.opacityIni非預期(含超出0至1: 不夾限)視為未給, 序列與未給相同
    for (let [label, v] of [...BAD, ['-0.1', -0.1], ['1.1', 1.1], ['5', 5], ['-5', -5], ['null', null], ['undefined', undefined]]) {
        it(`should treat opacityIni ${label} as not given (start from 0, no clamping)`, function() {
            let base = tr({})
            env.restore()
            env = mkQueryEnv()
            let t = tr({ opacityIni: v })
            assert.strict.deepStrictEqual(t, base)
            assert.strict.deepStrictEqual(t[firstSet(t)], 0)
        })
    }

    //spec: opt.opacityIni有效(含數字字串)自該值起淡入
    for (let [label, v, want] of [['0.5', 0.5, 0.5], [`'0.5'`, '0.5', 0.5], [`' 0.25 '`, ' 0.25 ', 0.25], ['1', 1, 1], ['0', 0, 0]]) {
        it(`should start from ${want} when opacityIni is ${label}`, function() {
            let t = tr({ opacityIni: v })
            assert.strict.deepStrictEqual(t[firstSet(t)], want)
            assert.strict.deepStrictEqual(typeof t[firstSet(t)], 'number')
        })
    }

    //spec: 不改寫呼叫端之opt
    it(`should not modify the caller's opt`, function() {
        let opt = { delay: 'abc', opacityIni: 5 }
        tr(opt)
        assert.strict.deepStrictEqual(opt, { delay: 'abc', opacityIni: 5 })
    })

    //spec: opt.debug為true時, delay與opacityIni非預期以固定詞彙警告(不含值)
    it(`should warn without the value via funLog when debug is true and delay or opacityIni is invalid`, async function() {
        let parseNumOpt = (await import('../src/_numOpt.mjs')).default
        parseNumOpt.resetWarned() //同一函數、同一參數每個行程只警告一次, 先重設去重表
        let ms = []
        tr({ delay: 'SECRET-D', opacityIni: 'SECRET-O', debug: true, funLog: (m) => ms.push(m) })
        assert.strict.deepStrictEqual(ms.some((m) => m.includes('opt.delay')), true)
        assert.strict.deepStrictEqual(ms.some((m) => m.includes('opt.opacityIni')), true)
        assert.strict.deepStrictEqual(ms.some((m) => m.includes('SECRET')), false)
    })

})
