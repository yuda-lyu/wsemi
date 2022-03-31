import isEle from './isEle.mjs'
import getGlobal from './getGlobal.mjs'


function getMarkmap() {
    let g = getGlobal()
    let x = g.markmap
    return x
}


/**
 * 前端DOM上展示由markdown轉出的心智圖
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRenderMarkdownMind.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {String} markdown 輸入markdown字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
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
 * domRenderMarkdownMind(ele, markdown)
 *     .then((res)=>{
 *         // => { root, features, styles, scripts }
 *     })
 *
 */
function domRenderMarkdownMind(ele, markdown, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele')
    }

    //mm
    let mm = getMarkmap()
    // console.log('mm', mm)

    //params
    let { Transformer, Markmap, loadCSS, loadJS } = mm

    //transMarkdown
    let transMarkdown = (markdown) => {

        //new
        let transformer = new Transformer()

        //transform
        let { root, features } = transformer.transform(markdown)
        // console.log('root', root, 'features', features)

        //getUsedAssets
        let { styles, scripts } = transformer.getUsedAssets(features)
        // console.log('styles', styles)
        // console.log('scripts', scripts)

        return { root, features, styles, scripts }
    }

    //transMarkdown
    let { root, styles, scripts } = transMarkdown(markdown)

    //load
    if (styles) loadCSS(styles)
    if (scripts) loadJS(scripts, { getMarkmap: () => mm })

    //clear
    ele.innerHTML = ''

    //create
    let vmm = Markmap.create(ele, null, root)

    //add transMarkdown
    vmm.transMarkdown = transMarkdown

    return vmm
}


export default domRenderMarkdownMind
