import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isenum from './isenum.mjs'
import optVal from './_optVal.mjs'


//本檔為內部使用, 不由index匯出


/**
 * 廣義數字陣列之計算(arrAdd、arrMulti、arrAccum、arrProduct、arrNorm)共用之opt.base與「每個陣列至少1個有效數字」(單一擁有者)
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉§11 第221項待決第15項(使用者2026-10-31)
 *   基於廣義數字之陣列, 於計算處理時, 僅針對[有效數字類]處理, 非有效數字一律以該函數之基準值opt.base代入(arrAdd 0、arrMulti 1、arrAccum 0、arrProduct 0、arrNorm 0);
 *   每個輸入陣列各自至少要有1個有效數字(含空陣列, 皆視為0個), 否則throw Error(`invalid <名稱>: must contain a valid number`), 多陣列帶索引如invalid arrs[1]
 *   opt.base以isenum判定, 非預期(K3)視為未給、改用預設, opt.debug為true時警告
 */


//分離不定參數中的陣列與opt: 最後一個參數為一般物件(非陣列)即為opt; 最後一個參數為undefined或null視為未給opt(呼叫端寫arrAdd(a, b, opt)而opt可能未定義時, 不當成第3個陣列)
function splitArrs(args) {
    let arrs = Array.prototype.slice.call(args)
    let opt = null
    if (arrs.length > 0) {
        let last = arrs[arrs.length - 1]
        if (last === undefined || last === null) {
            arrs.pop()
        }
        else {
            let b = false
            try {
                b = isobj(last)
            }
            catch (err) {
                b = false
            }
            if (b) {
                opt = arrs.pop()
            }
        }
    }
    return { arrs, opt }
}


//取opt.base: 讀取一次(快照), 讀取拋錯視為未給; 非預期改用預設def
function getBase(opt, def, fn) {
    let isObjOpt = false
    try {
        isObjOpt = typeof opt === 'object' && opt !== null && !Array.isArray(opt) //Array.isArray對已撤銷之Proxy會拋錯
    }
    catch (err) {
        isObjOpt = false
    }
    if (!isObjOpt) {
        return def //opt非物件(含未給、讀不到)視為未給, 無從帶debug
    }
    let v
    try {
        v = opt.base
    }
    catch (err) {
        v = undefined
    }
    return optVal(v, def, { fn, name: 'opt.base', kind: 'enum' }, opt)
}


//陣列內是否至少有1個有效數字
function hasValid(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (isenum(arr[i])) {
            return true
        }
    }
    return false
}


//檢查每個陣列各自至少1個有效數字, 否則throw; name為陣列參數名(如'arrs'、'vec'), multi為true時帶索引
function chkValid(arrs, name, multi) {
    for (let i = 0; i < arrs.length; i++) {
        if (!hasValid(arrs[i])) {
            throw new Error(`invalid ${name}${multi ? `[${i}]` : ''}: must contain a valid number`)
        }
    }
}


//n個同長度陣列逐位置運算: 無法運算之容器回傳[](參數少於2個、非陣列、長度不同, 處置不變); 有效數字取值為去頭尾空白後Number, 非有效數字以base代入; fun為(累計值, 元素值)=>新累計值, init為累計初始值
function reduceArrs(arrs, opt, fn, base, init, fun) {

    //check
    if (arrs.length < 2) {
        return []
    }
    for (let a of arrs) {
        if (!isarr(a)) {
            return []
        }
    }
    let n = arrs[0].length
    for (let a of arrs) {
        if (a.length !== n) {
            return []
        }
    }

    //每個陣列各自至少1個有效數字
    chkValid(arrs, 'arrs', true)

    //base
    let b = getBase(opt, base, fn)

    let r = []
    for (let k = 0; k < n; k++) {
        let t = init
        for (let a of arrs) {
            let v = a[k]
            t = fun(t, isenum(v) ? Number(v) : b)
        }
        r.push(t)
    }

    return r
}


export { splitArrs, getBase, chkValid, reduceArrs }
