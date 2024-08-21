import assert from 'assert'
import pmDebounce from '../src/pmDebounce.mjs'


describe(`pmDebounce`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = pmDebounce(300)

            let i = 0
            let d = 100
            setTimeout(() => {
                let t = setInterval(() => {
                    i += d
                    // console.log(i, 'ms')
                    if (i > 2500) {
                        clearInterval(t)
                        resolve(ms)
                    }
                }, d)
            }, 1)

            let n = 0
            function test(rin) {
                // console.log(i, 'ms', 'test in:', rin)
                ms.push(`${i}ms, test in: ${rin}`)
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        n++
                        let rout = `${rin}:${n}`
                        // console.log(i, 'ms', 'test out:', rout)
                        ms.push(`${i}ms, test out: ${rout}`)
                        resolve(rout)
                    }, 500)
                })
            }

            setTimeout(() => {
                setTimeout(() => {
                    dbc(async() => {
                        return test('a')
                    }, 'a')
                }, 1)
                //1ms, a進入排程, 但a尚未發呆300ms故無法執行
                setTimeout(() => {
                    dbc(async() => {
                        return test('b')
                    }, 'b')
                }, 100)
                //100ms, b進入排程, 因b尚未發呆300ms故無法執行
                //400ms, 因b從100ms開始已發呆300ms至400ms故開始執行, 此時也取消a, 400ms開始須至900ms結束
                setTimeout(() => {
                    dbc(async() => {
                        return test('c')
                    }, 'c')
                }, 500)
                setTimeout(() => {
                    dbc(async() => {
                        return test('d')
                    }, 'd')
                }, 800)
                //500與800ms, c與d皆進入排程, 但b還在執行中故無法執行c與d
                //900ms, b執行完, 故取最後d開始執行, c已取消, 900ms開始須至1400ms結束
                //1400ms, d執行完, 無任何排程等待
                setTimeout(() => {
                    dbc(async() => {
                        return test('e')
                    }, 'e')
                }, 1500)
                //1500ms, e進入排程, 目前無任何排程, 但因e尚未發呆300ms故無法執行
                //1800ms, 因e已發呆300ms故開始執行, 1800ms開始須至2300ms結束
                //2300ms, e執行完
            }, 20)
            // 100 ms
            // 200 ms
            // 300 ms
            // 400 ms
            // 400 ms test in: b
            // 500 ms
            // 600 ms
            // 700 ms
            // 800 ms
            // 900 ms
            // 900 ms test out: b:1
            // 900 ms test in: d
            // 1000 ms
            // 1100 ms
            // 1200 ms
            // 1300 ms
            // 1400 ms
            // 1400 ms test out: d:2
            // 1500 ms
            // 1600 ms
            // 1700 ms
            // 1800 ms
            // 1800 ms test in: e
            // 1900 ms
            // 2000 ms
            // 2100 ms
            // 2200 ms
            // 2300 ms
            // 2300 ms test out: e:3
            // 2400 ms
            // 2500 ms
            // 2600 ms
        })

    }
    // let ms = await test1()
    // console.log(ms)
    // => [
    //   '400ms, test in: b',
    //   '900ms, test out: b:1',
    //   '900ms, test in: d',
    //   '1400ms, test out: d:2',
    //   '1800ms, test in: e',
    //   '2300ms, test out: e:3'
    // ]
    let r1 = '["400ms, test in: b","900ms, test out: b:1","900ms, test in: d","1400ms, test out: d:2","1800ms, test in: e","2300ms, test out: e:3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

})
