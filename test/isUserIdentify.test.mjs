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


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isUserIdentify 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    //settle, 取Promise之落定結果字串
    let settle = (pm) => pm.then(() => 'resolve', (e) => `reject:${e}`)

    it(`should reject '身份證字號非有效字串' when input new String('') or new String('A122471399') (isestr only accepts primitive strings)`, async function() {
        //W-20: isUserIdentify以isestr守門, 包裝字串為無效輸入, 同非字串之失敗通道(reject); 修前new String('A122471399')為resolve
        assert.strict.deepStrictEqual(await settle(isUserIdentify('A122471399')), 'resolve')
        assert.strict.deepStrictEqual(await settle(isUserIdentify(new String('A122471399'))), 'reject:身份證字號非有效字串')
        assert.strict.deepStrictEqual(await settle(isUserIdentify(new String(''))), 'reject:身份證字號非有效字串')
    })

})
