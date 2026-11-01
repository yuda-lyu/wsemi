import { UAParser } from 'ua-parser-js'
import get from 'lodash-es/get.js'
import isstr from './isstr.mjs'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'


//getUAParser, 取得ua-parser-js之UAParser建構子, 於呼叫時才取(不於載入時固定), 使UMD之script載入順序(先wsemi後ua-parser-js、先ua-parser-js後wsemi)皆可用(R-UMD-EXTERNAL-01)
function getUAParser() {
    //ua-parser-js於UMD為external, 打包後對應全域UAParser且於wsemi載入當下即取值(見toolg/gDistRollup.mjs), 編譯後之import進來者為其屬性存取(UAParser.UAParser),
    //  若ua-parser-js於wsemi之後才載入, 該external為undefined, 屬性存取即拋'Cannot read properties of undefined', 故以try包住
    //  瀏覽器版ua-parser-js掛於window.UAParser(見ua-parser-js/dist/ua-parser.min.js)且該建構子本身無UAParser屬性, 故import進來者非函數時改找全域
    let x = null
    try {
        x = UAParser
    }
    catch (err) {
        x = null
    }
    if (isfun(x)) {
        return x
    }

    //getGlobal於無self、window、global之環境回傳null, 以get讀取
    let g = getGlobal()
    let _g = get(g, 'UAParser', null)
    if (isfun(_g)) {
        return _g
    }

    throw new Error('invalid UAParser, g.UAParser, use script for import')
}


/**
 * 取得使用者瀏覽器資訊，後端nodejs環境使用需提供user agent字串
 * UMD版之ua-parser-js可先於或晚於wsemi載入(呼叫時才找全域UAParser)，皆未載入時拋Error
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getUserAgent.test.mjs Github}
 * @memberOf wsemi
 * @param {String} [v=null] 輸入user agent字串，預設null
 * @returns {Object} 回傳使用者瀏覽器資訊物件
 * @example
 *
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
 *
 */
function getUserAgent(v = null) {

    //parser
    let parser
    let Upr = getUAParser()
    if (isstr(v)) {
        parser = new Upr(v)
    }
    else {
        parser = new Upr()
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

