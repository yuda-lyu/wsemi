import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、unlinkSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，回傳error為說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, unlinkSync'(不帶輸入值)，不回傳success
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑存在但不是檔案時error為說明字串'invalid pah: must be a file or not exist'；Node原生錯誤(如EPERM、EBUSY)之訊息帶出路徑，error改為Error物件，其message為固定詞彙加錯誤碼'operation failed (code EPERM)'(保留其code，不保留path等屬性)；成功訊息('done: <pah>'、目標不存在之'file does not exist: <pah>')維持
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFile
 *
 */
function fsDeleteFileCore(pah, opt = {}) {
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

        //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷: 否則fsExistsCore無法呼叫statSync而誤判不存在, 對存在之檔回傳「不存在」之假成功
        let msgDeps = chkFsDeps({ fs }, { fs: ['statSync', 'lstatSync', 'unlinkSync'] })
        if (msgDeps) {
            return {
                error: msgDeps,
            }
        }

        //check, 需先判斷; 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsExistsCore(pah, { fs })) {
            return {
                success: 'file does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
            }
        }

        //check
        if (!fsIsFileCore(pah, { fs })) {
            return {
                error: 'invalid pah: must be a file or not exist' //若存在但又不是檔案, 則視為錯誤(訊息不帶路徑, V20)
            }
        }

        //unlinkSync
        fs.unlinkSync(pah)

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


export default fsDeleteFileCore
