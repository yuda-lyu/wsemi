import fs from 'fs'
import http from 'http'
import path from 'path'
import crypto from 'crypto'
import zlib from 'zlib'
import assert from 'assert'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import zipStore from './tools/zipStore.mjs'
import tgzStore from './tools/tgzStore.mjs'
import canvasPack from './tools/canvasNapiWin32X64.mjs'
import { traceRec } from './tools/timeKit.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec)§3 D5解壓與M6檔案組; 規則帳本R-BIN-ENSURE-01規則18(壓縮檔類型tgz, Gitea #32: w-canvas以官方預建檔tar.gz取canvas.node與dll)
//extract.type與assembled.type除'zip'外接受'tgz'(tar加gzip), 與'zip'並列; 其他值為E_MANIFEST; 成員可含目錄; 同一tgz可取多個成員(檔案組)
//全部不連外網(除預設不跑之連網案): 清單內之https網址一律經注入之fetch改指本機HTTP服務(port 8815), 解壓為真實之tar(Windows為System32\tar.exe)
describe(`fsEnsureBins tgz archives (D5, M6)`, function() {
    this.timeout(60000)

    let port = 8815
    let fdt = path.resolve('./test/_tmp/fsEnsureBinsTgz')
    let server = null
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    //rnd, 決定性之不可壓縮內容(逐段SHA-256), 使tgz有真實之大小
    let rnd = (n, seed) => {
        let out = []
        let h = crypto.createHash('sha256').update(String(seed)).digest()
        let len = 0
        while (len < n) {
            out.push(h)
            len += h.length
            h = crypto.createHash('sha256').update(h).digest()
        }
        return Buffer.concat(out).subarray(0, n)
    }
    let split3 = (b) => {
        let n = Math.ceil(b.length / 3)
        return [b.subarray(0, n), b.subarray(n, n * 2), b.subarray(n * 2)]
    }

    //單一成員(廠商網址之tgz): 成員含目錄, 壓縮檔另有資料夾項與未列入清單之項
    let exe = rnd(30000, 'exe')
    let tgzS = tgzStore([
        { name: 'pkg-1/', kind: 'dir' },
        { name: 'pkg-1/bin/', kind: 'dir' },
        { name: 'pkg-1/bin/tool.exe', data: exe },
        { name: 'pkg-1/LICENSE', data: Buffer.from('license') },
    ])
    let URLS = 'https://github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz'
    let SNAME = 'pkg-1-win32-x64.tar.gz'
    let MEMBER = 'pkg-1/bin/tool.exe'

    //分割之tgz(自有檔)
    let big = rnd(120000, 'big')
    let tgzB = tgzStore([{ name: 'big/', kind: 'dir' }, { name: 'big/big.exe', data: big }])
    let bParts = split3(tgzB)
    //分割之zip(回歸: 組合檔名仍為assembled.zip)
    let zbig = rnd(50000, 'zbig')
    let zipZ = zipStore([{ name: 'z/zbig.exe', data: zbig }])
    let zParts = split3(zipZ)

    //檔案組(如w-canvas): 同一tgz取多個成員, 成員在build/Release/下, 壓縮檔另有資料夾項與未列入清單之建置中繼檔
    let cv = {
        'build/Release/canvas.node': rnd(60000, 1),
        'build/Release/libcairo-2.dll': rnd(40000, 2),
        'build/Release/libstdc++-6.dll': rnd(30000, 3),
        'build/Release/libgcc_s_seh-1.dll': rnd(20000, 4),
        'build/Release/zlib1.dll': rnd(5000, 5),
    }
    let cvMeta = { 'build/binding.sln': Buffer.from('sln'), 'build/config.gypi': Buffer.from('gypi') }
    let entriesOf = (o) => Object.entries(o).map(([name, data]) => ({ name, data }))
    let tgzC = tgzStore([{ name: 'build/', kind: 'dir' }, ...entriesOf(cvMeta), { name: 'build/Release/', kind: 'dir' }, ...entriesOf(cv)])
    let URLC = 'https://github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz'
    let CNAME = 'canvas-v1-napi-v7-win32-x64.tar.gz'
    //檔案組之分割tgz
    let cp = { 'p/a.dll': rnd(30000, 'pa'), 'p/lib/b.dll': rnd(20000, 'pb') }
    let tgzP = tgzStore(entriesOf(cp))
    let pParts = split3(tgzP)
    //同組內zip與tgz兩個壓縮檔
    let zk = { 'zk/z1.dll': rnd(7000, 'z1') }
    let zipK = zipStore(entriesOf(zk))
    let ZURL = 'https://github.com/o/r/releases/download/v3/zk.zip'
    let tk = { 'tk/t1.dll': rnd(8000, 't1') }
    let tgzK = tgzStore(entriesOf(tk))
    let TURL = 'https://github.com/o/r/releases/download/v3/tk.tar.gz'

    let RAW1 = `/raw.githubusercontent.com/yuda-lyu/w-g/${C1}/`

    let routes = {}
    let hits = []
    let fetchCalls = []
    let resetRoutes = () => {
        routes = {
            '/github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz': tgzS,
            '/github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz': tgzC,
            '/github.com/o/r/releases/download/v3/zk.zip': zipK,
            '/github.com/o/r/releases/download/v3/tk.tar.gz': tgzK,
            [`${RAW1}bin/big.tgz.001`]: bParts[0],
            [`${RAW1}bin/big.tgz.002`]: bParts[1],
            [`${RAW1}bin/big.tgz.003`]: bParts[2],
            [`${RAW1}bin/zbig.zip.001`]: zParts[0],
            [`${RAW1}bin/zbig.zip.002`]: zParts[1],
            [`${RAW1}bin/zbig.zip.003`]: zParts[2],
            [`${RAW1}bin/cp.tgz.001`]: pParts[0],
            [`${RAW1}bin/cp.tgz.002`]: pParts[1],
            [`${RAW1}bin/cp.tgz.003`]: pParts[2],
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

    let mf = (over = {}) => {
        return { schema: 1, pkg: 'w-g', mode: 'pinned', repo: 'yuda-lyu/w-g', commit: C1, ...over }
    }
    let fTgz = (over = {}) => {
        return { name: 'tool.exe', url: URLS, sha256: sha(tgzS), size: tgzS.length, extract: { type: 'tgz', member: MEMBER, sha256: sha(exe), size: exe.length }, ...over }
    }
    let fTgzParts = (over = {}) => {
        return {
            name: 'big.exe',
            parts: bParts.map((b, i) => ({ path: `bin/big.tgz.00${i + 1}`, sha256: sha(b), size: b.length })),
            assembled: { type: 'tgz', sha256: sha(tgzB), size: tgzB.length },
            extract: { type: 'tgz', member: 'big/big.exe', sha256: sha(big), size: big.length },
            ...over,
        }
    }
    let fZipParts = (over = {}) => {
        return {
            name: 'zbig.exe',
            parts: zParts.map((b, i) => ({ path: `bin/zbig.zip.00${i + 1}`, sha256: sha(b), size: b.length })),
            assembled: { type: 'zip', sha256: sha(zipZ), size: zipZ.length },
            extract: { type: 'zip', member: 'z/zbig.exe', sha256: sha(zbig), size: zbig.length },
            ...over,
        }
    }
    let members = (o) => {
        return Object.entries(o).map(([p, b]) => ({ path: p, sha256: sha(b), size: b.length }))
    }
    let bCanvas = (over = {}) => {
        return { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzC), size: tgzC.length, extract: { type: 'tgz', files: members(cv) } }], ...over }
    }
    let bCanvasParts = (over = {}) => {
        return {
            name: 'cparts',
            archives: [{
                parts: pParts.map((b, i) => ({ path: `bin/cp.tgz.00${i + 1}`, sha256: sha(b), size: b.length })),
                assembled: { type: 'tgz', sha256: sha(tgzP), size: tgzP.length },
                extract: { type: 'tgz', files: members(cp) },
            }],
            ...over,
        }
    }
    let bMix = (over = {}) => {
        return {
            name: 'mix',
            archives: [
                { url: ZURL, sha256: sha(zipK), size: zipK.length, extract: { type: 'zip', files: members(zk) } },
                { url: TURL, sha256: sha(tgzK), size: tgzK.length, extract: { type: 'tgz', files: members(tk) } },
            ],
            ...over,
        }
    }
    //idOf, 組識別之獨立計算(組內(path, sha256)依path排序後, 逐行'<sha256>  <path>\n'之SHA-256)
    let idOf = (files) => {
        let ls = files.map((f) => [f.path, `${f.sha256}  ${f.path}\n`])
        ls.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
        return sha(ls.map((v) => v[1]).join(''))
    }
    let idCv = idOf(members(cv))

    let nfx = 0
    let fx = (name) => {
        nfx++
        let fd = path.join(fdt, `${nfx}-${name}`)
        fs.mkdirSync(fd, { recursive: true })
        return fd
    }
    //spawnRec, 記錄每次解壓程式之呼叫(程式、參數)並交真實之spawn執行; 程式不存在(ENOENT, 如他平台無bsdtar而改用tar)的嘗試不計
    let spawnRec = () => {
        let calls = []
        return {
            calls,
            spawn: (...a) => {
                calls.push(a)
                let cp = spawn(...a)
                cp.on('error', (err) => {
                    if (err && err.code === 'ENOENT' && calls.includes(a)) {
                        calls.splice(calls.indexOf(a), 1)
                    }
                })
                return cp
            },
        }
    }
    let ens = (manifest, opt = {}) => {
        return fsEnsureBinsCore(manifest, { fs, path, crypto, Readable, pipeline, spawn, env: {}, fetch: mapFetch, retryDelayMs: 10, maxAttempts: 1, ...opt })
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
            return v.endsWith('.part') || v.split('/').some((s) => s.startsWith('.work-'))
        })
    }
    let sameTree = (dir, exp) => {
        let got = walk(dir).filter((v) => fs.lstatSync(path.join(dir, v)).isFile()).sort()
        assert.strict.deepStrictEqual(got, Object.keys(exp).sort())
        for (let [p, b] of Object.entries(exp)) {
            assert.strict.equal(fs.readFileSync(path.join(dir, ...p.split('/'))).equals(b), true, p)
        }
    }
    let cachePath = (root, buf, name) => {
        return path.join(root, 'bin-cache', sha(buf), name)
    }
    let putMirror = (mirror, buf, name, pkg = 'w-g') => {
        let fp = path.join(mirror, pkg, sha(buf), name)
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, buf)
        return fp
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

    //---------------- 清單: type接受'zip'與'tgz', 其他為E_MANIFEST ----------------

    it(`should accept type 'tgz' beside 'zip' in extract.type and assembled.type for a file and a bundle, in the same manifest (D5)`, async function() {
        let root = fx('m-accept')
        let zfile = { name: 'k6.exe', url: 'https://github.com/o/r/releases/download/v3/zk.zip', sha256: sha(zipK), size: zipK.length, extract: { type: 'zip', member: 'zk/z1.dll', sha256: sha(zk['zk/z1.dll']), size: zk['zk/z1.dll'].length } }
        let m = mf({ files: [fTgz(), fTgzParts(), fZipParts(), zfile], bundles: [bCanvas(), bCanvasParts(), bMix()] })
        let r = await ens(m, { pkgRoot: root })
        assert.strict.deepStrictEqual(Object.keys(r), ['tool.exe', 'big.exe', 'zbig.exe', 'k6.exe', 'canvas', 'cparts', 'mix'])
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(exe), true)
        assert.strict.equal(fs.readFileSync(r['big.exe']).equals(big), true)
        assert.strict.equal(fs.readFileSync(r['zbig.exe']).equals(zbig), true)
        assert.strict.equal(fs.readFileSync(r['k6.exe']).equals(zk['zk/z1.dll']), true)
        sameTree(r.canvas, cv)
        sameTree(r.cparts, cp)
        sameTree(r.mix, { ...zk, ...tk })
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    let mAll = () => {
        return mf({ files: [fTgz(), fTgzParts()], bundles: [bCanvas(), bCanvasParts()] })
    }
    let bads = [
        ['file extract.type tar.gz', (m) => {
            m.files[0].extract.type = 'tar.gz'
        }, 'files[0].extract.type'],
        ['file extract.type TGZ (case-sensitive)', (m) => {
            m.files[0].extract.type = 'TGZ'
        }, 'files[0].extract.type'],
        ['file extract.type tar (not compressed)', (m) => {
            m.files[0].extract.type = 'tar'
        }, 'files[0].extract.type'],
        ['file extract.type 7z', (m) => {
            m.files[0].extract.type = '7z'
        }, 'files[0].extract.type'],
        ['file extract.type missing', (m) => {
            delete m.files[0].extract.type
        }, 'files[0].extract.type'],
        ['file extract.type as a String object', (m) => {
            m.files[0].extract.type = new String('tgz') // eslint-disable-line no-new-wrappers
        }, 'files[0].extract.type'],
        ['file extract.type as an array', (m) => {
            m.files[0].extract.type = ['tgz']
        }, 'files[0].extract.type'],
        ['file parts: assembled.type zip with extract.type tgz', (m) => {
            m.files[1].assembled.type = 'zip'
        }, 'files[1].assembled.type'],
        ['file parts: assembled.type tgz with extract.type zip', (m) => {
            m.files[1].extract.type = 'zip'
        }, 'files[1].assembled.type'],
        ['file parts: assembled.type tar.gz', (m) => {
            m.files[1].assembled.type = 'tar.gz'
        }, 'files[1].assembled.type'],
        ['file member with ..', (m) => {
            m.files[0].extract.member = '../escape.exe'
        }, 'files[0].extract.member'],
        ['file member with .. inside', (m) => {
            m.files[0].extract.member = 'pkg-1/../../escape.exe'
        }, 'files[0].extract.member'],
        ['file member absolute', (m) => {
            m.files[0].extract.member = '/abs/escape.exe'
        }, 'files[0].extract.member'],
        ['file member with backslash', (m) => {
            m.files[0].extract.member = 'pkg-1\\bin\\tool.exe'
        }, 'files[0].extract.member'],
        ['file member with a . segment (./ prefix)', (m) => {
            m.files[0].extract.member = './pkg-1/bin/tool.exe'
        }, 'files[0].extract.member'],
        ['file member with an empty segment', (m) => {
            m.files[0].extract.member = 'pkg-1//tool.exe'
        }, 'files[0].extract.member'],
        ['file member with a glob character', (m) => {
            m.files[0].extract.member = 'pkg-1/bin/*.exe'
        }, 'files[0].extract.member'],
        ['bundle archive extract.type tar.gz', (m) => {
            m.bundles[0].archives[0].extract.type = 'tar.gz'
        }, 'bundles[0].archives[0].extract.type'],
        ['bundle archive extract.type missing', (m) => {
            delete m.bundles[0].archives[0].extract.type
        }, 'bundles[0].archives[0].extract.type'],
        ['bundle parts: assembled.type zip with extract.type tgz', (m) => {
            m.bundles[1].archives[0].assembled.type = 'zip'
        }, 'bundles[1].archives[0].assembled.type'],
        ['bundle parts: assembled.type tgz with extract.type zip', (m) => {
            m.bundles[1].archives[0].extract.type = 'zip'
        }, 'bundles[1].archives[0].assembled.type'],
        ['bundle parts: assembled.type tar', (m) => {
            m.bundles[1].archives[0].assembled.type = 'tar'
        }, 'bundles[1].archives[0].assembled.type'],
        ['bundle member with ..', (m) => {
            m.bundles[0].archives[0].extract.files[0].path = '../escape.dll'
        }, 'bundles[0].archives[0].extract.files[0].path'],
        ['bundle member absolute', (m) => {
            m.bundles[0].archives[0].extract.files[0].path = '/abs/escape.dll'
        }, 'bundles[0].archives[0].extract.files[0].path'],
        ['bundle member with a . segment (./ prefix)', (m) => {
            m.bundles[0].archives[0].extract.files[0].path = './build/Release/canvas.node'
        }, 'bundles[0].archives[0].extract.files[0].path'],
    ]
    for (let [label, fn, field] of bads) {
        it(`should reject E_MANIFEST before any download or folder creation: ${label} (D5, M1, M6)`, async function() {
            let m = mAll()
            fn(m)
            let root = fx('m-bad')
            let e = await catchErr(ens(m, { pkgRoot: root, fetch: failFetch }))
            assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_MANIFEST', 'manifest'], String(e && e.message))
            assert.strict.equal(e.field, field, e.message)
            if (field.endsWith('.extract.type')) {
                assert.strict.equal(e.message.includes(`must be 'zip' or 'tgz'`), true, e.message)
            }
            if (field.endsWith('.assembled.type')) {
                assert.strict.equal(e.message.includes(`(the same as extract.type)`), true, e.message)
            }
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(fs.readdirSync(root), [])
        })
    }

    //---------------- 單一檔: 自tgz解出一個成員(含目錄) ----------------

    it(`should extract a member with directories from a vendor tgz in a work folder, verify it and move it into the cache (D5)`, async function() {
        let root = fx('s-one')
        let sr = spawnRec()
        let ev = []
        let r = await ens(mf({ files: [fTgz()] }), { pkgRoot: root, spawn: sr.spawn, onProgress: (v) => ev.push(v.step) })
        assert.strict.equal(r['tool.exe'], cachePath(root, exe, 'tool.exe'))
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(fetchCalls, [URLS])
        //快取只有最終檔(壓縮檔與暫存夾皆不留; 成員之目錄pkg-1/bin不帶入快取)
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [sha(exe), `${sha(exe)}/tool.exe`])
        assert.strict.deepStrictEqual(ev, ['download', 'extract', 'ready'])
        //壓縮檔以其網址之檔名存放, 參數為暫存夾內之相對路徑, 只解出清單所列之成員(成員前加--)
        assert.strict.equal(sr.calls.length, 1)
        assert.strict.deepStrictEqual(sr.calls[0][1], ['-x', '-f', `archive/${SNAME}`, '-C', 'x', '--', MEMBER])
        assert.strict.equal(sr.calls[0][2].windowsHide, true)
        if (process.platform === 'win32') {
            assert.strict.equal(/System32[\\/]tar\.exe$/i.test(sr.calls[0][0]), true)
        }
        assert.strict.deepStrictEqual(leftovers(root), [])
        //第二次快取命中: 不連網, 不解壓
        let sr2 = spawnRec()
        fetchCalls = []
        let r2 = await ens(mf({ files: [fTgz()] }), { pkgRoot: root, fetch: failFetch, spawn: sr2.spawn })
        assert.strict.equal(r2['tool.exe'], r['tool.exe'])
        assert.strict.deepStrictEqual([fetchCalls, sr2.calls.length], [[], 0])
    })

    it(`should give the entries in the manifest form with type tgz for a file, parts and bundle, and zip entries unchanged (E1)`, async function() {
        let root = fx('s-entries')
        let r = await ens(mf({ files: [fTgz(), fTgzParts(), fZipParts()], bundles: [bCanvas(), bCanvasParts()] }), { pkgRoot: root })
        assert.strict.deepStrictEqual(r.entries['tool.exe'], { name: 'tool.exe', url: URLS, sha256: sha(tgzS), size: tgzS.length, extract: { type: 'tgz', member: MEMBER, sha256: sha(exe), size: exe.length } })
        assert.strict.deepStrictEqual(r.entries['big.exe'].assembled, { type: 'tgz', sha256: sha(tgzB), size: tgzB.length })
        assert.strict.equal(r.entries['big.exe'].extract.type, 'tgz')
        assert.strict.deepStrictEqual(r.entries['zbig.exe'].assembled, { type: 'zip', sha256: sha(zipZ), size: zipZ.length })
        assert.strict.equal(r.entries['zbig.exe'].extract.type, 'zip')
        assert.strict.equal(r.entries.canvas.archives[0].extract.type, 'tgz')
        assert.strict.deepStrictEqual(r.entries.cparts.archives[0].assembled, { type: 'tgz', sha256: sha(tgzP), size: tgzP.length })
        assert.strict.equal(r.entries.cparts.archives[0].extract.type, 'tgz')
    })

    it(`should name the assembled file by the type: assembled.tgz for tgz parts and assembled.zip for zip parts (S4, D5)`, async function() {
        let root = fx('s-parts')
        let sr = spawnRec()
        let r = await ens(mf({ files: [fTgzParts(), fZipParts()] }), { pkgRoot: root, spawn: sr.spawn })
        assert.strict.equal(fs.readFileSync(r['big.exe']).equals(big), true)
        assert.strict.equal(fs.readFileSync(r['zbig.exe']).equals(zbig), true)
        assert.strict.deepStrictEqual(sr.calls.map((c) => c[1]), [
            ['-x', '-f', 'assembled.tgz', '-C', 'x', '--', 'big/big.exe'],
            ['-x', '-f', 'assembled.zip', '-C', 'x', '--', 'z/zbig.exe'],
        ])
        assert.strict.deepStrictEqual(leftovers(root), [])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')).filter((v) => v.includes('assembled')), [])
    })

    it(`should reject E_HASH_MISMATCH at step assemble when the assembled tgz differs from assembled, and E_SIZE_MISMATCH for a size difference (S4)`, async function() {
        let root = fx('s-asm-bad')
        let e = await catchErr(ens(mf({ files: [fTgzParts({ assembled: { type: 'tgz', sha256: sha(tgzS), size: tgzB.length } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin], ['E_HASH_MISMATCH', 'assemble', 'big.exe'])
        let e2 = await catchErr(ens(mf({ files: [fTgzParts({ assembled: { type: 'tgz', sha256: sha(tgzB), size: tgzB.length + 1 } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_SIZE_MISMATCH', 'assemble'])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject an extracted member whose sha256 or size differs from extract, leaving nothing in the cache (D5)`, async function() {
        let root = fx('s-bad')
        let e = await catchErr(ens(mf({ files: [fTgz({ extract: { type: 'tgz', member: MEMBER, sha256: sha(big), size: exe.length } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin], ['E_HASH_MISMATCH', 'extract', 'tool.exe'])
        let e2 = await catchErr(ens(mf({ files: [fTgz({ extract: { type: 'tgz', member: MEMBER, sha256: sha(exe), size: exe.length + 1 } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_SIZE_MISMATCH', 'extract'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject E_EXTRACT when the member is not in the tgz, naming the member (D5)`, async function() {
        let root = fx('s-missing')
        let e = await catchErr(ens(mf({ files: [fTgz({ extract: { type: 'tgz', member: 'pkg-1/bin/none.exe', sha256: sha(exe), size: exe.length } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin], ['E_EXTRACT', 'extract', 'tool.exe'])
        assert.strict.equal(e.message.includes('pkg-1/bin/none.exe'), true, e.message)
        //路徑只有尾段相同(壓縮檔內為pkg-1/bin/tool.exe)不算成員: 成員須為壓縮檔內之完整路徑
        let e2 = await catchErr(ens(mf({ files: [fTgz({ extract: { type: 'tgz', member: 'bin/tool.exe', sha256: sha(exe), size: exe.length } })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_EXTRACT', 'extract'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject E_EXTRACT when the member is a folder or a symbolic link in the tgz, not a regular file (D5)`, async function() {
        let root = fx('s-notfile')
        //資料夾項
        let tgzD = tgzStore([{ name: 'pkg-1/bin/tool.exe/', kind: 'dir' }])
        routes['/github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz'] = tgzD
        let e = await catchErr(ens(mf({ files: [fTgz({ sha256: sha(tgzD), size: tgzD.length })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step], ['E_EXTRACT', 'extract'])
        assert.strict.equal(e.message.includes('not a regular file'), true, e.message)
        //符號連結項(Windows無建立連結之權限時解壓程式即失敗, 他平台解出連結而不是一般檔案; 皆為E_EXTRACT)
        let tgzL = tgzStore([{ name: 'pkg-1/bin/tool.exe', kind: 'symlink', data: '../../outside.exe' }])
        routes['/github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz'] = tgzL
        let e2 = await catchErr(ens(mf({ files: [fTgz({ sha256: sha(tgzL), size: tgzL.length })] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.step], ['E_EXTRACT', 'extract'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject E_EXTRACT when the downloaded file passes the checksum but is not a gzip tar (a gzip of other data, a truncated gzip) (D5)`, async function() {
        let root = fx('s-broken')
        let notTar = zlib.gzipSync(Buffer.from('this is not a tar archive'))
        let trunc = tgzS.subarray(0, Math.floor(tgzS.length / 2))
        for (let [label, b] of [['gzip of other data', notTar], ['truncated gzip', trunc]]) {
            routes['/github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz'] = b
            let e = await catchErr(ens(mf({ files: [fTgz({ sha256: sha(b), size: b.length })] }), { pkgRoot: root }))
            assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_EXTRACT', 'extract'], label)
        }
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should only extract the listed member: entries with .. or an absolute path in the tgz are not written outside the work folder (D5, path traversal)`, async function() {
        let root = fx('s-trav')
        let ok = rnd(3000, 'ok')
        let tgzT = tgzStore([
            { name: '../escape1.txt', data: Buffer.from('bad1') },
            { name: '../../escape2.txt', data: Buffer.from('bad2') },
            { name: '../../../escape3.txt', data: Buffer.from('bad3') },
            { name: '/abs-escape4.txt', data: Buffer.from('bad4') },
            { name: 'pkg-1/bin/tool.exe', data: ok },
        ])
        routes['/github.com/o/r/releases/download/v1/pkg-1-win32-x64.tar.gz'] = tgzT
        let r = await ens(mf({ files: [fTgz({ sha256: sha(tgzT), size: tgzT.length, extract: { type: 'tgz', member: MEMBER, sha256: sha(ok), size: ok.length } })] }), { pkgRoot: root })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(ok), true)
        //套件根(含快取與暫存夾)之下只有最終檔, 其上層(測試夾具之根)沒有被寫入之escape檔
        assert.strict.deepStrictEqual(walk(root), ['bin-cache', `bin-cache/${sha(ok)}`, `bin-cache/${sha(ok)}/tool.exe`])
        let up = []
        for (let d of [fdt, path.dirname(fdt), path.dirname(path.dirname(fdt)), 'C:\\', '/']) {
            for (let n of ['escape1.txt', 'escape2.txt', 'escape3.txt', 'abs-escape4.txt']) {
                if (fs.existsSync(path.join(d, n))) {
                    up.push(path.join(d, n))
                }
            }
        }
        assert.strict.deepStrictEqual(up, [])
    })

    it(`should extract from a tgz found in the mirror while offline, and report the archive and member in E_OFFLINE_MISSING when it is absent (D5, O1, O3)`, async function() {
        let root = fx('s-mirror')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tgzS, SNAME)
        let r = await ens(mf({ files: [fTgz()] }), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
        //離線且鏡像與快取皆無
        let root2 = fx('s-offline')
        let e = await catchErr(ens(mf({ files: [fTgz()] }), { pkgRoot: root2, offline: true, mirror: path.join(root2, 'empty'), fetch: failFetch }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual([e.missing[0].name, e.missing[0].member, e.missing[0].archive.name], ['tool.exe', MEMBER, SNAME])
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should reject a tgz in the mirror that differs from the manifest and then download it (O1, O2)`, async function() {
        let root = fx('s-mirror-bad')
        let mirror = path.join(root, 'mirror')
        let bad = Buffer.from(tgzS)
        bad[bad.length - 20] = (bad[bad.length - 20] + 1) % 256
        let fp = path.join(mirror, 'w-g', sha(tgzS), SNAME)
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, bad)
        let r = await ens(mf({ files: [fTgz()] }), { pkgRoot: root, mirror })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(exe), true)
        assert.strict.deepStrictEqual(fetchCalls, [URLS]) //鏡像之檔不符即拒用, 改自網址下載
    })

    //---------------- 檔案組: 同一tgz取多個成員(w-canvas之用法) ----------------

    it(`should get a bundle of many members from one tgz with a single extraction, putting them side by side under build/Release and leaving the unlisted entries out (M6, D5)`, async function() {
        let root = fx('b-canvas')
        let sr = spawnRec()
        let tr = traceRec()
        let ev = []
        let r = await ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root, spawn: sr.spawn, onTrace: tr.on, onProgress: (v) => ev.push(v) })
        let dir = path.join(root, 'bin-cache', idCv)
        assert.strict.equal(r.canvas, dir)
        //只有清單所列之成員(建置中繼檔與資料夾項不在組內), 路徑含build/Release
        sameTree(dir, cv)
        assert.strict.equal(r.bundles.canvas.files['build/Release/canvas.node'], path.join(dir, 'build', 'Release', 'canvas.node'))
        assert.strict.deepStrictEqual(Object.keys(r.bundles.canvas.files).sort(), Object.keys(cv).sort())
        assert.strict.equal(fs.existsSync(path.join(dir, 'build', 'binding.sln')), false)
        //一個壓縮檔只下載一次, 只執行一次解壓並一次取出全部成員
        assert.strict.deepStrictEqual(fetchCalls, [URLC])
        assert.strict.equal(sr.calls.length, 1)
        assert.strict.deepStrictEqual(sr.calls[0][1], ['-x', '-f', `archive/${CNAME}`, '-C', 'x', '--', ...Object.keys(cv)])
        assert.strict.deepStrictEqual(ev.filter((v) => v.step === 'extract').map((v) => [v.name, v.members]), [['canvas', 5]])
        assert.strict.deepStrictEqual(tr.types().filter((t) => t === 'extract' || t === 'extracted' || t === 'publish'), ['extract', 'extracted', 'publish'])
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'download').map((v) => [v.name, v.file]), [['canvas', CNAME]])
        //D3: 快取只存組資料夾, 不存壓縮檔
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')), [idCv])
        assert.strict.deepStrictEqual(leftovers(root), [])
        //第二次整組快取命中: 不連網, 不解壓
        let sr2 = spawnRec()
        fetchCalls = []
        let r2 = await ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root, fetch: failFetch, spawn: sr2.spawn })
        assert.strict.equal(r2.canvas, dir)
        assert.strict.deepStrictEqual([fetchCalls, sr2.calls.length], [[], 0])
    })

    it(`should get a bundle from the parts of a tgz (assembled.tgz) and from a zip and a tgz in the same bundle (M6, S4)`, async function() {
        let root = fx('b-parts-mix')
        let sr = spawnRec()
        let r = await ens(mf({ bundles: [bCanvasParts(), bMix()] }), { pkgRoot: root, spawn: sr.spawn })
        sameTree(r.cparts, cp)
        sameTree(r.mix, { ...zk, ...tk })
        assert.strict.deepStrictEqual(sr.calls.map((c) => c[1][2]), ['assembled.tgz', `archive/zk.zip`, `archive/tk.tar.gz`])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should extract many members of a tgz in batches so that the command line stays short (D5)`, async function() {
        let root = fx('b-many')
        let many = {}
        for (let i = 0; i < 300; i++) {
            many[`deep/folder/with/a/long/name/member-number-${String(i).padStart(4, '0')}.dat`] = Buffer.from(`member ${i}`)
        }
        let tgzM = tgzStore(entriesOf(many))
        routes[`${RAW1}bin/many.tgz`] = tgzM
        let b = { name: 'many', archives: [{ path: 'bin/many.tgz', sha256: sha(tgzM), size: tgzM.length, extract: { type: 'tgz', files: members(many) } }] }
        let tr = traceRec()
        let r = await ens(mf({ bundles: [b] }), { pkgRoot: root, onTrace: tr.on })
        sameTree(r.many, many)
        //300個成員約1.5萬字元: 分批執行(每批之成員參數至多6000字元), 每批各一次extract與extracted
        let nx = tr.types().filter((t) => t === 'extract').length
        assert.strict.equal(nx >= 3, true, String(nx))
        assert.strict.equal(tr.events.filter((e) => e.type === 'extracted' && e.result === 'exit' && e.code === 0).length, nx)
    })

    it(`should reject E_EXTRACT and publish nothing when a listed member is missing from the tgz (M6, D5)`, async function() {
        let root = fx('b-missing')
        let b = bCanvas()
        b.archives[0].extract.files.push({ path: 'build/Release/not-there.dll', sha256: sha(exe), size: exe.length })
        let e = await catchErr(ens(mf({ bundles: [b] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin], ['E_EXTRACT', 'extract', 'canvas'])
        assert.strict.equal(e.message.includes('not-there.dll'), true, e.message)
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
        //單一成員之批: 錯誤帶file(組內路徑)
        let b1 = { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzC), size: tgzC.length, extract: { type: 'tgz', files: [{ path: 'build/Release/not-there.dll', sha256: sha(exe), size: exe.length }] } }] }
        let e1 = await catchErr(ens(mf({ bundles: [b1] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e1.code, e1.file], ['E_EXTRACT', 'build/Release/not-there.dll'])
    })

    it(`should reject the hash or size of a member that differs from the manifest, with the path in the bundle, and publish nothing (M6, D5)`, async function() {
        let root = fx('b-mismatch')
        let b = bCanvas()
        b.archives[0].extract.files[2].sha256 = sha(exe) //libstdc++-6.dll
        let e = await catchErr(ens(mf({ bundles: [b] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin, e.file], ['E_HASH_MISMATCH', 'extract', 'canvas', 'build/Release/libstdc++-6.dll'])
        let b2 = bCanvas()
        b2.archives[0].extract.files[1].size += 1
        let e2 = await catchErr(ens(mf({ bundles: [b2] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.file], ['E_SIZE_MISMATCH', 'build/Release/libcairo-2.dll'])
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should only extract the listed members of a bundle: entries with .. or an absolute path in the tgz are not written outside the work folder (M6, D5, path traversal)`, async function() {
        let root = fx('b-trav')
        let ok = { 'build/Release/canvas.node': cv['build/Release/canvas.node'], 'build/Release/zlib1.dll': cv['build/Release/zlib1.dll'] }
        //檔案組之解出夾為<暫存夾>/a0/x: 三層..落在快取夾, 四層..落在套件根
        let tgzX = tgzStore([
            { name: '../escape-b1.dll', data: Buffer.from('bad1') },
            { name: '../../../escape-b2.dll', data: Buffer.from('bad2') },
            { name: '../../../../escape-b3.dll', data: Buffer.from('bad3') },
            { name: '/abs-escape-b4.dll', data: Buffer.from('bad4') },
            ...entriesOf(ok),
        ])
        routes['/github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz'] = tgzX
        let b = { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzX), size: tgzX.length, extract: { type: 'tgz', files: members(ok) } }] }
        let r = await ens(mf({ bundles: [b] }), { pkgRoot: root })
        sameTree(r.canvas, ok)
        //套件根(含快取與暫存夾)之下只有組資料夾與其內之檔, 沒有escape檔; 其上層(測試夾具之根)亦無
        assert.strict.deepStrictEqual(walk(root).filter((v) => v.includes('escape')), [])
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')), [r.bundles.canvas.id])
        assert.strict.deepStrictEqual(leftovers(root), [])
        let up = []
        for (let d of [fdt, path.dirname(fdt), path.dirname(path.dirname(fdt)), 'C:\\', '/']) {
            for (let n of ['escape-b1.dll', 'escape-b2.dll', 'escape-b3.dll', 'abs-escape-b4.dll']) {
                if (fs.existsSync(path.join(d, n))) {
                    up.push(path.join(d, n))
                }
            }
        }
        assert.strict.deepStrictEqual(up, [])
    })

    it(`should reject a bundle member that is a symbolic link, a folder or a hard link to an entry that is not extracted, writing nothing (M6, D5)`, async function() {
        let root = fx('b-notfile')
        let tgzX = tgzStore([
            { name: 'build/Release/canvas.node', data: cv['build/Release/canvas.node'] },
            { name: 'build/Release/zlib1.dll', kind: 'symlink', data: '../../../outside.dll' },
        ])
        let b = { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzX), size: tgzX.length, extract: { type: 'tgz', files: members({ 'build/Release/canvas.node': cv['build/Release/canvas.node'], 'build/Release/zlib1.dll': cv['build/Release/zlib1.dll'] }) } }] }
        routes['/github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz'] = tgzX
        let e = await catchErr(ens(mf({ bundles: [b] }), { pkgRoot: root }))
        assert.strict.equal(e.code, 'E_EXTRACT')
        assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [])
        assert.strict.deepStrictEqual(leftovers(root), [])
        for (let d of [fdt, path.dirname(fdt)]) {
            assert.strict.equal(fs.existsSync(path.join(d, 'outside.dll')), false, path.join(d, 'outside.dll'))
        }
        //硬連結項: 目標未列入清單(不解出)或在解出夾之外, 解壓程式皆失敗, 不建立連結
        for (let target of ['build/Release/original.dll', '../../../victim.dll']) {
            let tgzH = tgzStore([
                { name: 'build/Release/original.dll', data: cv['build/Release/zlib1.dll'] },
                { name: 'build/Release/zlib1.dll', kind: 'hardlink', data: target },
            ])
            routes['/github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz'] = tgzH
            let bh = { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzH), size: tgzH.length, extract: { type: 'tgz', files: members({ 'build/Release/zlib1.dll': cv['build/Release/zlib1.dll'] }) } }] }
            let eh = await catchErr(ens(mf({ bundles: [bh] }), { pkgRoot: root }))
            assert.strict.deepStrictEqual([eh && eh.code, eh && eh.step], ['E_EXTRACT', 'extract'], target)
            assert.strict.deepStrictEqual(walk(path.join(root, 'bin-cache')), [], target)
        }
        assert.strict.deepStrictEqual(leftovers(root), [])
        //資料夾項
        let tgzF = tgzStore([{ name: 'build/Release/canvas.node/', kind: 'dir' }])
        let b2 = { name: 'canvas', archives: [{ url: URLC, sha256: sha(tgzF), size: tgzF.length, extract: { type: 'tgz', files: members({ 'build/Release/canvas.node': cv['build/Release/canvas.node'] }) } }] }
        routes['/github.com/o/r/releases/download/v2/canvas-v1-napi-v7-win32-x64.tar.gz'] = tgzF
        let e2 = await catchErr(ens(mf({ bundles: [b2] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e2.code, e2.file], ['E_EXTRACT', 'build/Release/canvas.node'])
        assert.strict.equal(e2.message.includes('not a regular file'), true, e2.message)
    })

    it(`should reget the whole bundle from the tgz when a cached member is tampered with, replacing the folder (M6, D6)`, async function() {
        let root = fx('b-tamper')
        let r = await ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root })
        let victim = path.join(r.canvas, 'build', 'Release', 'libcairo-2.dll')
        fs.writeFileSync(victim, Buffer.from('tampered'))
        fetchCalls = []
        let ev = []
        let r2 = await ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root, onProgress: (v) => ev.push(v) })
        assert.strict.equal(r2.canvas, r.canvas)
        sameTree(r2.canvas, cv)
        assert.strict.deepStrictEqual(fetchCalls, [URLC])
        assert.strict.deepStrictEqual(ev.filter((v) => v.step === 'publish').map((v) => v.result), ['replaced'])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should get a bundle of a tgz from the mirror while offline, and list the whole bundle in E_OFFLINE_MISSING when the tgz is absent (M6, O1, O3)`, async function() {
        let root = fx('b-mirror')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tgzC, CNAME)
        let r = await ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        sameTree(r.canvas, cv)
        assert.strict.deepStrictEqual(fetchCalls, [])
        let root2 = fx('b-offline')
        let e = await catchErr(ens(mf({ bundles: [bCanvas()] }), { pkgRoot: root2, offline: true, fetch: failFetch }))
        assert.strict.equal(e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(e.missing[0].bundle.files.map((f) => f.path).sort(), Object.keys(cv).sort())
        assert.strict.equal(e.missing[0].bundle.archives[0].archive.name, CNAME)
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.deepStrictEqual(fs.readdirSync(root2), []) //離線缺檔不留空夾
    })

    //---------------- 連網案(預設不跑): 官方canvas預建檔 ----------------

    //依清單(canvas.node與44個dll, 皆在build/Release/下; 壓縮檔共49項, 另有2個資料夾項與4個建置中繼檔不需要)自官方資產取得, 驗證tgz之清單可用於w-canvas
    //預設不跑(15 MB, 須連GitHub); 設環境變數WSEMI_TEST_NET_CANVAS=1執行: WSEMI_TEST_NET_CANVAS=1 npx mocha --no-parallel test/fsEnsureBinsTgz.test.mjs --timeout 180000 --grep "official canvas"
    it(`should get canvas.node and the dlls of the official canvas prebuilt asset (tar.gz) as a bundle, verifying each file (Gitea #32, online, set WSEMI_TEST_NET_CANVAS=1)`, async function() {
        if (process.env.WSEMI_TEST_NET_CANVAS !== '1') {
            this.skip()
        }
        this.timeout(300000)
        let root = fx('net-canvas')
        let b = { name: 'canvas', archives: [{ url: canvasPack.url, sha256: canvasPack.sha256, size: canvasPack.size, extract: { type: 'tgz', files: canvasPack.files } }] }
        let sr = spawnRec()
        let r = await ens(mf({ bundles: [b] }), { pkgRoot: root, fetch: null, spawn: sr.spawn, maxAttempts: 3, retryDelayMs: 1000 })
        let want = canvasPack.files.map((f) => f.path).sort()
        assert.strict.equal(want.length, 45)
        let got = walk(r.canvas).filter((v) => fs.lstatSync(path.join(r.canvas, v)).isFile()).sort()
        assert.strict.deepStrictEqual(got, want)
        for (let f of canvasPack.files) {
            let buf = fs.readFileSync(path.join(r.canvas, ...f.path.split('/')))
            assert.strict.deepStrictEqual([sha(buf), buf.length], [f.sha256, f.size], f.path)
        }
        assert.strict.equal(sr.calls.length, 1) //45個成員一次取出
        assert.strict.equal(fs.existsSync(path.join(r.canvas, 'build', 'config.gypi')), false) //建置中繼檔不取
        assert.strict.deepStrictEqual(leftovers(root), [])
        //第二次自快取取得, 不連網
        let sr2 = spawnRec()
        let r2 = await ens(mf({ bundles: [b] }), { pkgRoot: root, fetch: failFetch, spawn: sr2.spawn })
        assert.strict.deepStrictEqual([r2.canvas, sr2.calls.length], [r.canvas, 0])
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})
