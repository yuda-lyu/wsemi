import fs from 'fs'
import isestr from './isestr.mjs'
import { fsErrCode } from './_fsErrMsg.mjs'


//execProcess、execCli、execCliSession回報「無法啟動子進程」之共用核心, 獨立成模組以便直接餵錯誤物件做單元測試
//  來源: node之spawn同步拋錯(EPERM、UNKNOWN、ENAMETOOLONG, 以及參數檢查之ERR_INVALID_ARG_VALUE、ERR_INVALID_ARG_TYPE等)與'error'事件(ENOENT、EACCES、EAGAIN、EMFILE、ENFILE)
//  只讀code、message與errno, 不讀spawnargs(node對非同步錯誤所附之完整參數陣列, exec模式為整條指令列)、cmd等可能含參數之屬性
//  有errno者為系統錯誤, message為「syscall 錯誤碼」, syscall為'spawn'或'spawn 執行檔', 不含參數, 原樣使用
//  無errno者為node之參數檢查錯誤, message以「. Received 值」結尾, 值為該參數或環境變數之內容(node以inspect取前128字元), 故去除, 保留參數名稱(如args[2])以利判讀


//execSpawnError, 輸入錯誤物件, 回傳{ code, message }, 缺code時為'UNKNOWN', 缺message時以code代之, 任何輸入皆不拋錯
//  opt.cwd: 子進程之工作目錄; node以不存在(或非資料夾)之cwd spawn時回ENOENT而訊息指向執行檔, 故ENOENT且cwd非既存資料夾時改寫訊息指明cwd(碼仍為ENOENT, 分類不變)
//  cwd之判定以stat跟隨連結(junction、符號連結指向既存資料夾者為有效之cwd); 不用fsIsFolder, 其以lstat判定且連結一律為假, 會把有效之junction誤報為cwd不存在
//  opt.fixed: 為true時, 帶錯誤碼之Node原生錯誤(真Error且code為英數字與底線之字串, 不含本套件E_起頭者, 判定同_fsErrMsg之fsErrCode)其message改為固定詞彙'operation failed (code ENOENT)', 不含執行檔路徑、參數名稱與環境變數之值(V20, R-EXEC-FAIL-01規則15; 同fs家族之W-23作法); 無錯誤碼者(呼叫端自拋之非Error值、已撤銷之Proxy等)與cwd不存在之說明依舊; 未給或非true時行為不變(execCli、execCliSession不傳)
function execSpawnError(err, opt = {}) {
    let code = ''
    let message = ''
    let errno = null
    try {
        code = err.code
        message = err.message
        errno = err.errno
    }
    catch (e) {}
    let cwd = null
    try {
        cwd = opt.cwd
    }
    catch (e) {}
    if (code === 'ENOENT' && isestr(cwd)) {
        let bCwd = true
        try {
            bCwd = fs.statSync(cwd).isDirectory()
        }
        catch (e) {
            //只有確定不存在(ENOENT、上層非資料夾之ENOTDIR)才視為cwd無效, 其他stat錯誤(如權限)不改寫訊息
            let c = ''
            try {
                c = e.code
            }
            catch (e2) {}
            bCwd = !(c === 'ENOENT' || c === 'ENOTDIR')
        }
        if (!bCwd) {
            return { code, message: 'invalid cwd: must be an existing folder' }
        }
    }
    let fixed = false
    try {
        fixed = opt.fixed === true
    }
    catch (e) {}
    if (fixed) {
        let c = fsErrCode(err)
        if (c !== null) {
            return { code: c, message: `operation failed (code ${c})` }
        }
    }
    if (!isestr(code)) {
        code = 'UNKNOWN'
    }
    if (!isestr(message)) {
        message = ''
    }
    if (typeof errno !== 'number') {
        let i = message.indexOf('. Received ')
        if (i >= 0) {
            message = message.slice(0, i)
        }
    }
    if (message === '') {
        message = code
    }
    return { code, message }
}


export default execSpawnError
