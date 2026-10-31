import assert from 'assert'
import arrAdd from '../src/arrAdd.mjs'
import arrMulti from '../src/arrMulti.mjs'
import arrMax from '../src/arrMax.mjs'
import arrMin from '../src/arrMin.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'


let isErr = (msg) => {
    return (err) => {
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, msg)
        return true
    }
}


//排程第221項第一批之第三段: 廣義數字陣列之計算(arrAdd、arrMulti、arrMax、arrMin)以isenum判定有效數字
//依據: dspec〈輸入參數之檢測機制〉§11(2026-10-31使用者裁定):
//  「基於廣義數字之陣列, 於計算處理時, 只要非有效數字 就是用該函數之預設值去計算, 例如 arrAdd 之計算用預設值是0, arrMulti之計算用預設值是1」
//  「若沒法計算與回傳結果, 那就報錯」(arrMax/arrMin 全為非有效數字時throw)
describe(`廣義數字陣列之計算改用isenum(第221項第一批)`, function() {

    describe(`arrAdd`, function() {

        //對應裁定: 非有效數字(含標記、null、Infinity、'0x10'、包裝物件)一律以預設值0計算
        for (let [lb, v] of INVALID) {
            it(`should treat ${lb} as 0 in either array`, function() {
                assert.strict.deepStrictEqual(arrAdd([1, v, 3], [10, 20, 30]), [11, 20, 33])
                assert.strict.deepStrictEqual(arrAdd([1, 2, 3], [10, v, 30]), [11, 2, 33])
            })
            it(`should return 0 at the position where both are ${lb} (each array has another valid number)`, function() {
                //第221項第二批(§11第15項): 每個陣列各自至少1個有效數字, 故兩陣列各補一個有效數字; 同位置皆非有效數字仍為0
                assert.strict.deepStrictEqual(arrAdd([v, 1], [v, 2]), [0, 3])
            })
            it(`should throw when the array has no valid number but ${lb}`, function() {
                //§11第15項: 每個陣列各自至少1個有效數字, 否則throw
                assert.throws(() => arrAdd([v], [1]), isErr('invalid arrs[0]: must contain a valid number'))
                assert.throws(() => arrAdd([1], [v]), isErr('invalid arrs[1]: must contain a valid number'))
            })
        }

        //對應K4: 數字字串(含頭尾空白、科學記號)取去頭尾空白後Number之值
        for (let [lb, s, n] of VALID_STR) {
            it(`should add numeric string ${lb} as number ${n}`, function() {
                assert.strict.deepStrictEqual(arrAdd([1, s, 3], [10, 20, 30]), [11, n + 20, 33])
                assert.strict.deepStrictEqual(arrAdd([s, 1], ['-', 2]), [n, 3])
                assert.strict.deepStrictEqual(arrAdd(['NP', 1], [s, 2]), [n, 3])
            })
        }

        //對應裁定: 多於兩個陣列時逐一以預設值處理
        it(`should apply the default to every array when adding more than two`, function() {
            assert.strict.deepStrictEqual(arrAdd([1, '-', 3], [null, 2, Infinity], ['0x10', 5, 7]), [1, 7, 10])
            assert.strict.deepStrictEqual(arrAdd(['-', 1], ['NP', 2], [null, 3]), [0, 6])
            //§11第15項: 每個陣列各自至少1個有效數字, 第3個陣列沒有則throw並帶索引
            assert.throws(() => arrAdd(['-', 1], ['NP', 2], [null, undefined]), isErr('invalid arrs[2]: must contain a valid number'))
        })

        //對應JSDoc: 陣列容器之處置不變(少於2個、非陣列、長度不同回[])
        it(`should keep container handling unchanged`, function() {
            assert.strict.deepStrictEqual(arrAdd(), [])
            assert.strict.deepStrictEqual(arrAdd([1]), [])
            assert.strict.deepStrictEqual(arrAdd([1, 2], [1]), [])
            assert.strict.deepStrictEqual(arrAdd(1, [1]), [])
            assert.strict.deepStrictEqual(arrAdd([1], 'a'), [])
            assert.throws(() => arrAdd([], []), isErr('invalid arrs[0]: must contain a valid number')) //§11第15項: 空陣列視為0個有效數字, 改throw(原回[])
            assert.strict.deepStrictEqual(arrAdd([1, 2], [1, 2], [1]), [])
        })

    })

    describe(`arrMulti`, function() {

        //對應裁定: 非有效數字一律以預設值1計算
        for (let [lb, v] of INVALID) {
            it(`should treat ${lb} as 1 in either array`, function() {
                assert.strict.deepStrictEqual(arrMulti([2, v, 3], [10, 20, 30]), [20, 20, 90])
                assert.strict.deepStrictEqual(arrMulti([2, 2, 3], [10, v, 30]), [20, 2, 90])
            })
            it(`should return 1 at the position where both are ${lb} (each array has another valid number)`, function() {
                //第221項第二批(§11第15項): 每個陣列各自至少1個有效數字, 故兩陣列各補一個有效數字; 同位置皆非有效數字仍為1
                assert.strict.deepStrictEqual(arrMulti([v, 2], [v, 3]), [1, 6])
            })
            it(`should throw when the array has no valid number but ${lb}`, function() {
                //§11第15項: 每個陣列各自至少1個有效數字, 否則throw
                assert.throws(() => arrMulti([v], [1]), isErr('invalid arrs[0]: must contain a valid number'))
                assert.throws(() => arrMulti([1], [v]), isErr('invalid arrs[1]: must contain a valid number'))
            })
        }

        for (let [lb, s, n] of VALID_STR) {
            it(`should multiply numeric string ${lb} as number ${n}`, function() {
                assert.strict.deepStrictEqual(arrMulti([2, s, 3], [10, 20, 30]), [20, n * 20, 90])
                assert.strict.deepStrictEqual(arrMulti([s, 2], ['-', 3]), [n, 6])
                assert.strict.deepStrictEqual(arrMulti(['NP', 2], [s, 3]), [n, 6])
            })
        }

        it(`should apply the default to every array when multiplying more than two`, function() {
            assert.strict.deepStrictEqual(arrMulti([2, '-', 3], [null, 2, Infinity], ['0x10', 5, 7]), [2, 10, 21])
            assert.strict.deepStrictEqual(arrMulti(['-', 2], ['NP', 3], [null, 4]), [1, 24])
            //§11第15項: 每個陣列各自至少1個有效數字, 第3個陣列沒有則throw並帶索引
            assert.throws(() => arrMulti(['-', 2], ['NP', 3], [null, undefined]), isErr('invalid arrs[2]: must contain a valid number'))
        })

        it(`should keep container handling unchanged`, function() {
            assert.strict.deepStrictEqual(arrMulti(), [])
            assert.strict.deepStrictEqual(arrMulti([1]), [])
            assert.strict.deepStrictEqual(arrMulti([1, 2], [1]), [])
            assert.strict.deepStrictEqual(arrMulti(1, [1]), [])
            assert.strict.deepStrictEqual(arrMulti([1], 'a'), [])
            assert.throws(() => arrMulti([], []), isErr('invalid arrs[0]: must contain a valid number')) //§11第15項: 空陣列視為0個有效數字, 改throw(原回[])
        })

    })

    //arrMax與arrMin: 只取有效數字, 無任何有效數字throw, 訊息固定不帶值
    let mm = {
        arrMax: { f: arrMax, pick: Math.max, idx: 0 },
        arrMin: { f: arrMin, pick: Math.min, idx: 2 },
    }

    for (let [name, { f, pick, idx }] of Object.entries(mm)) {

        describe(name, function() {

            const MSG_NONE = 'invalid vall: must contain a valid number'
            const MSG_ARR = 'invalid vall: must be an array'

            //對應裁定: 非有效數字略過(不參與), 其餘有效數字照比
            for (let [lb, v] of INVALID) {
                it(`should skip ${lb} when other valid numbers exist`, function() {
                    assert.strict.deepStrictEqual(f([5, v, 3]), pick(5, 3))
                    assert.strict.deepStrictEqual(f([v, 5, v, 3, v]), pick(5, 3))
                    assert.strict.deepStrictEqual(f([5, v, 3], { returnIndex: true }), idx)
                })
            }

            //對應裁定「若沒法計算與回傳結果, 那就報錯」: 全為非有效數字(含空陣列)throw
            for (let [lb, v] of INVALID) {
                it(`should throw when the only element is ${lb}`, function() {
                    assert.throws(() => f([v]), isErr(MSG_NONE))
                    assert.throws(() => f([v, v]), isErr(MSG_NONE))
                    assert.throws(() => f([v], { returnIndex: true }), isErr(MSG_NONE))
                })
            }

            it(`should throw when vall is an empty array`, function() {
                assert.throws(() => f([]), isErr(MSG_NONE))
                assert.throws(() => f([], { returnIndex: true }), isErr(MSG_NONE))
                assert.throws(() => f([], { compareKey: 'i' }), isErr(MSG_NONE))
            })

            //對應§7.2: 容器須為陣列, 否則throw
            for (let [lb, v] of INVALID) {
                if (Array.isArray(v)) {
                    continue //陣列為容器, 另案
                }
                it(`should throw when vall is ${lb} (not an array)`, function() {
                    assert.throws(() => f(v), isErr(MSG_ARR))
                    assert.throws(() => f(v, { returnIndex: true }), isErr(MSG_ARR))
                })
            }

            it(`should throw when vall is a plain number or numeric string (not an array)`, function() {
                assert.throws(() => f(5), isErr(MSG_ARR))
                assert.throws(() => f('5'), isErr(MSG_ARR))
                assert.throws(() => f({ 0: 5, length: 1 }), isErr(MSG_ARR))
            })

            //對應§6 V20: 訊息不帶值
            it(`should not include the value in the message`, function() {
                let secret = 'secret-NP-12345'
                assert.throws(() => f([secret]), (err) => {
                    assert.strict.deepStrictEqual(err.message.includes(secret), false)
                    assert.strict.deepStrictEqual(err.message, MSG_NONE)
                    return true
                })
                assert.throws(() => f(secret), (err) => {
                    assert.strict.deepStrictEqual(err.message.includes(secret), false)
                    return true
                })
            })

            //對應K4: 數字字串取去頭尾空白後Number, 回傳數值(非字串)
            for (let [lb, s, n] of VALID_STR) {
                it(`should return the number ${n} when numeric string ${lb} is the extreme`, function() {
                    let other = name === 'arrMax' ? n - 100 : n + 100 //使字串為極值
                    let r = f([s, other])
                    assert.strict.deepStrictEqual(typeof r, 'number')
                    assert.strict.deepStrictEqual(r, n)
                    assert.strict.deepStrictEqual(f([other, s]), n)
                    assert.strict.deepStrictEqual(f([s]), n)
                    assert.strict.deepStrictEqual(f(['-', s, 'NP']), n)
                })
            }

            //對應JSDoc: Infinity/'0x10'不再當極值(舊版arrMax([5, Infinity])為Number.MAX_VALUE、arrMax([5,'0x10'])為16)
            it(`should no longer take Infinity, '0x10' or wrapper objects as the extreme`, function() {
                assert.strict.deepStrictEqual(f([5, Infinity, -Infinity, '0x10', '1e400', new Number(99), 3]), pick(5, 3)) // eslint-disable-line no-new-wrappers
                assert.strict.deepStrictEqual(f([5, Infinity, -Infinity, '0x10', '1e400', new Number(99), 3], { returnIndex: true }), name === 'arrMax' ? 0 : 6) // eslint-disable-line no-new-wrappers
            })

            //對應JSDoc: opt.compareKey之處置不變, 抽出欄位同樣依isenum
            it(`should apply isenum to the compareKey field and still return the object or index`, function() {
                let objs = [{ s: 'a', i: 1 }, { s: 'b', i: Infinity }, { s: 'c', i: '0x10' }, { s: 'd', i: ' 30 ' }, { s: 'e', i: 'a25' }, { s: 'f' }]
                let rObj = f(objs, { compareKey: 'i' })
                assert.strict.deepStrictEqual(rObj, name === 'arrMax' ? objs[3] : objs[0])
                let rInd = f(objs, { compareKey: 'i', returnIndex: true })
                assert.strict.deepStrictEqual(rInd, name === 'arrMax' ? 3 : 0)
                assert.throws(() => f(objs, { compareKey: 's' }), isErr(MSG_NONE))
                assert.throws(() => f(objs, { compareKey: 'zzz' }), isErr(MSG_NONE))
                assert.throws(() => f([{ i: Infinity }, { i: '0x10' }], { compareKey: 'i' }), isErr(MSG_NONE))
            })

            //對應JSDoc: opt非預期輸入之處置不變(視為未給)
            it(`should keep unexpected opt handling unchanged`, function() {
                for (let opt of [undefined, null, '', 'x', [], {}, 0, 5, true]) {
                    assert.strict.deepStrictEqual(f([5, 3], opt), pick(5, 3))
                }
            })

        })

    }

})
