import assert from 'assert'
import domCompareText from '../src/domCompareText.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: N-B(主控定): domCompareText依會改畫面者拋錯之通則: ele、strOld、strNew無效即同步拋固定訊息之Error(V19), 先於任何DOM變動; 不再回傳被reject之Promise(原成功回同步物件、ele無效卻回被reject之Promise, 輸出型別不恆定P1; strOld、strNew無檢測交給Diff洩漏原生錯誤)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、P1、V17、V19、V20、K3(title非預期用'Text')
//  測試作法: 以最小假DOM(mkQueryEnv)驅動, 差異比對與html轉換用真實之diff、diff2html(純函數, Node可用); 真實顯示屬瀏覽器語義, 另以真瀏覽器實測
describe(`domCompareText`, function() {

    let env = null
    let ele = null

    beforeEach(function() {
        env = mkQueryEnv()
        ele = env.mk('div')
        ele.innerHTML = '<p>keep</p>'
    })

    afterEach(function() {
        env.restore()
    })

    //spec: ele非元素同步拋Error('invalid ele: must be an element'), 不回傳Promise
    for (let [label, v] of NOT_ELE) {
        it(`should throw synchronously invalid ele when ele is ${label}`, function() {
            assert.throws(() => domCompareText(v, 't', 'a', 'b'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid ele: must be an element')
                return true
            })
        })
    }

    //spec: strOld、strNew非字串同步拋固定訊息, ele.innerHTML不被改寫; 空字串合法
    let BAD = [['undefined', undefined], ['null', null], ['5', 5], ['true', true], ['{}', {}], ['[]', []], ['function', () => {}], ['Symbol', Symbol('x')], ['new String', new String('a')]] // eslint-disable-line no-new-wrappers
    for (let [label, v] of BAD) {
        it(`should throw invalid strOld when strOld is ${label}, leaving ele untouched`, function() {
            assert.throws(() => domCompareText(ele, 't', v, 'b'), { message: 'invalid strOld: must be a string' })
            assert.strict.deepStrictEqual(ele.innerHTML, '<p>keep</p>')
        })
        it(`should throw invalid strNew when strNew is ${label}, leaving ele untouched`, function() {
            assert.throws(() => domCompareText(ele, 't', 'a', v), { message: 'invalid strNew: must be a string' })
            assert.strict.deepStrictEqual(ele.innerHTML, '<p>keep</p>')
        })
    }

    //spec: 檢測順序ele、strOld、strNew
    it(`should report ele first, then strOld, then strNew`, function() {
        assert.throws(() => domCompareText(null, 't', null, null), { message: 'invalid ele: must be an element' })
        assert.throws(() => domCompareText(ele, 't', null, null), { message: 'invalid strOld: must be a string' })
        assert.throws(() => domCompareText(ele, 't', 'a', null), { message: 'invalid strNew: must be a string' })
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        assert.throws(() => domCompareText('SECRET-ele-9f3a', 't', 'a', 'b'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => domCompareText(ele, 't', { s: 'SECRET-old-9f3a' }, 'b'), (err) => !err.message.includes('SECRET'))
    })

    //spec: 有效輸入同步回傳{ diff, html }並寫入ele.innerHTML
    it(`should return { diff, html } synchronously (not a Promise) and write the html into ele`, function() {
        let r = domCompareText(ele, 'title', 'line1\nold\n', 'line1\nnew\n')
        assert.strict.deepStrictEqual(r instanceof Promise, false)
        assert.strict.deepStrictEqual(typeof r.diff, 'string')
        assert.strict.deepStrictEqual(typeof r.html, 'string')
        assert.strict.deepStrictEqual(r.html.includes('old'), true)
        assert.strict.deepStrictEqual(r.html.includes('new'), true)
        assert.strict.deepStrictEqual(ele.innerHTML, r.html)
    })

    it(`should accept empty strings for strOld and strNew`, function() {
        let r = domCompareText(ele, 't', '', 'added\n')
        assert.strict.deepStrictEqual(r.html.includes('added'), true)
        let r2 = domCompareText(ele, 't', '', '')
        assert.strict.deepStrictEqual(typeof r2.html, 'string')
    })

    //spec(K3): title非非空字串用'Text'; format非'side'與'line'用'side'
    it(`should use Text as the title when title is not a non-empty string`, function() {
        let r = domCompareText(ele, null, 'a\n', 'b\n')
        assert.strict.deepStrictEqual(r.diff.includes('--- Text'), true)
        let r2 = domCompareText(ele, 'MyTitle', 'a\n', 'b\n')
        assert.strict.deepStrictEqual(r2.diff.includes('--- MyTitle'), true)
    })

    it(`should render side-by-side by default and line-by-line for format line`, function() {
        let side = domCompareText(ele, 't', 'a\n', 'b\n').html
        let sideBad = domCompareText(ele, 't', 'a\n', 'b\n', { format: 'bogus' }).html
        let line = domCompareText(ele, 't', 'a\n', 'b\n', { format: 'line' }).html
        assert.strict.deepStrictEqual(side.includes('d2h-file-side-diff'), true)
        assert.strict.deepStrictEqual(sideBad, side)
        assert.strict.deepStrictEqual(line.includes('d2h-file-side-diff'), false)
    })

})
