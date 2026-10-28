import get from 'lodash-es/get.js'
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
import getTrace from './getTrace.mjs'


/**
 * 前端開啟上傳視窗並回傳檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|Array} [opt.kind='*'] 輸入檔案類型或種類字串或陣列，可選'docums'、'compress'、'image'、'data'，若給予'common'則代表前述4種，也可給予有限的副檔名(詳見getFileAccept)，預設為全部'*'
 * @param {Boolean} [opt.multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Boolean} [opt.entireHierarchy=false] 輸入是否遍歷資料夾內之資料夾與檔案，使用Chrome實驗性語法webkitdirectory，預設為false
 * @param {Number} [opt.sizeMbLimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'open'時為已建立input並綁定監聽而即將觸發點擊開啟選檔視窗(含multiple、entireHierarchy為生效後之布林值)，'cancel'時為收到input之cancel事件(取消選檔之主要偵測)而即將以空檔案結束，'focus'時為收到window之focus事件(舊瀏覽器之備援偵測，entireHierarchy時不綁定)而排定1500ms後判定(含ms固定為1500)，'judge'時為1500ms後之判定(含cancel為此時尚未收到change而視為取消，false代表change已先處理而不再結束)，'settle'時為即將resolve(含by為'change'、'cancel'或'focus'代表由change事件、cancel事件或focus判定結束，files為檔案數量，errs為超過sizeMbLimit之檔案數量)；事件皆於對應動作之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響選檔處理，預設null
 * @returns {Promise} 回傳Promise，resolve回傳各檔案陣列，無reject
 * @example
 * need test in browser
 *
 * domShowInputAndGetFiles()
 *     .then((files)=>{})
 *
 */
function domShowInputAndGetFiles(opt = {}) {

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

    //kind
    let kind = get(opt, 'kind', '*')

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

    //check, 若啟用entireHierarchy則直接使用listFoldersAndFiles, 不再用input法觸發選擇資料夾彈窗
    if (entireHierarchy) {
        // return listFoldersAndFiles() //因listFoldersAndFiles所取得file無webkitRelativePath故不使用
    }

    //sizeMbLimit = 1000
    let sizeMbLimit = get(opt, 'sizeMbLimit')
    if (!isnum(sizeMbLimit)) {
        sizeMbLimit = 1000
    }
    sizeMbLimit = cdbl(sizeMbLimit)

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

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

    //bTrigger
    let bTrigger = false

    //evChange, by為結束來源('change'為change事件, 'cancel'與'focus'為取消路徑以空檔案結束), 作為change監聽器時僅有msg故預設為'change'
    function evChange(msg, by = 'change') {
        // console.log('evChange', msg)

        //bTrigger
        bTrigger = true

        //ele
        let ele = this
        // console.log('ele', ele)
        // console.log('ele.files', ele?.files)
        // console.log('msg.target.files', msg?.target?.files)

        //domGetFiles
        let rs = domGetFiles(ele, sizeMbLimit)
        // console.log('domGetFiles', rs)

        //trace
        if (trace) {
            trace('settle', { by, files: rs.files.length, errs: Object.keys(rs.errs).length })
        }

        //resolve
        pm.resolve(rs)

        //removeEventListener
        inp.removeEventListener('change', evChange, true) //removeEventListener時也需要給予同用useCapture值
        inp.removeEventListener('cancel', evCancelNative, true)
        if (!entireHierarchy) {
            window.removeEventListener('focus', evCancel)
        }

        //remove element
        domRemove(`[name=${gname}]`)
        // console.log('domRemove')

    }

    //evCancelNative, 現代瀏覽器(Chrome113+/Firefox91+/Safari16.4+)於取消選檔時觸發input之cancel事件, 為決定性訊號
    function evCancelNative(msg) {
        // console.log('evCancelNative', msg)
        //check, 已trigger代表change已處理
        if (bTrigger) {
            return
        }
        if (trace) {
            trace('cancel', {})
        }
        evChange.call(inp, msg, 'cancel') //以inp為this, files為空故resolve空files
    }

    //evCancel, 舊瀏覽器之備援偵測
    function evCancel(msg) {
        // console.log('evCancel', msg)
        if (trace) {
            trace('focus', { ms: 1500 })
        }
        //setTimeout, 因不論有無上傳, window的focus事件都會觸發且會比change還快, 故須延遲偵測bTrigger
        //延遲須夠長: 選檔時change可能比focus晚逾300ms(實測於Windows/Chrome可穩定重現), 過短會誤判為取消,
        //搶先resolve空陣列並移除input, 造成「有選檔但讀不到」; 真取消時多等待並無感, 故取1500ms
        setTimeout(() => {
            if (trace) {
                trace('judge', { cancel: !bTrigger })
            }
            //check, 尚未trigger代表為cancel
            if (!bTrigger) {
                evChange.call(inp, msg, 'focus') //以inp為this, files為空故resolve空files
            }
        }, 1500)
    }

    //change
    inp.addEventListener('change', evChange, true) //有給予useCapture, removeEventListener時也需要給予同用useCapture值

    //cancel, 取消選檔之主要偵測
    inp.addEventListener('cancel', evCancelNative, true)

    //addEventListener
    if (!entireHierarchy) {
        //focus, 舊瀏覽器(無input cancel事件)取消時靠window的focus事件來得知, 但不論有無上傳focus都會觸發且會比change還快, 故須綁定延遲觸發的evCancel
        window.addEventListener('focus', evCancel)
    }

    //trace
    if (trace) {
        trace('open', { multiple, entireHierarchy })
    }

    //click
    domTriggerEvent(inp, 'click')

    return pm
}


export default domShowInputAndGetFiles
