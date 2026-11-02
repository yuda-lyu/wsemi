import { snapdom } from '@zumer/snapdom'
import get from 'lodash-es/get.js'
import isEle from './isEle.mjs'
import isbol from './isbol.mjs'
import domRemove from './domRemove.mjs'
import domPrepend from './domPrepend.mjs'
import optVal from './_optVal.mjs'


//scale: opt類參數, 有效數字(isenum, 不限範圍; 小於1者另由函數reject), 非預期(含Infinity、'0x10'、包裝物件、非數字等)視為未給、改用預設1, 不報錯
let RULE_SCALE = { fn: 'domConvertToPic', name: 'opt.scale', kind: 'enum' }


/**
 * 前端針對DOM元素轉圖片
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domConvertToPic.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1(小於1時reject)，須為有效數字(可為數字字串)，非預期之輸入(Infinity、'0x10'、包裝物件、非數字等)視為未給而改用預設，不報錯，預設1
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.scale為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @param {Boolean} [opt.toBase64=true] 輸入是否回傳圖片之data URL字串布林值，給true回傳字串(png與jpeg為base64編碼，svg為utf-8之URL編碼)，給false回傳img元素(HTMLImageElement)，預設true
 * @param {String} [opt.picType='image/png'] 輸入輸出圖片格式字串，可選'image/png'、'image/jpeg'(亦可給'image/jpg')與'svg'，png與svg保留透明背景，jpeg之透明處填白色，給其他值則使用'image/png'，預設'image/png'
 * @returns {Promise} 回傳Promise，resolve回傳產出圖片，toBase64為true時為data URL字串，否則為img元素，reject為失敗訊息字串(含取不到body元素之'can not find body element'，此時不截圖、不留DOM殘留)
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domConvertToPic(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => data:image/png;base64,iVBORw0KGgoAAAANSU...
 *     })
 *
 */
async function domConvertToPic(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele')
    }

    //scale, 有效則取Number(v), 非預期(含Infinity、'0x10'、包裝物件)改用預設1; 小於1仍reject
    let scale = optVal(get(opt, 'scale', null), 1, RULE_SCALE, opt)
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

    //body, 取不到body時reject(值為字串, 同上述各檢測), 須先於任何DOM作業
    let body = document.querySelector('body')
    if (!isEle(body)) {
        return Promise.reject('can not find body element')
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
    domPrepend(body, eleOut)

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
