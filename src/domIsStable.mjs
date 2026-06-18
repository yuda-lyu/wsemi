
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import evem from './evem.mjs'
import genPm from './genPm.mjs'
import delay from './delay.mjs'


/**
 * 前端偵測DOM元素(及其子元素)是否已穩定
 *
 * @memberOf w-component-vue
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='promise'] 輸入模式字串，可使用'promise'與'event'，'promise'代表一次性偵測並回傳Promise(resolve回傳當前是否穩定布林值)，'event'代表持續性偵測並回傳EventEmitter，預設'promise'
 * @param {Number} [opt.tolerance=0] 輸入位置容許誤差數字，單位px，預設0表示須完全相同
 * @param {Number} [opt.timeDiff=100] 輸入位置前後比對之時間差數字，單位ms，預設100
 * @param {Number} [opt.timeDetect=50] 輸入event模式輪詢偵測間隔數字，單位ms，預設50
 * @returns {Promise|Object} 回傳物件，給予'promise'時回傳Promise(resolve回傳當前是否穩定布林值，reject回傳錯誤訊息)，給予'event'時回傳EventEmitter，可使用create、on、dispose函數
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

    //getAnims: 取得進行中的動畫(含子樹), 不支援getAnimations時退化為空陣列
    let getAnims = () => {
        try {
            return ele.getAnimations({ subtree: true })
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

            //bRect, getBoundingClientRect間隔timeDetect前後比對位置是否無變化
            let r1 = getRect()
            await delay(timeDiff)
            let r2 = getRect()
            let bRect = sameRect(r1, r2)

            //bAnim, 用getAnimations().finished確認動畫也都結束(空陣列allSettled立即過)
            await Promise.allSettled(getAnims().map((a) => a.finished))
            let bAnim = getAnims().length === 0

            //b
            let b = bRect && bAnim

            //resolve, b=true代表皆無變化才視為穩定
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
