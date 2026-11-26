/**
 * execCli系列(execCli、execCliSession、execCliJsonRpc、execCliJsonFile)讀取呼叫端args與env之快照(內部共用不對外)
 *
 * 呼叫端之args元素、env鍵之getter與Proxy陷阱可拋出任意文字，若留待spawn或展開時才拋出，其訊息(使用端所拋之文字)會經execSpawnError外露於回傳之error(V20)；
 * 故於入口各讀一次成為一般陣列與一般物件之快照，讀取拋錯者以固定訊息之標記錯誤(unreadable)交由呼叫端回報，其後不再觸及呼叫端之值(檢查之值即使用之值)
 * 標記以WeakMap記錄(對任意拋出值皆安全：WeakMap.get對原始值回undefined、不觸發Proxy之陷阱，不用instanceof，已撤銷之Proxy亦不拋錯)
 */

//kMsg, 標記錯誤 → 固定訊息
let kMsg = new WeakMap()


//unreadable, 建立標記錯誤, msg為固定訊息(V19, 如'invalid args: must be a readable array')
function unreadable(msg) {
    let e = new Error('unreadable input')
    kMsg.set(e, msg)
    return e
}


//unreadableMsg, 取標記錯誤之固定訊息, 非標記錯誤(任意拋出值)回傳def; 永不拋錯
function unreadableMsg(err, def) {
    try {
        let m = kMsg.get(err)
        return m !== undefined ? m : def
    }
    catch (e) {
        return def
    }
}


//toStr, 轉字串(同node之spawn對參數與環境變數值之轉換, 原始字串原樣, 其餘String(v)): 於快照時即轉換, 使呼叫端物件之toString拋錯(其文字)不致留待spawn時才由node原樣拋出而外露; 拋錯者由呼叫端轉標記錯誤
//  Symbol不轉換(原樣交node, 其拋出之TypeError訊息為固定文字、不含值; String(Symbol)會靜默轉成'Symbol(x)'而改變既有之失敗行為)
function toStr(v) {
    return typeof v === 'string' || typeof v === 'symbol' ? v : String(v)
}

//ARGS_MAX, args之元素個數上限(超過者不可能啟動子進程: 命令列長度遠先於此受限; 防止偽造長度之類陣列物件使快照耗盡記憶體)
let ARGS_MAX = 1000000


//snapArgs, args(已確認為陣列)之元素逐一讀取並轉字串為一般陣列, 讀取或轉換拋錯(元素getter、元素之toString、Proxy陣列之陷阱)或個數逾上限者拋標記錯誤
function snapArgs(args) {
    try {
        let n = args.length
        if (!(typeof n === 'number' && n >= 0 && n <= ARGS_MAX)) {
            throw new Error('invalid length')
        }
        let r = []
        for (let i = 0; i < n; i++) {
            r.push(toStr(args[i]))
        }
        return r
    }
    catch (err) {
        throw unreadable('invalid args: must be a readable array')
    }
}


//snapEnv, env(已確認為一般物件)之自有可列舉字串鍵讀取並轉字串為一般物件(值為undefined者保留undefined, 代表移除該變數), 讀取或轉換拋錯(鍵之getter、值之toString、Proxy陷阱)者拋標記錯誤
function snapEnv(env) {
    try {
        let r = {}
        for (let k of Object.keys(env)) {
            let v = env[k]
            r[k] = v === undefined ? undefined : toStr(v)
        }
        return r
    }
    catch (err) {
        throw unreadable('invalid opt.env: must be a readable object')
    }
}


export { unreadable, unreadableMsg, snapArgs, snapEnv }
