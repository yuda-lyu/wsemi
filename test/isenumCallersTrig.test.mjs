import assert from 'assert'
import sind from '../src/sind.mjs'
import cosd from '../src/cosd.mjs'
import tand from '../src/tand.mjs'
import secd from '../src/secd.mjs'
import cscd from '../src/cscd.mjs'
import cotd from '../src/cotd.mjs'
import asind from '../src/asind.mjs'
import atand from '../src/atand.mjs'
import atan2d from '../src/atan2d.mjs'
import { INVALID, INVALID_BUT_ISNUM, VALID_STR } from './tools/enumInputs.mjs'


//排程第221項第一批之第一段: 三角函數之數字判定由isnum改isenum, 無效仍回null(判斷界線收緊)
//依據: dspec〈輸入參數之檢測機制〉§3.1(定案: 不收十六進位/八進位/二進位)、§11(2026-10-31使用者裁定: 三角函數無效回null;sind('0x10')、sind(Infinity)改後回null)
describe(`三角函數改用isenum(第221項第一批)`, function() {

    let unary = { sind, cosd, tand, secd, cscd, cotd, asind, atand }

    //各函數取一個定義域內之參考輸入, 驗數字字串(含頭尾空白、科學記號)與數值同結果(K4: 檢測之值即為使用之值)
    let ref = { sind: 30, cosd: 60, tand: 45, secd: 60, cscd: 30, cotd: 45, asind: 0.5, atand: 1 }

    for (let [name, f] of Object.entries(unary)) {

        describe(name, function() {

            //對應§11: 非有效數字(含isnum為true之Infinity、'0x10'、'1e400'、包裝物件)回null
            for (let [lb, v] of INVALID) {
                it(`should return null when input ${lb}`, function() {
                    assert.strict.deepStrictEqual(f(v), null)
                })
            }

            //對應§3.1/K4: 數字字串去頭尾空白後取值, 結果同數值輸入(NaN亦相同)
            for (let [lb, s, n] of VALID_STR) {
                it(`should return same result as number ${n} when input ${lb}`, function() {
                    assert.strict.deepStrictEqual(f(s), f(n))
                })
            }

            //對應K4: 參考輸入之各種寫法(空白、科學記號、正號)皆同數值輸入, 且結果為有限數(非null)
            it(`should return the same finite result for padded or scientific strings of ${ref[name]}`, function() {
                let r0 = f(ref[name])
                assert.strict.deepStrictEqual(typeof r0, 'number')
                assert.strict.deepStrictEqual(Number.isFinite(r0), true)
                assert.strict.deepStrictEqual(f(` ${ref[name]} `), r0)
                assert.strict.deepStrictEqual(f(`${ref[name]}`), r0)
                assert.strict.deepStrictEqual(f(`+${ref[name]}`), r0)
                assert.strict.deepStrictEqual(f(`${ref[name] * 10}e-1`), r0)
            })

        })

    }

    //對應使用者2026-10-31裁定之明列例: sind('0x10')、sind(Infinity)改後回null
    it(`should return null when input sind('0x10') and sind(Infinity) (user's examples)`, function() {
        assert.strict.deepStrictEqual(sind('0x10'), null)
        assert.strict.deepStrictEqual(sind(Infinity), null)
    })

    //對應JSDoc: atand/atan2d不再接受Infinity(舊版atand(Infinity)為90)
    it(`should no longer return +-90 for atand(+-Infinity)`, function() {
        assert.strict.deepStrictEqual(atand(Infinity), null)
        assert.strict.deepStrictEqual(atand(-Infinity), null)
        assert.strict.deepStrictEqual(atand('Infinity'), null)
    })

    describe('atan2d', function() {

        //對應§11: x與y任一非有效數字回null
        for (let [lb, v] of INVALID) {
            it(`should return null when x is ${lb}`, function() {
                assert.strict.deepStrictEqual(atan2d(v, 1), null)
            })
            it(`should return null when y is ${lb}`, function() {
                assert.strict.deepStrictEqual(atan2d(1, v), null)
            })
        }

        it(`should return null when both x and y are invalid`, function() {
            for (let [, v] of INVALID_BUT_ISNUM) {
                assert.strict.deepStrictEqual(atan2d(v, v), null)
            }
        })

        //對應K4: 數字字串同數值
        it(`should return same result when x and y are numeric strings`, function() {
            assert.strict.deepStrictEqual(atan2d(' 1 ', '1'), atan2d(1, 1))
            assert.strict.deepStrictEqual(atan2d('+1.', '1e0'), 45)
            assert.strict.deepStrictEqual(atan2d('1', ' -1 '), -45)
            for (let [, s, n] of VALID_STR) {
                assert.strict.deepStrictEqual(atan2d(s, 1), atan2d(n, 1))
                assert.strict.deepStrictEqual(atan2d(1, s), atan2d(1, n))
            }
        })

    })

})
