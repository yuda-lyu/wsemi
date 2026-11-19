//hostileValues, 「判斷函數不應拋錯」之輸入集: 已撤銷之Proxy(物件、函數、陣列)、陷阱全拋錯之Proxy、存取內部標籤或常讀鍵即拋錯之物件、元素存取即拋錯之陣列
//  供test/isThrowFree.test.mjs(逐函數盤點)與各判斷函數之測試共用, 同一集合只定義一次
//  dspec〈輸入參數之檢測機制〉§5.3 C2: 判斷類函數回布林、永不拋錯; 排程第492項第8批(ws492i)


//boom, 存取即拋錯
function boom() {
    throw new Error('boom')
}


//allTrapsThrow, 全部陷阱皆拋錯之Proxy處理器
function allTrapsThrow() {
    let h = {}
    for (let k of ['get', 'set', 'has', 'ownKeys', 'getPrototypeOf', 'getOwnPropertyDescriptor', 'defineProperty', 'deleteProperty', 'isExtensible', 'preventExtensions', 'setPrototypeOf', 'apply', 'construct']) {
        h[k] = boom
    }
    return h
}


//revoked, 建立後立即撤銷之Proxy
function revoked(target) {
    let r = Proxy.revocable(target, {})
    r.revoke()
    return r.proxy
}


//withGetter, 回傳帶有「讀取即拋錯」之鍵的物件(target為基底)
function withGetter(target, key) {
    Object.defineProperty(target, key, { get: boom, enumerable: true, configurable: true })
    return target
}


//tagThrows, 讀取Symbol.toStringTag即拋錯之一般物件
function tagThrows() {
    return {
        get [Symbol.toStringTag]() {
            throw new Error('boom')
        },
    }
}


//partialProxy, 只有指定陷阱拋錯之Proxy(其餘陷阱走預設), 內部標籤等讀取不受影響, 專供測「通過型別判定後之後續讀取(列舉鍵、取長度、取元素)拋錯」
function partialProxy(target, trapNames, onlyKeys) {
    let h = {}
    for (let t of trapNames) {
        h[t] = boom
    }
    if (onlyKeys) {
        //get陷阱只對指定鍵拋錯(如length、'0'), 其餘鍵(含Symbol.toStringTag)走預設
        h.get = (t, k, r) => {
            if (onlyKeys.includes(k)) {
                boom()
            }
            return Reflect.get(t, k, r)
        }
    }
    return new Proxy(target, h)
}


//hostileValues, 回傳[{ name, value, unjudgeable }]
//  unjudgeable為true者: 型別本身即無法判定(內部標籤讀取拋錯), 任何判斷函數皆回false(isernot為反面true);
//  為false者: 型別可判定(如一般物件、陣列、函數), 僅其後之存取(列舉鍵、取長度、取元素、讀常用鍵)拋錯, 判斷函數不得拋錯, 結果依型別而定
function hostileValues() {
    return [
        { name: 'revoked-object-proxy', value: revoked({}), unjudgeable: true },
        { name: 'revoked-function-proxy', value: revoked(function() {}), unjudgeable: true },
        { name: 'revoked-array-proxy', value: revoked([]), unjudgeable: true },
        { name: 'all-traps-throw-object-proxy', value: new Proxy({}, allTrapsThrow()), unjudgeable: true },
        { name: 'all-traps-throw-array-proxy', value: new Proxy([], allTrapsThrow()), unjudgeable: true },
        { name: 'all-traps-throw-function-proxy', value: new Proxy(function() {}, allTrapsThrow()), unjudgeable: true },
        { name: 'toStringTag-getter-throws', value: tagThrows(), unjudgeable: true },
        { name: 'length-getter-throws', value: withGetter({}, 'length'), unjudgeable: false },
        { name: 'constructor-getter-throws', value: withGetter({}, 'constructor'), unjudgeable: false },
        { name: 'then-getter-throws', value: withGetter({}, 'then'), unjudgeable: false },
        { name: 'nodeType-getter-throws', value: withGetter({}, 'nodeType'), unjudgeable: false },
        { name: 'valueOf-getter-throws', value: withGetter({}, 'valueOf'), unjudgeable: false },
        { name: 'array-first-element-getter-throws', value: withGetter([0], '0'), unjudgeable: false },
        { name: 'array-second-element-getter-throws', value: withGetter([0, 1], '1'), unjudgeable: false },
        { name: 'object-proxy-ownKeys-throws', value: partialProxy({ a: 1 }, ['ownKeys']), unjudgeable: false },
        { name: 'object-proxy-getPrototypeOf-throws', value: partialProxy({ a: 1 }, ['getPrototypeOf']), unjudgeable: false },
        { name: 'object-proxy-getOwnPropertyDescriptor-throws', value: partialProxy({ a: 1 }, ['getOwnPropertyDescriptor']), unjudgeable: false },
        { name: 'array-proxy-length-get-throws', value: partialProxy([1, 2], [], ['length']), unjudgeable: false },
        { name: 'array-proxy-first-element-get-throws', value: partialProxy([1], [], ['0']), unjudgeable: false },
    ]
}


export { boom, revoked, allTrapsThrow, withGetter, partialProxy, hostileValues }
