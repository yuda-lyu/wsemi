import assert from 'assert'
import debounce from '../src/debounce.mjs'


describe(`debounce`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = debounce(300)

            let i = 0
            function core(name) {
                i++
                ms.push({ name, i })
                //console.log({ name, i })
            }

            setTimeout(function() {
                dbc(() => {
                    core('A')
                })
            }, 100)
            setTimeout(function() {
                dbc(() => {
                    core('B')
                })
            }, 200)
            setTimeout(function() {
                dbc(() => {
                    core('C')
                })
            }, 250)
            setTimeout(function() {
                dbc(() => {
                    core('D')
                })
            }, 350)
            setTimeout(function() {
                dbc(() => {
                    core('E')
                })
            }, 400)
            setTimeout(function() {
                resolve(ms)
            }, 800)
        })
    }
    //console.log('test1')
    // test1
    // { name: 'E', i: 1 }
    // [{"name":"E","i":1}]
    let r1 = '[{"name":"E","i":1}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = debounce(300)

            let i = 0
            function core(name) {
                i++
                ms.push({ name, i })
                //console.log({ name, i })
            }

            setTimeout(function() {
                dbc(() => {
                    core('A')
                })
            }, 50)
            setTimeout(function() {
                dbc(() => {
                    core('B')
                })
            }, 100)
            setTimeout(function() {
                dbc(() => {
                    core('C')
                })
            }, 150)
            setTimeout(function() {
                dbc(() => {
                    core('D')
                })
            }, 500)
            setTimeout(function() {
                dbc(() => {
                    core('E')
                })
            }, 550)
            setTimeout(function() {
                resolve(ms)
            }, 1400)
        })
    }
    //console.log('test2')
    // test2
    // { name: 'C', i: 1 }
    // { name: 'E', i: 2 }
    // [{"name":"C","i":1},{"name":"E","i":2}]
    let r2 = '[{"name":"C","i":1},{"name":"E","i":2}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
