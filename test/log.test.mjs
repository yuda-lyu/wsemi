import assert from 'assert'
import log from '../from/log.mjs'


describe(`log`, function() {

    function test1() {
        let ms = []
        let lg = log()
        lg.init(function(v) {
            console.log(v)
            ms.push({
                from: v.from,
                level: v.level,
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
        { from: 'service:web', level: 'infor', msg: '"abc"' },
        { from: 'service:web', level: 'error', msg: '"def"' },
        { from: 'service:api', level: 'infor', msg: '"xyz"' }
    ]
    it(`should return '${r1}' when run test1'`, function() {
        let rr = test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(rr, r1)
    })

})
