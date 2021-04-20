import filter from 'lodash/filter'
import get from 'lodash/get'
import each from 'lodash/each'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'
import pmSeries from './pmSeries.mjs'
import genPm from './genPm.mjs'
import isIE from './isIE.mjs'


async function readEntriesPromise(directoryReader) {
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
        r.push({
            type: item.isDirectory ? 'folder' : item.isFile ? 'file' : 'unknow',
            path: item.fullPath,
            name: item.name,
            entry: item,
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
    for (let i = 0; i < items.length; i++) {
        let item = items[i].webkitGetAsEntry()
        if (item) {
            its.push(item)
        }
    }

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

    //files, 全部瀏覽器
    let files = await treeFiles(get(dataTransfer, 'files', []))

    //entries, 非IE11瀏覽器
    let entries = []
    if (!isIE()) {
        entries = await treeEntries(get(dataTransfer, 'items', []))
    }

    return {
        files,
        entries
    }
}


/**
 * 前端取得拖曳進指定元素的檔案陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAppend.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom元素
 * @returns {Object} 回傳物件，包含emit與off事件，emit可監聽dropIn、dropOut、getFiles，通過監聽getFiles即可取得拖曳進指定元素的檔案陣列
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

                //filesTree
                let filesTree = filter(r.entries, { type: 'file' })

                //emit
                ev.emit('getFiles', {
                    ev: e,
                    files: r.files,
                    filesTree,
                    entries: r.entries,
                    cb
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
    ev.off = off

    return ev
}


export default domDropFiles
