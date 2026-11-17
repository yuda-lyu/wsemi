//fsErrExpect.mjs: fs系函數之原生錯誤固定詞彙(R-FS-ERRMSG-01, W-23)之測試期望值算法, 單一定義供各測試與執行器共用
//  獨立於src(不import src/_fsErrMsg.mjs), 依契約自行算出期望值, 免得實作與期望同源而斷言空轉
//  原生錯誤: 真Error且code為字串(/^[A-Za-z0-9_]{1,64}$/)而不以E_起頭(ENOENT、EPERM、EBUSY、EISDIR、ERR_INVALID_ARG_TYPE等); 無code之Error與非Error值不屬之


//expectErrCode, 取原生錯誤之code, 非原生錯誤(含本套件自建E_起頭者)回傳null
function expectErrCode(err) {
    try {
        if (err instanceof Error || Object.prototype.toString.call(err) === '[object Error]') { //含跨realm之Error
            let c = err.code
            if (typeof c === 'string' && /^[A-Za-z0-9_]{1,64}$/.test(c) && !c.startsWith('E_')) {
                return c
            }
        }
    }
    catch (e) {}
    return null
}


//expectRejectStr, 字串reject家族(fsDeleteFileSafe/FolderSafe等)之期望reject值: 原生錯誤為'operation failed (code <CODE>)'(不含'Error: '前綴與路徑), 其餘(無code之Error、非Error值)為String(err)
function expectRejectStr(err) {
    let c = expectErrCode(err)
    if (c !== null) {
        return `operation failed (code ${c})`
    }
    return String(err)
}


export { expectErrCode, expectRejectStr }
