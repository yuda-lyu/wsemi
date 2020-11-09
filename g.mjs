import PmThrottle from './src/pmThrottle.mjs'

async function test1() {
    return new Promise((resolve, reject) => {

        let ms = []
        let pmt = new PmThrottle()

        let fun = function (name, t) {
            return new Promise(function(resolve, reject) {
                setTimeout(() => {
                    console.log('core: ' + '[fun]resolve: ' + name)
                    resolve('[fun]resolve: ' + name)
                }, t)
            })
        }

        pmt(fun, 't1', 150)
            .then(function(msg) {
                console.log('t1 then', msg)
                ms.push('t1 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t1 catch', msg)
                ms.push('t1 catch: ' + 'reason ' + msg.reason)
            })
        pmt(fun, 't2', 100)
            .then(function(msg) {
                console.log('t2 then', msg)
                ms.push('t2 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t2 catch', msg)
                ms.push('t2 catch: ' + 'reason ' + msg.reason)
            })
        pmt(fun, 't3', 50)
            .then(function(msg) {
                console.log('t3 then', msg)
                ms.push('t3 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t3 catch', msg)
                ms.push('t3 catch: ' + 'reason ' + msg.reason)
            })

        setTimeout(() => {
            pmt(fun, 't4', 50)
                .then((msg) => {
                    console.log('t4 then', msg)
                    ms.push('t4 then: ' + msg)
                })
                .catch((msg) => {
                    console.log('t4 catch', msg)
                    ms.push('t4 catch: ' + 'reason ' + msg.reason)
                })
                .finally(() => {
                    resolve(ms)
                })
        }, 200)

    })
}
setTimeout(() => {
    console.log('test1')
    test1()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 1)
// test1
// t1 catch { reason: 'cancelled' }
// t2 catch { reason: 'cancelled' }
// core: [fun]resolve: t3
// t3 then [fun]resolve: t3
// core: [fun]resolve: t4
// t4 then [fun]resolve: t4
// ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: [fun]resolve: t3","t4 then: [fun]resolve: t4"]

async function test2() {
    return new Promise((resolve, reject) => {

        let ms = []
        let pmt = new PmThrottle()

        let fun1 = function (name, t) {
            return new Promise(function(resolve, reject) {
                setTimeout(() => {
                    console.log('core: ' + '[fun1]resolve: ' + name)
                    resolve('[fun1]resolve: ' + name)
                }, t)
            })
        }

        let fun2 = function (name, t) {
            return new Promise(function(resolve, reject) {
                setTimeout(() => {
                    console.log('core: ' + '[fun2]resolve: ' + name)
                    resolve('[fun2]resolve: ' + name)
                }, t)
            })
        }

        pmt(fun1, 't1', 150)
            .then(function(msg) {
                console.log('t1 then', msg)
                ms.push('t1 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t1 catch', msg)
                ms.push('t1 catch: ' + 'reason ' + msg.reason)
            })
        pmt(fun2, 't2', 100)
            .then(function(msg) {
                console.log('t2 then', msg)
                ms.push('t2 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t2 catch', msg)
                ms.push('t2 catch: ' + 'reason ' + msg.reason)
            })
        pmt(fun2, 't3', 50)
            .then(function(msg) {
                console.log('t3 then', msg)
                ms.push('t3 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('t3 catch', msg)
                ms.push('t3 catch: ' + 'reason ' + msg.reason)
            })

        setTimeout(() => {
            pmt(fun1, 't4', 50)
                .then((msg) => {
                    console.log('t4 then', msg)
                    ms.push('t4 then: ' + msg)
                })
                .catch((msg) => {
                    console.log('t4 catch', msg)
                    ms.push('t4 catch: ' + 'reason ' + msg.reason)
                })
                .finally(() => {
                    resolve(ms)
                })
        }, 200)

    })
}
setTimeout(() => {
    console.log('test2')
    test2()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 300)
// test2
// t1 catch { reason: 'cancelled' }
// t2 catch { reason: 'cancelled' }
// core: [fun2]resolve: t3
// t3 then [fun2]resolve: t3
// core: [fun1]resolve: t4
// t4 then [fun1]resolve: t4
// ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: [fun2]resolve: t3","t4 then: [fun1]resolve: t4"]
