import isEle from './isEle.mjs'


function getDxy(rtInner, rtParent) {
    let dx = rtInner.left - rtParent.left
    let dy = rtInner.top - rtParent.top
    return {
        dx,
        dy,
    }
}


/**
 * 前端計算內層DOM元素與外層DOM元素的offset總和
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetOffset.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleInner 輸入內層元素
 * @param {HTMLElement} eleParent 輸入外層元素
 * @returns {Object} 回傳物件，包含元素的dx、dy數字
 * @example
 * need test in browser
 */
function domGetOffset(eleInner, eleParent) {
    let dx = 0
    let dy = 0

    //check
    if (!isEle(eleInner)) {
        console.log('eleInner is not HTMLElement', eleInner)
        return
    }
    if (!isEle(eleParent)) {
        console.log('eleParent is not HTMLElement', eleParent)
        return
    }

    //check, 若子層已是指定父層
    if (eleParent === eleInner) {
        return {
            dx,
            dy,
        }
    }

    //rtInner
    let parent = eleInner
    let rtInner
    try {
        rtInner = parent.getBoundingClientRect()
    }
    catch (err) {
        console.log('invalid eleInner when getBoundingClientRect', parent)
        return {
            dx,
            dy,
        }
    }

    //while
    let rtParent = null
    try {
        while (parent) {

            //parent, rtParent
            parent = parent.parentNode
            try {
                rtParent = parent.getBoundingClientRect()
            }
            catch (err) {
                console.log('invalid parent when getBoundingClientRect', parent)
                break
            }

            //getDxy
            let dxy = getDxy(rtInner, rtParent)
            // console.log('dxy', dxy)
            dx += dxy.dx
            dy += dxy.dy

            //break
            if (eleParent === parent) {
                break
            }

            //update
            rtInner = rtParent

        }
    }
    catch (err) {
        console.log('catch when find parent in while', err)
    }

    return {
        dx,
        dy,
    }
}


export default domGetOffset
