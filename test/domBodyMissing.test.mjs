import assert from 'assert'
import domShowInputAndGetFiles from '../src/domShowInputAndGetFiles.mjs'
import domVirtualCreate from '../src/domVirtualCreate.mjs'
import { mkBrowser } from './tools/domFilesKit.mjs'
import { mkEditDom } from './tools/domEditKit.mjs'
import { loadStubbed, resetStub, stub } from './tools/domStubKit.mjs'


//ws286a: domAppend／domPrepend改拋錯後, 三個內部呼叫端(body取自document.querySelector('body'))之失敗通道與無殘留
//  規格: dspec〈輸入參數之檢測機制〉§5.1(回傳Promise者reject, 不同步throw; reject值依該函數既有單一型式)、V17(全部檢測先於任何副作用, 無效時不留副作用)
//  被測: domShowInputAndGetFiles(同步函數回傳Promise, 須自行以reject回報)、domConvertToPic(async, reject字串)、domVirtualCreate(async, reject Error)
//  共通: 取不到body(querySelector('body')回null/undefined/非元素)時, 不同步拋錯、以固定訊息reject、DOM無變動、後續動作(點擊/截圖/呼叫fun)皆未發生
//  DOM測試作法: 以最小假DOM(domFilesKit.mjs之mkBrowser、domEditKit.mjs之mkEditDom、domStubKit.mjs之snapdom替身)驅動; 真實瀏覽器行為非本檔所能驗證
let MSG_BODY = 'can not find body element'
let NO_BODY = [['null', null], ['undefined', undefined], ['plain object', {}], [`string 'body'`, 'body']]


//--- domShowInputAndGetFiles ---

describe(`domShowInputAndGetFiles without body (ws286a)`, function() {

    let env = null
    let clicks = 0

    beforeEach(function() {
        env = mkBrowser()
        clicks = 0
        env.onClick = () => {
            clicks++
        }
    })

    afterEach(function() {
        env.restore()
    })

    //setBody, 令document.querySelector('body')回傳指定值, 其餘查詢照舊
    let setBody = (v) => {
        let raw = env.document.querySelector
        env.document.querySelector = (sel) => (sel === 'body' ? v : raw(sel))
        return () => {
            env.document.querySelector = raw
        }
    }

    for (let [label, v] of NO_BODY) {
        //spec §5.1: 回傳Promise者reject不同步throw; 無效時不留副作用(無input、無監聽、未觸發點擊)
        it(`should return a rejected promise (not throw) with a fixed string when body is ${label}, leaving no side effect`, async function() {
            setBody(v)
            let p = null
            assert.doesNotThrow(() => {
                p = domShowInputAndGetFiles({ kind: 'image' })
            })
            assert.strict.deepStrictEqual(p instanceof Promise, true)
            let got = '(not rejected)'
            await p.then(() => {}, (err) => {
                got = err
            })
            assert.strict.deepStrictEqual(got, MSG_BODY)
            assert.strict.deepStrictEqual(env.body.children.length, 0)
            assert.strict.deepStrictEqual(env.window.nListeners(), 0)
            assert.strict.deepStrictEqual(clicks, 0)
            assert.strict.deepStrictEqual(env.nShowPicker, 0)
        })
    }

    //spec V17: 檢測先於任何副作用: 取不到body時不得先移除前一次呼叫建立之input(前次尚未結束之呼叫不受影響)
    it(`should not remove the input of an earlier pending call when body is unavailable`, async function() {
        let pm1 = domShowInputAndGetFiles()
        assert.strict.deepStrictEqual(env.body.children.length, 1)
        let first = env.body.children[0]
        assert.strict.deepStrictEqual(clicks, 1)
        assert.strict.deepStrictEqual(env.window.nListeners('focus'), 1)

        let restore = setBody(null)
        let got = '(not rejected)'
        await domShowInputAndGetFiles().then(() => {}, (err) => {
            got = err
        })
        restore()
        assert.strict.deepStrictEqual(got, MSG_BODY)
        assert.strict.deepStrictEqual(env.body.children, [first])
        assert.strict.deepStrictEqual(env.window.nListeners('focus'), 1)
        assert.strict.deepStrictEqual(clicks, 1)

        //前次呼叫仍可正常結束
        let inp = first.children[0]
        inp.files = []
        inp.dispatchEvent({ type: 'change', target: inp })
        let rs = await pm1
        assert.strict.deepStrictEqual(rs.files, [])
    })

    //spec: body存在時行為不變(input建於body下、觸發點擊、回傳之promise待決至選檔結束)
    it(`should still create the input under body and trigger the click when body exists`, async function() {
        let pm = domShowInputAndGetFiles({ multiple: true })
        assert.strict.deepStrictEqual(pm instanceof Promise, true)
        assert.strict.deepStrictEqual(env.body.children.length, 1)
        assert.strict.deepStrictEqual(clicks, 1)
        let inp = env.body.children[0].children[0]
        inp.files = []
        inp.dispatchEvent({ type: 'change', target: inp })
        let rs = await pm
        assert.strict.deepStrictEqual(rs.files, [])
        assert.strict.deepStrictEqual(env.body.children.length, 0)
    })

})


//--- domConvertToPic ---

describe(`domConvertToPic without body (ws286a)`, function() {

    let domConvertToPic = null
    let env = null

    before(async function() {
        domConvertToPic = await loadStubbed('domConvertToPic')
    })

    beforeEach(function() {
        env = mkEditDom()
        resetStub()
    })

    afterEach(function() {
        env.restore()
    })

    for (let [label, v] of NO_BODY) {
        //spec §5.1: reject不同步throw, reject值為字串(同本函數既有之'invalid ele'等); 無效時不截圖、不留DOM殘留
        it(`should reject with a fixed string when body is ${label}, without calling snapdom or leaving DOM residue`, async function() {
            env.document.querySelector = () => v
            let ele = env.mkParent()
            env.resetOps()
            let snap = env.snap()
            let p = null
            assert.doesNotThrow(() => {
                p = domConvertToPic(ele, { scale: 2 })
            })
            let got = '(not rejected)'
            await p.then(() => {}, (err) => {
                got = err
            })
            assert.strict.deepStrictEqual(got, MSG_BODY)
            assert.strict.deepStrictEqual(stub().snapCalls.length, 0)
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.snap(), snap)
        })
    }

    //spec: body存在時行為不變(置入body最前、截圖、移除)
    it(`should still render and clean up when body exists`, async function() {
        let ele = env.mkParent()
        let snap = env.snap()
        let r = await domConvertToPic(ele, { scale: 2 })
        assert.strict.deepStrictEqual(r, 'data:image/png;base64,AAAA')
        assert.strict.deepStrictEqual(stub().snapCalls.length, 1)
        assert.strict.deepStrictEqual(env.snap(), snap)
    })

})


//--- domVirtualCreate ---

describe(`domVirtualCreate without body (ws286a)`, function() {

    let env = null

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    for (let [label, v] of NO_BODY) {
        //spec §5.1: reject不同步throw, reject值為Error(同本函數既有之Error('invalid fun')); 無效時不呼叫fun(原會對未接上頁面之元素呼叫fun)、不留DOM殘留
        it(`should reject with an Error of a fixed message when body is ${label}, without calling fun or leaving DOM residue`, async function() {
            env.document.querySelector = () => v
            env.resetOps()
            let snap = env.snap()
            let called = 0
            let p = null
            assert.doesNotThrow(() => {
                p = domVirtualCreate(() => {
                    called++
                    return 'x'
                }, { width: 100, height: 50 })
            })
            let got = null
            await p.then(() => {}, (err) => {
                got = err
            })
            assert.strict.deepStrictEqual(got instanceof Error, true)
            assert.strict.deepStrictEqual(got.message, MSG_BODY)
            assert.strict.deepStrictEqual(called, 0)
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.snap(), snap)
        })
    }

    //spec: body存在時行為不變(置入body最前、呼叫fun並回傳其結果、移除)
    it(`should still call fun with an element placed in body and clean up when body exists`, async function() {
        let snap = env.snap()
        let seen = null
        let r = await domVirtualCreate((ele) => {
            seen = { connected: ele.isConnected, width: ele.style.width }
            return 'ok'
        }, { width: 100 })
        assert.strict.deepStrictEqual(r, 'ok')
        assert.strict.deepStrictEqual(seen, { connected: true, width: '100px' })
        assert.strict.deepStrictEqual(env.snap(), snap)
    })

})
