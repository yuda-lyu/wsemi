import isarr from './isarr.mjs'
import cstr from './cstr.mjs'
import strCompare from './strCompare.mjs'


//isFin, 有限數字
function isFin(v) {
    return typeof v === 'number' && Number.isFinite(v)
}


//isNonBlank, 去除空白後非空之字串
function isNonBlank(s) {
    return typeof s === 'string' && s.replace(/\s+/g, '') !== ''
}


//emptyResult, 與正常輸出同形之空結果(每次新物件)
function emptyResult() {
    return { ratings: [], bestMatch: null, bestMatchIndex: -1 }
}


function core(mainString, targets) {
    let ratings = []
    let bestMatchIndex = -1
    let bestRating = 0

    for (let i = 0; i < targets.length; i++) {
        let v = targets[i]

        //候選: 字串照比對, 有限數字以字串比對(target保留原數字); 其餘(null、undefined、空位、物件、陣列、布林、NaN等)rating為0且target保留原值, 函數之target為null
        let rating = 0
        let target = v
        if (typeof v === 'string') {
            rating = strCompare(mainString, v)
        }
        else if (isFin(v)) {
            rating = strCompare(mainString, String(v))
        }
        else if (typeof v === 'function') {
            target = null
        }
        else if (typeof v === 'bigint' || typeof v === 'symbol') {
            target = cstr(v) //裁定表〈三〉未列: 同修前經cstr轉字串後比對(ws430c2外審T3)
            rating = strCompare(mainString, target)
        }
        ratings.push({ target, rating })

        //同分取第一個, 全部為0時無最接近者
        if (rating > bestRating) {
            bestRating = rating
            bestMatchIndex = i
        }
    }

    let bestMatch = bestMatchIndex >= 0 ? ratings[bestMatchIndex] : null

    return { ratings, bestMatch, bestMatchIndex }
}


/**
 * 計算字串ar與多關鍵字陣列strkeys之相似程度
 *
 * 以兩字元為單位比對(Dice係數)，比對時忽略空白，區分大小寫，單一字元對其他字串得0；有限數字當字串比對；同分取第一個；全部rating為0時bestMatch為null、bestMatchIndex為-1
 * ar為字串(去除空白後非空)或有限數字；ar為陣列時只串接其中之字串與有限數字(其餘如物件、null略過)，串接後去除空白為空即視為無效
 * strkeys為字串、有限數字(皆視為一個候選)或非空陣列；陣列之候選為字串或有限數字時比對，其餘(null、undefined、空位、物件、陣列、布林、NaN等)之rating為0且target保留原值，函數之target為null，BigInt與Symbol轉字串比對(target為該字串，同修前)，ratings之筆數與索引對齊strkeys；單獨傳入之String、Number包裝物件(ar或strkeys)同字串、數字(同修前)
 * ar或strkeys無效時回傳同形之空結果{ ratings: [], bestMatch: null, bestMatchIndex: -1 }
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strFindSimilar.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|String|Number} ar 輸入資料，若輸入陣列則只串接其中之字串與有限數字
 * @param {String|Number|Array} strkeys 查找ar內與多關鍵字strkeys的個別相似度
 * @returns {Object} 輸出比對資料物件{ ratings, bestMatch, bestMatchIndex }，回傳與各關鍵字之相似度以及最相關者
 * @example
 *
 * console.log(strFindSimilar('The Woodman(樵夫) set to work at once, and so...', ['Wodooman(樵夫)', 'manWood(樵夫)', 'Wood樵man(夫)', 'Woodman(樵夫)']))
 * // => { 'ratings': [{ 'target': 'Wodooman(樵夫)', 'rating': 0.375 }, { 'target': 'manWood(樵夫)', 'rating': 0.3404255319148936 }, { 'target': 'Wood樵man(夫)', 'rating': 0.2978723404255319 }, { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }], 'bestMatch': { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }, 'bestMatchIndex': 3 }
 *
 * console.log(strFindSimilar('abc', ['xyz', null]))
 * // => { ratings: [ { target: 'xyz', rating: 0 }, { target: null, rating: 0 } ], bestMatch: null, bestMatchIndex: -1 } (全部為0時無最接近者)
 *
 * console.log(strFindSimilar('   ', ['abc']))
 * // => { ratings: [], bestMatch: null, bestMatchIndex: -1 } (ar無效)
 *
 */
function strFindSimilar(ar, strkeys) {

    //c, ar為去除空白後非空之字串或有限數字; 陣列只串接字串與有限數字, 串接後去除空白為空即無效
    let c = ''
    if (typeof ar === 'string') {
        c = ar
    }
    else if (isFin(ar)) {
        c = String(ar)
    }
    else if (isarr(ar)) {
        let ss = []
        for (let i = 0; i < ar.length; i++) {
            let v = ar[i]
            if (typeof v === 'string') {
                ss.push(v)
            }
            else if (isFin(v)) {
                ss.push(String(v))
            }
        }
        c = ss.join('')
    }
    //單獨傳入之String/Number包裝物件非原始值而無效(W-20: 判斷函數只收原始值; 修前經isestr/isnum接受並由cstr取字串), 同未給之空結果
    if (!isNonBlank(c)) {
        return emptyResult()
    }

    //targets, 字串(非空)或有限數字為一個候選(單一數字轉字串為候選, 同修前), 非空陣列逐項為候選
    let targets
    if (typeof strkeys === 'string' && strkeys !== '') {
        targets = [strkeys]
    }
    else if (isFin(strkeys)) {
        targets = [String(strkeys)]
    }
    else if (isarr(strkeys) && strkeys.length > 0) {
        targets = []
        for (let i = 0; i < strkeys.length; i++) {
            targets.push(strkeys[i]) //快照, 每個候選只讀一次
        }
    }
    else {
        return emptyResult()
    }

    return core(c, targets)
}


export default strFindSimilar
