
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import evem from './evem.mjs'
import genPm from './genPm.mjs'
import delay from './delay.mjs'


/**
 * 前端偵測DOM元素(及其子元素)是否已穩定
 *
 * 一輪偵測: 相隔timeDiff取兩次位置與尺寸(getBoundingClientRect，含transform位移)，並取子樹內進行中之動畫(getAnimations)；等該批動畫結束或取消後再取一次位置與動畫數，整輪期間位置皆未變且從頭到尾皆無動畫才視為穩定，期間曾有動畫或位移即回報不穩定，由下一輪再判。動畫只計playState為running且iterations有限者：已結束但因fill:forwards仍被回傳之動畫不計，否則子元素做完進場動畫後父元素會永遠不穩定；無限循環動畫(如spinner)永不結束，不計亦不等待，否則整輪永不落定
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsStable.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='promise'] 輸入模式字串，可使用'promise'與'event'，'promise'代表一次性偵測並回傳Promise(resolve回傳該輪是否穩定布林值)，'event'代表持續性偵測並回傳EventEmitter，每timeDetect啟動一輪(前一輪未完不重疊)，穩定狀態改變時emit('stable', bool)，初始視為不穩定故第一次穩定會emit true，預設'promise'
 * @param {Number} [opt.tolerance=0] 輸入位置容許誤差數字，單位px，預設0表示須完全相同
 * @param {Number} [opt.timeDiff=100] 輸入位置前後比對之時間差數字，單位ms，預設100
 * @param {Number} [opt.timeDetect=50] 輸入event模式輪詢偵測間隔數字，單位ms，預設50
 * @returns {Promise|Object} 回傳物件，給予'promise'時回傳Promise(resolve回傳當前是否穩定布林值，reject回傳錯誤訊息)，給予'event'時回傳EventEmitter，可使用create、on、dispose函數
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 *
 * //promise, 一次性偵測
 * let b = await domIsStable(ele)
 * console.log(b)
 * // => true or false
 *
 * //event, 持續偵測
 * let ev = domIsStable(ele, { mode: 'event' })
 * ev.on('stable', (b) => {
 *     console.log('stable', b)
 * })
 * ev.create()
 * //...
 * ev.dispose()
 *
 */
function domIsStable(ele, opt = {}) {

    //check ele
    if (!isEle(ele)) {
        return Promise.reject('invalid element')
    }

    //check getBoundingClientRect
    if (!isfun(ele.getBoundingClientRect)) {
        return Promise.reject('invalid element.getBoundingClientRect')
    }

    //mode
    let mode = get(opt, 'mode', '')
    if (mode !== 'promise' && mode !== 'event') {
        mode = 'promise'
    }

    //tolerance, 位置容許誤差(px)
    let tolerance = get(opt, 'tolerance', 0)

    //timeDiff, 位置前後比對的時間差(ms)
    let timeDiff = get(opt, 'timeDiff', 100)

    //timeDetect, 偵測時間差(ms)
    let timeDetect = get(opt, 'timeDetect', 50)

    //getRect: 取螢幕位置與尺寸(getBoundingClientRect的left/top會反映transform位移)
    let getRect = () => {
        let r = ele.getBoundingClientRect()
        return { x: r.left, y: r.top, w: r.width, h: r.height }
    }

    //sameRect: 兩次位置/尺寸是否在誤差內相同
    let sameRect = (a, b) => {
        return !!a && !!b &&
            Math.abs(a.x - b.x) <= tolerance &&
            Math.abs(a.y - b.y) <= tolerance &&
            Math.abs(a.w - b.w) <= tolerance &&
            Math.abs(a.h - b.h) <= tolerance
    }

    //isActive: 動畫是否進行中且會結束
    //  只計playState為running者: 已結束但因fill:forwards仍被getAnimations回傳者(playState為finished)與暫停者不計, 否則子元素做完進場動畫後父元素會永遠不穩定
    //  無限循環動畫(iterations為Infinity, 如spinner)永不結束, 其finished永不落定, 不計亦不等待, 否則整輪吊死; 故子樹有spinner不影響穩定判定
    //  剛建立尚未開始之transition為running且pending, 屬進行中, 須計入
    let isActive = (a) => {
        try {
            return a.playState === 'running' && Number.isFinite(a.effect.getTiming().iterations)
        }
        catch (err) {
            return false
        }
    }

    //getAnims: 取得子樹內進行中且會結束之動畫, 不支援getAnimations時退化為空陣列
    let getAnims = () => {
        try {
            return ele.getAnimations({ subtree: true }).filter(isActive)
        }
        catch (err) {
            return []
        }
    }

    //core
    let core = async () => {

        //pm
        let pm = genPm()

        try {

            //r1、r2, 相隔timeDiff取兩次位置
            let r1 = getRect()
            await delay(timeDiff)
            let r2 = getRect()

            //anims, 視窗結束當下進行中之動畫, 須於等待之前取得並計入判定
            //  若只看等完之後的數量, 等完幾乎必為0, 而transition剛建立時有一至數個frame尚未位移, 視窗尾端建立者r1與r2皆未見位移, 整段動畫會被漏判為穩定
            let anims = getAnims()
            let n1 = anims.length

            //等這批動畫結束或被取消(取消時finished為reject, 以allSettled一律通過), 再取一次動畫數與位置
            await Promise.allSettled(anims.map((a) => a.finished))
            let n2 = getAnims().length
            let r3 = getRect()

            //b, 整輪期間位置皆未變且從頭到尾皆無動畫才視為穩定, 期間曾有動畫或位移即回報不穩定, 由下一輪再判
            let b = sameRect(r1, r2) && sameRect(r1, r3) && n1 === 0 && n2 === 0

            //resolve
            pm.resolve(b)

        }
        catch (err) {
            pm.reject(err)
        }

        return pm
    }

    //corePm
    let corePm = core

    //coreEv
    let coreEv = () => {

        //ev
        let ev = evem()

        //watching
        let watching = false

        //timerCreate, timerQuery
        let timerCreate = null
        let timerQuery = null

        //stop
        let stop = false

        //observe
        let observe = (ele) => {
            let b = false

            //check
            if (!isEle(ele)) {
                return b
            }

            //observe
            try {

                let bLock = false
                let bLast = false
                timerQuery = setInterval(() => {
                    if (stop) {
                        clearInterval(timerQuery)
                        return
                    }
                    if (bLock) {
                        return
                    }
                    bLock = true
                    core()
                        .then((bNow) => {
                            if (stop) {
                                return
                            }
                            if (bLast !== bNow) {
                                bLast = bNow
                                ev.emit('stable', bNow)
                            }
                        })
                        .catch(() => {
                            // console.log(err)
                        })
                        .finally(() => {
                            bLock = false
                        })
                }, timeDetect)

                b = true
            }
            catch (err) {
                // console.log(err)
            }

            return b
        }

        //create
        let create = () => {
            timerCreate = setInterval(() => {
                watching = observe(ele)
                if (watching) {
                    clearInterval(timerCreate)
                }
            }, 50)
        }

        //dispose
        let dispose = () => {
            let b = false
            try {
                clearInterval(timerCreate)
                clearInterval(timerQuery)
                stop = true
                b = true
            }
            catch (err) {
                // console.log(err)
            }
            return b
        }

        //save
        ev.create = create
        ev.dispose = dispose

        return ev
    }

    //r
    let r = null
    if (mode === 'promise') {
        r = corePm()
    }
    else if (mode === 'event') {
        r = coreEv()
    }

    return r
}


export default domIsStable
