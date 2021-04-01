import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import genPm from './genPm.mjs'


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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsVisible.test.js Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domIsVisible(ele)
 *     .then(function(visible){
 *         console.log(visible)
 *         // => true or false
 *     })
 *     .catch(function(err){
 *         console.log(err)
 *     })
 *
 */
function domIsVisible(ele) {

    //check ele
    if (!isEle(ele)) {
        return Promise.reject('invalid element')
    }

    //check IntersectionObserver
    if (ckIO()) {
        return Promise.reject('invalid IntersectionObserver')
    }

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


export default domIsVisible

