import assert from 'assert'
import genPm from '../src/genPm.mjs'


describe('genPm', function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let fn = function(name) {
                let pm = genPm()
                setTimeout(function() {
                    ms.push('resolve: ' + name)
                    pm.resolve('resolve: ' + name)
                }, 1)
                return pm
            }

            fn('abc')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    //console.log('test1')
    // test1
    // t1 then resolve: abc
    // ["resolve: abc","t1 then: resolve: abc"]
    let r1 = '["resolve: abc","t1 then: resolve: abc"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let fn = function(name) {
                let pm = genPm()
                setTimeout(function() {
                    ms.push('reject: ' + name)
                    pm.reject('reject: ' + name)
                }, 1)
                return pm
            }

            fn('abc')
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    //console.log('test2')
    // test2
    // t1 catch reject: abc
    // ["reject: abc","t1 catch: reject: abc"]
    let r2 = '["reject: abc","t1 catch: reject: abc"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
