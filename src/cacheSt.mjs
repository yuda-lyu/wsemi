import get from 'lodash-es/get.js'
import cst from './_const.mjs'
import evem from './evem.mjs'
import evEmit from './evEmit.mjs'
import waitFun from './waitFun.mjs'
import haskey from './haskey.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import getTrace from './getTrace.mjs'


/**
 * 非同步狀態旗標快取，含TTL與互斥/同步原語，可用於在單一process內協調非同步動作之執行順序與資源獨占
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cacheSt.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.timeExpire=1800000] 輸入TTL過期時間整數，單位為毫秒ms，key寫入超過此時間後將被內部偵測週期自動刪除，預設30分鐘(1800000ms)
 * @param {Integer} [opt.timeDetect=2000] 輸入TTL偵測週期整數，單位為毫秒ms，預設2000
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於TTL偵測週期內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；僅涵蓋TTL偵測週期，不含set、get、check、checkWithSet、setWithFree、del之呼叫(其本身皆為同步完成，並已有同名事件可由on監聽)，亦不含waitExist與waitNotExist之輪詢(其輪詢事件由waitFun之opt.onTrace提供，本函數不轉發，其開始與結束已有waitExist、waitNotExist事件可由on監聽)；type為'expire'時為偵測到key已超過timeExpire而剛被刪除(含key、age為其寫入至本次偵測之毫秒數)，'detect'時為每次偵測週期結束(含n為第幾次偵測、size為偵測前之key數、expired為本次刪除之key數)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響快取，clear後不再呼叫(含clear時正在進行之偵測週期之餘下部分)，預設null
 * @returns {Object} 回傳事件物件，內含上述對外方法可呼叫，亦提供on用於監聽各方法之事件。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯，故其不會使行程崩潰，會改以error事件回報{ fun: 'listener', name, msg, args }，無error監聽者則console.error；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection
 * @example
 *
 * let test1 = async () => {
 *     let ms = []
 *
 *     let cs = cacheSt({ timeExpire: 10000 })
 *
 *     //案例: mutex取得與釋放
 *     let b1 = cs.checkWithSet('myLock') //第一次取得lock, 回true
 *     ms.push({ '1st checkWithSet': b1 })
 *     let b2 = cs.checkWithSet('myLock') //第二次嘗試, 已被占用回false
 *     ms.push({ '2nd checkWithSet': b2 })
 *     await cs.del('myLock')             //釋放lock
 *     let b3 = cs.checkWithSet('myLock') //釋放後可再取
 *     ms.push({ 'after del checkWithSet': b3 })
 *
 *     cs.clear() //結束時停止TTL偵測timer
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test1()
 * // ms [
 * //   { '1st checkWithSet': true },
 * //   { '2nd checkWithSet': false },
 * //   { 'after del checkWithSet': true }
 * // ]
 *
 * let test2 = async () => {
 *     let ms = []
 *
 *     let cs = cacheSt({ timeExpire: 10000 })
 *
 *     //案例: 多key原子占用並執行函數, 結束自動釋放
 *     let r = await cs.setWithFree(['lockA', 'lockB'], async () => {
 *         ms.push({ inside: 'fn running' })
 *         return 'done'
 *     })
 *     ms.push({ result: r })
 *     ms.push({ 'lockA after': await cs.check('lockA') }) //已自動釋放
 *     ms.push({ 'lockB after': await cs.check('lockB') }) //已自動釋放
 *
 *     cs.clear()
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test2()
 * // ms [
 * //   { inside: 'fn running' },
 * //   { result: 'done' },
 * //   { 'lockA after': false },
 * //   { 'lockB after': false }
 * // ]
 *
 * let test3 = async () => {
 *     let ms = []
 *
 *     let cs = cacheSt({ timeExpire: 10000 })
 *
 *     //案例: 等待key出現 (條件變數模式)
 *     setTimeout(() => {
 *         cs.set('ready', 'data-x')
 *     }, 200)
 *
 *     await cs.waitExist('ready', { attemptNum: 30, timeInterval: 100 }) //3秒內等候ready出現
 *     let v = await cs.get('ready')
 *     ms.push({ 'after waitExist': v })
 *
 *     cs.clear()
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test3()
 * // ms [
 * //   { 'after waitExist': 'data-x' }
 * // ]
 *
 */
function cacheSt(opt = {}) {

    let timeExpire = get(opt, 'timeExpire', null)
    if (!ispint(timeExpire)) {
        timeExpire = 30 * 60 * 1000
    }
    timeExpire = cint(timeExpire)
    timeExpire = Math.min(timeExpire, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    let timeDetect = get(opt, 'timeDetect', null)
    if (!ispint(timeDetect)) {
        timeDetect = 2000
    }
    timeDetect = cint(timeDetect)
    timeDetect = Math.min(timeDetect, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    let trace = getTrace(opt) //觀察回調, 未傳時為null, 各站點以if (trace)略過而不組事件物件
    let nDetect = 0 //偵測週期序號, 僅於通知時遞增
    let released = false //clear後不再通知(含正在進行之偵測週期之餘下部分)
    let ev = evem() //detect事件於setInterval內派發, 其餘於呼叫端同步堆疊或await之後派發且監聽器可能為async, 監聽器出錯不得殺行程, 故派發處以evEmit攔截

    let _gs = Object.create(null) //以呼叫端之key為鍵; 用無原型物件使任意字串皆為一般鍵, 一般物件時__proto__會改掉其原型(且不會過期)、constructor等原型屬性名會被haskey誤判為已存在

    let _set = async (key, value = true) => {
        _gs[key] = {
            time: Date.now(),
            value,
        }
        let msg = `set: ${key}`
        evEmit(ev, 'set', [{ state: 'success', msg }], { tag: 'cacheSt' })
    }

    let _get = async (key) => {
        let r = _gs[key]
        let value = r === undefined ? null : r.value
        let msg = `get: ${key}`
        evEmit(ev, 'get', [{ state: 'success', msg }], { tag: 'cacheSt' })
        return value
    }

    let _check = async (key) => {
        let exist = haskey(_gs, key)
        let msg = `check: ${key} = ${exist}`
        evEmit(ev, 'check', [{ state: 'success', msg }], { tag: 'cacheSt' })
        return exist
    }

    let _checkWithSet = (key) => {
        if (haskey(_gs, key)) {
            let msg = `checkWithSet: key in use: ${key}`
            evEmit(ev, 'checkWithSet', [{ state: 'error', msg }], { tag: 'cacheSt' })
            return false
        }
        _gs[key] = {
            time: Date.now(),
            value: true,
        }
        let msg = `checkWithSet: ${key}`
        evEmit(ev, 'checkWithSet', [{ state: 'success', msg }], { tag: 'cacheSt' })
        return true
    }

    let _setWithFree = async (keys, fn) => {
        evEmit(ev, 'setWithFree', [{ state: 'start' }], { tag: 'cacheSt' })
        let _ks = []
        for (let key of keys) {
            if (_checkWithSet(key)) {
                _ks.push(key)
            }
            else {
                //回滾已占之 key
                for (let k of _ks) {
                    delete _gs[k]
                }
                let msg = `setWithFree: key in use: ${key}`
                evEmit(ev, 'setWithFree', [{ state: 'error', msg }], { tag: 'cacheSt' })
                return Promise.reject(msg)
            }
        }
        try {
            let r = await fn()
            let msg = `setWithFree: ${keys.join(', ')}`
            evEmit(ev, 'setWithFree', [{ state: 'success', msg }], { tag: 'cacheSt' })
            return r
        }
        catch (err) {
            //組訊息時讀取err可能拋錯(已撤銷之Proxy、會拋之getter), 須包try, 否則外傳者被換成該讀取錯誤而非原錯誤
            let s = ''
            try {
                s = `${(err && err.message) || err}`
            }
            catch (e) {}
            let msg = `setWithFree: fn threw: ${s}`
            evEmit(ev, 'setWithFree', [{ state: 'error', msg }], { tag: 'cacheSt' })
            throw err
        }
        finally {
            for (let k of _ks) {
                delete _gs[k]
            }
        }
    }

    let _del = async (key) => {
        delete _gs[key]
        let msg = `del: ${key}`
        evEmit(ev, 'del', [{ state: 'success', msg }], { tag: 'cacheSt' })
    }

    let _waitExist = async (key, optWait = {}) => {

        let attemptNum = get(optWait, 'attemptNum', null)
        if (!ispint(attemptNum)) {
            attemptNum = 30
        }
        attemptNum = cint(attemptNum)

        let timeInterval = get(optWait, 'timeInterval', null)
        if (!ispint(timeInterval)) {
            timeInterval = 100
        }
        timeInterval = cint(timeInterval)

        evEmit(ev, 'waitExist', [{ state: 'start' }], { tag: 'cacheSt' })

        //waitFun 達 attemptNum 會 reject 'exceeded attemptNum[N]', 須包 catch 才能拋出自家較明確之 timeout 訊息
        try {
            await waitFun(() => haskey(_gs, key), { attemptNum, timeInterval })
        }
        catch (e) {
            let msg = `waitExist timeout (${attemptNum * timeInterval}ms): ${key}`
            evEmit(ev, 'waitExist', [{ state: 'error', msg }], { tag: 'cacheSt' })
            return Promise.reject(msg)
        }

        let msg = `waitExist resolved: ${key}`
        evEmit(ev, 'waitExist', [{ state: 'success', msg }], { tag: 'cacheSt' })

    }

    let _waitNotExist = async (key, optWait = {}) => {

        let attemptNum = get(optWait, 'attemptNum', null)
        if (!ispint(attemptNum)) {
            attemptNum = 30
        }
        attemptNum = cint(attemptNum)

        let timeInterval = get(optWait, 'timeInterval', null)
        if (!ispint(timeInterval)) {
            timeInterval = 100
        }
        timeInterval = cint(timeInterval)

        evEmit(ev, 'waitNotExist', [{ state: 'start' }], { tag: 'cacheSt' })

        //同 _waitExist, 包 catch 才能拋出自家較明確之 timeout 訊息
        try {
            await waitFun(() => !(haskey(_gs, key)), { attemptNum, timeInterval })
        }
        catch (e) {
            let msg = `waitNotExist timeout (${attemptNum * timeInterval}ms): ${key}`
            evEmit(ev, 'waitNotExist', [{ state: 'error', msg }], { tag: 'cacheSt' })
            return Promise.reject(msg)
        }

        let msg = `waitNotExist resolved: ${key}`
        evEmit(ev, 'waitNotExist', [{ state: 'success', msg }], { tag: 'cacheSt' })

    }

    let t = setInterval(() => {

        evEmit(ev, 'detect', [{ state: 'start' }], { tag: 'cacheSt' })

        let now = Date.now()
        let keys = Object.keys(_gs)
        let nExpired = 0 //本次刪除之key數, 僅供觀察回調
        for (let key of keys) {
            let r = _gs[key]
            if (r && (now - r.time) > timeExpire) {
                delete _gs[key]
                nExpired++
                if (trace && !released) {
                    trace('expire', { key, age: now - r.time })
                }
            }
        }

        if (trace && !released) {
            trace('detect', { n: ++nDetect, size: keys.length, expired: nExpired })
        }

        evEmit(ev, 'detect', [{ state: 'finish' }], { tag: 'cacheSt' })

    }, timeDetect)

    let clear = () => {
        released = true
        clearInterval(t)
    }

    //save
    ev.checkWithSet = _checkWithSet
    ev.setWithFree = _setWithFree
    ev.set = _set
    ev.get = _get
    ev.check = _check
    ev.del = _del
    ev.waitExist = _waitExist
    ev.waitNotExist = _waitNotExist
    ev.clear = clear

    return ev
}


export default cacheSt
