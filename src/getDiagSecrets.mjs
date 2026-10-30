import { RE_HOSTPORT } from './_diagCodes.mjs'
import { NONE, tryCall, isObjLike, isProxy, gd, hasOwn, declOf, isIndexKey, LIST_FAIL_ITEM } from './_diagKit.mjs'


//查詢參數中, 參數名稱含下列字樣者其值視為憑證(不含單獨之key: 如checkKeys為布林選項)
const RE_SECRET_QKEY = /pass|pwd|secret|token|credential|user|api[_-]?key/i

//其中屬憑證者(不含只為帳號之user): 只為帳號者其值只列detail(reject不含單獨帳號)
const RE_CRED_QKEY = /pass|pwd|secret|token|credential|api[_-]?key/i


//rejMin, 查詢參數值於reject清單之最短長度: 憑證4字元, 只為帳號者不列
let rejMin = (k) => {
    return RE_CRED_QKEY.test(k) ? 4 : Infinity
}

//路徑須至少含一個非路徑符號、非空白之字元(如'.'、'./'會吞掉大量無關文字)
const RE_PATH_OK = /[^./\\\s:]/


//str, 原始字串或包裝字串取原始值; 有限數字與bigint以String()收; 其餘null
let str = (v) => {
    if (typeof v === 'string') {
        return v
    }
    if (typeof v === 'number') {
        return Number.isFinite(v) ? String(v) : null
    }
    if (typeof v === 'bigint') {
        return String(v)
    }
    if (isObjLike(v) && !isProxy(v)) {
        for (let f of [String.prototype.valueOf, Number.prototype.valueOf]) {
            let p = tryCall(f, v)
            if (p !== NONE) {
                return str(p)
            }
        }
    }
    return null
}


//UNREAD, 來源無法讀取(來源物件為可偵測之Proxy、鍵為存取器、讀取拋錯)
const UNREAD = Symbol('unread')


//listAt, 來源值轉[索引, 字串]之陣列: 單值為索引0; 陣列以索引鍵讀自有資料屬性(依索引遞增, 不執行getter; 全部列入, 不截斷: 來源為套件宣告, 少列即漏遮),
//轉不成字串之項與空洞略過但其餘項保留原索引(帳密依原索引成對); 無法讀取者(UNREAD、可偵測之Proxy〔含陣列之項〕、存取器之項)拋錯, 由呼叫端標記結果為無法使用(fail-closed)
let listAt = (v) => {
    if (v === UNREAD || isProxy(v)) {
        throw new Error('unreadable source')
    }
    if (Array.isArray(v)) {
        let r = []
        for (let k of Reflect.ownKeys(v)) {
            if (!isIndexKey(k)) {
                continue
            }
            let d = gd(v, k)
            if (d === undefined) {
                continue
            }
            if (!hasOwn(d, 'value') || isProxy(d.value)) {
                throw new Error('unreadable source')
            }
            let s = str(d.value)
            if (s !== null) {
                r.push([Number(k), s])
            }
        }
        return r
    }
    let s = str(v)
    return s === null ? [] : [[0, s]]
}


//readSrc, 讀來源物件之鍵(自有或繼承之資料屬性, 不執行getter): 未宣告(來源非物件、原型鏈至Object.prototype皆無此鍵)為undefined;
//無法讀取(來源或其原型為可偵測之Proxy、鍵為存取器〔含類別原型上之getter〕、讀取拋錯)為UNREAD
let readSrc = (src, k) => {
    try {
        if (!isObjLike(src)) {
            return undefined
        }
        let v = declOf(src, k)
        return v === NONE ? undefined : v
    }
    catch (err) {
        return UNREAD
    }
}


//tryDo, 執行轉換, 失敗回null
let tryDo = (fn, s) => {
    try {
        return fn(s)
    }
    catch (err) {
        return null
    }
}


//lenientDecode, 寬鬆百分比解碼: 只解碼合法之%XX序列, 其餘(含不完整之%)照留
let lenientDecode = (s) => {
    return s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (m) => {
        try {
            return decodeURIComponent(m)
        }
        catch (err) {
            //連續之%XX中混有不合法之位元組(如%21%FF): 由左而右取可解碼之最長段(UTF-8至多4位元組), 不合法者原樣保留
            let ts = m.match(/%[0-9A-Fa-f]{2}/g)
            let r = ''
            let i = 0
            while (i < ts.length) {
                let ok = false
                for (let j = Math.min(i + 4, ts.length); j > i; j--) {
                    try {
                        r += decodeURIComponent(ts.slice(i, j).join(''))
                        i = j
                        ok = true
                        break
                    }
                    catch (err2) {
                        //試較短之段
                    }
                }
                if (!ok) {
                    r += ts[i]
                    i++
                }
            }
            return r
        }
    })
}


//escInspect, Node錯誤訊息(util.inspect)之字串回顯形式: 反斜線加倍、控制字元跳脫; quote為true者單引號亦跳脫
let escInspect = (s, quote) => {
    let m = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r' }
    let r = s.replace(/\\/g, '\\\\')
    if (quote) {
        r = r.replace(/'/g, '\\\'')
    }
    // eslint-disable-next-line no-control-regex
    return r.replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => m[c] || `\\x${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`)
}


//b64, UTF-8位元組之base64(Basic認證之帳號:密碼形式)
let b64 = (s) => {
    let bs = new TextEncoder().encode(s)
    let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let r = ''
    for (let i = 0; i < bs.length; i += 3) {
        let n = (bs[i] << 16) | ((bs[i + 1] || 0) << 8) | (bs[i + 2] || 0)
        r += t[(n >> 18) & 63] + t[(n >> 12) & 63] + (i + 1 < bs.length ? t[(n >> 6) & 63] : '=') + (i + 2 < bs.length ? t[n & 63] : '=')
    }
    return r
}


//variantsOf, 一個秘密之各種輸出形式: 原樣、百分比解碼(嚴格與寬鬆)後, 各取原樣、單引號加倍(SQL)、JSON跳脫、反斜線跳脫(mysql)、util.inspect跳脫、
//encodeURIComponent、RFC 3986嚴格編碼、表單編碼(+)、空白為%20; 百分比編碼之十六進位大小寫於比對時不分(見maskDiagText), 不另展開; 孤立代理碼元之編碼錯誤略過
let variantsOf = (s) => {
    let bases = [s]
    for (let d of [tryDo(decodeURIComponent, s), lenientDecode(s)]) {
        if (typeof d === 'string' && bases.indexOf(d) < 0) {
            bases.push(d)
        }
    }
    let all = []
    for (let b of bases) {
        all.push(b, b.replace(/'/g, '\'\''), JSON.stringify(b).slice(1, -1), b.replace(/\\/g, '\\\\').replace(/'/g, '\\\''), escInspect(b, true), escInspect(b, false), b.split(' ').join('%20'))
        let enc = tryDo(encodeURIComponent, b)
        if (enc !== null) {
            all.push(enc, enc.replace(/[!'()*]/g, (m) => `%${m.charCodeAt(0).toString(16).toUpperCase()}`), enc.replace(/%20/g, '+'))
        }
    }
    return all
}


//pathVariants, 路徑之字串變體: 正反斜線互換、Windows磁碟機代號大小寫、UNC兩式
let pathVariants = (s) => {
    let bases = [s, s.replace(/\\/g, '/'), s.replace(/\//g, '\\')]
    for (let b of bases.slice()) {
        if (/^[A-Za-z]:/.test(b)) {
            let c = b[0]
            bases.push((c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()) + b.slice(1))
        }
        if (b.startsWith('\\\\') && !b.startsWith('\\\\?\\')) {
            bases.push(`UNC${b.slice(1)}`, `\\\\?\\UNC${b.slice(1)}`)
        }
    }
    let r = []
    for (let b of bases) {
        r.push(b, JSON.stringify(b).slice(1, -1), escInspect(b, true), escInspect(b, false))
        for (let f of [encodeURI, encodeURIComponent]) {
            let e = tryDo(f, b)
            if (e !== null) {
                r.push(e)
            }
        }
    }
    return r
}


//addQuery, 查詢參數值之各形式(原樣、+視為空白、寬鬆解碼、以;分段之各段)
let addQuery = (add, v, minDetail, minReject) => {
    let forms = [v, v.replace(/\+/g, ' ')]
    if (v.indexOf(';') >= 0) {
        forms.push(...v.split(';'))
    }
    for (let x of forms) {
        add(x, minDetail, minReject)
        add(lenientDecode(x), minDetail, minReject)
    }
}


//fromUrl, 連線字串之秘密(add(s, detail最短長度, reject最短長度), 最短長度為Infinity者不列入該清單)
let fromUrl = (u, add) => {
    add(u, 1, 1) //整串
    let i = u.indexOf('://')
    let rest = i >= 0 ? u.slice(i + 3) : u
    let end = rest.search(/[/?#]/)
    let authority = end >= 0 ? rest.slice(0, end) : rest

    //帳密段: 嚴格(權限段內最後一個@)與寬鬆(整串最後一個@)兩種解析之聯集
    let parses = []
    let at1 = authority.lastIndexOf('@')
    parses.push({ info: at1 >= 0 ? authority.slice(0, at1) : null, hostPart: at1 >= 0 ? authority.slice(at1 + 1) : authority })
    let at2 = rest.lastIndexOf('@')
    if (at2 >= 0 && at2 !== at1) {
        parses.push({ info: rest.slice(0, at2), hostPart: rest.slice(at2 + 1).split(/[/?#]/)[0] })
    }
    let users = new Set() //解析所得之帳號(畸形網址之片段等於帳號者不列入reject)
    for (let { info, hostPart } of parses) {
        let reversed = false
        if (info !== null) {
            let ci = info.indexOf(':')
            if (ci >= 0 && ci < info.length - 1) {
                //有密碼部分才列並列形式(帳號:之空密碼形式屬單獨帳號, reject不列)
                add(info, 1, 1) //帳號:密碼並列形式
                add(info.slice(ci + 1), 1, 4) //密碼(變體含解碼形式): detail不設下限, reject至少4字元
                let dec = (x) => {
                    let d = tryDo(decodeURIComponent, x)
                    return d === null ? x : d
                }
                let b = tryDo(b64, `${dec(info.slice(0, ci))}:${dec(info.slice(ci + 1))}`)
                if (b !== null) {
                    add(b, 1, 1)
                }
            }
            let user = ci >= 0 ? info.slice(0, ci) : info
            users.add(user)
            users.add(lenientDecode(user)) //百分比編碼之帳號亦以解碼形比對畸形片段
            add(user, 3, Infinity) //單獨帳號: detail至少3字元, reject不列
            //帳密段本身形如主機:埠且帳號部分形如主機(含.、localhost或[IPv6]), 疑為反向筆誤(主機:埠@帳號:密碼); 一般帳號配短數字密碼(admin:1234@host)不判
            reversed = ci >= 0 && RE_HOSTPORT.test(info) && /\.|^localhost$|^\[/i.test(user)
        }
        //主機項: 無@時全部、有@時不合主機樣式者、疑為反向筆誤時全部(含埠), 皆視為憑證
        for (let h of hostPart.split(',')) {
            if (h === '') {
                continue
            }
            if (info === null || !RE_HOSTPORT.test(h) || reversed) {
                add(h, 3, 3)
                if (reversed) {
                    let ci = h.lastIndexOf(':')
                    if (ci >= 0) {
                        add(h.slice(ci + 1), 3, 4)
                    }
                }
            }
        }
    }

    //畸形網址(權限段之後仍有@): 以@ / : ? #分段之各片段(至少3字元)
    if (end >= 0 && rest.indexOf('@', end) >= 0) {
        for (let tok of rest.split(/[@/:?#]/)) {
            add(tok, 3, users.has(tok) || users.has(lenientDecode(tok)) ? Infinity : 3)
        }
    }

    //查詢參數
    let qi = u.indexOf('?')
    if (qi >= 0) {
        let q = u.slice(qi + 1).split('#')[0]
        let qUser = null
        let qPass = null
        for (let part of q.split('&')) {
            let ei = part.indexOf('=')
            let k = lenientDecode((ei >= 0 ? part.slice(0, ei) : part).replace(/\+/g, ' '))
            if (ei < 0) {
                if (RE_SECRET_QKEY.test(k)) {
                    add(part, 3, rejMin(k)) //無=之秘密參數整段
                }
                continue
            }
            let v = part.slice(ei + 1)
            if (/^(?:true|false|null)$/i.test(v)) {
                continue
            }
            if (RE_SECRET_QKEY.test(k)) {
                addQuery(add, v, 3, rejMin(k))
                //查詢參數之帳號與密碼(各取首個), 供並列形式與其base64
                let dv = lenientDecode(v.replace(/\+/g, ' '))
                if (/pass|pwd/i.test(k)) {
                    qPass = qPass === null ? dv : qPass
                }
                else if (/user/i.test(k) && !RE_CRED_QKEY.test(k)) {
                    qUser = qUser === null ? dv : qUser
                }
            }
            else if (k.toLowerCase() === 'authmechanismproperties') {
                //SERVICE_NAME:x,AWS_SESSION_TOKEN:y 形式: 僅名稱含秘密字樣之屬性值
                for (let item of lenientDecode(v.replace(/\+/g, ' ')).split(',')) {
                    let ii = item.indexOf(':')
                    if (ii > 0 && RE_SECRET_QKEY.test(item.slice(0, ii))) {
                        addQuery(add, item.slice(ii + 1), 3, rejMin(item.slice(0, ii)))
                    }
                }
            }
        }
        if (qUser !== null && qPass !== null && qPass !== '') {
            let pair = `${qUser}:${qPass}`
            add(pair, 1, 1)
            let b = tryDo(b64, pair)
            if (b !== null) {
                add(b, 1, 1)
            }
        }
    }

    //WHATWG URL解析所得之帳號與密碼(編碼形式)
    if (typeof URL === 'function') {
        for (let cs of [u, u.replace('@/', '@___DUMMY___/')]) {
            let o = tryDo((x) => new URL(x, 'postgres://base'), cs)
            if (o !== null) {
                add(o.password, 1, 4)
                add(o.username, 3, Infinity)
                if (o.password !== '') { //有密碼才列並列形式(只有帳號者之「帳號:」屬單獨帳號, reject不列)
                    add(`${o.username}:${o.password}`, 1, 1)
                }
                break
            }
        }
    }
}


/**
 * 由套件宣告之秘密來源導出兩份遮罩清單：detail(診斷輸出用)與reject(對外錯誤值用)，供getDiag、maskDiagText、maskDiagCopy、maskDiagErr使用
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01(跨套件規格為主控dspec〈診斷輸出與遮罩〉)。來源皆可省略，值為字串、包裝字串或其陣列(帳密亦收有限數字與bigint)：
 *
 * urls: 連線字串之整串、帳密段(嚴格與寬鬆兩種解析)、帳號:密碼並列形式與其base64(Basic認證)、密碼、帳號、無@時權限段整段與有@時不合主機:埠樣式之主機項(反向筆誤)、畸形網址之片段、
 * 查詢參數名稱含pass/pwd/secret/token/credential/user/api-key者之值(原樣、+視為空白、寬鬆解碼、以;分段；值為true/false/null不列)、查詢之帳號與密碼(各取首個)之並列形式與其base64、authMechanismProperties內之秘密屬性值、WHATWG URL解析所得之帳密(有密碼者才列並列形式)；
 * 帳號只列detail(含畸形網址片段等於帳號或其解碼形者)；帳號之後為空密碼(帳號:@)者不列並列形式
 *
 * username、password(單值或陣列，各項皆列): 帳號、密碼、帳號:密碼與其base64(依原索引成對〔空洞與轉不成字串之項不使其後之項錯位〕，一方只有一項者與另一方之每一項成對；密碼為空者不列)；paths: 儲存路徑(由套件以path模組算好之原樣、正規化、絕對、暫存檔路徑)，本函數只加正反斜線、磁碟機代號大小寫、UNC兩式等字串變體，全為路徑符號者不收；values: 原樣(如權杖)；
 * conns: 連線位址(ORM等之設定可為連線字串或檔案型資料庫之位置者)，各項依其字串(包裝字串解包)分類：含'://'或'@'者為連線字串，同urls(帳密為憑證，兩份清單皆列)，其餘為儲存路徑，同paths(只列detail，對外錯誤值不遮儲存路徑，dspec Q3)；
 * 與套件自行分類後分別給urls、paths之結果相同(取代各套件各寫一份之分類，如w-serv-orm之getUrlSecrets)
 *
 * 每個秘密另取各種輸出形式：百分比解碼(嚴格與寬鬆)、單引號加倍、JSON跳脫、反斜線跳脫、util.inspect跳脫、URL編碼(RFC 3986嚴格、表單編碼)、空白為%20
 *
 * detail清單含全部來源(密碼不設長度下限、單獨帳號至少3字元、路徑)；reject清單只含憑證(網址整串、帳號:密碼各形、密碼與查詢秘密值至少4字元、畸形網址片段、權杖)，不含單獨帳號與儲存路徑
 *
 * 兩份清單皆去重、長者在前、凍結；任何輸入皆不拋錯(不合者略過)；不執行使用端程式(來源物件之鍵讀自有或繼承〔至Object.prototype止〕之資料屬性，陣列只讀自有資料屬性)；
 * 來源無法讀取(來源物件、其原型、其值或陣列之項為可偵測之Proxy、鍵〔含類別原型上之getter〕或陣列項為存取器、讀取拋錯)時其餘來源照列，但detail、reject兩陣列之最末皆另含一項失敗標記字串，
 * maskDiagText、maskDiagCopy、maskDiagErr與getDiag取用(傳結果物件、其展開或複製〔structuredClone、JSON往返、[...ss.detail]〕之副本、單獨傳detail/reject陣列、或由另一份載入之wsemi取用)時fail-closed(少列即漏遮)
 *
 * 已知限制: reject清單之短密碼(少於4字元)不遮；過短之帳號(少於3字元)單獨出現時不遮(其與密碼並列之形式仍遮)；以filter等方式自陣列移除失敗標記字串者不再fail-closed；失敗標記字串('\u0000[wsemi:diag-list-incomplete]\u0000')為保留字樣，合法清單含之者亦視為無法使用(只會多遮，依D4取fail-closed之方向)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDiagSecrets.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [src={}] 輸入秘密來源物件，預設{}
 * @param {String|Array} [src.urls] 輸入連線字串或其陣列
 * @param {String|Number|Array} [src.username] 輸入帳號或其陣列
 * @param {String|Number|Array} [src.password] 輸入密碼或其陣列
 * @param {String|Array} [src.paths] 輸入儲存路徑或其陣列
 * @param {String|Array} [src.values] 輸入其他秘密值(如權杖)或其陣列
 * @param {String|Array} [src.conns] 輸入連線位址(連線字串或檔案型資料庫之位置，依內容自動分類為urls或paths)或其陣列
 * @returns {Object} 回傳秘密清單物件{ detail, reject }，兩者皆為凍結之字串陣列(長者在前；來源無法讀取時最末另含失敗標記字串)
 * @example
 *
 * let ss = getDiagSecrets({ urls: ['postgres://dbuser:pw1234@db.example.com:5432/app'] })
 * console.log(ss.detail.includes('pw1234'), ss.reject.includes('pw1234'))
 * // => true true
 * console.log(ss.detail.includes('dbuser'), ss.reject.includes('dbuser'))
 * // => true false
 *
 * let ss2 = getDiagSecrets({ password: 12345, paths: ['C:\\data\\db01'] })
 * console.log(ss2.detail.includes('12345'), ss2.detail.includes('c:\\data\\db01'), ss2.reject.includes('C:\\data\\db01'))
 * // => true true false
 *
 * let ss3 = getDiagSecrets({ conns: ['mongodb://u1:pw5678@h:27017/db', 'C:\\data\\db02'] })
 * console.log(ss3.reject.includes('pw5678'), ss3.detail.includes('C:\\data\\db02'), ss3.reject.includes('C:\\data\\db02'))
 * // => true true false
 *
 */
function getDiagSecrets(src) {
    let detail = new Set()
    let reject = new Set()

    //add, 加入一個基底(含全部變體); minDetail、minReject為各清單之最短長度(Infinity為不列入)
    let add = (s, minDetail, minReject) => {
        if (typeof s !== 'string' || s === '') {
            return
        }
        for (let v of variantsOf(s)) {
            if (typeof v !== 'string' || v === '') {
                continue
            }
            if (v.length >= minDetail) {
                detail.add(v)
            }
            if (v.length >= minReject) {
                reject.add(v)
            }
        }
    }

    //各來源各自try: 一個來源無法讀取(已撤銷之Proxy、存取器等)不影響其他來源之列入, 但結果標記為無法使用(取清單者fail-closed: 少列即漏遮)
    let failed = false
    let eachAt = (k) => {
        try {
            return listAt(readSrc(src, k))
        }
        catch (err) {
            failed = true
            return []
        }
    }
    let each = (k) => eachAt(k).map((x) => x[1])
    try {
        //conns, 連線位址: 含://或@者(連線字串)同urls, 其餘(檔案型資料庫之位置)同paths(對外錯誤值不遮儲存路徑, dspec Q3)
        let conns = each('conns')
        let isConnStr = (s) => s.indexOf('://') >= 0 || s.indexOf('@') >= 0
        for (let u of [...each('urls'), ...conns.filter(isConnStr)]) {
            try {
                fromUrl(u, add)
            }
            catch (err) {
                //單一網址解析失敗略過(整串已列入)
            }
        }
        let users = eachAt('username')
        let passes = eachAt('password')
        for (let [, p] of passes) {
            add(p, 1, 4)
        }
        for (let [, u] of users) {
            add(u, 3, Infinity)
        }
        //帳號:密碼並列形式與其base64: 依原索引成對(一方只有一項者與另一方之每一項成對; 空洞與轉不成字串之項不使其後之項錯位); 密碼為空者不列(帳號:屬單獨帳號)
        let pair = (u, p) => {
            if (p === '') {
                return
            }
            let s = `${u}:${p}`
            add(s, 1, 1)
            let b = tryDo(b64, s)
            if (b !== null) {
                add(b, 1, 1)
            }
        }
        if (users.length === 1) {
            for (let [, p] of passes) {
                pair(users[0][1], p)
            }
        }
        else if (passes.length === 1) {
            for (let [, u] of users) {
                pair(u, passes[0][1])
            }
        }
        else {
            let pm = new Map(passes)
            for (let [i, u] of users) {
                if (pm.has(i)) {
                    pair(u, pm.get(i))
                }
            }
        }
        for (let p of [...each('paths'), ...conns.filter((s) => !isConnStr(s))]) {
            if (p.length < 3 || !RE_PATH_OK.test(p)) {
                continue
            }
            for (let v of pathVariants(p)) {
                if (typeof v === 'string' && v.length >= 3) {
                    detail.add(v)
                }
            }
        }
        for (let v of each('values')) {
            add(v, 1, 4)
        }
    }
    catch (err) {
        //不拋錯, 已列入者照用(結果標記為無法使用)
        failed = true
    }

    //來源無法讀取者兩陣列之最末另含失敗標記項(LIST_FAIL_ITEM): 取清單者(pickList)不論傳結果、其展開或複製之副本、單獨之陣列, 或由另一份wsemi取用, 皆fail-closed
    let fin = (set) => {
        let a = [...set].sort((a, b) => b.length - a.length)
        if (failed) {
            a.push(LIST_FAIL_ITEM)
        }
        return Object.freeze(a)
    }
    return Object.freeze({ detail: fin(detail), reject: fin(reject) })
}


export default getDiagSecrets
