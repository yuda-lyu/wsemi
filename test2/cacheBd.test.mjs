import assert from 'assert'
import delay from '../src/delay.mjs'
import cacheBd from '../src/cacheBd.mjs'


describe(`cacheBd`, function() {

    let test1 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
        pm1
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm1-${res}` })
            })

        let pm2 = execFun(4.56, 'def') //pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
        pm2
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm2-${res}` })
            })

        let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
        pm3
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm3-${res}` })
            })

        await Promise.all([pm1, pm2, pm3])
        // console.log('rs', rs)

        // console.log('ms', ms)
        return ms
    }
    // await test1()
    let ms1 = [
        { result: 'pm2-4.56:def' },
        { result: 'pm1-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms1)}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(ms, ms1)
    })

    let test2 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        setTimeout(() => {
            // console.log('pm1 exec..')
            let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
            pm1
                .then((res) => {
                    // console.log('pm1 then', res)
                    ms.push({ result: `pm1-${res}` })
                })
        }, 1)

        setTimeout(() => {
            // console.log('pm2 exec..')
            let pm2 = execFun(4.56, 'def') //1000ms後, pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
            pm2
                .then((res) => {
                    // console.log('pm2 then', res)
                    ms.push({ result: `pm2-${res}` })
                })
        }, 1000)

        setTimeout(() => {
            // console.log('pm3 exec..')
            let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
            pm3
                .then((res) => {
                    // console.log('pm3 then', res)
                    ms.push({ result: `pm3-${res}` })
                })
        }, 3000)

        await delay(5000)

        // console.log('ms', ms)
        return ms
    }
    // await test2()
    let ms2 = [
        { result: 'pm2-4.56:def' },
        { result: 'pm1-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms2)}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(ms, ms2)
    })

    let test3 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        setTimeout(() => {
            // console.log('pm1 exec..')
            let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待, 3000ms將執行get與自己的輸入, 並最先回傳
            pm1
                .then((res) => {
                    // console.log('pm1 then', res)
                    ms.push({ result: `pm1-${res}` })
                })
        }, 1)

        setTimeout(() => {
            // console.log('pm2 exec..')
            let pm2 = execFun(4.56, 'def') //3500ms後, pm2執行原本函數與使用輸入, 計算完畢則會覆蓋快取, 此快取將再給等待或之後取得快取使用
            pm2
                .then((res) => {
                    // console.log('pm2 then', res)
                    ms.push({ result: `pm2-${res}` })
                })
        }, 3500)

        setTimeout(() => {
            // console.log('pm3 exec..')
            let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
            pm3
                .then((res) => {
                    // console.log('pm3 then', res)
                    ms.push({ result: `pm3-${res}` })
                })
        }, 4500)

        await delay(6500)

        // console.log('ms', ms)
        return ms
    }
    // await test3()
    let ms3 = [
        { result: 'pm1-123:abc' },
        { result: 'pm2-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms3)}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(ms, ms3)
    })

})
