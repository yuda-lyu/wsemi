import fs from 'fs'
import http from 'http'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import EventEmitter from 'events'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import zipStore from './tools/zipStore.mjs'
import tgzStore from './tools/tgzStore.mjs'
import { traceRec } from './tools/timeKit.mjs'


//防懸置上限用模組載入時保存之真實計時器
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//規格: 排程第632項(主控任務twsm2)之跨程序鎖, 規則帳本R-BIN-ENSURE-01規則19; 全域技能role-coder-for-test §9.2(鎖之測試含「另一方持有後釋放, 等候者成功」)、§8(以事件同步)
//多程序案: 本機HTTP服務(listen(0), 下載計數, 以閘門控制何時回應)＋同時起N個子行程(test/tools/ensureBinsLockChild.mjs, windowsHide)呼叫fsEnsureBins, 以子行程印出之onTrace事件同步
//單程序案: 以不同之下載選項(retryDelayMs)使同程序內兩次呼叫不共用同一次取得, 而經同一把鎖; 或以手工建立之鎖資料夾(格式見JSDoc與規則19)模擬他程序
//全部不連外網: 清單內之https網址一律改指本機HTTP服務
describe(`fsEnsureBins cross-process lock`, function() {
    this.timeout(120000)

    let fdt = path.resolve('./test/_tmp/fsEnsureBinsLock')
    let server = null
    let port = 0
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }
    let kids = [] //本檔所起之子行程, 每案結束時仍存活者終止之

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let buf = (n, k) => {
        return Buffer.from(Array.from({ length: n }, (v, i) => (i * k + 1) % 256))
    }
    let tool = buf(20000, 7)
    let toolBad = Buffer.from(tool)
    toolBad[10] = (toolBad[10] + 1) % 256
    let exe = buf(30000, 3)
    let zip = zipStore([{ name: 'k6-v1/k6.exe', data: exe }, { name: 'k6-v1/LICENSE', data: Buffer.from('license') }])
    let ffexe = buf(40000, 11)
    let ffzip = zipStore([{ name: 'ff/ffmpeg.exe', data: ffexe }])
    let n3 = Math.ceil(ffzip.length / 3)
    let ffparts = [ffzip.subarray(0, n3), ffzip.subarray(n3, n3 * 2), ffzip.subarray(n3 * 2)]
    let cnode = buf(25000, 13)
    let cdll = buf(12000, 17)
    let tgz = tgzStore([{ name: 'build/Release/c.node', data: cnode }, { name: 'build/Release/c.dll', data: cdll }, { name: 'README', data: Buffer.from('not listed') }])
    let pkTool = buf(7000, 29)
    let RAW1 = `/raw.githubusercontent.com/yuda-lyu/w-l/${C1}/`
    let VURL = 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'
    let TURL = 'https://github.com/o/c/releases/download/v3/c-win32-x64.tar.gz'
    let P_TOOL = `${RAW1}bin/tool.exe`
    let P_K6 = '/github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'
    let P_TGZ = '/github.com/o/c/releases/download/v3/c-win32-x64.tar.gz'
    let P_PK = `${RAW1}bin/pk/tool.exe`

    //routes: 路徑(https網址改指後)→Buffer或函數; gates: 路徑→{ open, held }, 未開啟時請求暫不回應; hits: 已到達之請求路徑
    let routes = {}
    let gates = {}
    let hits = []
    let hitWaiters = []
    let send = (res, b) => {
        try {
            if (!res.destroyed && !res.writableEnded) {
                res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(b.length) })
                res.end(b)
            }
        }
        catch (err) {}
    }
    let resetRoutes = () => {
        routes = {
            [P_TOOL]: tool,
            [`${RAW1}bin/ff.zip.001`]: ffparts[0],
            [`${RAW1}bin/ff.zip.002`]: ffparts[1],
            [`${RAW1}bin/ff.zip.003`]: ffparts[2],
            [P_K6]: zip,
            [P_TGZ]: tgz,
            [P_PK]: pkTool,
        }
        gates = {}
        hits = []
    }
    let gate = (p) => {
        gates[p] = { open: false, held: [] }
    }
    let openGate = (p) => {
        let g = gates[p]
        g.open = true
        for (let h of g.held.splice(0)) {
            h()
        }
    }
    let nHits = (p) => {
        return hits.filter((v) => v === p).length
    }
    //waitHits, 等到路徑p之請求數達n(事件: 伺服器收到請求; 上限只防懸置)
    let waitHits = (p, n) => {
        return new Promise((resolve, reject) => {
            let w = { p, n, resolve }
            w.t = realSetTimeout(() => {
                hitWaiters.splice(hitWaiters.indexOf(w), 1)
                reject(new Error(`waitHits: ${nHits(p)} of ${n} requests for ${p}`))
            }, 60000)
            hitWaiters.push(w)
            check()
        })
    }
    let check = () => {
        for (let w of hitWaiters.slice()) {
            if (nHits(w.p) >= w.n) {
                hitWaiters.splice(hitWaiters.indexOf(w), 1)
                realClearTimeout(w.t)
                w.resolve()
            }
        }
    }
    let mapFetch = (u, init) => {
        return globalThis.fetch(String(u).replace(/^https:\/\//, `http://127.0.0.1:${port}/`), init)
    }

    let mf = (files, bundles = null, over = {}) => {
        let m = { schema: 1, pkg: 'w-l', mode: 'pinned', repo: 'yuda-lyu/w-l', commit: C1, ...over }
        if (files !== null) {
            m.files = files
        }
        if (bundles !== null) {
            m.bundles = bundles
        }
        return m
    }
    let fTool = () => {
        return { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(tool), size: tool.length }
    }
    let fK6 = () => {
        return { name: 'k6.exe', url: VURL, sha256: sha(zip), size: zip.length, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: sha(exe), size: exe.length } }
    }
    let fFf = () => {
        return {
            name: 'ffmpeg.exe',
            parts: ffparts.map((b, i) => ({ path: `bin/ff.zip.00${i + 1}`, sha256: sha(b), size: b.length })),
            assembled: { type: 'zip', sha256: sha(ffzip), size: ffzip.length },
            extract: { type: 'zip', member: 'ff/ffmpeg.exe', sha256: sha(ffexe), size: ffexe.length },
        }
    }
    let fTgz = () => {
        return { name: 'c.node', url: TURL, sha256: sha(tgz), size: tgz.length, extract: { type: 'tgz', member: 'build/Release/c.node', sha256: sha(cnode), size: cnode.length } }
    }
    let bPk = () => {
        return {
            name: 'pk',
            dir: 'bin/pk',
            files: [{ path: 'tool.exe', sha256: sha(pkTool), size: pkTool.length }],
            archives: [{
                url: TURL,
                sha256: sha(tgz),
                size: tgz.length,
                extract: { type: 'tgz', files: [{ path: 'build/Release/c.node', sha256: sha(cnode), size: cnode.length }, { path: 'build/Release/c.dll', sha256: sha(cdll), size: cdll.length }] },
            }],
        }
    }
    //bundleIdOf, 組識別(規格M6, JSDoc): 組內各檔依path排序後逐行'<sha256>  <path>\n'串接之SHA-256
    let bundleIdOf = (b) => {
        let fs2 = [...b.files, ...b.archives.flatMap((a) => a.extract.files)].map((f) => ({ path: f.path, line: `${f.sha256}  ${f.path}\n` }))
        fs2.sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0))
        return sha(Buffer.from(fs2.map((v) => v.line).join(''), 'utf8'))
    }

    //lockDirOf, 鎖資料夾(規則19): <快取>/.lock-<鍵>, 鍵為取得單位('f/<sha256>/<name>'或'b/<組識別>', Windows轉小寫)之SHA-256前32碼
    let lockDirOf = (cacheRoot, unit) => {
        return path.join(cacheRoot, `.lock-${sha(Buffer.from(process.platform === 'win32' ? unit.toLowerCase() : unit, 'utf8')).slice(0, 32)}`)
    }
    let locksIn = (cacheRoot) => {
        return fs.existsSync(cacheRoot) ? fs.readdirSync(cacheRoot).filter((n) => n.startsWith('.lock-')) : []
    }
    let workIn = (cacheRoot) => {
        return fs.existsSync(cacheRoot) ? fs.readdirSync(cacheRoot).filter((n) => n.startsWith('.work-')) : []
    }
    //putLock, 手工建立他程序之鎖(格式同規則19之owner.json)
    let putLock = (L, rec) => {
        fs.mkdirSync(L, { recursive: true })
        fs.writeFileSync(path.join(L, 'owner.json'), typeof rec === 'string' ? rec : JSON.stringify({ v: 1, host: '', ...rec }))
    }
    let ownerOf = (L) => {
        return JSON.parse(fs.readFileSync(path.join(L, 'owner.json'), 'utf8'))
    }

    //fx, 每案專用之套件根目錄
    let nfx = 0
    let fx = (name) => {
        nfx++
        let fd = path.join(fdt, `${nfx}-${name}`)
        fs.mkdirSync(fd, { recursive: true })
        return fd
    }

    //ens, 同程序呼叫Core並注入Node模組, 環境變數預設空
    let ens = (manifest, opt = {}) => {
        return fsEnsureBinsCore(manifest, { fs, path, crypto, Readable, pipeline, spawn, env: {}, fetch: mapFetch, retryDelayMs: 10, ...opt })
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

    //spawnChild, 起子行程(windowsHide), 其onTrace事件逐行轉入traceRec(tr), done於結束時回傳{ code, result, err }
    let child = path.resolve('./test/tools/ensureBinsLockChild.mjs')
    let nCfg = 0
    let spawnChild = (cfg) => {
        nCfg++
        let fpCfg = path.join(fdt, `cfg-${nCfg}.json`)
        fs.writeFileSync(fpCfg, JSON.stringify({ port, ...cfg }))
        let cp = spawn(process.execPath, [child, fpCfg], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
        kids.push(cp)
        let tr = traceRec({ guard: 60000 })
        let ee = new EventEmitter() //每個事件另以'ev'轉發(供跨子行程計數之同步點); 到達事件閘門時轉發'gate'
        let gates = [] //子行程已到達(停住)之閘門id
        let rest = ''
        let result = null
        let err = ''
        cp.stdout.setEncoding('utf8')
        cp.stdout.on('data', (s) => {
            rest += s
            let ls = rest.split('\n')
            rest = ls.pop()
            for (let l of ls) {
                if (l.startsWith('EV ')) {
                    let e = JSON.parse(l.slice(3))
                    tr.on(e)
                    ee.emit('ev', e)
                }
                else if (l.startsWith('GATE ')) {
                    gates.push(l.slice(5).trim())
                    ee.emit('gate')
                }
                else if (l.startsWith('RESULT ')) {
                    result = JSON.parse(l.slice(7))
                }
            }
        })
        cp.stderr.setEncoding('utf8')
        cp.stderr.on('data', (s) => {
            err += s
        })
        let done = new Promise((resolve) => {
            cp.on('close', (code) => {
                resolve({ code, result, err })
            })
        })
        return { cp, pid: cp.pid, tr, ee, gates, done }
    }
    //mkGate, 子行程之事件閘門(id與標記檔); waitGate等到子行程停在該閘門; passGate建立標記檔使其續行
    let nGate = 0
    let mkGate = (id) => {
        nGate++
        return { id, file: path.join(fdt, `gate-${nGate}-${id}`) }
    }
    let waitGate = (k, id) => {
        return new Promise((resolve, reject) => {
            let t = null
            let on = () => {
                if (k.gates.includes(id)) {
                    realClearTimeout(t)
                    k.ee.removeListener('gate', on)
                    resolve()
                }
            }
            t = realSetTimeout(() => {
                k.ee.removeListener('gate', on)
                reject(new Error(`waitGate: child did not reach gate ${id}`))
            }, 60000)
            k.ee.on('gate', on)
            on()
        })
    }
    let passGate = (g) => {
        fs.writeFileSync(g.file, '1')
    }
    //gateOrDone, 等到子行程停在閘門id('gate')或已結束('done'), 先到者為準
    let gateOrDone = (k, id) => {
        return new Promise((resolve) => {
            let fin = false
            let on = () => {
                if (!fin && k.gates.includes(id)) {
                    fin = true
                    k.ee.removeListener('gate', on)
                    resolve('gate')
                }
            }
            k.ee.on('gate', on)
            k.done.then(() => {
                if (!fin) {
                    fin = true
                    k.ee.removeListener('gate', on)
                    resolve('done')
                }
            })
            on()
        })
    }
    //waitStarts, 等到ks之中k個子行程已開始等候鎖(lock-wait start), 回傳已等候者之索引集合(上限只防懸置)
    let waitStarts = (ks, k) => {
        return new Promise((resolve, reject) => {
            let got = new Set()
            let offs = []
            let t = realSetTimeout(() => {
                offs.forEach((f) => f())
                reject(new Error(`waitStarts: ${got.size} of ${k} children started waiting`))
            }, 60000)
            let fin = () => {
                if (got.size >= k) {
                    realClearTimeout(t)
                    offs.forEach((f) => f())
                    resolve(got)
                }
            }
            ks.forEach((kd, i) => {
                let on = (e) => {
                    if (e.type === 'lock-wait' && e.phase === 'start') {
                        got.add(i)
                    }
                }
                kd.tr.events.forEach(on)
                let on2 = (e) => {
                    on(e)
                    fin()
                }
                kd.ee.on('ev', on2)
                offs.push(() => kd.ee.removeListener('ev', on2))
            })
            fin()
        })
    }
    let isStartOrDownload = (e) => {
        return e.type === 'download' || (e.type === 'lock-wait' && e.phase === 'start')
    }

    before(async function() {
        process.on('unhandledRejection', onUnhandled)
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
        server = http.createServer((req, res) => {
            hits.push(req.url)
            check()
            let h = routes[req.url]
            if (h === undefined) {
                res.writeHead(404, { 'content-type': 'text/plain' })
                res.end('not found')
                return
            }
            let run = () => {
                if (typeof h === 'function') {
                    h(req, res)
                    return
                }
                send(res, h)
            }
            let g = gates[req.url]
            if (g !== undefined && !g.open) {
                g.held.push(run)
                return
            }
            run()
        })
        await new Promise((resolve) => {
            server.listen(0, '127.0.0.1', resolve)
        })
        port = server.address().port
    })

    after(async function() {
        if (server.closeAllConnections) {
            server.closeAllConnections()
        }
        await new Promise((resolve) => {
            server.close(resolve)
        })
        fsDeleteFolder(fdt)
        process.removeListener('unhandledRejection', onUnhandled)
    })

    beforeEach(function() {
        resetRoutes()
    })

    afterEach(async function() {
        //仍存活之子行程(斷言失敗時)終止之並等其結束
        let alive = kids.filter((cp) => cp.exitCode === null && cp.signalCode === null)
        for (let cp of alive) {
            cp.kill()
        }
        await Promise.all(alive.map((cp) => new Promise((resolve) => {
            if (cp.exitCode !== null || cp.signalCode !== null) {
                resolve()
                return
            }
            cp.once('close', resolve)
        })))
        kids = []
        for (let g of Object.values(gates)) {
            g.open = true
            for (let h of g.held.splice(0)) {
                h()
            }
        }
    })

    //---------------- 多程序: 同一取得單位只取得一次 ----------------

    //runMany, 起n個子行程同取m, 等到n-1個開始等候鎖、且閘門p之請求已到達(持鎖者已在取得)後才放行閘門p, 回傳{ ks, rs, iHolder }
    let runMany = async (root, m, n, p, opt = {}, onHeld = null) => {
        gate(p)
        let ks = Array.from({ length: n }, () => spawnChild({ pkgRoot: root, manifest: m, opt }))
        let got = await waitStarts(ks, n - 1)
        await waitHits(p, 1)
        let iHolder = ks.findIndex((k, i) => !got.has(i))
        assert.strict.equal(got.size, n - 1) //一個持鎖取得, 其餘等候
        assert.strict.equal(ks[iHolder].tr.events.some((e) => e.type === 'lock-wait'), false)
        if (onHeld) {
            onHeld(ks, iHolder)
        }
        openGate(p)
        let rs = await Promise.all(ks.map((k) => k.done))
        for (let r of rs) {
            assert.strict.equal(r.result && r.result.ok, true, JSON.stringify(r))
        }
        return { ks, rs, iHolder }
    }
    //assertWaitersUsedCache, 等候者皆於鎖釋放後重新檢查快取命中(lock-wait end hit:true)且未下載; 持鎖者未等候
    let assertWaitersUsedCache = (ks, iHolder) => {
        ks.forEach((k, i) => {
            let types = k.tr.events.map((e) => e.type)
            if (i === iHolder) {
                assert.strict.equal(types.includes('lock-wait'), false)
                return
            }
            assert.strict.equal(types.includes('download'), false, `child ${i} downloaded`)
            assert.strict.deepStrictEqual(k.tr.events.filter((e) => e.type === 'lock-wait').map((e) => [e.phase, e.hit]), [['start', null], ['end', true]])
        })
    }

    it(`should download a file once when 6 processes get it at once from an empty cache: one holds the lock at <cache>/.lock-<key>, the others wait and then use the cache (rule 19)`, async function() {
        let root = fx('n6')
        let cacheRoot = path.join(root, 'bin-cache')
        let L = lockDirOf(cacheRoot, `f/${sha(tool)}/tool.exe`)
        let { ks, rs, iHolder } = await runMany(root, mf([fTool()]), 6, P_TOOL, {}, (ks2, i) => {
            //鎖之位置與格式: <快取>/.lock-<鍵>/owner.json(持鎖期間); 不在<sha256>夾內, 最終檔尚未放入
            let rec = ownerOf(L)
            assert.strict.deepStrictEqual([rec.v, rec.pid, rec.host, Number.isFinite(rec.at), rec.limitMs > 0, /^[0-9a-z-]+$/.test(rec.token)], [1, ks2[i].pid, '', true, true, true])
            assert.strict.equal(path.dirname(L), cacheRoot)
            assert.strict.equal(fs.existsSync(path.join(cacheRoot, sha(tool), 'tool.exe')), false)
        })
        assert.strict.equal(nHits(P_TOOL), 1) //下載恰1次
        assert.strict.equal(new Set(rs.map((r) => r.result.out['tool.exe'].fp)).size, 1) //全部讀到同一份
        assert.strict.equal(rs.every((r) => r.result.out['tool.exe'].ok), true)
        assertWaitersUsedCache(ks, iHolder)
        assert.strict.deepStrictEqual([locksIn(cacheRoot), workIn(cacheRoot)], [[], []]) //鎖與暫存夾皆已釋放
    })

    it(`should get a bundle with a tgz archive once when 4 processes get it at once (rule 19, M6, D5)`, async function() {
        let root = fx('bundle4')
        let b = bPk()
        let cacheRoot = path.join(root, 'bin-cache')
        let L = lockDirOf(cacheRoot, `b/${bundleIdOf(b)}`)
        let { ks, rs, iHolder } = await runMany(root, mf(null, [b]), 4, P_TGZ, {}, () => {
            assert.strict.equal(fs.existsSync(path.join(L, 'owner.json')), true) //檔案組之鎖鍵為組識別
        })
        assert.strict.deepStrictEqual([nHits(P_PK), nHits(P_TGZ)], [1, 1])
        assert.strict.equal(new Set(rs.map((r) => r.result.out.pk.fp)).size, 1)
        assert.strict.equal(rs.every((r) => r.result.out.pk.ok), true)
        assertWaitersUsedCache(ks, iHolder)
        assert.strict.deepStrictEqual([locksIn(cacheRoot), workIn(cacheRoot)], [[], []])
    })

    it(`should get a file extracted from a tgz once when 3 processes get it at once (rule 19, D5)`, async function() {
        let root = fx('tgz3')
        let { ks, rs, iHolder } = await runMany(root, mf([fTgz()]), 3, P_TGZ)
        assert.strict.equal(nHits(P_TGZ), 1)
        assert.strict.equal(rs.every((r) => r.result.out['c.node'].ok), true)
        assertWaitersUsedCache(ks, iHolder)
        assert.strict.deepStrictEqual([locksIn(path.join(root, 'bin-cache')), workIn(path.join(root, 'bin-cache'))], [[], []])
    })

    it(`should get a file extracted from split parts once when 3 processes get it at once (rule 19, D5)`, async function() {
        let root = fx('parts3')
        let { ks, rs, iHolder } = await runMany(root, mf([fFf()]), 3, `${RAW1}bin/ff.zip.001`)
        assert.strict.deepStrictEqual([1, 2, 3].map((i) => nHits(`${RAW1}bin/ff.zip.00${i}`)), [1, 1, 1])
        assert.strict.equal(rs.every((r) => r.result.out['ffmpeg.exe'].ok), true)
        assertWaitersUsedCache(ks, iHolder)
        assert.strict.deepStrictEqual(locksIn(path.join(root, 'bin-cache')), [])
    })

    it(`should copy from an http mirror once while offline when 3 processes get it at once (rule 19, O1)`, async function() {
        let root = fx('mirror3')
        let P_M = `/mirror/w-l/${sha(tool)}/tool.exe`
        routes[P_M] = tool
        let { ks, rs, iHolder } = await runMany(root, mf([fTool()]), 3, P_M, { offline: true, mirror: `http://127.0.0.1:${port}/mirror` })
        assert.strict.deepStrictEqual([nHits(P_M), nHits(P_TOOL)], [1, 0]) //離線: 只用鏡像, 且只取一次
        assert.strict.equal(rs.every((r) => r.result.out['tool.exe'].ok), true)
        //鏡像之取得以mirror事件通知(非download): 持鎖者為唯一有mirror ok之子行程
        assert.strict.deepStrictEqual(ks.map((k) => k.tr.events.filter((e) => e.type === 'mirror' && e.result === 'ok').length), ks.map((k, i) => (i === iHolder ? 1 : 0)))
        assert.strict.deepStrictEqual(locksIn(path.join(root, 'bin-cache')), [])
    }).timeout(120000)

    it(`should lock each selected file separately with opt.names (rule 19, E1)`, async function() {
        let root = fx('names3')
        let m = mf([fTool(), fK6()])
        gate(P_TOOL)
        let ks = [
            spawnChild({ pkgRoot: root, manifest: m, opt: { names: ['tool.exe'] } }),
            spawnChild({ pkgRoot: root, manifest: m, opt: { names: ['k6.exe', 'tool.exe'] } }),
            spawnChild({ pkgRoot: root, manifest: m, opt: {} }),
        ]
        let first = await Promise.all(ks.map((k) => k.tr.wait((e) => e.name === 'tool.exe' && isStartOrDownload(e))))
        assert.strict.deepStrictEqual(first.map((e) => e.type).sort(), ['download', 'lock-wait', 'lock-wait'])
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let rs = await Promise.all(ks.map((k) => k.done))
        assert.strict.deepStrictEqual(rs.map((r) => r.result && r.result.ok), [true, true, true])
        assert.strict.deepStrictEqual(rs.map((r) => Object.keys(r.result.out).sort()), [['tool.exe'], ['k6.exe', 'tool.exe'], ['k6.exe', 'tool.exe']])
        assert.strict.deepStrictEqual([nHits(P_TOOL), nHits(P_K6)], [1, 1]) //各取得單位各下載1次
        assert.strict.deepStrictEqual(locksIn(path.join(root, 'bin-cache')), [])
    })

    //---------------- 多程序: 持有者被終止 ----------------

    it(`should let exactly one waiter take over the lock of a killed holder (pid gone), get the file once more, and the others use the cache (rule 19)`, async function() {
        let root = fx('killed')
        let cacheRoot = path.join(root, 'bin-cache')
        let L = lockDirOf(cacheRoot, `f/${sha(tool)}/tool.exe`)
        gate(P_TOOL)
        let ks = Array.from({ length: 4 }, () => spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: {} }))
        let first = await Promise.all(ks.map((k) => k.tr.wait(isStartOrDownload)))
        let iHolder = first.findIndex((e) => e.type === 'download')
        assert.strict.notEqual(iHolder, -1)
        await waitHits(P_TOOL, 1)
        //終止持鎖者(外力終止: 不經finally), 其鎖留在原處; 鎖之持有者於終止前核對(終止後等候者隨時可能已接手, 不再讀鎖)
        let h = ks[iHolder]
        assert.strict.equal(ownerOf(L).pid, h.pid)
        h.cp.kill()
        let rh = await h.done
        assert.strict.equal(rh.result, null)
        //之後之請求立即回應
        openGate(P_TOOL)
        let rs = await Promise.all(ks.filter((k, i) => i !== iHolder).map((k) => k.done))
        assert.strict.deepStrictEqual(rs.map((r) => r.result && r.result.ok), [true, true, true])
        assert.strict.equal(rs.every((r) => r.result.out['tool.exe'].ok), true)
        let waiters = ks.filter((k, i) => i !== iHolder)
        let takes = waiters.flatMap((k) => k.tr.events.filter((e) => e.type === 'lock-takeover'))
        assert.strict.deepStrictEqual(takes.map((e) => e.why), ['dead']) //恰一個接手
        assert.strict.equal(nHits(P_TOOL), 2) //被終止者1次＋接手者1次
        assert.strict.equal(waiters.filter((k) => k.tr.events.some((e) => e.type === 'download')).length, 1)
        assert.strict.deepStrictEqual(locksIn(cacheRoot), []) //含接手標記(.del-)與移走之舊鎖(.old-)皆不殘留
    })

    //---------------- 單程序: 等候、釋放、接手、逾時 ----------------

    it(`should release the lock on failures (download, extraction, mismatch, injected fs error), and a waiter gets the file after the holder fails (rule 19, test skill §9.2)`, async function() {
        //下載失敗之持有者釋放鎖後, 等候者重新檢查快取未命中(lock-wait end hit:false)而自行取得
        let root = fx('fail-wait')
        let n = 0
        routes[P_TOOL] = (req, res) => {
            n++
            if (n === 1) {
                res.writeHead(500)
                res.end('busy')
                return
            }
            send(res, tool)
        }
        gate(P_TOOL)
        let trA = traceRec()
        let trB = traceRec()
        let pA = catchErr(ens(mf([fTool()]), { pkgRoot: root, maxAttempts: 1, retryDelayMs: 10, onTrace: trA.on }))
        let pB = catchErr(ens(mf([fTool()]), { pkgRoot: root, maxAttempts: 1, retryDelayMs: 11, onTrace: trB.on })) //下載選項不同: 不共用同一次取得
        let fa = await Promise.all([trA.wait(isStartOrDownload), trB.wait(isStartOrDownload)])
        assert.strict.deepStrictEqual(fa.map((e) => e.type).sort(), ['download', 'lock-wait'])
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let [eA, eB] = await Promise.all([pA, pB])
        let holderFailed = fa[0].type === 'download' ? eA : eB
        let waiterErr = fa[0].type === 'download' ? eB : eA
        let trW = fa[0].type === 'download' ? trB : trA
        assert.strict.equal(holderFailed && holderFailed.code, 'E_HTTP')
        assert.strict.equal(waiterErr, null)
        assert.strict.deepStrictEqual(trW.events.filter((e) => e.type === 'lock-wait').map((e) => [e.phase, e.hit]), [['start', null], ['end', false]])
        assert.strict.equal(fs.readFileSync(path.join(root, 'bin-cache', sha(tool), 'tool.exe')).equals(tool), true)
        assert.strict.equal(nHits(P_TOOL), 2)
        assert.strict.deepStrictEqual(locksIn(path.join(root, 'bin-cache')), [])

        //其他失敗路徑: 解壓失敗(E_EXTRACT)、檔案組之內容不符(E_HASH_MISMATCH)、注入之fs於建暫存夾時拋錯(E_FS)
        let fakeTar = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {}
            setImmediate(() => {
                cp.emit('close', 1)
            })
            return cp
        }
        let fsWorkFail = {
            ...fs,
            mkdirSync: (p, ...a) => {
                if (String(p).includes('.work-')) {
                    let err = new Error('EIO: i/o error, mkdir')
                    err.code = 'EIO'
                    throw err
                }
                return fs.mkdirSync(p, ...a)
            },
        }
        let cases = [
            ['E_EXTRACT', mf([fK6()]), { spawn: fakeTar }],
            ['E_HASH_MISMATCH', mf(null, [bPk()]), {}, () => {
                routes[P_PK] = toolBad.subarray(0, pkTool.length)
            }],
            ['E_FS', mf([fK6()]), { fs: fsWorkFail }],
        ]
        for (let [code, m, opt, prep] of cases) {
            resetRoutes()
            if (prep) {
                prep()
            }
            let r2 = fx(`fail-${code}`)
            let e = await catchErr(ens(m, { pkgRoot: r2, maxAttempts: 1, ...opt }))
            assert.strict.equal(e && e.code, code)
            assert.strict.deepStrictEqual(locksIn(path.join(r2, 'bin-cache')), [], code)
        }
    })

    it(`should take over a lock whose holder is alive but over its limit (expired), a lock of a process that has exited (dead), and an unreadable lock older than the grace (invalid) (rule 19)`, async function() {
        //過期之pid須為存活之行程: 本測試行程
        let exited = spawn(process.execPath, ['-e', ''], { windowsHide: true })
        let deadPid = exited.pid
        await new Promise((resolve) => exited.on('close', resolve))
        let past = new Date(Date.now() - 600000)
        let cases = [
            ['expired', (L) => putLock(L, { pid: process.pid, at: Date.now() - 3600000, limitMs: 1000, token: 'crafted-expired' })],
            ['dead', (L) => putLock(L, { pid: deadPid, at: Date.now(), limitMs: 3600000, token: 'crafted-dead' })],
            ['invalid', (L) => {
                putLock(L, 'not json')
                fs.utimesSync(L, past, past)
            }],
            ['invalid', (L) => {
                fs.mkdirSync(L, { recursive: true }) //無持有者紀錄
                fs.utimesSync(L, past, past)
            }],
        ]
        for (let [why, put] of cases) {
            resetRoutes()
            let root = fx(`take-${why}`)
            let cacheRoot = path.join(root, 'bin-cache')
            put(lockDirOf(cacheRoot, `f/${sha(tool)}/tool.exe`))
            let tr = traceRec()
            let r = await ens(mf([fTool()]), { pkgRoot: root, onTrace: tr.on })
            assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true, why)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type.startsWith('lock-')).map((e) => [e.type, e.why]), [['lock-takeover', why]], why) //先接手、不等候
            assert.strict.equal(nHits(P_TOOL), 1, why)
            assert.strict.deepStrictEqual(locksIn(cacheRoot), [], why)
        }
    })

    it(`should reject with E_LOCK_TIMEOUT after waiting the limit derived from opt.totalMs for an alive holder, leaving the holder's lock as is (rule 19, V19, V20)`, async function() {
        for (let kind of ['file', 'bundle']) {
            resetRoutes()
            let root = fx(`timeout-${kind}`)
            let cacheRoot = path.join(root, 'bin-cache')
            let b = bPk()
            let m = kind === 'file' ? mf([fTool()]) : mf(null, [b])
            let name = kind === 'file' ? 'tool.exe' : 'pk'
            let L = lockDirOf(cacheRoot, kind === 'file' ? `f/${sha(tool)}/tool.exe` : `b/${bundleIdOf(b)}`)
            putLock(L, { pid: process.pid, at: Date.now(), limitMs: 3600000, token: 'crafted-alive' })
            let tr = traceRec()
            let ps = []
            //totalMs 300: 單一檔之等候上限為1次下載(300)＋寬裕(300)=600ms; 檔案組為2次下載＋1批解壓＋寬裕
            let e = await catchErr(ens(m, { pkgRoot: root, totalMs: 300, onTrace: tr.on, onProgress: (v) => ps.push(v) }))
            assert.strict.equal(e && e.code, 'E_LOCK_TIMEOUT', kind)
            assert.strict.deepStrictEqual([e.step, e.pkg, e.bin, e.holderPid], ['lock', 'w-l', name, process.pid])
            assert.strict.equal(e.message, `fsEnsureBins[w-l] ${kind}[${name}]: another process is getting the same ${kind} and did not finish within the wait limit (derived from opt.totalMs); retry later, or end the process holding the lock`)
            assert.strict.equal(e.message.includes(root) || e.message.includes(fdt) || e.message.includes(sha(tool)), false) //V20: 不帶路徑與雜湊
            assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'lock-wait').map((v) => v.phase), ['start', 'timeout'])
            assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'fail').map((v) => v.code), ['E_LOCK_TIMEOUT'])
            assert.strict.deepStrictEqual(ps.filter((v) => v.step === 'wait').map((v) => [v.name, v.pid]), [[name, process.pid]])
            assert.strict.equal(hits.length, 0) //未下載
            assert.strict.equal(ownerOf(L).token, 'crafted-alive') //他方之鎖原樣保留
            fsDeleteFolder(L)
        }
    })

    it(`should only wait by the host's pid when the lock holder's host is the same or unknown: a lock from another host expires only by its limit (rule 19)`, async function() {
        let exited = spawn(process.execPath, ['-e', ''], { windowsHide: true })
        let deadPid = exited.pid
        await new Promise((resolve) => exited.on('close', resolve))
        //他主機之鎖(其pid於本機不存在亦不可據以接手): 逾等候上限
        let root = fx('host-other')
        let L = lockDirOf(path.join(root, 'bin-cache'), `f/${sha(tool)}/tool.exe`)
        putLock(L, { pid: deadPid, host: 'OTHER-HOST', at: Date.now(), limitMs: 3600000, token: 'crafted-host' })
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, totalMs: 300, env: { COMPUTERNAME: 'THIS-HOST' } }))
        assert.strict.equal(e && e.code, 'E_LOCK_TIMEOUT')
        //同主機(不分大小寫)者依pid接手
        let root2 = fx('host-same')
        putLock(lockDirOf(path.join(root2, 'bin-cache'), `f/${sha(tool)}/tool.exe`), { pid: deadPid, host: 'this-host', at: Date.now(), limitMs: 3600000, token: 'crafted-host2' })
        let tr = traceRec()
        let r = await ens(mf([fTool()]), { pkgRoot: root2, totalMs: 300, env: { COMPUTERNAME: 'THIS-HOST' }, onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'lock-takeover').map((v) => v.why), ['dead'])
        fsDeleteFolder(L)
    })

    it(`should not remove a lock that another process put in place after taking this one over, when releasing (rule 19)`, async function() {
        let root = fx('not-mine')
        let cacheRoot = path.join(root, 'bin-cache')
        let L = lockDirOf(cacheRoot, `f/${sha(tool)}/tool.exe`)
        gate(P_TOOL)
        let tr = traceRec()
        let p = ens(mf([fTool()]), { pkgRoot: root, onTrace: tr.on })
        await tr.wait((e) => e.type === 'download')
        await waitHits(P_TOOL, 1)
        //模擬他程序接手: 移走本次之鎖, 放入他方之鎖
        fs.renameSync(L, `${L}-moved`)
        putLock(L, { pid: process.pid, at: Date.now(), limitMs: 3600000, token: 'crafted-other' })
        openGate(P_TOOL)
        let r = await p
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(ownerOf(L).token, 'crafted-other') //他方之鎖原樣保留
        fsDeleteFolder(L)
        fsDeleteFolder(`${L}-moved`)

        //更名前之token核對須單獨擋住: 即使移走後讀不到所移走者之紀錄(無從於移走後核對), 他方之鎖亦不得被移走刪除
        resetRoutes()
        let root2 = fx('not-mine-unreadable')
        let L2 = lockDirOf(path.join(root2, 'bin-cache'), `f/${sha(tool)}/tool.exe`)
        let fsAsideBusy = {
            ...fs,
            readFileSync: (p, ...a) => {
                if (String(p).includes('.rel-')) {
                    throw Object.assign(new Error('EPERM: operation not permitted, open'), { code: 'EPERM' })
                }
                return fs.readFileSync(p, ...a)
            },
        }
        gate(P_TOOL)
        let tr2 = traceRec()
        let p2 = ens(mf([fTool()]), { pkgRoot: root2, fs: fsAsideBusy, onTrace: tr2.on })
        await tr2.wait((e) => e.type === 'download')
        await waitHits(P_TOOL, 1)
        fs.renameSync(L2, `${L2}-moved`)
        putLock(L2, { pid: process.pid, at: Date.now(), limitMs: 3600000, token: 'crafted-other2' })
        openGate(P_TOOL)
        await p2
        assert.strict.equal(fs.existsSync(L2) && ownerOf(L2).token, 'crafted-other2')
        fsDeleteFolder(L2)
        fsDeleteFolder(`${L2}-moved`)
    })

    it(`should wait for a lock held by another get while offline without a mirror, then use the cache instead of reporting the file missing (rule 19, O1)`, async function() {
        let root = fx('offline-wait')
        gate(P_TOOL)
        let trA = traceRec()
        let trB = traceRec()
        let pA = ens(mf([fTool()]), { pkgRoot: root, onTrace: trA.on })
        await trA.wait((e) => e.type === 'download')
        await waitHits(P_TOOL, 1)
        let noNet = () => {
            throw new Error('network must not be used')
        }
        let pB = ens(mf([fTool()]), { pkgRoot: root, offline: true, mirror: '', fetch: noNet, onTrace: trB.on })
        await trB.wait((e) => e.type === 'lock-wait' && e.phase === 'start')
        openGate(P_TOOL)
        let [rA, rB] = await Promise.all([pA, pB])
        assert.strict.equal(rB['tool.exe'], rA['tool.exe'])
        assert.strict.deepStrictEqual(trB.events.filter((e) => e.type === 'lock-wait').map((e) => [e.phase, e.hit]), [['start', null], ['end', true]])
        assert.strict.equal(trB.events.some((e) => e.type === 'offline'), false)
        //無他方之鎖時照舊立即回報缺檔, 不建任何資料夾(規則10)
        let root2 = fx('offline-none')
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root2, offline: true, mirror: '' }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(fs.readdirSync(root2), [])
    })

    it(`should retry a lock rename that meets EPERM or EBUSY (Windows delete-pending), read errors of the holder record, and get without a lock when the lock can never be made (rule 19, role-command-windows §4)`, async function() {
        //建立之更名遇EPERM兩次、釋放之更名遇EBUSY兩次: 重試後成功, 不殘留
        let nNew = 0
        let nRel = 0
        let fsBusy = {
            ...fs,
            renameSync: (a, b) => {
                if (String(a).includes('.lock-') && String(a).includes('.new-') && nNew < 2) {
                    nNew++
                    throw Object.assign(new Error('EPERM: operation not permitted, rename'), { code: 'EPERM' })
                }
                if (String(b).includes('.rel-') && nRel < 2) {
                    nRel++
                    throw Object.assign(new Error('EBUSY: resource busy or locked, rename'), { code: 'EBUSY' })
                }
                return fs.renameSync(a, b)
            },
        }
        let root = fx('busy')
        let r = await ens(mf([fTool()]), { pkgRoot: root, fs: fsBusy })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual([nNew, nRel], [2, 2])
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')).filter((n) => n.startsWith('.')), [])
        assert.strict.deepStrictEqual(r.leftovers, [])

        //等候者讀持有者紀錄遇EPERM(他程序正更名): 視為占用續等, 持有者釋放後成功
        resetRoutes()
        let root2 = fx('busy-read')
        let nRead = 0
        let fsReadBusy = {
            ...fs,
            readFileSync: (p, ...a) => {
                if (String(p).endsWith('owner.json') && nRead < 3) {
                    nRead++
                    throw Object.assign(new Error('EPERM: operation not permitted, open'), { code: 'EPERM' })
                }
                return fs.readFileSync(p, ...a)
            },
        }
        gate(P_TOOL)
        let trA = traceRec()
        let trB = traceRec()
        let pA = ens(mf([fTool()]), { pkgRoot: root2, onTrace: trA.on })
        await trA.wait((e) => e.type === 'download')
        let pB = ens(mf([fTool()]), { pkgRoot: root2, fs: fsReadBusy, onTrace: trB.on })
        await trB.wait((e) => e.type === 'lock-wait' && e.phase === 'start')
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let [rA, rB] = await Promise.all([pA, pB])
        assert.strict.equal(rB['tool.exe'], rA['tool.exe'])
        assert.strict.equal(nRead >= 1, true)
        assert.strict.equal(nHits(P_TOOL), 1)
        assert.strict.deepStrictEqual(trB.events.some((e) => e.type === 'lock-takeover'), false) //讀取錯誤不當成無法解析之鎖而接手

        //建立之更名一律失敗(鎖不存在)逾10秒: 不加鎖照舊取得(通知lock-skip), 不殘留建立中之暫存
        resetRoutes()
        let root3 = fx('busy-never')
        let fsNever = {
            ...fs,
            renameSync: (a, b) => {
                if (String(a).includes('.new-')) {
                    throw Object.assign(new Error('EPERM: operation not permitted, rename'), { code: 'EPERM' })
                }
                return fs.renameSync(a, b)
            },
        }
        let tr3 = traceRec()
        let r3 = await ens(mf([fTool()]), { pkgRoot: root3, fs: fsNever, onTrace: tr3.on })
        assert.strict.equal(fs.readFileSync(r3['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(tr3.events.filter((e) => e.type.startsWith('lock-')).map((e) => [e.type, e.why]), [['lock-skip', 'busy']])
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root3, 'bin-cache')).filter((n) => n.startsWith('.')), [])
    }).timeout(120000)

    //---------------- 獨立複審(twsm2)之缺陷 D1～D3 ----------------

    it(`should treat an error reading the holder record other than bad JSON (EMFILE) as busy, not as an unreadable lock to take over (review D1)`, async function() {
        let root = fx('d1-emfile')
        let L = lockDirOf(path.join(root, 'bin-cache'), `f/${sha(tool)}/tool.exe`)
        putLock(L, { pid: process.pid, at: Date.now(), limitMs: 3600000, token: 'crafted-d1' })
        let past = new Date(Date.now() - 600000)
        fs.utimesSync(L, past, past) //資料夾修改時間逾無法解析之寬限
        let fsEmfile = {
            ...fs,
            readFileSync: (p, ...a) => {
                if (String(p).endsWith('owner.json')) {
                    throw Object.assign(new Error('EMFILE: too many open files, open'), { code: 'EMFILE' })
                }
                return fs.readFileSync(p, ...a)
            },
        }
        let tr = traceRec()
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fs: fsEmfile, totalMs: 300, onTrace: tr.on }))
        assert.strict.equal(e && e.code, 'E_LOCK_TIMEOUT') //存活之鎖不被接手
        assert.strict.equal(tr.events.some((v) => v.type === 'lock-takeover'), false)
        assert.strict.equal(ownerOf(L).token, 'crafted-d1')
        assert.strict.equal(hits.length, 0)
        fsDeleteFolder(L)
    })

    it(`should keep retrying a lock rename that meets EPERM for longer than ten tries (antivirus holding the new folder) and hold the lock (review D2)`, async function() {
        let root = fx('d2-retry')
        let nNew = 0
        let fsSlow = {
            ...fs,
            renameSync: (a, b) => {
                if (String(a).includes('.new-') && nNew < 20) {
                    nNew++
                    throw Object.assign(new Error('EPERM: operation not permitted, rename'), { code: 'EPERM' })
                }
                return fs.renameSync(a, b)
            },
        }
        gate(P_TOOL)
        let trA = traceRec()
        let trB = traceRec()
        let pA = ens(mf([fTool()]), { pkgRoot: root, fs: fsSlow, onTrace: trA.on })
        await trA.wait((e) => e.type === 'download')
        await waitHits(P_TOOL, 1)
        let pB = ens(mf([fTool()]), { pkgRoot: root, onTrace: trB.on })
        let first = await trB.wait(isStartOrDownload)
        assert.strict.deepStrictEqual([first.type, first.phase], ['lock-wait', 'start']) //A持有鎖, B等候
        openGate(P_TOOL)
        let [rA, rB] = await Promise.all([pA, pB])
        assert.strict.equal(rB['tool.exe'], rA['tool.exe'])
        assert.strict.deepStrictEqual([nNew, nHits(P_TOOL)], [20, 1])
        assert.strict.equal(trA.events.some((e) => e.type === 'lock-skip'), false)
        assert.strict.deepStrictEqual(locksIn(path.join(root, 'bin-cache')), [])
    })

    it(`should still release the lock when reading its own record meets EPERM more than ten times, verifying the record after moving it aside (review D3)`, async function() {
        let root = fx('d3-release')
        let nRead = 0
        let fsReadBusy = {
            ...fs,
            readFileSync: (p, ...a) => {
                if (String(p).endsWith('owner.json') && nRead < 12) {
                    nRead++
                    throw Object.assign(new Error('EPERM: operation not permitted, open'), { code: 'EPERM' })
                }
                return fs.readFileSync(p, ...a)
            },
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root, fs: fsReadBusy })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(nRead, 12)
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')).filter((n) => n.startsWith('.')), []) //鎖已釋放, 無.rel-殘留
        assert.strict.deepStrictEqual(r.leftovers, [])
    })

    it(`should move back a lock that another process put in place between reading the token and moving the lock aside when releasing (review D4)`, async function() {
        let root = fx('d4-swap')
        let L = lockDirOf(path.join(root, 'bin-cache'), `f/${sha(tool)}/tool.exe`)
        let swapped = false
        let fsSwap = {
            ...fs,
            renameSync: (a, b) => {
                if (String(b).includes('.rel-') && !swapped) {
                    //模擬他程序於本次讀token之後、更名之前接手並放入新鎖
                    swapped = true
                    fs.renameSync(L, `${L}-taken`)
                    putLock(L, { pid: process.pid, at: Date.now(), limitMs: 3600000, token: 'crafted-d4' })
                }
                return fs.renameSync(a, b)
            },
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root, fs: fsSwap })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(swapped, true)
        assert.strict.equal(ownerOf(L).token, 'crafted-d4') //所移走者不是本次之鎖: 移回原處
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')).filter((n) => n.includes('.rel-')), [])
        fsDeleteFolder(L)
        fsDeleteFolder(`${L}-taken`)
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace while waiting for a lock (R-TRACE-01 P3, P4)`, async function() {
        let kinds = {
            none: () => undefined,
            record: () => traceRec().on,
            throws: () => () => {
                throw new Error('observer failed')
            },
            rejects: () => () => Promise.reject(new Error('observer rejected')),
            notfun: () => 'abc',
        }
        let n0 = unhandled.length
        let base = null
        for (let k of Object.keys(kinds)) {
            resetRoutes()
            let root = fx(`five-${k}`)
            gate(P_TOOL)
            let trA = traceRec()
            let pA = ens(mf([fTool()]), { pkgRoot: root, onTrace: trA.on })
            await trA.wait((e) => e.type === 'download')
            let waiting = null
            let wB = new Promise((resolve) => {
                waiting = resolve
            })
            let cb = kinds[k]()
            let onProgress = (v) => {
                if (v.step === 'wait') {
                    waiting() //同步點: 等候者開始等候(onProgress, 不依賴onTrace)
                }
            }
            let pB = ens(mf([fTool()]), { pkgRoot: root, retryDelayMs: 11, ...(cb === undefined ? {} : { onTrace: cb }), onProgress })
            await wB
            await waitHits(P_TOOL, 1)
            openGate(P_TOOL)
            let [rA, rB] = await Promise.all([pA, pB])
            let s = { same: rB['tool.exe'] === rA['tool.exe'], ok: fs.readFileSync(rB['tool.exe']).equals(tool), hits: nHits(P_TOOL), locks: locksIn(path.join(root, 'bin-cache')), keys: Object.keys(rB) }
            if (base === null) {
                base = s
            }
            assert.strict.deepStrictEqual(s, base, k)
        }
        assert.strict.deepStrictEqual(base, { same: true, ok: true, hits: 1, locks: [], keys: ['tool.exe'] })
        await new Promise((resolve) => setImmediate(resolve))
        assert.strict.deepStrictEqual(unhandled.slice(n0), [])
    })

    it(`should notify the lock events as frozen objects of fixed primitive fields (R-TRACE-01 P4)`, async function() {
        let FIELDS = { 'lock-wait': ['name', 'phase', 'hit'], 'lock-takeover': ['name', 'why'], 'lock-skip': ['name', 'why'] }
        let root = fx('fields')
        putLock(lockDirOf(path.join(root, 'bin-cache'), `f/${sha(tool)}/tool.exe`), { pid: process.pid, at: Date.now() - 3600000, limitMs: 1000, token: 'crafted-f' })
        gate(P_TOOL)
        let trA = traceRec()
        let trB = traceRec()
        let pA = ens(mf([fTool()]), { pkgRoot: root, onTrace: trA.on })
        await trA.wait((e) => e.type === 'download')
        let pB = ens(mf([fTool()]), { pkgRoot: root, retryDelayMs: 11, onTrace: trB.on })
        await trB.wait((e) => e.type === 'lock-wait')
        openGate(P_TOOL)
        await Promise.all([pA, pB])
        let evs = [...trA.events, ...trB.events].filter((e) => e.type.startsWith('lock-'))
        assert.strict.deepStrictEqual(evs.map((e) => e.type).sort(), ['lock-takeover', 'lock-wait', 'lock-wait'])
        for (let e of evs) {
            assert.strict.equal(Object.isFrozen(e), true)
            assert.strict.deepStrictEqual(Object.keys(e).sort(), ['type', ...FIELDS[e.type]].sort())
            assert.strict.equal(Object.values(e).every((v) => v === null || ['string', 'number', 'boolean'].includes(typeof v)), true)
        }
    })

    //---------------- 排程第639項: 離線試取之清除與他程序之取得交錯(規則20; 以事件閘門決定性構造, 不以加壓或延時) ----------------

    it(`should not remove the <sha256> folder of another process's download when an offline call without a mirror misses (schedule 639 race 1, rule 20)`, async function() {
        let root = fx('race-nomirror')
        let cacheRoot = path.join(root, 'bin-cache')
        let fd = path.join(cacheRoot, sha(tool))
        gate(P_TOOL)
        //B: 離線且無鏡像(先離線試取之寫法); 停在判定缺檔(offline事件)之後、清除之前
        let gB = mkGate('b-offline')
        let B = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: { offline: true, mirror: '' }, gateTrace: [{ id: gB.id, type: 'offline', file: gB.file }] })
        await waitGate(B, gB.id)
        //A: 連網取得; 持鎖, 下載核心已建<sha256>夾而回應未至(尚無暫存檔, 夾為空)
        let A = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: {} })
        await A.tr.wait((e) => e.type === 'download')
        await waitHits(P_TOOL, 1)
        assert.strict.deepStrictEqual(fs.readdirSync(fd), [])
        passGate(gB)
        let rB = await B.done
        assert.strict.equal(rB.result && rB.result.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(B.tr.events.filter((e) => e.type === 'tidy').map((e) => e.n), [0]) //不刪他程序所建之夾(離線且無鏡像者不建任何夾, 不清)
        assert.strict.equal(fs.existsSync(fd), true)
        openGate(P_TOOL)
        let rA = await A.done
        assert.strict.equal(rA.result && rA.result.ok, true, JSON.stringify(rA.result)) //持有者之下載不因他方之清除而失敗(舊碼: ENOENT而E_FS)
        assert.strict.equal(rA.result.out['tool.exe'].ok, true)
        assert.strict.equal(nHits(P_TOOL), 1)
        assert.strict.equal(A.tr.events.some((e) => e.type === 'lock-skip'), false)
        assert.strict.deepStrictEqual(locksIn(cacheRoot), [])
    })

    it(`should clear its own empty <sha256> folder only while holding the lock when an offline call with a mirror misses, not the folder of a later holder (schedule 639 race 2, rule 20)`, async function() {
        let root = fx('race-mirror')
        let cacheRoot = path.join(root, 'bin-cache')
        let fd = path.join(cacheRoot, sha(tool))
        let mirror = path.join(root, 'mirror')
        fs.mkdirSync(mirror)
        let MP = `/mirror404/w-l/${sha(tool)}/tool.exe` //http鏡像回404: 下載核心先建<sha256>夾再請求, 缺檔時本單位之夾為空而須清除
        gate(P_TOOL)
        //B: 離線且有http鏡像(404); 每次刪除本檔之<sha256>夾之前皆停(第1次、第2次各一個閘門)
        let gB = mkGate('b-rmdir-fd')
        let gB2 = mkGate('b-rmdir-fd-2')
        let gFd = (g) => ({ id: g.id, op: 'rmdirSync', path: fd, when: 'before', file: g.file })
        let B = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: { offline: true, mirror: `http://127.0.0.1:${port}/mirror404` }, gateFs: [gFd(gB), gFd(gB2)] })
        await waitGate(B, gB.id)
        assert.strict.equal(nHits(MP), 1)
        //A: 連網取得(新碼: B仍持鎖而A等候; 舊碼: B已釋放而A持鎖下載, 其<sha256>夾為空)
        let A = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: {} })
        let first = await A.tr.wait(isStartOrDownload)
        if (first.type === 'download') {
            await waitHits(P_TOOL, 1)
        }
        passGate(gB)
        //B若於釋放鎖後再刪本檔之<sha256>夾(第2次): 待A持鎖下載(其夾為空)後才放行, 使交錯決定性成立
        if ((await gateOrDone(B, gB2.id)) === 'gate') {
            await waitHits(P_TOOL, 1)
            passGate(gB2)
        }
        let rB = await B.done
        assert.strict.equal(rB.result && rB.result.code, 'E_OFFLINE_MISSING')
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let rA = await A.done
        assert.strict.equal(rA.result && rA.result.ok, true, JSON.stringify(rA.result)) //持有者之下載不因他方之清除而失敗
        assert.strict.equal(nHits(P_TOOL), 1)
        assert.strict.deepStrictEqual([first.type, first.phase], ['lock-wait', 'start']) //本單位之夾於持鎖時清除: 其間他程序等候
        let nTidy = B.tr.events.filter((e) => e.type === 'tidy').map((e) => e.n)
        assert.strict.equal(nTidy.length === 1 && nTidy[0] >= 1, true, JSON.stringify(nTidy)) //B清除自己(下載核心)所建之空夾(釋放後快取根若為空亦清, 故為1或2)
        assert.strict.deepStrictEqual(locksIn(cacheRoot), [])
    })

    it(`should rebuild a cache root removed between creating it and creating the lock, so another process's clearing never causes lock-skip (schedule 639 race 3, rule 20)`, async function() {
        let root = fx('race-root')
        let cacheRoot = path.join(root, 'bin-cache')
        let mirror = path.join(root, 'mirror')
        fs.mkdirSync(mirror)
        gate(P_TOOL)
        //B: 離線且有本地鏡像(無此檔); 已釋放鎖, 停在刪除空快取根之前
        let gB = mkGate('b-rmdir-root')
        let B = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: { offline: true, mirror }, gateFs: [{ id: gB.id, op: 'rmdirSync', path: cacheRoot, when: 'before', file: gB.file }] })
        await waitGate(B, gB.id)
        //A: 連網取得; 停在建鎖時「已建快取根、尚未建鎖之暫存夾」
        let gA = mkGate('a-mkdir-root')
        let A = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: {}, gateFs: [{ id: gA.id, op: 'mkdirSync', path: cacheRoot, when: 'after', file: gA.file }] })
        await waitGate(A, gA.id)
        passGate(gB)
        let rB = await B.done
        assert.strict.equal(rB.result && rB.result.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fs.existsSync(cacheRoot), false) //B照舊清除本次新建之空快取根(無他方之內容)
        passGate(gA)
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let rA = await A.done
        assert.strict.equal(rA.result && rA.result.ok, true, JSON.stringify(rA.result))
        assert.strict.deepStrictEqual(A.tr.events.filter((e) => e.type === 'lock-skip').map((e) => e.why), []) //快取根被刪後重建再建鎖, 不因他程序之清除而不加鎖(舊碼: lock-skip fail)
        assert.strict.equal(nHits(P_TOOL), 1)
        assert.strict.deepStrictEqual(locksIn(cacheRoot), [])
    })

    it(`should not touch a cache root that another process has just created when an offline call without a mirror misses (schedule 639 race 3b, rule 20)`, async function() {
        let root = fx('race-root-nomirror')
        let cacheRoot = path.join(root, 'bin-cache')
        gate(P_TOOL)
        //B: 離線且無鏡像; 快取根於其開始時尚不存在, 停在判定缺檔之後
        let gB = mkGate('b-offline-root')
        let B = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: { offline: true, mirror: '' }, gateTrace: [{ id: gB.id, type: 'offline', file: gB.file }] })
        await waitGate(B, gB.id)
        //A: 停在「已建快取根(此刻為空)、尚未建鎖之暫存夾」
        let gA = mkGate('a-mkdir-root-2')
        let A = spawnChild({ pkgRoot: root, manifest: mf([fTool()]), opt: {}, gateFs: [{ id: gA.id, op: 'mkdirSync', path: cacheRoot, when: 'after', file: gA.file }] })
        await waitGate(A, gA.id)
        assert.strict.deepStrictEqual(fs.readdirSync(cacheRoot), [])
        passGate(gB)
        let rB = await B.done
        assert.strict.equal(rB.result && rB.result.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fs.existsSync(cacheRoot), true) //離線且無鏡像者不清除: 他程序剛建之快取根不動
        assert.strict.deepStrictEqual(B.tr.events.filter((e) => e.type === 'tidy').map((e) => e.n), [0])
        passGate(gA)
        await waitHits(P_TOOL, 1)
        openGate(P_TOOL)
        let rA = await A.done
        assert.strict.equal(rA.result && rA.result.ok, true, JSON.stringify(rA.result))
        assert.strict.equal(A.tr.events.some((e) => e.type === 'lock-skip'), false)
    })

    it(`should not fail the download of another file with the same sha256 (another name, another lock) when an offline call clears the shared empty <sha256> folder (schedule 639, review twsm3 D1)`, async function() {
        let root = fx('race-samesha')
        let cacheRoot = path.join(root, 'bin-cache')
        let fd = path.join(cacheRoot, sha(tool))
        let P_COPY = `${RAW1}bin/toolcopy.exe`
        routes[P_COPY] = tool
        let m = mf([fTool(), { name: 'toolcopy.exe', path: 'bin/toolcopy.exe', sha256: sha(tool), size: tool.length }])
        gate(P_COPY)
        //B: 離線且有http鏡像(404)取tool.exe; 持其鎖時停在刪除共用之<sha256>夾之前
        let gB = mkGate('b-rmdir-shared')
        let B = spawnChild({ pkgRoot: root, manifest: m, opt: { offline: true, mirror: `http://127.0.0.1:${port}/mirror404`, names: 'tool.exe' }, gateFs: [{ id: gB.id, op: 'rmdirSync', path: fd, when: 'before', file: gB.file }] })
        await waitGate(B, gB.id)
        //A: 連網取toolcopy.exe(同一sha256, 另一把鎖); 下載核心已建(用)<sha256>夾而回應未至
        let A = spawnChild({ pkgRoot: root, manifest: m, opt: { names: 'toolcopy.exe' } })
        await A.tr.wait((e) => e.type === 'download')
        await waitHits(P_COPY, 1)
        assert.strict.deepStrictEqual(fs.readdirSync(fd), [])
        passGate(gB)
        let rB = await B.done
        assert.strict.equal(rB.result && rB.result.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fs.existsSync(fd), false) //B持tool.exe之鎖時清除了共用之空夾
        openGate(P_COPY)
        let rA = await A.done
        assert.strict.equal(rA.result && rA.result.ok, true, JSON.stringify(rA.result)) //A之下載核心建暫存檔遇ENOENT而再試一次, 不失敗
        assert.strict.equal(rA.result.out['toolcopy.exe'].ok, true)
        assert.strict.equal(nHits(P_COPY), 2)
        assert.strict.deepStrictEqual(locksIn(cacheRoot), [])
    })

    it(`should retry moving the extracted file into the cache when its <sha256> folder disappears just before (ENOENT; schedule 639)`, async function() {
        let root = fx('enoent-place')
        let fpFinal = path.join(root, 'bin-cache', sha(exe), 'k6.exe')
        let nPlace = 0
        let fsPlace = {
            ...fs,
            renameSync: (a, b) => {
                if (String(b) === fpFinal && nPlace === 0) {
                    nPlace++
                    fs.rmdirSync(path.dirname(fpFinal)) //目的夾(空)於建立之後被刪
                }
                return fs.renameSync(a, b)
            },
        }
        let r = await ens(mf([fK6()]), { pkgRoot: root, fs: fsPlace })
        assert.strict.equal(r['k6.exe'], fpFinal)
        assert.strict.equal(fs.readFileSync(fpFinal).equals(exe), true)
        assert.strict.equal(nPlace, 1)
    })

    //---------------- 排程第634項①: 確定無主之暫存夾與暫存檔之清除 ----------------

    let deadPidOf = async () => {
        let cp = spawn(process.execPath, ['-e', ''], { windowsHide: true })
        await new Promise((resolve) => cp.on('close', resolve))
        return cp.pid
    }
    let aliveChild = () => {
        let cp = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { windowsHide: true, stdio: 'ignore' })
        kids.push(cp)
        return cp
    }

    it(`should remove .work-<pid>-* and <sha256>/*.<pid>.*.part of processes that are gone when it holds the lock, keeping those of alive, lock-holding and own processes (schedule 634 ①, rule 20)`, async function() {
        let root = fx('orphan')
        let cacheRoot = path.join(root, 'bin-cache')
        let fd = path.join(cacheRoot, sha(tool))
        let dead = await deadPidOf()
        let dead2 = await deadPidOf()
        let alive = aliveChild()
        fs.mkdirSync(fd, { recursive: true })
        //他主機之持有者(其pid於本機不存在)之鎖: 其暫存不得清除
        putLock(lockDirOf(cacheRoot, `f/${sha(exe)}/k6.exe`), { pid: dead2, host: 'OTHER-HOST', at: Date.now(), limitMs: 3600000, token: 'crafted-remote' })
        //修改時間: 除fresh外皆為一天前(已不在之行程之暫存須逾本單位之預算才清, 他主機之行程於本機亦為不存在, 以時間排除其使用中者)
        let works = { dead: `.work-${dead}-aa11`, alive: `.work-${alive.pid}-bb22`, claimed: `.work-${dead2}-cc33`, own: `.work-${process.pid}-dd44`, fresh: `.work-${dead}-ll22` }
        let parts = { dead: `tool.exe.${dead}.ee55.part`, alive: `tool.exe.${alive.pid}.ff66.part`, claimed: `tool.exe.${dead2}.gg77.part`, otherName: `tool2.exe.${dead}.mm33.part` }
        let lastPart = `manifest-last.json.${dead}.nn44.part`
        let old = new Date(Date.now() - 86400000)
        for (let [k, n] of Object.entries(works)) {
            fs.mkdirSync(path.join(cacheRoot, n, 'x'), { recursive: true })
            if (k !== 'fresh') {
                fs.utimesSync(path.join(cacheRoot, n), old, old)
            }
        }
        for (let n of Object.values(parts)) {
            fs.writeFileSync(path.join(fd, n), 'partial')
            fs.utimesSync(path.join(fd, n), old, old)
        }
        fs.writeFileSync(path.join(cacheRoot, lastPart), '{}')
        fs.utimesSync(path.join(cacheRoot, lastPart), old, old)
        let tr = traceRec()
        let r = await ens(mf([fTool()]), { pkgRoot: root, onTrace: tr.on, env: { COMPUTERNAME: 'THIS-HOST' } })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(Object.entries(works).map(([k, n]) => [k, fs.existsSync(path.join(cacheRoot, n))]), [['dead', false], ['alive', true], ['claimed', true], ['own', true], ['fresh', true]])
        assert.strict.deepStrictEqual(Object.entries(parts).map(([k, n]) => [k, fs.existsSync(path.join(fd, n))]), [['dead', false], ['alive', true], ['claimed', true], ['otherName', true]]) //只認本檔之檔名
        assert.strict.equal(fs.existsSync(path.join(cacheRoot, lastPart)), false)
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'lock-orphan').map((e) => [e.work, e.part]), [[1, 2]])
        alive.kill()
    })

    it(`should remove the temporary folder and files of a holder taken over for being over its limit, though its pid is alive (schedule 634 ①)`, async function() {
        let root = fx('orphan-expired')
        let cacheRoot = path.join(root, 'bin-cache')
        let fd = path.join(cacheRoot, sha(tool))
        let held = aliveChild() //逾上限之持有者(pid存活)
        let other = aliveChild() //另一個存活之行程(非本次接手者)
        fs.mkdirSync(fd, { recursive: true })
        putLock(lockDirOf(cacheRoot, `f/${sha(tool)}/tool.exe`), { pid: held.pid, at: Date.now() - 3600000, limitMs: 1000, token: 'crafted-expired2' })
        fs.mkdirSync(path.join(cacheRoot, `.work-${held.pid}-hh88`))
        fs.mkdirSync(path.join(cacheRoot, `.work-${other.pid}-ii99`))
        fs.writeFileSync(path.join(fd, `tool.exe.${held.pid}.jj00.part`), 'partial')
        let tr = traceRec()
        let r = await ens(mf([fTool()]), { pkgRoot: root, onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type.startsWith('lock-')).map((e) => e.type), ['lock-takeover', 'lock-orphan'])
        assert.strict.deepStrictEqual([fs.existsSync(path.join(cacheRoot, `.work-${held.pid}-hh88`)), fs.existsSync(path.join(fd, `tool.exe.${held.pid}.jj00.part`)), fs.existsSync(path.join(cacheRoot, `.work-${other.pid}-ii99`))], [false, false, true])
        held.kill()
        other.kill()
    })

    it(`should leave no temporary folder of a killed holder after a waiter takes over (multiple processes, zip; schedule 634 ①)`, async function() {
        let root = fx('orphan-killed')
        let cacheRoot = path.join(root, 'bin-cache')
        gate(P_K6)
        let ks = Array.from({ length: 3 }, () => spawnChild({ pkgRoot: root, manifest: mf([fK6()]), opt: {} }))
        let got = await waitStarts(ks, 2)
        await waitHits(P_K6, 1)
        let iHolder = ks.findIndex((k, i) => !got.has(i))
        let h = ks[iHolder]
        assert.strict.deepStrictEqual(workIn(cacheRoot).filter((n) => n.startsWith(`.work-${h.pid}-`)).length, 1) //持鎖者之暫存夾(下載中)
        h.cp.kill()
        await h.done
        openGate(P_K6)
        let waiters = ks.filter((k, i) => i !== iHolder)
        let rs = await Promise.all(waiters.map((k) => k.done))
        assert.strict.deepStrictEqual(rs.map((r) => r.result && r.result.ok), [true, true])
        assert.strict.deepStrictEqual(workIn(cacheRoot), []) //被終止者之暫存夾已由接手者清除
        let orphans = waiters.flatMap((k) => k.tr.events.filter((e) => e.type === 'lock-orphan'))
        assert.strict.deepStrictEqual(orphans.map((e) => e.work), [1])
        assert.strict.deepStrictEqual(locksIn(cacheRoot), [])
    })

    it(`should remove the temporary folder of a process that is gone when it holds the lock of a bundle (schedule 634 ①)`, async function() {
        let root = fx('orphan-bundle')
        let cacheRoot = path.join(root, 'bin-cache')
        let dead = await deadPidOf()
        fs.mkdirSync(path.join(cacheRoot, `.work-${dead}-kk11`, 'b'), { recursive: true })
        let old = new Date(Date.now() - 86400000)
        fs.utimesSync(path.join(cacheRoot, `.work-${dead}-kk11`), old, old)
        let tr = traceRec()
        let r = await ens(mf(null, [bPk()]), { pkgRoot: root, onTrace: tr.on })
        assert.strict.equal(fs.existsSync(path.join(r.pk, 'tool.exe')), true)
        assert.strict.deepStrictEqual(workIn(cacheRoot), [])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'lock-orphan').map((e) => [e.name, e.work, e.part]), [['pk', 1, 0]])
    })

    it(`should rebuild the cache root and retry when it disappears before creating the work folder or the copy of the trunk manifest (schedule 639, rule 20)`, async function() {
        //暫存夾: 建立時遇ENOENT(快取根剛被他程序之離線清除刪掉)一次 → 重建快取根再試, 照常取得
        let root = fx('enoent-work')
        let nWork = 0
        let fsWork = {
            ...fs,
            mkdirSync: (p, ...a) => {
                if (String(p).includes('.work-') && nWork === 0) {
                    nWork++
                    throw Object.assign(new Error('ENOENT: no such file or directory, mkdir'), { code: 'ENOENT' })
                }
                return fs.mkdirSync(p, ...a)
            },
        }
        let r = await ens(mf([fK6()]), { pkgRoot: root, fs: fsWork })
        assert.strict.equal(fs.readFileSync(r['k6.exe']).equals(exe), true)
        assert.strict.equal(nWork, 1)
        //主幹清單之副本: 暫存檔開檔遇ENOENT一次 → 重建快取根再試, 副本照常寫入
        resetRoutes()
        let root2 = fx('enoent-last')
        let mfF = { schema: 1, pkg: 'w-l', mode: 'floating', repo: 'yuda-lyu/w-l', files: [{ name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(tool), size: tool.length }] }
        routes['/raw.githubusercontent.com/yuda-lyu/w-l/master/bin/manifest.json'] = Buffer.from(JSON.stringify(mfF))
        routes['/raw.githubusercontent.com/yuda-lyu/w-l/master/bin/tool.exe'] = tool
        let nLast = 0
        let fsLast = {
            ...fs,
            openSync: (p, ...a) => {
                if (String(p).includes('manifest-last.json.') && nLast === 0) {
                    nLast++
                    throw Object.assign(new Error('ENOENT: no such file or directory, open'), { code: 'ENOENT' })
                }
                return fs.openSync(p, ...a)
            },
        }
        let tr = traceRec()
        let r2 = await ens(mfF, { pkgRoot: root2, fs: fsLast, onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r2['tool.exe']).equals(tool), true)
        assert.strict.equal(nLast, 1)
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'last').map((e) => e.ok), [true])
        assert.strict.equal(fs.existsSync(path.join(root2, 'bin-cache', 'manifest-last.json')), true)
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})
