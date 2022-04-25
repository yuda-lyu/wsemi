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
                    //console.log('test1 then')
                    ms.push('test1 then')
                })

            setTimeout(function() {
                resolve(ms)
            }, 1100)

        })
    }
    let r1 = '["waiting: 1","waiting: 2","test1 then"]'
    it(`should return '${r1}' when run test1`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        let ms = []
        let i = 0

        let f = () => {
            return new Promise((resolve, reject) => {
                setTimeout(function() {
                    i++
                    // console.log('waiting: ' + i)
                    ms.push('waiting: ' + i)
                    resolve(i >= 2)
                }, 1100)
            })
        }

        return waitFun(f)
            .then(function() {
                // console.log('test2 then')
                ms.push('test2 then')
                return ms
            })

    }
    let r2 = '["waiting: 1","waiting: 2","test2 then"]'
    it(`should return '${r2}' when run test2`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})