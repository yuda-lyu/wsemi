import errToStr from './_errToStr.mjs'
import isRealError from './_isRealError.mjs'
import { fsErrSan } from './_fsErrMsg.mjs'


/**
 * 結果物件之error值正規化且保證不拋錯，內部共用不對外
 *
 * 捕捉之值為Node原生錯誤(真Error帶字串code，如ENOENT、EPERM，判定見_fsErrMsg)者，回傳新建之Error，其message為固定詞彙'operation failed (code ENOENT)'(不含路徑與輸入值，R-FS-ERRMSG-01)，僅保留code(不保留path、dest、syscall、errno、cause，免得經console.log(err)帶出路徑)；其餘真Error(無code，如本套件自建之固定訊息、注入物之TypeError，經_isRealError判定，含跨realm與無原型之Error，同R-CODEC-ERR-01之1)或非空字串原樣回傳；其餘(null、undefined、一般物件、已撤銷之Proxy等)經_errToStr轉字串，仍為空字串者為'unknown error'，故回傳值恆為truthy(R-FS-RESULT-01之5)
 *
 * 使用端: 回傳結果物件之fs函數之catch，如fsWriteJson、fsReadTextCore、fsWriteTextCore、fsCreateFileCore、fsCopyFileCore、fsCopyFolderCore、fsCreateFolderCore、fsDeleteFileCore、fsDeleteFolderCore、fsRenameFileCore、fsRenameFolderCore、fsCleanFolderCore
 *
 * @param {*} err 輸入捕捉之錯誤值
 * @returns {Error|String} 回傳Error物件或非空字串
 */
function toResultError(err) {
    let isErr = false
    try {
        isErr = isRealError(err)
    }
    catch (e) {} //已撤銷之Proxy於instanceof即拋錯, 視為非Error而轉字串
    if (isErr) {
        return fsErrSan(err) //Node原生錯誤(帶code)改固定詞彙加錯誤碼, 其餘真Error原樣
    }
    if (typeof err === 'string' && err !== '') {
        return err
    }
    let s = errToStr(err)
    return s !== '' ? s : 'unknown error'
}


export default toResultError
