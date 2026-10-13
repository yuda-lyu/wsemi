import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import size from 'lodash-es/size.js'
import cst from './_const.mjs'
import evem from './evem.mjs'
import evEmit from './evEmit.mjs'
import ispint from './ispint.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'
import cint from './cint.mjs'


/**
 * 偵測單元是否在線
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/alive.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [timeAlive=10000] 輸入判斷單元是否斷線之延時整數，單位為毫秒ms，預設為10000
 * @param {Integer} [timeDetect=50] 輸入偵測佇列間隔時間整數，單位為毫秒ms，預設為50
 * @returns {Object} 回傳事件物件，可呼叫函數on、trigger、get、clear。trigger給予單元的唯一key字串與攜帶數據data物件，on為監聽事件，需自行監聽message事件取得單元進出事件。get事件可取得alive內視為存活的單元清單(含剛trigger而尚未發出enter者)。clear為釋放：立即清除偵測計時器、取消尚未發出之enter、清空佇列，本身不發事件，其後不再發出任何事件、trigger無效、get回傳[]，可重複呼叫(釋放為終態，需重新偵測者另建alive)；clear回傳已發出enter且尚未leave之單元陣列[{ key, data }]，供使用端補發離線通知，再次呼叫回傳[]；監聽器於派發中呼叫clear亦安全，同一輪尚未處理之單元不再派發。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯，故其不會使行程崩潰，會改以error事件回報{ fun: 'listener', name, msg, args }，無error監聽者則console.error；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oAL = alive({ timeAlive: 1500 })
 *             let t = Date.now()
 *
 *             let a = { data: 123 }
 *             let b = { data: '34.56' }
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a1')
 *                 oAL.trigger('a', a)
 *             }, 500)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a2')
 *                 oAL.trigger('a', a)
 *             }, 1900)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b1')
 *                 oAL.trigger('b', b)
 *             }, 1000)
 *
 *             setTimeout(() => {
 *                 console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b2')
 *                 oAL.trigger('b', b)
 *             }, 3000)
 *
 *             oAL.on('message', function({ eventName, key, data, now }) {
 *                 console.log(parseInt((Date.now() - t)) + 'ms', { eventName, key, data, now })
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
 *     function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oAL = alive({ timeAlive: 1500 })
 *
 *             oAL.on('message', function({ eventName, key }) {
 *                 ms.push(eventName + '|' + key)
 *             })
 *
 *             oAL.trigger('a', { data: 123 })
 *
 *             setTimeout(() => {
 *                 oAL.trigger('b', { data: '34.56' })
 *                 let r = oAL.clear() //b剛trigger尚未發出enter, 故只回傳a, 且b之enter不再發出
 *                 ms.push('clear|' + r.map((v) => v.key).join(','))
 *             }, 500)
 *
 *             setTimeout(() => {
 *                 resolve(ms)
 *             }, 2500)
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // ["enter|a","clear|a"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function alive(opt = {}) {
    let ev = evem() //message事件於timer內派發, 監聽器出錯不得殺行程, 故派發處以evEmit攔截
    let q = Object.create(null) //queue, 以trigger之key為鍵; 用無原型物件使任意字串皆為一般鍵, 一般物件時__proto__會改掉佇列之原型、constructor等原型屬性名會被haskey誤判為已存在而不發enter
    let t = null //timer
    let tEnters = new Set() //尚未發出enter之計時器, 供clear取消
    let entered = new Set() //已發出enter且尚未leave之單元key, 供clear回傳
    let cleared = false //是否已clear, clear為終態

    //timeAlive
    let timeAlive = get(opt, 'timeAlive')
    if (!ispint(timeAlive)) {
        timeAlive = 10000
    }
    timeAlive = cint(timeAlive)
    timeAlive = Math.min(timeAlive, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //timeDetect
    let timeDetect = get(opt, 'timeDetect')
    if (!ispint(timeDetect)) {
        timeDetect = 50
    }
    timeDetect = cint(timeDetect)
    timeDetect = Math.min(timeDetect, cst.TIMER_TIME_MAX) //同上

    function detect() {
        if (cleared) {
            return
        }
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
                    entered.delete(key)

                    //emit leave
                    evEmit(ev, 'message', [{ eventName: 'leave', key, data: r.data, now: size(q) }], { tag: 'alive' })

                    //監聽器於派發中呼叫clear時須立即停止本輪, 不再處理或派發
                    //  each走的是本輪開始時之鍵清單, 而clear已清空佇列, 續走會讀到不存在之單元而拋錯
                    if (cleared) {
                        return false
                    }

                }
            })

            //已clear者計時器已於clear內清除
            if (cleared) {
                return
            }

            //clear, 當無任何訊息存在
            if (!iseobj(q)) {
                clearInterval(t)
                t = null
            }

        }, timeDetect)
    }

    function trigger(key, data) {

        //已clear為終態, 不建立計時器亦不發事件
        if (cleared) {
            return
        }

        //check
        if (!isestr(key)) {
            console.log('trigger need key')
            return
        }

        //check
        if (!haskey(q, key)) {
            //因需判斷是否為新單元故需放於update前, 而emit內可能會被存取q, 故需要用setTimeout脫勾使q為被更新資訊, 才能正確取得當前單元數量
            //不用evEmitDelay, 因其參數於呼叫時即求值, now會少計本單元; 計時器存入tEnters供clear取消
            let te = setTimeout(() => {

                //已發出, 移出待取消清單
                tEnters.delete(te)

                //派發前即標記已enter, 使監聽器於派發中呼叫clear時能回傳本單元, 以與其leave配對
                if (haskey(q, key)) {
                    entered.add(key)
                }

                //emit enter
                evEmit(ev, 'message', [{ eventName: 'enter', key, data, now: size(q) }], { tag: 'alive' })

            }, 1)
            tEnters.add(te)
        }

        //update
        q[key] = { data, time: Date.now() }

        //detect
        detect()

    }

    function _get() {
        let rs = []
        each(q, (v, k) => {
            rs.push({ key: k, data: v.data })
        })
        rs = cloneDeep(rs) //使用cloneDeep避免外部修改內部數據
        return rs
    }

    function clear() {

        //已clear則回傳[], 可重複呼叫
        if (cleared) {
            return []
        }
        cleared = true

        //清除偵測計時器
        if (t !== null) {
            clearInterval(t)
            t = null
        }

        //取消尚未發出之enter
        for (let te of tEnters) {
            clearTimeout(te)
        }
        tEnters.clear()

        //已發出enter且尚未leave之單元, 形狀同get; get含尚未發出enter者, 使用端拿其配對leave會出現有leave無enter
        let rs = []
        each(q, (v, k) => {
            if (entered.has(k)) {
                rs.push({ key: k, data: v.data })
            }
        })
        rs = cloneDeep(rs) //使用cloneDeep避免外部修改內部數據

        //清空佇列, 同建立時用無原型物件
        q = Object.create(null)
        entered.clear()

        return rs
    }

    //save
    ev.trigger = trigger
    ev.get = _get
    ev.clear = clear

    return ev
}


export default alive
