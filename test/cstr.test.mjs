import assert from 'assert'
import cstr from '../src/cstr.mjs'


describe(`cstr`, function() {

    it(`should return 1.25 when input '1.25'`, function() {
        let r = cstr('1.25')
        assert.strict.deepStrictEqual(r, '1.25')
    })

    it(`should return 2.25 when input 2.25`, function() {
        let r = cstr(2.25)
        assert.strict.deepStrictEqual(r, '2.25')
    })

    it(`should return '' when input ''`, function() {
        let r = cstr('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = cstr([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = cstr({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = cstr(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = cstr(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = cstr(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '0' when input 0n`, function() {
        let r = cstr(0n)
        assert.strict.deepStrictEqual(r, '0')
    })

    it(`should return '123' when input 123n`, function() {
        let r = cstr(123n)
        assert.strict.deepStrictEqual(r, '123')
    })

    it(`should return '-123' when input -123n`, function() {
        let r = cstr(-123n)
        assert.strict.deepStrictEqual(r, '-123')
    })

    it(`should return '9007199254740993' when input BigInt超過Number.MAX_SAFE_INTEGER`, function() {
        let r = cstr(BigInt('9007199254740993'))
        assert.strict.deepStrictEqual(r, '9007199254740993')
    })

    it(`should return '123' when input Object(123n) (boxed BigInt)`, function() {
        let r = cstr(Object(123n))
        assert.strict.deepStrictEqual(r, '123')
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`cstr 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return '' when input new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: cstr隨isnum拆包而一致, 同cstr(NaN)為''
        assert.strict.deepStrictEqual(cstr(new Number(NaN)), '')
    })

    it(`should return '1.5' when input new Number(1.5) and 'a' when input new String('a')`, function() {
        //W-20(R-WRAPPER-01 規則2): 轉型函數照舊拆包(經_unbox), 依其原始值轉字串(同cstr(1.5)、cstr('a'))
        assert.strict.deepStrictEqual(cstr(new Number(1.5)), '1.5')
        assert.strict.deepStrictEqual(cstr(new String('a')), 'a')
    })

    it(`should unwrap by the internal slot and never call the toString or valueOf the caller put on the wrapper`, function() {
        let w = new String('x')
        w.toString = () => 'evil'
        w.valueOf = () => 'evil2'
        assert.strict.deepStrictEqual(cstr(w), 'x')
        let n = new Number(7)
        n.toString = () => 'evil'
        assert.strict.deepStrictEqual(cstr(n), '7')
    })

    it(`should return '' for the wrapper of an empty string and of a non-convertible value (same as the primitive), keep Symbol and BigInt conversion unchanged`, function() {
        assert.strict.deepStrictEqual([cstr(new String('')), cstr(''), cstr(new Boolean(true)), cstr(true)], ['', '', '', ''])
        assert.strict.deepStrictEqual([cstr(Symbol('a')), cstr(Object(Symbol('a'))), cstr(10n), cstr(Object(10n))], ['Symbol(a)', 'Symbol(a)', '10', '10']) //BigInt與Symbol之包裝物件不在W-20範圍(只有String、Number、Boolean), 行為與修前相同
    })

})
