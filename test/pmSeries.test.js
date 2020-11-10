import assert from 'assert'
import pmSeries from '../src/pmSeries.mjs'


describe(`pmSeries`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            //通過function調用產生promise, 各promise循序調用
            pmSeries([1, 2, 3, 4, 5], function (v, k) {
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
    //console.log('test1')
    // test1
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
    let r1 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            //通過function調用產生promise, 各promise循序調用, 於3會觸發reject而跳出pmSeries
            pmSeries([1, 2, 3, 4, 5], function (v, k) {
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
            })
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
    // reject 3 d 260
    // catch "#3"
    // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]
    let r2 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]'
    it(`should return '${r1}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            //先產生promise, 因事先初始化故各promise會依照各自執行時間結束
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
            pmSeries(rs, null)
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
    it(`should return '${r3}' when run test1'`, async function() {
        let ms = await test3()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

})
