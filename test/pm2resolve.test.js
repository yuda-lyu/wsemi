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
            pm.resolve('fReject:' + c)
        }, 1)
        return pm
    }
    let rReject = {
        state: 'error',
        msg: 'fReject:def'
    }

    it(`should then ${JSON.stringify(rResolve)} when call pm2resolve(fResolve)('abc')`, function() {
        pm2resolve(fResolve)('abc')
            .then(function(msg) {
                assert.strict.deepEqual(msg, rResolve)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

    it(`should then ${JSON.stringify(rReject)} when call pm2resolve(fReject)('def')`, function() {
        pm2resolve(fReject)('def')
            .then(function(msg) {
                assert.strict.deepEqual(msg, rReject)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
