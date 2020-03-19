import assert from 'assert'
import cache from '../src/cache.mjs'


describe(`cache`, function() {

    setTimeout(() => {

        let oc = cache()

        // oc.on('message', (msg) => {
        //     //console.log('message', msg)
        // })
        // oc.on('error', (msg) => {
        //     //console.log('error', msg)
        // })

        let ms = []
        let n = 0
        async function fun(v1, v2) {
            //console.log('call fun')
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    n += 1
                    resolve(v1 + '|' + v2 + ', count=' + n)
                }, 300)
            })
        }

        oc.set('fun', { execFun: fun, inputFun: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
        setTimeout(() => {
            //第1次呼叫, 此時沒有快取只能執行取值
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 1st', msg)
                //console.log('fun 1st', msg)
                })
        }, 1)
        setTimeout(() => {
            //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1050ms, 此時第1次快取尚未過期(1200ms), 故1050ms取值時會拿到第1次快取(count=1)
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 2nd', msg)
                    //console.log('fun 2nd', msg)
                })
        }, 50)
        setTimeout(() => {
            //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是1250ms, 此時第1次快取已過期(1200ms), 故1250ms取值時會重新執行取值(count=2)
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 3rd', msg)
                    //console.log('fun 3rd', msg)
                })
        }, 250)
        setTimeout(() => {
            //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 4th', msg)
                    //console.log('fun 4th', msg)
                })
        }, 500)
        setTimeout(() => {
            //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 但第3次已重新執行取值(1250~1550ms執行, 2450ms過期), 故get會偵測並等待, 偵測週期為1000ms, 下次偵測是2300ms, 且此時第3次所得快取(count=2)尚未過期(2450ms), 此時就會拿到第3次所得快取(count=2)
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 5th', msg)
                    //console.log('fun 5th', msg)
                })
        }, 1300)
        setTimeout(() => {
            //第6次呼叫(1600ms), 此時第3次所得快取(count=2)還在有效期(1550ms執行結束, 2450ms過期), 故get會拿到第3次所得快取(count=2)
            oc.get('fun')
                .then((msg) => {
                    ms.push('fun 6th', msg)
                    //console.log('fun 6th', msg)
                })
        }, 1600)
        setTimeout(function() {
            //console.log(JSON.stringify(ms))
            assert.strict.deepEqual(JSON.stringify(ms), '["fun 1st","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]')
        }, 2400)

    }, 3000) //3s之後才啟動, 與主要test時間錯開, 避免大量函數執行影響timer偵測時間點

})
