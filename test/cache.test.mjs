import assert from 'assert'
import cache from '../src/cache.mjs'


describe(`cache`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            // oc.on('message', function(msg) {
            //     // console.log('message', msg)
            // })
            // oc.on('error', function(msg) {
            //     // console.log('error', msg)
            // })

            let i = 0
            let j = 0
            function fun(v1, v2) {
                i++
                // console.log('call fun, count=' + i)
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        j++
                        ms.push(v1 + '|' + v2 + ', count=' + j)
                        resolve(v1 + '|' + v2 + ', count=' + j)
                    }, 300)
                })
            }

            oc.set('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
            setTimeout(function() {
                //第1次呼叫(1ms), 此時沒有快取只能執行取值, 執行300ms後回應, 會取得第1次結果(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會共用執行中的promise等待, 於第1次執行完畢(300ms)時一併取得第1次結果(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
            }, 50)
            setTimeout(function() {
                //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 同第2次呼叫共用執行中的promise等待, 於300ms時一併取得第1次結果(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
            }, 250)
            setTimeout(function() {
                //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
            }, 500)
            setTimeout(function() {
                //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 故重新執行取值(1300~1600ms執行, 2500ms過期), 於1600ms取得第2次結果(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 5th', msg)
                        ms.push('fun 5th', msg)
                    })
            }, 1300)
            setTimeout(function() {
                //第6次呼叫(1600ms), 此時第2次執行剛好結束(1600ms), 若尚未結束則共用執行中的promise等待, 若已結束則直接拿快取, 皆會取得第2次結果(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 6th', msg)
                        ms.push('fun 6th', msg)
                    })
            }, 1600)

            setTimeout(function() {
                resolve(ms)
            }, 2400)

        })
    }
    // console.log('test1')
    // test1
    // call fun, count=1
    // fun 1st inp1|inp2, count=1
    // fun 2nd inp1|inp2, count=1
    // fun 3rd inp1|inp2, count=1
    // fun 4th inp1|inp2, count=1
    // call fun, count=2
    // fun 5th inp1|inp2, count=2
    // fun 6th inp1|inp2, count=2
    // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2"]
    let r1 = '["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            // oc.on('message', function(msg) {
            //     // console.log('message', msg)
            // })
            // oc.on('error', function(msg) {
            //     // console.log('error', msg)
            // })

            let i = 0
            let j = 0
            function fun(v1, v2) {
                i++
                // console.log('call fun, count=' + i)
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        j++
                        ms.push(v1 + '|' + v2 + ', count=' + j)
                        resolve(v1 + '|' + v2 + ', count=' + j)
                    }, 300)
                })
            }

            oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 }) //首次getProxy即註冊並執行取值(0~300ms), 快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
            setTimeout(function() {
                //第1次呼叫(1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(100ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
            }, 100)
            setTimeout(function() {
                //第3次呼叫(500ms), 此時已有快取, 直接取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
            }, 500)
            setTimeout(function() {
                //第4次呼叫(1300ms), 此時第1次快取(count=1)已失效(1200ms), 會重新呼叫函數取值(1300~1600ms), 取得第2次結果(count=2)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
            }, 1300)

            setTimeout(function() {
                resolve(ms)
            }, 1700)

        })
    }
    // console.log('test2')
    // test2
    // call fun, count=1
    // fun 1st inp1|inp2, count=1
    // fun 2nd inp1|inp2, count=1
    // fun 3rd inp1|inp2, count=1
    // call fun, count=2
    // fun 4th inp1|inp2, count=2
    // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]
    let r2 = '["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            // oc.on('message', function(msg) {
            //     // console.log('message', msg)
            // })
            // oc.on('error', function(msg) {
            //     // console.log('error', msg)
            // })

            let i = 0
            let j = 0
            function fun(v1, v2) {
                i++
                // console.log('call fun, count=' + i)
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        j++
                        ms.push(v1 + '|' + v2 + ', count=' + j)
                        resolve(v1 + '|' + v2 + ', count=' + j)
                    }, 300)
                })
            }

            oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 }) //首次getProxy即註冊並執行取值(0~300ms), 快取1500ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留1200ms
            setTimeout(function() {
                //第1次呼叫(延遲1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(延遲200ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1), 早於被強制更新(1100ms)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
            }, 200)
            setTimeout(function() {
                //第3次呼叫(延遲500ms), 此時已有快取, 直接取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
            }, 500)
            setTimeout(function() {
                //更新快取值(延遲1100ms), 快取值為abc, 快取時間也被更新至此時, 故會重新計算1500ms才會失效
                oc.update('fun', 'abc')
                // console.log('fun update', 'abc')
                ms.push('fun update', 'abc')
            }, 1100)
            setTimeout(function() {
                //第4次呼叫(延遲1300ms), 此時會取得被強制更新之快取值(abc), 快取還剩1300ms才失效(也就是在2600ms失效)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
            }, 1300)
            setTimeout(function() {
                //第5次呼叫(延遲2700ms), 此時被強制更新之快取值(abc)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 5th', msg)
                        ms.push('fun 5th', msg)
                    })
            }, 2700)

            setTimeout(function() {
                resolve(ms)
            }, 3100)

        })
    }
    // console.log('test3')
    // test3
    // call fun, count=1
    // fun 1st inp1|inp2, count=1
    // fun 2nd inp1|inp2, count=1
    // fun 3rd inp1|inp2, count=1
    // fun update abc
    // fun 4th abc
    // call fun, count=2
    // fun 5th inp1|inp2, count=2
    // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun update","abc","fun 4th","abc","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]
    let r3 = '["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun update","abc","fun 4th","abc","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    function test4() {
        //同一tick併發去重與執行中共用promise: 第1與第2次呼叫於同一tick, fun只執行1次; 第3次於執行中(100ms)進入, 於fun結束(300ms)即回應, 不需等待輪詢週期
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache()

            let i = 0
            function fun() {
                i++
                ms.push('call fun, count=' + i)
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve('count=' + i)
                    }, 300)
                })
            }

            oc.set('fun', { fun, inputs: [], timeExpired: 30000 })
            let t0 = Date.now()
            let dt3 = null

            //第1與第2次呼叫於同一tick, 執行中之promise於首個await之前即已寫入, 故第2次會共用而非重複執行
            oc.get('fun')
                .then(function(msg) {
                    ms.push('fun 1st', msg)
                })
            oc.get('fun')
                .then(function(msg) {
                    ms.push('fun 2nd', msg)
                })
            setTimeout(function() {
                //第3次呼叫(100ms), 此時執行中, 共用執行中的promise, 於300ms時回應
                oc.get('fun')
                    .then(function(msg) {
                        dt3 = Date.now() - t0
                        ms.push('fun 3rd', msg)
                    })
            }, 100)

            setTimeout(function() {
                resolve({ ms, dt3 })
            }, 700)

        })
    }
    let r4 = '["call fun, count=1","fun 1st","count=1","fun 2nd","count=1","fun 3rd","count=1"]'
    it(`should return '${r4}' and 3rd get responds when fun ends when run test4'`, async function() {
        let { ms, dt3 } = await test4()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
        assert.strict.ok(dt3 !== null && dt3 < 700, `3rd get should respond when fun ends(~300ms), got ${dt3}ms`) //舊輪詢版需1100ms以上才回應
    })

    async function test5() {
        //fun失敗型態: 同步拋錯, reject, 回傳非promise; 皆不可使key卡死, 失敗時值為undefined並發出error事件, 之後clear可重新執行
        let oc = cache()

        let errs = []
        oc.on('error', function(msg) {
            errs.push(msg.key + ':' + msg.msg.message)
        })

        //同步拋錯
        oc.set('throw', {
            fun: () => {
                throw new Error('sync throw')
            },
            inputs: [],
            timeExpired: 30000,
        })
        let v1 = await oc.get('throw') //失敗, undefined
        let v2 = await oc.get('throw') //快取中之undefined, 不卡死不重跑

        //reject
        oc.set('reject', {
            fun: async () => {
                throw new Error('reject')
            },
            inputs: [],
            timeExpired: 30000,
        })
        let v3 = await oc.get('reject')
        let v4 = await oc.get('reject')

        //回傳非promise
        oc.set('sync', {
            fun: (a, b) => a + b,
            inputs: [1, 2],
            timeExpired: 30000,
        })
        let v5 = await oc.get('sync')
        let v6 = await oc.get('sync')

        //失敗後clear可重新執行
        let n = 0
        oc.set('recover', {
            fun: async () => {
                n++
                if (n === 1) {
                    throw new Error('down')
                }
                return 'up'
            },
            inputs: [],
            timeExpired: 30000,
        })
        let v7 = await oc.get('recover')
        oc.clear('recover')
        let v8 = await oc.get('recover')

        await new Promise((resolve) => setTimeout(resolve, 50)) //error事件以timer脫勾發送, 稍待

        return { vs: [v1, v2, v3, v4, v5, v6, v7, v8], n, errs }
    }
    it(`should return undefined on failures without sticking when run test5'`, async function() {
        let r = await test5()
        assert.strict.deepStrictEqual(r.vs, [undefined, undefined, undefined, undefined, 3, 3, undefined, 'up'])
        assert.strict.deepStrictEqual(r.n, 2)
        assert.strict.deepStrictEqual(r.errs, ['throw:sync throw', 'reject:reject', 'recover:down'])
    })

    async function test6() {
        //執行中remove: 執行中之get仍正常回值不拋錯, remove後get回null並發出error(invalid key), 重新set為新項目會重新執行
        let oc = cache()

        let errs = []
        oc.on('error', function(msg) {
            errs.push(msg.key + ':' + msg.msg)
        })

        let n = 0
        let fun = () => {
            n++
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve('v' + n)
                }, 100)
            })
        }

        oc.set('fun', { fun, inputs: [], timeExpired: 30000 })
        let pm = oc.get('fun')
        await new Promise((resolve) => setTimeout(resolve, 10))
        oc.remove('fun') //執行中移除
        let v1 = await pm //正常回值
        let v2 = await oc.get('fun') //已移除, invalid key回null
        oc.set('fun', { fun, inputs: [], timeExpired: 30000 })
        let v3 = await oc.get('fun') //新項目重新執行

        await new Promise((resolve) => setTimeout(resolve, 50)) //error事件以timer脫勾發送, 稍待

        return { v1, v2, v3, n, errs }
    }
    it(`should keep in-flight get working when key removed during execution when run test6'`, async function() {
        let r = await test6()
        assert.strict.deepStrictEqual(r, { v1: 'v1', v2: null, v3: 'v2', n: 2, errs: ['fun:invalid key'] })
    })

    async function test7() {
        //執行中clear與update: clear於執行中呼叫仍有效(執行中之呼叫取得本次結果, 下次get重新執行); update於執行中呼叫以update之值為準, 不被執行結果覆寫
        let oc = cache()

        let n = 0
        let fun = () => {
            n++
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve('count=' + n)
                }, 100)
            })
        }

        //clear於執行中
        oc.set('clear', { fun, inputs: [], timeExpired: 30000 })
        let pm1 = oc.get('clear')
        await new Promise((resolve) => setTimeout(resolve, 10))
        oc.clear('clear')
        let v1 = await pm1 //執行中之呼叫取得本次結果(count=1)
        let v2 = await oc.get('clear') //clear有效, 重新執行(count=2)
        let v3 = await oc.get('clear') //快取(count=2)

        //update於執行中
        n = 0
        oc.set('update', { fun, inputs: [], timeExpired: 30000 })
        let pm2 = oc.get('update')
        await new Promise((resolve) => setTimeout(resolve, 10))
        oc.update('update', 'abc')
        let v4 = await pm2 //以update之值為準(abc)
        let v5 = await oc.get('update') //快取(abc), 不重新執行

        return { v1, v2, v3, v4, v5, n }
    }
    it(`should honor clear and update called during execution when run test7'`, async function() {
        let r = await test7()
        assert.strict.deepStrictEqual(r, { v1: 'count=1', v2: 'count=2', v3: 'count=2', v4: 'abc', v5: 'abc', n: 1 })
    })

    async function test8() {
        //timeFrom: 預設'start'自fun開始起算, 'end'自fun結束起算; fun耗時200ms, timeExpired 220ms, 結束後再隔120ms取值: 'start'時已過期(320>220)重新執行, 'end'時未過期(120<220)取快取
        let oc = cache()

        let n = 0
        let fun = () => {
            n++
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve('count=' + n)
                }, 200)
            })
        }

        oc.set('start', { fun, inputs: [], timeExpired: 220 }) //預設timeFrom='start'
        let v1 = await oc.get('start')
        await new Promise((resolve) => setTimeout(resolve, 120))
        let v2 = await oc.get('start')

        n = 0
        oc.set('end', { fun, inputs: [], timeExpired: 220, timeFrom: 'end' })
        let v3 = await oc.get('end')
        await new Promise((resolve) => setTimeout(resolve, 120))
        let v4 = await oc.get('end')

        return { v1, v2, v3, v4 }
    }
    it(`should count timeExpired from fun start by default and from fun end when timeFrom='end' when run test8'`, async function() {
        let r = await test8()
        assert.strict.deepStrictEqual(r, { v1: 'count=1', v2: 'count=2', v3: 'count=1', v4: 'count=1' })
    })

    async function test9() {
        //cacheError: 預設true失敗快取undefined(見test5); false時失敗不快取, 錯誤拋給執行者與等待中之併發呼叫, 下次get重新執行, error事件仍發出
        let oc = cache()

        let errs = []
        oc.on('error', function(msg) {
            errs.push(msg.key + ':' + msg.msg.message)
        })

        let n = 0
        let fun = () => {
            n++
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    if (n <= 2) {
                        reject(new Error('down' + n))
                    }
                    else {
                        resolve('up' + n)
                    }
                }, 50)
            })
        }

        oc.set('fun', { fun, inputs: [], timeExpired: 30000, cacheError: false })

        //第1次執行失敗: 執行者與等待中之併發呼叫皆收到reject
        let pm1 = oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
        await new Promise((resolve) => setTimeout(resolve, 10))
        let pm2 = oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
        let r1 = await pm1
        let r2 = await pm2

        //第2次執行仍失敗(失敗不快取故重新執行)
        let r3 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)

        //第3次執行成功並快取
        let r4 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
        let r5 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)

        await new Promise((resolve) => setTimeout(resolve, 50)) //error事件以timer脫勾發送, 稍待

        return { rs: [r1, r2, r3, r4, r5], n, errs }
    }
    it(`should rethrow and not cache failures when cacheError=false when run test9'`, async function() {
        let r = await test9()
        assert.strict.deepStrictEqual(r, { rs: ['err:down1', 'err:down1', 'err:down2', 'ok:up3', 'ok:up3'], n: 3, errs: ['fun:down1', 'fun:down2'] })
    })

    async function test10() {
        //useCloneDeep: 預設true回傳複製值, 設false則直接回傳快取內之值(同一參照); set可設定該key之預設, get可覆寫該次呼叫; 取快取與等待執行中之promise兩條取值路徑皆須遵守
        let oc = cache()

        let fun = () => {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve({ a: 1 })
                }, 100)
            })
        }

        //預設true: 修改所取得之值不影響快取
        oc.set('def', { fun, inputs: [], timeExpired: 30000 })
        let d1 = await oc.get('def')
        d1.a = 2
        let d2 = await oc.get('def')
        let defIsolated = (d2.a === 1) && (d1 !== d2)

        //get傳入false: 取快取路徑為同一參照
        oc.set('getFalse', { fun, inputs: [], timeExpired: 30000 })
        await oc.get('getFalse') //先執行取值使其有快取
        let g1 = await oc.get('getFalse', { useCloneDeep: false })
        let g2 = await oc.get('getFalse', { useCloneDeep: false })
        let getFalseSame = (g1 === g2)

        //set設定false, get未指定則沿用
        oc.set('setFalse', { fun, inputs: [], timeExpired: 30000, useCloneDeep: false })
        await oc.get('setFalse')
        let s1 = await oc.get('setFalse')
        let s2 = await oc.get('setFalse')
        let setFalseSame = (s1 === s2)

        //get之設定可覆寫set之設定
        let s3 = await oc.get('setFalse', { useCloneDeep: true })
        let overrideCloned = (s1 !== s3) && (s3.a === 1)

        //get傳入無效值則沿用set之設定
        let s4 = await oc.get('setFalse', { useCloneDeep: 'abc' })
        let invalidUseSet = (s1 === s4)

        //等待執行中之promise路徑(第2處cloneDeep): 預設true時各呼叫者所得為各自複製值
        oc.set('waitTrue', { fun, inputs: [], timeExpired: 30000 })
        let pmT1 = oc.get('waitTrue')
        await new Promise((resolve) => setTimeout(resolve, 10))
        let pmT2 = oc.get('waitTrue')
        let w1 = await pmT1
        let w2 = await pmT2
        let waitTrueIsolated = (w1 !== w2) && (w1.a === 1) && (w2.a === 1)

        //等待執行中之promise路徑: useCloneDeep為false時所得為同一參照
        oc.set('waitFalse', { fun, inputs: [], timeExpired: 30000, useCloneDeep: false })
        let pmF1 = oc.get('waitFalse')
        await new Promise((resolve) => setTimeout(resolve, 10))
        let pmF2 = oc.get('waitFalse', { useCloneDeep: false })
        let f1 = await pmF1
        let f2 = await pmF2
        let waitFalseSame = (f1 === f2)

        //getProxy會將opt一併傳給get, 故useCloneDeep於getProxy亦生效
        let p1 = await oc.getProxy('proxy', { fun, inputs: [], timeExpired: 30000, useCloneDeep: false })
        let p2 = await oc.getProxy('proxy', { fun, inputs: [], timeExpired: 30000, useCloneDeep: false })
        let proxySame = (p1 === p2)

        return { defIsolated, getFalseSame, setFalseSame, overrideCloned, invalidUseSet, waitTrueIsolated, waitFalseSame, proxySame }
    }
    it(`should clone returned value only when useCloneDeep is true when run test10'`, async function() {
        let r = await test10()
        assert.strict.deepStrictEqual(r, { defIsolated: true, getFalseSame: true, setFalseSame: true, overrideCloned: true, invalidUseSet: true, waitTrueIsolated: true, waitFalseSame: true, proxySame: true })
    })

})
