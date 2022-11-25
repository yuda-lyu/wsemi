import genPm from './genPm.mjs'
import genID from './genID.mjs'
import domRemove from './domRemove.mjs'
import domGetFileAccept from './domGetFileAccept.mjs'
import domAppend from './domAppend.mjs'
import domFind from './domFind.mjs'
import domGetFiles from './domGetFiles.mjs'
import domTriggerEvent from './domTriggerEvent.mjs'


/**
 * 前端開啟上傳視窗並回傳檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列，可選'docums'、'compress'、'image'、'data'，若給予'common'則代表前述4種，也可給予有限的副檔名(詳見getFileAccept)，預設為全部'*'
 * @param {Boolean} [multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Number} [sizelimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @returns {Promise} 回傳Promise，resolve為各檔案陣列，無reject
 * @example
 * need test in browser
 *
 * domShowInputAndGetFiles()
 *     .then((files)=>{})
 *
 */
function domShowInputAndGetFiles(kind = '*', multiple = false, sizelimit = 1000) {

    let pm = genPm()

    //id
    let id = 'drf' + genID() //若全英文數字可能會導致出現特例如hex問題, 添加字首以避免

    //gname
    let gname = 'GrpDomReadFile'

    //remove
    domRemove(`[name=${gname}]`)

    //acp
    let acp = domGetFileAccept(kind)

    //mp
    let mp = multiple ? 'multiple' : ''

    //append html
    let hidehtml = `<div name="${gname}" style="position:relative; width:0px; height:0px; overflow:hidden;"><input id="${id}" type="file" accept="${acp}" ${mp} style="opacity:0; position:absolute; top:-10000px; left:-10000px;"></div>`
    domAppend(document.querySelector('body'), hidehtml)

    //inp
    let inp = domFind('#' + id)

    //evChange
    function evChange(msg) {
        // console.log('evChange', msg)

        //ele
        let ele = this

        //domGetFiles
        let rs = domGetFiles(ele, sizelimit)
        // console.log('domGetFiles', rs)

        //resolve
        pm.resolve(rs)

        //remove event
        inp.removeEventListener('change', evChange)
        window.removeEventListener('focus', evCancel)

        //remove element
        domRemove(`[name=${gname}]`)

    }

    //evCancel
    function evCancel(msg) {
        // console.log('evCancel', msg)
        setTimeout(() => {
            evChange(msg)
        }, 300)
    }

    //change
    inp.addEventListener('change', evChange, true)

    //focus, inp取消時靠window的focus事件來得知, 但不論有無上傳focus都會觸發且會比change還快, 故須綁定延遲觸發的evCancel
    window.addEventListener('focus', evCancel)

    //click
    domTriggerEvent(inp, 'click')

    return pm
}


export default domShowInputAndGetFiles
