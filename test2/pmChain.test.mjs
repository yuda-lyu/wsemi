import assert from 'assert'
import pmChain from '../src/pmChain.mjs'


describe(`pmChain`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm1 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm1' + v)
                        ms.push('resolve pm1' + v)
                        resolve('pm1' + v)
                    }, 100)
                })
            }
            let pm2 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm2' + v)
                        ms.push('resolve pm2' + v)
                        resolve('pm2' + v)
                    }, 150)
                })
            }
            let pm3 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm3' + v)
                        ms.push('resolve pm3' + v)
                        resolve('pm3' + v)
                    }, 50)
                })
            }

            pmChain([pm1, pm2, pm3], '*')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test1')
    // test1
    // resolve pm1*
    // resolve pm2pm1*
    // resolve pm3pm2pm1*
    // t1 then:  pm3pm2pm1*
    // ["resolve pm1*","resolve pm2pm1*","resolve pm3pm2pm1*","t1 then: pm3pm2pm1*"]
    let r1 = '["resolve pm1*","resolve pm2pm1*","resolve pm3pm2pm1*","t1 then: pm3pm2pm1*"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm1 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm1' + v)
                        ms.push('resolve pm1' + v)
                        resolve('pm1' + v)
                    }, 100)
                })
            }
            //pm2為reject
            let pm2 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('reject pm2' + v)
                        ms.push('reject pm2' + v)
                        reject('pm2' + v)
                    }, 150)
                })
            }
            let pm3 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm3' + v)
                        ms.push('resolve pm3' + v)
                        resolve('pm3' + v)
                    }, 50)
                })
            }

            pmChain([pm1, pm2, pm3], '*')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test2')
    // test2
    // resolve pm1*
    // reject pm2pm1*
    // t1 catch:  pm2pm1*
    // ["resolve pm1*","reject pm2pm1*","t1 catch: pm2pm1*"]
    let r2 = '["resolve pm1*","reject pm2pm1*","t1 catch: pm2pm1*"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
