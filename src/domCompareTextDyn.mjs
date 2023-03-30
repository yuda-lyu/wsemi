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
 * @param {String} oldText 輸入舊文字字串
 * @param {String} newText 輸入新文字字串
 * @param {Object} [opt={}] 輸入設定物件，主要是提供給Diff2Html之設定物件，預設{}
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳domCompareText產生結果，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let r = domCompareTextDyn(ele, 'title', 'oldText', 'newText')
 * .then((res)=>{
 *     console.log(res)
 *     // => { diff, html }
 * })
 *
 */
async function domCompareTextDyn(ele, title, oldText, newText, opt = {}, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/diff@5.1.0/dist/diff.min.js',
            'https://cdn.jsdelivr.net/npm/diff2html@3.4.34/bundles/css/diff2html.min.css',
            'https://cdn.jsdelivr.net/npm/diff2html@3.4.34/bundles/js/diff2html.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //domCompareText
    let r = domCompareText(ele, title, oldText, newText, opt)

    return r
}


export default domCompareTextDyn
