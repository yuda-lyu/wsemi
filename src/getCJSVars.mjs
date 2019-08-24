import { dirname } from 'path'
import { platform } from 'os'


/**
 * 取得Nodejs環境下的CommonJS環境變數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getCJSVars.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳CommonJS環境變數物件
 * @example
 * getCJSVars()
 * // => { __dirname: '/folder' }
 */
function getCJSVars() {

    //__dirname
    let __dirname = ''
    try {
        gotoError //直接出錯
    }
    catch (e) {
        const initiator = e.stack.split('\n').slice(2, 3)[0]
        let path = /(?<path>[^\(\s]+):[0-9]+:[0-9]+/.exec(initiator).groups.path
        if (path.indexOf('file') >= 0) {
            path = new URL(path).pathname
        }
        let dir = dirname(path)
        if (dir[0] === '/' && platform() === 'win32') {
            dir = dir.slice(1)
        }
        __dirname = decodeURIComponent(dir)
    }

    //r
    let r = {
        //__filename,
        __dirname
    }

    return r
}


export default getCJSVars
