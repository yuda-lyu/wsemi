/* eslint-disable no-new-wrappers, no-extend-native -- 測試刻意以包裝物件(new String/Number/Boolean)驗證「檢查之值即使用之值」,並暫時攔截Map.prototype.set(finally還原)取得模組內之共用表 */
import fs from 'fs'
import http from 'http'
import zlib from 'zlib'
import crypto from 'crypto'
import path from 'path'
import assert from 'assert'
import { spawnSync } from 'child_process'
import { Readable, Writable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsDownloadFileVerify from '../src/fsDownloadFileVerify.mjs'
import fsDownloadFileVerifyCore from '../src/fsDownloadFileVerifyCore.mjs'
import { useFakeClock } from './tools/timeKit.mjs'
import { mkRec, advanceUntil, fiveOnTrace, guard } from './tools/dlTraceKit.mjs'


//規格: 派工提示詞(wsemi-run01〈要做的事〉1)與規則帳本R-DL-VERIFY-01; 各案註解之R編號對應tmp之validate-plan需求述語, 規則句見R-DL-VERIFY-01
describe(`fsDownloadFileVerify with a local server`, function() {
    this.timeout(60000)

    //本機HTTP服務, 不依賴外網; port固定8000以上, test目錄內其他測試未使用(fsDownloadFile為8801, 本檔範例為8802, 子行程為8804)
    let port = 8803
    let fdt = './test/_tmp/fsDownloadFileVerify'
    let server = null
    let body = Buffer.from(Array.from({ length: 300000 }, (v, i) => i % 251))
    let bodyBad = Buffer.from(body)
    bodyBad[bodyBad.length - 1] = (bodyBad[bodyBad.length - 1] + 1) % 256 //同長度、末位元組不同
    let gz = zlib.gzipSync(body)
    let sha = crypto.createHash('sha256').update(body).digest('hex')
    let exp = { sha256: sha, size: body.length }
    let hits = {}
    let plans = {}
    let closedAt = {}
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    //觀察回調(opt.onTrace)測試用之伺服器端同步點(R-TRACE-01): 回應之放行與結束由測試以事件控制, 不用伺服器端計時器(假時鐘會一併取代計時器, 且負載下時刻不定)
    //  gates: 受測試控制之回應(action為gated); closeWaiters: 某網址之下一個回應結束或連線被中止(action為hang時只可能是被對方中止)
    let gates = {}
    let closeWaiters = {}

    //mkGate, 預先登記某網址之受控回應: 伺服器收到請求即送出標頭(flushHeaders), 之後本體由測試以write/end放行; len給了則content-length為len, 否則chunked
    let mkGate = (key, len) => {
        let g = { len, res: null, ready: null, open: null }
        g.ready = new Promise((resolve) => {
            g.open = resolve
        })
        g.write = (buf) => {
            g.res.write(buf)
        }
        g.end = (buf) => {
            g.res.end(buf)
        }
        gates[key] = g
        return g
    }

    //mkMem, 記憶體內受測試控制之回應(傳入opt.fetch, 不經本機HTTP): 標頭立即可用, 本體由測試以write/end放行; calls為fetch被呼叫次數
    //  假時鐘(useFakeClock)下不用真實連線: 客戶端(undici)於假時鐘期間建立之內部計時器於還原後殘留, 後續假時鐘期間其清除動作會誤清測試中被測碼的計時器(以實測確認: 前一案之殘留使後一案的整體時限計時器永不觸發)
    let mkMem = (len) => {
        let ctl = null
        let stream = new ReadableStream({
            start(c) {
                ctl = c
            },
        })
        let mem = { calls: 0 }
        mem.fetch = async () => {
            mem.calls++
            return new Response(stream, { status: 200, headers: len === undefined ? {} : { 'content-length': String(len) } })
        }
        mem.write = (buf) => {
            ctl.enqueue(new Uint8Array(buf))
        }
        mem.end = () => {
            ctl.close()
        }
        return mem
    }

    //watchClose, 登記後回傳Promise, 於該網址的下一個回應結束或連線被中止時resolve { ended }, ended為伺服器是否已自行結束回應(false代表連線是被對方中止)
    let watchClose = (key) => {
        return new Promise((resolve) => {
            closeWaiters[key] = resolve
        })
    }

    //withClock, 於假時鐘下執行fn(clock), 結束(含失敗)必還原; 時間本身即規格者(停滯、整體時限、重試間隔)用之(P5), 事件來自本機真實I/O者以onTrace事件為同步點才推進
    let withClock = async (fn) => {
        let clock = useFakeClock()
        try {
            return await fn(clock)
        }
        finally {
            clock.restore()
        }
    }

    let url = (p) => {
        return `http://127.0.0.1:${port}/${p}`
    }
    let fpOf = (name) => {
        return `${fdt}/${name}.bin`
    }

    //parts, 正式檔名所在資料夾內屬於本函數之暫存檔(<檔名>.<pid>.<亂數>.part)
    let parts = (fp) => {
        let fd = path.dirname(fp)
        let bn = path.basename(fp)
        if (!fs.existsSync(fd)) {
            return []
        }
        return fs.readdirSync(fd).filter((v) => {
            return v.startsWith(`${bn}.`) && v.endsWith('.part')
        })
    }
    let catchErr = async (pm) => {
        try {
            await pm
        }
        catch (err) {
            return err
        }
        return null
    }
    let mkFs = (over) => {
        return { ...fs, ...over }
    }
    let busy = (code) => {
        let e = new Error(`${code}: resource busy or locked (injected)`)
        e.code = code
        return e
    }

    //actions, 伺服器之回應行為
    let actions = {
        ok: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            res.end(body)
        },
        nolen: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream' }) //chunked
            res.end(body)
        },
        gz: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-encoding': 'gzip', 'content-length': String(gz.length) })
            res.end(gz)
        },
        bad: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(bodyBad.length) })
            res.end(bodyBad)
        },
        short: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream' }) //chunked, 只送1000位元組
            res.end(body.subarray(0, 1000))
        },
        bigslow: (req, res) => {
            //chunked, 先送2000位元組, 5秒後才送完; 供驗超量即提前中止
            res.writeHead(200, { 'content-type': 'application/octet-stream' })
            res.write(body.subarray(0, 2000))
            let t = setTimeout(() => {
                res.end(body.subarray(2000))
            }, 5000)
            res.on('close', () => {
                clearTimeout(t)
            })
        },
        abort: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            res.write(body.subarray(0, 200000))
            let t = setTimeout(() => {
                res.socket.destroy() //送出部分內容後斷線
            }, 50)
            res.on('close', () => {
                clearTimeout(t)
            })
        },
        stall: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            res.write(body.subarray(0, 100)) //之後不再送資料
        },
        stallhead: (req, res) => {
            //不回應標頭
        },
        drip: (req, res) => {
            //每50ms送1位元組, 不停滯但很慢
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            let i = 0
            let t = setInterval(() => {
                res.write(body.subarray(i, i + 1))
                i++
            }, 50)
            res.on('close', () => {
                clearInterval(t)
            })
        },
        dripok: (req, res) => {
            //分10塊、每100ms送一塊(全程約1秒), 每塊間隔小於停滯門檻
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            let n = 10
            let len = Math.ceil(body.length / n)
            let i = 0
            let t = setInterval(() => {
                res.write(body.subarray(i * len, (i + 1) * len))
                i++
                if (i >= n) {
                    clearInterval(t)
                    res.end()
                }
            }, 100)
            res.on('close', () => {
                clearInterval(t)
            })
        },
        slowok: (req, res) => {
            //先送一半, 400ms後送完; 供驗下載途中正式檔名不存在
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(body.length) })
            res.write(body.subarray(0, 150000))
            let t = setTimeout(() => {
                res.end(body.subarray(150000))
            }, 400)
            res.on('close', () => {
                clearTimeout(t)
            })
        },
        gated: (req, res, key) => {
            //受測試控制之回應(mkGate): 標頭立即送出, 本體由測試放行
            let g = gates[key]
            let h = { 'content-type': 'application/octet-stream' }
            if (g.len !== undefined) {
                h['content-length'] = String(g.len)
            }
            res.writeHead(200, h)
            res.flushHeaders()
            g.res = res
            g.open()
        },
        hang: (req, res) => {
            //chunked, 送出2000位元組後不再送資料也不結束, 連線只能由對方中止(伺服器端close且未自行結束即代表被對方中止)
            res.writeHead(200, { 'content-type': 'application/octet-stream' })
            res.write(body.subarray(0, 2000))
        },
        s404: (req, res) => {
            res.writeHead(404, { 'content-type': 'text/plain' })
            res.end('not found')
        },
        s403: (req, res) => {
            res.writeHead(403, { 'content-type': 'text/plain' })
            res.end('forbidden')
        },
        s500: (req, res) => {
            res.writeHead(500, { 'content-type': 'text/plain' })
            res.end('error')
        },
        s408: (req, res) => {
            res.writeHead(408, { 'content-type': 'text/plain' })
            res.end('timeout')
        },
        s429: (req, res) => {
            res.writeHead(429, { 'content-type': 'text/plain' })
            res.end('too many')
        },
        empty: (req, res) => {
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': '0' })
            res.end()
        },
        ident: (req, res) => {
            //content-encoding為identity(未壓縮), content-length即實際大小
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-encoding': 'identity', 'content-length': String(body.length) })
            res.end(body)
        },
    }

    //plan, 網址/<key>之第n次請求依plans[key][n-1]之行為回應(超出者沿用最後一個), 未設plans者以key為行為
    let plan = (key, seq) => {
        plans[key] = seq
        hits[key] = 0
        return url(key)
    }

    before(async function() {
        process.on('unhandledRejection', onUnhandled)
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
        server = http.createServer((req, res) => {
            let key = req.url.split('?')[0].slice(1)
            hits[key] = (hits[key] || 0) + 1
            res.on('close', () => {
                closedAt[key] = Date.now() //回應結束或連線被對方中止之時刻
                let wc = closeWaiters[key]
                if (wc) {
                    delete closeWaiters[key]
                    wc({ ended: res.writableEnded })
                }
            })
            let seq = plans[key] || [key]
            let a = seq[Math.min(hits[key] - 1, seq.length - 1)]
            let f = actions[a] || actions.s404
            f(req, res, key)
        })
        await new Promise((resolve) => {
            server.listen(port, '127.0.0.1', resolve)
        })
    })

    after(async function() {
        server.closeAllConnections()
        await new Promise((resolve) => {
            server.close(resolve)
        })
        fsDeleteFolder(fdt)
        process.removeListener('unhandledRejection', onUnhandled)
    })

    //======== 成功 ========

    it(`R01 should download, verify and rename to fpOut, byte for byte, leaving no temporary file`, async function() {
        let fp = fpOf('ok')
        let u = plan('ok1', ['ok'])
        let r = await fsDownloadFileVerify(u, fp, exp)
        //R01: resolve結果物件{ fp, sha256(小寫), size, attempts, downloaded, leftovers }
        assert.strict.deepStrictEqual(r, { fp, sha256: sha, size: body.length, attempts: 1, downloaded: true, leftovers: [] })
        //R01: 正式檔逐位元相同
        assert.strict.deepStrictEqual(fs.readFileSync(fp).equals(body), true)
        //R04/R10: 暫存檔已清除
        assert.strict.deepStrictEqual(parts(fp), [])
        assert.strict.deepStrictEqual(hits.ok1, 1)
    })

    it(`R01/R03 should accept an upper-case sha256 and a numeric-string size, and resolve the lower-case sha256`, async function() {
        let fp = fpOf('upper')
        let r = await fsDownloadFileVerify(plan('upper', ['ok']), fp, { sha256: sha.toUpperCase(), size: String(body.length) })
        //R03: sha256大小寫正規化; 數值輸入支援字串型數字
        assert.strict.deepStrictEqual([r.sha256, r.size], [sha, body.length])
    })

    it(`R01 should verify by sha256 only when size is not given, with a chunked response`, async function() {
        let fp = fpOf('nosize')
        let r = await fsDownloadFileVerify(plan('nosize', ['nolen']), fp, { sha256: sha })
        assert.strict.deepStrictEqual([r.sha256, r.size, fs.readFileSync(fp).equals(body)], [sha, body.length, true])
        //size為null視同未給(JSDoc)
        let r2 = await fsDownloadFileVerify(url('nosize'), fpOf('nosizenull'), { sha256: sha, size: null })
        assert.strict.deepStrictEqual([r2.sha256, r2.size], [sha, body.length])
    })

    it(`R06 should verify the decoded content of a gzip response whose content-length is the compressed size`, async function() {
        let fp = fpOf('gz')
        let r = await fsDownloadFileVerify(plan('gz', ['gz']), fp, exp)
        //R06: 依content-encoding解碼後之內容驗證; 標頭大小為壓縮後大小, 不得據以判為不符
        assert.strict.deepStrictEqual([r.sha256, r.size, fs.readFileSync(fp).equals(body)], [sha, body.length, true])
    })

    it(`R09 should never expose fpOut while downloading: the temporary file is in the same folder and fpOut appears only after verification`, async function() {
        let fp = fpOf('slowok')
        //下載中之狀態改由事件同步(R-TRACE-01): 伺服器先送一半並扣住後半, 待測試放行; 不以固定等待後檢查
        let g = mkGate('slowokgate', body.length)
        let rec = mkRec()
        let pm = fsDownloadFileVerify(plan('slowokgate', ['gated']), fp, exp, { onTrace: rec.on })
        await guard(g.ready, 'server request')
        g.write(body.subarray(0, 150000))
        await rec.wait((e) => e.type === 'data') //同步點: 標頭已到、暫存檔已建立、本體已有資料寫入, 後半仍被伺服器扣住(下載尚在進行)
        //R04: 下載中之暫存檔在同資料夾; R09: 驗證前正式檔名不存在
        let during = { fp: fs.existsSync(fp), parts: parts(fp).length }
        let types = rec.types()
        g.end(body.subarray(150000))
        let r = await pm
        assert.strict.deepStrictEqual({ during, after: { fp: fs.existsSync(fp), parts: parts(fp).length }, size: r.size }, { during: { fp: false, parts: 1 }, after: { fp: true, parts: 0 }, size: body.length })
        //事件順序: 標頭到達與暫存檔建立先於第一塊資料(此時尚無verify與rename)
        assert.strict.deepStrictEqual([types.indexOf('headers') < types.indexOf('temp'), types.indexOf('temp') < types.indexOf('data'), types.includes('verify'), types.includes('rename')], [true, true, false, false])
    })

    it(`R01 should replace an existing old file on success`, async function() {
        let fp = fpOf('replace')
        fs.writeFileSync(fp, 'old')
        await fsDownloadFileVerify(plan('replace', ['ok']), fp, exp)
        assert.strict.deepStrictEqual(fs.readFileSync(fp).equals(body), true)
    })

    it(`R01 should create missing parent folders`, async function() {
        let fp = `${fdt}/sub/deep/x.bin`
        let r = await fsDownloadFileVerify(plan('deep', ['ok']), fp, exp)
        assert.strict.deepStrictEqual([r.fp, fs.readFileSync(fp).equals(body)], [fp, true])
    })

    //======== 雜湊與大小 ========

    it(`R07 should reject E_HASH_MISMATCH, leave no fpOut and no temporary file, and report expected and actual`, async function() {
        let fp = fpOf('hashbad')
        let err = await catchErr(fsDownloadFileVerify(plan('hashbad', ['bad']), fp, exp, { retryOnMismatch: false }))
        let shaBad = crypto.createHash('sha256').update(bodyBad).digest('hex')
        //R07/R13: code、step、attempts; 預期與實際(物件內為完整值)
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, expected: err.expected, actual: err.actual, url: err.url, fp: err.fp }, { code: 'E_HASH_MISMATCH', step: 'verify', attempts: 1, expected: exp, actual: { sha256: shaBad, size: bodyBad.length }, url: url('hashbad'), fp })
        //R13: 訊息含失敗步驟與截短之預期/實際雜湊(16碼)
        assert.strict.deepStrictEqual([err instanceof Error, err.message.includes('E_HASH_MISMATCH'), err.message.includes('step verify'), err.message.includes(`expected ${sha.slice(0, 16)}...`), err.message.includes(`received ${shaBad.slice(0, 16)}...`), err.message.includes('attempt 1 of 3')], [true, true, true, true, true, true], err.message)
        //R09/R10: 正式檔名不存在, 暫存檔已清除
        assert.strict.deepStrictEqual([fs.existsSync(fp), parts(fp)], [false, []])
        assert.strict.deepStrictEqual(hits.hashbad, 1)
    })

    it(`R07/R11 should retry a hash mismatch and succeed on the next attempt, calling onRetry once`, async function() {
        let fp = fpOf('hashretry')
        let calls = []
        let r = await fsDownloadFileVerify(plan('hashretry', ['bad', 'ok']), fp, exp, {
            retryDelayMs: 10,
            onRetry: (o) => {
                calls.push({ attempt: o.attempt, maxAttempts: o.maxAttempts, delayMs: o.delayMs, code: o.error.code })
            },
        })
        //R11: 雜湊不符可重試; R12: 第n次重試前等待retryDelayMs*n
        assert.strict.deepStrictEqual({ attempts: r.attempts, hits: hits.hashretry, calls, parts: parts(fp) }, { attempts: 2, hits: 2, calls: [{ attempt: 1, maxAttempts: 3, delayMs: 10, code: 'E_HASH_MISMATCH' }], parts: [] })
        assert.strict.deepStrictEqual(fs.readFileSync(fp).equals(body), true)
    })

    it(`R05 should reject E_SIZE_MISMATCH before writing anything when the announced content-length differs from the expected size`, async function() {
        let fp = fpOf('clwrong')
        let nCreate = 0
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                nCreate++
                return fs.createWriteStream(p, o)
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('clwrong', ['ok']), fp, { sha256: sha, size: body.length + 5 }, { fs: fsx, retryOnMismatch: false }))
        //R05: 宣告大小與期望不符即提前中止, 不建立暫存檔
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, actual: err.actual, announces: err.message.includes(`the server announces ${body.length} bytes`), nCreate, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_SIZE_MISMATCH', step: 'verify', actual: { sha256: null, size: body.length }, announces: true, nCreate: 0, fp: false, parts: [] })
    })

    it(`R05 should reject E_SIZE_MISMATCH when the content is shorter than the expected size`, async function() {
        let fp = fpOf('short')
        let err = await catchErr(fsDownloadFileVerify(plan('short', ['short']), fp, exp, { retryOnMismatch: false }))
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, size: err.actual.size, msg: err.message.includes('received 1000 bytes'), fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_SIZE_MISMATCH', step: 'verify', size: 1000, msg: true, fp: false, parts: [] })
    })

    it(`R05 should abort early with E_SIZE_MISMATCH as soon as the content exceeds the expected size`, async function() {
        let fp = fpOf('over')
        let t = Date.now()
        let err = await catchErr(fsDownloadFileVerify(plan('over', ['bigslow']), fp, { sha256: sha, size: 1000 }, { retryOnMismatch: false }))
        let ms = Date.now() - t
        //R05: 內容超量即提前中止(伺服器5秒後才送完, 須遠早於此結束)
        assert.strict.deepStrictEqual({ code: err.code, msg: err.message.includes('received more than that'), early: ms < 3000, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_SIZE_MISMATCH', msg: true, early: true, fp: false, parts: [] }, `ms=${ms}`)
    })

    it(`R11 should not retry a mismatch when opt.retryOnMismatch is false`, async function() {
        let fp = fpOf('noretry')
        let err = await catchErr(fsDownloadFileVerify(plan('noretry', ['bad', 'ok']), fp, exp, { retryOnMismatch: false, retryDelayMs: 10 }))
        assert.strict.deepStrictEqual([err.code, err.attempts, hits.noretry], ['E_HASH_MISMATCH', 1, 1])
    })

    //======== 網路、狀態碼、逾時 ========

    it(`R11 should reject E_HTTP with the status and not retry a 404 (other 4xx)`, async function() {
        let fp = fpOf('s404')
        let err = await catchErr(fsDownloadFileVerify(plan('s404', ['s404', 'ok']), fp, exp, { retryDelayMs: 10 }))
        //R11: 其他4xx不重試
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, status: err.status, attempts: err.attempts, hits: hits.s404, hint: err.message.includes('hint: the file does not exist'), fp: fs.existsSync(fp) }, { code: 'E_HTTP', step: 'request', status: 404, attempts: 1, hits: 1, hint: true, fp: false })
    })

    it(`R11 should not retry a 403`, async function() {
        let err = await catchErr(fsDownloadFileVerify(plan('s403', ['s403', 'ok']), fpOf('s403'), exp, { retryDelayMs: 10 }))
        assert.strict.deepStrictEqual([err.code, err.status, hits.s403], ['E_HTTP', 403, 1])
    })

    for (let s of ['s500', 's408', 's429']) {
        it(`R11 should retry HTTP ${s.slice(1)} and succeed on the next attempt`, async function() {
            let fp = fpOf(s)
            let r = await fsDownloadFileVerify(plan(s, [s, 'ok']), fp, exp, { retryDelayMs: 10 })
            //R11: 5xx、408、429可重試
            assert.strict.deepStrictEqual([r.attempts, hits[s], fs.readFileSync(fp).equals(body)], [2, 2, true])
        })
    }

    it(`R12 should stop after opt.maxAttempts (numeric string accepted) and report the last error`, async function() {
        let err = await catchErr(fsDownloadFileVerify(plan('max2', ['s500']), fpOf('max2'), exp, { maxAttempts: '2', retryDelayMs: 10 }))
        assert.strict.deepStrictEqual([err.code, err.status, err.attempts, hits.max2, err.message.includes('attempt 2 of 2')], ['E_HTTP', 500, 2, 2, true])
    })

    it(`R12 should use the default maxAttempts(3) when opt.maxAttempts is invalid`, async function() {
        let err = await catchErr(fsDownloadFileVerify(plan('maxbad', ['s500']), fpOf('maxbad'), exp, { maxAttempts: 'abc', retryDelayMs: 1 }))
        assert.strict.deepStrictEqual([err.attempts, hits.maxbad], [3, 3])
    })

    it(`R11 should reject E_NETWORK when the connection drops mid-stream, and retry it`, async function() {
        let fp = fpOf('abort')
        let err = await catchErr(fsDownloadFileVerify(plan('abort', ['abort']), fp, exp, { maxAttempts: 1 }))
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_NETWORK', step: 'download', fp: false, parts: [] })
        let fp2 = fpOf('abortretry')
        let r = await fsDownloadFileVerify(plan('abortretry', ['abort', 'ok']), fp2, exp, { retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, hits.abortretry, fs.readFileSync(fp2).equals(body)], [2, 2, true])
    })

    it(`R11 should reject E_NETWORK when the connection is refused`, async function() {
        let fp = fpOf('refused')
        let err = await catchErr(fsDownloadFileVerify('http://127.0.0.1:1/x.bin', fp, exp, { maxAttempts: 1 }))
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, fp: fs.existsSync(fp) }, { code: 'E_NETWORK', step: 'request', fp: false })
    })

    it(`R11/R12 should reject E_TIMEOUT when no data arrives for opt.stallMs during the body`, async function() {
        //停滯門檻(stallMs)本身即規格: 假時鐘下以onTrace事件為同步點(標頭與前100位元組已到)後才推進, 使「停滯」由測試因果決定, 不受負載影響(R-TRACE-01, P5)
        let fp = fpOf('stall')
        await withClock(async (clock) => {
            let rec = mkRec()
            let mem = mkMem(body.length) //記憶體內回應: 標頭與前100位元組後不再送資料(同伺服器stall行為)
            let pm = catchErr(fsDownloadFileVerify(url('stall'), fp, exp, { fetch: mem.fetch, stallMs: 300, maxAttempts: 1, onTrace: rec.on }))
            mem.write(body.subarray(0, 100))
            await rec.wait((e) => e.type === 'data')
            let adv = await advanceUntil(clock, () => rec.has('settle'), 2000)
            let err = await guard(pm, 'settle') //未落定時以防懸置上限失敗(使finally還原假時鐘)
            //R12: 自最後一次收到資料(停滯計時器重設)起恰隔stallMs才判停滯, step為download(標頭已到)
            let to = rec.find('timeout')
            let tc = rec.all('touch').filter((v) => v.i < to.i).pop()
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, fp: fs.existsSync(fp), parts: parts(fp), advanced: adv.ok, from: tc.e.from, gap: to.at - tc.at, kind: to.e.kind, where: to.e.where, ms: to.e.ms }, { code: 'E_TIMEOUT', step: 'download', fp: false, parts: [], advanced: true, from: 'data', gap: 300, kind: 'stall', where: 'request', ms: 300 })
            //中止原因為停滯, 不重試(maxAttempts 1)而結束
            assert.strict.deepStrictEqual([rec.find('abort').e.why, rec.find('stop').e.why, rec.find('settle').e.code], ['E_TIMEOUT', 'max', 'E_TIMEOUT'])
        })
    })

    it(`R12 should not treat a download as stalled while data keeps arriving within opt.stallMs, even if the whole download takes longer`, async function() {
        let fp = fpOf('dripok')
        //每塊資料由測試放行(記憶體內回應, 無計時器): 每塊之後只推進100ms(小於stallMs 400), 全程推進1000ms(大於stallMs)
        await withClock(async (clock) => {
            let rec = mkRec()
            let mem = mkMem(body.length)
            let pm = fsDownloadFileVerify(url('dripok'), fp, exp, { fetch: mem.fetch, stallMs: 400, maxAttempts: 1, onTrace: rec.on })
            let len = Math.ceil(body.length / 10)
            let t0 = Date.now()
            for (let i = 0; i < 10; i++) {
                let end = Math.min((i + 1) * len, body.length)
                mem.write(body.subarray(i * len, end))
                await rec.wait((e) => e.type === 'data' && e.bytes >= end) //同步點: 該塊已收到(停滯計時器隨即重設)
                await clock.advance(100)
            }
            mem.end()
            await advanceUntil(clock, () => rec.has('settle'), 5000, 50)
            let r = await guard(pm, 'settle')
            let elapsed = Date.now() - t0
            //R12: 停滯為「連續」stallMs沒收到資料, 每收到資料即重新計時
            assert.strict.deepStrictEqual([r.attempts, fs.readFileSync(fp).equals(body), elapsed >= 1000, rec.has('timeout'), rec.all('touch', (e) => e.from === 'data').length >= 10], [1, true, true, false, true])
        })
    })

    it(`R11/R12 should reject E_TIMEOUT when the headers do not arrive within opt.stallMs, and retry it`, async function() {
        let fp = fpOf('stallhead')
        //伺服器不回應標頭(stallhead)改以傳入之fetch模擬(永不落定且不響應中止), 並以其呼叫次數代替伺服器端的收到次數: 假時鐘還原後客戶端(undici)重用之閒置連線上, 中止後再送第2個請求會被卡住(與被測碼無關), 故此案不經本機HTTP
        await withClock(async (clock) => {
            let rec = mkRec()
            let nFetch = 0
            let pm = catchErr(fsDownloadFileVerify(url('stallhead'), fp, exp, {
                stallMs: 300,
                maxAttempts: 2,
                retryDelayMs: 10,
                fetch: () => {
                    nFetch++
                    return new Promise(() => {})
                },
                onTrace: rec.on,
            }))
            await rec.wait((e) => e.type === 'request') //同步點: 第1次請求已送出(停滯與整體計時器已設定), 停滯由此起算
            await advanceUntil(clock, () => rec.has('settle'), 2000)
            let err = await guard(pm, 'settle')
            //R11: 停滯可重試; 停滯發生在標頭到達之前(step為request)
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, hits: nFetch }, { code: 'E_TIMEOUT', step: 'request', attempts: 2, hits: 2 })
            //R12: 兩次嘗試皆自請求送出(停滯計時器設定)起恰隔stallMs判停滯, 重試前恰等待retryDelayMs*1
            let tos = rec.all('timeout')
            let touches = rec.all('touch')
            let t1 = touches.filter((v) => v.e.n === 1 && v.i < tos[0].i).pop()
            let t2 = touches.filter((v) => v.e.n === 2 && v.i < tos[1].i).pop()
            assert.strict.deepStrictEqual({ stalls: tos.map((v) => [v.e.n, v.e.kind, v.e.where, v.e.ms]), gap1: tos[0].at - t1.at, gap2: tos[1].at - t2.at, wait: t2.at - tos[0].at, retry: rec.find('retry').e, headers: rec.has('headers') }, { stalls: [[1, 'stall', 'request', 300], [2, 'stall', 'request', 300]], gap1: 300, gap2: 300, wait: 10, retry: { type: 'retry', n: 1, ms: 10 }, headers: false })
        })
    })

    it(`R12 should reject E_TIMEOUT_TOTAL when the whole download exceeds opt.totalMs although data keeps arriving`, async function() {
        let fp = fpOf('drip')
        //每次放行1位元組(由測試放行, 記憶體內回應, 無計時器), 每位元組之後推進50ms; 資料持續到達使停滯(5000)不會觸發, 只有整體時限(600)觸發
        await withClock(async (clock) => {
            let rec = mkRec()
            let mem = mkMem(body.length)
            let pm = catchErr(fsDownloadFileVerify(url('drip'), fp, exp, { fetch: mem.fetch, stallMs: 5000, totalMs: 600, onTrace: rec.on }))
            let sent = 0
            for (let i = 0; i < 60 && !rec.has('timeout'); i++) {
                mem.write(body.subarray(sent, sent + 1))
                sent++
                await rec.wait((e) => e.type === 'data' && e.bytes >= sent)
                await clock.advance(50)
            }
            let adv = await advanceUntil(clock, () => rec.has('settle'), 10000, 50) //整體時限觸發後之清理(關閉寫入端)可能仍需推進虛擬時間
            let err = await guard(pm, `settle (${JSON.stringify(rec.types())})`)
            assert.strict.deepStrictEqual(adv.ok, true)
            //R11: 整體時間用盡不重試
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, hits: mem.calls, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_TIMEOUT_TOTAL', step: 'download', attempts: 1, hits: 1, fp: false, parts: [] })
            //R12: 整體時限計時器自請求送出起算remainMs(不大於totalMs)後觸發, 期間資料持續到達故停滯計時器從未觸發
            let rq = rec.find('request')
            let to = rec.find('timeout')
            let d = to.at - rq.at
            assert.strict.deepStrictEqual({ kind: to.e.kind, where: to.e.where, ms: to.e.ms, remainOk: rq.e.remainMs > 0 && rq.e.remainMs <= 600, gapOk: d >= rq.e.remainMs && d < rq.e.remainMs + 1, onlyOne: rec.all('timeout').length, many: rec.all('data').length >= 5, stop: rec.find('stop').e.why, abort: rec.find('abort').e.why }, { kind: 'total', where: 'request', ms: 600, remainOk: true, gapOk: true, onlyOne: 1, many: true, stop: 'fatal', abort: 'E_TIMEOUT_TOTAL' }, `d=${d} remainMs=${rq.e.remainMs}`)
        })
    })

    it(`R12 should stop retrying when the wait would exceed opt.totalMs`, async function() {
        let err = await catchErr(fsDownloadFileVerify(plan('budget', ['bad', 'ok']), fpOf('budget'), exp, { retryDelayMs: 5000, totalMs: 2000 }))
        assert.strict.deepStrictEqual([err.code, err.attempts, hits.budget, err.message.includes('retry stopped: waiting 5000ms would exceed the total time budget of 2000ms')], ['E_HASH_MISMATCH', 1, 1, true], err.message)
    })

    //======== 期望值函數 ========

    it(`R02 should call the expected function before every attempt and verify against its latest value`, async function() {
        let fp = fpOf('expfn')
        let calls = []
        let r = await fsDownloadFileVerify(plan('expfn', ['ok']), fp, async ({ attempt, signal }) => {
            calls.push({ attempt, signal: signal instanceof AbortSignal })
            //第1次給錯誤之期望值(模擬清單與檔案因快取而不同步), 第2次給正確者
            return attempt === 1 ? { sha256: 'f'.repeat(64), size: body.length } : exp
        }, { retryDelayMs: 10 })
        assert.strict.deepStrictEqual({ attempts: r.attempts, calls, hits: hits.expfn }, { attempts: 2, calls: [{ attempt: 1, signal: true }, { attempt: 2, signal: true }], hits: 2 })
    })

    it(`R02/R11 should retry when the expected function throws an error with retryable true`, async function() {
        let n = 0
        let r = await fsDownloadFileVerify(plan('expretry', ['ok']), fpOf('expretry'), () => {
            n++
            if (n === 1) {
                let e = new Error('manifest temporarily unavailable')
                e.retryable = true
                throw e
            }
            return exp
        }, { retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, n, hits.expretry], [2, 2, 1])
    })

    it(`R02/R11 should reject E_EXPECTED without retrying when the expected function throws without retryable`, async function() {
        let n = 0
        let cause = new Error('manifest is malformed')
        let err = await catchErr(fsDownloadFileVerify(plan('expthrow', ['ok']), fpOf('expthrow'), async () => {
            n++
            throw cause
        }, { retryDelayMs: 10 }))
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, n, hits: hits.expthrow, cause: err.cause.cause === cause, msg: err.message.includes('manifest is malformed') }, { code: 'E_EXPECTED', step: 'expected', attempts: 1, n: 1, hits: 0, cause: true, msg: true })
    })

    it(`R03 should reject E_EXPECTED when the expected function returns an invalid value`, async function() {
        for (let v of [{ sha256: 'xyz' }, { sha256: sha, size: -1 }, { sha256: sha, size: 1.5 }, null, 'abc']) {
            let err = await catchErr(fsDownloadFileVerify(plan('expinvalid', ['ok']), fpOf('expinvalid'), () => v))
            assert.strict.deepStrictEqual([err.code, err.step, err.attempts, hits.expinvalid], ['E_EXPECTED', 'expected', 1, 0], JSON.stringify(v))
        }
    })

    it(`R02/R12 should reject E_TIMEOUT_TOTAL and abort the signal when the expected function never settles`, async function() {
        let sig = null
        let err = await catchErr(fsDownloadFileVerify(plan('exphang', ['ok']), fpOf('exphang'), ({ signal }) => {
            sig = signal
            return new Promise(() => {})
        }, { totalMs: 300 }))
        assert.strict.deepStrictEqual([err.code, err.step, sig.aborted, hits.exphang], ['E_TIMEOUT_TOTAL', 'expected', true, 0])
    })

    //======== 參數 ========

    it(`R03 should reject E_ARG (not throw synchronously) for invalid arguments, without any request`, async function() {
        let revoked = Proxy.revocable({}, {})
        revoked.revoke()
        let fsGetter = { ...fs }
        Object.defineProperty(fsGetter, 'mkdirSync', {
            get() {
                throw new Error('getter exploded')
            },
        })
        let fsNoReal = { ...fs, realpathSync: undefined }
        let fsGetter2 = { ...fs }
        let thrown = Object.defineProperty({}, 'code', {
            get() {
                throw new Error('code getter exploded')
            },
        })
        Object.defineProperty(fsGetter2, 'mkdirSync', {
            get() {
                throw thrown
            },
        })
        let cases = [
            ['not a URL', fpOf('arg'), exp, {}], //使用全域fetch時網址須可解析
            ['ftp://127.0.0.1/x.bin', fpOf('arg'), exp, {}], //使用全域fetch時須為http或https
            [url('arg'), fpOf('arg'), exp, { fs: fsGetter2 }], //所拋值之屬性亦不可讀
            [url('arg'), fpOf('arg'), exp, { fs: fsGetter }], //傳入模組之方法不可讀
            [url('arg'), fpOf('arg'), exp, { fs: fsNoReal }], //缺realpathSync
            ['', fpOf('arg'), exp, {}],
            [url('arg'), '', exp, {}],
            [url('arg'), `${fdt}/folderonly/`, exp, {}],
            [url('arg'), fpOf('arg'), { sha256: 'xyz' }, {}],
            [url('arg'), fpOf('arg'), { sha256: sha.slice(1) }, {}],
            [url('arg'), fpOf('arg'), { sha256: sha, size: -1 }, {}],
            [url('arg'), fpOf('arg'), { sha256: sha, size: 'abc' }, {}],
            [url('arg'), fpOf('arg'), { sha256: sha, size: '9007199254740993' }, {}], //超過安全整數之字串, 轉數字後失真, 不得接受
            [url('arg'), fpOf('arg'), { sha256: sha, size: 2 ** 53 }, {}],
            [url('arg'), `${fdt}/.`, exp, {}], //檔名為'.'或'..'非檔案路徑
            [url('arg'), `${fdt}/..`, exp, {}],
            [`http://user:secret@127.0.0.1:${port}/arg`, fpOf('arg'), exp, {}], //使用全域fetch時網址不得帶帳密
            [url('arg'), fpOf('arg'), null, {}],
            [url('arg'), fpOf('arg'), undefined, {}],
            [url('arg'), fpOf('arg'), exp, revoked.proxy],
        ]
        hits.arg = 0
        let rs = []
        for (let c of cases) {
            let pm = null
            let sync = null
            try {
                pm = fsDownloadFileVerify(...c)
            }
            catch (err) {
                sync = err
            }
            let err = await catchErr(pm)
            rs.push([sync, err.code, err.step, err.attempts])
        }
        assert.strict.deepStrictEqual(rs, cases.map(() => [null, 'E_ARG', 'argument', 0]))
        assert.strict.deepStrictEqual(hits.arg, 0)
    })

    it(`R15 should reject E_ARG when fsDownloadFileVerifyCore is called without an injected fs`, async function() {
        let err = await catchErr(fsDownloadFileVerifyCore(url('arg'), fpOf('arg'), exp, {}))
        assert.strict.deepStrictEqual([err.code, err.message.includes('opt.fs')], ['E_ARG', true])
    })

    it(`R15 should use opt.fetch, and the global fetch read at call time when opt.fetch is not given`, async function() {
        let n = 0
        let r = await fsDownloadFileVerify(plan('fetchopt', ['ok']), fpOf('fetchopt'), exp, {
            fetch: (u, init) => {
                n++
                assert.strict.deepStrictEqual(init.signal instanceof AbortSignal, true)
                return fetch(u, init)
            },
        })
        let m = 0
        let fetchOrig = globalThis.fetch
        globalThis.fetch = (u, init) => {
            m++
            return fetchOrig(u, init)
        }
        try {
            await fsDownloadFileVerify(plan('fetchglobal', ['ok']), fpOf('fetchglobal'), exp)
        }
        finally {
            globalThis.fetch = fetchOrig
        }
        assert.strict.deepStrictEqual([r.attempts, n, m], [1, 1, 1])
    })

    it(`R15 should work through fsDownloadFileVerifyCore with injected modules`, async function() {
        let fp = fpOf('core')
        let r = await fsDownloadFileVerifyCore(plan('core', ['ok']), fp, exp, { fs, crypto, Readable, pipeline })
        assert.strict.deepStrictEqual([r.sha256, fs.readFileSync(fp).equals(body)], [sha, true])
    })

    //======== 檔案系統: 舊檔、更名、暫存檔 ========

    it(`R09 should leave an existing old file untouched on the listed failure paths (hash, 404, abort, short, over)`, async function() {
        let rs = []
        for (let [k, a, o] of [['oldbad', 'bad', { retryOnMismatch: false }], ['old404', 's404', {}], ['oldabort', 'abort', { maxAttempts: 1 }], ['oldshort', 'short', { retryOnMismatch: false }], ['oldover', 'bigslow', { retryOnMismatch: false }]]) {
            let fp = fpOf(k)
            fs.writeFileSync(fp, 'old')
            let e = k === 'oldover' ? { sha256: sha, size: 1000 } : exp
            let err = await catchErr(fsDownloadFileVerify(plan(k, [a]), fp, e, o))
            rs.push([k, err !== null, fs.readFileSync(fp, 'utf8'), parts(fp), err.message.includes(`note: file[${fp}] was not modified by this call`)])
        }
        assert.strict.deepStrictEqual(rs, [
            ['oldbad', true, 'old', [], true],
            ['old404', true, 'old', [], true],
            ['oldabort', true, 'old', [], true],
            ['oldshort', true, 'old', [], true],
            ['oldover', true, 'old', [], true],
        ])
    })

    it(`R08 should retry a busy rename (EBUSY) and succeed`, async function() {
        let fp = fpOf('renbusy')
        let n = 0
        let fsx = mkFs({
            renameSync: (a, b) => {
                n++
                if (n <= 2) {
                    throw busy('EBUSY')
                }
                return fs.renameSync(a, b)
            },
        })
        let r = await fsDownloadFileVerify(plan('renbusy', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, n, fs.readFileSync(fp).equals(body), parts(fp)], [1, 3, true, []])
    })

    it(`R08/R09 should reject E_RENAME after bounded retries, keep the old file and remove the temporary file`, async function() {
        let fp = fpOf('renfail')
        fs.writeFileSync(fp, 'old')
        let n = 0
        let fsx = mkFs({
            renameSync: () => {
                n++
                throw busy('EPERM')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('renfail', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 10 }))
        //R08: 有界重試(5次); 更名失敗不重試整個下載
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, n, hits: hits.renfail, old: fs.readFileSync(fp, 'utf8'), parts: parts(fp), hint: err.message.includes('locked by antivirus') }, { code: 'E_RENAME', step: 'rename', attempts: 1, n: 5, hits: 1, old: 'old', parts: [], hint: true })
    })

    it(`R08 should not retry a rename failing with a non-busy code`, async function() {
        let n = 0
        let fsx = mkFs({
            renameSync: () => {
                n++
                throw busy('EXDEV')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('renxdev', ['ok']), fpOf('renxdev'), exp, { fs: fsx, retryDelayMs: 10 }))
        assert.strict.deepStrictEqual([err.code, n], ['E_RENAME', 1])
    })

    it(`R08 should succeed when the rename fails but fpOut already has the expected content`, async function() {
        let fp = fpOf('rendone')
        fs.writeFileSync(fp, body)
        let n = 0
        let fsx = mkFs({
            renameSync: () => {
                n++
                throw busy('EPERM')
            },
        })
        let r = await fsDownloadFileVerify(plan('rendone', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, n, parts(fp)], [1, 1, []])
    })

    it(`R08 should not treat fpOut with different content as done when the rename fails`, async function() {
        let fp = fpOf('renother')
        fs.writeFileSync(fp, bodyBad)
        let fsx = mkFs({
            renameSync: () => {
                throw busy('EPERM')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('renother', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 1 }))
        assert.strict.deepStrictEqual([err.code, fs.readFileSync(fp).equals(bodyBad)], ['E_RENAME', true])
    })

    it(`R10 should report a temporary file that can not be removed, and not claim it was removed`, async function() {
        let fp = fpOf('leftover')
        let n = 0
        let fsx = mkFs({
            unlinkSync: (p) => {
                if (String(p).endsWith('.part')) {
                    n++
                    throw busy('EPERM')
                }
                return fs.unlinkSync(p)
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('leftover', ['bad']), fp, exp, { fs: fsx, retryOnMismatch: false, retryDelayMs: 1 }))
        let left = parts(fp)
        //R10: 錯誤物件帶清除失敗之資訊; 檔案確實仍在(如實回報)
        assert.strict.deepStrictEqual({ code: err.code, n, left: left.length, leftovers: err.leftovers.length, sameFp: path.basename(err.leftovers[0].fp) === left[0], cleanup: err.cleanupError.code, msg: err.message.includes(`note: the temporary file "${err.leftovers[0].fp}" could not be removed`), fp: fs.existsSync(fp) }, { code: 'E_HASH_MISMATCH', n: 3, left: 1, leftovers: 1, sameFp: true, cleanup: 'EPERM', msg: true, fp: false })
        fs.unlinkSync(err.leftovers[0].fp)
    })

    it(`R10 should resolve with leftovers when an earlier attempt's temporary file can not be removed but a later attempt succeeds`, async function() {
        let fp = fpOf('leftok')
        let first = null
        let fsx = mkFs({
            unlinkSync: (p) => {
                if (String(p).endsWith('.part') && (first === null || first === p)) {
                    first = p
                    throw busy('EBUSY')
                }
                return fs.unlinkSync(p)
            },
        })
        let r = await fsDownloadFileVerify(plan('leftok', ['bad', 'ok']), fp, exp, { fs: fsx, retryDelayMs: 1 })
        assert.strict.deepStrictEqual({ attempts: r.attempts, leftovers: r.leftovers.map((v) => [v.fp, v.error.code]), exists: fs.existsSync(first), ok: fs.readFileSync(fp).equals(body) }, { attempts: 2, leftovers: [[first, 'EBUSY']], exists: true, ok: true })
        fs.unlinkSync(first)
    })

    it(`R04 should not remove a same-named temporary file that does not belong to this call`, async function() {
        let fp = fpOf('collide')
        let foreign = null
        let nUnlink = 0
        let fsx = mkFs({
            openSync: (p, flags) => {
                //模擬他方於建立前一刻建立同名檔
                foreign = p
                fs.writeFileSync(p, 'foreign')
                return fs.openSync(p, flags)
            },
            unlinkSync: (p) => {
                nUnlink++
                return fs.unlinkSync(p)
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('collide', ['ok']), fp, exp, { fs: fsx }))
        //R04: 排他建立; 同名檔不屬於本次, 不刪
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, foreign: fs.readFileSync(foreign, 'utf8'), nUnlink, msg: err.message.includes('already exists and does not belong to this call'), fp: fs.existsSync(fp) }, { code: 'E_FS', step: 'download', attempts: 1, foreign: 'foreign', nUnlink: 0, msg: true, fp: false })
        fs.unlinkSync(foreign)
    })

    it(`R04/R11 should reject E_FS without retrying and without removing anything when the exclusive open fails (not EEXIST)`, async function() {
        let fp = fpOf('openfail')
        let nUnlink = 0
        let fsx = mkFs({
            openSync: () => {
                throw busy('EACCES')
            },
            unlinkSync: (p) => {
                nUnlink++
                return fs.unlinkSync(p)
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('openfail', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 1 }))
        //開檔失敗之暫存名非本次建立, 不依名稱刪除
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, hits: hits.openfail, nUnlink, leftovers: err.leftovers, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_FS', step: 'download', attempts: 1, hits: 1, nUnlink: 0, leftovers: [], fp: false, parts: [] })
    })

    for (let code of ['ENOSPC', 'EEXIST']) {
        it(`R10/R11 should reject E_FS without retrying, and remove its own temporary file, when a write fails after the open (${code}, error without syscall)`, async function() {
            let k = `writefail${code}`
            let fp = fpOf(k)
            let fsx = mkFs({
                createWriteStream: (p, o) => {
                    //已開啟之暫存檔於寫入時失敗, 錯誤不帶syscall; 錯誤碼為EEXIST者亦不得被當成「非本次之檔」
                    return fs.createWriteStream(p, {
                        ...o,
                        fs: {
                            open: fs.open,
                            close: fs.close,
                            write: (fd, buf, off, len, pos, cb) => {
                                let e = new Error(`${code}: write failed (supplied)`)
                                e.code = code
                                cb(e)
                            },
                        },
                    })
                },
            })
            let err = await catchErr(fsDownloadFileVerify(plan(k, ['ok']), fp, exp, { fs: fsx, retryDelayMs: 1 }))
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, hits: hits[k], msg: err.message.includes(code), leftovers: err.leftovers, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_FS', step: 'download', attempts: 1, hits: 1, msg: true, leftovers: [], fp: false, parts: [] })
        })
    }

    it(`R10/R11 should report that closing the descriptor failed when creating the write stream throws`, async function() {
        let fsx = mkFs({
            createWriteStream: () => {
                throw new Error('supplied create failure')
            },
            closeSync: (fd) => {
                fs.closeSync(fd)
                throw busy('EIO')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('closefail', ['ok']), fpOf('closefail'), exp, { fs: fsx }))
        assert.strict.deepStrictEqual([err.code, err.message.includes('closing its descriptor also failed')], ['E_FS', true])
    })

    it(`R11 should classify a disk error while reading back the temporary file as E_FS (not a stall), without retrying`, async function() {
        let fp = fpOf('readback')
        //假時鐘下: 下載階段(本機真實I/O)不推進時間故不會有假停滯; 待事件確認本體已讀完並校驗、重讀已開始, 才推進超過stallMs(50)至磁碟錯誤(150)
        await withClock(async (clock) => {
            let rec = mkRec()
            let started = null
            let pmStarted = new Promise((resolve) => {
                started = resolve
            })
            let fsx = mkFs({
                createReadStream: (p, o) => {
                    if (!String(p).endsWith('.part')) {
                        return fs.createReadStream(p, o)
                    }
                    //重讀暫存檔時, 超過stallMs後才回報磁碟錯誤
                    let once = false
                    return new Readable({
                        read() {
                            if (!once) {
                                once = true
                                started()
                                setTimeout(() => {
                                    this.destroy(busy('EIO'))
                                }, 150)
                            }
                        },
                    })
                },
            })
            let nFetch = 0
            let fnFetch = async () => {
                nFetch++
                return new Response(body)
            }
            let pm = catchErr(fsDownloadFileVerify(url('readback'), fp, exp, { fs: fsx, fetch: fnFetch, stallMs: 50, maxAttempts: 2, retryDelayMs: 1, onTrace: rec.on }))
            await rec.wait((e) => e.type === 'verify' && e.phase === 'stream') //同步點: 本體已讀完並校驗(下載階段結束)
            await guard(pmStarted, 'readback started') //重讀已開始(其150ms計時器已設定)
            let adv = await advanceUntil(clock, () => rec.has('settle'), 1000)
            let err = await guard(pm, 'settle')
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, attempts: err.attempts, hits: nFetch, fp: fs.existsSync(fp), parts: parts(fp), advanced: adv.ok }, { code: 'E_FS', step: 'verify', attempts: 1, hits: 1, fp: false, parts: [], advanced: true })
            //重讀不受停滯計時器約束(下載階段結束即停止計時): 推進超過stallMs(50)仍無停滯, 磁碟錯誤於重讀開始後恰150ms出現
            let v = rec.find('verify', (e) => e.phase === 'stream')
            assert.strict.deepStrictEqual({ stall: rec.has('timeout'), abort: rec.all('abort').map((x) => x.e.why), stop: rec.find('stop').e, gap: rec.find('settle').at - v.at }, { stall: false, abort: ['close'], stop: { type: 'stop', n: 1, why: 'fatal', code: 'E_FS' }, gap: 150 })
        })
    })

    it(`R11 should reject E_FS, close the opened descriptor and remove its own temporary file when creating the write stream throws synchronously`, async function() {
        let fp = fpOf('createthrow')
        let fdOpened = null
        let fdsClosed = []
        let fsx = mkFs({
            openSync: (p, flags) => {
                fdOpened = fs.openSync(p, flags)
                return fdOpened
            },
            closeSync: (fd) => {
                fdsClosed.push(fd)
                return fs.closeSync(fd)
            },
            createWriteStream: () => {
                throw new Error('supplied create failure')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('createthrow', ['ok']), fp, exp, { fs: fsx }))
        //不殘留資源: 已開啟之暫存檔描述子須關閉
        assert.strict.deepStrictEqual([err.code, err.step, err.attempts, err.leftovers, parts(fp), fdsClosed.includes(fdOpened)], ['E_FS', 'download', 1, [], [], true])
    })

    it(`R09 should not rename when the temporary file is changed on disk after it was written`, async function() {
        let fp = fpOf('tempchanged')
        fs.writeFileSync(fp, 'old')
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                let ws = fs.createWriteStream(p, o)
                ws.on('close', () => {
                    fs.writeFileSync(p, 'UNVERIFIED') //寫入完成後、更名前暫存檔被改動
                })
                return ws
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('tempchanged', ['ok']), fp, exp, { fs: fsx, retryOnMismatch: false }))
        //R09: 正式檔名只以驗證通過之內容更名寫入
        assert.strict.deepStrictEqual({ code: err.code, step: err.step, msg: err.message.includes('changed after it was written'), old: fs.readFileSync(fp, 'utf8'), parts: parts(fp) }, { code: 'E_HASH_MISMATCH', step: 'verify', msg: true, old: 'old', parts: [] })
    })

    it(`R04/R10 should not touch the old temporary name after a successful rename`, async function() {
        let fp = fpOf('renamedthen')
        let tempName = null
        let nUnlink = 0
        let fsx = mkFs({
            renameSync: (a, b) => {
                fs.renameSync(a, b)
                tempName = a
                fs.writeFileSync(a, 'FOREIGN') //更名後他方立即以同名建立檔
            },
            unlinkSync: (p) => {
                nUnlink++
                throw busy('EPERM')
            },
        })
        let r = await fsDownloadFileVerify(plan('renamedthen', ['ok']), fp, exp, { fs: fsx })
        assert.strict.deepStrictEqual({ attempts: r.attempts, leftovers: r.leftovers, nUnlink, foreign: fs.readFileSync(tempName, 'utf8'), ok: fs.readFileSync(fp).equals(body) }, { attempts: 1, leftovers: [], nUnlink: 0, foreign: 'FOREIGN', ok: true })
        fs.unlinkSync(tempName)
    })

    it(`R11 should reject E_FS (step prepare, attempts 0) when the folder of fpOut can not be created`, async function() {
        fs.writeFileSync(`${fdt}/afile`, 'x')
        let err = await catchErr(fsDownloadFileVerify(plan('mkdirfail', ['ok']), `${fdt}/afile/x.bin`, exp))
        assert.strict.deepStrictEqual([err.code, err.step, err.attempts, hits.mkdirfail], ['E_FS', 'prepare', 0, 0])
    })

    it(`R01 should skip the download when opt.useSkipIfMatch is true and fpOut already has the expected content`, async function() {
        let fp = fpOf('skip')
        fs.writeFileSync(fp, body)
        let r = await fsDownloadFileVerify(plan('skip', ['ok']), fp, exp, { useSkipIfMatch: true })
        assert.strict.deepStrictEqual({ r, hits: hits.skip }, { r: { fp, sha256: sha, size: body.length, attempts: 1, downloaded: false, leftovers: [] }, hits: 0 })
        fs.writeFileSync(fp, bodyBad)
        let r2 = await fsDownloadFileVerify(url('skip'), fp, exp, { useSkipIfMatch: true })
        assert.strict.deepStrictEqual([r2.downloaded, hits.skip, fs.readFileSync(fp).equals(body)], [true, 1, true])
    })

    //======== 併發 ========

    it(`R14 should share one download among concurrent calls for the same fpOut, url and expected value`, async function() {
        let fp = fpOf('share')
        let u = plan('share', ['slowok'])
        let calls = [
            fsDownloadFileVerify(u, fp, exp),
            fsDownloadFileVerify(u, `${fdt}/./share.bin`, { sha256: sha.toUpperCase(), size: body.length }),
        ]
        if (process.platform === 'win32') {
            calls.push(fsDownloadFileVerify(u, `${fdt}/SHARE.bin`, exp))
        }
        let rs = await Promise.all(calls)
        //R14: 共用同一次下載(伺服器只收到一次請求), 共用者收到同一個結果物件
        assert.strict.deepStrictEqual([hits.share, rs.every((r) => r === rs[0]), rs[0].attempts], [1, true, 1])
        //結束後不再共用, 再次呼叫重新下載
        await fsDownloadFileVerify(u, fp, exp)
        assert.strict.deepStrictEqual(hits.share, 2)
    })

    it(`R14 should share one failure among concurrent calls`, async function() {
        let u = plan('sharefail', ['s404'])
        let es = await Promise.all([catchErr(fsDownloadFileVerify(u, fpOf('sharefail'), exp)), catchErr(fsDownloadFileVerify(u, fpOf('sharefail'), exp))])
        assert.strict.deepStrictEqual([hits.sharefail, es[0] === es[1], es[0].code], [1, true, 'E_HTTP'])
    })

    it(`R14 should download separately when opt.useShare is false`, async function() {
        let fp = fpOf('noshare')
        let u = plan('noshare', ['slowok'])
        let rs = await Promise.all([fsDownloadFileVerify(u, fp, exp, { useShare: false }), fsDownloadFileVerify(u, fp, exp, { useShare: false })])
        assert.strict.deepStrictEqual([hits.noshare, rs[0] === rs[1], fs.readFileSync(fp).equals(body), parts(fp)], [2, false, true, []])
    })

    it(`R14 should not share between concurrent calls with different expected values`, async function() {
        let fp = fpOf('sharediff')
        let u = plan('sharediff', ['slowok'])
        let rs = await Promise.all([
            catchErr(fsDownloadFileVerify(u, fp, exp)),
            catchErr(fsDownloadFileVerify(u, fp, { sha256: 'a'.repeat(64), size: body.length }, { retryOnMismatch: false })),
        ])
        //不同期望值各自下載: 一成功一失敗, 正式檔為通過驗證者
        assert.strict.deepStrictEqual([hits.sharediff, rs[0], rs[1].code, fs.readFileSync(fp).equals(body)], [2, null, 'E_HASH_MISMATCH', true])
    })

    it(`R14 should bound a joining call by its own opt.totalMs while the shared download continues`, async function() {
        let fp = fpOf('jointo')
        //假時鐘下: 共用之下載由測試扣住(伺服器端不用計時器), 共用者之totalMs(100)以虛擬時間精確斷言, 不用牆鐘門檻
        await withClock(async (clock) => {
            let mem = mkMem(body.length)
            let u = url('jointo')
            let rec1 = mkRec()
            let rec2 = mkRec()
            let p1 = fsDownloadFileVerify(u, fp, exp, { fetch: mem.fetch, onTrace: rec1.on })
            mem.write(body.subarray(0, 150000))
            await rec1.wait((e) => e.type === 'data') //同步點: 共用之下載已在進行
            let done2 = false
            let p2 = catchErr(fsDownloadFileVerify(u, fp, exp, { fetch: mem.fetch, totalMs: 100, onTrace: rec2.on })).then((v) => {
                done2 = true
                return v
            })
            await rec2.wait((e) => e.type === 'share')
            await clock.advance(99)
            let before = done2 //尚未到共用者之totalMs
            await clock.advance(1)
            let e2 = await guard(p2, 'joiner settle')
            let after = done2
            mem.write(body.subarray(150000)) //共用之下載續行(未被共用者之逾時中止), 放行後半
            mem.end()
            await advanceUntil(clock, () => rec1.has('settle'), 5000, 50)
            let r1 = await guard(p1, 'shared settle')
            //共用者以各自之totalMs為等待上限; 共用之下載續行, 訊息不得稱正式檔未被改動
            assert.strict.deepStrictEqual({ code: e2.code, step: e2.step, attempts: e2.attempts, before, after, r1: r1.attempts, hits: mem.calls, note: e2.message.includes('may replace') && !e2.message.includes('was not modified') }, { code: 'E_TIMEOUT_TOTAL', step: 'share', attempts: 0, before: false, after: true, r1: 1, hits: 1, note: true })
            //事件: 共用者加入而不下載; 其逾時恰於加入後100ms(虛擬時間); 共用之下載未受影響
            let sh = rec2.find('share')
            let to = rec2.find('timeout')
            assert.strict.deepStrictEqual({ share1: rec1.find('share').e.act, share2: sh.e.act, kind: to.e.kind, where: to.e.where, ms: to.e.ms, gap: to.at - sh.at, attempts2: rec2.has('attempt'), settle2: rec2.find('settle').e, settle1: rec1.find('settle').e }, { share1: 'own', share2: 'join', kind: 'total', where: 'share', ms: 100, gap: 100, attempts2: false, settle2: { type: 'settle', ok: false, code: 'E_TIMEOUT_TOTAL', attempts: 0 }, settle1: { type: 'settle', ok: true, code: null, attempts: 1 } })
        })
    })

    for (let [k, o] of [['shareopt1', { retryOnMismatch: false }], ['shareopt2', { maxAttempts: 2 }], ['shareopt3', { useSkipIfMatch: true }]]) {
        it(`R14 should not share between concurrent calls whose options differ (${JSON.stringify(o)})`, async function() {
            let fp = fpOf(k)
            let u = plan(k, ['slowok'])
            await Promise.all([fsDownloadFileVerify(u, fp, exp), fsDownloadFileVerify(u, fp, exp, o)])
            assert.strict.deepStrictEqual(hits[k], 2)
        })
    }

    it(`R14 should not share between Core calls given different modules (pipeline)`, async function() {
        let fp = fpOf('sharemod')
        let u = plan('sharemod', ['slowok'])
        let pipeline2 = (...args) => {
            return pipeline(...args)
        }
        await Promise.all([
            fsDownloadFileVerifyCore(u, fp, exp, { fs, crypto, Readable, pipeline }),
            fsDownloadFileVerifyCore(u, fp, exp, { fs, crypto, Readable, pipeline: pipeline2 }),
        ])
        assert.strict.deepStrictEqual(hits.sharemod, 2)
    })

    it(`R14 should let identical calls share even when another job with a different expected value is in progress (A, B, B)`, async function() {
        let fp = fpOf('abb')
        let u = plan('abb', ['slowok'])
        let bExp = { sha256: 'a'.repeat(64), size: body.length }
        let rs = await Promise.all([
            catchErr(fsDownloadFileVerify(u, fp, exp)),
            catchErr(fsDownloadFileVerify(u, fp, bExp, { retryOnMismatch: false })),
            catchErr(fsDownloadFileVerify(u, fp, bExp, { retryOnMismatch: false })),
        ])
        assert.strict.deepStrictEqual([hits.abb, rs[0], rs[1].code, rs[1] === rs[2], fs.readFileSync(fp).equals(body)], [2, null, 'E_HASH_MISMATCH', true, true])
    })

    //======== 有界等待(不響應中止之傳入元件) ========

    it(`R12 should settle with E_TIMEOUT when the supplied fetch never settles and ignores the signal`, async function() {
        let t = Date.now()
        let err = await catchErr(fsDownloadFileVerify(url('nofetch'), fpOf('nofetch'), exp, {
            stallMs: 100,
            maxAttempts: 1,
            fetch: () => {
                return new Promise(() => {})
            },
        }))
        let ms = Date.now() - t
        assert.strict.deepStrictEqual([err.code, err.step, ms < 2000], ['E_TIMEOUT', 'request', true], `ms=${ms}`)
    })

    it(`R12 should cancel the body of a response that arrives after the call gave up waiting`, async function() {
        let cancelled = 0
        let err = await catchErr(fsDownloadFileVerify(url('latefetch'), fpOf('latefetch'), exp, {
            stallMs: 50,
            maxAttempts: 1,
            fetch: () => {
                //不響應中止, 於放棄等待後才回應
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(new Response(new ReadableStream({
                            pull() {},
                            cancel() {
                                cancelled++
                            },
                        })))
                    }, 150)
                })
            },
        }))
        await new Promise((resolve) => {
            setTimeout(resolve, 300)
        })
        assert.strict.deepStrictEqual([err.code, cancelled], ['E_TIMEOUT', 1])
    })

    it(`R12 should not wait for body.cancel() when rejecting E_HTTP or an announced size mismatch`, async function() {
        let hang = { cancel: () => new Promise(() => {}) }
        let t = Date.now()
        let e1 = await catchErr(fsDownloadFileVerify(url('cancel404'), fpOf('cancel404'), exp, {
            totalMs: 5000,
            fetch: async () => {
                return { ok: false, status: 404, statusText: 'Not Found', headers: new Headers(), body: hang }
            },
        }))
        let e2 = await catchErr(fsDownloadFileVerify(url('cancellen'), fpOf('cancellen'), exp, {
            totalMs: 5000,
            retryOnMismatch: false,
            fetch: async () => {
                return { ok: true, status: 200, statusText: 'OK', headers: new Headers({ 'content-length': '5' }), body: hang }
            },
        }))
        let ms = Date.now() - t
        assert.strict.deepStrictEqual([e1.code, e1.status, e2.code, ms < 2000], ['E_HTTP', 404, 'E_SIZE_MISMATCH', true], `ms=${ms}`)
    })

    it(`R12 should settle with E_TIMEOUT when the write stream never completes a write`, async function() {
        let fp = fpOf('stuckws')
        //停滯門檻本身即規格: 假時鐘下以onTrace事件為同步點(標頭與第一塊資料已到, 寫入端不回呼)後才推進
        await withClock(async (clock) => {
            let rec = mkRec()
            let fsx = mkFs({
                createWriteStream: (p, o) => {
                    return new Writable({
                        write(chunk, enc, cb) {
                            //永不回呼
                        },
                        destroy(err, cb) {
                            try {
                                fs.closeSync(o.fd)
                            }
                            catch (e) {}
                            cb(err)
                        },
                    })
                },
            })
            let pm = catchErr(fsDownloadFileVerify(url('stuckws'), fp, exp, { fs: fsx, fetch: async () => new Response(body), stallMs: 200, maxAttempts: 1, onTrace: rec.on }))
            await rec.wait((e) => e.type === 'data')
            let adv = await advanceUntil(clock, () => rec.has('settle'), 2000)
            let err = await guard(pm, 'settle')
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, advanced: adv.ok, fp: fs.existsSync(fp), parts: parts(fp) }, { code: 'E_TIMEOUT', step: 'download', advanced: true, fp: false, parts: [] })
            //自最後一次收到資料(停滯計時器重設)起恰隔stallMs判停滯, 寫入端關閉後即落定(不等5秒)
            let to = rec.find('timeout')
            let tc = rec.all('touch').filter((v) => v.i < to.i).pop()
            assert.strict.deepStrictEqual({ kind: to.e.kind, from: tc.e.from, gap: to.at - tc.at, settleAt: rec.find('settle').at - to.at }, { kind: 'stall', from: 'data', gap: 200, settleAt: 0 })
        })
    })

    it(`R12 should settle with E_TIMEOUT when the write stream neither completes a write nor finishes its destroy`, async function() {
        let fp = fpOf('stuckws2')
        //停滯門檻與「等待寫入端關閉至多5秒」皆為時間規格: 假時鐘下以onTrace事件為同步點(標頭與第一塊資料已到)後才推進
        await withClock(async (clock) => {
            let rec = mkRec()
            let fsx = mkFs({
                createWriteStream: (p, o) => {
                    return new Writable({
                        write(chunk, enc, cb) {
                            //永不回呼
                        },
                        destroy(e0, cb) {
                            try {
                                fs.closeSync(o.fd)
                            }
                            catch (e) {}
                            //永不回呼, 串流不會關閉
                        },
                    })
                },
            })
            let pm = catchErr(fsDownloadFileVerify(url('stuckws2'), fp, exp, { fs: fsx, fetch: async () => new Response(body), stallMs: 200, maxAttempts: 1, onTrace: rec.on }))
            await rec.wait((e) => e.type === 'data')
            let adv = await advanceUntil(clock, () => rec.has('settle'), 8000)
            let err = await guard(pm, 'settle')
            //等待寫入端關閉至多5秒後放棄, 呼叫仍落定
            assert.strict.deepStrictEqual({ code: err.code, step: err.step, advanced: adv.ok, fp: fs.existsSync(fp) }, { code: 'E_TIMEOUT', step: 'download', advanced: true, fp: false })
            //停滯觸發(停滯計時器重設後恰隔stallMs)後, 恰再等5000ms才放棄等待關閉並落定
            let to = rec.find('timeout')
            let tc = rec.all('touch').filter((v) => v.i < to.i).pop()
            assert.strict.deepStrictEqual({ gap: to.at - tc.at, wait: rec.find('settle').at - to.at }, { gap: 200, wait: 5000 })
        })
    })

    it(`R12 should bound the check of an existing fpOut (opt.useSkipIfMatch) by opt.totalMs`, async function() {
        let fp = fpOf('skipstuck')
        fs.writeFileSync(fp, body)
        let t = Date.now()
        let fsx = mkFs({
            createReadStream: () => {
                return new Readable({ read() {} }) //永不送出資料
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('skipstuck', ['ok']), fp, exp, { fs: fsx, useSkipIfMatch: true, totalMs: 300 }))
        let ms = Date.now() - t
        assert.strict.deepStrictEqual([err.code, ms < 3000, fs.readFileSync(fp).equals(body)], ['E_TIMEOUT_TOTAL', true, true], `ms=${ms}`)
    })

    it(`R08/R12 should bound the comparison of fpOut after a failed rename by opt.stallMs`, async function() {
        let fp = fpOf('renstuck')
        fs.writeFileSync(fp, bodyBad) //與期望同大小, 須讀內容才能判定
        //比對讀取之上限(stallMs)為時間規格: 假時鐘下下載階段(本機真實I/O)不推進時間故無假停滯; 待事件確認已下載並重讀暫存檔完成才推進
        await withClock(async (clock) => {
            let rec = mkRec()
            let fsx = mkFs({
                renameSync: () => {
                    throw busy('EPERM')
                },
                createReadStream: (p, o) => {
                    if (String(p).endsWith('.part')) {
                        return fs.createReadStream(p, o)
                    }
                    return new Readable({ read() {} }) //讀正式檔永不送出資料
                },
            })
            let pm = catchErr(fsDownloadFileVerify(url('renstuck'), fp, exp, { fs: fsx, fetch: async () => new Response(body), stallMs: 150, retryDelayMs: 1, onTrace: rec.on }))
            await rec.wait((e) => e.type === 'rename') //同步點: 已下載、校驗並重讀暫存檔, 第1次更名失敗, 其後比對fpOut內容(永不送出資料)
            let adv = await advanceUntil(clock, () => rec.has('settle'), 5000)
            let err = await guard(pm, 'settle')
            assert.strict.deepStrictEqual([err.code, adv.ok, fs.readFileSync(fp).equals(bodyBad), parts(fp)], ['E_RENAME', true, true, []])
            //每次比對fpOut之讀取至多stallMs(150)就放棄(不是等讀完): 第i次更名失敗到第i+1次之間恰為150 + i(重試間隔retryDelayMs*i)毫秒
            let rs = rec.all('rename')
            let tos = rec.all('timeout')
            assert.strict.deepStrictEqual({ renames: rs.map((v) => [v.e.i, v.e.ok]), gaps: rs.slice(1).map((v, k) => v.at - rs[k].at), reads: tos.map((v) => [v.e.kind, v.e.where, v.e.ms]), last: rec.find('settle').at - rs[4].at }, { renames: [[1, false], [2, false], [3, false], [4, false], [5, false]], gaps: [151, 152, 153, 154], reads: [['total', 'read', 150], ['total', 'read', 150], ['total', 'read', 150], ['total', 'read', 150], ['total', 'read', 150]], last: 150 })
        })
    })

    it(`R12 should abort the request (close the connection) when a failure happens after the headers and before the body is consumed`, async function() {
        let k = 'abortearly'
        let fsx = mkFs({
            createWriteStream: () => {
                throw new Error('supplied create failure')
            },
        })
        //伺服器扣住本體不結束(hang): 其端的連線只可能因對方(本函數)中止而close, 以伺服器端close事件(ended為false)為同步點, 不以固定等待後檢查時刻
        let rec = mkRec()
        let cl = watchClose(k)
        let err = await catchErr(fsDownloadFileVerify(plan(k, ['hang']), fpOf(k), exp, { fs: fsx, onTrace: rec.on }))
        let closed = await guard(cl, 'server close')
        //連線於失敗後被關閉(伺服器端未自行結束回應, 是被中止), 且本函數已通知中止
        let ab = rec.find('abort')
        assert.strict.deepStrictEqual([err.code, closed.ended, ab.e, ab.i < rec.find('settle').i], ['E_FS', false, { type: 'abort', n: 1, why: 'close' }, true])
    })

    it(`R12 should abort the request (close the connection) when handling the response throws before the body is handed over`, async function() {
        let k = 'abortheaders'
        //伺服器扣住本體不結束(hang): 以伺服器端close事件(ended為false代表被對方中止)為同步點, 不以固定等待後檢查時刻
        let rec = mkRec()
        let cl = watchClose(k)
        let err = await catchErr(fsDownloadFileVerify(plan(k, ['hang']), fpOf(k), exp, {
            maxAttempts: 1,
            onTrace: rec.on,
            fetch: async (u, init) => {
                let r = await fetch(u, init)
                //回應之標頭不可讀(傳入之fetch回傳異常物件), 本體未交給串流
                return {
                    ok: true,
                    status: 200,
                    body: r.body,
                    headers: {
                        get: () => {
                            throw new Error('headers can not be read')
                        },
                    },
                }
            },
        }))
        let closed = await guard(cl, 'server close')
        let ab = rec.find('abort')
        assert.strict.deepStrictEqual([err.code, closed.ended, ab.e, ab.i < rec.find('settle').i], ['E_NETWORK', false, { type: 'abort', n: 1, why: 'close' }, true])
    })

    //======== 路徑 ========

    it(`R01 should fix the absolute target at call time even if the working directory changes during the download`, async function() {
        let dirA = path.resolve(`${fdt}/cwdA`)
        let dirB = path.resolve(`${fdt}/cwdB`)
        fs.mkdirSync(dirA, { recursive: true })
        fs.mkdirSync(dirB, { recursive: true })
        fs.writeFileSync(path.join(dirB, 'target.bin'), 'OLD-B')
        let u = plan('cwd', ['slowok'])
        let cwd0 = process.cwd()
        let r = null
        try {
            process.chdir(dirA)
            let pm = fsDownloadFileVerify(u, 'target.bin', exp)
            process.chdir(dirB)
            r = await pm
        }
        finally {
            process.chdir(cwd0)
        }
        assert.strict.deepStrictEqual([r.fp, fs.readFileSync(path.join(dirA, 'target.bin')).equals(body), fs.readFileSync(path.join(dirB, 'target.bin'), 'utf8')], ['target.bin', true, 'OLD-B'])
    })

    it(`R01 should keep the UNC prefix of fpOut when creating its folder`, async function() {
        if (process.platform !== 'win32') {
            this.skip() //UNC路徑只存在於Windows; 其他系統反斜線為合法檔名字元(見下方「backslash」案)
        }
        let got = null
        let fsx = mkFs({
            statSync: (p, o) => {
                if (String(p).startsWith('\\\\server')) {
                    let e = new Error('ENOENT: no such file or directory (supplied)')
                    e.code = 'ENOENT'
                    throw e //不實際查網路路徑
                }
                return fs.statSync(p, o)
            },
            mkdirSync: (p) => {
                got = p
                throw busy('EACCES')
            },
        })
        let err = await catchErr(fsDownloadFileVerify(url('unc'), '\\\\server\\share\\dir\\asset.bin', exp, { fs: fsx }))
        assert.strict.deepStrictEqual([err.code, err.step, err.attempts, got], ['E_FS', 'prepare', 0, '\\\\server\\share\\dir'])
    })

    it(`R01 should resolve a Windows drive-relative fpOut ('C:name') against the current folder of that drive, not as an alternate data stream`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let dirD = path.resolve(`${fdt}/driverel`)
        fs.mkdirSync(dirD, { recursive: true })
        let drive = path.parse(dirD).root.slice(0, 2)
        let u = plan('driverel', ['ok'])
        let cwd0 = process.cwd()
        let r = null
        try {
            process.chdir(dirD)
            r = await fsDownloadFileVerify(u, `${drive}target.bin`, exp)
        }
        finally {
            process.chdir(cwd0)
        }
        //檔案在該磁碟之目前資料夾, 不得建出名為磁碟代號之檔(替代資料流之本體)
        assert.strict.deepStrictEqual([r.fp, fs.readFileSync(path.join(dirD, 'target.bin')).equals(body), fs.existsSync(path.join(dirD, drive[0]))], [`${drive}target.bin`, true, false])
    })

    it(`R01 should not call mkdirSync for an existing folder such as a drive root`, async function() {
        let root = path.parse(process.cwd()).root
        let nMkdir = 0
        let fsx = mkFs({
            mkdirSync: (p, o) => {
                nMkdir++
                return fs.mkdirSync(p, o)
            },
            openSync: () => {
                throw busy('EACCES') //不實際在根目錄建立檔案
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('droot', ['ok']), `${root}wsemi-dlv-never-created.bin`, exp, { fs: fsx }))
        //Windows下對磁碟根以recursive建立會拋EPERM; 既存資料夾不呼叫, 故失敗於下載步驟之開檔(傳入之EACCES), 而非準備步驟
        assert.strict.deepStrictEqual([err.code, err.step, nMkdir, fs.existsSync(`${root}wsemi-dlv-never-created.bin`)], ['E_FS', 'download', 0, false])
    })

    //======== 重試(補) ========

    it(`R11 should retry a size mismatch by default and succeed on the next attempt`, async function() {
        let fp = fpOf('shortretry')
        let r = await fsDownloadFileVerify(plan('shortretry', ['short', 'ok']), fp, exp, { retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, hits.shortretry, fs.readFileSync(fp).equals(body)], [2, 2, true])
    })

    it(`R12 should wait retryDelayMs*n before the n-th retry`, async function() {
        let delays = []
        let t = Date.now()
        let r = await fsDownloadFileVerify(plan('backoff', ['s500', 's500', 'ok']), fpOf('backoff'), exp, {
            retryDelayMs: 150,
            onRetry: (o) => {
                delays.push(o.delayMs)
            },
        })
        let ms = Date.now() - t
        //通知之等待時間與實際等待(150+300毫秒)皆須成立
        assert.strict.deepStrictEqual([r.attempts, delays, ms >= 430], [3, [150, 300], true], `ms=${ms}`)
    })

    //======== 補強(wsemi-run02): 共用條件逐項、元件取用時點、關閉順序、路徑與網址、傳入元件之呼叫方式 ========

    it(`R14 should not share between concurrent calls with different urls, fetches or fs (same fpOut and expected value)`, async function() {
        let fp = fpOf('sharekeys')

        //R14: 網址不同 → 各自下載
        let u1 = plan('sharekeys1', ['slowok'])
        let u2 = plan('sharekeys2', ['slowok'])
        await Promise.all([fsDownloadFileVerify(u1, fp, exp), fsDownloadFileVerify(u2, fp, exp)])
        assert.strict.deepStrictEqual([hits.sharekeys1, hits.sharekeys2], [1, 1])

        //R14: opt.fetch不同 → 各自下載
        let n = [0, 0]
        let mkFetch = (i) => {
            return (a, b) => {
                n[i]++
                return fetch(a, b)
            }
        }
        let u3 = plan('sharekeys3', ['slowok'])
        await Promise.all([fsDownloadFileVerify(u3, fp, exp, { fetch: mkFetch(0) }), fsDownloadFileVerify(u3, fp, exp, { fetch: mkFetch(1) })])
        assert.strict.deepStrictEqual([n, hits.sharekeys3], [[1, 1], 2])

        //R14: opt.fs不同(方法相同、物件不同) → 各自下載
        let u4 = plan('sharekeys4', ['slowok'])
        await Promise.all([fsDownloadFileVerify(u4, fp, exp, { fs: mkFs({}) }), fsDownloadFileVerify(u4, fp, exp, { fs: mkFs({}) })])
        assert.strict.deepStrictEqual(hits.sharekeys4, 2)
    })

    it(`R14 should not share between Core calls given a different crypto or Readable module`, async function() {
        let fp = fpOf('sharemod2')
        let crypto2 = {
            createHash: (...a) => {
                return crypto.createHash(...a)
            },
        }
        let Readable2 = {
            fromWeb: (...a) => {
                return Readable.fromWeb(...a)
            },
            from: (...a) => {
                return Readable.from(...a)
            },
        }
        let u1 = plan('sharemod2', ['slowok'])
        await Promise.all([
            fsDownloadFileVerifyCore(u1, fp, exp, { fs, crypto, Readable, pipeline }),
            fsDownloadFileVerifyCore(u1, fp, exp, { fs, crypto: crypto2, Readable, pipeline }),
        ])
        let u2 = plan('sharemod3', ['slowok'])
        await Promise.all([
            fsDownloadFileVerifyCore(u2, fp, exp, { fs, crypto, Readable, pipeline }),
            fsDownloadFileVerifyCore(u2, fp, exp, { fs, crypto, Readable: Readable2, pipeline }),
        ])
        assert.strict.deepStrictEqual([hits.sharemod2, hits.sharemod3], [2, 2])

        //另一個模組物件但方法為同一個函數(只比方法身分看不出差別): 亦各自下載
        let crypto3 = { createHash: crypto.createHash }
        let Readable3 = { fromWeb: Readable.fromWeb, from: Readable.from }
        let u3 = plan('sharemod4', ['slowok'])
        await Promise.all([
            fsDownloadFileVerifyCore(u3, fp, exp, { fs, crypto, Readable, pipeline }),
            fsDownloadFileVerifyCore(u3, fp, exp, { fs, crypto: crypto3, Readable, pipeline }),
        ])
        let u4 = plan('sharemod5', ['slowok'])
        await Promise.all([
            fsDownloadFileVerifyCore(u4, fp, exp, { fs, crypto, Readable, pipeline }),
            fsDownloadFileVerifyCore(u4, fp, exp, { fs, crypto, Readable: Readable3, pipeline }),
        ])
        assert.strict.deepStrictEqual([hits.sharemod4, hits.sharemod5], [2, 2])
    })

    it(`R14 should not share between concurrent calls whose expected size differs (same sha256)`, async function() {
        let fp = fpOf('sharesize')
        let u = plan('sharesize', ['slowok'])
        await Promise.all([fsDownloadFileVerify(u, fp, exp), fsDownloadFileVerify(u, fp, { sha256: sha })])
        assert.strict.deepStrictEqual(hits.sharesize, 2)
    })

    it(`R15 should use the fs methods fetched at call time even if the fs object is changed during the download (the checked value is the used value)`, async function() {
        let fp = fpOf('fsatcall')
        let fsx = mkFs({
            openSync: (p, f) => {
                fsx.renameSync = () => {
                    throw busy('EXDEV') //呼叫之後才被改寫之方法不得被採用
                }
                return fs.openSync(p, f)
            },
        })
        let r = await fsDownloadFileVerify(plan('fsatcall', ['ok']), fp, exp, { fs: fsx })
        assert.strict.deepStrictEqual([r.attempts, fs.readFileSync(fp).equals(body), parts(fp)], [1, true, []])
    })

    it(`R08 should retry a rename failing with EACCES (a temporary lock) and succeed`, async function() {
        let fp = fpOf('renacces')
        let n = 0
        let fsx = mkFs({
            renameSync: (a, b) => {
                n++
                if (n <= 2) {
                    throw busy('EACCES')
                }
                return fs.renameSync(a, b)
            },
        })
        let r = await fsDownloadFileVerify(plan('renacces', ['ok']), fp, exp, { fs: fsx, retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.attempts, n, fs.readFileSync(fp).equals(body), parts(fp)], [1, 3, true, []])
    })

    it(`R08 should treat an existing empty fpOut as done when the expected content is empty and the rename fails`, async function() {
        let fp = fpOf('renempty')
        fs.writeFileSync(fp, '')
        let e0 = { sha256: crypto.createHash('sha256').update('').digest('hex'), size: 0 }
        let fsx = mkFs({
            renameSync: () => {
                throw busy('EPERM')
            },
        })
        let r = await fsDownloadFileVerify(plan('renempty', ['empty']), fp, e0, { fs: fsx, retryDelayMs: 10 })
        assert.strict.deepStrictEqual([r.size, r.attempts, fs.statSync(fp).size, parts(fp)], [0, 1, 0, []])
    })

    it(`R01 should download, verify and rename an empty content when the expected size is 0`, async function() {
        let fp = fpOf('empty')
        let e0 = { sha256: crypto.createHash('sha256').update('').digest('hex'), size: 0 }
        let r = await fsDownloadFileVerify(plan('empty', ['empty']), fp, e0)
        assert.strict.deepStrictEqual([r.size, r.downloaded, fs.statSync(fp).size, parts(fp)], [0, true, 0, []])
    })

    it(`R05 should check the announced content-length also when content-encoding is identity (nothing is written on mismatch)`, async function() {
        let fp = fpOf('ident')
        let nOpen = 0
        let fsx = mkFs({
            openSync: (p, f) => {
                nOpen++
                return fs.openSync(p, f)
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('ident', ['ident']), fp, { sha256: sha, size: body.length + 5 }, { fs: fsx, retryOnMismatch: false }))
        //R05: 宣告之大小與期望不同即不下載(不建立暫存檔); identity表示未壓縮, 與無content-encoding同
        assert.strict.deepStrictEqual([err.code, err.message.includes('announces'), nOpen, hits.ident, fs.existsSync(fp), parts(fp)], ['E_SIZE_MISMATCH', true, 0, 1, false, []])
    })

    it(`R11 should wait until the write stream is closed before re-reading and renaming the temporary file`, async function() {
        let fp = fpOf('closeorder')
        let wsRef = null
        let closedAtRename = null
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                //autoClose為false: 寫完(finish)後不自行關閉, 300毫秒後才銷毀; pipeline於finish即落定, 關閉遲於落定
                let ws = fs.createWriteStream(p, { ...o, autoClose: false })
                ws.once('finish', () => {
                    setTimeout(() => {
                        ws.destroy()
                    }, 300)
                })
                wsRef = ws
                return ws
            },
            renameSync: (a, b) => {
                closedAtRename = wsRef.closed
                return fs.renameSync(a, b)
            },
        })
        let r = await fsDownloadFileVerify(plan('closeorder', ['ok']), fp, exp, { fs: fsx })
        assert.strict.deepStrictEqual([r.attempts, closedAtRename, fs.readFileSync(fp).equals(body)], [1, true, true])
    })

    it(`R11 should destroy the write stream (closing the descriptor) when a failure happens before the pipeline starts`, async function() {
        let fp = fpOf('wsdestroy')
        let wsRef = null
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                wsRef = fs.createWriteStream(p, o)
                return wsRef
            },
        })
        let Readable2 = {
            fromWeb: () => {
                throw new Error('fromWeb exploded (supplied)')
            },
            from: (...a) => {
                return Readable.from(...a)
            },
        }
        let err = await catchErr(fsDownloadFileVerifyCore(plan('wsdestroy', ['ok']), fp, exp, { fs: fsx, crypto, Readable: Readable2, pipeline, maxAttempts: 1 }))
        //寫入串流已銷毀(檔案控制代碼已關閉), 本次建立之暫存檔已清除, 正式檔名未出現
        assert.strict.deepStrictEqual([/^E_/.test(err.code), wsRef.destroyed, parts(fp), fs.existsSync(fp), err.leftovers], [true, true, [], false, []])
    })

    it(`R01 should take the root folder of the current drive for an fpOut starting with a separator`, async function() {
        let got = []
        let fsx = mkFs({
            realpathSync: (p, o) => {
                got.push(p)
                return fs.realpathSync(p, o)
            },
            openSync: () => {
                throw busy('EACCES') //不實際在根目錄建立檔案
            },
        })
        let err = await catchErr(fsDownloadFileVerify(plan('rootslash', ['ok']), '/wsemi-dlv-never-created.bin', exp, { fs: fsx }))
        //資料夾部分為'/'(根), 不是'.'(目前資料夾); 失敗於下載步驟之開檔
        assert.strict.deepStrictEqual([err.code, err.step, got, fs.existsSync('/wsemi-dlv-never-created.bin')], ['E_FS', 'download', ['/'], false])
    })

    it(`R03 should reject E_ARG for a file name that is empty, '.' or '..' (on Windows also one with a colon), without any request`, async function() {
        hits.argname = 0
        let list = [`${fdt}/.`, `${fdt}/..`, '.', '..']
        if (process.platform === 'win32') {
            list.push('C:', `${fdt}/x:y.bin`)
        }
        let rs = []
        for (let fp of list) {
            let err = await catchErr(fsDownloadFileVerify(url('argname'), fp, exp))
            rs.push([fp, err.code, err.step, err.attempts])
        }
        assert.strict.deepStrictEqual(rs, list.map((fp) => [fp, 'E_ARG', 'argument', 0]))
        //未發出請求, 也未建出名為冒號前段之檔(替代資料流之本體)
        assert.strict.deepStrictEqual([hits.argname, fs.existsSync(`${fdt}/x`)], [0, false])
    })

    it(`R01 should treat a backslash as a file name character (not a separator) on non-Windows platforms`, async function() {
        let got = []
        let fsx = mkFs({
            statSync: (p) => {
                got.push(['statSync', p])
                let e = new Error('ENOENT: no such file or directory (supplied)')
                e.code = 'ENOENT'
                throw e
            },
            mkdirSync: (p) => {
                got.push(['mkdirSync', p])
                throw busy('EACCES') //不實際建立資料夾
            },
        })
        let desc = Object.getOwnPropertyDescriptor(process, 'platform')
        let err = null
        let err2 = null
        try {
            Object.defineProperty(process, 'platform', { value: 'linux' })
            err = await catchErr(fsDownloadFileVerify(url('posixbs'), '/srv/app/my\\tool.bin', exp, { fs: fsx }))
            got.push('next')
            err2 = await catchErr(fsDownloadFileVerify(url('posixbs'), '/srv/app/tool\\', exp, { fs: fsx })) //結尾為反斜線仍是檔名, 非資料夾
        }
        finally {
            Object.defineProperty(process, 'platform', desc)
        }
        //資料夾為'/srv/app'(只以/切分), 'my\tool.bin'為檔名; 結尾反斜線者不被當成資料夾(不是E_ARG)
        assert.strict.deepStrictEqual([err.code, err.step, got, err2.code, err2.step], ['E_FS', 'prepare', [['statSync', '/srv/app'], ['mkdirSync', '/srv/app'], 'next', ['statSync', '/srv/app'], ['mkdirSync', '/srv/app']], 'E_FS', 'prepare'])
    })

    it(`R15 should call supplied functions (expected function, fetch, pipeline, onRetry) without a receiver: this is not the internal context`, async function() {
        let seen = { exp: 'unset', fetch: 'unset', pipeline: 'unset', retry: 'unset' }
        let fnFetch = function(a, b) {
            seen.fetch = this
            return fetch(a, b)
        }
        let fnPipeline = function(...a) {
            seen.pipeline = this
            return pipeline(...a)
        }
        let fnExp = function() {
            seen.exp = this
            return exp
        }
        let fnRetry = function() {
            seen.retry = this
        }
        let r = await fsDownloadFileVerifyCore(plan('thisarg', ['s500', 'ok']), fpOf('thisarg'), fnExp, { fs, crypto, Readable, pipeline: fnPipeline, fetch: fnFetch, retryDelayMs: 1, onRetry: fnRetry })
        assert.strict.deepStrictEqual([r.attempts, seen], [2, { exp: undefined, fetch: undefined, pipeline: undefined, retry: undefined }])
    })

    it(`R03 should reject E_ARG for a url with credentials when the global fetch is used, and mask credentials in the errors of a supplied fetch`, async function() {
        hits.cred = 0
        let err1 = await catchErr(fsDownloadFileVerify(`http://user:secret@127.0.0.1:${port}/cred`, fpOf('cred'), exp))
        assert.strict.deepStrictEqual([err1.code, hits.cred, err1.message.includes('secret')], ['E_ARG', 0, false])
        let fn404 = async () => {
            return new Response('nf', { status: 404 })
        }
        let err2 = await catchErr(fsDownloadFileVerify(`http://user:secret@127.0.0.1:${port}/cred`, fpOf('cred'), exp, { fetch: fn404 }))
        assert.strict.deepStrictEqual([err2.code, err2.message.includes('secret'), err2.message.includes(`http://***@127.0.0.1:${port}/cred`), err2.url], ['E_HTTP', false, true, `http://***@127.0.0.1:${port}/cred`])
    })

    it(`R10/R11 should not leak a raw error when a supplied fs throws a value whose code getter throws (rename, unlink, open)`, async function() {
        let weird = () => {
            return Object.defineProperty(new Error('weird'), 'code', {
                get() {
                    throw new Error('code getter exploded')
                },
            })
        }

        //rename
        let e1 = await catchErr(fsDownloadFileVerify(plan('weird1', ['ok']), fpOf('weird1'), exp, {
            fs: mkFs({
                renameSync: () => {
                    throw weird()
                },
            }),
        }))
        assert.strict.deepStrictEqual([e1.code, e1.step, hits.weird1, parts(fpOf('weird1'))], ['E_RENAME', 'rename', 1, []])

        //unlink: 刪不掉之暫存檔如實回報
        let fp2 = fpOf('weird2')
        let e2 = await catchErr(fsDownloadFileVerify(plan('weird2', ['bad']), fp2, exp, {
            fs: mkFs({
                unlinkSync: () => {
                    throw weird()
                },
            }),
            retryOnMismatch: false,
        }))
        let p2 = parts(fp2)
        assert.strict.deepStrictEqual([e2.code, e2.leftovers.length, p2.length], ['E_HASH_MISMATCH', 1, 1])
        for (let v of p2) {
            fs.unlinkSync(`${fdt}/${v}`)
        }

        //open
        let e3 = await catchErr(fsDownloadFileVerify(plan('weird3', ['ok']), fpOf('weird3'), exp, {
            fs: mkFs({
                openSync: () => {
                    throw weird()
                },
            }),
            retryDelayMs: 1,
        }))
        assert.strict.deepStrictEqual([e3.code, e3.step, e3.attempts, hits.weird3], ['E_FS', 'download', 1, 1])
    })

    //======== 其他 ========

    it(`R12 should ignore errors thrown or rejected by opt.onRetry`, async function() {
        let r1 = await fsDownloadFileVerify(plan('onretry1', ['s500', 'ok']), fpOf('onretry1'), exp, {
            retryDelayMs: 1,
            onRetry: () => {
                throw new Error('onRetry boom')
            },
        })
        let r2 = await fsDownloadFileVerify(plan('onretry2', ['s500', 'ok']), fpOf('onretry2'), exp, {
            retryDelayMs: 1,
            onRetry: async () => {
                throw new Error('onRetry async boom')
            },
        })
        await new Promise((resolve) => {
            setTimeout(resolve, 50)
        })
        assert.strict.deepStrictEqual([r1.attempts, r2.attempts], [2, 2])
    })

    it(`R12 should not keep the process alive after settling (no leftover timers), checked in a child process`, function() {
        let rs = []
        for (let mode of ['s404', 'bad', 'ok', 'cut']) {
            let fp = `${fdt}/child-${mode}.bin`
            let t = Date.now()
            let r = spawnSync(process.execPath, ['test/tools/dlVerifyChild.mjs', mode, '8804', fp], { encoding: 'utf8', timeout: 20000, windowsHide: true })
            let ms = Date.now() - t
            let out = null
            try {
                out = JSON.parse(String(r.stdout).trim())
            }
            catch (err) {}
            //預設stallMs為30秒、totalMs為600秒, 計時器未清除時子行程不會於數秒內結束
            //cut: 來源端先出錯後所設之保底計時器(5秒)亦須於結束時清除, 否則行程多撐5秒
            rs.push([mode, r.status, out === null ? null : out.r, ms < (mode === 'cut' ? 4500 : 10000)])
        }
        assert.strict.deepStrictEqual(rs, [['s404', 0, 'E_HTTP', true], ['bad', 0, 'E_HASH_MISMATCH', true], ['ok', 0, 'resolved', true], ['cut', 0, 'E_NETWORK', true]])
    })

    //======== 第三方複核(terra,wsemi-run03)所見之補修: 檢查之值即使用之值、錯誤身分與歸屬、清理與共用、測試保護力 ========

    let shaOf = (v) => {
        return crypto.createHash('sha256').update(v).digest('hex')
    }

    it(`R03 should use the primitive value of a wrapper object (new String/Number/Boolean) for sha256, size, urlIn, fpOut and the boolean options: the checked value is the used value`, async function() {
        //sha256: 包裝字串之toLowerCase被覆寫成回傳另一雜湊, 不得被呼叫(原先檢查A卻以B驗證並發布)
        let wanted = Buffer.from('wanted content')
        let served = Buffer.from('served content')
        let box = new String(shaOf(wanted))
        box.toLowerCase = () => {
            return shaOf(served)
        }
        let fp1 = fpOf('box-sha')
        let err1 = await catchErr(fsDownloadFileVerify('x://box/sha', fp1, { sha256: box, size: served.length }, { fetch: async () => new Response(served), maxAttempts: 1 }))
        assert.strict.deepStrictEqual([err1.code, fs.existsSync(fp1), parts(fp1)], ['E_HASH_MISMATCH', false, []])

        //size: 包裝數字之valueOf每次回傳不同值, 只可轉換一次(此處不得被呼叫, 值為其內部數值1)
        let calls = 0
        let boxSize = new Number(1)
        boxSize.valueOf = () => {
            calls++
            return calls < 4 ? 1 : 2 ** 53
        }
        let r2 = await fsDownloadFileVerify('x://box/size', fpOf('box-size'), { sha256: shaOf('x'), size: boxSize }, { fetch: async () => new Response('x'), maxAttempts: 1 })
        assert.strict.deepStrictEqual([r2.size, calls], [1, 0])

        //fpOut與urlIn: 包裝字串之方法皆不得被使用(檢查後再切分會使更名到另一個檔)
        let fp3 = fpOf('box-path')
        let boxPath = new String(fp3)
        let boxUrl = new String('x://box/url')
        for (let k of ['slice', 'lastIndexOf', 'indexOf', 'includes', 'replace', 'startsWith', 'endsWith', 'toString', 'valueOf']) {
            boxPath[k] = () => {
                throw new Error(`wrapper method ${k} must not be used`)
            }
            boxUrl[k] = boxPath[k]
        }
        let seen = null
        let r3 = await fsDownloadFileVerify(boxUrl, boxPath, { sha256: shaOf('x') }, {
            fetch: async (u) => {
                seen = typeof u
                return new Response('x')
            }
        })
        assert.strict.deepStrictEqual([r3.fp, fs.readFileSync(fp3, 'utf8'), seen], [fp3, 'x', 'string'])

        //布林選項: new Boolean(false)為truthy, 須解包為false
        let n = 0
        let err4 = await catchErr(fsDownloadFileVerify('x://box/bool', fpOf('box-bool'), { sha256: shaOf('expected') }, {
            retryOnMismatch: new Boolean(false),
            maxAttempts: 3,
            retryDelayMs: 1,
            fetch: async () => {
                n++
                return new Response('wrong')
            }
        }))
        assert.strict.deepStrictEqual([err4.code, err4.attempts, n], ['E_HASH_MISMATCH', 1, 1])
        let fp5 = fpOf('box-skip')
        fs.writeFileSync(fp5, 'x')
        let r5 = await fsDownloadFileVerify('x://box/skip', fp5, { sha256: shaOf('x') }, { useSkipIfMatch: new Boolean(false), fetch: async () => new Response('x') })
        assert.strict.deepStrictEqual(r5.downloaded, true)
        let n6 = 0
        let fn6 = async () => {
            n6++
            await new Promise((resolve) => {
                setTimeout(resolve, 30)
            })
            return new Response('x')
        }
        let fp6 = fpOf('box-share')
        await Promise.all([
            fsDownloadFileVerify('x://box/share', fp6, { sha256: shaOf('x') }, { useShare: new Boolean(false), fetch: fn6 }),
            fsDownloadFileVerify('x://box/share', fp6, { sha256: shaOf('x') }, { useShare: new Boolean(false), fetch: fn6 }),
        ])
        assert.strict.deepStrictEqual(n6, 2) //new Boolean(false)視為false: 不共用, 各自下載
    })

    it(`R03 should accept a decimal integer string as size, and reject E_ARG a size string that is fractional, exponent, hexadecimal, signed or beyond the safe integers`, async function() {
        let n = 0
        let fn = async () => {
            n++
            return new Response('x')
        }
        let bad = ['0.999999999999999999999999999999999999', '1e-324', '1e0', '0x1', '1.0', '+1', '9007199254740993', '-1', '', ' ', '1 2']
        let rs = []
        for (let s of bad) {
            let err = await catchErr(fsDownloadFileVerify('x://size/str', fpOf('sizestr'), { sha256: shaOf('x'), size: s }, { fetch: fn, maxAttempts: 1 }))
            rs.push([s, err.code, err.step, err.attempts])
        }
        assert.strict.deepStrictEqual(rs, bad.map((s) => [s, 'E_ARG', 'argument', 0]))
        assert.strict.deepStrictEqual(n, 0)
        for (let s of [' 1 ', '0001', '1', 1]) {
            let r = await fsDownloadFileVerify('x://size/str', fpOf('sizestr-ok'), { sha256: shaOf('x'), size: s }, { fetch: fn, maxAttempts: 1 })
            assert.strict.deepStrictEqual(r.size, 1)
        }
    })

    it(`R03 should reject E_ARG a sha256 that is 64 characters long but not hexadecimal, before any request (static value and value returned by the expected function)`, async function() {
        let n = 0
        let fn = async () => {
            n++
            return new Response('x')
        }
        let bads = ['g'.repeat(64), 'z'.repeat(64), `${'0'.repeat(63)}-`, `${'0'.repeat(63)}\n`, '０'.repeat(64), 'é'.repeat(64)]
        let rs = []
        for (let s of bads) {
            let e1 = await catchErr(fsDownloadFileVerify('x://sha/alpha', fpOf('sha-alpha'), { sha256: s }, { fetch: fn, maxAttempts: 1 }))
            let e2 = await catchErr(fsDownloadFileVerify('x://sha/alpha', fpOf('sha-alpha'), () => {
                return { sha256: s }
            }, { fetch: fn, maxAttempts: 1 }))
            rs.push([e1.code, e2.code])
        }
        assert.strict.deepStrictEqual(rs, bads.map(() => ['E_ARG', 'E_EXPECTED']))
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`R01 should not take the trailing backslash of a real folder name as a separator on non-Windows platforms: the target stays inside that folder`, async function() {
        let opened = []
        let fsx = mkFs({
            statSync: () => {
                return { isDirectory: () => true }
            },
            realpathSync: () => {
                return '/fx/dir\\'
            },
            openSync: (p) => {
                opened.push(p)
                throw busy('EACCES') //不實際建立檔案
            },
        })
        let desc = Object.getOwnPropertyDescriptor(process, 'platform')
        let err = null
        try {
            Object.defineProperty(process, 'platform', { value: 'linux' })
            err = await catchErr(fsDownloadFileVerify('x://posixroot', '/fx/dir\\/tool.bin', { sha256: shaOf('x') }, { fs: fsx, fetch: async () => new Response('x'), maxAttempts: 1 }))
        }
        finally {
            Object.defineProperty(process, 'platform', desc)
        }
        //資料夾實名為'dir\', 暫存檔在其內('/fx/dir\/tool.bin.<pid>...'), 不是同層之'/fx/dir\tool.bin...'
        assert.strict.deepStrictEqual([err.code, opened.length, opened[0].startsWith('/fx/dir\\/tool.bin.')], ['E_FS', 1, true])
    })

    it(`R03 should mask credentials in the message and the url of an error, wherever the url appears (leading text, error text of the supplied fetch)`, async function() {
        let rs = []
        let retryMsgs = []
        for (let u of [' http://alice:secret42@example.test/a', 'http://alice:secret42@example.test/a', 'ftp://bob:secret42@example.test/a']) {
            let err = await catchErr(fsDownloadFileVerify(u, fpOf('mask'), { sha256: shaOf('x') }, {
                fetch: async (uu) => {
                    throw new Error(`cannot fetch ${uu} (connect to http://carol:secret42@proxy.test:8080/ failed)`)
                },
                maxAttempts: 2,
                retryDelayMs: 1,
                onRetry: (v) => {
                    retryMsgs.push(v.error.message) //onRetry收到之錯誤訊息亦不含帳密
                }
            }))
            rs.push([err.code, err.message.includes('secret42'), err.url.includes('secret42'), err.message.includes('***@')])
        }
        assert.strict.deepStrictEqual(rs, [['E_NETWORK', false, false, true], ['E_NETWORK', false, false, true], ['E_NETWORK', false, false, true]])
        assert.strict.deepStrictEqual([retryMsgs.length, retryMsgs.some((v) => v.includes('secret42'))], [3, false])

        //其他代碼之訊息: 期望值函數所拋錯誤之文字帶回網址
        let err2 = await catchErr(fsDownloadFileVerify('http://alice:secret42@example.test/a', fpOf('mask2'), async () => {
            throw new Error('manifest http://alice:secret42@example.test/m.json failed')
        }, { fetch: async () => new Response('x'), maxAttempts: 1 }))
        assert.strict.deepStrictEqual([err2.code, err2.message.includes('secret42'), err2.message.includes('http://***@example.test/m.json')], ['E_EXPECTED', false, true])
    })

    it(`R03 should reject E_ARG a url with only a user name or only a password when the global fetch is used, without any request`, async function() {
        hits.cred2 = 0
        let rs = []
        for (let u of [`http://:secret42@127.0.0.1:${port}/cred2`, `http://user@127.0.0.1:${port}/cred2`, `http://us%20er:p%40ss@127.0.0.1:${port}/cred2`]) {
            let err = await catchErr(fsDownloadFileVerify(u, fpOf('cred2'), exp))
            rs.push([err.code, err.message.includes('secret42')])
        }
        assert.strict.deepStrictEqual([rs, hits.cred2], [[['E_ARG', false], ['E_ARG', false], ['E_ARG', false]], 0])
    })

    it(`R10/R11 should not take a value thrown by a supplied component for an error of its own only because it carries the same code`, async function() {
        //傳入之fs其方法之getter拋出帶'E_NETWORK'之外部錯誤: 為E_ARG(不原樣漏出)
        let foreign = Object.assign(new Error('module getter failure'), { code: 'E_NETWORK' })
        let fsGetter = { ...fs }
        Object.defineProperty(fsGetter, 'openSync', {
            get() {
                throw foreign
            },
        })
        let e1 = await catchErr(fsDownloadFileVerify('x://foreign/getter', fpOf('foreign1'), { sha256: shaOf('x') }, { fs: fsGetter, fetch: async () => new Response('x') }))
        assert.strict.deepStrictEqual([e1 === foreign, e1.code, e1.step, e1.attempts], [false, 'E_ARG', 'argument', 0])

        //傳入之fetch拋出帶'E_FS'之外部錯誤: 是網路錯誤(可重試), 不是不可重試之磁碟錯誤
        let n2 = 0
        let e2 = await catchErr(fsDownloadFileVerify('x://foreign/fetch', fpOf('foreign2'), { sha256: shaOf('x') }, {
            fetch: async () => {
                n2++
                throw Object.assign(new Error('fetch refused connection'), { code: 'E_FS' })
            },
            maxAttempts: 3,
            retryDelayMs: 1
        }))
        assert.strict.deepStrictEqual([e2.code, e2.step, e2.attempts, n2], ['E_NETWORK', 'request', 3, 3])

        //寫入端先出錯且其錯誤帶'E_NETWORK': 是磁碟錯誤(不重試), 不是網路錯誤
        let n3 = 0
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return new Writable({
                    write(chunk, encoding, cb) {
                        cb(Object.assign(new Error('simulated write failure'), { code: 'E_NETWORK' }))
                    },
                    destroy(err, cb) {
                        fs.close(o.fd, () => {
                            cb(err)
                        })
                    },
                })
            },
        })
        let fp3 = fpOf('foreign3')
        let e3 = await catchErr(fsDownloadFileVerify('x://foreign/write', fp3, { sha256: shaOf('x') }, {
            fs: fsx,
            fetch: async () => {
                n3++
                return new Response('x')
            },
            maxAttempts: 3,
            retryDelayMs: 1
        }))
        assert.strict.deepStrictEqual([e3.code, e3.step, n3, parts(fp3), fs.existsSync(fp3)], ['E_FS', 'download', 1, [], false])
    })

    it(`R11 should report the disk error that happened first, not a later stall timeout, when the write stream is slow to close`, async function() {
        let fp = fpOf('firsterr')
        let n = 0
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return new Writable({
                    write(chunk, encoding, cb) {
                        let e = Object.assign(new Error('disk failed first'), { code: 'EIO' })
                        this.emit('error', e)
                        cb(e)
                    },
                    destroy(err, cb) {
                        setTimeout(() => {
                            fs.close(o.fd, () => {
                                cb(err)
                            })
                        }, 180) //關閉費時180ms, 其間停滯計時器(60ms)不得取代先出錯之磁碟錯誤
                    },
                })
            },
        })
        let err = await catchErr(fsDownloadFileVerify('x://firsterr', fp, { sha256: shaOf('x') }, {
            fs: fsx,
            fetch: async () => {
                n++
                return new Response('x')
            },
            stallMs: 60,
            totalMs: 5000,
            maxAttempts: 2,
            retryDelayMs: 1
        }))
        assert.strict.deepStrictEqual([err.code, err.step, err.attempts, n, parts(fp), fs.existsSync(fp)], ['E_FS', 'download', 1, 1, [], false])
    })

    it(`R11 should report the network error that happened first, not a later stall timeout, when the write stream is slow to close`, async function() {
        let fp = fpOf('firstsrc')
        let n = 0
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return new Writable({
                    write(chunk, encoding, cb) {
                        fs.write(o.fd, chunk, cb)
                    },
                    destroy(err, cb) {
                        setTimeout(() => {
                            fs.close(o.fd, () => {
                                cb(err)
                            })
                        }, 180) //關閉費時180ms, 其間停滯計時器(60ms)不得取代先出錯之網路錯誤
                    },
                })
            },
        })
        let err = await catchErr(fsDownloadFileVerify('x://firstsrc', fp, { sha256: shaOf('x') }, {
            fs: fsx,
            fetch: async () => {
                n++
                return new Response(new ReadableStream({
                    start(c) {
                        c.enqueue(new TextEncoder().encode('x'))
                        setTimeout(() => {
                            c.error(new Error('connection reset'))
                        }, 10)
                    },
                }))
            },
            stallMs: 60,
            totalMs: 5000,
            maxAttempts: 1
        }))
        assert.strict.deepStrictEqual([err.code, err.step, n, parts(fp), fs.existsSync(fp)], ['E_NETWORK', 'download', 1, [], false])
    })

    it(`R05 should settle within about 5 seconds, not hang, when the write stream failed first and the supplied pipeline never settles`, async function() {
        let fp = fpOf('pipenever')
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return fs.createWriteStream(p, o)
            },
        })
        let t = Date.now()
        let err = await catchErr(fsDownloadFileVerify('x://pipenever', fp, { sha256: shaOf('x') }, {
            fs: fsx,
            fetch: async () => new Response('x'),
            pipeline: (src, check, ws) => {
                ws.destroy(Object.assign(new Error('disk failed'), { code: 'EIO' })) //寫入端先出錯, 但此pipeline不落定
                return new Promise(() => {})
            },
            maxAttempts: 1,
            stallMs: 30000,
            totalMs: 60000,
        }))
        let ms = Date.now() - t
        assert.strict.deepStrictEqual([err.code, err.step, ms >= 4000 && ms < 15000, parts(fp), fs.existsSync(fp)], ['E_FS', 'download', true, [], false])
    })

    it(`R11 should wait at most 5 seconds (not twice) for a write stream that never reports closing, and clean up`, async function() {
        let fp = fpOf('noclose')
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return new Writable({
                    autoDestroy: false,
                    emitClose: false,
                    write(chunk, encoding, cb) {
                        fs.write(o.fd, chunk, cb)
                    },
                    destroy() {
                        fs.close(o.fd, () => {}) //描述子已關閉, 但不呼叫cb: 串流永不報告已關閉(closed恆為false), 清理時若再等一次又是5秒
                    },
                })
            },
        })
        let t = Date.now()
        let err = await catchErr(fsDownloadFileVerify('x://noclose', fp, { sha256: shaOf('x') }, { fs: fsx, fetch: async () => new Response('x'), maxAttempts: 1, stallMs: 30000, totalMs: 60000 }))
        let ms = Date.now() - t
        assert.strict.deepStrictEqual([err.code, err.step, ms >= 4000 && ms < 8000, parts(fp), fs.existsSync(fp), err.leftovers], ['E_FS', 'download', true, [], false, []])
    })

    it(`R11 should accept a real write stream that is closed without a close event (emitClose: false)`, async function() {
        let fp = fpOf('emitclose')
        let fsx = mkFs({
            createWriteStream: (p, o) => {
                return fs.createWriteStream(p, { ...o, emitClose: false })
            },
        })
        let t = Date.now()
        let r = await fsDownloadFileVerify('x://emitclose', fp, { sha256: shaOf('x') }, { fs: fsx, fetch: async () => new Response('x'), maxAttempts: 1 })
        assert.strict.deepStrictEqual([r.size, fs.readFileSync(fp, 'utf8'), Date.now() - t < 3000, parts(fp)], [1, 'x', true, []])
    })

    it(`R13 should cancel the body of a response that was received but not handed to the stream, also when the supplied fetch ignores the signal`, async function() {
        let cancelCalls = 0
        let body = new ReadableStream({
            cancel() {
                cancelCalls++
            },
        })
        let err = await catchErr(fsDownloadFileVerify('x://cancel/body', fpOf('cancelbody'), { sha256: shaOf('x'), size: 1 }, {
            fetch: async () => {
                return {
                    ok: true,
                    body,
                    headers: {
                        get() {
                            throw new Error('headers failure')
                        }
                    }
                }
            },
            maxAttempts: 1
        }))
        assert.strict.deepStrictEqual([err.code, cancelCalls], ['E_NETWORK', 1])
    })

    it(`R03 should reject E_ARG an opt.fetch that is given but not a function (not silently use the global fetch), and use the global fetch for null`, async function() {
        hits.fetchbad = 0
        let rs = []
        for (let v of ['not-a-function', 1, true, {}]) {
            let err = await catchErr(fsDownloadFileVerify(url('fetchbad'), fpOf('fetchbad'), exp, { fetch: v }))
            rs.push([err.code, err.step, err.attempts])
        }
        assert.strict.deepStrictEqual([rs, hits.fetchbad], [[['E_ARG', 'argument', 0], ['E_ARG', 'argument', 0], ['E_ARG', 'argument', 0], ['E_ARG', 'argument', 0]], 0])
        let r = await fsDownloadFileVerify(plan('fetchnull', ['ok']), fpOf('fetchnull'), exp, { fetch: null })
        assert.strict.deepStrictEqual([r.attempts, hits.fetchnull], [1, 1])
    })

    it(`R15 should reject E_ARG without retry when opt.fetch returns a Response whose body is not a WHATWG ReadableStream (interface mismatch, not a network error)`, async function() {
        let n = 0
        let fp = fpOf('nodebody')
        let err = await catchErr(fsDownloadFileVerify('x://nodebody', fp, { sha256: shaOf('x') }, {
            fetch: async () => {
                n++
                return { ok: true, status: 200, headers: new Headers(), body: Readable.from([Buffer.from('x')]) }
            },
            maxAttempts: 3,
            retryDelayMs: 1
        }))
        assert.strict.deepStrictEqual([err.code, err.step, err.attempts, n, err.message.includes('WHATWG'), parts(fp), fs.existsSync(fp)], ['E_ARG', 'download', 1, 1, true, [], false])
    })

    it(`R12 should retry a 5xx status (501, 503, 599) but not a status outside 5xx (600, 999) nor 404, 499`, async function() {
        let rs = []
        for (let st of [501, 503, 599]) {
            let n = 0
            let r = await fsDownloadFileVerify(`x://status/${st}`, fpOf(`status${st}`), { sha256: shaOf('x') }, {
                fetch: async () => {
                    n++
                    return n === 1 ? { ok: false, status: st, statusText: 'x', body: { cancel() {} } } : new Response('x')
                },
                maxAttempts: 3,
                retryDelayMs: 1
            })
            rs.push([st, r.attempts, n])
        }
        assert.strict.deepStrictEqual(rs, [[501, 2, 2], [503, 2, 2], [599, 2, 2]])
        let rs2 = []
        for (let st of [600, 999, 499, 404]) {
            let n = 0
            let err = await catchErr(fsDownloadFileVerify(`x://status/${st}`, fpOf(`status${st}`), { sha256: shaOf('x') }, {
                fetch: async () => {
                    n++
                    return { ok: false, status: st, statusText: 'x', body: { cancel() {} } }
                },
                maxAttempts: 3,
                retryDelayMs: 1
            }))
            rs2.push([st, err.code, err.attempts, n, err.message.includes('temporary problem')]) //5xx才提示伺服器暫時故障
        }
        assert.strict.deepStrictEqual(rs2, [[600, 'E_HTTP', 1, 1, false], [999, 'E_HTTP', 1, 1, false], [499, 'E_HTTP', 1, 1, false], [404, 'E_HTTP', 1, 1, false]])
        let err3 = await catchErr(fsDownloadFileVerify('x://status/503b', fpOf('status503b'), { sha256: shaOf('x') }, {
            fetch: async () => {
                return { ok: false, status: 503, statusText: 'x', body: { cancel() {} } }
            },
            maxAttempts: 1
        }))
        assert.strict.deepStrictEqual([err3.code, err3.message.includes('temporary problem')], ['E_HTTP', true])
    })

    it(`R14 should not share a download between calls with different expected functions, nor between a static expected value and a function`, async function() {
        let release = null
        let gate = new Promise((resolve) => {
            release = resolve
        })
        let n = 0
        let fn = async () => {
            n++
            await gate
            return new Response('good')
        }
        let opt = { fetch: fn, maxAttempts: 1, retryOnMismatch: false }
        let fp = fpOf('sharefn')
        let p1 = fsDownloadFileVerify('x://sharefn', fp, async () => ({ sha256: shaOf('good') }), opt)
        let p2 = fsDownloadFileVerify('x://sharefn', fp, async () => ({ sha256: shaOf('bad') }), opt)
        release()
        let rs = await Promise.allSettled([p1, p2])
        //不同期望值函數各自下載: 一個成功、另一個依自己之期望值判為不符(不得共用而認可不符之內容)
        assert.strict.deepStrictEqual([rs[0].status, rs[1].status, rs[1].reason && rs[1].reason.code, n, fs.readFileSync(fp, 'utf8')], ['fulfilled', 'rejected', 'E_HASH_MISMATCH', 2, 'good'])

        //靜態期望值與函數不共用
        let release2 = null
        let gate2 = new Promise((resolve) => {
            release2 = resolve
        })
        let n2 = 0
        let opt2 = {
            fetch: async () => {
                n2++
                await gate2
                return new Response('good')
            },
            maxAttempts: 1
        }
        let fp2 = fpOf('sharefn2')
        let q1 = fsDownloadFileVerify('x://sharefn2', fp2, { sha256: shaOf('good') }, opt2)
        let q2 = fsDownloadFileVerify('x://sharefn2', fp2, async () => ({ sha256: shaOf('good') }), opt2)
        release2()
        await Promise.all([q1, q2])
        assert.strict.deepStrictEqual(n2, 2)
    })

    it(`R14 should not share a download when a method of the same module object was replaced between two calls: the second call uses its own methods`, async function() {
        let release = null
        let gate = new Promise((resolve) => {
            release = resolve
        })
        let n = 0
        let fn = async () => {
            n++
            await gate
            return new Response('x')
        }
        let fsx = mkFs({})
        let fp = fpOf('sharesnap')
        let newCalls = 0
        let p1 = fsDownloadFileVerify('x://sharesnap', fp, { sha256: shaOf('x'), size: 1 }, { fs: fsx, fetch: fn, maxAttempts: 1, retryDelayMs: 1 })
        fsx.renameSync = () => {
            newCalls++
            throw busy('EACCES')
        }
        let p2 = fsDownloadFileVerify('x://sharesnap', fp, { sha256: shaOf('x'), size: 1 }, { fs: fsx, fetch: fn, maxAttempts: 1, retryDelayMs: 1 })
        release()
        await Promise.allSettled([p1, p2])
        assert.strict.deepStrictEqual([n, newCalls > 0], [2, true])
    })

    it(`R10 should not report a temporary file as leftover when it is already gone at the time of removal (ENOENT)`, async function() {
        let fp = fpOf('enoent')
        let fsx = mkFs({
            unlinkSync: (p) => {
                fs.unlinkSync(p)
                throw Object.assign(new Error('already removed'), { code: 'ENOENT' })
            },
        })
        let err = await catchErr(fsDownloadFileVerify('x://enoent', fp, { sha256: shaOf('good') }, { fs: fsx, fetch: async () => new Response('bad'), maxAttempts: 1, retryOnMismatch: false }))
        assert.strict.deepStrictEqual([err.code, err.leftovers, err.cleanupError, err.message.includes('could not be removed'), parts(fp)], ['E_HASH_MISMATCH', [], undefined, false, []])
    })

    it(`R12 should measure the total time with a monotonic clock: a system clock set back during a retry must not stretch the time budget`, async function() {
        //假時鐘下(setTimeout與Date皆為虛擬, 無真實等待): 整體上限(3000)與停滯上限(7500)、重試間隔(500)按比例放大, 使「首次嘗試耗時」不再與上限競爭(被測碼以performance.now計剩餘時間, 假時鐘控制不了, 故只需真實耗時遠小於放大後之剩餘預算)
        //系統時鐘被調回之幅度(60000)須大於 停滯上限 - 整體上限, 才分得出「單調時計」與「系統時鐘」
        let n = 0
        let rec = mkRec()
        let dateNow = null
        await withClock(async (clock) => {
            dateNow = Date.now
            try {
                let pm = catchErr(fsDownloadFileVerify('x://clock', fpOf('clock'), { sha256: shaOf('x') }, {
                    fetch: async () => {
                        n++
                        return n === 1 ? new Response(null, { status: 500 }) : new Promise(() => {})
                    },
                    maxAttempts: 2,
                    retryDelayMs: 500,
                    totalMs: 3000,
                    stallMs: 7500,
                    onRetry: () => {
                        Date.now = () => dateNow() - 60000 //系統時鐘被調回60秒
                    },
                    onTrace: rec.on,
                }))
                await rec.wait((e) => e.type === 'retry') //同步點: 第1次失敗後進入重試等待(onRetry已先於此通知), 之後之等待皆由假時鐘推進
                let adv = await advanceUntil(clock, () => rec.has('settle'), 12000, 50)
                let err = await guard(pm, 'settle')
                //以單調時計: 整體上限先於停滯上限到達; 以系統時鐘則上限被拉長而先逢停滯
                assert.strict.deepStrictEqual([err.code, adv.ok], ['E_TIMEOUT_TOTAL', true])
                //第2次嘗試之整體時限剩餘時間(remainMs)不得因系統時鐘被調回而增加(不大於totalMs); 整體時限觸發而停滯從未觸發
                let rq2 = rec.find('request', (e) => e.n === 2)
                assert.strict.deepStrictEqual({ retry: rec.find('retry').e, remainOk: rq2.e.remainMs > 0 && rq2.e.remainMs <= 3000, timeouts: rec.all('timeout').map((v) => [v.e.n, v.e.kind, v.e.where]), stop: rec.find('stop').e.why }, { retry: { type: 'retry', n: 1, ms: 500 }, remainOk: true, timeouts: [[2, 'total', 'request']], stop: 'fatal' }, `remainMs=${rq2.e.remainMs}`)
            }
            finally {
                Date.now = dateNow
            }
        })
    })

    it(`R14 should remove the key of a finished download from the sharing table (no growth by distinct destinations)`, async function() {
        let maps = new Set()
        let setOrig = Map.prototype.set
        Map.prototype.set = function(k, v) {
            if (typeof k === 'string' && k.toLowerCase().includes('inflightmap') && Array.isArray(v)) {
                maps.add(this)
            }
            return setOrig.call(this, k, v)
        }
        try {
            for (let i = 0; i < 3; i++) {
                await fsDownloadFileVerify(plan(`inflightmap${i}`, ['ok']), fpOf(`inflightmap-${i}`), exp)
            }
            await catchErr(fsDownloadFileVerify(plan('inflightmapbad', ['bad']), fpOf('inflightmap-bad'), exp, { retryOnMismatch: false }))
        }
        finally {
            Map.prototype.set = setOrig
        }
        assert.strict.deepStrictEqual([maps.size, [...maps].map((m) => m.size)], [1, [0]])
    })

    it(`R08 should compare the content of an existing file with the expected one, an empty file included (skip and rename-failure paths)`, async function() {
        let data = Buffer.from('expected nonempty')
        let expd = { sha256: shaOf(data), size: data.length }

        //已有空檔而期望非空: 不得略過下載
        let fp1 = fpOf('empty1')
        fs.writeFileSync(fp1, '')
        let r1 = await fsDownloadFileVerify('x://empty/1', fp1, expd, { useSkipIfMatch: true, fetch: async () => new Response(data) })
        assert.strict.deepStrictEqual([r1.downloaded, fs.readFileSync(fp1).equals(data)], [true, true])

        //更名一直被鎖而正式檔為空檔、期望非空: 不得當成已是期望內容
        let fp2 = fpOf('empty2')
        fs.writeFileSync(fp2, '')
        let err2 = await catchErr(fsDownloadFileVerify('x://empty/2', fp2, expd, {
            fs: mkFs({
                renameSync: () => {
                    throw busy('EPERM')
                },
            }),
            fetch: async () => new Response(data),
            maxAttempts: 1,
            retryDelayMs: 1
        }))
        assert.strict.deepStrictEqual([err2.code, fs.statSync(fp2).size, parts(fp2)], ['E_RENAME', 0, []])

        //期望為空內容而正式檔非空: 不得略過; 正式檔為空且期望為空: 略過
        let fp3 = fpOf('empty3')
        fs.writeFileSync(fp3, 'abc')
        let expEmpty = { sha256: shaOf(''), size: 0 }
        let r3 = await fsDownloadFileVerify('x://empty/3', fp3, expEmpty, { useSkipIfMatch: true, fetch: async () => new Response('') })
        assert.strict.deepStrictEqual([r3.downloaded, fs.statSync(fp3).size], [true, 0])
        let r4 = await fsDownloadFileVerify('x://empty/3', fp3, expEmpty, { useSkipIfMatch: true, fetch: async () => new Response('should not be fetched') })
        assert.strict.deepStrictEqual([r4.downloaded, r4.size], [false, 0])
    })

    //======== 觀察回調(opt.onTrace, R-TRACE-01) ========

    //seq, 事件序列簡式(略去逐塊資料之data與touch:data, 其塊數隨傳輸分塊而異): 'touch:<from>'、'verify:<phase>'、'temp:<act>'、'share:<act>', 其餘為type
    let seq = (rec) => {
        return rec.events.map((e) => {
            if (e.type === 'touch' || e.type === 'verify' || e.type === 'temp' || e.type === 'share') {
                return `${e.type}:${e.from || e.phase || e.act}`
            }
            return e.type
        }).filter((v) => v !== 'data' && v !== 'touch:data')
    }

    it(`onTrace should not change the outcome whatever the callback is: none, recorder, throwing, rejecting or not a function (P3/P4)`, async function() {
        let rec = mkRec()
        let outs = []
        let k = 0
        for (let on of fiveOnTrace(rec.on)) {
            k++
            let fp = fpOf(`tr5ok${k}`)
            let r = await fsDownloadFileVerify(plan(`tr5ok${k}`, ['bad', 'ok']), fp, exp, { retryDelayMs: 1, onTrace: on })
            let e = await catchErr(fsDownloadFileVerify(plan(`tr5ng${k}`, ['s404']), fpOf(`tr5ng${k}`), exp, { onTrace: on }))
            outs.push({
                r: [r.fp === fp, r.sha256, r.size, r.attempts, r.downloaded, r.leftovers, fs.readFileSync(fp).equals(body), hits[`tr5ok${k}`], parts(fp)],
                e: [e.code, e.step, e.status, e.attempts, hits[`tr5ng${k}`], e.message.split(`tr5ng${k}`).join('K'), fs.existsSync(fpOf(`tr5ng${k}`))],
            })
        }
        //五種回調結果完全相同
        for (let i = 1; i < outs.length; i++) {
            assert.strict.deepStrictEqual(outs[i], outs[0], `callback #${i}`)
        }
        assert.strict.deepStrictEqual(outs[0].r.slice(1), [sha, body.length, 2, true, [], true, 2, []])
        //紀錄器確實收到事件(成功之重試與失敗各一輪)
        assert.strict.deepStrictEqual([rec.all('settle').map((v) => [v.e.ok, v.e.code, v.e.attempts])], [[[true, null, 2], [false, 'E_HTTP', 1]]])
        //拋錯與回傳rejection之回調不產生未處理之rejection
        await new Promise((resolve) => setImmediate(resolve))
        await new Promise((resolve) => setImmediate(resolve))
        assert.strict.deepStrictEqual(unhandled, [])
    })

    it(`onTrace should pass frozen events with fixed primitive fields per type, called without a receiver`, async function() {
        let seen = []
        let thisVals = []
        let on = function(e) {
            thisVals.push(this)
            seen.push(e)
        }
        let o = { retryDelayMs: 1, onTrace: on }

        //1. 成功(雜湊不符重試一次後成功): share、attempt、request、touch、headers、temp、data、verify、abort、retry、rename、settle
        await fsDownloadFileVerify(plan('trshape1', ['bad', 'ok']), fpOf('trshape1'), exp, o)

        //2. 略過下載: skip
        fs.writeFileSync(fpOf('trshape2'), body)
        await fsDownloadFileVerify(plan('trshape2', ['ok']), fpOf('trshape2'), exp, { ...o, useSkipIfMatch: true })

        //3. 不共用: share off; 預算不足不再重試: stop budget; 次數用盡: stop max; 不可重試: stop fatal
        await catchErr(fsDownloadFileVerify(plan('trshape3', ['bad']), fpOf('trshape3'), exp, { ...o, useShare: false, retryDelayMs: 5000, totalMs: 2000 }))
        await catchErr(fsDownloadFileVerify(plan('trshape4', ['s500']), fpOf('trshape4'), exp, { ...o, maxAttempts: 2 }))
        await catchErr(fsDownloadFileVerify(plan('trshape5', ['s404']), fpOf('trshape5'), exp, o))

        //4. 更名失敗一次: rename ok false; 暫存檔清除: temp remove
        let nRename = 0
        await fsDownloadFileVerify(plan('trshape6', ['ok']), fpOf('trshape6'), exp, {
            ...o,
            fs: mkFs({
                renameSync: (a, b) => {
                    nRename++
                    if (nRename === 1) {
                        throw busy('EBUSY')
                    }
                    return fs.renameSync(a, b)
                },
            }),
        })

        //5. 假時鐘: 停滯計時器觸發(timeout)與請求中止(abort E_TIMEOUT)
        await withClock(async (clock) => {
            let rec = mkRec()
            let both = (e) => {
                rec.on(e)
                on(e)
            }
            let pm = catchErr(fsDownloadFileVerify('x://shape', fpOf('trshape7'), { sha256: shaOf('x') }, {
                ...o,
                onTrace: both,
                fetch: () => new Promise(() => {}),
                maxAttempts: 1,
                stallMs: 100,
            }))
            await advanceUntil(clock, () => rec.has('settle'), 1000)
            await guard(pm, 'settle')
        })

        //6. 共用: 加入者之share join與settle
        let release = null
        let gate = new Promise((resolve) => {
            release = resolve
        })
        let fnGate = async () => {
            await gate
            return new Response('abc')
        }
        let oj = { ...o, fetch: fnGate }
        let p1 = fsDownloadFileVerify('x://shapejoin', fpOf('trshape8'), { sha256: shaOf('abc') }, oj)
        let p2 = fsDownloadFileVerify('x://shapejoin', fpOf('trshape8'), { sha256: shaOf('abc') }, oj)
        release()
        await Promise.all([p1, p2])

        //固定欄位表(各type的欄位名, 皆另有type)
        let keys = {}
        for (let e of seen) {
            let ks = Object.keys(e).sort().join(',')
            keys[e.type] = keys[e.type] || new Set()
            keys[e.type].add(ks)
        }
        let table = {}
        for (let t of Object.keys(keys).sort()) {
            table[t] = [...keys[t]]
        }
        assert.strict.deepStrictEqual(table, {
            abort: ['n,type,why'],
            attempt: ['max,n,type'],
            data: ['bytes,n,type'],
            headers: ['n,ok,status,type'],
            rename: ['i,n,ok,type'],
            request: ['n,remainMs,stallMs,type'],
            retry: ['ms,n,type'],
            settle: ['attempts,code,ok,type'],
            share: ['act,type'],
            skip: ['n,size,type'],
            stop: ['code,n,type,why'],
            temp: ['act,n,ok,type'],
            timeout: ['kind,ms,n,type,where'],
            touch: ['from,ms,n,type'],
            verify: ['hashOk,n,phase,size,sizeOk,type'],
        })
        //各type之取值語意: 列舉型欄位只出現規定值
        let vals = (t, f) => {
            return [...new Set(seen.filter((e) => e.type === t).map((e) => e[f]))].sort()
        }
        assert.strict.deepStrictEqual({ act: vals('share', 'act'), from: vals('touch', 'from'), phase: vals('verify', 'phase'), tempAct: vals('temp', 'act'), stop: vals('stop', 'why'), abort: vals('abort', 'why'), kind: vals('timeout', 'kind') }, { act: ['join', 'off', 'own'], from: ['data', 'headers', 'request'], phase: ['disk', 'stream'], tempAct: ['create', 'remove'], stop: ['budget', 'fatal', 'max'], abort: ['E_TIMEOUT', 'close'], kind: ['stall'] })
        //凍結、欄位值皆為原始值(數字、字串、布林、null), 不帶接收者
        assert.strict.deepStrictEqual({ frozen: seen.every((e) => Object.isFrozen(e)), primitive: seen.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), noThis: thisVals.every((v) => v === undefined), many: seen.length > 40 }, { frozen: true, primitive: true, noThis: true, many: true })
    })

    it(`onTrace should report the sequence of a download, a retry, a failure and a skipped download`, async function() {
        //成功: 標頭到達與暫存檔建立先於資料, 校驗(本體、重讀暫存檔)後才更名, 請求於校驗後釋放
        let rec1 = mkRec()
        await fsDownloadFileVerify(plan('trseq1', ['ok']), fpOf('trseq1'), exp, { onTrace: rec1.on })
        assert.strict.deepStrictEqual(seq(rec1), ['share:own', 'attempt', 'request', 'touch:request', 'touch:headers', 'headers', 'temp:create', 'verify:stream', 'verify:disk', 'abort', 'rename', 'settle'])
        assert.strict.deepStrictEqual({ attempt: rec1.find('attempt').e, headers: rec1.find('headers').e, bytes: rec1.all('data').pop().e.bytes, stream: rec1.find('verify', (e) => e.phase === 'stream').e, disk: rec1.find('verify', (e) => e.phase === 'disk').e, rename: rec1.find('rename').e, abort: rec1.find('abort').e.why, settle: rec1.find('settle').e }, {
            attempt: { type: 'attempt', n: 1, max: 3 },
            headers: { type: 'headers', n: 1, ok: true, status: 200 },
            bytes: body.length,
            stream: { type: 'verify', n: 1, phase: 'stream', size: body.length, sizeOk: true, hashOk: true },
            disk: { type: 'verify', n: 1, phase: 'disk', size: body.length, sizeOk: true, hashOk: true },
            rename: { type: 'rename', n: 1, i: 1, ok: true },
            abort: 'close',
            settle: { type: 'settle', ok: true, code: null, attempts: 1 },
        })

        //雜湊不符後重試(onRetry與retry事件同一時點, 不論有無給onRetry): 第1次嘗試之暫存檔清除, 等待retryDelayMs*1後第2次嘗試成功
        let rec2 = mkRec()
        let calls = []
        await fsDownloadFileVerify(plan('trseq2', ['bad', 'ok']), fpOf('trseq2'), exp, { retryDelayMs: 7, onRetry: (o) => calls.push(o.delayMs), onTrace: rec2.on })
        let head = ['share:own', 'attempt', 'request', 'touch:request', 'touch:headers', 'headers', 'temp:create', 'verify:stream']
        assert.strict.deepStrictEqual(seq(rec2), [...head, 'abort', 'temp:remove', 'retry', 'attempt', 'request', 'touch:request', 'touch:headers', 'headers', 'temp:create', 'verify:stream', 'verify:disk', 'abort', 'rename', 'settle'])
        assert.strict.deepStrictEqual({ verify1: rec2.find('verify').e, remove: rec2.find('temp', (e) => e.act === 'remove').e, retry: rec2.find('retry').e, ns: rec2.all('attempt').map((v) => v.e.n), onRetry: calls, settle: rec2.find('settle').e }, {
            verify1: { type: 'verify', n: 1, phase: 'stream', size: body.length, sizeOk: true, hashOk: false },
            remove: { type: 'temp', n: 1, act: 'remove', ok: true },
            retry: { type: 'retry', n: 1, ms: 7 },
            ns: [1, 2],
            onRetry: [7],
            settle: { type: 'settle', ok: true, code: null, attempts: 2 },
        })

        //不給onRetry時retry事件仍通知
        let rec3 = mkRec()
        await fsDownloadFileVerify(plan('trseq3', ['s500', 'ok']), fpOf('trseq3'), exp, { retryDelayMs: 3, onTrace: rec3.on })
        assert.strict.deepStrictEqual(rec3.find('retry').e, { type: 'retry', n: 1, ms: 3 })

        //HTTP 404: 標頭到達(ok false)、不可重試而停止、不建立暫存檔
        let rec4 = mkRec()
        await catchErr(fsDownloadFileVerify(plan('trseq4', ['s404']), fpOf('trseq4'), exp, { onTrace: rec4.on }))
        assert.strict.deepStrictEqual({ seq: seq(rec4), headers: rec4.find('headers').e, stop: rec4.find('stop').e, settle: rec4.find('settle').e }, {
            seq: ['share:own', 'attempt', 'request', 'touch:request', 'touch:headers', 'headers', 'abort', 'stop', 'settle'],
            headers: { type: 'headers', n: 1, ok: false, status: 404 },
            stop: { type: 'stop', n: 1, why: 'fatal', code: 'E_HTTP' },
            settle: { type: 'settle', ok: false, code: 'E_HTTP', attempts: 1 },
        })

        //次數用盡與預算不足之停止
        let rec5 = mkRec()
        await catchErr(fsDownloadFileVerify(plan('trseq5', ['s500']), fpOf('trseq5'), exp, { maxAttempts: 2, retryDelayMs: 1, onTrace: rec5.on }))
        assert.strict.deepStrictEqual([rec5.find('stop').e, rec5.find('settle').e], [{ type: 'stop', n: 2, why: 'max', code: 'E_HTTP' }, { type: 'settle', ok: false, code: 'E_HTTP', attempts: 2 }])
        let rec6 = mkRec()
        await catchErr(fsDownloadFileVerify(plan('trseq6', ['bad']), fpOf('trseq6'), exp, { retryDelayMs: 5000, totalMs: 2000, onTrace: rec6.on }))
        assert.strict.deepStrictEqual([rec6.find('stop').e, rec6.has('retry')], [{ type: 'stop', n: 1, why: 'budget', code: 'E_HASH_MISMATCH' }, false])

        //略過下載(opt.useSkipIfMatch): 不送請求
        let rec7 = mkRec()
        fs.writeFileSync(fpOf('trseq7'), body)
        let r7 = await fsDownloadFileVerify(plan('trseq7', ['ok']), fpOf('trseq7'), exp, { useSkipIfMatch: true, onTrace: rec7.on })
        assert.strict.deepStrictEqual({ downloaded: r7.downloaded, seq: seq(rec7), skip: rec7.find('skip').e, hits: hits.trseq7 }, { downloaded: false, seq: ['share:own', 'attempt', 'skip', 'settle'], skip: { type: 'skip', n: 1, size: body.length }, hits: 0 })

        //更名失敗後重試: 第1次失敗(ok false)、第2次成功
        let rec8 = mkRec()
        let nRename = 0
        await fsDownloadFileVerify(plan('trseq8', ['ok']), fpOf('trseq8'), exp, {
            retryDelayMs: 1,
            onTrace: rec8.on,
            fs: mkFs({
                renameSync: (a, b) => {
                    nRename++
                    if (nRename === 1) {
                        throw busy('EBUSY')
                    }
                    return fs.renameSync(a, b)
                },
            }),
        })
        assert.strict.deepStrictEqual(rec8.all('rename').map((v) => [v.e.i, v.e.ok]), [[1, false], [2, true]])

        //期望值不符且不重試: 暫存檔已清除(temp remove ok)
        let rec9 = mkRec()
        await catchErr(fsDownloadFileVerify(plan('trseq9', ['bad']), fpOf('trseq9'), exp, { retryOnMismatch: false, onTrace: rec9.on }))
        assert.strict.deepStrictEqual([rec9.find('temp', (e) => e.act === 'remove').e, rec9.find('stop').e], [{ type: 'temp', n: 1, act: 'remove', ok: true }, { type: 'stop', n: 1, why: 'fatal', code: 'E_HASH_MISMATCH' }])
    })

    it(`onTrace should report sharing: the first call owns the download, a joining call only joins and settles with the same outcome, and useShare false is reported as off`, async function() {
        let g = mkGate('trjoin', body.length)
        let u = plan('trjoin', ['gated'])
        let rec1 = mkRec()
        let rec2 = mkRec()
        let p1 = fsDownloadFileVerify(u, fpOf('trjoin'), exp, { onTrace: rec1.on })
        let p2 = fsDownloadFileVerify(u, fpOf('trjoin'), exp, { onTrace: rec2.on })
        await guard(g.ready, 'server request')
        g.end(body)
        let [r1, r2] = await Promise.all([p1, p2])
        assert.strict.deepStrictEqual({ same: r1 === r2, hits: hits.trjoin, share1: rec1.find('share').e, types2: rec2.types(), settle2: rec2.find('settle').e }, { same: true, hits: 1, share1: { type: 'share', act: 'own' }, types2: ['share', 'settle'], settle2: { type: 'settle', ok: true, code: null, attempts: 1 } })
        assert.strict.deepStrictEqual(rec2.find('share').e, { type: 'share', act: 'join' })

        //共用之失敗: 加入者同樣收到失敗之settle
        let rec3 = mkRec()
        let rec4 = mkRec()
        let u2 = plan('trjoinfail', ['s404'])
        let es = await Promise.all([catchErr(fsDownloadFileVerify(u2, fpOf('trjoinfail'), exp, { onTrace: rec3.on })), catchErr(fsDownloadFileVerify(u2, fpOf('trjoinfail'), exp, { onTrace: rec4.on }))])
        assert.strict.deepStrictEqual({ same: es[0] === es[1], hits: hits.trjoinfail, settle: rec4.find('settle').e }, { same: true, hits: 1, settle: { type: 'settle', ok: false, code: 'E_HTTP', attempts: 1 } })

        //useShare為false
        let rec5 = mkRec()
        await fsDownloadFileVerify(plan('troff', ['ok']), fpOf('troff'), exp, { useShare: false, onTrace: rec5.on })
        assert.strict.deepStrictEqual(rec5.find('share').e, { type: 'share', act: 'off' })
    })

    it(`onTrace should report nothing for an invalid argument, and only settle when the folder of fpOut can not be prepared`, async function() {
        let rec1 = mkRec()
        let e1 = await catchErr(fsDownloadFileVerify('', fpOf('trarg'), exp, { onTrace: rec1.on }))
        assert.strict.deepStrictEqual([e1.code, rec1.events.length], ['E_ARG', 0])
        let rec2 = mkRec()
        fs.writeFileSync(`${fdt}/afile2`, 'x')
        let e2 = await catchErr(fsDownloadFileVerify(plan('trprep', ['ok']), `${fdt}/afile2/x.bin`, exp, { onTrace: rec2.on }))
        assert.strict.deepStrictEqual([e2.code, e2.step, hits.trprep, rec2.events], ['E_FS', 'prepare', 0, [{ type: 'settle', ok: false, code: 'E_FS', attempts: 0 }]])
    })

    it(`onTrace should report the 5 seconds fallback abort when the write stream failed first and the supplied pipeline never settles (fake clock)`, async function() {
        await withClock(async (clock) => {
            let rec = mkRec()
            let fsx = mkFs({
                createWriteStream: (p, o) => {
                    return fs.createWriteStream(p, o)
                },
            })
            let pm = catchErr(fsDownloadFileVerify('x://pipenevertr', fpOf('pipenevertr'), { sha256: shaOf('x') }, {
                fs: fsx,
                fetch: async () => new Response('x'),
                pipeline: (src, check, ws) => {
                    ws.emit('error', Object.assign(new Error('disk failed'), { code: 'EIO' })) //寫入端先出錯(同步通知, 與暫存檔建立同一虛擬時刻), 但此pipeline不落定
                    return new Promise(() => {})
                },
                maxAttempts: 1,
                stallMs: 30000,
                totalMs: 60000,
                onTrace: rec.on,
            }))
            let adv = await advanceUntil(clock, () => rec.has('settle'), 8000, 50)
            let err = await guard(pm, 'settle')
            assert.strict.deepStrictEqual([err.code, err.step, adv.ok, parts(fpOf('pipenevertr'))], ['E_FS', 'download', true, []])
            //寫入端先出錯(此時停滯與整體計時停止)後恰5000ms才放手使請求落定; 停滯與整體時限計時器皆未觸發
            let ab = rec.find('abort')
            assert.strict.deepStrictEqual({ why: ab.e.why, gap: ab.at - rec.find('temp').at, timeouts: rec.all('timeout').length, abortCount: rec.all('abort').length }, { why: 'fallback', gap: 5000, timeouts: 0, abortCount: 1 })
        })
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})


describe(`fsDownloadFileVerify`, function() {

    let test = async () => {
        let ms = []

        let fdt = './_test_fsDownloadFileVerify'
        fsCreateFolder(fdt) //創建任務資料夾

        //本機HTTP服務, 提供一個檔案
        let body = Buffer.from('abc中文')
        let server = http.createServer((req, res) => {
            res.writeHead(200, { 'content-length': String(body.length) })
            res.end(body)
        })
        await new Promise((resolve) => {
            server.listen(8802, '127.0.0.1', resolve)
        })
        let urlIn = 'http://127.0.0.1:8802/a.bin'
        let sha256 = crypto.createHash('sha256').update(body).digest('hex')

        //期望值相符, 下載後更名為正式檔名
        let r1 = await fsDownloadFileVerify(urlIn, `${fdt}/a.bin`, { sha256, size: body.length })
        // console.log('r1', r1)
        ms.push({ fp: r1.fp, sha256: r1.sha256, size: r1.size, attempts: r1.attempts, downloaded: r1.downloaded, content: fs.readFileSync(r1.fp, 'utf8') })

        //期望值不符(且不重試), 正式檔名不會出現
        await fsDownloadFileVerify(urlIn, `${fdt}/b.bin`, { sha256: '0'.repeat(64) }, { retryOnMismatch: false })
            .catch((err) => {
                // console.log('err', err.message)
                ms.push({ code: err.code, step: err.step, attempts: err.attempts, exists: fs.existsSync(`${fdt}/b.bin`) })
            })

        //期望值由函數取得(每次嘗試前呼叫, 例如每次重取清單)
        let r3 = await fsDownloadFileVerify(urlIn, `${fdt}/c.bin`, async ({ attempt }) => {
            return { sha256: sha256.toUpperCase(), size: String(body.length) }
        })
        // console.log('r3', r3)
        ms.push({ sha256: r3.sha256, attempts: r3.attempts })

        await new Promise((resolve) => {
            server.close(resolve)
        })
        fsDeleteFolder(fdt) //最終階段清除任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    let ms = [
        {
            fp: './_test_fsDownloadFileVerify/a.bin',
            sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
            size: 9,
            attempts: 1,
            downloaded: true,
            content: 'abc中文'
        },
        {
            code: 'E_HASH_MISMATCH',
            step: 'verify',
            attempts: 1,
            exists: false
        },
        {
            sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
            attempts: 1
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
