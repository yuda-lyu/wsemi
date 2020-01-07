import isestr from './isestr.mjs'


function core(s1, s2) {
    s1 = s1.replace(/\s+/g, '')
    s2 = s2.replace(/\s+/g, '')

    if (!s1.length && !s2.length) return 1 // if both are empty strings
    if (!s1.length || !s2.length) return 0 // if only one is empty string
    if (s1 === s2) return 1 // identical
    if (s1.length === 1 && s2.length === 1) return 0 // both are 1-letter strings
    if (s1.length < 2 || s2.length < 2) return 0 // if either is a 1-letter string

    let firstBigrams = new Map()
    for (let i = 0; i < s1.length - 1; i++) {
        const bigram = s1.substring(i, i + 2)
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1

        firstBigrams.set(bigram, count)
    };

    let intersectionSize = 0
    for (let i = 0; i < s2.length - 1; i++) {
        const bigram = s2.substring(i, i + 2)
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0

        if (count > 0) {
            firstBigrams.set(bigram, count - 1)
            intersectionSize++
        }
    }

    return (2.0 * intersectionSize) / (s1.length + s2.length - 2)
}


/**
 * 計算2字串相似度
 *
 * Fork: {@link https://github.com/aceakash/string-similarity string-similarity}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strCompare.test.js Github}
 * @memberOf wsemi
 * @param {String} str1 輸入欲比對之一般字串
 * @param {String} str2 輸入欲比對之一般字串
 * @returns {Number} 回傳字串相似度0~1
 * @example
 * console.log(strCompare('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)'))
 * // => 0.375
 */
function strCompare(str1, str2) {

    //check
    if (!isestr(str1)) {
        return 0
    }
    if (!isestr(str2)) {
        return 0
    }

    return core(str1, str2)
}


export default strCompare
