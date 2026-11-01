import get from 'lodash-es/get.js'
import getPathParent from './getPathParent.mjs'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'


/**
 * 後端nodejs重新命名檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsRenameFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pahOld 輸入檔案原本路徑字串
 * @param {String} pahNew 輸入檔案更名路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * //see fsRenameFile
 *
 */
function fsRenameFileCore(pahOld, pahNew, opt = {}) {
    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPah = chkFsPath(pahOld, 'pahOld') || chkFsPath(pahNew, 'pahNew')
    if (msgPah) {
        return {
            error: msgPah,
        }
    }

    try {

        //fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let fs = get(opt, 'fs')

        //check, 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsIsFileCore(pahOld, { fs })) {
            return {
                error: `pahOld[${pahOld}] is not a file` //pahOld不是檔案則視為錯誤
            }
        }

        //check
        if (fsExistsCore(pahNew, { fs })) {
            return {
                error: `pahNew[${pahNew}] already exists` //pahNew存在則視為錯誤
            }
        }

        //fd
        let fd = getPathParent(pahNew)

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            fsCreateFolderCore(fd, { fs })
        }

        //renameSync
        fs.renameSync(pahOld, pahNew)

    }
    catch (err) {
        return {
            error: toResultError(err) //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }

    return {
        success: 'done: ' + pahNew
    }
}


export default fsRenameFileCore
