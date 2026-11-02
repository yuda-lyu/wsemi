import assert from 'assert'
import randomIntRange from '../src/randomIntRange.mjs'
import randomIntsRange from '../src/randomIntsRange.mjs'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'
import pseudoRandomIntsRange from '../src/pseudoRandomIntsRange.mjs'
import randomIntsNdpRange from '../src/randomIntsNdpRange.mjs'
import pseudoRandomIntsNdpRange from '../src/pseudoRandomIntsNdpRange.mjs'
import rang from '../src/rang.mjs'


//第221項第二批第2輪第3批(ws272c): 隨機整數於安全整數邊界之結果須恆在[vstart, vend]; rang兩端有效但計算結果溢位須回[]
//  主控2026-11-02判定(ws272b回報範圍外第2、7項): randomIntRange(9007199254740991, 9007199254740991)約半數回9007199254740992(pr * rng + vstart超過2^53後捨入);
//  同型者: randomIntsRange、pseudoRandomIntRange、pseudoRandomIntsRange一併修; randomIntsNdpRange以range()取樣(值恆在範圍內)與pseudoRandomIntsNdpRange(r僅作排序鍵)不同型, 以本檔確認結果仍符合其規格
//  規格: JSDoc「值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend」; 結果須為整數

const MAX = Number.MAX_SAFE_INTEGER


//BOUNDS, 邊界組(vstart, vend): 安全整數上下邊界附近、跨越零、整個安全整數範圍
const BOUNDS = [
    [MAX, MAX],
    [MAX - 1, MAX],
    [MAX - 2, MAX],
    [MAX - 1000, MAX],
    [-MAX, -MAX],
    [-MAX, -MAX + 1],
    [-MAX, -MAX + 1000],
    [-MAX, MAX],
    [0, MAX],
    [-MAX, 0],
    [2 ** 52, MAX],
    [2 ** 52 - 1, 2 ** 52],
    [-5, 5],
    [0, 0],
    [7, 7],
]


describe(`random integers at the safe integer bounds (ws272c)`, function() {

    it(`randomIntRange should return an integer within [vstart, vend] at every bound (formerly 2^53 beyond vend)`, function() {
        for (let [a, b] of BOUNDS) {
            for (let i = 0; i < 3000; i++) {
                let r = randomIntRange(a, b)
                assert.ok(Number.isInteger(r) && r >= a && r <= b, `randomIntRange(${a}, ${b}) -> ${r}`)
            }
        }
    })

    it(`randomIntRange(MAX_SAFE, MAX_SAFE) should always equal MAX_SAFE_INTEGER (the audited input)`, function() {
        for (let i = 0; i < 3000; i++) {
            assert.strict.deepStrictEqual(randomIntRange(9007199254740991, 9007199254740991), 9007199254740991)
        }
    })

    it(`randomIntsRange should return integers within [vstart, vend] at every bound`, function() {
        for (let [a, b] of BOUNDS) {
            let rs = randomIntsRange(a, b, 3000)
            assert.strict.deepStrictEqual(rs.length, 3000)
            for (let r of rs) {
                assert.ok(Number.isInteger(r) && r >= a && r <= b, `randomIntsRange(${a}, ${b}) -> ${r}`)
            }
        }
    })

    it(`pseudoRandomIntRange should return an integer within [vstart, vend] at every bound, over many seeds`, function() {
        for (let [a, b] of BOUNDS) {
            for (let i = 0; i < 1500; i++) {
                let r = pseudoRandomIntRange(a, b, `seed-${i}`)
                assert.ok(Number.isInteger(r) && r >= a && r <= b, `pseudoRandomIntRange(${a}, ${b}, seed-${i}) -> ${r}`)
            }
        }
    })

    it(`pseudoRandomIntsRange should return integers within [vstart, vend] at every bound, over many seeds`, function() {
        for (let [a, b] of BOUNDS) {
            for (let i = 0; i < 30; i++) {
                let rs = pseudoRandomIntsRange(a, b, 100, `seed-${i}`)
                assert.strict.deepStrictEqual(rs.length, 100)
                for (let r of rs) {
                    assert.ok(Number.isInteger(r) && r >= a && r <= b, `pseudoRandomIntsRange(${a}, ${b}, 100, seed-${i}) -> ${r}`)
                }
            }
        }
    })

    it(`the pseudo random functions should give the same values as before the clamp for ordinary ranges (fixed values taken from the pre-edit sources; the clamp acts only on results beyond vend)`, function() {
        //不含預設種子'start1'(其每次呼叫遞增全域計數, 結果隨行程內先前呼叫而異); 字串種子為確定性, 'BH-01:S-123'之值亦為函數 JSDoc 範例
        assert.strict.deepStrictEqual(pseudoRandomIntRange(123, 4567, 'BH-01:S-123'), 4381)
        assert.strict.deepStrictEqual(pseudoRandomIntRange(-50, 50, 'x'), -18)
        assert.strict.deepStrictEqual(pseudoRandomIntsRange(10, 20, 5, 'abc'), [16, 17, 13, 19, 19])
        assert.strict.deepStrictEqual(pseudoRandomIntsRange(0, 1000, 6, 'seed-9'), [943, 333, 371, 53, 577, 833])
    })

    it(`randomIntsNdpRange should return distinct integers within [vstart, vend] (small ranges at the bound; the range() sampling is exact)`, function() {
        for (let [a, b] of [[MAX - 5, MAX], [-MAX, -MAX + 5], [0, 9], [-3, 3]]) {
            let rs = randomIntsNdpRange(a, b, b - a + 1)
            assert.strict.deepStrictEqual(rs.length, b - a + 1)
            assert.strict.deepStrictEqual(new Set(rs).size, rs.length)
            for (let r of rs) {
                assert.ok(Number.isInteger(r) && r >= a && r <= b, `randomIntsNdpRange(${a}, ${b}) -> ${r}`)
            }
        }
    })

    it(`pseudoRandomIntsNdpRange should return distinct values in the index range for a small range (observed unchanged by this round)`, function() {
        let rs = pseudoRandomIntsNdpRange(0, 9, 10, 'seed')
        assert.strict.deepStrictEqual([...rs].sort((x, y) => x - y), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

})


describe(`rang overflow (ws272c)`, function() {

    it(`should return [] when both ends are valid but the interval overflows to Infinity (formerly an array with Infinity)`, function() {
        assert.strict.deepStrictEqual(rang(-Number.MAX_VALUE, Number.MAX_VALUE), [])
        assert.strict.deepStrictEqual(rang(-Number.MAX_VALUE, Number.MAX_VALUE, 2), [])
        assert.strict.deepStrictEqual(rang(-Number.MAX_VALUE, Number.MAX_VALUE, 10), [])
        assert.strict.deepStrictEqual(rang(-1e308, 1e308, 2), [])
        assert.strict.deepStrictEqual(rang(Number.MAX_VALUE, -Number.MAX_VALUE, 3), [])
        assert.strict.deepStrictEqual(rang('-1.7976931348623157e308', '1.7976931348623157e308'), [])
    })

    it(`should return [] when only the accumulation of the finite interval overflows (the last element becomes Infinity by rounding)`, function() {
        //間隔(rEnd - rStart) / num有限, 但逐次累加(r += dx)之捨入使最末元素超過Number.MAX_VALUE而為Infinity(修前回含Infinity之陣列)
        assert.strict.deepStrictEqual(rang(0, Number.MAX_VALUE, 3), [])
        assert.strict.deepStrictEqual(rang(1e307, Number.MAX_VALUE, 5), [])
        assert.strict.deepStrictEqual(rang(1e307, Number.MAX_VALUE, 9), [])
    })

    it(`should still return the finite array when the interval is large but representable`, function() {
        assert.strict.deepStrictEqual(rang(0, Number.MAX_VALUE, 2), [0, Number.MAX_VALUE / 2, Number.MAX_VALUE])
        assert.strict.deepStrictEqual(rang(-1e308, 0, 2), [-1e308, -5e307, 0])
        assert.strict.deepStrictEqual(rang(1e308, 1e308, 3), [1e308, 1e308, 1e308, 1e308])
        assert.strict.deepStrictEqual(rang(0, 10), [0, 5, 10])
        assert.strict.deepStrictEqual(rang(0, 10, 3), [0, 10 / 3, 20 / 3, 10])
    })

    it(`every element of a non-empty result should be a finite number (property check over seeded random huge ends and counts)`, function() {
        let seed = 272003
        let rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0
            let v = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v
            return ((v ^ (v >>> 14)) >>> 0) / 4294967296
        }
        let big = () => (rnd() < 0.5 ? -1 : 1) * Number.MAX_VALUE * (rnd() < 0.3 ? 1 : rnd())
        let nEmpty = 0
        let nFull = 0
        for (let i = 0; i < 2000; i++) {
            let a = big()
            let b = big()
            let n = 1 + Math.floor(rnd() * 12)
            let r = rang(a, b, n)
            if (r.length === 0) {
                nEmpty++
                continue
            }
            nFull++
            assert.strict.deepStrictEqual(r.length, n + 1)
            for (let v of r) {
                assert.ok(Number.isFinite(v), `rang(${a}, ${b}, ${n}) -> ${r}`)
            }
        }
        assert.ok(nEmpty > 0 && nFull > 0, `both kinds of results should occur: empty ${nEmpty}, full ${nFull}`)
    })

})
