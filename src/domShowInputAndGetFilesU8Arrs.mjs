import size from 'lodash/size'
import each from 'lodash/each'
import genPm from './genPm.mjs'
import domShowInputAndGetFiles from './domShowInputAndGetFiles.mjs'
import files2abs from './files2abs.mjs'
import ab2u8arr from './ab2u8arr.mjs'


/**
 * 前端開啟上傳視窗並讀取各檔案Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFilesU8Arrs.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列，預設為全部'*'
 * @param {Boolean} [multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Number} [sizelimit=500] 輸入檔案大小上線，單位mb，預設為500mb
 * @returns {Promise} 回傳Promise，resolve為各檔案的Uint8Array資料陣列，reject為錯誤訊息
 */
function domShowInputAndGetFilesU8Arrs(kind = '*', multiple = false, sizelimit = 500) {

    //df
    let df = genPm()

    let resfiles = []
    domShowInputAndGetFiles(kind, multiple, sizelimit)
        .then(function(rs) {

            //df
            let dft = genPm()

            //err
            let err = rs.err
            if (size(err) > 0) {
                dft.reject(err)
            }
            else {
                dft.resolve(rs)
            }

            return dft
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

            return files2abs(files)
        })
        .then(function(abs) {

            //ArrayBuffer to Uint8Array and save
            each(abs, function(ab, k) {
                let u8a = ab2u8arr(ab)
                resfiles[k]['u8a'] = u8a
            })

            df.resolve(resfiles)
        })
        .catch(function(msg) {
            df.reject(msg)
        })

    return df
}


export default domShowInputAndGetFilesU8Arrs
