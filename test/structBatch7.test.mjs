import assert from 'assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import arrDiff from '../src/arrDiff.mjs'
import arrFilterByENum from '../src/arrFilterByENum.mjs'
import arrReverse from '../src/arrReverse.mjs'
import arrSep from '../src/arrSep.mjs'
import ltdtDiff from '../src/ltdtDiff.mjs'
import ltdtpull from '../src/ltdtpull.mjs'
import matConcat from '../src/matConcat.mjs'
import matDiff from '../src/matDiff.mjs'
import matat from '../src/matat.mjs'
import treeObj from '../src/treeObj.mjs'
import objSortByKeys from '../src/objSortByKeys.mjs'
import treeToFilepath from '../src/treeToFilepath.mjs'
import arrFind from '../src/arrFind.mjs'
import filepathToTree from '../src/filepathToTree.mjs'
import ltdtDiffByKey from '../src/ltdtDiffByKey.mjs'
import addExcelWorksheetFromData from '../src/addExcelWorksheetFromData.mjs'
import arrGroupByMaxmin from '../src/arrGroupByMaxmin.mjs'
import arrInsert from '../src/arrInsert.mjs'
import arrLookupByMaxmin from '../src/arrLookupByMaxmin.mjs'
import arrPull from '../src/arrPull.mjs'
import arrPullAt from '../src/arrPullAt.mjs'
import arrReduce from '../src/arrReduce.mjs'
import arrSort from '../src/arrSort.mjs'
import binstr from '../src/binstr.mjs'
import convertToTree from '../src/convertToTree.mjs'
import flattenToConn from '../src/flattenToConn.mjs'
import flattenTree from '../src/flattenTree.mjs'
import getExcelU8ArrFromData from '../src/getExcelU8ArrFromData.mjs'
import strFindFuzz from '../src/strFindFuzz.mjs'
import getTimeBetween from '../src/getTimeBetween.mjs'
import getTimeObject from '../src/getTimeObject.mjs'
import getFileAccept from '../src/getFileAccept.mjs'
import oc from '../src/color.mjs'


//第492項第7批(ws492h): 結構運算與參數定義
//  W-16乙(使用者2026-11-16): C7結構運算之第1參數型別不對一律回輸出型別之空結果, 不拋錯; 次參數依各函數既有裁定(仍throw); 元素層不變
//  W-19(比照第三批): 單一空元素之陣列([null]、[{}]、[''])視為一個元素, 依各函數語意保留、佔位或拋錯, 不得靜默丟棄
//  W-06: 簽名預設或JSDoc []才算opt, 簽名、JSDoc、行為一致(execCliJsonRpc.requests; domCompareText.title)
//  W-13: 超出範圍一律改用預設(K3): color.spreadHue/spreadMonochromatic之num(use: 'count'且>=1)、domDrag.timeDragStartDelay、domConvertToPic.scale(此二者之案例於各自測試檔)
//  N-B: 帶預設值之位置參數視同opt(binstr.mode、getTimeBetween.unit、getTimeObject.unit、getFileAccept.groupBy、strFindFuzz.strkey之數值)
//  對應規格: dspec〈輸入參數之檢測機制〉§11(C7第1參數、W-13、N-B)、K2、K3、K4、K7、V10、V19、V20、V22(JSDoc)
let dirTest = dirname(fileURLToPath(import.meta.url))
let readSrc = (name) => readFileSync(join(dirTest, '..', 'src', `${name}.mjs`), 'utf8')


//第1參數無效之值([label, value]): 非陣列(含未給)
const NOT_ARR = [
    ['undefined', undefined],
    ['null', null],
    [`''`, ''],
    [`'abc'`, 'abc'],
    ['5', 5],
    ['0', 0],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['true', true],
    ['{}', {}],
    ['{ a: 1 }', { a: 1 }],
    ['{ length: 1, 0: 1 }', { length: 1, 0: 1 }],
    ['function', () => []],
    ['Symbol()', Symbol('s')],
    ['1n', 1n],
    ['new Date(0)', new Date(0)],
    ['new Map()', new Map()],
    ['new Uint8Array(2)', new Uint8Array(2)],
]

const EMPTY_DIFF = { diff: [], dfs: [] }


describe(`W-16乙: C7結構運算第1參數型別不對回輸出型別之空結果, 不拋錯(ws492h)`, function() {

    //[函數名, 以第1參數v及其餘有效參數呼叫, 空結果之產生器, 額外之第1參數無效值]
    let rows = [
        ['arrDiff', (v) => arrDiff(v, [1]), () => ({ diff: [], dfs: [] }), []],
        ['arrFilterByENum', (v) => arrFilterByENum(v), () => [], []],
        ['arrReverse', (v) => arrReverse(v), () => [], []],
        ['arrSep', (v) => arrSep(v, { numCount: 2 }), () => [], []],
        ['ltdtDiff', (v) => ltdtDiff(v, [{ a: 1 }]), () => ({ diff: [], dfs: [] }), []],
        ['ltdtpull', (v) => ltdtpull(v, [{ id: 1 }], 'id'), () => [], []],
        ['matConcat', (v) => matConcat(v, [[1]]), () => [], []],
        ['matDiff', (v) => matDiff(v, [[1]]), () => ({ diff: [], dfs: [] }), []],
        ['matat', (v) => matat(v, 0), () => [], []],
        ['objSortByKeys', (v) => objSortByKeys(v, ['a']), () => ({}), [['[]', []], ['[1]', [1]], ['[{ a: 1 }]', [{ a: 1 }]]]], //物件為有效第1參數, 故另以陣列等為無效值
        ['treeToFilepath', (v) => treeToFilepath(v), () => [], []],
        ['filepathToTree', (v) => filepathToTree(v), () => ({ treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }), []],
        ['ltdtDiffByKey', (v) => ltdtDiffByKey(v, [{ id: 1 }], 'id'), () => ({ del: [], add: [], same: [], diff: [], infor: {} }), []],
    ]

    for (let [name, call, mkEmpty, extra] of rows) {
        let invalids = NOT_ARR
        if (name === 'objSortByKeys') {
            invalids = NOT_ARR.filter(([lb]) => lb !== '{}' && lb !== '{ a: 1 }' && lb !== '{ length: 1, 0: 1 }') //此三者為物件, 對objSortByKeys為有效第1參數
        }
        if (name === 'ltdtDiffByKey') {
            invalids = NOT_ARR.filter(([lb]) => lb !== '{}' && lb !== '{ a: 1 }' && lb !== '{ length: 1, 0: 1 }') //物件視為單筆(元素層另有檢測)
        }
        for (let [lb, v] of [...invalids, ...extra]) {
            it(`${name}: should return the empty result without throwing when the 1st parameter is ${lb}`, function() {
                let r = call(v)
                assert.strict.deepStrictEqual(r, mkEmpty())
            })
        }

        it(`${name}: should return a new empty result each call (not a shared object)`, function() {
            let r1 = call(undefined)
            let r2 = call(undefined)
            assert.notStrictEqual(r1, r2)
            assert.strict.deepStrictEqual(r1, r2)
        })
    }

    it(`should not check the other required parameters when the 1st parameter is invalid (the empty result comes first)`, function() {
        assert.strict.deepStrictEqual(arrDiff('x', 5), EMPTY_DIFF)
        assert.strict.deepStrictEqual(matDiff('x', 5), EMPTY_DIFF)
        assert.strict.deepStrictEqual(ltdtDiff('x', 5), EMPTY_DIFF)
        assert.strict.deepStrictEqual(arrSep('x', 0), [])
        assert.strict.deepStrictEqual(ltdtpull('x', 'y', ''), [])
        assert.strict.deepStrictEqual(matConcat('x', 'y'), [])
        assert.strict.deepStrictEqual(matat('x', 'y'), [])
        assert.strict.deepStrictEqual(objSortByKeys('x', 'y'), {})
    })

    //次參數依各函數既有裁定(仍throw), 於第1參數有效時
    it(`should keep throwing for an invalid 2nd required parameter when the 1st parameter is valid (per-function rulings unchanged)`, function() {
        assert.throws(() => arrDiff([], null), { message: 'invalid arrNew: must be an array' })
        assert.throws(() => matDiff([], 'x'), { message: 'invalid matNew: must be an array' })
        assert.throws(() => ltdtDiff([], 'x'), { message: 'invalid ltdtNew: must be an array' })
        assert.throws(() => ltdtpull([], 'x', 'id'), { message: 'invalid ltdtDel: must be an array' })
        assert.throws(() => ltdtpull([], [], ''), { message: 'invalid key: must be a non-empty string or a finite number' })
        assert.throws(() => matConcat([], 'x'), { message: 'invalid mat2: must be an array' })
        assert.throws(() => matat([], 'x'), { message: 'invalid istart: must be an integer index' })
        assert.throws(() => arrSep([], 0), { message: 'invalid opt: must be an object with numCount or numGroup' })
        assert.throws(() => arrSep([], {}), { message: 'invalid opt: must be an object with numCount or numGroup' })
        assert.throws(() => objSortByKeys({}, 'x'), { message: 'invalid keys: must be an array' })
    })

    //元素層(陣列內之無效元素)依第二批「元素層依用途」不變
    it(`should keep the element-level rulings unchanged (throw naming the index)`, function() {
        assert.throws(() => matat([1], 0), { message: 'invalid mat[0]: must be an array' })
        assert.throws(() => matConcat([1], [[1]]), { message: 'invalid mat1[0]: must be an array' })
        assert.throws(() => matDiff([1], [[1]]), { message: 'invalid matOld[0]: must be an array' })
        assert.throws(() => ltdtDiff([1], [{ a: 1 }]), { message: 'invalid ltdtOld[0]: must be a non-empty object' })
        assert.throws(() => ltdtpull([1], [], 'id'), { message: 'invalid ltdtAll[0]: must be an object' })
        assert.throws(() => treeToFilepath([null]), { message: 'invalid data[0]: must be an object' })
        assert.throws(() => treeToFilepath([{}, 1]), { message: 'invalid data[1]: must be an object' })
        assert.throws(() => arrDiff([1], [[2]], { mode: 'matrix' }), { message: `invalid arrOld[0]: must be an array when opt.mode is 'matrix'` })
    })

    //已核實現況即符合者(不改程式), 以測試鎖定
    describe(`already conforming (verified, locked without code change)`, function() {

        it(`treeObj: never throws and passes a non-container value through the hook (data accepts any value by design)`, function() {
            for (let [, v] of NOT_ARR) {
                assert.doesNotThrow(() => treeObj(v))
            }
            assert.strict.strictEqual(treeObj(5), 5)
            assert.strict.strictEqual(treeObj(undefined), undefined)
            assert.strict.deepStrictEqual(treeObj('abc', (value) => value + '!'), 'abc!')
        })

        it(`arrFind: never throws; undefined, null, '', NaN and {} give []; a scalar is documented to be wrapped as one element (not a type error)`, function() {
            for (let [, v] of NOT_ARR) {
                assert.doesNotThrow(() => arrFind(v, 1))
            }
            for (let v of [undefined, null, '', NaN, {}]) {
                assert.strict.deepStrictEqual(arrFind(v, 1), [])
            }
            assert.strict.deepStrictEqual(arrFind('abc', 'abc'), [0]) //JSDoc: vall為任意資料陣列, 非陣列自動轉陣列
            assert.strict.deepStrictEqual(arrFind(5, 1), [-1])
            assert.ok(readSrc('arrFind').includes('{String|Number|Object|Boolean|Array} vall'))
        })

    })

})


describe(`W-19: 單一空元素([null]、[undefined]、[{}]、[''])視為一個元素, 不得被當成空陣列而丟棄(ws492h)`, function() {

    let ONE = [
        ['[null]', [null]],
        ['[undefined]', [undefined]],
        [`['']`, ['']],
        ['[{}]', [{}]],
        ['[[]]', [[]]],
        ['[NaN]', [NaN]],
    ]

    for (let [lb, a] of ONE) {
        let v = a[0]

        it(`arrReverse: should keep ${lb} as one element`, function() {
            assert.strict.deepStrictEqual(arrReverse(a), [v])
        })

        it(`arrSep: should keep ${lb} as one element (numCount and numGroup)`, function() {
            assert.strict.deepStrictEqual(arrSep(a, { numCount: 2 }), [[v]])
            assert.strict.deepStrictEqual(arrSep(a, { numGroup: 2 }), [[v], []])
        })

        it(`arrSort: should keep ${lb} as one element (null goes last by N1; the only element stays), returnIndex gives [0]`, function() {
            assert.strict.deepStrictEqual(arrSort(a), [v])
            assert.strict.deepStrictEqual(arrSort(a, { returnIndex: true }), [0])
        })

        it(`arrPull: should keep ${lb} as vall (nothing equal is pulled) and pull ${lb}'s null/'' value when it is vpull`, function() {
            assert.strict.deepStrictEqual(arrPull(a, [1]), [v])
            assert.strict.deepStrictEqual(arrPull([1, null, 2, '', {}], a).length, v === null ? 4 : v === '' ? 4 : 5) //僅null與''(SameValueZero)被移除; {}、[]、NaN以參照/值比對
        })

        it(`arrPullAt: should keep ${lb} as vall when its index is not pulled, and pull it by index 0`, function() {
            assert.strict.deepStrictEqual(arrPullAt(a, [1]), [v])
            assert.strict.deepStrictEqual(arrPullAt(a, [0]), [])
        })

        it(`arrReduce: should call fun with the only element of ${lb}`, function() {
            let calls = []
            let r = arrReduce(a, (vTemp, vNow) => {
                calls.push([vTemp, vNow])
                return 'x'
            })
            assert.strict.deepStrictEqual(calls.length, 1)
            assert.strict.deepStrictEqual(calls[0][0], null)
            assert.strict.deepStrictEqual(r, 'x')
        })

        it(`arrGroupByMaxmin: should return the groups (without items) for arr ${lb}, and throw for maxmins ${lb} like [null, null]`, function() {
            assert.strict.deepStrictEqual(arrGroupByMaxmin(a, [{ min: 0, max: 5 }]), [{ min: 0, max: 5 }])
            assert.throws(() => arrGroupByMaxmin([1], a), { message: 'invalid maxmins[0].max: must be a valid number' })
        })

        it(`arrLookupByMaxmin: should return [] for arr ${lb} by the object-array rule (same as two such elements), and throw for maxmins ${lb}`, function() {
            assert.strict.deepStrictEqual(arrLookupByMaxmin(a, [{ min: 0, max: 5 }]), [])
            assert.strict.deepStrictEqual(arrLookupByMaxmin([v, v], [{ min: 0, max: 5 }]), [])
            assert.throws(() => arrLookupByMaxmin([{ value: 1 }], a), { message: 'invalid maxmins[0].max: must be a valid number' })
        })

        it(`flattenToConn: should output one node for ${lb}`, function() {
            let r = flattenToConn(a)
            assert.strict.deepStrictEqual(r.length, 1)
            assert.strict.deepStrictEqual(r[0].id, '0')
            assert.strict.deepStrictEqual(r[0].key, 0)
        })

        it(`convertToTree: should output a tree with one child for ${lb}`, function() {
            let r = convertToTree(a)
            assert.strict.deepStrictEqual(r.length, 1)
            assert.strict.deepStrictEqual(r[0].numOfChilren, 1)
            assert.strict.deepStrictEqual(r[0].children.length, 1)
        })

        it(`binstr: should return false for keys ${lb} (an invalid key element, same as two such elements), not by being treated as empty`, function() {
            assert.strict.deepStrictEqual(binstr('abc', a), false)
            assert.strict.deepStrictEqual(binstr('abc', a, 'all'), false)
            assert.strict.deepStrictEqual(binstr('abc', [v, v]), false)
        })

        it(`strFindFuzz: should join ${lb} into the text (one element) instead of treating it as no data`, function() {
            assert.strict.deepStrictEqual(strFindFuzz(a, ''), true) //關鍵字''符合任何文字; 修前[null]被當無資料而回false
            assert.strict.deepStrictEqual(strFindFuzz(a, '', true), 100)
            assert.strict.deepStrictEqual(strFindFuzz([], ''), false) //空陣列仍為無資料
        })
    }

    it(`arrReverse and arrSort and arrSep: an empty array is still an empty result`, function() {
        assert.strict.deepStrictEqual(arrReverse([]), [])
        assert.strict.deepStrictEqual(arrSort([]), [])
        assert.strict.deepStrictEqual(arrSort([], { returnIndex: true }), [])
        assert.strict.deepStrictEqual(arrSep([], { numCount: 2 }), [])
        assert.strict.deepStrictEqual(arrPull([], [1]), [])
        assert.strict.deepStrictEqual(arrPullAt([], [0]), [])
        assert.strict.deepStrictEqual(arrReduce([], () => 1), null)
        assert.strict.deepStrictEqual(arrReduce([], () => 1, { returnIndex: true }), null)
        assert.strict.deepStrictEqual(arrGroupByMaxmin([], [{ min: 0, max: 5 }]), [])
        assert.strict.deepStrictEqual(arrLookupByMaxmin([], [{ min: 0, max: 5 }]), [])
        assert.strict.deepStrictEqual(flattenToConn([]), [])
        assert.strict.deepStrictEqual(convertToTree([]), [])
        assert.strict.deepStrictEqual(binstr('abc', []), false)
        assert.strict.deepStrictEqual(binstr('abc', [], 'all'), false)
    })

    it(`arrPull: a single '' or null vpull value removes '' or null; a single {} removes nothing`, function() {
        assert.strict.deepStrictEqual(arrPull([1, '', 2, null], ''), [1, 2, null])
        assert.strict.deepStrictEqual(arrPull([1, '', 2, null], ['']), [1, 2, null])
        assert.strict.deepStrictEqual(arrPull([1, '', 2, null], [null]), [1, '', 2])
        assert.strict.deepStrictEqual(arrPull([1, {}, 2], {}), [1, {}, 2])
        assert.strict.deepStrictEqual(arrPull([1, {}, 2], [{}]), [1, {}, 2])
    })

    it(`getExcelU8ArrFromData: ${[`[null]`, `['']`, `[{}]`].join(', ')} are no longer reported as an invalid empty data error (they are one element), an empty array still is (message ws492j V19, formerly 'no data')`, async function() {
        assert.strict.deepStrictEqual(await getExcelU8ArrFromData([]), { error: 'invalid data: must be a non-empty array' })
        assert.strict.deepStrictEqual(await getExcelU8ArrFromData(null), { error: 'invalid data: must be a non-empty array' })
        for (let a of [[null], [''], [{}], [undefined], [[]], [NaN]]) {
            let r = await getExcelU8ArrFromData(a)
            assert.notDeepStrictEqual(r, { error: 'invalid data: must be a non-empty array' })
        }
        let r2 = await getExcelU8ArrFromData([''])
        assert.ok(r2 instanceof Uint8Array)
        assert.strict.deepStrictEqual([r2[0], r2[1]], [80, 75]) //xlsx為zip容器, 開頭'PK'
        let r3 = await getExcelU8ArrFromData([null, null])
        let r4 = await getExcelU8ArrFromData([null])
        assert.strict.deepStrictEqual('error' in r4, 'error' in r3) //單一空元素與多個空元素同一流程
    })

    //已核實原即未被當成空陣列者(不改程式), 以測試鎖定
    describe(`already not swallowed (verified, locked without code change)`, function() {

        it(`addExcelWorksheetFromData: [null], [{}], [''] stay as rows (guard is isarr), an empty array adds an empty sheet`, function() {
            for (let [, a] of ONE) {
                let wb = addExcelWorksheetFromData({ sheets: [] }, a, 's')
                assert.strict.deepStrictEqual(wb.sheets.length, 1)
                assert.strict.deepStrictEqual(wb.sheets[0].rows.length, 1)
            }
            assert.strict.deepStrictEqual(addExcelWorksheetFromData({ sheets: [] }, [], 's').sheets[0].rows, [])
        })

        it(`arrInsert: a single empty element is kept and shifted`, function() {
            for (let [, a] of ONE) {
                assert.strict.deepStrictEqual(arrInsert(a, 0, ['x']), ['x', a[0]])
                assert.strict.deepStrictEqual(arrInsert([1, 2], 1, a), [1, a[0], 2])
            }
        })

        it(`flattenTree: the result of a single empty element equals that of several (a node without id is never output), not because of an emptiness check`, function() {
            for (let [, a] of ONE) {
                assert.strict.deepStrictEqual(flattenTree(a), flattenTree([a[0], a[0]]))
            }
            assert.strict.deepStrictEqual(flattenTree([{ id: 1 }]).length, 1)
        })

        it(`objSortByKeys: keys with a single empty element keep every key of obj in the original order (non string/number elements are ignored)`, function() {
            for (let [, a] of ONE) {
                assert.strict.deepStrictEqual(Object.keys(objSortByKeys({ b: 1, a: 2 }, a)), ['b', 'a'])
                assert.strict.deepStrictEqual(Object.keys(objSortByKeys({ b: 1, a: 2 }, a, { onlyKeys: true })), [])
            }
        })

        it(`treeToFilepath: [null], [''], [[]] throw naming data[0] (element level), [{}] gives []`, function() {
            for (let a of [[null], [undefined], [''], [[]], [NaN]]) {
                assert.throws(() => treeToFilepath(a), { message: 'invalid data[0]: must be an object' })
            }
            assert.strict.deepStrictEqual(treeToFilepath([{}]), [])
        })

    })

    describe(`JSDoc states the single-empty-element rule`, function() {

        for (let name of ['arrReverse', 'arrSep', 'arrSort', 'arrPull', 'arrPullAt', 'arrReduce', 'arrGroupByMaxmin', 'arrLookupByMaxmin', 'binstr', 'strFindFuzz', 'convertToTree', 'flattenToConn', 'getExcelU8ArrFromData']) {
            it(`${name}: JSDoc mentions the single empty element ([null]、['']、[{}])`, function() {
                let s = readSrc(name)
                assert.ok(s.includes('單一空元素'), name)
            })
        }

    })

})


describe(`W-06: 簽名、JSDoc、行為一致(ws492h)`, function() {

    //判定原則(dspec §11 第221項第5項): 簽名預設或JSDoc []才算opt, 程式碼回退不單獨作依據 → domCompareText.title(無預設、未標可選)為必須參數, 無效即拋
    it(`domCompareText: title is a required parameter (no signature default, JSDoc not bracketed) and the code throws for an invalid title, so the three agree`, function() {
        let s = readSrc('domCompareText')
        assert.ok(/@param \{String\} title /.test(s))
        assert.ok(!s.includes(`[title=`))
        assert.ok(s.includes(`'invalid title: must be a non-empty string'`))
        assert.ok(!s.includes(`title = 'Text'`)) //程式碼之回退已移除
        assert.ok(/function domCompareText\(ele, title, strOld, strNew, opt = \{\}\)/.test(s)) //簽名title無預設
    })

    it(`execCliJsonRpc: JSDoc says a non-array requests is treated as not given (default [])`, function() {
        let s = readSrc('execCliJsonRpc')
        assert.ok(s.includes('@param {Array} [requests=[]]'))
        assert.ok(s.includes('非陣列(含null、字串、物件)視為未給而改用預設[]'))
        assert.ok(!s.includes(`'requests 須為陣列'`))
    })

    it(`fsCreateFile and fsCreateFileCore: data is documented as optional with default '' in both (verified)`, function() {
        assert.ok(readSrc('fsCreateFile').includes(`[data='']`))
        assert.ok(readSrc('fsCreateFileCore').includes(`[data='']`))
    })

    it(`domTooltip: content is documented as optional (verified)`, function() {
        assert.ok(readSrc('domTooltip').includes('@param {String} [content]'))
    })

})


describe(`W-13: color.spreadHue / spreadMonochromatic 之 num 限 1~4294967295, 超出範圍改用預設1(ws492h)`, function() {

    for (let fn of ['spreadHue', 'spreadMonochromatic']) {

        it(`${fn}: should return one formatted color (not the raw rgba object) for num out of range 0, negative, over 4294967295`, function() {
            for (let n of [0, -1, -3, '0', ' -2 ', 4294967296, '4294967296', 1e10, Number.MAX_SAFE_INTEGER, 1, '1']) {
                let r = oc[fn]('#336699', n)
                assert.strict.deepStrictEqual(r.length, 1, `num=${String(n)}`)
                assert.strict.deepStrictEqual(typeof r[0], 'string', `num=${String(n)}`)
                assert.strict.deepStrictEqual(r[0], oc.toRgbString('#336699'), `num=${String(n)}`)
            }
        })

        it(`${fn}: should apply fmtOutput to the one-color default (and detect an invalid fmtOutput there as well)`, function() {
            assert.strict.deepStrictEqual(oc[fn]('#336699', 0, 'toHexString'), [oc.toHexString('#336699')])
            assert.strict.deepStrictEqual(oc[fn]('#336699', -5, 'toRgbaString'), [oc.toRgbaString('#336699')])
            assert.throws(() => oc[fn]('#336699', 1, 'nope'), { message: 'invalid fmtOutput: must be one of the output formats' })
            assert.throws(() => oc[fn]('#336699', 0, 'nope'), { message: 'invalid fmtOutput: must be one of the output formats' })
        })

        it(`${fn}: should still produce num colors for the valid range and accept numeric strings`, function() {
            assert.strict.deepStrictEqual(oc[fn]('#336699', 3).length, 3)
            assert.strict.deepStrictEqual(oc[fn]('#336699', ' 4 ').length, 4)
            assert.strict.deepStrictEqual(oc[fn]('#336699', '5e0').length, 5)
            assert.strict.deepStrictEqual(oc[fn]('#336699', 2).length, 2)
        })

        it(`${fn}: should still throw invalid num for a non-integer or non-number (a required parameter keeps its type check)`, function() {
            for (let v of [0.5, -1.5, 'abc', '', null, undefined, true, NaN, [3], {}, 3n, '1.5']) {
                assert.throws(() => oc[fn]('#336699', v), { message: 'invalid num: must be an integer' }, String(v))
            }
        })

    }

    it(`should state the range and the default in the color JSDoc`, function() {
        let s = readSrc('color')
        assert.ok(s.includes('個數範圍為1至4294967295'))
        assert.ok(s.includes('超出範圍(0、負數、超過4294967295)視為未給而改用預設1'))
    })

})


describe(`N-B: 帶預設值之位置參數視同opt(ws492h)`, function() {

    describe(`binstr.mode: not 'anyone' or 'all' is treated as not given (default 'anyone')`, function() {

        for (let [lb, v] of [['null', null], ['undefined', undefined], ['5', 5], ['true', true], ['{}', {}], ['[]', []], [`'foo'`, 'foo'], [`'All'`, 'All'], [`''`, ''], ['NaN', NaN], [`new String('all')`, new String('all')]]) { // eslint-disable-line no-new-wrappers
            it(`should use 'anyone' when mode is ${lb}`, function() {
                assert.strict.deepStrictEqual(binstr('abc', ['a', 'z'], v), true) //anyone: 任一出現
                assert.strict.deepStrictEqual(binstr('abc', ['x', 'z'], v), false)
            })
        }

        it(`should keep the two valid modes`, function() {
            assert.strict.deepStrictEqual(binstr('abc', ['a', 'z'], 'all'), false)
            assert.strict.deepStrictEqual(binstr('abc', ['a', 'b'], 'all'), true)
            assert.strict.deepStrictEqual(binstr('abc', ['a', 'z'], 'anyone'), true)
        })

        it(`should not change the other checks (s and keys)`, function() {
            assert.strict.deepStrictEqual(binstr('', ['a']), false)
            assert.strict.deepStrictEqual(binstr('abc', 'ab'), true)
            assert.strict.deepStrictEqual(binstr('abc', ''), false)
            assert.strict.deepStrictEqual(binstr('abc', 5), false)
        })

    })

    describe(`strFindFuzz.strkey: a finite number equals its string form (K4/K7)`, function() {

        it(`should give the same result for 3 and '3' (boolean and score)`, function() {
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], 3), strFindFuzz(['x3'], '3'))
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], 3), true)
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], 3, true), strFindFuzz(['x3'], '3', true))
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], 3, true), 100)
            assert.strict.deepStrictEqual(strFindFuzz(['x4'], 3, true), strFindFuzz(['x4'], '3', true))
            assert.strict.deepStrictEqual(strFindFuzz([12.5, 'a'], 12.5), true)
            assert.strict.deepStrictEqual(strFindFuzz(['abc'], 12345), strFindFuzz(['abc'], '12345'))
            assert.strict.deepStrictEqual(strFindFuzz(['abc'], 12345), false)
            assert.strict.deepStrictEqual(strFindFuzz('abc0', 0), strFindFuzz('abc0', '0'))
        })

        it(`should keep NaN and Infinity as invalid keywords`, function() {
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], NaN), false)
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], NaN, true), 0)
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], undefined), false)
            assert.strict.deepStrictEqual(strFindFuzz(['x3'], null, true), 0)
        })

    })

    describe(`getTimeBetween.unit and getTimeObject.unit: an unexpected unit is treated as not given (default 'days')`, function() {

        let BAD = [['null', null], ['undefined', undefined], ['5', 5], ['true', true], ['{}', {}], ['[]', []], [`'foo'`, 'foo'], [`'Days'`, 'Days'], [`''`, ''], ['NaN', NaN], [`new String('days')`, new String('days')], [`'constructor'`, 'constructor']] // eslint-disable-line no-new-wrappers

        for (let [lb, v] of BAD) {
            it(`getTimeBetween: should use 'days' when unit is ${lb}`, function() {
                assert.strict.deepStrictEqual(getTimeBetween('2019-01-01', '2019-01-03', v), ['2019-01-01', '2019-01-02', '2019-01-03'])
                assert.strict.deepStrictEqual(getTimeBetween('2019-01-03', '2019-01-01', v), []) //起訖相反仍為[]
                assert.strict.deepStrictEqual(getTimeBetween('2019', '2021', v), []) //格式與days不符(非unit無效)
            })

            it(`getTimeObject: should use 'days' when unit is ${lb}`, function() {
                let o = getTimeObject('2019-01-01', v)
                assert.ok(o !== null)
                assert.strict.deepStrictEqual(o.format('YYYY-MM-DD'), '2019-01-01')
                assert.strict.deepStrictEqual(getTimeObject('2019', v), null) //格式與days不符
            })
        }

        it(`should keep the six valid units`, function() {
            assert.strict.deepStrictEqual(getTimeBetween('2017', '2019', 'years'), ['2017', '2018', '2019'])
            assert.strict.deepStrictEqual(getTimeBetween('2019-01', '2019-03', 'months'), ['2019-01', '2019-02', '2019-03'])
            assert.strict.deepStrictEqual(getTimeBetween('2019-01-01T01', '2019-01-01T03', 'hours'), ['2019-01-01T01', '2019-01-01T02', '2019-01-01T03'])
            assert.strict.deepStrictEqual(getTimeBetween('2019-01-01T01:01', '2019-01-01T01:03', 'minutes').length, 3)
            assert.strict.deepStrictEqual(getTimeBetween('2019-01-01T01:01:01', '2019-01-01T01:01:03', 'seconds').length, 3)
            assert.ok(getTimeObject('2019-01-01T12:34:56', 'seconds') !== null)
            assert.strict.deepStrictEqual(getTimeObject('2019-01-01', 'hours'), null)
        })

        it(`should still return [] / null for an invalid time (t, tstart, tend)`, function() {
            assert.strict.deepStrictEqual(getTimeBetween('x', '2019-01-03'), [])
            assert.strict.deepStrictEqual(getTimeBetween('2019-01-01', 5), [])
            assert.strict.deepStrictEqual(getTimeObject(5), null)
            assert.strict.deepStrictEqual(getTimeObject('2019-13-45'), null)
        })

    })

    describe(`getFileAccept.groupBy: an unexpected value is treated as not given (default '', no grouping)`, function() {

        let base = getFileAccept()

        it(`should return the array for an unexpected groupBy`, function() {
            assert.ok(Array.isArray(base) && base.length > 0)
            for (let v of [null, undefined, 5, true, {}, [], 'foo', 'Name', 'toString', 'constructor', NaN, new String('acp')]) { // eslint-disable-line no-new-wrappers
                assert.strict.deepStrictEqual(getFileAccept(v), base, String(v))
            }
        })

        it(`should keep grouping by the four valid keys`, function() {
            for (let k of ['name', 'group', 'acp', 'exec']) {
                let r = getFileAccept(k)
                assert.ok(!Array.isArray(r), k)
                let n = 0
                for (let key of Object.keys(r)) {
                    n += r[key].length
                    for (let it of r[key]) {
                        assert.strict.deepStrictEqual(it[k], key)
                    }
                }
                assert.strict.deepStrictEqual(n, base.length)
            }
        })

    })

})
