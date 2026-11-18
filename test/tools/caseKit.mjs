//caseKit.mjs: 子行程案例執行器(pmSettleRunner、execFailRunner)、共用測試值(codecThrown)與各測試檔之小工具, 同一helper只定義於此


/**
 * 任何值轉為可序列化之字串, Error取message, 字串原樣, 其餘為'<型別>', 讀取即拋錯者為'<unreadable>', 本身不拋錯
 *
 * @param {*} v 輸入任意值
 * @returns {String} 回傳字串
 */
function safeStr(v) {
    try {
        if (v instanceof Error) {
            return v.message
        }
    }
    catch (e) {
        return '<unreadable>'
    }
    if (typeof v === 'string') {
        return v
    }
    return '<' + typeof v + '>'
}


/**
 * 產生已撤銷之Proxy, 任何操作皆拋TypeError(含String()、讀取message、instanceof)
 *
 * @returns {Object} 回傳已撤銷之Proxy
 */
function revoked() {
    let { proxy, revoke } = Proxy.revocable({}, {})
    revoke()
    return proxy
}


/**
 * 任何值轉為可安全顯示之描述: 字串原樣, 其餘為'<型別> String(v)', 無法轉字串者為'<型別> (cannot be converted to a string)'
 * 與safeStr不同: 非字串者一律帶'<型別>'前綴, 斷言時可分辨「以Error物件reject」與「以其訊息字串reject」
 *
 * @param {*} v 輸入任意值
 * @returns {String} 回傳字串
 */
function showValue(v) {
    if (typeof v === 'string') {
        return v
    }
    try {
        return `<${typeof v}> ${String(v)}`
    }
    catch (e) {
        return `<${typeof v}> (cannot be converted to a string)`
    }
}


/**
 * 斷言用之實際值轉換: 陣列與一般物件(原型為Object.prototype或null)逐層轉換, 函數、symbol與無法讀取者(如已撤銷之Proxy)以showValue轉為描述, 其餘值(原始值、Uint8Array等類別實例)原樣
 * 已撤銷之Proxy一旦進入assert之實際值, mocha產生差異輸出時拋錯而使行程靜默結束(不印摘要、離開碼0、其後案例不執行), 故實際值可能含呼叫端拋出之值者須先經此轉換
 *
 * @param {*} v 輸入任意值
 * @returns {*} 回傳可安全交給assert之值
 */
function showDeep(v) {
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) {
        return typeof v === 'symbol' ? showValue(v) : v
    }
    if (typeof v === 'function') {
        return showValue(v)
    }
    try {
        if (Array.isArray(v)) {
            return v.map(showDeep)
        }
        let proto = Object.getPrototypeOf(v)
        if (proto === Object.prototype || proto === null) {
            let o = {}
            for (let k of Object.keys(v)) {
                o[k] = showDeep(v[k])
            }
            return o
        }
        return v
    }
    catch (e) {
        return showValue(v)
    }
}


/**
 * 等待Promise之結果並轉為可斷言之物件: resolve為{ s: 'resolve', v }、reject為{ s: 'reject', v }(v經showValue), 逾時為{ s: 'pending' }; 計時器於落定後清除
 *
 * @param {Promise} pm 輸入Promise
 * @param {Number} [ms=5000] 輸入逾時毫秒數, 預設5000
 * @returns {Promise} 回傳Promise, resolve回傳上述物件
 */
function settleShown(pm, ms = 5000) {
    let timer = null
    return Promise.race([
        pm.then((v) => ({ s: 'resolve', v: showValue(v) }), (v) => ({ s: 'reject', v: showValue(v) })),
        new Promise((resolve) => {
            timer = setTimeout(() => resolve({ s: 'pending' }), ms)
        }),
    ]).finally(() => clearTimeout(timer))
}


/**
 * 產生已撤銷之函數Proxy: typeof仍為'function', 但lodash isFunction(isfun)對其拋TypeError
 *
 * @returns {Function} 回傳已撤銷之函數Proxy
 */
function revokedFn() {
    let { proxy, revoke } = Proxy.revocable(function() {}, {})
    revoke()
    return proxy
}


/**
 * 產生尚未撤銷之函數Proxy及其撤銷器: 撤銷前為有效函數(isfun為true、可通過入口之函數檢測), 呼叫revoke()後lodash isFunction(isfun)對其拋TypeError;
 * 供「通過檢測後才失效」之測試(入口通過檢測、執行點或事件回呼內才被撤銷)
 *
 * @returns {Object} 回傳{ proxy, revoke }
 */
function revocableFn() {
    let { proxy, revoke } = Proxy.revocable(function() {}, {})
    return { proxy, revoke }
}


/**
 * 非函數值軸(計時與流程函數之函數參數無效值, dspec §11 W-15; 單一定義供測試檔與子行程執行器共用), 每項為[標籤, 值]
 * 含: undefined、null、0、數字、字串、布林、物件、陣列、Promise、async generator函數(isfun為false)、已撤銷之物件Proxy與函數Proxy(isfun拋TypeError)
 *
 * @returns {Array} 回傳[標籤, 值]之陣列, 共12項
 */
function nonFunValues() {
    return [
        ['undefined', undefined],
        ['null', null],
        ['zero', 0],
        ['num', 5],
        ['str', 'abc'],
        ['bool', true],
        ['obj', {}],
        ['arr', []],
        ['pm', Promise.resolve(1)],
        ['asyncGen', async function* () {}],
        ['revokedObj', revoked()],
        ['revokedFn', revokedFn()],
    ]
}


export { safeStr, revoked, revokedFn, revocableFn, nonFunValues, showValue, showDeep, settleShown }
