import evEmit from './evEmit.mjs'
import cst from './_const.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'


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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evEmitDelay.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} ev 輸入事件物件，為evem所建立之eventemitter3實例
 * @param {String} name 輸入事件名稱字串
 * @param {Array} [args=[]] 輸入事件參數陣列，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.ms=1] 輸入延後派發之毫秒正整數，預設1，超過計時器上限者夾至上限，見_const.mjs
 * @param {Function} [opt.funSettle=null] 輸入監聽器出錯時之收尾函數，同evEmit
 * @param {Function} [opt.funEmit=null] 輸入實際派發函數，同evEmit
 * @param {String} [opt.tag='evem'] 輸入模組名稱字串，同evEmit
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

    //ms
    let ms = opt.ms
    if (!ispint(ms)) {
        ms = 1
    }
    ms = cint(ms)
    ms = Math.min(ms, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //setTimeout, 於新堆疊內仍以evEmit派發, 故監聽器之同步拋錯有攔截
    let t = setTimeout(() => {
        evEmit(ev, name, args, opt)
    }, ms)

    return t
}


export default evEmitDelay
