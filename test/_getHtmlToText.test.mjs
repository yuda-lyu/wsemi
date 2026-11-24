import assert from 'assert'
import getHtmlToText from '../src/_getHtmlToText.mjs'


//_getHtmlToText為取得html-to-text模組之內部函數(mod供測試注入, 同_getDiff2Html)
//主控裁定(twsm1b; R-DIAG-01規則20): 找不到模組時之console由印出模組物件與全域同名值(除錯殘留)改為固定詞彙
describe(`_getHtmlToText`, function() {

    it(`should return the native ESM namespace having htmlToText in nodejs`, async function() {
        let r = await getHtmlToText()
        assert.strict.deepStrictEqual(typeof r.htmlToText, 'function')
    })

    it(`should accept an injected module having htmlToText directly or on default`, async function() {
        let m1 = { htmlToText: () => 'x' }
        let m2 = { default: { htmlToText: () => 'y' } }
        assert.strict.deepStrictEqual([(await getHtmlToText(m1)) === m1, (await getHtmlToText(m2)) === m2.default], [true, true])
    })

    it(`should print exactly one fixed-vocabulary line (no module object, no global value) before throwing when neither the module nor the global provides htmlToText`, async function() {
        let origHt = globalThis.ht
        let origLog = console.log
        let logs = []
        globalThis.ht = { marker: 'GLOBAL-OBJECT-9f3a' } //全域有物件但無htmlToText: 等待立即結束
        console.log = (...a) => logs.push(a)
        let err = null
        try {
            await getHtmlToText({ marker: 'MODULE-OBJECT-9f3a' })
        }
        catch (e) {
            err = e
        }
        finally {
            console.log = origLog
            if (origHt === undefined) {
                delete globalThis.ht
            }
            else {
                globalThis.ht = origHt
            }
        }
        assert.strict.deepStrictEqual(err instanceof Error && /invalid ht/.test(err.message), true)
        assert.strict.deepStrictEqual(logs, [['[wsemi getHtmlToText] can not find the html-to-text module']])
    })

})
