import each from 'lodash/each'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import Evem from './evem.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'


/**
 * 判斷是否單元在線
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/alive.test.js Github}
 * @memberOf wsemi
 * @param {Integer} [timeAlive=10000] 輸入判斷單元是否斷線之延時整數，單位為毫秒ms，預設為10000，實體化後通過呼叫其內trigger事件，係給予單元的唯一key字串與攜帶數據data物件，即可監聽on事件名稱message取得單元進出事件
 * @example
 * let oAL = alive(1500)
 *
 * let a = { value: 123 }
 * let b = { value: '34.56' }
 * let m = []
 *
 * setTimeout(() => {
 *     console.log('trigger a1')
 *     oAL.trigger('a', a)
 * }, 500)
 *
 * setTimeout(() => {
 *     console.log('trigger a2')
 *     oAL.trigger('a', a)
 * }, 2000)
 *
 * setTimeout(() => {
 *     console.log('trigger b1')
 *     oAL.trigger('b', b)
 * }, 1000)
 *
 * setTimeout(() => {
 *     console.log('trigger b2')
 *     oAL.trigger('b', b)
 * }, 3000)
 *
 * setTimeout(() => {
 *     console.log(JSON.stringify(m))
 * }, 5000)
 *
 * oAL.on('message', function({ eventName, key, data, now }) {
 *     console.log({ eventName, key, data, now })
 *     m.push(eventName + '|' + key)
 * })
 * // trigger a1
 * // { eventName: 'enter', key: 'a', data: { value: 123 }, now: 1 }
 * // trigger b1
 * // { eventName: 'enter', key: 'b', data: { value: '34.56' }, now: 2 }
 * // trigger a2
 * // { eventName: 'leave', key: 'b', data: { value: '34.56' }, now: 1 }
 * // trigger b2
 * // { eventName: 'enter', key: 'b', data: { value: '34.56' }, now: 2 }
 * // { eventName: 'leave', key: 'a', data: { value: 123 }, now: 1 }
 * // { eventName: 'leave', key: 'b', data: { value: '34.56' }, now: 0 }
 * // ["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]
 */
function alive(timeAlive = 10000) {
    let ev = new Evem()
    let q = {} //queue
    let t = null //timer

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

        }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗
    }

    function trigger(key, data) {

        //check
        if (!isestr(key)) {
            console.log('need key')
            return
        }

        //check
        if (!haskey(q, key)) {
            setTimeout(() => { //因需判斷是否為新單元故放於update前, 而emit內可能會被存取q故需要用setTimeout脫勾, 而此時q已經被更新, size即為當前單元數量

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
