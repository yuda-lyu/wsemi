import values from 'lodash/values'
import evem from './evem.mjs'


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
        e.stopPropagation()
        e.preventDefault()
        bMouseInTemp = true //所有滑鼠進入或移動都標記為滑鼠移入狀態
        if (bMouseIn === false) {
            bMouseIn = true
            ev.emit('dropIn', e)
        }
    }

    function dgOut(e) {
        e.stopPropagation()
        e.preventDefault()
        bMouseInTemp = false //暫時視為滑鼠移出
        setTimeout(function() {
            if (!bMouseInTemp) { //若100ms後仍為滑鼠移出狀態才emit事件
                bMouseIn = false
                ev.emit('dropOut', e)
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

        //files, 原dataTransfer.files是key為0~n的類似陣列物件, 為避免外部誤認為陣列, 故此處強制用values轉陣列
        let files = values(e.dataTransfer.files)

        //emit
        ev.emit('getFiles', { files, e, cb })

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
