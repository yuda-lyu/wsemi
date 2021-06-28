import get from 'lodash/get'
import ispint from './ispint.mjs'
import isestr from './isestr.mjs'
import domRemove from './domRemove.mjs'


/**
 * 前端DOM元素點擊Ripple效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRipple.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom
 * @param {Object} event 輸入dom點擊事件
 * @param {Integer} [opt.timeDuration=650] 輸入Ripple效果持續時間整數，單位ms，預設650
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
        timeDuration = 650
    }

    //color
    let color = get(opt, 'color', null)
    if (!isestr(color)) {
        color = 'rgba(255, 255, 255, 0.4)'
    }

    //更改元素style
    ele.style.position = 'relative' //得要讓ripple的absolute能生效
    ele.style.overflow = 'hidden' //讓ripple的效果不會溢出dom範圍

    //diameter, radius
    let diameter = Math.max(ele.clientWidth, ele.clientHeight)
    let radius = diameter / 2

    //eleRipple
    let eleRipple = document.createElement('span')
    eleRipple.style.width = `${diameter}px`
    eleRipple.style.height = `${diameter}px`
    eleRipple.style.left = `${event.clientX - ele.offsetLeft - radius}px`
    eleRipple.style.top = `${event.clientY - ele.offsetTop - radius}px`
    eleRipple.style.transition = `all ${timeDuration / 1000}s linear`
    eleRipple.style.position = 'absolute'
    eleRipple.style.borderRadius = '50%'
    eleRipple.style.transform = 'scale(0)'
    eleRipple.style.background = color
    ele.appendChild(eleRipple)

    //add effect
    setTimeout(() => {
        eleRipple.style.transform = 'scale(2.5)'
        eleRipple.style.opacity = 0
    }, 1)

    //remove
    setTimeout(() => {
        domRemove(eleRipple)
    }, timeDuration)

}


export default domRipple
