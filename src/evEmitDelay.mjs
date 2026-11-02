import evEmit from './evEmit.mjs'
import optVal from './_optVal.mjs'


//ms: opt類參數, 有效整數且為正數計時毫秒(iseint, use: 'timer', min: 1; 交給setTimeout), 非預期(含Infinity、超出計時器上限)改用預設1
let RULE_MS = { fn: 'evEmitDelay', name: 'opt.ms', kind: 'eint', chk: { use: 'timer', min: 1 } }


/**
 * 以timer脫勾後於呼叫端安全派發事件，攔截監聽器之同步拋錯
 *
 * 內部以setTimeout延後，再交由evEmit派發，故監聽器之同步拋錯仍被攔截。
 *
 * 【何時需要脫勾】
 *
 * 當派發當下之狀態尚未更新完成、或監聽器內會回頭存取本模組之狀態時，需先讓當前堆疊跑完再派發，
 * 使監聽器取得的是更新後之狀態。此為業務需求而非防護需求。
 *
 * 【脫勾為何不可直接用setTimeout包ev.emit】
 *
 * setTimeout會開一個「沒有呼叫者」的堆疊，監聽器之同步拋錯於該處即為uncaughtException，
 * 且呼叫端無論如何try都攔不到（此與監聽器是否為async無關，純同步監聽器亦然）。
 * 故脫勾之後仍須於該新堆疊內以try攔截，本函數即為此而設。
 *
 * 【與evEmit之差異】
 *
 * 因已脫勾，本函數無法同步取得emit之結果，故不回傳值；需要回傳值者請用evEmit。
 *
 * 【通報之輸出】
 *
 * opt整包傳入evEmit，無error監聽者(或拋錯者即error監聽器本身)而須自行輸出時，與evEmit相同經getDiag出口：預設只輸出固定詞彙label與安全摘要，不輸出拋出值與事件名，
 * opt.logDetail為true才輸出遮罩後細節，opt.funLog為函數時輸出只交給它。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evEmitDelay.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} ev 輸入事件物件，為evem所建立之eventemitter3實例
 * @param {String} name 輸入事件名稱字串
 * @param {Array} [args=[]] 輸入事件參數陣列，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.ms=1] 輸入延後派發之毫秒正整數(1至2147483647計時器上限，數字字串亦可)，預設1；非預期(0、負數、小數、Infinity、超過2147483647、'0x10'等)視為未給而改用預設1，不報錯、不夾至上限
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.ms為非預期之輸入時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false；警告出口為opt.funLog，以(msg, { fn, reason, key })呼叫，其形狀同診斷輸出之(label, safe, detail)(msg為固定詞彙之label，{ fn, reason, key }為安全摘要，無detail)
 * @param {Function} [opt.funSettle=null] 輸入監聽器出錯時之收尾函數，同evEmit
 * @param {Function} [opt.funEmit=null] 輸入實際派發函數，同evEmit
 * @param {String} [opt.tag='evem'] 輸入模組名稱字串，同evEmit
 * @param {Boolean} [opt.logDetail=false] 輸入是否於console輸出遮罩後之細節(事件名與拋出值)，同evEmit(opt整包傳入evEmit，監聽器拋錯之通報經getDiag出口，預設只輸出安全摘要)，預設false
 * @param {Function} [opt.funLog=null] 輸入診斷輸出函數，格式為(label, safe, detail)=>{}，同evEmit，預設null
 * @returns {Object} 回傳timer物件，可供呼叫端以clearTimeout取消該次派發
 * @example
 *
 * let ev = evem()
 *
 * let rs = []
 * ev.on('ev', (msg) => {
 *     rs.push(msg)
 * })
 *
 * evEmitDelay(ev, 'ev', [{ a: 1 }])
 * console.log(rs)
 * // => []   //尚未派發, 因已脫勾
 *
 * setTimeout(() => {
 *     console.log(rs)
 *     // => [ { a: 1 } ]
 * }, 50)
 *
 */
function evEmitDelay(ev, name, args = [], opt = {}) {

    //ms, 有效則取Number(v), 非預期(含Infinity、超出計時器上限)改用預設, 不夾至上限
    let ms = optVal(opt.ms, 1, RULE_MS, opt)

    //setTimeout, 於新堆疊內仍以evEmit派發, 故監聽器之同步拋錯有攔截
    let t = setTimeout(() => {
        evEmit(ev, name, args, opt)
    }, ms)

    return t
}


export default evEmitDelay
