import isfun from './isfun.mjs'


/**
 * 於呼叫端安全派發事件，攔截監聽器之同步拋錯
 *
 * 【為何在呼叫端派發，而非包裝監聽器】
 *
 * EventEmitter之規範語意為「監聽器同步拋錯時由emit外拋至emit之呼叫端」，該行為本身沒有問題。
 * 會出事的是派發位置：於timer或I/O回呼內派發時，那個外拋即成uncaughtException而殺整個行程。
 * 所以要處理的是派發位置，不是emitter之契約 —— 若改為包裝監聽器，就必須維護「包裝函數↔原函數」
 * 之對應表，而該對應表會使on、off、once、listeners之行為偏離規範（事件名型別別名、以異物移除、
 * once自動移除等），封裝層自身反而成為「調用方拿到非預期」之來源。
 *
 * 【為何不以setTimeout脫勾來迴避】
 *
 * setTimeout會開一個「沒有呼叫者」的堆疊，監聽器之同步拋錯於該處即為uncaughtException，
 * 且呼叫端無論如何try都攔不到（此與監聽器是否為async無關，純同步監聽器亦然）。
 * 於呼叫端之堆疊上派發，一個普通的try即可攔下。確實需要脫勾者請改用evEmitDefer，
 * 其內部即以本函數派發，故仍有攔截。
 *
 * 【為何不處理async監聽器之reject】
 *
 * emit依EventEmitter規範丟棄監聽器之回傳值，其rejection無人觀察；nodejs文件亦明載
 * 「使用async函數作為事件處理器有問題」，並將captureRejections設計為opt-in而非預設，
 * 而eventemitter3與瀏覽器端之events polyfill皆未提供該選項。
 * 故監聽器應為同步，非同步之結果請以事件所帶之pm回覆 —— pm即為回覆通道，監聽器不需要第二條。
 *
 * 【settle為何排在通報之前】
 *
 * settle該次派發所帶之pm為唯一「非做不可」者，通報排其後，如此縱使通報那幾行拋錯，
 * 該次流程也已settle，懸置在結構上不可能發生。此順序為明文要求，不得對調。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evEmit.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} ev 輸入事件物件，為evem所建立之eventemitter3實例
 * @param {String} name 輸入事件名稱字串
 * @param {Array} [args=[]] 輸入事件參數陣列，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.funSettle=null] 輸入監聽器出錯時之收尾函數，傳入(err)，用於settle該次派發所帶之pm使流程不懸置。不指定即代表本事件無回覆通道，不得由本函數猜測pm之位置
 * @param {Function} [opt.funEmit=null] 輸入實際派發函數，傳入(name, ...args)，預設使用ev.emit。供已覆寫ev.emit之模組指定以原生emit於本程序派發，否則通報之error亦會走覆寫後之路徑
 * @param {String} [opt.tag='evem'] 輸入模組名稱字串，用於console.error之前綴，預設'evem'
 * @returns {Boolean} 回傳emit之結果布林值，監聽器出錯時回傳false
 * @example
 *
 * let ev = evem()
 *
 * ev.on('error', (msg) => {
 *     console.log(msg.fun, msg.name, msg.msg.message)
 *     // => listener ev boom
 * })
 * ev.on('ev', () => {
 *     throw new Error('boom')
 * })
 *
 * let r = evEmit(ev, 'ev', [{ a: 1 }], { tag: 'demo' })
 * console.log(r)
 * // => false
 *
 */
function evEmit(ev, name, args = [], opt = {}) {

    let funSettle = opt.funSettle
    let tag = opt.tag || 'evem'

    //emit, 預設用ev.emit; 已覆寫ev.emit者須指定funEmit, 否則通報之error亦會走覆寫後之路徑
    let emit = (nm, ...a) => {
        return ev.emit(nm, ...a)
    }
    if (isfun(opt.funEmit)) {
        emit = opt.funEmit
    }

    try {
        return emit(name, ...args)
    }
    catch (err) {

        //funSettle, 須排在通報之前, 且其自身拋錯亦須隔離
        //  否則呼叫端(常為timer或watcher之回呼)會收到該拋錯而成uncaughtException, 等於防護於自身破功
        if (isfun(funSettle)) {
            try {
                funSettle(err)
            }
            catch (err2) {
            }
        }

        //通報, 依當下是否有error監聽者決定emit或console.error, 二擇一不重複
        //  對error事件本身之監聽器拋錯者不再重發, 避免無限遞迴
        try {
            if (name !== 'error' && ev.listenerCount('error') > 0) {
                emit('error', { fun: 'listener', name, msg: err, args })
            }
            else {
                console.error(`[wsemi ${tag}] listener of '${String(name)}' threw:`, err)
            }
        }
        catch (err2) {
            try {
                console.error(`[wsemi ${tag}] listener of '${String(name)}' threw, and reporting it also threw:`, err2, err)
            }
            catch (err3) {
            }
        }

        return false
    }
}


export default evEmit
