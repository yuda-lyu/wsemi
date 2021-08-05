import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import html2str from './html2str.mjs'


/**
 * 前端html轉純文字，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2strDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {String} html 輸入html字串
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {String} 回傳純文字字串
 * @example
 * need test in browser
 *
 * let h = `
 * <!DOCTYPE html>
 * <html>
 *
 * <body>
 *     <h1>My First Heading</h1>
 *     <p>My first paragraph.</p>
 * </body>
 *
 * </html>
 * `
 *
 * let c = await html2str(h)
 * console.log(c)
 * // =>
 * //
 * //
 * //
 * //
 * //     My First Heading
 * //     My first paragraph.
 * //
 * //
 * //
 * //
 *
 */
async function html2strDyn(html, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/htmlparser@1.7.7/lib/htmlparser.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)
    // console.log('res', res)

    //html2str
    let r = await html2str(html)

    return r
}


export default html2strDyn
