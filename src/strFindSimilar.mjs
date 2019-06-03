import join from 'lodash/join'
import map from 'lodash/map'
import strCompare from './strCompare.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isearr from './isearr.mjs'
import cstr from './cstr.mjs'


function core(mainString, targetStrings) {
    let ratings = []
    let bestMatchIndex = 0

    for (let i = 0; i < targetStrings.length; i++) {
        let currentTargetString = targetStrings[i]
        let currentRating = strCompare(mainString, currentTargetString)
        ratings.push({ target: currentTargetString, rating: currentRating })
        if (currentRating > ratings[bestMatchIndex].rating) {
            bestMatchIndex = i
        }
    }

    let bestMatch = ratings[bestMatchIndex]

    return { ratings, bestMatch, bestMatchIndex }
}


/**
 * 以空白分切strkey做為關鍵字，查詢字串陣列ar是否含有相似關鍵字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strFindSimilar.test.js Github}
 * @memberOf wsemi
 * @param {Array|String} ar 輸入資料，若輸入陣列則自動join成字串
 * @param {String|Number|Array} strkeys 查找ar內與多關鍵字strkeys的個別相似度
 * @returns {Boolean|Number} 輸出資料，回傳值為分數或是否
 * @example
 * strFindSimilar('The Woodman(樵夫) set to work at once, and so...', ['Wodooman(樵夫)', 'manWood(樵夫)', 'Wood樵man(夫)', 'Woodman(樵夫)'])
 * // => { 'ratings': [{ 'target': 'Wodooman(樵夫)', 'rating': 0.375 }, { 'target': 'manWood(樵夫)', 'rating': 0.3404255319148936 }, { 'target': 'Wood樵man(夫)', 'rating': 0.2978723404255319 }, { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }], 'bestMatch': { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }, 'bestMatchIndex': 3 }
 */
function strFindSimilar(ar, strkeys) {

    //自動將ar陣列轉字串
    let c = ''
    if (isestr(ar) || isnum(ar)) {
        c = cstr(ar)
    }
    else if (isearr(ar)) {
        c = join(ar, '')
    }
    else {
        return {}
    }

    //自動將strkeys數字轉字串, 若為字串則轉陣列
    if (isnum(strkeys)) {
        strkeys = cstr(strkeys)
    }
    if (isestr(strkeys)) {
        strkeys = [strkeys]
    }
    if (!isearr(strkeys)) {
        return {}
    }

    //convert to string
    strkeys = map(strkeys, function(v) {
        return cstr(v)
    })

    return core(c, strkeys)
}


export default strFindSimilar
