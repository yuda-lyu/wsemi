import map from 'lodash-es/map'
import concat from 'lodash-es/concat'
import filter from 'lodash-es/filter'
import join from 'lodash-es/join'
import uniq from 'lodash-es/uniq'
import isstr from './isstr.mjs'
import isearr from './isearr.mjs'
import isernot from './isernot.mjs'
import getFileAccept from './getFileAccept.mjs'


/**
 * 前端依照檔案類型或種類回傳input file的accept欄位所用字串
 * kind若需使用種類，可選為'docums', 'compress', 'image', 'data'，或複選以陣列儲存傳入
 * kind若需使用通用檔案，可使用'common'
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFileAccept.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列
 * @returns {String} 回傳input file的accept欄位所用字串
 * @example
 * need test in browser
 *
 */
function domGetFileAccept(kind = '*') {

    //check all
    if (kind === '*') {
        return kind
    }

    //check not string or array
    if (!isstr(kind) && !isearr(kind)) {
        return '*'
    }

    //check common
    if (kind === 'common') {
        kind = ['docums', 'compress', 'image', 'data']
    }

    //data
    let data = getFileAccept()

    function getName(name) {
        let rs = filter(data, { name })
        return getAcp(rs)
    }

    function getMode(kind) {
        let rs = filter(data, { group: kind })
        return getAcp(rs)
    }

    function getAcp(rs) {
        return uniq(map(rs, 'acp'))
    }

    //convert to array
    if (isstr(kind)) {
        kind = [kind]
    }

    //accept string
    let c = ''
    if (isearr(kind)) {
        let r1 = map(kind, function(v) {
            return getMode(v)
        })
        let r2 = map(kind, function(v) {
            return getName(v)
        })
        let r = concat(r1, r2)
        r = filter(r, isernot)
        c = join(r, ',')
    }

    return c
}


export default domGetFileAccept
