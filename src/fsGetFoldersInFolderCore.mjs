import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFoldersInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs、path，須由呼叫端注入；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)同步拋出Error(訊息為'invalid opt: must be an object'，不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦同步拋出Error(訊息為'invalid arguments: must be fd and opt only')
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、readdirSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，同步拋出Error(訊息為'invalid opt.fs: must be an object providing …'，不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，同步拋出Error(訊息為'invalid opt.path: must be an object providing resolve, basename')
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Array} 回傳列舉資料夾陣列，若fd不是資料夾則同步拋出Error(訊息為'invalid fd: must be an existing folder'，不帶輸入值)，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出Error，其訊息為固定詞彙加錯誤碼'operation failed (code EPERM)'(原生錯誤之訊息帶出路徑，不回傳原文；保留其code)，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsGetFoldersInFolder
 *
 */
function fsGetFoldersInFolderCore(fd, opt = {}) {

    //check, 第2參數之遷移期檢查(R-LEVEL-LIMIT-02): 給了而非物件(舊寫法之levelLimit數字等)即同步拋出Error, fd無效者先報fd, 先於讀取opt之鍵
    let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
    if (msgOpt) {
        throw new Error(msgOpt)
    }

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
        throw new Error('invalid fd: must be an existing folder')
    }

    //fps
    let fps = []
    let optDbg = get(opt, 'optDbg') //內部呼叫端轉交之debug、funLog來源, 未轉交者為本函數之opt; 再轉交fsTreeFolderCore供opt.levelLimit非預期時才讀(V11)
    fps = fsTreeFolderCore(fd, { path, fs, levelLimit: get(opt, 'levelLimit'), optDbg: optDbg !== undefined ? optDbg : opt }) //opt.levelLimit之判定由fsTreeFolderCore單一擁有
    fps = filter(fps, { isFolder: true })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFoldersInFolderCore
