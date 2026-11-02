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
 * 計算2字串相似度，回傳0~1之相似度(1為完全相同，0為最不相似)
 *
 * 任一輸入為非字串或空字串則回傳0(視為最不相似，不報錯)；0亦可為合法結果(如2字串無任何相同之雙字元組)，故回傳0不代表輸入無效
 *
 * Fork: {@link https://github.com/aceakash/string-similarity string-similarity}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strCompare.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str1 輸入欲比對之一般字串，非字串或空字串則回傳0
 * @param {String} str2 輸入欲比對之一般字串，非字串或空字串則回傳0
 * @returns {Number} 回傳字串相似度0~1，非字串或空字串輸入回傳0(最不相似)，0亦可為合法結果
 * @example
 *
 * console.log(strCompare('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)'))
 * // => 0.375
 *
 * console.log(strCompare('test中文', ''))
 * // => 0
 *
 * console.log(strCompare('ab', 'cd'))
 * // => 0
 *
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
