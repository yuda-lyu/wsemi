//本檔為內部使用, 不由index匯出: 外部執行檔清單(fsEnsureBins)之名稱與相對路徑白名單, 供fsEnsureBinsCore檢核清單與fsGetBinManifestEntry產生清單項共用(單一出處)


//檔名: 英數、底線開頭, 其後英數與._+-, 不以.結尾(Windows會去除結尾之點)
let reName = /^[A-Za-z0-9_](?:[A-Za-z0-9._+-]{0,198}[A-Za-z0-9_+-])?$/

//相對路徑之一段(repo內路徑、壓縮檔內之成員): 同檔名, 惟中間可有空白
let reSeg = /^[A-Za-z0-9_](?:[A-Za-z0-9._+ -]{0,198}[A-Za-z0-9_+-])?$/

//Windows保留裝置名(可帶副檔名)
let reDevice = /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i


/**
 * 是否為清單可用之檔名(原始字串, 不接受包裝物件)
 *
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳布林值
 */
function isBinName(v) {
    return typeof v === 'string' && reName.test(v) && !reDevice.test(v)
}


/**
 * 是否為清單可用之相對路徑: 以/分隔, 每段合檔名規則(中間可有空白)且非保留裝置名, 無空段、.、..、絕對路徑、反斜線(原始字串, 不接受包裝物件)
 *
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳布林值
 */
function isBinRel(v) {
    if (typeof v !== 'string' || v === '' || v.length > 1024) {
        return false
    }
    return v.split('/').every((s) => {
        return reSeg.test(s) && !reDevice.test(s)
    })
}


/**
 * 清單之廠商網址之檢核: 須為https、不得帶帳密、不得為未釘版本之網址(releases/latest、分支), 回傳錯誤說明或''
 *
 * 路徑先整段解碼再比對(含編碼之斜線%2F), 不分大小寫; 分支之判定: GitHub原始檔網址(raw.githubusercontent.com/<o>/<r>/<ref>/、github.com/<o>/<r>/raw|blob/<ref>/)之ref為master、main、HEAD或refs/heads/開頭者; 版本標籤之下載網址(/releases/download/<tag>/)之tag不判定分支(標籤名稱可含refs/heads)
 *
 * @param {*} v 輸入任意值
 * @returns {String} 回傳錯誤說明, 合格為''
 */
function binUrlProblem(v) {
    if (typeof v !== 'string') {
        return 'must be a primitive string'
    }
    let u = null
    try {
        u = new URL(v)
    }
    catch (err) {
        return 'is not a valid url'
    }
    if (u.protocol !== 'https:') {
        return 'must be an https url'
    }
    if (u.username !== '' || u.password !== '') {
        return 'must not contain credentials'
    }
    let p = u.pathname
    try {
        p = decodeURIComponent(p)
    }
    catch (err) {
        return 'has an invalid percent-encoding in its path'
    }
    p = p.toLowerCase()
    if (/\/releases\/latest(\/|$)/.test(p)) {
        return 'must not point to releases/latest, give the url of a release tag'
    }
    let host = u.hostname.toLowerCase()
    let reRef = /^(master|main|head|refs\/heads)\//
    let ref = null
    let m = null
    if (host === 'raw.githubusercontent.com' && (m = p.match(/^\/[^/]+\/[^/]+\/(.+)$/))) {
        ref = m[1]
    }
    else if (host === 'github.com' && (m = p.match(/^\/[^/]+\/[^/]+\/(raw|blob)\/(.+)$/))) {
        ref = m[2]
    }
    if (ref !== null && reRef.test(ref)) {
        return 'must not point to a branch, give the url of a release tag or a commit'
    }
    return ''
}


export { isBinName, isBinRel, binUrlProblem }
