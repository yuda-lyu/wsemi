import assert from 'assert'
import isUserIdentify from '../src/isUserIdentify.mjs'


describe(`isUserIdentify`, function() {

    it(`should return '' when input 'A122471399'`, function() {
        isUserIdentify('A122471399')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '')
            })
    })

    it(`should return '非有效身份證' when input 'A123456789'`, function() {
        isUserIdentify('A123456789')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '非有效身份證')
            })
    })

    it(`should return '身份證字號長度非10位' when input 'A1224713999'`, function() {
        isUserIdentify('A1224713999')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號長度非10位')
            })
    })

    it(`should return '身份證格式錯誤，字首需大寫英文' when input 'a122471399'`, function() {
        isUserIdentify('a122471399')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證格式錯誤，字首需大寫英文')
            })
    })

    it(`should return '身份證格式錯誤，字首需大寫英文' when input 'Z122471399'`, function() {
        isUserIdentify('Z122471399')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證格式錯誤，字首需大寫英文')
            })
    })

    it(`should return '身份證字號非有效字串' when input ''`, function() {
        isUserIdentify('')
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

    it(`should return '身份證字號非有效字串' when input []`, function() {
        isUserIdentify([])
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

    it(`should return '身份證字號非有效字串' when input {}`, function() {
        isUserIdentify({})
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

    it(`should return '身份證字號非有效字串' when input null`, function() {
        isUserIdentify(null)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

    it(`should return '身份證字號非有效字串' when input undefined`, function() {
        isUserIdentify(undefined)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

    it(`should return '身份證字號非有效字串' when input NaN`, function() {
        isUserIdentify(NaN)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function(rr) {
                assert.strict.deepStrictEqual(rr, '身份證字號非有效字串')
            })
    })

})
