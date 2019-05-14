import map from 'lodash/map'
import file2u8arr from './file2u8arr.mjs'


/**
 * 前端將Input元素所給予的檔案物件陣列，回傳各檔案之Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2u8arrs.test.js Github}
 * @memberOf wsemi
 * @param {Array} files 輸入檔案物件陣列
 * @returns {Promise} 回傳Promise，resolve為各檔案的Uint8Array資料陣列
 * @example
 *
 */
function files2u8arrs(files) {

    //dfs
    let dfs = map(files, function(file) {
        return file2u8arr(file)
    })

    return Promise.all(dfs)
}


export default files2u8arrs
