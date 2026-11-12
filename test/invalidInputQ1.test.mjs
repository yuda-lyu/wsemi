import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dig from '../src/dig.mjs'
import digExp from '../src/digExp.mjs'
import cfilesize from '../src/cfilesize.mjs'
import cfinancial from '../src/cfinancial.mjs'
import day2cht from '../src/day2cht.mjs'
import addMonth from '../src/addMonth.mjs'
import getTimeRange from '../src/getTimeRange.mjs'
import preciseNum from '../src/preciseNum.mjs'
import judge from '../src/judge.mjs'
import estimateTicks from '../src/estimateTicks.mjs'
import color from '../src/color.mjs'
import genID from '../src/genID.mjs'
import randomIntRange from '../src/randomIntRange.mjs'
import randomRange from '../src/randomRange.mjs'
import randomIntsRange from '../src/randomIntsRange.mjs'
import randomIntsNdpRange from '../src/randomIntsNdpRange.mjs'
import randomsRange from '../src/randomsRange.mjs'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'
import pseudoRandomRange from '../src/pseudoRandomRange.mjs'
import pseudoRandomIntsRange from '../src/pseudoRandomIntsRange.mjs'
import pseudoRandomIntsNdpRange from '../src/pseudoRandomIntsNdpRange.mjs'
import pseudoRandomsRange from '../src/pseudoRandomsRange.mjs'
import strleft from '../src/strleft.mjs'
import strright from '../src/strright.mjs'
import strmid from '../src/strmid.mjs'
import strdelleft from '../src/strdelleft.mjs'
import strdelright from '../src/strdelright.mjs'
import trim from '../src/trim.mjs'
import replace from '../src/replace.mjs'
import sep from '../src/sep.mjs'
import split from '../src/split.mjs'
import strTruncate from '../src/strTruncate.mjs'
import htmlEncode from '../src/htmlEncode.mjs'
import htmlDecode from '../src/htmlDecode.mjs'
import html2str from '../src/html2str.mjs'
import getFileName from '../src/getFileName.mjs'
import getFileNameExt from '../src/getFileNameExt.mjs'
import getFileTrueName from '../src/getFileTrueName.mjs'
import getPathParent from '../src/getPathParent.mjs'
import getClearPathName from '../src/getClearPathName.mjs'
import urlParse from '../src/urlParse.mjs'
import strFindSimilar from '../src/strFindSimilar.mjs'
import attstr from '../src/attstr.mjs'
import rep from '../src/rep.mjs'
import replaceObj from '../src/replaceObj.mjs'
import sepInt from '../src/sepInt.mjs'
import arr2dt from '../src/arr2dt.mjs'
import arrAt from '../src/arrAt.mjs'
import arrFilterByKeywords from '../src/arrFilterByKeywords.mjs'
import arrFilterByNum from '../src/arrFilterByNum.mjs'
import arrFind from '../src/arrFind.mjs'
import arrInsert from '../src/arrInsert.mjs'
import arrPull from '../src/arrPull.mjs'
import arrPullAt from '../src/arrPullAt.mjs'
import arrReduce from '../src/arrReduce.mjs'
import arrSort from '../src/arrSort.mjs'
import composeToTree from '../src/composeToTree.mjs'
import flattenTree from '../src/flattenTree.mjs'
import filepathToTree from '../src/filepathToTree.mjs'
import dtmapping from '../src/dtmapping.mjs'
import dtpick from '../src/dtpick.mjs'
import getltdtkeys from '../src/getltdtkeys.mjs'
import ltdtDiffByKey from '../src/ltdtDiffByKey.mjs'
import ltdtmapping from '../src/ltdtmapping.mjs'
import ltdtmerge from '../src/ltdtmerge.mjs'
import ltdtpick from '../src/ltdtpick.mjs'
import objSortBy from '../src/objSortBy.mjs'
import matat from '../src/matat.mjs'
import j2o from '../src/j2o.mjs'
import u8arr2str from '../src/u8arr2str.mjs'
import mat2ltdt from '../src/mat2ltdt.mjs'
import str2b64 from '../src/str2b64.mjs'


//排程第426項(ws426): 同步工具函數遇無效輸入之處置(使用者2026-11-12對規格第199項Q1-a～d之裁示)
//  規格: 主控dspec〈輸入參數之檢測機制〉§5.3(依函數類別)、§11 Q1-a～d、K2／K3(opt類參數非預期改用預設, 本項不改)、K9(訊息不帶值)
//  Q1-a C3格式化: 無效回''; Q1-b C8之preciseNum、judge、estimateTicks、color維持拋錯, C10隨機範圍無效即同步拋錯(genID之長度為opt類, 不拋);
//  Q1-c C5字串操作與C7非數值之結構運算: 主參數與次參數(長度、位置等)無效皆回輸出型別之空值, 不回原值; Q1-d C6編碼與序列化: 保留雙模式, 只補文件(行為不改)
//  本檔: 甲、本輪行為改變之函數(主參數、次參數各至少一案); 乙、未改變者之守門(主參數、次參數各一案, 現況即應然)


//errOf, 執行f並回傳錯誤訊息, 未拋錯回傳'NOTHROW'
function errOf(f) {
    try {
        f()
        return 'NOTHROW'
    }
    catch (err) {
        return err.message
    }
}


describe(`invalidInputQ1 甲 C7 非數值之結構運算(本輪改變)`, function() {

    it(`arrInsert: invalid ind (secondary) or ind beyond the length returns [] instead of the original array; invalid arr (main) returns [] (kept)`, function() {
        // Q1-c: 次參數(位置)無效回輸出型別之空值, 不回原值(使用者例: arrInsert位置無效不回原陣列)
        let arr = [1, 2, 3]
        for (let ind of ['x', -1, 1.5, null, undefined, Infinity, '0x1', {}, 4, '4']) {
            let r = arrInsert(arr, ind, 'z')
            assert.strict.deepStrictEqual(r, [], String(ind))
            assert.strict.deepStrictEqual(r === arr, false)
        }
        assert.strict.deepStrictEqual(arr, [1, 2, 3]) //不改動原陣列
        // items為必須參數(K2): 未給(undefined)回[](原插入undefined); null為資料照常插入
        assert.strict.deepStrictEqual(arrInsert(arr, 0), [])
        assert.strict.deepStrictEqual(arrInsert(arr, 0, undefined), [])
        assert.strict.deepStrictEqual(arrInsert(arr, 1, null), [1, null, 2, 3])
        assert.strict.deepStrictEqual(arrInsert(arr, 1, [undefined]), [1, undefined, 2, 3])
        // 主參數無效回[](現況即應然)
        assert.strict.deepStrictEqual(arrInsert(null, 0, 'z'), [])
        assert.strict.deepStrictEqual(arrInsert('abc', 0, 'z'), [])
        // 有效輸入照常(含插入於最末)
        assert.strict.deepStrictEqual(arrInsert(arr, 3, 'z'), [1, 2, 3, 'z'])
        assert.strict.deepStrictEqual(arrInsert(arr, ' 1 ', ['y', 'z']), [1, 'y', 'z', 2, 3])
    })

    it(`arrPull: invalid vpull (secondary: undefined, null, NaN, function, symbol) returns [] instead of the original array; [] removes nothing and returns a copy`, function() {
        // Q1-c: 次參數無效回[], 不回原陣列; 空陣列為合法資料(無可移除), 回傳複本(內容同原陣列)
        let arr = [1, 2, 3]
        for (let v of [undefined, null, NaN, () => 1, Symbol('x')]) {
            let r = arrPull(arr, v)
            assert.strict.deepStrictEqual(r, [], String(v))
        }
        let r0 = arrPull(arr, [])
        assert.strict.deepStrictEqual(r0, [1, 2, 3])
        assert.strict.deepStrictEqual(r0 === arr, false) //複本, 非同一參考
        // 單值(數字、字串、布林、物件)轉陣列後移除, 維持
        assert.strict.deepStrictEqual(arrPull(arr, 2), [1, 3])
        assert.strict.deepStrictEqual(arrPull(['a', 'b'], 'a'), ['b'])
        assert.strict.deepStrictEqual(arrPull([true, false], false), [true])
        // 主參數無效回[](現況即應然)
        assert.strict.deepStrictEqual(arrPull(null, [1]), [])
        assert.strict.deepStrictEqual(arrPull('abc', [1]), [])
        assert.strict.deepStrictEqual(arr, [1, 2, 3])
    })

    it(`arrPullAt: an invalid single vpull (secondary) returns [] instead of the original array; arrays (including []) are processed and invalid indexes skipped (kept)`, function() {
        // Q1-c: 次參數(位置)無效回[], 不回原陣列
        let arr = [1, 2, 3]
        for (let v of ['x', -1, 1.5, null, undefined, Infinity, '0x1', {}, true, new Number(1)]) { // eslint-disable-line no-new-wrappers
            let r = arrPullAt(arr, v)
            assert.strict.deepStrictEqual(r, [], String(v))
        }
        let r0 = arrPullAt(arr, [])
        assert.strict.deepStrictEqual(r0, [1, 2, 3])
        assert.strict.deepStrictEqual(r0 === arr, false) //複本, 非同一參考
        assert.strict.deepStrictEqual(arrPullAt(arr, ['x', 1]), [1, 3])
        assert.strict.deepStrictEqual(arrPullAt(arr, '0'), [2, 3])
        // 主參數無效回[](現況即應然)
        assert.strict.deepStrictEqual(arrPullAt(null, 0), [])
        assert.strict.deepStrictEqual(arr, [1, 2, 3])
    })

    it(`dtmapping: a non-object dt (main) returns {} instead of an object filled with def; {} is valid and fills def; invalid keys (secondary) returns {} (kept)`, function() {
        // Q1-c: 主參數無效回輸出型別之空值{}; 空物件為合法資料(各欄位填def)
        for (let dt of [undefined, null, '', 'abc', 123, NaN, true, [], [1], () => 1]) {
            assert.strict.deepStrictEqual(dtmapping(dt, ['a', 'b']), {}, String(dt))
            assert.strict.deepStrictEqual(dtmapping(dt, ['a'], 'x'), {}, String(dt))
        }
        assert.strict.deepStrictEqual(dtmapping({}, ['a', 'b']), { a: '', b: '' })
        assert.strict.deepStrictEqual(dtmapping({ a: 1 }, ['a', 'b'], null), { a: 1, b: null })
        for (let keys of [undefined, null, 'a', [], {}]) {
            assert.strict.deepStrictEqual(dtmapping({ a: 1 }, keys), {}, String(keys))
        }
    })

    it(`ltdtmapping (via dtmapping): a non-object element maps to {} instead of an object filled with def; invalid ltdt / keys returns [] (kept)`, function() {
        // dtmapping之連動: ltdtmapping逐列呼叫dtmapping, 非物件之列由{ a: '' }改為{}(位置保留)
        assert.strict.deepStrictEqual(ltdtmapping([null, { a: 1 }, 'x'], ['a']), [{}, { a: 1 }, {}])
        assert.strict.deepStrictEqual(ltdtmapping([{}, { a: 1 }], ['a']), [{ a: '' }, { a: 1 }])
        assert.strict.deepStrictEqual(ltdtmapping(null, ['a']), [])
        assert.strict.deepStrictEqual(ltdtmapping([{ a: 1 }], null), [])
    })

    let empty = { del: [], add: [], same: [], diff: [], infor: {} }
    let emptyNoInfor = { del: [], add: [], same: [], diff: [] }

    it(`ltdtDiffByKey: invalid ltdtOld / ltdtNew (main, neither array nor object) returns the empty result instead of comparing against [] (formerly e.g. all new rows were listed in add)`, function() {
        // Q1-c: 主參數無效回同形之空結果
        let ltdt = [{ id: 1, a: 1 }]
        for (let v of [undefined, null, '', 'abc', 123, NaN, true, () => 1]) {
            assert.strict.deepStrictEqual(ltdtDiffByKey(v, ltdt, 'id'), empty, `old ${String(v)}`)
            assert.strict.deepStrictEqual(ltdtDiffByKey(ltdt, v, 'id'), empty, `new ${String(v)}`)
            assert.strict.deepStrictEqual(ltdtDiffByKey(v, ltdt, 'id', { withInfor: false }), emptyNoInfor)
        }
    })

    it(`ltdtDiffByKey: invalid key (secondary) returns the empty result without console output (formerly console.log('invalid key')); an object is one row and [] is valid`, function() {
        // Q1-c: 次參數無效回同形之空結果; P5: 不以console輸出(主次參數處置一致, P3)
        let ltdt = [{ id: 1, a: 1 }]
        let logs = 0
        let lg = console.log
        console.log = () => {
            logs++
        }
        let rk
        try {
            rk = [null, '', 123, {}, []].map((key) => ltdtDiffByKey(ltdt, ltdt, key))
        }
        finally {
            console.log = lg
        }
        assert.strict.deepStrictEqual(rk, [empty, empty, empty, empty, empty])
        assert.strict.deepStrictEqual(logs, 0)
        // 物件視為單筆、空陣列合法(照常比對)
        assert.strict.deepStrictEqual(ltdtDiffByKey({ id: 1, a: 1 }, [{ id: 1, a: 2 }], 'id'), { del: [], add: [], same: [], diff: [{ id: 1, a: 2 }], infor: { 1: 'diff' } })
        assert.strict.deepStrictEqual(ltdtDiffByKey([], [{ id: 2 }], 'id'), { del: [], add: [{ id: 2 }], same: [], diff: [], infor: { 2: 'add' } })
    })

    it(`objSortBy: a non-function fun (secondary) returns {} instead of throwing; invalid obj (main) returns {} (kept); errors thrown by fun still propagate`, function() {
        // Q1-c: 次參數無效回輸出型別之空值{}, 與主參數無效之處置一致(P3)
        for (let fun of [undefined, null, 'k', 1, {}, []]) {
            assert.strict.deepStrictEqual(objSortBy({ b: 1, a: 2 }, fun), {}, String(fun))
        }
        assert.strict.deepStrictEqual(objSortBy(null, (v) => v), {})
        assert.strict.deepStrictEqual(objSortBy({ b: 1, a: 2 }, (v, k) => k), { a: 2, b: 1 })
        assert.throws(() => objSortBy({ a: 1 }, () => {
            throw new Error('boom')
        }), /boom/)
    })

})


describe(`invalidInputQ1 甲 C5 字串操作(本輪改變)`, function() {

    it(`attstr().remove: a non-string removeItemOrId (secondary) returns '' instead of the original string; '' removes nothing (kept); invalid composItems (main) returns '' (kept)`, function() {
        // Q1-c: 次參數無效回輸出型別之空值'', 不回原值; 空字串為合法之「無可移除」
        let at = attstr()
        for (let v of [undefined, null, 123, {}, [], true]) {
            assert.strict.deepStrictEqual(at.remove('abc;def', v), '', String(v))
        }
        assert.strict.deepStrictEqual(at.remove('abc;def', ''), 'abc;def')
        assert.strict.deepStrictEqual(at.remove('abc;def', 'abc'), 'def')
        assert.strict.deepStrictEqual(at.remove(null, 'abc'), '')
    })

    it(`attstr().add: a non-string composItems1 (main) or composItems2 (secondary) returns '' instead of throwing a TypeError (default mode) or keeping the other side ('1p'/'2p'); '' is valid (kept)`, function() {
        // Q1-c: 主參數與次參數無效皆回'', 不拋錯、不回原值
        let at = attstr()
        for (let v of [undefined, null, 123, {}, [], true]) {
            assert.strict.deepStrictEqual(at.add(v, 'def'), '', `main ${String(v)}`)
            assert.strict.deepStrictEqual(at.add('abc', v), '', `secondary ${String(v)}`)
            assert.strict.deepStrictEqual(at.add('abc', v, { mode: '1p' }), '', `secondary 1p ${String(v)}`)
        }
        assert.strict.deepStrictEqual(at.add('', 'abc'), 'abc')
        assert.strict.deepStrictEqual(at.add('abc', ''), 'abc')
        assert.strict.deepStrictEqual(at.add('abc', 'def'), 'abc;def')
        // parse、join之主參數無效回空值(現況即應然)
        assert.strict.deepStrictEqual(at.parse(null), [])
        assert.strict.deepStrictEqual(at.join(null), '')
    })

})


describe(`invalidInputQ1 甲 C10 隨機範圍(本輪改變)`, function() {

    let ints = [
        ['randomIntRange', (a, b) => randomIntRange(a, b)],
        ['randomIntsRange', (a, b) => randomIntsRange(a, b, 2)],
        ['randomIntsNdpRange', (a, b) => randomIntsNdpRange(a, b, 2)],
        ['pseudoRandomIntRange', (a, b) => pseudoRandomIntRange(a, b, 'k')],
        ['pseudoRandomIntsRange', (a, b) => pseudoRandomIntsRange(a, b, 2, 'k')],
        ['pseudoRandomIntsNdpRange', (a, b) => pseudoRandomIntsNdpRange(a, b, 2, 'k')],
    ]
    let reals = [
        ['randomRange', (a, b) => randomRange(a, b)],
        ['randomsRange', (a, b) => randomsRange(a, b, 2)],
        ['pseudoRandomRange', (a, b) => pseudoRandomRange(a, b, 'k')],
        ['pseudoRandomsRange', (a, b) => pseudoRandomsRange(a, b, 2, 'k')],
    ]

    for (let [name, f] of ints) {
        it(`${name}: an invalid vstart (main) or vend (secondary) throws a fixed message without the value (formerly the default was used, e.g. randomIntRange('a', 2) gave a value in [0, 2])`, function() {
            // Q1-b(2026-11-12): 隨機範圍無效即同步拋錯; K9訊息不帶值
            assert.strict.deepStrictEqual(errOf(() => f('a', 2)), 'invalid vstart: must be an integer')
            assert.strict.deepStrictEqual(errOf(() => f(1.5, 2)), 'invalid vstart: must be an integer')
            assert.strict.deepStrictEqual(errOf(() => f(0, 'secret-value')), 'invalid vend: must be an integer')
            assert.strict.deepStrictEqual(errOf(() => f(0, Infinity)), 'invalid vend: must be an integer')
            assert.strict.deepStrictEqual(errOf(() => f('a', 'b')), 'invalid vstart: must be an integer') //先檢vstart
            // 未給(undefined、null)用預設, 有效數字字串取轉換值
            assert.strict.deepStrictEqual(errOf(() => f(undefined, undefined)), 'NOTHROW')
            assert.strict.deepStrictEqual(errOf(() => f(null, null)), 'NOTHROW')
            assert.strict.deepStrictEqual(errOf(() => f(' 1 ', '3')), 'NOTHROW')
            assert.strict.deepStrictEqual(errOf(() => f(5, 3)), 'vstart[5] > vend[3]')
        })
    }

    for (let [name, f] of reals) {
        it(`${name}: an invalid vstart (main) or vend (secondary) throws a fixed message without the value (formerly the default was used)`, function() {
            // Q1-b(2026-11-12): 隨機範圍無效即同步拋錯; 實數系以isenum判定(小數有效)
            assert.strict.deepStrictEqual(errOf(() => f('a', 2)), 'invalid vstart: must be a valid number')
            assert.strict.deepStrictEqual(errOf(() => f(0, 'secret-value')), 'invalid vend: must be a valid number')
            assert.strict.deepStrictEqual(errOf(() => f(0, '0x10')), 'invalid vend: must be a valid number')
            assert.strict.deepStrictEqual(errOf(() => f(1.5, 2.5)), 'NOTHROW')
            assert.strict.deepStrictEqual(errOf(() => f(null, null)), 'NOTHROW')
            assert.strict.deepStrictEqual(errOf(() => f()), 'NOTHROW')
        })
    }

    it(`randomIntRange('a', 2) (the example of the ruling) throws instead of returning a value`, function() {
        assert.throws(() => randomIntRange('a', 2), { message: 'invalid vstart: must be an integer' })
    })

})


describe(`invalidInputQ1 乙 未改變者之守門(現況即應然)`, function() {

    it(`C3 formatting: invalid main or secondary returns '' (Q1-a; dig/digExp/cfinancial idig are opt-class and not changed here)`, function() {
        // Q1-a: 格式化無效回''(含day2cht); idig為opt類(K2/K3), digExp/cfinancial無效用0, dig之idig維持原碼(第三級, 不在本項)
        assert.strict.deepStrictEqual(dig(null, 2), '')
        assert.strict.deepStrictEqual(digExp('x', 2), '')
        assert.strict.deepStrictEqual(digExp(1234.5, 'x'), '1235')
        assert.strict.deepStrictEqual(cfilesize('x'), '')
        assert.strict.deepStrictEqual(cfinancial(null, 2), '')
        assert.strict.deepStrictEqual(cfinancial(1234.5, 'x'), '1,235')
        assert.strict.deepStrictEqual(day2cht('x'), '')
        assert.strict.deepStrictEqual(day2cht(null), '')
        assert.strict.deepStrictEqual(addMonth(null, 1), '')
        assert.strict.deepStrictEqual(addMonth('2020-01', 'x'), '')
        assert.strict.deepStrictEqual(getTimeRange(null), '')
        assert.strict.deepStrictEqual(getTimeRange('2019-01-01T09:00:00', 'x'), '')
    })

    it(`C8 preciseNum, judge, estimateTicks, color keep throwing (Q1-b)`, function() {
        assert.strict.deepStrictEqual(errOf(() => preciseNum('x')), 'v is not a number')
        assert.strict.deepStrictEqual(errOf(() => judge('x', '>', 0)), 'x1 is not a number')
        assert.strict.deepStrictEqual(errOf(() => judge(1, '>', 'x')), 'x2 is not a number')
        let lg = console.log
        console.log = () => {}
        try {
            assert.ok(errOf(() => judge(1, '??', 0)) !== 'NOTHROW')
        }
        finally {
            console.log = lg
        }
        assert.strict.deepStrictEqual(errOf(() => estimateTicks('x', 1)), 'rmin is not a number')
        assert.strict.deepStrictEqual(errOf(() => estimateTicks(0, 'x')), 'rmax is not a number')
        assert.strict.deepStrictEqual(errOf(() => color.toRgb(null)), 'color is not a string or an object')
    })

    it(`C10 genID length is an opt-class parameter and keeps using the default 32 for unexpected input (Q1-b)`, function() {
        for (let v of ['x', -1, 1.5, null, Infinity]) {
            assert.strict.deepStrictEqual(genID(v).length, 32, String(v))
        }
    })

    it(`C5 string operations: invalid main returns ''/[]/{}; invalid secondary returns the empty value, except the opt-class n of strleft/strright/strdelleft/strdelright (2026-11-02)`, async function() {
        // Q1-c: 主參數無效回輸出型別之空值
        for (let f of [(v) => strleft(v, 2), (v) => strright(v, 2), (v) => strmid(v, 1), (v) => strdelleft(v, 1), (v) => strdelright(v, 1), trim, (v) => replace(v, 'a', 'b'), (v) => strTruncate(v, 3), htmlEncode, htmlDecode, getFileName, getFileNameExt, getFileTrueName, getPathParent]) {
            assert.strict.deepStrictEqual(f(null), '')
            assert.strict.deepStrictEqual(f(123), '')
        }
        assert.strict.deepStrictEqual(await html2str(null), '')
        assert.strict.deepStrictEqual(sep(null, ','), [])
        assert.strict.deepStrictEqual(split(null, ','), [])
        assert.strict.deepStrictEqual(urlParse(null), {})
        assert.strict.deepStrictEqual(strFindSimilar(null, ['a']), {})
        assert.strict.deepStrictEqual(getClearPathName(null), { path: '', isRoot: false })
        // Q1-c: 次參數無效回空值
        assert.strict.deepStrictEqual(strmid('abcdef', 'x'), '')
        assert.strict.deepStrictEqual(replace('abc', null, 'b'), '')
        assert.strict.deepStrictEqual(replace('abc', 'a', null), '')
        assert.strict.deepStrictEqual(sep('a,b', null), [])
        assert.strict.deepStrictEqual(split('a,b', null), [])
        assert.strict.deepStrictEqual(strFindSimilar('abc', null), {})
        // opt類之n(使用者2026-11-02定: 視同opt, 非預期用預設), 不屬「次參數無效」
        assert.strict.deepStrictEqual(strleft('abc', 'x'), 'abc')
        assert.strict.deepStrictEqual(strright('abc', 'x'), 'abc')
        assert.strict.deepStrictEqual(strdelleft('abc', 'x'), 'abc')
        assert.strict.deepStrictEqual(strdelright('abc', 'x'), 'abc')
        // 使用者2026-11-02已定為拋錯者, 本輪不變(strTruncate之maxLen與本輪裁示之例相衝突, 列需裁示)
        assert.strict.deepStrictEqual(errOf(() => strTruncate('abc', -1)), 'invalid maxLen: must be a non-negative integer')
        assert.strict.deepStrictEqual(errOf(() => rep(null, 2)), 'invalid c: must be a string')
        assert.strict.deepStrictEqual(errOf(() => replaceObj('a', null)), 'invalid o: must be a plain object')
        assert.strict.deepStrictEqual(errOf(() => sepInt(10, 'x')), 'invalid n: must be a positive integer')
    })

    it(`C7 non-numeric structure operations: invalid main and secondary return the empty value (already so)`, function() {
        assert.strict.deepStrictEqual(arr2dt(null, [1]), {})
        assert.strict.deepStrictEqual(arrAt(null, 0), [])
        assert.strict.deepStrictEqual(arrAt([1, 2], 'x'), [])
        assert.strict.deepStrictEqual(arrFilterByKeywords(null, ['a']), [])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['a'], null), [])
        assert.strict.deepStrictEqual(arrFilterByNum(null), [])
        assert.strict.deepStrictEqual(arrFind(null, 1), [])
        assert.strict.deepStrictEqual(arrFind([1], null), [])
        assert.strict.deepStrictEqual(arrSort(null), [])
        assert.strict.deepStrictEqual(composeToTree(null), [])
        assert.strict.deepStrictEqual(flattenTree(null), [])
        assert.strict.deepStrictEqual(filepathToTree(null), {})
        assert.strict.deepStrictEqual(dtpick(null, ['a']), {})
        assert.strict.deepStrictEqual(dtpick({ a: 1 }, null), {})
        assert.strict.deepStrictEqual(getltdtkeys(null), [])
        assert.strict.deepStrictEqual(ltdtmerge(null, [{ a: 1 }]), [])
        assert.strict.deepStrictEqual(ltdtpick(null, ['a']), [])
        assert.strict.deepStrictEqual(ltdtpick([{ a: 1 }], null), [])
        // arrReduce輸出為任意元素(或指標), 無''/[]/{}可對應, 維持null
        assert.strict.deepStrictEqual(arrReduce(null, (t, v) => v > t), null)
        assert.strict.deepStrictEqual(arrReduce([1, 2], null), null)
        // 使用者2026-11-03已定為拋錯者, 本輪不變
        assert.strict.deepStrictEqual(errOf(() => matat([[1]], 'x')), 'invalid istart: must be an integer index')
    })

    it(`C6 encoding and serialization keep both modes (Q1-d): the default mode returns the empty value for both failure and some valid inputs, the state mode tells them apart`, function() {
        // Q1-d: 行為不改, JSDoc寫明以opt.returnWithStateAndMsg辨識失敗; 使用者例: j2o('{}')與j2o('{bad')皆回{}
        assert.strict.deepStrictEqual(j2o('{}'), {})
        assert.strict.deepStrictEqual(j2o('{bad'), {})
        assert.strict.deepStrictEqual(j2o('{}', { returnWithStateAndMsg: true }).state, 'success')
        assert.strict.deepStrictEqual(j2o('{bad', { returnWithStateAndMsg: true }).state, 'error')
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array(0)), '')
        assert.strict.deepStrictEqual(u8arr2str(null), '')
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array(0), { returnWithStateAndMsg: true }).state, 'success')
        assert.strict.deepStrictEqual(u8arr2str(null, { returnWithStateAndMsg: true }).state, 'error')
        assert.strict.deepStrictEqual(mat2ltdt([]), [])
        assert.strict.deepStrictEqual(mat2ltdt(null), [])
        assert.strict.deepStrictEqual(mat2ltdt(null, { returnWithStateAndMsg: true }).state, 'error')
        assert.strict.deepStrictEqual(str2b64(null), '')
        assert.strict.deepStrictEqual(str2b64(null, { returnWithStateAndMsg: true }).state, 'error')
    })

    it(`C6 JSDoc: each of the 39 dual-mode functions documents how to tell failure apart (Q1-d deliverable), right after its single @returns line`, function() {
        // Q1-d: 只補文件; 以檔案內容守住交付物(文件被刪回舊版即轉紅)
        let names = 'ab2blob ab2u8arr aes2str b642obj b642str b642u16arr b642u8arr bs2u8arr j2o o2j obj2b64 obj2pb64 obj2str obj2stru8arr obj2u8arr pb642obj str2aes str2b64 str2md5 str2obj str2sha str2sha512 str2u8arr stru8arr2obj u16arr2b64 u16arr2u8arr u8arr2ab u8arr2b64 u8arr2blob u8arr2bs u8arr2obj u8arr2str u8arr2u16arr str2hint keysmat2ltdt ltdt2vrtsable ltdtkeys2mat ltdtkeysheads2mat mat2ltdt'.split(' ')
        assert.strict.deepStrictEqual(names.length, 39)
        let fdSrc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
        for (let n of names) {
            let ls = fs.readFileSync(path.join(fdSrc, `${n}.mjs`), 'utf8').split(/\r?\n/)
            let i = ls.findIndex((l) => l.startsWith(' * @returns '))
            assert.ok(i >= 0, n)
            let l = ls[i + 1] || ''
            assert.ok(l.startsWith(' * 失敗之辨識：'), `${n}: ${l.slice(0, 40)}`)
            assert.ok(l.includes(`opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定`), n)
        }
    })

})
