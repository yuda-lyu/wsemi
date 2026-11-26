import each from 'lodash-es/each.js'
import optVal from './_optVal.mjs'
import pickOpt from './_pickOpt.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'
import { fsErrSan } from './_fsErrMsg.mjs'


//opt.levelLimit: 列舉層數(iseint, use: 'count', min: 1, 上限4294967295)有效才限定層數, 未給或非預期(含null、0、負數、小數、Infinity)改用預設null(不限層數, 窮舉全部)
let RULE_LEVEL_LIMIT = { fn: 'fsTreeFolderCore', name: 'opt.levelLimit', kind: 'eint', chk: { use: 'count', min: 1 }, defDesc: 'null (no limit)' }


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs、path，須由呼叫端注入；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)同步拋出Error(訊息為'invalid opt: must be an object'，不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦同步拋出Error(訊息為'invalid arguments: must be fd and opt only')
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync、readdirSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，同步拋出Error(訊息為'invalid opt.fs: must be an object providing …'，不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，同步拋出Error(訊息為'invalid opt.path: must be an object providing resolve, basename')
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件，以及讀取拋錯之存取器或Proxy陷阱)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Array} 回傳列舉檔案或資料夾陣列，若fd不是資料夾則同步拋出Error(訊息為'invalid fd: must be an existing folder'，不帶輸入值)，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出Error，其訊息為固定詞彙加錯誤碼'operation failed (code EPERM)'(原生錯誤之訊息帶出路徑，不回傳原文；保留其code)，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsTreeFolder
 *
 */
function fsTreeFolderCore(fd, opt = {}) {
    let level = 1

    //check, 第2參數之遷移期檢查(R-LEVEL-LIMIT-02): 給了而非物件(舊寫法之levelLimit數字等)即同步拋出Error, fd無效者先報fd, 先於讀取opt之鍵
    let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
    if (msgOpt) {
        throw new Error(msgOpt)
    }

    //path, fs, 讀取拋錯(存取器、陷阱拋錯)視為未給(K3; 第663項), 缺漏者由下方相依檢查fail-closed(固定訊息, 不轉出呼叫端所拋之文字)
    let optDep = pickOpt(opt, ['path', 'fs'], [])
    let path = optDep.path
    let fs = optDep.fs

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFd = chkFsPath(fd, 'fd')
    if (msgFd) {
        throw new Error(msgFd)
    }

    //check, 注入之fs、path缺漏為相依無效(R-FS-DEPS-01), 同步拋出Error
    let msgDeps = chkFsDeps({ fs, path }, { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'] })
    if (msgDeps) {
        throw new Error(msgDeps)
    }

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error('invalid fd: must be an existing folder')
    }

    //levelLimit, opt.levelLimit以iseint判定(帳本G17、R-OPT-VAL-01、R-LEVEL-LIMIT-02): 須為有效整數且為個數並大於等於1, 有效則取Number(v)而限定層數, 未給或非預期(含null、0、負數、小數、Infinity、'0x10'、包裝物件)視為未給、改用預設null(不限層數, 窮舉全部; K3)
    //debug警告: 來源為內部呼叫端轉交之opt.optDbg(對外函數之opt), 未轉交者為本函數之opt; 只在非預期時讀一次debug(V11)
    //optDbg、levelLimit讀取拋錯(存取器、陷阱拋錯)視為未給(K3; 第663項)
    let optLv = pickOpt(opt, ['optDbg', 'levelLimit'], [])
    let optDbg = optLv.optDbg
    let levelLimit = optVal(optLv.levelLimit, null, RULE_LEVEL_LIMIT, optDbg !== undefined ? optDbg : opt)

    //tree
    function tree(fd) {
        let rs = []

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            return rs
        }

        //readdirSync, 原生錯誤(EPERM等)之訊息帶出路徑, 改拋固定詞彙加錯誤碼之Error(R-FS-ERRMSG-01)
        let items = null
        try {
            items = fs.readdirSync(fd)
        }
        catch (err) {
            throw fsErrSan(err)
        }

        //each
        each(items, function(item) {

            //fp
            let fp = path.resolve(fd, item)

            //stat
            let stat = null
            try {
                stat = fs.statSync(fp)
            }
            catch (err) {}

            //proc
            if (stat && stat.isDirectory()) {

                //push
                rs.push({
                    isFolder: true,
                    level,
                    path: fp,
                    name: path.basename(fp),
                })

                //tree
                level += 1
                if (levelLimit === null || level <= levelLimit) {
                    rs = rs.concat(tree(fp))
                }

                level -= 1

            }
            else {

                //push
                rs.push({
                    isFolder: false,
                    level,
                    path: fp,
                    name: path.basename(fp),
                })

            }

        })

        return rs
    }

    return tree(fd)
}


export default fsTreeFolderCore
