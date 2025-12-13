import * as Diff from 'diff'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import split from 'lodash-es/split.js'
import trim from 'lodash-es/trim.js'
import getDiff2Html from './_getDiff2Html.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'


/**
 * 比對新舊文字差異，並轉成html呈現
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strDiffToHtml.test.mjs Github}
 * @memberOf wsemi
 * @param {String} strOld 輸入原始文字字串
 * @param {String} strNew 輸入更新文字字串
 * @param {String} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useNormNewline=true] 輸入是否正規化換行符號布林值，預設true
 * @returns {Object} 回傳比對結果html
 * @example
 *
 *
 * let r
 * let sOld
 * let sNew
 *
 * r = strDiffToHtml('test中文', 'test')
 * console.log(r)
 * // => <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
 * //     <span class="d2h-code-line-ctn">test<del style="color:#f26; background:#ffefd5;">中文</del></span>
 * // </div>
 * // <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
 * //     <span class="d2h-code-line-ctn">test</span>
 * // </div>
 *
 * r = strDiffToHtml('test中文', 'tet中英文')
 * console.log(r)
 * // => <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
 * //     <span class="d2h-code-line-ctn">te<del style="color:#f26; background:#ffefd5;">s</del>t中文</span>
 * // </div>
 * // <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
 * //     <span class="d2h-code-line-ctn">tet中<ins style="color:#090; background:#e4fed1;">英</ins>文</span>
 * // </div>
 *
 * r = strDiffToHtml('test中文', '')
 * console.log(r)
 * // => <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
 * //     <span class="d2h-code-line-ctn">test中文</span>
 * // </div>
 *
 * r = strDiffToHtml('', 'test中文')
 * console.log(r)
 * // => <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
 * //     <span class="d2h-code-line-ctn">test中文</span>
 * // </div>
 *
 * sOld = `This is a long text used for testing.
 * It contains multiple sentences that will be modified.`
 * sNew = `This is a long text used for testing.
 * This section has been replaced completely.`
 * r = strDiffToHtml(sOld, sNew)
 * console.log(r)
 * // => <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">&nbsp;</span>
 * //     <span class="d2h-code-line-ctn">This is a long text used for testing.</span>
 * // </div>
 * // <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
 * //     <span class="d2h-code-line-ctn"><del style="color:#f26; background:#ffefd5;">It</del> c<del style="color:#f26; background:#ffefd5;">on</del>t<del style="color:#f26; background:#ffefd5;">a</del>ins <del style="color:#f26; background:#ffefd5;">multipl</del>e<del style="color:#f26; background:#ffefd5;"> s</del>en<del style="color:#f26; background:#ffefd5;">t</del>e<del style="color:#f26; background:#ffefd5;">n</del>ce<del style="color:#f26; background:#ffefd5;">s</del> <del style="color:#f26; background:#ffefd5;">that wi</del>l<del style="color:#f26; background:#ffefd5;">l b</del>e<del style="color:#f26; background:#ffefd5;"> modifi</del>e<del style="color:#f26; background:#ffefd5;">d</del>.</span>
 * // </div>
 * // <div class="d2h-code-line">
 * //     <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
 * //     <span class="d2h-code-line-ctn"><ins style="color:#090; background:#e4fed1;">This</ins> <ins style="color:#090; background:#e4fed1;">se</ins>cti<ins style="color:#090; background:#e4fed1;">o</ins>n<ins style="color:#090; background:#e4fed1;"> ha</ins>s <ins style="color:#090; background:#e4fed1;">b</ins>een<ins style="color:#090; background:#e4fed1;"> r</ins>e<ins style="color:#090; background:#e4fed1;">pla</ins>ce<ins style="color:#090; background:#e4fed1;">d</ins> <ins style="color:#090; background:#e4fed1;">comp</ins>le<ins style="color:#090; background:#e4fed1;">t</ins>e<ins style="color:#090; background:#e4fed1;">ly</ins>.</span>
 * // </div>
 *
 *
 */
function strDiffToHtml(strOld, strNew, opt = {}) {

    //check
    if (!isstr(strOld)) {
        return ''
    }
    if (!isstr(strNew)) {
        return ''
    }
    if (strOld === '' && strNew === '') {
        return ''
    }

    //useNormNewline
    let useNormNewline = get(opt, 'useNormNewline')
    if (!isbol(useNormNewline)) {
        useNormNewline = true
    }

    //統一換行符號, 避免多行文字因換行而有差異
    if (useNormNewline) {
        strOld = strOld.replaceAll('\r\n', '\n')
        strOld = strOld.replaceAll('\r', '\n')
        strNew = strNew.replaceAll('\r\n', '\n')
        strNew = strNew.replaceAll('\r', '\n')
    }

    // //Diff
    // let Diff = getDiff()

    //Diff2Html
    let Diff2Html = getDiff2Html()

    //createTwoFilesPatch
    let diff = Diff.createTwoFilesPatch('file', 'file', strOld, strNew)

    //html
    let h = Diff2Html.html(diff,
        {
            drawFileList: false,
            matching: 'none',
            diffStyle: 'char',
            outputFormat: 'line-by-line',
        }
    )

    //清理
    let s = split(h, '\n')
    let t = ``
    let b = false
    each(s, (v) => {
        // srlog(v)
        if (trim(v) === `<div class="d2h-code-line">`) {
            b = true
        }
        if (v.indexOf(`class="d2h-code-line-prefix"`) >= 0) {
            v = v.replaceAll(`class="d2h-code-line-prefix"`, `class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;"`)
        }
        if (v.indexOf(`<del>`) >= 0) {
            v = v.replaceAll(`<del>`, `<del style="color:#f26; background:#ffefd5;">`)
        }
        if (v.indexOf(`<ins>`) >= 0) {
            v = v.replaceAll(`<ins>`, `<ins style="color:#090; background:#e4fed1;">`)
        }
        if (b) {
            t += v + '\n'
        }
        if (b && trim(v) === `</div>`) {
            b = false
        }
    })
    h = t

    return h
}


export default strDiffToHtml

