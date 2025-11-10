import merge from 'lodash-es/merge.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import size from 'lodash-es/size.js'
import isEle from './isEle.mjs'
import iseobj from './iseobj.mjs'
import genPm from './genPm.mjs'
import waitFun from './waitFun.mjs'
import getGlobal from './getGlobal.mjs'


function getViewer() {
    let g = getGlobal()
    let x = g.Viewer
    return x
}

//viewer.js工具指定值:
// 0: 隱藏
// 1: 永遠顯示
// 2: 螢幕寬度 ≥ 768px 才顯示
// 3: 螢幕寬度 ≥ 992px 才顯示
// 4: 螢幕寬度 ≥ 1200px 才顯示

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
        // url: 'src',
    }
}


function optMuti() {
    let r = optOne()
    r.navbar = true
    r.toolbar.prev = 4
    r.toolbar.next = 4
    return r
}


/**
 * 前端呼叫viewer.js顯示指定元素內圖片或圖片陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowImages.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleImg 輸入圖片元素
 * @param {HTMLElement} [eleGroup=null] 輸入元素內含有多圖片元素，預設null
 * @param {Object} [opt={}] 輸入viewerjs設定物件，預設使用optOne或optMuti，若img僅一個則使用optOne，反之使用optMuti
 * @returns {Promise} 回傳Promise，resolve回傳close訊息，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * <img src="001.jpg" onclick="domShowImages(this)">
 * <img src="002.jpg" onclick="domShowImages(this,this.parentElement)">
 *
 */
async function domShowImages(eleImg, eleGroup = null, opt = {}) {
    let one = true
    let img = null

    //pm
    let pm = genPm()

    //check
    if (!iseobj(opt)) {
        opt = {}
    }

    //img and check one
    if (!isEle(eleImg)) {
        pm.reject('eleImg is not a HTMLElement')
        return pm
    }
    else {
        img = eleImg //預設先使用自己
    }
    if (eleGroup !== null) {
        if (!isEle(eleGroup)) {
            pm.reject('eleGroup is not a HTMLElement')
            return pm
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
            pm.reject('eleGroup does not contain any img')
            return pm
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

    //shown
    useOpt.shown = function () {
        // console.log('shown')

        let core = async() => {

            //ele
            let ele = null

            //shown執行時未必有vw.viewer, 得須等待再掛載監聽
            await waitFun(() => {
                ele = vw.viewer
                let b = isEle(ele)
                return b
            })
            // console.log('ele', ele)

            // let img = ele.querySelector('img')
            // console.log('img', img)

            //isOnBackdrop
            let isOnBackdrop = (clientX, clientY) => {

                //eles
                let eles = document.elementsFromPoint(clientX, clientY)
                // console.log('eles', eles)

                //img
                let img = eles.find(el =>
                    el.tagName === 'IMG'
                )
                // console.log('img', img)

                //check
                if (!isEle(img)) {
                    return true
                }

                //b, 若img的class含有viewer-move, 代表點擊在viewer.js的img上
                let b = img?.classList?.contains('viewer-move')

                return !b
            }

            //偵測輕點
            let bTouch = false
            let x = 0
            let y = 0
            let dis = 0
            let disLim = 12
            ele.addEventListener('touchstart', (ev) => {
                // console.log('touchstart', ev)

                //update
                let t = ev.touches[0]
                x = t.clientX
                y = t.clientY

                //check
                if (isOnBackdrop(x, y)) {
                    bTouch = true
                }

            }, { passive: false })
            ele.addEventListener('touchmove', (ev) => {
                // console.log('touchmove', ev)

                //check
                if (!bTouch) {
                    return
                }

                //dx, dy
                let t = ev.touches[0]
                let _x = t.clientX
                let _y = t.clientY
                let dx = _x - x
                let dy = _y - y

                //d
                let d = Math.sqrt(dx * dx + dy * dy)

                //累加移動距離
                dis += d
                // console.log('update dis', dx, dy, d, dis)

                //update
                x = t.clientX
                y = t.clientY

            }, { passive: false })
            ele.addEventListener('touchend', (ev) => {
                // console.log('touchend', ev)

                //check
                if (!bTouch) {
                    return
                }

                //check
                if (dis < disLim) {
                    // console.log('vw.hide(from touch)')

                    //若點擊可顯示viewer.js圖片, 須阻止後續合成click觸發, 否則於手機會造成觸發WebKit的tap highlight, 使用者體驗不佳
                    ev.preventDefault()
                    ev.stopPropagation()

                    vw.hide(true) //立即關閉不用淡出動畫

                }
                else {
                    // console.log('drag')
                }

                //reset
                bTouch = false
                dis = 0

            }, { passive: false }) //必須使用passive=false否則無法cancel
            ele.addEventListener('touchcancel', (ev) => {
                // console.log('touchcancel', ev)

                //reset
                bTouch = false
                dis = 0

            })

        }
        core()
            .catch((err) => {
                console.log(err)
            })

    }

    //hide
    let bHide = false
    useOpt.hide = function () {
        // console.log('hide')

        //因hide事件會被hide繼續調用而產生無限迴圈, 故需通過bHide紀錄是否強制隱藏狀態來避免此問題
        //隱藏時因有transition會淡出, 但此時又點擊圖片要顯示時, 因會點到半透明背景而使點擊失效, 故通過強制vw.hide(true)使能馬上再次點擊顯示圖片
        if (!bHide) {
            bHide = true
            vw.hide(true) //立即關閉不用淡出動畫
        }

    }

    //destroy at hidden
    useOpt.hidden = function () {
        //console.log('hidden')

        //destroy
        vw.destroy()

        //resolve
        pm.resolve('close')

    }

    //UseViewer
    let UseViewer = getViewer()

    //vw
    let vw = new UseViewer(img, useOpt)

    //執行函數直接顯示
    vw.show()

    return pm
}


export default domShowImages
