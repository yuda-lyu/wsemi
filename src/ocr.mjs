import each from 'lodash/each'
import get from 'lodash/get'
import iseobj from './iseobj.mjs'
import isearr from './isearr.mjs'


/**
 * 基於tesseract.js的文字辨識(OCR)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ocr.test.js Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件
 * @param {Array} keys 輸入要提取欄位集合的字串陣列
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''
 * @returns {Object} 回傳處理後物件
 * @example

 */
function ocr(dt, keys, def = '') {

    // //check
    // if (!iseobj(dt)) {
    //     return {}
    // }
    // if (!isearr(keys)) {
    //     return {}
    // }

    // let r = {}
    // each(keys, function(key) {
    //     r[key] = get(dt, key, def)
    // })

    // return r
}


export default ocr
