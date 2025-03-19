import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import html2pic from './html2pic.mjs'


/**
 * 前端DOM元素轉圖片，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2picDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否輸出為base64圖片，預設true
 * @param {String} [opt.picType='image/jpeg'] 輸入輸出為base64圖片時的圖片格式，可選'image/jpeg'與'image/png'，預設'image/jpeg'
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳產出圖片，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * html2picDyn(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => iVBORw0KGgoAAAANSU...
 *     })
 *
 */
async function html2picDyn(ele, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [ //若有更新版本須全專案取代
            'https://cdn.jsdelivr.net/npm/canvg@4.0.0/lib/umd.js',
            'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //html2pic
    let r = html2pic(ele, opt)

    return r
}


export default html2picDyn
