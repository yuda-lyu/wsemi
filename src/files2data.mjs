import map from 'lodash-es/map.js'
import isarr from './isarr.mjs'
import genPm from './genPm.mjs'
import blobs2b64s from './blobs2b64s.mjs'
import ltdtmerge from './ltdtmerge.mjs'


/**
 * 前端input檔案物件陣列轉資料物件陣列，各檔案將轉為Base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2data.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} files 輸入File陣列
 * @returns {Promise} 回傳Promise，resolve回傳File的資料物件陣列，各檔案將轉為Base64字串
 * @example
 * need test in browser
 *
 */
function files2data(files) {
    //若輸入Blob陣列, 不會有name, 故只能輸入File陣列

    //check, 非陣列時lodash之map會得[], 最終靜默resolve [], 使無效輸入被當成功; 訊息須指明本函數之參數名而非下游之bbs
    if (!isarr(files)) {
        return Promise.reject('invalid files')
    }

    //pm
    let pm = genPm()

    //fs
    let fs = map(files, function(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type
        }
    })

    //blobs2b64s
    blobs2b64s(files)
        .then(function(b64s) {

            //bs
            let bs = map(b64s, function(v) {
                return { b64: v }
            })

            //ltdtmerge
            let rs = ltdtmerge(fs, bs)

            //resolve
            pm.resolve(rs)

        })
        .catch(function(err) {
            //原碼無此catch, blobs2b64s一旦reject則pm永不settle, 呼叫端await會永久掛住, 且該rejection無人接
            pm.reject(err)
        })

    return pm
}


export default files2data
