import map from 'lodash/map'
import file2b64 from './file2b64.mjs'


/**
 * 前端input檔案物件陣列，逐一轉為各檔案之Base64資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2b64s.test.js Github}
 * @memberOf wsemi
 * @param {Array} files 輸入file物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳各檔案的Base64資料，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function files2b64s(files) {

    //pms
    let pms = map(files, function(file) {
        return file2b64(file)
    })

    return Promise.all(pms)
}


export default files2b64s
