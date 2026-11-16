import get from 'lodash-es/get.js'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs判斷是否為檔案或資料夾或符號連結
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsExistsCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串，須為非空字串且不含NUL字元；非字串(含Buffer、Uint8Array、URL、包裝String物件)、空字串、含NUL字元者皆為無效路徑，回傳false(不走到fs，與路徑不存在同為false)
 * @param {Object} opt 輸入設定物件，Core不自行匯入fs，須由呼叫端注入
 * @param {Object} opt.fs 輸入fs物件，須提供statSync；缺漏(未給、null、非物件、缺少statSync)為相依無效，同步拋出Error(訊息為'invalid opt.fs: must be an object providing statSync'，不帶輸入值)，不回傳false(否則存在之路徑會被誤判為不存在)
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * //see fsExists
 *
 */
function fsExistsCore(pah, opt = {}) {

    //check, 路徑須為非空字串(非字串之Buffer、URL等雖為Node之fs所收, 依規格視為無效; R-FS-INVALID-PATH-01), 先於fs檢查, 無效路徑回false
    if (chkFsPath(pah, 'pah') !== null) {
        return false
    }

    //fs
    let fs = get(opt, 'fs')

    //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01): 不可於下方被當成statSync拋錯而回false(存在之路徑會被誤判為不存在)
    let msgDeps = chkFsDeps({ fs }, { fs: ['statSync'] })
    if (msgDeps) {
        throw new Error(msgDeps)
    }

    let b = false
    try {
        fs.statSync(pah)
        b = true
    }
    catch {
        b = false
    }

    return b
}


export default fsExistsCore
