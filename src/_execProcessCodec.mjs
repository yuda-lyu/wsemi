import cp from 'child_process'
import isestr from './isestr.mjs'


//execProcess之解碼核心, 獨立成模組以便直接餵位元組做單元測試, 不必每案都spawn子程序
//  normalizeCodeCmd: codeCmd標籤正規化, 含Windows字碼頁編號別名, 不支援者回null
//  codePageToLabel: Windows字碼頁編號對應TextDecoder標籤
//  getSystemCodePage: 偵測系統字碼頁, win32以chcp查一次並快取, 其他平台一律utf-8
//  utf8TailLen: 計算buffer結尾尚未完整之utf-8序列長度
//  createDecoder: 建立跨chunk串流解碼器, 'auto'時先以utf-8嚴格判定, 失敗改用系統字碼頁
//一律使用全域TextDecoder(WHATWG, node以ICU實作)而非Buffer.toString, 因後者不支援big5/gbk/shift_jis等, 且對不認識之編碼會拋ERR_UNKNOWN_ENCODING; 亦不引入iconv-lite等相依套件


//kpCodePage, Windows字碼頁編號對應TextDecoder標籤
//  TextDecoder不接受cp950/950一類寫法(拋ERR_ENCODING_NOT_SUPPORTED), 故須對照
//  437(OEM美式)非TextDecoder支援之編碼, 對照為windows-1252, ASCII範圍相同, 0x80以上之框線與重音字元會有差異
//  未列者依序嘗試windows-NNN(涵蓋1250~1258、874)與ibmNNN(涵蓋866), 皆不支援回null
let kpCodePage = {
    '65001': 'utf-8',
    '1200': 'utf-16le',
    '950': 'big5',
    '936': 'gbk',
    '54936': 'gb18030',
    '932': 'shift_jis',
    '949': 'euc-kr',
    '437': 'windows-1252',
}


//kpAlias, 非字碼頁編號之別名, TextDecoder不接受者於此對照, 皆以小寫比對
let kpAlias = {
    'euckr': 'euc-kr',
    'utf16le': 'utf-16le',
    'ucs2': 'utf-16le',
}


function isSupportedLabel(label) {
    try {
        new TextDecoder(label) //eslint-disable-line no-new
        return true
    }
    catch (err) {
        return false
    }
}


//codePageToLabel, 輸入Windows字碼頁編號(數字或字串), 回傳TextDecoder標籤, 不支援回null
function codePageToLabel(n) {
    n = String(n).trim()
    if (kpCodePage[n]) {
        return kpCodePage[n]
    }
    let cands = [`windows-${n}`, `ibm${n}`]
    for (let c of cands) {
        if (isSupportedLabel(c)) {
            return c
        }
    }
    return null
}


//normalizeCodeCmd, 回傳{ mode, label }, mode為'fixed'|'auto'|'system', fixed時label為TextDecoder之正規名稱, 不支援之標籤回null
//  非有效字串(未給、非字串、空字串)視為未設定, 回utf-8, 維持wsemi「無效設定用預設值」慣例
//  有效字串但無法解碼者回null, 由呼叫端於執行前reject並帶標籤, 因用錯編碼解碼會靜默產生亂碼, 不宜改用預設值掩蓋
function normalizeCodeCmd(codeCmd) {
    if (!isestr(codeCmd)) {
        return { mode: 'fixed', label: 'utf-8' }
    }
    let c = codeCmd.trim().toLowerCase()
    if (c === 'auto') {
        return { mode: 'auto', label: null }
    }
    if (c === 'system') {
        return { mode: 'system', label: null }
    }

    //cpNNN、windows-NNN、NNN
    let m = /^(?:cp|windows-)?(\d{3,5})$/.exec(c)
    if (m !== null) {
        let label = codePageToLabel(m[1])
        if (label === null) {
            return null
        }
        return { mode: 'fixed', label }
    }

    //alias
    if (kpAlias[c]) {
        c = kpAlias[c]
    }

    //check
    if (!isSupportedLabel(c)) {
        return null
    }

    return { mode: 'fixed', label: new TextDecoder(c).encoding }
}


//getSystemCodePage, 回傳Promise, resolve系統字碼頁對應之TextDecoder標籤, 不會reject
//  node無API可查系統字碼頁, win32以chcp查詢一次, chcp訊息本身為OEM編碼但編號為ASCII, 取結尾數字即可; 成功則以模組變數快取Promise, 失敗回utf-8且不快取以便下次重試
//  chcp回報的是主控台(OEM)字碼頁, 原生指令(tasklist、netstat等)之輸出即用此字碼頁; 一般程式寫pipe多用ANSI字碼頁, 中日韓語系兩者相同, 西歐語系為437與1252之別而皆對照為windows-1252
//  非win32平台一律utf-8
let pmSystemLabel = null
function getSystemCodePage() {
    if (pmSystemLabel !== null) {
        return pmSystemLabel
    }
    let pm = new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve('utf-8')
            return
        }
        try {
            cp.exec('chcp', { windowsHide: true, encoding: 'latin1', timeout: 10000 }, (err, stdout) => {
                let label = null
                if (!err) {
                    let m = /(\d+)\s*$/.exec(String(stdout))
                    if (m !== null) {
                        label = codePageToLabel(m[1])
                    }
                }
                if (label === null) {
                    pmSystemLabel = null
                    label = 'utf-8'
                }
                resolve(label)
            })
        }
        catch (err) {
            pmSystemLabel = null
            resolve('utf-8')
        }
    })
    pmSystemLabel = pm
    return pm
}


//utf8TailLen, 回傳buf結尾「尚未完整但仍可能合法」之utf-8序列長度(0~3), 供串流嚴格判定時暫存至下個chunk再判
//  結尾為完整序列、ASCII、非法lead、或第2位元組已超出WHATWG規定範圍(E0/ED/F0/F4之特殊上下界)者回0, 交由嚴格解碼判定為合法或非法
function utf8TailLen(buf) {
    let n = buf.length
    for (let i = 1; i <= 3 && i <= n; i++) {
        let b = buf[n - i]
        if (b >= 0x80 && b <= 0xbf) {
            continue //continuation byte, 往前找lead
        }
        let need = 0
        if (b >= 0xc2 && b <= 0xdf) {
            need = 2
        }
        else if (b >= 0xe0 && b <= 0xef) {
            need = 3
        }
        else if (b >= 0xf0 && b <= 0xf4) {
            need = 4
        }
        else {
            return 0 //ASCII或非法lead
        }
        if (i >= need) {
            return 0 //序列已完整
        }
        if (i >= 2) {
            let b2 = buf[n - i + 1]
            let lo = 0x80
            let hi = 0xbf
            if (b === 0xe0) {
                lo = 0xa0
            }
            else if (b === 0xed) {
                hi = 0x9f
            }
            else if (b === 0xf0) {
                lo = 0x90
            }
            else if (b === 0xf4) {
                hi = 0x8f
            }
            if (b2 < lo || b2 > hi) {
                return 0 //非法而非未完成
            }
        }
        return i
    }
    return 0 //連續3個continuation而無lead: 非法
}


//createDecoder, 建立單一串流之解碼器, 回傳{ write(buf)->string, end()->string, switched, label }
//  label為TextDecoder標籤時: 一般串流解碼, 多位元組字元跨chunk由TextDecoder自行暫存
//  label為'auto'時: 每個chunk先以utf-8嚴格模式判定, 結尾未完整之序列暫存至下個chunk再判, 故合法utf-8之輸出逐chunk即為精確結果;
//    首次遇到非法序列即改用opt.labelSystem, 自該chunk(含暫存)起以串流方式解碼, switched轉true、label轉為系統字碼頁;
//    結尾仍暫存有未完整序列者(子程序被殺於字元中間)於end視為utf-8截斷以U+FFFD取代, 不改判為系統字碼頁;
//    改判前已回傳之字串為utf-8解碼結果, 呼叫端若需精確結果須自行保留原始chunk於switched後以新解碼器重播
function createDecoder(label, opt = {}) {

    //fixed
    if (label !== 'auto') {
        let dec = new TextDecoder(label)
        return {
            switched: false,
            label: dec.encoding,
            write: (buf) => {
                return dec.decode(buf, { stream: true })
            },
            end: () => {
                return dec.decode()
            },
        }
    }

    //auto
    let labelSystem = opt.labelSystem
    if (!isestr(labelSystem)) {
        labelSystem = 'utf-8'
    }
    let decStrict = new TextDecoder('utf-8', { fatal: true })
    let decSys = null
    let carry = null
    let r = {
        switched: false,
        label: 'utf-8',
        write: null,
        end: null,
    }
    r.write = (buf) => {
        if (decSys !== null) {
            return decSys.decode(buf, { stream: true })
        }
        let b = buf
        if (carry !== null) {
            b = Buffer.concat([carry, buf])
            carry = null
        }
        let nTail = utf8TailLen(b)
        let head = b
        if (nTail > 0) {
            head = b.subarray(0, b.length - nTail)
        }
        let s = ''
        try {
            s = decStrict.decode(head, { stream: true })
        }
        catch (err) {
            r.switched = true
            r.label = labelSystem
            decSys = new TextDecoder(labelSystem)
            return decSys.decode(b, { stream: true })
        }
        if (nTail > 0) {
            carry = Buffer.from(b.subarray(b.length - nTail)) //複製, 不持有串流chunk之底層記憶體
        }
        return s
    }
    r.end = () => {
        if (decSys !== null) {
            return decSys.decode()
        }
        let s = ''
        try {
            s = decStrict.decode() //head皆止於完整序列邊界, 此處不會暫存任何位元組
        }
        catch (err) {
            s = ''
        }
        if (carry !== null) {
            s += new TextDecoder('utf-8').decode(carry) //截斷之utf-8序列以U+FFFD取代
            carry = null
        }
        return s
    }
    return r
}


let codec = {
    normalizeCodeCmd,
    codePageToLabel,
    getSystemCodePage,
    utf8TailLen,
    createDecoder,
}


export default codec
