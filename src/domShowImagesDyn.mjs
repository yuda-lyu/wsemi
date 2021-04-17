import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import domShowImages from './domShowImages.mjs'


/**
 * 前端彈窗顯示指定元素內圖片或圖片陣列，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowImagesDyn.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleImg 輸入圖片元素
 * @param {HTMLElement} [eleGroup=null] 輸入元素內含有多圖片元素，預設null
 * @param {Object} [opt={}] 輸入viewerjs設定物件，預設使用optOne或optMuti，若img僅一個則使用optOne，反之使用optMuti
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳為分數或是否，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * <img src="001.jpg" onclick="domShowImagesDyn(this)">
 *
 * <img src="002.jpg" onclick="domShowImagesDyn(this,this.parentElement)">
 *
 */
async function domShowImagesDyn(eleImg, eleGroup = null, opt = {}, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/viewerjs@1.9.0/dist/viewer.min.css',
            'https://cdn.jsdelivr.net/npm/viewerjs@1.9.0/dist/viewer.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)
    // console.log('res', res)

    return domShowImages(eleImg, eleGroup, opt)
}


export default domShowImagesDyn
