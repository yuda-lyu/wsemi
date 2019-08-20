import assert from 'assert'
import getGlobal from '../src/getGlobal.mjs'


describe(`getGlobal`, function() {

    it(`should return [object global] in nodejs when no input`, function() {
        let r = getGlobal()
        r = Object.prototype.toString.call(r)
        assert.strict.deepEqual(r, '[object global]')
    })

})
