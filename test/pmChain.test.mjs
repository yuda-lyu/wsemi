import assert from 'assert'
import { fileURLToPath } from 'url'
import pmChain from '../src/pmChain.mjs'
import { runChildCase } from './tools/runChildCase.mjs'
import { nonFunValues } from './tools/caseKit.mjs'


describe(`pmChain`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm1 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm1' + v)
                        ms.push('resolve pm1' + v)
                        resolve('pm1' + v)
                    }, 100)
                })
            }
            let pm2 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm2' + v)
                        ms.push('resolve pm2' + v)
                        resolve('pm2' + v)
                    }, 150)
                })
            }
            let pm3 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm3' + v)
                        ms.push('resolve pm3' + v)
                        resolve('pm3' + v)
                    }, 50)
                })
            }

            pmChain([pm1, pm2, pm3], '*')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test1')
    // test1
    // resolve pm1*
    // resolve pm2pm1*
    // resolve pm3pm2pm1*
    // t1 then:  pm3pm2pm1*
    // ["resolve pm1*","resolve pm2pm1*","resolve pm3pm2pm1*","t1 then: pm3pm2pm1*"]
    let r1 = '["resolve pm1*","resolve pm2pm1*","resolve pm3pm2pm1*","t1 then: pm3pm2pm1*"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm1 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm1' + v)
                        ms.push('resolve pm1' + v)
                        resolve('pm1' + v)
                    }, 100)
                })
            }
            //pm2為reject
            let pm2 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('reject pm2' + v)
                        ms.push('reject pm2' + v)
                        reject('pm2' + v)
                    }, 150)
                })
            }
            let pm3 = function(v) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // console.log('resolve pm3' + v)
                        ms.push('resolve pm3' + v)
                        resolve('pm3' + v)
                    }, 50)
                })
            }

            pmChain([pm1, pm2, pm3], '*')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test2')
    // test2
    // resolve pm1*
    // reject pm2pm1*
    // t1 catch:  pm2pm1*
    // ["resolve pm1*","reject pm2pm1*","t1 catch: pm2pm1*"]
    let r2 = '["resolve pm1*","reject pm2pm1*","t1 catch: pm2pm1*"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})


describe(`pmChain 輸入於進入時取值(R-PM-SETTLE-01規則17、R-OBJ-ITER-01)`, function() {

    let runner = fileURLToPath(new URL('./tools/pmObjLenRunner.mjs', import.meta.url))

    //call, 等待pmChain之結果轉為{ s, v }; 同步拋出記為{ s: 'throw' }, 使修前之同步拋出以斷言失敗呈現而非中斷
    let call = (fn) => {
        try {
            return Promise.resolve(fn()).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        }
        catch (e) {
            return Promise.resolve({ s: 'throw', v: e })
        }
    }

    describe(`子行程: 元素讀取即拋錯`, function() {
        let r = null
        before(function() {
            r = runChildCase(runner, 'chainGetter').r
        })

        it(`函數陣列第2個元素讀取即拋錯: 以該錯誤reject, 不同步拋出, 首項函數一次都不被呼叫 [規則17]`, function() {
            //R-PM-SETTLE-01 規則17: 複製與建鏈置於try, 讀取拋錯以該錯誤reject(與pmMap一致); 修前於pms.reduce同步拋出, 且已建好之鏈首項於其後仍被呼叫
            assert.strict.deepStrictEqual(r.out, { syncThrow: false, s: 'reject', same: true, calls: 0 })
        })

        it(`無未處理之rejection與未捕捉例外 [規則2、17]`, function() {
            //R-PM-SETTLE-01 規則2、17: 首項函數不被呼叫, 其回傳之rejection不產生
            assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
        })
    })

    describe(`子行程: Array子類別(Symbol.species)與稀疏陣列 [R-PM-SETTLE-01規則17]`, function() {

        it(`Symbol.species回Object之Array子類別得4; 稀疏函數陣列之空洞被略過得4, 同修前`, function() {
            let r = runChildCase(runner, 'speciesSparse').r
            assert.strict.deepStrictEqual({
                species: r.out.chainSpecies,
                sparse: r.out.chainSparse,
                unhandled: r.unhandled,
                uncaught: r.uncaught,
            }, {
                species: { s: 'resolve', v: 4 },
                sparse: { s: 'resolve', v: 4 },
                unhandled: [],
                uncaught: [],
            })
        })

    })

    describe(`子行程: 容器本身讀取即拋錯`, function() {

        it(`已撤銷之Proxy: 以TypeError reject, 不同步拋出 [規則17]`, function() {
            let r = runChildCase(runner, 'revokedContainer').r
            assert.strict.deepStrictEqual({ out: r.out.chain, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', isTypeError: true }, unhandled: [], uncaught: [] })
        })

        it(`Symbol.toStringTag讀取即拋錯: 陣列判定不讀標籤, 為invalid pms: must be an array [規則17]`, function() {
            let r = runChildCase(runner, 'tagGetterContainer').r
            assert.strict.deepStrictEqual({ out: r.out.chain, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', same: false, msg: 'invalid pms: must be an array' }, unhandled: [], uncaught: [] })
        })

    })

    it(`should reject 'invalid pms: must be an array' for Symbol.toStringTag-faked arrays without calling their reduce (R-OBJ-ITER-01 規則2)`, async function() {
        let called = 0
        let fake = {
            [Symbol.toStringTag]: 'Array',
            length: 2,
            reduce() {
                called += 1
                return 'hijack'
            },
        }
        let r = await call(() => pmChain(fake, 'init'))
        let noReduce = await call(() => pmChain({ [Symbol.toStringTag]: 'Array', length: 2 }, 'init'))
        assert.strict.deepStrictEqual({ r, called, noReduce }, {
            r: { s: 'reject', v: 'invalid pms: must be an array' },
            called: 0,
            noReduce: { s: 'reject', v: 'invalid pms: must be an array' },
        })
    })

    it(`should reject 'invalid pms: must be an array' for non-array inputs, including array-like objects`, async function() {
        let f = (v) => v + 'a'
        // eslint-disable-next-line no-new-wrappers
        let bads = [undefined, null, 0, 1, '', 'abc', true, () => {}, {}, { length: 2, 0: f, 1: f }, { length: 0 }, new Map(), new Set(), new Uint8Array(2), new String('ab'), Symbol('s'), 10n]
        let out = []
        for (let b of bads) {
            out.push(await call(() => pmChain(b, 'x')))
        }
        assert.strict.deepStrictEqual(out, bads.map(() => ({ s: 'reject', v: 'invalid pms: must be an array' })))
    })

    it(`should keep the chain semantics: non-function elements are skipped, default initial is null, empty array resolves initial, holes are skipped`, async function() {
        let f1 = (v) => v + 'a'
        let f2 = async (v) => v + 'b'
        let sp = [f1]
        sp[3] = f2 //稀疏: 空缺略過
        let thrown = new Error('boom')
        let n = 0
        let out = {
            skip: await call(() => pmChain([f1, 'str', null, Promise.resolve(99), undefined, f2], 'x')),
            noInitial: await call(() => pmChain([f1])),
            empty: await call(() => pmChain([], 'init')),
            sparse: await call(() => pmChain(sp, 'x')),
            stop: await call(() => pmChain([f1, () => {
                throw thrown
            }, () => {
                n += 1
            }], 'x')),
        }
        assert.strict.deepStrictEqual({ out, n }, {
            out: {
                skip: { s: 'resolve', v: 'xab' },
                noInitial: { s: 'resolve', v: 'nulla' },
                empty: { s: 'resolve', v: 'init' },
                sparse: { s: 'resolve', v: 'xab' },
                stop: { s: 'reject', v: thrown },
            },
            n: 0,
        })
    })

    it(`呼叫後改動輸入陣列(改元素、縮短長度): 使用呼叫當下之函數 [規則17]`, async function() {
        let f1 = (v) => v + 'a'
        let f2 = async (v) => v + 'b'
        let fs = [f1, f2]
        let pm = pmChain(fs, 'x')
        fs[1] = (v) => v + 'MUT'
        fs.length = 1
        let r = await call(() => pm)
        //R-PM-SETTLE-01 規則17: 於進入時取值(複製), 其後只處理複本
        assert.strict.deepStrictEqual(r, { s: 'resolve', v: 'xab' })
    })

})


describe(`pmChain 非函數之元素(dspec §11 W-15甲③: 清單之元素維持視為未給)`, function() {

    it(`非函數之元素(12值: 含Promise、null、undefined、數字、字串、物件、陣列、async generator函數、已撤銷之物件與函數Proxy)視為未給而略過: 前一結果原樣傳給下一個函數, 不報錯、不reject [W-15甲③; ws492g2 第4點]`, async function() {
        //dspec §11 W-15甲③「清單之元素維持『視為未給』(pmChain、pmMap、pmSeries之非函數元素略過)」; JSDoc pmChain「非函數之元素(含async generator函數、已撤銷之函數Proxy)視為未給而略過」
        //ws492g2 第4點: 元素以isFunSafe判定, 與pmMap、pmSeries、pmQueue同一判準; async generator函數(isfun為false)與已撤銷之函數Proxy(isfun拋TypeError)皆略過, 不被then呼叫(原行為: 前者回傳generator物件、後者拋TypeError而reject)
        let keys = []
        for (let [k, v] of nonFunValues()) {
            keys.push(k)
            let r = await pmChain([(x) => x + 1, v, (x) => x * 10], 4).then((x) => ({ s: 'resolve', v: x }), (e) => ({ s: 'reject', v: e }))
            assert.strict.deepStrictEqual([k, r], [k, { s: 'resolve', v: 50 }])
        }
        //12值全測(不排除任何值): 鎖定值集合含async generator函數與已撤銷之函數Proxy
        assert.strict.deepStrictEqual(keys.length, 12)
        assert.strict.deepStrictEqual(keys.includes('asyncGen') && keys.includes('revokedFn') && keys.includes('revokedObj'), true)
        //全為非函數之元素: 結果為initial原樣
        let r2 = await pmChain([5, null, 'x'], 'init').then((x) => ({ s: 'resolve', v: x }), (e) => ({ s: 'reject', v: e }))
        assert.strict.deepStrictEqual(r2, { s: 'resolve', v: 'init' })
    })

    it(`initial為選填(預設null): 未給時第1個函數收到null`, async function() {
        //JSDoc pmChain「@param {*} [initial=null]」(原簽名有預設而JSDoc未標選填)
        let got = 'not-called'
        let r = await pmChain([(x) => {
            got = x
            return 'done'
        }])
        assert.strict.deepStrictEqual([got, r], [null, 'done'])
    })

})
