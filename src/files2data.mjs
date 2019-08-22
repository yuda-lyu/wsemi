import map from 'lodash/map'
import genPm from './genPm.mjs'
import files2b64s from './files2b64s.mjs'
import ltdtmerge from './ltdtmerge.mjs'


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

    //fs
    let fs = map(files, function(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type
        }
    })

    //files2b64s
    files2b64s(files)
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
