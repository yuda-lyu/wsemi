import { dirname } from 'path'
import { fileURLToPath } from 'url'
//import { platform } from 'os'


/**
 * 取得Nodejs環境下的CommonJS環境變數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getCJSVars.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳CommonJS環境變數物件
 * @example
 * getCJSVars()
 * // => { __filename: '/path/to/file',  __dirname: '/folder' }
 */
function getCJSVars() {

    //__filename, __dirname
    let __filename = ''
    let __dirname = ''
    try {
        gotoError //直接出錯
    }
    catch (e) {

        //initiator
        let initiator = e.stack.split('\n').slice(2, 3)[0] //由錯誤訊息提取出錯位置
        initiator = decodeURIComponent(initiator) //中文是用utf8 encode表達, 得decode

        //path
        let path = /(?<path>[^\(\s]+):[0-9]+:[0-9]+/.exec(initiator).groups.path //取得錯誤位置當中的檔案路徑
        path = fileURLToPath(path) //會使用file開頭路徑, 得去除

        //save
        __filename = path
        __dirname = dirname(path)

    }

    //r
    let r = {
        __filename,
        __dirname
    }

    return r
}


export default getCJSVars
