import assert from 'assert'
import isUserPW from '../src/isUserPW.mjs'


describe(`isUserPW`, function() {

    it(`should return '' when input 'Asdf1234'`, function() {
        isUserPW('Asdf1234')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '')
            })
    })

    it(`should return '須包含大寫、小寫英文與數字各1個字元' when input '12345678'`, function() {
        isUserPW('12345678')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '須包含大寫、小寫英文與數字各1個字元')
            })
    })

    it(`should return '須包含大寫、小寫英文與數字各1個字元' when input 'abcdefgh'`, function() {
        isUserPW('abcdefgh')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '須包含大寫、小寫英文與數字各1個字元')
            })
    })

    it(`should return '須包含大寫、小寫英文與數字各1個字元' when input 'asdf1234'`, function() {
        isUserPW('asdf1234')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '須包含大寫、小寫英文與數字各1個字元')
            })
    })

    it(`should return '長度須小於30個字元，須包含大寫、小寫英文與數字各1個字元' when input '123456789012345678901234567890a'`, function() {
        isUserPW('123456789012345678901234567890a')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '長度須小於30個字元，須包含大寫、小寫英文與數字各1個字元')
            })
    })

    it(`should return '長度須大於8個字元，須包含大寫、小寫英文與數字各1個字元，不能使用特殊符號(<,>)' when input '<>'`, function() {
        isUserPW('<>')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '長度須大於8個字元，須包含大寫、小寫英文與數字各1個字元，不能使用特殊符號(<,>)')
            })
    })

    it(`should return '須包含大寫、小寫英文與數字各1個字元，不能使用指令(select,insert,update,delete)' when input '12select'`, function() {
        isUserPW('12select')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '須包含大寫、小寫英文與數字各1個字元，不能使用指令(select,insert,update,delete)')
            })
    })

    it(`should return '長度須大於8個字元，須包含大寫、小寫英文與數字各1個字元' when input ''`, function() {
        isUserPW('')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '長度須大於8個字元，須包含大寫、小寫英文與數字各1個字元')
            })
    })

    it(`should return '密碼非字串' when input []`, function() {
        isUserPW([])
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '密碼非字串')
            })
    })

    it(`should return '密碼非字串' when input {}`, function() {
        isUserPW({})
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '密碼非字串')
            })
    })

    it(`should return '密碼非字串' when input null`, function() {
        isUserPW(null)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '密碼非字串')
            })
    })

    it(`should return '密碼非字串' when input undefined`, function() {
        isUserPW(undefined)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '密碼非字串')
            })
    })

})
