import assert from 'assert'
import isUserPW from '../src/isUserPW.mjs'


describe(`isUserPW`, function() {

    it(`should return '' when input 'Asdf%1234'`, async function() {
        let r = null
        try {
            r = await isUserPW('Asdf%1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input '12345678'`, async function() {
        let r = null
        try {
            r = await isUserPW('12345678')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input 'abcdefgh'`, async function() {
        let r = null
        try {
            r = await isUserPW('abcdefgh')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input 'asdf1234'`, async function() {
        let r = null
        try {
            r = await isUserPW('asdf1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼長度須小於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input '123456789012345678901234567890a'`, async function() {
        let r = null
        try {
            r = await isUserPW('123456789012345678901234567890a')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須小於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '長度須大於8個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input ''`, async function() {
        let r = null
        try {
            r = await isUserPW('')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input []`, async function() {
        let r = null
        try {
            r = await isUserPW([])
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input {}`, async function() {
        let r = null
        try {
            r = await isUserPW({})
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input null`, async function() {
        let r = null
        try {
            r = await isUserPW(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input undefined`, async function() {
        let r = null
        try {
            r = await isUserPW(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input NaN`, async function() {
        let r = null
        try {
            r = await isUserPW(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

})
