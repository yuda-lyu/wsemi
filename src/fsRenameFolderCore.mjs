// import fs from 'fs'
import get from 'lodash-es/get.js'
import getPathParent from './getPathParent.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs重新命名資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsRenameFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pahOld 輸入資料夾原本路徑字串
 * @param {String} pahNew 輸入資料夾更名路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsRenameFolder
 *
 */
function fsRenameFolderCore(pahOld, pahNew, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFolderCore(pahOld, { fs })) {
        return {
            error: `pahOld[${pahOld}] is not a folder` //pahOld不是資料夾則視為錯誤
        }
    }

    //check
    if (fs.existsSync(pahNew)) {
        return {
            error: `pahNew[${pahNew}] does exist` //pahNew存在則視為錯誤
        }
    }

    //fd
    let fd = getPathParent(pahNew)

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        fsCreateFolderCore(fd, { fs })
    }

    //renameSync
    try {
        fs.renameSync(pahOld, pahNew)
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + pahNew
    }
}


export default fsRenameFolderCore
