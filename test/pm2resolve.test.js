import assert from 'assert'
import genPm from '../src/genPm.mjs'
import pm2resolve from '../src/pm2resolve.mjs'


describe(`pm2resolve`, function() {

    function fResolve(c) {
        let pm = genPm()
        setTimeout(function() {
            pm.resolve('fResolve:' + c)
        }, 1)
        return pm
    }
    let rResolve = {
        state: 'success',
        msg: 'fResolve:abc'
    }

    function fReject(c) {
        let pm = genPm()
        setTimeout(function() {
            pm.reject('fReject:' + c)
        }, 1)
        return pm
    }
    let rReject = {
        state: 'error',
        msg: 'fReject:def'
    }

    it(`should then ${JSON.stringify(rResolve)} when call pm2resolve(fResolve)('abc')`, async function() {
        let msg = await pm2resolve(fResolve)('abc')
        assert.strict.deepEqual(msg, rResolve)
    })

    it(`should then ${JSON.stringify(rReject)} when call pm2resolve(fReject)('def')`, async function() {
        let msg = await pm2resolve(fReject)('def')
        assert.strict.deepEqual(msg, rReject)
    })

})
