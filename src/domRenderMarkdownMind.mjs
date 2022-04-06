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
 * @returns {Object} 回傳Markmap.create後物件vmm，並於其內添加transMarkdown函數，可針對變更後之markdown重新計算取得結果內屬性root資訊，並再使用vmm.setData(root)可達到差異更新功能
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
 * let r = domRenderMarkdownMind(ele, markdown)
 * console.log(r)
 * // => { root, features, styles, scripts }
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
