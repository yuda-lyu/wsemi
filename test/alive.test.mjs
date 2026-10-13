import assert from 'assert'
import { spawnSync } from 'child_process'
import alive from '../src/alive.mjs'


describe(`alive`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oAL = alive({ timeAlive: 1500 })
            // let t = Date.now()

            let a = { data: 123 }
            let b = { data: '34.56' }

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a1')
                oAL.trigger('a', a)
            }, 500)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a2')
                oAL.trigger('a', a)
            }, 1900)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b1')
                oAL.trigger('b', b)
            }, 1000)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b2')
                oAL.trigger('b', b)
            }, 3000)

            oAL.on('message', function({ eventName, key, data, now }) {
                // console.log(parseInt((Date.now() - t)) + 'ms', { eventName, key, data, now })
                ms.push(eventName + '|' + key)
            })

            setTimeout(() => {
                resolve(ms)
            }, 5000)

        })
    }
    // console.log('test1')
    // test1
    // 503ms trigger a1
    // 508ms { eventName: 'enter', key: 'a', data: { data: 123 }, now: 1 }
    // 1001ms trigger b1
    // 1003ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
    // 1901ms trigger a2
    // 2523ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 1 }
    // 3002ms trigger b2
    // 3004ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
    // 3430ms { eventName: 'leave', key: 'a', data: { data: 123 }, now: 1 }
    // 4544ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 0 }
    // ["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]
    let r1 = '["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oAL = alive({ timeAlive: 1500 })

            oAL.on('message', function({ eventName, key }) {
                ms.push(eventName + '|' + key)
            })

            oAL.trigger('a', { data: 123 })

            setTimeout(() => {
                oAL.trigger('b', { data: '34.56' })
                let r = oAL.clear() //b剛trigger尚未發出enter, 故只回傳a, 且b之enter不再發出
                ms.push('clear|' + r.map((v) => v.key).join(','))
            }, 500)

            setTimeout(() => {
                resolve(ms)
            }, 2500)

        })
    }
    let r2 = '["enter|a","clear|a"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    describe(`key`, function() {

        let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        //trigger之key為任意非空字串, 每個key皆須於首次trigger時enter、逾時leave、存活期間列於get
        //__proto__與Object原型之屬性名(constructor、toString等)亦同, 不得被誤判為已存在或改掉佇列之原型
        let keys = ['__proto__', 'data', 'time', 'constructor', 'toString', 'hasOwnProperty', 'valueOf', 'isPrototypeOf', '__defineGetter__']

        it(`should treat __proto__ and names on Object.prototype as ordinary keys`, async function() {
            let ms = []
            let o = alive({ timeAlive: 100, timeDetect: 20 })
            o.on('message', (m) => ms.push(m.eventName + '|' + m.key))
            for (let k of keys) {
                o.trigger(k, { k })
            }
            await sleep(30)
            assert.strict.deepStrictEqual(o.get(), keys.map((k) => ({ key: k, data: { k } })))
            await sleep(300)
            assert.strict.deepStrictEqual(ms, [...keys.map((k) => 'enter|' + k), ...keys.map((k) => 'leave|' + k)])
            assert.strict.deepStrictEqual(o.get(), [])
        })

        it(`should return __proto__ and names on Object.prototype from clear`, async function() {
            let o = alive({ timeAlive: 300 })
            o.trigger('__proto__', 1)
            o.trigger('constructor', 2)
            await sleep(30)
            assert.strict.deepStrictEqual(o.clear(), [{ key: '__proto__', data: 1 }, { key: 'constructor', data: 2 }])
        })

    })

    describe(`clear`, function() {

        let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        let create = (opt) => {
            let ms = []
            let errs = []
            let o = alive(opt)
            o.on('error', (e) => errs.push(e))
            o.on('message', (m) => ms.push(m.eventName + '|' + m.key))
            return { o, ms, errs }
        }

        it(`should return entered units, emit nothing afterwards and get [] (two units entered then clear)`, async function() {
            let { o, ms } = create({ timeAlive: 300 })
            o.trigger('a', { x: 1 })
            o.trigger('b', { x: 2 })
            await sleep(30)
            let r = o.clear()
            assert.strict.deepStrictEqual(r, [{ key: 'a', data: { x: 1 } }, { key: 'b', data: { x: 2 } }])
            await sleep(500) //逾timeAlive仍不得發leave
            assert.strict.deepStrictEqual(ms, ['enter|a', 'enter|b'])
            assert.strict.deepStrictEqual(o.get(), [])
        })

        it(`should return [] and cancel the enter when cleared right after trigger`, async function() {
            let { o, ms } = create({ timeAlive: 300 })
            o.trigger('a', 1)
            let r = o.clear()
            await sleep(400)
            assert.strict.deepStrictEqual(r, [])
            assert.strict.deepStrictEqual(ms, [])
        })

        it(`should return only units whose enter was emitted`, async function() {
            let { o, ms } = create({ timeAlive: 300 })
            o.trigger('a', 1)
            await sleep(30)
            o.trigger('b', 2)
            let r = o.clear()
            await sleep(400)
            assert.strict.deepStrictEqual(r, [{ key: 'a', data: 1 }])
            assert.strict.deepStrictEqual(ms, ['enter|a'])
        })

        it(`should not return a unit that left and was triggered again but not yet re-entered`, async function() {
            let { o, ms } = create({ timeAlive: 100, timeDetect: 20 })
            o.trigger('a', 1)
            await sleep(300) //a已enter且已leave
            o.trigger('a', 2)
            let r = o.clear()
            await sleep(100)
            assert.strict.deepStrictEqual(r, [])
            assert.strict.deepStrictEqual(ms, ['enter|a', 'leave|a'])
        })

        it(`should not throw and return [] when called repeatedly or before any trigger`, function() {
            let o = alive()
            assert.strict.deepStrictEqual(o.clear(), [])
            assert.strict.deepStrictEqual(o.clear(), [])
        })

        it(`should ignore trigger after clear`, async function() {
            let { o, ms } = create({ timeAlive: 300 })
            o.trigger('a', 1)
            await sleep(30)
            o.clear()
            o.trigger('b', 2)
            o.trigger('a', 3)
            await sleep(400)
            assert.strict.deepStrictEqual(ms, ['enter|a'])
            assert.strict.deepStrictEqual(o.get(), [])
            assert.strict.deepStrictEqual(o.clear(), [])
        })

        it(`should return the unit being dispatched and stop pending enters when cleared in an enter listener`, async function() {
            let { o, ms, errs } = create({ timeAlive: 300 })
            let rc = null
            o.on('message', (m) => {
                if (m.key === 'a' && rc === null) {
                    rc = o.clear()
                }
            })
            o.trigger('a', 1)
            o.trigger('b', 2)
            await sleep(400)
            assert.strict.deepStrictEqual(rc, [{ key: 'a', data: 1 }])
            assert.strict.deepStrictEqual(ms, ['enter|a'])
            assert.strict.deepStrictEqual(errs, [])
        })

        it(`should stop the eviction round without throwing when cleared in a leave listener`, async function() {
            //三單元同一輪逾時, 第一則leave中clear: 其餘二單元不再發leave且由clear回傳; 未防護時同輪下一單元會讀到已清空之佇列而拋錯
            let { o, ms, errs } = create({ timeAlive: 100, timeDetect: 20 })
            let rc = null
            o.on('message', (m) => {
                if (m.eventName === 'leave' && rc === null) {
                    rc = o.clear()
                }
            })
            o.trigger('a', 1)
            o.trigger('b', 2)
            o.trigger('c', 3)
            await sleep(400)
            assert.strict.deepStrictEqual(ms, ['enter|a', 'enter|b', 'enter|c', 'leave|a'])
            assert.strict.deepStrictEqual(rc, [{ key: 'b', data: 2 }, { key: 'c', data: 3 }])
            assert.strict.deepStrictEqual(errs, [])
        })

        it(`should leave no active timer so the process exits at once (child process)`, function() {
            //於呼叫clear之計時器回呼結束後(setImmediate)才查資源, 回呼內該計時器自身仍會列出
            let url = new URL('../src/alive.mjs', import.meta.url).href
            let code = `
                import alive from '${url}'
                let t0 = Date.now()
                let o = alive()
                o.trigger('a', 1)
                o.trigger('b', 2)
                setTimeout(() => {
                    let r = o.clear()
                    setImmediate(() => {
                        let res = process.getActiveResourcesInfo().filter((x) => x !== 'TTYWrap' && x !== 'Immediate')
                        process.on('exit', () => {
                            console.log(JSON.stringify({ r, res, ms: Date.now() - t0 }))
                        })
                    })
                }, 100)
            `
            let p = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', timeout: 20000 })
            assert.strict.deepStrictEqual(p.status, 0, p.stderr)
            let o = JSON.parse(p.stdout.trim())
            assert.strict.deepStrictEqual(o.r, [{ key: 'a', data: 1 }, { key: 'b', data: 2 }])
            assert.strict.deepStrictEqual(o.res, [])
            assert.strict.deepStrictEqual(o.ms < 2000, true, `exit after ${o.ms}ms`) //未clear時須逾timeAlive(預設10000)才結束
        })

    })

})
