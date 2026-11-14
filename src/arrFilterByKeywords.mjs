import trim from 'lodash-es/trim.js'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'


//RE_SEP, 關鍵字字串之分隔符: 半形空白與全形空白(U+3000), 以字元碼組成避免原始碼內出現不可見之全形空白
let RE_SEP = new RegExp('[ ' + String.fromCharCode(0x3000) + ']')


/**
 * 對arr陣列內各字串進行關鍵字計算，計算是否含有關鍵字與程度，多關鍵字用空白區隔，必要關鍵字可於字首添加「+」，不要關鍵字可於字首添加「-」
 *
 * 規則(使用者2026-11-14裁定)：
 * 結果筆數恆等於arr之長度(只有arr非陣列或為空陣列[]時回傳[])；arr之元素非字串(空位、null、undefined、數字、NaN、布林、函數、Symbol、物件、陣列等)者該筆為{ hasKeyword: false, weight: 0 }，String包裝物件視同字串；
 * keywords為字串時以半形空白或全形空白(U+3000)分隔出各關鍵字，為陣列時各元素為一個關鍵字(關鍵字內可含空白)；陣列內之數字(與布林)以其字串形式當作一般關鍵字比對(不解析+、-前綴)，null、undefined、物件、陣列、函數、Symbol等元素略過；
 * 空白關鍵字(含只有+或-之前綴)先剔除，重複之關鍵字去重後再計算；keywords無效(''、null、數字、[]、['']、[null]、[{}]等)或剔除後無任何關鍵字時，回傳與arr同筆數且全為{ hasKeyword: false, weight: 0 }；
 * 不要關鍵字(-x)：含任一不要關鍵字者不命中；必要關鍵字(+a)：須含全部必要關鍵字才命中；其餘依一般關鍵字判斷：
 * 有一般關鍵字時，權重為所含之一般關鍵字之權重和，第k個(由0起算)一般關鍵字之權重為(1 - k / n) ** 2，n為一般關鍵字數(n、k只計一般關鍵字)，有必要關鍵字者含全部必要關鍵字即命中(權重可為0)，無必要關鍵字者含任一一般關鍵字才命中；
 * 無一般關鍵字時(只有必要或不要關鍵字)，通過上列條件者命中且權重為1；
 * 比對區分大小寫(不分大小寫者由呼叫端先轉換arr與keywords)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByKeywords.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被尋找的字串陣列
 * @param {String|Array} keywords 輸入要尋找的關鍵字字串或陣列
 * @returns {Array} 回傳結果物件陣列，陣列內各物件包含hasKeyword與weight欄位，其中hasKeyword代表有無關鍵字為布林值，weight代表權重為浮點數，其值可大於1
 * @example
 *
 * let arr = [
 *     'abc def xyz',
 *     '測試abc中文mnop',
 *     'Instead of creating yet another opinionated application',
 *     'Node.js module which can be integrated into a larger application',
 * ]
 * let kws = null
 * let r = null
 *
 * kws = 'abc'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def 中文'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def 中文 mnop'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 0.5555555555555557 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def +yet' //含必要關鍵字yet者命中, 權重只依一般關鍵字def(不含def得0)
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def of module -yet' //含yet者不命中, 其餘依一般關鍵字def、of、module(n為3)判斷
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.11111111111111113 }
 * // ]
 *
 * kws = '-yet' //只有不要關鍵字時, 不含者命中且權重為1
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 1 }
 * // ]
 *
 * kws = '+abc +中文' //須含全部必要關鍵字
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'abc' + String.fromCharCode(0x3000) + 'def' //全形空白(U+3000)亦為分隔符
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1.25 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'abc abc' //重複之關鍵字去重
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = '+'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def +'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = ['can be', 'def'] //陣列之各元素為一個關鍵字(可含空白)
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 1 }
 * // ]
 *
 * kws = ['', 'abc'] //空白關鍵字先剔除再計權重
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = ['-abc']
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 }
 * // ]
 *
 * kws = '' //關鍵字無效, 回傳與arr同筆數且全不命中
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * r = arrFilterByKeywords(['abc', null, 1, ['abc']], 'abc') //非字串元素不匹配, 結果筆數恆等於arr之長度
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 */
function arrFilterByKeywords(arr, keywords) {

    //check, 參數層: arr非陣列或空陣列回傳[]
    if (!isarr(arr) || arr.length === 0) {
        return []
    }

    //kws, 原始關鍵字(字串依半形與全形空白分隔; 陣列逐元素)
    let kws = [] //{ kw, literal }, literal為true者(數字、布林)不解析前綴
    if (isstr(keywords)) {
        let ss = String(keywords).split(RE_SEP)
        for (let s of ss) {
            s = trim(s)
            if (s !== '') {
                kws.push({ kw: s, literal: false })
            }
        }
    }
    else if (isarr(keywords)) {
        for (let i = 0; i < keywords.length; i++) {
            let v = keywords[i]
            if (isstr(v)) {
                kws.push({ kw: String(v), literal: false })
            }
            else if (typeof v === 'number' || typeof v === 'boolean') {
                kws.push({ kw: String(v), literal: true }) //數字以其字串形式當作一般關鍵字(同修前: 不解析前綴)
            }
            //null、undefined、物件、陣列、函數、Symbol等略過
        }
    }

    //分類並去重, 剔除空白關鍵字(含只有前綴者)
    let incs = new Set()
    let excs = new Set()
    let gens = new Set()
    for (let { kw, literal } of kws) {
        let t = 'gen'
        let ekw = kw
        if (!literal) {
            let c0 = kw.charAt(0)
            if (c0 === '+') {
                t = 'inc'
                ekw = kw.slice(1)
            }
            else if (c0 === '-') {
                t = 'exc'
                ekw = kw.slice(1)
            }
        }
        if (trim(ekw) === '') {
            continue
        }
        if (t === 'inc') {
            incs.add(ekw)
        }
        else if (t === 'exc') {
            excs.add(ekw)
        }
        else {
            gens.add(ekw)
        }
    }
    incs = [...incs]
    excs = [...excs]
    gens = [...gens]
    let n = gens.length
    let hasAny = incs.length > 0 || excs.length > 0 || n > 0

    function core(c) {

        //無任何關鍵字
        if (!hasAny) {
            return { hasKeyword: false, weight: 0 }
        }

        //不要關鍵字: 含任一者不命中
        for (let kw of excs) {
            if (c.indexOf(kw) >= 0) {
                return { hasKeyword: false, weight: 0 }
            }
        }

        //必要關鍵字: 須含全部
        for (let kw of incs) {
            if (c.indexOf(kw) < 0) {
                return { hasKeyword: false, weight: 0 }
            }
        }

        //無一般關鍵字: 通過上列條件即命中, 權重1
        if (n === 0) {
            return { hasKeyword: true, weight: 1 }
        }

        //一般關鍵字: 依順序給予權重(n、k只計一般關鍵字)
        let b = false
        let weight = 0
        for (let k = 0; k < n; k++) {
            if (c.indexOf(gens[k]) >= 0) {
                b = true
                let w = 1 - k / n
                w = w ** 2 //非線性遞減, 有第1關鍵字權重1, 只有2+3關鍵字權重也不超過第1關鍵字權重
                weight += w //權重累加可超過1
            }
        }

        //有必要關鍵字者已含全部必要關鍵字即命中(權重依一般關鍵字, 可為0); 無必要關鍵字者須含任一一般關鍵字
        return {
            hasKeyword: incs.length > 0 ? true : b,
            weight,
        }
    }

    //rs, 結果筆數恆等於arr之長度(以索引迴圈, 空位亦佔一筆); 非字串元素不匹配, String包裝物件視同字串
    let rs = []
    for (let i = 0; i < arr.length; i++) {
        let c = arr[i]
        if (isstr(c)) {
            rs.push(core(String(c)))
        }
        else {
            rs.push({ hasKeyword: false, weight: 0 })
        }
    }

    return rs
}


export default arrFilterByKeywords
