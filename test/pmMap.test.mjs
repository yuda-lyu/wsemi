import assert from 'assert'
import pmMap from '../src/pmMap.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`pmMap`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 2 //通過function調用產生promise, 可受takeLimit控管同時執行數量, takeLimit=2
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //cost: (1)340, (2)310, (3)260, (4)190, (5)100
    //1core: call 2(0) -> resolve 2(310) -> call 3(310) -> resolve 3(310+260=570)
    //2core: call 1(0) -> resolve 1(340) -> call 4(340) -> resolve 4(340+190=530) -> call 5(530) -> resolve 5(340+190+100=630)
    // console.log('test1')
    // test1
    // call 1
    // call 2
    // resolve 2 d 310
    // call 3
    // resolve 1 d 340
    // call 4
    // resolve 4 d 190
    // call 5
    // resolve 3 d 260
    // resolve 5 d 100
    // then ["#1","#2","#3","#4","#5"]
    // [{"call":1},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":1,"d":340},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":3,"d":260},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]
    let r1 = '[{"call":1},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":1,"d":340},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":3,"d":260},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 1 //通過function調用產生promise, takeLimit=1, 等同於mapSeries
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    // console.log('test2')
    // test2
    // call 1
    // resolve 1 d 340
    // call 2
    // resolve 2 d 310
    // call 3
    // resolve 3 d 260
    // call 4
    // resolve 4 d 190
    // call 5
    // resolve 5 d 100
    // then ["#1","#2","#3","#4","#5"]
    // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]
    let r2 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 0 //通過function調用產生promise, takeLimit=0, 無限制同時執行數量
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    // console.log('test3')
    // test3
    // call 1
    // call 2
    // call 3
    // call 4
    // call 5
    // resolve 5 d 100
    // resolve 4 d 190
    // resolve 3 d 260
    // resolve 2 d 310
    // resolve 1 d 340
    // then ["#1","#2","#3","#4","#5"]
    // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]
    let r3 = '[{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 2 //同takeLimit=0(無限制同時執行數量), 因rs已事先初始化就執行故無法受takeLimit控管
            let rs = [1, 2, 3, 4, 5].map(function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            })
            pmMap(rs, null, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    // console.log('test4')
    // test4
    // call 1
    // call 2
    // call 3
    // call 4
    // call 5
    // resolve 5 d 100
    // resolve 4 d 190
    // resolve 3 d 260
    // resolve 2 d 310
    // resolve 1 d 340
    // then ["#1","#2","#3","#4","#5"]
    // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]
    let r4 = '[{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r4}' when run test4'`, async function() {
        let ms = await test4()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

    async function test5() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 1 //takeLimit=1循序執行, 執行到3先catch而跳出pmMap, 故其他任務4與5不會執行
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        if (v === 3) {
                            // console.log('reject', v, 'd', d)
                            ms.push({ reject: v, d })
                            reject('#' + v)
                        }
                        else {
                            // console.log('resolve', v, 'd', d)
                            ms.push({ resolve: v, d })
                            resolve('#' + v)
                        }
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    // console.log('test5')
    // test5
    // call 1
    // resolve 1 d 340
    // call 2
    // resolve 2 d 310
    // call 3
    // reject 3 d 260
    // catch "#3"
    // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]
    let r5 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]'
    it(`should return '${r5}' when run test5'`, async function() {
        let ms = await test5()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r5)
    })

    async function test6() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 0 //無限制同時執行數量, 會於3先catch而跳出pmMap, 但因順發同時執行(1~5都已call), 故3 catch(260m)之後還會有resolve 1(340)與2(310)
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        if (v === 3) {
                            // console.log('reject', v, 'd', d)
                            ms.push({ reject: v, d })
                            reject('#' + v)
                        }
                        else {
                            // console.log('resolve', v, 'd', d)
                            ms.push({ resolve: v, d })
                            resolve('#' + v)
                        }
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    // console.log('test6')
    // test6
    // call 1
    // call 2
    // call 3
    // call 4
    // call 5
    // resolve 5 d 100
    // resolve 4 d 190
    // reject 3 d 260
    // catch "#3"
    // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"reject":3,"d":260},{"err":"#3"}]
    // resolve 2 d 310
    // resolve 1 d 340
    let r6 = '[{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"reject":3,"d":260},{"err":"#3"}]'
    it(`should return '${r6}' when run test6'`, async function() {
        let ms = await test6()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r6)
    })

    async function test7() {
        return new Promise((resolve, reject) => {
            let ms = []
            pmMap({
                t1: 1,
                t2: 2.345,
                t3: 'abc',
            }, function (v, k) {
                return new Promise(function(resolve, reject) {
                    resolve(`k=${k},v=${v}`)
                })
            },)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    let r7 = '[{"res":["k=t1,v=1","k=t2,v=2.345","k=t3,v=abc"]}]'
    it(`should return '${r7}' when run test7'`, async function() {
        let ms = await test7()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r7)
    })

    async function test8() {
        return new Promise((resolve, reject) => {
            let ms = []
            pmMap([], function(v, k) {
                return new Promise(function(resolve, reject) {
                    resolve(v)
                })
            })
                .then(function(res) {
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    let r8 = '[{"res":[]}]'
    it(`should return '${r8}' when run test8 with empty array`, async function() {
        let ms = await test8()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r8)
    })

    async function test9() {
        return new Promise((resolve, reject) => {
            let ms = []
            pmMap({}, function(v, k) {
                return new Promise(function(resolve, reject) {
                    resolve(v)
                })
            })
                .then(function(res) {
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    let r9 = '[{"res":[]}]'
    it(`should return '${r9}' when run test9 with empty object`, async function() {
        let ms = await test9()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r9)
    })

})


describe(`pmMap settle(R-PM-SETTLE-01)`, function() {

    it(`pmMap: fun同步拋錯reject原值, 回傳一般值resolve, 不給fun時一般值resolve且與pmSeries相同, 不經console.error [規則1、2]`, function() {
        let { r } = runPmSettle('mapFunResults')
        assert.strict.deepStrictEqual(r.out, {
            funThrow: { s: 'reject', same: true },
            funValue1: { s: 'resolve', v: [10, 20] },
            funValue0: { s: 'resolve', v: [10, 20] },
            noFunValues: { s: 'resolve', v: [1, 2] },
            noFunObj: { s: 'resolve', v: [1, 2] },
            seriesNoFunObj: { s: 'resolve', v: [1, 2] },
            consoleError: 0,
        })
    })

})


describe(`pmMap 派發與完成(R-PM-SETTLE-01規則16)`, function() {

    //mk, 任務函數: 記錄被呼叫之元素、執行中數與最大並行數, 耗時依dOf(v), 元素為failAt時reject('#'+v)否則resolve('#'+v)
    let mk = (dOf, failAt = null) => {
        let st = { called: [], conc: 0, maxConc: 0 }
        let fun = (v) => {
            st.called.push(v)
            st.conc += 1
            st.maxConc = Math.max(st.maxConc, st.conc)
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    st.conc -= 1
                    if (v === failAt) {
                        reject('#' + v)
                    }
                    else {
                        resolve('#' + v)
                    }
                }, dOf(v))
            })
        }
        return { st, fun }
    }

    //st, 結果轉為{ s, v }
    let st = (pm) => pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))

    it(`同時執行數之最大值等於takeLimit(1、2), takeLimit為0時不限 [規則16]`, async function() {
        let out = {}
        for (let takeLimit of [1, 2, 0]) {
            let m = mk(() => 20)
            let r = await st(pmMap([1, 2, 3, 4, 5, 6], m.fun, takeLimit))
            out[takeLimit] = { r, maxConc: m.st.maxConc }
        }
        let all = { s: 'resolve', v: ['#1', '#2', '#3', '#4', '#5', '#6'] }
        //R-PM-SETTLE-01 規則16: pmMap不經queue, 以索引派發; JSDoc pmMap:26「輸入同時處理數量整數，預設0，代表無限制」
        assert.strict.deepStrictEqual(out, { 1: { r: all, maxConc: 1 }, 2: { r: all, maxConc: 2 }, 0: { r: all, maxConc: 6 } })
    })

    it(`完成順序與輸入順序不同、或同一輪完成時, resolve之結果皆依輸入順序且只resolve一次 [規則16]`, async function() {
        let m = mk((v) => 60 - (v * 10))
        let a = await st(pmMap([1, 2, 3, 4, 5], m.fun, 0))
        let b = await st(pmMap([1, 2, 3, 4, 5], (v) => v * 10, 0))
        let c = await st(pmMap([1, 2, 3].map((v) => Promise.resolve(v)), null, 2))
        //R-PM-SETTLE-01 規則16: 以完成計數判定全部完成並只resolve一次; JSDoc pmMap:27「resolve回傳成功結果」(依輸入順序, 同JSDoc範例)
        assert.strict.deepStrictEqual({ a, b, c }, {
            a: { s: 'resolve', v: ['#1', '#2', '#3', '#4', '#5'] },
            b: { s: 'resolve', v: [10, 20, 30, 40, 50] },
            c: { s: 'resolve', v: [1, 2, 3] },
        })
    })

    it(`任一者reject即reject, 其後未派發者之fun呼叫0次 [規則16]`, async function() {
        let m1 = mk(() => 10, 3)
        let r1 = await st(pmMap([1, 2, 3, 4, 5], m1.fun, 1))
        let m2 = mk((v) => (v === 1 ? 10 : 40), 1)
        let r2 = await st(pmMap([1, 2, 3, 4, 5], m2.fun, 2))
        await new Promise((resolve) => setTimeout(resolve, 80)) //等候已派發者完成, 確認其後無再派發
        //R-PM-SETTLE-01 規則16: 以索引派發; JSDoc pmMap:16「任一者reject即reject並停止派發後續任務」
        assert.strict.deepStrictEqual({ r1, called1: m1.st.called, r2, called2: m2.st.called }, {
            r1: { s: 'reject', v: '#3' },
            called1: [1, 2, 3],
            r2: { s: 'reject', v: '#1' },
            called2: [1, 2],
        })
    })

})


describe(`pmMap 輸入於進入時取值(R-PM-SETTLE-01規則1、2、16)`, function() {

    describe(`子行程: 元素讀取即拋錯`, function() {
        let r = null
        before(function() {
            r = runPmSettle('mapElemGetterThrow').r
        })

        it(`陣列第2個元素讀取即拋錯(有fun之takeLimit 1與0、未給fun): 以該錯誤reject, 不同步拋出、不懸置 [規則1]`, function() {
            //R-PM-SETTLE-01 規則1: 呼叫端之任何結果(含讀取即拋錯者)使回傳之Promise必定settle; 規則16(增訂): 陣列輸入於進入時取值(同HEAD); JSDoc pmMap:17「讀取元素拋錯時以該錯誤reject」
            let rj = { s: 'reject', same: true }
            assert.strict.deepStrictEqual({ arrFun1: r.out.arrFun1, arrFun0: r.out.arrFun0, arrNoFun1: r.out.arrNoFun1 }, { arrFun1: rj, arrFun0: rj, arrNoFun1: rj })
        })

        it(`物件之值讀取即拋錯: 同陣列, 以該錯誤reject [規則1]`, function() {
            //R-PM-SETTLE-01 規則1: 同上(物件輸入於進入時轉為內部陣列, 與陣列輸入同一取值時機); JSDoc pmMap:17「讀取元素拋錯時以該錯誤reject」
            assert.strict.deepStrictEqual(r.out.objFun1, { s: 'reject', same: true })
        })

        it(`無未處理之rejection與未捕捉例外 [規則2]`, function() {
            //R-PM-SETTLE-01 規則2
            assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
        })
    })

    it(`呼叫後改動輸入陣列(改元素、縮短長度): fun收到呼叫當下之值 [規則16]`, async function() {
        let calls = []
        let rs = ['a', 'b', 'c']
        let pm = pmMap(rs, async (v, k) => {
            calls.push([k, v])
            await new Promise((resolve) => setTimeout(resolve, 10))
            return v
        }, 1)
        rs[1] = 'B-mutated'
        rs.length = 2
        let r = await pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        //R-PM-SETTLE-01 規則16(增訂): 陣列輸入於進入時取值(同HEAD), 派發時不再讀呼叫端之陣列; JSDoc pmMap:17「rs之元素於進入時即取值，呼叫後改動rs不影響fn收到之值」
        assert.strict.deepStrictEqual({ calls, r }, { calls: [[0, 'a'], [1, 'b'], [2, 'c']], r: { s: 'resolve', v: ['a', 'b', 'c'] } })
    })

})
