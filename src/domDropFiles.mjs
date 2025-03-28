import filter from 'lodash-es/filter.js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'
import pmSeries from './pmSeries.mjs'
import genPm from './genPm.mjs'
import isIE from './isIE.mjs'


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
function domDropFiles(ele) {
    let bMouseIn = false
    let bMouseInTemp = false

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
        if (bMouseIn === false) {
            bMouseIn = true
            ev.emit('dropIn', { ev: e })
        }
    }

    function dgOut(e) {
        domCancelEvent(e)
        bMouseInTemp = false //暫時視為滑鼠移出
        setTimeout(function() {
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
        dgOut(e)
    }

    function dgDrop(e) {

        //dgIn
        dgIn(e)

        //cb for dgOut
        function cb() {
            dgOut(e)
        }

        //treeDataTransfer
        treeDataTransfer(e.dataTransfer)
            .then((r) => {
                // console.log('r', r)

                //filesTree
                let filesTree = filter(r.entries, { type: 'file' })

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
                ev.emit('error', err)
            })

    }

    //off
    function off() {
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
