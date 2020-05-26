import assert from 'assert'
import getEnv from '../src/getEnv.mjs'


describe(`getEnv`, function() {

    it(`should return { isWindow: false, isWebWorker: false, isNode: true } in nodejs when no input`, function() {
        let r = getEnv()
        assert.strict.deepEqual(r, { isWindow: false, isWebWorker: false, isNode: true })
    })

})
