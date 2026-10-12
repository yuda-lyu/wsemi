import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import clearXSS from './clearXSS.mjs'


/**
 * 清除xss攻擊語法，採用動態加載技術，處理規則同clearXSS
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/clearXSSDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} inp 輸入資料
 * @param {Object} [opt={}] 輸入設定物件，保留簽名相容，目前不使用
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳輸出資料，reject回傳錯誤訊息
 * @example
 *
 * let r
 *
 * r = await clearXSSDyn(`><script>alert('XSS')</script>`)
 * console.log(r)
 * // => `>&lt;script>alert('XSS')&lt;/script>`
 *
 * r = await clearXSSDyn(`<img src="javascript:alert('XSS')">`)
 * console.log(r)
 * // => `<img src>`
 *
 */
async function clearXSSDyn(inp, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [ //若有更新版本須全專案取代
            'https://cdn.jsdelivr.net/npm/xss@1.0.15/dist/xss.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //clearXSS
    let r = clearXSS(inp, opt)

    return r
}


export default clearXSSDyn
