import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import getPathParent from './getPathParent.mjs'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs建立檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入檔案路徑字串
 * @param {Buffer|TypedArray|DataView|String} [data=''] 輸入檔案內容資料，預設''；未給(undefined)或null視為未給而取預設''；其餘非字串、非Buffer、TypedArray、DataView者(數字、布林、物件、陣列、函數、包裝String等)為無效，回傳error為說明字串'invalid data: must be a string, Buffer, TypedArray or DataView'(不帶輸入值)，於建立上層資料夾與寫檔之前判定
 * @param {Object} [opt={}] 輸入寫入設定物件，只讀取其fs與encoding鍵；非物件(含編碼字串簡寫，如'utf8')不被採用，編碼為預設'utf8'，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、writeFileSync(上層資料夾不存在時另用mkdirSync，用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，回傳error為說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, writeFileSync'(不帶輸入值)
 * @param {String} [opt.encoding='utf8'] 輸入編碼字串，預設'utf8'
 * @param {Integer} [opt.mode=0o666] 目前未實作(給了亦不傳給writeFileSync)，預設0o666
 * @param {String} [opt.flag='w'] 目前未實作(給了亦不傳給writeFileSync)，預設'w'
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑已存在(檔案、資料夾或連結)時error為說明字串'invalid pah: must not already exist'；Node原生錯誤(如ENOENT、EPERM)之訊息帶出路徑，error改為Error物件，其message為固定詞彙加錯誤碼'operation failed (code ENOENT)'(保留其code，不保留path等屬性)；成功訊息'done: <pah>'維持
 * @example
 * need test in nodejs.
 *
 * //see fsCreateFile
 *
 */
function fsCreateFileCore(pah, data = '', opt = {}) {
    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPah = chkFsPath(pah, 'pah')
    if (msgPah) {
        return {
            error: msgPah,
        }
    }

    //check, data須為字串、Buffer、TypedArray或DataView(null視為未給, K3), 先於建立上層資料夾與寫檔(V17), 不回顯輸入值(V20)
    if (data === null) {
        data = ''
    }
    if (typeof data !== 'string' && !ArrayBuffer.isView(data)) {
        return {
            error: 'invalid data: must be a string, Buffer, TypedArray or DataView',
        }
    }

    try {

        //fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let fs = get(opt, 'fs')

        //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷與建立
        let msgDeps = chkFsDeps({ fs }, { fs: ['statSync', 'lstatSync', 'writeFileSync'] })
        if (msgDeps) {
            return {
                error: msgDeps,
            }
        }

        //encoding
        let encoding = get(opt, 'encoding', '')
        if (!isestr(encoding)) {
            encoding = 'utf8'
        }

        //check, 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (fsExistsCore(pah, { fs })) {
            return {
                error: 'invalid pah: must not already exist' //若路徑存在, 可能是資料夾、檔案或符號連結, 則一律視為錯誤(訊息不帶路徑, V20)
            }
        }

        //check
        if (fsIsFileCore(pah, { fs })) {
            return {
                error: 'invalid pah: must not already exist' //若檔案存在則視為錯誤(訊息不帶路徑, V20)
            }
        }

        //fd
        let fd = getPathParent(pah)

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            fsCreateFolderCore(fd, { fs })
        }

        //writeFileSync
        fs.writeFileSync(pah, data, { encoding })

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


export default fsCreateFileCore
