import assert from 'assert'
import bodyLog from '../src/bodyLog.mjs'
import o2j from '../src/o2j.mjs'
import htmlEncode from '../src/htmlEncode.mjs'
import { mkEditDom } from './tools/domEditKit.mjs'


//ws492e: W-03(主控定): bodyLog歸DOM類(C18), 無document(非瀏覽器環境)或取不到body時不動作、不拋錯(原直接讀未宣告之document拋ReferenceError, body為null拋TypeError)
//  規格: dspec〈輸入參數之檢測機制〉§5.3 C18(元素不存在時不動作)、R-ENV-01不適用
//  DOM測試作法: 以最小假DOM(mkEditDom, insertAdjacentHTML('beforeend')以標記子節點記錄插入之html)驅動; 真實HTML解析與顯示屬瀏覽器語義, 另以真瀏覽器實測
describe(`bodyLog`, function() {

    let env = null

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    //setBody, 令document.querySelector('body')回傳指定值
    let setBody = (v) => {
        env.document.querySelector = (sel) => (sel === 'body' ? v : null)
    }

    //spec: 無document不動作、不拋錯、回undefined
    it(`should do nothing and not throw when document is not defined`, function() {
        env.restore()
        assert.strict.deepStrictEqual(typeof document, 'undefined')
        let r = '(not set)'
        assert.doesNotThrow(() => {
            r = bodyLog('x', 1)
        })
        assert.strict.deepStrictEqual(r, undefined)
    })

    //spec: 取不到body(null、undefined、非元素、字串)不動作、不拋錯
    for (let [label, v] of [['null', null], ['undefined', undefined], ['a plain object', {}], [`the string 'body'`, 'body'], ['a number', 5]]) {
        it(`should do nothing and not throw when body is ${label}`, function() {
            setBody(v)
            env.resetOps()
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = bodyLog('x')
            })
            assert.strict.deepStrictEqual(r, undefined)
            assert.strict.deepStrictEqual(env.ops.length, 0)
        })
    }

    it(`should do nothing when document.querySelector itself throws`, function() {
        env.document.querySelector = () => {
            throw new Error('native-boom')
        }
        assert.doesNotThrow(() => bodyLog('x'))
    })

    //spec: 插入一個區塊於body最後(beforeend), 內容為各引數經o2j轉字串以', '串接再htmlEncode
    it(`should append one block at the end of body with the encoded joined arguments`, function() {
        env.mkParent() //body內既有子項
        env.resetOps()
        let r = bodyLog('show訊息', 123, { a: 1 }, [1, 'x'])
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(env.ops, ['insertAdjacentHTML:beforeend'])
        let last = env.body.children[env.body.children.length - 1]
        assert.strict.deepStrictEqual(last.tagName, '#HTML')
        let want = htmlEncode([o2j('show訊息'), o2j(123), o2j({ a: 1 }), o2j([1, 'x'])].join(', '))
        assert.strict.deepStrictEqual(last.html.includes(`<code>${want}</code>`), true)
        assert.strict.deepStrictEqual(last.html.includes('log: '), true)
    })

    //spec: html特殊字元經htmlEncode跳脫, 不產生可執行之標籤
    it(`should encode html special characters`, function() {
        bodyLog('<script>alert(1)</script>')
        let html = env.body.children[0].html
        assert.strict.deepStrictEqual(html.includes('<script>'), false)
        assert.strict.deepStrictEqual(html.includes(htmlEncode(o2j('<script>alert(1)</script>'))), true)
    })

    //既有行為: 未給任何引數時仍顯示一行空log
    it(`should still append a block when no argument is given`, function() {
        bodyLog()
        assert.strict.deepStrictEqual(env.body.children.length, 1)
        assert.strict.deepStrictEqual(env.body.children[0].html.includes('<code></code>'), true)
    })

})
