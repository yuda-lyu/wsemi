import get from 'lodash/get'
import ispint from './ispint.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import domRemove from './domRemove.mjs'


/**
 * 前端DOM元素點擊Ripple效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRipple.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom
 * @param {Object} event 輸入dom點擊事件
 * @param {Integer} [opt.timeDuration=300] 輸入Ripple效果持續時間整數，單位ms，預設300
 * @param {String} [opt.color='rgba(255, 255, 255, 0.4)'] 輸入Ripple顏色字串，預設'rgba(255, 255, 255, 0.4)'
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * ele.addEventListener('click', (e)=>{
 *     domRipple(e.currentTarget,e)
 * })
 *
 */
function domRipple(ele, event, opt = {}) {

    //timeDuration
    let timeDuration = get(opt, 'timeDuration', null)
    if (!ispint(timeDuration)) {
        timeDuration = 300
    }

    //color
    let color = get(opt, 'color', null)
    if (!isestr(color)) {
        color = 'rgba(255, 255, 255, 0.4)'
    }

    //check
    if (!isEle(ele)) {
        return
    }

    //更改元素style
    ele.style.position = 'relative' //得要讓ripple的absolute能生效
    ele.style.overflow = 'hidden' //讓ripple的效果不會溢出dom範圍

    //diameter
    let diameter = Math.max(ele.clientWidth, ele.clientHeight)

    //eleRipple
    let eleRipple = document.createElement('span')
    eleRipple.style.width = `${diameter}px`
    eleRipple.style.height = `${diameter}px`
    eleRipple.style.transition = `all ${timeDuration / 1000}s linear`
    eleRipple.style.position = 'absolute'
    eleRipple.style.zIndex = 1
    eleRipple.style.left = `${event.offsetX}px`
    eleRipple.style.top = `${event.offsetY}px`
    eleRipple.style.borderRadius = '50%'
    eleRipple.style.transformOrigin = 'center'
    eleRipple.style.transform = 'scale(0.5)'
    eleRipple.style.background = color
    ele.appendChild(eleRipple)

    //add effect
    setTimeout(() => {
        eleRipple.style.transform = 'scale(3)'
        eleRipple.style.opacity = 0
    }, 1)

    //remove
    setTimeout(() => {
        domRemove(eleRipple)
    }, timeDuration)

}


export default domRipple
