import assert from 'assert'
import pmHookReject from '../src/pmHookReject.mjs'


describe(`pmHookReject`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject: v1=${v1}, v2=${v2}`)
                    reject(`reject: v1=${v1}, v2=${v2}`)
                })
            }

            let pmr = pmHookReject(pm, (msg) => {
                //console.log('cb: ' + msg)
                msg = '[modify catch]' + msg
                ms.push('cb: ' + msg)
                return msg
            })

            pmr('t1', 12.3)
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    //console.log('test1')
    // test1
    // cb: reject: v1=t1, v2=12.3
    // t1 catch [modify catch]reject: v1=t1, v2=12.3
    // ["reject: v1=t1, v2=12.3","cb: [modify catch]reject: v1=t1, v2=12.3","t1 catch: [modify catch]reject: v1=t1, v2=12.3"]
    let r1 = '["reject: v1=t1, v2=12.3","cb: [modify catch]reject: v1=t1, v2=12.3","t1 catch: [modify catch]reject: v1=t1, v2=12.3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm = function () {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject`)
                    reject(`reject`)
                })
            }

            let pmr = pmHookReject(pm, (msg) => {
                //console.log('cb: ' + msg)
                msg = '[modify catch]' + msg
                ms.push('cb: ' + msg)
                return msg
            })

            pmr() //測試無輸入
                .then(function(msg) {
                    //console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    //console.log('test2')
    // test2
    // cb: reject
    // t1 catch [modify catch]reject
    // ["reject","cb: [modify catch]reject","t1 catch: [modify catch]reject"]
    let r2 = '["reject","cb: [modify catch]reject","t1 catch: [modify catch]reject"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
