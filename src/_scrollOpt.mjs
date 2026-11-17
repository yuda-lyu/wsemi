import isenum from './isenum.mjs'
import isobj from './isobj.mjs'
import cdbl from './cdbl.mjs'


//本檔為內部使用, 不由index匯出


//domScrollIntoView、domScrollTo之opt逐鍵檢測(W-05, 排程第492項: 本層有自用預設之鍵歸本層檢測, 不直通未知鍵給原生API)
//  每個鍵只讀一次(檢測之值即使用之值), 讀取拋錯(拋錯之getter、已撤銷之Proxy)視為未給
//  非預期之值視為未給(K3): 列舉鍵只收原始字串且為原生值域之成員(包裝物件new String、大小寫不同者皆非預期); 數值鍵須為有效數字(isenum)並以cdbl轉換


//列舉值域(原生ScrollIntoViewOptions與ScrollToOptions)
let BEHAVIORS = ['auto', 'instant', 'smooth']
let ALIGNS = ['start', 'center', 'end', 'nearest']


//isOptObj, opt是否為一般物件(isobj); 判型拋錯(已撤銷之Proxy使Object.prototype.toString拋錯)視為否, 整份opt視為{}
function isOptObj(v) {
    try {
        return isobj(v)
    }
    catch (err) {
        return false
    }
}


//read, 讀取opt之鍵, 讀取拋錯回傳undefined
function read(opt, key) {
    try {
        return opt[key]
    }
    catch (err) {
        return undefined
    }
}


//readEnum, 讀取列舉鍵, 值為允許集合之成員(嚴格相等, 故只收原始字串)則回傳之, 否則回傳undefined(視為未給)
function readEnum(opt, key, list) {
    let v = read(opt, key)
    return list.includes(v) ? v : undefined
}


//readNum, 讀取數值鍵, 有效數字(isenum)則回傳cdbl轉換後之值, 否則回傳undefined(視為未給)
function readNum(opt, key) {
    let v = read(opt, key)
    return isenum(v) ? cdbl(v) : undefined
}


export { BEHAVIORS, ALIGNS, isOptObj, readEnum, readNum }
