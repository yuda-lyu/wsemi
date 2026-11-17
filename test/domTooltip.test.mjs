import assert from 'assert'
import { loadStubbed, resetStub, stub } from './tools/domStubKit.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'
import { trackIntervals } from './tools/fakeDom.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): 會改動畫面者比照domAppend, domTooltip之ele非元素、content給了而非字串即以固定訊息(V19)拋錯、先於任何改動(不設tippystate屬性、不建立提示、不起計時器)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、V19、V20(不回顯輸入值)、V17(無殘留)
//  測試作法: domTooltip於Node無法直接載入(tippy.js與其css), 以test/tools/domStubKit.mjs之loadStubbed載入並以tippy替身記錄呼叫; 元素以最小假DOM(mkQueryEnv); setInterval以trackIntervals追蹤殘留
describe(`domTooltip`, function() {

    let domTooltip = null
    let env = null
    let ti = null

    before(async function() {
        domTooltip = await loadStubbed('domTooltip')
    })

    beforeEach(function() {
        resetStub()
        env = mkQueryEnv()
        ti = trackIntervals()
    })

    afterEach(function() {
        ti.restore()
        env.restore()
    })

    //spec: ele非元素拋Error('invalid ele: must be an element'), 先於任何改動(無tippy、無屬性、無計時器)
    for (let [label, v] of NOT_ELE) {
        it(`should throw invalid ele when ele is ${label}, creating no tippy and no timer`, function() {
            assert.throws(() => domTooltip(v, 'hello'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid ele: must be an element')
                return true
            })
            assert.strict.deepStrictEqual(stub().tippyCalls.length, 0)
            assert.strict.deepStrictEqual(ti.active(), 0)
        })
    }

    //spec: content給了(非undefined、null)而非字串拋Error('invalid content: must be a string'), 先於任何改動
    let BAD_CONTENT = [
        ['5', 5],
        ['0', 0],
        ['true', true],
        ['false', false],
        ['NaN', NaN],
        ['{}', {}],
        ['[]', []],
        ['function', () => {}],
        ['Symbol', Symbol('x')],
        ['new String', new String('a')], // eslint-disable-line no-new-wrappers
    ]
    for (let [label, v] of BAD_CONTENT) {
        it(`should throw invalid content when content is ${label}, setting no attribute and creating no tippy`, function() {
            let ele = env.mk('div')
            assert.throws(() => domTooltip(ele, v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid content: must be a string')
                return true
            })
            assert.strict.deepStrictEqual(ele.attrs.size, 0)
            assert.strict.deepStrictEqual(stub().tippyCalls.length, 0)
            assert.strict.deepStrictEqual(ti.active(), 0)
        })
    }

    //spec: 兩者皆無效時先報ele
    it(`should report ele first when both ele and content are invalid`, function() {
        assert.throws(() => domTooltip(null, 5), { message: 'invalid ele: must be an element' })
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        let ele = env.mk('div')
        assert.throws(() => domTooltip('SECRET-ele-9f3a', 'x'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => domTooltip(ele, { s: 'SECRET-content-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    //spec: 有效輸入建立提示(內容包於靠左之div)、設tippystate為'5'、顯示一次、起一個計時器
    it(`should create a tippy with the given html content, set tippystate and start one timer`, function() {
        let ele = env.mk('div')
        domTooltip(ele, '<b>Hello</b>World')
        assert.strict.deepStrictEqual(stub().tippyCalls.length, 1)
        let c = stub().tippyCalls[0]
        assert.strict.deepStrictEqual(c.ele, ele)
        assert.strict.deepStrictEqual(c.opts.content, '<div style="text-align:left;"><b>Hello</b>World</div>')
        assert.strict.deepStrictEqual(c.opts.allowHTML, true)
        assert.strict.deepStrictEqual(c.tp.shown, 1)
        assert.strict.deepStrictEqual(ele.getAttribute('tippystate'), '5')
        assert.strict.deepStrictEqual(ti.active(), 1)
    })

    //spec: content未給(undefined、null)或為空字串時使用ele.innerHTML
    for (let [label, v] of [['undefined', undefined], ['null', null], [`''`, '']]) {
        it(`should use ele.innerHTML as the content when content is ${label}`, function() {
            let ele = env.mk('div')
            ele.innerHTML = '<i>inner</i>'
            domTooltip(ele, v)
            assert.strict.deepStrictEqual(stub().tippyCalls[0].opts.content, '<div style="text-align:left;"><i>inner</i></div>')
        })
    }

    //spec: 倒數中(tippystate為有效數字)再次呼叫只重設秒數, 不重複建立提示
    it(`should only reset tippystate and not create another tippy while the countdown is running`, function() {
        let ele = env.mk('div')
        domTooltip(ele, 'a')
        ele.setAttribute('tippystate', '2')
        domTooltip(ele, 'a')
        assert.strict.deepStrictEqual(stub().tippyCalls.length, 1)
        assert.strict.deepStrictEqual(ele.getAttribute('tippystate'), '5')
    })

    //spec: option非一般物件視為預設({}), 一般物件與預設合併(使用者之placement覆蓋預設)
    it(`should merge a plain-object option with the defaults and ignore a non-object option`, function() {
        let e1 = env.mk('div')
        domTooltip(e1, 'a', { placement: 'top' })
        assert.strict.deepStrictEqual(stub().tippyCalls[0].opts.placement, 'top')
        assert.strict.deepStrictEqual(stub().tippyCalls[0].opts.arrow, true)
        let e2 = env.mk('div')
        domTooltip(e2, 'a', 'not-an-object')
        assert.strict.deepStrictEqual(stub().tippyCalls[1].opts.placement, 'bottom')
    })

})
