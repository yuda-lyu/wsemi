import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pseudoRandomIntsNdpRange from '../src/pseudoRandomIntsNdpRange.mjs'


describe(`pseudoRandomIntsNdpRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return [ 94, 76 ] when input null, null, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 123)
        let rr = [94, 76]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 69, 82 ] when input null, null, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 12.3)
        let rr = [69, 82]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 34 ] when input null, null, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'def')
        let rr = [64, 34]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 26 ] when input null, null, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'BH01S123')
        let rr = [0, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 71, 77 ] when input null, null, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'BH-01:S-123')
        let rr = [71, 77]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 94, 76 ] when input 0, 100, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 123)
        let rr = [94, 76]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 69, 82 ] when input 0, 100, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 12.3)
        let rr = [69, 82]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 34 ] when input 0, 100, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'def')
        let rr = [64, 34]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 26 ] when input 0, 100, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'BH01S123')
        let rr = [0, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 71, 77 ] when input 0, 100, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'BH-01:S-123')
        let rr = [71, 77]
        assert.strict.deepStrictEqual(r, rr)
    })

    //vstart不為0者: 回傳值落於[vstart, vend], 即0~(vend-vstart)之索引加上vstart(排程第492項第1批; 修前未加偏移而回0~(vend-vstart)之索引, 與randomIntsNdpRange不同)
    //  各值為同seed、vstart=0之索引(上方0, 100另有案例; 此處以0, 4444之同序索引)加123
    it(`should return [ 2651, 3977 ] when input 123, 4567, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 123)
        let rr = [2651, 3977]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1941, 4457 ] when input 123, 4567, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)
        let rr = [1941, 4457]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 601, 3426 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
        let rr = [601, 3426]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 601, 3426 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
        let rr = [601, 3426]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1106, 3256 ] when input 123, 4567, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'def')
        let rr = [1106, 3256]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2989, 306 ] when input 123, 4567, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH01S123')
        let rr = [2989, 306]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 4011, 372 ] when input 123, 4567, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH-01:S-123')
        let rr = [4011, 372]
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`回傳值落於[vstart, vend](盤點N-D: 修前回0~(vend-vstart)之索引而未加vstart偏移)`, function() {

        //JSDoc首句: 「各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend」; 不重複; 最長為vend-vstart+1個
        let ranges = [
            [100, 105],
            [100, 100],
            [-5, 5],
            [-10, -3],
            [1, 9],
            [123, 4567],
            [-3, 3],
            [1000000, 1000009],
            [0, 9],
            [Number.MAX_SAFE_INTEGER - 9, Number.MAX_SAFE_INTEGER],
            [-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER + 9],
        ]
        for (let [a, b] of ranges) {
            it(`should return distinct integers within [${a}, ${b}] and cover the whole range when n is large`, function() {
                let size = b - a + 1
                let all = pseudoRandomIntsNdpRange(a, b, size + 5, 'seed')
                assert.strict.deepStrictEqual(all.length, size)
                assert.strict.deepStrictEqual(new Set(all).size, size)
                for (let r of all) {
                    assert.ok(Number.isInteger(r) && r >= a && r <= b, `[${a}, ${b}] -> ${r}`)
                }
                //全取時恰為[a, b]之排列
                assert.strict.deepStrictEqual([...all].sort((x, y) => x - y), Array.from({ length: size }, (v, i) => a + i))
            })
        }

        it(`should return values in [vstart, vend] for the issue example pseudoRandomIntsNdpRange(100, 105, 3) (formerly [1, 3, 4])`, function() {
            let rs = pseudoRandomIntsNdpRange(100, 105, 3)
            assert.strict.deepStrictEqual(rs.length, 3)
            for (let r of rs) {
                assert.ok(r >= 100 && r <= 105, String(r))
            }
        })

        it(`should equal the vstart=0 result of the same seed shifted by vstart (deterministic: same seed, same permutation)`, function() {
            for (let [a, b] of [[100, 105], [-5, 5], [123, 4567], [-10, -3], [7, 7]]) {
                for (let seed of [123, 12.3, 'abc', 'BH01S123', 'BH-01:S-123']) {
                    for (let n of [1, 2, 3, 100]) {
                        let base = pseudoRandomIntsNdpRange(0, b - a, n, seed)
                        let shifted = pseudoRandomIntsNdpRange(a, b, n, seed)
                        assert.strict.deepStrictEqual(shifted, base.map((v) => v + a), `[${a}, ${b}] n=${n} seed=${seed}`)
                    }
                }
            }
        })

        it(`should keep the shift identity at the safe-integer boundary too, order included (the sort key does not contain vstart; terra #11)`, function() {
            //外審terra #11: 排序用之值含大vstart時浮點捨入會改變並列關係; 修後排序用之值不含vstart, 與起點無關
            let m = Number.MAX_SAFE_INTEGER - 9
            for (let seed of ['abc', 'def', 123, 'BH01S123']) {
                for (let n of [1, 3, 10]) {
                    let base = pseudoRandomIntsNdpRange(0, 9, n, seed)
                    assert.strict.deepStrictEqual(pseudoRandomIntsNdpRange(m, m + 9, n, seed).map((x) => x - m), base, `seed=${seed} n=${n}`)
                    let neg = -Number.MAX_SAFE_INTEGER
                    assert.strict.deepStrictEqual(pseudoRandomIntsNdpRange(neg, neg + 9, n, seed).map((x) => x - neg), base, `neg seed=${seed} n=${n}`)
                }
            }
            //外審所舉之例(修前之修正版曾得[5, 2, 8])
            assert.strict.deepStrictEqual(pseudoRandomIntsNdpRange(m, m + 9, 3, 'abc').map((x) => x - m), pseudoRandomIntsNdpRange(0, 9, 3, 'abc'))
        })

        it(`should state in the JSDoc that the default seed 'start1' is not covered by the shift identity`, function() {
            let c = fs.readFileSync(fileURLToPath(new URL('../src/pseudoRandomIntsNdpRange.mjs', import.meta.url)), 'utf8')
            let d = c.slice(c.indexOf('/**'), c.indexOf('*/', c.indexOf('/**')))
            assert.ok(d.indexOf(`seed為'start1'時每次呼叫自增，不在此限`) >= 0)
        })

        it(`should be unchanged for vstart=0 (the former index result is already within [0, vend])`, function() {
            //修前後 vstart=0 時結果相同: 上方既有固定值案例(如 null, null, 2, 123 -> [94, 76])續用
            assert.strict.deepStrictEqual(pseudoRandomIntsNdpRange(0, 100, 2, 123), [94, 76])
            assert.strict.deepStrictEqual(pseudoRandomIntsNdpRange(0, 100, 1, 'abc'), [20])
        })

        it(`should return values in [vstart, vend] for numeric string bounds (the converted value is used)`, function() {
            let rs = pseudoRandomIntsNdpRange(' 100 ', '105', 6, 'seed')
            assert.strict.deepStrictEqual([...rs].sort((x, y) => x - y), [100, 101, 102, 103, 104, 105])
        })

        it(`should state in the JSDoc that the values are within [vstart, vend] and no longer describe an index result`, function() {
            let c = fs.readFileSync(fileURLToPath(new URL('../src/pseudoRandomIntsNdpRange.mjs', import.meta.url)), 'utf8')
            let d = c.slice(c.indexOf('/**'), c.indexOf('*/', c.indexOf('/**')))
            assert.ok(d.indexOf('未加vstart偏移') < 0)
            assert.ok(d.indexOf('回傳0~(vend-vstart)之索引') < 0)
            assert.ok(d.indexOf('@returns {Array}') >= 0)
        })

    })

})
