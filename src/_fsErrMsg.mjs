import isRealError from './_isRealError.mjs'
import errToStr from './_errToStr.mjs'


//固定詞彙, 不含路徑、網址與輸入值
let FIXED = 'operation failed'


/**
 * 取錯誤值之錯誤碼，內部共用不對外(R-FS-ERRMSG-01)
 *
 * 真Error(經_isRealError，含跨realm)且其code為字串(僅英數字與底線，長度1至64，如'ENOENT'、'EPERM'、'ERR_INVALID_ARG_TYPE')時回傳該code，其餘(非Error、無code、code非字串或含其他字元、以E_起頭者即本套件自建錯誤之code如E_ARG、讀取code時拋錯)回傳null；不拋錯
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {String|null} 回傳錯誤碼或null
 */
function fsErrCode(err) {
    try {
        if (!isRealError(err)) {
            return null
        }
        let c = err.code
        if (typeof c === 'string' && /^[A-Za-z0-9_]{1,64}$/.test(c) && !c.startsWith('E_')) { //本套件自建錯誤之code(如E_ARG、E_FS)以E_起頭, 其message已不含路徑與輸入值, 非Node原生錯誤, 不取代
            return c
        }
    }
    catch (e) {}
    return null
}


/**
 * 錯誤值轉不含路徑與輸入值之說明字串且保證不拋錯，內部共用不對外(R-FS-ERRMSG-01，W-23)
 *
 * Node原生錯誤(帶code之真Error，如ENOENT、EPERM、EBUSY、ERR_INVALID_ARG_TYPE)之訊息會帶出路徑或輸入值，改回固定詞彙加錯誤碼'operation failed (code ENOENT)'；無code者(本套件自建之固定訊息Error、注入物之TypeError等)與非Error之值依_errToStr原樣
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {String} 回傳說明字串
 */
function fsErrMsg(err) {
    let c = fsErrCode(err)
    if (c !== null) {
        return `${FIXED} (code ${c})`
    }
    return errToStr(err)
}


/**
 * 錯誤值去除路徑與輸入值，內部共用不對外(R-FS-ERRMSG-01，W-23)
 *
 * Node原生錯誤(帶code之真Error)回傳新建之Error，其message為固定詞彙加錯誤碼'operation failed (code ENOENT)'，僅保留code(不保留path、dest、syscall、errno、cause，免得經console.log(err)帶出路徑)；其餘之值(無code之Error、非Error)原樣回傳；不拋錯。供同步拋出Error之fs函數(fsTreeFolderCore等)與結果物件之error使用
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {*} 回傳去除路徑後之錯誤值
 */
function fsErrSan(err) {
    let c = fsErrCode(err)
    if (c !== null) {
        let e = new Error(`${FIXED} (code ${c})`)
        e.code = c
        return e
    }
    return err
}


/**
 * 網路請求與串流之錯誤轉不含路徑、網址與輸入值之說明字串且保證不拋錯，內部共用不對外(R-FS-ERRMSG-01，W-23)
 *
 * 帶code之真Error同fsErrMsg(固定詞彙加錯誤碼)；無code者取其字串(如undici之'TypeError: fetch failed'、'TypeError: terminated'，其原因之訊息帶出主機與埠，不取)，原因(cause)帶code者附於其後(如'TypeError: fetch failed (code ECONNREFUSED)')；SyntaxError(JSON.parse等之解析錯誤，其message帶出被解析文字之片段)改固定詞彙'SyntaxError: invalid syntax'
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {String} 回傳說明字串
 */
function fsErrMsgNet(err) {
    let c = fsErrCode(err)
    if (c !== null) {
        return `${FIXED} (code ${c})`
    }
    let isSyn = false
    try {
        isSyn = isRealError(err) && err.name === 'SyntaxError'
    }
    catch (e) {}
    let s = isSyn ? 'SyntaxError: invalid syntax' : errToStr(err)
    try {
        let cc = fsErrCode(err.cause)
        if (cc !== null) {
            s += ` (code ${cc})`
        }
    }
    catch (e) {}
    return s
}


/**
 * 取可附於錯誤物件cause之不含路徑、網址與輸入值之錯誤，內部共用不對外(R-FS-ERRMSG-01，W-23)
 *
 * 原錯誤(Node原生錯誤、網路錯誤)之message、path、dest、input等屬性帶出路徑與網址，cause原樣附上則經console.log(err)或讀取err.cause.message即外洩；改附新建之Error，其message為fsErrMsgNet之固定詞彙，保留code(不保留其餘屬性與cause鏈)；不拋錯
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {Error} 回傳新建之Error
 */
function fsErrCause(err) {
    let e = new Error(fsErrMsgNet(err))
    let c = fsErrCode(err)
    if (c !== null) {
        e.code = c
    }
    return e
}


export { fsErrCode, fsErrSan, fsErrMsgNet, fsErrCause }
export default fsErrMsg
