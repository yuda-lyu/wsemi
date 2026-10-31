import isfun from './isfun.mjs'
import getDiag from './getDiag.mjs'


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
 * 於呼叫端之堆疊上派發，一個普通的try即可攔下。確實需要脫勾者請改用evEmitDelay，
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
 * 【通報之輸出：只出安全摘要，不原樣輸出拋出值】
 *
 * 無error監聽者(或拋錯者即為error監聽器本身)而須由本函數自行輸出時，監聽器拋出之值常含權杖、使用者識別或資料值，
 * 不得原樣寫入stderr。輸出一律經getDiag(opt)之出口(診斷輸出與遮罩之單一實作，規則R-DIAG-01)：
 * 預設以console.error只輸出固定詞彙之label(如'[wsemi evem] listener threw')與安全摘要{ errType, errCode }；
 * opt.logDetail為true時改輸出遮罩後之細節{ event, err }(拋出值內之憑證鍵名與'token=值'等憑證樣式經遮罩，其餘內容原樣，故仍不宜長期開啟)；opt.funLog為函數時輸出只交給它，不寫console。
 * 事件名稱不入label(通用函數之事件名可能帶識別，如依使用者分流之事件名)，只入細節；tag為呼叫端程式設定之固定詞彙，留於label(只收非空字串，至多取前64字元，其餘視為'evem'；label之控制字元換成?)。
 * 通報本身亦拋錯時(如error監聽器自身拋錯，或ev已損壞)，label為'[wsemi <tag>] listener threw, and reporting it also threw'，安全摘要為此拋錯之{ errType, errCode }加原拋出值之{ origErrType, origErrCode }，細節為{ event, err2, err }。
 * 有error監聽者時仍以emit('error', { fun, name, msg, args })交給監聽者，該事件為程式化通道，內容不變。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evEmit.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} ev 輸入事件物件，為evem所建立之eventemitter3實例
 * @param {String} name 輸入事件名稱字串
 * @param {Array} [args=[]] 輸入事件參數陣列，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.funSettle=null] 輸入監聽器出錯時之收尾函數，傳入(err)，用於settle該次派發所帶之pm使流程不懸置。不指定即代表本事件無回覆通道，不得由本函數猜測pm之位置
 * @param {Function} [opt.funEmit=null] 輸入實際派發函數，傳入(name, ...args)，預設使用ev.emit。供已覆寫ev.emit之模組指定以原生emit於本程序派發，否則通報之error亦會走覆寫後之路徑
 * @param {String} [opt.tag='evem'] 輸入模組名稱字串，用於通報label之前綴'[wsemi tag]'，非字串者視為'evem'，預設'evem'
 * @param {Boolean} [opt.logDetail=false] 輸入是否於console輸出遮罩後之細節(事件名與拋出值)，須為true才生效，同getDiag，預設false(只輸出安全摘要)
 * @param {Function} [opt.funLog=null] 輸入診斷輸出函數，格式為(label, safe, detail)=>{}，給予時通報只交給它而不寫console，同getDiag，預設null
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
 * //無error監聽者時之通報(預設只輸出安全摘要, 不輸出拋出值)
 * let ev2 = evem()
 * ev2.on('ev', () => {
 *     throw new Error('token=abc123')
 * })
 * evEmit(ev2, 'ev', [], { tag: 'demo' })
 * // console.error('[wsemi demo] listener threw', { errType: 'Error' })
 *
 * evEmit(ev2, 'ev', [], { tag: 'demo', funLog: (label, safe, detail) => console.log(label, safe, detail) })
 * // console.log('[wsemi demo] listener threw', { errType: 'Error' }, { event: 'ev', err: Error: token=*** ... })  //細節內之憑證樣式經遮罩
 *
 */
function evEmit(ev, name, args = [], opt = {}) {

    let funSettle = opt.funSettle
    //tag, 只讀一次(讀取時之值即用之值); 限64字元使label之固定詞彙後綴不被normLabel之200字元上限擠掉
    let tg = opt.tag
    let tag = typeof tg === 'string' && tg !== '' ? tg.slice(0, 64) : 'evem'

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

        //通報, 依當下是否有error監聽者決定emit或診斷輸出, 二擇一不重複
        //  對error事件本身之監聽器拋錯者不再重發, 避免無限遞迴
        //  診斷輸出經getDiag(opt)(R-DIAG-01): 預設只出固定詞彙label與安全摘要, 拋出值只在logDetail或funLog時以遮罩後細節交出; 事件名不入label(可能帶識別)只入細節
        try {
            if (name !== 'error' && ev.listenerCount('error') > 0) {
                emit('error', { fun: 'listener', name, msg: err, args })
            }
            else {
                let diag = getDiag(opt)
                diag(`[wsemi ${tag}] listener threw`, diag.brief(err), () => ({ event: name, err }), 'error')
            }
        }
        catch (err2) {
            //通報本身亦拋錯(error監聽器拋錯或ev已損壞): 摘要含此拋錯與原拋錯之類型, 細節為[此拋錯, 原拋錯]; getDiag永不拋錯, 外層try為最後防線
            try {
                let diag = getDiag(opt, { safeKeys: ['origErrType', 'origErrCode'] })
                let b0 = diag.brief(err)
                let safe = { ...diag.brief(err2), origErrType: b0.errType }
                if (b0.errCode !== undefined) {
                    safe.origErrCode = b0.errCode
                }
                diag(`[wsemi ${tag}] listener threw, and reporting it also threw`, safe, () => ({ event: name, err2, err }), 'error')
            }
            catch (err3) {
            }
        }

        return false
    }
}


export default evEmit
