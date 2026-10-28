import filter from 'lodash-es/filter.js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'
import pmSeries from './pmSeries.mjs'
import genPm from './genPm.mjs'
import isIE from './isIE.mjs'
import getTrace from './getTrace.mjs'


function readFilePromise(entry) {
    let pm = genPm()
    try {
        entry.file(pm.resolve, pm.reject)
    }
    catch (err) {
        pm.reject(err)
    }
    return pm
}


function readEntriesPromise(directoryReader) {
    let pm = genPm()
    try {
        directoryReader.readEntries(pm.resolve, pm.reject)
    }
    catch (err) {
        pm.reject(err)
    }
    return pm
}


async function treeItem(item) {
    let r = []

    //pm
    let pm = genPm()

    async function tree(item) {
        let file = null
        if (item.isFile) {
            file = await readFilePromise(item)
        }
        r.push({
            type: item.isDirectory ? 'folder' : item.isFile ? 'file' : 'unknow',
            path: item.fullPath,
            name: item.name,
            entry: item,
            file,
        })
        if (item.isDirectory) {
            let directoryReader = item.createReader()
            let entries = await readEntriesPromise(directoryReader)
            await pmSeries(entries, async (entry) => {
                await tree(entry)
            })
        }
    }

    //tree
    await tree(item)

    //resolve
    pm.resolve(r)

    return pm
}


async function treeItems(items) {
    let rs = []
    await pmSeries(items, async (item) => {
        let r = await treeItem(item)
        each(r, (vv) => {
            rs.push(vv)
        })
    })
    return rs
}


async function treeEntries(items) {

    //its
    let its = []
    each(items, (item) => {
        let it = item.webkitGetAsEntry()
        if (it) {
            its.push(it)
        }
    })
    // console.log('its', its)

    //treeItems
    let r = await treeItems(its)

    return r
}


async function treeFiles(files) {
    let r = []
    each(files, (v) => {
        if (v.type) {
            r.push({
                type: 'file',
                name: v.name,
                file: v,
            })
        }
    })
    return r
}


async function treeDataTransfer(dataTransfer) {
    let files = []
    let entries = []

    try {

        //files, 全部瀏覽器
        files = await treeFiles(get(dataTransfer, 'files', []))
        // console.log('files', files)

        //entries, 非IE11與Opera瀏覽器
        if (!isIE()) {
            entries = await treeEntries(get(dataTransfer, 'items', []))
                .catch((err) => {
                    console.log(err) //本機瀏覽html模式時也會報錯[EncodingError]: A URI supplied to the API was malformed, or the resulting Data URL has exceeded the URL length limitations for Data URLs.
                })
            // console.log('entries', entries)
        }

    }
    catch (err) {
        return Promise.reject(err)
    }

    return {
        files,
        entries,
    }
}


/**
 * 前端取得拖曳進指定元素的檔案陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDropFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'in'時為收到dragenter、dragover或drop而即將依狀態決定是否派發dropIn(含emit為是否為自上次移出後首次移入而即將派發dropIn)，'out'時為收到dragleave或呼叫getFiles之cb而暫視為移出並排定100ms後判定(含by為'dragleave'或'cb'、ms固定為100)，'leave'時為100ms後之判定(含emit為期間未再移入而即將派發dropOut，false代表期間又收到in而不派發)，'drop'時為收到drop事件而開始讀取拖曳內容，'files'時為拖曳內容讀取完成而即將派發getFiles(含files為dataTransfer.files中有類型者之數量、filesTree為遍歷資料夾後之檔案數量、entries為遍歷後之檔案與資料夾項目總數)，'error'時為讀取失敗或getFiles之監聽器拋錯而即將派發error，'off'時為呼叫off；事件皆於派發對應事件之前通知；呼叫off之後不再通知(含off前已排定之100ms判定與讀取中者，其對ev之派發維持原行為)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響拖曳處理，預設null
 * @returns {Object} 回傳物件，包含emit與off事件，emit可監聽dropIn、dropOut、getFiles，通過監聽getFiles即可取得拖曳進指定元素的檔案陣列，並呼叫其內回調函數cb，方能繼續觸發dropOut事件
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * let ev = domDropFiles(ele)
 * ev.on('getFiles', ({ files, filesTree, entries, cb }) => {
 *     console.log(files, filesTree, entries)
 *     cb()
 * })
 * ev.on('dropIn', () => {
 *     console.log('dropIn')
 * })
 * ev.on('dropOut', () => {
 *     console.log('dropOut')
 * })
  * ev.on('error', (err) => {
 *     console.log('error', err)
 * })
 *
 */
function domDropFiles(ele, opt = {}) {
    let bMouseIn = false
    let bMouseInTemp = false

    //trace, 觀察回調(opt.onTrace), 未給時為null; off後設為null使之不再通知
    let trace = getTrace(opt)

    //ev
    let ev = evem()

    //addEventListener
    ele.addEventListener('dragenter', dgDragin, false)
    ele.addEventListener('dragover', dgDragin, false)
    ele.addEventListener('dragleave', dgDragout, false)
    ele.addEventListener('drop', dgDrop, false)

    function dgIn(e) {
        domCancelEvent(e)
        bMouseInTemp = true //所有滑鼠進入或移動都標記為滑鼠移入狀態
        if (trace) {
            trace('in', { emit: bMouseIn === false })
        }
        if (bMouseIn === false) {
            bMouseIn = true
            ev.emit('dropIn', { ev: e })
        }
    }

    function dgOut(e, by) {
        domCancelEvent(e)
        bMouseInTemp = false //暫時視為滑鼠移出
        if (trace) {
            trace('out', { by, ms: 100 })
        }
        setTimeout(function() {
            if (trace) {
                trace('leave', { emit: !bMouseInTemp })
            }
            if (!bMouseInTemp) { //若100ms後仍為滑鼠移出狀態才emit事件
                bMouseIn = false
                ev.emit('dropOut', { ev: e })
            }
        }, 100)
    }

    function dgDragin(e) {
        dgIn(e)
    }

    function dgDragout(e) {
        dgOut(e, 'dragleave')
    }

    function dgDrop(e) {

        //trace
        if (trace) {
            trace('drop', {})
        }

        //dgIn
        dgIn(e)

        //cb for dgOut
        function cb() {
            dgOut(e, 'cb')
        }

        //treeDataTransfer
        treeDataTransfer(e.dataTransfer)
            .then((r) => {
                // console.log('r', r)

                //filesTree
                let filesTree = filter(r.entries, { type: 'file' })

                //trace
                if (trace) {
                    trace('files', { files: get(r, 'files.length', 0), filesTree: filesTree.length, entries: get(r, 'entries.length', 0) })
                }

                //emit
                ev.emit('getFiles', {
                    ev: e,
                    files: r.files,
                    filesTree,
                    entries: r.entries,
                    cb,
                })

            })
            .catch((err) => {
                if (trace) {
                    trace('error', {})
                }
                ev.emit('error', err)
            })

    }

    //off
    function off() {
        if (trace) {
            trace('off', {})
            trace = null //釋放後不再通知
        }
        ele.removeEventListener('dragenter', dgDragin, false)
        ele.removeEventListener('dragover', dgDragin, false)
        ele.removeEventListener('dragleave', dgDragout, false)
        ele.removeEventListener('drop', dgDrop, false)
    }

    //save
    ev.off = off

    return ev
}


export default domDropFiles
