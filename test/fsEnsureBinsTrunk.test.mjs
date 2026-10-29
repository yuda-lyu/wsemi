import fs from 'fs'
import http from 'http'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import fsGetBinManifestEntry from '../src/fsGetBinManifestEntry.mjs'
import zipStore from './tools/zipStore.mjs'
import { traceRec } from './tools/timeKit.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec)§3 M2(網址之釘選判定, F15)、M5(主幹模式之退路與CDN不同步, F5、F6、F7)、§6 E1(回傳)與§8 T8之對應案; 規則帳本R-BIN-ENSURE-01規則13~15
//全部不連外網: 清單、API與檔案之https網址一律經注入之fetch改指本機HTTP服務(port 8814), 鏡像為本地資料夾或本機HTTP服務
describe(`fsEnsureBins trunk mode, url rules and the adopted manifest`, function() {
    this.timeout(60000)

    let port = 8814
    let fdt = path.resolve('./test/_tmp/fsEnsureBinsTrunk')
    let server = null
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let C3 = '3333333333333333333333333333333333333333'
    let buf = (n, k) => {
        return Buffer.from(Array.from({ length: n }, (v, i) => (i * k + 1) % 256))
    }
    //三版同大小、內容不同(不符為E_HASH_MISMATCH; 大小不符另案)
    let tool1 = buf(12000, 7) //基準清單(npm包內)之版本
    let tool2 = buf(12000, 11) //主幹之新版本
    let tool3 = buf(12000, 13) //鏡像管理者所記之版本(manifest-last.json)
    let RAWF = '/raw.githubusercontent.com/yuda-lyu/w-f/'
    let API = '/api.github.com/repos/yuda-lyu/w-f/commits/master'
    let VURL = 'https://github.com/o/r/releases/download/v1/v.exe'

    let routes = {}
    let hits = []
    let fetchCalls = []
    let resetRoutes = () => {
        routes = {}
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

    let mfF = (files, over = {}) => {
        return { schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', files, ...over }
    }
    let fT = (b, over = {}) => {
        return { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(b), size: b.length, ...over }
    }
    let json = (o) => {
        return Buffer.from(JSON.stringify(o))
    }

    let nfx = 0
    let fx = (name) => {
        nfx++
        let fd = path.join(fdt, `${nfx}-${name}`)
        fs.mkdirSync(fd, { recursive: true })
        return fd
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
    let putMirror = (mirror, b, name = 'tool.exe') => {
        fs.mkdirSync(path.join(mirror, 'w-f', sha(b)), { recursive: true })
        fs.writeFileSync(path.join(mirror, 'w-f', sha(b), name), b)
    }
    let putLast = (mirror, text) => {
        fs.mkdirSync(path.join(mirror, 'w-f'), { recursive: true })
        fs.writeFileSync(path.join(mirror, 'w-f', 'manifest-last.json'), text)
    }

    before(async function() {
        process.on('unhandledRejection', onUnhandled)
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
        server = http.createServer((req, res) => {
            hits.push({ url: req.url, accept: req.headers.accept })
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

    //---------------- M5/F5 鏡像之manifest-last.json退路(主幹 → 鏡像之manifest-last.json → 基準清單) ----------------

    it(`should use manifest-last.json of the mirror when the trunk manifest can not be got, before the baseline (M5, F5)`, async function() {
        let mirror = fx('ml-mirror')
        putMirror(mirror, tool3)
        putLast(mirror, JSON.stringify(mfF([fT(tool3)])))
        let root = fx('ml')
        let tr = traceRec()
        //主幹清單404(GitHub可連但取不到)
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, mirror, onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool3), true)
        assert.strict.deepStrictEqual(fetchCalls, ['https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json'])
        assert.strict.deepStrictEqual([r.manifest.source, r.manifest.url], ['mirror-last', path.join(mirror, 'w-f', 'manifest-last.json')])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'mirrorlast' || e.type === 'manifest').map((e) => [e.type, e.result || e.source]), [['mirrorlast', 'ok'], ['manifest', 'mirror-last']])
        //鏡像之manifest-last.json不寫入快取夾之副本(副本只記主幹清單)
        assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', 'manifest-last.json')), false)
    })

    it(`should use manifest-last.json of the mirror offline without any network (M5, F5, O3)`, async function() {
        let mirror = fx('ml-off-mirror')
        putMirror(mirror, tool3)
        putLast(mirror, JSON.stringify(mfF([fT(tool3)])))
        let root = fx('ml-off')
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool3), true)
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.equal(r.manifest.source, 'mirror-last')
    })

    it(`should use the trunk manifest and not manifest-last.json of the mirror when the trunk can be got (M5)`, async function() {
        let mirror = fx('ml-trunk-mirror')
        putMirror(mirror, tool3)
        putLast(mirror, JSON.stringify(mfF([fT(tool3)])))
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool2)]))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        let root = fx('ml-trunk')
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, mirror })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.deepStrictEqual([r.manifest.source, r.manifest.url], ['remote', 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json'])
    })

    it(`should fall back to the baseline when manifest-last.json of the mirror is missing, invalid or for another package (M5, T8)`, async function() {
        let bads = [
            null,
            '{ not json',
            JSON.stringify(mfF([fT(tool3, { sha256: 'x' })])),
            JSON.stringify(mfF([fT(tool3)], { pkg: 'w-other' })),
            JSON.stringify(mfF([fT(tool3)], { repo: 'someone/w-f' })),
            JSON.stringify(mfF([{ name: 'tool.exe', url: 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/tool.exe', sha256: sha(tool3), size: tool3.length }])),
        ]
        for (let b of bads) {
            let mirror = fx('ml-bad-mirror')
            putMirror(mirror, tool1)
            putMirror(mirror, tool3)
            if (b !== null) {
                putLast(mirror, b)
            }
            let root = fx('ml-bad')
            let ev = []
            let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, mirror, offline: true, fetch: failFetch, onProgress: (v) => ev.push(v) })
            assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool1), true, String(b))
            assert.strict.equal(r.manifest.source, 'baseline', String(b))
            let evl = ev.find((v) => v.step === 'manifest' && v.source === 'mirror-last')
            assert.strict.equal(evl.result, b === null ? 'miss' : 'rejected', String(b))
        }
    })

    it(`should reject manifest-last.json of the mirror that is not a file or is larger than 1MB (M5)`, async function() {
        for (let kind of ['folder', 'large']) {
            let mirror = fx('ml-kind-mirror')
            putMirror(mirror, tool1)
            putMirror(mirror, tool3)
            if (kind === 'folder') {
                fs.mkdirSync(path.join(mirror, 'w-f', 'manifest-last.json'), { recursive: true })
            }
            else {
                let m = mfF([fT(tool3)], { note: 'x'.repeat(1024 * 1024) })
                putLast(mirror, JSON.stringify(m))
            }
            let ev = []
            let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('ml-kind'), mirror, offline: true, onProgress: (v) => ev.push(v) })
            assert.strict.equal(r.manifest.source, 'baseline', kind)
            assert.strict.equal(ev.find((v) => v.step === 'manifest' && v.source === 'mirror-last').result, 'rejected', kind)
        }
    })

    it(`should use manifest-last.json of an http mirror, and not follow its redirect offline (M5, F5, O3)`, async function() {
        routes['/mirror/w-f/manifest-last.json'] = json(mfF([fT(tool3)]))
        routes[`/mirror/w-f/${sha(tool3)}/tool.exe`] = tool3
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('ml-http'), mirror: `http://127.0.0.1:${port}/mirror`, offline: true })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool3), true)
        assert.strict.equal(r.manifest.source, 'mirror-last')
        //重導(可指向鏡像以外)離線時不追隨: 拒用, 退回基準清單
        routes['/mirror/w-f/manifest-last.json'] = (req, res) => {
            res.writeHead(302, { location: `http://127.0.0.1:${port}/elsewhere/manifest-last.json` })
            res.end()
        }
        routes['/elsewhere/manifest-last.json'] = json(mfF([fT(tool3)]))
        routes[`/mirror/w-f/${sha(tool1)}/tool.exe`] = tool1
        let r2 = await ens(mfF([fT(tool1)]), { pkgRoot: fx('ml-http-302'), mirror: `http://127.0.0.1:${port}/mirror`, offline: true })
        assert.strict.equal(r2.manifest.source, 'baseline')
        assert.strict.equal(hits.some((h) => h.url.startsWith('/elsewhere/')), false)
    })

    it(`should not use the copy of the last trunk manifest in the cache folder as a fallback even with a mirror set (M5, F6)`, async function() {
        let mirror = fx('ml-cache-mirror')
        putMirror(mirror, tool1)
        let root = fx('ml-cache')
        fs.mkdirSync(path.join(root, 'bin-cache', sha(tool3)), { recursive: true })
        fs.writeFileSync(path.join(root, 'bin-cache', 'manifest-last.json'), JSON.stringify(mfF([fT(tool3)])))
        fs.writeFileSync(path.join(root, 'bin-cache', sha(tool3), 'tool.exe'), tool3)
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool1), true)
        assert.strict.equal(r.manifest.source, 'baseline')
    })

    //---------------- M5/F7 取得之檔與清單不符時重取主幹清單(CDN不同步) ----------------

    //cdn, 主幹(master)之清單為舊(tool1)、檔為新(tool2): 不符; 重取時以API解析主幹之提交C3, 該提交之清單與檔一致(tool2)
    let cdn = () => {
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool1)]))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        routes[API] = Buffer.from(`${C3}\n`)
        routes[`${RAWF}${C3}/bin/manifest.json`] = json(mfF([fT(tool2)], { version: 'v2' }))
        routes[`${RAWF}${C3}/bin/tool.exe`] = tool2
    }

    it(`should get the trunk manifest again at the commit of master when a file does not match it, and then succeed (M5, F7)`, async function() {
        cdn()
        let root = fx('rf')
        let tr = traceRec()
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.deepStrictEqual(fetchCalls, [
            'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json',
            'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/tool.exe',
            'https://api.github.com/repos/yuda-lyu/w-f/commits/master',
            `https://raw.githubusercontent.com/yuda-lyu/w-f/${C3}/bin/manifest.json`,
            `https://raw.githubusercontent.com/yuda-lyu/w-f/${C3}/bin/tool.exe`,
        ])
        //API以Accept: application/vnd.github.sha取提交雜湊
        assert.strict.equal(hits.find((h) => h.url === API).accept, 'application/vnd.github.sha')
        assert.strict.deepStrictEqual([r.manifest.source, r.manifest.url, r.manifest.refetched, r.manifest.version], ['remote', `https://raw.githubusercontent.com/yuda-lyu/w-f/${C3}/bin/manifest.json`, true, 'v2'])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'refetch').map((e) => [e.phase, e.code]), [['start', 'E_HASH_MISMATCH'], ['ok', null]])
        //快取夾之副本為重取之清單
        assert.strict.equal(JSON.parse(fs.readFileSync(path.join(root, 'bin-cache', 'manifest-last.json'), 'utf8')).version, 'v2')
    })

    it(`should refetch when the trunk manifest is new and the file is stale, and get the file at that commit (M5, F7)`, async function() {
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool2)]))
        routes[`${RAWF}master/bin/tool.exe`] = tool1.subarray(0, 100) //舊檔(大小不符)
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = json(mfF([fT(tool2)]))
        routes[`${RAWF}${C3}/bin/tool.exe`] = tool2
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-stale') })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(r.manifest.refetched, true)
    })

    it(`should refetch only once and fail when the file still does not match (M5)`, async function() {
        cdn()
        routes[`${RAWF}${C3}/bin/manifest.json`] = json(mfF([fT(tool1)])) //重取後仍為舊清單
        let tr = traceRec()
        let e = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-still'), onTrace: tr.on }))
        assert.strict.equal(e && e.code, 'E_HASH_MISMATCH')
        assert.strict.equal(fetchCalls.filter((u) => u.startsWith('https://api.github.com/')).length, 1)
        assert.strict.deepStrictEqual(tr.events.filter((ev) => ev.type === 'refetch').map((ev) => ev.phase), ['start', 'ok'])
    })

    it(`should keep the first error when refetching fails (the api is not reachable or does not return a commit) (M5)`, async function() {
        for (let api of [undefined, Buffer.from('not a commit'), Buffer.from('A'.repeat(40)), Buffer.from('master'), 'bad manifest at the commit']) {
            fetchCalls = []
            cdn()
            if (api === undefined) {
                delete routes[API]
            }
            else if (typeof api === 'string') {
                routes[`${RAWF}${C3}/bin/manifest.json`] = Buffer.from('{ not json') //提交之清單無效
            }
            else {
                routes[API] = api
            }
            let tr = traceRec()
            let e = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-fail'), onTrace: tr.on }))
            assert.strict.deepStrictEqual([e && e.code, e.source], ['E_HASH_MISMATCH', 'github'], String(api))
            assert.strict.deepStrictEqual(tr.events.filter((ev) => ev.type === 'refetch').map((ev) => ev.phase), ['start', 'fail'], String(api))
            assert.strict.equal(fetchCalls.some((u) => u.includes(`/${C3}/bin/tool.exe`)), false, String(api))
            //重取失敗即以原錯誤結束, 不以原清單再取一次
            assert.strict.equal(fetchCalls.filter((u) => u.endsWith('/master/bin/tool.exe')).length, 1, String(api))
        }
    })

    it(`should not refetch in the pinned mode, offline, or for an error that is not a mismatch (M5)`, async function() {
        cdn()
        //釘選模式
        let e1 = await catchErr(ens({ schema: 1, pkg: 'w-f', mode: 'pinned', repo: 'yuda-lyu/w-f', commit: C1, files: [fT(tool1)] }, { pkgRoot: fx('rf-pinned') }))
        assert.strict.equal(e1 && e1.code, 'E_HTTP') //釘選提交之檔不存在
        //404(非不符)
        delete routes[`${RAWF}master/bin/tool.exe`]
        let e2 = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-404') }))
        assert.strict.equal(e2 && e2.code, 'E_HTTP')
        //離線(鏡像之檔不符為拒用→缺檔)
        let mirror = fx('rf-off-mirror')
        fs.mkdirSync(path.join(mirror, 'w-f', sha(tool1)), { recursive: true })
        fs.writeFileSync(path.join(mirror, 'w-f', sha(tool1), 'tool.exe'), tool2)
        let e3 = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-off'), offline: true, mirror }))
        assert.strict.equal(e3 && e3.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(fetchCalls.some((u) => u.startsWith('https://api.github.com/')), false)
        //釘選模式之不符
        resetRoutes()
        routes[`/raw.githubusercontent.com/yuda-lyu/w-f/${C1}/bin/tool.exe`] = tool2
        let e4 = await catchErr(ens({ schema: 1, pkg: 'w-f', mode: 'pinned', repo: 'yuda-lyu/w-f', commit: C1, files: [fT(tool1)] }, { pkgRoot: fx('rf-pinned2') }))
        assert.strict.equal(e4 && e4.code, 'E_HASH_MISMATCH')
        assert.strict.equal(fetchCalls.some((u) => u.startsWith('https://api.github.com/')), false)
    })

    it(`should not refetch offline even when a member extracted from a mirror archive does not match (M5, O3: no network offline)`, async function() {
        let kexe = buf(3000, 3)
        let kzip = zipStore([{ name: 'k.exe', data: kexe }])
        let mirror = fx('rf-off-x-mirror')
        fs.mkdirSync(path.join(mirror, 'w-f', sha(kzip)), { recursive: true })
        fs.writeFileSync(path.join(mirror, 'w-f', sha(kzip), 'k.zip'), kzip)
        let f = { name: 'k.exe', url: 'https://github.com/o/r/releases/download/v1/k.zip', sha256: sha(kzip), size: kzip.length, extract: { type: 'zip', member: 'k.exe', sha256: sha(buf(3000, 5)), size: kexe.length } }
        let tr = traceRec()
        let e = await catchErr(ens(mfF([f]), { pkgRoot: fx('rf-off-x'), mirror, offline: true, fetch: failFetch, onTrace: tr.on }))
        assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_HASH_MISMATCH', 'extract'])
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.equal(tr.events.some((v) => v.type === 'refetch'), false)
    })

    it(`should refetch at the commit also when opt.floatingManifestUrl is under master (M5, F7)`, async function() {
        cdn() //master之清單持續為舊(CDN), 檔為新
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-url-master'), floatingManifestUrl: 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json' })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(fetchCalls.filter((u) => u.startsWith('https://api.github.com/')).length, 1)
        assert.strict.equal(r.manifest.url, `https://raw.githubusercontent.com/yuda-lyu/w-f/${C3}/bin/manifest.json`)
    })

    it(`should refetch at the commit when opt.floatingManifestUrl names master in a percent-encoded form (M5)`, async function() {
        cdn()
        routes[`${RAWF}%6Daster/bin/manifest.json`] = json(mfF([fT(tool1)]))
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-url-enc'), floatingManifestUrl: 'https://raw.githubusercontent.com/yuda-lyu/w-f/%6Daster/bin/manifest.json' })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(fetchCalls.filter((u) => u.startsWith('https://api.github.com/')).length, 1)
    })

    it(`should refetch for a bundle whose extracted member does not match in the trunk mode (M5, M6)`, async function() {
        let x1 = buf(2500, 3)
        let x2 = buf(2500, 9)
        let z2 = zipStore([{ name: 'app/tool.exe', data: x2 }])
        let bun = (x) => ({ name: 'app', archives: [{ path: 'bin/app.zip', sha256: sha(z2), size: z2.length, extract: { type: 'zip', files: [{ path: 'app/tool.exe', sha256: sha(x), size: x.length }] } }] })
        let mk = (x) => json({ schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', bundles: [bun(x)] })
        routes[`${RAWF}master/bin/manifest.json`] = mk(x1) //舊清單: 成員之雜湊為舊
        routes[`${RAWF}master/bin/app.zip`] = z2
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = mk(x2)
        routes[`${RAWF}${C3}/bin/app.zip`] = z2
        let tr = traceRec()
        let r = await ens(JSON.parse(String(mk(x1))), { pkgRoot: fx('rf-bundle-x'), onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r.bundles.app.files['app/tool.exe']).equals(x2), true)
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'refetch').map((v) => [v.phase, v.code]), [['start', 'E_HASH_MISMATCH'], ['ok', null]])
        assert.strict.equal(fetchCalls.some((u) => u.endsWith(`/${C3}/bin/app.zip`)), true)
    })

    it(`should attach the leftovers of the first attempt when the refetched manifest no longer has a selected name (E3, M5)`, async function() {
        let root = fx('rf-names')
        let one = buf(1000, 3)
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool1), { name: 'one.exe', path: 'bin/one.exe', sha256: sha(one), size: one.length }]))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        routes[`${RAWF}master/bin/one.exe`] = one
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = json(mfF([{ name: 'one.exe', path: 'bin/one.exe', sha256: sha(one), size: one.length }])) //新清單已無tool.exe
        routes[`${RAWF}${C3}/bin/one.exe`] = one
        let f = Object.create(fs)
        f.unlinkSync = (p) => {
            //主幹清單副本之暫存檔刪不掉(本次之leftovers)
            if (String(p).includes('manifest-last.json.') && String(p).endsWith('.part')) {
                let err = new Error(`EACCES: permission denied, unlink '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.unlinkSync(p)
        }
        f.renameSync = (a, b) => {
            if (String(b).endsWith('manifest-last.json')) {
                let err = new Error(`EACCES: permission denied, rename '${a}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.renameSync(a, b)
        }
        let e = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: root, fs: f, names: ['one.exe', 'tool.exe'] }))
        assert.strict.equal(e && e.code, 'E_ARG')
        assert.strict.equal(Array.isArray(e.leftovers) && e.leftovers.length >= 1 && e.leftovers.every((v) => v.name === 'manifest-last.json'), true, JSON.stringify(e && e.leftovers))
        for (let v of e.leftovers) {
            fs.rmSync(v.fp, { force: true })
        }
    })

    it(`should keep the query of opt.floatingManifestUrl when refetching at the commit (M5)`, async function() {
        cdn()
        routes[`${RAWF}master/bin/manifest.json?ticket=1`] = json(mfF([fT(tool1)]))
        routes[`${RAWF}${C3}/bin/manifest.json?ticket=1`] = json(mfF([fT(tool2)]))
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-url-query'), floatingManifestUrl: 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json?ticket=1' })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(fetchCalls.includes(`https://raw.githubusercontent.com/yuda-lyu/w-f/${C3}/bin/manifest.json?ticket=1`), true, JSON.stringify(fetchCalls))
    })

    it(`should refetch for a bundle whose assembled archive does not match in the trunk mode (M5, M6)`, async function() {
        let x = buf(2500, 3)
        let z = zipStore([{ name: 'app/tool.exe', data: x }])
        let h = Math.ceil(z.length / 2)
        let p1 = z.subarray(0, h)
        let p2 = z.subarray(h)
        let bun = (asm) => ({ name: 'app', archives: [{ parts: [{ path: 'bin/app.zip.001', sha256: sha(p1), size: p1.length }, { path: 'bin/app.zip.002', sha256: sha(p2), size: p2.length }], assembled: asm, extract: { type: 'zip', files: [{ path: 'app/tool.exe', sha256: sha(x), size: x.length }] } }] })
        let bad = { type: 'zip', sha256: sha(Buffer.from('stale')), size: z.length } //舊清單之組合值
        let good = { type: 'zip', sha256: sha(z), size: z.length }
        let mk = (asm) => json({ schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', bundles: [bun(asm)] })
        routes[`${RAWF}master/bin/manifest.json`] = mk(bad)
        for (let ref of ['master', C3]) {
            routes[`${RAWF}${ref}/bin/app.zip.001`] = p1
            routes[`${RAWF}${ref}/bin/app.zip.002`] = p2
        }
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = mk(good)
        let tr = traceRec()
        let r = await ens(JSON.parse(String(mk(bad))), { pkgRoot: fx('rf-bundle-asm'), onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r.bundles.app.files['app/tool.exe']).equals(x), true)
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'refetch').map((v) => [v.phase, v.code]), [['start', 'E_HASH_MISMATCH'], ['ok', null]])
    })

    it(`should keep the leftovers of the first attempt when the refetch succeeds (E3, M5)`, async function() {
        cdn()
        let root = fx('rf-left')
        let f = Object.create(fs)
        f.unlinkSync = (p) => {
            //第一次下載(master之檔不符)時下載核心刪不掉其.part
            if (String(p).endsWith('.part') && String(p).includes(sha(tool1))) {
                let err = new Error(`EACCES: permission denied, unlink '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.unlinkSync(p)
        }
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: root, fs: f })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(r.leftovers.some((v) => v.name === 'tool.exe' && String(v.fp).endsWith('.part') && fs.existsSync(v.fp)), true, JSON.stringify(r.leftovers))
        for (let v of r.leftovers) {
            fs.rmSync(v.fp, { force: true })
        }
    })

    it(`should not refetch when the adopted trunk manifest is in the pinned mode (M5)`, async function() {
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool1)], { mode: 'pinned', commit: C1 }))
        routes[`${RAWF}${C1}/bin/tool.exe`] = tool2 //不符
        routes[API] = Buffer.from(C3)
        let e = await catchErr(ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-adopt-pinned') }))
        assert.strict.equal(e && e.code, 'E_HASH_MISMATCH')
        assert.strict.equal(fetchCalls.some((u) => u.startsWith('https://api.github.com/')), false)
    })

    it(`should refetch for a bundle whose file does not match in the trunk mode, and get the bundle at the commit (M5, M6)`, async function() {
        let a1 = buf(3000, 3)
        let a2 = buf(3000, 5)
        let dll = buf(2000, 7)
        let bun = (a) => ({ name: 'b', dir: 'bin/b', files: [{ path: 'a.exe', sha256: sha(a), size: a.length }, { path: 'x.dll', sha256: sha(dll), size: dll.length }] })
        routes[`${RAWF}master/bin/manifest.json`] = json({ schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', bundles: [bun(a1)] })
        routes[`${RAWF}master/bin/b/a.exe`] = a2
        routes[`${RAWF}master/bin/b/x.dll`] = dll
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = json({ schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', bundles: [bun(a2)] })
        routes[`${RAWF}${C3}/bin/b/a.exe`] = a2
        routes[`${RAWF}${C3}/bin/b/x.dll`] = dll
        let tr = traceRec()
        let r = await ens({ schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', bundles: [bun(a1)] }, { pkgRoot: fx('rf-bundle'), onTrace: tr.on })
        assert.strict.equal(fs.readFileSync(r.bundles.b.files['a.exe']).equals(a2), true)
        assert.strict.equal(fs.readFileSync(r.bundles.b.files['x.dll']).equals(dll), true)
        assert.strict.equal(fetchCalls.filter((u) => u.startsWith('https://api.github.com/')).length, 1)
        assert.strict.equal(fetchCalls.some((u) => u.endsWith(`/${C3}/bin/b/a.exe`)), true)
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'refetch').map((v) => v.phase), ['start', 'ok'])
        assert.strict.equal(r.manifest.refetched, true)
    })

    it(`should refetch the same opt.floatingManifestUrl without the api (M5)`, async function() {
        routes[`${RAWF}dev/manifest.json`] = json(mfF([fT(tool1)]))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        let n = 0
        routes[`${RAWF}dev/manifest.json`] = (req, res) => {
            let b = json(mfF([fT(n++ === 0 ? tool1 : tool2)]))
            res.writeHead(200, { 'content-length': String(b.length) })
            res.end(b)
        }
        let r = await ens(mfF([fT(tool1)]), { pkgRoot: fx('rf-url'), floatingManifestUrl: 'https://raw.githubusercontent.com/yuda-lyu/w-f/dev/manifest.json' })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool2), true)
        assert.strict.equal(fetchCalls.some((u) => u.startsWith('https://api.github.com/')), false)
        assert.strict.equal(fetchCalls.filter((u) => u.endsWith('/dev/manifest.json')).length, 2)
    })

    it(`should refetch for a mismatch of a vendor file in the trunk mode (M5)`, async function() {
        let vb1 = buf(5000, 3)
        let vb2 = buf(5000, 5)
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([{ name: 'v.exe', url: VURL, sha256: sha(vb1), size: vb1.length }]))
        routes['/github.com/o/r/releases/download/v1/v.exe'] = vb2
        routes[API] = Buffer.from(C3)
        routes[`${RAWF}${C3}/bin/manifest.json`] = json(mfF([{ name: 'v.exe', url: VURL, sha256: sha(vb2), size: vb2.length }]))
        let r = await ens(mfF([{ name: 'v.exe', url: VURL, sha256: sha(vb1), size: vb1.length }]), { pkgRoot: fx('rf-vendor') })
        assert.strict.equal(fs.readFileSync(r['v.exe']).equals(vb2), true)
    })

    //---------------- M2/F15 網址之釘選判定 ----------------

    let goodUrls = [
        'https://github.com/o/r/releases/download/v1.0.0/k6.zip',
        'https://github.com/o/r/releases/download/refs%2Fheads%2Fv1/k6.zip',
        `https://raw.githubusercontent.com/o/r/${C1}/bin/k6.zip`,
        `https://github.com/o/r/raw/${C1}/bin/k6.zip`,
        'HTTPS://github.com/o/r/releases/download/v1.0.0/k6.zip', //scheme不分大小寫
    ]
    let badUrls = [
        'http://github.com/o/r/releases/download/v1/k6.zip',
        'https://u:p@github.com/o/r/releases/download/v1/k6.zip',
        'https://github.com/o/r/releases/latest/download/k6.zip',
        'https://github.com/o/r/releases/download/v1/k6.zip?x=1',
        'https://github.com/o/r/releases/download/v1/k6.zip#a',
        'https://github.com:444/o/r/releases/download/v1/k6.zip',
        'https://github.com/o/r/releases/download/v1/sub/k6.zip',
        'https://github.com/o/r/releases/download//k6.zip',
        'https://github.com/o/r/Releases/download/v1/k6.zip',
        'https://github.com/o/r/releases/download/v1/a%2Fk6.zip',
        'https://raw.githubusercontent.com/o/r/master/bin/k6.zip',
        'https://raw.githubusercontent.com/o/r/develop/bin/k6.zip',
        'https://raw.githubusercontent.com/o/r/v1.0.0/bin/k6.zip',
        `https://raw.githubusercontent.com/o/r/${C1.toUpperCase()}/bin/k6.zip`,
        `https://raw.githubusercontent.com/o/r/${C1.slice(1)}/bin/k6.zip`,
        `https://raw.githubusercontent.com/o/r/${C1}/`,
        'https://raw.githubusercontent.com/o/r/refs/heads/dev/bin/k6.zip',
        'https://github.com/o/r/raw/develop/bin/k6.zip',
        `https://github.com/o/r/blob/${C1}/bin/k6.zip`,
        'https://objects.githubusercontent.com/github-production-release-asset/1/k6.zip',
        'https://example.com/k6.zip',
        'https://github.com.other.example/o/r/releases/download/v1/k6.zip',
        //URL解析會正規化掉之語法: 以原始字串判定
        'https://github.com:443/o/r/releases/download/v1/k6.zip',
        'https://github.com:/o/r/releases/download/v1/k6.zip',
        'https://github.com/o/r/releases/download/v1/k6.zip?',
        'https://github.com/o/r/releases/download/v1/k6.zip#',
        'https://github.com\\o/r/releases/download/v1/k6.zip',
        'https://github.com/o/r/releases/download/v1/k 6.zip',
        'https:github.com:444/o/r/releases/download/v1/k6.zip',
        'https:/github.com/o/r/releases/download/v1/k6.zip',
        'https://u@github.com/o/r/releases/download/v1/k6.zip',
        //原始檔路徑之段解碼後含斜線或反斜線
        `https://raw.githubusercontent.com/o/r/${C1}/a%2Fb.exe`,
        `https://github.com/o/r/raw/${C1}/a%5Cb.exe`,
        `https://raw.githubusercontent.com/o%2Fx/r/${C1}/b.exe`,
    ]

    it(`should accept only a release asset url of a tag or a GitHub raw url at a 40-character commit, for files, parts, bundle files and archives (M2, F15, S3)`, async function() {
        let zb = buf(100, 3)
        let forms = (u) => {
            return [
                ['files[0].url', { files: [{ name: 'k6.zip', url: u, sha256: sha(zb), size: zb.length }] }],
                ['files[0].parts[0].url', { files: [{ name: 'k6.exe', parts: [{ url: u, sha256: sha(zb), size: zb.length }], assembled: { type: 'zip', sha256: sha(zb), size: zb.length }, extract: { type: 'zip', member: 'k6.exe', sha256: sha(zb), size: zb.length } }] }],
                ['bundles[0].files[0].url', { bundles: [{ name: 'b', files: [{ path: 'k6.zip', url: u, sha256: sha(zb), size: zb.length }] }] }],
                ['bundles[0].archives[0].url', { bundles: [{ name: 'b', archives: [{ url: u, sha256: sha(zb), size: zb.length, extract: { type: 'zip', files: [{ path: 'k6.exe', sha256: sha(zb), size: zb.length }] } }] }] }],
            ]
        }
        for (let mode of ['pinned', 'floating']) {
            for (let u of badUrls) {
                for (let [field, m] of forms(u)) {
                    let root = fx('url-bad')
                    let e = await catchErr(ens({ schema: 1, pkg: 'w-f', mode, repo: 'yuda-lyu/w-f', ...m }, { pkgRoot: root, fetch: failFetch, offline: true }))
                    assert.strict.deepStrictEqual([e && e.code, e && e.field], ['E_MANIFEST', field], `${mode} ${u} ${e && e.message}`)
                    assert.strict.deepStrictEqual(fs.readdirSync(root), [])
                }
            }
            for (let u of goodUrls) {
                for (let [field, m] of forms(u)) {
                    let e = await catchErr(ens({ schema: 1, pkg: 'w-f', mode, repo: 'yuda-lyu/w-f', ...m }, { pkgRoot: fx('url-good'), fetch: failFetch, offline: true }))
                    //網址合格: 清單檢核通過, 離線缺檔
                    assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING', `${mode} ${u} ${field} ${e && e.message}`)
                }
            }
        }
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should apply the same url rules in fsGetBinManifestEntry (M2, single rule)`, async function() {
        let fp = path.join(fx('url-entry'), 'k6.zip')
        fs.writeFileSync(fp, 'x')
        for (let u of goodUrls) {
            let r = await fsGetBinManifestEntry(fp, { url: u })
            assert.strict.equal(r.url, u) //產生器原樣記入(fsEnsureBins使用時正規化)
        }
        for (let u of badUrls) {
            let err = await catchErr(fsGetBinManifestEntry(fp, { url: u }))
            assert.strict.equal(typeof err, 'string', u)
        }
    })

    //---------------- E1 回傳實際採用之清單項(不可列舉屬性) ----------------

    it(`should give the adopted manifest and entries as non-enumerable frozen properties, keeping { [name]: path } (E1)`, async function() {
        routes[`${RAWF}master/bin/manifest.json`] = json(mfF([fT(tool2, { note: 'n2' })], { version: 'v2', note: 'top' }))
        routes[`${RAWF}master/bin/tool.exe`] = tool2
        let r = await ens(mfF([fT(tool1)], { version: 'v1' }), { pkgRoot: fx('ent') })
        assert.strict.deepStrictEqual(Object.keys(r), ['tool.exe'])
        assert.strict.deepStrictEqual(JSON.parse(JSON.stringify(r)), { 'tool.exe': r['tool.exe'] })
        for (let k of ['leftovers', 'manifest', 'entries', 'bundles']) {
            assert.strict.equal(Object.getOwnPropertyDescriptor(r, k).enumerable, false, k)
        }
        //主幹模式: 呼叫端可知所用版本(採用之清單與其項之sha256)
        assert.strict.deepStrictEqual(r.manifest, { source: 'remote', url: 'https://raw.githubusercontent.com/yuda-lyu/w-f/master/bin/manifest.json', refetched: false, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', commit: null, manifestPath: 'bin/manifest.json', version: 'v2', note: 'top' })
        assert.strict.deepStrictEqual(r.entries, { 'tool.exe': { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(tool2), size: tool2.length, note: 'n2' } })
        assert.strict.deepStrictEqual(r.bundles, {})
        assert.strict.equal(Object.isFrozen(r.manifest) && Object.isFrozen(r.entries) && Object.isFrozen(r.entries['tool.exe']), true)
    })

    it(`should give entries in the form of the manifest for every source form, with sha256 in lowercase (E1)`, async function() {
        let zb = buf(100, 3)
        let s = sha(zb)
        let m = {
            schema: 1,
            pkg: 'w-f',
            mode: 'pinned',
            repo: 'yuda-lyu/w-f',
            commit: C1,
            files: [
                { name: 'a.exe', url: VURL, sha256: s.toUpperCase(), size: 100, extract: { type: 'zip', member: 'x/a.exe', sha256: s, size: 100 } },
                { name: 'b.exe', parts: [{ path: 'bin/b.zip.001', sha256: s, size: 100 }], assembled: { type: 'zip', sha256: s, size: 100 }, extract: { type: 'zip', member: 'b.exe', sha256: s, size: 100 } },
            ],
        }
        let mirror = fx('ent-mirror')
        for (let n of ['a.exe', 'b.exe']) {
            fs.mkdirSync(path.join(mirror, 'w-f', s), { recursive: true })
            fs.writeFileSync(path.join(mirror, 'w-f', s, n), zb)
        }
        let r = await ens(m, { pkgRoot: fx('ent2'), mirror, offline: true })
        assert.strict.deepStrictEqual(r.entries['a.exe'], { name: 'a.exe', url: VURL, sha256: s, size: 100, extract: { type: 'zip', member: 'x/a.exe', sha256: s, size: 100 } })
        assert.strict.deepStrictEqual(r.entries['b.exe'], { name: 'b.exe', parts: [{ name: 'b.zip.001', path: 'bin/b.zip.001', sha256: s, size: 100 }], assembled: { type: 'zip', sha256: s, size: 100 }, extract: { type: 'zip', member: 'b.exe', sha256: s, size: 100 } })
        assert.strict.deepStrictEqual([r.manifest.source, r.manifest.url, r.manifest.commit, r.manifest.version], ['base', null, C1, null])
    })

    it(`should reject file names that are the names of the properties of the result (E1, M1)`, async function() {
        for (let n of ['leftovers', 'manifest', 'Entries', 'BUNDLES']) {
            let root = fx('reserved')
            let e = await catchErr(ens({ schema: 1, pkg: 'w-f', mode: 'pinned', repo: 'yuda-lyu/w-f', commit: C1, files: [fT(tool1, { name: n })] }, { pkgRoot: root, fetch: failFetch }))
            assert.strict.deepStrictEqual([e && e.code, e && e.field], ['E_MANIFEST', 'files[0].name'], n)
            assert.strict.deepStrictEqual(fs.readdirSync(root), [])
        }
    })

    it(`should make the names of files own properties even when a name is __proto__ (E1)`, async function() {
        let mirror = fx('proto-mirror')
        putMirror(mirror, tool1, '__proto__')
        let r = await ens({ schema: 1, pkg: 'w-f', mode: 'pinned', repo: 'yuda-lyu/w-f', commit: C1, files: [fT(tool1, { name: '__proto__' })] }, { pkgRoot: fx('proto'), mirror, offline: true })
        assert.strict.deepStrictEqual(Object.keys(r), ['__proto__'])
        assert.strict.deepStrictEqual(Object.keys(r.entries), ['__proto__'])
        assert.strict.equal(Object.getPrototypeOf(r.entries), Object.prototype)
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})
