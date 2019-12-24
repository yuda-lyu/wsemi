import UAParser from 'ua-parser-js'
import isstr from './isstr.mjs'
import getdtvstr from './getdtvstr.mjs'


/**
 * 取得使用者瀏覽器資訊，於browser中不輸入即可自動偵測，於nodejs環境則需提供user agent字串
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
    if (isstr(v)) {
        parser = new UAParser(v)
    }
    else {
        parser = new UAParser()
    }

    let oua = parser.getResult()
    return {
        browsername: oua.browser.name,
        browserversion: oua.browser.version,
        engineinfor: oua.engine.name + oua.engine.version,
        platform: oua.os.name + oua.os.version,
        devicetype: getdtvstr(oua.device, 'type'),
        cpuarchitecture: getdtvstr(oua.cpu, 'architecture')
    }
}


export default getUserAgent

