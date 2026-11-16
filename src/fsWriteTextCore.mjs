// import fs from 'fs'
import get from 'lodash-es/get.js'
import getPathParent from './getPathParent.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs寫入utf-8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteTextCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @param {String} c 輸入檔案內容utf-8字串，必須為字串(空字串為有效內容)；非字串(含Buffer、TypedArray、undefined、null、數字、物件等)為無效，回傳error為說明字串'invalid c: must be a string'(不帶輸入值)，於建立上層資料夾與寫檔之前判定(同fsWriteTextAtomicCore)
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、writeFileSync(上層資料夾不存在時另用mkdirSync，用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，回傳error為說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, writeFileSync'(不帶輸入值)
 * @returns {Object} 回傳結果物件，提供鍵success代表寫入之檔案路徑字串，提供鍵error代表錯誤訊息(寫檔或檢查上層資料夾之Error物件，注入之fs拋出非Error之值時為其字串)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * //see fsWriteText
 *
 */
function fsWriteTextCore(fp, c, opt = {}) {
    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFp = chkFsPath(fp, 'fp')
    if (msgFp) {
        return {
            error: msgFp,
        }
    }

    //check, c須為字串, 先於建立上層資料夾與寫檔(V17), 不回顯輸入值(V20)
    if (typeof c !== 'string') {
        return {
            error: 'invalid c: must be a string',
        }
    }

    let bErr = false //是否出錯以布林旗標判定, 不以errTemp是否為null判定(注入之fs可拋出null)
    let errTemp = null

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

        //fd
        let fd = getPathParent(fp)

        //check, 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsIsFolderCore(fd, { fs })) {
            fsCreateFolderCore(fd, { fs })
        }

        //writeFileSync
        fs.writeFileSync(fp, c, 'utf8')

    }
    catch (err) {
        // console.log(err)
        bErr = true
        errTemp = err
    }

    if (bErr) {
        return {
            error: toResultError(errTemp), //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }
    return {
        success: fp,
    }
}


export default fsWriteTextCore
