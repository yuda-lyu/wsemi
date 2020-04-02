import assert from 'assert'
import pm2resolve from '../src/pm2resolve.mjs'


describe(`pm2resolve`, function() {

    function fun1(c) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                resolve('fun1:' + c)
            }, 1)
        })
    }
    let fun1r = {
        state: 'success',
        msg: 'fun1:abc'
    }

    function fun2(c) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                reject('fun2:' + c)
            }, 1)
        })
    }
    let fun2r = {
        state: 'error',
        msg: 'fun2:def'
    }

    function fun3(c) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                reject({ reason: 'cancelled' })
            }, 1)
        })
    }
    let fun3r = {
        state: 'cancelled',
        msg: ''
    }

    it(`should then ${JSON.stringify(fun1r)} when call pm2resolve(fun1)('abc')`, async function() {
        let msg = await pm2resolve(fun1)('abc')
        assert.strict.deepEqual(msg, fun1r)
    })

    it(`should then ${JSON.stringify(fun2r)} when call pm2resolve(fun2)('def')`, async function() {
        let msg = await pm2resolve(fun2)('def')
        assert.strict.deepEqual(msg, fun2r)
    })

    it(`should then ${JSON.stringify(fun3r)} when call pm2resolve(fun3)('ghi')`, async function() {
        let msg = await pm2resolve(fun3)('ghi')
        assert.strict.deepEqual(msg, fun3r)
    })

})
