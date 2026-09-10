import isfun from './isfun.mjs'


//本檔為內部使用, 不由index匯出
//
//用途: 於「呼叫端」派發事件並攔截監聽器之同步拋錯, 供wsemi內以timer、stream、watcher等回呼派發事件之模組使用
//
//為何不改emitter而改在呼叫端:
//  EventEmitter之規範語意為「監聽器同步拋錯時由emit外拋至emit之呼叫端」, 且emit丟棄監聽器之回傳值。
//  於timer或I/O回呼內派發時, 該外拋即成uncaughtException而殺行程 —— 但那是「派發位置」的問題,
//  不是emitter契約的問題。若改為包裝監聽器, 就必須維護「包裝函數↔原函數」之對應表, 而該對應表會使
//  on/off/once/listeners之行為偏離規範(事件名型別別名、以異物移除、once自動移除…), 即封裝層自身
//  成為「調用方拿到非預期」之來源。
//  故於此僅包住emit之呼叫, emitter本身維持原生eventemitter3, 完全合規。
//
//不處理async監聽器之reject:
//  emit為同步且回傳布林, 監聽器所回傳之Promise規範上即無人觀察。nodejs文件明載「使用async函數作為
//  事件處理器有問題, 會導致unhandled rejection」, 並將captureRejections設計為opt-in而非預設;
//  eventemitter3與瀏覽器端之events polyfill皆未提供該選項。故async監聽器應自行處理其錯誤
//  (wsemi內pmQueue即以pm2resolve為之, 行之有年), 本函數不代為攔截。


/**
 * 於呼叫端安全派發事件, 攔截監聽器之同步拋錯
 *
 * @param {Object} ev 輸入eventemitter3實例
 * @param {String} name 輸入事件名稱字串
 * @param {Array} args 輸入事件參數陣列
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Function} [opt.funSettle=null] 輸入監聽器出錯時之收尾函數, 傳入(err), 用於settle該次派發所帶之pm, 使模組流程不懸置
 * @param {Function} [opt.funEmit=null] 輸入實際派發函數, 傳入(name, ...args), 預設使用ev.emit; 供已覆寫ev.emit之模組(如fsEvem改為寫檔廣播)指定以原生emit於本程序派發
 * @param {String} [opt.tag=''] 輸入模組名稱字串, 用於console.error之前綴
 * @returns {Boolean} 回傳emit之結果布林值, 監聽器出錯時回傳false
 */
function _evemEmit(ev, name, args = [], opt = {}) {

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

        //funSettle, 須排在通報之前
        //  settle該次派發所帶之pm為唯一「非做不可」者, 通報排在其後, 如此縱使通報那幾行拋錯,
        //  該次流程也已settle, 懸置在結構上不可能發生
        if (isfun(funSettle)) {
            try {
                funSettle(err)
            }
            catch (err2) {
            }
        }

        //通報, 依當下是否有error監聽者決定emit或console.error
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


export default _evemEmit
