import each from 'lodash/each'
import size from 'lodash/size'
import values from 'lodash/values'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isfun from './isfun.mjs'
import queue from './queue.mjs'


/**
 * Promise的map，可設定同時處理數量
 *
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 * 若先行產生promise則takeLimit設定會無效，因promise已先行初始化啟動。
 * 等同於Bluebird的Promise.map，而concurrency為takeLimit。
 * 使用函數執行時，當takeLimit=1，等同於mapSeries，promise依序執行完畢才會調用下一個promise。
 * 使用函數執行時，當takeLimit=0，等同於先行產生promise的情形，各promise直接執行視各自執行時間結束。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmMap.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fun 輸入循序執行值的呼叫函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 2 //通過function調用產生promise, 可受takeLimit控管同時執行數量, takeLimit=2
 *             pmMap([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             }, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     //cost: (1)340, (2)310, (3)260, (4)190, (5)100
 *     //1core: call 2(0) -> resolve 2(310) -> call 3(310) -> resolve 3(310+260=570)
 *     //2core: call 1(0) -> resolve 1(340) -> call 4(340) -> resolve 4(340+190=530) -> call 5(530) -> resolve 5(340+190+100=630)
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call 1
 *     // call 2
 *     // resolve 2 d 310
 *     // call 3
 *     // resolve 1 d 340
 *     // call 4
 *     // resolve 4 d 190
 *     // call 5
 *     // resolve 3 d 260
 *     // resolve 5 d 100
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":1,"d":340},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":3,"d":260},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 1 //通過function調用產生promise, takeLimit=1, 等同於mapSeries
 *             pmMap([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             }, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // call 1
 *     // resolve 1 d 340
 *     // call 2
 *     // resolve 2 d 310
 *     // call 3
 *     // resolve 3 d 260
 *     // call 4
 *     // resolve 4 d 190
 *     // call 5
 *     // resolve 5 d 100
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 0 //通過function調用產生promise, takeLimit=0, 無限制同時執行數量
 *             pmMap([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             }, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // call 1
 *     // call 2
 *     // call 3
 *     // call 4
 *     // call 5
 *     // resolve 5 d 100
 *     // resolve 4 d 190
 *     // resolve 3 d 260
 *     // resolve 2 d 310
 *     // resolve 1 d 340
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]
 *
 *     async function test4() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 2 //同takeLimit=0(無限制同時執行數量), 因rs已事先初始化就執行故無法受takeLimit控管
 *             let rs = [1, 2, 3, 4, 5].map(function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             })
 *             pmMap(rs, null, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test4')
 *     let r4 = await test4()
 *     console.log(JSON.stringify(r4))
 *     // test4
 *     // call 1
 *     // call 2
 *     // call 3
 *     // call 4
 *     // call 5
 *     // resolve 5 d 100
 *     // resolve 4 d 190
 *     // resolve 3 d 260
 *     // resolve 2 d 310
 *     // resolve 1 d 340
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]
 *
 *     async function test5() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 1 //takeLimit=1循序執行, 執行到3先catch而跳出pmMap, 故其他任務4與5不會執行
 *             pmMap([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         if (v === 3) {
 *                             console.log('reject', v, 'd', d)
 *                             ms.push({ reject: v, d })
 *                             reject('#' + v)
 *                         }
 *                         else {
 *                             console.log('resolve', v, 'd', d)
 *                             ms.push({ resolve: v, d })
 *                             resolve('#' + v)
 *                         }
 *                     }, d)
 *                 })
 *             }, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test5')
 *     let r5 = await test5()
 *     console.log(JSON.stringify(r5))
 *     // test5
 *     // call 1
 *     // resolve 1 d 340
 *     // call 2
 *     // resolve 2 d 310
 *     // call 3
 *     // reject 3 d 260
 *     // catch "#3"
 *     // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]
 *
 *     async function test6() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             let takeLimit = 0 //無限制同時執行數量, 會於3先catch而跳出pmMap, 但因順發同時執行(1~5都已call), 故3 catch(260m)之後還會有resolve 1(340)與2(310)
 *             pmMap([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         if (v === 3) {
 *                             console.log('reject', v, 'd', d)
 *                             ms.push({ reject: v, d })
 *                             reject('#' + v)
 *                         }
 *                         else {
 *                             console.log('resolve', v, 'd', d)
 *                             ms.push({ resolve: v, d })
 *                             resolve('#' + v)
 *                         }
 *                     }, d)
 *                 })
 *             }, takeLimit)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test6')
 *     let r6 = await test6()
 *     console.log(JSON.stringify(r6))
 *     // test6
 *     // call 1
 *     // call 2
 *     // call 3
 *     // call 4
 *     // call 5
 *     // resolve 5 d 100
 *     // resolve 4 d 190
 *     // reject 3 d 260
 *     // catch "#3"
 *     // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"reject":3,"d":260},{"err":"#3"}]
 *     // resolve 2 d 310
 *     // resolve 1 d 340
 *
 *     let delay = () => {
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 resolve()
 *             }, 700)
 *         })
 *     }
 *     await delay()
 *
 *     async function test7() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *             pmMap({
 *                 t1: 1,
 *                 t2: 2.345,
 *                 t3: 'abc',
 *             }, function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     resolve(`k=${k},v=${v}`)
 *                 })
 *             },)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *         })
 *     }
 *     console.log('test7')
 *     let r7 = await test7()
 *     console.log(JSON.stringify(r7))
 *     // test7
 *     // then ["k=t1,v=1","k=t2,v=2.345","k=t3,v=abc"]
 *     // [{"res":["k=t1,v=1","k=t2,v=2.345","k=t3,v=abc"]}]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmMap(rs, fun, takeLimit = 0) {
    let ts = {}
    let abort = false

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs) && !isobj(rs)) {
        pm.reject('rs is not an array or object')
        return pm
    }

    //object rs to array
    let useObj = false
    if (isobj(rs)) {
        useObj = true
        let _rs = []
        each(rs, (v, k) => {
            _rs.push({ k, v })
        })
        rs = _rs
    }

    //queue
    let q = queue(takeLimit)

    //message
    q.on('message', function(qs) {
        //console.log('message', JSON.stringify(qs))

        //check
        if (abort) {
            return
        }

        //get
        let v = q.get()
        //console.log('get', v)

        //pmm
        let pmm
        if (isfun(fun)) {
            let uk = v.key
            let uv = v.value
            if (useObj) {
                uk = v.value.k
                uv = v.value.v
            }
            pmm = fun(uv, uk)
        }
        else {
            pmm = v.value
        }

        //then and catch
        pmm
            .then((res) => {

                //save
                ts[v.key] = res

            })
            .catch((err) => {

                //abort
                abort = true

                //clear
                q.clear()

                //reject
                pm.reject(err)

            })
            .finally(() => {

                //cb
                q.cb()

                //end
                if (size(ts) === rs.length) {

                    //resolve
                    pm.resolve(values(ts))

                }

            })

    })

    //push, 因queue emit為即時觸發故push需放最後
    each(rs, (v, k) => {
        q.push({
            key: k,
            value: v,
        })
    })

    return pm
}


export default pmMap
