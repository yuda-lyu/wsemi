import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import getUserAgent from './getUserAgent.mjs'


/**
 * 前端取得使用者瀏覽器資訊，於browser中不輸入即可自動偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getUserAgentDyn.test.js Github}
 * @memberOf wsemi
 * @param {String} [v=null] 輸入user agent字串，預設null
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳使用者瀏覽器資訊物件，reject回傳錯誤訊息
 * @example
 * let ua = 'Mozilla/5.0 (compatible; Konqueror/4.1; OpenBSD) KHTML/4.1.4 (like Gecko)'
 * getUserAgentDyn(ua)
 *     .then(function(r) {
 *         console.log(r)
 *         // => {
 *             browsername: 'Konqueror',
 *             browserversion: '4.1',
 *             cpuarchitecture: '',
 *             devicetype: '',
 *             engineinfor: 'KHTML4.1.4',
 *             platform: 'OpenBSDundefined'
 *         }
 *     })
 */
function getUserAgentDyn(v = null, pathItems) {

    //pm
    let pm = genPm()

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/ua-parser-js@0.7.21/dist/ua-parser.min.js',
        ]
    }

    //importResources
    importResources(pathItems)
        .then((res) => {
            //console.log('getUserAgentDyn res', res)

            //getUserAgent
            let r = getUserAgent(v)

            //resolve
            pm.resolve(r)

        })
        .catch((err) => {
            pm.reject(err)
        })

    return pm
}


export default getUserAgentDyn
