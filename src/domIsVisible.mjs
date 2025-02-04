import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import genPm from './genPm.mjs'
import evem from './evem.mjs'


function ckIOb() {
    try {
        return 'IntersectionObserver' in window
    }
    catch (err) {
        return false
    }
}


function ckIOE() {
    try {
        return 'IntersectionObserverEntry' in window
    }
    catch (err) {
        return false
    }
}


function ckIR() {

    function ckIRp() {
        try {
            return 'intersectionRatio' in window.IntersectionObserverEntry.prototype
        }
        catch (err) {
            return false
        }
    }

    function ckIRF() {
        //IE使用polyfill後IntersectionObserverEntry為函數, 檢核IntersectionObserverEntry.prototype會一樣過不了
        return isfun(window.IntersectionObserverEntry)
    }

    return ckIRp() || ckIRF()
}


function ckIO() {
    return !ckIOb() || !ckIOE() || !ckIR()
}


/**
 * 前端檢測DOM元素是否為顯示(使用者可見)狀態
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsVisible.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='promise'] 輸入模式字串，可使用'promise'與'event'，給予'promise'代表一次性偵測並回傳Promise，給予'event'代表持續性偵測並回傳EventEmitter，預設'promise'
 * @returns {Promise|Object} 回傳物件，給予'promise'時回傳Promise，resolve回傳顯示與否布林值，reject回傳錯誤訊息，給予'event'時回傳物件，可使用create、on、dispose函數，create代表開啟偵測並直至出現元素，on代表監聽'visible'事件可得元素顯隱變化，dispose代表中止偵測
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 *
 * domIsVisible(ele, { mode: 'promise' })
 *     .then(function(visible){
 *         console.log(visible)
 *         // => true or false
 *     })
 *     .catch(function(err){
 *         console.log(err)
 *     })
 *
 * let ev = domIsVisible(ele, { mode: 'event' })
 * ev.create()
 * ev.on('visible',(visible) => {
 *     console.log(visible)
 *     // => true or false
 * })
 * // ev.dispose()
 *
 */
function domIsVisible(ele, opt = {}) {

    //check ele
    if (!isEle(ele)) {
        return Promise.reject('invalid element')
    }

    //check IntersectionObserver
    if (ckIO()) {
        return Promise.reject('invalid IntersectionObserver')
    }

    //mode
    let mode = get(opt, 'mode', '')
    if (mode !== 'promise' && mode !== 'event') {
        mode = 'promise'
    }

    //corePm
    let corePm = () => {

        //pm
        let pm = genPm()

        try {

            //ob
            let ob = new IntersectionObserver((entries) => {

                //resolve
                pm.resolve(entries[0].isIntersecting)

                //disconnect
                ob.disconnect()

            })

            //observe
            ob.observe(ele)

        }
        catch (err) {
            pm.reject(err)
        }

        return pm
    }

    //coreEv
    let coreEv = () => {

        //ev
        let ev = evem()

        //watching
        let watching = false

        //ob
        let ob = new IntersectionObserver((entries) => {
            let b = entries[0].isIntersecting
            // console.log(ele, 'visible', b)
            ev.emit('visible', b)
        })

        //observe
        let observe = (ele) => {
            let b = false

            //check
            if (!isEle(ele)) {
                return b
            }

            //observe
            try {
                ob.observe(ele)
                b = true
            }
            catch (err) {
            // console.log('observe catch', err)
            }

            return b
        }

        //dispose
        let dispose = () => {
            let b = false
            try {
                ob.disconnect()
                b = true
            }
            catch (err) {
            // console.log('disconnect catch', err)
            }
            return b
        }

        //create
        let create = () => {
            let t = setInterval(() => {
                watching = observe(ele)
                if (watching) {
                    clearInterval(t)
                }
            }, 50)
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


export default domIsVisible

