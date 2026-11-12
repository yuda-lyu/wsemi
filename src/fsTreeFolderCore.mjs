import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import optVal from './_optVal.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import chkFsPath from './_chkFsPath.mjs'


//levelLimit: 列舉層數(iseint, use: 'count', min: 1), 非預期改用預設1; null為無窮遍歷不經本規則
let RULE_LEVEL_LIMIT = { fn: 'fsTreeFolderCore', name: 'levelLimit', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，Infinity不視為無窮遍歷(無窮遍歷請設定null)，預設1
 * @returns {Array} 回傳列舉檔案或資料夾陣列，若fd不是資料夾則同步拋出Error(訊息為'fd[...] is not a folder')，列舉時讀取資料夾失敗(如無讀取權限之EPERM)亦同步拋出其Error，路徑參數須為非空字串且不含NUL字元，無效時同步拋出Error(訊息如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsTreeFolder
 *
 */
function fsTreeFolderCore(fd, levelLimit = 1, opt = {}) {
    let level = 1

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

    //levelLimit, opt類數值參數(JSDoc [levelLimit=1])以iseint判定(帳本G17、R-OPT-VAL-01): null為無窮遍歷(保留); 其餘須為有效整數且為個數並大於等於1, 有效則取Number(v), 非預期(含0、負數、小數、Infinity、'0x10'、包裝物件)視為未給、改用預設1
    //debug警告: 來源為內部呼叫端轉交之opt.optDbg(有opt物件之對外函數如fsTreeFolderWithHash之opt), 未轉交者為本函數之opt; 只在非預期時讀一次debug(V11)
    if (levelLimit !== null) {
        let optDbg = get(opt, 'optDbg')
        levelLimit = optVal(levelLimit, 1, RULE_LEVEL_LIMIT, optDbg !== undefined ? optDbg : opt)
    }

    //tree
    function tree(fd) {
        let rs = []

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            return rs
        }

        //readdirSync
        let items = fs.readdirSync(fd)

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
                if (level <= levelLimit || levelLimit === null) {
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
