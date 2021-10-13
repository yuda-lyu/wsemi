import assert from 'assert'
import getEnv from '../src/getEnv.mjs'


describe(`getEnv`, function() {

    it(`should return { isBrowser: false, isWebWorker: false, isNode: true } in nodejs when no input`, function() {
        let r = getEnv()
        assert.strict.deepStrictEqual(r, { isBrowser: false, isWebWorker: false, isNode: true })
    })

})
