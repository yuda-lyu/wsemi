import assert from 'assert'
import round from '../src/round.mjs'
import ceil from '../src/ceil.mjs'
import floor from '../src/floor.mjs'
import dig from '../src/dig.mjs'
import digExp from '../src/digExp.mjs'
import cfinancial from '../src/cfinancial.mjs'
import cfilesize from '../src/cfilesize.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'


//排程第221項第一批之第一段: 取整與格式化函數之v由isnum改isenum(無效仍回''), round/ceil/floor之idig由isp0int改iseint(use為digits, 無效仍用0)
//依據: dspec〈輸入參數之檢測機制〉§3.1、§7.1(iseint之digits為0~100)、§11(2026-10-31使用者裁定: round系列與格式化無效回'')
describe(`取整與格式化函數改用isenum/iseint(第221項第一批)`, function() {

    describe(`round、ceil、floor之v`, function() {

        let fns = { round, ceil, floor }

        for (let [name, f] of Object.entries(fns)) {

            describe(name, function() {

                //對應§11: 非有效數字回''
                for (let [lb, v] of INVALID) {
                    it(`should return '' when v is ${lb}`, function() {
                        assert.strict.deepStrictEqual(f(v), '')
                        assert.strict.deepStrictEqual(f(v, 2), '')
                    })
                }

                //對應K4與§6(入口檢測應先擋下, 有效數字字串不得洩漏[DecimalError]): 數字字串(含頭尾空白、科學記號)同數值結果
                for (let [lb, s, n] of VALID_STR) {
                    it(`should return same result as number ${n} when v is ${lb}`, function() {
                        assert.strict.deepStrictEqual(f(s, 7), f(n, 7))
                        assert.strict.deepStrictEqual(f(s), f(n))
                    })
                }

                //對應K4: 字串直接交給Decimal解析, 多餘位數不經Number先捨入
                it(`should not round the numeric string through Number first`, function() {
                    let cases = {
                        round: ['9.8349999999999999999', 2, 9.83], //Number後為9.835而進位成9.84
                        ceil: ['9.0000000000000000001', 0, 10], //Number後為9而得9
                        floor: ['9.9999999999999999999', 0, 9], //Number後為10而得10
                    }
                    let [s, idig, rr] = cases[name]
                    assert.strict.deepStrictEqual(f(s, idig), rr)
                })

                //對應JSDoc: idig為0~100之有效整數(數字或數字字串)則使用
                it(`should use idig when idig is a valid integer from 0 to 100 (number or numeric string)`, function() {
                    let exp = { round: [1, 1.2, 1.23], ceil: [2, 1.3, 1.24], floor: [1, 1.2, 1.23] }[name]
                    assert.strict.deepStrictEqual(f(1.23456), exp[0])
                    assert.strict.deepStrictEqual(f(1.23456, 0), exp[0])
                    assert.strict.deepStrictEqual(f(1.23456, 1), exp[1])
                    assert.strict.deepStrictEqual(f(1.23456, 2), exp[2])
                    assert.strict.deepStrictEqual(f(1.23456, '2'), exp[2])
                    assert.strict.deepStrictEqual(f(1.23456, ' 2 '), exp[2])
                    assert.strict.deepStrictEqual(f(1.23456, '2.0'), exp[2])
                    assert.strict.deepStrictEqual(f(1.23456, '2e0'), exp[2])
                    assert.strict.deepStrictEqual(f(1.5, 100), 1.5) //上限100含
                    assert.strict.deepStrictEqual(f(1.5, '100'), 1.5)
                })

                //對應JSDoc: idig非0~100之有效整數(101、負數、小數、Infinity、'0x10'、非數字、包裝物件、BigInt等)改用預設0, 不拋錯
                it(`should use default 0 when idig is not a valid integer from 0 to 100`, function() {
                    let ref = f(1.23456)
                    let bad = [101, -1, 2.5, Infinity, -Infinity, NaN, 'Infinity', '0x10', '0b11', '1e400', 'abc', '', ' ', null, true, false, [2], {}, 10n, 1e21, '2.5', new Number(2)] // eslint-disable-line no-new-wrappers
                    for (let idig of bad) {
                        assert.strict.deepStrictEqual(f(1.23456, idig), ref, `idig=${String(idig)}`)
                    }
                    assert.strict.deepStrictEqual(f(1.23456, undefined), ref)
                })

            })

        }

        //對應round之opt.rounding(不變): 字串v去空白後仍依取捨方式
        it(`round should keep opt.rounding working with padded numeric string`, function() {
            assert.strict.deepStrictEqual(round(' 9.825 ', 2, { rounding: 'ROUND_HALF_EVEN' }), 9.82)
            assert.strict.deepStrictEqual(round(' 9.825 ', 2), 9.83)
            assert.strict.deepStrictEqual(round(' 9.825 ', 2, { rounding: 'ROUND_HALF_UP' }), 9.83)
        })

        //對應JSDoc: 修前round(' 30 ')拋[DecimalError], 現為30
        it(`should not throw DecimalError when v is a padded numeric string`, function() {
            assert.strict.deepStrictEqual(round(' 30 '), 30)
            assert.strict.deepStrictEqual(ceil(' 30 ', 2), 30)
            assert.strict.deepStrictEqual(floor('\t30\n', 2), 30)
        })

    })

    describe(`dig、digExp、cfinancial之v與cfilesize之b`, function() {

        let fns = { dig, digExp, cfinancial }

        for (let [name, f] of Object.entries(fns)) {

            describe(name, function() {

                //對應§11: 非有效數字回''
                for (let [lb, v] of INVALID) {
                    it(`should return '' when v is ${lb}`, function() {
                        assert.strict.deepStrictEqual(f(v, 2), '')
                        assert.strict.deepStrictEqual(f(v), '')
                    })
                }

                //對應K4: 數字字串同數值結果
                for (let [lb, s, n] of VALID_STR) {
                    it(`should return same result as number ${n} when v is ${lb}`, function() {
                        assert.strict.deepStrictEqual(f(s, 2), f(n, 2))
                        assert.strict.deepStrictEqual(f(s, 7), f(n, 7))
                    })
                }

            })

        }

        describe('cfilesize', function() {

            for (let [lb, v] of INVALID) {
                it(`should return '' when b is ${lb}`, function() {
                    assert.strict.deepStrictEqual(cfilesize(v), '')
                })
            }

            for (let [lb, s, n] of VALID_STR) {
                it(`should return same result as number ${n} when b is ${lb}`, function() {
                    assert.strict.deepStrictEqual(cfilesize(s), cfilesize(n))
                })
            }

        })

        //對應JSDoc範例: 數字字串(含空白)結果
        it(`should format padded numeric strings`, function() {
            assert.strict.deepStrictEqual(dig(' 1.005 ', 2), '1.01')
            assert.strict.deepStrictEqual(digExp(' 0.000000123456789 ', 2), '1.23e-7')
            assert.strict.deepStrictEqual(cfinancial(' 1234567.89 ', 1), '1,234,567.9')
            assert.strict.deepStrictEqual(cfilesize(' 2048 '), '2.0 kb')
        })

        //對應修前: dig(Infinity,2)為'NaN'、dig('0x10',2)為'16.00'、cfilesize('0x10')為'16.0 b'; 現為''
        it(`should return '' for the inputs that used to give 'NaN' or a hex value`, function() {
            assert.strict.deepStrictEqual(dig(Infinity, 2), '')
            assert.strict.deepStrictEqual(dig('0x10', 2), '')
            assert.strict.deepStrictEqual(digExp(-Infinity, 2), '')
            assert.strict.deepStrictEqual(cfinancial('1e400', 2), '')
            assert.strict.deepStrictEqual(cfilesize(-Infinity), '')
            assert.strict.deepStrictEqual(cfilesize('0b11'), '')
        })

        //對應任務範圍: dig、digExp、cfinancial之idig本輪不動(仍由isp0int判定, 無效回'')
        it(`should keep idig handling of dig, digExp, cfinancial unchanged in this batch`, function() {
            for (let f of [dig, digExp, cfinancial]) {
                assert.strict.deepStrictEqual(f(1.5, 'abc'), '')
                assert.strict.deepStrictEqual(f(1.5, -1), '')
                assert.strict.deepStrictEqual(f(1.5, 2.5), '')
                assert.strict.deepStrictEqual(f(1.5, null), '')
            }
        })

    })

})
