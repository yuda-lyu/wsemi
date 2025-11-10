import get from 'lodash-es/get.js'
import isEle from './isEle.mjs'
import isnum from './isnum.mjs'
import isbol from './isbol.mjs'
import cdbl from './cdbl.mjs'
import domRemove from './domRemove.mjs'
import domPrepend from './domPrepend.mjs'
import getGlobal from './getGlobal.mjs'


function getSnapdom() {
    let g = getGlobal()
    let x = g.snapdom
    return x
}


/**
 * 前端針對DOM元素轉圖片
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domConvertToPic.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否輸出為base64圖片，預設true
 * @param {String} [opt.picType='image/png'] 輸入輸出為base64圖片時的圖片格式，可選'image/jpeg'與'image/png'，使用'image/jpeg'時若無背景預設為黑色，預設'image/png'
 * @returns {Promise} 回傳Promise，resolve回傳產出圖片，reject為失敗訊息
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domConvertToPic(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => iVBORw0KGgoAAAANSU...
 *     })
 *
 */
async function domConvertToPic(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele')
    }

    //scale
    let scale = get(opt, 'scale', null)
    if (!isnum(scale)) {
        scale = 1
    }
    scale = cdbl(scale)
    if (scale < 1) {
        return Promise.reject('opt.scale can not less then 1')
    }

    //picType
    let picType = get(opt, 'picType', null)
    if (picType !== 'image/jpg' && picType !== 'image/jpeg' && picType !== 'image/png' && picType !== 'svg') {
        picType = 'image/png'
    }

    //toBase64
    let toBase64 = get(opt, 'toBase64', null)
    if (!isbol(toBase64)) {
        toBase64 = true
    }

    //cloneNode
    let elePic = ele.cloneNode(true)

    //注意：放置ele的區塊用絕對定位顯示, 用z-index=-1避免遮蔽原畫面, 原本為預設的長寬限制會自動取消, 故可截圖為完整畫面
    //例如原本為受body寬度而出現橫向捲軸的div, 會因為複製並以position=absolute呈現時, 寬度自然會展開為原始寬度, 即可完整截圖, 高度也是

    //eleIn
    let eleIn = document.createElement('div')
    eleIn.style.position = 'absolute'
    eleIn.style.top = 0
    eleIn.style.left = 0
    // eleIn.style.width = `${ele.offsetWidth}px`
    // eleIn.style.height = `${ele.offsetHeight}px`
    eleIn.style.zIndex = -1
    eleIn.appendChild(elePic)

    //eleOut
    let eleOut = document.createElement('div')
    eleOut.style.opacity = 0
    eleOut.style.position = 'relative'
    eleOut.appendChild(eleIn)

    //domPrepend, 塞入至body內最前
    let body = document.querySelector('body')
    domPrepend(body, eleOut)

    //getSnapdom
    let snapdom = getSnapdom()

    //pic
    let optCv = {
        scale, //anti-aliasing
        quality: 1, //for jpg
        cache: 'disabled', //禁用快取
    }
    let pic
    if (picType === 'image/jpg' || picType === 'image/jpeg') {
        pic = await snapdom.toJpg(eleIn, optCv)
    }
    else if (picType === 'image/png') {
        pic = await snapdom.toPng(eleIn, optCv)
    }
    else if (picType === 'svg') {
        pic = await snapdom.toSvg(eleIn, optCv)
    }
    if (toBase64) {
        pic = get(pic, 'src', '')
    }

    //remove
    //div.remove() //IE11不支援element.remove()
    domRemove(eleOut)

    return pic
}


export default domConvertToPic
