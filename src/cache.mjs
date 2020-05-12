import cloneDeep from 'lodash/cloneDeep'
import evem from './evem.mjs'
import waitFun from './waitFun.mjs'
import isfun from './isfun.mjs'
import haskey from './haskey.mjs'
import isnint from './isnint.mjs'
import isarr from './isarr.mjs'
import cint from './cint.mjs'


/**
 * 非同步函數快取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cache.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳事件物件，可呼叫事件on、set、get、getProxy、clear、remove。on為監聽事件，需自行監聽message與error事件。set為加入待執行函數，函數結束回傳欲快取的值，set傳入參數依序為key與快取物件，key為唯一識別字串，而快取物件需設定欄位execFun為待執行的非同步函數、inputFun為待執行函數execFun的傳入參數組、timeExpired為過期時間整數，單位ms，預設5000。get為依照key取得目前快取值。getProxy為合併set與get功能，直接set註冊待執行函數與取值，傳入參數同set，回傳同get。clear為清除key所屬快取的是否執行標記，使該快取視為需重新執行函數取值。remove為直接清除key所屬快取，清除後用set重設
 * @example
 *
 * function test1() {
 *     console.log('test set and get')
 *
 *     let oc = cache()
 *
 *     // oc.on('message', function(msg) {
 *     //     console.log('message', msg)
 *     // })
 *     // oc.on('error', function(msg) {
 *     //     console.log('error', msg)
 *     // })
 *
 *     let ms1 = []
 *     let n1 = 0
 *     function fun1(v1, v2) {
 *         console.log('call fun1')
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 n1 += 1
 *                 resolve(v1 + '|' + v2 + ', count=' + n1)
 *             }, 300)
 *         })
 *     }
 *
 *     oc.set('fun1', { execFun: fun1, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *     setTimeout(function() {
 *     //第1次呼叫, 此時沒有快取只能執行取值
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 1st', msg)
 *                 console.log('fun1 1st', msg)
 *             })
 *     }, 1)
 *     setTimeout(function() {
 *     //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1050ms, 此時第1次快取尚未過期(1200ms), 故1050ms取值時會拿到第1次快取(count=1)
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 2nd', msg)
 *                 console.log('fun1 2nd', msg)
 *             })
 *     }, 50)
 *     setTimeout(function() {
 *     //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1250ms, 此時第1次快取已過期(1200ms), 故1250ms取值時會重新執行取值(count=2)
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 3rd', msg)
 *                 console.log('fun1 3rd', msg)
 *             })
 *     }, 250)
 *     setTimeout(function() {
 *     //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 4th', msg)
 *                 console.log('fun1 4th', msg)
 *             })
 *     }, 500)
 *     setTimeout(function() {
 *     //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 但第3次已重新執行取值(1250~1550ms執行, 2450ms過期), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是2300ms, 且此時第3次所得快取(count=2)尚未過期(2450ms), 此時就會拿到第3次所得快取(count=2)
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 5th', msg)
 *                 console.log('fun1 5th', msg)
 *             })
 *     }, 1300)
 *     setTimeout(function() {
 *     //第6次呼叫(1600ms), 此時第3次所得快取(count=2)還在有效期(1550ms執行結束, 2450ms過期), 故get會拿到第3次所得快取(count=2)
 *         oc.get('fun1')
 *             .then(function(msg) {
 *                 ms1.push('fun1 6th', msg)
 *                 console.log('fun1 6th', msg)
 *             })
 *     }, 1600)
 *
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             resolve(ms1)
 *         }, 2400)
 *     })
 * }
 * setTimeout(function() {
 *     test1()
 *         .then(function(ms1) {
 *             console.log(JSON.stringify(ms1))
 *         })
 * }, 1)
 * // test set and get
 * // call fun1
 * // fun1 1st inp1|inp2, count=1
 * // fun1 4th inp1|inp2, count=1
 * // fun1 2nd inp1|inp2, count=1
 * // call fun1
 * // fun1 3rd inp1|inp2, count=2
 * // fun1 6th inp1|inp2, count=2
 * // fun1 5th inp1|inp2, count=2
 * // ["fun1 1st","inp1|inp2, count=1","fun1 4th","inp1|inp2, count=1","fun1 2nd","inp1|inp2, count=1","fun1 3rd","inp1|inp2, count=2","fun1 6th","inp1|inp2, count=2","fun1 5th","inp1|inp2, count=2"]
 *
 * function test2() {
 *     console.log('test getProxy')
 *
 *     let oc = cache()
 *
 *     // oc.on('message', function(msg) {
 *     //     console.log('message', msg)
 *     // })
 *     // oc.on('error', function(msg) {
 *     //     console.log('error', msg)
 *     // })
 *
 *     let ms2 = []
 *     let n2 = 0
 *     function fun2(v1, v2) {
 *         console.log('call fun2')
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 n2 += 1
 *                 resolve(v1 + '|' + v2 + ', count=' + n2)
 *             }, 300)
 *         })
 *     }
 *
 *     oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *     setTimeout(function() {
 *         //第1次呼叫, 此時沒有快取只能執行取值, 會取得第1次結果(count=1)
 *         oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *             .then(function(msg) {
 *                 ms2.push('fun2 1st', msg)
 *                 console.log('fun2 1st', msg)
 *             })
 *     }, 1)
 *     setTimeout(function() {
 *         //第2次呼叫, 此時執行中會等待, 偵測週期為1ms, 下次偵測為1100ms, 此時會取得第1次結果(count=1)
 *         oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *             .then(function(msg) {
 *                 ms2.push('fun2 2nd', msg)
 *                 console.log('fun2 2nd', msg)
 *             })
 *     }, 100)
 *     setTimeout(function() {
 *         //第3次呼叫, 此時已有快取, 會取得第1次結果(count=1)
 *         oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *             .then(function(msg) {
 *                 ms2.push('fun2 3rd', msg)
 *                 console.log('fun2 3rd', msg)
 *             })
 *     }, 500)
 *     setTimeout(function() {
 *         //第4次呼叫, 此時第1次快取(count=1)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
 *         oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *             .then(function(msg) {
 *                 ms2.push('fun2 4th', msg)
 *                 console.log('fun2 4th', msg)
 *             })
 *     }, 1300)
 *
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             resolve(ms2)
 *         }, 1700)
 *     })
 * }
 * setTimeout(function() {
 *     test2()
 *         .then(function(ms2) {
 *             console.log(JSON.stringify(ms2))
 *         })
 * }, 2500)
 * // test getProxy
 * // call fun2
 * // fun2 3rd inp1|inp2, count=1
 * // fun2 1st inp1|inp2, count=1
 * // fun2 2nd inp1|inp2, count=1
 * // call fun2
 * // fun2 4th inp1|inp2, count=2
 * // ["fun2 3rd","inp1|inp2, count=1","fun2 1st","inp1|inp2, count=1","fun2 2nd","inp1|inp2, count=1","fun2 4th","inp1|inp2, count=2"]
 *
 */
function cache() {
    let ev = evem()
    let data = {} //快取資料

    function emit(mode, data) {
        setTimeout(() => { //用timer脫勾
            ev.emit(mode, data)
        }, 1)
    }

    function set(key, { execFun, inputFun, timeExpired }) {

        //check
        if (!isfun(execFun)) {
            execFun = async () => {}
        }
        if (isnint(timeExpired)) {
            timeExpired = 5000
        }
        timeExpired = cint(timeExpired)
        if (!isarr(inputFun)) {
            inputFun = []
        }

        //add
        if (!haskey(data, key)) {
            data[key] = {
                needExec: true,
                execFun,
                execFunRunning: false,
                inputFun,
                value: null,
                time: null,
                timeExpired,
            }
            emit('message', { fun: 'set', key, timeExpired })
        }
        else {
            //可重複設定不報錯
            //emit('error', { fun: 'set', key, msg: 'has key' })
        }

    }

    async function get(key) {
        if (haskey(data, key)) {
            let b

            //若執行中則強制等待
            emit('message', { fun: 'get', key, msg: 'waiting' })
            await waitFun(() => {
                return !data[key].execFunRunning
            })

            //t
            let t = Date.now()

            //needExec or timeExpired
            b = data[key].needExec
            let timeDiff = (t - data[key].time)
            if (b) {
                emit('message', { fun: 'get', key, msg: 'execute first' })
            }
            else if (data[key].timeExpired > 0 && (timeDiff > data[key].timeExpired)) {
                emit('message', { fun: 'get', key, msg: 'execute by timeExpired', timeDiff })
                b = true
            }

            //execFun
            if (b) {
                emit('message', { fun: 'get', key, msg: 'execFun start' })
                data[key].execFunRunning = true
                data[key].value = await data[key].execFun(...data[key].inputFun)
                    .catch((err) => {
                        emit('error', { fun: 'get', key, msg: err })
                    })
                data[key].needExec = false
                data[key].time = t
                data[key].execFunRunning = false
                emit('message', { fun: 'get', key, msg: 'execFun end' })
            }
            else {
                emit('message', { fun: 'get', key, msg: 'use cache' })
            }

            return cloneDeep(data[key].value) //若為物件可能受外部調用而被修改到快取區的記憶體, 故得要用cloneDeep複製才回傳
        }
        else {
            emit('error', { fun: 'get', key, msg: 'invalid key' })
            return null
        }
    }

    async function getProxy(key, { execFun, inputFun, timeExpired }) {
        set(key, { execFun, inputFun, timeExpired })
        return get(key)
    }

    function clear(key) {
        if (haskey(data, key)) {
            emit('message', { fun: 'clear', key })
            data[key].needExec = true
        }
    }

    function remove(key) {
        if (haskey(data, key)) {
            emit('message', { fun: 'remove', key })
            delete data[key]
        }
    }

    //save
    ev.set = set
    ev.getProxy = getProxy
    ev.get = get
    ev.clear = clear
    ev.remove = remove

    return ev
}


export default cache
