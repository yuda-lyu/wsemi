import assert from 'assert'
import cache from '../src/cache.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`cache`, function() {

    //test1、test2、test3、test4、test8之結果取決於呼叫時刻與timeExpired之比較、fun內計時器與測試自帶計時器之先後, 時間本身即規格, 以假時鐘推進並以觀察回調(onTrace)斷言事件內容與順序(R-TRACE-01 P5); 原以真實計時器與定時快照, 負載下呼叫延後即改變過期判定與先後
    //runFake, 啟用假時鐘執行test並推進ms毫秒, 回傳其結果; 假時鐘下測試自帶之計時器(含原快照用之計時器)與fun內計時器同為虛擬時間, 先後不受負載影響; 推進後仍未完成即報錯(假時鐘不自行前進, 否則將懸置至逾時且未還原時鐘)
    async function runFake(test, ms, onTrace) {
        let clock = useFakeClock()
        try {
            let p = Promise.resolve(test(onTrace))
            let done = false
            p.then(() => {
                done = true
            }, () => {
                done = true
            })
            await clock.advance(ms)
            if (!done) {
                throw new Error(`test not settled within ${ms}ms of fake time`)
            }
            return await p
        }
        finally {
            clock.restore()
        }
    }

    //recAt, 觀察回調之紀錄器, 事件附上假時鐘之虛擬時刻(Date.now()); lines(pick)回傳'時刻 key: 事件'字串陣列, pick為選用之事件過濾函數; 時刻即虛擬毫秒, 時間本身即規格
    function recAt() {
        let tr = traceRec()
        let at = []
        let on = (e) => {
            at.push(Date.now())
            tr.on(e)
        }
        let fmt = (e) => {
            if (e.type === 'get') {
                return `get#${e.n} ${e.mode}` + (e.timeDiff === null ? '' : `:${e.timeDiff}`)
            }
            if (e.type === 'set') {
                return e.added ? 'set added' : 'set dup'
            }
            if (e.type === 'start') {
                return `start#${e.run}`
            }
            if (e.type === 'end') {
                return `end#${e.run} ` + (e.ok ? 'ok' : 'fail') + ' ' + (e.stored ? 'stored' : 'unstored')
            }
            return e.type + (e.running ? ' running' : '') //update、clear、remove
        }
        let lines = (pick = () => true) => {
            return tr.events.map((e, i) => [e, i]).filter(([e]) => pick(e)).map(([e, i]) => `${at[i]} ${e.key}: ${fmt(e)}`)
        }
        return { on, tr, lines }
    }

    function test1(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache({ onTrace })

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
                    .catch(function(err) {
                        ms.push('fun 1st error', String(err))
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會共用執行中的promise等待, 於第1次執行完畢(300ms)時一併取得第1次結果(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 2nd error', String(err))
                    })
            }, 50)
            setTimeout(function() {
                //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 同第2次呼叫共用執行中的promise等待, 於300ms時一併取得第1次結果(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 3rd error', String(err))
                    })
            }, 250)
            setTimeout(function() {
                //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 4th error', String(err))
                    })
            }, 500)
            setTimeout(function() {
                //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 故重新執行取值(1300~1600ms執行, 2500ms過期), 於1600ms取得第2次結果(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 5th', msg)
                        ms.push('fun 5th', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 5th error', String(err))
                    })
            }, 1300)
            setTimeout(function() {
                //第6次呼叫(1600ms), 此時第2次執行剛好結束(1600ms), 若尚未結束則共用執行中的promise等待, 若已結束則直接拿快取, 皆會取得第2次結果(count=2)
                oc.get('fun')
                    .then(function(msg) {
                        // console.log('fun 6th', msg)
                        ms.push('fun 6th', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 6th error', String(err))
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
        let rec = recAt()
        let ms = await runFake(test1, 2400, rec.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
        //JSDoc「若該key之函數執行中則共用執行中之promise」「超過失效時間則重新執行與再更新快取」「timeFrom…'start'為自函數開始執行時起算」: 第1次get(1ms)執行fun; 第2、3次(50、250ms)於執行中共用; fun於301ms結束; 第4次(500ms)距快取時間(自fun開始1ms起算)499ms未過期取快取; 第5次(1300ms)距1299ms>1200故重新執行; 第2次執行於1600ms結束
        assert.strict.deepStrictEqual(rec.lines((e) => !(e.type === 'get' && e.n === 6)), [
            '0 fun: set added',
            '1 fun: get#1 first',
            '1 fun: start#1',
            '50 fun: get#2 wait',
            '250 fun: get#3 wait',
            '301 fun: end#1 ok stored',
            '500 fun: get#4 cache:499',
            '1300 fun: get#5 expired:1299',
            '1300 fun: start#2',
            '1600 fun: end#2 ok stored',
        ])
        //第6次呼叫(1600ms)與第2次執行結束同刻, 先後不限: JSDoc「若尚未結束則共用執行中的promise等待, 若已結束則直接拿快取, 皆會取得第2次結果」(值於上方ms已斷言為count=2)
        let g6 = rec.tr.events.find((e) => e.type === 'get' && e.n === 6)
        assert.strict.deepStrictEqual(['wait', 'cache'].includes(g6.mode), true)
    })

    function test2(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache({ onTrace })

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

            //首次getProxy即註冊並執行取值(0~300ms), 快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
            //因useCacheWhenError預設false, 函數執行失敗時get與getProxy會reject, 故此種不取值之呼叫仍須接catch, 否則會產生unhandled rejection
            oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                .catch(function(err) {
                    ms.push('getProxy error', String(err))
                })
            setTimeout(function() {
                //第1次呼叫(1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 1st error', String(err))
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(100ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 2nd error', String(err))
                    })
            }, 100)
            setTimeout(function() {
                //第3次呼叫(500ms), 此時已有快取, 直接取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 3rd error', String(err))
                    })
            }, 500)
            setTimeout(function() {
                //第4次呼叫(1300ms), 此時第1次快取(count=1)已失效(1200ms), 會重新呼叫函數取值(1300~1600ms), 取得第2次結果(count=2)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
                    .then(function(msg) {
                        // console.log('fun 4th', msg)
                        ms.push('fun 4th', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 4th error', String(err))
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
        let rec = recAt()
        let ms = await runFake(test2, 1700, rec.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
        //JSDoc「getProxy為合併set與get功能…傳入參數同set，且會一併傳給get，回傳同get」「若該key之函數執行中則共用執行中之promise」「超過失效時間則重新執行」: 首次getProxy(0ms)執行fun, 其後每次getProxy的set皆因key已存在而忽略(dup); 第1、2次(1、100ms)於執行中共用; fun於300ms結束; 第3次(500ms)距快取時間500ms未過期; 第4次(1300ms)距1300ms>1200故重新執行, 其fun於1600ms結束(早於1700ms之快照)
        assert.strict.deepStrictEqual(rec.lines(), [
            '0 fun: set added',
            '0 fun: get#1 first',
            '0 fun: start#1',
            '1 fun: set dup',
            '1 fun: get#2 wait',
            '100 fun: set dup',
            '100 fun: get#3 wait',
            '300 fun: end#1 ok stored',
            '500 fun: set dup',
            '500 fun: get#4 cache:500',
            '1300 fun: set dup',
            '1300 fun: get#5 expired:1300',
            '1300 fun: start#2',
            '1600 fun: end#2 ok stored',
        ])
    })

    function test3(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache({ onTrace })

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

            //首次getProxy即註冊並執行取值(0~300ms), 快取1500ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留1200ms
            //因useCacheWhenError預設false, 函數執行失敗時get與getProxy會reject, 故此種不取值之呼叫仍須接catch, 否則會產生unhandled rejection
            oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                .catch(function(err) {
                    ms.push('getProxy error', String(err))
                })
            setTimeout(function() {
                //第1次呼叫(延遲1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 1st', msg)
                        ms.push('fun 1st', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 1st error', String(err))
                    })
            }, 1)
            setTimeout(function() {
                //第2次呼叫(延遲200ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1), 早於被強制更新(1100ms)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 2nd', msg)
                        ms.push('fun 2nd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 2nd error', String(err))
                    })
            }, 200)
            setTimeout(function() {
                //第3次呼叫(延遲500ms), 此時已有快取, 直接取得第1次結果(count=1)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 3rd', msg)
                        ms.push('fun 3rd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 3rd error', String(err))
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
                    .catch(function(err) {
                        ms.push('fun 4th error', String(err))
                    })
            }, 1300)
            setTimeout(function() {
                //第5次呼叫(延遲2700ms), 此時被強制更新之快取值(abc)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
                oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
                    .then(function(msg) {
                        // console.log('fun 5th', msg)
                        ms.push('fun 5th', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 5th error', String(err))
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
        let rec = recAt()
        let ms = await runFake(test3, 3100, rec.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
        //JSDoc「update為強制更新key所屬快取值，同時也會更新該快取之時間至當前」「超過失效時間則重新執行」: 同test2至第3次(500ms)取快取; update(1100ms)後快取時間為1100ms, 第4次(1300ms)距200ms取被更新之值; 第5次(2700ms)距1600ms>1500(自update起算, 若不更新時間則距2700ms)故重新執行, 其fun於3000ms結束(早於3100ms之快照)
        assert.strict.deepStrictEqual(rec.lines(), [
            '0 fun: set added',
            '0 fun: get#1 first',
            '0 fun: start#1',
            '1 fun: set dup',
            '1 fun: get#2 wait',
            '200 fun: set dup',
            '200 fun: get#3 wait',
            '300 fun: end#1 ok stored',
            '500 fun: set dup',
            '500 fun: get#4 cache:500',
            '1100 fun: update',
            '1300 fun: set dup',
            '1300 fun: get#5 cache:200',
            '2700 fun: set dup',
            '2700 fun: get#6 expired:1600',
            '2700 fun: start#2',
            '3000 fun: end#2 ok stored',
        ])
    })

    function test4(onTrace) {
        //同一tick併發去重與執行中共用promise: 第1與第2次呼叫於同一tick, fun只執行1次; 第3次於執行中(100ms)進入, 於fun結束(300ms)即回應, 不需等待輪詢週期
        return new Promise((resolve, reject) => {
            let ms = []

            let oc = cache({ onTrace })

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
                .catch(function(err) {
                    ms.push('fun 1st error', String(err))
                })
            oc.get('fun')
                .then(function(msg) {
                    ms.push('fun 2nd', msg)
                })
                .catch(function(err) {
                    ms.push('fun 2nd error', String(err))
                })
            setTimeout(function() {
                //第3次呼叫(100ms), 此時執行中, 共用執行中的promise, 於300ms時回應
                oc.get('fun')
                    .then(function(msg) {
                        dt3 = Date.now() - t0
                        ms.push('fun 3rd', msg)
                    })
                    .catch(function(err) {
                        ms.push('fun 3rd error', String(err))
                    })
            }, 100)

            setTimeout(function() {
                resolve({ ms, dt3 })
            }, 700)

        })
    }
    let r4 = '["call fun, count=1","fun 1st","count=1","fun 2nd","count=1","fun 3rd","count=1"]'
    it(`should return '${r4}' and 3rd get responds when fun ends when run test4'`, async function() {
        let rec = recAt()
        let { ms, dt3 } = await runFake(test4, 1500, rec.on)
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
        //JSDoc「若該key之函數執行中則共用執行中之promise，待其執行完畢即一併取得結果，不另行輪詢」: 第3次(100ms)於執行中進入, 於fun結束(300ms)同刻即回應(舊輪詢版需1100ms以上才回應)
        assert.strict.deepStrictEqual(dt3, 300, `3rd get should respond when fun ends(300ms), got ${dt3}ms`)
        //第1與第2次於同一tick: fun只執行1次(只有1個start), 第2次共用(wait); 第3次(100ms)共用; fun於300ms結束
        assert.strict.deepStrictEqual(rec.lines(), [
            '0 fun: set added',
            '0 fun: get#1 first',
            '0 fun: start#1',
            '0 fun: get#2 wait',
            '100 fun: get#3 wait',
            '300 fun: end#1 ok stored',
        ])
    })

    async function test5() {
        //fun失敗型態: 同步拋錯, reject, 回傳非promise; 皆不可使key卡死; 此處以useCacheWhenError=true測失敗仍寫入快取之路徑(失敗時值為undefined並發出error事件), 之後clear可重新執行; 預設之失敗不寫入快取路徑見test9
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
            useCacheWhenError: true,
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
            useCacheWhenError: true,
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
            useCacheWhenError: true,
        })
        let v7 = await oc.get('recover')
        oc.clear('recover')
        let v8 = await oc.get('recover')

        await new Promise((resolve) => setTimeout(resolve, 50)) //error事件以timer脫勾發送, 稍待

        return { vs: [v1, v2, v3, v4, v5, v6, v7, v8], n, errs }
    }
    it(`should return undefined on failures without sticking when useCacheWhenError=true when run test5'`, async function() {
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

    async function test8(onTrace) {
        //timeFrom: 預設'start'自fun開始起算, 'end'自fun結束起算; fun耗時200ms, timeExpired 220ms, 結束後再隔120ms取值: 'start'時已過期(320>220)重新執行, 'end'時未過期(120<220)取快取
        let oc = cache({ onTrace })

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
        let rec = recAt()
        let r = await runFake(test8, 1000, rec.on)
        assert.strict.deepStrictEqual(r, { v1: 'count=1', v2: 'count=2', v3: 'count=1', v4: 'count=1' })
        //JSDoc「timeFrom為快取時間之起算點，'start'為自函數開始執行時起算，'end'為自函數執行完畢時起算」: 'start'者快取時間為0ms(fun開始), 第2次get(320ms)距320ms>220故重新執行; 'end'者快取時間為fun結束之720ms, 第2次get(840ms)距120ms<=220故取快取
        assert.strict.deepStrictEqual(rec.lines(), [
            '0 start: set added',
            '0 start: get#1 first',
            '0 start: start#1',
            '200 start: end#1 ok stored',
            '320 start: get#2 expired:320',
            '320 start: start#2',
            '520 start: end#2 ok stored',
            '520 end: set added',
            '520 end: get#3 first',
            '520 end: start#3',
            '720 end: end#3 ok stored',
            '840 end: get#4 cache:120',
        ])
    })

    async function test9() {
        //useCacheWhenError: 預設false則失敗不寫入快取, 錯誤拋給執行者與等待中之併發呼叫, 下次get重新執行, error事件仍發出; 設true則失敗仍寫入快取見test5; 此處不傳useCacheWhenError以驗證其預設為false
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

        oc.set('fun', { fun, inputs: [], timeExpired: 30000 }) //不傳useCacheWhenError, 預設為false

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
    it(`should rethrow and not cache failures by default (useCacheWhenError=false) when run test9'`, async function() {
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

    //key為任意字串, __proto__與Object原型之屬性名(constructor、toString等)亦為一般key: 未set視為無效key、不得寫到原型上之物件, set後可取回
    it(`should treat __proto__ and names on Object.prototype as ordinary keys`, async function() {
        let had = Object.prototype.hasOwnProperty.call(Object, 'value')
        try {
            let oc = cache()
            for (let k of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
                assert.strict.deepStrictEqual(await oc.get(k), null, `get ${k} before set`)
            }
            oc.update('constructor', 5) //未set之key不得寫入, 一般物件時會寫到Object本身
            oc.clear('constructor')
            assert.strict.deepStrictEqual(Object.prototype.hasOwnProperty.call(Object, 'value'), had)
            oc.set('constructor', { fun: async () => 1 })
            oc.set('__proto__', { fun: async () => 2 })
            assert.strict.deepStrictEqual(await oc.get('constructor'), 1)
            assert.strict.deepStrictEqual(await oc.get('__proto__'), 2)
            assert.strict.deepStrictEqual(await oc.get('needExec'), null) //set __proto__不得使未set之key被視為存在
            oc.remove('constructor')
            assert.strict.deepStrictEqual(await oc.get('constructor'), null)
        }
        finally {
            if (!had) {
                delete Object.value //修正前之版本會寫入Object.value, 測試後還原以免影響同檔其他測試
            }
        }
    })

    //update視同fun已執行完成並寫入新值(JSDoc update): 已set但尚未執行過、或已clear之key, update之值不得被其後首次get以執行fun覆寫; 不涉及時間, 以get事件之mode與start事件斷言
    it(`should return the updated value without running fun when update is called on a key that was set but never run, or was cleared`, async function() {
        let rec = recAt()
        let oc = cache({ onTrace: rec.on })
        let n = 0
        let fun = async () => ++n
        let modes = () => rec.tr.events.filter((e) => e.type === 'get').map((e) => e.mode)

        //set後尚未執行即update: get取得update之值(快取), fun不執行
        oc.set('k', { fun, inputs: [], timeExpired: 30000 })
        oc.update('k', 'U')
        let v1 = await oc.get('k')
        let v2 = await oc.get('k')
        assert.strict.deepStrictEqual({ vs: [v1, v2], n, modes: modes(), starts: rec.tr.events.filter((e) => e.type === 'start').length }, { vs: ['U', 'U'], n: 0, modes: ['cache', 'cache'], starts: 0 })

        //clear後update: clear之標記由update取代, get取得update之值, fun不執行
        oc.clear('k')
        oc.update('k', 'V')
        let v3 = await oc.get('k')
        assert.strict.deepStrictEqual({ v3, n, modes: modes() }, { v3: 'V', n: 0, modes: ['cache', 'cache', 'cache'] })

        //update之後才clear(JSDoc clear): 下次get重新執行, 取得fun之結果
        oc.update('k', 'W')
        oc.clear('k')
        let v4 = await oc.get('k')
        let v5 = await oc.get('k')
        assert.strict.deepStrictEqual({ vs: [v4, v5], n, modes: modes() }, { vs: [1, 1], n: 1, modes: ['cache', 'cache', 'cache', 'first', 'cache'] })
    })

    //TTL邊界(JSDoc 「超過失效時間則重新執行」: timeDiff > timeExpired才過期): 假時鐘下恰於timeExpired取值為未過期、多1ms為已過期, 以get事件之mode(cache、expired)與timeDiff斷言
    it(`should treat a get exactly at timeExpired as cached and a get 1ms later as expired`, async function() {
        let clock = useFakeClock()
        try {
            let rec = recAt()
            let oc = cache({ onTrace: rec.on })
            let n = 0
            oc.set('k', { fun: async () => ++n, inputs: [], timeExpired: 100 })
            let v1 = await oc.get('k') //0ms: 首次執行, 快取時間為0
            await clock.advance(100)
            let v2 = await oc.get('k') //100ms: 距快取時間恰100ms=timeExpired, 未過期
            await clock.advance(1)
            let v3 = await oc.get('k') //101ms: 距快取時間101ms>timeExpired, 已過期而重新執行
            assert.strict.deepStrictEqual([v1, v2, v3, n], [1, 1, 2, 2])
            assert.strict.deepStrictEqual(rec.lines(), [
                '0 k: set added',
                '0 k: get#1 first',
                '0 k: start#1',
                '0 k: end#1 ok stored',
                '100 k: get#2 cache:100',
                '101 k: get#3 expired:101',
                '101 k: start#2',
                '101 k: end#2 ok stored',
            ])
        }
        finally {
            clock.restore()
        }
    })

    //update寫入之快取時間為update當下(JSDoc update「同時也會更新該快取之時間至當前」): 未執行過之key經update後, 過期自update時起算, 同樣以假時鐘斷言邊界
    it(`should count timeExpired from the update time for a key that was never run`, async function() {
        let clock = useFakeClock()
        try {
            let rec = recAt()
            let oc = cache({ onTrace: rec.on })
            let n = 0
            oc.set('k', { fun: async () => ++n, inputs: [], timeExpired: 100 })
            await clock.advance(50)
            oc.update('k', 'U') //50ms: 快取時間為50
            await clock.advance(100)
            let v1 = await oc.get('k') //150ms: 距50ms恰100ms, 未過期, 取得update之值
            await clock.advance(1)
            let v2 = await oc.get('k') //151ms: 距50ms為101ms, 已過期而首次執行fun
            assert.strict.deepStrictEqual([v1, v2, n], ['U', 1, 1])
            assert.strict.deepStrictEqual(rec.lines(), [
                '0 k: set added',
                '50 k: update',
                '150 k: get#1 cache:100',
                '151 k: get#2 expired:101',
                '151 k: start#1',
                '151 k: end#1 ok stored',
            ])
        }
        finally {
            clock.restore()
        }
    })

    //--- 觀察回調(onTrace) ---

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(cache()可不帶參數, 見同檔其他案); P4: 回調之拋錯與回傳值不影響快取、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        let rec = recAt()
        try {
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                let v1 = JSON.stringify(await runFake(test1, 2400, onTrace))
                let v2 = JSON.stringify(await runFake(test2, 1700, onTrace))
                let v3 = JSON.stringify(await runFake(test3, 3100, onTrace))
                let v4 = JSON.stringify(await runFake(test4, 1500, onTrace))
                let v8 = JSON.stringify(await runFake(test8, 1000, onTrace))
                rs.push([v1, v2, v3, v4, v8])
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.tr.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let want = [JSON.stringify(JSON.parse(r1)), JSON.stringify(JSON.parse(r2)), JSON.stringify(JSON.parse(r3)), JSON.stringify({ ms: JSON.parse(r4), dt3: 300 }), JSON.stringify({ v1: 'count=1', v2: 'count=2', v3: 'count=1', v4: 'count=1' })]
        assert.strict.deepStrictEqual([rs, un], [[want, want, want, want, want], []])
    })

    it(`should notify set, get, start, end, update, clear and remove through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且只含key、字串、布林與數字; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let clock = useFakeClock()
        try {
            let meta = []
            let rec = recAt()
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            let oc = cache({ onTrace })
            oc.on('error', () => {}) //error事件以timer脫勾派發, 假時鐘下不會派發; 仍掛上監聽器以免失敗時退為console.error

            //成功執行、取快取、update、clear後重新執行、remove後set重複與無效key
            oc.set('a', { fun: async () => 'A', timeExpired: 1000 })
            await oc.get('a')
            await oc.get('a')
            oc.update('a', 'U')
            await oc.get('a')
            oc.clear('a')
            await oc.get('a')
            oc.set('a', { fun: async () => 'A', timeExpired: 1000 })
            oc.remove('a')
            await oc.get('a')
            oc.update('a', 1) //無效key不通知
            oc.clear('a')
            oc.remove('a')

            //失敗不寫入快取(ok:false、stored:false)
            let funDown = async () => {
                throw new Error('down')
            }
            oc.set('f', { fun: funDown })
            await oc.get('f').catch(() => {})

            //執行中update與clear(running:true), 其後執行結果不覆寫update之值(stored:false)
            let release = null
            let funHold = () => new Promise((resolve) => {
                release = resolve
            })
            oc.set('r', { fun: funHold })
            let pm1 = oc.get('r')
            oc.update('r', 'U')
            oc.clear('r')
            let pm2 = oc.get('r')
            release('X')
            //此段僅微任務即應完成; 假時鐘下計時器不自行前進, 若未共用執行中之promise則pm1永不settle, 以setImmediate判定而報錯, 免懸置至逾時且未還原時鐘
            let stuck = (p) => Promise.race([p, new Promise((resolve, reject) => setImmediate(() => reject(new Error('stuck: not settled by microtasks alone'))))])
            await stuck(pm1)
            await stuck(pm2)

            //失敗仍寫入快取(ok:false、stored:true)
            oc.set('e', { fun: funDown, useCacheWhenError: true })
            await oc.get('e')

            assert.strict.deepStrictEqual(rec.lines(), [
                '0 a: set added',
                '0 a: get#1 first',
                '0 a: start#1',
                '0 a: end#1 ok stored',
                '0 a: get#2 cache:0',
                '0 a: update',
                '0 a: get#3 cache:0',
                '0 a: clear',
                '0 a: get#4 first',
                '0 a: start#2',
                '0 a: end#2 ok stored',
                '0 a: set dup',
                '0 a: remove',
                '0 a: get#5 invalid',
                '0 f: set added',
                '0 f: get#6 first',
                '0 f: start#3',
                '0 f: end#3 fail unstored',
                '0 r: set added',
                '0 r: get#7 first',
                '0 r: start#4',
                '0 r: update running',
                '0 r: clear running',
                '0 r: get#8 wait',
                '0 r: end#4 ok unstored',
                '0 e: set added',
                '0 e: get#9 first',
                '0 e: start#5',
                '0 e: end#5 fail stored',
            ])
            //各type之欄位固定且皆為原始值
            let keys = {}
            for (let e of rec.tr.events) {
                keys[e.type] = Object.keys(e).join(',')
                assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
            }
            assert.strict.deepStrictEqual(keys, {
                set: 'type,key,added',
                get: 'type,key,n,mode,timeDiff',
                start: 'type,key,run',
                end: 'type,key,run,ok,stored',
                update: 'type,key,running',
                clear: 'type,key,running',
                remove: 'type,key',
            })
            assert.strict.deepStrictEqual(meta.every(([self, frozen]) => self === undefined && frozen), true)
        }
        finally {
            clock.restore()
        }
    })

})


describe(`cache 重入與同步拋錯(R-PM-SETTLE-01規則11)`, function() {

    //st, 將get之結果轉為可比對之字串
    let st = (pm) => pm.then((v) => 'resolve ' + String(v), (e) => 'reject ' + (e instanceof Error ? e.message : String(e)))

    describe(`子行程: 同步重入`, function() {
        let r = null
        before(function() {
            r = runPmSettle('cacheReentrant').r
        })

        it(`fun於同步階段呼叫同key之get: fun只呼叫1次, 外層與重入者皆取得本次結果 [規則11]`, function() {
            //R-PM-SETTLE-01 規則11: fun內(含同步階段)呼叫同key之get共用本次執行而不重複執行; JSDoc cache:18「fun內(含同步階段)呼叫同key之get亦共用本次執行而不重複執行」
            assert.strict.deepStrictEqual(r.out.c01, { calls: 1, outer: { s: 'resolve', v: 'v' }, inner: { s: 'resolve', v: 'v' } })
        })

        it(`交叉key之同步重入(k1之fun取k2、k2之fun取k1): 各只呼叫1次 [規則11]`, function() {
            //R-PM-SETTLE-01 規則11: 同上句(兄弟情境: 重入發生於另一key之fun內)
            assert.strict.deepStrictEqual(r.out.c11, { calls: { k1: 1, k2: 1 }, outer: { s: 'resolve', v: 'v1' }, innerK2: { s: 'resolve', v: 'v2' }, innerK1: { s: 'resolve', v: 'v1' } })
        })

        it(`getProxy之同步重入: fun只呼叫1次 [規則11]`, function() {
            //JSDoc cache:18「getProxy…回傳同get」+ 規則11之共用本次執行
            assert.strict.deepStrictEqual(r.out.c15, { calls: 1, outer: { s: 'resolve', v: 'v' }, inner: { s: 'resolve', v: 'v' } })
        })

        it(`重入後fun同步拋錯: 重入者共用本次之失敗, 下次get重新執行 [規則11]`, function() {
            //R-PM-SETTLE-01 規則11: fun同步拋錯與async reject同樣於結束後清除執行中狀態, 下次get重新執行
            assert.strict.deepStrictEqual(r.out.c09, { outer: { s: 'reject', v: 'boom1' }, inner: { s: 'reject', v: 'boom1' }, next: { s: 'resolve', v: 'ok' }, calls: 2 })
        })

        it(`同tick三個get只執行1次(對照) [JSDoc]`, function() {
            //JSDoc cache:18「若該key之函數執行中則共用執行中之promise，待其執行完畢即一併取得結果」
            assert.strict.deepStrictEqual(r.out.c12, { calls: 1, results: [{ s: 'resolve', v: 'v' }, { s: 'resolve', v: 'v' }, { s: 'resolve', v: 'v' }] })
        })

        it(`無未處理之rejection與未捕捉例外 [規則2]`, function() {
            //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException
            assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
        })
    })

    it(`fun等待同key之get之結果為互等而永不settle, fun只呼叫1次 [規則11、JSDoc]`, function() {
        //R-PM-SETTLE-01 規則11: fun等待同key之get之結果為互等而永不settle(設計限制); JSDoc cache:18「fun若等待該get之結果則互相等待而永不settle」; 懸置以子行程之看門狗(300ms)判定
        let { r } = runPmSettle('cacheMutualWait')
        assert.strict.deepStrictEqual(r.out, { c02: { calls: 1, outer: { s: 'pending' } }, c04: { calls: 1, outer: { s: 'pending' } } })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`預設(useCacheWhenError=false)時fun同步拋錯: 該次reject, 下次get重新執行 [規則11]`, async function() {
        let oc = cache()
        let n = 0
        oc.set('k', {
            fun: () => {
                n++
                if (n === 1) {
                    throw new Error('boom1')
                }
                return 'ok'
            },
            timeExpired: 30000,
        })
        let rs = [await st(oc.get('k')), await st(oc.get('k')), await st(oc.get('k'))]
        //R-PM-SETTLE-01 規則11: fun同步拋錯…於結束後清除執行中狀態, 下次get重新執行; JSDoc cache:18「失敗不寫入快取…且下次get會重新執行(fun同步拋錯與其Promise被reject皆同)」
        assert.strict.deepStrictEqual({ rs, n }, { rs: ['reject boom1', 'resolve ok', 'resolve ok'], n: 2 })
    })

    it(`useCacheWhenError=true時fun同步拋錯: 取得undefined, 過期後重新執行 [規則11]`, async function() {
        let oc = cache()
        let n = 0
        oc.set('k', {
            fun: () => {
                n++
                if (n === 1) {
                    throw new Error('boom1')
                }
                return 'ok'
            },
            timeExpired: 50,
            useCacheWhenError: true,
        })
        let r1 = await st(oc.get('k'))
        await new Promise((resolve) => setTimeout(resolve, 120))
        let r2 = await st(oc.get('k'))
        //R-PM-SETTLE-01 規則11: …clear、過期後亦重新執行; JSDoc cache:18「失敗仍寫入快取，此時快取值為undefined並保留整個timeExpired」(過期後重新執行)
        assert.strict.deepStrictEqual({ rs: [r1, r2], n }, { rs: ['resolve undefined', 'resolve ok'], n: 2 })
    })

    it(`fun同步拋錯後clear: 重新執行 [規則11]`, async function() {
        let oc = cache()
        let n = 0
        oc.set('k', {
            fun: () => {
                n++
                if (n === 1) {
                    throw new Error('boom1')
                }
                return 'ok'
            },
            timeExpired: 30000,
        })
        let r1 = await st(oc.get('k'))
        oc.clear('k')
        let r2 = await st(oc.get('k'))
        //R-PM-SETTLE-01 規則11: clear後亦重新執行; JSDoc cache:18「clear為清除key所屬快取的是否執行標記，使該快取視為需重新執行函數取值」
        assert.strict.deepStrictEqual({ rs: [r1, r2], n }, { rs: ['reject boom1', 'resolve ok'], n: 2 })
    })

    it(`useCacheWhenError=true時fun同步拋錯後update再clear: update之值可取得, clear後重新執行 [規則11]`, async function() {
        let oc = cache()
        let n = 0
        oc.set('k', {
            fun: () => {
                n++
                if (n === 1) {
                    throw new Error('boom1')
                }
                return 'ok'
            },
            timeExpired: 30000,
            useCacheWhenError: true,
        })
        let r1 = await st(oc.get('k'))
        oc.update('k', 'U')
        let r2 = await st(oc.get('k'))
        oc.clear('k')
        let r3 = await st(oc.get('k'))
        //JSDoc cache:18「update為強制更新key所屬快取值」「clear…使該快取視為需重新執行函數取值」; R-PM-SETTLE-01 規則11: clear後亦重新執行
        assert.strict.deepStrictEqual({ rs: [r1, r2, r3], n }, { rs: ['resolve undefined', 'resolve U', 'resolve ok'], n: 2 })
    })

    it(`fun非函數時視為回傳undefined之空函數 [規則12]`, async function() {
        let oc = cache()
        let rs = []
        for (let [k, v] of [['undefined', undefined], ['null', null], ['zero', 0], ['str', 'abc'], ['obj', {}], ['asyncGen', async function* () {}]]) {
            oc.set(k, { fun: v, timeExpired: 30000 })
            rs.push(await st(oc.get(k)))
        }
        //R-PM-SETTLE-01 規則12: cache.set視為回傳undefined之空函數(寫入JSDoc); JSDoc cache:18「fun非函數時視為回傳undefined之空函數」
        assert.strict.deepStrictEqual(rs, Array(6).fill('resolve undefined'))
    })

})
