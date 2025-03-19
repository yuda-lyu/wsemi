import assert from 'assert'
import pmDebounce from '../src/pmDebounce.mjs'


describe(`pmDebounce`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = pmDebounce(300)

            let i = 0
            let d = 100
            if (true) {
                // console.log(i, 'ms')
                let t = setInterval(() => { //dbc內時間比較快
                    i += d
                    // if (i % 100 === 0) {
                    //     console.log(i, 'ms')
                    // }
                    if (i >= 2000) {
                        clearInterval(t)
                        resolve(ms)
                    }
                }, d)
            }

            // let i = 0
            // let d = 100
            // setTimeout(() => {
            //     let t = setInterval(() => {
            //         i += d
            //         // console.log(i, 'ms')
            //         if (i >= 2000) {
            //             clearInterval(t)
            //             resolve(ms)
            //         }
            //     }, d)
            // }, 1)

            let n = 0
            function test(rin) {
                // console.log(i, 'ms', 'test in:', rin)
                ms.push(`test in: ${rin}`)
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        n++
                        let rout = `${rin}:${n}`
                        // console.log(i, 'ms', 'test out:', rout)
                        ms.push(`test out: ${rout}`)
                        resolve(rout)
                    }, 500)
                })
            }

            if (true) {

                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'a') //無阻攔時1->300發呆, 300->800執行
                }, 1)
                //1ms, a進入排程, 但a尚未發呆300ms, 故a無法執行
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'b') //無阻攔時200->500發呆, 500->1000執行
                }, 200)
                //200ms, b進入排程, 同時排程前面還有a, 故只會取最末b出來判識(a被強制剔除), 因b尚未發呆完300ms故b無法執行
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'c') //無阻攔時600->900發呆, 900->1400執行
                }, 600)
                //500ms, b已發呆完開始執行
                //600ms, c進入排程, 因b已於500ms開始執行(b執行為500->1000), c進入排程只能等待
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'd') //無阻攔時900->1200發呆, 1200->1700執行
                }, 900)
                //900ms, d進入排程, 因b執行尚未結束, d雖可進入排程, 同時排程前面還有c, 故c與d皆為等待
                //1000ms, b已執行完, 取最末d出來判識(c被強制剔除), d須發呆300ms才能開始執行
                //1200ms, d已發呆完, 開始執行(d執行為1200->1700)
                //1700ms, d執行完

            }
            //0 ms
            //100 ms
            //200 ms
            //300 ms
            //400 ms
            //400 ms test in: b
            //500 ms
            //600 ms
            //700 ms
            //800 ms
            //900 ms
            //900 ms test out: b:1
            //1000 ms
            //1100 ms
            //1200 ms
            //1200 ms test in: d
            //1300 ms
            //1400 ms
            //1500 ms
            //1600 ms
            //1700 ms
            //1700 ms test out: d:2
            //1800 ms
            //1900 ms
            //2000 ms

        })

    }
    // let ms = await test1()
    // console.log(ms)
    // => [ 'test in: b', 'test out: b:1', 'test in: d', 'test out: d:2' ]
    let r1 = ['test in: b', 'test out: b:1', 'test in: d', 'test out: d:2']
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(ms, r1)
    })

})
