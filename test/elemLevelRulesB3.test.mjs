import assert from 'assert'
import fs from 'fs'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import keysmat2ltdt from '../src/keysmat2ltdt.mjs'
import mat2ltdt from '../src/mat2ltdt.mjs'
import strFindSimilar from '../src/strFindSimilar.mjs'
import ltdtkeys2mat from '../src/ltdtkeys2mat.mjs'
import ltdtkeysheads2mat from '../src/ltdtkeysheads2mat.mjs'
import ltdtDiff from '../src/ltdtDiff.mjs'
import arrDiff from '../src/arrDiff.mjs'
import matDiff from '../src/matDiff.mjs'
import ltdtpull from '../src/ltdtpull.mjs'
import matConcat from '../src/matConcat.mjs'
import matat from '../src/matat.mjs'
import arrAt from '../src/arrAt.mjs'
import istimeTZ from '../src/istimeTZ.mjs'
import istimemsTZ from '../src/istimemsTZ.mjs'
import parseNumOpt from '../src/_numOpt.mjs'


//規格: 排程第430項第三批, 使用者2026-11-15逐函數裁定(主控任務20261115170127之裁定表一～十四); dspec〈輸入參數之檢測機制〉§11〈第三批〉、§4(opt.debug)、§6(訊息只含索引不含值)
//每個describe對應裁定表之一節, 每個it對應該節之一列(標題前綴〈節-列〉), 期望值取自裁定表之文字, 不取自實作之輸出


let S = { returnWithStateAndMsg: true }
let LEAK = 'LEAK-MARK-5207'
let EMPTY_SIM = { ratings: [], bestMatch: null, bestMatchIndex: -1 }


//captureConsole, 執行fn期間攔截console之log、warn、error、info, 回傳{ r, outs }
let captureConsole = (fn) => {
    let names = ['log', 'warn', 'error', 'info']
    let olds = {}
    let outs = []
    for (let n of names) {
        olds[n] = console[n]
        console[n] = (...args) => {
            outs.push({ n, args })
        }
    }
    let r
    try {
        r = fn()
    }
    finally {
        for (let n of names) {
            console[n] = olds[n]
        }
    }
    return { r, outs }
}


//throwsMsg, 斷言fn同步拋出Error且訊息恰為msg
let throwsMsg = (fn, msg) => {
    assert.throws(fn, (err) => {
        assert.ok(err instanceof Error)
        assert.strict.strictEqual(err.message, msg)
        return true
    })
}


//getDoc, 取src檔之主JSDoc區塊(含@memberOf wsemi者)
let getDoc = (name) => {
    let c = fs.readFileSync(fileURLToPath(new URL(`../src/${name}.mjs`, import.meta.url)), 'utf8')
    let k = c.indexOf('@memberOf wsemi')
    let i = c.lastIndexOf('/**', k)
    let j = c.indexOf('*/', k)
    return c.slice(i, j)
}


//hole, 建立含空位之陣列
let holed = (n, fill) => {
    let a = new Array(n)
    for (let [i, v] of fill) {
        a[i] = v
    }
    return a
}


describe(`裁定表〈一〉keysmat2ltdt`, function() {

    it(`〈一-1〉should be invalid (default [], state mode error with row[i]) when any row (not only the first) is not an array or is []`, function() {
        for (let [lb, row] of [['null', null], [`'xy'`, 'xy'], ['{}', {}], ['5', 5], ['[]', []]]) {
            assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], [[1, 2], row]), [], lb)
            assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], [[1, 2], row], S), { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' }, lb)
        }
        let h = holed(3, [[0, [1, 2]], [2, [3, 4]]])
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], h, S), { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' })
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], [null, [1, 2]], S), { state: 'error', msg: 'invalid mat[0]: must be a non-empty array' })
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[1], [LEAK], LEAK], S).msg.includes(LEAK), false)
    })

    it(`〈一-2〉should treat a row of one empty element ([''], [null], [{}]) as a valid row, the first row and the other rows alike`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [['']]), [{ a: '' }])
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[null]]), [{ a: null }])
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[{}]]), [{ a: {} }])
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[1], [''], [null], [{}]]), [{ a: 1 }, { a: '' }, { a: null }, { a: {} }])
    })

    it(`〈一-3〉should fill '' when a row is shorter than keys (JSDoc)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b', 'c'], [[1]]), [{ a: 1, b: '', c: '' }])
        assert.ok(getDoc('keysmat2ltdt').includes(`列短於keys時缺少之欄補''`))
    })

    it(`〈一-4〉should drop the extra values when a row is longer than keys (JSDoc)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[1, 2, 3]]), [{ a: 1 }])
        assert.ok(getDoc('keysmat2ltdt').includes(`列長於keys時多出之值丟棄`))
    })

    it(`〈一-5〉should warn once per process with the row index and both lengths (no values) when opt.debug is true and the length differs`, function() {
        parseNumOpt.resetWarned()
        let got = []
        let funLog = (m, info) => got.push([m, info])
        let c1 = captureConsole(() => keysmat2ltdt(['a', 'b'], [[1, 2], [LEAK]], { debug: true, funLog }))
        assert.strict.deepStrictEqual(c1.r, [{ a: 1, b: 2 }, { a: LEAK, b: '' }])
        assert.strict.deepStrictEqual(c1.outs.length, 0)
        assert.strict.deepStrictEqual(got.length, 1)
        assert.ok(got[0][0].includes('mat[1]'), got[0][0])
        assert.ok(got[0][0].includes('row 1') && got[0][0].includes('keys 2'), got[0][0])
        assert.ok(!got[0][0].includes(LEAK), got[0][0])
        assert.strict.deepStrictEqual(got[0][1], { fn: 'keysmat2ltdt', reason: 'length', key: 'mat' })
        //同原因每行程一次
        keysmat2ltdt(['a', 'b'], [[1, 2, 3]], { debug: true, funLog })
        assert.strict.deepStrictEqual(got.length, 1)
        //未給funLog則經console.warn; debug非true不提示
        parseNumOpt.resetWarned()
        let c2 = captureConsole(() => keysmat2ltdt(['a', 'b'], [[1]], { debug: true }))
        assert.strict.deepStrictEqual(c2.outs.length, 1)
        assert.strict.deepStrictEqual(c2.outs[0].n, 'warn')
        parseNumOpt.resetWarned()
        for (let opt of [undefined, null, {}, { debug: 'true' }, { debug: 1 }]) {
            let c3 = captureConsole(() => keysmat2ltdt(['a', 'b'], [[1]], opt))
            assert.strict.deepStrictEqual(c3.outs.length, 0)
        }
        //長度相同時不讀debug、不提示
        parseNumOpt.resetWarned()
        let c4 = captureConsole(() => keysmat2ltdt(['a', 'b'], [[1, 2]], { debug: true }))
        assert.strict.deepStrictEqual(c4.outs.length, 0)
        parseNumOpt.resetWarned()
    })

    it(`〈一-6〉should fill '' for undefined values and holes in a row (JSDoc)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b', 'c'], [[undefined, holed(2, [[0, 1]])[1], 3]]), [{ a: '', b: '', c: 3 }])
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], [holed(2, [[1, 2]])]), [{ a: '', b: 2 }])
        assert.ok(getDoc('keysmat2ltdt').includes(`值為undefined或列內空位補''`))
    })

    it(`〈一-7〉should treat a function value as null (not called, not copied)`, function() {
        let called = 0
        let f = () => {
            called++
            return 1
        }
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'b'], [[f, 1]]), [{ a: null, b: 1 }])
        assert.strict.deepStrictEqual(called, 0)
    })

    it(`〈一-8〉should skip a key of '', null, undefined, hole, object, array, boolean, Symbol or non-finite number together with its value, keeping the other positions`, function() {
        let keys = ['a', '', null, undefined, {}, [], true, Symbol('s'), NaN, Infinity, -Infinity, 'b']
        let row = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        assert.strict.deepStrictEqual(keysmat2ltdt(keys, [row]), [{ a: 0, b: 11 }])
        let kh = holed(3, [[0, 'a'], [2, 'c']])
        assert.strict.deepStrictEqual(keysmat2ltdt(kh, [[1, 2, 3]]), [{ a: 1, c: 3 }])
    })

    it(`〈一-9〉should treat a finite number key as a string (JSDoc)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt([1, 'a', 2.5], [[10, 20, 30]]), [{ '1': 10, 'a': 20, '2.5': 30 }])
        assert.ok(getDoc('keysmat2ltdt').includes('有限數字視同字串'))
    })

    it(`〈一-10〉should let the later of duplicate keys overwrite the former (JSDoc)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a', 'a'], [[1, 2]]), [{ a: 2 }])
        assert.ok(getDoc('keysmat2ltdt').includes('keys重複時後者覆蓋前者'))
    })

    it(`〈一-11〉should treat keys as invalid ([] or state invalid keys) when all of them are skipped`, function() {
        for (let keys of [[null, ''], [{}, []], [true, NaN]]) {
            assert.strict.deepStrictEqual(keysmat2ltdt(keys, [[1, 2]]), [])
            assert.strict.deepStrictEqual(keysmat2ltdt(keys, [[1, 2]], S), { state: 'error', msg: 'invalid keys: must contain at least one non-empty string or finite number' })
        }
    })

    it(`〈一-12〉should keep the other behaviors (invalid keys/mat at the parameter level, mat [], __proto__ and length keys, non-boolean returnWithStateAndMsg)`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt('a', [[1]], S), { state: 'error', msg: 'invalid keys: must be a non-empty array' })
        assert.strict.deepStrictEqual(keysmat2ltdt([], [[1]], S), { state: 'error', msg: 'invalid keys: must be a non-empty array' })
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], 'x', S), { state: 'error', msg: 'invalid mat: must be an array' })
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [], S), { state: 'success', msg: [] })
        let r = keysmat2ltdt(['__proto__', 'length'], [[1, 2]])
        assert.strict.deepStrictEqual(Object.keys(r[0]), ['__proto__', 'length'])
        assert.strict.deepStrictEqual(Object.getPrototypeOf(r[0]), Object.prototype)
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], [[1]], { returnWithStateAndMsg: 'true' }), [{ a: 1 }])
    })

    it(`〈一-13〉(downstream) mat2ltdt checks every row before keysmat2ltdt, so it is not affected by the row check`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1], [2]]), [{ a: 1 }, { a: 2 }])
    })

})


describe(`裁定表〈二〉mat2ltdt`, function() {

    it(`〈二-1〉should return success [] when mat has only the header row`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a', 'b']], S), { state: 'success', msg: [] })
        assert.strict.deepStrictEqual(mat2ltdt([['a', 'b']]), [])
    })

    it(`〈二-2〉should keep the error when any row is invalid, with the row index of mat (invalid mat[i]: must be a non-empty array)`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1], null], S), { state: 'error', msg: 'invalid mat[2]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt([['a'], []], S), { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt([['a'], 'xy'], S), { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt(holed(3, [[0, ['a']], [2, [1]]]), S), { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt([{ a: 1 }, [1]], S), { state: 'error', msg: 'invalid mat[0]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt([[]], S), { state: 'error', msg: 'invalid mat[0]: must be a non-empty array' })
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1], null]), [])
    })

    it(`〈二-3〉should treat a row of one empty element ([''], [null]) as a valid row, at any row`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a'], ['']]), [{ a: '' }])
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [null]]), [{ a: null }])
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1], [null]]), [{ a: 1 }, { a: null }])
    })

    it(`〈二-4〉should keep filling '' and dropping extra values, and warn with the row index of mat when opt.debug is true`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a', 'b'], [1], [1, 2, 3]]), [{ a: 1, b: '' }, { a: 1, b: 2 }])
        parseNumOpt.resetWarned()
        let got = []
        mat2ltdt([['a', 'b'], [1, 2], [LEAK]], { debug: true, funLog: (m, info) => got.push([m, info]) })
        assert.strict.deepStrictEqual(got.length, 1)
        assert.ok(got[0][0].includes('mat[2]'), got[0][0]) //列號以mat計(表頭為第0列)
        assert.ok(got[0][0].includes('row 1') && got[0][0].includes('2'), got[0][0])
        assert.ok(!got[0][0].includes(LEAK), got[0][0])
        assert.strict.deepStrictEqual(got[0][1].fn, 'mat2ltdt')
        parseNumOpt.resetWarned()
    })

    it(`〈二-5〉should follow keysmat2ltdt for function values and the header elements (skip, finite numbers, duplicates, all invalid → keysmat2ltdt: invalid keys: must contain at least one non-empty string or finite number)`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [() => 1]]), [{ a: null }])
        assert.strict.deepStrictEqual(mat2ltdt([['a', null, 1, 'a'], [1, 2, 3, 4]]), [{ 'a': 4, '1': 3 }])
        assert.strict.deepStrictEqual(mat2ltdt([[null, ''], [1, 2]], S), { state: 'error', msg: 'keysmat2ltdt: invalid keys: must contain at least one non-empty string or finite number' })
        assert.strict.deepStrictEqual(mat2ltdt([[null], [1]], S), { state: 'error', msg: 'keysmat2ltdt: invalid keys: must contain at least one non-empty string or finite number' })
    })

    it(`〈二-6〉JSDoc should say the header elements are strings or finite numbers, others skipped`, function() {
        let d = getDoc('mat2ltdt')
        assert.ok(d.includes('表頭(mat第1列)之元素為字串或有限數字'), d)
        assert.ok(!d.includes('第1行需為字串陣列'))
    })

    it(`〈二-7〉should keep the other behaviors (normal, [], non-array, {0:1}, __proto__, non-boolean returnWithStateAndMsg, opt null)`, function() {
        assert.strict.deepStrictEqual(mat2ltdt([['a', 'b'], [12, 34.56], ['x', '12.34']]), [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }])
        assert.strict.deepStrictEqual(mat2ltdt([], S), { state: 'success', msg: [] })
        assert.strict.deepStrictEqual(mat2ltdt('x', S), { state: 'error', msg: 'invalid mat: must be an array' })
        assert.strict.deepStrictEqual(mat2ltdt({ 0: 1 }, S), { state: 'error', msg: 'invalid mat: must be an array' })
        let r = mat2ltdt([['__proto__'], [1]])
        assert.strict.deepStrictEqual(Object.keys(r[0]), ['__proto__'])
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1]], { returnWithStateAndMsg: 1 }), [{ a: 1 }])
        assert.strict.deepStrictEqual(mat2ltdt([['a'], [1]], null), [{ a: 1 }])
    })

})


describe(`裁定表〈三〉strFindSimilar`, function() {

    it(`〈三-1〉should return the same-shaped empty result { ratings: [], bestMatch: null, bestMatchIndex: -1 } when a parameter is invalid`, function() {
        for (let ar of ['', null, NaN, true, false, [], [''], [{}]]) {
            assert.strict.deepStrictEqual(strFindSimilar(ar, ['abc']), EMPTY_SIM, String(ar))
        }
        for (let ks of [[], null, NaN]) {
            assert.strict.deepStrictEqual(strFindSimilar('abc', ks), EMPTY_SIM, String(ks))
        }
    })

    it(`〈三-2〉should join only strings and finite numbers of an array ar (others skipped), and be invalid when the join is empty`, function() {
        assert.strict.deepStrictEqual(strFindSimilar(['ab', { x: 1 }, null, 'c'], ['abc']).ratings, [{ target: 'abc', rating: 1 }])
        assert.strict.deepStrictEqual(strFindSimilar([12, 'ab'], ['12ab']).ratings, [{ target: '12ab', rating: 1 }])
        assert.strict.deepStrictEqual(strFindSimilar([{}, null, true], ['[object Object]']), EMPTY_SIM)
    })

    it(`〈三-3〉should be invalid when ar is blank after removing whitespace`, function() {
        assert.strict.deepStrictEqual(strFindSimilar('   ', ['   ']), EMPTY_SIM)
        assert.strict.deepStrictEqual(strFindSimilar(['  ', ' '], ['  ']), EMPTY_SIM)
    })

    it(`〈三-4〉should treat strkeys [''] as one candidate`, function() {
        assert.strict.deepStrictEqual(strFindSimilar('abc', ['']), { ratings: [{ target: '', rating: 0 }], bestMatch: null, bestMatchIndex: -1 })
    })

    it(`〈三-5〉should rate 0 and keep the original target for null, undefined, hole, object, array, boolean and NaN; null target for a function; aligned with the input`, function() {
        let o = { a: 1 }
        let arr = [1]
        let f = () => 'abc'
        let ks = holed(9, [[0, null], [1, undefined], [3, o], [4, arr], [5, true], [6, NaN], [7, f], [8, 'abd']])
        let r = strFindSimilar('abc', ks)
        assert.strict.deepStrictEqual(r.ratings.length, 9)
        assert.strict.deepStrictEqual(r.ratings.slice(0, 8), [
            { target: null, rating: 0 },
            { target: undefined, rating: 0 },
            { target: undefined, rating: 0 },
            { target: o, rating: 0 },
            { target: arr, rating: 0 },
            { target: true, rating: 0 },
            { target: NaN, rating: 0 },
            { target: null, rating: 0 },
        ])
        assert.strictEqual(r.ratings[3].target, o)
        assert.strict.deepStrictEqual(r.bestMatchIndex, 8)
        assert.strict.deepStrictEqual(r.bestMatch, r.ratings[8])
    })

    it(`〈三-6〉should compare a finite number candidate as a string and keep the number as the target`, function() {
        let r = strFindSimilar('12345', [12345, 99])
        assert.strict.deepStrictEqual(r.ratings, [{ target: 12345, rating: 1 }, { target: 99, rating: 0 }])
        assert.strict.deepStrictEqual(r.bestMatch, { target: 12345, rating: 1 })
    })

    it(`〈三-7〉should return bestMatch null and bestMatchIndex -1 when all ratings are 0`, function() {
        assert.strict.deepStrictEqual(strFindSimilar('abc', ['xyz', 'qq']), { ratings: [{ target: 'xyz', rating: 0 }, { target: 'qq', rating: 0 }], bestMatch: null, bestMatchIndex: -1 })
    })

    it(`〈三-8〉JSDoc should state finite numbers as strings, array ar joins strings and finite numbers, the first of ties, case sensitive, bigrams, whitespace ignored`, function() {
        let d = getDoc('strFindSimilar')
        for (let s of ['有限數字當字串比對', '只串接其中之字串與有限數字', '同分取第一個', '區分大小寫', '以兩字元為單位', '單一字元對其他字串得0', '比對時忽略空白']) {
            assert.ok(d.includes(s), s)
        }
        //行為對照: 同分取第一個、區分大小寫、單一字元得0、忽略空白
        assert.strict.deepStrictEqual(strFindSimilar('abcd', ['abcd', 'abcd']).bestMatchIndex, 0)
        assert.strict.deepStrictEqual(strFindSimilar('abc', ['ABC']).ratings[0].rating, 0)
        assert.strict.deepStrictEqual(strFindSimilar('abc', ['a']).ratings[0].rating, 0)
        assert.strict.deepStrictEqual(strFindSimilar('a b c', ['abc']).ratings[0].rating, 1)
    })

    it(`〈三-9〉should keep the other behaviors (normal comparison, a single string or number strkeys, '' and blank candidates rate 0)`, function() {
        let r = strFindSimilar('The Woodman(樵夫) set to work at once, and so...', ['Wodooman(樵夫)', 'manWood(樵夫)', 'Wood樵man(夫)', 'Woodman(樵夫)'])
        assert.strict.deepStrictEqual(r.bestMatchIndex, 3)
        assert.strict.deepStrictEqual(r.bestMatch, { target: 'Woodman(樵夫)', rating: 0.425531914893617 })
        assert.strict.deepStrictEqual(strFindSimilar('abc', 'abd').ratings, [{ target: 'abd', rating: 0.5 }])
        assert.strict.deepStrictEqual(strFindSimilar('123', 123).ratings, [{ target: '123', rating: 1 }])
        assert.strict.deepStrictEqual(strFindSimilar('abc', ['', '   ', 'abc']).ratings, [{ target: '', rating: 0 }, { target: '   ', rating: 0 }, { target: 'abc', rating: 1 }])
    })

})


describe(`裁定表〈四〉ltdtkeys2mat`, function() {

    it(`〈四-1〉should treat {} (including [{}]) and an object with only inherited keys as a valid row, giving empty for each column`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{}], ['a'], S), { state: 'success', msg: [['']] })
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, {}, Object.create({ a: 1 })], ['a']), [[1], [''], ['']])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, {}], null, { empty: '-' }), [[1], ['-']])
    })

    it(`〈四-2〉should keep the error for a non-object row (null, array, string), with the row index`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, null], ['a'], S), { state: 'error', msg: 'invalid ltdt[1]: must be an object' })
        assert.strict.deepStrictEqual(ltdtkeys2mat([[1], { a: 1 }], ['a'], S), { state: 'error', msg: 'invalid ltdt[0]: must be an object' })
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, { a: 2 }, LEAK], ['a'], S), { state: 'error', msg: 'invalid ltdt[2]: must be an object' })
        assert.strict.deepStrictEqual(ltdtkeys2mat(holed(2, [[0, { a: 1 }]]), ['a'], S), { state: 'error', msg: 'invalid ltdt[1]: must be an object' })
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, null], ['a']), [])
    })

    it(`〈四-3〉should extract keys from ltdt when keys is null, undefined or [] (JSDoc)`, function() {
        for (let keys of [null, undefined, []]) {
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1, b: 2 }, { c: 3 }], keys), [[1, 2, ''], ['', '', 3]])
        }
        assert.ok(getDoc('ltdtkeys2mat').includes('keys為null、undefined或[]時由ltdt提取'))
    })

    it(`〈四-4〉should treat keys as invalid when it is not an array ('a' etc.) or all of the given elements are invalid ([''], [{}], [['a']])`, function() {
        for (let keys of ['a', 5, {}, { a: 1 }, true, [''], [{}], [['a']]]) {
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], keys), [], JSON.stringify(keys))
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], keys, S), { state: 'error', msg: Array.isArray(keys) ? 'invalid keys: must contain at least one non-empty string or finite number' : 'invalid keys: must be an array' }, JSON.stringify(keys))
        }
    })

    it(`〈四-5〉should skip invalid key elements, treat finite numbers as strings and make duplicate columns for duplicate keys (JSDoc)`, function() {
        let keys = ['a', '', null, undefined, {}, [], true, Symbol('s'), NaN, Infinity, 'b']
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ 'a': 1, 'b': 2, '': 9, 'null': 9, 'true': 9, 'NaN': 9 }], keys), [[1, 2]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ 1: 'x', a: 'y' }], [1, 'a', 'a']), [['x', 'y', 'y']])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], holed(2, [[1, 'a']])), [[1]])
        assert.ok(getDoc('ltdtkeys2mat').includes('重複之鍵產生重複之欄'))
    })

    it(`〈四-6〉should read only own keys (no inherited toString, no path parsing)`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], ['toString', 'a']), [['', 1]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ 'a': { b: 1 }, 'a.b': 2 }], ['a.b']), [[2]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: { b: 1 } }], ['a.b']), [['']])
        assert.strict.deepStrictEqual(ltdtkeys2mat([Object.create({ a: 1 })], ['a']), [['']])
    })

    it(`〈四-7〉should give opt.empty for an own key whose value is undefined, same as a missing key`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: undefined, b: 1 }], ['a', 'b'], { empty: 'E' }), [['E', 1]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: undefined, b: 1 }], ['a', 'b']), [['', 1]])
    })

    it(`〈四-8〉should turn NaN, Infinity and -Infinity into the strings 'NaN', 'Infinity', '-Infinity'`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: NaN, b: Infinity, c: -Infinity }], ['a', 'b', 'c']), [['NaN', 'Infinity', '-Infinity']])
    })

    it(`〈四-9〉should treat a function value as null, giving 'null'`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: () => 1 }], ['a']), [['null']])
    })

    it(`〈四-10〉should give a Date as the ISO string without quotes`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: new Date(Date.UTC(2026, 10, 15, 1, 2, 3, 4)) }], ['a']), [['2026-11-15T01:02:03.004Z']])
    })

    it(`〈四-11〉should give a BigInt as String(v)`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 12345678901234567890n }], ['a']), [['12345678901234567890']])
    })

    it(`〈四-12〉should treat a function opt.empty as null`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ b: 1 }], ['a', 'b'], { empty: () => 'x' }), [[null, 1]])
    })

    it(`〈四-13〉should keep null as 'null' (JSDoc), booleans, objects and arrays as JSON, strings and finite numbers as is, and the parameter-level results`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: null, b: true, c: false, d: { y: 1, x: 2 }, e: [1, 'a'], f: 's', g: 1.5 }], ['a', 'b', 'c', 'd', 'e', 'f', 'g']), [['null', 'true', 'false', '{"y":1,"x":2}', '[1,"a"]', 's', 1.5]])
        assert.ok(getDoc('ltdtkeys2mat').includes(`null為'null'(可藉以與缺鍵區分)`))
        assert.strict.deepStrictEqual(ltdtkeys2mat([], ['a'], S), { state: 'success', msg: [] })
        assert.strict.deepStrictEqual(ltdtkeys2mat('x', ['a'], S), { state: 'error', msg: 'invalid ltdt: must be an array' })
        assert.strict.deepStrictEqual(ltdtkeys2mat(null, ['a'], S), { state: 'error', msg: 'invalid ltdt: must be an array' })
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], ['a'], { returnWithStateAndMsg: 'yes' }), [[1]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], ['a'], null), [[1]])
    })

})


describe(`裁定表〈五〉ltdtkeysheads2mat`, function() {

    it(`〈五-1〉should give opt.emptyHead (default '') for a key that kphead does not map`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], { a: 'c1' }), [['c1', ''], [1, 2]])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], { a: 'c1' }, { emptyHead: '-' }), [['c1', '-'], [1, 2]])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], { a: 'c1' }, { emptyHead: null }), [['c1', null], [1, 2]])
    })

    it(`〈五-2〉should read only the own same-name key of kphead (no lodash get path, no inherited key)`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ 'd.e': 1, 'toString': 2 }], ['d.e', 'toString'], { d: { e: 'X' }, z: 1 }), [['', ''], [1, 2]])
        let kp = Object.create({ b: 'B' })
        kp.a = 'A'
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], kp), [['A', ''], [1, 2]])
    })

    it(`〈五-3〉should treat a function value of kphead as null`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a'], { a: () => 'A' }), [[null], [1]])
    })

    it(`〈五-4〉should use the key names as the heads when kphead is not given or invalid ('x', {}, only inherited keys)`, function() {
        for (let kp of [undefined, 'x', {}, Object.create({ a: 'A' }), null]) {
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], kp), [['a', 'b'], [1, 2]])
        }
    })

    it(`〈五-5〉should skip the head at the same position as a skipped key`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', null, '', 'b'], { a: 'A', b: 'B', null: 'N' }), [['A', 'B'], [1, 2]])
    })

    it(`〈五-6〉should make the data rows by ltdtkeys2mat and pass the new opt.empty to it`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: NaN, b: () => 1 }, { a: undefined }], ['a', 'b'], { a: 'A', b: 'B' }, { empty: 'E' }), [['A', 'B'], ['NaN', 'null'], ['E', 'E']])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }, {}], ['a']), [['a'], [1], ['']])
    })

    it(`〈五-7〉should follow ltdtkeys2mat for {} rows, non-object rows and invalid keys`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{}], ['a'], { a: 'A' }, S), { state: 'success', msg: [['A'], ['']] })
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }, 'x'], ['a'], { a: 'A' }, S), { state: 'error', msg: 'invalid ltdt[1]: must be an object' })
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], 'a', { a: 'A' }, S), { state: 'error', msg: 'invalid keys: must be an array' })
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], [null, ''], { a: 'A' }, S), { state: 'error', msg: 'invalid keys: must contain at least one non-empty string or finite number' })
    })

    it(`〈五-8〉should keep the other behaviors (normal, [], non-array ltdt, head values as is, duplicate keys, extra kphead keys, non-boolean returnWithStateAndMsg) and say heads are put as is in JSDoc`, function() {
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], { a: 'c1', b: 'c2' }), [['c1', 'c2'], [12, 34.56], ['123', 'xyz']])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([], ['a'], { a: 'A' }, S), { state: 'success', msg: [] })
        assert.strict.deepStrictEqual(ltdtkeysheads2mat('x', ['a'], { a: 'A' }, S), { state: 'error', msg: 'invalid ltdt: must be an array' })
        let arrHead = [1, 2]
        let r = ltdtkeysheads2mat([{ a: 1, b: 2, c: 3, d: 4 }], ['a', 'b', 'c', 'd'], { a: 5, b: null, c: '', d: arrHead, z: 'extra' })
        assert.strict.deepStrictEqual(r, [[5, null, '', [1, 2]], [1, 2, 3, 4]])
        assert.strictEqual(r[0][3], arrHead)
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a', 'a'], { a: 'A' }), [['A', 'A'], [1, 1]])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a'], { a: 'A' }, { returnWithStateAndMsg: 'true' }), [['A'], [1]])
        assert.ok(getDoc('ltdtkeysheads2mat').includes('並原樣放入'))
    })

})


describe(`裁定表〈六〉ltdtDiff`, function() {

    it(`〈六-1〉should return the empty result for a non-array ltdtOld (ws492h W-16乙, originally throwing), and keep throwing for {} elements, holes and objects with only inherited keys`, function() {
        assert.strict.deepStrictEqual(ltdtDiff('x', []), { diff: [], dfs: [] })
        throwsMsg(() => ltdtDiff([{ a: 1 }, {}], [{ a: 1 }]), 'invalid ltdtOld[1]: must be a non-empty object')
        throwsMsg(() => ltdtDiff([{ a: 1 }], holed(2, [[0, { a: 1 }]])), 'invalid ltdtNew[1]: must be a non-empty object')
        throwsMsg(() => ltdtDiff([Object.create({ a: 1 })], [{ a: 1 }]), 'invalid ltdtOld[0]: must be a non-empty object')
    })

    it(`〈六-2〉should follow ltdtkeys2mat: own undefined equals a missing key, NaN differs from null, a function is null, a Date shows without quotes`, function() {
        let r = ltdtDiff([{ a: undefined, b: 1 }], [{ b: 1 }])
        assert.strict.deepStrictEqual(r.dfs, [{ b: { p: '', k: 'b', vo: '1', vn: '' }, a: { p: '', k: 'a', vo: '∗empty∗', vn: '' } }])
        let r2 = ltdtDiff([{ a: NaN }], [{ a: null }])
        assert.strict.deepStrictEqual(r2.dfs, [{ a: { p: 'modify', k: 'a', vo: 'NaN', vn: 'null' } }])
        let r3 = ltdtDiff([{ a: () => 1 }], [{ a: null }])
        assert.strict.deepStrictEqual(r3.dfs, [{ a: { p: '', k: 'a', vo: 'null', vn: '' } }])
        let r4 = ltdtDiff([{ a: new Date(Date.UTC(2026, 0, 2)) }], [{ a: 'x' }])
        assert.strict.deepStrictEqual(r4.dfs, [{ a: { p: 'modify', k: 'a', vo: '2026-01-02T00:00:00.000Z', vn: 'x' } }])
        //只讀自有欄位(同ltdtkeys2mat): 繼承之同名鍵視為缺鍵
        let inh = Object.assign(Object.create({ a: 'y' }), { b: 1 })
        let r5 = ltdtDiff([inh], [{ a: 'y', b: 1 }])
        assert.strict.deepStrictEqual(r5.dfs, [{ b: { p: '', k: 'b', vo: '1', vn: '' }, a: { p: 'modify', k: 'a', vo: '∗empty∗', vn: 'y' } }])
    })

    it(`〈六-3〉should compare objects and arrays by the key-sorted JSON and show the sorted JSON in dfs`, function() {
        let r = ltdtDiff([{ a: { y: 1, x: { q: 2, p: 1 } } }], [{ a: { x: { p: 1, q: 2 }, y: 1 } }])
        assert.strict.deepStrictEqual(r.dfs, [{ a: { p: '', k: 'a', vo: '{"x":{"p":1,"q":2},"y":1}', vn: '' } }])
        let r2 = ltdtDiff([{ a: [{ b: 1, a: 2 }] }], [{ a: [{ a: 3, b: 1 }] }])
        assert.strict.deepStrictEqual(r2.dfs, [{ a: { p: 'modify', k: 'a', vo: '[{"a":2,"b":1}]', vn: '[{"a":3,"b":1}]' } }])
    })

    it(`〈六-4〉should compare values containing the former separators ⟋ and ∶ correctly (root cause fixed in arrDiff)`, function() {
        let r = ltdtDiff([{ a: 'x⟋1∶y', b: 'k' }], [{ a: 'x⟋1∶z', b: 'k' }])
        assert.strict.deepStrictEqual(r.dfs, [{ a: { p: 'modify', k: 'a', vo: 'x⟋1∶y', vn: 'x⟋1∶z' }, b: { p: '', k: 'b', vo: 'k', vn: '' } }])
    })

    it(`〈六-5〉JSDoc should say: compared as cell text not by type (use ltdtDiffByKey to distinguish), aligned by row order, a value equal to the missing-key marker cannot be told apart`, function() {
        let d = getDoc('ltdtDiff')
        for (let s of ['以儲存格文字比對、不比型別', '需區分型別請用ltdtDiffByKey', '依列序對齊比對', '需依主鍵對齊請用ltdtDiffByKey', '值等於缺鍵標記時無法與缺鍵區分']) {
            assert.ok(d.includes(s), s)
        }
        assert.strict.deepStrictEqual(ltdtDiff([{ a: 1, b: true }], [{ a: '1', b: 'true' }]).dfs, [{ a: { p: '', k: 'a', vo: '1', vn: '' }, b: { p: '', k: 'b', vo: 'true', vn: '' } }])
    })

    it(`〈六-6〉should keep the other behaviors (normal comparison and opt.empty)`, function() {
        let r = ltdtDiff([{ cn: '1', v1: 'a' }], [{ cn: 't1', v1: 'a' }])
        assert.strict.deepStrictEqual(r.dfs, [{ cn: { p: 'modify', k: 'cn', vo: '1', vn: 't1' }, v1: { p: '', k: 'v1', vo: 'a', vn: '' } }])
        assert.strict.deepStrictEqual(ltdtDiff([{ a: 1 }], [{ b: 2 }], { empty: '-' }).dfs, [{ a: { p: 'modify', k: 'a', vo: '1', vn: '-' }, b: { p: 'modify', k: 'b', vo: '-', vn: '2' } }])
        assert.strict.deepStrictEqual(ltdtDiff([], []), { diff: [], dfs: [] })
    })

})


describe(`裁定表〈七〉arrDiff`, function() {

    it(`〈七-1〉should compare element by element (array) and row by row then cell by cell (matrix), without misalignment or truncation for values containing a newline, ⟋ or ∶`, function() {
        let r = arrDiff(['a\nb', 'c'], ['a\nb', 'd'])
        assert.strict.deepStrictEqual(r.dfs, [{ p: '', k: 0, vo: 'a\nb', vn: '' }, { p: 'modify', k: 1, vo: 'c', vn: 'd' }])
        let r2 = arrDiff([['1∶x⟋', 'b\nc'], ['k']], [['1∶x⟋', 'b\nd'], ['k']], { mode: 'matrix' })
        assert.strict.deepStrictEqual(r2.dfs, [
            [{ p: '', k: 0, vo: '1∶x⟋', vn: '' }, { p: 'modify', k: 1, vo: 'b\nc', vn: 'b\nd' }],
            [{ p: '', k: 0, vo: 'k', vn: '' }],
        ])
    })

    it(`〈七-2〉should remove opt.dls and opt.dlq (no effect when given) and drop them from the JSDoc of arrDiff, ltdtDiff and matDiff`, function() {
        let a = [['a', 'b']]
        let b = [['a', 'c']]
        let base = arrDiff(a, b, { mode: 'matrix' })
        assert.strict.deepStrictEqual(arrDiff(a, b, { mode: 'matrix', dls: 'b', dlq: 'a' }), base)
        assert.strict.deepStrictEqual(matDiff(a, b, { dls: 'b', dlq: 'a' }), matDiff(a, b))
        assert.strict.deepStrictEqual(ltdtDiff([{ a: 'x' }], [{ a: 'y' }], { dls: 'x' }), ltdtDiff([{ a: 'x' }], [{ a: 'y' }]))
        for (let name of ['arrDiff', 'ltdtDiff', 'matDiff']) {
            let d = getDoc(name)
            assert.ok(!d.includes('opt.dls') && !d.includes('opt.dlq'), name)
        }
    })

    it(`〈七-3〉should use the same text as ltdtkeys2mat: strings and finite numbers as is, booleans, null 'null', undefined and holes '', NaN/±Infinity strings, objects and arrays as key-sorted JSON, Date ISO, function as null, BigInt String(v)`, function() {
        let d = new Date(Date.UTC(2026, 4, 6))
        let arr = holed(13, [[0, 's'], [1, 1.5], [2, true], [3, false], [4, null], [5, undefined], [7, NaN], [8, Infinity], [9, { b: 1, a: [2, { d: 1, c: 0 }] }], [10, d], [11, () => 1], [12, 10n]])
        let r = arrDiff(arr, [])
        assert.strict.deepStrictEqual(r.dfs.map((x) => x.vo), ['s', '1.5', 'true', 'false', 'null', '', '', 'NaN', 'Infinity', '{"a":[2,{"c":0,"d":1}],"b":1}', '2026-05-06T00:00:00.000Z', 'null', '10'])
        assert.strict.deepStrictEqual(arrDiff([-Infinity], []).dfs[0].vo, '-Infinity')
    })

    it(`〈七-4〉should compare as text, not by type (1 and '1', null and 'null' are the same)`, function() {
        assert.strict.deepStrictEqual(arrDiff([1, null, true], ['1', 'null', 'true']).dfs, [{ p: '', k: 0, vo: '1', vn: '' }, { p: '', k: 1, vo: 'null', vn: '' }, { p: '', k: 2, vo: 'true', vn: '' }])
        assert.ok(getDoc('arrDiff').includes('不比型別'))
    })

    it(`〈七-5〉should return diff as element arrays (breaking), keeping the format of dfs`, function() {
        let r = arrDiff(['a', 'b'], ['a', 'c'])
        assert.strict.deepStrictEqual(r.diff, [
            { count: 1, added: false, removed: false, value: ['a'] },
            { count: 1, added: false, removed: true, value: ['b'] },
            { count: 1, added: true, removed: false, value: ['c'] },
        ])
        assert.strict.deepStrictEqual(r.dfs, [{ p: '', k: 0, vo: 'a', vn: '' }, { p: 'modify', k: 1, vo: 'b', vn: 'c' }])
        let r2 = arrDiff([[1, 2]], [[1, 3], [4]], { mode: 'matrix' })
        assert.strict.deepStrictEqual(r2.diff, [
            { count: 1, added: false, removed: true, value: [['1', '2']] },
            { count: 2, added: true, removed: false, value: [['1', '3'], ['4']] },
        ])
        assert.strict.deepStrictEqual(r2.dfs, [[{ p: '', k: 0, vo: '1', vn: '' }, { p: 'modify', k: 1, vo: '2', vn: '3' }], [{ p: 'add', k: 0, vo: '4', vn: '' }]])
    })

    it(`〈七-6〉should keep the other behaviors (required parameters, non-array rows in matrix mode, invalid mode, normal comparison, added/removed rows and cells)`, function() {
        assert.strict.deepStrictEqual(arrDiff('x', []), { diff: [], dfs: [] }) //ws492h W-16乙: 第1參數arrOld非陣列回空結果(原throw)
        throwsMsg(() => arrDiff([], null), 'invalid arrNew: must be an array')
        throwsMsg(() => arrDiff([1], [[2]], { mode: 'matrix' }), `invalid arrOld[0]: must be an array when opt.mode is 'matrix'`)
        throwsMsg(() => arrDiff([[1]], [2], { mode: 'matrix' }), `invalid arrNew[0]: must be an array when opt.mode is 'matrix'`)
        assert.strict.deepStrictEqual(arrDiff([1, 2], [1, 3], { mode: 'x' }), arrDiff([1, 2], [1, 3]))
        assert.strict.deepStrictEqual(arrDiff([], []), { diff: [], dfs: [] })
        let r = arrDiff([-0.529408622, 0.839882385, 0.663059856, 0.49047221, 123, 0.395763265, 0.866151835], [-0.529408622, 0.1839882385, 0.663059856, 0.49047221, 0.395763265, 45.6, 0.866151835])
        assert.strict.deepStrictEqual(r.dfs.map((x) => x.p), ['', 'modify', '', '', 'remove', '', 'add', ''])
        let r2 = arrDiff([[9, 0.345880037, 0.363177921, 0.206849994, 0.636855344]], [[9, 0.345880037, 0.363173478, 0.636855344]], { mode: 'matrix' })
        assert.strict.deepStrictEqual(r2.dfs, [[
            { p: '', k: 0, vo: '9', vn: '' },
            { p: '', k: 1, vo: '0.345880037', vn: '' },
            { p: 'modify', k: 2, vo: '0.363177921', vn: '0.363173478' },
            { p: 'modify', k: 3, vo: '0.206849994', vn: '0.636855344' },
            { p: 'remove', k: 4, vo: '0.636855344', vn: '' },
        ]])
    })

})


describe(`裁定表〈八〉matDiff`, function() {

    it(`〈八-1〉should keep throwing for a non-array row (including holes), with the row index only`, function() {
        throwsMsg(() => matDiff([[1], LEAK], [[1]]), 'invalid matOld[1]: must be an array')
        throwsMsg(() => matDiff([[1]], holed(2, [[0, [1]]])), 'invalid matNew[1]: must be an array')
    })

    it(`〈八-2〉should follow arrDiff (cell by cell; ⟋ and ∶ no longer misalign or truncate; objects as key-sorted JSON)`, function() {
        let r = matDiff([['a∶b', { y: 1, x: 2 }]], [['a∶c', { x: 2, y: 1 }]])
        assert.strict.deepStrictEqual(r.dfs, [[{ p: 'modify', k: 0, vo: 'a∶b', vn: 'a∶c' }, { p: '', k: 1, vo: '{"x":2,"y":1}', vn: '' }]])
    })

    it(`〈八-3〉should remove opt.dls and opt.dlq (JSDoc)`, function() {
        assert.ok(!getDoc('matDiff').includes('opt.dls'))
        assert.strict.deepStrictEqual(matDiff([['a⟋b']], [['a⟋b']], { dls: '⟋' }).dfs, [[{ p: '', k: 0, vo: 'a⟋b', vn: '' }]])
    })

    it(`〈八-4〉should keep the other behaviors (required parameters, matrix mode, normal comparison and added rows)`, function() {
        assert.strict.deepStrictEqual(matDiff('x', []), { diff: [], dfs: [] }) //ws492h W-16乙: 第1參數matOld非陣列回空結果(原throw)
        throwsMsg(() => matDiff([], 'x'), 'invalid matNew: must be an array')
        assert.strict.deepStrictEqual(matDiff([[1, 2]], [[1, 2], [3]], { mode: 'array' }).dfs, [[{ p: '', k: 0, vo: '1', vn: '' }, { p: '', k: 1, vo: '2', vn: '' }], [{ p: 'add', k: 0, vo: '3', vn: '' }]])
    })

})


describe(`裁定表〈九〉ltdtpull`, function() {

    it(`〈九-1〉should read only the own same-name key ('a.b' is a field name; toString and an inherited id are not compared)`, function() {
        assert.strict.deepStrictEqual(ltdtpull([{ 'a.b': 1 }, { a: { b: 1 } }], [{ 'a.b': 1 }], 'a.b'), [{ a: { b: 1 } }])
        let inh = Object.create({ id: 1 })
        assert.strict.deepStrictEqual(ltdtpull([inh, { id: 1 }, { id: 2 }], [{ id: 1 }], 'id'), [inh, { id: 2 }])
        throwsMsg(() => ltdtpull([{ id: 1 }], [{}], 'toString'), 'invalid ltdtDel[0]: must have the primary key as an own field')
    })

    //ws430c3(裁定表〈十六〉): 原訊息帶實際欄位名; ws492j V20起訊息不帶key之欄位名(呼叫端給之值), 只指出索引
    it(`〈九-2〉should throw when a row of ltdtDel has no own key (no longer deleting every row missing the key), naming the index only`, function() {
        throwsMsg(() => ltdtpull([{ id: 1 }, { v: 1 }], [{ id: 1 }, { v: 2 }], 'id'), 'invalid ltdtDel[1]: must have the primary key as an own field')
        throwsMsg(() => ltdtpull([{ id: 1 }], [Object.create({ id: 1 })], 'id'), 'invalid ltdtDel[0]: must have the primary key as an own field')
        throwsMsg(() => ltdtpull([{ x: 1 }], [{ y: 1 }], 'x'), 'invalid ltdtDel[0]: must have the primary key as an own field')
        throwsMsg(() => ltdtpull([{ 1: 'a' }], [{ 2: 'a' }], 1), 'invalid ltdtDel[0]: must have the primary key as an own field')
    })

    it(`〈九-3〉should throw when the key value of ltdtDel is invalid (valid: non-empty string or finite number)`, function() {
        for (let v of [NaN, null, undefined, '', {}, [], Infinity, true]) {
            throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: v }], 'id'), 'invalid ltdtDel[0]: must have a primary key of a non-empty string or a finite number')
        }
    })

    it(`〈九-4〉should keep (not compare) the rows of ltdtAll missing the key or with an invalid key value (JSDoc)`, function() {
        let all = [{ id: 1 }, {}, { id: null }, { id: NaN }, { id: '' }, { id: 2 }]
        assert.strict.deepStrictEqual(ltdtpull(all, [{ id: 1 }], 'id'), [{}, { id: null }, { id: NaN }, { id: '' }, { id: 2 }])
        assert.ok(getDoc('ltdtpull').includes('ltdtAll之列缺該欄或其值無效時不被比對而保留'))
    })

    it(`〈九-5〉should return a new array (shallow copy) when ltdtDel is []`, function() {
        let all = [{ id: 1 }]
        let r = ltdtpull(all, [], 'id')
        assert.notStrictEqual(r, all)
        assert.strict.deepStrictEqual(r, all)
        assert.strictEqual(r[0], all[0])
    })

    it(`〈九-6〉should treat a finite number key as a string field name, with the message 'invalid key: must be a non-empty string or a finite number'`, function() {
        assert.strict.deepStrictEqual(ltdtpull([{ 1: 'a' }, { 1: 'b' }], [{ 1: 'a' }], 1), [{ 1: 'b' }])
        throwsMsg(() => ltdtpull([], [], NaN), 'invalid key: must be a non-empty string or a finite number')
    })

    it(`〈九-7〉should keep throwing for a non-object element (holes, arrays), with row[i]`, function() {
        throwsMsg(() => ltdtpull([{ id: 1 }, [1]], [], 'id'), 'invalid ltdtAll[1]: must be an object')
        throwsMsg(() => ltdtpull([], holed(2, [[1, { id: 1 }]]), 'id'), 'invalid ltdtDel[0]: must be an object')
    })

    it(`〈九-8〉should keep the other behaviors (required parameters, strict equality 1 vs '1', delete every row of the same key value, {} kept) and say so in JSDoc`, function() {
        assert.strict.deepStrictEqual(ltdtpull('x', [], 'id'), []) //ws492h W-16乙: 第1參數ltdtAll非陣列回[](原throw)
        throwsMsg(() => ltdtpull([], 'x', 'id'), 'invalid ltdtDel: must be an array')
        assert.strict.deepStrictEqual(ltdtpull([{ id: 1 }, { id: '1' }], [{ id: 1 }], 'id'), [{ id: '1' }])
        assert.strict.deepStrictEqual(ltdtpull([{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2 }], [{ id: 1 }], 'id'), [{ id: 2 }])
        assert.strict.deepStrictEqual(ltdtpull([{}, { id: 1 }], [{ id: 1 }], 'id'), [{}])
        let d = getDoc('ltdtpull')
        assert.ok(d.includes('以嚴格相等比對(1與\'1\'不同)') && d.includes('同鍵值之ltdtAll列全部刪除'))
    })

})


describe(`裁定表〈十〉matConcat`, function() {

    it(`〈十-1〉should take the longest row of each matrix as its columns, filling the shorter rows`, function() {
        assert.strict.deepStrictEqual(matConcat([['a'], ['b', 'c', 'd']], [['x']]), [['a', null, null, 'x'], ['b', 'c', 'd', null]])
        assert.strict.deepStrictEqual(matConcat([[], ['a', 'b']], [['x'], ['y']]), [[null, null, 'x'], ['a', 'b', 'y']])
    })

    it(`〈十-2〉should add a 3rd parameter opt with opt.empty (default null; a function is null)`, function() {
        assert.strict.deepStrictEqual(matConcat([['a'], []], [['x', 'y']], { empty: '' }), [['a', 'x', 'y'], ['', '', '']])
        assert.strict.deepStrictEqual(matConcat([['a'], []], [['x']], { empty: () => 1 }), [['a', 'x'], [null, null]])
        assert.strict.deepStrictEqual(matConcat([['a'], []], [['x']]), [['a', 'x'], [null, null]])
        assert.strict.deepStrictEqual(matConcat([['a'], []], [['x']], null), [['a', 'x'], [null, null]])
    })

    it(`〈十-3〉should keep throwing for a non-array row (including outer holes), with row[i]`, function() {
        throwsMsg(() => matConcat([['a'], LEAK], []), 'invalid mat1[1]: must be an array')
        throwsMsg(() => matConcat([], holed(2, [[0, ['a']]])), 'invalid mat2[1]: must be an array')
    })

    it(`〈十-4〉should keep the other behaviors (row count is the larger one, [] valid, holes and undefined filled, null as is, cells not deep-copied, new rows) and say so in JSDoc`, function() {
        let o = { a: 1 }
        let r = matConcat([[holed(2, [[1, 1]])[0], undefined, null, o]], [])
        assert.strict.deepStrictEqual(r, [[null, null, null, o]])
        assert.strictEqual(r[0][3], o)
        assert.strict.deepStrictEqual(matConcat([], []), [])
        let m = [[1]]
        assert.notStrictEqual(matConcat(m, [])[0], m[0])
        assert.ok(getDoc('matConcat').includes('物件與陣列之儲存格不深拷貝'))
    })

})


describe(`裁定表〈十一〉matat`, function() {

    it(`〈十一-1〉should return [[]] for [[]] (row count kept)`, function() {
        assert.strict.deepStrictEqual(matat([[]], 0), [[]])
    })

    it(`〈十一-2〉should get the element of a row of one empty element ([''], [null], [{}])`, function() {
        assert.strict.deepStrictEqual(matat([['']], 0), [['']])
        assert.strict.deepStrictEqual(matat([[null]], 0), [[null]])
        assert.strict.deepStrictEqual(matat([[{}]], 0), [[{}]])
    })

    it(`〈十一-3〉should treat iend less than istart as not given (only istart)`, function() {
        assert.strict.deepStrictEqual(matat([['a', 'b', 'c', 'd'], [1, 2, 3, 4]], 3, 0), [['d'], [4]]) //修前依range(3, 1)反向取得[['d', 'c'], [4, 3]]
        assert.strict.deepStrictEqual(matat([['a', 'b', 'c'], [1, 2, 3]], 2, 1), [['c'], [3]])
    })

    it(`〈十一-4〉should cut at the last cell of each row when iend is beyond the row, and keep [] when istart is beyond`, function() {
        assert.strict.deepStrictEqual(matat([['a', 'b', 'c'], [1]], 1, 9), [['b', 'c'], []])
    })

    it(`〈十一-5〉should keep throwing for a non-array row (including outer holes), with row[i]`, function() {
        throwsMsg(() => matat([[1], LEAK], 0), 'invalid mat[1]: must be an array')
        throwsMsg(() => matat(holed(2, [[1, [1]]]), 0), 'invalid mat[0]: must be an array')
    })

    it(`〈十一-6〉should keep the other behaviors (required parameters and istart, numeric strings, invalid iend as not given, holes give undefined, cells beyond the row give []) and say so in JSDoc`, function() {
        assert.strict.deepStrictEqual(matat('x', 0), []) //ws492h W-16乙: 第1參數mat非陣列回[](原throw)
        throwsMsg(() => matat([[1]], 'x'), 'invalid istart: must be an integer index')
        assert.strict.deepStrictEqual(matat([['a', 'b', 'c']], ' 1 ', '2'), [['b', 'c']])
        assert.strict.deepStrictEqual(matat([['a', 'b', 'c']], 1, 'x'), [['b']])
        assert.strict.deepStrictEqual(matat([holed(2, [[1, 'b']])], 0), [[undefined]])
        assert.strict.deepStrictEqual(matat([['a']], 3), [[]])
        assert.ok(getDoc('matat').includes('列內空位取得undefined'))
    })

})


describe(`裁定表〈十二〉arrAt`, function() {

    it(`〈十二-1〉should get the element of an array of one empty element ([''], [null], [{}], [[]])`, function() {
        assert.strict.deepStrictEqual(arrAt([''], 0), [''])
        assert.strict.deepStrictEqual(arrAt([null], 0), [null])
        assert.strict.deepStrictEqual(arrAt([{}], 0), [{}])
        assert.strict.deepStrictEqual(arrAt([[]], 0), [[]])
    })

    it(`〈十二-2〉should treat iend less than istart as not given (only istart)`, function() {
        assert.strict.deepStrictEqual(arrAt([1, 2, 3, 4], 2, 1), [3])
        assert.strict.deepStrictEqual(arrAt([1, 2, 3, 4], 3, 0), [4])
    })

    it(`〈十二-3〉should cut at the last element when iend is beyond the length, and keep [] when istart is beyond`, function() {
        assert.strict.deepStrictEqual(arrAt([1, 2, 3], 1, 100), [2, 3])
        assert.strict.deepStrictEqual(arrAt([1, 2, 3], 3, 5), [])
    })

    it(`〈十二-4〉should keep the other behaviors (non-array [], invalid istart [], numeric strings, invalid iend, holes undefined, elements not deep-copied, array-like []) and say so in JSDoc`, function() {
        assert.strict.deepStrictEqual(arrAt(null, 0), [])
        assert.strict.deepStrictEqual(arrAt([1, 2], 'x'), [])
        assert.strict.deepStrictEqual(arrAt([1, 2, 3], ' 1 ', '2'), [2, 3])
        assert.strict.deepStrictEqual(arrAt([1, 2, 3], 1, -1), [2])
        assert.strict.deepStrictEqual(arrAt(holed(2, [[1, 1]]), 0, 1), [undefined, 1])
        let o = { a: 1 }
        assert.strictEqual(arrAt([o], 0)[0], o)
        assert.strict.deepStrictEqual(arrAt({ 0: 'a', length: 1 }, 0), [])
        let d = getDoc('arrAt')
        assert.ok(d.includes('小於istart者皆視為未給') && d.includes('iend超出vall長度時截至最後一個元素'))
    })

})


describe(`裁定表〈十三〉time*2* 18個之JSDoc`, function() {

    let g1 = ['time2day', 'time2hour', 'time2min', 'timems2day', 'timems2hour', 'timems2min', 'timems2time']
    let g2 = ['timeTZ2day', 'timeTZ2hour', 'timeTZ2min', 'timemsTZ2day', 'timemsTZ2hour', 'timemsTZ2min', 'timemsTZ2time']
    let g3 = ['timeTZ2past', 'timemsTZ2past', 'timeTZ2expire', 'timemsTZ2expire']

    it(`〈十三-1〉the 7 functions without time zone should say '' means failure and they depend on the local time zone (DST gap invalid)`, function() {
        for (let n of g1) {
            let d = getDoc(n)
            assert.ok(d.includes(`回傳''即失敗，有效輸入必得非空字串`), n)
            assert.ok(d.includes('依本機時區判定') && d.includes('夏令空窗內不存在之本地時刻視為無效'), n)
        }
    })

    it(`〈十三-2〉the 7 functions with time zone should say '' means failure`, function() {
        for (let n of g2) {
            assert.ok(getDoc(n).includes(`回傳''即失敗，有效輸入必得非空字串`), n)
        }
    })

    it(`〈十三-3〉the 4 past/expire functions should list the two kinds of err values`, function() {
        for (let n of g3) {
            let d = getDoc(n)
            let msgT = n.startsWith('timems') ? 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)' : 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)'
            assert.ok(d.includes(`'${msgT}'`) && d.includes(`'時間轉換失敗'為失敗`), n)
            assert.ok(d.includes(n.endsWith('past') ? `'時間未到'為算得之結果` : `'時間已過'為算得之結果`), n)
        }
    })

    it(`〈十三-4〉istime and istimems should say they depend on the local time zone`, function() {
        for (let n of ['istime', 'istimems']) {
            assert.ok(getDoc(n).includes('依本機時區判定'), n)
        }
    })

})


describe(`裁定表〈十四〉istimeTZ、istimemsTZ`, function() {

    let runner = fileURLToPath(new URL('./tools/istimeTZRunner.mjs', import.meta.url))
    let run = (tz, inputs) => {
        let r = spawnSync(process.execPath, [runner, JSON.stringify(inputs)], { env: { ...process.env, TZ: tz }, encoding: 'utf8', windowsHide: true, timeout: 60000 })
        assert.strict.deepStrictEqual(r.status, 0, r.stderr)
        return JSON.parse(r.stdout)
    }

    //Asia/Taipei 1979-07-01 00:00~00:59 為夏令空窗(本地時刻不存在); 帶時區之時刻依其時區為有效
    let gap = [
        ['istimeTZ', '1979-07-01T00:48:15Z'],
        ['istimeTZ', '1979-07-01T00:48:15+08:00'],
        ['istimemsTZ', '1979-07-01T00:48:15.783Z'],
        ['istimemsTZ', '1979-07-01T00:48:15.783+08:00'],
    ]
    //其他輸入不變(各時區皆同)
    let others = [
        ['istimeTZ', '2019-01-01T12:34:56+08:00', true],
        ['istimeTZ', '2019-01-01T12:34:56Z', true],
        ['istimeTZ', '0050-03-04T05:06:07Z', true],
        ['istimeTZ', '2020-02-29T23:59:59-05:00', true],
        ['istimeTZ', '2019-02-29T00:00:00Z', false],
        ['istimeTZ', '2019-01-01T24:00:00Z', false],
        ['istimeTZ', '2019-01-01T12:34:56:789+08:00', false],
        ['istimeTZ', '2019-01-01T12:34:56A', false],
        ['istimeTZ', '2019-01-01', false],
        ['istimeTZ', 'Invalid DateZ', false],
        ['istimemsTZ', '2019-01-01T12:34:56.789+08:00', true],
        ['istimemsTZ', '2019-01-01T12:34:56.789Z', true],
        ['istimemsTZ', '2019-01-01T12:34:56+08:00', false],
        ['istimemsTZ', '2019-13-01T12:34:56.789Z', false],
    ]

    it(`〈十四-1〉should accept a valid time with a time zone inside the local DST gap in Asia/Taipei (former false), and not depend on the time zone of the environment (UTC, America/New_York)`, function() {
        for (let tz of ['Asia/Taipei', 'UTC', 'America/New_York']) {
            let r = run(tz, [...gap, ...others.map(([f, v]) => [f, v])])
            assert.strict.deepStrictEqual(r.tz, tz)
            assert.strict.deepStrictEqual(r.results.slice(0, gap.length), gap.map(() => true), tz)
            assert.strict.deepStrictEqual(r.results.slice(gap.length), others.map((x) => x[2]), tz)
        }
    })

    it(`〈十四-2〉should accept a valid time with a time zone inside the DST gap of America/New_York (2026-03-08 02:30 local) when the environment is America/New_York`, function() {
        let r = run('America/New_York', [['istimeTZ', '2026-03-08T02:30:00-05:00'], ['istimemsTZ', '2026-03-08T02:30:00.000Z']])
        assert.strict.deepStrictEqual(r.results, [true, true])
    })

    it(`〈十四-3〉JSDoc should state the validation method`, function() {
        for (let n of ['istimeTZ', 'istimemsTZ']) {
            let d = getDoc(n)
            assert.ok(d.includes('依該時區之固定偏移逐欄驗證') && d.includes('不經本機時間往返比對'), n)
        }
    })

    it(`〈十四-4〉istime and istimems should not change: no time zone, judged by the local time zone (a local DST-gap time is invalid in Asia/Taipei)`, function() {
        let r = run('Asia/Taipei', [['istime', '1979-07-01T00:48:15'], ['istimems', '1979-07-01T00:48:15.783'], ['istime', '2019-01-01T12:34:56'], ['istimems', '2019-01-01T12:34:56.789']])
        assert.strict.deepStrictEqual(r.results, [false, false, true, true])
        let r2 = run('UTC', [['istime', '1979-07-01T00:48:15'], ['istimems', '1979-07-01T00:48:15.783']])
        assert.strict.deepStrictEqual(r2.results, [true, true])
    })

    it(`〈十四-5〉(in-process) should be the same in the current environment`, function() {
        assert.strict.deepStrictEqual(istimeTZ('1979-07-01T00:48:15Z'), true)
        assert.strict.deepStrictEqual(istimemsTZ('1979-07-01T00:48:15.783+08:00'), true)
    })

    it(`〈十四-6〉(外審T6) only a valid offset is validated in its own time zone; a suffix accepted by the former check but not a valid offset ('|08:00', '+99:99') keeps the former result`, function() {
        let inputs = [
            ['istimeTZ', '1979-07-01T00:48:15+99:99'],
            ['istimeTZ', '1979-07-01T00:48:15|08:00'],
            ['istimemsTZ', '1979-07-01T00:48:15.783+99:99'],
            ['istimemsTZ', '1979-07-01T00:48:15.783|08:00'],
            ['istimeTZ', '2019-01-01T12:34:56+99:99'],
            ['istimeTZ', '2019-01-01T12:34:56|08:00'],
            ['istimeTZ', '1979-07-01T00:48:15+23:59'],
            ['istimeTZ', '1979-07-01T00:48:15+24:00'],
        ]
        let r = run('Asia/Taipei', inputs)
        //空窗內而時區無效者維持修前false; 非空窗者修前即true(checkTZ寬鬆, 不變); +23:59為有效偏移
        assert.strict.deepStrictEqual(r.results, [false, false, false, false, true, true, true, false])
    })

})


describe(`裁定表〈十五〉帶時區之11個轉換函數(ws430c3)`, function() {

    let runner = fileURLToPath(new URL('./tools/timeTZConvRunner.mjs', import.meta.url))
    let run = (tz, calls) => {
        let r = spawnSync(process.execPath, [runner, JSON.stringify(calls)], { env: { ...process.env, TZ: tz }, encoding: 'utf8', windowsHide: true, timeout: 60000 })
        assert.strict.deepStrictEqual(r.status, 0, r.stderr)
        let o = JSON.parse(r.stdout)
        assert.strict.deepStrictEqual(o.tz, tz)
        return o.results
    }
    let TZS = ['Asia/Taipei', 'UTC', 'America/New_York']

    it(`〈十五-1〉the 7 functions should take the wall-clock fields of the given string inside a local DST gap (Asia/Taipei 1979-07-01 00:xx, America/New_York 2026-03-08 02:xx), the same in every time zone`, function() {
        let calls = [
            ['timeTZ2day', '1979-07-01T00:48:15+08:00'],
            ['timeTZ2hour', '1979-07-01T00:48:15+08:00'],
            ['timeTZ2min', '1979-07-01T00:48:15+08:00'],
            ['timemsTZ2day', '1979-07-01T00:48:15.783Z'],
            ['timemsTZ2hour', '1979-07-01T00:48:15.783Z'],
            ['timemsTZ2min', '1979-07-01T00:48:15.783Z'],
            ['timemsTZ2time', '1979-07-01T00:48:15.783Z'],
            ['timeTZ2hour', '2026-03-08T02:30:00-05:00'],
            ['timemsTZ2time', '2026-03-08T02:30:59.999-05:00'],
        ]
        let expected = ['1979-07-01', '1979-07-01T00', '1979-07-01T00:48', '1979-07-01', '1979-07-01T00', '1979-07-01T00:48', '1979-07-01T00:48:15', '2026-03-08T02', '2026-03-08T02:30:59']
        for (let tz of TZS) {
            assert.strict.deepStrictEqual(run(tz, calls), expected, tz)
        }
    })

    it(`〈十五-2〉past/expire should compute the time difference of a time inside a local DST gap by its fixed offset, the same in every time zone`, function() {
        let calls = [
            ['timemsTZ2past', '1979-07-01T00:48:15.000+08:00', '1979-07-01T00:50:15.000+08:00'],
            ['timeTZ2past', '1979-07-01T00:48:15+08:00', '1979-07-01T00:48:20+08:00'],
            ['timemsTZ2expire', '2026-03-08T02:30:00.000-05:00', '2026-03-08T02:27:00.000-05:00'],
            ['timeTZ2expire', '2026-03-08T02:30:00-05:00', '2026-03-08T02:29:30-05:00'],
        ]
        let expected = [
            { today: true, msg: '2分鐘前', err: '' },
            { today: true, msg: '5秒前', err: '' },
            { today: true, msg: '3分鐘後', err: '' },
            { today: true, msg: '30秒後', err: '' },
        ]
        for (let tz of TZS) {
            assert.strict.deepStrictEqual(run(tz, calls), expected, tz)
        }
    })

    it(`〈十五-3〉other inputs should not change (offsets, milliseconds, the years 0000~0099, suffixes accepted by the former check)`, function() {
        let calls = [
            ['timeTZ2hour', '2019-01-01T12:34:56Z'],
            ['timeTZ2min', '2019-01-01T23:59:59-12:00'],
            ['timeTZ2day', '0050-03-04T05:06:07+08:00'],
            ['timemsTZ2time', '2019-01-01T12:34:56.987+08:00'],
            ['timemsTZ2hour', '2020-02-29T00:00:00.000+14:00'],
            ['timeTZ2hour', '2019-01-01T12:34:56|08:00'],
            ['timeTZ2hour', '2019-02-29T12:34:56Z'],
            ['timemsTZ2past', '2020-10-18T12:34:54.000+08:00', '2020-10-18T12:34:56.000+08:00'],
        ]
        let expected = ['2019-01-01T12', '2019-01-01T23:59', '0050-03-04', '2019-01-01T12:34:56', '2020-02-29T00', '2019-01-01T12', '', { today: true, msg: '2秒前', err: '' }]
        for (let tz of TZS) {
            assert.strict.deepStrictEqual(run(tz, calls), expected, tz)
        }
    })

    it(`〈十五-4〉JSDoc of the 11 functions should state the conversion method`, function() {
        for (let n of ['timeTZ2day', 'timeTZ2hour', 'timeTZ2min', 'timemsTZ2day', 'timemsTZ2hour', 'timemsTZ2min', 'timemsTZ2time']) {
            assert.ok(getDoc(n).includes('轉換方式：直接取字串中之時刻欄位'), n)
        }
        for (let n of ['timeTZ2past', 'timemsTZ2past', 'timeTZ2expire', 'timemsTZ2expire']) {
            assert.ok(getDoc(n).includes('轉換方式：時刻依其時區之固定偏移解析為絕對時刻'), n)
        }
    })

})


describe(`外審補案(ws430c2): 裁定表「其餘不變」之邊界與檢查之值即使用之值`, function() {

    //changingAt, 陣列之第i格以getter提供: 第1次讀得first, 其後讀得second
    let changingAt = (base, i, first, second) => {
        let a = base.slice()
        let n = 0
        Object.defineProperty(a, i, {
            enumerable: true,
            configurable: true,
            get() {
                return n++ === 0 ? first : second
            },
        })
        return a
    }

    it(`〈三-9〉(外審T2、T3) should treat a single String/Number wrapper as an invalid ar or strkeys (W-20: wrapper objects are invalid, same empty result as undefined), and keep comparing BigInt and Symbol candidates as strings (unchanged)`, function() {
        //W-20(判斷函數只收原始值): 修前單一String/Number包裝物件視同字串而比對得one; 修後為無效輸入, 同未給之空結果
        let none = { ratings: [], bestMatch: null, bestMatchIndex: -1 }
        assert.strict.deepStrictEqual(strFindSimilar('abc', undefined), none)
        assert.strict.deepStrictEqual(strFindSimilar(new String('abc'), ['abc']), none) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(strFindSimilar('abc', new String('abc')), none) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(strFindSimilar(new Number(12), ['12']), none) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(strFindSimilar('123', [123n]).ratings, [{ target: '123', rating: 1 }])
        assert.strict.deepStrictEqual(strFindSimilar('Symbol(x)', [Symbol('x')]).ratings, [{ target: 'Symbol(x)', rating: 1 }])
    })

    it(`〈四-13〉〈五-8〉(外審T4) should keep a BigInt key as a column whose values are always missing and whose head is the BigInt itself (unchanged)`, function() {
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ '1': 'one', 'a': 2 }], [1n, 'a']), [['', 2]])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ '1': 'one', 'a': 2 }], [1n, 'a']), [[1n, 'a'], ['', 2]])
        assert.strict.deepStrictEqual(keysmat2ltdt([1n, 'a'], [[1, 2]]), [{ '1': 1, 'a': 2 }]) //keysmat2ltdt修前zipObject以'1'為鍵, 同修前
    })

    it(`〈二-7〉〈六-6〉〈十-4〉(外審T5) should not call methods of the input arrays (a shadowed slice, reduce or map does not change the result)`, function() {
        let m = [['a'], [1]]
        m.slice = null
        assert.strict.deepStrictEqual(mat2ltdt(m), [{ a: 1 }])
        let c = [[1]]
        c.reduce = null
        assert.strict.deepStrictEqual(matConcat(c, []), [[1]])
        let d = [{ a: 1 }]
        d.map = null
        assert.strict.deepStrictEqual(ltdtDiff(d, [{ a: 1 }]).dfs, [{ a: { p: '', k: 'a', vo: '1', vn: '' } }])
    })

    it(`〈四-13〉〈七-3〉〈六-3〉(外審T9) should judge String/Number/Boolean wrappers by their internal slot, so a plain object with a forged Symbol.toStringTag is an object (JSON)`, function() {
        let a = { x: 1, [Symbol.toStringTag]: 'String' }
        let b = { x: 2, [Symbol.toStringTag]: 'String' }
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a }], ['a']), [['{"x":1}']])
        assert.strict.deepStrictEqual(arrDiff([a], [b]).dfs, [{ p: 'modify', k: 0, vo: '{"x":1}', vn: '{"x":2}' }])
        assert.strict.deepStrictEqual(ltdtDiff([{ a }], [{ a: b }]).dfs, [{ a: { p: 'modify', k: 'a', vo: '{"x":1}', vn: '{"x":2}' } }])
        //真正之包裝物件同修前
        assert.strict.deepStrictEqual(arrDiff([new String('s'), new Number(5), new Boolean(false)], ['s', '5', 'false']).dfs.map((x) => x.p), ['', '', '']) // eslint-disable-line no-new-wrappers
    })

    it(`〈十-2〉〈四-12〉〈五-1〉(外審T10) should treat an opt that is not a plain object (array, Date) as not given for opt.empty and opt.emptyHead (dspec §4 V4)`, function() {
        let ao = []
        ao.empty = 'wrong'
        ao.emptyHead = 'wrong'
        assert.strict.deepStrictEqual(matConcat([[1], []], [], ao), [[1], [null]])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{}], ['a'], ao), [['']])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a', 'b'], { a: 'A' }, ao), [['A', ''], [1, '']])
        let dobj = new Date(0)
        dobj.empty = 'wrong'
        assert.strict.deepStrictEqual(matConcat([[1], []], [], dobj), [[1], [null]])
    })

    it(`〈一-1〉〈二-2〉〈四-2〉〈六-1〉〈八-1〉〈九-7〉〈十-3〉〈十一-5〉(外審T13) should use the rows as checked (each row is read once), even when reading a row twice would give another value`, function() {
        assert.strict.deepStrictEqual(keysmat2ltdt(['a'], changingAt([[0]], 0, [42], null), S), { state: 'success', msg: [{ a: 42 }] })
        assert.strict.deepStrictEqual(mat2ltdt(changingAt([['a'], [0]], 1, [42], null), S), { state: 'success', msg: [{ a: 42 }] })
        assert.strict.deepStrictEqual(ltdtkeys2mat(changingAt([{}], 0, { a: 42 }, null), ['a'], S), { state: 'success', msg: [[42]] })
        assert.strict.deepStrictEqual(ltdtkeysheads2mat(changingAt([{}], 0, { a: 42 }, null), ['a'], { a: 'A' }, S), { state: 'success', msg: [['A'], [42]] })
        let bad = []
        bad.id = 1
        assert.strict.deepStrictEqual(ltdtpull([{ id: 1 }, { id: 2 }], changingAt([{}], 0, { id: 2 }, bad), 'id'), [{ id: 1 }])
        assert.strict.deepStrictEqual(ltdtpull(changingAt([{}], 0, { id: 3 }, null), [{ id: 1 }], 'id'), [{ id: 3 }])
        assert.strict.deepStrictEqual(matConcat(changingAt([[0]], 0, [1], 'x'), []), [[1]])
        assert.strict.deepStrictEqual(matat(changingAt([[0]], 0, [1, 2], null), 0), [[1]])
        assert.strict.deepStrictEqual(matDiff(changingAt([[0]], 0, [1], null), [[1]]).dfs, [[{ p: '', k: 0, vo: '1', vn: '' }]])
        assert.strict.deepStrictEqual(ltdtDiff(changingAt([{ b: 0 }], 0, { a: 1 }, null), [{ a: 1 }]).dfs, [{ a: { p: '', k: 'a', vo: '1', vn: '' } }])
    })

    it(`〈六-3〉(外審T15) should output a cell of the field '__proto__' as an own field of the dfs row (not as its prototype)`, function() {
        let a = JSON.parse('{"__proto__":{"z":1,"a":2}}')
        let b = JSON.parse('{"__proto__":{"z":1,"a":3}}')
        let row = ltdtDiff([a], [b]).dfs[0]
        assert.strict.deepStrictEqual(Object.keys(row), ['__proto__'])
        assert.strict.deepStrictEqual(Object.getPrototypeOf(row), Object.prototype)
        assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(row, '__proto__').value, { p: 'modify', k: '__proto__', vo: '{"a":2,"z":1}', vn: '{"a":3,"z":1}' })
    })

})
