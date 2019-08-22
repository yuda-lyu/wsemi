import map from 'lodash/map'
import file2u8arr from './file2u8arr.mjs'


/**
 * 前端input檔案物件陣列，逐一轉為各檔案之Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2u8arrs.test.js Github}
 * @memberOf wsemi
 * @param {Array} files 輸入檔案物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳各檔案的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function files2u8arrs(files) {

    //pms
    let pms = map(files, function(file) {
        return file2u8arr(file)
    })

    return Promise.all(pms)
}


export default files2u8arrs
