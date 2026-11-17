import assert from 'assert'
import domRenderMarkdownMind from '../src/domRenderMarkdownMind.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: N-A(主控定): domRenderMarkdownMind依會改畫面者拋錯之通則: ele、markdown無效即同步拋固定訊息之Error(V19), 先於任何DOM變動; 不再回傳被reject之Promise(原成功回同步物件、ele無效卻回Promise, 輸出型別不恆定; markdown無檢測洩漏原生錯誤); 未載入markmap拋固定訊息之Error(原為對undefined解構之原生TypeError)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、P1、V17、V19、V20
//  測試作法: 以假全域markmap(Transformer、Markmap、loadCSS、loadJS之替身)與最小假DOM(mkQueryEnv)驅動; 真實markmap之渲染屬瀏覽器語義, 另以真瀏覽器實測
describe(`domRenderMarkdownMind`, function() {

    let env = null
    let ele = null
    let log = null
    let hadMm = false
    let rawMm

    beforeEach(function() {
        env = mkQueryEnv()
        ele = env.mk('div')
        ele.innerHTML = '<p>keep</p>'
        log = { transform: [], create: [], css: [], js: [] }
        hadMm = Object.prototype.hasOwnProperty.call(globalThis, 'markmap')
        rawMm = globalThis.markmap
        globalThis.markmap = {
            Transformer: class Transformer {
                transform(md) {
                    log.transform.push(md)
                    return { root: { content: md }, features: { f: 1 } }
                }

                getUsedAssets() {
                    return { styles: ['css1'], scripts: ['js1'] }
                }
            },
            Markmap: class Markmap { //真實之Markmap為類別(函數), create為其靜態方法
                static create(el, opt, root) {
                    log.create.push({ el, opt, root })
                    return { vmm: true }
                }
            },
            loadCSS: (s) => log.css.push(s),
            loadJS: (s) => log.js.push(s),
        }
    })

    afterEach(function() {
        if (hadMm) {
            globalThis.markmap = rawMm
        }
        else {
            delete globalThis.markmap
        }
        env.restore()
    })

    //spec: ele非元素同步拋Error('invalid ele: must be an element'), 不回傳Promise, 不動作
    for (let [label, v] of NOT_ELE) {
        it(`should throw synchronously invalid ele when ele is ${label}`, function() {
            assert.throws(() => domRenderMarkdownMind(v, '# a'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid ele: must be an element')
                return true
            })
            assert.strict.deepStrictEqual(log.transform.length + log.create.length + log.css.length + log.js.length, 0)
        })
    }

    //spec: markdown非字串同步拋Error('invalid markdown: must be a string'), 先於任何DOM變動(ele.innerHTML不被清空)
    for (let [label, v] of [['undefined', undefined], ['null', null], ['5', 5], ['true', true], ['{}', {}], ['[]', []], ['function', () => {}], ['Symbol', Symbol('x')], ['new String', new String('# a')]]) { // eslint-disable-line no-new-wrappers
        it(`should throw invalid markdown before touching the DOM when markdown is ${label}`, function() {
            assert.throws(() => domRenderMarkdownMind(ele, v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid markdown: must be a string')
                return true
            })
            assert.strict.deepStrictEqual(ele.innerHTML, '<p>keep</p>')
            assert.strict.deepStrictEqual(log.transform.length + log.create.length + log.css.length + log.js.length, 0)
        })
    }

    //spec: 兩者皆無效時先報ele; 檢測先於讀取全域markmap
    it(`should report ele first and check the arguments before reading the global markmap`, function() {
        let n = 0
        Object.defineProperty(globalThis, 'markmap', {
            configurable: true,
            get() {
                n++
                return undefined
            },
        })
        assert.throws(() => domRenderMarkdownMind(null, null), { message: 'invalid ele: must be an element' })
        assert.throws(() => domRenderMarkdownMind(ele, 5), { message: 'invalid markdown: must be a string' })
        assert.strict.deepStrictEqual(n, 0)
        delete globalThis.markmap
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        assert.throws(() => domRenderMarkdownMind('SECRET-ele-9f3a', '# a'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => domRenderMarkdownMind(ele, { s: 'SECRET-md-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    //spec: 未載入markmap(缺全域、缺Transformer或Markmap)拋Error('invalid markmap: ...'), 不清空ele
    for (let [label, set] of [
        ['missing', () => {
            delete globalThis.markmap
        }],
        ['null', () => {
            globalThis.markmap = null
        }],
        ['without Transformer', () => {
            delete globalThis.markmap.Transformer
        }],
        ['without Markmap', () => {
            delete globalThis.markmap.Markmap
        }],
        ['a string', () => {
            globalThis.markmap = 'x'
        }],
    ]) {
        it(`should throw a fixed-message Error when the global markmap is ${label}, leaving ele untouched`, function() {
            set()
            assert.throws(() => domRenderMarkdownMind(ele, '# a'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err instanceof TypeError, false)
                assert.strict.deepStrictEqual(err.message, 'invalid markmap: must be loaded as a global object with Transformer and Markmap')
                return true
            })
            assert.strict.deepStrictEqual(ele.innerHTML, '<p>keep</p>')
        })
    }

    //spec: 有效輸入同步回傳vmm(含transMarkdown), 清空ele後建立; 空字串markdown合法
    it(`should return the vmm synchronously (not a Promise) with transMarkdown and clear ele`, function() {
        let r = domRenderMarkdownMind(ele, '# title')
        assert.strict.deepStrictEqual(r instanceof Promise, false)
        assert.strict.deepStrictEqual(r.vmm, true)
        assert.strict.deepStrictEqual(typeof r.transMarkdown, 'function')
        assert.strict.deepStrictEqual(ele.innerHTML, '')
        assert.strict.deepStrictEqual(log.transform, ['# title'])
        assert.strict.deepStrictEqual(log.create.length, 1)
        assert.strict.deepStrictEqual(log.create[0].el, ele)
        assert.strict.deepStrictEqual(log.create[0].root, { content: '# title' })
        assert.strict.deepStrictEqual(log.css, [['css1']])
        assert.strict.deepStrictEqual(log.js, [['js1']])
        let t = r.transMarkdown('## b')
        assert.strict.deepStrictEqual(t.root, { content: '## b' })
    })

    it(`should accept the empty string as markdown`, function() {
        let r = domRenderMarkdownMind(ele, '')
        assert.strict.deepStrictEqual(r.vmm, true)
        assert.strict.deepStrictEqual(log.transform, [''])
    })

})
