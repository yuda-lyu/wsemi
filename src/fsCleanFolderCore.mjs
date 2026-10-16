import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲清空資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)；資料夾不存在時自動建立；資料夾內之連結(符號連結、junction，含目標已不存在者)只移除連結本身不跟隨；目標本身為連結時不清空並回傳error
 * @example
 * need test in nodejs.
 *
 * //see fsCleanFolder
 *
 */
function fsCleanFolderCore(pah, opt = {}) {
    try {

        //path, fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let path = get(opt, 'path')
        let fs = get(opt, 'fs')

        //check, 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsExistsCore(pah, { fs })) {

            //fsCreateFolderCore
            let r = fsCreateFolderCore(pah, { fs }) //若不存在則自動建立, 故先執行

            //check, 回傳結果物件本身({ error }), 與其他失敗出口一致; fsCreateFolderCore之error恆為truthy
            if (r.error) {
                return r
            }

            return {
                success: 'done: ' + pah
            }
        }

        //check
        if (!fsIsFolderCore(pah, { fs })) {
            return {
                error: 'input path is not a folder' //若存在但又不是資料夾, 則一律視為錯誤
            }
        }

        //刪除資料夾內的全部資料夾與檔案
        let entries = fs.readdirSync(pah)
        for (let entry of entries) {
            let curPath = path.join(pah, entry)

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
        success: 'done: ' + pah
    }
}


export default fsCleanFolderCore
