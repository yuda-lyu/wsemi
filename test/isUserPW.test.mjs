import assert from 'assert'
import isUserPW from '../src/isUserPW.mjs'


describe(`isUserPW`, function() {

    it(`should return true when input 'Asdf%1234'`, function() {
        let r = null
        try {
            r = isUserPW('Asdf%1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼長度須大於等於8個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input '123456'`, function() {
        let r = null
        try {
            r = isUserPW('123456')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須大於等於8個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input '12345678'`, function() {
        let r = null
        try {
            r = isUserPW('12345678')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input 'abcdefgh'`, function() {
        let r = null
        try {
            r = isUserPW('abcdefgh')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input 'asdf1234'`, function() {
        let r = null
        try {
            r = isUserPW('asdf1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼長度須小於等於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input '123456789012345678901234567890a'`, function() {
        let r = null
        try {
            r = isUserPW('123456789012345678901234567890a')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須小於等於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼長度須大於等於8個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元' when input ''`, function() {
        let r = null
        try {
            r = isUserPW('')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須大於等於8個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input []`, function() {
        let r = null
        try {
            r = isUserPW([])
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input {}`, function() {
        let r = null
        try {
            r = isUserPW({})
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input null`, function() {
        let r = null
        try {
            r = isUserPW(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input undefined`, function() {
        let r = null
        try {
            r = isUserPW(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input NaN`, function() {
        let r = null
        try {
            r = isUserPW(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

})
