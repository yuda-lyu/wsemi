import isNumber from 'lodash/isNumber'
import isEle from './isEle.mjs'
import domGetBounding from './domGetBounding.mjs'


/**
 * 前端計算pageX與pageY是否位於DOM元素內
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsPageXYIn.test.js Github}
 * @memberOf wsemi
 * @param {Number} pageX 輸入點的pageX座標
 * @param {Number} pageY 輸入點的pageY座標
 * @param {HTMLElement} ele 輸入元素
 * @example
 * need test in browser
 */
function domIsPageXYIn(pageX, pageY, ele) {
    let r = false

    //check
    if (!isNumber(pageX)) {
        console.log('pageX is not Number', pageX)
        return
    }
    if (!isNumber(pageY)) {
        console.log('pageY is not Number', pageY)
        return
    }
    if (!isEle(ele)) {
        console.log('ele is not HTMLElement', ele)
        return
    }

    //domGetBounding
    let b = domGetBounding(ele)

    if (b) {
        try {
            r = pageX >= b.pageLeft && pageX <= b.pageRight && pageY >= b.pageTop && pageY <= b.pageBottom
        }
        catch (err) {
            console.log('catch when calculating page information of element', err)
        }
    }

    return r
}


export default domIsPageXYIn
