import EventEmitter from 'eventemitter3'


/**
 * 建立事件物件(EventEmitter from eventemitter3)
 *
 * 本函數僅回傳原生eventemitter3實例, 不做任何包裝, 故其行為完全遵循EventEmitter之規範語意:
 * 監聽器同步拋錯時由emit外拋至emit之呼叫端(且該次派發之後續監聽器不再被呼叫); emit為同步且回傳布林值,
 * 監聽器所回傳之值(含Promise)一律丟棄。
 *
 * 關於async監聽器: nodejs文件明載「使用async函數作為事件處理器有問題, 會導致unhandled rejection」,
 * 並將captureRejections設計為opt-in而非預設; eventemitter3與瀏覽器端之events polyfill皆未提供該選項。
 * 故async監聽器應自行處理其錯誤(如以wsemi之pm2resolve包裝待執行函數), 本函數不代為攔截, 亦不應代為攔截
 * —— 一旦為此包裝監聽器, 就必須維護「包裝函數↔原函數」之對應表, 而該對應表會使on/off/once/listeners
 * 之行為偏離規範(事件名型別別名、以異物移除、once自動移除等), 使封裝層自身成為「調用方拿到非預期」之來源。
 *
 * 若模組於timer、stream、watcher等回呼內派發事件, 監聽器之同步拋錯即成uncaughtException而殺行程 ——
 * 該情形屬「派發位置」之問題而非emitter契約之問題, 應於派發處自行以try catch攔截(wsemi提供evEmit與evEmitDelay為之)。
 *
 * See: {@link https://github.com/primus/eventemitter3 eventemitter3}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evem.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳eventemitter3實例
 * @example
 *
 * let ev = evem()
 *
 * ev.on('evName', function(msg) {
 *     console.log(msg)
 *     // => {abc: 12.34}
 * })
 *
 * let data = { abc: 12.34 }
 * ev.emit('evName', data)
 *
 */
function evem() {
    return new EventEmitter()
}


export default evem
