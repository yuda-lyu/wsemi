import assert from 'assert'
import interp1 from '../src/interp1.mjs'
import arrGroupByMaxmin from '../src/arrGroupByMaxmin.mjs'
import arrLookupByMaxmin from '../src/arrLookupByMaxmin.mjs'
import strTruncate from '../src/strTruncate.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'


//第221項第二批第3輪(ws271; 第三級: 先改下游再改wsemi): interp1、arrGroupByMaxmin、arrLookupByMaxmin、strTruncate 改經 isenum／iseint 判定
//  規格: dspec〈輸入參數之檢測機制〉K4(檢測之值即使用之值)、§7.1、§11(使用者2026-11-02裁定: interp1之px陣列無效元素原位{err}且輸出長度恆等於px長度;
//        arrGroupByMaxmin／arrLookupByMaxmin之區間上下限無效即throw、被分組之值無效略過; strTruncate之maxLen為必須參數未給或非預期即throw)
//  規則: R-OPT-VAL-01、R-ENUM-CALLERS-01
//  domFadeIn之opt.duration見 optValG4randDomMisc.test.mjs (與domFadeOut同一探針)


//throwsMsg, f必須throw Error且訊息恰為msg(訊息不帶輸入值, 故以完整字串比對即同時證明不含值)
function throwsMsg(f, msg, label = '') {
    let err = null
    try {
        f()
    }
    catch (e) {
        err = e
    }
    assert.ok(err instanceof Error, `should throw an Error ${label}`)
    assert.strict.deepStrictEqual(err.message, msg, label)
}

//deepStrictEqual對含Symbol等之值不安全顯示, 標題一律用label字串
let SAFE_INT_STR = VALID_STR.filter(([, , n]) => Number.isInteger(n) && n >= 0)


//--- interp1 ---

describe(`optVal interp1 (ws271)`, function() {

    let ps = [
        { x: 1, y: 0.2 },
        { x: 3, y: 1.2 },
        { x: 4, y: 2 },
    ]
    let MODES = ['linear', 'stairs', 'blocks']

    //px元素之形式[x,…]與{x}(JSDoc未載, 現況支援)維持: 取出之x仍以isenum判定; 其餘無效者(含INVALID中除[5]以外全部)原位{err}
    let INVALID_EL = INVALID.filter(([l]) => l !== '[5]')

    //單值之基準結果(同一輸入各自獨立內插)
    let one = (el, mode) => interp1(ps, el, { mode })

    let errAt = (i) => ({ err: `invalid px[${i}]: must be a valid number` })

    for (let mode of MODES) {

        describe(`mode ${mode}`, function() {

            for (let [label, bad] of INVALID_EL) {

                it(`should output { err } in place for invalid px element ${label} (start, middle, end) and keep the length equal to px`, function() {
                    // 對應: 無效元素原位輸出{err}(不帶值), 回傳長度恆等於px長度
                    let r = interp1(ps, [bad, 2, bad, 3, bad], { mode })
                    assert.strict.deepStrictEqual(r.length, 5)
                    assert.strict.deepStrictEqual(r[0], errAt(0))
                    assert.strict.deepStrictEqual(r[1], one(2, mode))
                    assert.strict.deepStrictEqual(r[2], errAt(2))
                    assert.strict.deepStrictEqual(r[3], one(3, mode))
                    assert.strict.deepStrictEqual(r[4], errAt(4))
                })

            }

            it(`should align the output with px when valid, invalid and out-of-range elements are mixed (the err of an invalid element is not the out-of-range err)`, function() {
                let px = [0, 1, Infinity, 2, 'abc', 3, null, 4, '0x10', 5, new Number(2)] // eslint-disable-line no-new-wrappers
                let r = interp1(ps, px, { mode })
                assert.strict.deepStrictEqual(r.length, px.length)
                px.forEach((el, i) => {
                    let ok = typeof el === 'number' && Number.isFinite(el)
                    assert.strict.deepStrictEqual(r[i], ok ? one(el, mode) : errAt(i), `index ${i}`)
                })
            })

            it(`should treat numeric strings as valid px elements (去頭尾空白, 科學記號) and give the same result as the number`, function() {
                for (let [label, s, n] of VALID_STR) {
                    let r = interp1(ps, [s], { mode })
                    assert.strict.deepStrictEqual(r, [one(n, mode)], label)
                    assert.strict.deepStrictEqual(interp1(ps, s, { mode }), one(n, mode), label)
                }
            })

        })

    }

    it(`should return [] for an empty px array and keep the ps-level failures as a single { err } object (unchanged)`, function() {
        assert.strict.deepStrictEqual(interp1(ps, []), [])
        assert.strict.deepStrictEqual(interp1([], [1, Infinity]).err, 'ps(length=0) is not an effective array')
        assert.strict.deepStrictEqual(interp1(ps, undefined), { err: 'px is not a number or an array' })
    })

    it(`should output { err } in place for a hole of a sparse px array (read as undefined)`, function() {
        // eslint-disable-next-line no-sparse-arrays
        let r = interp1(ps, [1, , 3])
        assert.strict.deepStrictEqual(r, [0.2, errAt(1), 1.2])
    })

    it(`should return { err: 'px is not a number or an array' } for an invalid single px (formerly Infinity gave out-of-range and '0x10' was read as 16)`, function() {
        // 對應: px為單值且無效者照現行回{err}
        for (let [label, bad] of INVALID) {
            if (Array.isArray(bad)) {
                continue //陣列為px陣列分支
            }
            assert.strict.deepStrictEqual(interp1(ps, bad), { err: 'px is not a number or an array' }, label)
        }
        assert.strict.deepStrictEqual(interp1(ps, Infinity), { err: 'px is not a number or an array' })
        assert.strict.deepStrictEqual(interp1(ps, '0x10'), { err: 'px is not a number or an array' })
    })

    it(`should keep reading the px element forms [x, …] and { x } (and opt.keyX) as before, judging the x by isenum`, function() {
        assert.strict.deepStrictEqual(interp1(ps, [[3, 'z'], { x: 3 }, [5]]).slice(0, 2), [1.2, 1.2])
        assert.strict.deepStrictEqual(interp1(ps, [{ x: 'Infinity' }, [Infinity], { x: 3 }]), [errAt(0), errAt(1), 1.2])
        let psP = [{ a: 1, b: 0.2 }, { a: 3, b: 1.2 }, { a: 4, b: 2 }]
        assert.strict.deepStrictEqual(interp1(psP, [{ a: 3 }, { x: 3 }, { a: 'Infinity' }], { keyX: 'a', keyY: 'b' }), [1.2, errAt(1), errAt(2)])
    })

    it(`should filter invalid data points of ps (x or y not a valid number) and interpolate with the remaining ones`, function() {
        // 對應: 資料點ps之無效點照現行濾除(以isenum判定)
        let clean = [
            { x: 1, y: 0.2 },
            { x: 3, y: 1.2 },
            { x: 4, y: 2 },
        ]
        let px = [1, 2, 3, 3.5, 4]
        let expected = interp1(clean, px)
        for (let [label, bad] of INVALID) {
            let dirty = [
                { x: 1, y: 0.2 },
                { x: bad, y: 5 },
                { x: 2, y: bad },
                { x: 3, y: 1.2 },
                [bad, 7],
                [8, bad],
                { x: 4, y: 2 },
            ]
            // [x, y]形式之無效點中, bad為[5]時x=[5]非有效數字亦濾除
            assert.strict.deepStrictEqual(interp1(dirty, px), expected, label)
        }
    })

    it(`should accept numeric-string data points and give the same result as the numbers (all modes; multi-digit strings would be ordered wrongly if compared as strings)`, function() {
        let sps = [
            { x: ' 1 ', y: '0.2' },
            { x: '3', y: '1.2' },
            ['4', ' 2 '],
        ]
        let sps2 = [
            { x: '9', y: '90' },
            { x: '10', y: '1e2' },
            ['100', ' 5 '],
        ]
        let ps2 = [
            { x: 9, y: 90 },
            { x: 10, y: 100 },
            { x: 100, y: 5 },
        ]
        for (let mode of MODES) {
            assert.strict.deepStrictEqual(interp1(sps, [1, 2, 3, 3.5, 4], { mode }), interp1(ps, [1, 2, 3, 3.5, 4], { mode }), mode)
            assert.strict.deepStrictEqual(interp1(sps2, [9, 9.5, 10, 50, 100, 101], { mode }), interp1(ps2, [9, 9.5, 10, 50, 100, 101], { mode }), mode)
            assert.strict.deepStrictEqual(interp1(sps2, '50', { mode }), interp1(ps2, 50, { mode }), mode)
        }
    })

    it(`should treat a ps whose points are all non-finite as an ineffective array (the former 'Infinity' points took part and made null)`, function() {
        let r = interp1([{ x: 0, y: 0 }, { x: 1, y: Infinity }, { x: 2, y: 20 }], 1.5)
        assert.strict.deepStrictEqual(r, 15) // (0,0)與(2,20)內插, Infinity點略過
        let r2 = interp1([{ x: 0, y: 0 }, { x: 1, y: '0x10' }, { x: 2, y: 20 }], 1.5)
        assert.strict.deepStrictEqual(r2, 15) // '0x10'點略過(修前當16而得18)
    })

    it(`should keep opt.xMin and opt.xMax on isNumber (not changed in this round): numbers are used, strings are not`, function() {
        let opt = { mode: 'stairs', xMin: 0, xMax: 4.5 }
        assert.strict.deepStrictEqual(interp1(ps, 0, opt), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 4.5, opt), 2)
        let optS = { mode: 'stairs', xMin: '0', xMax: '4.5' }
        assert.strict.deepStrictEqual(interp1(ps, 0, optS).err, 'out of x-range')
    })

    it(`should match the documented examples of the new px behavior`, function() {
        assert.strict.deepStrictEqual(interp1(ps, [1, Infinity, 'abc', 3]), [0.2, errAt(1), errAt(2), 1.2])
        assert.strict.deepStrictEqual(interp1(ps, Infinity), { err: 'px is not a number or an array' })
    })

    it(`should align a randomized mix of valid and invalid px elements (length and positions), oracle = independent single calls`, function() {
        // 31位元LCG, 可重現
        let seed = 20261102
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff
            return seed / 0x7fffffff
        }
        let validPool = [0.5, 1, 2, 2.6, 3, 3.5, 4, 5, '2', ' 3.5 ', '1e0', 0, -1]
        let invalidPool = INVALID_EL.map(([, v]) => v)
        for (let t = 0; t < 300; t++) {
            let n = Math.floor(rnd() * 13)
            let px = []
            let okFlags = []
            for (let i = 0; i < n; i++) {
                if (rnd() < 0.5) {
                    px.push(validPool[Math.floor(rnd() * validPool.length)])
                    okFlags.push(true)
                }
                else {
                    px.push(invalidPool[Math.floor(rnd() * invalidPool.length)])
                    okFlags.push(false)
                }
            }
            let mode = MODES[t % 3]
            let r = interp1(ps, px, { mode })
            assert.strict.deepStrictEqual(r.length, n)
            for (let i = 0; i < n; i++) {
                let exp = okFlags[i] ? one(px[i], mode) : errAt(i)
                assert.strict.deepStrictEqual(r[i], exp, `trial ${t} index ${i}`)
            }
        }
    })

})


//--- arrGroupByMaxmin、arrLookupByMaxmin: 區間上下限 ---

//兩個函數共用之上下限規則; mk(maxmins, opt)回傳呼叫f之結果(arr固定為有效資料)
for (let [name, f] of [['arrGroupByMaxmin', arrGroupByMaxmin], ['arrLookupByMaxmin', arrLookupByMaxmin]]) {

    let isLookup = name === 'arrLookupByMaxmin'

    //資料: GroupBy之arr可為數字或物件, Lookup之arr須為物件陣列
    let arrOk = isLookup ? [{ value: 1 }, { value: 3 }] : [1, 3]

    describe(`optVal ${name} maxmins limits (ws271)`, function() {

        for (let [label, bad] of INVALID) {

            for (let key of ['max', 'min']) {

                it(`should throw "invalid maxmins[1].${key}: must be a valid number" when maxmins[1].${key} is ${label}`, function() {
                    // 對應: 上下限無效即拋錯, 訊息不帶值
                    let mm = [{ min: 0, max: 2 }, { min: 2, max: 5 }]
                    mm[1][key] = bad
                    throwsMsg(() => f(arrOk, mm), `invalid maxmins[1].${key}: must be a valid number`, label)
                })

            }

        }

        it(`should throw for an invalid limit at any index and use the custom key name in the message (opt.keyMax / opt.keyMin)`, function() {
            let mm = [{ rmin: 0, rmax: 2 }, { rmin: 2, rmax: 5 }, { rmin: 5, rmax: Infinity }]
            throwsMsg(() => f(arrOk, mm, { keyMin: 'rmin', keyMax: 'rmax' }), 'invalid maxmins[2].rmax: must be a valid number')
            let mm2 = [{ rmin: 'x', rmax: 2 }]
            throwsMsg(() => f(arrOk, mm2, { keyMin: 'rmin', keyMax: 'rmax' }), 'invalid maxmins[0].rmin: must be a valid number')
        })

        it(`should throw for a missing or null limit and for a non-object maxmins element (formerly the interval was silently skipped)`, function() {
            throwsMsg(() => f(arrOk, [{ min: 0 }]), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f(arrOk, [{ max: 2 }]), 'invalid maxmins[0].min: must be a valid number')
            throwsMsg(() => f(arrOk, [{ min: 0, max: null }]), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f(arrOk, [{ min: 0, max: 2 }, null]), 'invalid maxmins[1].max: must be a valid number')
            throwsMsg(() => f(arrOk, [{ min: 0, max: 2 }, 5]), 'invalid maxmins[1].max: must be a valid number')
        })

        it(`should report keyMax before keyMin and the first bad index when several limits are invalid`, function() {
            throwsMsg(() => f(arrOk, [{ min: 'a', max: 'b' }, { min: 'c', max: 'd' }]), 'invalid maxmins[0].max: must be a valid number')
        })

        it(`should throw whatever arr is (the limits are settings, not data): empty, non-array, no valid value`, function() {
            let bad = [{ min: 0, max: Infinity }]
            throwsMsg(() => f(arrOk, bad), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f([], bad), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f(null, bad), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f('abc', bad), 'invalid maxmins[0].max: must be a valid number')
            throwsMsg(() => f(isLookup ? [{ value: 'x' }] : ['x'], bad), 'invalid maxmins[0].max: must be a valid number')
        })

        it(`should keep returning [] when maxmins is not an effective array (unchanged, even when arr is valid)`, function() {
            for (let mm of [undefined, null, '', [], {}, 'abc', 5]) {
                assert.strict.deepStrictEqual(f(arrOk, mm), [])
            }
        })

        it(`should accept numeric-string limits (去頭尾空白, 科學記號) and use them as numbers`, function() {
            for (let [label, s, n] of VALID_STR) {
                let mm = [{ min: s, max: '1e3' }]
                let mmN = [{ min: n, max: 1000 }]
                let arr = isLookup ? [{ value: n }, { value: n - 1 }, { value: 500 }] : [n, n - 1, 500]
                let r = f(arr, mm)
                let rN = f(arr, mmN)
                // 兩者結果之items元素數相同(Lookup之items內為原mm, 故只比數量與命中位置)
                let shape = (rr) => rr.map((o) => (o.items === undefined ? null : o.items.length))
                assert.strict.deepStrictEqual(shape(r), shape(rN), label)
            }
        })

        it(`should work with finite extreme limits for "no lower/upper limit" (the user gives them), e.g. -1e20 / 1e20 and Number.MAX_VALUE`, function() {
            let arrBig = isLookup ? [{ value: -1e19 }, { value: 7 }, { value: 1e19 }] : [-1e19, 7, 1e19]
            let r = f(arrBig, [{ min: -1e20, max: 1e20 }])
            if (isLookup) {
                assert.strict.deepStrictEqual(r.map((o) => o.items.length), [1, 1, 1])
            }
            else {
                assert.strict.deepStrictEqual(r[0].items, [-1e19, 7, 1e19])
            }
            let r2 = f(arrBig, [{ min: -Number.MAX_VALUE, max: Number.MAX_VALUE }])
            if (isLookup) {
                assert.strict.deepStrictEqual(r2.map((o) => o.items.length), [1, 1, 1])
            }
            else {
                assert.strict.deepStrictEqual(r2[0].items, [-1e19, 7, 1e19])
            }
        })

        it(`should use the checked value of a limit (K4): a getter returning a valid value only on its first read is not re-read per element`, function() {
            let reads = 0
            let mm = [{
                min: 0,
                get max() {
                    reads++
                    return reads === 1 ? 5 : 'abc'
                },
            }]
            let r = f(isLookup ? [{ value: 1 }, { value: 2 }, { value: 3 }] : [1, 2, 3], mm)
            if (isLookup) {
                assert.strict.deepStrictEqual(r.map((o) => o.items.length), [1, 1, 1])
            }
            else {
                assert.strict.deepStrictEqual(r[0].items, [1, 2, 3])
            }
        })

        it(`should keep maxType and minType semantics (</<= and >/>=) on boundaries`, function() {
            // 區間A: [0,2) 區間B: (2,5]; 2不屬於任一區間
            let arr = isLookup ? [{ value: 0 }, { value: 2 }, { value: 5 }] : [0, 2, 5]
            let r = f(arr, [{ min: 0, max: 2, maxType: '<' }, { min: 2, max: 5, minType: '>' }])
            if (isLookup) {
                assert.strict.deepStrictEqual(r.map((o) => (o.items === undefined ? null : o.items.length)), [1, null, 1])
            }
            else {
                assert.strict.deepStrictEqual(r.map((o) => o.items), [[0], [5]])
            }
        })

    })

}


//--- arrGroupByMaxmin: 被分組之值 ---

describe(`optVal arrGroupByMaxmin values (ws271)`, function() {

    let mm = [{ min: 0, max: 2 }, { min: 2, max: 5, minType: '>' }]

    for (let [label, bad] of INVALID) {

        it(`should skip an element whose value is ${label} (as the element itself or as its value field) and group the valid ones`, function() {
            // 對應: 被分組之值無效者照現行略過該筆
            let arr = [bad, 1, { value: bad }, { value: 3 }, { value: '4' }, { other: bad }]
            let r = arrGroupByMaxmin(arr, mm)
            assert.strict.deepStrictEqual(r[0].items, [1])
            assert.strict.deepStrictEqual(r[1].items, [{ value: 3 }, { value: '4' }])
        })

    }

    it(`should skip isnum-accepted but non-enum values that fall INSIDE an interval ('0x3', '0o3', '0b11', '1e-400', wrapper objects), which the former cdbl-based code grouped`, function() {
        let inside = [new Number(1), new String('3'), '0x3', '0o3', '0b11', '1e-400', '-1e-400'] // eslint-disable-line no-new-wrappers
        let r = arrGroupByMaxmin([...inside, ...inside.map((v) => ({ value: v })), 1], mm)
        assert.strict.deepStrictEqual(r[0].items, [1])
        assert.strict.deepStrictEqual(r[1].items, undefined)
    })

    it(`should group numeric-string elements and values with the original element kept (去頭尾空白, 科學記號)`, function() {
        let r = arrGroupByMaxmin(['1', ' 3 ', '1e0', { value: '4.5' }, { value: ' 0.5 ' }], mm)
        assert.strict.deepStrictEqual(r[0].items, ['1', '1e0', { value: ' 0.5 ' }])
        assert.strict.deepStrictEqual(r[1].items, [' 3 ', { value: '4.5' }])
    })

    it(`should no longer group Infinity, '0x10' and wrapper objects (formerly cdbl turned them into 1.8e308 / 16 / the wrapped value)`, function() {
        let big = [{ min: 5, max: 1e20 }]
        let r = arrGroupByMaxmin([Infinity, '0x10', new Number(7), 100], big) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(r[0].items, [100])
    })

    it(`should prefer the keyValue field when valid and fall back to the element itself only when the field is not a valid number`, function() {
        // 欄位有效則用欄位; 欄位無效但元素本身為有效數字(如String物件非有效)時用元素 — 元素為物件時無從取值而略過
        let r = arrGroupByMaxmin([{ value: 1 }, { value: 'x' }, { value: 4, extra: 100 }], mm)
        assert.strict.deepStrictEqual(r[0].items, [{ value: 1 }])
        assert.strict.deepStrictEqual(r[1].items, [{ value: 4, extra: 100 }])
    })

    it(`should honor opt.keyValue / opt.keyItems and leave intervals without members without the items key`, function() {
        let r = arrGroupByMaxmin([{ data: 1 }, { data: 'x' }, { data: Infinity }], mm, { keyValue: 'data', keyItems: 'res' })
        assert.strict.deepStrictEqual(r, [{ min: 0, max: 2, res: [{ data: 1 }] }, { min: 2, max: 5, minType: '>' }])
    })

    it(`should return a fresh copy of maxmins (the input maxmins is not modified)`, function() {
        let before = JSON.stringify(mm)
        arrGroupByMaxmin([1, 3], mm)
        assert.strict.deepStrictEqual(JSON.stringify(mm), before)
    })

})


//--- arrLookupByMaxmin: 查找值 ---

describe(`optVal arrLookupByMaxmin values (ws271)`, function() {

    let mm = [{ name: 'A', min: 0, max: 2 }, { name: 'B', min: 2, max: 5, minType: '>' }]

    for (let [label, bad] of INVALID) {

        it(`should skip (no items key) an element whose value is ${label} and look up the valid ones`, function() {
            // 對應: 查找值無效時照其現行失敗通道(該筆不添加keyItems)
            let arr = [{ value: bad }, { value: 1 }, { value: '4' }, { other: 1 }]
            let r = arrLookupByMaxmin(arr, mm)
            assert.strict.deepStrictEqual(r.map((o) => (o.items === undefined ? null : o.items.map((m) => m.name))), [null, ['A'], ['B'], null])
        })

    }

    it(`should skip isnum-accepted but non-enum values that fall INSIDE an interval ('0x3', '0o3', '0b11', '1e-400', wrapper objects), which the former cdbl-based code looked up`, function() {
        let inside = [new Number(1), new String('3'), '0x3', '0o3', '0b11', '1e-400', '-1e-400'] // eslint-disable-line no-new-wrappers
        let r = arrLookupByMaxmin([...inside.map((v) => ({ value: v })), { value: 1 }], mm)
        assert.strict.deepStrictEqual(r.map((o) => (o.items === undefined ? null : o.items.map((m) => m.name))), [null, null, null, null, null, null, null, ['A']])
    })

    it(`should not call opt.beforeAddResult for an invalid value and call it with (mm, element, index) for a valid one`, function() {
        let calls = []
        let r = arrLookupByMaxmin([{ value: Infinity }, { value: 1 }, { value: '0x10' }, { value: 3 }], mm, {
            beforeAddResult: (m, el, k) => {
                calls.push([m.name, el.value, k])
                return m.name
            },
        })
        assert.strict.deepStrictEqual(calls, [['A', 1, 1], ['B', 3, 3]])
        assert.strict.deepStrictEqual(r.map((o) => o.items), [undefined, ['A'], undefined, ['B']])
    })

    it(`should return [] when arr is not an object array (unchanged) and numeric-string values are looked up`, function() {
        assert.strict.deepStrictEqual(arrLookupByMaxmin([1, 2, 3], mm), [])
        let r = arrLookupByMaxmin([{ value: ' 1 ' }, { value: '1e0' }], mm)
        assert.strict.deepStrictEqual(r.map((o) => o.items.map((m) => m.name)), [['A'], ['A']])
    })

    it(`should honor opt.keyValue / opt.keyItems and not modify the input arr`, function() {
        let arr = [{ data: 1 }, { data: 'x' }]
        let before = JSON.stringify(arr)
        let r = arrLookupByMaxmin(arr, mm, { keyValue: 'data', keyItems: 'res' })
        assert.strict.deepStrictEqual(r.map((o) => (o.res === undefined ? null : o.res.map((m) => m.name))), [['A'], null])
        assert.strict.deepStrictEqual(JSON.stringify(arr), before)
    })

})


//--- strTruncate: maxLen ---

describe(`optVal strTruncate maxLen (ws271)`, function() {

    let MSG = 'invalid maxLen: must be a non-negative integer'

    for (let [label, bad] of INVALID) {

        it(`should throw for maxLen ${label} (a required parameter), with a message without the value`, function() {
            // 對應: maxLen為必須參數, 未給或非預期即拋錯; 訊息不帶值
            throwsMsg(() => strTruncate('abcdefghij', bad), MSG, label)
            throwsMsg(() => strTruncate('abcdefghij', bad, { funWithMsg: () => 'x' }), MSG, label)
        })

    }

    it(`should throw for a missing maxLen and for out-of-range or non-integer numbers (negative, decimal, over 4294967295, unsafe)`, function() {
        throwsMsg(() => strTruncate('abcdefghij'), MSG)
        for (let bad of [-1, -0.5, 1.5, '-1', '1.5', ' -3 ', 4294967296, '4294967296', 2 ** 53, 1e21, '1e21']) {
            throwsMsg(() => strTruncate('abcdefghij', bad), MSG, String(bad))
        }
    })

    it(`should return '' for an ineffective str before checking maxLen (str check first)`, function() {
        for (let s of [null, undefined, '', 123, ['a'], { a: 1 }, true]) {
            assert.strict.deepStrictEqual(strTruncate(s, 'abc'), '')
            assert.strict.deepStrictEqual(strTruncate(s, -1), '')
            assert.strict.deepStrictEqual(strTruncate(s), '')
            assert.strict.deepStrictEqual(strTruncate(s, 3), '')
        }
    })

    it(`should accept valid integer strings as maxLen and give the same result as the number`, function() {
        for (let [label, s, n] of SAFE_INT_STR) {
            let str = 'x'.repeat(40)
            assert.strict.deepStrictEqual(strTruncate(str, s), strTruncate(str, n), label)
        }
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', ' 3 '), 'abc...')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', '3'), 'abc...')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', '1e1'), 'abcdefghij')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', '+3.'), 'abc...')
    })

    it(`should accept 0 and the count upper bound 4294967295`, function() {
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', 0), '...')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', '0'), '...')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', 4294967295), 'abcdefghij')
        assert.strict.deepStrictEqual(strTruncate('abcdefghij', '4294967295'), 'abcdefghij')
    })

    it(`should give opt.funWithMsg the converted number maxLen (not the string) and keep truncating by characters`, function() {
        let got = []
        strTruncate('abcdefghij', ' 3 ', {
            funWithMsg: (str, maxLen) => {
                got.push([str, maxLen, typeof maxLen])
                return ''
            },
        })
        assert.strict.deepStrictEqual(got, [['abcdefghij', 3, 'number']])
        assert.strict.deepStrictEqual(strTruncate('中文測試字串', '2'), '中文...')
    })

    it(`should keep cutting at the boundaries (length equal / one over / one under) unchanged`, function() {
        assert.strict.deepStrictEqual(strTruncate('abcde', 5), 'abcde')
        assert.strict.deepStrictEqual(strTruncate('abcdef', 5), 'abcde...')
        assert.strict.deepStrictEqual(strTruncate('abcd', 5), 'abcd')
    })

})
