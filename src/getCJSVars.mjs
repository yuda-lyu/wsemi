import { dirname } from 'path'
import { fileURLToPath } from 'url'
import trim from 'lodash/trim'
import split from 'lodash/split'
import size from 'lodash/size'
import dropRight from 'lodash/dropRight'
import join from 'lodash/join'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'


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

        //transfrom, 中文是用utf8 encode表達, 得decode
        initiator = decodeURIComponent(initiator) //

        //clear at
        initiator = trim(initiator)
        if (strleft(initiator, 3) === 'at ') {
            initiator = strdelleft(initiator, 3)
        }

        //clear :x:x
        let s = split(initiator, ':')
        if (size(s) >= 3) {
            s = dropRight(s, 2)
        }
        initiator = join(s, ':')

        //clear file:///
        if (strleft(initiator, 5) === 'file:') {
            initiator = fileURLToPath(initiator)
        }

        //save
        __filename = initiator
        __dirname = dirname(initiator)

    }

    //r
    let r = {
        __filename,
        __dirname
    }

    return r
}


export default getCJSVars
