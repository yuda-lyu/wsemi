//本檔為內部使用, 不由index匯出: 判斷路徑是否嚴格位於資料夾內, 供fsSyncFolderCore之落點核對(R-FS-SYNC-PATH-01)


/**
 * 路徑是否嚴格位於資料夾內(不含資料夾本身)
 *
 * 以注入之path.relative自root起算: 結果為空字串(同一路徑)、'..'、以'..'加path.sep起首(上層或他處)，或為絕對路徑(Windows之另一磁碟機、UNC)皆為否；僅名稱以'..'起首者('..a'、'...')仍在其內
 * relative回傳非字串、isAbsolute回傳非false者無法證明在其內，回false(預設拒絕)
 *
 * @param {String} root 輸入資料夾之絕對路徑
 * @param {String} fp 輸入目標之絕對路徑
 * @param {Object} opt 輸入設定物件
 * @param {Object} opt.path 輸入path物件，須提供relative、isAbsolute與非空字串sep
 * @returns {Boolean} 回傳布林值
 */
function isPathInside(root, fp, { path }) {
    let rel = path.relative(root, fp)
    if (typeof rel !== 'string' || rel === '' || rel === '..' || rel.startsWith(`..${path.sep}`)) {
        return false
    }
    return path.isAbsolute(rel) === false
}


export default isPathInside
