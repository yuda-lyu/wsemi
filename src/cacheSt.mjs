import get from 'lodash-es/get.js'
import evem from './evem.mjs'
import waitFun from './waitFun.mjs'
import haskey from './haskey.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'


/**
 * 非同步狀態旗標快取，含TTL與互斥/同步原語，可用於在單一process內協調非同步動作之執行順序與資源獨占
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cacheSt.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.timeExpire=1800000] 輸入TTL過期時間整數，單位為毫秒ms，key寫入超過此時間後將被內部偵測週期自動刪除，預設30分鐘(1800000ms)
 * @param {Integer} [opt.timeDetect=2000] 輸入TTL偵測週期整數，單位為毫秒ms，預設2000
 * @returns {Object} 回傳事件物件，內含上述對外方法可呼叫，亦提供on用於監聽各方法之事件
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

    let timeDetect = get(opt, 'timeDetect', null)
    if (!ispint(timeDetect)) {
        timeDetect = 2000
    }
    timeDetect = cint(timeDetect)

    let ev = evem()

    let _gs = {}

    let _set = async (key, value = true) => {
        _gs[key] = {
            time: Date.now(),
            value,
        }
        let msg = `set: ${key}`
        ev.emit('set', { state: 'success', msg })
    }

    let _get = async (key) => {
        let r = _gs[key]
        let value = r === undefined ? null : r.value
        let msg = `get: ${key}`
        ev.emit('get', { state: 'success', msg })
        return value
    }

    let _check = async (key) => {
        let exist = haskey(_gs, key)
        let msg = `check: ${key} = ${exist}`
        ev.emit('check', { state: 'success', msg })
        return exist
    }

    let _checkWithSet = (key) => {
        if (haskey(_gs, key)) {
            let msg = `checkWithSet: key in use: ${key}`
            ev.emit('checkWithSet', { state: 'error', msg })
            return false
        }
        _gs[key] = {
            time: Date.now(),
            value: true,
        }
        let msg = `checkWithSet: ${key}`
        ev.emit('checkWithSet', { state: 'success', msg })
        return true
    }

    let _setWithFree = async (keys, fn) => {
        ev.emit('setWithFree', { state: 'start' })
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
                ev.emit('setWithFree', { state: 'error', msg })
                return Promise.reject(msg)
            }
        }
        try {
            let r = await fn()
            let msg = `setWithFree: ${keys.join(', ')}`
            ev.emit('setWithFree', { state: 'success', msg })
            return r
        }
        catch (err) {
            let msg = `setWithFree: fn threw: ${(err && err.message) || err}`
            ev.emit('setWithFree', { state: 'error', msg })
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
        ev.emit('del', { state: 'success', msg })
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

        ev.emit('waitExist', { state: 'start' })

        //waitFun 達 attemptNum 會 reject 'exceeded attemptNum[N]', 須包 catch 才能拋出自家較明確之 timeout 訊息
        try {
            await waitFun(() => haskey(_gs, key), { attemptNum, timeInterval })
        }
        catch (e) {
            let msg = `waitExist timeout (${attemptNum * timeInterval}ms): ${key}`
            ev.emit('waitExist', { state: 'error', msg })
            return Promise.reject(msg)
        }

        let msg = `waitExist resolved: ${key}`
        ev.emit('waitExist', { state: 'success', msg })

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

        ev.emit('waitNotExist', { state: 'start' })

        //同 _waitExist, 包 catch 才能拋出自家較明確之 timeout 訊息
        try {
            await waitFun(() => !(haskey(_gs, key)), { attemptNum, timeInterval })
        }
        catch (e) {
            let msg = `waitNotExist timeout (${attemptNum * timeInterval}ms): ${key}`
            ev.emit('waitNotExist', { state: 'error', msg })
            return Promise.reject(msg)
        }

        let msg = `waitNotExist resolved: ${key}`
        ev.emit('waitNotExist', { state: 'success', msg })

    }

    let t = setInterval(() => {

        ev.emit('detect', { state: 'start' })

        let now = Date.now()
        for (let key of Object.keys(_gs)) {
            let r = _gs[key]
            if (r && (now - r.time) > timeExpire) {
                delete _gs[key]
            }
        }

        ev.emit('detect', { state: 'finish' })

    }, timeDetect)

    let clear = () => {
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
