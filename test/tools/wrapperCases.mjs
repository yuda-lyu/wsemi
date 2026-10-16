//R-WRAPPER-01 之輸入空間表: src內is*與cbol、cdbl、cint、cstr函數 × 原始值軸, 比較f(p)與f(Object(p))(包裝物件new String/Number/Boolean)
//  由tmp/run01-1016/self/probe-wrapper.mjs收斂, 即帳本R-WRAPPER-01之盤點指令(以readdir自src取函數全集, 新增之is*函數自動入表)
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'


//srcDir, 與本工具同一份副本之src(test/tools之上兩層), 故於HEAD副本執行時讀副本之src
let srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src')


//skip, 不入表之函數: 環境判斷(R-ENV-01)與DOM元素、Blob/File、Promise之型別判斷, 判定對象非原始值
let skip = new Set(['isDev', 'isIE', 'isWindow', 'isEle', 'isEleExistByID', 'isNarrow', 'isfile', 'isblob', 'ispm'])


//prims, 原始值軸: 字串(空、空白、文字、數字字串、'NaN'、布林字串、日期與時間字串、Email)、數字(0、正負整數與小數、NaN、Infinity)、布林
let prims = ['', ' ', 'a', 'abc', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', '2020-01-01', '2020-01-01T00:00:00', 'a@b.cc', 0, 1, -1, 1.5, -1.5, NaN, Infinity, true, false]


//rule2Fns, R-WRAPPER-01 規則2涵蓋之函數: 值判定函數(isestr、isstr0、isnan)與cbol, 及其上之iser、isernot、isnum族、cstr、isUserName、isUserIdentify
let rule2Fns = ['isestr', 'isstr0', 'isnan', 'cbol', 'iser', 'isernot', 'isnum', 'isint', 'isn0int', 'isn0num', 'isp0int', 'isp0num', 'cstr', 'isUserName', 'isUserIdentify']


//rule3Cells, R-WRAPPER-01 規則3所列不保證拆包之格(設計限制): cbol(new Number(1))為false、isday與istime對包裝字串為false
let rule3Cells = [
    { fn: 'cbol', prim: 'number:1', resPrim: 'boolean:true', resWrap: 'boolean:false' },
    { fn: 'isday', prim: 'string:2020-01-01', resPrim: 'boolean:true', resWrap: 'boolean:false' },
    { fn: 'istime', prim: 'string:2020-01-01T00:00:00', resPrim: 'boolean:true', resWrap: 'boolean:false' },
]


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


//diffTable, 跑全表: 回傳函數全集與f(p)、f(Object(p))結果不同之格
async function diffTable() {
    let names = listFns()
    let rows = []
    for (let n of names) {
        let mod = await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)
        let f = mod.default
        for (let p of prims) {
            let rp = await call(f, p)
            let rw = await call(f, Object(p))
            if (rp !== rw) {
                rows.push({ fn: n, prim: show(p), resPrim: rp, resWrap: rw })
            }
        }
    }
    return { names, rows }
}


export { skip, prims, rule2Fns, rule3Cells, show, call, listFns, diffTable }
