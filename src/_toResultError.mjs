import errToStr from './_errToStr.mjs'
import isRealError from './_isRealError.mjs'


/**
 * 結果物件之error值正規化且保證不拋錯，內部共用不對外
 *
 * 捕捉之值為Error物件(真Error，經_isRealError判定，含跨realm與無原型之Error，同R-CODEC-ERR-01之1)或非空字串者原樣回傳；其餘(null、undefined、一般物件、已撤銷之Proxy等)經_errToStr轉字串，仍為空字串者為'unknown error'，故回傳值恆為truthy(R-FS-RESULT-01之5)
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
        return err
    }
    if (typeof err === 'string' && err !== '') {
        return err
    }
    let s = errToStr(err)
    return s !== '' ? s : 'unknown error'
}


export default toResultError
