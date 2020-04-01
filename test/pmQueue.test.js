import assert from 'assert'
import pmQueue from '../src/pmQueue.mjs'


describe(`pmQueue`, function() {

    async function fun1(v) {
        //console.log('call fun1')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('#' + v)
            }, 300)
        })
    }

    async function fun2(v) {
        //console.log('call fun2')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject('#' + v)
            }, 200)
        })
    }

    async function fun3(v) {
        //console.log('call fun3')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('#' + v)
            }, 100)
        })
    }

    async function fun4() {
        return new Promise((resolve, reject) => {

            let ms = []

            let fpm = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        resolve('resolve: ' + name)
                    }, t)
                })
            }
            let q3 = pmQueue(null, true)

            q3.run(fpm, 'pm1', 150)
                .then(function(msg) {
                    //console.log('pm1 then', msg)
                    ms.push('pm1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm1 catch', msg)
                    ms.push('pm1 catch: ' + 'reason ' + msg.reason)
                })
            q3.run(fpm, 'pm2', 100)
                .then(function(msg) {
                    //console.log('pm2 then', msg)
                    ms.push('pm2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm2 catch', msg)
                    ms.push('pm2 catch: ' + 'reason ' + msg.reason)
                })
            q3.run(fpm, 'pm3', 50)
                .then(function(msg) {
                    //console.log('pm3 then', msg)
                    ms.push('pm3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm3 catch', msg)
                    ms.push('pm3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                q3.run(fpm, 'pm4', 50)
                    .then((msg) => {
                        //console.log('pm4 then', msg)
                        ms.push('pm4 then: ' + msg)
                    })
                    .catch((msg) => {
                        //console.log('pm4 catch', msg)
                        ms.push('pm4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(JSON.stringify(ms))
                    })
            }, 200)

        })
    }

    setTimeout(function() {
        //console.log('test q1')
        let ms1 = []
        let q1 = pmQueue(1)
        q1.run(fun1, 'inp1')
            .then(function(msg) {
                ms1.push('fun1 then ' + msg)
                //console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun1 catch ' + msg)
                //console.log('fun1 catch', msg)
            })
        q1.run(fun2, 'inp2')
            .then(function(msg) {
                ms1.push('fun2 then ' + msg)
                //console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun2 catch ' + msg)
                //console.log('fun2 catch', msg)
            })
        q1.run(fun3, 'inp3')
            .then(function(msg) {
                ms1.push('fun3 then ' + msg)
                //console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun3 catch ' + msg)
                //console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            //console.log(JSON.stringify(ms1))
            assert.strict.deepEqual(JSON.stringify(ms1), '["fun1 then #inp1","fun2 catch #inp2","fun3 then #inp3"]')
        }, 650)
    }, 1)

    setTimeout(function() {
        //console.log('test q2')
        let ms2 = []
        let q2 = pmQueue(2)
        q2.run(fun1, 'inp1')
            .then(function(msg) {
                ms2.push('fun1 then ' + msg)
                //console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun1 catch ' + msg)
                //console.log('fun1 catch', msg)
            })
        q2.run(fun2, 'inp2')
            .then(function(msg) {
                ms2.push('fun2 then ' + msg)
                //console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun2 catch ' + msg)
                //console.log('fun2 catch', msg)
            })
        q2.run(fun3, 'inp3')
            .then(function(msg) {
                ms2.push('fun3 then ' + msg)
                //console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun3 catch ' + msg)
                //console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            //console.log(JSON.stringify(ms2))
            assert.strict.deepEqual(JSON.stringify(ms2), '["fun2 catch #inp2","fun1 then #inp1","fun3 then #inp3"]')
        }, 450)
    }, 700)

    setTimeout(function() {
        //console.log('test q3')
        fun4()
            .then((ms3) => {
                //console.log(JSON.stringify(ms))
                assert.strict.deepEqual(JSON.stringify(ms3), '["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]')
            })
    }, 1400)

})
