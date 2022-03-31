import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import domRenderMarkdownMind from './domRenderMarkdownMind.mjs'


/**
 * 前端DOM上展示由markdown轉出的心智圖，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRenderMarkdownMindDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {String} markdown 輸入markdown字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳markmap產生結果，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#markmap')
 *
 * let markdown=`
 * # markmap
 *
 * ## Links
 *
 * - <https://markmap.js.org/>
 * - [GitHub](https://github.com/gera2ld/markmap)
 *
 * ## Related
 *
 * - [coc-markmap](https://github.com/gera2ld/coc-markmap)
 * - [gatsby-remark-markmap](https://github.com/gera2ld/gatsby-remark-markmap)
 *
 * ## Features
 *
 * - links
 * - **inline** ~~text~~ *styles*
 * - multiline
 *   text
 *
 * `
 * domRenderMarkdownMindDyn(ele, markdown)
 *     .then((res)=>{
 *         // => { root, features, styles, scripts }
 *     })
 *
 */
async function domRenderMarkdownMindDyn(ele, markdown, opt = {}, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/d3@7.4.0/dist/d3.min.js',
            'https://cdn.jsdelivr.net/npm/markmap-view@0.2.7/dist/index.min.js',
            'https://cdn.jsdelivr.net/npm/markmap-lib@0.12.0/dist/browser/index.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //domRenderMarkdownMind
    let r = domRenderMarkdownMind(ele, markdown, opt)

    return r
}


export default domRenderMarkdownMindDyn
