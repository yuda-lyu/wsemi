import UAParser from 'ua-parser-js'
import getdtvstr from './getdtvstr.mjs'


/**
 * 前端取得使用者瀏覽器資訊
 *
 * @export
 * @returns {Object} 回傳使用者瀏覽器資訊物件
 */
export default function getUserAgent() {

    let parser = new UAParser()
    let oua = parser.getResult()
    return {
        browsername: oua.browser.name,
        browserversion: oua.browser.version,
        engineinfor: oua.engine.name + oua.engine.version,
        platform: oua.os.name + oua.os.version,
        devicetype: getdtvstr(oua.device, 'type'),
        cpuarchitecture: oua.cpu.architecture
    }
}
