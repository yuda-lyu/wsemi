/**
 * 以內部槽判定ArrayBuffer與型別陣列之種類(內部共用不對外)，不讀Symbol.toStringTag、不觸發Proxy之陷阱
 *
 * Symbol.toStringTag可被偽造(一般物件冒充ArrayBuffer、Uint8Array)或被覆寫(真實例改標籤)，故不以Object.prototype.toString判型；
 * 模組載入時取得內建之存取器(ArrayBuffer.prototype.byteLength、%TypedArray%.prototype[Symbol.toStringTag])，其後被覆寫不影響結果；
 * 存取器對非該類之內部槽之物件(含Proxy、已撤銷之Proxy、原始值)拋TypeError，一律視為否，故對任何輸入皆不拋錯；跨realm(vm、iframe)之真實例亦可判定
 */

//取存取器(載入時), 取不到(極舊之引擎, 缺ES2015之內建存取器)者為null, 其後退為內部標籤判定(舊行為, 可被偽造標籤通過); 現行之Node、瀏覽器皆有
let getGetter = (obj, key) => {
    try {
        let d = Object.getOwnPropertyDescriptor(obj, key)
        return d && typeof d.get === 'function' ? d.get : null
    }
    catch (err) {
        return null
    }
}

//abLen, ArrayBuffer.prototype.byteLength之存取器(非共用之ArrayBuffer才有內部槽, SharedArrayBuffer拋TypeError)
let abLen = getGetter(ArrayBuffer.prototype, 'byteLength')

//taName, %TypedArray%.prototype[Symbol.toStringTag]之存取器: 型別陣列回傳其內部槽之名稱(如'Uint8Array'), 非型別陣列回傳undefined
let taName = getGetter(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag)

//toStr, Object.prototype.toString(載入時取得), 僅供缺存取器時之退路
let toStr = Function.prototype.call.bind(Object.prototype.toString)


//isArrayBuffer, 是否為ArrayBuffer(不含SharedArrayBuffer)
function isArrayBuffer(v) {
    try {
        if (abLen === null) {
            return toStr(v) === '[object ArrayBuffer]'
        }
        abLen.call(v)
        return true
    }
    catch (err) {
        return false
    }
}


//typedArrayName, 型別陣列之名稱('Uint8Array'、'Uint16Array'等, Node之Buffer為'Uint8Array'), 非型別陣列回傳''
function typedArrayName(v) {
    try {
        if (taName === null) {
            return toStr(v).slice(8, -1)
        }
        let n = taName.call(v)
        return typeof n === 'string' ? n : ''
    }
    catch (err) {
        return ''
    }
}


export { isArrayBuffer, typedArrayName }
