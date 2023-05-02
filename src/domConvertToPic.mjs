//import htmlToImage from 'htmlToImage' //htmlToImage.js沒有umd版, 故引用後會有未檢查window的殼層程式碼出現, 導致無法於nodejs環境下使用wsemi
//import canvg from 'canvg' //因htmlToImage不支援IE11與Safari，故也不引用canvg來支援IE11
import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import isBoolean from 'lodash/isBoolean'
import isEle from './isEle.mjs'
import domRemove from './domRemove.mjs'
import domPrepend from './domPrepend.mjs'
import getGlobal from './getGlobal.mjs'


function getHtmlToImage() {
    let g = getGlobal()
    let x = g.htmlToImage
    return x
}


/**
 * 前端DOM元素轉圖片
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domConvertToPic.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否輸出為base64圖片，預設true
 * @param {String} [opt.picType='image/png'] 輸入輸出為base64圖片時的圖片格式，可選'image/jpeg'與'image/png'，使用'image/jpeg'時若無背景預設為黑色，預設'image/png'
 * @returns {Promise} 回傳Promise，resolve為成功時的產出圖片，reject為失敗訊息
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
    let scale = get(opt, 'scale', 1)
    if (!isNumber(scale)) {
        return Promise.reject('opt.scale is not a number')
    }
    if (scale < 1) {
        return Promise.reject('opt.scale can not less then 1')
    }

    //picType
    let picType = get(opt, 'picType', 'image/png')
    if (picType !== 'image/jpeg' && picType !== 'image/png') {
        return Promise.reject('opt.picType is not one of image/jpeg or image/png')
    }

    //toBase64
    let toBase64 = get(opt, 'toBase64', true)
    if (!isBoolean(toBase64)) {
        return Promise.reject('opt.toBase64 is not a boolean')
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

    //getHtmlToImage
    let hi = getHtmlToImage()

    //pic
    let pic
    let optCv = {
        pixelRatio: scale, //anti-aliasing
        quality: 0.95, //for jpg
    }
    if (toBase64) {
        if (picType === 'image/jpeg') {
            pic = await hi.toJpeg(eleIn, optCv)
        }
        else if (picType === 'image/png') {
            pic = await hi.toPng(eleIn, optCv)
        }
    }
    else { //toCanvas
        pic = await hi.toCanvas(eleIn, optCv)
    }

    //remove
    //div.remove() //IE11不支援element.remove()
    domRemove(eleOut)

    return pic
}


export default domConvertToPic
