import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import html2pic from './html2pic.mjs'


/**
 * 前端取得使用者瀏覽器資訊，於browser中不輸入即可自動偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/html2picDyn.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，需大於等於1，預設1
 * @param {Boolean} [opt.toBase64=true] 輸入是否輸出為base64圖片，預設true
 * @param {String} [opt.picType='image/jpeg'] 輸入輸出為base64圖片時的圖片格式，預設'image/jpeg'
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳使用者瀏覽器資訊物件，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
async function html2picDyn(ele, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //getUserAgent
    let r = html2pic(ele, opt)

    return r
}


export default html2picDyn
