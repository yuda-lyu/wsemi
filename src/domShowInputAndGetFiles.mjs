import get from 'lodash/get'
import genPm from './genPm.mjs'
import genID from './genID.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
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
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Boolean} [opt.entireHierarchy=false] 輸入是否遍歷資料夾內之資料夾與檔案，使用Chrome實驗性語法webkitdirectory，預設為false
 * @param {Number} [opt.sizelimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @returns {Promise} 回傳Promise，resolve為各檔案陣列，無reject
 * @example
 * need test in browser
 *
 * domShowInputAndGetFiles()
 *     .then((files)=>{})
 *
 */
function domShowInputAndGetFiles(kind = '*', opt = {}) {

    // //listFoldersAndFiles, 因rollup無法編譯故得要放domShowInputAndGetFiles內, 但因所取得file無webkitRelativePath故不使用
    // async function listFoldersAndFiles() {
    //     async function core() {

    //         //showDirectoryPicker
    //         let dirHandle = await window.showDirectoryPicker()
    //         // console.log('dirHandle', dirHandle)

    //         //rs
    //         let rs = []

    //         //getFilesRecursively
    //         async function getFilesRecursively(entry) {
    //             // console.log('getFilesRecursively', entry)
    //             if (entry.kind === 'file') {
    //                 let file = await entry.getFile()
    //                 if (file !== null) {
    //                     //file.relativePath = getRelativePath(entry);
    //                     rs.push(file)
    //                 }
    //             }
    //             else if (entry.kind === 'directory') {
    //                 // let rs = await entry.resolve()
    //                 // console.log('rs',rs)
    //                 // await wsemi.pmSeries(rs,async (handle)=>{
    //                 //     await getFilesRecursively(handle)
    //                 // })
    //                 for await (let handle of entry.values()) {
    //                     await getFilesRecursively(handle)
    //                 }
    //             }
    //         }

    //         //recursively
    //         await getFilesRecursively(dirHandle)

    //         return rs
    //     }
    //     let r = {
    //         files: [],
    //         errs: {},
    //     }
    //     await core()
    //         .then((files) => {
    //             r.files = files
    //         })
    //         .catch(() => {
    //         })
    //     return r
    // }

    //multiple
    let multiple = get(opt, 'multiple')
    if (!isbol(multiple)) {
        multiple = false
    }

    //entireHierarchy
    let entireHierarchy = get(opt, 'entireHierarchy')
    if (!isbol(entireHierarchy)) {
        entireHierarchy = false
    }

    //check
    if (entireHierarchy && !multiple) {
        multiple = true
    }

    // //check, 若啟用entireHierarchy則直接使用listFoldersAndFiles, 不再用input法觸發選擇資料夾彈窗
    // if (entireHierarchy) {
    //     return listFoldersAndFiles()
    // }

    //sizelimit = 1000
    let sizelimit = get(opt, 'sizelimit')
    if (!isnum(sizelimit)) {
        sizelimit = 1000
    }
    sizelimit = cdbl(sizelimit)

    //pm
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

    //eh
    let eh = entireHierarchy ? 'webkitdirectory' : ''

    //append html
    let hidehtml = `<div name="${gname}" style="position:relative; width:0px; height:0px; overflow:hidden;"><input id="${id}" type="file" accept="${acp}" ${mp} ${eh} style="opacity:0; position:absolute; top:-10000px; left:-10000px;"></div>`
    domAppend(document.querySelector('body'), hidehtml)

    //inp
    let inp = domFind('#' + id)

    //evChange
    let bTrigger = false
    function evChange(msg) {
        // console.log('evChange', msg)

        //bTrigger
        bTrigger = true

        //ele
        let ele = this
        // console.log('ele', ele)
        // console.log('ele.files', ele?.files)
        // console.log('msg.target.files', msg?.target?.files)

        //domGetFiles
        let rs = domGetFiles(ele, sizelimit)
        // console.log('domGetFiles', rs)

        //resolve
        pm.resolve(rs)

        //remove event
        inp.removeEventListener('change', evChange)
        if (!entireHierarchy) {
            window.removeEventListener('focus', evCancel)
        }

        //remove element
        domRemove(`[name=${gname}]`)
        // console.log('domRemove', domRemove)

    }

    //evCancel
    function evCancel(msg) {
        // console.log('evCancel', msg)
        //setTimeout, 因不論有無上傳, window的focus事件都會觸發且會比change還快, 故須延遲偵測bTrigger
        setTimeout(() => {
            //check, 尚未trigger代表為cancel
            if (!bTrigger) {
                evChange(msg)
            }
        }, 300)
    }

    //change
    inp.addEventListener('change', evChange, true)

    if (!entireHierarchy) { //目前entireHierarchy有問題, 無法支援使用者取消, 待研究
        //focus, inp取消時靠window的focus事件來得知, 但不論有無上傳focus都會觸發且會比change還快, 故須綁定延遲觸發的evCancel
        window.addEventListener('focus', evCancel)
    }

    //click
    domTriggerEvent(inp, 'click')

    return pm
}


export default domShowInputAndGetFiles
