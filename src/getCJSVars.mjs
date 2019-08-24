import url from 'url'
import path from 'path'


/**
 * 取得Nodejs環境下的CommonJS環境變數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getCJSVars.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳CommonJS環境變數物件
 * @example
 * getCJSVars()
 * // => { __filename: '/path/file', __dirname: '/folder' }
 */
function getCJSVars() {

    //__filename
    const __filename = url.fileURLToPath(import.meta.url)

    //__dirname
    const __dirname = path.dirname(__filename)

    //r
    let r = { __filename, __dirname }

    return r
}


export default getCJSVars
