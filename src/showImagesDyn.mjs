import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import showImages from './showImages.mjs'


/**
 * 前端彈窗顯示指定元素內圖片或圖片陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/showImagesDyn.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleImg 輸入圖片元素
 * @param {HTMLElement} [eleGroup=null] 輸入元素內含有多圖片元素，預設null
 * @param {Object} [opt={}] 輸入viewerjs設定物件，預設使用optOne或optMuti，若img僅一個則使用optOne，反之使用optMuti
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳為分數或是否，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * <img src="001.jpg" onclick="showImagesDyn(this)">
 *
 * <img src="002.jpg" onclick="showImagesDyn(this,this.parentElement)">
 *
 */
async function showImagesDyn(eleImg, eleGroup = null, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/viewerjs@1.6.2/dist/viewer.min.css',
            'https://cdn.jsdelivr.net/npm/viewerjs@1.6.2/dist/viewer.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)
    // console.log('res', res)

    //showImages
    let r = await showImages(eleImg, eleGroup, opt)

    return r
}


export default showImagesDyn
