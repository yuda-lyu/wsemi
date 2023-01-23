import domGetParents from './domGetParents.mjs'


/**
 * 前端找尋DOM元素最近的可捲動父層
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetScrollableParent.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom元素
 * @returns {Element} 回傳DOM元素
 * @example
 * need test in browser
 *
 * let eleScrollableParent = domGetScrollableParent(document.querySelector('#id'))
 *
 */
function domGetScrollableParent(ele) {

    let regex = /(auto|scroll)/

    let style = function (ele, prop) {
        return getComputedStyle(ele, null).getPropertyValue(prop)
    }

    let overflow = function (ele) {
        return style(ele, 'overflow') + style(ele, 'overflow-y') + style(ele, 'overflow-x')
    }

    let scroll = function (ele) {
        return regex.test(overflow(ele))
    }

    //check
    if (!(ele instanceof HTMLElement || ele instanceof SVGElement)) {
        return
    }

    //ps
    let ps = domGetParents(ele)

    //find
    for (let i = 0; i < ps.length; i += 1) {
        if (scroll(ps[i])) {
            return ps[i]
        }
    }

    return document.scrollingElement || document.documentElement
}


export default domGetScrollableParent
