import assert from 'assert'
import pmQueue from '../src/pmQueue.mjs'


describe(`pmQueue`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(1) //同時處理1個

            function fun1(v) {
                //console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                //console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                //console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    //console.log('test1')
    // test1
    // call fun1
    // t1 then #inp1
    // call fun2
    // t2 then #inp2
    // call fun3
    // t3 then #inp3
    // ["call fun1","fun1 resolve: inp1","t1 then: #inp1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun3 resolve: inp3","t3 then: #inp3"]
    let r1 = '["call fun1","fun1 resolve: inp1","t1 then: #inp1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun3 resolve: inp3","t3 then: #inp3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        ////console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(2) //同時處理2個

            function fun1(v) {
                //console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                //console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                //console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    //console.log('test2')
    // test2
    // call fun1
    // call fun2
    // t2 then #inp2
    // call fun3
    // t1 then #inp1
    // t3 then #inp3
    // ["call fun1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun1 resolve: inp1","t1 then: #inp1","fun3 resolve: inp3","t3 then: #inp3"]
    let r2 = '["call fun1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun1 resolve: inp1","t1 then: #inp1","fun3 resolve: inp3","t3 then: #inp3"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        ////console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(null) //同時處理全部

            function fun1(v) {
                //console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                //console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                //console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    //console.log('test3')
    // test3
    // call fun1
    // call fun2
    // call fun3
    // t3 then #inp3
    // t2 then #inp2
    // t1 then #inp1
    // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 then: #inp2","fun1 resolve: inp1","t1 then: #inp1"]
    let r3 = '["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 then: #inp2","fun1 resolve: inp1","t1 then: #inp1"]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        ////console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果

            function fun1(v) {
                //console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                //console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                //console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    //console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    //console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    //console.log('test4')
    // test4
    // call fun1
    // call fun2
    // call fun3
    // t3 then #inp3
    // t2 catch { reason: 'cancelled' }
    // t1 catch { reason: 'cancelled' }
    // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 catch: reason cancelled","fun1 resolve: inp1","t1 catch: reason cancelled"]
    let r4 = '["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 catch: reason cancelled","fun1 resolve: inp1","t1 catch: reason cancelled"]'
    it(`should return '${r4}' when run test4'`, async function() {
        let ms = await test4()
        ////console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

})
