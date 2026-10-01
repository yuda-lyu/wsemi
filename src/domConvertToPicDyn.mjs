import domConvertToPic from './domConvertToPic.mjs'


/**
 * 前端DOM元素轉圖片
 *
 * 本函數為相容舊版之保留函數：舊版採動態加載CDN之@zumer/snapdom，現已將@zumer/snapdom直接打包進wsemi，無需再動態加載
 * 內部直接委派domConvertToPic，pathItems參數保留簽名相容但已不使用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domConvertToPicDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否回傳圖片之data URL字串布林值，給true回傳字串(png與jpeg為base64編碼，svg為utf-8之URL編碼)，給false回傳img元素(HTMLImageElement)，預設true
 * @param {String} [opt.picType='image/png'] 輸入輸出圖片格式字串，可選'image/png'、'image/jpeg'(亦可給'image/jpg')與'svg'，png與svg保留透明背景，jpeg之透明處填白色，給其他值則使用'image/png'，預設'image/png'
 * @param {String|Object|Array} [pathItems=undefined] 輸入資源字串、字串陣列、物件、物件陣列，已不使用，僅保留簽名相容
 * @returns {Promise} 回傳Promise，resolve回傳產出圖片，toBase64為true時為data URL字串，否則為img元素，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * domConvertToPicDyn(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => data:image/png;base64,iVBORw0KGgoAAAANSU...
 *     })
 *
 */
async function domConvertToPicDyn(ele, opt = {}, pathItems) { // eslint-disable-line no-unused-vars

    //domConvertToPic
    let r = await domConvertToPic(ele, opt)

    return r
}


export default domConvertToPicDyn
