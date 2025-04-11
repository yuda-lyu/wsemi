// import fs from 'fs'
import get from 'lodash-es/get.js'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲清空資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsCleanFolder
 *
 */
function fsCleanFolderCore(pah, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fs.existsSync(pah)) {

        //fsCreateFolderCore
        let r = fsCreateFolderCore(pah, { fs }) //若不存在則自動建立, 故先執行

        //check
        if (r.error) {
            return r.error
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
    try {
        let entries = fs.readdirSync(pah)
        for (let entry of entries) {
            let curPath = path.join(pah, entry)
            let stat = fs.statSync(curPath)
            if (stat.isDirectory()) {
                fs.rmSync(curPath, { recursive: true, force: true })
            }
            else {
                fs.unlinkSync(curPath)
            }
        }
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + pah
    }
}


export default fsCleanFolderCore
