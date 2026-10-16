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


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isUserName 包裝物件(R-WRAPPER-01)`, function() {

    //settle, 取Promise之落定結果字串
    let settle = (pm) => pm.then(() => 'resolve', (e) => `reject:${e}`)

    it(`should reject '請填入姓名' when input new String('')`, async function() {
        //R-WRAPPER-01 規則2: isUserName隨isestr拆包而一致, 同isUserName('')為reject'請填入姓名'
        assert.strict.deepStrictEqual(await settle(isUserName(new String(''))), 'reject:請填入姓名')
    })

    it(`should resolve when input new String('我的名稱')`, async function() {
        //R-WRAPPER-01 規則1: 包裝物件視同字串, 依其原始值判定(同isUserName('我的名稱')為resolve)
        assert.strict.deepStrictEqual(await settle(isUserName(new String('我的名稱'))), 'resolve')
    })

})
