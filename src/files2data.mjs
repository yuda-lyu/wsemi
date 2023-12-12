import map from 'lodash-es/map'
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

    return pm
}


export default files2data
