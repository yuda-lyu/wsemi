//import html2canvas from 'html2canvas' //html2canvas.js沒有umd版, 故引用後會有未檢查window的殼層程式碼出現, 導致無法於nodejs環境下使用wsemi
//import canvg from 'canvg' //因umd不引用html2canvas, 故也不引用canvg
import get from 'lodash/get'
import each from 'lodash/each'
import isNumber from 'lodash/isNumber'
import isBoolean from 'lodash/isBoolean'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import cdbl from './cdbl.mjs'
import domRemove from './domRemove.mjs'
import domPrepend from './domPrepend.mjs'
import getGlobal from './getGlobal.mjs'
import isIE from './isIE.mjs'


function getHtml2canvas() {
    let g = getGlobal()
    let x = g.html2canvas
    return x
}


function getCanvg() {
    let g = getGlobal()
    let x = g.canvg.Canvg
    return x
}


function svg2png(ele, scale) {

    //cvg
    let cvg = getCanvg()

    //找所屬svg進行處理
    let svgs = ele.querySelectorAll('svg')
    each(svgs, (svg) => {
        // console.log('svg', svg)

        //w, h
        let w = cdbl(svg.getAttribute('width'))
        let h = cdbl(svg.getAttribute('height'))

        //check
        if (w <= 0) {
            console.log('svg width <=0')
            return true
        }
        if (h <= 0) {
            console.log('svg height <=0')
            return true
        }

        //create canvas
        let cvs = document.createElement('canvas')
        cvs.width = w * scale
        cvs.height = h * scale
        let ctt = cvs.getContext('2d')

        //build from svg
        let convertedSvgToPng = cvg.fromString(
            ctt,
            svg.parentNode.innerHTML,
            {
                ignoreDimensions: true,
                scaleWidth: cvs.width,
                scaleHeight: cvs.height,
            }
        )
        convertedSvgToPng.start()

        //convert
        let img = new Image()
        img.src = cvs.toDataURL('image/png')
        img.style.width = `${w}px`
        img.style.height = `${h}px`

        //svg父層加入img
        svg.parentNode.appendChild(img)

        //移除svg
        svg.parentNode.removeChild(svg)

    })
}


/**
 * 前端DOM元素轉圖片
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2pic.test.mjs Github}
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
 * let ele = document.querySelector('#id')
 * html2pic(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => iVBORw0KGgoAAAANSU...
 *     })
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

    //cloneNode
    let elePic = ele.cloneNode(true)

    //於IE11時html2canvas無法轉svg, 得先用canvg轉
    if (isIE()) {
        svg2png(elePic, scale) //IE11
    }

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
    eleOut.style.position = 'relative'
    eleOut.appendChild(eleIn)

    //domPrepend, 塞入至body內最前
    let body = document.querySelector('body')
    domPrepend(body, eleOut)

    //getHtml2canvas
    let hc = getHtml2canvas()

    //canvas
    let canvas = await hc(eleIn, {
        logging: false, //不要console.log
        scale, //anti-aliasing
        x: 0, //要配合domPrependChild並設定x,y為0避免html2canvas截圖平移問題
        y: 0, //要配合domPrependChild並設定x,y為0避免html2canvas截圖平移問題
    })

    //pic
    let pic = canvas
    if (toBase64) {
        pic = canvas.toDataURL(picType, 1.0)
    }

    //remove
    //div.remove() //IE11不支援element.remove()
    domRemove(eleOut)

    return pic
}


export default html2pic
