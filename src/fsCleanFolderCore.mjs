import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲清空資料夾路徑字串
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs、path，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、readdirSync、rmSync、unlinkSync(逐項刪除，缺其一會使先刪之項目已消失而後項失敗，故先於刪除齊備；資料夾不存在時另用mkdirSync，用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，回傳error為說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, readdirSync, rmSync, unlinkSync'(不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供join；缺漏同opt.fs，回傳error為說明字串'invalid opt.path: must be an object providing join'
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)；資料夾不存在時自動建立；資料夾內之連結(符號連結、junction，含目標已不存在者)只移除連結本身不跟隨；目標本身為連結時不清空並回傳error，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * //see fsCleanFolder
 *
 */
function fsCleanFolderCore(fd, opt = {}) {
    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPath = chkFsPath(fd, 'fd')
    if (msgPath) {
        return {
            error: msgPath,
        }
    }

    try {

        //path, fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let path = get(opt, 'path')
        let fs = get(opt, 'fs')

        //check, 注入之fs、path缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷與建立
        let msgDeps = chkFsDeps({ fs, path }, { fs: ['statSync', 'lstatSync', 'readdirSync', 'rmSync', 'unlinkSync'], path: ['join'] })
        if (msgDeps) {
            return {
                error: msgDeps,
            }
        }

        //check, 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsExistsCore(fd, { fs })) {

            //fsCreateFolderCore
            let r = fsCreateFolderCore(fd, { fs }) //若不存在則自動建立, 故先執行

            //check, 回傳結果物件本身({ error }), 與其他失敗出口一致; fsCreateFolderCore之error恆為truthy
            if (r.error) {
                return r
            }

            return {
                success: 'done: ' + fd
            }
        }

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            return {
                error: 'invalid fd: must be a folder or not exist' //若存在但又不是資料夾, 則一律視為錯誤
            }
        }

        //刪除資料夾內的全部資料夾與檔案
        let entries = fs.readdirSync(fd)
        for (let entry of entries) {
            let curPath = path.join(fd, entry)

            //以lstatSync判型別(不跟隨連結): 資料夾以rmSync遞迴刪除, 檔案與連結(符號連結、junction, 含目標已不存在之懸空連結)以unlinkSync只移除本身
            //  原以statSync判型別, statSync會跟隨連結, 懸空連結即拋ENOENT而中止清空, 其後之項目亦未刪
            //  檔案不改用rmSync: Windows下rmSync之錯誤訊息帶\\?\前綴且非ASCII路徑成亂碼(如檔案被占用之EPERM), unlinkSync之訊息正常
            let st = fs.lstatSync(curPath)
            if (st.isDirectory()) {
                fs.rmSync(curPath, { recursive: true, force: true })
            }
            else {
                fs.unlinkSync(curPath)
            }

        }

    }
    catch (err) {
        return {
            error: toResultError(err) //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }

    return {
        success: 'done: ' + fd
    }
}


export default fsCleanFolderCore
