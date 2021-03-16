import map from 'lodash/map'
import size from 'lodash/size'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import sep from './sep.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'


/**
 * 由vall陣列找尋vfind內各元素之第1位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrfilter.test.js Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被尋找的字串陣列
 * @param {String} keywords 輸入要尋找的關鍵字字串
 * @returns {Array} 回傳所找到各元素第1位置之陣列
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
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def'
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def 中文'
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def 中文 mnop'
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: true, weight: 0.5555555555555557 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def +yet'
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.25 },
 * //     { hasKeyword: false, weight: 0 }
 * // ]
 *
 * kws = 'def of module -yet'
 * r = arrfilter(arr, kws)
 * console.log(r)
 * // => [
 * //     { hasKeyword: true, weight: 1 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: false, weight: 0 },
 * //     { hasKeyword: true, weight: 0.25 }
 * // ]
 *
 */
function arrfilter(arr, keywords) {

    //check
    if (!isearr(arr)) {
        return []
    }

    //check
    if (!isestr(keywords)) {
        return []
    }

    //kws, 用空白切分出各關鍵字
    let kws = sep(keywords, ' ')

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


export default arrfilter
