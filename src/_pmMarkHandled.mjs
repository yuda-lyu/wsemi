//noop, 無作用之拒絕處理
let noop = () => {}

//PM_THEN, 載入時之內建then(其後Promise.prototype.then被改寫亦不呼叫使用端程式)
const PM_THEN = Promise.prototype.then

//IS_PROMISE, util.types.isPromise(Node 20.16、22.3起經process.getBuiltinModule取得; 以內部槽位判定, 含跨realm, 對Proxy為false且不觸發陷阱); 取不到(瀏覽器、Node<20.16)為null
//只作預檢以省去非Promise之物件於then之品牌檢查所建之例外(成本約數微秒); 取不到時全由then之品牌檢查判定, 結果相同
const IS_PROMISE = (() => {
    try {
        let p = globalThis.process
        let gb = p !== null && typeof p === 'object' ? p.getBuiltinModule : undefined
        if (typeof gb !== 'function') {
            return null
        }
        let u = gb.call(p, 'util')
        let f = u !== null && typeof u === 'object' && u.types !== null && typeof u.types === 'object' ? u.types.isPromise : null
        return typeof f === 'function' ? f : null
    }
    catch (err) {
        return null
    }
})()


/**
 * 對原生Promise預先掛上無作用之拒絕處理，使其標記為已處理，內部共用不對外
 *
 * 用於接收先行產生之Promise陣列而依序或限量取用者(pmSeries、pmMap未給fun時)：排在後面之Promise先reject時，若尚未被取用即成為未處理之rejection(Node預設即結束行程)，預先標記後其結果仍由原流程取用
 *
 * 以品牌判定原生Promise：直接以載入時之Promise.prototype.then執行(call)，非原生Promise者於then之品牌檢查(內部槽位)即拋TypeError而忽略，不讀其任何屬性、不觸發Proxy之陷阱、不呼叫一般thenable之then；
 * 故跨realm(vm新context、iframe)之原生Promise、原型為null或原型被改之原生Promise與子類別之實例皆標記；不經instanceof(其不認跨realm者與原型為null者，且對Proxy會觸發getPrototypeOf陷阱)
 *
 * 原始值直接略過；util.types.isPromise可用時先以之預檢(非Promise者不進then，免建例外之成本)，結果與只用then之品牌檢查相同
 *
 * then取得衍生Promise之建構子(species)時會讀原生Promise之constructor與其Symbol.species，子類別或被改寫者其建構子或getter為使用端程式(同instanceof時之既有行為)；任何拋錯皆忽略
 *
 * @param {*} v 輸入任意值
 */
function pmMarkHandled(v) {
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) {
        return
    }
    try {
        if (IS_PROMISE !== null && !IS_PROMISE(v)) {
            return
        }
        PM_THEN.call(v, undefined, noop)
    }
    catch (err) {}
}


export default pmMarkHandled
