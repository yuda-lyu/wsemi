import assert from 'assert'
import log from '../src/log.mjs'


describe(`log`, function() {

    function test1() {
        let ms = []
        let lg = log()
        lg.init(function(v) {
            console.log(v)
            ms.push({
                src: v.src,
                mode: v.mode,
                msg: v.msg,
            })
        })
        lg.log('service:web', 'infor', 'abc')
        lg.log('service:web', 'error', 'def')
        lg.log('service:api', 'infor', 'xyz')
        // console.log(ms)
        return ms
    }

    let r1 = [
        { src: 'service:web', mode: 'infor', msg: '"abc"' },
        { src: 'service:web', mode: 'error', msg: '"def"' },
        { src: 'service:api', mode: 'infor', msg: '"xyz"' }
    ]
    it(`should return '${r1}' when run test1'`, function() {
        let rr = test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(rr, r1)
    })

})
