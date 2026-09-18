import assert from 'assert'
import getDiff2Html from '../src/_getDiff2Html.mjs'


describe(`_getDiff2Html`, function() {

    it(`should return the native ESM namespace having html in nodejs`, function() {
        let r = getDiff2Html()
        assert.strict.deepStrictEqual(typeof r.html, 'function')
    })

    it(`should accept a bundler interop namespace, a null prototype object without Symbol.toStringTag`, function() {
        //UMD打包後之namespace標籤為[object Object]而非[object Module], 舊判定據此誤判為未載入而拋錯
        let mod = Object.create(null)
        mod.html = () => 'x'
        assert.strict.deepStrictEqual(Object.prototype.toString.call(mod), '[object Object]')
        assert.strict.deepStrictEqual(getDiff2Html(mod) === mod, true)
    })

    it(`should accept html hung on default`, function() {
        let mod = { default: { html: () => 'x' } }
        assert.strict.deepStrictEqual(getDiff2Html(mod) === mod.default, true)
    })

    it(`should fall back to the global Diff2Html and its default`, function() {
        let orig = globalThis.Diff2Html
        try {
            let g1 = { html: () => 'x' }
            globalThis.Diff2Html = g1
            assert.strict.deepStrictEqual(getDiff2Html({}) === g1, true)
            let g2 = { default: { html: () => 'x' } }
            globalThis.Diff2Html = g2
            assert.strict.deepStrictEqual(getDiff2Html({}) === g2.default, true)
        }
        finally {
            if (orig === undefined) {
                delete globalThis.Diff2Html
            }
            else {
                globalThis.Diff2Html = orig
            }
        }
    })

    it(`should throw when neither the import nor the global provides html`, function() {
        let orig = console.log
        console.log = () => {}
        try {
            assert.throws(() => getDiff2Html({}), /invalid Diff2Html/)
        }
        finally {
            console.log = orig
        }
    })

})
