import _ from 'lodash-es'
import pmConvertResolve from './src/pmConvertResolve.mjs'


async function topAsync() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        console.log('resolve fun1: ' + c)
                        ms.push('resolve fun1: ' + c)
                        resolve('fun1: ' + c)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc')
                .then((msg) => {
                    console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    console.log('test1')
    let r1 = await test1()
    console.log(JSON.stringify(r1))
    // test1
    // resolve fun1: abc
    // t1 then:  { state: 'success', msg: 'fun1: abc' }
    // ["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        console.log('reject fun1: ' + c)
                        ms.push('reject fun1: ' + c)
                        reject('fun1: ' + c)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc')
                .then((msg) => {
                    console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    console.log('test2')
    let r2 = await test2()
    console.log(JSON.stringify(r2))
    // test2
    // reject fun1: abc
    // { state: 'error', msg: 'fun1: abc' }
    // ["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(p1, p2) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        console.log('resolve fun1: ' + p1 + ', ' + p2)
                        ms.push('resolve fun1: ' + p1 + ', ' + p2)
                        resolve('fun1: ' + p1 + ', ' + p2)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc', 'def')
                .then((msg) => {
                    console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    console.log('test3')
    let r3 = await test3()
    console.log(JSON.stringify(r3))
    // test3
    // resolve fun1: abc, def
    // t1 then:  { state: 'success', msg: 'fun1: abc, def' }
    // ["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []

            async function fun1(p1, p2) {
                return 'fun1: ' + p1 + ', ' + p2
            }

            pmConvertResolve(fun1)('abc', 'def')
                .then((msg) => {
                    console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    console.log('test4')
    let r4 = await test4()
    console.log(JSON.stringify(r4))
    // test4
    // t1 then:  { state: 'success', msg: 'fun1: abc, def' }
    // [{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]

}
topAsync().catch(() => {})


//node --experimental-modules g.mjs
