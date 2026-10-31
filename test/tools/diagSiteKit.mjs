//diagSiteKit.mjs: evEmit、evEmitDelay、debounce、pmDebounce之通報站點(W1~W4)經getDiag出口之測試共用層, 規則見sgud/rule/rulebook_diag.md R-DIAG-01規則14
//  defineDiagSiteCases(keys): 於呼叫處之describe內, 對keys所列之站點逐一定義「預設/細節/funLog三態＋哨兵不外洩＋出口失敗隔離＋拋出值形態」之案
//  同步方式: 站點之輸出(console接管或funLog)皆寫入同一紀錄器, 測試以「等第N筆輸出」為同步點, 不以固定等待後檢查; 防懸置上限用模組載入時保存之真實計時器
//  debounce、pmDebounce之計時器以假時鐘(useFakeClock)推進(時間本身為規格: 偵測間隔), evEmitDelay為真實1ms計時器, 以輸出事件同步
import assert from 'assert'
import { inspect } from 'util'
import evem from '../../src/evem.mjs'
import evEmit from '../../src/evEmit.mjs'
import evEmitDelay from '../../src/evEmitDelay.mjs'
import debounce from '../../src/debounce.mjs'
import pmDebounce from '../../src/pmDebounce.mjs'
import { useFakeClock } from './timeKit.mjs'


//夾帶於拋出值之哨兵(代表權杖、使用者識別或資料值)與帶識別之事件名
const SENT = 'SECRET-9f3a1c'
const EVNAME = 'evt-ID77b2'

//防懸置上限用模組載入時保存之真實計時器(假時鐘會取代globalThis.setTimeout)
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//mkRec, 輸出紀錄器: add送入一筆, wait(n)於累計n筆時resolve(防懸置上限逾時reject)
let mkRec = (guard = 20000) => {
    let calls = []
    let waiters = []
    let add = (c) => {
        calls.push(c)
        for (let w of waiters.slice()) {
            if (calls.length >= w.n) {
                waiters.splice(waiters.indexOf(w), 1)
                realClearTimeout(w.t)
                w.resolve()
            }
        }
    }
    let wait = (n = 1) => {
        return new Promise((resolve, reject) => {
            if (calls.length >= n) {
                resolve()
                return
            }
            let w = { n, resolve }
            w.t = realSetTimeout(() => {
                waiters.splice(waiters.indexOf(w), 1)
                reject(new Error(`diagSiteKit: output #${n} not received within ${guard}ms, got ${calls.length}`))
            }, guard)
            waiters.push(w)
        })
    }
    return { calls, add, wait }
}


//captureOut, 接管console.log與console.error, 每次呼叫寫入紀錄器(via為'console.log'或'console.error'); throws為true者記錄後拋錯(測試出口之失敗隔離)
let captureOut = (rec, throws = false) => {
    let saved = { log: console.log, error: console.error }
    let mk = (via) => {
        return (...args) => {
            rec.add({ via, args })
            if (throws) {
                throw new Error('console boom')
            }
        }
    }
    console.log = mk('console.log')
    console.error = mk('console.error')
    return {
        restore: () => {
            console.log = saved.log
            console.error = saved.error
        },
    }
}


//dump, 紀錄之全文(含錯誤之訊息與堆疊), 供哨兵檢查
let dump = (calls) => inspect(calls, { depth: 12, breakLength: Infinity, maxStringLength: Infinity, maxArrayLength: Infinity })


//fake, 假時鐘內執行fn(推進60ms: 足夠debounce(10ms、偵測10ms)與pmDebounce(10ms、偵測20ms)跑完偵測並停止), 結束必還原
let fake = async (fn) => {
    let clock = useFakeClock()
    try {
        fn()
        await clock.advance(60)
    }
    finally {
        clock.restore()
    }
}


//SITES, 站點表: run(opt, thrown)觸發該站點(thrown為產生拋出值之函數); label/safe為預設應有之輸出; checkDetail為細節(logDetail或funLog之第3引數)應有之內容(以預設拋出值Error(`token=${SENT}`)判定)
let SITES = {
    W1: {
        title: 'W1 evEmit: 監聽器拋錯且無error監聽者',
        label: '[wsemi demo] listener threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            let ev = evem()
            ev.on(EVNAME, () => {
                throw thrown()
            })
            evEmit(ev, EVNAME, [], { tag: 'demo', ...opt })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d.event, d.err instanceof Error, d.err.message], [EVNAME, true, `user-${SENT}`])
        },
    },
    W1b: {
        title: 'W1\' evEmit: error監聽器自身拋錯',
        label: '[wsemi demo] listener threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            let ev = evem()
            ev.on('error', () => {
                throw thrown()
            })
            evEmit(ev, 'error', [{ a: 1 }], { tag: 'demo', ...opt })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d.event, d.err instanceof Error, d.err.message], ['error', true, `user-${SENT}`])
        },
    },
    W1c: {
        title: 'W1\'\' evEmitDelay: 監聽器拋錯且無error監聽者(opt整包傳入evEmit)',
        label: '[wsemi demo] listener threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            let ev = evem()
            ev.on(EVNAME, () => {
                throw thrown()
            })
            evEmitDelay(ev, EVNAME, [], { tag: 'demo', ...opt })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d.event, d.err instanceof Error, d.err.message], [EVNAME, true, `user-${SENT}`])
        },
    },
    W2: {
        title: 'W2 evEmit: 通報本身亦拋錯(error監聽器拋錯)',
        label: '[wsemi demo] listener threw, and reporting it also threw',
        level: 'error',
        safe: { errType: 'Error', origErrType: 'Error' },
        run: async (opt, thrown, thrown2) => {
            let ev = evem()
            ev.on(EVNAME, () => {
                throw thrown()
            })
            ev.on('error', () => {
                //error監聽器之拋出值(thrown2未給時為含哨兵之Error)
                throw thrown2 ? thrown2() : new Error(`user2-${SENT}`)
            })
            evEmit(ev, EVNAME, [], { tag: 'demo', ...opt })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d.event, d.err2 instanceof Error, d.err2.message, d.err instanceof Error, d.err.message], [EVNAME, true, `user2-${SENT}`, true, `user-${SENT}`])
        },
    },
    W3a: {
        title: 'W3 debounce: 任務同步拋錯',
        label: '[wsemi debounce] task threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            await fake(() => {
                let d = debounce(10, opt)
                d(() => {
                    throw thrown()
                })
            })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d instanceof Error, d.message], [true, `user-${SENT}`])
        },
    },
    W3b: {
        title: 'W3 debounce: 任務Promise reject',
        label: '[wsemi debounce] task threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            await fake(() => {
                let d = debounce(10, opt)
                d(async () => {
                    throw thrown()
                })
            })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d instanceof Error, d.message], [true, `user-${SENT}`])
        },
    },
    W3c: {
        title: 'W3 pmDebounce: 任務同步拋錯',
        label: '[wsemi pmDebounce] task threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            await fake(() => {
                let d = pmDebounce(10, opt)
                d(() => {
                    throw thrown()
                })
            })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d instanceof Error, d.message], [true, `user-${SENT}`])
        },
    },
    W3d: {
        title: 'W3 pmDebounce: 任務Promise reject',
        label: '[wsemi pmDebounce] task threw',
        level: 'error',
        safe: { errType: 'Error' },
        run: async (opt, thrown) => {
            await fake(() => {
                let d = pmDebounce(10, opt)
                d(async () => {
                    throw thrown()
                })
            })
        },
        checkDetail: (d) => {
            assert.strict.deepStrictEqual([d instanceof Error, d.message], [true, `user-${SENT}`])
        },
    },
    W4a: {
        title: 'W4 debounce: 輸入非函數',
        label: '[wsemi debounce] func is not a function',
        level: 'log',
        safe: undefined,
        noDetail: true,
        run: async (opt) => {
            let d = debounce(10, opt)
            d(`not-a-function ${SENT}`)
            d.cancel()
        },
    },
    W4b: {
        title: 'W4 pmDebounce: 輸入非函數',
        label: '[wsemi pmDebounce] func is not a function',
        level: 'log',
        safe: undefined,
        noDetail: true,
        run: async (opt) => {
            let d = pmDebounce(10, opt)
            d(`not-a-function ${SENT}`)
        },
    },
}


//THROWN, 拋出值之形態(預設態皆只出安全摘要): hit為使用端程式之執行次數計數器(拋出值之getter、toString、inspect.custom、then等不得被執行)
//  範圍註記: 不含'reason' getter——debounce、pmDebounce之任務為async reject時, 既有之pm2resolve／pmConvertResolve會讀拒絕值之reason(R-PM-SETTLE-01, 非診斷出口之行為),
//  該站點(W3b、W3d)之hit斷言因此不涵蓋reason; 診斷出口(getDiag)本身不讀reason
let mkHostile = () => {
    let o = { hit: 0 }
    let v = {
        get message() {
            o.hit++
            return SENT
        },
        get name() {
            o.hit++
            return SENT
        },
        get code() {
            o.hit++
            return SENT
        },
        get then() {
            o.hit++
            return undefined
        },
        toString() {
            o.hit++
            return SENT
        },
        toJSON() {
            o.hit++
            return SENT
        },
        [Symbol.toPrimitive]() {
            o.hit++
            return SENT
        },
        [Symbol.for('nodejs.util.inspect.custom')]() {
            o.hit++
            return SENT
        },
    }
    return { o, v }
}
let THROWN = [
    { id: 'Error(含哨兵)', mk: () => new Error(`token=${SENT}`), type: 'Error' },
    { id: 'Error(含code=ECONNREFUSED)', mk: () => Object.assign(new Error(`token=${SENT}`), { code: 'ECONNREFUSED' }), type: 'Error', code: 'ECONNREFUSED' },
    { id: 'Error(code為含哨兵之字串)', mk: () => Object.assign(new Error('x'), { code: `E_${SENT}` }), type: 'Error' },
    { id: '自訂類別(類別名帶識別)', mk: () => new (class Alice01Error extends Error {})(`token=${SENT}`), type: 'Error' },
    { id: '字串', mk: () => `plain ${SENT}`, type: 'string' },
    { id: '含token鍵之物件', mk: () => ({ token: SENT, msg: SENT }), type: 'object' },
    { id: 'null', mk: () => null, type: 'null' },
    { id: 'undefined', mk: () => undefined, type: 'undefined' },
    { id: '數字', mk: () => 123456, type: 'number' },
    { id: 'Symbol(含哨兵描述)', mk: () => Symbol(SENT), type: 'symbol' },
]


//run, 於站點觸發一次並回傳紀錄: optOf(rec)產生傳給站點之opt(funLog須寫入紀錄器); consoleThrows為true者console接管後拋錯
let runSite = async (site, optOf, thrown, consoleThrows = false, thrown2 = undefined) => {
    let rec = mkRec()
    let cap = captureOut(rec, consoleThrows)
    try {
        await site.run(optOf(rec), thrown, thrown2)
        await rec.wait(1)
    }
    finally {
        cap.restore()
    }
    return rec.calls
}


//mkFunLog, 寫入紀錄器之funLog(after為記錄後之動作, 如拋錯、回傳rejected Promise)
let mkFunLog = (rec, after) => {
    return (...args) => {
        rec.add({ via: 'funLog', args })
        return after ? after() : undefined
    }
}


//defineDiagSiteCases, 於呼叫處之describe內定義各站點之案(R-DIAG-01規則14: 通報站點經getDiag出口)
let defineDiagSiteCases = (keys) => {
    for (let key of keys) {
        let site = SITES[key]
        let dflt = () => new Error(`user-${SENT}`) //細節態下訊息原樣出現(非憑證樣式, 通用遮罩不處理)

        describe(`${site.title} 經getDiag出口`, function() {

            //規則14: 預設只出固定詞彙label與安全摘要(console), 不含拋出值與事件名
            it(`預設: console.${site.level}恰一次, 引數為[label, 安全摘要], 全部輸出不含哨兵與事件名`, async function() {
                let calls = await runSite(site, () => ({}), dflt)
                let expArgs = site.safe === undefined ? [site.label] : [site.label, site.safe]
                assert.strict.deepStrictEqual(calls, [{ via: `console.${site.level}`, args: expArgs }])
                let out = dump(calls)
                assert.strict.deepStrictEqual([out.includes(SENT), out.includes(EVNAME)], [false, false])
            })

            //規則14: logDetail===true才輸出遮罩後細節(label不變)
            if (!site.noDetail) {
                it(`logDetail===true: console.${site.level}恰一次, 引數為[label, 遮罩後細節], label同預設`, async function() {
                    let calls = await runSite(site, () => ({ logDetail: true }), dflt)
                    assert.strict.deepStrictEqual(calls.map((c) => [c.via, c.args.length, c.args[0]]), [[`console.${site.level}`, 2, site.label]])
                    site.checkDetail(calls[0].args[1])
                })
            }
            else {
                it(`logDetail===true: 無細節可輸出, 與預設相同(只有label)`, async function() {
                    let calls = await runSite(site, () => ({ logDetail: true }), dflt)
                    assert.strict.deepStrictEqual(calls, [{ via: `console.${site.level}`, args: [site.label] }])
                })
            }

            //logDetail非true之值不生效(須恰為true)
            it(`logDetail為非true之值('true'、1、{}、'yes'、false)時同預設, 不輸出細節`, async function() {
                for (let v of ['true', 1, {}, 'yes', false]) {
                    let calls = await runSite(site, () => ({ logDetail: v }), dflt)
                    let expArgs = site.safe === undefined ? [site.label] : [site.label, site.safe]
                    assert.strict.deepStrictEqual(calls, [{ via: `console.${site.level}`, args: expArgs }], `logDetail=${String(v)}`)
                    assert.strict.deepStrictEqual(dump(calls).includes(SENT), false)
                }
            })

            //規則14: funLog取代console, 收(label, 安全摘要, 遮罩後細節)
            it(`funLog: funLog恰一次收到(label, 安全摘要${site.noDetail ? '' : ', 遮罩後細節'}), console不輸出`, async function() {
                let calls = await runSite(site, (rec) => ({ funLog: mkFunLog(rec) }), dflt)
                assert.strict.deepStrictEqual(calls.map((c) => c.via), ['funLog'])
                let a = calls[0].args
                assert.strict.deepStrictEqual([a[0], a[1]], [site.label, site.safe])
                if (site.noDetail) {
                    assert.strict.deepStrictEqual(a.length, 2)
                }
                else {
                    assert.strict.deepStrictEqual(a.length, 3)
                    site.checkDetail(a[2])
                }
            })

            it(`funLog與logDetail並給: 輸出只交給funLog(logDetail不作用於console)`, async function() {
                let calls = await runSite(site, (rec) => ({ funLog: mkFunLog(rec), logDetail: true }), dflt)
                assert.strict.deepStrictEqual(calls.map((c) => c.via), ['funLog'])
            })

            //getDiag之規則: funLog帶noDetail===true屬性者(genDiagFunLog所產生)只收(label, safe), 不呼叫getDetail
            it(`funLog帶noDetail===true(伺服端轉接器產物)時只收(label, 安全摘要)兩個引數, 不取細節`, async function() {
                let calls = await runSite(site, (rec) => {
                    let f = mkFunLog(rec)
                    f.noDetail = true
                    return { funLog: f }
                }, dflt)
                assert.strict.deepStrictEqual(calls.map((c) => [c.via, c.args.length, c.args[0], c.args[1]]), [['funLog', 2, site.label, site.safe]])
            })

            it(`funLog非函數('abc'、{}、1、null)時不生效, 同預設輸出至console`, async function() {
                for (let v of ['abc', {}, 1, null]) {
                    let calls = await runSite(site, () => ({ funLog: v }), dflt)
                    let expArgs = site.safe === undefined ? [site.label] : [site.label, site.safe]
                    assert.strict.deepStrictEqual(calls, [{ via: `console.${site.level}`, args: expArgs }], `funLog=${String(v)}`)
                }
            })

            //出口失敗隔離: funLog拋錯、回傳rejected Promise、console拋錯皆不外洩(無uncaughtException、無unhandledRejection)
            it(`出口失敗隔離: funLog拋錯、funLog回傳rejected Promise、console拋錯皆不使流程拋錯或產生未處理之rejection`, async function() {
                let bad = []
                let onBad = (e) => {
                    bad.push(e)
                }
                process.on('unhandledRejection', onBad)
                process.on('uncaughtException', onBad)
                try {
                    let c1 = await runSite(site, (rec) => ({
                        funLog: mkFunLog(rec, () => {
                            throw new Error('funLog boom')
                        })
                    }), dflt)
                    let c2 = await runSite(site, (rec) => ({ funLog: mkFunLog(rec, () => Promise.reject(new Error('funLog reject'))) }), dflt)
                    let c3 = await runSite(site, () => ({}), dflt, true)
                    //讓出數輪事件迴圈, 使可能之unhandledRejection現形(否定斷言之觀察, 以事件迴圈輪次而非時間)
                    for (let i = 0; i < 5; i++) {
                        await new Promise((resolve) => setImmediate(resolve))
                    }
                    assert.strict.deepStrictEqual([c1.map((c) => c.via), c2.map((c) => c.via)], [['funLog'], ['funLog']])
                    assert.strict.deepStrictEqual(c3[0].via, `console.${site.level}`)
                    assert.strict.deepStrictEqual(bad, [])
                }
                finally {
                    process.removeListener('unhandledRejection', onBad)
                    process.removeListener('uncaughtException', onBad)
                }
            })

            //拋出值之形態: 預設態與logDetail態皆只出摘要/遮罩細節, 哨兵不外洩於預設態, 使用端程式不被執行
            if (!site.noDetail) {
                for (let f of THROWN) {
                    it(`拋出值為${f.id}: 預設只出安全摘要(類型${f.code ? '與代碼' : ''}), 不含哨兵`, async function() {
                        let calls = await runSite(site, () => ({}), f.mk)
                        let exp = f.code ? { errType: f.type, errCode: f.code } : { errType: f.type }
                        if (site.safe.origErrType !== undefined) {
                            //W2: errType為error監聽器之拋出(固定Error), 監聽器之拋出值之類型在origErrType、origErrCode
                            exp = { errType: 'Error', origErrType: f.type }
                            if (f.code) {
                                exp.origErrCode = f.code
                            }
                        }
                        assert.strict.deepStrictEqual(calls, [{ via: 'console.error', args: [site.label, exp] }])
                        assert.strict.deepStrictEqual(dump(calls).includes(SENT), false)
                    })
                }

                it(`拋出值含使用端程式(getter、toString、toJSON、toPrimitive、inspect.custom、then): 預設、logDetail、funLog三態皆不被執行, 且不含其回傳之哨兵`, async function() {
                    for (let mkOpt of [() => ({}), () => ({ logDetail: true }), (rec) => ({ funLog: mkFunLog(rec) })]) {
                        let h = mkHostile()
                        let calls = await runSite(site, mkOpt, () => h.v, false, () => new Error('e2'))
                        assert.strict.deepStrictEqual(calls.length, 1)
                        assert.strict.deepStrictEqual(h.o.hit, 0)
                        assert.strict.deepStrictEqual(dump(calls).includes(SENT), false)
                    }
                })

                it(`logDetail: 拋出值內憑證鍵名(password、token)之值整體遮罩為***, 非憑證鍵(note)原樣`, async function() {
                    let calls = await runSite(site, () => ({ logDetail: true }), () => ({ password: `pw-${SENT}`, token: `tk-${SENT}`, note: 'n1' }), false, () => new Error('e2'))
                    assert.strict.deepStrictEqual(calls.length, 1)
                    let out = dump(calls)
                    assert.strict.deepStrictEqual([out.includes(SENT), out.includes('n1'), out.includes('***')], [false, true, true])
                })

                it(`logDetail與funLog: 拋出之Error其訊息內之憑證樣式(token=值)經遮罩為token=***, 哨兵不外洩`, async function() {
                    for (let mkOpt of [() => ({ logDetail: true }), (rec) => ({ funLog: mkFunLog(rec) })]) {
                        let calls = await runSite(site, mkOpt, () => new Error(`token=${SENT}`), false, () => new Error('e2'))
                        let out = dump(calls)
                        assert.strict.deepStrictEqual([out.includes(SENT), out.includes('token=***')], [false, true])
                    }
                })
            }

        })
    }
}


export { SENT, EVNAME, SITES, mkRec, captureOut, mkFunLog, runSite, dump, defineDiagSiteCases }
