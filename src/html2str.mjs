import getHtmlToText from './_getHtmlToText.mjs'
import isestr from './isestr.mjs'


/**
 * html轉純文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2str.test.mjs Github}
 * @memberOf wsemi
 * @param {String} html 輸入html字串
 * @returns {Promise} 回傳Promise，resolve回傳純文字字串，reject回傳錯誤訊息
 * @example
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
 * // MY FIRST HEADING
 * //
 * // My first paragraph.
 *
 */
async function html2str(html) {

    //check
    if (!isestr(html)) {
        return ''
    }

    //ht
    let ht = await getHtmlToText()

    //r
    let r = ht.htmlToText(html, {
        wordwrap: false,
        selectors: [
            { selector: 'script', format: 'skip' },
            { selector: 'style', format: 'skip' }
        ]
    })

    return r
}


export default html2str
