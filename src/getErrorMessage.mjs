import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import ispint from './ispint.mjs'
import isestr from './isestr.mjs'
import cint from './cint.mjs'


//本函數刻意不使用isErr、isstr、isobj、isarr等型別守衛做分派
//  原因: 該四者皆建立於Object.prototype.toString.call與lodash isError之上, 而
//    (1) Object.prototype.toString.call會觸發Symbol.toStringTag之getter
//    (2) lodash isError第三子句會讀取value.message
//    (3) haskey之key in obj會觸發Proxy之has陷阱
//  三者皆可拋錯, 且拋在任何try之前, 故「先判型別再分支」之架構無法以逐點包try補完
//  改採候選階梯: 不做型別分派, 依序嘗試各候選來源, 每階獨立try, 取第一個非空字串


//prim, 值轉字串, 只處理證實不觸發使用者程式碼者, 其餘回''交由後段處理
//  typeof對任何值(含已撤銷之Proxy)皆不拋錯, 是唯一絕對安全之型別探測
function prim(v) {
    let t = typeof v
    if (t === 'string') {
        return v
    }
    if (v === null || v === undefined) {
        return ''
    }
    if (t === 'number' || t === 'boolean' || t === 'bigint') {
        return String(v)
    }
    if (t === 'symbol') {
        return String(v) //Symbol僅String()可轉, 樣板字面量與+皆拋TypeError
    }
    return ''
}


//attempt, 執行取值函數並保證回傳字串, 任何拋錯或非字串一律回''
function attempt(fn) {
    try {
        let v = fn()
        return (typeof v === 'string') ? v : ''
    }
    catch (err) {
        return ''
    }
}


//jsonSafe, 序列化並保證回傳字串, 去環、轉BigInt、限深度, 全程不拋錯
//  不用o2j之理由: o2j之契約為「序列化失敗回空字串」, 對循環參照與BigInt一律回''
//  本函數需要的是盡力降級(環處填[Circular]、BigInt轉字串、超深填[Deep]), 若改動o2j
//  將變更其既有契約而波及其呼叫端, 故於此另行實作
function jsonSafe(v, levelMax) {
    try {
        let seen = new WeakSet()
        let stack = []
        let r = JSON.stringify(v, function(k, val) {
            while (stack.length > 0 && stack[stack.length - 1] !== this) {
                stack.pop()
            }
            if (stack.length >= levelMax) {
                return '[Deep]'
            }
            if (typeof val === 'bigint') {
                return String(val)
            }
            if (val !== null && typeof val === 'object') {
                if (seen.has(val)) {
                    return '[Circular]'
                }
                seen.add(val)
                stack.push(val)
            }
            return val
        })
        //JSON.stringify對undefined、Symbol、函數、以及toJSON回undefined者
        //會「正常回傳undefined」而非拋錯, 故不可只靠try catch, 須驗回傳型別
        return (typeof r === 'string') ? r : ''
    }
    catch (err) {
        return ''
    }
}


//unquote, toJSON回字串者(如Date)之JSON輸出會多包一層引號, 剝掉才是可讀值
function unquote(j) {
    if (j.length >= 2 && j[0] === '"' && j[j.length - 1] === '"') {
        let u = attempt(() => {
            return JSON.parse(j)
        })
        if (u !== '') {
            return u
        }
    }
    return j
}


//normalizeMsg, message為非字串時轉為字串
function normalizeMsg(raw, levelMax) {
    if (raw === undefined) {
        return '' //視為無message, 由呼叫端往下一階
    }
    if (raw === null) {
        return 'null'
    }
    let p = prim(raw)
    if (p !== '') {
        return p
    }
    let j = jsonSafe(raw, levelMax)
    if (j !== '' && j !== '{}') {
        return unquote(j)
    }
    let s = attempt(() => {
        return String(raw)
    })
    if (s !== '' && s !== '[object Object]') {
        return s
    }
    return j
}


//readCause, 沿cause鏈取根因
//  WeakSet與深度上限兩者皆需: WeakSet擋環(自我參照、互相參照), 深度上限擋合法之超長鏈
function readCause(err, o) {
    let seen = new WeakSet()
    if (err !== null && (typeof err === 'object' || typeof err === 'function')) {
        seen.add(err) //起點須先入集合, 否則a->b->a會把a再展開一次
    }
    let cur = err
    let ms = []
    for (let i = 0; i < o.levelCauseMax; i++) {
        let nx = null
        try {
            nx = cur.cause
        }
        catch (_err) {
            break
        }
        if (nx === null || nx === undefined) {
            break
        }
        if (typeof nx === 'object' || typeof nx === 'function') {
            if (seen.has(nx)) {
                break
            }
            seen.add(nx)
        }
        let m = core(nx, { ...o, useCause: false, useAggregate: false })
        if (m !== '') {
            ms.push(m)
        }
        cur = nx
    }
    return ms.join(' <- ')
}


//readAggregate, 取AggregateError之errors各項message
function readAggregate(err, o) {
    let arr = null
    try {
        arr = err.errors
    }
    catch (_err) {
        return ''
    }
    if (!Array.isArray(arr) || arr.length === 0) {
        return ''
    }
    let ms = []
    for (let i = 0; i < arr.length && i < o.levelCauseMax; i++) {
        if (arr[i] === err) {
            continue //errors含自身者跳過, 避免重複展開
        }
        let m = core(arr[i], { ...o, useCause: false, useAggregate: false })
        if (m !== '') {
            ms.push(m)
        }
    }
    return ms.join('; ')
}


//core, 候選階梯本體
function core(err, o) {

    //階0, typeof快篩, 對原始型別直接回, 零成本且絕對安全, 涵蓋最常見之throw 'msg'
    if (typeof err === 'string') {
        return err //含空字串, 原樣回傳
    }
    if (err === null || err === undefined) {
        return ''
    }
    if (typeof err === 'number') {
        return Number.isNaN(err) ? '' : String(err)
    }
    if (typeof err === 'boolean' || typeof err === 'bigint' || typeof err === 'symbol') {
        return String(err)
    }

    //以下err必為object或function

    //階1, 取message, 全程只讀一次
    let raw = null
    let bMsg = false
    try {
        raw = err.message
        bMsg = true
    }
    catch (_err) {
        bMsg = false
    }

    if (bMsg && typeof raw === 'string') {

        //message為非空字串, 直接為結果
        if (raw !== '') {
            let head = raw
            if (o.useCause) {
                let c = readCause(err, o)
                if (c !== '') {
                    head = `${head} <- ${c}`
                }
            }
            if (o.useAggregate) {
                let a = readAggregate(err, o)
                if (a !== '') {
                    head = `${head} [${a}]`
                }
            }
            return head
        }

        //message為空字串, 屬「有message欄位但無內容」, 沿用既有語意回空字串
        //  惟若有cause則取之, 因該情形下呼叫端與本函數皆取不到任何資訊, 而資訊確實存在
        let c = readCause(err, o)
        if (c !== '') {
            return c
        }
        return ''
    }

    //message非字串者先正規化
    if (bMsg) {
        let m = normalizeMsg(raw, o.levelJsonMax)
        if (m !== '') {
            return m
        }
    }

    //階2, cause與aggregate, 用於無message但有此二者之情形
    let c = readCause(err, o)
    if (c !== '') {
        return c
    }
    if (o.useAggregate) {
        let a = readAggregate(err, o)
        if (a !== '') {
            return a
        }
    }

    //階3, JSON序列化
    let j = jsonSafe(err, o.levelJsonMax)
    let ju = unquote(j)
    if (ju !== '' && ju !== '{}') {
        return ju
    }

    //階4, String(err), 救回Date、RegExp、函數、Map、宿主物件等JSON給不出內容者
    let s = attempt(() => {
        return String(err)
    })
    if (s !== '' && s !== '[object Object]') {
        return s
    }

    //階5, 型別標籤, 本身亦會觸發Symbol.toStringTag之getter故包try
    let t = attempt(() => {
        return Object.prototype.toString.call(err)
    })
    if (t !== '' && t !== '[object Object]') {
        return t
    }

    //階6, 序列化結果縱為'{}'仍優於空字串
    if (j !== '') {
        return j
    }

    return ''
}


/**
 * 提取Error內Message訊息
 * err接受任意輸入，於任何err下皆不拋出錯誤且回傳值必為字串
 * 此不拋錯之保證不涵蓋opt，因opt係呼叫端自備之設定物件，其讀取比照本套件慣例不另包try
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getErrorMessage.test.mjs Github}
 * @memberOf wsemi
 * @param {*} err 傳入任意錯誤資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useCause=false] 輸入是否串接cause鏈布林值，若為true則將各層cause之訊息以' <- '串接，預設false。惟外層message為空字串時，不論本項為何皆取cause，因該情形下無其他資訊來源
 * @param {Boolean} [opt.useAggregate=false] 輸入是否附加AggregateError之errors各項訊息布林值，若為true則以'; '串接後置於方括號內，預設false
 * @param {Integer} [opt.levelCauseMax=8] 輸入cause鏈與errors之最大展開層數正整數，預設8
 * @param {Integer} [opt.levelJsonMax=6] 輸入序列化之最大巢狀深度正整數，超過者以'[Deep]'表示，預設6
 * @param {Integer} [opt.lengthMessageMax=0] 輸入回傳字串之最大長度正整數，超過者截斷並以'...'標記，該標記計入本上限內，預設0代表不限制長度
 * @returns {String} 回傳錯誤訊息字串。無法提取時回傳空字串。序列化時循環參照處以'[Circular]'表示、BigInt轉為字串，此二標記不做跳脫，應用資料內若恰有相同字串將無法分辨
 * @example
 *
 * try {
 *     throw new Error('something wrong')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => something wrong
 *
 * try {
 *     throw new Error()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ''
 *
 * try {
 *     throw new TypeError('wrong type')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => wrong type
 *
 * try {
 *     throw new RangeError('range bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => range bad
 *
 * try {
 *     throw new ReferenceError('ref bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ref bad
 *
 * try {
 *     throw new SyntaxError('syntax bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => syntax bad
 *
 * try {
 *     throw new URIError('uri bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => uri bad
 *
 * try {
 *     throw new AggregateError([new Error('e1'), 'e2'], 'outer')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => outer
 *
 * try {
 *     throw new AggregateError([new Error('e1'), new Error('e2')], 'outer')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err, { useAggregate: true }))
 * }
 * // => outer [e1; e2]
 *
 * try {
 *     throw new Error('top', { cause: new Error('root cause') })
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => top
 *
 * try {
 *     throw new Error('top', { cause: new Error('root cause') })
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err, { useCause: true }))
 * }
 * // => top <- root cause
 *
 * try {
 *     throw new Error('', { cause: new Error('root only') })
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => root only
 *
 * try {
 *     throw new DOMException('operation was aborted.', 'AbortError')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => operation was aborted.
 *
 * try {
 *     fs.readFileSync('definitely_not_exists_1234567890.txt')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ENOENT: no such file or directory, open ...
 *
 * let o = { a: 1 }
 * o.self = o
 * console.log(getErrorMessage(o))
 * // => {"a":1,"self":"[Circular]"}
 *
 * console.log(getErrorMessage({ v: 10n }))
 * // => {"v":"10"}
 *
 * console.log(getErrorMessage({ message: 123 }))
 * // => 123
 *
 * console.log(getErrorMessage(/ab/g))
 * // => /ab/g
 *
 * let test1 = async() => {
 *     return Promise.reject('promise reject')
 * }
 * try {
 *     await test1()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => promise reject
 *
 * let test2 = async() => {
 *     throw new Error('something wrong')
 * }
 * try {
 *     await test2()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => something wrong
 *
 * let test3 = async() => {
 *     throw new Error()
 * }
 * try {
 *     await test3()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ''
 *
 * let test4 = async() => {
 *     throw new TypeError('wrong type')
 * }
 * try {
 *     await test4()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => wrong type
 *
 */
function getErrorMessage(err, opt = {}) {

    //useCause
    let useCause = get(opt, 'useCause', null)
    if (!isbol(useCause)) {
        useCause = false
    }

    //useAggregate
    let useAggregate = get(opt, 'useAggregate', null)
    if (!isbol(useAggregate)) {
        useAggregate = false
    }

    //levelCauseMax
    let levelCauseMax = get(opt, 'levelCauseMax', null)
    if (!ispint(levelCauseMax, { useLimitSafe: true })) {
        levelCauseMax = 8
    }
    levelCauseMax = cint(levelCauseMax)

    //levelJsonMax
    let levelJsonMax = get(opt, 'levelJsonMax', null)
    if (!ispint(levelJsonMax, { useLimitSafe: true })) {
        levelJsonMax = 6
    }
    levelJsonMax = cint(levelJsonMax)

    //lengthMessageMax
    let lengthMessageMax = get(opt, 'lengthMessageMax', null)
    if (!ispint(lengthMessageMax, { useLimitSafe: true })) {
        lengthMessageMax = 0
    }
    lengthMessageMax = cint(lengthMessageMax)

    //optCore
    let optCore = {
        useCause,
        useAggregate,
        levelCauseMax,
        levelJsonMax,
        lengthMessageMax,
    }

    //r, 整體try, 任何未預期之拋錯皆有底, 使本函數於任何輸入下皆不拋錯
    let r = ''
    try {
        r = core(err, optCore)
    }
    catch (_err) {
        r = ''
        return r
    }

    //出口正規化, 保證回傳字串
    if (!isestr(r)) {
        r = ''
        return r
    }

    //截斷, 使回傳長度不超過lengthMessageMax, 避免超長訊息塞爆日誌
    //  '...'標記計入上限內, 故回傳長度必然小於等於lengthMessageMax; 上限不大於3時無空間置放標記故直接截斷
    if (optCore.lengthMessageMax > 0 && r.length > optCore.lengthMessageMax) {
        if (optCore.lengthMessageMax > 3) {
            r = r.slice(0, optCore.lengthMessageMax - 3) + '...'
        }
        else {
            r = r.slice(0, optCore.lengthMessageMax)
        }
    }

    return r
}


export default getErrorMessage
