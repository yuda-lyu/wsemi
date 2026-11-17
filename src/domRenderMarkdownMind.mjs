import isEle from './isEle.mjs'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'


function getMarkmap() {
    let g = getGlobal()
    let x = g.markmap //不須支持Nodejs使用, 故僅提供前端直接取markmap實例使用
    return x
}


/**
 * 前端針對指定DOM上展示由markdown轉出的心智圖
 *
 * 本函數不打包markmap亦不動態加載，使用端須先載入markmap(d3、markmap-view與markmap-lib之script，載入後掛於全域markmap)，輸入有效而未載入時本函數拋Error('invalid markmap: must be loaded as a global object with Transformer and Markmap')
 * 瀏覽器載入script之寫法見README之Installation，使用npm搭配打包工具者須自行引入markmap-lib與markmap-view，並使全域markmap至少含Transformer、Markmap、loadCSS、loadJS(本函數所取用之欄位)
 *
 * 失敗一律同步拋Error(固定訊息、不含輸入值、先於任何DOM變動，不回傳被reject之Promise，輸出型別恆為物件)：ele非元素為'invalid ele: must be an element'，markdown非字串(空字串合法)為'invalid markdown: must be a string'，未載入markmap為'invalid markmap: …'；檢測順序為ele、markdown、markmap
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRenderMarkdownMind.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素，非元素則拋錯
 * @param {String} markdown 輸入markdown字串，非字串則拋錯，空字串合法
 * @param {Object} [opt={}] 輸入設定物件，預設{}(目前無使用之鍵)
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

    //check, 會改動畫面, 輸入無效即同步拋錯且先於任何改動(同domAppend; 原ele無效回被reject之Promise而成功回同步物件, 輸出型別不恆定, 且markdown無檢測洩漏原生錯誤)
    if (!isEle(ele)) {
        throw new Error('invalid ele: must be an element')
    }
    if (typeof markdown !== 'string') {
        throw new Error('invalid markdown: must be a string')
    }

    //mm
    let mm = getMarkmap()
    // console.log('mm', mm)

    //check, 須先載入markmap(全域markmap至少含Transformer與Markmap), 否則拋固定訊息之Error(原為對undefined解構之原生TypeError)
    if (!mm || !isfun(mm.Transformer) || !isfun(mm.Markmap)) {
        throw new Error('invalid markmap: must be loaded as a global object with Transformer and Markmap')
    }

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
