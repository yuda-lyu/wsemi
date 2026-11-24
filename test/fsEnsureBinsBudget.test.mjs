import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsEnsureBins from '../src/fsEnsureBins.mjs'
import fsEnsureBinsBudget from '../src/fsEnsureBinsBudget.mjs'
import fsEnsureBinsCore, { fsEnsureBinsBudgetCore } from '../src/fsEnsureBinsCore.mjs'
import { traceRec } from './tools/timeKit.mjs'


//規格: 排程第634項③(twsm3); 規則帳本R-BIN-ENSURE-01規則21: fsEnsureBinsBudget依清單與選項回傳一次取得之預算毫秒數, 與fsEnsureBins跨程序鎖之持有與等候上限(lockBudget)同一算式(單一來源)
//每單位: 下載次數×T＋解壓批數×(T＋5000)＋min(T, 60000); 下載次數: 單一直接檔1、壓縮檔為各來源檔各1(鏡像者每個來源另加1)、壓縮檔另加鏡像之最終檔1、檔案組另加鏡像之組資料夾逐檔各1; 主幹模式且非離線另加opt.stallMs
describe(`fsEnsureBinsBudget`, function() {

    let fdt = path.resolve('./test/_tmp/fsEnsureBinsBudget')
    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let H = (k) => {
        return String(k).repeat(64).slice(0, 64)
    }
    let fTool = { name: 'tool.exe', path: 'bin/tool.exe', sha256: H(1), size: 7 }
    let fZip = { name: 'k6.exe', url: 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip', sha256: H(2), size: 100, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: H(3), size: 50 } }
    let fParts = {
        name: 'ffmpeg.exe',
        parts: [1, 2, 3].map((i) => ({ path: `bin/ff.zip.00${i}`, sha256: H(i + 3), size: 10 + i })),
        assembled: { type: 'zip', sha256: H(7), size: 36 },
        extract: { type: 'zip', member: 'ff/ffmpeg.exe', sha256: H(8), size: 20 },
    }
    //檔案組: 2個repo檔＋1個壓縮檔(3個成員, 1批)
    let bPk = {
        name: 'pk',
        dir: 'bin/pk',
        files: [{ path: 'a.exe', sha256: H(9), size: 11 }, { path: 'b.dll', sha256: H('a'), size: 12 }],
        archives: [{ url: 'https://github.com/o/c/releases/download/v3/c.tar.gz', sha256: H('b'), size: 99, extract: { type: 'tgz', files: [{ path: 'lib/c.node', sha256: H('c'), size: 13 }, { path: 'lib/d.dll', sha256: H('d'), size: 14 }, { path: 'lib/e.dll', sha256: H('e'), size: 15 }] } }],
    }
    let mf = (files, over = {}) => {
        return { schema: 1, pkg: 'w-bg', mode: 'pinned', repo: 'yuda-lyu/w-bg', commit: C1, files, ...over }
    }
    let mfB = (bundles) => {
        return { schema: 1, pkg: 'w-bg', mode: 'pinned', repo: 'yuda-lyu/w-bg', commit: C1, bundles }
    }
    let base = { pkgRoot: '.', mirror: '', offline: false, env: {} }
    let T = 1000
    let S = Math.min(T, 60000)

    after(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    it(`should sum the budget of each unit: direct file, zip, split parts and a bundle, without a mirror`, function() {
        let o = { ...base, totalMs: T }
        //直接檔: 1×T＋S
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), o), T + S)
        //壓縮檔: 1×T＋1×(T＋5000)＋S
        assert.strict.equal(fsEnsureBinsBudget(mf([fZip]), o), T + (T + 5000) + S)
        //分割檔3個: 3×T＋(T＋5000)＋S
        assert.strict.equal(fsEnsureBinsBudget(mf([fParts]), o), 3 * T + (T + 5000) + S)
        //檔案組: repo檔2＋壓縮檔1 = 3×T, 解壓1批
        assert.strict.equal(fsEnsureBinsBudget(mfB([bPk]), o), 3 * T + (T + 5000) + S)
        //全部: 各單位之和
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool, fZip, fParts], { bundles: [bPk] }), o), (T + S) + (2 * T + 5000 + S) + (4 * T + 5000 + S) + (4 * T + 5000 + S))
    })

    it(`should add one try per source and the mirror copies with a mirror (opt.mirror or W_BIN_MIRROR)`, function() {
        let o = { ...base, totalMs: T, mirror: './mirror' }
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), o), 2 * T + S) //鏡像＋來源
        assert.strict.equal(fsEnsureBinsBudget(mf([fZip]), o), (1 + 2) * T + (T + 5000) + S) //鏡像之最終檔＋(鏡像＋來源)
        assert.strict.equal(fsEnsureBinsBudget(mf([fParts]), o), (1 + 3 * 2) * T + (T + 5000) + S)
        assert.strict.equal(fsEnsureBinsBudget(mfB([bPk]), o), (5 + 2 * 2 + 1 * 2) * T + (T + 5000) + S) //鏡像之組資料夾逐檔5＋repo檔2×2＋壓縮檔1×2
        //環境變數之鏡像同opt.mirror; opt.mirror為''即不使用
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), { ...base, totalMs: T, mirror: undefined, env: { W_BIN_MIRROR: 'http://127.0.0.1:8899/m' } }), 2 * T + S)
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), { ...base, totalMs: T, mirror: '', env: { W_BIN_MIRROR: 'http://127.0.0.1:8899/m' } }), T + S)
    })

    it(`should count the extraction batches of a bundle archive like the tar batching (members longer than the argument cap)`, function() {
        //成員參數總長逾6000字元即分批: 每個成員路徑約190字元, 40個約7600字元 → 2批
        let long = (i) => `d${String(i).padStart(2, '0')}/${'x'.repeat(180)}.bin`
        let b = { name: 'big', archives: [{ url: 'https://github.com/o/c/releases/download/v3/big.zip', sha256: H(1), size: 99, extract: { type: 'zip', files: Array.from({ length: 40 }, (v, i) => ({ path: long(i), sha256: H(2), size: 1 })) } }] }
        assert.strict.equal(fsEnsureBinsBudget(mfB([b]), { ...base, totalMs: T }), T + 2 * (T + 5000) + S)
    })

    it(`should add the trunk manifest limit (opt.stallMs) in the trunk mode only when online, and count only opt.names`, function() {
        let fl2 = { schema: 1, pkg: 'w-bg', mode: 'floating', repo: 'yuda-lyu/w-bg', files: [fTool, fZip] }
        let o = { ...base, totalMs: T, stallMs: 300 }
        assert.strict.equal(fsEnsureBinsBudget(fl2, o), (T + S) + (2 * T + 5000 + S) + 300)
        assert.strict.equal(fsEnsureBinsBudget(fl2, { ...o, offline: true }), (T + S) + (2 * T + 5000 + S)) //離線不取主幹清單
        assert.strict.equal(fsEnsureBinsBudget(fl2, { ...o, names: 'k6.exe' }), (2 * T + 5000 + S) + 300)
        assert.strict.equal(fsEnsureBinsBudget(fl2, { ...o, names: [] }), 0) //空陣列: 不取任何檔(亦不取主幹清單)
    })

    it(`should use the default 600000 for an invalid opt.totalMs like fsEnsureBins, and the cap of 60000 in the slack`, function() {
        for (let v of [undefined, 0, -1, 'abc', Infinity, 2147483648]) {
            assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), { ...base, totalMs: v }), 600000 + 60000, String(v))
        }
        assert.strict.equal(fsEnsureBinsBudget(mf([fTool]), { ...base, totalMs: '2000' }), 2000 + 2000)
    })

    it(`should throw the same errors as fsEnsureBins for invalid arguments and manifests (E_ARG, E_MANIFEST)`, async function() {
        let cases = [
            ['', base],
            [mf([fTool]), { ...base, names: 'nope.exe' }],
            [mf([fTool]), { ...base, names: 5 }],
            [mf([fTool]), { ...base, pkgRoot: '' }],
            [mf([fTool]), { ...base, offline: 'yes' }],
            [{ ...mf([fTool]), schema: 2 }, base],
            ['./test/_tmp/fsEnsureBinsBudget/none.json', base],
        ]
        for (let [m, o] of cases) {
            let e1 = null
            try {
                fsEnsureBinsBudget(m, o)
            }
            catch (err) {
                e1 = err
            }
            let e2 = null
            let noNet = () => {
                throw new Error('network must not be used')
            }
            try {
                await fsEnsureBins(m, { ...o, fetch: noNet })
            }
            catch (err) {
                e2 = err
            }
            assert.strict.notEqual(e1, null, JSON.stringify(o))
            assert.strict.deepStrictEqual([e1.code, e1.message, e1.step], [e2.code, e2.message, e2.step], JSON.stringify(o))
        }
    })

    it(`should read a manifest file relative to opt.pkgRoot like fsEnsureBins, without creating any folder`, function() {
        let root = path.join(fdt, 'mfile')
        fs.mkdirSync(path.join(root, 'bin'), { recursive: true })
        fs.writeFileSync(path.join(root, 'bin', 'manifest.json'), JSON.stringify(mf([fTool, fZip])))
        assert.strict.equal(fsEnsureBinsBudget('bin/manifest.json', { ...base, pkgRoot: root, totalMs: T }), (T + S) + (2 * T + 5000 + S))
        assert.strict.deepStrictEqual(fs.readdirSync(root), ['bin']) //不建快取夾
    })

    it(`should equal the limit recorded in the lock by fsEnsureBins for the same unit and options (single source)`, async function() {
        let root = path.join(fdt, 'same')
        fs.mkdirSync(root, { recursive: true })
        let body = Buffer.from(Array.from({ length: 3000 }, (v, i) => (i * 7 + 1) % 256))
        let f = { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(body), size: body.length }
        let tr = traceRec()
        for (let o of [{ totalMs: 4321 }, { totalMs: 3777, mirror: 'http://127.0.0.1:1/none' }]) {
            fs.rmSync(path.join(root, 'bin-cache'), { recursive: true, force: true })
            //來源之請求暫不回應(持鎖下載中), 到達後才讀鎖之紀錄
            let release = null
            let called = new Promise((resolve) => {
                release = resolve
            })
            let respond = null
            let fetch = () => new Promise((resolve) => {
                respond = () => resolve(new Response(body, { status: 200, headers: { 'content-length': String(body.length) } }))
                release()
            })
            let opt = { pkgRoot: root, mirror: '', offline: false, env: {}, ...o }
            let mirrorFetch = (u, init) => (String(u).startsWith('http://127.0.0.1:1/') ? Promise.resolve(new Response('nf', { status: 404 })) : fetch(u, init))
            let pm = fsEnsureBinsCore(mf([f]), { fs, path, crypto, Readable, pipeline, spawn, ...opt, fetch: mirrorFetch, onTrace: tr.on })
            pm.catch(() => {}) //斷言失敗時不留未處理之rejection
            await called
            let locks = fs.readdirSync(path.join(root, 'bin-cache')).filter((n) => /^\.lock-[0-9a-f]{32}$/.test(n))
            let rec = JSON.parse(fs.readFileSync(path.join(root, 'bin-cache', locks[0], 'owner.json'), 'utf8'))
            try {
                assert.strict.equal(rec.limitMs, fsEnsureBinsBudget(mf([f]), opt), JSON.stringify(o)) //鎖之持有上限＝本函數之值
                assert.strict.equal(rec.limitMs, fsEnsureBinsBudgetCore(mf([f]), { fs, path, crypto, Readable, pipeline, spawn, ...opt }), JSON.stringify(o))
            }
            finally {
                respond()
            }
            await pm
        }
    })

    it(`should return '[10000,13000,660000]' when run the example`, function() {
        let manifest = {
            schema: 1,
            pkg: 'w-example',
            mode: 'pinned',
            repo: 'yuda-lyu/w-example',
            commit: '0123456789abcdef0123456789abcdef01234567',
            files: [
                { name: 'tool.exe', path: 'bin/tool.exe', sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913', size: 7 },
                { name: 'k6.exe', url: 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip', sha256: '0000000000000000000000000000000000000000000000000000000000000000', size: 100, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: '1111111111111111111111111111111111111111111111111111111111111111', size: 50 } },
            ],
        }
        let r = [
            fsEnsureBinsBudget(manifest, { pkgRoot: '.', mirror: '', offline: false, totalMs: 1000 }),
            fsEnsureBinsBudget(manifest, { pkgRoot: '.', mirror: './mirror', offline: false, totalMs: 1000 }),
            fsEnsureBinsBudget(manifest, { pkgRoot: '.', names: 'tool.exe', mirror: '', offline: false }),
        ]
        assert.strict.deepStrictEqual(r, [10000, 13000, 660000])
    })

})
