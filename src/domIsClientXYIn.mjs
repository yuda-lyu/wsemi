import isNumber from 'lodash/isNumber'
import isEle from './isEle.mjs'


/**
 * 前端計算clientX與clientY是否位於DOM元素內
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsClientXYIn.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} clientX 輸入點的clientX座標
 * @param {Number} clientY 輸入點的clientY座標
 * @param {HTMLElement} ele 輸入元素
 * @returns {Boolean} 回傳是否位於DOM元素內布林值
 * @example
 * need test in browser
 *
 * let p = {
 *     clientX: 'from event',
 *     clientY: 'from event',
 * }
 * let ele = document.querySelector('#id')
 * let b = domIsClientXYIn(p.clientX, p.clientY, ele)
 * // => true or false
 *
 */
function domIsClientXYIn(clientX, clientY, ele) {

    //check
    if (!isNumber(clientX)) {
        console.log('clientX is not a number', clientX)
        return
    }
    if (!isNumber(clientY)) {
        console.log('clientY is not a number', clientY)
        return
    }
    if (!isEle(ele)) {
        console.log('ele is not a HTMLElement', ele)
        return
    }

    //calc rt
    let rt
    try {
        rt = ele.getBoundingClientRect()
    }
    catch (err) {
        console.log('invalid ele for getBoundingClientRect', err)
        return
    }

    //r
    let r = false
    try {
        r = clientX >= rt.left && clientX <= rt.right && clientY >= rt.top && clientY <= rt.bottom
    }
    catch (err) {
        console.log('catch when calculating page information of element', err)
    }

    return r
}


export default domIsClientXYIn
