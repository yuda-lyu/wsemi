import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFoldersInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，null與Infinity皆不視為無窮遍歷(無窮遍歷請給大有限值，如4294967295)，預設1
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs、path，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、readdirSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，同步拋出Error(訊息為'invalid opt.fs: must be an object providing …'，不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，同步拋出Error(訊息為'invalid opt.path: must be an object providing resolve, basename')
 * @returns {Array} 回傳列舉資料夾陣列，若fd不是資料夾則同步拋出Error(訊息為'fd[...] is not a folder')，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出其Error，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsGetFoldersInFolder
 *
 */
function fsGetFoldersInFolderCore(fd, levelLimit = 1, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFd = chkFsPath(fd, 'fd')
    if (msgFd) {
        throw new Error(msgFd)
    }

    //check, 注入之fs、path缺漏為相依無效(R-FS-DEPS-01), 先於「是否為資料夾」之判斷, 同步拋出Error(與fsTreeFolderCore同一清單)
    let msgDeps = chkFsDeps({ fs, path }, { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'] })
    if (msgDeps) {
        throw new Error(msgDeps)
    }

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = []
    fps = fsTreeFolderCore(fd, levelLimit, { path, fs })
    fps = filter(fps, { isFolder: true })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFoldersInFolderCore
