import each from 'lodash/each'
import genPm from './genPm.mjs'
import files2u8arrs from './files2u8arrs.mjs'


/**
 * 前端input檔案物件轉Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2data.test.js Github}
 * @memberOf wsemi
 * @param {Array} files 輸入file物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳檔案的Uint8Array資料陣列
 * @example
 * need test in browser
 */
function files2data(files) {

    //pm
    let pm = genPm()

    //rs
    let rs = []

    //save
    each(files, function(file) {
        rs.push({
            name: file.name,
            size: file.size,
            type: file.type
        })
    })

    //files2u8arrs
    files2u8arrs(files)
        .then(function(u8as) {
            //save Uint8Array
            each(u8as, function(u8a, k) {
                rs[k]['u8a'] = u8a
            })
            pm.resolve(rs)
        })
        .catch(function(msg) {
            pm.reject(msg)
        })

    return pm
}


export default files2data
