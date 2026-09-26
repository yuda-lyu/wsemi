import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import genPm from './genPm.mjs'
import detector from './_detector.mjs'


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


//getVisible, 同一次回呼可能含同一元素之多筆狀態變化, 取時間最新者(time相同時取較後者)為當下狀態; 無entries時回傳null
function getVisible(entries) {
    let r = null
    let t = -Infinity
    for (let v of (entries || [])) {
        let tv = Number(v && v.time)
        if (!Number.isFinite(tv)) {
            tv = t //無time者視同與前一筆同時, 依先後取較後者
        }
        if (tv >= t) {
            t = tv
            r = v
        }
    }
    return r ? !!r.isIntersecting : null
}


/**
 * 前端檢測DOM元素是否為顯示(使用者可見)狀態
 *
 * 以IntersectionObserver判定元素是否與視窗可視區相交；同一次回報含多筆狀態時以時間最新者為準
 *
 * 元素無效或瀏覽器不支援IntersectionObserver時：promise模式回傳被拒絕之Promise(原因為'invalid element'或'invalid IntersectionObserver')；event模式仍回傳可使用create、on、dispose之物件但永不觸發，其error為原因，可偵測時error為null
 *
 * event模式之create於microtask啟動觀察(晚於本次同步流程，故create後才插入之元素、create後才掛之監聽皆可)，重複呼叫無效，dispose後呼叫亦無效；觀察器建立失敗時不拋錯，error為所拋之值；visible之監聽器拋錯時有error監聽者則發出error事件，否則console.error，不中斷偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsVisible.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='promise'] 輸入模式字串，可使用'promise'與'event'，給予'promise'代表一次性偵測並回傳Promise，給予'event'代表持續性偵測並回傳EventEmitter，預設'promise'
 * @returns {Promise|Object} 回傳物件，給予'promise'時回傳Promise，resolve回傳顯示與否布林值，reject回傳錯誤訊息，給予'event'時回傳物件，可使用create、on、dispose函數與error屬性，create代表開啟偵測，on代表監聽'visible'事件可得元素顯隱變化，dispose代表中止偵測並回傳true
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

    //mode
    let mode = detector.getMode(opt)

    //check ele
    if (!isEle(ele)) {
        return detector.detectorFail(mode, 'invalid element')
    }

    //check IntersectionObserver
    if (ckIO()) {
        return detector.detectorFail(mode, 'invalid IntersectionObserver')
    }

    //promise
    if (mode === 'promise') {

        //pm
        let pm = genPm()

        try {

            //ob
            let ob = new IntersectionObserver((entries) => {

                //b
                let b = getVisible(entries)
                if (b === null) {
                    return
                }

                //resolve
                pm.resolve(b)

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

    //event, 啟動時觀察: 元素已於呼叫時確認, observe對未插入之元素亦不拋錯, 插入後由IntersectionObserver自行回報
    return detector.detectorEvent((emit, addCleanup) => {
        let ob = new IntersectionObserver((entries) => {
            let b = getVisible(entries)
            if (b !== null) {
                emit('visible', b)
            }
        })
        addCleanup(() => {
            ob.disconnect()
        })
        ob.observe(ele)
    }, { tag: 'domIsVisible' })
}


export default domIsVisible
