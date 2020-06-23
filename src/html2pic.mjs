import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import isBoolean from 'lodash/isBoolean'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import html2canvas from 'html2canvas'
import getGlobal from './getGlobal.mjs'


function getHtml2canvas() {
    let g = getGlobal()
    let x = html2canvas || g.html2canvas
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

    //canvas
    let canvas = await hc(ele, {
        logging: false, //不要console.log
        scale: scale, //anti-aliasing
    })

    //pic
    let pic = canvas
    if (toBase64) {
        pic = canvas.toDataURL(picType, 1.0)
    }

    return pic
}


export default html2pic
