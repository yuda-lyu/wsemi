import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import domDrag from './domDrag.mjs'


/**
 * 前端DOM元素拖曳功能
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragDyn.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIndex='dragindex'] 輸入標記元素順序指標字串，預設'dragindex'
 * @param {String} [opt.selectors='[dragtag]'] 輸入查詢元素用字串，主要是給draggable.js用來標記哪些元素可被拖曳之用，預設'[dragtag]'
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳為分數或是否，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
async function domDragDyn(ele, opt = {}, pathItems) {

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdnjs.cloudflare.com/ajax/libs/draggable/1.0.0-beta.9/draggable.min.js',
        ]
    }

    //importResources
    let res = await importResources(pathItems)
    // console.log('res', res)

    //domDrag
    let r = await domDrag(ele, opt)
    // console.log('r', r)

    return {
        res,
        state: r,
    }
}


export default domDragDyn
