import map from 'lodash/map'
import file2ab from './file2ab.mjs'


/**
 * 前端將Input元素所給予的檔案物件陣列，回傳各檔案之ArrayBuffer資料陣列
 *
 * @export
 * @param {Array} files 輸入檔案物件陣列
 * @returns {Promise} 回傳Promise，resolve為各檔案的ArrayBuffer資料陣列
 */
export default function files2abs(files) {

    //dfs
    let dfs = map(files, function(file) {
        return file2ab(file)
    })

    return Promise.all(dfs)
}
