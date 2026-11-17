import assert from 'assert'
import { loadStubbed, resetStub, stub } from './tools/domStubKit.mjs'


//ws492e: N-B(主控定): domShowImages之eleGroup為帶預設值(null)之位置參數, 視同opt鍵(K2/K3): 非元素之輸入視為未給、改用預設null(單圖模式), 不reject(原reject'eleGroup is not a HTMLElement'); 其餘reject訊息改V19固定字串
//  規格: dspec〈輸入參數之檢測機制〉K2、K3、V19、V20
//  測試作法: domShowImages於Node無法直接載入(viewerjs與其css), 以test/tools/domStubKit.mjs之loadStubbed載入, viewerjs以替身記錄(viewers[i].img為實際交給viewer之元素); 真實viewer.js之顯示屬瀏覽器語義, 另以真瀏覽器實測
describe(`domShowImages`, function() {

    let domShowImages = null
    let hadDoc = false
    let rawDoc

    //El, 假元素(nodeType 1), querySelectorAll回傳imgs
    class El {
        constructor(imgs = []) {
            this.nodeType = 1
            this.imgs = imgs
            this.handlers = {}
        }

        addEventListener(type, fn) {
            this.handlers[type] = fn
        }

        querySelectorAll() {
            return this.imgs
        }
    }

    before(async function() {
        domShowImages = await loadStubbed('domShowImages')
    })

    beforeEach(function() {
        resetStub()
        stub().viewerEle = new El()
        hadDoc = Object.prototype.hasOwnProperty.call(globalThis, 'document')
        rawDoc = globalThis.document
        globalThis.document = { elementsFromPoint: () => [] }
    })

    afterEach(function() {
        if (hadDoc) {
            globalThis.document = rawDoc
        }
        else {
            delete globalThis.document
        }
    })

    //got, 取得reject之值('(not rejected)'表示未reject: 以讓出數次事件迴圈後pm尚未settle為準)
    let got = async (pm) => {
        let r = '(not rejected)'
        pm.then(() => {
            r = '(resolved)'
        }, (err) => {
            r = err
        })
        for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setImmediate(resolve))
        }
        return r
    }

    //spec: eleImg非元素reject固定字串(V19), 不建立viewer
    for (let [label, v] of [['undefined', undefined], ['null', null], [`'img'`, 'img'], ['5', 5], ['{}', {}], ['[]', []], ['{ nodeType: 1 }', { nodeType: 1 }]]) {
        it(`should reject with invalid eleImg when eleImg is ${label}, creating no viewer`, async function() {
            let pm = domShowImages(v, null)
            assert.strict.deepStrictEqual(await got(pm), 'invalid eleImg: must be an element')
            assert.strict.deepStrictEqual(stub().viewers.length, 0)
        })
    }

    //spec(K3): eleGroup非元素(含undefined、null與一切非預期之輸入)視為未給, 單圖模式, 不reject
    for (let [label, v] of [
        ['undefined', undefined],
        ['null', null],
        [`'group'`, 'group'],
        [`''`, ''],
        ['0', 0],
        ['5', 5],
        ['true', true],
        ['{}', {}],
        ['[]', []],
        ['{ nodeType: 1 }', { nodeType: 1 }],
        ['function', () => {}],
        ['new String', new String('g')], // eslint-disable-line no-new-wrappers
    ]) {
        it(`should treat eleGroup ${label} as not given and show the single image without rejecting`, async function() {
            let img = new El()
            let pm = domShowImages(img, v)
            assert.strict.deepStrictEqual(await got(pm), '(not rejected)')
            assert.strict.deepStrictEqual(stub().viewers.length, 1)
            assert.strict.deepStrictEqual(stub().viewers[0].img, img)
        })
    }

    //spec: eleGroup為含多個img之元素: 以群組顯示(viewer之元素為eleGroup)
    it(`should show the group when eleGroup is an element containing several imgs`, async function() {
        let img = new El()
        let group = new El([1, 2, 3])
        let pm = domShowImages(img, group)
        assert.strict.deepStrictEqual(await got(pm), '(not rejected)')
        assert.strict.deepStrictEqual(stub().viewers.length, 1)
        assert.strict.deepStrictEqual(stub().viewers[0].img, group)
    })

    //spec: eleGroup為只含一個img之元素: 仍以eleGroup為viewer之元素(單圖選項)
    it(`should still use eleGroup as the viewer element when it contains exactly one img`, async function() {
        let img = new El()
        let group = new El([1])
        let pm = domShowImages(img, group)
        assert.strict.deepStrictEqual(await got(pm), '(not rejected)')
        assert.strict.deepStrictEqual(stub().viewers[0].img, group)
    })

    //spec: eleGroup為元素但其內無任何img: reject固定字串(V19), 不建立viewer
    it(`should reject with the fixed message when eleGroup is an element without any img`, async function() {
        let pm = domShowImages(new El(), new El([]))
        assert.strict.deepStrictEqual(await got(pm), 'invalid eleGroup: must contain at least one img element')
        assert.strict.deepStrictEqual(stub().viewers.length, 0)
    })

    //spec(V20): reject字串不回顯輸入值
    it(`should not echo the input value in the rejection`, async function() {
        let pm = domShowImages('SECRET-img-9f3a', null)
        assert.strict.deepStrictEqual(String(await got(pm)).includes('SECRET'), false)
    })

})
