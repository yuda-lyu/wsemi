import htmlparser from 'htmlparser'
import each from 'lodash/each'
import join from 'lodash/join'
import size from 'lodash/size'
import isestr from './isestr.mjs'
import getGlobal from './getGlobal.mjs'


function getHtmlparser() {
    let g = getGlobal()
    let x = htmlparser || g.htmlparser || g.Tautologistics.NodeHtmlParser
    // if (x.default) {
    //     x = x.default
    // }
    return x
}


/**
 * html轉純文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2str.test.js Github}
 * @memberOf wsemi
 * @param {String} html 輸入html字串
 * @returns {String} 回傳純文字字串
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
 * let c = html2str(h)
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
function html2str(html) {
    let err = null

    //check
    if (!isestr(html)) {
        return ''
    }

    //useHtmlparser
    let useHtmlparser = getHtmlparser()

    //handler
    let handler = new useHtmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            err = error
        }
    })

    //parser
    let parser = new useHtmlparser.Parser(handler)
    parser.parseComplete(html)

    //check
    if (err !== null) {
        return err
    }

    //to text
    let r = []
    function getText(d) {
        each(d, (v) => {
            if (size(v.children) > 0) {
                getText(v.children)
            }
            if (v.type === 'text') {
                r.push(v.data)
            }
        })
    }
    getText(handler.dom)
    r = join(r, '')

    return r
}


export default html2str
