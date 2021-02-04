import UAParser from 'ua-parser-js'
import get from 'lodash/get'
import isstr from './isstr.mjs'
import getGlobal from './getGlobal.mjs'


function getUAParser() {
    let g = getGlobal()
    let x = UAParser || g.UAParser
    return x
}


/**
 * 取得使用者瀏覽器資訊，後端nodejs環境使用需提供user agent字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getUserAgent.test.js Github}
 * @memberOf wsemi
 * @param {String} [v=null] 輸入user agent字串，預設null
 * @returns {Object} 回傳使用者瀏覽器資訊物件
 * @example
 * let ua = 'Mozilla/5.0 (compatible; Konqueror/4.1; OpenBSD) KHTML/4.1.4 (like Gecko)'
 * console.log(getUserAgent(ua))
 * // => {
 *     browsername: 'Konqueror',
 *     browserversion: '4.1',
 *     cpuarchitecture: '',
 *     devicetype: '',
 *     engineinfor: 'KHTML4.1.4',
 *     platform: 'OpenBSDundefined'
 * }
 */
function getUserAgent(v = null) {

    //parser
    let parser
    let U = getUAParser()
    if (isstr(v)) {
        parser = new U(v)
    }
    else {
        parser = new U()
    }

    let oua = parser.getResult()
    return {
        browsername: oua.browser.name,
        browserversion: oua.browser.version,
        engineinfor: oua.engine.name + oua.engine.version,
        platform: oua.os.name + oua.os.version,
        devicetype: get(oua.device, 'type', ''),
        cpuarchitecture: get(oua.cpu, 'architecture', '')
    }
}


export default getUserAgent

