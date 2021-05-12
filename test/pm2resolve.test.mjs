import assert from 'assert'
import pm2resolve from '../src/pm2resolve.mjs'


describe(`pm2resolve`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        //console.log('resolve fun1: ' + c)
                        ms.push('resolve fun1: ' + c)
                        resolve('fun1: ' + c)
                    }, 1)
                })
            }

            pm2resolve(fun1)('abc')
                .then((msg) => {
                    //console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    //console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    //console.log('test1')
    // test1
    // resolve fun1: abc
    // t1 then:  { state: 'success', msg: 'fun1: abc' }
    // ["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]
    let r1 = '["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        //console.log('reject fun1: ' + c)
                        ms.push('reject fun1: ' + c)
                        reject('fun1: ' + c)
                    }, 1)
                })
            }

            pm2resolve(fun1)('abc')
                .then((msg) => {
                    //console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    //console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    //console.log('test2')
    // test2
    // reject fun1: abc
    // { state: 'error', msg: 'fun1: abc' }
    // ["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]
    let r2 = '["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
