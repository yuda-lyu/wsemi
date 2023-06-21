import loGet from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import evem from './evem.mjs'
import waitFun from './waitFun.mjs'
import isfun from './isfun.mjs'
import haskey from './haskey.mjs'
import ispint from './ispint.mjs'
import isarr from './isarr.mjs'
import cint from './cint.mjs'


/**
 * 非同步函數快取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cache.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳事件物件，可呼叫事件on、set、get、getProxy、clear、remove。on為監聽事件，需自行監聽message與error事件。set為加入待執行函數，函數結束回傳欲快取的值，set傳入參數依序為key與快取物件，key為唯一識別字串，可使用函數加上輸入參數作為key，因考慮輸入參數可能為大量數據會有效能問題，由開發者自行決定key，而快取物件需設定欄位execFun為待執行的非同步函數、inputFun為待執行函數execFun的傳入參數組、timeExpired為過期時間整數，單位ms，預設5000。get為依照key取得目前快取值。getProxy為合併set與get功能，直接set註冊待執行函數與取值，傳入參數同set，回傳同get。update為強制更新key所屬快取值，同時也會更新該快取之時間至當前。clear為清除key所屬快取的是否執行標記，使該快取視為需重新執行函數取值。remove為直接清除key所屬快取，清除後用set重設
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.set('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *             setTimeout(function() {
 *                 //第1次呼叫, 此時沒有快取只能執行取值
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1050ms, 此時第1次快取尚未過期(1200ms), 故1050ms取值時會拿到第1次快取(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 50)
 *             setTimeout(function() {
 *                 //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1250ms, 此時第1次快取已過期(1200ms), 故1250ms取值時會重新執行取值(count=2)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 250)
 *             setTimeout(function() {
 *                 //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 但第3次已重新執行取值(1250~1550ms執行, 2450ms過期), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是2300ms, 且此時第3次所得快取(count=2)尚未過期(2450ms), 此時就會拿到第3次所得快取(count=2)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 5th', msg)
 *                         ms.push('fun 5th', msg)
 *                     })
 *             }, 1300)
 *             setTimeout(function() {
 *                 //第6次呼叫(1600ms), 此時第3次所得快取(count=2)還在有效期(1550ms執行結束, 2450ms過期), 故get會拿到第3次所得快取(count=2)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 6th', msg)
 *                         ms.push('fun 6th', msg)
 *                     })
 *             }, 1600)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 2400)
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call fun, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun 4th inp1|inp2, count=1
 *     // fun 2nd inp1|inp2, count=1
 *     // call fun, count=2
 *     // fun 3rd inp1|inp2, count=2
 *     // fun 6th inp1|inp2, count=2
 *     // fun 5th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 3rd","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]
 *
 *     function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *             setTimeout(function() {
 *                 //第1次呼叫, 此時沒有快取只能執行取值, 因偵測週期為1000ms故得要1001ms才會回應, 會取得第1次結果(count=1)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫, 此時執行中會等待, 因偵測週期為1000ms, 故得等到下次偵測1100ms才會回應, 此時會取得第1次結果(count=1)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 100)
 *             setTimeout(function() {
 *                 //第3次呼叫, 此時已有快取, 故此時500ms就會先回應, 會取得第1次結果(count=1)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //第4次呼叫, 此時第1次快取(count=1)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 1300)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 1700)
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // call fun, count=1
 *     // fun 3rd inp1|inp2, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun 2nd inp1|inp2, count=1
 *     // call fun, count=2
 *     // fun 4th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]
 *
 *     function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 }) //快取1500ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *             setTimeout(function() {
 *                 //第1次呼叫(延遲1ms), 此時沒有快取只能執行取值, 因偵測週期為1000ms故得要1001ms才會回應, 回應時為被強制更新(1100ms)之前, 會取得第1次結果(count=1)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫(延遲200ms), 此時執行中會等待, 因偵測週期為1000ms, 故得等到下次偵測1200ms才會回應, 回應時為被強制更新(1100ms)之後, 此時會取得被強制更新的結果(abc)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 200)
 *             setTimeout(function() {
 *                 //第3次呼叫, 此時已有快取, 故此時500ms就會先回應, 會取得第1次結果(count=1)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //更新快取值(延遲1100ms), 快取值為abc, 快取時間也被更新至此時, 故會重新計算1500ms才會失效
 *                 oc.update('fun', 'abc')
 *                 console.log('fun update', 'abc')
 *                 ms.push('fun update', 'abc')
 *             }, 1100)
 *             setTimeout(function() {
 *                 //第4次呼叫(延遲1300ms), 此時會取得被強制更新之快取值(abc), 快取還剩1300ms才失效(也就是在2600ms失效)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 1300)
 *             setTimeout(function() {
 *                 //第5次呼叫(延遲2700ms), 此時被強制更新之快取值(abc)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
 *                 oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 5th', msg)
 *                         ms.push('fun 5th', msg)
 *                     })
 *             }, 2700)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 3100)
 *
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // call fun, count=1
 *     // fun 3rd inp1|inp2, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun update abc
 *     // fun 2nd abc
 *     // fun 4th abc
 *     // call fun, count=2
 *     // fun 5th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun update","abc","fun 2nd","abc","fun 4th","abc","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]
 *
 * }
 * topAsync().catch(() => {})
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

    function set(key, opt = {}) {

        //check
        if (haskey(data, key)) {
            //可重複設定不報錯
            //emit('error', { fun: 'set', key, msg: 'has key' })
            return
        }

        //execFun
        let execFun = loGet(opt, 'execFun')
        if (!isfun(execFun)) {
            execFun = async () => {}
        }

        //inputFun
        let inputFun = loGet(opt, 'inputFun')
        if (!isarr(inputFun)) {
            inputFun = []
        }

        //timeExpired
        let timeExpired = loGet(opt, 'timeExpired')
        if (!ispint(timeExpired)) {
            timeExpired = 5000
        }
        timeExpired = cint(timeExpired)

        //save
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

    async function get(key) {
        if (haskey(data, key)) {
            let b

            //若執行中則強制等待
            emit('message', { fun: 'get', key, msg: 'waiting' })
            await waitFun(() => {
                return !data[key].execFunRunning
            }, { timeInterval: 1000 }) //偵測週期1000ms

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

    async function getProxy(key, opt = {}) {
        set(key, opt)
        return get(key)
    }

    function update(key, value) {
        if (haskey(data, key)) {
            emit('message', { fun: 'updateValue', key })
            data[key].value = value
            data[key].time = Date.now()
        }
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
    ev.update = update
    ev.clear = clear
    ev.remove = remove

    return ev
}


export default cache
