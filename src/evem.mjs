import EventEmitter from 'eventemitter3'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import ispm from './ispm.mjs'


/**
 * 建立原生eventemitter3實例
 *
 * @returns {Object} 回傳eventemitter3實例
 */
function genBasic() {
    let ee = new EventEmitter()
    return ee
}


/**
 * 建立事件物件, 並攔截應用端監聽器之錯誤
 *
 * 適用於emit以setTimeout延後派發之情境(如cache等內部以timer脫勾派發者): 監聽器同步拋錯即為計時器回呼內之uncaughtException, async監聽器reject即為unhandledRejection,
 * 兩者於nodejs皆使整個行程崩潰(伺服器端即整個服務死亡), 且emit端無法以try catch攔截; 又若事件之參數含該請求之pm(如execute/upload/download), 監聽器出錯而未settle會使請求永久懸置。
 * 故於註冊時包裝監聽器, 同步拋錯與async reject皆交由funGetListenerError處置(由呼叫端決定是否reject pm、發error事件)
 *
 * 以on/once/addListener註冊者皆包裝; 包裝函數以(原函數, 事件名)為鍵快取, 同一組合重用同一包裝, 使off/removeListener能以原函數反查移除(eventemitter3以函數識別嚴格比對), 同一函數掛於多個事件亦各自正確; once由eventemitter3內部以包裝函數自行移除, 傳入者已為包裝函數則直通不再包一層
 * listeners()對外回傳原函數(非包裝函數); 包裝函數於該事件已無註冊時(off/once自動移除/removeAllListeners)自快取清除, 避免長壽原函數配動態事件名無界累積
 * funGetListenerError本身同步拋錯或回傳rejection(async handler)皆被吞掉, 避免防護函數反成崩潰來源; 監聽器移除後其尚未settle之async reject仍會回報(依當下是否有error監聽者決定emit或console.error)
 *
 * 未提供funGetListenerError時採預設政策: 事件參數args[0].pm若為promise-like且可reject(具then與reject, 即genPm之形狀; 業務物件恰有reject方法不算)先reject之(reject自身出錯不影響後續通報), 使模組流程不因監聽器出錯而懸置;
 * 再於同一實例emit('error', { fun: 'listener', name, msg: err, args })供呼叫端得知; 若出錯者本身即為error事件之監聽器(否則無限遞迴)、或實例上無任何error監聽者(eventemitter3對無人監聽之error不throw亦不印, 錯誤會無聲消失), 則改以console.error留痕
 *
 * @param {Function} [funGetListenerError=undefined] 監聽器出錯時之回呼, 傳入(name, err, args), name為事件名稱, err為錯誤, args為該次派發之參數陣列, 未提供則採預設政策
 * @returns {Object} 回傳eventemitter3實例
 */
function genSafe(funGetListenerError) {

    //ee
    let ee = new EventEmitter()

    //mapWrap, 原函數 → Map(事件名 → 包裝函數), 供重用與移除時反查
    let mapWrap = new WeakMap()

    //defaultPolicy, 預設政策: reject事件參數內之pm → 重發error事件; error監聽器自身出錯(防無限遞迴)或無任何error監聽者(eventemitter3對無人監聽之error不throw亦不印, 錯誤會無聲消失)則改console.error留痕
    let defaultPolicy = (name, err, args) => {

        //pm, 須為promise-like(具then)且可reject(genPm之形狀), 避免業務物件恰有reject方法被誤呼叫; reject自身拋錯或回傳rejection皆隔離, 不得吞掉下方之錯誤通報
        let pm = get(args, '0.pm')
        if (pm && isfun(pm.then) && isfun(pm.reject)) {
            try {
                let r = pm.reject(err)
                if (ispm(r)) {
                    r.then(null, () => {})
                }
            }
            catch (e) {}
        }

        if (name === 'error') {
            console.error(`[wsemi evem] listener of 'error' threw:`, err)
            return
        }
        if (ee.listenerCount('error') === 0) {
            console.error(`[wsemi evem] listener of '${String(name)}' threw and no 'error' listener is registered:`, err)
            return
        }
        ee.emit('error', { fun: 'listener', name, msg: err, args })
    }
    if (!isfun(funGetListenerError)) {
        funGetListenerError = defaultPolicy
    }

    //report, 防護函數自身同步拋錯或回傳rejection(async handler)皆不得外溢
    let report = (name, err, args) => {
        try {
            let r = funGetListenerError(name, err, args)
            if (ispm(r)) {
                r.then(null, () => {})
            }
        }
        catch (e) {}
    }

    //build, 建立包裝函數
    let build = (name, fn) => {
        return function(...args) {
            let r
            try {
                r = fn.apply(this, args)
            }
            catch (err) {
                report(name, err, args)
                return undefined
            }
            if (ispm(r)) {
                r.then(null, (err) => {
                    report(name, err, args)
                })
            }
            return r
        }
    }

    //mapOrig, 包裝函數 → { fn, name }, 供判別傳入者是否已為包裝函數(直通, 不再包一層)與listeners()還原原函數
    let mapOrig = new WeakMap()

    //getWrapped, 取得(原函數, 事件名)之包裝函數; create為true時不存在則建立; 傳入者已是包裝函數則原樣回傳(eventemitter3之once內部移除、或呼叫端把listeners()取得者再註冊, 皆不可再包一層, 否則once之自動移除會反查到第二層包裝而失效)
    let getWrapped = (name, fn, create) => {
        if (!isfun(fn)) {
            return null //交由eventemitter3自行拋出型別錯誤
        }
        if (mapOrig.has(fn)) {
            return fn
        }
        let m = mapWrap.get(fn)
        if (!m) {
            if (!create) {
                return null
            }
            m = new Map()
            mapWrap.set(fn, m)
        }
        let w = m.get(name)
        if (!w && create) {
            w = build(name, fn)
            m.set(name, w)
            mapOrig.set(w, { fn, name })
        }
        return w || null
    }

    //rawListeners, eventemitter3原生listeners(回包裝函數), 供內部比對
    let _listeners = ee.listeners
    let rawListeners = (name) => {
        return _listeners.call(ee, name)
    }

    //cleanup, 某包裝函數於該事件已無任何註冊時, 自快取移除(否則長壽原函數配動態事件名會無界累積wrapper)
    let cleanup = (name, w) => {
        let o = mapOrig.get(w)
        if (!o) {
            return
        }
        if (rawListeners(name).includes(w)) {
            return
        }
        let m = mapWrap.get(o.fn)
        if (m) {
            m.delete(name)
            if (m.size === 0) {
                mapWrap.delete(o.fn)
            }
        }
    }

    //on, once, addListener
    let _on = ee.on
    let _once = ee.once
    ee.on = function(name, fn, context) {
        return _on.call(this, name, getWrapped(name, fn, true) || fn, context)
    }
    ee.addListener = ee.on
    ee.once = function(name, fn, context) {
        return _once.call(this, name, getWrapped(name, fn, true) || fn, context)
    }

    //off, removeListener, 以原函數反查包裝函數; 傳入者若已是包裝函數(eventemitter3之once內部移除)則直通; 非函數(移除該事件全部)則原樣傳遞; 移除後清理快取
    let _removeListener = ee.removeListener
    ee.removeListener = function(name, fn, context, once) {
        let ws = isfun(fn) ? [getWrapped(name, fn, false) || fn] : rawListeners(name)
        let r = _removeListener.call(this, name, isfun(fn) ? ws[0] : fn, context, once)
        for (let w of ws) {
            cleanup(name, w)
        }
        return r
    }
    ee.off = ee.removeListener

    //removeAllListeners, 清除後同步清理快取
    let _removeAllListeners = ee.removeAllListeners
    ee.removeAllListeners = function(name) {
        let names = (name === undefined) ? ee.eventNames() : [name]
        let pairs = []
        for (let nm of names) {
            for (let w of rawListeners(nm)) {
                pairs.push([nm, w])
            }
        }
        let r = _removeAllListeners.call(this, name)
        for (let [nm, w] of pairs) {
            cleanup(nm, w)
        }
        return r
    }

    //listeners, 對外回傳原函數(非包裝函數), 使呼叫端取得者可再註冊或比對
    ee.listeners = function(name) {
        return rawListeners(name).map((w) => {
            let o = mapOrig.get(w)
            return o ? o.fn : w
        })
    }

    return ee
}


/**
 * 建立事件物件(EventEmitter from eventemitter3)
 *
 * type='basic'(預設)為原生eventemitter3實例, 與既往行為完全相同: 監聽器拋錯會原樣外拋(同步emit時傳回emit呼叫端, 於timer/stream/watcher等非同步派發時即為uncaughtException; async監聽器reject即為unhandledRejection), 於nodejs兩者皆會使整個行程崩潰且emit端無法try catch
 *
 * type='safe'為攔截監聽器錯誤之實例, 適用於上述非同步派發或監聽器可能為async之情境(wsemi內cache、alive、cacheSt、fsBuildReadStreamText、fsTask、fsTaskCp、queue皆已明示採用): 於on/once/addListener註冊時包裝監聽器, 同步拋錯與async reject皆改交由opt.funGetListenerError處置, off/removeListener以原函數反查包裝函數移除, 對應用端透明
 *
 * 未提供opt.funGetListenerError時採預設政策: 事件參數args[0].pm若為promise-like且可reject(具then與reject)則先reject(使模組流程不懸置), 再於同一實例emit('error', { fun: 'listener', name, msg: err, args }); error監聽器自身出錯(避免無限遞迴)或實例上無任何error監聽者(否則錯誤無聲消失)則改以console.error留痕。需自訂處置(如記log、reject特定pm、依事件名分流)者自行傳入funGetListenerError, 其同步拋錯或async reject皆被吞掉不外溢。listeners()回傳原函數; 移除監聽器後快取隨之清理
 *
 * 預設維持basic而非safe之理由: evem為公開函數, 翻轉預設會改變所有外部裸呼叫evem()之語意(同步emit之例外不再傳回呼叫端、多出fun:'listener'之error事件), 屬破壞性變更; 保護以opt-in方式提供, wsemi內部模組已各自明示
 *
 * See: {@link https://github.com/primus/eventemitter3 eventemitter3}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evem.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='basic'] 輸入事件物件類型字串，可選'basic'、'safe'，預設'basic'
 * @param {Function} [opt.funGetListenerError=undefined] 輸入type='safe'時監聽器出錯之回呼函數，格式為(name, err, args)=>{}，name為事件名稱、err為錯誤、args為該次派發之參數陣列，未提供或非函數則採預設政策(reject args[0].pm並重發error事件，無error監聽者則console.error)，預設undefined
 * @returns {Object} 回傳eventemitter3實例
 * @example
 *
 * //預設(basic), 一般使用
 * let ev = evem()
 * ev.on('evName', function(msg) {
 *     console.log(msg)
 *     // => {abc: 12.34}
 * })
 * let data = { abc: 12.34 }
 * ev.emit('evName', data)
 *
 * //safe, 自訂funGetListenerError, 以setTimeout延後派發時攔截監聽器錯誤
 * let evs = evem({
 *     type: 'safe',
 *     funGetListenerError: (name, err, args) => {
 *         console.log('listener error', name, err.message, args)
 *         // => listener error evName boom [ { abc: 12.34 } ]
 *         // => listener error evName async-boom [ { abc: 12.34 } ]
 *     },
 * })
 * evs.on('evName', function(msg) {
 *     throw new Error('boom') //同步拋錯, 於basic實例下會成為uncaughtException使行程崩潰
 * })
 * evs.on('evName', async function(msg) {
 *     throw new Error('async-boom') //async reject, 於basic實例下會成為unhandledRejection使行程崩潰
 * })
 * setTimeout(() => {
 *     evs.emit('evName', data) //延後派發, emit端無法try catch
 * }, 1)
 *
 * //safe之預設政策: 未提供funGetListenerError則重發error事件(並reject args[0].pm); 無error監聽者則console.error
 * let evs2 = evem({ type: 'safe' })
 * evs2.on('error', (e) => {
 *     console.log('error event', e.fun, e.name, e.msg.message)
 *     // => error event listener evName boom
 * })
 * evs2.on('evName', function(msg) {
 *     throw new Error('boom')
 * })
 * setTimeout(() => {
 *     evs2.emit('evName', data)
 * }, 1)
 *
 */
function evem(opt = {}) {

    //type, 預設basic(原生eventemitter3, 與既往行為逐位元相同, 外部直接呼叫evem()者不受影響); 需攔截監聽器錯誤者明示safe(wsemi內以timer/stream/watcher派發或監聽器可能為async之模組皆已明示)
    let type = get(opt, 'type', null)
    if (type !== 'basic' && type !== 'safe') {
        type = 'basic'
    }

    //funGetListenerError, 非函數(含未提供)一律採genSafe之預設政策, 同wsemi其他opt給錯值退回預設之慣例
    let funGetListenerError = get(opt, 'funGetListenerError', undefined)
    if (!isfun(funGetListenerError)) {
        funGetListenerError = undefined
    }

    //ee
    let ee
    if (type === 'basic') {
        ee = genBasic()
    }
    else {
        ee = genSafe(funGetListenerError)
    }

    return ee
}


export default evem
