import domShowImages from './domShowImages.mjs'


/**
 * 前端彈窗顯示指定元素內圖片或圖片陣列
 *
 * 本函數為相容舊版之保留函數：舊版採動態加載CDN之viewerjs(js與css)，現已將viewerjs直接打包進wsemi(含css注入)，無需再動態加載
 * 內部直接委派domShowImages，pathItems參數保留簽名相容但已不使用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowImagesDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleImg 輸入圖片元素
 * @param {HTMLElement} [eleGroup=null] 輸入元素內含有多圖片元素，預設null
 * @param {Object} [opt={}] 輸入viewerjs設定物件，預設使用optOne或optMuti，若img僅一個則使用optOne，反之使用optMuti
 * @param {String|Object|Array} [pathItems=undefined] 輸入資源字串、字串陣列、物件、物件陣列，已不使用，僅保留簽名相容
 * @returns {Promise} 回傳Promise，resolve回傳close訊息，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * <img src="001.jpg" onclick="domShowImagesDyn(this)">
 * <img src="002.jpg" onclick="domShowImagesDyn(this,this.parentElement)">
 *
 */
async function domShowImagesDyn(eleImg, eleGroup = null, opt = {}, pathItems) { // eslint-disable-line no-unused-vars

    //domShowImages
    let r = await domShowImages(eleImg, eleGroup, opt)

    return r
}


export default domShowImagesDyn
