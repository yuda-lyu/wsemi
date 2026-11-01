import get from 'lodash-es/get.js'
import getPathParent from './getPathParent.mjs'
import iseint from './iseint.mjs'
import getTrace from './getTrace.mjs'
import toResultError from './_toResultError.mjs'


//占用類錯誤碼: Windows下防毒、同步軟體或編輯器開著目標檔時, rename會暫時被占用
let BUSY_CODES = ['EPERM', 'EBUSY', 'EACCES']


//codeOf, 取錯誤碼字串, 讀取不可靠之錯誤值不拋錯, 無碼為''
function codeOf(err) {
    let c = ''
    try {
        c = err.code
    }
    catch (e) {}
    return typeof c === 'string' ? c : ''
}


//sleepSync, 同步小睡(Atomics.wait, 不佔CPU)
function sleepSync(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}


//work, 寫入主流程, 成功回傳結果物件, 失敗拋錯(含輸入無效), 由fsWriteTextAtomicCore統一轉為結果物件
//  st為共享狀態: fs與trace供收尾使用, tmp為尚未取代目標檔之暫存檔路徑(空字串代表無須清除), why為trace('done')之reason
function work(fp, c, opt, st) {

    //opt, 讀取置於try內(由呼叫端包覆): opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出
    let fs = get(opt, 'fs')
    st.fs = fs
    st.trace = getTrace(opt)
    let trace = st.trace
    let retries = get(opt, 'retries', null)
    let fallbackOverwrite = get(opt, 'fallbackOverwrite', null)

    //check, fp與c為必須參數, 無效以說明字串回報(不回顯輸入值)
    st.why = 'prepare'
    if (typeof fp !== 'string' || fp === '') {
        return { error: 'invalid fp: must be a non-empty string' }
    }
    if (typeof c !== 'string') {
        return { error: 'invalid c: must be a string' }
    }

    //retries, fallbackOverwrite, 非預期輸入視為未給
    if (!iseint(retries, { min: 0 })) {
        retries = 3
    }
    else {
        retries = Number(retries)
    }
    if (fallbackOverwrite !== true) {
        fallbackOverwrite = false //只收原始布林true: 此旗標會放棄原子性, 不收new Boolean(false)等包裝物件
    }

    //fd, 上層資料夾不存在則建立(recursive: 已存在之資料夾或指向資料夾之連結不視為錯誤; 純檔名無上層資料夾部分則為本進程工作目錄, 不需建立), 失敗即回報建立之錯誤
    st.why = 'prepare'
    let fd = getPathParent(fp)
    if (fd !== '') {
        fs.mkdirSync(fd, { recursive: true })
    }

    //tmp, 與目標檔同資料夾
    let tmp = `${fp}.${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.tmp`
    st.tmp = tmp

    //writeFileSync, 寫入暫存檔, 失敗拋錯(暫存檔由呼叫端清除)
    st.why = 'write'
    fs.writeFileSync(tmp, c, 'utf8')

    //renameSync, 占用類錯誤重試, 其餘錯誤立即停止
    st.why = 'rename'
    let errLast = null
    let bBusy = false
    for (let n = 1; n <= retries + 1; n++) {
        if (n > 1) {
            let ms = 50 * (n - 1)
            if (trace) {
                trace('retry', { n, ms, code: codeOf(errLast) })
            }
            sleepSync(ms)
        }
        if (trace) {
            trace('attempt', { n })
        }
        try {
            fs.renameSync(tmp, fp)
            st.tmp = '' //暫存檔已成為目標檔
            st.why = 'renamed'
            return { success: fp }
        }
        catch (err) {
            errLast = err
            bBusy = BUSY_CODES.includes(codeOf(err))
            if (!bBusy) {
                break
            }
        }
    }

    //fallback, 僅限占用類錯誤且呼叫端同意: 退回直接覆寫目標檔(非原子)
    if (bBusy && fallbackOverwrite) {
        if (trace) {
            trace('fallback', { code: codeOf(errLast) })
        }
        st.why = 'fallback'
        fs.writeFileSync(fp, c, 'utf8')
        st.why = 'overwritten'
        return { success: fp, overwritten: true }
    }

    throw errLast
}


/**
 * 後端nodejs原子寫入utf-8文字至檔案(暫存檔加rename)，注入fs版
 *
 * 先寫入同資料夾之暫存檔，再以rename取代目標檔，故寫入中途中止(行程被終止、當機)時，目標檔不會是寫到一半的半份，仍為原內容或完整新內容。適用於狀態檔、真理檔；不呼叫fsync，故不保證斷電後之耐久性
 *
 * Windows下目標檔被防毒、同步軟體或編輯器占用時rename會失敗(錯誤碼EPERM、EBUSY、EACCES，稱占用類)，此時重試至多opt.retries次，間隔依序為50、100、150…毫秒(同步阻塞等待)；非占用類錯誤立即停止不重試。重試用盡後：opt.fallbackOverwrite為true且最後錯誤為占用類時，退回直接覆寫目標檔(非原子，適用於可由真理重建之投影檔)，結果物件帶overwritten為true供呼叫端記錄警告；否則回傳error(適用於真理檔：退回非原子覆寫會失去中止不留半份之保證，寧可本次不寫)
 *
 * 任何失敗路徑皆清除暫存檔，且不同步拋錯，一律以結果物件回報；暫存檔名為「目標檔名.行程pid-時間戳base36-隨機4碼.tmp」，與目標檔同資料夾，若行程於寫入暫存檔後、rename前被強制終止，暫存檔會殘留(無從清理)；暫存檔名比目標檔名多約24字，目標檔名極長(接近檔案系統上限約255字元)時暫存檔建立會失敗而回傳error
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteTextAtomicCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱非空字串，必須給定；上層資料夾不存在時自動建立
 * @param {String} c 輸入檔案內容utf-8字串，必須給定(空字串為有效內容)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入注入之fs模組(需提供mkdirSync、writeFileSync、renameSync、unlinkSync，供測試與替身)，必須給定
 * @param {Number} [opt.retries=3] 輸入rename遇占用類錯誤時之最大重試次數非負整數，非預期輸入視為未給，預設3
 * @param {Boolean} [opt.fallbackOverwrite=false] 輸入重試用盡且最後錯誤為占用類時，是否退回直接覆寫目標檔，只有原始布林true才啟用(此旗標放棄原子性，故不收'true'、1、new Boolean(true)等)，其餘視為未給，預設false
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，格式為(e)=>{}，e為凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷，回調拋錯與回傳值皆忽略，預設null。type為'attempt'時為即將進行第n次rename嘗試(含n，由1起算)，'retry'時為rename遇占用類錯誤而即將同步等待ms毫秒後進行第n次嘗試(含n、ms、code：n由2起算，ms即實際間隔，code為上次錯誤碼字串)，'fallback'時為重試用盡而即將退回直接覆寫(含code)，'done'時為本次呼叫即將回傳(含ok為是否成功、reason：成功為'renamed'(rename成功)或'overwritten'(退回覆寫成功)，失敗為'prepare'(輸入無效或上層資料夾無法建立)、'write'(暫存檔寫入失敗)、'rename'(非占用類錯誤，或占用類用盡且未退回覆寫)、'fallback'(退回覆寫失敗))
 * @returns {Object} 回傳結果物件，提供鍵success代表寫入之檔案路徑字串(同fsWriteText)，退回直接覆寫成功時另帶overwritten為true；提供鍵error代表錯誤訊息(輸入無效時為說明字串，其餘為寫檔或rename之Error物件，注入之fs拋出非Error之值時為其字串)
 * @example
 * need test in nodejs.
 *
 * //see fsWriteTextAtomic
 *
 */
function fsWriteTextAtomicCore(fp, c, opt = {}) {
    let st = { fs: null, trace: null, tmp: '', why: '' }
    let res = null

    //work, 全部讀取與操作置於同一try內: 注入之fs可拋錯、opt可不可讀, 於try外即成同步拋錯
    try {
        res = work(fp, c, opt, st)
    }
    catch (err) {
        res = {
            error: toResultError(err), //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }

    //清除尚未取代目標檔之暫存檔(任何失敗路徑), 失敗不拋錯
    if (st.tmp !== '') {
        try {
            st.fs.unlinkSync(st.tmp)
        }
        catch (e) {}
    }

    //done
    if (st.trace) {
        let ok = res.error === undefined
        st.trace('done', { ok, reason: st.why })
    }

    return res
}


export default fsWriteTextAtomicCore
