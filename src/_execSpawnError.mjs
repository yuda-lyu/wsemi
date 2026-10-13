import isestr from './isestr.mjs'


//execProcess、execCli、execCliSession回報「無法啟動子進程」之共用核心, 獨立成模組以便直接餵錯誤物件做單元測試
//  來源: node之spawn同步拋錯(EPERM、UNKNOWN、ENAMETOOLONG, 以及參數檢查之ERR_INVALID_ARG_VALUE、ERR_INVALID_ARG_TYPE等)與'error'事件(ENOENT、EACCES、EAGAIN、EMFILE、ENFILE)
//  只讀code、message與errno, 不讀spawnargs(node對非同步錯誤所附之完整參數陣列, exec模式為整條指令列)、cmd等可能含參數之屬性
//  有errno者為系統錯誤, message為「syscall 錯誤碼」, syscall為'spawn'或'spawn 執行檔', 不含參數, 原樣使用
//  無errno者為node之參數檢查錯誤, message以「. Received 值」結尾, 值為該參數或環境變數之內容(node以inspect取前128字元), 故去除, 保留參數名稱(如args[2])以利判讀


//execSpawnError, 輸入錯誤物件, 回傳{ code, message }, 缺code時為'UNKNOWN', 缺message時以code代之, 任何輸入皆不拋錯
function execSpawnError(err) {
    let code = ''
    let message = ''
    let errno = null
    try {
        code = err.code
        message = err.message
        errno = err.errno
    }
    catch (e) {}
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
