import assert from 'assert'
import domFadeIn from '../src/domFadeIn.mjs'
import domFadeOut from '../src/domFadeOut.mjs'
import domGetFiles from '../src/domGetFiles.mjs'
import domShowInputAndGetFiles from '../src/domShowInputAndGetFiles.mjs'
import { defineOptParam } from './tools/optValKit.mjs'
import { defineOptParamAsync } from './tools/optValKitAsyncG3count.mjs'
import { resetWarned } from './tools/numOptKit.mjs'
import { mkFakeDom, clearFakeDom } from './tools/fakeDom.mjs'
import { mkBrowser, mkFile } from './tools/domFilesKit.mjs'
import { loadStubbed, resetStub, stub } from './tools/domStubKit.mjs'


//第221項第二批第2輪第3批(ws272c): DOM類函數之數值參數改經isenum／iseint判定(R-OPT-VAL-01), 依清單 §3 第28~36項與 §6 之 domFadeOut
//  規格: dspec〈輸入參數之檢測機制〉K3(opt類遇非預期之輸入視為未給、改用預設; opt.debug警告)、K4(檢測之值即使用之值)、§7.1、§11(第21項: Infinity不再代表不限, 改用預設)
//  涵蓋: domConvertToPic.scale、domFadeIn／domFadeOut 之 ele.style.opacity、domShowImages.disTouchMoveToHide、domShowInputAndGetFiles.sizeMbLimit(含 domGetFiles 同批)、
//        domShowInputAndGetFilesU8Arrs.sizeMbLimit、domTooltip之tippystate
//  DOM測試作法: 瀏覽器本身之語義(版面、事件派送、viewer.js與tippy之內部)非本檔所能驗證, 只驗各函數對參數之檢測與取值;
//        以最小假DOM(test/tools/fakeDom.mjs、domFilesKit.mjs)驅動, 無法於Node載入之前端模組(viewerjs、tippy.js與其css、@zumer/snapdom)以test/tools/domStubKit.mjs之載入掛鉤換為記錄呼叫之替身(不新增依賴)


//--- domConvertToPic.scale ---

describe(`optVal domConvertToPic (ws272c)`, function() {

    let domConvertToPic = null

    before(async function() {
        domConvertToPic = await loadStubbed('domConvertToPic')
    })

    after(function() {
        clearFakeDom()
    })

    //probe, 傳入snapdom之scale(替身記錄); 假DOM需insertBefore與firstChild(domPrepend用)
    let probe = async (v, extra = {}) => {
        let env = mkFakeDom()
        env.body.insertBefore = (c) => env.body.appendChild(c)
        Object.defineProperty(env.body, 'firstChild', { get: () => env.body.children[0] || null })
        let ele = env.body.appendChild(new env.Ele('div'))
        resetStub()
        await domConvertToPic(ele, { scale: v, ...extra })
        return stub().snapCalls[0].o.scale
    }

    defineOptParamAsync({
        fn: 'domConvertToPic',
        name: 'opt.scale',
        def: 1,
        probe,
        valid: [
            ['1', 1, 1],
            ['1.5', 1.5, 1.5],
            ['3', 3, 3],
            [`'2'`, '2', 2],
            [`' 2.5 '`, ' 2.5 ', 2.5],
            [`'1e0'`, '1e0', 1],
            ['1e10', 1e10, 1e10],
        ],
    })

    it(`should still reject a valid scale below 1 (0, 0.5, negative, numeric strings of them), unchanged`, async function() {
        let env = mkFakeDom()
        env.body.insertBefore = (c) => env.body.appendChild(c)
        Object.defineProperty(env.body, 'firstChild', { get: () => env.body.children[0] || null })
        let ele = env.body.appendChild(new env.Ele('div'))
        for (let v of [0, 0.5, -1, '0.5', ' 0 ', '-3']) {
            resetStub()
            let msg = null
            try {
                await domConvertToPic(ele, { scale: v })
            }
            catch (err) {
                msg = err
            }
            assert.strict.deepStrictEqual(msg, 'opt.scale can not less then 1', String(v))
            assert.strict.deepStrictEqual(stub().snapCalls.length, 0)
        }
    })

    it(`should use the default scale 1 (not the range-error reject) for -Infinity and '-Infinity' (not expected inputs)`, async function() {
        assert.strict.deepStrictEqual(await probe(-Infinity), 1)
        assert.strict.deepStrictEqual(await probe('-Infinity'), 1)
    })

})


//--- domFadeIn／domFadeOut 之 ele.style.opacity(元素現行不透明度作漸變起點) ---

//probeFadeStart, 設ele.style.opacity後呼叫f, 暫換計時器手動執行延遲計時器與第一次更新週期, 回傳第一次寫入之不透明度(漸變起點)
function probeFadeStart(f, styleOpacity, o = {}) {
    let env = mkFakeDom()
    let ele = new env.Ele('div')
    ele.style.opacity = styleOpacity
    let timeouts = []
    let intervals = []
    let ost = globalThis.setTimeout
    let osi = globalThis.setInterval
    let oci = globalThis.clearInterval
    globalThis.setTimeout = (fn) => {
        timeouts.push(fn)
        return 1
    }
    globalThis.setInterval = (fn) => {
        intervals.push(fn)
        return 2
    }
    globalThis.clearInterval = () => {}
    try {
        f(ele, { duration: 500, ...o })
        for (let t of timeouts.splice(0)) {
            t()
        }
        intervals[0]()
        return ele.style.opacity
    }
    finally {
        globalThis.setTimeout = ost
        globalThis.setInterval = osi
        globalThis.clearInterval = oci
        clearFakeDom()
    }
}

describe(`optVal domFadeIn／domFadeOut ele.style.opacity (ws272c)`, function() {

    //real DOM之style.opacity恆為''或十進位數字字串; 假DOM可放任意值以驗證判定: 有效數字才作漸變起點, 其餘(Infinity、'0x10'、包裝物件等)忽略而用opacityIni(fadeIn預設0、fadeOut預設1)
    for (let [name, f, defIni] of [['domFadeIn', domFadeIn, 0], ['domFadeOut', domFadeOut, 1]]) {

        defineOptParam({
            fn: name,
            name: 'ele.style.opacity',
            def: defIni,
            probe: (v) => probeFadeStart(f, v),
            valid: [
                [`'0.3'`, '0.3', 0.3],
                [`'0.6'`, '0.6', 0.6],
                [`' 0.5 '`, ' 0.5 ', 0.5],
                [`'1'`, '1', 1],
                [`'0'`, '0', 0],
                ['0.25', 0.25, 0.25],
            ],
            noDebug: true,
            withValidStr: false,
        })

        it(`${name} should use opacityIni when ele.style.opacity is Infinity or '0x10' (formerly 1.8e308 and 16 were written)`, function() {
            assert.strict.deepStrictEqual(probeFadeStart(f, 'Infinity', { opacityIni: 0.4 }), 0.4)
            assert.strict.deepStrictEqual(probeFadeStart(f, '0x10', { opacityIni: 0.4 }), 0.4)
            assert.strict.deepStrictEqual(probeFadeStart(f, Infinity, { opacityIni: 0.4 }), 0.4)
        })

    }

})


//--- domShowImages.disTouchMoveToHide ---

describe(`optVal domShowImages (ws272c)`, function() {

    let domShowImages = null

    before(async function() {
        domShowImages = await loadStubbed('domShowImages')
    })

    after(function() {
        delete globalThis.document
    })

    //El, 假元素: isEle走lodash isElement, 要求nodeType為1且非plain object, 故以class實例
    class El {
        constructor() {
            this.nodeType = 1
            this.handlers = {}
        }

        addEventListener(type, fn) {
            this.handlers[type] = fn
        }

        querySelectorAll() {
            return [1]
        }
    }

    //mkViewerEle, 替身viewer.js之容器元素: 記錄touchstart/touchmove/touchend之監聽, 供測試觸發
    let mkViewerEle = () => new El()

    //probe, 在一次輕點中移動m px後放開, 實際被判為可隱藏(vw.hide)之m(0~9)個數即門檻(m小於門檻才隱藏)
    let probe = async (v, extra = {}) => {
        let n = 0
        for (let m = 0; m <= 9; m++) {
            resetStub()
            globalThis.document = { elementsFromPoint: () => [] }
            let ve = mkViewerEle()
            stub().viewerEle = ve
            let img = new El()
            let pm = domShowImages(img, null, { disTouchMoveToHide: v, ...extra })
            pm.catch(() => {})
            //shown之core為async: 等監聽掛載
            for (let i = 0; i < 100 && !ve.handlers.touchend; i++) {
                await new Promise((resolve) => setImmediate(resolve))
            }
            let ev = (x, y) => ({ touches: [{ clientX: x, clientY: y }], preventDefault: () => {}, stopPropagation: () => {} })
            ve.handlers.touchstart(ev(0, 0))
            ve.handlers.touchmove(ev(m, 0))
            ve.handlers.touchend(ev(m, 0))
            if (stub().hides.length > 0) {
                n++
            }
        }
        return n
    }

    defineOptParamAsync({
        fn: 'domShowImages',
        name: 'opt.disTouchMoveToHide',
        def: 4,
        probe,
        extraInvalid: [['-1', -1], [`'-1'`, '-1'], ['1.5', 1.5], [`'1.5'`, '1.5'], ['4294967296', 4294967296], ['2 ** 53', 2 ** 53]],
        valid: [
            ['0', 0, 0],
            ['1', 1, 1],
            ['3', 3, 3],
            ['7', 7, 7],
            [`'2'`, '2', 2],
            [`' 5 '`, ' 5 ', 5],
            [`'6.0'`, '6.0', 6],
            ['1e9 (never hide by moving, 10 of 10 trials hide)', 1e9, 10],
        ],
    })

    it(`should not take Infinity as "never hide by moving" any more (the default 4 is used)`, async function() {
        assert.strict.deepStrictEqual(await probe(Infinity), 4)
        assert.strict.deepStrictEqual(await probe(1e9), 10)
    })

})


//--- domShowInputAndGetFiles.sizeMbLimit ---

//GRID, 檔案大小(mb)格點; 大者不佔記憶體(mkFile只給size); 實際採用之上限即未被列入errs之最大格點
const GRID = [0.25, 0.5, 1, 2, 3, 5, 10, 100, 500, 999, 1000, 1001, 2000, 100000, 1e10]

function limitOf(errs) {
    let bad = new Set(Object.keys(errs).map(Number))
    let ok = GRID.filter((mb, i) => !bad.has(i))
    return Math.max(...ok)
}

describe(`optVal domGetFiles sizeMbLimit (ws272c)`, function() {

    //位置參數(JSDoc [sizeMbLimit=1000]), 無opt可帶debug
    defineOptParam({
        fn: 'domGetFiles',
        name: 'sizeMbLimit',
        def: 1000,
        probe: (v) => limitOf(domGetFiles({ files: GRID.map((mb) => mkFile(`f${mb}`, mb)) }, v).errs),
        extraInvalid: [['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1']],
        valid: [
            ['0.5', 0.5, 0.5],
            ['2', 2, 2],
            ['10', 10, 10],
            [`'5'`, '5', 5],
            [`' 3 '`, ' 3 ', 3],
            ['2000', 2000, 2000],
        ],
        noDebug: true,
    })

    it(`should use the default 1000 for Infinity (formerly no limit at all because cdbl turned it into Number.MAX_VALUE)`, function() {
        let rs = domGetFiles({ files: GRID.map((mb) => mkFile(`f${mb}`, mb)) }, Infinity)
        assert.strict.deepStrictEqual(limitOf(rs.errs), 1000)
        assert.strict.deepStrictEqual(domGetFiles({ files: [mkFile('a', 2000)] }).errs[0].startsWith('file size['), true)
    })

})

describe(`optVal domShowInputAndGetFiles sizeMbLimit (ws272c)`, function() {

    let probe = async (v, extra = {}) => {
        let env = mkBrowser()
        try {
            let pm = domShowInputAndGetFiles({ sizeMbLimit: v, ...extra })
            let inp = env.document.querySelector('input')
            inp.files = GRID.map((mb) => mkFile(`f${mb}`, mb))
            inp.dispatchEvent({ type: 'change' })
            let r = await pm
            return limitOf(r.errs)
        }
        finally {
            env.restore()
        }
    }

    defineOptParamAsync({
        fn: 'domShowInputAndGetFiles',
        name: 'opt.sizeMbLimit',
        def: 1000,
        probe,
        extraInvalid: [['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1']],
        valid: [
            ['0.5', 0.5, 0.5],
            ['2', 2, 2],
            ['10', 10, 10],
            [`'5'`, '5', 5],
            [`' 3 '`, ' 3 ', 3],
            ['2000', 2000, 2000],
        ],
    })

    it(`should use the default 1000 for Infinity (formerly no limit at all), in the same way as domGetFiles (both layers agree)`, async function() {
        assert.strict.deepStrictEqual(await probe(Infinity), 1000)
        assert.strict.deepStrictEqual(await probe(Infinity), limitOf(domGetFiles({ files: GRID.map((mb) => mkFile(`f${mb}`, mb)) }, Infinity).errs))
    })

})

describe(`optVal domShowInputAndGetFilesU8Arrs sizeMbLimit (ws272c)`, function() {

    let fn = null

    before(async function() {
        fn = await loadStubbed('domShowInputAndGetFilesU8Arrs')
    })

    //觀察轉交給domShowInputAndGetFiles之sizeMbLimit(替身記錄)
    let probe = (v, extra = {}) => {
        resetStub()
        let pm = fn({ sizeMbLimit: v, ...extra })
        pm.catch(() => {})
        return stub().dsiagfCalls[0].sizeMbLimit
    }

    defineOptParam({
        fn: 'domShowInputAndGetFilesU8Arrs',
        name: 'opt.sizeMbLimit',
        def: 1000,
        probe,
        valid: [
            ['0', 0, 0],
            ['0.5', 0.5, 0.5],
            ['2', 2, 2],
            ['2000', 2000, 2000],
            [`'5'`, '5', 5],
            [`' 3 '`, ' 3 ', 3],
        ],
    })

    it(`should forward the other options unchanged (kind, multiple, entireHierarchy)`, function() {
        resetStub()
        let pm = fn({ kind: 'image', multiple: true, entireHierarchy: false, sizeMbLimit: 7 })
        pm.catch(() => {})
        assert.strict.deepStrictEqual(stub().dsiagfCalls[0], { kind: 'image', multiple: true, entireHierarchy: false, sizeMbLimit: 7 })
    })

    it(`should warn once with the debug option and without the value, naming domShowInputAndGetFilesU8Arrs`, function() {
        resetWarned()
        let logs = []
        probe('SECRET-VALUE-123', { debug: true, funLog: (msg, info) => logs.push({ msg, info }) })
        assert.strict.deepStrictEqual(logs.length, 1)
        assert.ok(logs[0].msg.startsWith('[wsemi domShowInputAndGetFilesU8Arrs] invalid opt.sizeMbLimit: must be '), logs[0].msg)
        assert.ok(!logs[0].msg.includes('SECRET-VALUE-123'))
        resetWarned()
    })

})


//--- domTooltip.tippystate ---

describe(`optVal domTooltip tippystate (ws272c)`, function() {

    let domTooltip = null

    before(async function() {
        domTooltip = await loadStubbed('domTooltip')
    })

    after(function() {
        clearFakeDom()
    })

    //mk, 假元素(屬性可讀寫)與攔截setInterval
    let mk = (state) => {
        let env = mkFakeDom()
        let ele = new env.Ele('div')
        if (state !== null) {
            ele.setAttribute('tippystate', state)
        }
        return ele
    }

    //run, 呼叫domTooltip並攔截其setInterval; 回傳是否建立了tippy與自動倒數函數
    let run = (ele) => {
        resetStub()
        let intervals = []
        let osi = globalThis.setInterval
        let oci = globalThis.clearInterval
        globalThis.setInterval = (fn, ms) => {
            intervals.push({ fn, ms })
            return 7
        }
        globalThis.clearInterval = () => {}
        try {
            domTooltip(ele, 'hello')
        }
        finally {
            globalThis.setInterval = osi
            globalThis.clearInterval = oci
        }
        return { created: stub().tippyCalls.length, intervals }
    }

    it(`should create the tooltip when tippystate is absent, empty or not a valid number ('0x10', 'Infinity', 'abc'), and write '5'`, function() {
        for (let s of [null, '', 'abc', '0x10', 'Infinity', '-Infinity', '1e400', ' ']) {
            let ele = mk(s)
            let r = run(ele)
            assert.strict.deepStrictEqual([r.created, ele.getAttribute('tippystate')], [1, '5'], `state ${JSON.stringify(s)}`)
            assert.strict.deepStrictEqual(r.intervals.map((x) => x.ms), [1000])
        }
    })

    it(`should only reset the countdown to '5' and not create another tooltip while tippystate is a valid number`, function() {
        for (let s of ['5', '3', '0', ' 2 ', '1.5', '-1']) {
            let ele = mk(s)
            let r = run(ele)
            assert.strict.deepStrictEqual([r.created, r.intervals.length, ele.getAttribute('tippystate')], [0, 0, '5'], `state ${JSON.stringify(s)}`)
        }
    })

    it(`should count down by 1 each second while tippystate is a valid number, and destroy at 0 or when it is no longer a valid number`, function() {
        let ele = mk(null)
        let r = run(ele)
        let tick = r.intervals[0].fn
        let tp = stub().tippyCalls[0].tp
        assert.strict.deepStrictEqual(ele.getAttribute('tippystate'), '5')
        tick()
        assert.strict.deepStrictEqual([ele.getAttribute('tippystate'), tp.destroyed], ['4', 0])
        ele.setAttribute('tippystate', '1')
        tick()
        assert.strict.deepStrictEqual([ele.getAttribute('tippystate'), tp.destroyed > 0], ['', true]) //倒數至0即destroy(destroy重設tippystate為'')

        //不再為有效數字(如被外部寫成'Infinity'、'0x10')即destroy
        for (let s of ['Infinity', '0x10', 'abc', '']) {
            let ele2 = mk(null)
            let r2 = run(ele2)
            let tp2 = stub().tippyCalls[0].tp
            ele2.setAttribute('tippystate', s)
            r2.intervals[0].fn()
            assert.strict.deepStrictEqual([tp2.destroyed > 0, ele2.getAttribute('tippystate')], [true, ''], `state ${JSON.stringify(s)}`)
        }
    })

})
