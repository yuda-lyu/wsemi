import get from 'lodash-es/get.js'
import fsExistsCore from './fsExistsCore.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs判斷是否為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入路徑字串，須為非空字串且不含NUL字元；非字串(含Buffer、Uint8Array、URL、包裝String物件)、空字串、含NUL字元者皆為無效路徑，回傳false(不走到fs，與路徑不存在同為false)
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync、lstatSync；缺漏(未給、null、非物件、缺少必要方法)為相依無效，同步拋出Error(訊息為'invalid opt.fs: must be an object providing statSync, lstatSync'，不帶輸入值)，不回傳false
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * //see fsIsFile
 *
 */
function fsIsFileCore(fp, opt = {}) {

    //check, 無效路徑回false(R-FS-INVALID-PATH-01), 先於fs檢查
    if (chkFsPath(fp, 'fp') !== null) {
        return false
    }

    //fs
    let fs = get(opt, 'fs')

    //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01), 同步拋出Error
    let msgDeps = chkFsDeps({ fs }, { fs: ['statSync', 'lstatSync'] })
    if (msgDeps) {
        throw new Error(msgDeps)
    }

    //check
    if (!fsExistsCore(fp, { fs })) {
        return false
    }

    //check
    if (fs.lstatSync(fp).isDirectory()) {
        return false
    }
    if (fs.lstatSync(fp).isSymbolicLink()) {
        return false
    }

    return true
}


export default fsIsFileCore
