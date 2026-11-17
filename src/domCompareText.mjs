import * as Diff from 'diff'
import get from 'lodash-es/get.js'
import getDiff2Html from './_getDiff2Html.mjs'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'


/**
 * 前端針對指定DOM上展示2文字差異比對資訊
 *
 * 失敗一律同步拋Error(固定訊息、不含輸入值、先於任何DOM變動，不回傳被reject之Promise，輸出型別恆為物件)：ele非元素為'invalid ele: must be an element'，strOld、strNew非字串(空字串合法)為'invalid strOld: must be a string'與'invalid strNew: must be a string'；檢測順序為ele、strOld、strNew
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domCompareText.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素，非元素則拋錯
 * @param {String} title 輸入比對標題字串，非非空字串視為未給而用'Text'
 * @param {String} strOld 輸入舊文字字串，非字串則拋錯，空字串合法
 * @param {String} strNew 輸入新文字字串，非字串則拋錯，空字串合法
 * @param {Object} [opt={}] 輸入設定物件，主要是提供給Diff2Html之設定物件(整份展開傳入，其中outputFormat若有給則覆蓋由format換算之值)，預設{}
 * @param {String} [opt.format='side'] 輸入比對展示模式字串，給予'side'為依照左右對應區塊展示差異，給予'line'為依照各行展示差異，其他值視為未給，預設'side'
 * @returns {Object} 回傳結果物件，內含屬性diff與html，分別代表2文字比對差異結果物件，以及轉出html文字
 * @example
 * need test in browser
 *
 * let r = domCompareText(ele, 'title', 'strOld', 'strNew')
 * console.log(r)
 * // => { diff, html }
 *
 */
function domCompareText(ele, title, strOld, strNew, opt = {}) {

    //check, 會改動畫面(寫入ele.innerHTML), 輸入無效即同步拋錯且先於任何改動(同domAppend; 原ele無效回被reject之Promise而成功回同步物件, 輸出型別不恆定; strOld、strNew無檢測交給Diff洩漏原生錯誤)
    if (!isEle(ele)) {
        throw new Error('invalid ele: must be an element')
    }
    if (typeof strOld !== 'string') {
        throw new Error('invalid strOld: must be a string')
    }
    if (typeof strNew !== 'string') {
        throw new Error('invalid strNew: must be a string')
    }

    //fmt
    let fmt = get(opt, 'format')
    if (fmt !== 'side' && fmt !== 'line') {
        fmt = 'side'
    }

    //outputFormat
    let outputFormat = fmt === 'side' ? 'side-by-side' : 'line-by-line'

    // //Diff
    // let Diff = getDiff()

    //Diff2Html
    let Diff2Html = getDiff2Html()

    // //fixDiff2HtmlStyle, Diff2Html(3.4.34)有問題, 於'side-by-side'兩側欄寬度使用width:100%會額外撐開導致破版
    // let fixDiff2HtmlStyle = () => {

    //     //style for fix width
    //     let s = `
    //       .d2h-code-side-line {
    //         width: inherit !important;
    //       }
    //     `

    //     //cst
    //     let id = 'fix-d2h-line-width'
    //     let cst = document.querySelector(`#${id}`)
    //     // console.log('cst', cst)

    //     //check
    //     if (isEle(cst)) {
    //         // console.log('already injected style')
    //         return
    //     }

    //     //inject style
    //     let st = document.createElement('style')
    //     st.id = id
    //     st.textContent = s
    //     document.head.append(st)

    // }
    // fixDiff2HtmlStyle()

    //title
    if (!isestr(title)) {
        title = 'Text'
    }

    //titleOld, titleNew
    let titleOld = title
    let titleNew = title

    //createTwoFilesPatch
    let diff = Diff.createTwoFilesPatch(titleOld, titleNew, strOld, strNew)
    // console.log('diff', diff)

    //html
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
