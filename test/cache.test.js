import assert from 'assert'
import cache from '../src/cache.mjs'


describe(`cache`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            // oc.on('message', function(msg) {
            //     //console.log('message', msg)
            // })
            // oc.on('error', function(msg) {
            //     //console.log('error', msg)
            // })

            let i = 0
            let j = 0
            function fun(v1, v2) {
                i++
                //console.log('call fun, count=' + i)
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        j++
                        ms.push(v1 + '|' + v2 + ', count=' + j)
                        resolve(v1 + '|' + v2 + ', count=' + j)
                    }, 300)
                })
            }

            oc.set('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
            setTimeout(function() {
                //第1次呼叫, 此時沒有快取只能執行取值
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1050ms, 此時第1次快取尚未過期(1200ms), 故1050ms取值時會拿到第1次快取(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
            }, 50)
            setTimeout(function() {
                //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1250ms, 此時第1次快取已過期(1200ms), 故1250ms取值時會重新執行取值(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
            }, 250)
            setTimeout(function() {
                //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
            }, 500)
            setTimeout(function() {
                //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 但第3次已重新執行取值(1250~1550ms執行, 2450ms過期), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是2300ms, 且此時第3次所得快取(count=2)尚未過期(2450ms), 此時就會拿到第3次所得快取(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 5th', msg)
                        ms.push('fun 5th', msg)
                    })
            }, 1300)
            setTimeout(function() {
                //第6次呼叫(1600ms), 此時第3次所得快取(count=2)還在有效期(1550ms執行結束, 2450ms過期), 故get會拿到第3次所得快取(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        //console.log('fun 6th', msg)
                        ms.push('fun 6th', msg)
                    })
            }, 1600)

            setTimeout(function() {
                resolve(ms)
            }, 2400)

        })
    }
    //console.log('test1')
    // test1
    // call fun, count=1
    // fun 1st inp1|inp2, count=1
    // fun 4th inp1|inp2, count=1
    // fun 2nd inp1|inp2, count=1
    // call fun, count=2
    // fun 3rd inp1|inp2, count=2
    // fun 6th inp1|inp2, count=2
    // fun 5th inp1|inp2, count=2
    // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 3rd","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]
    let r1 = '["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 3rd","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            // oc.on('message', function(msg) {
            //     //console.log('message', msg)
            // })
            // oc.on('error', function(msg) {
            //     //console.log('error', msg)
            // })

            let i = 0
            let j = 0
            function fun(v1, v2) {
                i++
                //console.log('call fun, count=' + i)
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        j++
                        ms.push(v1 + '|' + v2 + ', count=' + j)
                        resolve(v1 + '|' + v2 + ', count=' + j)
                    }, 300)
                })
            }

            oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
            setTimeout(function() {
                //第1次呼叫, 此時沒有快取只能執行取值, 會取得第1次結果(count=1)
                oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        //console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫, 此時執行中會等待, 偵測週期為1ms, 下次偵測為1100ms, 此時會取得第1次結果(count=1)
                oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        //console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
            }, 100)
            setTimeout(function() {
                //第3次呼叫, 此時已有快取, 會取得第1次結果(count=1)
                oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        //console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
            }, 500)
            setTimeout(function() {
                //第4次呼叫, 此時第1次快取(count=1)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
                oc.getProxy('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        //console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
            }, 1300)

            setTimeout(function() {
                resolve(ms)
            }, 1700)

        })
    }
    //console.log('test2')
    // test2
    // call fun, count=1
    // fun 3rd inp1|inp2, count=1
    // fun 1st inp1|inp2, count=1
    // fun 2nd inp1|inp2, count=1
    // call fun, count=2
    // fun 4th inp1|inp2, count=2
    // ["call fun, count=1","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]
    let r2 = '["call fun, count=1","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
