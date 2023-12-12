import get from 'lodash-es/get'
import filter from 'lodash-es/filter'
import min from 'lodash-es/min'
import isNumber from 'lodash-es/isNumber'
import getGlobal from './getGlobal.mjs'


/**
 * 前端取得window內實際顯示寬度與高度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetWindowSize.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳window內實際顯示寬度與高度物件
 * @example
 * need test in browser
 *
 * let r = domGetWindowSize()
 * console.log(r)
 * // => {
 *   width:...,
 *   height:...,
 * }
 *
 */
function domGetWindowSize() {

    //getGlobal
    let g = getGlobal()

    //domGetWindowWidth
    let domGetWindowWidth = () => {
        let w1 = get(g, 'innerWidth')
        let w2 = get(g, 'document.documentElement.clientWidth')
        let w3 = get(g, 'document.body.clientWidth')
        let ws = [w1, w2, w3]
        ws = filter(ws, isNumber)
        let w = min(ws)
        return w
    }

    //domGetWindowHeight
    let domGetWindowHeight = () => {
        let h1 = get(g, 'innerHeight')
        let h2 = get(g, 'document.documentElement.clientHeight')
        let h3 = get(g, 'document.body.clientHeight')
        let hs = [h1, h2, h3]
        hs = filter(hs, isNumber)
        let h = min(hs)
        return h
    }

    //s
    let s = {
        width: domGetWindowWidth(),
        height: domGetWindowHeight(),
    }

    return s
}


export default domGetWindowSize
