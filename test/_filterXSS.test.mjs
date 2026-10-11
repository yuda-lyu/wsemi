import assert from 'assert'
import xss from 'xss'
import fxss from '../src/_filterXSS.mjs'


describe(`_filterXSS`, function() {

    describe(`getFilterXSS`, function() {

        let keepGlobal = (fn) => {
            let oFilterXSS = globalThis.filterXSS
            let oXss = globalThis.xss
            try {
                delete globalThis.filterXSS
                delete globalThis.xss
                fn()
            }
            finally {
                delete globalThis.filterXSS
                delete globalThis.xss
                if (oFilterXSS !== undefined) {
                    globalThis.filterXSS = oFilterXSS
                }
                if (oXss !== undefined) {
                    globalThis.xss = oXss
                }
            }
        }

        it(`should return the imported xss in nodejs`, function() {
            let r = fxss.getFilterXSS()
            assert.strict.deepStrictEqual(r === xss, true)
        })

        it(`should return the injected function`, function() {
            let f = () => 'x'
            assert.strict.deepStrictEqual(fxss.getFilterXSS(f) === f, true)
        })

        it(`should fall back to the global filterXSS set by the browser build of xss`, function() {
            //UMD版若xss於wsemi之後才載入(如Dyn函數動態載入), import者為undefined, 須由全域filterXSS取得
            keepGlobal(() => {
                let f = () => 'x'
                globalThis.filterXSS = f
                assert.strict.deepStrictEqual(fxss.getFilterXSS(null) === f, true)
            })
        })

        it(`should prefer the global filterXSS to the global xss`, function() {
            keepGlobal(() => {
                let f1 = () => '1'
                let f2 = () => '2'
                globalThis.filterXSS = f1
                globalThis.xss = f2
                assert.strict.deepStrictEqual(fxss.getFilterXSS(null) === f1, true)
            })
        })

        it(`should still accept the global xss`, function() {
            keepGlobal(() => {
                let f = () => 'x'
                globalThis.xss = f
                assert.strict.deepStrictEqual(fxss.getFilterXSS(null) === f, true)
            })
        })

        it(`should throw when neither the import nor the globals provide a function`, function() {
            keepGlobal(() => {
                globalThis.filterXSS = {}
                assert.throws(() => fxss.getFilterXSS(null), /invalid filterXSS/)
            })
        })

    })

    describe(`getOpt`, function() {

        it(`should keep style of whitelisted tags and escape its value`, function() {
            let r = xss('<div style="a:b<c" title="t">x</div>', fxss.getOpt(xss))
            assert.strict.deepStrictEqual(r, '<div style="a:b&lt;c">x</div>')
        })

        it(`should remove other attributes outside the whitelist`, function() {
            let r = xss('<img src="https://a/b.png" onerror="x()">', fxss.getOpt(xss))
            assert.strict.deepStrictEqual(r, '<img src="https://a/b.png">')
        })

    })

})
