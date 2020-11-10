import assert from 'assert'
import pmMap from '../src/pmMap.mjs'


describe(`pmMap`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 2 //通過function調用產生promise, 可受takeLimit控管同時執行數量, takeLimit=2
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        //console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //cost: (1)340, (2)310, (3)260, (4)190, (5)100
    //1core: call 2(0) -> resolve 2(310) -> call 3(310) -> resolve 3(310+260=570)
    //2core: call 1(0) -> resolve 1(340) -> call 4(340) -> resolve 4(340+190=530) -> call 5(530) -> resolve 5(340+190+100=630)
    //console.log('test1')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 1 //通過function調用產生promise, takeLimit=1, 等同於mapSeries
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        //console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //console.log('test2')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 0 //通過function調用產生promise, takeLimit=0, 無限制同時執行數量
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        //console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //console.log('test3')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 2 //同takeLimit=0(無限制同時執行數量), 因rs已事先初始化就執行故無法受takeLimit控管
            let rs = [1, 2, 3, 4, 5].map(function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        //console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            })
            pmMap(rs, null, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //console.log('test4')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

    async function test5() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 1 //takeLimit=1循序執行, 執行到3先catch而跳出pmMap, 故其他任務4與5不會執行
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        if (v === 3) {
                            //console.log('reject', v, 'd', d)
                            ms.push({ reject: v, d })
                            reject('#' + v)
                        }
                        else {
                            //console.log('resolve', v, 'd', d)
                            ms.push({ resolve: v, d })
                            resolve('#' + v)
                        }
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //console.log('test5')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r5)
    })

    async function test6() {
        return new Promise((resolve, reject) => {
            let ms = []
            let takeLimit = 0 //無限制同時執行數量, 會於3先catch而跳出pmMap, 但因順發同時執行(1~5都已call), 故3 catch(260m)之後還會有resolve 1(340)與2(310)
            pmMap([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    //console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        if (v === 3) {
                            //console.log('reject', v, 'd', d)
                            ms.push({ reject: v, d })
                            reject('#' + v)
                        }
                        else {
                            //console.log('resolve', v, 'd', d)
                            ms.push({ resolve: v, d })
                            resolve('#' + v)
                        }
                    }, d)
                })
            }, takeLimit)
                .then(function(res) {
                    //console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    //console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })
        })
    }
    //console.log('test6')
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r6)
    })

})
