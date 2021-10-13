import assert from 'assert'
import waitFun from '../src/waitFun.mjs'


describe(`waitFun`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let i = 0
            waitFun(function() {
                i++
                //console.log('waiting: ' + i)
                ms.push('waiting: ' + i)
                return i >= 2
            })
                .then(function() {
                    //console.log('t1 then')
                    ms.push('t1 then')
                })

            setTimeout(function() {
                resolve(ms)
            }, 1100)

        })
    }
    //console.log('test1')
    // test1
    // waiting: 1
    // waiting: 2
    // t1 then
    // ["waiting: 1","waiting: 2","t1 then"]
    let r1 = '["waiting: 1","waiting: 2","t1 then"]'
    it(`should return '${r1}' when run test1`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

})
