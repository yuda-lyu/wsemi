import assert from 'assert'
import cache from '../src/cache.mjs'


describe(`cache`, function() {

    function test1() {
        //console.log('test set and get')

        let oc = cache()

        // oc.on('message', function(msg) {
        //     //console.log('message', msg)
        // })
        // oc.on('error', function(msg) {
        //     //console.log('error', msg)
        // })

        let ms1 = []
        let n1 = 0
        function fun1(v1, v2) {
            //console.log('call fun1')
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    n1 += 1
                    resolve(v1 + '|' + v2 + ', count=' + n1)
                }, 300)
            })
        }

        oc.set('fun1', { execFun: fun1, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
        setTimeout(function() {
        //第1次呼叫, 此時沒有快取只能執行取值
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 1st', msg)
                    //console.log('fun1 1st', msg)
                })
        }, 1)
        setTimeout(function() {
        //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1050ms, 此時第1次快取尚未過期(1200ms), 故1050ms取值時會拿到第1次快取(count=1)
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 2nd', msg)
                    //console.log('fun1 2nd', msg)
                })
        }, 50)
        setTimeout(function() {
        //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1250ms, 此時第1次快取已過期(1200ms), 故1250ms取值時會重新執行取值(count=2)
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 3rd', msg)
                    //console.log('fun1 3rd', msg)
                })
        }, 250)
        setTimeout(function() {
        //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 4th', msg)
                    //console.log('fun1 4th', msg)
                })
        }, 500)
        setTimeout(function() {
        //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 但第3次已重新執行取值(1250~1550ms執行, 2450ms過期), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是2300ms, 且此時第3次所得快取(count=2)尚未過期(2450ms), 此時就會拿到第3次所得快取(count=2)
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 5th', msg)
                    //console.log('fun1 5th', msg)
                })
        }, 1300)
        setTimeout(function() {
        //第6次呼叫(1600ms), 此時第3次所得快取(count=2)還在有效期(1550ms執行結束, 2450ms過期), 故get會拿到第3次所得快取(count=2)
            oc.get('fun1')
                .then(function(msg) {
                    ms1.push('fun1 6th', msg)
                    //console.log('fun1 6th', msg)
                })
        }, 1600)

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(ms1)
            }, 2400)
        })
    }

    function test2() {
        //console.log('test getProxy')

        let oc = cache()

        // oc.on('message', function(msg) {
        //     //console.log('message', msg)
        // })
        // oc.on('error', function(msg) {
        //     //console.log('error', msg)
        // })

        let ms2 = []
        let n2 = 0
        function fun2(v1, v2) {
            //console.log('call fun2')
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    n2 += 1
                    resolve(v1 + '|' + v2 + ', count=' + n2)
                }, 300)
            })
        }

        oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
        setTimeout(function() {
            //第1次呼叫, 此時沒有快取只能執行取值, 會取得第1次結果(count=1)
            oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                .then(function(msg) {
                    ms2.push('fun2 1st', msg)
                    //console.log('fun2 1st', msg)
                })
        }, 1)
        setTimeout(function() {
            //第2次呼叫, 此時執行中會等待, 偵測週期為1ms, 下次偵測為1100ms, 此時會取得第1次結果(count=1)
            oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                .then(function(msg) {
                    ms2.push('fun2 2nd', msg)
                    //console.log('fun2 2nd', msg)
                })
        }, 100)
        setTimeout(function() {
            //第3次呼叫, 此時已有快取, 會取得第1次結果(count=1)
            oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                .then(function(msg) {
                    ms2.push('fun2 3rd', msg)
                    //console.log('fun2 3rd', msg)
                })
        }, 500)
        setTimeout(function() {
            //第4次呼叫, 此時第1次快取(count=1)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
            oc.getProxy('fun2', { execFun: fun2, inputFun: ['inp1', 'inp2'], timeExpired: 1200 })
                .then(function(msg) {
                    ms2.push('fun2 4th', msg)
                    //console.log('fun2 4th', msg)
                })
        }, 1300)

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(ms2)
            }, 1700)
        })
    }

    setTimeout(() => {

        setTimeout(function() {
            test1()
                .then(function(ms1) {
                    //console.log(JSON.stringify(ms1))
                    assert.strict.deepEqual(JSON.stringify(ms1), '["fun1 1st","inp1|inp2, count=1","fun1 4th","inp1|inp2, count=1","fun1 2nd","inp1|inp2, count=1","fun1 3rd","inp1|inp2, count=2","fun1 6th","inp1|inp2, count=2","fun1 5th","inp1|inp2, count=2"]')
                })
        }, 1)

        setTimeout(function() {
            test2()
                .then(function(ms2) {
                    //console.log(JSON.stringify(ms2))
                    assert.strict.deepEqual(JSON.stringify(ms2), '["fun2 3rd","inp1|inp2, count=1","fun2 1st","inp1|inp2, count=1","fun2 2nd","inp1|inp2, count=1","fun2 4th","inp1|inp2, count=2"]')
                })
        }, 2500)

    }, 3000) //3s之後才啟動, 與主要test時間錯開, 避免大量函數執行影響timer偵測時間點

})
