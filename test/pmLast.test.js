import assert from 'assert'
import pmLast from '../src/pmLast.mjs'


describe(`pmLast`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {

            let ms = []

            let fun = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        resolve('[fun]resolve: ' + name)
                    }, t)
                })
            }

            //用pml轉換非同步函數
            let pml = pmLast()
            let funp = pml(fun) //掛載單函數, 執行才推入佇列

            funp('t1', 150)
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            funp('t2', 100)
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            funp('t3', 50)
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                funp('t4', 50)
                    .then((msg) => {
                        //console.log('t4 then', msg)
                        ms.push('t4 then: ' + msg)
                    })
                    .catch((msg) => {
                        //console.log('t4 catch', msg)
                        ms.push('t4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(ms)
                    })
            }, 200)

        })
    }

    async function test2() {
        return new Promise((resolve, reject) => {

            let ms = []

            let fun1 = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        resolve('[fun1]resolve: ' + name)
                    }, t)
                })
            }

            let fun2 = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        resolve('[fun2]resolve: ' + name)
                    }, t)
                })
            }

            //用pml轉換非同步函數
            let pml = pmLast()
            let funp1 = pml(fun1) //掛載不同函數, 執行才推入佇列
            let funp2 = pml(fun2) //掛載不同函數, 執行才推入佇列

            funp1('t1', 150)
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            funp2('t2', 100)
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            funp2('t3', 50)
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                funp1('t4', 50)
                    .then((msg) => {
                        //console.log('t4 then', msg)
                        ms.push('t4 then: ' + msg)
                    })
                    .catch((msg) => {
                        //console.log('t4 catch', msg)
                        ms.push('t4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(ms)
                    })
            }, 200)

        })
    }

    setTimeout(() => {
        //console.log('test1')
        test1()
            .then((ms) => {
                //console.log(JSON.stringify(ms))
                assert.strict.deepEqual(JSON.stringify(ms), '["t3 then: [fun]resolve: t3","t2 catch: reason cancelled","t1 catch: reason cancelled","t4 then: [fun]resolve: t4"]')
            })
    }, 1)

    setTimeout(() => {
        //console.log('test2')
        test2()
            .then((ms) => {
                //console.log(JSON.stringify(ms))
                assert.strict.deepEqual(JSON.stringify(ms), '["t3 then: [fun2]resolve: t3","t2 catch: reason cancelled","t1 catch: reason cancelled","t4 then: [fun1]resolve: t4"]')
            })
    }, 300)

})
