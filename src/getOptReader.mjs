import parseNumOpt from './_numOpt.mjs'


//readKey, 讀opt之鍵: opt為物件或函數才讀, 讀取拋錯(存取器、陷阱、已撤銷之Proxy)與其他一律視為未給(undefined)
function readKey(opt, key) {
    try {
        if ((typeof opt === 'object' && opt !== null) || typeof opt === 'function') {
            return opt[key]
        }
    }
    catch (err) {
        //讀取拋錯視為未給
    }
    return undefined
}


//safeText, 警告訊息內之程式常數(tag、key、desc、defDesc): 非空字串才用且至多取前length字元; 其中C0與C1控制字元、零寬與方向控制字元(U+200B~U+200F、U+2028~U+202E、U+2066~U+2069)、孤立之代理碼元(含截斷而成者)換成?; 其餘取fallback
function safeText(v, length, fallback) {
    if (typeof v !== 'string' || v === '') {
        return fallback
    }
    return v.slice(0, length).replace(/[\u{0}-\u{1f}\u{7f}-\u{9f}\u{200b}-\u{200f}\u{2028}-\u{202e}\u{2066}-\u{2069}\u{d800}-\u{dfff}]/gu, '?') // eslint-disable-line no-control-regex
}


/**
 * 取得opt之讀取函數: 各鍵讀取拋錯視為未給、給了就檢測、非預期之輸入視為未給而改用預設、opt.debug為true時另輸出警告(輸入參數之檢測機制K3、V5、V11、K9)
 *
 * 供套件於入口讀其opt: 呼叫端傳入之opt可為任意值(含已撤銷之Proxy、鍵之存取器拋錯)，本函數與其回傳之讀取函數永不拋錯。
 * 規則:
 * 1. opt非物件、非函數(undefined、null、數字、字串等)時各鍵皆視為未給；鍵之值為undefined或null視為未給，取預設；讀取拋錯(存取器、陷阱、已撤銷之Proxy)亦視為未給(不警告)
 * 2. 給了之值須通過check(回傳恰為true)才原樣回傳(檢測之值即使用之值，不轉換)；check拋錯、回傳非true、或check非函數(程式誤用)皆視為非預期而取預設(不報錯)
 * 3. 每個鍵每次讀取只讀一次；opt.debug與opt.funLog於本函數呼叫時讀一次(funLog只於debug為true時才讀)
 * 4. opt.debug須恰為true才輸出警告(非布林或'true'視為false)：非預期之輸入(含未通過check者)於讀取函數內另輸出一則警告，格式為'[tag] invalid opt.key: must be desc, using default defDesc'，只含程式常數(tag、key、desc、defDesc)，不含傳入之值(K9)；出口為opt.funLog(函數，以(msg, { fn, reason, key })呼叫，fn為tag、reason恆為'invalid'，其拋錯與回傳之rejection皆忽略)，未給則console.warn；同一tag、同一key每個行程只警告一次(去重表與wsemi內部之opt警告共用，上限256筆)
 * 5. 警告之訊息與去重不含輸入值，故不需經getDiag之遮罩
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getOptReader.test.mjs Github}
 * @memberOf wsemi
 * @param {String} tag 輸入警告訊息之前綴字串(常為'套件名 函數名')，非空字串才採用且至多取前64字元，否則用'opt'
 * @param {Object} [opt] 輸入呼叫端之設定物件，讀其debug與funLog，非物件視為未給
 * @param {Boolean} [opt.debug=false] 輸入是否輸出警告布林值，須恰為true才生效，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給或非函數則用console.warn，預設null
 * @returns {Function} 回傳讀取函數rd(key, def, check, desc, defDesc)：key為鍵名字串，def為未給或非預期時回傳之預設值，check為檢測函數(v)=>布林值(回傳須恰為true才算有效)，desc為種類描述字串(如'a boolean')，defDesc為預設值描述字串(如'false')；rd帶有屬性rd.read(key)(安全讀取原值，不檢測不警告，供轉傳之鍵使用)、rd.debug(布林值)與rd.funLog(函數或null，僅debug為true時才有值，供轉傳給下層函數之呼叫端沿用而不再讀opt)；另有getOptReader.resetWarned()重設已警告之紀錄，僅供測試使用
 * @example
 *
 * let isbol = (v) => typeof v === 'boolean'
 * let isstr = (v) => typeof v === 'string'
 *
 * let rd = getOptReader('w-demo run', { useCache: 'yes', name: 'abc', debug: true })
 * console.log(rd('useCache', false, isbol, 'a boolean', 'false'))
 * // => false (console.warn: [w-demo run] invalid opt.useCache: must be a boolean, using default false)
 * console.log(rd('name', '', isstr, 'a string', "''"))
 * // => abc
 * console.log(rd('none', 5, isbol, 'a boolean', '5'))
 * // => 5
 * console.log(rd.read('name'), rd.debug)
 * // => abc true
 *
 * //opt不可讀(已撤銷之Proxy、存取器拋錯)時視為未給，不拋錯
 * let p = Proxy.revocable({}, {})
 * p.revoke()
 * console.log(getOptReader('w-demo run', p.proxy)('useCache', false, isbol, 'a boolean', 'false'))
 * // => false
 *
 */
function getOptReader(tag, opt) {

    //tg
    let tg = safeText(tag, 64, 'opt')

    //debug, 僅恰為true才啟用
    let debug = readKey(opt, 'debug') === true

    //funLog, 僅debug為true時才讀
    let funLog = null
    if (debug) {
        let f = readKey(opt, 'funLog')
        funLog = typeof f === 'function' ? f : null
    }

    //rd
    let rd = (key, def, check, desc, defDesc) => {

        //v
        let v = readKey(opt, key)
        if (v === undefined || v === null) {
            return def
        }

        //check, 須回傳恰為true才算有效; check非函數(程式誤用)、check拋錯皆視為非預期(同w-dwdata-ftp原實作: check非函數時呼叫即拋錯而被攔截)
        let b = false
        try {
            b = typeof check === 'function' && check(v) === true
        }
        catch (err) {
            //check拋錯視為非預期
        }
        if (b) {
            return v
        }

        //warn
        if (debug) {
            let k = safeText(key, 64, '?')
            let d = safeText(desc, 200, 'a valid value')
            let dd = safeText(defDesc, 200, 'the default')
            let msg = `[${tg}] invalid opt.${k}: must be ${d}, using default ${dd}`
            parseNumOpt.warnOnce(`reader|${JSON.stringify([tg, k])}`, msg, { fn: tg, reason: 'invalid', key: k }, funLog) //id以JSON編碼, tag或key含分隔字元亦不碰撞
        }

        return def
    }

    //read, 安全讀取原值
    rd.read = (key) => readKey(opt, key)

    //debug與funLog僅於本函數呼叫時讀取一次, 供轉傳給下層函數之呼叫端沿用(不再讀opt)
    rd.debug = debug
    rd.funLog = funLog

    return rd
}


//resetWarned, 重設已警告之紀錄(供測試; 與wsemi內部之opt警告共用去重表)
getOptReader.resetWarned = () => {
    parseNumOpt.resetWarned()
}


export default getOptReader
