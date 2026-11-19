//randBounds.mjs: 隨機範圍函數(random*Range、pseudoRandom*Range)「實際採用之邊界」之觀察器(ws492j)
//  背景: vstart > vend 之訊息原為'vstart[x] > vend[y]', 測試藉此取出實際採用之邊界; V20(不回顯輸入值)改為固定訊息'invalid vstart: must be <= vend'後無從由訊息得知,
//  改以「vstart <= vend 才不拋錯」之性質驗證: 採用之vstart為exp, 當且僅當 fn(v, exp) 不拋錯、且 fn(v, 比exp小之最近值) 因 vstart > vend 而拋錯(vend側對稱).
//  兩次探測之範圍寬度皆為0或立即拋錯, 不會建立巨大範圍(Ndp系亦安全).
//  同一helper只定義一次, 供optValG4randRandom、optValG6strArrNum與子行程執行器共用

const BOUND_MSG = 'invalid vstart: must be <= vend'
const MAX_SAFE = Number.MAX_SAFE_INTEGER


//run, 回傳'ok'(不拋錯)、'bound'(因vstart > vend拋錯)或'ERR:訊息'(其他錯誤)
function run(f) {
    try {
        f()
        return 'ok'
    }
    catch (err) {
        return err.message === BOUND_MSG ? 'bound' : `ERR:${err.message}`
    }
}


//keyOf、fromKey, double與有序整數鍵之互轉(鍵相鄰即為相鄰之double)
function keyOf(x) {
    let dv = new DataView(new ArrayBuffer(8))
    dv.setFloat64(0, x)
    let n = dv.getBigUint64(0)
    return (n >> 63n) ? -(n & 0x7fffffffffffffffn) : n
}
function fromKey(k) {
    let n = k < 0n ? ((-k) | (1n << 63n)) : k
    let dv = new DataView(new ArrayBuffer(8))
    dv.setBigUint64(0, n)
    return dv.getFloat64(0)
}


//next, x之相鄰值(dir為1或-1); 整數系為x+dir, 實數系為相鄰之double
function next(x, kind, dir) {
    if (kind === 'int') {
        return x + dir
    }
    return fromKey(keyOf(x) + BigInt(dir))
}


//inRange, 相鄰值是否仍為該系之有效範圍(整數系限安全整數, 實數系限有限數)
function inRange(x, kind) {
    return kind === 'int' ? Math.abs(x) <= MAX_SAFE : Number.isFinite(x)
}


//probeVstart, 給vstart為v、取得實際採用之vstart
//  exp為undefined: 期望v為無效, 回傳'ERR:訊息'(v有效則回'ok'或'bound', 使比對失敗)
//  exp為數字: 期望採用值為exp, 符合則回傳exp, 否則回傳說明字串(使比對失敗)
function probeVstart(fn, kind, v, exp) {
    if (exp === undefined) {
        return run(() => fn(v, 0))
    }
    let a = run(() => fn(v, exp))
    if (a !== 'ok') {
        return a.startsWith('ERR:') ? a : `adopted vstart > ${exp}`
    }
    let lower = next(exp, kind, -1)
    if (!inRange(lower, kind)) {
        return exp
    }
    let b = run(() => fn(v, lower))
    if (b === 'bound') {
        return exp
    }
    return b.startsWith('ERR:') ? b : `adopted vstart <= ${lower}`
}


//probeVend, 給vend為v、取得實際採用之vend(規則同probeVstart)
function probeVend(fn, kind, v, exp) {
    if (exp === undefined) {
        return run(() => fn(0, v))
    }
    let a = run(() => fn(exp, v))
    if (a !== 'ok') {
        return a.startsWith('ERR:') ? a : `adopted vend < ${exp}`
    }
    let upper = next(exp, kind, 1)
    if (!inRange(upper, kind)) {
        return exp
    }
    let b = run(() => fn(upper, v))
    if (b === 'bound') {
        return exp
    }
    return b.startsWith('ERR:') ? b : `adopted vend >= ${upper}`
}


export { BOUND_MSG, run, next, probeVstart, probeVend }
