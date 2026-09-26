import get from 'lodash-es/get.js'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import domGetPointFromEvent from './domGetPointFromEvent.mjs'
import domGetBoudRect from './domGetBoudRect.mjs'
import optNum from './_optNum.mjs'


/**
 * 前端針對DOM元素拖曳時產生其預覽(拷貝)對象
 *
 * 同一時間只有一個預覽，createPreview時若已有預覽則先移除；預覽存在期間才監聽視窗之mousemove、touchmove(capture，內層元素stopPropagation仍跟隨指標)並定期確認來源元素仍在頁面中，來源被移出(例如可自我刪除之按鈕)時一併移除預覽；removeDragPreview與clear皆移除預覽並停止上述監聽與確認，可重複呼叫
 *
 * 預覽為來源元素之深拷貝：拷貝內之radio移除name，避免已勾選之拷貝插入頁面後取消原件之勾選
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragPreview.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIdentify='dragprevid'] 輸入儲存於DOM的識別欄位名稱字串，預覽之拷貝會清除此欄位使其不與來源元素重複，預設'dragprevid'
 * @param {Number} [opt.containerOpacity=0.4] 輸入預覽元素透明度數字，須為有限數字(可為數字字串)，無效時用預設，預設0.4
 * @param {String} [opt.containerBackground='white'] 輸入預覽元素背景顏色字串，預設'white'
 * @param {Number} [opt.containerBorderWidth=1] 輸入預覽元素邊框寬度數字，須為有限數字(可為數字字串)，無效時用預設，預設1
 * @param {String} [opt.containerBorderColor='#f26'] 輸入預覽元素邊框顏色字串，預設'#f26'
 * @returns {Object} 回傳物件，內含createPreview、updateDragPreview、pauseDragPreview、removeDragPreview、setNodeStyle、setCoverStyle、setSellStyle、setContainerStyle、clear事件，clear同removeDragPreview
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
    let _cur = null //目前之預覽: ele(來源)、node(拷貝)、cover、shell、container、timer(確認來源之計時器)、offs(視窗監聽之移除函數)
    let _pause = false

    //attIdentify, 預覽之拷貝清除此欄位, 使全域只有來源元素帶有此識別
    let attIdentify = get(opt, 'attIdentify', null)
    if (!isestr(attIdentify)) {
        attIdentify = 'dragprevid'
    }

    //containerOpacity, 數字或數字字串, 非有限者用預設
    let containerOpacity = optNum(opt, 'containerOpacity', 0.4)

    //containerBackground
    let containerBackground = get(opt, 'containerBackground', null)
    if (!isestr(containerBackground)) {
        containerBackground = 'white'
    }

    //containerBorderWidth, 數字或數字字串, 非有限者用預設
    let containerBorderWidth = optNum(opt, 'containerBorderWidth', 1)

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

        //深複製
        let nd = ele.cloneNode(true)

        //儲存資訊
        nd.tShiftX = x - rt.left
        nd.tShiftY = y - rt.top
        nd.tWidth = ele.offsetWidth
        nd.tHeight = ele.offsetHeight
        nd.tParent = ele.parentNode
        nd.setAttribute(attIdentify, '') //清除attIdentify欄位, 使全域存在唯一識別元素

        //拷貝內之radio移除name: 已勾選之拷貝以同名插入頁面時, 瀏覽器會取消同群組其他radio(即原件)之勾選
        let radios = []
        try {
            radios = Array.from(nd.querySelectorAll('input[type=radio]'))
            if (nd.matches('input[type=radio]')) {
                radios.push(nd)
            }
        }
        catch (err) {}
        for (let r of radios) {
            r.removeAttribute('name')
        }

        return nd
    }

    //build, 建立預覽並塞入body, 回傳預覽狀態; 無法取得來源位置時回傳null
    function build(ele, x, y) {

        //複製ele
        let node = cloneNode(ele, x, y)

        //check
        if (node === null) {
            return null
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

        //將container塞入body
        //node.tParent.appendChild(container) //原本ele的父層可能也有relative與fixed, 故塞入原本ele的父層內可能會出錯
        document.querySelector('body').appendChild(container)

        return {
            ele,
            node,
            cover,
            shell,
            container,
            timer: null,
            offs: [],
        }
    }

    //listen, 預覽存在期間之視窗監聽(capture), 登記其移除函數
    function listen(cur, name, fun) {
        window.addEventListener(name, fun, true)
        cur.offs.push(() => {
            window.removeEventListener(name, fun, true)
        })
    }

    function createPreview(ele, x, y) {
        //console.log('createPreview')

        //同一時間只有一個預覽, 先移除前一個
        removeDragPreview()

        //build, 須try catch因可能原dom例如是按鈕要自我刪除故會導致出錯
        let cur = null
        try {
            cur = build(ele, x, y)
        }
        catch (err) {
            cur = null
        }
        if (cur === null) {
            return
        }
        _cur = cur

        //跟隨指標
        listen(cur, 'mousemove', (e) => {
            updateDragPreview(e.clientX, e.clientY, 'window mousemove')
        })
        listen(cur, 'touchmove', (e) => {
            let p = domGetPointFromEvent(e)
            if (p) {
                updateDragPreview(p.clientX, p.clientY, 'window touchmove')
            }
        })

        //updateDragPreview
        updateDragPreview(x, y, 'createPreview')

        //檢查來源元素是否仍在頁面中, 若例如拖曳項目是可自我刪除的按鈕, 就有可能產生preview後原始元素被刪除, 故需跟著清除preview
        cur.timer = setInterval(() => {
            if (_cur !== cur) {
                clearInterval(cur.timer)
                return
            }
            if (!cur.ele.isConnected) {
                removeDragPreview()
            }
        }, 500)

    }

    function updateDragPreview(x, y, from) {
        //console.log('updateDragPreview', x, y, from)

        //check
        if (!_cur || _pause) {
            return
        }

        //update
        _cur.container.style.top = `${y - _cur.node.tShiftY}px`
        _cur.container.style.left = `${x - _cur.node.tShiftX}px`

    }

    function pauseDragPreview(b) { //主要供debug用
        //console.log('pauseDragPreview', b)
        _pause = b
    }

    function removeDragPreview() {
        //console.log('removeDragPreview')

        //check
        let cur = _cur
        if (!cur) {
            return
        }
        _cur = null

        //停止確認來源之計時器與視窗監聽
        clearInterval(cur.timer)
        for (let off of cur.offs) {
            off()
        }
        cur.offs = []

        //移除預覽容器, 已被外部移出者略過
        let c = cur.container
        if (c.parentNode) {
            c.parentNode.removeChild(c)
        }

    }

    //setStyle, 對目前預覽之指定層設定樣式, 無預覽時不動作
    function setStyle(key, st) {
        if (!_cur) {
            return
        }
        try {
            for (let k of Object.keys(st)) {
                _cur[key].style[k] = st[k]
            }
        }
        catch (err) {}
    }

    function setNodeStyle(st) {
        setStyle('node', st)
    }

    function setCoverStyle(st) {
        setStyle('cover', st)
    }

    function setSellStyle(st) {
        setStyle('shell', st)
    }

    function setContainerStyle(st) {
        setStyle('container', st)
    }

    function clear() {
        removeDragPreview()
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
