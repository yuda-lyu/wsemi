

/**
 * 前端找尋DOM元素的所有父層
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetParents.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom元素
 * @returns {Array} 回傳DOM元素陣列
 * @example
 * need test in browser
 *
 * let eleParents = domGetParents(document.querySelector('#id'))
 *
 */
function domGetParents(ele) {

    //parents
    let parents = function (ele, ps) {
        if (ele.parentNode === null) {
            return ps
        }

        return parents(ele.parentNode, ps.concat([ele]))
    }

    //check
    if (!(ele instanceof HTMLElement || ele instanceof SVGElement)) {
        return []
    }

    //ps
    let ps = parents(ele.parentNode, [])

    return ps
}


export default domGetParents
