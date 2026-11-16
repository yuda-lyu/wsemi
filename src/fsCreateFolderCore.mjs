import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs建立資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入資料夾路徑字串
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、mkdirSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，回傳error為說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, mkdirSync'(不帶輸入值)
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * //see fsCreateFolder
 *
 */
function fsCreateFolderCore(pah, opt = {}) {
    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPah = chkFsPath(pah, 'pah')
    if (msgPah) {
        return {
            error: msgPah,
        }
    }

    try {

        //fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let fs = get(opt, 'fs')

        //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷與建立
        let msgDeps = chkFsDeps({ fs }, { fs: ['statSync', 'lstatSync', 'mkdirSync'] })
        if (msgDeps) {
            return {
                error: msgDeps,
            }
        }

        //check, 需先判斷; 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (fsIsFolderCore(pah, { fs })) {
            return {
                success: 'input folder is already exists: ' + pah //若資料夾存在則視為成功, 故需先判斷
            }
        }

        //check
        if (fsExistsCore(pah, { fs })) {
            return {
                error: 'input path already exists: ' + pah //若存在但又不是資料夾, 可能是檔案或符號連結, 則一律視為錯誤
            }
        }

        //mkdirSync
        fs.mkdirSync(pah, { recursive: true }) //不存在則自動建立

    }
    catch (err) {
        return {
            error: toResultError(err) //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }

    return {
        success: 'done: ' + pah
    }
}


export default fsCreateFolderCore
