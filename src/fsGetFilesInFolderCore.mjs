import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import chkFsPath from './_chkFsPath.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，Infinity不視為無窮遍歷(無窮遍歷請設定null)，預設1
 * @returns {Array} 回傳列舉檔案陣列，若fd不是資料夾則同步拋出Error(訊息為'fd[...] is not a folder')，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出其Error，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsGetFilesInFolder
 *
 */
function fsGetFilesInFolderCore(fd, levelLimit = 1, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFd = chkFsPath(fd, 'fd')
    if (msgFd) {
        throw new Error(msgFd)
    }

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = []
    let optDbg = get(opt, 'optDbg') //內部呼叫端轉交之debug、funLog來源, 再轉交fsTreeFolderCore供levelLimit非預期時才讀(未轉交者為undefined, 不警告)
    fps = fsTreeFolderCore(fd, levelLimit, { path, fs, optDbg })
    fps = filter(fps, { isFolder: false })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFilesInFolderCore
