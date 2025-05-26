import assert from 'assert'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEvem from '../src/fsEvem.mjs'


describe(`fsEvem`, function() {

    let test = async () => {
        return new Promise((resolve, reject) => {
            let ms = []

            fsDeleteFolder('./_evps')

            let ev = fsEvem()

            ev.on('conut', (msg) => {
                // console.log('conut', msg)
                ms.push(msg)
            })

            let n = 0
            let t = setInterval(() => {
                n++
                ev.emit('conut', n)
                if (n >= 3) {
                    clearTimeout(t)
                }
            }, 3000)

            setTimeout(() => {
                ev.clear()
                // console.log('ms', ms)
                resolve(ms)
            }, 12000)

        })
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // conut 1
    // conut 2
    // conut 3
    let ms = [1, 2, 3]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
