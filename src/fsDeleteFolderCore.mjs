import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import toResultError from './_toResultError.mjs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFolder
 *
 */
function fsDeleteFolderCore(pah, opt = {}) {
    try {

        //fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let fs = get(opt, 'fs')

        //check, 需先判斷; 前置檢查置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsExistsCore(pah, { fs })) {
            return {
                success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
            }
        }

        //check
        if (!fsIsFolderCore(pah, { fs })) {
            return {
                error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
            }
        }

        //刪除資料夾內的全部資料夾與檔案
        fs.rmSync(pah, { recursive: true, force: true })

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


export default fsDeleteFolderCore
