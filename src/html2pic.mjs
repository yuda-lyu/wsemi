//import html2canvas from 'html2canvas' //html2canvas.js沒有umd版, 故引用後會有未檢查window的殼層程式碼出現, 並再導致無法於nodejs環境下使用wsemi
import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import isBoolean from 'lodash/isBoolean'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import getGlobal from './getGlobal.mjs'


function getHtml2canvas() {
    let g = getGlobal()
    let x = g.html2canvas
    return x
}


/**
 * 前端html轉圖片
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2pic.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否輸出為base64圖片，預設true
 * @param {String} [opt.picType='image/jpeg'] 輸入輸出為base64圖片時的圖片格式，預設'image/jpeg'
 * @returns {Promise} 回傳Promise，resolve為成功時的產出圖片，reject為失敗訊息
 * @example
 * need test in browser
 *
 * let b64 = await html2picDyn(ele, { scale: 3 })
 * // => iVBORw0KGgoAAAANSU...
 *
 */
async function html2pic(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele')
    }

    //scale
    let scale = get(opt, 'scale', 1)
    if (!isNumber(scale)) {
        return Promise.reject('opt.scale is not number')
    }
    if (scale < 1) {
        return Promise.reject('opt.scale can not less then 1')
    }

    //picType
    let picType = get(opt, 'picType', 'image/jpeg')
    if (!isestr(picType)) {
        return Promise.reject('opt.picType is not effective string')
    }

    //toBase64
    let toBase64 = get(opt, 'toBase64', true)
    if (!isBoolean(toBase64)) {
        return Promise.reject('opt.toBase64 is not boolean')
    }

    //hc
    let hc = getHtml2canvas()

    //cloneNode
    ele = ele.cloneNode(true)

    //div, 放置ele的區塊, 用絕對定位顯示, 用z-index=-1避免遮蔽原畫面, 原本為預設的長寬限制會自動取消, 故可截圖為完整畫面
    //例如原本為受body寬度而出現橫向捲軸的div, 會因為複製並以position=absolute呈現時, 寬度自然會展開為原始寬度, 即可完整截圖, 高度也是
    let div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.top = 0
    div.style.left = 0
    div.style.zIndex = -1
    div.style.opacity = 0.001
    div.appendChild(ele)

    //塞入至body
    let body = document.querySelector('body')
    body.appendChild(div)

    //canvas
    let canvas = await hc(ele, {
        logging: false, //不要console.log
        scale, //anti-aliasing
    })

    //pic
    let pic = canvas
    if (toBase64) {
        pic = canvas.toDataURL(picType, 1.0)
    }

    //remove
    div.remove()

    return pic
}


export default html2pic
