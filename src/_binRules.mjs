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


//提交雜湊(40碼小寫十六進位)
let reCommit = /^[0-9a-f]{40}$/


/**
 * 清單之網址(廠商檔、分割檔、壓縮檔之url)之檢核(規格M2、F15之網址釘選判定): 只接受兩種已釘選之形式, 回傳錯誤說明或''
 *
 * ①GitHub版本標籤之資產網址 https://github.com/<owner>/<repo>/releases/download/<tag>/<檔>(恰此6段; tag可含編碼之斜線); ②GitHub原始檔網址且ref為40碼小寫提交: https://raw.githubusercontent.com/<owner>/<repo>/<commit>/<path>或https://github.com/<owner>/<repo>/raw/<commit>/<path>。
 * 須為https、不得帶帳密、不得有查詢字串、片段或埠號(以原始字串判定, 含空之?、#與預設埠:443)、反斜線與空白; 各段不得為空, 各段解碼後owner、repo、檔名與原始檔路徑之各段不得含斜線或反斜線; 其他主機、releases/latest、分支或標籤之原始檔網址(含master、main、HEAD、refs/heads/…與其他分支名)、blob頁面皆拒收(分支名無法自網址與標籤區分, 故原始檔一律須為提交)
 *
 * @param {*} v 輸入任意值
 * @returns {String} 回傳錯誤說明, 合格為''
 */
function binUrlProblem(v) {
    if (typeof v !== 'string') {
        return 'must be a primitive string'
    }
    //形式以原始字串判定(URL解析會補斜線、把反斜線當成斜線、把空之?與#與預設埠:443正規化掉): 須以https://開頭(scheme不分大小寫), 不得有查詢字串、片段、反斜線、空白、帳密、埠號
    if (!/^https:\/\//i.test(v)) {
        return 'must be an https url (starting with https://)'
    }
    if (/[?#]/.test(v)) {
        return 'must not have a query or fragment'
    }
    if (/[\\\s]/.test(v)) {
        return 'must not have backslashes or whitespace'
    }
    let auth = v.slice('https://'.length).split('/')[0]
    if (auth.includes('@')) {
        return 'must not contain credentials'
    }
    if (auth.includes(':')) {
        return 'must not have a port'
    }
    let u = null
    try {
        u = new URL(v)
    }
    catch (err) {
        return 'is not a valid url'
    }
    let segs = u.pathname.split('/').slice(1)
    let dec = []
    for (let s of segs) {
        try {
            dec.push(decodeURIComponent(s))
        }
        catch (err) {
            return 'has an invalid percent-encoding in its path'
        }
    }
    let plain = (i) => {
        //owner、repo、檔名等段: 非空且解碼後不含斜線、反斜線
        return dec[i] !== undefined && dec[i] !== '' && !/[/\\]/.test(dec[i])
    }
    let restOk = (i) => {
        //原始檔之路徑(第i段起): 至少一段且各段非空、解碼後不含斜線與反斜線(檢查之段即請求之段)
        for (let k = i; k < dec.length; k++) {
            if (!plain(k)) {
                return false
            }
        }
        return dec.length > i
    }
    let need = 'must be a GitHub release asset url (https://github.com/<owner>/<repo>/releases/download/<tag>/<file>) or a GitHub raw file url at a 40-character commit (https://raw.githubusercontent.com/<owner>/<repo>/<commit>/<path>), so that it does not change; releases/latest, branches and other hosts are not accepted'
    let host = u.hostname
    if (host === 'github.com') {
        if (segs.length === 6 && segs[2] === 'releases' && segs[3] === 'download' && plain(0) && plain(1) && dec[4] !== '' && plain(5)) {
            return ''
        }
        if (plain(0) && plain(1) && segs[2] === 'raw' && reCommit.test(segs[3] || '') && restOk(4)) {
            return ''
        }
        return need
    }
    if (host === 'raw.githubusercontent.com') {
        if (plain(0) && plain(1) && reCommit.test(segs[2] || '') && restOk(3)) {
            return ''
        }
        return need
    }
    return need
}


export { isBinName, isBinRel, binUrlProblem }
