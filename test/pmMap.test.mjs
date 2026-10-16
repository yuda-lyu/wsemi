import assert from 'assert'
import { fileURLToPath } from 'url'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import pmMap from '../src/pmMap.mjs'
import isarr from '../src/isarr.mjs'
import isobj from '../src/isobj.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


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


describe(`pmMap 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

    let runner = fileURLToPath(new URL('./tools/pmObjLenRunner.mjs', import.meta.url))

    //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
    let setOwn = (o, k, v) => {
        Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
        return o
    }

    //call, 等待pmMap之結果轉為{ s, v }; 同步拋出記為{ s: 'throw' }, 使修前之同步拋出以斷言失敗呈現而非中斷
    let call = (fn) => {
        try {
            return Promise.resolve(fn()).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        }
        catch (e) {
            return Promise.resolve({ s: 'throw', v: e })
        }
    }

    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    //以'k=v'呈現fun收到之鍵與值
    let kv = (v, k) => k + '=' + v

    describe(`物件輸入只依自有可列舉字串鍵, length與其他鍵同為一般鍵(規則1、2)`, function() {

        class ProtoLen {
            get length() {
                return 2
            }
        }

        //期望值為手算: 物件以Object.keys順序(整數鍵升冪在前, 其餘依建立順序), 值為'鍵=值'
        let cases = [
            [`length:1與一般鍵a(修前得'0=undefined')`, () => ({ length: 1, a: 'x' }), ['length=1', 'a=x']],
            [`length:0與一般鍵a(修前得空陣列)`, () => ({ length: 0, a: 'x' }), ['length=0', 'a=x']],
            [`只有length:0(修前得空陣列)`, () => ({ length: 0 }), ['length=0']],
            [`length:2並存數字鍵0、1(修前只走索引0、1, 漏length與a)`, () => ({ length: 2, 0: 'p', 1: 'q', a: 'x' }), ['0=p', '1=q', 'length=2', 'a=x']],
            [`length為-0(JSON.parse可產生, isLength為真)`, () => JSON.parse('{"length":-0,"a":"x"}'), ['length=0', 'a=x']],
            [`原型上有length getter之class實例(修前依其值走索引)`, () => {
                let o = new ProtoLen()
                o.a = 'x'
                return o
            }, ['a=x']],
            [`Object.create(null)且有length鍵(修前走索引)`, () => {
                let o = Object.create(null)
                o.length = 1
                o.b = 'y'
                return o
            }, ['length=1', 'b=y']],
            [`Symbol.toStringTag偽稱Array(isarr為真之非真陣列), length:2(修前依length走索引)`, () => ({ [Symbol.toStringTag]: 'Array', length: 2, a: 'x' }), ['length=2', 'a=x']],
            [`Symbol.toStringTag偽稱Array, length:0(修前得空陣列)`, () => ({ [Symbol.toStringTag]: 'Array', length: 0, a: 'x' }), ['length=0', 'a=x']],
            [`Symbol.toStringTag偽稱Array, 只有length:3(修前得三個undefined)`, () => ({ [Symbol.toStringTag]: 'Array', length: 3 }), ['length=3']],
        ]

        for (let [name, mk, exp] of cases) {
            it(`should iterate own keys only for ${name}`, async function() {
                let out = {}
                for (let takeLimit of [0, 1, 2]) {
                    out[takeLimit] = await call(() => pmMap(mk(), kv, takeLimit))
                }
                let ok = { s: 'resolve', v: exp }
                assert.strict.deepStrictEqual(out, { 0: ok, 1: ok, 2: ok })
            })
        }

        //length非陣列樣之值(修前亦走自有鍵, 行為鎖定)
        it(`should keep iterating own keys when length is not array-like (-1, 1.5, '3', null, true, NaN, Infinity, 2^53, object, array)`, async function() {
            let lens = [
                [-1, 'length=-1'],
                [1.5, 'length=1.5'],
                ['3', 'length=3'],
                ['abc', 'length=abc'],
                [null, 'length=null'],
                [undefined, 'length=undefined'],
                [true, 'length=true'],
                [NaN, 'length=NaN'],
                [Infinity, 'length=Infinity'],
                [2 ** 53, 'length=9007199254740992'],
                [{}, 'length=[object Object]'],
                [[], 'length='],
                [[1, 2], 'length=1,2'],
            ]
            let out = []
            for (let [len] of lens) {
                out.push(await call(() => pmMap({ length: len, a: 'x' }, kv, 1)))
            }
            assert.strict.deepStrictEqual(out, lens.map(([, s]) => ({ s: 'resolve', v: [s, 'a=x'] })))
        })

        it(`should pass string keys to fun for objects (including digit keys and length) and number indexes for arrays`, async function() {
            let ko = []
            let ka = []
            await pmMap({ 0: 'p', length: 1 }, (v, k) => {
                ko.push(typeof k + ':' + k)
            }, 1)
            await pmMap(['p', 'q'], (v, k) => {
                ka.push(typeof k + ':' + k)
            }, 1)
            assert.strict.deepStrictEqual({ ko, ka }, { ko: ['string:0', 'string:length'], ka: ['number:0', 'number:1'] })
        })

        it(`should take the values of own keys when fun is omitted (values are promises or plain values)`, async function() {
            let mk = () => ({ length: 1, a: Promise.resolve('A'), b: Promise.resolve('B') })
            let r0 = await call(() => pmMap(mk(), null, 0))
            let r1 = await call(() => pmMap(mk(), null, 1))
            let ok = { s: 'resolve', v: [1, 'A', 'B'] }
            assert.strict.deepStrictEqual({ r0, r1 }, { r0: ok, r1: ok })
        })

        it(`should only use own enumerable string keys: no inherited, non-enumerable or symbol keys`, async function() {
            let proto = { inh: 1 }
            let o = Object.create(proto)
            o.a = 'x'
            Object.defineProperty(o, 'hid', { value: 'h', enumerable: false })
            o[Symbol('s')] = 'sym'
            class C {
                constructor() {
                    this.p = 1
                }

                m() {}
            }
            let r = await call(() => pmMap(o, kv))
            let rc = await call(() => pmMap(new C(), kv))
            assert.strict.deepStrictEqual({ r, rc }, { r: { s: 'resolve', v: ['a=x'] }, rc: { s: 'resolve', v: ['p=1'] } })
        })

        it(`should keep the empty-collection and invalid-input behavior`, async function() {
            let empties = []
            for (let inp of [[], {}, Object.create(null), []]) {
                empties.push(await call(() => pmMap(inp, kv, 1)))
            }
            let sparse = await call(() => pmMap(new Array(3), kv))
            // eslint-disable-next-line no-new-wrappers
            let bads = [undefined, null, 0, 1, '', 'abc', true, () => {}, new Map(), new Set(), new Uint8Array(2), new Date(0), /x/, new String('ab'), Symbol('s'), 10n]
            let rb = []
            for (let b of bads) {
                rb.push(await call(() => pmMap(b, kv)))
            }
            assert.strict.deepStrictEqual({ empties, sparse, rb }, {
                empties: [{ s: 'resolve', v: [] }, { s: 'resolve', v: [] }, { s: 'resolve', v: [] }, { s: 'resolve', v: [] }],
                sparse: { s: 'resolve', v: ['0=undefined', '1=undefined', '2=undefined'] }, //真陣列(稀疏)仍依其length逐一呼叫
                rb: bads.map(() => ({ s: 'reject', v: 'rs is not an array or object' })),
            })
        })

        it(`should not add keys to or change the input object, and fun receives the values at call time`, async function() {
            let inp = { length: 2, a: 'x', 0: 'p' }
            let snap = JSON.stringify(inp)
            let keys = Object.keys(inp)
            let r1 = await call(() => pmMap(inp, kv))
            assert.strict.deepStrictEqual({ r1, same: JSON.stringify(inp) === snap, keys: Object.keys(inp) }, { r1: { s: 'resolve', v: ['0=p', 'length=2', 'a=x'] }, same: true, keys })

            let o = { a: 1, b: 2, c: 3 }
            let seen = []
            let pm = pmMap(o, async (v, k) => {
                seen.push([k, v])
                await sleep(5)
                return v
            }, 1)
            o.b = 'changed'
            delete o.c
            o.d = 'new'
            let r2 = await call(() => pm)
            assert.strict.deepStrictEqual({ seen, r2 }, { seen: [['a', 1], ['b', 2], ['c', 3]], r2: { s: 'resolve', v: [1, 2, 3] } })
        })

    })

    describe(`無陣列樣length鍵之輸入: 與修前演算法及獨立期望值逐案相同(行為鎖定)`, function() {

        //修前之輸入轉換(size判空、isobj以lodash each展開、陣列以slice複製)原樣複製, 回傳fun收到之[k, v]序列; 非陣列非物件回'reject'
        let legacyPairs = (rs) => {
            if (!isarr(rs) && !isobj(rs)) {
                return 'reject'
            }
            if (size(rs) === 0) {
                return []
            }
            let useObj = false
            if (isobj(rs)) {
                useObj = true
                let _rs = []
                each(rs, (v, k) => {
                    _rs.push({ k, v })
                })
                rs = _rs
            }
            else {
                rs = Array.prototype.slice.call(rs)
            }
            let out = []
            for (let i = 0; i < rs.length; i++) {
                out.push(useObj ? [rs[i].k, rs[i].v] : [i, rs[i]])
            }
            return out
        }

        //獨立於實作與修前演算法之期望值: 陣列依索引0..length-1(稀疏處為undefined), 物件依Object.keys
        let oracle = (rs) => {
            if (Array.isArray(rs)) {
                return Array.from({ length: rs.length }, (_, i) => [i, rs[i]])
            }
            return Object.keys(rs).map((k) => [k, rs[k]])
        }

        let seed = 20261017
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
        let vals = [1, 0, -5, 1.5, 'a', '', 'x y', null, undefined, true, false, NaN, { n: 1 }, [1, 2]]
        //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
        let lenVals = [-1, 1.5, '3', 'abc', null, true, NaN, Infinity, 2 ** 53, {}, [], [1, 2], undefined]
        let keyNames = ['a', 'b', 'c', '0', '1', '10', 'constructor', 'toString', '__proto__', 'hasOwnProperty', 'x y', '中文']

        let gen = () => {
            if (rnd() < 0.4) {
                let n = Math.floor(rnd() * 6)
                let a = []
                for (let i = 0; i < n; i++) {
                    a.push(pick(vals))
                }
                if (n > 0 && rnd() < 0.3) {
                    delete a[Math.floor(rnd() * n)] //稀疏
                }
                return a
            }
            let o = {}
            let n = Math.floor(rnd() * 6)
            for (let i = 0; i < n; i++) {
                setOwn(o, pick(keyNames), pick(vals))
            }
            if (rnd() < 0.4) {
                setOwn(o, 'length', pick(lenVals))
            }
            return o
        }

        //兩個案例共用同一批輸入與takeLimit
        let inputs = Array.from({ length: 400 }, () => gen())
        let limits = inputs.map(() => pick([0, 1, 2]))

        let diff = async (expectOf) => {
            let bad = []
            for (let i = 0; i < inputs.length; i++) {
                let r = await call(() => pmMap(inputs[i], (v, k) => [k, v], limits[i]))
                try {
                    assert.strict.deepStrictEqual(r, { s: 'resolve', v: expectOf(inputs[i]) })
                }
                catch (err) {
                    bad.push(i)
                }
            }
            return bad
        }

        it(`should equal the legacy conversion on 400 random objects and arrays without array-like length keys`, async function() {
            assert.strict.deepStrictEqual(await diff(legacyPairs), [])
        })

        it(`should equal the independent expectation (Object.keys / indexes) on the same inputs`, async function() {
            assert.strict.deepStrictEqual(await diff(oracle), [])
        })

    })

    describe(`子行程: 讀取失敗時已讀到之Promise仍被觀察、Array子類別(Symbol.species)與稀疏陣列 [R-PM-SETTLE-01規則9、17]`, function() {

        it(`不給fun, 前項為rejected Promise、其後元素/值讀取即拋錯: 以該錯誤reject, 前項不成為未處理之rejection`, function() {
            let r = runChildCase(runner, 'promisePrefix').r
            let rj = { syncThrow: false, s: 'reject', same: true }
            assert.strict.deepStrictEqual({ out: { mapArr: r.out.mapArr, mapObj: r.out.mapObj }, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { mapArr: rj, mapObj: rj }, unhandled: [], uncaught: [] })
        })

        it(`Symbol.species回Object之Array子類別得[2,3]; 稀疏陣列之空洞以undefined交fun(長度含空洞), 同修前`, function() {
            let r = runChildCase(runner, 'speciesSparse').r
            assert.strict.deepStrictEqual({
                species: r.out.mapSpecies,
                sparseFun: r.out.mapSparseFun,
                sparseNoFun: r.out.mapSparseNoFun,
                unhandled: r.unhandled,
                uncaught: r.uncaught,
            }, {
                species: { s: 'resolve', v: [2, 3] },
                sparseFun: { s: 'resolve', v: ['0:a', '1:undefined', '2:c'] },
                sparseNoFun: { s: 'resolve', v: ['a', null, 'c'] }, //undefined經子行程JSON輸出為null
                unhandled: [],
                uncaught: [],
            })
        })

    })

    describe(`子行程: 容器本身讀取即拋錯(已撤銷Proxy、Symbol.toStringTag拋錯) [R-PM-SETTLE-01規則17]`, function() {

        it(`已撤銷之Proxy: 以TypeError reject, 不同步拋出`, function() {
            let r = runChildCase(runner, 'revokedContainer').r
            assert.strict.deepStrictEqual({ out: r.out.map, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', isTypeError: true }, unhandled: [], uncaught: [] })
        })

        it(`Symbol.toStringTag讀取即拋錯: 以該錯誤reject, 不同步拋出`, function() {
            let r = runChildCase(runner, 'tagGetterContainer').r
            assert.strict.deepStrictEqual({ out: r.out.map, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', same: true, msg: null }, unhandled: [], uncaught: [] })
        })

    })

    describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

        let MAX = Number.MAX_SAFE_INTEGER
        //limit 64MB: 修前之實作對 length>=5e6 即逐次建立元素而耗盡堆積, 離開碼 134
        let cases = [
            ['len', 5e6],
            ['len', 1e8],
            ['len', MAX],
            ['len', 4294967295],
            ['len', 4294967296],
            ['len', 2 ** 53], //超過 isLength 上限, 修前即以自有鍵迭代, 對照
            ['tag', 1e6], //Symbol.toStringTag偽稱Array(isarr為真之非真陣列): 不得依length迭代
            ['tag', MAX],
            ['keys', MAX],
        ]
        for (let [kind, len] of cases) {
            it(`should finish map:${kind}:${len} within 1000 ms and 4 MB of heap, iterating own keys only`, function() {
                let rc = runChildCase(runner, `map:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                let o = rc.r.out
                assert.strict.deepStrictEqual({ unhandled: rc.r.unhandled, uncaught: rc.r.uncaught, runnerError: o.runnerError }, { unhandled: [], uncaught: [], runnerError: undefined })
                let exp = ['length=' + len]
                if (kind === 'keys') {
                    for (let i = 0; i < 100; i++) {
                        exp.push('k' + i + '=x')
                    }
                }
                else {
                    exp.push('a=x')
                }
                assert.strict.deepStrictEqual(o.res, exp)
                assert.ok(o.ms < 1000, `ms=${o.ms}`)
                assert.ok(o.heapMB < 4, `heapMB=${o.heapMB}`)
            })
        }

    })

})
