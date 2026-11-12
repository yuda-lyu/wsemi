//本檔為內部使用, 不由index匯出


/**
 * browserView系之輸入品牌判定(內部使用): 以內建方法之內部槽檢查判定, 不採Object.prototype.toString之標籤(可由Symbol.toStringTag偽裝),
 * 不呼叫被檢測值之任何方法或存取器(Proxy、拋錯之getter一律為false而不拋出), 跨realm(iframe)之真物件仍有效
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉§3.4(S1非空字串、S2字串只收原始字串, 包裝物件無效)、§5(同步且有副作用者先於副作用throw)
 */


//內建存取器(ArrayBuffer、TypedArray、DataView者於模組載入時取一次, 皆為語言內建; 執行環境無該內建者為null)
function getter(proto, key) {
    try {
        let d = proto ? Object.getOwnPropertyDescriptor(proto, key) : undefined
        return d && typeof d.get === 'function' ? d.get : null
    }
    catch (err) {
        return null
    }
}
let gAbByteLength = typeof ArrayBuffer !== 'undefined' ? getter(ArrayBuffer.prototype, 'byteLength') : null //SharedArrayBuffer與非ArrayBuffer皆拋錯
let gAbDetached = typeof ArrayBuffer !== 'undefined' ? getter(ArrayBuffer.prototype, 'detached') : null //ES2024, 無者為null
let pTypedArray = typeof Uint8Array !== 'undefined' ? Object.getPrototypeOf(Uint8Array.prototype) : null
let gTaBuffer = getter(pTypedArray, 'buffer')
let gTaTag = getter(pTypedArray, Symbol.toStringTag) //%TypedArray%.prototype[@@toStringTag], 回內部名稱(非TypedArray回undefined)
let gDvBuffer = typeof DataView !== 'undefined' ? getter(DataView.prototype, 'buffer') : null


//Blob之size存取器, 於呼叫時才取(模組載入後才提供Blob之環境亦可用), 取得後快取
//瀏覽器之Blob以內部槽判定(Proxy、以真Blob為原型之物件皆無效); Node之Blob以屬性(kHandle)判定, Proxy包裝之真Blob或以真Blob為原型之物件於Node會被接受(本系列需window與document, 實務上只在瀏覽器執行)
let gBlobSize = null
function getBlobSize() {
    if (gBlobSize === null && typeof Blob !== 'undefined') {
        gBlobSize = getter(Blob.prototype, 'size')
    }
    return gBlobSize
}


//call, 以內建存取器取值, 拋錯回undefined
function call(g, v) {
    if (g === null) {
        return undefined
    }
    try {
        return g.call(v)
    }
    catch (err) {
        return undefined
    }
}


//isStrPrim, 原始字串(含空字串); 包裝物件new String為false
function isStrPrim(v) {
    return typeof v === 'string'
}


//isEstrPrim, 非空之原始字串
function isEstrPrim(v) {
    return typeof v === 'string' && v.length > 0
}


//isUsableAb, 非共享且未分離之ArrayBuffer(SharedArrayBuffer與已分離者無法建立Blob)
function isUsableAb(v) {
    if (typeof v !== 'object' || v === null) {
        return false
    }
    let n = call(gAbByteLength, v)
    if (n === undefined) {
        return false
    }
    if (gAbDetached !== null) {
        return call(gAbDetached, v) === false
    }
    //執行環境無detached存取器(ES2024前)者: 已分離之ArrayBuffer之byteLength為0, 以其建構Uint8Array會拋錯(真ArrayBuffer之建構只讀內部槽, 不呼叫輸入之存取器), 據以區分有效之零長度ArrayBuffer
    if (n === 0) {
        try {
            new Uint8Array(v) // eslint-disable-line no-new
        }
        catch (err) {
            return false
        }
    }
    return true
}


//viewBuffer, ArrayBuffer檢視(TypedArray或DataView)之底層緩衝區, 非檢視回undefined
function viewBuffer(v) {
    let isView = false
    try {
        isView = ArrayBuffer.isView(v)
    }
    catch (err) {
        isView = false
    }
    if (!isView) {
        return undefined
    }
    let b = call(gTaBuffer, v)
    if (b === undefined) {
        b = call(gDvBuffer, v)
    }
    return b
}


//isUsableView, 底層為非共享且未分離之ArrayBuffer之檢視
function isUsableView(v) {
    let b = viewBuffer(v)
    return b !== undefined && isUsableAb(b)
}


//isU8arrBrand, 底層可用之Uint8Array(以TypedArray之內部名稱判定, 不讀被檢測值之Symbol.toStringTag)
function isU8arrBrand(v) {
    return call(gTaTag, v) === 'Uint8Array' && isUsableView(v)
}


//isBlobBrand, Blob(含File與其子類)
function isBlobBrand(v) {
    if (typeof v !== 'object' || v === null) {
        return false
    }
    return typeof call(getBlobSize(), v) === 'number'
}


//isBlobPart, 可直接作為Blob內容之資料: 原始字串(可空)、Blob、可用之ArrayBuffer、底層可用之ArrayBuffer檢視
function isBlobPart(v) {
    return isStrPrim(v) || isBlobBrand(v) || isUsableAb(v) || isUsableView(v)
}


let browserData = {
    isStrPrim,
    isEstrPrim,
    isBlobBrand,
    isU8arrBrand,
    isBlobPart,
}


export default browserData
