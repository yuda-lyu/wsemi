import assert from 'assert'
import pmKeyMutex from '../src/pmKeyMutex.mjs'


describe(`pmKeyMutex`, function() {

    //test1: 相同key循序執行(排隊), 不同key並行
    let test1 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        let fun = (key, v, d) => {
            ms.push('call ' + key + '-' + v)
            return new Promise(function(resolve) {
                setTimeout(function() {
                    ms.push('resolve ' + key + '-' + v)
                    resolve('#' + v)
                }, d)
            })
        }

        //同key 'A' 之 a1(300ms)、a2(100ms) 須循序: a1先執行完才換a2, 即使a2較快
        //不同key 'B' 之 b1(200ms) 與 'A' 並行
        let pms = []
        pms.push(mx('A', () => fun('A', 'a1', 300)).then((r) => ms.push('then A-a1: ' + r)))
        pms.push(mx('A', () => fun('A', 'a2', 100)).then((r) => ms.push('then A-a2: ' + r)))
        pms.push(mx('B', () => fun('B', 'b1', 200)).then((r) => ms.push('then B-b1: ' + r)))
        await Promise.all(pms)

        return ms
    }
    // await test1()
    let ms1 = ['call A-a1', 'call B-b1', 'resolve B-b1', 'then B-b1: #b1', 'resolve A-a1', 'call A-a2', 'then A-a1: #a1', 'resolve A-a2', 'then A-a2: #a2']
    it(`should return '${JSON.stringify(ms1)}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(ms, ms1)
    })

    //test2: 同key某caller拋錯只傳回該caller, 不阻擋後續同key之caller
    let test2 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        let funOk = (v, d) => {
            return new Promise(function(resolve) {
                setTimeout(function() {
                    resolve('#' + v)
                }, d)
            })
        }
        let funErr = (v, d) => {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject('err-' + v)
                }, d)
            })
        }

        let pms = []
        pms.push(mx('K', () => funOk('k1', 100)).then((r) => ms.push('then k1: ' + r), (e) => ms.push('catch k1: ' + e)))
        pms.push(mx('K', () => funErr('k2', 100)).then((r) => ms.push('then k2: ' + r), (e) => ms.push('catch k2: ' + e)))
        pms.push(mx('K', () => funOk('k3', 100)).then((r) => ms.push('then k3: ' + r), (e) => ms.push('catch k3: ' + e)))
        await Promise.all(pms)

        return ms
    }
    // await test2()
    let ms2 = ['then k1: #k1', 'catch k2: err-k2', 'then k3: #k3']
    it(`should return '${JSON.stringify(ms2)}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(ms, ms2)
    })

    //test3: run resolve回傳fn之結果, reject回傳fn之錯誤
    let test3 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        //resolve路徑
        let r = await mx('A', async () => 'ok-value')
        ms.push({ resolved: r })

        //reject路徑
        try {
            await mx('A', async () => {
                throw new Error('boom')
            })
        }
        catch (err) {
            ms.push({ rejected: err.message })
        }

        return ms
    }
    // await test3()
    let ms3 = [
        { resolved: 'ok-value' },
        { rejected: 'boom' },
    ]
    it(`should return '${JSON.stringify(ms3)}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(ms, ms3)
    })

    //test4: 同key嚴格序列化 - 用共享變數驗證無交錯(每次進入fn時前一個必已離開)
    let test4 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        let active = 0 //同時進入臨界區之數量, 同key應恆為1
        let maxActive = 0

        let critical = (tag, d) => {
            return mx('SHARED', async () => {
                active += 1
                maxActive = Math.max(maxActive, active)
                await new Promise((resolve) => setTimeout(resolve, d))
                active -= 1
                return tag
            })
        }

        await Promise.all([
            critical('t1', 80),
            critical('t2', 30),
            critical('t3', 50),
        ])
        ms.push({ maxActive }) //同key串行, 臨界區同時進入數恆為1

        return ms
    }
    // await test4()
    let ms4 = [
        { maxActive: 1 },
    ]
    it(`should return '${JSON.stringify(ms4)}' when run test4'`, async function() {
        let ms = await test4()
        assert.strict.deepStrictEqual(ms, ms4)
    })

    //test5: 不同key可並行 - 兩個不同key之臨界區可同時進入
    let test5 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        let active = 0
        let maxActive = 0

        let critical = (key, d) => {
            return mx(key, async () => {
                active += 1
                maxActive = Math.max(maxActive, active)
                await new Promise((resolve) => setTimeout(resolve, d))
                active -= 1
                return key
            })
        }

        await Promise.all([
            critical('keyX', 80),
            critical('keyY', 80),
        ])
        ms.push({ maxActive }) //不同key並行, 兩臨界區可同時進入故為2

        return ms
    }
    // await test5()
    let ms5 = [
        { maxActive: 2 },
    ]
    it(`should return '${JSON.stringify(ms5)}' when run test5'`, async function() {
        let ms = await test5()
        assert.strict.deepStrictEqual(ms, ms5)
    })

    //test6: key佇列全數結束後可重複使用同一key(內部entry已清除但不影響後續正確排隊)
    let test6 = async () => {
        let ms = []
        let mx = pmKeyMutex()

        //第一批
        let r1 = await mx('reuse', async () => 'first')
        ms.push({ first: r1 })

        //第一批已drain, 再用同key
        let r2 = await mx('reuse', async () => 'second')
        ms.push({ second: r2 })

        //再次序列化驗證仍正確
        let order = []
        await Promise.all([
            mx('reuse', async () => {
                order.push('p1-in')
                await new Promise((resolve) => setTimeout(resolve, 50))
                order.push('p1-out')
            }),
            mx('reuse', async () => {
                order.push('p2-in')
                await new Promise((resolve) => setTimeout(resolve, 10))
                order.push('p2-out')
            }),
        ])
        ms.push({ order })

        return ms
    }
    // await test6()
    let ms6 = [
        { first: 'first' },
        { second: 'second' },
        { order: ['p1-in', 'p1-out', 'p2-in', 'p2-out'] },
    ]
    it(`should return '${JSON.stringify(ms6)}' when run test6'`, async function() {
        let ms = await test6()
        assert.strict.deepStrictEqual(ms, ms6)
    })

})
