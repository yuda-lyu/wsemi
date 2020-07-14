import isEle from './isEle.mjs'


/**
 * 前端DOM元素計算其位於page的座標
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetBounding.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @returns {Object} 回傳物件，包含元素的pageLeft、pageTop、pageRight、pageBottom、width、height數字
 * @example
 *
 * //domGetBounding
 * let b = domGetBounding(document.querySelector('#id'))
 * // => {
 * //     pageLeft: 'Number',
 * //     pageTop: 'Number',
 * //     pageRight: 'Number',
 * //     pageBottom: 'Number',
 * //     width: 'Number',
 * //     height: 'Number',
 * // }
 *
 */
function domGetBounding(ele) {
    let r = null

    //check
    if (!isEle(ele)) {
        console.log('ele is not HTMLElement', ele)
        return
    }

    //calc rt
    let rt
    try {
        rt = ele.getBoundingClientRect()
    }
    catch (err) {
        console.log('invalid ele for getBoundingClientRect', err)
        return r
    }

    //calc left,top
    let left = 0
    let top = 0
    try {
        while (ele) {
            left += ele.offsetLeft - ele.scrollLeft + ele.clientLeft
            top += ele.offsetTop - ele.scrollLeft + ele.clientTop
            ele = ele.offsetParent
        }
    }
    catch (err) {
        console.log('catch when cumulating left and top', err)
        return r
    }

    //calc width,height,right,bottom
    try {
        r = {
            pageLeft: left,
            pageTop: top,
            pageRight: left + rt.width,
            pageBottom: top + rt.height,
            width: rt.width,
            height: rt.height,
        }
    }
    catch (err) {
        console.log('catch when calculating element size', err)
    }

    return r
}


export default domGetBounding
