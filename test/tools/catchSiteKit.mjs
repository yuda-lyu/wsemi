//catchSiteKit.mjs: 第676項(R-CATCH-TEXT-01)逐站故障注入之共用工具
//  把「轉換本體」之try內會呼叫之內建函數(或輸入本身)改為拋出, 使各站之catch被觸發, 驗證狀態模式之msg為固定詞彙(不含所拋出之文字)、診斷只經funLog出口
//  觸發法(trig): { proto: [物件, 鍵] } 於該內建函數之第一次呼叫拋出一次(之後恢復原行為, 使診斷路徑不受影響); { input: 名稱 } 以輸入本身觸發(分離之buffer等)
//  SITES不含cint、b642obj、obj2b64、obj2pb64、pb642obj(共5站): 其try內之呼叫皆為已自帶try之函數(狀態模式或預設模式, 內建函數之拋出於被呼叫者之catch即被攔下)或無可觸發之內建函數(cint之cdbl與round),
//  改以MIRRORS(src之鏡像複本, 把其相依模組換為呼叫即拋之替身)觸發; 另由原始碼掃描之守門涵蓋
import path from 'path'
import { pathToFileURL } from 'url'


let MARK = 'SECRET_MARK_Q7 /srv/someone/secret.txt'

let defProp = Object.defineProperty
let getDesc = Object.getOwnPropertyDescriptor

//arm, 於obj[key]之第一次呼叫拋出一次(之後呼叫原函數), 回傳還原函數
function arm(obj, key) {
    let d = getDesc(obj, key)
    let orig = d.value
    let armed = true
    defProp(obj, key, {
        ...d,
        value: function(...args) {
            if (armed) {
                armed = false
                throw new Error(MARK)
            }
            return orig.apply(this, args)
        },
    })
    return () => {
        defProp(obj, key, d)
    }
}

//armGlobal, 於全域類別之第一次new拋出一次(之後轉交原類別; 以Proxy包裝, instanceof與屬性不變), 回傳還原函數
function armGlobal(key) {
    let d = getDesc(globalThis, key)
    let Orig = d.value
    let armed = true
    defProp(globalThis, key, {
        ...d,
        value: new Proxy(Orig, {
            construct(target, args, newTarget) {
                if (armed) {
                    armed = false
                    throw new Error(MARK)
                }
                return Reflect.construct(target, args, newTarget)
            },
        }),
    })
    return () => {
        defProp(globalThis, key, d)
    }
}

let PROTOS = {
    'String.prototype.slice': [String.prototype, 'slice'],
    'String.prototype.indexOf': [String.prototype, 'indexOf'],
    'String.prototype.charAt': [String.prototype, 'charAt'],
    'String.prototype.charCodeAt': [String.prototype, 'charCodeAt'],
    'String.fromCharCode': [String, 'fromCharCode'],
    'ArrayBuffer.prototype.slice': [ArrayBuffer.prototype, 'slice'],
    'TextEncoder.prototype.encode': [TextEncoder.prototype, 'encode'],
    'TextDecoder.prototype.decode': [TextDecoder.prototype, 'decode'],
    'JSON.parse': [JSON, 'parse'],
}

//detached, 分離buffer之TypedArray(讀取即拋TypeError)
function detached(Ctor, vals) {
    let a = new Ctor(vals)
    structuredClone(a.buffer, { transfer: [a.buffer] })
    return a
}

let U8 = () => new Uint8Array([1, 2, 3, 4])
let U16 = () => new Uint16Array([1, 2, 3])
let T = '2019-01-01T12:34:56'
let TMS = '2019-01-01T12:34:56.789'
let TZ1 = '2019-01-01T12:34:56+08:00'
let TMSZ = '2019-01-01T12:34:56.789+08:00'

//SITES: name為函數名(src/<name>.mjs)、msg為狀態模式應回之固定訊息、label為診斷標籤、mk(fns, opt)回傳呼叫引數(opt置於其位置參數之末)、trig為觸發法
let SITES = [
    { name: 'ab2blob', msg: 'can not convert ab to blob', mk: (f, o) => [U8().buffer, o], trig: { proto: 'ArrayBuffer.prototype.slice' } },
    { name: 'aes2str', msg: 'can not decrypt str with key, or str is not a valid cipher text', mk: (f, o) => [f.str2aes('abc', 'k'), 'k', false, o], trig: { proto: 'String.prototype.indexOf' } },
    { name: 'b642str', msg: 'can not convert b64 to str', mk: (f, o) => ['YWJj', o], trig: { proto: 'String.prototype.indexOf' } },
    { name: 'b642u16arr', msg: 'can not convert b64 to u16a', mk: (f, o) => ['AQACAAMA', o], trig: { global: 'Uint16Array' } },
    { name: 'b642u8arr', msg: 'can not convert b64 to u8a', mk: (f, o) => ['YWJj', o], trig: { proto: 'String.prototype.indexOf' } },
    { name: 'bs2u8arr', msg: 'can not convert bs to u8a', mk: (f, o) => ['abc', o], trig: { proto: 'String.prototype.charCodeAt' } },
    { name: 'j2o', msg: 'can not convert v to obj', label: '[wsemi j2o] can not parse', mk: (f, o) => ['{"a":1}', o], trig: { proto: 'JSON.parse' } },
    { name: 'str2aes', msg: 'can not convert str to aes', mk: (f, o) => ['abc', 'k', false, o], trig: { proto: 'String.prototype.indexOf' } },
    { name: 'str2b64', msg: 'can not convert str to b64', mk: (f, o) => ['abc', o], trig: { proto: 'String.prototype.charAt' } },
    { name: 'str2md5', msg: 'can not convert str to md5', mk: (f, o) => ['abc', false, o], trig: { proto: 'String.prototype.charCodeAt' } },
    { name: 'str2sha', msg: 'can not convert str to sha', mk: (f, o) => ['abc', 256, false, o], trig: { proto: 'String.prototype.charCodeAt' } },
    { name: 'str2u8arr', msg: 'can not convert str to u8a', mk: (f, o) => ['abc', o], trig: { proto: 'TextEncoder.prototype.encode' } },
    { name: 'time2day', msg: 'can not convert time', mk: (f, o) => [T, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'time2hour', msg: 'can not convert time', mk: (f, o) => [T, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'time2min', msg: 'can not convert time', mk: (f, o) => [T, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timeTZ2day', msg: 'can not convert time', mk: (f, o) => [TZ1, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timeTZ2hour', msg: 'can not convert time', mk: (f, o) => [TZ1, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timeTZ2min', msg: 'can not convert time', mk: (f, o) => [TZ1, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timems2day', msg: 'can not convert time', mk: (f, o) => [TMS, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timems2hour', msg: 'can not convert time', mk: (f, o) => [TMS, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timems2min', msg: 'can not convert time', mk: (f, o) => [TMS, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timems2time', msg: 'can not convert time', mk: (f, o) => [TMS, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timemsTZ2day', msg: 'can not convert time', mk: (f, o) => [TMSZ, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timemsTZ2hour', msg: 'can not convert time', mk: (f, o) => [TMSZ, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timemsTZ2min', msg: 'can not convert time', mk: (f, o) => [TMSZ, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'timemsTZ2time', msg: 'can not convert time', mk: (f, o) => [TMSZ, o], trig: { proto: 'String.prototype.slice' } },
    { name: 'u16arr2b64', msg: 'can not convert u16a to b64', mk: (f, o) => [detached(Uint16Array, [1, 2, 3]), o], trig: { input: 'detached Uint16Array' }, okMk: (f, o) => [U16(), o] },
    { name: 'u16arr2u8arr', msg: 'can not convert u16a to u8a', mk: (f, o) => [detached(Uint16Array, [1, 2, 3]), o], trig: { input: 'detached Uint16Array' }, okMk: (f, o) => [U16(), o] },
    { name: 'u8arr2ab', msg: 'can not convert u8a to ab', mk: (f, o) => [U8(), o], trig: { proto: 'ArrayBuffer.prototype.slice' } },
    { name: 'u8arr2b64', msg: 'can not convert u8a to b64', mk: (f, o) => [U8(), o], trig: { proto: 'String.prototype.charAt' } },
    { name: 'u8arr2blob', msg: 'can not convert u8a to blob', mk: (f, o) => [U8(), o], trig: { proto: 'ArrayBuffer.prototype.slice' } },
    { name: 'u8arr2bs', msg: 'can not convert u8a to bs', mk: (f, o) => [U8(), o], trig: { proto: 'String.fromCharCode' } },
    { name: 'u8arr2str', msg: 'can not convert u8a to str', mk: (f, o) => [U8(), o], trig: { proto: 'TextDecoder.prototype.decode' } },
    { name: 'u8arr2u16arr', msg: 'can not convert u8a to u16a', mk: (f, o) => [detached(Uint8Array, [1, 2, 3, 4]), o], trig: { input: 'detached Uint8Array' }, okMk: (f, o) => [U8(), o] },
]

//MIRRORS: 其餘5站(try內之呼叫皆為已自帶try之函數或無可觸發之內建函數): 於src之鏡像複本中把其所呼叫之相依模組換為「呼叫即拋MARK」之替身, 使catch被觸發
//  repl為[被替身之檔名, 替身原始碼]; dflt為預設模式之期望(cint於預設模式拋出Error, 其餘回傳輸出型別之空值)
let THROWER = (name) => `export default function ${name}() { throw new Error(${JSON.stringify(MARK)}) }\n`
let MIRRORS = [
    { name: 'cint', msg: 'can not convert v to integer', mk: (f, o) => [1.5, o], repl: ['cdbl.mjs', THROWER('cdbl')], dflt: 'throws' },
    { name: 'b642obj', msg: 'can not convert b64 to obj', mk: (f, o) => ['eyJhIjoxfQ==', o], repl: ['b642str.mjs', THROWER('b642str')], dflt: 'value' },
    { name: 'obj2b64', msg: 'can not convert obj to b64', mk: (f, o) => [{ a: 1 }, o], repl: ['o2j.mjs', THROWER('o2j')], dflt: 'value' },
    { name: 'obj2pb64', msg: 'can not convert data to b64', mk: (f, o) => [{ a: 1 }, 'k', o], repl: ['o2j.mjs', THROWER('o2j')], dflt: 'value' },
    { name: 'pb642obj', msg: 'can not convert b64 to data', mk: (f, o) => ['YWJj', 'k', o], repl: ['aes2str.mjs', THROWER('aes2str')], dflt: 'value' },
]


//needs, 各站之mk會取用之其他函數(如str2aes)
let NEEDS = ['str2aes']


//loadAll, 自root載入各站函數與needs, 回傳{ 名稱: 函數 }
async function loadAll(root) {
    let names = [...new Set([...SITES.map((s) => s.name), ...NEEDS])]
    let fns = {}
    for (let n of names) {
        fns[n] = (await import(pathToFileURL(path.join(root, `${n}.mjs`)).href)).default
    }
    return fns
}


//callWithFault, 先備妥引數(含opt), 再安裝觸發(proto類)、呼叫、還原; 回傳{ r, thrown }, 斷言一律於還原後進行
function callWithFault(site, fns, opt) {
    let args = site.mk(fns, opt)
    let restore = null
    if (site.trig.proto) {
        let [obj, key] = PROTOS[site.trig.proto]
        restore = arm(obj, key)
    }
    else if (site.trig.global) {
        restore = armGlobal(site.trig.global)
    }
    let r
    let thrown = null
    try {
        r = fns[site.name](...args)
    }
    catch (err) {
        thrown = err
    }
    finally {
        if (restore) {
            restore()
        }
    }
    return { r, thrown }
}


export { MARK, SITES, MIRRORS, loadAll, callWithFault }
