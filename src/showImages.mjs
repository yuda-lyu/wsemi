import Viewer from 'viewerjs'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import getGlobal from './getGlobal.mjs'
import isEle from './isEle.mjs'
import iseobj from './iseobj.mjs'


function optOne() {
    return {
        button: false,
        navbar: false,
        title: false,
        toolbar: {
            zoomIn: 4,
            zoomOut: 4,
            oneToOne: 4,
            reset: 4,
            prev: 0, //關閉往前
            play: 0, //關閉播放
            next: 0, //關閉往後
            rotateLeft: 4,
            rotateRight: 4,
            flipHorizontal: 4,
            flipVertical: 4,
        },
        tooltip: false,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: true,
        fullscreen: false,
        keyboard: true,
        url: 'data-source',
    }
}
function optMuti() {
    let r = optOne()
    r.navbar = true
    r.toolbar.prev = 4
    r.toolbar.next = 4
    return r
}


function getViewer() {
    let g = getGlobal()
    let x = Viewer || g.Viewer
    if (x.default) {
        x = x.default
    }
    return x
}


/**
 * 前端彈窗顯示指定元素內圖片或圖片陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/showImages.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleImg 輸入圖片元素
 * @param {HTMLElement} [eleGroup=null] 輸入元素內含有多圖片元素，預設null
 * @param {Object} [opt={}] 輸入設定物件，預設為optOne或optMuti，若img僅一個則使用optOne，反之使用optMuti
 * @example
 * <img src="001.jpg" onclick="showImages(this)">
 * <img src="002.jpg" onclick="showImages(this,this.parentElement)">
 */
async function showImages(eleImg, eleGroup = null, opt = {}) {
    let one = true
    let img = null

    //check
    if (!iseobj(opt)) {
        opt = {}
    }

    //img and check one
    if (!isEle(eleImg)) {
        return Promise.reject('eleImg is not HTMLElement')
    }
    else {
        img = eleImg //預設先使用自己
    }
    if (eleGroup !== null) {
        if (!isEle(eleGroup)) {
            return Promise.reject('eleGroup is not HTMLElement')
        }
        else {
            one = false
            img = eleGroup //若有群組(父層)元素則使用群組(父層)元素
        }
    }

    //check one
    if (!one) { //若有使用群組(父層)元素
        let imgs = eleGroup.querySelectorAll('img')
        let n = size(imgs)
        if (n === 0) {
            return Promise.reject('eleGroup does not contain any img')
        }
        else if (n === 1) {
            one = true //eleGroup其內只有一張圖片
        }
    }

    //useOpt
    let useOpt = optOne()
    if (!one) {
        useOpt = optMuti()
    }
    useOpt = merge(useOpt, cloneDeep(opt))

    //hide
    let bHide = false
    useOpt.hide = function () {
        //console.log('hide')

        //隱藏時因有transition會淡出, 但此時又點擊圖片要顯示時, 因會點到半透明背景而使點擊失效, 故通過強制hide(true)使能馬上再次點擊顯示圖片
        //因hide事件會被hide繼續調用而產生無限迴圈, 故需通過bHide紀錄是否強制隱藏狀態來避免此問題
        if (!bHide) {
            bHide = true
            vw.hide(true)
        }

    }

    //destroy at hidden
    useOpt.hidden = function () {
        //console.log('hidden')

        //destroy
        vw.destroy()

    }

    //UseViewer
    let UseViewer = getViewer()

    //vw
    let vw = new UseViewer(img, useOpt)

    //show for one
    if (one) {
        vw.show() //只有一張圖時viewerjs會無法自動偵測並於當次點擊顯示, 故使用show強制顯示
    }

    return Promise.resolve('done')
}


export default showImages