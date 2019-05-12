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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFiles.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列，預設為全部'*'
 * @param {Boolean} [multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Number} [sizelimit=500] 輸入檔案大小上線，單位mb，預設為500mb
 * @returns {Promise} 回傳Promise，resolve為各檔案陣列，無reject
 */
function domShowInputAndGetFiles(kind = '*', multiple = false, sizelimit = 500) {

    let df = genPm()

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
    domAppend('body', hidehtml)

    //inp
    let inp = domFind('#' + id)

    //evChange
    function evChange() {

        //ele
        let ele = this

        //domGetFiles
        let rs = domGetFiles(ele, sizelimit)

        //resolve
        df.resolve(rs)

        //remove event
        inp.removeEventListener('change', evChange)

        //remove element
        domRemove(`[name=${gname}]`)

    }

    //change
    inp.addEventListener('change', evChange)

    //click
    domTriggerEvent(inp, 'click')

    return df
}


export default domShowInputAndGetFiles
