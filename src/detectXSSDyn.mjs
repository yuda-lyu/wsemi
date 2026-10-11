import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import detectXSS from './detectXSS.mjs'


/**
 * 偵測字串內之xss攻擊語法，採用動態加載技術，判定規則與回傳項目同detectXSS
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/detectXSSDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入字串
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳偵測項目陣列，無則回傳空陣列，reject回傳錯誤訊息
 * @example
 *
 * let r
 *
 * r = await detectXSSDyn('<img src=x onerror=alert(1)><script>alert(1)</script>')
 * console.log(r)
 * // => [ { type: 'attr', tag: 'img', name: 'onerror' }, { type: 'tag', tag: 'script' } ]
 *
 * r = await detectXSSDyn('<a href="jav&#x09;ascript:alert(1)">點我</a>')
 * console.log(r)
 * // => [ { type: 'url', tag: 'a', name: 'href', scheme: 'javascript' } ]
 *
 */
async function detectXSSDyn(str, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [ //若有更新版本須全專案取代
            'https://cdn.jsdelivr.net/npm/xss@1.0.15/dist/xss.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //detectXSS
    let r = detectXSS(str)

    return r
}


export default detectXSSDyn
