import pmMarkHandled from './_pmMarkHandled.mjs'
import { isObjLike, isProxy, gd, hasOwn, arrVals, normLabel, normSafe, markHandled } from './_diagKit.mjs'


/**
 * 伺服端轉接器：產生供ORM等產生端使用之funLog，把診斷輸出轉寫至伺服器日誌，只寫label與安全摘要(safe)，不讀細節
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。回傳{ funLog, close }：funLog(label, safe)帶noDetail===true屬性(getDiag見之即不呼叫getDetail、不做拷貝)，不宣告也不讀第3引數；
 * 每次呼叫寫入write({ event, label, safe })：label經正規化(非字串為'(label)'，控制字元換?，至多200字元)，safe經正規化為物件(只取自有可列舉資料屬性，值限字串至多200字元、有限數字、布林、null、陣列至多20項與至多2層之純物件，bigint為'(bigint)'，循環為'[Circular]'，不可序列化者只影響該格)
 *
 * opt.safeKeys(轉接器為寫入日誌之最後出口之第二道防線)：給了陣列就只留其所列之safe頂層鍵(恆含errType、errCode，同getDiag之cfg.safeKeys；名單外之鍵不讀描述子)，巢狀物件之鍵不過濾；未給(含值為undefined或null)時不依白名單過濾；
 * 宣告了而無法使用(存取器、非陣列、可偵測之Proxy)或opt無法讀取(可偵測之Proxy、已撤銷之Proxy)時視為空白名單(fail-closed，只留errType、errCode)；套件宣告只讀自有資料屬性，陣列之存取器之項與非字串之項略過
 *
 * write同步拋錯吞下，回傳之原生Promise經_pmMarkHandled標記已處理(以品牌判定，含跨realm；不呼叫一般thenable之then)；close()之後不再寫入；write非函數時建構即同步拋TypeError(設定錯誤應立即可見)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genDiagFunLog.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} write 輸入寫入函數，格式為(o)=>{}，o為{ event, label, safe }
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.event='orm-diag'] 輸入事件名稱，預設'orm-diag'
 * @param {Array} [opt.safeKeys=undefined] 輸入safe之頂層鍵名白名單陣列(恆含errType、errCode)，預設undefined代表不過濾
 * @returns {Object} 回傳物件{ funLog, close }
 * @example
 *
 * let rs = []
 * let { funLog, close } = genDiagFunLog((o) => rs.push(o))
 * funLog('select failed\n', { mode: 'select', n: 2n })
 * console.log(rs)
 * // => [ { event: 'orm-diag', label: 'select failed?', safe: { mode: 'select', n: '(bigint)' } } ]
 * close()
 * funLog('x', {})
 * console.log(rs.length)
 * // => 1
 *
 * let rs2 = []
 * genDiagFunLog((o) => rs2.push(o), { safeKeys: ['n'] }).funLog('x', { n: 1, password: 'zzz', errType: 'Error' })
 * console.log(rs2[0].safe)
 * // => { n: 1, errType: 'Error' }
 *
 */
function genDiagFunLog(write, opt) {
    if (typeof write !== 'function') {
        throw new TypeError('write is not a function')
    }
    let event = 'orm-diag'
    let safeKeys = null //null為未給: safe不依白名單過濾(只做正規化)
    try {
        if (isObjLike(opt) && !isProxy(opt)) {
            let d = gd(opt, 'event')
            if (d !== undefined && hasOwn(d, 'value') && typeof d.value === 'string' && d.value !== '') {
                event = d.value
            }
            //safeKeys, 給了就只留白名單內之頂層鍵(恆含errType、errCode, 同getDiag之cfg.safeKeys); 值為undefined或null視為未給; 宣告了而無法使用(存取器、非陣列、可偵測之Proxy)為[](fail-closed, 只留errType、errCode)
            let ds = gd(opt, 'safeKeys')
            if (ds !== undefined && !(hasOwn(ds, 'value') && (ds.value === undefined || ds.value === null))) {
                safeKeys = hasOwn(ds, 'value') && Array.isArray(ds.value) && !isProxy(ds.value) ? arrVals(ds.value, false).filter((k) => typeof k === 'string') : []
            }
        }
        else if (isProxy(opt)) {
            safeKeys = [] //opt無法讀取(可偵測之Proxy): 不知是否宣告了safeKeys, fail-closed
        }
    }
    catch (err) {
        //讀不到: event用預設, safeKeys為[](fail-closed)
        safeKeys = []
    }
    let closed = false
    let funLog = (label, safe) => {
        if (closed) {
            return
        }
        try {
            markHandled(write({ event, label: normLabel(label), safe: normSafe(safe, safeKeys) }), pmMarkHandled)
        }
        catch (err) {
            //寫入失敗不影響產生端
        }
    }
    Object.defineProperty(funLog, 'noDetail', { value: true, writable: false, enumerable: true, configurable: false })
    let close = () => {
        closed = true
    }
    return { funLog, close }
}


export default genDiagFunLog
