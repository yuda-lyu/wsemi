import pmMarkHandled from './_pmMarkHandled.mjs'
import { isObjLike, isProxy, gd, hasOwn, normLabel, normSafe, markHandled } from './_diagKit.mjs'


/**
 * 伺服端轉接器：產生供ORM等產生端使用之funLog，把診斷輸出轉寫至伺服器日誌，只寫label與安全摘要(safe)，不讀細節
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。回傳{ funLog, close }：funLog(label, safe)帶noDetail===true屬性(getDiag見之即不呼叫getDetail、不做拷貝)，不宣告也不讀第3引數；
 * 每次呼叫寫入write({ event, label, safe })：label經正規化(非字串為'(label)'，控制字元換?，至多200字元)，safe經正規化為物件(只取自有可列舉資料屬性，值限字串至多200字元、有限數字、布林、null、陣列至多20項與至多2層之純物件，bigint為'(bigint)'，循環為'[Circular]'，不可序列化者只影響該格)
 *
 * write同步拋錯吞下，回傳之原生Promise經_pmMarkHandled標記已處理(不呼叫一般thenable之then)；close()之後不再寫入；write非函數時建構即同步拋TypeError(設定錯誤應立即可見)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genDiagFunLog.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} write 輸入寫入函數，格式為(o)=>{}，o為{ event, label, safe }
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.event='orm-diag'] 輸入事件名稱，預設'orm-diag'
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
 */
function genDiagFunLog(write, opt) {
    if (typeof write !== 'function') {
        throw new TypeError('write is not a function')
    }
    let event = 'orm-diag'
    try {
        if (isObjLike(opt) && !isProxy(opt)) {
            let d = gd(opt, 'event')
            if (d !== undefined && hasOwn(d, 'value') && typeof d.value === 'string' && d.value !== '') {
                event = d.value
            }
        }
    }
    catch (err) {
        //讀不到用預設
    }
    let closed = false
    let funLog = (label, safe) => {
        if (closed) {
            return
        }
        try {
            markHandled(write({ event, label: normLabel(label), safe: normSafe(safe, null) }), pmMarkHandled)
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
