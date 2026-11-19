//R-WRAPPER-01 之輸入空間表: src內is*與cbol、cdbl、cint、cstr函數 × 原始值軸, 比較f(p)與f(Object(p))(包裝物件new String/Number/Boolean)
//  即帳本R-WRAPPER-01之盤點指令(以readdir自src取函數全集, 新增之is*函數自動入表)
//  契約(使用者2026-11-16 W-20; dspec〈輸入參數之檢測機制〉§11 包裝物件):
//    判斷函數(is*)只收原始值, 包裝物件一律為無效(判斷結果為false, 以判斷函數守門者依其類別之失敗通道處理);
//    轉型函數(cbol、cdbl、cint、cstr)照舊拆包, f(Object(p))與f(p)結果相同
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'


//srcDir, 與本工具同一份副本之src(test/tools之上兩層), 故於HEAD副本執行時讀副本之src
let srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src')


//skip, 不入表之函數: 環境判斷(R-ENV-01)與DOM元素、Blob/File、Promise之型別判斷, 判定對象非原始值
let skip = new Set(['isDev', 'isIE', 'isWindow', 'isEle', 'isEleExistByID', 'isNarrow', 'isfile', 'isblob', 'ispm'])


//prims, 原始值軸: 字串(空、空白、文字、數字字串、'NaN'、布林字串、日期與時間字串、Email)、數字(0、正負整數與小數、NaN、Infinity)、布林
let prims = ['', ' ', 'a', 'abc', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', '2020-01-01', '2020-01-01T00:00:00', 'a@b.cc', 0, 1, -1, 1.5, -1.5, NaN, Infinity, true, false]


//converters, 轉型函數(照舊拆包): 包裝物件與其原始值之結果相同
let converters = ['cbol', 'cdbl', 'cint', 'cstr']


//judgeWrapExpect, 判斷函數(is*)對任一包裝物件之期望結果: 預設一律false; 例外為語意相反或回傳非布林者
//  isernot: iser之反面, 包裝物件為有值(非空字串、非NaN), iser為false故isernot為true
//  isUserName、isUserIdentify: 驗證函數, 回傳Promise, 包裝字串為無效輸入故reject(同非字串輸入之失敗通道)
//  isUserPw: 驗證函數, 非原始字串即同步拋固定訊息(既有契約)
let judgeWrapExpect = {
    isernot: 'boolean:true',
    isUserName: 'reject:string:請填入姓名',
    isUserIdentify: 'reject:string:身份證字號非有效字串',
    isUserPw: 'THROW:密碼非有效字串',
}


//show, 結果轉可比較之字串: 原始值帶typeof, 物件帶內部標籤(故回傳包裝物件本身者與回傳原始值者可區分)
function show(v) {
    if (typeof v === 'number' && Number.isNaN(v)) {
        return 'NaN'
    }
    if (v !== null && typeof v === 'object') {
        return `obj:${Object.prototype.toString.call(v)}:${String(v)}`
    }
    return `${typeof v}:${String(v)}`
}


//call, 呼叫並記錄結果; 回傳Promise者記錄其resolve或reject值; 同步拋錯記為THROW
async function call(f, v) {
    try {
        let r = f(v)
        if (r && typeof r.then === 'function') {
            return await r.then((x) => `resolve:${show(x)}`, (e) => `reject:${show(e)}`)
        }
        return show(r)
    }
    catch (err) {
        return `THROW:${String(err && err.message)}`
    }
}


//listFns, 函數全集: src內is*.mjs與cbol、cdbl、cint、cstr, 扣除skip
function listFns() {
    return fs.readdirSync(srcDir)
        .filter((f) => /^(is[A-Za-z0-9]+|cbol|cdbl|cint|cstr)\.mjs$/.test(f))
        .map((f) => f.replace(/\.mjs$/, ''))
        .filter((n) => !skip.has(n))
}


//fullTable, 跑全表: 回傳函數全集與每格(函數 × 原始值)之f(p)、f(Object(p))結果
async function fullTable() {
    let names = listFns()
    let rows = []
    for (let n of names) {
        let mod = await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)
        let f = mod.default
        for (let p of prims) {
            let rp = await call(f, p)
            let rw = await call(f, Object(p))
            rows.push({ fn: n, prim: show(p), resPrim: rp, resWrap: rw })
        }
    }
    return { names, rows }
}


//wrapViolations, 逐格核對契約, 回傳違反者(空陣列表示全表符合)
//  轉型函數: resWrap須等於resPrim; 判斷函數: resWrap須等於judgeWrapExpect(預設'boolean:false')
function wrapViolations(rows) {
    let vs = []
    for (let c of rows) {
        if (converters.indexOf(c.fn) >= 0) {
            if (c.resWrap !== c.resPrim) {
                vs.push({ ...c, want: c.resPrim })
            }
            continue
        }
        let want = judgeWrapExpect[c.fn] !== undefined ? judgeWrapExpect[c.fn] : 'boolean:false'
        if (c.resWrap !== want) {
            vs.push({ ...c, want })
        }
    }
    return vs
}


export { skip, prims, converters, judgeWrapExpect, show, call, listFns, fullTable, wrapViolations }
