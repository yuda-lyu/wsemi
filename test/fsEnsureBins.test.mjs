import fs from 'fs'
import http from 'http'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import EventEmitter from 'events'
import { spawn, execFile } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEnsureBins from '../src/fsEnsureBins.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import zipStore from './tools/zipStore.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


//防懸置上限用模組載入時保存之真實計時器: 假時鐘(useFakeClock)會取代globalThis.setTimeout/clearTimeout(規格P5③)
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec)§3~§6與§8 T3~T8之wsemi層; 規則帳本R-BIN-ENSURE-01; 各案註解標明對應之規格條號
//全部不連外網: 清單內之https網址一律經注入之fetch改指本機HTTP服務(port 8811), 鏡像為本地資料夾或本機HTTP服務
describe(`fsEnsureBins with a local server`, function() {
    this.timeout(60000)

    let port = 8811
    let fdt = path.resolve('./test/_tmp/fsEnsureBins')
    let server = null
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let C2 = 'fedcba9876543210fedcba9876543210fedcba98'
    let tool = Buffer.from(Array.from({ length: 20000 }, (v, i) => (i * 7) % 256))
    let toolBad = Buffer.from(tool)
    toolBad[100] = (toolBad[100] + 1) % 256 //同長度、內容不同
    let tool2 = Buffer.from(Array.from({ length: 15000 }, (v, i) => (i * 13) % 256))
    let exe = Buffer.from(Array.from({ length: 30000 }, (v, i) => (i * 3) % 256))
    let zip = zipStore([{ name: 'k6-v1/k6.exe', data: exe }, { name: 'k6-v1/LICENSE', data: Buffer.from('license') }])
    let ffexe = Buffer.from(Array.from({ length: 40000 }, (v, i) => (i * 11) % 256))
    let ffzip = zipStore([{ name: 'ff/ffmpeg.exe', data: ffexe }])
    let n3 = Math.ceil(ffzip.length / 3)
    let ffparts = [ffzip.subarray(0, n3), ffzip.subarray(n3, n3 * 2), ffzip.subarray(n3 * 2)]
    let RAW1 = `/raw.githubusercontent.com/yuda-lyu/w-t/${C1}/`
    let VURL = 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'

    //routes, 本機HTTP服務之內容, 鍵為路徑(https網址經fetch改指後之路徑), 值為Buffer或處理函數
    let routes = {}
    let hits = []
    let fetchCalls = []
    let resetRoutes = () => {
        routes = {
            [`${RAW1}bin/tool.exe`]: tool,
            [`${RAW1}bin/bad.exe`]: toolBad,
            [`${RAW1}bin/ff.zip.001`]: ffparts[0],
            [`${RAW1}bin/ff.zip.002`]: ffparts[1],
            [`${RAW1}bin/ff.zip.003`]: ffparts[2],
            '/github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip': zip,
        }
        hits = []
        fetchCalls = []
    }
    let mapFetch = (u, init) => {
        fetchCalls.push(String(u))
        return globalThis.fetch(String(u).replace(/^https:\/\//, `http://127.0.0.1:${port}/`), init)
    }
    let failFetch = (u) => {
        fetchCalls.push(String(u))
        throw new Error(`network must not be used: ${u}`)
    }

    let mf = (files, over = {}) => {
        return { schema: 1, pkg: 'w-t', mode: 'pinned', repo: 'yuda-lyu/w-t', commit: C1, files, ...over }
    }
    let fTool = (over = {}) => {
        return { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(tool), size: tool.length, ...over }
    }
    let fK6 = (over = {}) => {
        return { name: 'k6.exe', url: VURL, sha256: sha(zip), size: zip.length, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: sha(exe), size: exe.length }, ...over }
    }
    let fFf = (over = {}) => {
        return {
            name: 'ffmpeg.exe',
            parts: ffparts.map((b, i) => {
                return { path: `bin/ff.zip.00${i + 1}`, sha256: sha(b), size: b.length }
            }),
            assembled: { type: 'zip', sha256: sha(ffzip), size: ffzip.length },
            extract: { type: 'zip', member: 'ff/ffmpeg.exe', sha256: sha(ffexe), size: ffexe.length },
            ...over,
        }
    }

    //fx, 每案專用之套件根目錄
    let nfx = 0
    let fx = (name) => {
        nfx++
        let fd = path.join(fdt, `${nfx}-${name}`)
        fs.mkdirSync(fd, { recursive: true })
        return fd
    }
    let cachePath = (root, buf, name) => {
        return path.join(root, 'bin-cache', sha(buf), name)
    }

    //ens, 呼叫Core並注入Node模組, 環境變數預設空(不受開發機之環境變數影響)
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

    //walk, 列出資料夾內所有項目(相對路徑), 不跟隨連結
    let walk = (fd) => {
        let r = []
        let f = (d, rel) => {
            if (!fs.existsSync(d)) {
                return
            }
            for (let n of fs.readdirSync(d)) {
                let p = path.join(d, n)
                let q = rel ? `${rel}/${n}` : n
                r.push(q)
                if (fs.lstatSync(p).isDirectory()) {
                    f(p, q)
                }
            }
        }
        f(fd, '')
        return r
    }
    let leftovers = (fd) => {
        return walk(fd).filter((v) => {
            return v.endsWith('.part') || v.split('/').some((s) => {
                return s.startsWith('.work-')
            })
        })
    }

    before(async function() {
        process.on('unhandledRejection', onUnhandled)
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
        server = http.createServer((req, res) => {
            hits.push(req.url)
            let h = routes[req.url]
            if (h === undefined) {
                res.writeHead(404, { 'content-type': 'text/plain' })
                res.end('not found')
                return
            }
            if (typeof h === 'function') {
                h(req, res)
                return
            }
            res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(h.length) })
            res.end(h)
        })
        await new Promise((resolve) => {
            server.listen(port, '127.0.0.1', resolve)
        })
    })

    after(async function() {
        await new Promise((resolve) => {
            server.close(resolve)
        })
        fsDeleteFolder(fdt)
        process.removeListener('unhandledRejection', onUnhandled)
    })

    beforeEach(function() {
        resetRoutes()
    })

    //---------------- T3 首次下載→校驗→快取; 第二次不連網 ----------------

    it(`should download an own file from the pinned commit into <pkgRoot>/bin-cache/<sha256>/<name> and return its absolute path (T3, D3, O2③, E1)`, async function() {
        let root = fx('t3')
        let r = await ens(mf([fTool()]), { pkgRoot: root })
        //E1: 回傳{ [name]: 絕對路徑 }
        assert.strict.deepStrictEqual(Object.keys(r), ['tool.exe'])
        assert.strict.equal(r['tool.exe'], cachePath(root, tool, 'tool.exe'))
        assert.strict.equal(path.isAbsolute(r['tool.exe']), true)
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        //O2③: 自有檔之網址為raw.githubusercontent.com/<repo>/<commit>/<path>
        assert.strict.deepStrictEqual(fetchCalls, [`https://raw.githubusercontent.com/yuda-lyu/w-t/${C1}/bin/tool.exe`])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should not use the network on the second call: cache hit is verified (T3, D4)`, async function() {
        let root = fx('t3b')
        let r1 = await ens(mf([fTool()]), { pkgRoot: root })
        let r2 = await ens(mf([fTool()]), { pkgRoot: root, fetch: failFetch })
        assert.strict.equal(r2['tool.exe'], r1['tool.exe'])
        assert.strict.deepStrictEqual(fetchCalls.length, 1) //只有第一次之下載
    })

    it(`should hash a cached file once per process while its identity is unchanged, and again after it changes (D4)`, async function() {
        let root = fx('memo')
        let fp = cachePath(root, tool, 'tool.exe')
        let reads = 0
        let fsCount = {
            ...fs,
            createReadStream: (p, ...a) => {
                if (p === fp) {
                    reads++
                }
                return fs.createReadStream(p, ...a)
            },
        }
        //他人放入之快取檔: 首次使用須雜湊1次
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tool)
        await ens(mf([fTool()]), { pkgRoot: root, fs: fsCount, fetch: failFetch })
        assert.strict.equal(reads, 1)
        //識別未變: 不重複雜湊
        await ens(mf([fTool()]), { pkgRoot: root, fs: fsCount, fetch: failFetch })
        await ens(mf([fTool()]), { pkgRoot: root, fs: fsCount, fetch: failFetch })
        assert.strict.equal(reads, 1)
        //內容改寫(同內容亦然, 識別改變): 重新雜湊
        let t = new Date(Date.now() + 5000)
        fs.utimesSync(fp, t, t)
        await ens(mf([fTool()]), { pkgRoot: root, fs: fsCount, fetch: failFetch })
        assert.strict.equal(reads, 2)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should return only the files in opt.names, a string or an array (E1)`, async function() {
        let root = fx('names')
        let m = mf([fTool(), fK6()])
        let r1 = await ens(m, { pkgRoot: root, names: 'tool.exe' })
        assert.strict.deepStrictEqual(Object.keys(r1), ['tool.exe'])
        assert.strict.deepStrictEqual(fetchCalls.length, 1)
        let r2 = await ens(m, { pkgRoot: root, names: ['k6.exe', 'tool.exe', 'k6.exe'] })
        assert.strict.deepStrictEqual(Object.keys(r2).sort(), ['k6.exe', 'tool.exe'])
        let e = await catchErr(ens(m, { pkgRoot: root, names: ['nope.exe'] }))
        assert.strict.equal(e.code, 'E_ARG')
        assert.strict.equal(e.message.includes('nope.exe'), true)
    })

    it(`should read the manifest from a JSON file relative to opt.pkgRoot (M1, E2①)`, async function() {
        let root = fx('jsonfile')
        fs.mkdirSync(path.join(root, 'bin'), { recursive: true })
        fs.writeFileSync(path.join(root, 'bin', 'manifest.json'), `\uFEFF${JSON.stringify(mf([fTool()]), null, 2)}`)
        let r = await ens('bin/manifest.json', { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        let e = await catchErr(ens('bin/none.json', { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step], ['E_MANIFEST', 'manifest'])
        fs.writeFileSync(path.join(root, 'bin', 'bad.json'), '{ not json')
        e = await catchErr(ens('bin/bad.json', { pkgRoot: root }))
        assert.strict.equal(e.code, 'E_MANIFEST')
    })

    //---------------- T4 雜湊或大小不符→拒用、不留檔 ----------------

    it(`should reject a downloaded file whose sha256 differs and leave no file (T4, O2)`, async function() {
        let root = fx('t4hash')
        let e = await catchErr(ens(mf([fTool({ path: 'bin/bad.exe' })]), { pkgRoot: root, maxAttempts: 1 }))
        assert.strict.deepStrictEqual([e.code, e.pkg, e.bin, e.source], ['E_HASH_MISMATCH', 'w-t', 'tool.exe', 'github'])
        assert.strict.equal(e.message.startsWith('fsEnsureBins[w-t] file[tool.exe] from github: '), true)
        assert.strict.equal(fs.existsSync(cachePath(root, tool, 'tool.exe')), false)
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject a downloaded file whose size differs and leave no file (T4, M2)`, async function() {
        let root = fx('t4size')
        let e = await catchErr(ens(mf([fTool({ size: tool.length + 1 })]), { pkgRoot: root, maxAttempts: 1 }))
        assert.strict.equal(e.code, 'E_SIZE_MISMATCH')
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')).filter((v) => {
            return v.endsWith('tool.exe') || v.endsWith('.part')
        }), [])
    })

    it(`should reject with the HTTP error of the source when it is missing (D2)`, async function() {
        let root = fx('t4http')
        let e = await catchErr(ens(mf([fTool({ path: 'bin/none.exe' })]), { pkgRoot: root, maxAttempts: 1 }))
        assert.strict.deepStrictEqual([e.code, e.status], ['E_HTTP', 404])
    })

    //---------------- T7 快取檔被竄改→重新取得 ----------------

    it(`should delete a tampered cached file and get it again (T7, D4)`, async function() {
        let root = fx('t7')
        let r1 = await ens(mf([fTool()]), { pkgRoot: root })
        fs.writeFileSync(r1['tool.exe'], toolBad) //同大小、內容不同
        let t = new Date(Date.now() + 5000)
        fs.utimesSync(r1['tool.exe'], t, t) //改動之時間戳(Windows時鐘粒度約15ms, 緊接之寫入可能與更名時同值; 同行程內保留識別之改動為已知限制)
        let ev = []
        let r2 = await ens(mf([fTool()]), { pkgRoot: root, onProgress: (v) => ev.push(v) })
        assert.strict.equal(fs.readFileSync(r2['tool.exe']).equals(tool), true)
        assert.strict.equal(fetchCalls.length, 2)
        assert.strict.equal(ev.some((v) => {
            return v.step === 'cache' && v.hit === false && v.reason === 'mismatch'
        }), true)
    })

    it(`should delete a tampered cached file even when it can not be got again offline (T7, D4, O3)`, async function() {
        let root = fx('t7off')
        let r1 = await ens(mf([fTool()]), { pkgRoot: root })
        fs.writeFileSync(r1['tool.exe'], Buffer.concat([tool, Buffer.from('x')])) //大小不同
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, offline: true }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fs.existsSync(r1['tool.exe']), false)
    })

    it(`should replace a symbolic link at the cache path instead of trusting it (D4)`, async function() {
        let root = fx('t7link')
        let fp = cachePath(root, tool, 'tool.exe')
        let target = path.join(root, 'elsewhere.exe')
        fs.writeFileSync(target, tool)
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        try {
            fs.symlinkSync(target, fp, 'file')
        }
        catch (err) {
            this.skip() //無建立符號連結之權限(Windows未開發人員模式)
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root })
        assert.strict.equal(fs.lstatSync(r['tool.exe']).isSymbolicLink(), false)
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(fs.readFileSync(target).equals(tool), true) //連結目標不動
        assert.strict.equal(fetchCalls.length, 1)
    })

    it(`should reject E_FS when the cache path is a folder, without removing it (D4)`, async function() {
        let root = fx('t7dir')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.join(fp, 'inner'), { recursive: true })
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fetch: failFetch }))
        assert.strict.deepStrictEqual([e.code, e.step], ['E_FS', 'cache'])
        assert.strict.equal(fs.existsSync(path.join(fp, 'inner')), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    //---------------- T5 鏡像 ----------------

    let putMirror = (mirror, buf, name, pkg = 'w-t', shaOf = buf) => {
        let fp = path.join(mirror, pkg, sha(shaOf), name)
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, buf)
        return fp
    }

    it(`should get a file from a local mirror folder <mirror>/<pkg>/<sha256>/<name> without the network (T5, O1, O2②)`, async function() {
        let root = fx('t5')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tool, 'tool.exe')
        let r = await ens(mf([fTool()]), { pkgRoot: root, mirror, fetch: failFetch })
        assert.strict.equal(r['tool.exe'], cachePath(root, tool, 'tool.exe'))
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject a tampered mirror file, leave no file and fall back to GitHub when online (T5, O2)`, async function() {
        let root = fx('t5bad')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, toolBad, 'tool.exe', 'w-t', tool) //放在正確sha256之位置但內容不同
        let ev = []
        let r = await ens(mf([fTool()]), { pkgRoot: root, mirror, onProgress: (v) => ev.push(v) })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(fetchCalls.length, 1)
        let rej = ev.find((v) => {
            return v.step === 'mirror' && v.result === 'rejected'
        })
        assert.strict.equal(rej.error.includes('E_HASH_MISMATCH'), true)
    })

    it(`should reject a tampered mirror file offline with E_OFFLINE_MISSING that notes the rejection, leaving no file (T5, T6, O3)`, async function() {
        let root = fx('t5badoff')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, toolBad, 'tool.exe', 'w-t', tool)
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, mirror, offline: true }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(e.missing[0].reasons.length, 1)
        assert.strict.equal(e.message.includes('was rejected'), true)
        assert.strict.equal(fs.existsSync(cachePath(root, tool, 'tool.exe')), false)
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should use W_BIN_MIRROR when opt.mirror is not given, and opt.mirror '' disables it (O1, E1)`, async function() {
        let root = fx('t5env')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tool, 'tool.exe')
        let r = await ens(mf([fTool()]), { pkgRoot: root, env: { W_BIN_MIRROR: mirror }, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        let root2 = fx('t5env2')
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root2, env: { W_BIN_MIRROR: mirror }, mirror: '', fetch: failFetch, maxAttempts: 1 }))
        assert.strict.equal(e.code, 'E_NETWORK') //不用鏡像而連網(failFetch)
        assert.strict.equal(fetchCalls.length, 1)
    })

    it(`should get a file from an http mirror and fall back to GitHub on 404 (T5, O1)`, async function() {
        let root = fx('t5http')
        routes[`/mirror/w-t/${sha(tool)}/tool.exe`] = tool
        let r = await ens(mf([fTool()]), { pkgRoot: root, mirror: `http://127.0.0.1:${port}/mirror/` })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(hits, [`/mirror/w-t/${sha(tool)}/tool.exe`])
        let root2 = fx('t5http404')
        hits = []
        let r2 = await ens(mf([fK6()]), { pkgRoot: root2, mirror: `http://127.0.0.1:${port}/mirror` })
        assert.strict.equal(fs.readFileSync(r2['k6.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(hits, [`/mirror/w-t/${sha(exe)}/k6.exe`, `/mirror/w-t/${sha(zip)}/k6-v1.zip`, '/github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'])
    })

    it(`should reject a tampered file of an http mirror (T5, O2)`, async function() {
        let root = fx('t5httpbad')
        routes[`/mirror/w-t/${sha(tool)}/tool.exe`] = toolBad
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, mirror: `http://127.0.0.1:${port}/mirror`, offline: true }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(e.missing[0].reasons[0].includes('E_HASH_MISMATCH'), true)
        assert.strict.equal(fs.existsSync(cachePath(root, tool, 'tool.exe')), false)
    })

    it(`should serve the cache folder made with W_BIN_CACHE as a mirror (O4, D3)`, async function() {
        let shared = fx('o4shared')
        let root = fx('o4a')
        let r = await ens(mf([fTool(), fK6()]), { pkgRoot: root, env: { W_BIN_CACHE: shared } })
        assert.strict.equal(r['tool.exe'], path.join(shared, 'w-t', sha(tool), 'tool.exe'))
        assert.strict.equal(r['k6.exe'], path.join(shared, 'w-t', sha(exe), 'k6.exe'))
        let root2 = fx('o4b')
        let spawned = 0
        let r2 = await ens(mf([fTool(), fK6()]), {
            pkgRoot: root2,
            env: { W_BIN_MIRROR: shared, W_BIN_OFFLINE: '1' },
            fetch: failFetch,
            spawn: (...a) => {
                spawned++
                return spawn(...a)
            },
        })
        assert.strict.equal(r2['k6.exe'], cachePath(root2, exe, 'k6.exe'))
        assert.strict.equal(fs.readFileSync(r2['k6.exe']).equals(exe), true)
        assert.strict.equal(spawned, 0) //鏡像已有解出之最終檔, 不需解壓
        assert.strict.deepStrictEqual(fetchCalls.length, 2) //只有第一次之兩個下載
    })

    //---------------- T6 離線 ----------------

    it(`should reject E_OFFLINE_MISSING without the network, listing name, sha256, size, the cache and mirror paths and how to prepare (T6, O3)`, async function() {
        let root = fx('t6')
        let mirror = path.join(root, 'mirror')
        let e = await catchErr(ens(mf([fTool(), fK6()]), { pkgRoot: root, offline: true, mirror, fetch: failFetch }))
        assert.strict.deepStrictEqual([e.code, e.step, e.pkg], ['E_OFFLINE_MISSING', 'offline', 'w-t'])
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.equal(e.missing.length, 2) //多個缺檔一併回報
        let m = e.missing[0]
        assert.strict.deepStrictEqual([m.name, m.sha256, m.size], ['tool.exe', sha(tool), tool.length])
        assert.strict.equal(m.cachePath, cachePath(root, tool, 'tool.exe'))
        assert.strict.equal(m.mirrorPath, path.join(mirror, 'w-t', sha(tool), 'tool.exe'))
        for (let s of ['tool.exe', sha(tool), `${tool.length} bytes`, m.cachePath, m.mirrorPath, 'k6.exe', sha(exe), 'k6-v1.zip', sha(zip), VURL, 'how to prepare', 'W_BIN_CACHE', 'W_BIN_MIRROR']) {
            assert.strict.equal(e.message.includes(s), true, s)
        }
        assert.strict.equal(e.missing[1].archive.name, 'k6-v1.zip')
    })

    it(`should name the mirror structure in E_OFFLINE_MISSING when no mirror is set (T6, O3)`, async function() {
        let root = fx('t6nomirror')
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, offline: true, fetch: failFetch }))
        assert.strict.equal(e.missing[0].mirrorPath, null)
        assert.strict.equal(e.message.includes(`<W_BIN_MIRROR>/w-t/${sha(tool)}/tool.exe`), true)
    })

    it(`should read W_BIN_OFFLINE as 1 or true, and let opt.offline override it (O3, E1)`, async function() {
        let root = fx('t6env')
        for (let v of ['1', 'true', 'TRUE', ' 1 ']) {
            let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, env: { W_BIN_OFFLINE: v }, fetch: failFetch }))
            assert.strict.equal(e.code, 'E_OFFLINE_MISSING', v)
        }
        assert.strict.deepStrictEqual(fetchCalls, [])
        let r = await ens(mf([fTool()]), { pkgRoot: root, env: { W_BIN_OFFLINE: '1' }, offline: false })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: fx('t6env0'), env: { W_BIN_OFFLINE: '0' }, fetch: failFetch }))
        assert.strict.equal(e.code, 'E_NETWORK') //'0'不是離線
    })

    //---------------- D5 解壓 ----------------

    it(`should extract the member of a vendor zip in a work folder, verify it and move it into the cache (D5)`, async function() {
        let root = fx('zip')
        let ev = []
        let r = await ens(mf([fK6()]), { pkgRoot: root, onProgress: (v) => ev.push(v.step) })
        assert.strict.equal(r['k6.exe'], cachePath(root, exe, 'k6.exe'))
        assert.strict.equal(fs.readFileSync(r['k6.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(fetchCalls, [VURL])
        //快取只有最終檔(壓縮檔與暫存夾皆不留)
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [sha(exe), `${sha(exe)}/k6.exe`])
        assert.strict.deepStrictEqual(ev, ['download', 'extract', 'ready'])
    })

    it(`should reject an extracted member whose sha256 or size differs from extract, leaving nothing (D5)`, async function() {
        let root = fx('zipbad')
        let e = await catchErr(ens(mf([fK6({ extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: sha(tool), size: exe.length } })]), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin], ['E_HASH_MISMATCH', 'extract', 'k6.exe'])
        let e2 = await catchErr(ens(mf([fK6({ extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: sha(exe), size: exe.length + 1 } })]), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_SIZE_MISMATCH', 'extract'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
    })

    it(`should reject E_EXTRACT when the member is not in the archive or is not a regular file (D5)`, async function() {
        let root = fx('zipmember')
        let e = await catchErr(ens(mf([fK6({ extract: { type: 'zip', member: 'k6-v1/none.exe', sha256: sha(exe), size: exe.length } })]), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step], ['E_EXTRACT', 'extract'])
        let zl = zipStore([{ name: 'k6-v1/k6.exe', data: Buffer.from('../outside.exe'), symlink: true }])
        routes['/github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'] = zl
        let e2 = await catchErr(ens(mf([fK6({ sha256: sha(zl), size: zl.length })]), { pkgRoot: root }))
        assert.strict.equal(e2.code, 'E_EXTRACT')
        assert.strict.deepStrictEqual(leftovers(root), [])
        assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', 'outside.exe')), false)
    })

    it(`should reject E_EXTRACT when the extraction program is missing or fails (D5)`, async function() {
        let root = fx('zipspawn')
        let calls = []
        let fake = (mode) => {
            return (...a) => {
                calls.push(a)
                let cp = new EventEmitter()
                cp.stderr = new EventEmitter()
                cp.kill = () => {}
                setImmediate(() => {
                    if (mode === 'enoent') {
                        let err = new Error('spawn tar ENOENT')
                        err.code = 'ENOENT'
                        cp.emit('error', err)
                        cp.emit('close', -2)
                    }
                    else {
                        cp.stderr.emit('data', 'tar: something failed')
                        cp.emit('close', 2)
                    }
                })
                return cp
            }
        }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, spawn: fake('enoent') }))
        assert.strict.equal(e.code, 'E_EXTRACT')
        assert.strict.equal(e.message.includes('not available'), true)
        let e2 = await catchErr(ens(mf([fK6()]), { pkgRoot: root, spawn: fake('fail') }))
        assert.strict.equal(e2.code, 'E_EXTRACT')
        assert.strict.equal(e2.message.includes('tar: something failed'), true)
        //參數為暫存夾內之相對路徑, 解壓程式於Windows為System32之tar.exe
        let [prog, args, o] = calls[0]
        assert.strict.deepStrictEqual(args, ['-x', '-f', 'archive/k6-v1.zip', '-C', 'x', '--', 'k6-v1/k6.exe'])
        assert.strict.equal(o.windowsHide, true)
        if (process.platform === 'win32') {
            assert.strict.equal(/System32[\\/]tar\.exe$/i.test(prog), true)
        }
        assert.strict.deepStrictEqual(leftovers(root), [])
        assert.strict.equal(fs.existsSync(cachePath(root, exe, 'k6.exe')), false)
    })

    it(`should extract from an archive found in the mirror while offline (D5, O1, O3)`, async function() {
        let root = fx('zipmirror')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, zip, 'k6-v1.zip')
        let r = await ens(mf([fK6()]), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['k6.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    //---------------- S4/M1 分割壓縮檔 ----------------

    it(`should get each part, verify it, assemble them in order, verify assembled and extract (S4, D5)`, async function() {
        let root = fx('parts')
        let r = await ens(mf([fFf()]), { pkgRoot: root })
        assert.strict.equal(r['ffmpeg.exe'], cachePath(root, ffexe, 'ffmpeg.exe'))
        assert.strict.equal(fs.readFileSync(r['ffmpeg.exe']).equals(ffexe), true)
        assert.strict.deepStrictEqual(fetchCalls, [1, 2, 3].map((i) => {
            return `https://raw.githubusercontent.com/yuda-lyu/w-t/${C1}/bin/ff.zip.00${i}`
        }))
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [sha(ffexe), `${sha(ffexe)}/ffmpeg.exe`])
    })

    it(`should reject a part whose sha256 differs, and an assembled archive whose sha256 differs (S4, D5)`, async function() {
        let root = fx('partsbad')
        let m = fFf()
        m.parts[1].sha256 = sha(tool)
        let e = await catchErr(ens(mf([m]), { pkgRoot: root, maxAttempts: 1 }))
        assert.strict.deepStrictEqual([e.code, e.bin], ['E_HASH_MISMATCH', 'ffmpeg.exe'])
        let m2 = fFf({ assembled: { type: 'zip', sha256: sha(tool), size: ffzip.length } })
        let e2 = await catchErr(ens(mf([m2]), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_HASH_MISMATCH', 'assemble'])
        //分割順序錯置: 各分割皆通過, 組合後不符
        let m3 = fFf()
        m3.parts = [m3.parts[1], m3.parts[0], m3.parts[2]]
        let e3 = await catchErr(ens(mf([m3]), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e3.code, e3.step], ['E_HASH_MISMATCH', 'assemble'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
    })

    it(`should list the parts in E_OFFLINE_MISSING of a split archive (O3, S4)`, async function() {
        let root = fx('partsoff')
        let e = await catchErr(ens(mf([fFf()]), { pkgRoot: root, offline: true, fetch: failFetch }))
        assert.strict.equal(e.missing[0].parts.length, 3)
        assert.strict.equal(e.message.includes('ff.zip.002'), true)
    })

    //---------------- 併發 ----------------

    it(`should share one get among concurrent calls in the same process for the same file`, async function() {
        let root = fx('share')
        routes[`${RAW1}bin/tool.exe`] = (req, res) => {
            setTimeout(() => {
                res.writeHead(200, { 'content-length': String(tool.length) })
                res.end(tool)
            }, 300)
        }
        let rs = await Promise.all([1, 2, 3].map(() => {
            return ens(mf([fTool()]), { pkgRoot: root })
        }))
        assert.strict.equal(hits.length, 1)
        assert.strict.equal(rs[0]['tool.exe'], rs[2]['tool.exe'])
    })

    it(`should not let processes read a half-written file when they get the same file at once (temp file and atomic rename)`, async function() {
        let root = fx('procs')
        let fpm = path.join(root, 'manifest.json')
        fs.writeFileSync(fpm, JSON.stringify(mf([fTool(), fK6()])))
        //分段慢送, 使各行程之下載重疊
        routes[`${RAW1}bin/tool.exe`] = (req, res) => {
            res.writeHead(200, { 'content-length': String(tool.length) })
            res.write(tool.subarray(0, 5000))
            setTimeout(() => {
                res.end(tool.subarray(5000))
            }, 400)
        }
        let child = path.resolve('./test/tools/ensureBinsChild.mjs')
        let run = () => {
            return new Promise((resolve) => {
                execFile(process.execPath, [child, String(port), root, fpm], { windowsHide: true, timeout: 50000 }, (err, stdout) => {
                    resolve(err ? { ok: false, err: String(err) } : JSON.parse(stdout.trim().split('\n').pop()))
                })
            })
        }
        let rs = await Promise.all([run(), run(), run()])
        for (let r of rs) {
            assert.strict.equal(r.ok, true, JSON.stringify(r))
            assert.strict.deepStrictEqual([r.out['tool.exe'].ok, r.out['k6.exe'].ok], [true, true])
        }
        assert.strict.equal(fs.readFileSync(cachePath(root, tool, 'tool.exe')).equals(tool), true)
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    //---------------- M5/T8 主幹模式 ----------------

    let mfF = (files, over = {}) => {
        return { schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', files, ...over }
    }
    let fT = (buf, commit) => {
        return { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(buf), size: buf.length, _c: commit }
    }
    let strip = (f) => {
        let { _c, ...r } = f
        return r
    }
    let RAWF = '/raw.githubusercontent.com/yuda-lyu/w-f/'
    let setFloating = (remote) => {
        routes[`${RAWF}${C1}/bin/tool.exe`] = tool
        routes[`${RAWF}${C2}/bin/tool.exe`] = tool2
        if (remote !== undefined) {
            routes[`${RAWF}master/bin/manifest.json`] = typeof remote === 'string' ? Buffer.from(remote) : Buffer.from(JSON.stringify(remote))
        }
    }

    it(`should get the trunk manifest from raw.githubusercontent.com/<repo>/master/<manifestPath> and keep a copy of the last success (M5)`, async function() {
        let root = fx('m5')
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        let base = mfF([strip(fT(tool))], { commit: C1 })
        let r = await ens(base, { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.deepStrictEqual(fetchCalls, ['https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json', `https://raw.githubusercontent.com/yuda-lyu/w-f/${C2}/bin/tool.exe`])
        let last = JSON.parse(fs.readFileSync(path.join(root, 'bin-cache', 'manifest-last.json'), 'utf8'))
        assert.strict.equal(last.files[0].sha256, sha(tool2))
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should fall back to the baseline manifest when the trunk manifest can not be got (T8, M5)`, async function() {
        let root = fx('t8')
        setFloating() //主幹清單404
        let ev = []
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, onProgress: (v) => ev.push(v) })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(ev.find((v) => v.step === 'manifest' && v.error).error.includes('HTTP 404'), true)
        assert.strict.equal(ev.some((v) => v.step === 'manifest' && v.source === 'baseline'), true)
        assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', 'manifest-last.json')), false)
    })

    it(`should fall back to the baseline even when a copy of the last successful trunk manifest exists, and not trust a tampered copy (T8, M5, D4)`, async function() {
        let root = fx('t8last')
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        let base = mfF([strip(fT(tool))], { commit: C1 })
        let r1 = await ens(base, { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r1['tool.exe']).equals(tool2), true)
        delete routes[`${RAWF}master/bin/manifest.json`] //之後取不到
        //快取夾內之副本被改為指向他檔(並放入該檔): 不得作為校驗依據(T8: 失敗→基準)
        let fpLast = path.join(root, 'bin-cache', 'manifest-last.json')
        fs.writeFileSync(fpLast, JSON.stringify(mfF([{ ...strip(fT(toolBad)) }], { commit: C2 })))
        fs.mkdirSync(path.join(root, 'bin-cache', sha(toolBad)), { recursive: true })
        fs.writeFileSync(path.join(root, 'bin-cache', sha(toolBad), 'tool.exe'), toolBad)
        let r = await ens(base, { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        //離線: 不取主幹清單, 用基準清單(其檔已於上一步取得)
        fetchCalls = []
        let r2 = await ens(base, { pkgRoot: root, offline: true, fetch: failFetch })
        assert.strict.equal(r2['tool.exe'], r['tool.exe'])
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should not use a trunk manifest that fails the schema check or is for another package (M5)`, async function() {
        let bads = [
            '{ not json',
            JSON.stringify(mfF([{ ...strip(fT(tool2)), sha256: 'x' }], { commit: C2 })),
            JSON.stringify(mfF([strip(fT(tool2))], { commit: C2, extra: 1 })),
            JSON.stringify(mfF([strip(fT(tool2))], { commit: C2, pkg: 'w-other' })),
            JSON.stringify(mfF([strip(fT(tool2))], { commit: C2, repo: 'someone/w-f' })),
            JSON.stringify(mfF([{ name: 'tool.exe', url: 'https://github.com/a/b/releases/latest/download/tool.exe', sha256: sha(tool2), size: tool2.length }])),
        ]
        for (let b of bads) {
            let root = fx('m5bad')
            setFloating(b)
            let ev = []
            let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, onProgress: (v) => ev.push(v) })
            assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true, b)
            assert.strict.equal(ev.some((v) => v.step === 'manifest' && v.source === 'baseline'), true, b)
            assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', 'manifest-last.json')), false, b)
        }
    })

    it(`should use opt.floatingManifestUrl only under the GitHub raw url of the same repo, and the master branch for own files without a commit (M5)`, async function() {
        let root = fx('m5url')
        routes[`${RAWF}dev/x/manifest.json`] = Buffer.from(JSON.stringify(mfF([strip(fT(tool2))])))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, floatingManifestUrl: 'https://raw.githubusercontent.com/yuda-lyu/w-f/dev/x/manifest.json' })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.deepStrictEqual(fetchCalls, ['https://raw.githubusercontent.com/yuda-lyu/w-f/dev/x/manifest.json', 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/tool.exe'])
        //信任錨為GitHub主幹: 他主機或他repo之網址為E_ARG, 不發請求
        for (let u of ['https://example.com/x/manifest.json', 'https://raw.githubusercontent.com/someone/w-f/master/bin/manifest.json']) {
            fetchCalls = []
            let e = await catchErr(ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('m5url-bad'), floatingManifestUrl: u }))
            assert.strict.equal(e && e.code, 'E_ARG', u)
            assert.strict.deepStrictEqual(fetchCalls, [], u)
        }
    })

    it(`should not get a trunk manifest larger than 1MB (M5)`, async function() {
        let root = fx('m5big')
        setFloating(' '.repeat(1024 * 1024 + 10))
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
    })

    //---------------- E3 錯誤與帳密遮罩 ----------------

    it(`should mask the credentials of a mirror url in messages and fields (E3)`, async function() {
        let root = fx('mask')
        let mirror = `http://user:s3cretPW@127.0.0.1:${port}/mirror`
        //未給opt.fetch: 不得帶帳密(全域fetch不支援), E_ARG且訊息遮蔽
        let e = await catchErr(fsEnsureBinsCore(mf([fTool()]), { fs, path, crypto, Readable, pipeline, spawn, env: { W_BIN_MIRROR: mirror }, pkgRoot: root }))
        assert.strict.equal(e.code, 'E_ARG')
        assert.strict.equal(e.message.includes('s3cretPW'), false)
        assert.strict.equal(e.message.includes('***@'), true)
        //給opt.fetch: 鏡像檔被竄改而離線, 訊息、missing、進度皆不含密碼
        routes[`/mirror/w-t/${sha(tool)}/tool.exe`] = toolBad
        let seen = []
        let ev = []
        let f = (u, init) => {
            seen.push(String(u))
            let x = new URL(u)
            x.username = ''
            x.password = ''
            return globalThis.fetch(x.href, init)
        }
        let e2 = await catchErr(ens(mf([fTool()]), { pkgRoot: root, mirror, offline: true, fetch: f, onProgress: (v) => ev.push(v) }))
        assert.strict.equal(e2.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(seen[0].includes('s3cretPW'), true) //認證交給傳入之fetch
        assert.strict.equal(JSON.stringify({ m: e2.message, x: e2.missing, ev }).includes('s3cretPW'), false)
        assert.strict.equal(e2.missing[0].mirrorPath.includes('***@'), true)
    })

    it(`should mask the credentials of a manifest url in the E_MANIFEST message (E3, M2)`, async function() {
        let e = await catchErr(ens(mf([fK6({ url: 'https://u:s3cretPW@github.com/a/b/releases/download/v1/k6.zip' })]), { pkgRoot: fx('maskm') }))
        assert.strict.equal(e.code, 'E_MANIFEST')
        assert.strict.equal(e.message.includes('s3cretPW'), false)
    })

    //---------------- M1/M2 清單schema之錯誤路徑(E_MANIFEST) ----------------

    let C = (fn) => {
        return () => {
            let m = mf([fTool(), fK6(), fFf()])
            fn(m)
            return m
        }
    }
    let manifestBads = [
        ['not an object', () => 'x'.length, '(root)'],
        ['an array', () => [], '(root)'],
        ['schema 2', C((m) => {
            m.schema = 2
        }), 'schema'],
        ['pkg with a slash', C((m) => {
            m.pkg = '../w-t'
        }), 'pkg'],
        ['pkg uppercase', C((m) => {
            m.pkg = 'W-T'
        }), 'pkg'],
        ['mode unknown', C((m) => {
            m.mode = 'latest'
        }), 'mode'],
        ['repo without owner', C((m) => {
            m.repo = 'w-t'
        }), 'repo'],
        ['commit short', C((m) => {
            m.commit = 'abc123'
        }), 'commit'],
        ['commit uppercase', C((m) => {
            m.commit = C1.toUpperCase()
        }), 'commit'],
        ['commit missing with path in pinned mode', C((m) => {
            delete m.commit
        }), 'commit'],
        ['files empty', C((m) => {
            m.files = []
        }), 'files'],
        ['unknown root field', C((m) => {
            m.extra = 1
        }), '(root).extra'],
        ['unknown file field (typo)', C((m) => {
            m.files[0].sah256 = 'x'
        }), 'files[0].sah256'],
        ['name with a path', C((m) => {
            m.files[0].name = '../tool.exe'
        }), 'files[0].name'],
        ['name with backslash', C((m) => {
            m.files[0].name = 'a\\tool.exe'
        }), 'files[0].name'],
        ['name reserved device', C((m) => {
            m.files[0].name = 'con.exe'
        }), 'files[0].name'],
        ['name ending with a dot', C((m) => {
            m.files[0].name = 'tool.'
        }), 'files[0].name'],
        ['name duplicate ignoring case', C((m) => {
            m.files[1].name = 'TOOL.exe'
        }), 'files[1].name'],
        ['both path and url', C((m) => {
            m.files[0].url = VURL
        }), 'files[0]'],
        ['neither path nor url', C((m) => {
            delete m.files[0].path
        }), 'files[0]'],
        ['path with ..', C((m) => {
            m.files[0].path = 'bin/../x.exe'
        }), 'files[0].path'],
        ['path absolute', C((m) => {
            m.files[0].path = '/bin/tool.exe'
        }), 'files[0].path'],
        ['path with backslash', C((m) => {
            m.files[0].path = 'bin\\tool.exe'
        }), 'files[0].path'],
        ['url http', C((m) => {
            m.files[1].url = 'http://github.com/a/b/releases/download/v1/k6.zip'
        }), 'files[1].url'],
        ['url releases/latest', C((m) => {
            m.files[1].url = 'https://github.com/a/b/releases/latest/download/k6.zip'
        }), 'files[1].url'],
        ['url releases/latest api form', C((m) => {
            m.files[1].url = 'https://github.com/a/b/Releases/%6Catest'
        }), 'files[1].url'],
        ['url releases/latest with a query', C((m) => {
            m.files[1].url = 'https://github.com/a/b/releases/latest/download/k6.zip?x=1'
        }), 'files[1].url'],
        ['url releases%2Flatest encoded slash', C((m) => {
            m.files[1].url = 'https://github.com/a/b/releases%2Flatest/download/k6.zip'
        }), 'files[1].url'],
        ['url raw master branch', C((m) => {
            m.files[1].url = 'https://raw.githubusercontent.com/a/b/master/bin/k6.zip'
        }), 'files[1].url'],
        ['url github raw main branch', C((m) => {
            m.files[1].url = 'https://github.com/a/b/raw/main/bin/k6.zip'
        }), 'files[1].url'],
        ['url refs/heads', C((m) => {
            m.files[1].url = 'https://github.com/a/b/raw/refs/heads/dev/bin/k6.zip'
        }), 'files[1].url'],
        ['url not a url', C((m) => {
            m.files[1].url = 'k6.zip'
        }), 'files[1].url'],
        ['name a String wrapper', C((m) => {
            m.files[0].name = new String('tool.exe') // eslint-disable-line no-new-wrappers
        }), 'files[0].name'],
        ['path an object converting to a string', C((m) => {
            m.files[0].path = { [Symbol.toPrimitive]: () => 'bin/tool.exe' }
        }), 'files[0].path'],
        ['url a String wrapper', C((m) => {
            m.files[1].url = new String(VURL) // eslint-disable-line no-new-wrappers
        }), 'files[1].url'],
        ['member an object converting to a string', C((m) => {
            let n = 0
            m.files[1].extract.member = { [Symbol.toPrimitive]: () => (n++ === 0 ? 'k6-v1/k6.exe' : '-P') }
        }), 'files[1].extract.member'],
        ['sha256 a String wrapper', C((m) => {
            m.files[0].sha256 = new String(sha(tool)) // eslint-disable-line no-new-wrappers
        }), 'files[0].sha256'],
        ['sha256 63 chars', C((m) => {
            m.files[0].sha256 = sha(tool).slice(1)
        }), 'files[0].sha256'],
        ['sha256 not hex', C((m) => {
            m.files[0].sha256 = 'g'.repeat(64)
        }), 'files[0].sha256'],
        ['size missing', C((m) => {
            delete m.files[0].size
        }), 'files[0].size'],
        ['size negative', C((m) => {
            m.files[0].size = -1
        }), 'files[0].size'],
        ['size fractional', C((m) => {
            m.files[0].size = 1.5
        }), 'files[0].size'],
        ['size string', C((m) => {
            m.files[0].size = '20000'
        }), 'files[0].size'],
        ['extract type tar', C((m) => {
            m.files[1].extract.type = 'tar'
        }), 'files[1].extract.type'],
        ['extract member with ..', C((m) => {
            m.files[1].extract.member = '../k6.exe'
        }), 'files[1].extract.member'],
        ['extract member with a glob', C((m) => {
            m.files[1].extract.member = 'k6-v1/*.exe'
        }), 'files[1].extract.member'],
        ['extract sha256 missing', C((m) => {
            delete m.files[1].extract.sha256
        }), 'files[1].extract.sha256'],
        ['parts without assembled', C((m) => {
            delete m.files[2].assembled
        }), 'files[2].assembled'],
        ['parts without extract', C((m) => {
            delete m.files[2].extract
        }), 'files[2].extract'],
        ['parts with a top-level sha256', C((m) => {
            m.files[2].sha256 = sha(tool)
        }), 'files[2]'],
        ['parts empty', C((m) => {
            m.files[2].parts = []
        }), 'files[2].parts'],
        ['part duplicate name', C((m) => {
            m.files[2].parts[1].path = 'other/ff.zip.001'
        }), 'files[2].parts[1].name'],
        ['part sha256 invalid', C((m) => {
            m.files[2].parts[0].sha256 = 'x'
        }), 'files[2].parts[0].sha256'],
        ['assembled without parts', C((m) => {
            m.files[0].assembled = { type: 'zip', sha256: sha(tool), size: 1 }
        }), 'files[0].assembled'],
        ['assembled type', C((m) => {
            m.files[2].assembled.type = '7z'
        }), 'files[2].assembled.type'],
        ['file not an object', C((m) => {
            m.files[0] = 'tool.exe'
        }), 'files[0]'],
        ['note not a string', C((m) => {
            m.files[0].note = 1
        }), 'files[0].note'],
    ]
    for (let [label, mk, field] of manifestBads) {
        it(`should reject E_MANIFEST before any download or folder creation: ${label} (M1, M2, E3)`, async function() {
            let root = fx('bad')
            let e = await catchErr(ens(mk(), { pkgRoot: root, fetch: failFetch }))
            assert.strict.deepStrictEqual([e.code, e.step], ['E_MANIFEST', 'manifest'], String(e && e.message))
            assert.strict.equal(e.field, field, e.message)
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(fs.readdirSync(root), [])
        })
    }

    it(`should accept a valid manifest of every source form, and a floating manifest without a commit (M1)`, async function() {
        let root = fx('good')
        let e = await catchErr(ens(mf([fTool({ note: 'built from srcVB' }), fK6(), fFf({ parts: fFf().parts.map((p, i) => ({ ...p, name: `ff.zip.00${i + 1}` })) })], { note: 'n', version: '1' }), { pkgRoot: root, offline: true, fetch: failFetch }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING') //清單有效(離線缺檔)
        let e2 = await catchErr(ens(mfF([strip(fT(tool))]), { pkgRoot: root, offline: true, fetch: failFetch }))
        assert.strict.equal(e2.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(e2.missing[0].url, 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/tool.exe')
    })

    it(`should reject E_MANIFEST when reading the manifest object throws`, async function() {
        let m = mf([fTool()])
        Object.defineProperty(m, 'files', {
            enumerable: true,
            get() {
                throw new Error('getter failed')
            },
        })
        let e = await catchErr(ens(m, { pkgRoot: fx('getter') }))
        assert.strict.deepStrictEqual([e.code, e.field], ['E_MANIFEST', '(root)'])
    })

    //---------------- E1 參數(E_ARG) ----------------

    let argBads = [
        ['pkgRoot missing', { pkgRoot: undefined }],
        ['pkgRoot empty', { pkgRoot: '' }],
        ['offline not a boolean', { offline: 1 }],
        ['fetch not a function', { fetch: 'x' }],
        ['onProgress not a function', { onProgress: 1 }],
        ['names empty array', { names: [] }],
        ['names with a non-string', { names: [1] }],
        ['cacheDir not a string', { cacheDir: 1 }],
        ['mirror ftp', { mirror: 'ftp://host/bins' }],
        ['mirror file url', { mirror: 'file:///C:/bins' }],
        ['mirror with a query', { mirror: 'https://host/bins?x=1' }],
        ['floatingManifestUrl http', { floatingManifestUrl: 'http://host/manifest.json' }],
        ['floatingManifestUrl with credentials', { floatingManifestUrl: 'https://u:p@host/manifest.json' }],
        ['fs without lstatSync', { fs: { ...fs, lstatSync: undefined } }],
        ['fs without realpathSync that the download needs', { fs: { ...fs, realpathSync: undefined } }],
        ['Readable without fromWeb', { Readable: { toWeb: Readable.toWeb, from: Readable.from } }],
        ['spawn missing', { spawn: null }],
        ['offline a Boolean wrapper', { offline: new Boolean(false) }], // eslint-disable-line no-new-wrappers
        ['pkgRoot a String wrapper', { pkgRoot: new String('x') }], // eslint-disable-line no-new-wrappers
        ['names with a String wrapper', { names: [new String('tool.exe')] }], // eslint-disable-line no-new-wrappers
    ]
    for (let [label, o] of argBads) {
        it(`should reject E_ARG without any download: ${label} (E1, E3)`, async function() {
            let root = fx('arg')
            let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fetch: failFetch, ...o }))
            assert.strict.deepStrictEqual([e.code, e.step], ['E_ARG', 'argument'], String(e && e.message))
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(fs.readdirSync(root), [])
        })
    }

    it(`should reject E_ARG when opt can not be read`, async function() {
        let o = {}
        Object.defineProperty(o, 'pkgRoot', {
            enumerable: true,
            get() {
                throw new Error('getter failed')
            },
        })
        let e = await catchErr(fsEnsureBins(mf([fTool()]), o))
        assert.strict.equal(e.code, 'E_ARG')
        let p = Proxy.revocable({}, {})
        p.revoke()
        let e2 = await catchErr(fsEnsureBins(mf([fTool()]), p.proxy))
        assert.strict.equal(e2.code, 'E_ARG')
    })

    //---------------- 其他 ----------------

    it(`should place the cache by opt.cacheDir before W_BIN_CACHE (D3)`, async function() {
        let root = fx('cachedir')
        let cd = path.join(root, 'cd')
        let r = await ens(mf([fTool()]), { pkgRoot: root, cacheDir: cd, env: { W_BIN_CACHE: path.join(root, 'shared') } })
        assert.strict.equal(r['tool.exe'], path.join(cd, sha(tool), 'tool.exe'))
        assert.strict.equal(fs.existsSync(path.join(root, 'shared')), false)
    })

    it(`should ignore errors thrown by onProgress`, async function() {
        let root = fx('progress')
        let r = await ens(mf([fTool()]), {
            pkgRoot: root,
            onProgress: () => {
                throw new Error('progress failed')
            },
        })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        let r2 = await ens(mf([fTool()]), {
            pkgRoot: root,
            onProgress: async () => {
                throw new Error('progress failed')
            },
        })
        assert.strict.equal(r2['tool.exe'], r['tool.exe'])
    })

    it(`should read W_BIN_CACHE, W_BIN_MIRROR and W_BIN_OFFLINE from process.env (E1, O4)`, async function() {
        let keys = ['W_BIN_CACHE', 'W_BIN_MIRROR', 'W_BIN_OFFLINE']
        let saved = keys.map((k) => process.env[k])
        try {
            let shared = fx('envshared')
            for (let k of keys) {
                delete process.env[k]
            }
            process.env.W_BIN_CACHE = shared
            let r = await fsEnsureBins(mf([fTool()]), { pkgRoot: fx('enva'), fetch: mapFetch })
            assert.strict.equal(r['tool.exe'], path.join(shared, 'w-t', sha(tool), 'tool.exe'))
            delete process.env.W_BIN_CACHE
            process.env.W_BIN_MIRROR = shared
            process.env.W_BIN_OFFLINE = '1'
            let root = fx('envb')
            let r2 = await fsEnsureBins(mf([fTool()]), { pkgRoot: root, fetch: failFetch })
            assert.strict.equal(r2['tool.exe'], cachePath(root, tool, 'tool.exe'))
            let e = await catchErr(fsEnsureBins(mf([fK6()]), { pkgRoot: root, fetch: failFetch }))
            assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
            assert.strict.equal(fetchCalls.length, 1)
        }
        finally {
            keys.forEach((k, i) => {
                if (saved[i] === undefined) {
                    delete process.env[k]
                }
                else {
                    process.env[k] = saved[i]
                }
            })
        }
    })

    //---------------- 外審(terra)各條與變異存活之補案 ----------------

    it(`should verify the size of the manifest also on a remembered cache hit (D4, M2)`, async function() {
        let root = fx('memosize')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tool)
        await ens(mf([fTool()]), { pkgRoot: root, fetch: failFetch })
        //同一路徑(同sha256與name), 清單之大小不同: 不得沿用記憶而回傳大小不符之檔
        let e = await catchErr(ens(mf([fTool({ size: tool.length + 1 })]), { pkgRoot: root, offline: true }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
    })

    it(`should reject a manifest whose size is wrong while its sha256 is right, for every source (M2, D5, S4)`, async function() {
        //大小與雜湊皆須相符: 以正確之雜湊配錯誤之大小, 各層皆不得放行
        let cases = [
            ['direct', [fTool({ size: tool.length + 1 })], {}],
            ['part', [fFf({ parts: fFf().parts.map((p, i) => (i === 1 ? { ...p, size: p.size + 1 } : p)) })], { maxAttempts: 1 }],
            ['assembled', [fFf({ assembled: { type: 'zip', sha256: sha(ffzip), size: ffzip.length + 1 } })], {}],
            ['archive', [fK6({ size: zip.length + 1 })], { maxAttempts: 1 }],
        ]
        for (let [label, files, o] of cases) {
            let root = fx(`size-${label}`)
            let e = await catchErr(ens(mf(files), { pkgRoot: root, ...o }))
            assert.strict.equal(e && e.code, 'E_SIZE_MISMATCH', label)
            assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')).filter((v) => !v.startsWith('.work-') && v.includes('/')), [], label)
        }
        //鏡像之壓縮檔: 雜湊相符之內容, 清單大小錯誤時拒用
        let root = fx('size-mirror')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, zip, 'k6-v1.zip')
        let e = await catchErr(ens(mf([fK6({ size: zip.length + 1 })]), { pkgRoot: root, mirror, offline: true }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(e.missing[0].reasons.some((v) => v.includes('E_SIZE_MISMATCH')), true)
    })

    it(`should re-check a cached file replaced while it is being hashed (D4)`, async function() {
        let root = fx('hashswap')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tool)
        let swapped = false
        let fsSwap = {
            ...fs,
            createReadStream: (p, ...a) => {
                let rs = fs.createReadStream(p, ...a)
                if (p === fp && !swapped) {
                    swapped = true
                    //讀取開始後以同大小之壞檔換掉(新識別)
                    rs.once('open', () => {
                        fs.renameSync(p, `${p}.old`)
                        fs.writeFileSync(p, toolBad)
                    })
                }
                return rs
            },
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root, fs: fsSwap })
        assert.strict.equal(swapped, true)
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true) //不得回傳換上之壞檔
        assert.strict.equal(fetchCalls.length, 1)
    })

    it(`should reject E_FS when a cached file that does not match can not be removed, instead of reporting it missing (D4, E3)`, async function() {
        let root = fx('nodel')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, toolBad)
        let fsDeny = {
            ...fs,
            unlinkSync: (p) => {
                if (p === fp) {
                    let err = new Error(`EACCES: permission denied, unlink '${p}'`)
                    err.code = 'EACCES'
                    throw err
                }
                return fs.unlinkSync(p)
            },
        }
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fs: fsDeny, offline: true, retryDelayMs: 1 }))
        assert.strict.deepStrictEqual([e.code, e.step, e.pkg, e.bin], ['E_FS', 'cache', 'w-t', 'tool.exe'])
        assert.strict.equal(e.message.includes(fp), true)
    })

    it(`should not follow a redirect of an http mirror while offline (O3)`, async function() {
        let root = fx('redirect')
        routes[`/mirror/w-t/${sha(tool)}/tool.exe`] = (req, res) => {
            res.writeHead(302, { location: '/elsewhere/tool.exe' })
            res.end()
        }
        routes['/elsewhere/tool.exe'] = tool
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, mirror: `http://127.0.0.1:${port}/mirror`, offline: true }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(hits.includes('/elsewhere/tool.exe'), false)
        //連網時照常追隨(內容仍以清單校驗)
        let r = await ens(mf([fTool()]), { pkgRoot: fx('redirect-online'), mirror: `http://127.0.0.1:${port}/mirror` })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(hits.includes('/elsewhere/tool.exe'), true)
    })

    it(`should not share a get among calls of different packages, or with different fetch functions`, async function() {
        let shared = fx('sharepkg')
        let mirror = path.join(shared, 'mirror')
        putMirror(mirror, tool, 'tool.exe', 'w-b') //只有w-b之鏡像有檔
        //同repo、同清單項, 只有pkg不同(鏡像位置因pkg而不同)
        let mA = mf([fTool()], { pkg: 'w-a' })
        let mB = mf([fTool()], { pkg: 'w-b' })
        let [eA, rB] = await Promise.all([
            catchErr(ens(mA, { pkgRoot: shared, cacheDir: path.join(shared, 'cache'), mirror, offline: true })),
            ens(mB, { pkgRoot: shared, cacheDir: path.join(shared, 'cache'), mirror, offline: true }),
        ])
        assert.strict.equal(eA.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fs.readFileSync(rB['tool.exe']).equals(tool), true)
        //不同fetch各自取得
        //三個呼叫皆須在任一回應寫入快取前送出請求(否則較慢者命中快取而少一筆請求): 由伺服器端閘門控制何時放行回應,
        //放行條件為onTrace事件(三個呼叫皆已登記取得)與伺服器端已到達之請求數, 順序由事件因果決定, 不靠回應延遲多久
        let root = fx('sharefetch')
        let held = [] //已到達伺服器、尚未放行之請求
        let open = false
        let notify = null
        let respond = (res) => {
            res.writeHead(200, { 'content-length': String(tool.length) })
            res.end(tool)
        }
        routes[`${RAW1}bin/tool.exe`] = (req, res) => {
            if (open) {
                respond(res)
                return
            }
            held.push(res)
            if (notify) {
                notify()
            }
        }
        let waitHeld = (n) => {
            return new Promise((resolve, reject) => {
                let t = realSetTimeout(() => {
                    reject(new Error(`only ${held.length} of ${n} requests arrived`))
                }, 20000) //只防懸置
                notify = () => {
                    if (held.length >= n) {
                        realClearTimeout(t)
                        resolve()
                    }
                }
                notify()
            })
        }
        let f2 = (u, init) => mapFetch(u, init)
        let trs = [traceRec(), traceRec(), traceRec()]
        let pms = [
            ens(mf([fTool()]), { pkgRoot: root, onTrace: trs[0].on }),
            ens(mf([fTool()]), { pkgRoot: root, fetch: f2, onTrace: trs[1].on }),
            ens(mf([fTool()]), { pkgRoot: root, fs: { ...fs }, onTrace: trs[2].on }),
        ]
        try {
            let jobs = await Promise.all(trs.map((tr) => tr.wait((e) => e.type === 'job')))
            await waitHeld(jobs.filter((e) => e.mode === 'new').length) //各自取得者之請求皆已到達伺服器(尚無任何回應)
            assert.strict.deepStrictEqual(jobs.map((e) => e.mode), ['new', 'new', 'new']) //不同fetch、不同fs物件不共用同一次取得
            assert.strict.equal(held.length, 3)
        }
        finally {
            open = true //無論斷言成敗皆放行, 不使請求懸置
            held.forEach(respond)
        }
        await Promise.all(pms)
        assert.strict.equal(hits.filter((v) => v.endsWith('bin/tool.exe')).length, 3) //不同fetch、不同fs物件各自取得
        //同一fs物件但兩次呼叫之間換了方法: 不共用
        let root2 = fx('sharemethod')
        hits = []
        let fsM = { ...fs }
        let p1 = ens(mf([fTool()]), { pkgRoot: root2, fs: fsM })
        fsM.lstatSync = (p, ...a) => {
            if (String(p).endsWith('tool.exe')) {
                let err = new Error(`EACCES: permission denied, lstat '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.lstatSync(p, ...a)
        }
        let e2 = await catchErr(ens(mf([fTool()]), { pkgRoot: root2, fs: fsM }))
        let r1 = await p1
        assert.strict.equal(fs.readFileSync(r1['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual([e2 && e2.code, e2 && e2.step], ['E_FS', 'cache'])
    })

    it(`should report a work folder that can not be removed in the leftovers of the result (D5)`, async function() {
        let root = fx('leftover')
        let fsKeep = {
            ...fs,
            rmSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                    err.code = 'EBUSY'
                    throw err
                }
                return fs.rmSync(p, o)
            },
        }
        let r = await ens(mf([fK6()]), { pkgRoot: root, fs: fsKeep })
        assert.strict.deepStrictEqual(Object.keys(r), ['k6.exe']) //形狀不變
        assert.strict.equal(r.leftovers.length, 1)
        assert.strict.equal(r.leftovers[0].fp.includes('.work-'), true)
        fs.rmSync(r.leftovers[0].fp, { recursive: true, force: true })
    })

    it(`should remove its temporary file when writing the copy of the trunk manifest fails (M5)`, async function() {
        let root = fx('lastpart')
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        let fsFail = {
            ...fs,
            writeSync: (fd, buf, ...a) => {
                let n = fs.writeSync(fd, buf, a[0], Math.min(5, a[1]))
                if (fsFail.fail) {
                    let err = new Error('EIO: i/o error, write')
                    err.code = 'EIO'
                    throw err
                }
                return n
            },
            fail: true,
        }
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, fs: fsFail })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')).filter((v) => v.includes('manifest-last')), [])
    })

    it(`should give up the trunk manifest after opt.stallMs and cancel its body (M5)`, async function() {
        let root = fx('m5timeout')
        routes[`${RAWF}${C1}/bin/tool.exe`] = tool
        let cancels = 0
        let f = (u, init) => {
            fetchCalls.push(String(u))
            if (String(u).endsWith('/manifest.json')) {
                //回應標頭已到, 本體永不送資料且不響應中止
                let body = new ReadableStream({
                    pull() {
                        return new Promise(() => {})
                    },
                    cancel() {
                        cancels++
                    },
                })
                return Promise.resolve(new Response(body, { status: 200 }))
            }
            return mapFetch(u, init)
        }
        //門檻本身是規格(stallMs 300): 假時鐘推進虛擬時間, 本機下載(真實I/O)不受負載造成之假停滯影響; 以onTrace事件為同步點
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let pm = ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, fetch: f, stallMs: 300, onTrace: tr.on })
            await tr.wait((e) => e.type === 'trunk' && e.phase === 'fetch') //主幹清單已開始取(時限計時器已建立)
            await clock.advance(299)
            //opt.stallMs內不放棄主幹清單, 本體亦未取消
            assert.strict.equal(tr.events.some((e) => e.type === 'trunk' && e.phase === 'fail'), false)
            assert.strict.equal(cancels, 0)
            await clock.advance(1)
            let fail = await tr.wait((e) => e.type === 'trunk' && e.phase === 'fail')
            assert.strict.equal(fail.code, 'E_TIMEOUT') //逾opt.stallMs而放棄
            assert.strict.equal(cancels, 1) //放棄時取消其本體
            let iCancel = tr.events.findIndex((e) => e.type === 'cancel')
            assert.strict.deepStrictEqual([tr.events[iCancel].why, iCancel < tr.events.indexOf(fail)], ['unread', true]) //本體已回標頭但永不送資料: 取消讀取中之本體, 先於放棄之通知
            let r = await pm
            assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true) //退回基準清單
            assert.strict.equal(tr.events.find((e) => e.type === 'manifest').source, 'baseline')
            assert.strict.equal(cancels, 1)
        }
        finally {
            clock.restore()
        }
    })

    it(`should not use a trunk manifest larger than 1MB even if it is valid JSON (M5)`, async function() {
        let root = fx('m5bigjson')
        setFloating(JSON.stringify(mfF([strip(fT(tool2))], { commit: C2, note: 'x'.repeat(1024 * 1024) })))
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
    })

    it(`should wait for the extraction program to exit after terminating it on timeout before cleaning up (D5)`, async function() {
        let root = fx('tartimeout')
        let order = []
        let fake = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {
                order.push('kill')
                setTimeout(() => {
                    order.push('close')
                    cp.emit('close', null)
                }, 300)
            }
            return cp
        }
        let fsRec = {
            ...fs,
            rmSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    order.push('cleanup')
                }
                return fs.rmSync(p, o)
            },
        }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, spawn: fake, fs: fsRec, totalMs: 1500 }))
        assert.strict.equal(e.code, 'E_EXTRACT')
        assert.strict.equal(e.message.includes('did not finish within 1500ms'), true)
        assert.strict.deepStrictEqual(order, ['kill', 'close', 'cleanup'])
    })

    it(`should mask credentials in the field of E_MANIFEST and in the output of the extraction program (E3)`, async function() {
        let m = mf([fTool()])
        m['https://u:s3cretPW@host/x'] = 1
        let e = await catchErr(ens(m, { pkgRoot: fx('maskfield') }))
        assert.strict.equal(e.code, 'E_MANIFEST')
        assert.strict.equal(JSON.stringify([e.message, e.field]).includes('s3cretPW'), false)
        let fake = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {}
            setImmediate(() => {
                cp.stderr.emit('data', 'tar: can not open https://u:s3cretPW@host/k6.zip')
                cp.emit('close', 1)
            })
            return cp
        }
        let e2 = await catchErr(ens(mf([fK6()]), { pkgRoot: fx('masktar'), spawn: fake }))
        assert.strict.equal(e2.code, 'E_EXTRACT')
        assert.strict.equal(e2.message.includes('s3cretPW'), false)
    })

    it(`should reject coded errors with step, pkg and bin when the file system fails (E3)`, async function() {
        let root = fx('fserr')
        let fsBad = {
            ...fs,
            mkdirSync: (p, o) => {
                if (String(p).includes('.work-') || String(p).endsWith('bin-cache')) {
                    throw new Error('disk failure without a code')
                }
                return fs.mkdirSync(p, o)
            },
        }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, fs: fsBad }))
        assert.strict.deepStrictEqual([e.code, e.pkg, e.bin, typeof e.step], ['E_FS', 'w-t', 'k6.exe', 'string'])
        let root2 = fx('fsdir')
        fs.mkdirSync(path.join(cachePath(root2, tool, 'tool.exe'), 'inner'), { recursive: true })
        let e2 = await catchErr(ens(mf([fTool()]), { pkgRoot: root2 }))
        assert.strict.deepStrictEqual([e2.code, e2.step, e2.pkg, e2.bin], ['E_FS', 'cache', 'w-t', 'tool.exe'])
    })

    it(`should treat a disk error while writing a mirror file as a disk error, not fall back to GitHub (O2, E3)`, async function() {
        let root = fx('mirrordisk')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tool, 'tool.exe')
        let fsFull = {
            ...fs,
            openSync: (p, flags, ...a) => {
                if (String(p).endsWith('.part') && String(p).includes('bin-cache')) {
                    let err = new Error(`ENOSPC: no space left on device, open '${p}'`)
                    err.code = 'ENOSPC'
                    throw err
                }
                return fs.openSync(p, flags, ...a)
            },
        }
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, mirror, fs: fsFull }))
        assert.strict.deepStrictEqual([e.code, e.source, e.bin], ['E_FS', 'mirror', 'tool.exe'])
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should treat opt.cacheDir '' as the default cache location (D3)`, async function() {
        let root = fx('cachedirempty')
        let r = await ens(mf([fTool()]), { pkgRoot: root, cacheDir: '' })
        assert.strict.equal(r['tool.exe'], cachePath(root, tool, 'tool.exe'))
    })

    //---------------- 第2輪外審(terra)各條之補案 ----------------

    it(`should accept a release tag whose name contains refs/heads, and reject a generator url that fsEnsureBins rejects (M2)`, async function() {
        let u = 'https://github.com/a/b/releases/download/refs%2Fheads%2Fv1.0/k6-v1.zip'
        let e = await catchErr(ens(mf([fK6({ url: u })]), { pkgRoot: fx('tagrefs'), offline: true, fetch: failFetch }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING') //清單有效
    })

    it(`should reject E_FS, not a missing file, when the cached file can not be stat-ed after hashing (D4, E3)`, async function() {
        let root = fx('statafter')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tool)
        let n = 0
        let fsSt = {
            ...fs,
            lstatSync: (p, ...a) => {
                if (p === fp && ++n === 2) {
                    let err = new Error(`EACCES: permission denied, lstat '${p}'`)
                    err.code = 'EACCES'
                    throw err
                }
                return fs.lstatSync(p, ...a)
            },
        }
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fs: fsSt, offline: true }))
        assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_FS', 'cache'])
    })

    it(`should reject E_FS, not a missing file, when the cached file keeps changing while being verified, without removing it (D4)`, async function() {
        let root = fx('keepchanging')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tool)
        let n = 0
        let fsChg = {
            ...fs,
            lstatSync: (p, ...a) => {
                let st = fs.lstatSync(p, ...a)
                if (p !== fp) {
                    return st
                }
                //每次取得之識別皆不同(模擬他方持續改寫); 改mtimeMs(Windows之ino超過2^53, 加小整數因浮點精度而不變)
                let s2 = Object.assign(Object.create(Object.getPrototypeOf(st)), st)
                s2.mtimeMs = st.mtimeMs + (++n) * 1000
                return s2
            },
        }
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: root, fs: fsChg, offline: true, fetch: failFetch }))
        assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_FS', 'cache'])
        assert.strict.equal(e.message.includes('kept changing'), true)
        assert.strict.equal(fs.existsSync(fp), true) //不採用、不刪
    })

    it(`should re-check when the cached file was replaced by a matching one before its removal (D4)`, async function() {
        let root = fx('changedrm')
        let fp = cachePath(root, tool, 'tool.exe')
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, toolBad)
        let n = 0
        let fsSw = {
            ...fs,
            lstatSync: (p, ...a) => {
                if (p === fp && ++n === 3) {
                    //雜湊與其後之識別核對之後、刪除之前, 他方換上正確之檔
                    fs.writeFileSync(`${p}.new`, tool)
                    fs.renameSync(`${p}.new`, p)
                }
                return fs.lstatSync(p, ...a)
            },
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root, fs: fsSw, offline: true, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should wrap an error of a passed fs with code, step, pkg and bin even if it carries a pkg, and mask credentials in it (E3)`, async function() {
        //解壓之輸出夾建立失敗, 所拋值帶code與同名pkg: 仍包裝為E_FS並補step、bin
        let fsBad = {
            ...fs,
            mkdirSync: (p, o) => {
                if (/[\\/]x$/.test(String(p))) {
                    let err = new Error('EACCES: denied, see https://u:s3cretPW@host/help')
                    err.code = 'EACCES'
                    err.pkg = 'w-t'
                    throw err
                }
                return fs.mkdirSync(p, o)
            },
        }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: fx('fsforged'), fs: fsBad }))
        assert.strict.deepStrictEqual([e.code, e.pkg, e.bin, typeof e.step], ['E_FS', 'w-t', 'k6.exe', 'string'])
        assert.strict.equal(e.message.includes('s3cretPW'), false)
        //暫存夾建立失敗, 錯誤文字帶網址帳密: 訊息遮蔽
        let fsBad2 = {
            ...fs,
            mkdirSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    throw new Error('disk failure, see https://u:s3cretPW@host/help')
                }
                return fs.mkdirSync(p, o)
            },
        }
        let e2 = await catchErr(ens(mf([fK6()]), { pkgRoot: fx('fsforged2'), fs: fsBad2 }))
        assert.strict.deepStrictEqual([e2.code, e2.bin], ['E_FS', 'k6.exe'])
        assert.strict.equal(e2.message.includes('s3cretPW'), false)
    })

    it(`should keep waiting for the exit after an error event of a terminated extraction program (D5)`, async function() {
        let root = fx('killerr')
        let order = []
        let fake = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {
                order.push('kill')
                setImmediate(() => {
                    order.push('error')
                    cp.emit('error', new Error('kill failed'))
                })
                setTimeout(() => {
                    order.push('close')
                    cp.emit('close', null)
                }, 300)
            }
            return cp
        }
        let fsRec = {
            ...fs,
            rmSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    order.push('cleanup')
                }
                return fs.rmSync(p, o)
            },
        }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, spawn: fake, fs: fsRec, totalMs: 1000 }))
        assert.strict.equal(e.code, 'E_EXTRACT')
        assert.strict.deepStrictEqual(order, ['kill', 'error', 'close', 'cleanup'])
    })

    it(`should keep the work folder and report it when the extraction program does not exit after termination (D5)`, async function() {
        this.timeout(30000)
        let root = fx('noexit')
        let kills = 0
        let fake = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {
                kills++ //終止後仍不結束
            }
            return cp
        }
        //門檻本身是規格(解壓逾opt.totalMs 500即終止, 終止後等其結束至多5000ms): 假時鐘推進虛擬時間;
        //壓縮檔之本機下載(真實I/O)不受負載影響, 以解壓開始之onTrace事件為同步點才推進
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let pmErr = catchErr(ens(mf([fK6()]), { pkgRoot: root, spawn: fake, totalMs: 500, onTrace: tr.on })) //先掛上錯誤處理: 推進假時鐘期間即會reject
            await tr.wait((e) => e.type === 'extract') //下載與準備已完成, 解壓開始(解壓之計時器已建立)
            await clock.advance(499)
            assert.strict.equal(tr.events.some((e) => e.type === 'kill'), false) //opt.totalMs內不終止
            assert.strict.equal(kills, 0)
            await clock.advance(1)
            await tr.wait((e) => e.type === 'kill')
            assert.strict.equal(kills, 1) //逾時即終止解壓程式
            await clock.advance(4999)
            assert.strict.equal(tr.events.some((e) => e.type === 'extracted'), false) //終止後等待其結束至多5000ms, 未到不放棄
            await clock.advance(1)
            let x = await tr.wait((e) => e.type === 'extracted')
            assert.strict.deepStrictEqual([x.result, x.exited], ['timeout', false]) //仍未結束: 放棄等待
            let e = await pmErr
            assert.strict.equal(e.code, 'E_EXTRACT')
            assert.strict.equal(Array.isArray(e.leftovers) && e.leftovers.length, 1)
            assert.strict.equal(fs.existsSync(e.leftovers[0].fp), true) //未確認結束前不刪
            let cl = tr.events.find((v) => v.type === 'cleanup')
            assert.strict.deepStrictEqual([cl.name, cl.ok], ['k6.exe', false]) //暫存夾保留(未刪)
            assert.strict.equal(tr.events.some((v) => v.type === 'place' || v.type === 'ready'), false)
            fs.rmSync(e.leftovers[0].fp, { recursive: true, force: true })
        }
        finally {
            clock.restore()
        }
    })

    it(`should report leftovers on a rejection and to every caller sharing a get (D5)`, async function() {
        let fsKeep = {
            ...fs,
            rmSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                    err.code = 'EBUSY'
                    throw err
                }
                return fs.rmSync(p, o)
            },
        }
        //失敗(成員不在壓縮檔)而暫存夾刪不掉: 錯誤帶leftovers
        let e = await catchErr(ens(mf([fK6({ extract: { type: 'zip', member: 'k6-v1/none.exe', sha256: sha(exe), size: exe.length } })]), { pkgRoot: fx('leftrej'), fs: fsKeep }))
        assert.strict.equal(e.code, 'E_EXTRACT')
        assert.strict.equal(e.leftovers.length, 1)
        fs.rmSync(e.leftovers[0].fp, { recursive: true, force: true })
        //共用同一次取得之兩個呼叫皆得到leftovers
        let root = fx('leftshare')
        hits = []
        let [r1, r2] = await Promise.all([ens(mf([fK6()]), { pkgRoot: root, fs: fsKeep }), ens(mf([fK6()]), { pkgRoot: root, fs: fsKeep })])
        assert.strict.equal(hits.filter((v) => v.endsWith('k6-v1.zip')).length, 1)
        assert.strict.deepStrictEqual([r1.leftovers.length, r2.leftovers.length], [1, 1])
        fs.rmSync(r1.leftovers[0].fp, { recursive: true, force: true })
    })

    it(`should keep the leftovers of the download core when a mirror copy is rejected (O2, D2)`, async function() {
        let root = fx('mirrorleft')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, toolBad, 'tool.exe', 'w-t', tool)
        let fsNoDel = {
            ...fs,
            unlinkSync: (p) => {
                if (String(p).endsWith('.part')) {
                    let err = new Error(`EPERM: operation not permitted, unlink '${p}'`)
                    err.code = 'EPERM'
                    throw err
                }
                return fs.unlinkSync(p)
            },
        }
        let r = await ens(mf([fTool()]), { pkgRoot: root, mirror, fs: fsNoDel, retryDelayMs: 1 })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        let l = r.leftovers.filter((v) => String(v.fp).endsWith('.part'))
        assert.strict.equal(l.length, 1)
        fs.unlinkSync(l[0].fp)
    })

    it(`should cancel the body of a trunk manifest response that settles as the timeout wins (M5)`, async function() {
        routes[`${RAWF}${C1}/bin/tool.exe`] = tool
        //兩種落定時點: 中止當下同步落定(逾時勝出之同時), 與中止後再經一次真實的事件迴圈才落定(放棄等待之後才到的回應), 兩者本體皆須被取消恰1次
        for (let later of [false, true]) {
            let root = fx(`m5race-${later ? 'later' : 'sync'}`)
            let cancels = 0
            let f = (u, init) => {
                fetchCalls.push(String(u))
                if (String(u).endsWith('/manifest.json')) {
                    return new Promise((resolve) => {
                        init.signal.addEventListener('abort', () => {
                            let settle = () => {
                                resolve(new Response(new ReadableStream({
                                    cancel() {
                                        cancels++
                                    },
                                }), { status: 200 }))
                            }
                            if (later) {
                                setImmediate(settle) //真實之setImmediate不受假時鐘影響
                            }
                            else {
                                settle()
                            }
                        })
                    })
                }
                return mapFetch(u, init)
            }
            //門檻本身是規格(stallMs 200): 假時鐘推進虛擬時間; 逾時勝出後才落定之回應, 以其本體被取消之onTrace事件為同步點(不再以固定等待後檢查)
            let clock = useFakeClock()
            try {
                let tr = traceRec()
                let pm = ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, fetch: f, stallMs: 200, onTrace: tr.on })
                await tr.wait((e) => e.type === 'trunk' && e.phase === 'fetch')
                await clock.advance(199)
                assert.strict.equal(tr.events.some((e) => e.type === 'trunk' && e.phase === 'fail'), false, `${later}`) //opt.stallMs內不放棄
                assert.strict.equal(cancels, 0)
                await clock.advance(1)
                let c = await tr.wait((e) => e.type === 'cancel')
                let fail = await tr.wait((e) => e.type === 'trunk' && e.phase === 'fail')
                assert.strict.equal(fail.code, 'E_TIMEOUT')
                if (later) {
                    assert.strict.equal(c.why, 'late') //放棄等待後才落定之回應
                }
                else {
                    assert.strict.equal(['late', 'settled'].includes(c.why), true) //逾時勝出之同時落定之回應(兩處擇一取消)
                }
                assert.strict.equal(cancels, 1)
                let r = await pm
                assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true) //退回基準清單
                assert.strict.equal(cancels, 1) //恰取消1次(兩處擇一, 不重複)
                assert.strict.equal(tr.events.filter((e) => e.type === 'cancel').length, 1)
            }
            finally {
                clock.restore()
            }
        }
    })

    it(`should not loop forever when a write makes no progress, and report a copy that can not be removed (M5)`, async function() {
        let root = fx('zerowrite')
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        let fsZero = {
            ...fs,
            writeSync: () => 0,
            unlinkSync: (p) => {
                if (String(p).includes('manifest-last.json.')) {
                    let err = new Error(`EPERM: operation not permitted, unlink '${p}'`)
                    err.code = 'EPERM'
                    throw err
                }
                return fs.unlinkSync(p)
            },
        }
        let r = await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: root, fs: fsZero })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        let l = r.leftovers.filter((v) => String(v.fp).includes('manifest-last.json.'))
        assert.strict.equal(l.length, 1)
        fs.unlinkSync(l[0].fp)
    })

    it(`should not share a get between calls whose extraction programs differ (D5)`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let root = fx('sharetar')
        let [e1, r2] = await Promise.all([
            catchErr(ens(mf([fK6()]), { pkgRoot: root, env: { SystemRoot: path.join(root, 'noWindows') } })),
            ens(mf([fK6()]), { pkgRoot: root, env: { SystemRoot: process.env.SystemRoot || 'C:\\Windows' } }),
        ])
        assert.strict.equal(e1 && e1.code, 'E_EXTRACT')
        assert.strict.equal(fs.readFileSync(r2['k6.exe']).equals(exe), true)
    })

    //---------------- 觀察回調(opt.onTrace; 規則帳本R-TRACE-01) ----------------

    //各type之固定欄位(皆為原始值; 欄位名不得為type, 與JSDoc之列舉一致)
    let TRACE_FIELDS = {
        manifest: ['source', 'files'],
        trunk: ['phase', 'code'],
        cancel: ['why'],
        last: ['ok'],
        job: ['name', 'mode'],
        cache: ['name', 'hit'],
        mirror: ['name', 'file', 'result'],
        offline: ['name'],
        work: ['name'],
        download: ['name', 'file'],
        downloaded: ['name', 'file', 'ok', 'code'],
        extract: ['name'],
        kill: ['name'],
        extracted: ['name', 'result', 'code', 'exited'],
        place: ['name'],
        cleanup: ['name', 'ok'],
        ready: ['name'],
        fail: ['name', 'code'],
        tidy: ['n'],
        settle: ['ok', 'code'],
    }
    let checkEvents = (events) => {
        for (let e of events) {
            assert.strict.equal(Object.isFrozen(e), true, e.type)
            assert.strict.notEqual(TRACE_FIELDS[e.type], undefined, `unknown type ${e.type}`)
            assert.strict.deepStrictEqual(Object.keys(e).sort(), ['type', ...TRACE_FIELDS[e.type]].sort(), e.type)
            for (let v of Object.values(e)) {
                assert.strict.equal(v === null || ['string', 'number', 'boolean'].includes(typeof v), true, e.type)
            }
        }
    }
    let typesOf = (tr, name) => {
        return tr.events.filter((e) => e.name === name).map((e) => e.type)
    }
    let flush = () => {
        return new Promise((resolve) => {
            setImmediate(resolve)
        })
    }
    let fakeTar = (code) => {
        return () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {}
            setImmediate(() => {
                if (code === 'enoent') {
                    let err = new Error('spawn tar ENOENT')
                    err.code = 'ENOENT'
                    cp.emit('error', err)
                    cp.emit('close', -2)
                }
                else {
                    cp.stderr.emit('data', 'tar: something failed')
                    cp.emit('close', code)
                }
            })
            return cp
        }
    }

    it(`should give the same result whether onTrace is not given, records, throws, returns a rejection or is not a function, without unhandled rejections (P3, P4)`, async function() {
        let calls = { throws: 0, rejects: 0 }
        let kinds = {
            none: () => undefined,
            record: () => traceRec().on,
            throws: () => () => {
                calls.throws++
                throw new Error('observer failed')
            },
            rejects: () => () => {
                calls.rejects++
                return Promise.reject(new Error('observer rejected'))
            },
            notfun: () => 'abc',
        }
        let run = async (mk) => {
            let root = fx('p3')
            let esc = JSON.stringify(root).slice(1, -1)
            let norm = (v) => JSON.parse(JSON.stringify(v).split(esc).join('<root>'))
            let cb = mk()
            let o = cb === undefined ? {} : { onTrace: cb }
            //連網取得(直接檔與解壓檔)
            let r = await ens(mf([fTool(), fK6()]), { pkgRoot: root, ...o })
            let s1 = { keys: Object.keys(r), paths: Object.values(r).map((v) => path.relative(root, v)), ok: [fs.readFileSync(r['tool.exe']).equals(tool), fs.readFileSync(r['k6.exe']).equals(exe)], leftovers: r.leftovers.length }
            //離線缺檔
            let e = await catchErr(ens(mf([fTool(), fK6(), fFf()]), { pkgRoot: root, offline: true, ...o }))
            let s2 = norm({ code: e.code, step: e.step, names: e.missing.map((v) => v.name), message: e.message })
            //下載失敗
            let e3 = await catchErr(ens(mf([fTool({ path: 'bin/none.exe' })]), { pkgRoot: fx('p3b'), maxAttempts: 1, ...o }))
            let s3 = { code: e3.code, status: e3.status, bin: e3.bin }
            return { s1, s2, s3, tree: walk(root) }
        }
        let n0 = unhandled.length
        let base = await run(kinds.none)
        for (let k of Object.keys(kinds)) {
            let r = await run(kinds[k])
            assert.strict.deepStrictEqual(r, base, k)
        }
        await flush()
        await flush()
        assert.strict.deepStrictEqual(unhandled.slice(n0), [])
        assert.strict.equal(calls.throws > 0 && calls.rejects > 0, true) //拋錯與回傳rejection之回調確實被呼叫過
    })

    it(`should notify frozen events of fixed fields with primitive values, without a receiver, in the order of what happened (P4)`, async function() {
        let seen = []
        let recv = []
        let on = function(e) {
            recv.push(this)
            seen.push(e)
        }
        //釘選、連網: 直接檔、解壓檔、分割檔
        await ens(mf([fTool(), fK6(), fFf()]), { pkgRoot: fx('ev1'), onTrace: on })
        //主幹模式: 取到主幹清單(含副本寫入)
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev2'), onTrace: on })
        //離線缺檔
        await catchErr(ens(mf([fTool(), fK6()]), { pkgRoot: fx('ev3'), offline: true, onTrace: on }))
        assert.strict.equal(seen.length > 0, true)
        assert.strict.equal(recv.every((v) => v === undefined), true) //不帶接收者
        checkEvents(seen)
        let types = new Set(seen.map((e) => e.type))
        for (let t of ['manifest', 'trunk', 'last', 'job', 'cache', 'offline', 'work', 'download', 'downloaded', 'extract', 'extracted', 'place', 'cleanup', 'ready', 'tidy', 'settle']) {
            assert.strict.equal(types.has(t), true, t)
        }
    })

    it(`should notify the events of getting files in order: job, cache, work, download, downloaded, extract, extracted, place, cleanup, ready, then settle`, async function() {
        let tr = traceRec()
        let r = await ens(mf([fTool(), fK6(), fFf()]), { pkgRoot: fx('ev-order'), onTrace: tr.on })
        assert.strict.deepStrictEqual(Object.keys(r), ['tool.exe', 'k6.exe', 'ffmpeg.exe'])
        assert.strict.deepStrictEqual(tr.events[0], { type: 'manifest', source: 'base', files: 3 })
        assert.strict.deepStrictEqual(typesOf(tr, 'tool.exe'), ['job', 'cache', 'download', 'downloaded', 'ready'])
        assert.strict.deepStrictEqual(typesOf(tr, 'k6.exe'), ['job', 'cache', 'work', 'download', 'downloaded', 'extract', 'extracted', 'place', 'cleanup', 'ready'])
        assert.strict.deepStrictEqual(typesOf(tr, 'ffmpeg.exe'), ['job', 'cache', 'work', 'download', 'downloaded', 'download', 'downloaded', 'download', 'downloaded', 'extract', 'extracted', 'place', 'cleanup', 'ready'])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'download').map((e) => e.file), ['tool.exe', 'k6-v1.zip', 'ff.zip.001', 'ff.zip.002', 'ff.zip.003'])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'cache').map((e) => e.hit), [false, false, false])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'job').map((e) => e.mode), ['new', 'new', 'new'])
        assert.strict.equal(tr.events.filter((e) => e.type === 'downloaded').every((e) => e.ok === true && e.code === null), true)
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'extracted').map((e) => [e.result, e.code, e.exited]), [['exit', 0, true], ['exit', 0, true]])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'cleanup').map((e) => e.ok), [true, true])
        assert.strict.deepStrictEqual(tr.events[tr.events.length - 1], { type: 'settle', ok: true, code: null }) //settle為最後, 且於resolve之前
        assert.strict.equal(tr.events.filter((e) => e.type === 'settle').length, 1)
    })

    it(`should notify cache hits (cache hit true and ready without download) on the second call`, async function() {
        let root = fx('ev-cache')
        await ens(mf([fTool(), fK6()]), { pkgRoot: root })
        let tr = traceRec()
        await ens(mf([fTool(), fK6()]), { pkgRoot: root, fetch: failFetch, onTrace: tr.on })
        assert.strict.deepStrictEqual(typesOf(tr, 'tool.exe'), ['job', 'cache', 'ready'])
        assert.strict.deepStrictEqual(typesOf(tr, 'k6.exe'), ['job', 'cache', 'ready'])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'cache').map((e) => e.hit), [true, true])
    })

    it(`should notify the mirror results: ok, miss and rejected (falls back to GitHub when online)`, async function() {
        let root = fx('ev-mirror-ok')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tool, 'tool.exe')
        let tr = traceRec()
        await ens(mf([fTool()]), { pkgRoot: root, mirror, fetch: failFetch, onTrace: tr.on })
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'mirror'), [{ type: 'mirror', name: 'tool.exe', file: 'tool.exe', result: 'ok' }])
        assert.strict.deepStrictEqual(typesOf(tr, 'tool.exe'), ['job', 'cache', 'mirror', 'ready']) //鏡像取得: 不下載
        let root2 = fx('ev-mirror-miss')
        let tr2 = traceRec()
        await ens(mf([fTool()]), { pkgRoot: root2, mirror: path.join(root2, 'mirror'), onTrace: tr2.on })
        assert.strict.deepStrictEqual(tr2.events.filter((e) => e.type === 'mirror').map((e) => e.result), ['miss'])
        assert.strict.deepStrictEqual(typesOf(tr2, 'tool.exe'), ['job', 'cache', 'mirror', 'download', 'downloaded', 'ready'])
        let root3 = fx('ev-mirror-rej')
        let mirror3 = path.join(root3, 'mirror')
        putMirror(mirror3, toolBad, 'tool.exe', 'w-t', tool)
        let tr3 = traceRec()
        await ens(mf([fTool()]), { pkgRoot: root3, mirror: mirror3, onTrace: tr3.on })
        assert.strict.deepStrictEqual(tr3.events.filter((e) => e.type === 'mirror').map((e) => e.result), ['rejected'])
        assert.strict.deepStrictEqual(typesOf(tr3, 'tool.exe'), ['job', 'cache', 'mirror', 'download', 'downloaded', 'ready'])
        //http鏡像404亦為miss
        let tr4 = traceRec()
        await ens(mf([fTool()]), { pkgRoot: fx('ev-mirror-http'), mirror: `http://127.0.0.1:${port}/mirror`, onTrace: tr4.on })
        assert.strict.deepStrictEqual(tr4.events.filter((e) => e.type === 'mirror').map((e) => e.result), ['miss'])
    })

    it(`should notify offline: offline for every missing file, tidy with how many empty folders it removed, then settle with E_OFFLINE_MISSING (O3)`, async function() {
        //無鏡像: 不建任何資料夾, tidy為0
        let tr = traceRec()
        let root = fx('ev-off1')
        let e = await catchErr(ens(mf([fTool(), fK6()]), { pkgRoot: root, offline: true, onTrace: tr.on }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(typesOf(tr, 'tool.exe'), ['job', 'cache', 'offline'])
        assert.strict.deepStrictEqual(typesOf(tr, 'k6.exe'), ['job', 'cache', 'offline']) //離線判定先於建暫存夾: 無work
        assert.strict.deepStrictEqual(tr.events.slice(-2), [{ type: 'tidy', n: 0 }, { type: 'settle', ok: false, code: 'E_OFFLINE_MISSING' }])
        assert.strict.equal(tr.events.some((v) => v.type === 'fail'), false) //離線缺檔由彙整回報, 非單檔失敗
        assert.strict.deepStrictEqual(walk(root), [])
        //空的本地鏡像 + 解壓檔: 建過暫存夾(含快取根)後清掉
        let tr2 = traceRec()
        let root2 = fx('ev-off2')
        fs.mkdirSync(path.join(root2, 'mirror'))
        await catchErr(ens(mf([fK6()]), { pkgRoot: root2, mirror: path.join(root2, 'mirror'), offline: true, onTrace: tr2.on }))
        assert.strict.deepStrictEqual(typesOf(tr2, 'k6.exe'), ['job', 'cache', 'mirror', 'work', 'mirror', 'offline', 'cleanup'])
        assert.strict.deepStrictEqual(tr2.events.find((v) => v.type === 'tidy'), { type: 'tidy', n: 1 }) //快取根
        assert.strict.deepStrictEqual(walk(root2), ['mirror'])
        //鏡像檔不符 + 直接檔: 下載核心建立之<sha256>夾與快取根皆清掉
        let tr3 = traceRec()
        let root3 = fx('ev-off3')
        let tool2Bad = Buffer.from(tool2)
        tool2Bad[10] = (tool2Bad[10] + 1) % 256 //同長度、內容不同
        putMirror(path.join(root3, 'mirror'), tool2Bad, 'tool2.exe', 'w-t', tool2)
        await catchErr(ens(mf([{ name: 'tool2.exe', path: 'bin/tool2.exe', sha256: sha(tool2), size: tool2.length }]), { pkgRoot: root3, mirror: path.join(root3, 'mirror'), offline: true, onTrace: tr3.on }))
        assert.strict.deepStrictEqual(typesOf(tr3, 'tool2.exe'), ['job', 'cache', 'mirror', 'offline'])
        assert.strict.deepStrictEqual(tr3.events.find((v) => v.type === 'tidy'), { type: 'tidy', n: 2 })
        assert.strict.deepStrictEqual(walk(root3).filter((v) => !v.startsWith('mirror')), [])
    })

    it(`should notify job as new, join (a concurrent call of the same file shares the get) and solo (options that can not be serialized are not shared)`, async function() {
        let root = fx('ev-job')
        let tr1 = traceRec()
        let tr2 = traceRec()
        await Promise.all([ens(mf([fTool()]), { pkgRoot: root, onTrace: tr1.on }), ens(mf([fTool()]), { pkgRoot: root, onTrace: tr2.on })])
        assert.strict.deepStrictEqual(tr1.events.filter((e) => e.type === 'job'), [{ type: 'job', name: 'tool.exe', mode: 'new' }])
        assert.strict.deepStrictEqual(tr2.events.filter((e) => e.type === 'job'), [{ type: 'job', name: 'tool.exe', mode: 'join' }])
        assert.strict.deepStrictEqual(typesOf(tr2, 'tool.exe'), ['job']) //共用者不另行取得(無cache、download)
        assert.strict.equal(hits.filter((v) => v.endsWith('bin/tool.exe')).length, 1)
        let tr3 = traceRec()
        let e = await catchErr(ens(mf([fTool()]), { pkgRoot: fx('ev-solo'), offline: true, maxAttempts: 10n, onTrace: tr3.on })) //BigInt無法序列化
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(tr3.events.filter((v) => v.type === 'job'), [{ type: 'job', name: 'tool.exe', mode: 'solo' }])
    })

    it(`should notify the trunk manifest: fetch, ok with the copy written, fail with the code, and baseline (M5, T8)`, async function() {
        //取得: fetch→last→ok→manifest remote
        setFloating(mfF([strip(fT(tool2))], { commit: C2 }))
        let tr = traceRec()
        await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev-trunk-ok'), onTrace: tr.on })
        assert.strict.deepStrictEqual(tr.events.slice(0, 4), [
            { type: 'trunk', phase: 'fetch', code: null },
            { type: 'last', ok: true },
            { type: 'trunk', phase: 'ok', code: null },
            { type: 'manifest', source: 'remote', files: 1 },
        ])
        //副本寫入失敗: last為false, 仍取得主幹清單
        let fsFail = {
            ...fs,
            writeSync: () => {
                let err = new Error('EIO: i/o error, write')
                err.code = 'EIO'
                throw err
            },
        }
        let tr2 = traceRec()
        await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev-trunk-last'), fs: fsFail, onTrace: tr2.on })
        assert.strict.deepStrictEqual(tr2.events.slice(0, 4).map((e) => [e.type, e.ok, e.phase]), [['trunk', undefined, 'fetch'], ['last', false, undefined], ['trunk', undefined, 'ok'], ['manifest', undefined, undefined]])
        //404: 回應本體取消(status)→fail(E_HTTP)→退回基準
        delete routes[`${RAWF}master/bin/manifest.json`]
        let tr3 = traceRec()
        await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev-trunk-404'), onTrace: tr3.on })
        assert.strict.deepStrictEqual(tr3.events.slice(0, 4), [
            { type: 'trunk', phase: 'fetch', code: null },
            { type: 'cancel', why: 'status' },
            { type: 'trunk', phase: 'fail', code: 'E_HTTP' },
            { type: 'manifest', source: 'baseline', files: 1 },
        ])
        //無效之主幹清單: E_MANIFEST
        setFloating('{ not json')
        let tr4 = traceRec()
        await ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev-trunk-bad'), onTrace: tr4.on })
        assert.strict.deepStrictEqual(tr4.events.find((e) => e.type === 'trunk' && e.phase === 'fail'), { type: 'trunk', phase: 'fail', code: 'E_MANIFEST' })
        assert.strict.equal(tr4.events.some((e) => e.type === 'last'), false) //未取得有效清單不寫副本
        //離線: 不取主幹清單
        let tr5 = traceRec()
        let e5 = await catchErr(ens(mfF([strip(fT(tool))], { commit: C1 }), { pkgRoot: fx('ev-trunk-off'), offline: true, onTrace: tr5.on }))
        assert.strict.equal(e5.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(tr5.events.some((e) => e.type === 'trunk'), false)
        assert.strict.deepStrictEqual(tr5.events[0], { type: 'manifest', source: 'baseline', files: 1 })
    })

    it(`should notify a failed file: downloaded with ok false and the code, fail, then settle with the same code (E3)`, async function() {
        let tr = traceRec()
        let e = await catchErr(ens(mf([fTool({ path: 'bin/none.exe' })]), { pkgRoot: fx('ev-fail-dl'), maxAttempts: 1, onTrace: tr.on }))
        assert.strict.equal(e.code, 'E_HTTP')
        assert.strict.deepStrictEqual(typesOf(tr, 'tool.exe'), ['job', 'cache', 'download', 'downloaded', 'fail'])
        assert.strict.deepStrictEqual(tr.events.find((v) => v.type === 'downloaded'), { type: 'downloaded', name: 'tool.exe', file: 'tool.exe', ok: false, code: 'E_HTTP' })
        assert.strict.deepStrictEqual(tr.events.slice(-2), [{ type: 'fail', name: 'tool.exe', code: 'E_HTTP' }, { type: 'settle', ok: false, code: 'E_HTTP' }])
        //解壓程式以非0結束
        let tr2 = traceRec()
        let e2 = await catchErr(ens(mf([fK6()]), { pkgRoot: fx('ev-fail-tar'), spawn: fakeTar(2), onTrace: tr2.on }))
        assert.strict.equal(e2.code, 'E_EXTRACT')
        assert.strict.deepStrictEqual(tr2.events.find((v) => v.type === 'extracted'), { type: 'extracted', name: 'k6.exe', result: 'exit', code: 2, exited: true })
        assert.strict.deepStrictEqual(typesOf(tr2, 'k6.exe'), ['job', 'cache', 'work', 'download', 'downloaded', 'extract', 'extracted', 'cleanup', 'fail']) //失敗: 無place與ready, 暫存夾已刪
        //解壓程式不存在
        let tr3 = traceRec()
        await catchErr(ens(mf([fK6()]), { pkgRoot: fx('ev-fail-enoent'), spawn: fakeTar('enoent'), onTrace: tr3.on }))
        assert.strict.deepStrictEqual(tr3.events.find((v) => v.type === 'extracted'), { type: 'extracted', name: 'k6.exe', result: 'error', code: null, exited: null })
    })

    it(`should notify cleanup with ok false when the work folder can not be removed (D5)`, async function() {
        let fsKeep = {
            ...fs,
            rmSync: (p, o) => {
                if (String(p).includes('.work-')) {
                    let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                    err.code = 'EBUSY'
                    throw err
                }
                return fs.rmSync(p, o)
            },
        }
        let tr = traceRec()
        let r = await ens(mf([fK6()]), { pkgRoot: fx('ev-cleanup'), fs: fsKeep, onTrace: tr.on })
        assert.strict.deepStrictEqual(typesOf(tr, 'k6.exe').slice(-3), ['place', 'cleanup', 'ready'])
        assert.strict.deepStrictEqual(tr.events.find((v) => v.type === 'cleanup'), { type: 'cleanup', name: 'k6.exe', ok: false })
        fs.rmSync(r.leftovers[0].fp, { recursive: true, force: true })
    })

    it(`should notify settle with E_ARG and E_MANIFEST for a bad argument or manifest, and with the unknown name after manifest (E3)`, async function() {
        let tr = traceRec()
        let e = await catchErr(ens(mf([fTool()]), { onTrace: tr.on })) //無pkgRoot
        assert.strict.equal(e.code, 'E_ARG')
        assert.strict.deepStrictEqual(tr.events, [{ type: 'settle', ok: false, code: 'E_ARG' }])
        let tr2 = traceRec()
        let e2 = await catchErr(ens({ schema: 2 }, { pkgRoot: fx('ev-arg'), onTrace: tr2.on }))
        assert.strict.equal(e2.code, 'E_MANIFEST')
        assert.strict.deepStrictEqual(tr2.events, [{ type: 'settle', ok: false, code: 'E_MANIFEST' }])
        let tr3 = traceRec()
        let e3 = await catchErr(ens(mf([fTool()]), { pkgRoot: fx('ev-arg2'), names: ['nope.exe'], onTrace: tr3.on }))
        assert.strict.equal(e3.code, 'E_ARG')
        assert.strict.deepStrictEqual(tr3.events, [{ type: 'manifest', source: 'base', files: 1 }, { type: 'settle', ok: false, code: 'E_ARG' }])
    })

    it(`should treat an onTrace getter that throws as not given, and forward onTrace through the public fsEnsureBins`, async function() {
        let root = fx('ev-getter')
        let o = { fs, path, crypto, Readable, pipeline, spawn, env: {}, fetch: mapFetch, retryDelayMs: 10, pkgRoot: root }
        Object.defineProperty(o, 'onTrace', {
            enumerable: true,
            get() {
                throw new Error('getter failed')
            },
        })
        let r = await fsEnsureBinsCore(mf([fTool()]), o)
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true) //視為未給, 不影響取得
        //對外之fsEnsureBins以{...opt}展開, onTrace原樣轉傳
        let tr = traceRec()
        let root2 = fx('ev-public')
        let e = await catchErr(fsEnsureBins(mf([fTool()]), { pkgRoot: root2, cacheDir: path.join(root2, 'c'), offline: true, mirror: '', onTrace: tr.on }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(tr.events.map((v) => v.type), ['manifest', 'job', 'cache', 'offline', 'tidy', 'settle'])
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})


describe(`fsEnsureBins`, function() {

    let test = async () => {
        let ms = []

        let fdt = './_test_fsEnsureBins'
        fsCreateFolder(fdt) //創建任務資料夾(作為套件根目錄)

        //本機HTTP服務扮GitHub, 提供repo內之bin/tool.exe
        let body = Buffer.from('MZ-tool')
        let hits = 0
        let server = http.createServer((req, res) => {
            hits++
            res.writeHead(200, { 'content-length': String(body.length) })
            res.end(body)
        })
        await new Promise((resolve) => {
            server.listen(8812, '127.0.0.1', resolve)
        })
        let fetch = (url, init) => {
            return globalThis.fetch(url.replace('https://raw.githubusercontent.com', 'http://127.0.0.1:8812'), init)
        }

        //清單(實務上為bin/manifest.json)
        let manifest = {
            schema: 1,
            pkg: 'w-example',
            mode: 'pinned',
            repo: 'yuda-lyu/w-example',
            commit: '0123456789abcdef0123456789abcdef01234567',
            files: [
                { name: 'tool.exe', path: 'bin/tool.exe', sha256: crypto.createHash('sha256').update(body).digest('hex'), size: body.length },
            ],
        }

        //首次: 下載、校驗後放入快取<pkgRoot>/bin-cache/<sha256>/tool.exe
        let r1 = await fsEnsureBins(manifest, { pkgRoot: fdt, fetch, mirror: '', offline: false })
        ms.push({ name: Object.keys(r1)[0], inCache: r1['tool.exe'].includes('bin-cache'), content: fs.readFileSync(r1['tool.exe'], 'utf8'), hits })

        //第二次: 快取命中(校驗), 不連網
        let r2 = await fsEnsureBins(manifest, { pkgRoot: fdt, fetch, mirror: '', offline: false })
        ms.push({ same: r2['tool.exe'] === r1['tool.exe'], hits })

        //離線且快取另放他處(無檔): E_OFFLINE_MISSING, 訊息含檔名、sha256、應放之路徑
        await fsEnsureBins(manifest, { pkgRoot: fdt, cacheDir: `${fdt}/other`, mirror: '', offline: true })
            .catch((err) => {
                // console.log(err.message)
                ms.push({ code: err.code, name: err.missing[0].name, size: err.missing[0].size })
            })

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
        { name: 'tool.exe', inCache: true, content: 'MZ-tool', hits: 1 },
        { same: true, hits: 1 },
        { code: 'E_OFFLINE_MISSING', name: 'tool.exe', size: 7 }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
