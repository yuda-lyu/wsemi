import pmQueue from './src/pmQueue.mjs'


async function fun1(v) {
    console.log('call fun1')
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('#' + v)
        }, 300)
    })
}

async function fun2(v) {
    console.log('call fun2')
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            reject('#' + v)
        }, 200)
    })
}

async function fun3(v) {
    console.log('call fun3')
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('#' + v)
        }, 100)
    })
}

async function testFun1() {
    return new Promise((resolve, reject) => {
        let ms = []
        let q = pmQueue(1) //同時處理1個
        q.run(fun1, 'inp1')
            .then(function(msg) {
                ms.push('fun1 then ' + msg)
                console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun1 catch ' + msg)
                console.log('fun1 catch', msg)
            })
        q.run(fun2, 'inp2')
            .then(function(msg) {
                ms.push('fun2 then ' + msg)
                console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun2 catch ' + msg)
                console.log('fun2 catch', msg)
            })
        q.run(fun3, 'inp3')
            .then(function(msg) {
                ms.push('fun3 then ' + msg)
                console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun3 catch ' + msg)
                console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            resolve(ms)
        }, 650)
    })
}

async function testFun2() {
    return new Promise((resolve, reject) => {
        let ms = []
        let q = pmQueue(2) //同時處理2個
        q.run(fun1, 'inp1')
            .then(function(msg) {
                ms.push('fun1 then ' + msg)
                console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun1 catch ' + msg)
                console.log('fun1 catch', msg)
            })
        q.run(fun2, 'inp2')
            .then(function(msg) {
                ms.push('fun2 then ' + msg)
                console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun2 catch ' + msg)
                console.log('fun2 catch', msg)
            })
        q.run(fun3, 'inp3')
            .then(function(msg) {
                ms.push('fun3 then ' + msg)
                console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms.push('fun3 catch ' + msg)
                console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            resolve(ms)
        }, 450)
    })
}

async function testFun3() {
    return new Promise((resolve, reject) => {
        let ms = []
        let q = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果

        let fpm = function (name, t) {
            return new Promise(function(resolve, reject) {
                setTimeout(() => {
                    resolve('resolve: ' + name)
                }, t)
            })
        }

        //用run直接推函數入佇列並直接執行
        q.run(fpm, 'pm1', 150)
            .then(function(msg) {
                console.log('pm1 then', msg)
                ms.push('pm1 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm1 catch', msg)
                ms.push('pm1 catch: ' + 'reason ' + msg.reason)
            })
        q.run(fpm, 'pm2', 100)
            .then(function(msg) {
                console.log('pm2 then', msg)
                ms.push('pm2 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm2 catch', msg)
                ms.push('pm2 catch: ' + 'reason ' + msg.reason)
            })
        q.run(fpm, 'pm3', 50)
            .then(function(msg) {
                console.log('pm3 then', msg)
                ms.push('pm3 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm3 catch', msg)
                ms.push('pm3 catch: ' + 'reason ' + msg.reason)
            })

        setTimeout(() => {
            q.run(fpm, 'pm4', 50)
                .then((msg) => {
                    console.log('pm4 then', msg)
                    ms.push('pm4 then: ' + msg)
                })
                .catch((msg) => {
                    console.log('pm4 catch', msg)
                    ms.push('pm4 catch: ' + 'reason ' + msg.reason)
                })
                .finally(() => {
                    resolve(ms)
                })
        }, 200)

    })
}

async function testFun4() {
    return new Promise((resolve, reject) => {
        let ms = []
        let q = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果

        let fpm = function (name, t) {
            return new Promise(function(resolve, reject) {
                setTimeout(() => {
                    resolve('resolve: ' + name)
                }, t)
            })
        }

        //用equip事先轉換函數, 之後再依需求執行
        let fpm1 = q.equip(fpm)
        let fpm2 = q.equip(fpm)
        let fpm3 = q.equip(fpm)
        let fpm4 = q.equip(fpm)

        fpm1('pm1', 150)
            .then(function(msg) {
                console.log('pm1 then', msg)
                ms.push('pm1 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm1 catch', msg)
                ms.push('pm1 catch: ' + 'reason ' + msg.reason)
            })
        fpm2('pm2', 100)
            .then(function(msg) {
                console.log('pm2 then', msg)
                ms.push('pm2 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm2 catch', msg)
                ms.push('pm2 catch: ' + 'reason ' + msg.reason)
            })
        fpm3('pm3', 50)
            .then(function(msg) {
                console.log('pm3 then', msg)
                ms.push('pm3 then: ' + msg)
            })
            .catch(function(msg) {
                console.log('pm3 catch', msg)
                ms.push('pm3 catch: ' + 'reason ' + msg.reason)
            })

        setTimeout(() => {
            fpm4('pm4', 50)
                .then((msg) => {
                    console.log('pm4 then', msg)
                    ms.push('pm4 then: ' + msg)
                })
                .catch((msg) => {
                    console.log('pm4 catch', msg)
                    ms.push('pm4 catch: ' + 'reason ' + msg.reason)
                })
                .finally(() => {
                    resolve(ms)
                })
        }, 200)

    })
}

setTimeout(function() {
    console.log('testFun1')
    testFun1()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 1)
// testFun1
// call fun1
// fun1 then #inp1
// call fun2
// fun2 catch #inp2
// call fun3
// fun3 then #inp3
// ["fun1 then #inp1","fun2 catch #inp2","fun3 then #inp3"]

setTimeout(function() {
    console.log('testFun2')
    testFun2()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 700)
// testFun2
// call fun1
// call fun2
// fun2 catch #inp2
// call fun3
// fun1 then #inp1
// fun3 then #inp3
// ["fun2 catch #inp2","fun1 then #inp1","fun3 then #inp3"]

setTimeout(function() {
    console.log('testFun3')
    testFun3()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 1400)
// testFun3
// pm3 then resolve: pm3
// pm2 catch { reason: 'cancelled' }
// pm1 catch { reason: 'cancelled' }
// pm4 then resolve: pm4
// ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]

setTimeout(function() {
    console.log('testFun4')
    testFun4()
        .then((ms) => {
            console.log(JSON.stringify(ms))
        })
}, 2100)
// testFun4
// pm3 then resolve: pm3
// pm2 catch { reason: 'cancelled' }
// pm1 catch { reason: 'cancelled' }
// pm4 then resolve: pm4
// ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]
