import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import domCompareText from './domCompareText.mjs'


/**
 * 前端DOM上展示2文字差異比對資訊，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domCompareTextDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {String} title 輸入比對標題字串
 * @param {String} strOld 輸入舊文字字串
 * @param {String} strNew 輸入新文字字串
 * @param {Object} [opt={}] 輸入設定物件，主要是提供給Diff2Html之設定物件，預設{}
 * @param {String} [opt.fmt=''] 輸入比對展示模式字串，給予'side'為依照左右對應區塊展示差異，給予'line'為依照各行展示差異，預設'side'
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳產生結果，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let r = domCompareTextDyn(ele, 'title', 'strOld', 'strNew')
 * .then((res)=>{
 *     console.log(res)
 *     // => { diff, html }
 * })
 *
 */
async function domCompareTextDyn(ele, title, strOld, strNew, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [ //若有更新版本須全專案取代
            'https://cdn.jsdelivr.net/npm/diff2html@3.4.34/bundles/css/diff2html.min.css',
            'https://cdn.jsdelivr.net/npm/diff2html@3.4.34/bundles/js/diff2html.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //domCompareText
    let r = domCompareText(ele, title, strOld, strNew, opt)

    return r
}


export default domCompareTextDyn
