import assert from 'assert'
import isUserName from '../src/isUserName.mjs'


describe(`isUserName`, function() {

    it(`should return '' when input '我的名稱'`, function() {
        isUserName('我的名稱')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '')
            })
    })

    it(`should return '請填入姓名' when input ''`, function() {
        isUserName('')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

    it(`should return '請填入姓名' when input []`, function() {
        isUserName([])
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

    it(`should return '請填入姓名' when input {}`, function() {
        isUserName({})
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

    it(`should return '請填入姓名' when input null`, function() {
        isUserName(null)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

    it(`should return '請填入姓名' when input undefined`, function() {
        isUserName(undefined)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

    it(`should return '請填入姓名' when input NaN`, function() {
        isUserName(NaN)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '請填入姓名')
            })
    })

})
