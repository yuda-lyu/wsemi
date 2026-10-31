import assert from 'assert'
import digExp from '../src/digExp.mjs'
import cfinancial from '../src/cfinancial.mjs'
import { defineOptParam, INVALID_EINT_EXTRA } from './tools/optValKit.mjs'


//digExp(v, idig)、cfinancial(v, idig)之idig: opt類參數(JSDoc [idig=0]), iseint(use: 'digits', 0~100), 使用者2026-10-31裁定: 非預期(含負數、小數、超過100、Infinity、非數字)改用預設0(修前回''; 101以上修前拋RangeError)
//  dig(v, idig)有下游站點(第三級), 本輪不納入, 其idig仍為1.9.36原碼(無效回''), 測試不在此; digExp與cfinancial內部呼叫之dig為原碼, 收到的是已解析之有效idig
//v非有效數字仍回''(第一批已改isenum, 不動)
//二者皆無opt物件可帶debug, 故不測debug警告(noDebug)


//共用之無效輸入(再加此參數另有者)
const INVALID_DIGITS_EXTRA = [
    ...INVALID_EINT_EXTRA,
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    ['2.5', 2.5],
    [`'2.5'`, '2.5'],
    ['101 (over digits upper bound, was RangeError)', 101],
    [`'101'`, '101'],
    ['2147483647', 2147483647],
    ['4294967296', 4294967296],
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['Number.MAX_VALUE', Number.MAX_VALUE],
    [`'0x2'`, '0x2'],
    [`new Number(2)`, new Number(2)], // eslint-disable-line no-new-wrappers
    [`new String('2')`, new String('2')], // eslint-disable-line no-new-wrappers
]


describe('optVal digExp', function() {

    //觀察值: 指數顯示路徑(v<=1e-6)與一般路徑(經dig)各取一, 以' | '相連
    defineOptParam({
        fn: 'digExp',
        name: 'idig',
        def: '1e-7 | 1',
        probe: (v) => digExp(0.000000123456, v) + ' | ' + digExp(1.23456, v),
        noDebug: true,
        valid: [
            ['0 (allowed)', 0, '1e-7 | 1'],
            [`'0'`, '0', '1e-7 | 1'],
            ['1', 1, '1.2e-7 | 1.2'],
            ['2', 2, '1.23e-7 | 1.23'],
            ['3', 3, '1.235e-7 | 1.235'],
            ['5', 5, '1.23456e-7 | 1.23456'],
            [`'2'`, '2', '1.23e-7 | 1.23'],
            [`' 3 '`, ' 3 ', '1.235e-7 | 1.235'],
            [`'\\t4\\n'`, '\t4\n', '1.2346e-7 | 1.2346'],
            [`'1e0'`, '1e0', '1.2e-7 | 1.2'],
            [`'+2.'`, '+2.', '1.23e-7 | 1.23'],
            [`'00003'`, '00003', '1.235e-7 | 1.235'],
        ],
        extraInvalid: [
            ...INVALID_DIGITS_EXTRA,
        ],
    })

    it('should accept 100 as the upper bound and use the default for 101 (exponent and plain paths)', function() {
        // 2 ** -24 = 5.9604644775390625e-8 為精確二進位小數(16位有效數字)
        assert.strict.deepStrictEqual(digExp(2 ** -24, 100), '5.9604644775390625' + '0'.repeat(84) + 'e-8')
        assert.strict.deepStrictEqual(digExp(1.5, 100), '1.5' + '0'.repeat(99))
        assert.strict.deepStrictEqual(digExp(2 ** -24, 101), '6e-8') //修前拋RangeError
        assert.strict.deepStrictEqual(digExp(1.5, 101), '2')
    })

    it('should still return empty string when v is not a valid number, whatever idig is', function() {
        for (let idig of [undefined, null, 0, 2, 'abc', -1, 101, Infinity]) {
            assert.strict.deepStrictEqual(digExp('abc', idig), '', `idig=${String(idig)}`)
            assert.strict.deepStrictEqual(digExp(Infinity, idig), '', `idig=${String(idig)}`)
            assert.strict.deepStrictEqual(digExp(null, idig), '', `idig=${String(idig)}`)
        }
    })

    it('should return "0" for v 0 whatever idig is (no digit formatting)', function() {
        for (let idig of [undefined, 0, 2, 'abc', -1, 101]) {
            assert.strict.deepStrictEqual(digExp(0, idig), '0', `idig=${String(idig)}`)
        }
    })

})


describe('optVal cfinancial', function() {

    defineOptParam({
        fn: 'cfinancial',
        name: 'idig',
        def: '1,234,568',
        probe: (v) => cfinancial(1234567.891, v),
        noDebug: true,
        valid: [
            ['0 (allowed)', 0, '1,234,568'],
            [`'0'`, '0', '1,234,568'],
            ['1', 1, '1,234,567.9'],
            ['2', 2, '1,234,567.89'],
            ['3', 3, '1,234,567.891'],
            ['5', 5, '1,234,567.89100'],
            [`'2'`, '2', '1,234,567.89'],
            [`' 3 '`, ' 3 ', '1,234,567.891'],
            [`'\\t1\\n'`, '\t1\n', '1,234,567.9'],
            [`'1e0'`, '1e0', '1,234,567.9'],
            [`'+2.'`, '+2.', '1,234,567.89'],
            [`'00003'`, '00003', '1,234,567.891'],
        ],
        extraInvalid: [
            ...INVALID_DIGITS_EXTRA,
        ],
    })

    it('should accept 100 as the upper bound and use the default for 101', function() {
        assert.strict.deepStrictEqual(cfinancial(1234567.5, 100), '1,234,567.5' + '0'.repeat(99))
        assert.strict.deepStrictEqual(cfinancial(1234567.5, 101), '1,234,568') //修前拋RangeError
    })

    it('should still return empty string when v is not a valid number, whatever idig is', function() {
        for (let idig of [undefined, null, 0, 2, 'abc', -1, 101, Infinity]) {
            assert.strict.deepStrictEqual(cfinancial('abc', idig), '', `idig=${String(idig)}`)
            assert.strict.deepStrictEqual(cfinancial(Infinity, idig), '', `idig=${String(idig)}`)
            assert.strict.deepStrictEqual(cfinancial(null, idig), '', `idig=${String(idig)}`)
        }
    })

    it('should pass the resolved idig to dig (a padded numeric string gives the same as the number)', function() {
        assert.strict.deepStrictEqual(cfinancial(1234567.891, ' 2 '), '1,234,567.89')
        assert.strict.deepStrictEqual(cfinancial(1234567.891, ' 2 '), cfinancial(1234567.891, 2))
    })

})
