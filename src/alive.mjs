import each from 'lodash/each'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import evem from './evem.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'
import isnint from './isnint.mjs'
import cint from './cint.mjs'


/**
 * 偵測單元是否在線
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/alive.test.js Github}
 * @memberOf wsemi
 * @param {Integer} [timeAlive=10000] 輸入判斷單元是否斷線之延時整數，單位為毫秒ms，預設為10000
 * @returns {Object} 回傳事件物件，可呼叫事件on、trigger、get。trigger給予單元的唯一key字串與攜帶數據data物件，on為監聽事件，需自行監聽message事件取得單元進出事件。get事件可取得alive內視為存活的單元清單
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oAL = alive(1500)
 *             let t = new Date()
 *
 *             let a = { data: 123 }
 *             let b = { data: '34.56' }
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((new Date() - t)) + 'ms', 'trigger a1')
 *                 oAL.trigger('a', a)
 *             }, 500)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((new Date() - t)) + 'ms', 'trigger a2')
 *                 oAL.trigger('a', a)
 *             }, 1900)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((new Date() - t)) + 'ms', 'trigger b1')
 *                 oAL.trigger('b', b)
 *             }, 1000)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((new Date() - t)) + 'ms', 'trigger b2')
 *                 oAL.trigger('b', b)
 *             }, 3000)
 *
 *             oAL.on('message', function({ eventName, key, data, now }) {
 *                 console.log(parseInt((new Date() - t)) + 'ms', { eventName, key, data, now })
 *                 ms.push(eventName + '|' + key)
 *             })
 *
 *             setTimeout(() => {
 *                 resolve(ms)
 *             }, 5000)
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // 503ms trigger a1
 *     // 508ms { eventName: 'enter', key: 'a', data: { data: 123 }, now: 1 }
 *     // 1001ms trigger b1
 *     // 1003ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
 *     // 1901ms trigger a2
 *     // 2523ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 1 }
 *     // 3002ms trigger b2
 *     // 3004ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
 *     // 3430ms { eventName: 'leave', key: 'a', data: { data: 123 }, now: 1 }
 *     // 4544ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 0 }
 *     // ["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function alive(timeAlive = 10000) {
    let ev = evem()
    let q = {} //queue
    let t = null //timer

    //check
    if (isnint(timeAlive)) {
        timeAlive = 10000
    }
    timeAlive = cint(timeAlive)

    function detect() {
        if (t !== null) {
            return
        }
        t = setInterval(() => {
            //console.log('q', q)

            //detect
            each(q, (v, key) => {

                //t
                let t = Date.now() - v.time

                //check, 超過指定延時則視為離開
                if (t > timeAlive) {

                    //cloneDeep
                    let r = cloneDeep(q[key])

                    //刪除佇列內key紀錄
                    delete q[key]

                    //emit leave
                    ev.emit('message', { eventName: 'leave', key, data: r.data, now: size(q) })

                }
            })

            //clear, 當無任何訊息存在
            if (!iseobj(q)) {
                clearInterval(t)
                t = null
            }

        }, 50) //50ms偵測, 啟動後跑timer, 無佇列則會停止減耗
    }

    function trigger(key, data) {

        //check
        if (!isestr(key)) {
            console.log('trigger need key')
            return
        }

        //check
        if (!haskey(q, key)) {
            setTimeout(() => { //因需判斷是否為新單元故需放於update前, 而emit內可能會被存取q, 故需要用setTimeout脫勾使q為被更新資訊, 才能正確取得當前單元數量

                //emit enter
                ev.emit('message', { eventName: 'enter', key, data, now: size(q) })

            }, 1)
        }

        //update
        q[key] = { data, time: Date.now() }

        //detect
        detect()

    }

    function get() {
        let rs = []
        each(q, (v, k) => {
            rs.push({ key: k, data: v.data })
        })
        return rs
    }

    //save
    ev.trigger = trigger
    ev.get = get

    return ev
}


export default alive
