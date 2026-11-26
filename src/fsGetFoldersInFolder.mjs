import get from 'lodash-es/get.js'
import path from 'path'
import fs from 'fs'
import fsGetFoldersInFolderCore from './fsGetFoldersInFolderCore.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFoldersInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)同步拋出Error(訊息為'invalid opt: must be an object'，不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦同步拋出Error(訊息為'invalid arguments: must be fd and opt only')；fs、path固定使用Node內建(opt.fs、opt.path不採用)
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Array} 回傳列舉資料夾陣列，若fd不是資料夾則同步拋出Error(訊息為'invalid fd: must be an existing folder'，不帶輸入值)，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出其Error，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let t = '_test_fsGetFoldersInFolder'
 *     let fdt = './_test_fsGetFoldersInFolder'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let ftpath = (v) => {
 *         // console.log(v, 'v.path', v.path)
 *         let ss = _.split(v.path, t)
 *         // console.log('ss', ss)
 *         let p = ss[1]
 *         p = p.replaceAll('\\', '/')
 *         p = `.${p}`
 *         // console.log('p', p)
 *         v.path = p
 *         return v
 *     }
 *
 *     let ftpaths = (vs) => {
 *         return _.map(_.cloneDeep(vs), ftpath)
 *     }
 *
 *     fsWriteText(`${fdt}/z1.txt`, 'z1')
 *     fsWriteText(`${fdt}/abc/z2.txt`, 'z2')
 *     fsWriteText(`${fdt}/def/ijk/z3.txt`, 'z3')
 *     fsCreateFolder(`${fdt}/mno/pqr`)
 *
 *     let r1 = fsGetFoldersInFolder(fdt, { levelLimit: 1 })
 *     console.log('fsGetFoldersInFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsGetFoldersInFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = fsGetFoldersInFolder(fdt)
 *     console.log('fsGetFoldersInFolder(levelLimit=unset)', ftpaths(rall))
 *     ms.push({ 'fsGetFoldersInFolder(evelLimit=unset)': ftpaths(rall) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms))
 *     return ms
 * }
 * test()
 * // fsGetFoldersInFolder(levelLimit=1) [
 * //   { level: 1, path: './abc', name: 'abc' },
 * //   { level: 1, path: './def', name: 'def' },
 * //   { level: 1, path: './mno', name: 'mno' }
 * // ]
 * // fsGetFoldersInFolder(levelLimit=unset) [
 * //   { level: 1, path: './abc', name: 'abc' },
 * //   { level: 1, path: './def', name: 'def' },
 * //   { level: 2, path: './def/ijk', name: 'ijk' },
 * //   { level: 1, path: './mno', name: 'mno' },
 * //   { level: 2, path: './mno/pqr', name: 'pqr' }
 * // ]
 * // ms [{"fsGetFoldersInFolder(evelLimit=1)":[{"level":1,"path":"./abc","name":"abc"},{"level":1,"path":"./def","name":"def"},{"level":1,"path":"./mno","name":"mno"}]},{"fsGetFoldersInFolder(evelLimit=unset)":[{"level":1,"path":"./abc","name":"abc"},{"level":1,"path":"./def","name":"def"},{"level":2,"path":"./def/ijk","name":"ijk"},{"level":1,"path":"./mno","name":"mno"},{"level":2,"path":"./mno/pqr","name":"pqr"}]}]
 *
 */
function fsGetFoldersInFolder(fd, opt = {}) {

    //check, 第2參數非物件(舊寫法之levelLimit數字等)或第3個引數有給即同步拋出Error(R-LEVEL-LIMIT-02), fd無效者先報fd
    let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
    if (msgOpt) {
        throw new Error(msgOpt)
    }

    //以Node內建之fs、path注入(不採用呼叫端之opt.fs、opt.path); 只讀opt.levelLimit一次, opt本身轉交為optDbg(debug、funLog由fsTreeFolderCore於levelLimit非預期時才讀, V11)
    return fsGetFoldersInFolderCore(fd, { path, fs, levelLimit: get(opt, 'levelLimit'), optDbg: opt })
}


export default fsGetFoldersInFolder
