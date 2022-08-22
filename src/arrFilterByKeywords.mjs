import map from 'lodash/map'
import size from 'lodash/size'
import trim from 'lodash/trim'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import sep from './sep.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'


/**
 * 對arr陣列內各字串進行關鍵字計算，計算是否含有關鍵字與程度，多關鍵字用空白區隔，必要關鍵字可於字首添加「+」，不要關鍵字可於字首添加「-」
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByKeywords.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被尋找的字串陣列
 * @param {String|Array} keywords 輸入要尋找的關鍵字字串或陣列
 * @returns {Array} 回傳結果物件陣列
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
 * kws = 'def'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
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
 * kws = 'def +yet'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def of module -yet'
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.25 }
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
 * kws = '-'
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
 * kws = ['def', 'of', 'module', '-yet']
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.25 }
 * // ]
 *
 * kws = ['can be', 'def']
 * r = arrFilterByKeywords(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 1 }
 * // ]
 *
 */
function arrFilterByKeywords(arr, keywords) {

    //check
    if (!isearr(arr)) {
        return []
    }

    //check
    if (!isestr(keywords) && !isearr(keywords)) {
        return []
    }

    //kws
    let kws = null
    if (isestr(keywords)) {
        kws = sep(keywords, ' ') //若為字串則用空白切分出各關鍵字
    }
    else {
        kws = keywords //可支援關鍵字內含空白
    }

    //n
    let n = size(kws)

    function core(c) {

        //for
        let b = false
        let weight = 0
        for (let k = 0; k < n; k++) {
            let kw = kws[k]

            //ekw
            let ekw = kw
            let bInclude = strleft(kw, 1) === '+'
            let bExclude = strleft(kw, 1) === '-'
            if (bInclude || bExclude) {
                ekw = strdelleft(kw, 1)
            }

            //check
            if (trim(ekw) === '') {
                continue
            }

            //bHas
            let bHas = c.indexOf(ekw) >= 0
            // console.log('c', c, ':ekw', ekw, ':bHas', bHas)

            //必有關鍵字
            if (bInclude) {
                if (!bHas) {
                    b = false //若無必有關鍵字, 強制視為找不到
                    weight = 0
                    break
                }
            }

            //不能有關鍵字
            if (bExclude) {
                if (bHas) {
                    b = false //找到不能有關鍵字, 強制視為找不到
                    weight = 0
                    break
                }
            }

            //含有關建字則依照順序給予權重
            if (bHas) {
                b = true
                let w = 1 - k / n
                w = w ** 2 //非線性遞減, 有第1關鍵字權重1, 只有2+3關鍵字權重也不超過第1關鍵字權重
                weight += w
            }

        }

        return {
            hasKeyword: b,
            weight,
        }
    }

    //rs
    let rs = map(arr, (c) => {
        return core(c)
    })

    return rs
}


export default arrFilterByKeywords
