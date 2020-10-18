import assert from 'assert'
import debounce from '../src/debounce.mjs'


describe(`debounce`, function() {

    it(`should call core one time after 360ms. when call core by debounce in three times`, function() {
        let i = 0
        let j = 0
        function core(i) {
            j++
            console.log('j', j, 'i', i)
            assert.strict.deepStrictEqual(i, 3)
        }
        function fn() {
            i++
            console.log('i', i)
            debounce('key for test', () => {
                core(i)
            }, 300)
        }
        setTimeout(function() {
            fn()
        }, 120)
        setTimeout(function() {
            fn()
        }, 240)
        setTimeout(function() {
            fn()
        }, 360)
    })

})
