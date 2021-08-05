import each from 'lodash/each'
import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import domRemove from './domRemove.mjs'
import domGetPointFromEvent from './domGetPointFromEvent.mjs'
import domGetAttr from './domGetAttr.mjs'
import domGetBoudRect from './domGetBoudRect.mjs'


/**
 * 前端針對DOM元素拖曳時產生其預覽(拷貝)對象
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragPreview.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIdentify='dragprevid'] 輸入儲存於DOM的識別欄位名稱字串，預設'dragprevid'
 * @param {Number} [opt.containerOpacity=0.4] 輸入預覽元素透明度數字，預設0.4
 * @param {String} [opt.containerBackground='white'] 輸入預覽元素背景顏色字串，預設'white'
 * @param {Number} [opt.containerBorderWidth=1] 輸入預覽元素邊框寬度數字，預設1
 * @param {String} [opt.containerBorderColor='#f26'] 輸入預覽元素邊框顏色字串，預設'#f26'
 * @returns {Object} 回傳物件，內含createPreview、updateDragPreview、pauseDragPreview、removeDragPreview、setNodeStyle、setCoverStyle、setSellStyle、setContainerStyle、clear事件
 * @example
 * need test in browser
 *
 * let pv = domDragPreview({
 *     attIdentify,
 *     containerOpacity: previewOpacity,
 *     containerBackground: previewBackground,
 *     containerBorderWidth: previewBorderWidth,
 *     containerBorderColor: previewBorderColor,
 * })
 * pv.createPreview()
 * pv.removeDragPreview()
 * pv.clear()
 *
 */
function domDragPreview(opt = {}) {
    let _attId = 'dragpreviewid'
    let _ele = null
    let _node = null
    let _cover = null
    let _shell = null
    let _container = null
    let _pause = false

    //attIdentify, 產生preview會於preview內刪除此attr, 並偵測是否有此欄位的元素存在, 藉此判斷是否需自動移除preview
    let attIdentify = get(opt, 'attIdentify', null)
    if (!isestr(attIdentify)) {
        attIdentify = 'dragprevid'
    }

    //containerOpacity
    let containerOpacity = get(opt, 'containerOpacity', null)
    if (!isNumber(containerOpacity)) {
        containerOpacity = 0.4
    }

    //containerBackground
    let containerBackground = get(opt, 'containerBackground', null)
    if (!isestr(containerBackground)) {
        containerBackground = 'white'
    }

    //containerBorderWidth
    let containerBorderWidth = get(opt, 'containerBorderWidth', null)
    if (!isNumber(containerBorderWidth)) {
        containerBorderWidth = 1
    }

    //containerBorderColor
    let containerBorderColor = get(opt, 'containerBorderColor', null)
    if (!isestr(containerBorderColor)) {
        containerBorderColor = '#f26'
    }

    //pid
    let pid = `c${genID(8)}`

    function cloneNode(ele, x, y) {
        //console.log('cloneNode')

        //domGetBoudRect
        let rt = domGetBoudRect(ele)
        if (!rt) {
            return null
        }

        //備份ele
        _ele = ele

        //深複製
        let nd = ele.cloneNode(true)

        //儲存資訊
        nd.tShiftX = x - rt.left
        nd.tShiftY = y - rt.top
        nd.tWidth = ele.offsetWidth
        nd.tHeight = ele.offsetHeight
        nd.tParent = ele.parentNode
        nd.setAttribute(attIdentify, '') //清除attIdentify欄位, 使全域存在唯一識別元素

        return nd
    }

    function createPreview(ele, x, y) {
        //console.log('createPreview')

        function core() {

            //複製ele
            let node = cloneNode(ele, x, y)

            //check
            if (node === null) {
                return
            }

            //創建遮罩cover
            let cover = document.createElement('div')
            cover.style.position = 'absolute'
            cover.style.zIndex = 1
            cover.style.top = 0
            cover.style.left = 0
            cover.style.width = '100%'
            cover.style.height = '100%'

            //將複製的ele(node)塞入cover
            cover.appendChild(node)

            //創建殼層shell
            let shell = document.createElement('div')
            shell.style.position = 'relative'

            //將cover塞入shell
            shell.appendChild(cover)

            //創建container
            let container = document.createElement('div')
            container.setAttribute(_attId, pid)
            container.style.position = 'fixed'
            container.style.zIndex = 100000
            container.style.width = `${node.tWidth + 2 * containerBorderWidth}px`
            container.style.height = `${node.tHeight + 2 * containerBorderWidth}px`
            container.style.opacity = containerOpacity
            container.style.background = containerBackground
            container.style.border = `${containerBorderWidth}px solid ${containerBorderColor}`
            container.style.pointerEvents = 'none' //會導致游標樣式失效, 也會使子元素游標樣式失效

            //將shell塞入container
            container.appendChild(shell)

            //將container塞入原本ele的父層內
            node.tParent.appendChild(container)

            //儲存至全域
            _node = node
            _cover = cover
            _shell = shell
            _container = container

            //updateDragPreview
            updateDragPreview(x, y, 'createPreview')

        }

        core()
        //core, 暴力try catch攔錯, 因可能原dom例如是按鈕要自我刪除故會導致出錯
        try {
            // core()
        }
        catch (err) {}

        //檢查原始元素是否存在, 若例如拖曳項目是可自我刪除的按鈕, 就有可能產生preview後原始元素被刪除, 故需跟著清除preview
        let t = setInterval(() => {
            let id = domGetAttr(_ele, attIdentify)
            let ele = document.querySelector(`[${attIdentify}='${id}']`)
            if (!ele) {
                clearInterval(t)
                removeDragPreview()
            }
        }, 500)

    }

    function updateDragPreview(x, y, from) {
        //console.log('updateDragPreview', x, y, from)

        //check
        if (!_node || !_cover || !_shell || !_container || _pause) {
            return
        }

        //update
        _container.style.top = `${y - _node.tShiftY}px`
        _container.style.left = `${x - _node.tShiftX}px`

    }

    function pauseDragPreview(b) { //主要供debug用
        //console.log('pauseDragPreview', b)
        _pause = b
    }

    function removeDragPreview() {
        //console.log('removeDragPreview')

        //domRemove
        domRemove(`[${_attId}='${pid}']`)

        //clear
        _node = null
        _cover = null
        _shell = null
        _container = null

    }

    let evMM = function(e) {
        //console.log('window mousemove', e)
        updateDragPreview(e.clientX, e.clientY, 'window mousemove')
    }
    window.addEventListener('mousemove', evMM)

    let evTM = function(e) {
        //console.log('window touchmove', e)
        let p = domGetPointFromEvent(e)
        if (p) {
            updateDragPreview(p.clientX, p.clientY, 'window touchmove')
        }
    }
    window.addEventListener('touchmove', evTM)

    function setNodeStyle(st) {
        try {
            each(st, (v, k) => {
                _node.style[k] = v
            })
        }
        catch (err) {}
    }

    function setCoverStyle(st) {
        try {
            each(st, (v, k) => {
                _cover.style[k] = v
            })
        }
        catch (err) {}
    }

    function setSellStyle(st) {
        try {
            each(st, (v, k) => {
                _shell.style[k] = v
            })
        }
        catch (err) {}
    }

    function setContainerStyle(st) {
        try {
            each(st, (v, k) => {
                _container.style[k] = v
            })
        }
        catch (err) {}
    }

    function clear() {
        window.removeEventListener('mousemove', evMM)
        window.removeEventListener('touchmove', evTM)
    }

    return {
        createPreview,
        updateDragPreview,
        pauseDragPreview,
        removeDragPreview,
        setNodeStyle,
        setCoverStyle,
        setSellStyle,
        setContainerStyle,
        clear,
    }
}


export default domDragPreview
