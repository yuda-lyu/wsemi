import assert from 'assert'
import pmKeyMutex from '../src/pmKeyMutex.mjs'
import { nonFunValues } from './tools/caseKit.mjs'


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


describe(`pmKeyMutex 非函數之任務(dspec §11 W-15甲②; 比照pmQueue、pmThrottle)`, function() {

    it(`fn非函數(12值,含isfun拋錯之已撤銷Proxy)時不同步拋錯, 回傳之Promise以固定字串'invalid fn: must be a function'被reject [W-15甲②]`, async function() {
        //dspec §11 W-15甲②「執行期提交之工作無效即以固定訊息(V19)reject該工作(…pmKeyMutex比照，不再排隊後拋原生TypeError)」; V20不回顯值
        let mx = pmKeyMutex()
        for (let [k, v] of nonFunValues()) {
            let p = null
            let threw = false
            try {
                p = mx('K', v)
            }
            catch (err) {
                threw = true
            }
            let r = threw ? 'sync-throw' : await p.then(() => 'resolve', (e) => e)
            assert.strict.deepStrictEqual([k, threw, r], [k, false, 'invalid fn: must be a function'])
        }
    })

    it(`非函數之fn不排入該key之佇列: 不等待同key執行中之任務即reject, 不影響同key其後有效任務之順序與結果 [W-15甲②]`, async function() {
        //以事件迴圈之一輪(setImmediate)而非延時判定: 若非函數之呼叫被排入同key之佇列(原行為), 須等gate放行後才輪到並reject, 於放行前不會reject
        let mx = pmKeyMutex()
        let order = []
        let release = null
        let gate = new Promise((resolve) => {
            release = resolve
        })
        let pa = mx('K', async () => {
            order.push('a-start')
            await gate
            order.push('a-end')
            return 'A'
        })
        let bad = []
        let pb = mx('K', 5).then(() => {
            bad.push('resolve')
        }, (e) => {
            bad.push(e)
        })
        let pc = mx('K', async () => {
            order.push('c')
            return 'C'
        })
        //讓出事件迴圈一輪: 非函數者已reject(gate尚未放行, a尚未結束, c尚未開始)
        await new Promise((resolve) => setImmediate(resolve))
        assert.strict.deepStrictEqual({ bad, order }, { bad: ['invalid fn: must be a function'], order: ['a-start'] })
        release()
        let rs = await Promise.all([pa, pb, pc])
        assert.strict.deepStrictEqual({ rs, order }, { rs: ['A', undefined, 'C'], order: ['a-start', 'a-end', 'c'] })
    })

    it(`非函數之呼叫不留下該key之記錄: 其後同key之有效任務立即執行(不被無效呼叫佔住鏈尾) [W-15甲②]`, async function() {
        let mx = pmKeyMutex()
        let order = []
        for (let [, v] of nonFunValues()) {
            await mx('Z', v).catch(() => {})
        }
        await mx('Z', async () => {
            order.push('z')
        })
        assert.strict.deepStrictEqual(order, ['z'])
    })

})
