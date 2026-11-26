/**
 * 將opt之指定鍵各讀一次成為一般物件之快照(內部共用不對外)，讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)者該鍵視為未給
 *
 * 供「opt給了而不可讀須視為未給、不拋錯」之函數(K3；轉型函數依C1無法轉型回預設不拋錯)於入口取得安全之opt：
 * 其後之get(opt, key, 預設值)等讀取於快照上不再觸及呼叫端之物件，各鍵只讀一次(V11)
 * lazyKeys(預設debug、funLog)改為快照上之惰性存取器：被讀取時才於呼叫端之opt讀一次(拋錯為undefined)，使「只有非預期輸入時才讀opt.debug」之既有時序不變
 * 永不拋錯；opt為null、undefined或原始值時快照不含任何鍵
 *
 * @param {*} opt 輸入呼叫端之opt(任意值)
 * @param {Array} keys 輸入須讀取之鍵字串陣列
 * @param {Array} [lazyKeys=['debug', 'funLog']] 輸入須惰性讀取之鍵字串陣列，無須惰性讀取者給[]
 * @param {Boolean} [onlyOwn=false] 輸入是否只取自有鍵(Object.hasOwn)布林值，為true時繼承之鍵視為未給(供轉交給只認自有鍵之第三方函數，如he之encode、decode)，預設false
 * @returns {Object} 回傳opt之快照一般物件
 */
function pickOpt(opt, keys, lazyKeys = ['debug', 'funLog'], onlyOwn = false) {
    let o = {}
    let ok = opt !== null && opt !== undefined && (typeof opt === 'object' || typeof opt === 'function')
    if (!ok) {
        return o
    }
    for (let k of keys) {
        try {
            if (onlyOwn && !Object.hasOwn(opt, k)) {
                continue
            }
            let v = opt[k]
            if (v !== undefined) {
                o[k] = v
            }
        }
        catch (err) {
            //讀取拋錯視為未給
        }
    }
    for (let k of lazyKeys) {
        Object.defineProperty(o, k, {
            get: () => {
                try {
                    return opt[k]
                }
                catch (err) {
                    return undefined
                }
            },
            enumerable: true,
            configurable: true,
        })
    }
    return o
}


export default pickOpt
