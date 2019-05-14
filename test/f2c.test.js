import assert from 'assert'
import f2c from '../src/f2c.mjs'


describe('f2c', function() {
    let k
    let f = {}
    let fr = {}

    k = 1
    f[k] = function() {
        /*
            abc
        */
    }
    fr[k] = 'abc'
    it('should return ' + fr[k] + ' when input ' + f[k], function() {
        k = 1
        let r = f2c(f[k])
        assert.strict.deepEqual(r, fr[k])
    })

    it("should return '' when input '100abc'", function() {
        let r = f2c('100abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input ''", function() {
        let r = f2c('')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input []", function() {
        let r = f2c([])
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input {}", function() {
        let r = f2c({})
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input null", function() {
        let r = f2c(null)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input undefined", function() {
        let r = f2c(undefined)
        assert.strict.deepEqual(r, '')
    })

})
