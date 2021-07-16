import pmQueue from './pmQueue.mjs'
import domVirtualCreate from './domVirtualCreate.mjs'


/**
 * 前端產生臨時DOM元素為對象並進行客製化處理，並通過佇列管控，限定一次處理一個。初始化後將回傳封裝後的domVirtualCreate，輸入與輸出皆與其相同，詳見domVirtualCreate
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domVirtualCreateQueue.test.js Github}
 * @memberOf wsemi
 * @returns {Function} 回傳domVirtualCreate函數
 * @example
 * need test in browser
 *
 * let dpq = domVirtualCreateQueue()
 *
 * //先給予圖片寬高與產製函數, 內部通過佇列逐次運行產圖與回傳base64
 * let fun = async (ele) => {
 *
 *     //chart
 *     let highchartsOpt = {...} //給予highcharts設定物件
 *     window.Highcharts.chart(ele, highchartsOpt)
 *
 *     //html2picDyn, 預設轉出base64
 *     let html2canvasOpt = { scale: 3 } //放大3倍, 提高解析度
 *     b64 = await html2picDyn(ele, html2canvasOpt)
 *
 *     return b64
 * }
 *
 * let b64 = await dpq(500, 350, fun)
 *
 */
async function domVirtualCreateQueue() {

    function Core() {

        //pmq
        let pmq = pmQueue(1) //因處理dom為瀏覽器當前執行緒, 無法使用web worker, 故僅限定同時處理1組

        async function pushQueue(w, h, fun) {
            return pmq(domVirtualCreate, w, h, fun)
        }

        return pushQueue
    }

    return new Core()
}


export default domVirtualCreateQueue
