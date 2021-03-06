import size from 'lodash/size'
import each from 'lodash/each'
import genPm from './genPm.mjs'
import domShowInputAndGetFiles from './domShowInputAndGetFiles.mjs'
import blobs2u8arrs from './blobs2u8arrs.mjs'


/**
 * 前端開啟上傳視窗並讀取各檔案Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFilesU8Arrs.test.js Github}
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列，預設為全部'*'
 * @param {Boolean} [multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Number} [sizelimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @returns {Promise} 回傳Promise，resolve為各檔案的Uint8Array資料陣列，reject為錯誤訊息
 * @example
 * need test in browser
 *
 */
function domShowInputAndGetFilesU8Arrs(kind = '*', multiple = false, sizelimit = 1000) {

    //pm
    let pm = genPm()

    let resfiles = []
    domShowInputAndGetFiles(kind, multiple, sizelimit)
        .then(function(rs) {

            //pmt
            let pmt = genPm()

            //err
            let err = rs.err
            if (size(err) > 0) {
                pmt.reject(err)
            }
            else {
                pmt.resolve(rs)
            }

            return pmt
        })
        .then(function(rs) {

            //files
            let files = rs.files

            //saveas
            each(files, function(file) {
                resfiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                })
            })

            return blobs2u8arrs(files)
        })
        .then(function(u8as) {

            //save Uint8Array
            each(u8as, function(u8a, k) {
                resfiles[k]['u8a'] = u8a
            })

            pm.resolve(resfiles)
        })
        .catch(function(msg) {
            pm.reject(msg)
        })

    return pm
}


export default domShowInputAndGetFilesU8Arrs
