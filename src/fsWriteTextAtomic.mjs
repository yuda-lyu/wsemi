import fs from 'fs'
import fsWriteTextAtomicCore from './fsWriteTextAtomicCore.mjs'
import toResultError from './_toResultError.mjs'


/**
 * 後端nodejs原子寫入utf-8文字至檔案(暫存檔加rename)
 *
 * 先寫入同資料夾之暫存檔，再以rename取代目標檔，故寫入中途中止(行程被終止、當機)時，目標檔不會是寫到一半的半份，仍為原內容或完整新內容；適用於狀態檔、真理檔(fsWriteText為直接覆寫，中止時會留下半份)。不呼叫fsync，故不保證斷電後之耐久性
 *
 * Windows下目標檔被防毒、同步軟體或編輯器占用時rename會失敗(錯誤碼EPERM、EBUSY、EACCES，稱占用類)，此時重試至多opt.retries次，間隔依序為50、100、150…毫秒(同步阻塞等待)；非占用類錯誤立即停止不重試。重試用盡後：opt.fallbackOverwrite為true且最後錯誤為占用類時，退回直接覆寫目標檔(非原子，適用於可由真理重建之投影檔)，結果物件帶overwritten為true供呼叫端記錄警告；否則回傳error(適用於真理檔：退回非原子覆寫會失去中止不留半份之保證，寧可本次不寫)
 *
 * 同fs系列函數以結果物件回報，不同步拋錯；任何失敗路徑皆清除暫存檔，不留*.tmp。必須參數fp(非空字串)與c(字串)不合時回傳error說明字串，不寫入任何檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteTextAtomic.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱非空字串，必須給定；上層資料夾不存在時自動建立
 * @param {String} c 輸入檔案內容utf-8字串，必須給定(空字串為有效內容)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.retries=3] 輸入rename遇占用類錯誤時之最大重試次數非負整數，非預期輸入視為未給，預設3
 * @param {Boolean} [opt.fallbackOverwrite=false] 輸入重試用盡且最後錯誤為占用類時，是否退回直接覆寫目標檔，只有原始布林true才啟用(此旗標放棄原子性)，其餘視為未給，預設false
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，格式為(e)=>{}，供測試以事件(而非等待時間)同步與診斷，事件種類見fsWriteTextAtomicCore，預設null
 * @returns {Object} 回傳結果物件，提供鍵success代表寫入之檔案路徑字串(同fsWriteText)，退回直接覆寫成功時另帶overwritten為true；提供鍵error代表錯誤訊息(輸入無效時為說明字串，其餘為建資料夾、寫檔或rename之Error物件)
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsWriteTextAtomic'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fp = `${fdt}/abc/t1.json`
 *
 *     let b1 = fsWriteTextAtomic(fp, '{"a":1}')
 *     console.log('fsWriteTextAtomic', b1)
 *     ms.push({ 'fsWriteTextAtomic': b1 })
 *
 *     let b2 = fsWriteTextAtomic(fp, '{"a":2}') //覆寫既有檔, 不留暫存檔
 *     ms.push({ 'overwrite': b2 })
 *     ms.push({ 'readFileSync': fs.readFileSync(fp, 'utf8') })
 *     ms.push({ 'tmp left': fs.readdirSync(`${fdt}/abc`) })
 *
 *     let b3 = fsWriteTextAtomic(fdt, 'x') //目標為資料夾, 回傳error
 *     ms.push({ 'is error': b3.error !== undefined })
 *
 *     let b4 = fsWriteTextAtomic('', 'x') //必須參數無效, 回傳error說明字串
 *     ms.push({ 'invalid fp': b4 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsWriteTextAtomic { success: './_test_fsWriteTextAtomic/abc/t1.json' }
 * // ms [
 * //   { fsWriteTextAtomic: { success: './_test_fsWriteTextAtomic/abc/t1.json' } },
 * //   { overwrite: { success: './_test_fsWriteTextAtomic/abc/t1.json' } },
 * //   { readFileSync: '{"a":2}' },
 * //   { 'tmp left': [ 't1.json' ] },
 * //   { 'is error': true },
 * //   { 'invalid fp': { error: 'invalid fp: must be a non-empty string' } }
 * // ]
 *
 */
function fsWriteTextAtomic(fp, c, opt = {}) {
    try {
        return fsWriteTextAtomicCore(fp, c, { ...opt, fs }) //固定使用內建fs
    }
    catch (err) {
        //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 轉為結果物件而不同步拋出
        return {
            error: toResultError(err), //Error原樣, 其餘轉字串, 恆為truthy
        }
    }
}


export default fsWriteTextAtomic
