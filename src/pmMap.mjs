import each from 'lodash-es/each.js'
import values from 'lodash-es/values.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isnint from './isnint.mjs'
import cint from './cint.mjs'
import pmMarkHandled from './_pmMarkHandled.mjs'
import pmReadItems from './_pmReadItems.mjs'


/**
 * Promise的map，可設定同時處理數量
 *
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 * fn之回傳亦可為一般值(視為resolve)，fn同步拋錯視為reject；不給fn時rs之元素亦可為一般值，皆同pmSeries。任一者reject即reject並停止派發後續任務；不給fn時先行產生之Promise於進入時即被觀察，未派發者之reject亦不成為未處理之rejection。rs之元素於進入時即取值，呼叫後改動rs不影響fn收到之值，讀取元素拋錯時以該錯誤reject。
 * rs亦可為鍵值物件，依其自有可列舉字串鍵展開，fn收到(值, 鍵字串)；名為length之鍵與其他鍵同為一般鍵，不因其值為非負整數而改成依索引迭代。
 * 若先行產生promise則takeLimit設定會無效，因promise已先行初始化啟動。
 * 等同於Bluebird的Promise.map，而concurrency為takeLimit。
 * 使用函數執行時，當takeLimit=1，等同於mapSeries，promise依序執行完畢才會調用下一個promise。
 * 使用函數執行時，當takeLimit=0，等同於先行產生promise的情形，各promise直接執行視各自執行時間結束。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmMap.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} rs 輸入資料陣列或鍵值物件，若不給fn則rs需要為Promise陣列(或值為Promise之物件)
 * @param {Function} fun 輸入循序執行值的呼叫async函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve回傳成功結果，reject回傳失敗結果
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

    //check與rs to array, 皆於進入時取值(同pmSeries、pmChain), 單一擁有者為_pmReadItems(R-PM-SETTLE-01規則17、R-OBJ-ITER-01): 真陣列複製為普通陣列, 物件依自有可列舉字串鍵展開, 判定或讀取拋錯即reject該錯誤(不同步拋出、不懸置), 已讀到之Promise先標記已處理
    let useObj = false
    try {
        let rd = pmReadItems(rs)
        if (rd === null) {
            pm.reject('rs is not an array or object')
            return pm
        }
        rs = rd.items
        useObj = rd.useObj
    }
    catch (err) {
        pm.reject(err)
        return pm
    }

    //check
    if (rs.length === 0) {
        pm.resolve([]) //對空集合立即resolve([]), 因物件輸入會先轉換成[{k, v}]陣列處理, 最終透過values(ts)皆回傳陣列, 故須resolve([])
        return pm
    }

    //isFunFun, 於派發前判定一次, 不於逐元素回呼內重複判定(lodash之isFunction對async函數每次皆經getRawTag賦值拋錯再捕捉, V8擷取之非同步堆疊隨promise鏈加深而成平方)
    let isFunFun = isfun(fun)

    //未給fun時rs為Promise陣列, 先行產生之Promise於進入時即標記已處理, 否則takeLimit限量時排後者於取用前先reject、或中止後不再取用者, 皆成為未處理之rejection
    if (!isFunFun) {
        each(rs, (v) => {
            pmMarkHandled(useObj ? v.v : v)
        })
    }

    //takeLimit, 同queue之正規化: 非數字或負數視為0(無限制)
    if (isnint(takeLimit)) {
        takeLimit = 0
    }
    takeLimit = cint(takeLimit)

    //不經queue而以索引自行派發(同時執行數至多takeLimit), 以完成計數判定全部完成並只resolve一次(原每次完成皆size(ts)、每個finally皆values(ts)而成平方)
    let n = rs.length
    let next = 0 //下一個待派發之索引
    let running = 0 //執行中之任務數
    let nDone = 0 //已成功完成之任務數
    let resolved = false

    //runOne
    function runOne(i) {

        //uk, uv
        let uk = i
        let uv = rs[i]
        if (useObj) {
            uk = rs[i].k
            uv = rs[i].v
        }

        //pmm, 以原生Promise承接fun之結果或元素本身: fun同步拋錯轉為reject, 回傳一般值轉為resolve, 使每個任務必定settle
        let pmm = new Promise((resolve) => {
            if (isFunFun) {
                resolve(fun(uv, uk))
            }
            else {
                resolve(uv)
            }
        })

        //then and catch
        pmm
            .then((res) => {

                //save
                ts[i] = res
                nDone += 1

            })
            .catch((err) => {

                //abort, 停止派發後續任務
                abort = true

                //reject
                pm.reject(err)

            })
            .finally(() => {

                //running
                running -= 1

                //end
                if (!resolved && nDone === n) {

                    //resolve
                    resolved = true
                    pm.resolve(values(ts))

                    return
                }

                //launch
                launch()

            })

    }

    //launch, 派發至執行中之任務數達takeLimit(0為無限制)
    function launch() {
        while (!abort && next < n) {
            if (takeLimit > 0 && running >= takeLimit) {
                break
            }
            let i = next
            next += 1
            running += 1
            runOne(i)
        }
    }

    //launch
    launch()

    return pm
}


export default pmMap
