import isobj from './isobj.mjs'
import chkFsPath from './_chkFsPath.mjs'


//本檔為內部使用, 不由index匯出


/**
 * fs列舉家族第2參數(opt)之遷移期檢查，內部共用不對外(單一擁有者，R-LEVEL-LIMIT-02)
 *
 * 適用: fsTreeFolder、fsGetFilesInFolder、fsGetFoldersInFolder、fsGetFilesWithHashInFolder、fsTreeFolderWithHash及其Core共10個函數
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉K3之例外〈原位置參數改為opt之遷移期〉(使用者2026-11-26裁示，第667項，Gitea #220)、V4、V19、V20
 *
 * 第2參數原為levelLimit(純量，預設1層)，改為opt(未給opt.levelLimit即窮舉全部層級)，「未給」之語意與舊預設不同；
 * 該位置給了而不是物件者(含舊寫法之數字)回傳錯誤訊息，由呼叫端依其家族通道報錯(同步拋出Error或reject說明字串)，不依K3視為未給，否則舊呼叫點靜默由1層改為窮舉且無訊息；
 * undefined、null仍視為未給(取預設)，opt內各鍵仍依K3
 *
 * 第3個引數有給(非undefined)者亦回傳錯誤訊息: 舊3參數形(fd, levelLimit, opt)之第2參數為undefined、null時不會被第2參數之檢查攔下，其第3參數(舊opt)將被靜默忽略(如fsTreeFolderWithHash(fd, null, { type }))；
 * 新簽章只有(fd, opt)，第3個引數一律不接受(第667項，Gitea #220)
 *
 * 物件之判定同isobj(內部標籤為[object Object]；陣列、函數、包裝物件、已撤銷之Proxy皆非物件)
 * 路徑無效者先回報路徑(R-FS-INVALID-PATH-01之順序: 路徑先於opt與注入相依)；第2參數非物件先於第3個引數之檢查
 *
 * @param {*} fd 輸入第1參數(資料夾路徑)
 * @param {*} opt 輸入第2參數
 * @param {*} [extra] 輸入第3個引數(呼叫端以arguments[2]取得，未給為undefined)
 * @returns {String|null} 回傳錯誤訊息字串(不帶輸入值)，opt為物件或未給且無第3個引數時回傳null
 */
function chkFsLevelOpt(fd, opt, extra) {

    //第2參數給了而非物件(舊寫法之levelLimit數字等)
    if (!(opt === undefined || opt === null || isobj(opt))) {
        return chkFsPath(fd, 'fd') || 'invalid opt: must be an object'
    }

    //第3個引數有給(舊3參數形之opt會被靜默忽略, 如fsTreeFolderWithHash(fd, null, { type }))
    if (extra !== undefined) {
        return chkFsPath(fd, 'fd') || 'invalid arguments: must be fd and opt only'
    }

    return null
}


export default chkFsLevelOpt
