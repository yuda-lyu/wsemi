import get from 'lodash/get'
import isEle from './isEle.mjs'
import getGlobal from './getGlobal.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'


function getDiff() {
    let g = getGlobal()
    let x = g.Diff
    return x
}


function getDiff2Html() {
    let g = getGlobal()
    let x = g.Diff2Html
    return x
}


/**
 * 前端DOM上展示2文字差異比對資訊
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domCompareText.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {String} title 輸入比對標題字串
 * @param {String} oldText 輸入舊文字字串
 * @param {String} newText 輸入新文字字串
 * @param {Object} [opt={}] 輸入設定物件，主要是提供給Diff2Html之設定物件，預設{}
 * @returns {Object} 回傳結果物件，內含屬性diff與html，分別代表2文字比對差異結果物件，以及轉出html文字
 * @example
 * need test in browser
 *
 * let r = domCompareText(ele, 'title', 'oldText', 'newText')
 * console.log(r)
 * // => { diff, html }
 *
 */
function domCompareText(ele, title, oldText, newText, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele')
    }

    //fmt
    let fmt = get(opt, 'format')
    if (fmt !== 'side' && fmt !== 'line') {
        fmt = 'side'
    }

    //outputFormat
    let outputFormat = fmt === 'side' ? 'side-by-side' : 'line-by-line'

    //Diff
    let Diff = getDiff()
    // console.log('Diff', Diff)

    //check
    if (!iseobj(Diff)) {
        throw new Error('invalid window.Diff')
    }

    //getDiff2Html
    let Diff2Html = getDiff2Html()
    // console.log('Diff2Html', Diff2Html)

    //check
    if (!iseobj(Diff2Html)) {
        throw new Error('invalid window.Diff2Html')
    }

    //fixDiff2HtmlStyle, Diff2Html(3.4.16)有問題, 於'side-by-side'兩側欄寬度使用width:100%會額外撐開導致破版
    let fixDiff2HtmlStyle = () => {

        //style for fix width
        let s = `
          .d2h-code-side-line {
            width: inherit !important;
          }
        `

        //cst
        let id = 'fix-d2h-line-width'
        let cst = document.querySelector(`#${id}`)
        // console.log('cst', cst)

        //check
        if (isEle(cst)) {
            // console.log('already injected style')
            return
        }

        //inject style
        let st = document.createElement('style')
        st.id = id
        st.textContent = s
        document.head.append(st)

    }
    fixDiff2HtmlStyle()

    //title
    if (!isestr(title)) {
        title = 'Text'
    }

    //oldTitle, newTitle
    let oldTitle = title
    let newTitle = title

    //Diff.createTwoFilesPatch
    let diff = Diff.createTwoFilesPatch(oldTitle, newTitle, oldText, newText)
    // console.log('diff', diff)

    //Diff2Html.html
    let diffHtml = Diff2Html.html(diff, {
        drawFileList: true,
        matching: 'lines',
        outputFormat,
        ...opt,
    })
    // console.log('diffHtml', diffHtml)

    //replace
    diffHtml = diffHtml.replace('<span class="d2h-file-list-title">Files changed (1)</span>', '')

    //save
    try {
        ele.innerHTML = diffHtml
    }
    catch (err) {
        console.log(err)
    }

    return {
        diff,
        html: diffHtml,
    }
}


export default domCompareText
