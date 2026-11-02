import assert from 'assert'
import domAppend from '../src/domAppend.mjs'
import { NOT_ELE, mkEditDom } from './tools/domEditKit.mjs'


//ws286a: 非計算類函數之必須參數遇非預期(第221項 §11 第6項第一類), domAppend(eleParent, itemChild)之eleParent非元素、itemChild非字串亦非元素改拋錯(原回字串'invalid eleParent'／'invalid itemChild')
//  規格: dspec〈輸入參數之檢測機制〉§5.1(同步且有副作用者同步throw Error, 先於任何副作用; V17無殘留)、V19(訊息格式invalid <名稱>: must be <種類描述>)、V20(不回顯輸入值)、§5.3 C18
//  DOM測試作法: 以最小假DOM(test/tools/fakeDom.mjs經domEditKit.mjs補語義)驅動, env.ops為0代表未動DOM; 真實insertAdjacentHTML之HTML解析屬瀏覽器語義, 非本檔所能驗證
describe(`domAppend`, function() {

    let env = null

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    let MSG_PARENT = 'invalid eleParent: must be an element'
    let MSG_CHILD = 'invalid itemChild: must be a string or an element'

    //spec: eleParent非元素拋Error('invalid eleParent: must be an element'), 不動DOM, 子項為字串或元素皆然
    for (let [label, v] of NOT_ELE) {
        it(`should throw ${MSG_PARENT} for non-element eleParent ${label} and not touch the DOM`, function() {
            let child = new env.Ele('span')
            env.resetOps()
            let snap = env.snap()
            for (let item of ['<b>x</b>', child]) {
                assert.throws(() => domAppend(v, item), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_PARENT)
                    return true
                })
            }
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.snap(), snap)
            assert.strict.deepStrictEqual(child.parentNode, null)
        })
    }

    //spec: itemChild非字串亦非元素拋Error('invalid itemChild: must be a string or an element'), 不動DOM
    for (let [label, v] of NOT_ELE) {
        if (typeof v === 'string') {
            continue //字串為有效子項
        }
        it(`should throw ${MSG_CHILD} for itemChild ${label} and not touch the DOM`, function() {
            let parent = env.mkParent()
            env.resetOps()
            let snap = env.snap()
            assert.throws(() => domAppend(parent, v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG_CHILD)
                return true
            })
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.snap(), snap)
        })
    }

    it(`should throw for itemChild called without the second argument`, function() {
        let parent = env.mkParent()
        env.resetOps()
        assert.throws(() => domAppend(parent), { message: MSG_CHILD })
        assert.strict.deepStrictEqual(env.ops.length, 0)
    })

    //spec: 兩者皆無效時先報eleParent(檢測順序固定)
    it(`should report eleParent first when both eleParent and itemChild are invalid`, function() {
        env.resetOps()
        assert.throws(() => domAppend(null, null), { message: MSG_PARENT })
        assert.throws(() => domAppend(), { message: MSG_PARENT })
        assert.strict.deepStrictEqual(env.ops.length, 0)
    })

    //spec V20: 錯誤訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        let parent = env.mkParent()
        let secret = 'SECRET-eleParent-9f3a'
        assert.throws(() => domAppend(secret, '<b>x</b>'), (err) => {
            assert.strict.deepStrictEqual(err.message.includes('SECRET'), false)
            return true
        })
        assert.throws(() => domAppend(parent, { secret: 'SECRET-itemChild-9f3a' }), (err) => {
            assert.strict.deepStrictEqual(err.message.includes('SECRET'), false)
            return true
        })
    })

    //spec: itemChild為字串時以'beforeend'插入於eleParent最後, 回傳undefined
    it(`should insert a string itemChild at the end of eleParent (beforeend) and return undefined`, function() {
        let parent = env.mkParent()
        let first = new env.Ele('i')
        parent.appendChild(first)
        env.resetOps()
        let r = domAppend(parent, '<div>abc</div>')
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(env.ops, ['insertAdjacentHTML:beforeend'])
        assert.strict.deepStrictEqual(parent.children.length, 2)
        assert.strict.deepStrictEqual(parent.children[0], first)
        assert.strict.deepStrictEqual(parent.children[1].html, '<div>abc</div>')
    })

    //boundary: 空字串亦為字串, 照字串路徑插入(不視為無效)
    it(`should treat the empty string as a valid string itemChild`, function() {
        let parent = env.mkParent()
        env.resetOps()
        assert.strict.deepStrictEqual(domAppend(parent, ''), undefined)
        assert.strict.deepStrictEqual(env.ops, ['insertAdjacentHTML:beforeend'])
        assert.strict.deepStrictEqual(parent.children[0].html, '')
    })

    //spec: itemChild為元素時接於eleParent最後, 回傳undefined; 既有子項順序不變
    it(`should append an element itemChild as the last child of eleParent and return undefined`, function() {
        let parent = env.mkParent()
        let a = new env.Ele('i')
        let b = new env.Ele('b')
        parent.appendChild(a)
        env.resetOps()
        let r1 = domAppend(parent, b)
        assert.strict.deepStrictEqual(r1, undefined)
        assert.strict.deepStrictEqual(env.ops, ['appendChild'])
        assert.strict.deepStrictEqual(parent.children, [a, b])
        assert.strict.deepStrictEqual(b.parentNode, parent)
    })

    //spec: 元素原已在他處則移至eleParent最後(同appendChild語義)
    it(`should move an element itemChild that is already elsewhere to the end of eleParent`, function() {
        let p1 = env.mkParent()
        let p2 = env.mkParent()
        let c = new env.Ele('span')
        p1.appendChild(c)
        let x = new env.Ele('i')
        p2.appendChild(x)
        domAppend(p2, c)
        assert.strict.deepStrictEqual(p1.children, [])
        assert.strict.deepStrictEqual(p2.children, [x, c])
    })

})
