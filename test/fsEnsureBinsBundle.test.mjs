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
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec)§3 M6 檔案組(F10、F18)與§8 T3~T7之檔案組對應案; 規則帳本R-BIN-ENSURE-01規則12
//全部不連外網: 清單內之https網址一律經注入之fetch改指本機HTTP服務(port 8813), 鏡像為本地資料夾或本機HTTP服務
describe(`fsEnsureBins bundles (M6)`, function() {
    this.timeout(60000)

    let port = 8813
    let fdt = path.resolve('./test/_tmp/fsEnsureBinsBundle')
    let server = null
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let buf = (n, k) => {
        return Buffer.from(Array.from({ length: n }, (v, i) => (i * k + 1) % 256))
    }
    //repo檔之組(如w-ldap: exe與dll相鄰; 含子資料夾之檔)
    let exeA = buf(17408, 7)
    let dllB = buf(30000, 11)
    let datC = buf(5000, 13)
    let exeAbad = Buffer.from(exeA)
    exeAbad[50] = (exeAbad[50] + 1) % 256 //同長度、內容不同
    //廠商網址之組內檔
    let vdll = buf(9000, 17)
    let VURL = 'https://github.com/o/r/releases/download/v1/v.dll'
    //分割壓縮檔之組(如w-html2png之chrome整棵目錄), 壓縮檔另含未列入清單之成員
    let ch = {
        'portable/App/Chrome-bin/1.0/chrome.exe': buf(40000, 3),
        'portable/App/Chrome-bin/1.0/chrome.dll': buf(60000, 5),
        'portable/App/Chrome-bin/1.0/Locales/en-US.pak': buf(3000, 19),
        'portable/App/Chrome-bin/chrome.exe': buf(2000, 23),
    }
    let chZip = zipStore([...Object.entries(ch).map(([name, data]) => ({ name, data })), { name: 'portable/readme.url', data: Buffer.from('not listed') }])
    let n3 = Math.ceil(chZip.length / 3)
    let chParts = [chZip.subarray(0, n3), chZip.subarray(n3, n3 * 2), chZip.subarray(n3 * 2)]
    //單一壓縮檔(廠商網址)之組
    let pk = { 'pk/tool.exe': buf(7000, 29), 'pk/lib/a.dll': buf(4000, 31) }
    let pkZip = zipStore(Object.entries(pk).map(([name, data]) => ({ name, data })))
    let PURL = 'https://github.com/o/r/releases/download/v2/pack.zip'

    let RAW1 = `/raw.githubusercontent.com/yuda-lyu/w-b/${C1}/`

    let routes = {}
    let hits = []
    let fetchCalls = []
    let resetRoutes = () => {
        routes = {
            [`${RAW1}bin/conn/conn.exe`]: exeA,
            [`${RAW1}bin/conn/Newtonsoft.Json.dll`]: dllB,
            [`${RAW1}bin/conn/sub/data.bin`]: datC,
            [`${RAW1}bin/chrome/portable.zip.001`]: chParts[0],
            [`${RAW1}bin/chrome/portable.zip.002`]: chParts[1],
            [`${RAW1}bin/chrome/portable.zip.003`]: chParts[2],
            '/github.com/o/r/releases/download/v1/v.dll': vdll,
            '/github.com/o/r/releases/download/v2/pack.zip': pkZip,
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
        return { schema: 1, pkg: 'w-b', mode: 'pinned', repo: 'yuda-lyu/w-b', commit: C1, ...over }
    }
    let bConn = (over = {}) => {
        return {
            name: 'conn',
            dir: 'bin/conn',
            files: [
                { path: 'conn.exe', sha256: sha(exeA), size: exeA.length },
                { path: 'Newtonsoft.Json.dll', sha256: sha(dllB), size: dllB.length },
                { path: 'sub/data.bin', sha256: sha(datC), size: datC.length },
            ],
            ...over,
        }
    }
    let bChrome = (over = {}) => {
        return {
            name: 'chrome',
            archives: [{
                parts: chParts.map((b, i) => ({ path: `bin/chrome/portable.zip.00${i + 1}`, sha256: sha(b), size: b.length })),
                assembled: { type: 'zip', sha256: sha(chZip), size: chZip.length },
                extract: { type: 'zip', files: Object.entries(ch).map(([p, b]) => ({ path: p, sha256: sha(b), size: b.length })) },
            }],
            ...over,
        }
    }
    let bPack = (over = {}) => {
        return {
            name: 'pack',
            files: [{ path: 'v.dll', url: VURL, sha256: sha(vdll), size: vdll.length }],
            archives: [{
                url: PURL,
                sha256: sha(pkZip),
                size: pkZip.length,
                extract: { type: 'zip', files: Object.entries(pk).map(([p, b]) => ({ path: p, sha256: sha(b), size: b.length })) },
            }],
            ...over,
        }
    }
    //idOf, 組識別之獨立計算(規格M6: 組內(path, sha256)依path排序後之雜湊; 格式為逐行'<sha256>  <path>\n')
    let idOf = (files) => {
        let ls = files.map((f) => [f.path, `${f.sha256}  ${f.path}\n`])
        ls.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
        return sha(ls.map((v) => v[1]).join(''))
    }
    let idConn = idOf(bConn().files)
    let idChrome = idOf(bChrome().archives[0].extract.files)

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
    //sameTree, 組資料夾內之檔(只列檔)恰為期望之path→內容
    let sameTree = (dir, exp) => {
        let got = walk(dir).filter((v) => fs.lstatSync(path.join(dir, v)).isFile()).sort()
        assert.strict.deepStrictEqual(got, Object.keys(exp).sort())
        for (let [p, b] of Object.entries(exp)) {
            assert.strict.equal(fs.readFileSync(path.join(dir, ...p.split('/'))).equals(b), true, p)
        }
    }
    let connFiles = { 'conn.exe': exeA, 'Newtonsoft.Json.dll': dllB, 'sub/data.bin': datC }

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

    //---------------- M6 取得、位置與回傳(T3) ----------------

    it(`should put the files of a bundle side by side in <cache>/<bundle id>/ and return the folder, with the path of each file in the non-enumerable bundles (M6, D3, E1, T3)`, async function() {
        let root = fx('b-repo')
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        let dir = path.join(root, 'bin-cache', idConn)
        //E1: { [name]: 絕對路徑 }, 檔案組之值為組資料夾(組識別＝組內(path, sha256)依path排序後之雜湊)
        assert.strict.deepStrictEqual(Object.keys(r), ['conn'])
        assert.strict.equal(r.conn, dir)
        assert.strict.deepStrictEqual(JSON.parse(JSON.stringify(r)), { conn: dir })
        //M6: 組內各檔相鄰於組資料夾(含子資料夾), 內容符合清單
        sameTree(dir, connFiles)
        //回傳組目錄與各檔路徑
        assert.strict.deepStrictEqual(r.bundles.conn, {
            dir,
            id: idConn,
            files: {
                'conn.exe': path.join(dir, 'conn.exe'),
                'Newtonsoft.Json.dll': path.join(dir, 'Newtonsoft.Json.dll'),
                'sub/data.bin': path.join(dir, 'sub', 'data.bin'),
            },
        })
        assert.strict.equal(Object.getOwnPropertyDescriptor(r, 'bundles').enumerable, false)
        //深層凍結: 呼叫端不能改寫所回傳之組資訊
        assert.strict.deepStrictEqual([Object.isFrozen(r.bundles), Object.isFrozen(r.bundles.conn), Object.isFrozen(r.bundles.conn.files)], [true, true, true])
        assert.strict.throws(() => {
            r.bundles.conn.files['conn.exe'] = 'x' //模組為嚴格模式: 寫入凍結物件拋TypeError
        }, TypeError)
        //自有檔之網址: <repo>之<commit>下之<dir>/<path>
        assert.strict.deepStrictEqual(fetchCalls.sort(), [
            `https://raw.githubusercontent.com/yuda-lyu/w-b/${C1}/bin/conn/Newtonsoft.Json.dll`,
            `https://raw.githubusercontent.com/yuda-lyu/w-b/${C1}/bin/conn/conn.exe`,
            `https://raw.githubusercontent.com/yuda-lyu/w-b/${C1}/bin/conn/sub/data.bin`,
        ])
        assert.strict.deepStrictEqual(leftovers(root), [])
        //T3: 第二次快取命中(整組校驗), 不連網
        fetchCalls = []
        let r2 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fetch: failFetch })
        assert.strict.equal(r2.conn, dir)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should give the same bundle id whatever the order of the files, and a different id when any path or sha256 differs (M6)`, async function() {
        let root = fx('b-id')
        let b = bConn()
        b.files.reverse()
        let r = await ens(mf({ bundles: [b] }), { pkgRoot: root })
        assert.strict.equal(r.conn, path.join(root, 'bin-cache', idConn))
        assert.strict.equal(r.bundles.conn.id, idConn)
        //改一個path(同內容)或一個檔之sha256: 被測函數算出之組識別皆改變, 且等於獨立計算之值
        let bp = bConn()
        bp.files[0].path = 'conn2.exe'
        routes[`${RAW1}bin/conn/conn2.exe`] = exeA
        let rp = await ens(mf({ bundles: [bp] }), { pkgRoot: root })
        assert.strict.deepStrictEqual([rp.bundles.conn.id === idConn, rp.bundles.conn.id], [false, idOf(bp.files)])
        let bs = bConn()
        bs.files[2] = { path: 'sub/data.bin', sha256: sha(exeA.subarray(0, 5000)), size: 5000 }
        routes[`${RAW1}bin/conn/sub/data.bin`] = exeA.subarray(0, 5000)
        let rs = await ens(mf({ bundles: [bs] }), { pkgRoot: root })
        assert.strict.deepStrictEqual([rs.bundles.conn.id === idConn, rs.bundles.conn.id], [false, idOf(bs.files)])
        //直接檔與壓縮檔成員混合時, 依path排序(不依來源或清單之順序)
        let rk = await ens(mf({ bundles: [bPack()] }), { pkgRoot: root })
        assert.strict.equal(rk.bundles.pack.id, idOf([...bPack().files, ...bPack().archives[0].extract.files]))
    })

    it(`should get a bundle from the parts of an archive and extract only the listed members (M6 extract.files, D5, F10)`, async function() {
        let root = fx('b-parts')
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bChrome()] }), { pkgRoot: root, onTrace: tr.on })
        let dir = path.join(root, 'bin-cache', idChrome)
        assert.strict.equal(r.chrome, dir)
        //只有清單所列之成員(壓縮檔另有之portable/readme.url不在組內)
        sameTree(dir, ch)
        assert.strict.equal(r.bundles.chrome.files['portable/App/Chrome-bin/1.0/chrome.exe'], path.join(dir, 'portable', 'App', 'Chrome-bin', '1.0', 'chrome.exe'))
        //D3: 快取只存最終檔, 不存分割與組合後之壓縮檔
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(root, 'bin-cache')), [idChrome])
        assert.strict.deepStrictEqual(tr.types().filter((t) => t === 'extract' || t === 'publish'), ['extract', 'publish'])
        //分割檔之下載事件之file為各分割之檔名
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'download').map((v) => [v.name, v.file]), [1, 2, 3].map((i) => ['chrome', `portable.zip.00${i}`]))
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'downloaded').map((v) => [v.file, v.ok]), [1, 2, 3].map((i) => [`portable.zip.00${i}`, true]))
        assert.strict.deepStrictEqual(leftovers(root), [])
        fetchCalls = []
        let r2 = await ens(mf({ bundles: [bChrome()] }), { pkgRoot: root, fetch: failFetch })
        assert.strict.equal(r2.chrome, dir)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should get a bundle of a vendor file and the members of a vendor archive (M6 sources: url and archive members)`, async function() {
        let root = fx('b-vendor')
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bPack()] }), { pkgRoot: root, onTrace: tr.on })
        sameTree(r.pack, { 'v.dll': vdll, ...pk })
        //事件之file: 組內直接來源檔為組內路徑, 壓縮檔為其檔名
        assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'download').map((v) => v.file), ['v.dll', 'pack.zip'])
        assert.strict.deepStrictEqual(fetchCalls.sort(), [VURL, PURL])
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should extract many members in batches so that the command line stays short (D5)`, async function() {
        let root = fx('b-many')
        let many = {}
        for (let i = 0; i < 300; i++) {
            many[`deep/folder/with/a/long/name/member-number-${String(i).padStart(4, '0')}.dat`] = Buffer.from(`member ${i}`)
        }
        let zipM = zipStore(Object.entries(many).map(([name, data]) => ({ name, data })))
        routes[`${RAW1}bin/many.zip`] = zipM
        let b = { name: 'many', archives: [{ path: 'bin/many.zip', sha256: sha(zipM), size: zipM.length, extract: { type: 'zip', files: Object.entries(many).map(([p, d]) => ({ path: p, sha256: sha(d), size: d.length })) } }] }
        let tr = traceRec()
        let r = await ens(mf({ bundles: [b] }), { pkgRoot: root, onTrace: tr.on })
        sameTree(r.many, many)
        //300個成員約2萬字元: 分批執行(每批之成員參數至多6000字元), 每批各一次extract與extracted
        let nx = tr.types().filter((t) => t === 'extract').length
        assert.strict.equal(nx >= 3, true, String(nx))
        assert.strict.equal(tr.events.filter((e) => e.type === 'extracted' && e.result === 'exit' && e.code === 0).length, nx)
    })

    it(`should select a bundle by opt.names together with files (E1)`, async function() {
        let root = fx('b-names')
        routes[`${RAW1}bin/tool.exe`] = exeA
        let m = mf({ files: [{ name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(exeA), size: exeA.length }], bundles: [bConn(), bPack()] })
        let r = await ens(m, { pkgRoot: root, names: ['conn', 'tool.exe'] })
        assert.strict.deepStrictEqual(Object.keys(r), ['conn', 'tool.exe'])
        assert.strict.deepStrictEqual(Object.keys(r.bundles), ['conn'])
        assert.strict.equal(fetchCalls.some((u) => u.includes('pack') || u.includes('v.dll')), false)
    })

    //---------------- M6 整組原子發布 ----------------

    it(`should not let the bundle folder appear before every file is verified, and publish the whole bundle at once (M6 atomic)`, async function() {
        let root = fx('b-atomic')
        let dir = path.join(root, 'bin-cache', idConn)
        let seen = []
        let on = (e) => {
            //觀察回調於事件當下同步呼叫: 各檔下載完成時組資料夾尚不存在, 發布後才存在且完整
            if (e.type === 'downloaded' || e.type === 'publish') {
                seen.push([e.type, e.file || null, fs.existsSync(dir)])
            }
        }
        await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, onTrace: on })
        assert.strict.deepStrictEqual(seen.map((v) => v[0]), ['downloaded', 'downloaded', 'downloaded', 'publish'])
        assert.strict.deepStrictEqual(seen.filter((v) => v[0] === 'downloaded').map((v) => v[2]), [false, false, false])
        assert.strict.deepStrictEqual(seen[3], ['publish', null, true])
        sameTree(dir, connFiles)
    })

    it(`should leave no bundle folder and no work folder when a file of the bundle can not be got (M6 atomic, T4)`, async function() {
        let cases = [
            ['404', () => {
                delete routes[`${RAW1}bin/conn/sub/data.bin`]
            }, 'E_HTTP'],
            ['hash mismatch', () => {
                routes[`${RAW1}bin/conn/conn.exe`] = exeAbad
            }, 'E_HASH_MISMATCH'],
            ['size mismatch', () => {
                routes[`${RAW1}bin/conn/Newtonsoft.Json.dll`] = dllB.subarray(1)
            }, 'E_SIZE_MISMATCH'],
        ]
        for (let [label, mk, code] of cases) {
            resetRoutes()
            mk()
            let root = fx('b-fail')
            let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root }))
            assert.strict.equal(e && e.code, code, label)
            assert.strict.equal(e.bin, 'conn', label)
            assert.strict.equal(typeof e.file, 'string', label)
            assert.strict.equal(e.message.includes('bundle[conn] file['), true, e.message)
            assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', idConn)), false, label)
            assert.strict.deepStrictEqual(leftovers(root), [], label)
        }
    })

    it(`should reject E_HASH_MISMATCH (step extract) for a member that does not match, and E_EXTRACT for a member not in the archive, leaving no bundle (M6, E3)`, async function() {
        let root = fx('b-member')
        let b = bChrome()
        b.archives[0].extract.files[1].sha256 = sha(Buffer.from('other'))
        let e = await catchErr(ens(mf({ bundles: [b] }), { pkgRoot: root }))
        assert.strict.deepStrictEqual([e.code, e.step, e.bin, e.file], ['E_HASH_MISMATCH', 'extract', 'chrome', 'portable/App/Chrome-bin/1.0/chrome.dll'])
        assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', idOf(b.archives[0].extract.files))), false)
        let b2 = bChrome()
        b2.archives[0].extract.files.push({ path: 'portable/none.txt', sha256: sha(Buffer.from('x')), size: 1 })
        let root2 = fx('b-member2')
        let e2 = await catchErr(ens(mf({ bundles: [b2] }), { pkgRoot: root2 }))
        assert.strict.deepStrictEqual([e2.code, e2.step, e2.bin, e2.file], ['E_EXTRACT', 'extract', 'chrome', undefined]) //多成員之批無法定位單一檔
        //只有一個待解成員(不在壓縮檔內): 錯誤帶其組內路徑
        let b3 = bChrome()
        b3.archives[0].extract.files = [{ path: 'portable/none.txt', sha256: sha(Buffer.from('x')), size: 1 }]
        let e3 = await catchErr(ens(mf({ bundles: [b3] }), { pkgRoot: fx('b-member3') }))
        assert.strict.deepStrictEqual([e3.code, e3.step, e3.bin, e3.file], ['E_EXTRACT', 'extract', 'chrome', 'portable/none.txt'])
        assert.strict.equal(fs.existsSync(path.join(root2, 'bin-cache', idOf(b2.archives[0].extract.files))), false)
        assert.strict.deepStrictEqual(leftovers(root), [])
        assert.strict.deepStrictEqual(leftovers(root2), [])
    })

    //---------------- D4/T7 組內一檔竄改整組重取 ----------------

    it(`should get the whole bundle again when one file in the cached bundle was tampered with, missing or replaced by a folder (D4, T7, M6)`, async function() {
        let tampers = [
            ['same size, other content', (dir) => {
                fs.writeFileSync(path.join(dir, 'conn.exe'), exeAbad)
            }],
            ['truncated', (dir) => {
                fs.writeFileSync(path.join(dir, 'sub', 'data.bin'), datC.subarray(0, 10))
            }],
            ['deleted', (dir) => {
                fs.unlinkSync(path.join(dir, 'Newtonsoft.Json.dll'))
            }],
            ['a folder in place of a file', (dir) => {
                fs.unlinkSync(path.join(dir, 'conn.exe'))
                fs.mkdirSync(path.join(dir, 'conn.exe'))
            }],
        ]
        for (let [label, tamper] of tampers) {
            let root = fx('b-tamper')
            let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
            tamper(r1.conn)
            fetchCalls = []
            let tr = traceRec()
            let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, onTrace: tr.on })
            assert.strict.equal(r.conn, r1.conn, label)
            sameTree(r.conn, connFiles)
            //整組重取: 組內每檔皆重新取得(不只被竄改者)
            assert.strict.equal(fetchCalls.length, 3, label)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'cache' || e.type === 'publish').map((e) => [e.type, e.hit !== undefined ? e.hit : e.result]), [['cache', false], ['publish', 'replaced']], label)
            assert.strict.deepStrictEqual(leftovers(root), [], label)
        }
    })

    it(`should keep the tampered bundle untouched and not return it when getting the bundle again fails (M6, D4)`, async function() {
        let root = fx('b-tamper-fail')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        delete routes[`${RAW1}bin/conn/sub/data.bin`]
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root }))
        assert.strict.equal(e && e.code, 'E_HTTP')
        //舊組於發布時才被替換: 失敗時原樣保留(不回傳)
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'conn.exe')).equals(exeAbad), true)
        resetRoutes()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        sameTree(r.conn, connFiles)
    })

    it(`should replace a file that is in place of the bundle folder (M6, D4)`, async function() {
        let root = fx('b-notdir')
        fs.mkdirSync(path.join(root, 'bin-cache'), { recursive: true })
        fs.writeFileSync(path.join(root, 'bin-cache', idConn), 'a file')
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, onTrace: tr.on })
        sameTree(r.conn, connFiles)
        //Windows之更名可直接以資料夾取代檔案('placed'), 其他系統先移走該檔('replaced'); 皆為完整之組
        assert.strict.equal(['placed', 'replaced'].includes(tr.events.find((e) => e.type === 'publish').result), true)
    })

    it(`should use a valid bundle that another process published first, and discard its own (M6 atomic, concurrency)`, async function() {
        let root = fx('b-race')
        let dir = path.join(root, 'bin-cache', idConn)
        let n = 0
        let on = (e) => {
            //最後一檔下載完成時, 他方已放好完整之組(以複製模擬): 本次之更名失敗, 校驗他方之組通過即採用
            if (e.type === 'downloaded' && ++n === 3) {
                for (let [p, b] of Object.entries(connFiles)) {
                    fs.mkdirSync(path.dirname(path.join(dir, ...p.split('/'))), { recursive: true })
                    fs.writeFileSync(path.join(dir, ...p.split('/')), b)
                }
            }
        }
        let tr = traceRec()
        let both = (e) => {
            on(e)
            tr.on(e)
        }
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, onTrace: both })
        assert.strict.equal(r.conn, dir)
        sameTree(dir, connFiles)
        assert.strict.equal(tr.events.find((e) => e.type === 'publish').result, 'exists')
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should reject E_RENAME and keep the tampered bundle when it can not be moved away (in use) (M6, D4, E3)`, async function() {
        let root = fx('b-busy')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        //移走舊組之更名一律EBUSY(使用中): 至多重試後E_RENAME, 舊組原樣, 暫存夾清除
        let fsBusy = Object.create(fs)
        fsBusy.renameSync = (a, b) => {
            if (path.resolve(a) === r1.conn) {
                let err = new Error(`EBUSY: resource busy or locked, rename '${a}'`)
                err.code = 'EBUSY'
                throw err
            }
            return fs.renameSync(a, b)
        }
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: fsBusy }))
        assert.strict.deepStrictEqual([e && e.code, e.step, e.bin], ['E_RENAME', 'place', 'conn'])
        assert.strict.equal(e.message.includes('does not match the manifest and can not be replaced'), true, e.message)
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'conn.exe')).equals(exeAbad), true)
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    //fsHook, 以真實fs為底, 於所選之更名前後插入動作(模擬他方行程之交錯或更名失敗)
    let fsHook = (fn) => {
        let f = Object.create(fs)
        f.renameSync = (a, b) => {
            return fn(path.resolve(a), path.resolve(b), () => fs.renameSync(a, b))
        }
        return f
    }
    let isStage = (a) => a.endsWith(`${path.sep}b`) && a.includes(`${path.sep}.work-`)
    let isAside = (b) => /[\\/]old\d+$/.test(b) && b.includes(`${path.sep}.work-`)
    let putBundle = (dir, files) => {
        for (let [p, b] of Object.entries(files)) {
            fs.mkdirSync(path.dirname(path.join(dir, ...p.split('/'))), { recursive: true })
            fs.writeFileSync(path.join(dir, ...p.split('/')), b)
        }
    }

    it(`should put the tampered bundle back when publishing fails after moving it away (M6: the old bundle is kept on failure)`, async function() {
        let root = fx('b-restore')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        fs.writeFileSync(path.join(r1.conn, 'sentinel.txt'), 'keep')
        let nStage = 0
        let f = fsHook((a, b, real) => {
            //第2次以暫存組更名(舊組已移走之後)失敗(非占用之錯誤)
            if (isStage(a) && b === r1.conn && ++nStage === 2) {
                let err = new Error(`EIO: i/o error, rename '${a}'`)
                err.code = 'EIO'
                throw err
            }
            return real()
        })
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f }))
        assert.strict.deepStrictEqual([e && e.code, e.step], ['E_RENAME', 'place'])
        //舊組移回原位(含其中之其他檔)
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'conn.exe')).equals(exeAbad), true)
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'sentinel.txt'), 'utf8'), 'keep')
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should adopt a valid bundle that another process published between the check and moving the old one away, without deleting it (M6, concurrency)`, async function() {
        let root = fx('b-race2')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        let swapped = false
        let f = fsHook((a, b, real) => {
            //本次判定不符之後、移走之前: 他方移走壞組並放好完整之組(內含他方之標記檔)
            if (a === r1.conn && isAside(b) && !swapped) {
                swapped = true
                fs.renameSync(r1.conn, path.join(root, 'other-took-it'))
                putBundle(r1.conn, { ...connFiles, 'other.txt': Buffer.from('other') })
            }
            return real()
        })
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f, onTrace: tr.on })
        assert.strict.equal(swapped, true)
        assert.strict.equal(tr.events.find((v) => v.type === 'publish').result, 'exists')
        //他方之組原樣在組位置(未被本次移走後刪除)
        assert.strict.equal(fs.readFileSync(path.join(r.conn, 'other.txt'), 'utf8'), 'other')
        sameTree(r.conn, { ...connFiles, 'other.txt': Buffer.from('other') })
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should retry publishing when another process removed the old bundle just before this one moves it (M6, concurrency)`, async function() {
        let root = fx('b-gap')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        let gone = false
        let f = fsHook((a, b, real) => {
            //本次移走前, 他方已移走壞組(尚未放入新組): 本次移走得ENOENT, 續以暫存組更名
            if (a === r1.conn && isAside(b) && !gone) {
                gone = true
                fs.renameSync(r1.conn, path.join(root, 'other-took-it'))
            }
            return real()
        })
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f, onTrace: tr.on })
        assert.strict.equal(gone, true)
        assert.strict.equal(tr.events.find((v) => v.type === 'publish').result, 'placed')
        sameTree(r.conn, connFiles)
    })

    it(`should retry publishing when the bundle folder disappears after a rename conflict (M6, concurrency)`, async function() {
        let root = fx('b-conflict-gap')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        let n = 0
        let f = fsHook((a, b, real) => {
            //第1次以暫存組更名: 目標存在而衝突(EEXIST), 隨即他方移走目標
            if (isStage(a) && b === r1.conn && ++n === 1) {
                fs.renameSync(r1.conn, path.join(root, 'other-took-it'))
                let err = new Error(`EEXIST: file already exists, rename '${a}'`)
                err.code = 'EEXIST'
                throw err
            }
            return real()
        })
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f, onTrace: tr.on })
        assert.strict.equal(tr.events.find((v) => v.type === 'publish').result, 'placed')
        sameTree(r.conn, connFiles)
    })

    it(`should put the old bundle back when reading the bundle folder fails while publishing after moving the old one away (M6: the old bundle is kept on failure; run10 mutation R01)`, async function() {
        //規格M6/D4: 發布失敗時舊組保留; publishBundle之check於讀取錯誤時先移回舊組再拋出(run10變異R01存活之測試缺口)
        let root = fx('b-restore-read')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        fs.writeFileSync(path.join(r1.conn, 'sentinel.txt'), 'keep')
        let nStage = 0
        let armed = false
        let thrown = false
        let f = fsHook((a, b, real) => {
            //第2次以暫存組更名(舊組已移走之後)失敗, 並使其後對組位置之下一次讀取(發布期間之校驗)失敗一次
            if (isStage(a) && b === r1.conn && ++nStage === 2) {
                armed = true
                let err = new Error(`EIO: i/o error, rename '${a}'`)
                err.code = 'EIO'
                throw err
            }
            return real()
        })
        f.lstatSync = (p, o) => {
            if (armed && !thrown && path.resolve(String(p)) === r1.conn) {
                thrown = true
                let err = new Error(`EACCES: permission denied, lstat '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.lstatSync(p, o)
        }
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f }))
        assert.strict.deepStrictEqual([thrown, e && e.code, e && e.step], [true, 'E_FS', 'cache'])
        //舊組移回原位(含其中之其他檔), 未隨暫存夾刪除
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'conn.exe')).equals(exeAbad), true)
        assert.strict.equal(fs.readFileSync(path.join(r1.conn, 'sentinel.txt'), 'utf8'), 'keep')
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should go on publishing when verifying the moved-away bundle fails to read (M6)`, async function() {
        let root = fx('b-check-throws')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'conn.exe'), exeAbad)
        let f = Object.create(fs)
        f.lstatSync = (p, o) => {
            //移走後之再校驗讀不到所移走者
            let q = path.resolve(String(p))
            if (q.includes(`${path.sep}.work-`) && /[\\/]old\d+([\\/]|$)/.test(q)) {
                let err = new Error(`EACCES: permission denied, lstat '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.lstatSync(p, o)
        }
        let tr = traceRec()
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f, onTrace: tr.on })
        assert.strict.equal(tr.events.find((v) => v.type === 'publish').result, 'replaced')
        sameTree(r.conn, connFiles)
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should not report temporary files that were removed with the work folder, and name every leftover (E3, leftovers)`, async function() {
        //下載不符時下載核心刪不掉.part(回報於其錯誤), 其後整個暫存夾刪除成功: 不再列該.part
        let root = fx('b-stale')
        routes[`${RAW1}bin/conn/conn.exe`] = exeAbad
        let f = Object.create(fs)
        f.unlinkSync = (p) => {
            if (String(p).endsWith('.part') && String(p).includes(`${path.sep}.work-`)) {
                let err = new Error(`EACCES: permission denied, unlink '${p}'`)
                err.code = 'EACCES'
                throw err
            }
            return fs.unlinkSync(p)
        }
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f }))
        assert.strict.equal(e && e.code, 'E_HASH_MISMATCH')
        assert.strict.equal((e.leftovers || []).some((v) => String(v.fp).endsWith('.part')), false, JSON.stringify(e.leftovers))
        assert.strict.deepStrictEqual(leftovers(root), [])
        //暫存夾也刪不掉: 列出暫存夾(及其內仍在之.part), 各項皆有name
        let root2 = fx('b-stale2')
        f.rmSync = (p, o) => {
            if (String(p).includes(`${path.sep}.work-`)) {
                let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                err.code = 'EBUSY'
                throw err
            }
            return fs.rmSync(p, o)
        }
        let e2 = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root2, fs: f }))
        assert.strict.equal(e2 && e2.code, 'E_HASH_MISMATCH')
        assert.strict.equal(e2.leftovers.length >= 1 && e2.leftovers.every((v) => v.name === 'conn' && typeof v.fp === 'string'), true, JSON.stringify(e2.leftovers))
        for (let v of e2.leftovers) {
            fs.rmSync(v.fp, { recursive: true, force: true })
        }
    })

    it(`should not list in the result a leftover that was removed before returning (E3, leftovers)`, async function() {
        let root = fx('b-left-gone')
        let f = Object.create(fs)
        f.rmSync = (p, o) => {
            if (String(p).includes(`${path.sep}.work-`)) {
                let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                err.code = 'EBUSY'
                throw err
            }
            return fs.rmSync(p, o)
        }
        //暫存夾刪不掉(通知cleanup)之後, 他方隨即將之刪除: 回傳時已不存在, 不列
        let onProgress = (v) => {
            if (v.step === 'cleanup' && v.fp) {
                fs.rmSync(v.fp, { recursive: true, force: true })
            }
        }
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fs: f, onProgress })
        sameTree(r.conn, connFiles)
        assert.strict.deepStrictEqual(r.leftovers, [])
    })

    it(`should give each concurrent caller its own leftovers when they share a failing get (E3, leftovers, concurrency)`, async function() {
        let root = fx('b-share-left')
        let b1 = { name: 'one', dir: 'bin/conn', files: [{ path: 'conn.exe', sha256: sha(exeA), size: exeA.length }] }
        let b2 = { name: 'two', dir: 'bin/conn', files: [{ path: 'Newtonsoft.Json.dll', sha256: sha(dllB), size: dllB.length }] }
        let bs = { name: 'shared', dir: 'bin/none', files: [{ path: 'x.exe', sha256: sha(datC), size: datC.length }] } //404
        let f = Object.create(fs)
        f.rmSync = (p, o) => {
            if (String(p).includes(`${path.sep}.work-`)) {
                let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                err.code = 'EBUSY'
                throw err
            }
            return fs.rmSync(p, o)
        }
        let m = mf({ bundles: [b1, b2, bs] })
        let [eA, eB] = await Promise.all([catchErr(ens(m, { pkgRoot: root, fs: f, names: ['one', 'shared'] })), catchErr(ens(m, { pkgRoot: root, fs: f, names: ['two', 'shared'] }))])
        assert.strict.deepStrictEqual([eA && eA.code, eB && eB.code, eA.bin, eB.bin], ['E_HTTP', 'E_HTTP', 'shared', 'shared'])
        let names = (e) => [...new Set(e.leftovers.map((v) => v.name))].sort()
        assert.strict.deepStrictEqual(names(eA), ['one', 'shared'])
        assert.strict.deepStrictEqual(names(eB), ['shared', 'two'])
        for (let v of [...eA.leftovers, ...eB.leftovers]) {
            fs.rmSync(v.fp, { recursive: true, force: true })
        }
    })

    it(`should attach the leftovers of an earlier bundle to the error of a later one (E3, leftovers)`, async function() {
        let root = fx('b-left')
        let b2 = { name: 'two', dir: 'bin/two', files: [{ path: 'two.exe', sha256: sha(dllB), size: dllB.length }] } //repo無此檔: 404
        let f = Object.create(fs)
        let nRm = 0
        f.rmSync = (p, o) => {
            //第一組之暫存夾刪不掉
            if (String(p).includes(`${path.sep}.work-`) && ++nRm === 1) {
                let err = new Error(`EBUSY: resource busy or locked, rmdir '${p}'`)
                err.code = 'EBUSY'
                throw err
            }
            return fs.rmSync(p, o)
        }
        let e = await catchErr(ens(mf({ bundles: [bConn(), b2] }), { pkgRoot: root, fs: f }))
        assert.strict.deepStrictEqual([e && e.code, e.bin], ['E_HTTP', 'two'])
        assert.strict.equal(Array.isArray(e.leftovers) && e.leftovers.some((v) => v.name === 'conn' && v.fp.includes('.work-')), true, JSON.stringify(e.leftovers))
        for (let v of e.leftovers) {
            fs.rmSync(v.fp, { recursive: true, force: true })
        }
    })

    it(`should replace a link in place of the bundle folder without touching the folder it points to (M6, D4, D6)`, async function() {
        let root = fx('b-junction')
        let outside = fx('b-junction-outside')
        for (let [p, b] of Object.entries(connFiles)) {
            fs.mkdirSync(path.dirname(path.join(outside, ...p.split('/'))), { recursive: true })
            fs.writeFileSync(path.join(outside, ...p.split('/')), b)
        }
        fs.writeFileSync(path.join(outside, 'sentinel.txt'), 'keep')
        fs.mkdirSync(path.join(root, 'bin-cache'), { recursive: true })
        let dir = path.join(root, 'bin-cache', idConn)
        fs.symlinkSync(outside, dir, 'junction') //Windows之連接點不需特權; 他平台為目錄之符號連結
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        //連結不是組資料夾: 重取並發布為真資料夾; 連結所指之資料夾(含其中之檔)不被刪改
        assert.strict.equal(fs.lstatSync(r.conn).isDirectory() && !fs.lstatSync(r.conn).isSymbolicLink(), true)
        sameTree(r.conn, connFiles)
        assert.strict.equal(fs.readFileSync(path.join(outside, 'sentinel.txt'), 'utf8'), 'keep')
        assert.strict.equal(fs.readFileSync(path.join(outside, 'conn.exe')).equals(exeA), true)
        assert.strict.equal(fetchCalls.length, 3)
        assert.strict.deepStrictEqual(leftovers(root), [])
    })

    it(`should verify only the listed files of a cached bundle and use it with an extra file in the folder (M6, D4, D6)`, async function() {
        let root = fx('b-extra')
        let r1 = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root })
        fs.writeFileSync(path.join(r1.conn, 'extra.log'), 'written by the program')
        fetchCalls = []
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, fetch: failFetch })
        assert.strict.equal(r.conn, r1.conn)
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    it(`should keep the work folder and report it when the extraction program does not exit after termination, for a bundle (D5, M6)`, async function() {
        this.timeout(30000)
        let root = fx('b-noexit')
        let fake = () => {
            let cp = new EventEmitter()
            cp.stderr = new EventEmitter()
            cp.kill = () => {} //終止後仍不結束
            return cp
        }
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let pmErr = catchErr(ens(mf({ bundles: [bChrome()] }), { pkgRoot: root, spawn: fake, totalMs: 500, onTrace: tr.on }))
            await tr.wait((e) => e.type === 'extract')
            await clock.advance(500)
            await tr.wait((e) => e.type === 'kill')
            await clock.advance(5000)
            let x = await tr.wait((e) => e.type === 'extracted')
            assert.strict.deepStrictEqual([x.result, x.exited], ['timeout', false])
            let e = await pmErr
            assert.strict.deepStrictEqual([e.code, e.bin], ['E_EXTRACT', 'chrome'])
            assert.strict.equal(Array.isArray(e.leftovers) && e.leftovers.length, 1)
            assert.strict.equal(fs.existsSync(e.leftovers[0].fp), true) //未確認結束前不刪
            assert.strict.deepStrictEqual(tr.events.filter((v) => v.type === 'cleanup').map((v) => v.ok), [false])
            assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache', idChrome)), false)
            fs.rmSync(e.leftovers[0].fp, { recursive: true, force: true })
        }
        finally {
            clock.restore()
        }
    })

    it(`should share one getting of the same bundle between concurrent calls in a process (M6, concurrency)`, async function() {
        let root = fx('b-share')
        let [r1, r2] = await Promise.all([ens(mf({ bundles: [bConn()] }), { pkgRoot: root }), ens(mf({ bundles: [bConn()] }), { pkgRoot: root })])
        assert.strict.equal(r1.conn, r2.conn)
        assert.strict.equal(fetchCalls.length, 3)
        sameTree(r1.conn, connFiles)
    })

    //---------------- O1/O2/T5 鏡像(<鏡像>/<套件>/<組識別>/<path>) ----------------

    let mkMirror = (fd, files, id) => {
        for (let [p, b] of Object.entries(files)) {
            let fp = path.join(fd, 'w-b', id, ...p.split('/'))
            fs.mkdirSync(path.dirname(fp), { recursive: true })
            fs.writeFileSync(fp, b)
        }
    }

    it(`should get a bundle from the bundle folder of a local mirror without network, also offline (O1, O2, T5, M6)`, async function() {
        let mirror = fx('b-mirror')
        mkMirror(mirror, connFiles, idConn)
        for (let offline of [false, true]) {
            let root = fx('b-mirror-root')
            let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, mirror, offline, fetch: failFetch })
            sameTree(r.conn, connFiles)
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(leftovers(root), [])
        }
    })

    it(`should get a bundle from the bundle folder of an http mirror (O1, M6)`, async function() {
        let root = fx('b-mirror-http')
        for (let [p, b] of Object.entries(connFiles)) {
            routes[`/mirror/w-b/${idConn}/${p}`] = b
        }
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, mirror: `http://127.0.0.1:${port}/mirror`, offline: true })
        sameTree(r.conn, connFiles)
        assert.strict.deepStrictEqual(hits.filter((u) => u.startsWith('/raw.')), [])
    })

    it(`should reject a tampered copy in the mirror and get that file from GitHub when online (T5, O2, M6)`, async function() {
        let mirror = fx('b-mirror-bad')
        mkMirror(mirror, { ...connFiles, 'conn.exe': exeAbad }, idConn)
        let root = fx('b-mirror-bad-root')
        let ev = []
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: root, mirror, onProgress: (v) => ev.push(v) })
        sameTree(r.conn, connFiles)
        assert.strict.deepStrictEqual(fetchCalls, [`https://raw.githubusercontent.com/yuda-lyu/w-b/${C1}/bin/conn/conn.exe`])
        assert.strict.equal(ev.some((v) => v.step === 'mirror' && v.file === 'conn.exe' && v.result === 'rejected'), true)
    })

    it(`should get only the files missing in the bundle folder of the mirror from GitHub when online (O2, M6)`, async function() {
        let mirror = fx('b-mirror-part')
        let part = { ...connFiles }
        delete part['Newtonsoft.Json.dll']
        mkMirror(mirror, part, idConn)
        let r = await ens(mf({ bundles: [bConn()] }), { pkgRoot: fx('b-mirror-part-root'), mirror })
        sameTree(r.conn, connFiles)
        assert.strict.deepStrictEqual(fetchCalls, [`https://raw.githubusercontent.com/yuda-lyu/w-b/${C1}/bin/conn/Newtonsoft.Json.dll`])
    })

    it(`should get the files and the archive parts of a bundle from the mirror in the <sha256>/<name> form offline (O1, O4, M6)`, async function() {
        let mirror = fx('b-mirror-o1')
        let put = (b, name) => {
            fs.mkdirSync(path.join(mirror, 'w-b', sha(b)), { recursive: true })
            fs.writeFileSync(path.join(mirror, 'w-b', sha(b), name), b)
        }
        chParts.forEach((b, i) => put(b, `portable.zip.00${i + 1}`))
        put(vdll, 'v.dll')
        put(pkZip, 'pack.zip')
        let root = fx('b-mirror-o1-root')
        let r = await ens(mf({ bundles: [bChrome(), bPack()] }), { pkgRoot: root, mirror, offline: true, fetch: failFetch })
        sameTree(r.chrome, ch)
        sameTree(r.pack, { 'v.dll': vdll, ...pk })
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    //---------------- O3/T6 離線缺組內之檔: 列出全組 ----------------

    it(`should reject E_OFFLINE_MISSING listing the whole bundle with where to put it, and create no folder, offline without a mirror (O3, T6, M6)`, async function() {
        let root = fx('b-offline')
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, offline: true, fetch: failFetch }))
        assert.strict.deepStrictEqual([e.code, e.step], ['E_OFFLINE_MISSING', 'offline'])
        let m = e.missing[0]
        let dir = path.join(root, 'bin-cache', idConn)
        assert.strict.deepStrictEqual([m.name, m.cachePath, m.mirrorPath, m.bundle.id], ['conn', dir, null, idConn])
        assert.strict.equal(m.size, exeA.length + dllB.length + datC.length)
        assert.strict.deepStrictEqual(m.bundle.files.map((f) => [f.path, f.sha256, f.size, f.missing, f.cachePath]), bConn().files.map((f) => [f.path, f.sha256, f.size, true, path.join(dir, ...f.path.split('/'))]))
        //訊息: 全組每檔之組內路徑、sha256、大小與應放之組資料夾
        assert.strict.equal(e.message.includes(`put the whole bundle in: ${dir} (cache)`), true, e.message)
        assert.strict.equal(e.message.includes(`<W_BIN_MIRROR>/w-b/${idConn}`), true, e.message)
        for (let f of bConn().files) {
            assert.strict.equal(e.message.includes(`${f.path}: sha256 ${f.sha256}, ${f.size} bytes, missing`), true, e.message)
        }
        assert.strict.deepStrictEqual(fetchCalls, [])
        assert.strict.deepStrictEqual(fs.readdirSync(root), [])
    })

    it(`should list the whole bundle (marking only the missing file) when the mirror lacks one file offline, and leave no empty folder (O3, T6, M6)`, async function() {
        let mirror = fx('b-offline-m')
        let part = { ...connFiles }
        delete part['sub/data.bin']
        mkMirror(mirror, part, idConn)
        let root = fx('b-offline-m-root')
        let e = await catchErr(ens(mf({ bundles: [bConn()] }), { pkgRoot: root, mirror, offline: true, fetch: failFetch }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        let m = e.missing[0]
        assert.strict.equal(m.mirrorPath, path.join(mirror, 'w-b', idConn))
        assert.strict.deepStrictEqual(m.bundle.files.map((f) => [f.path, f.missing]), [['conn.exe', false], ['Newtonsoft.Json.dll', false], ['sub/data.bin', true]])
        assert.strict.deepStrictEqual(m.bundle.files.map((f) => f.mirrorPath), bConn().files.map((f) => path.join(mirror, 'w-b', idConn, ...f.path.split('/'))))
        assert.strict.equal(e.message.includes(`sub/data.bin: sha256 ${sha(datC)}, ${datC.length} bytes, missing`), true, e.message)
        assert.strict.equal(e.message.includes(`conn.exe: sha256 ${sha(exeA)}, ${exeA.length} bytes\n`) || e.message.includes(`conn.exe: sha256 ${sha(exeA)}, ${exeA.length} bytes`), true, e.message)
        //不建組資料夾, 不留本次新建之空資料夾
        assert.strict.deepStrictEqual(fs.readdirSync(root), [])
    })

    it(`should list the archive parts that may be put in the mirror for a bundle from an archive offline (O3, T6, M6)`, async function() {
        let root = fx('b-offline-parts')
        let e = await catchErr(ens(mf({ bundles: [bChrome()] }), { pkgRoot: root, offline: true }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.equal(e.missing[0].bundle.archives[0].parts.length, 3)
        assert.strict.equal(e.message.includes('4 of them are extracted from an archive split into 3 parts'), true, e.message)
        assert.strict.equal(e.message.includes(`<W_BIN_MIRROR>/w-b/${sha(chParts[0])}/portable.zip.001`), true, e.message)
    })

    //---------------- M1/M6 清單之錯誤(E_MANIFEST, 不發請求、不建夾) ----------------

    let bads = [
        ['bundles not an array', (m) => {
            m.bundles = { name: 'conn' }
        }, 'bundles'],
        ['no files and no bundles', (m) => {
            m.bundles = []
        }, 'files'],
        ['unknown bundle field', (m) => {
            m.bundles[0].member = 'x'
        }, 'bundles[0].member'],
        ['bundle name with a slash', (m) => {
            m.bundles[0].name = 'a/conn'
        }, 'bundles[0].name'],
        ['bundle name duplicates a file name', (m) => {
            m.files = [{ name: 'CONN', path: 'bin/x.exe', sha256: sha(exeA), size: 1 }]
        }, 'bundles[0].name'],
        ['bundle name reserved', (m) => {
            m.bundles[0].name = 'Manifest'
        }, 'bundles[0].name'],
        ['empty bundle', (m) => {
            m.bundles[0].files = []
        }, 'bundles[0]'],
        ['repo file without dir', (m) => {
            delete m.bundles[0].dir
        }, 'bundles[0].files[0]'],
        ['dir with ..', (m) => {
            m.bundles[0].dir = 'bin/../x'
        }, 'bundles[0].dir'],
        ['path duplicate ignoring case', (m) => {
            m.bundles[0].files[1].path = 'CONN.exe'
        }, 'bundles[0].files[1].path'],
        ['path is a folder of another path', (m) => {
            m.bundles[0].files[1].path = 'sub'
        }, 'bundles[0]'],
        ['path with ..', (m) => {
            m.bundles[0].files[0].path = '../conn.exe'
        }, 'bundles[0].files[0].path'],
        ['path with backslash', (m) => {
            m.bundles[0].files[0].path = 'sub\\conn.exe'
        }, 'bundles[0].files[0].path'],
        ['file url on a branch', (m) => {
            m.bundles[0].files[0].url = 'https://raw.githubusercontent.com/o/r/master/conn.exe'
        }, 'bundles[0].files[0].url'],
        ['file unknown field', (m) => {
            m.bundles[0].files[0].name = 'conn.exe'
        }, 'bundles[0].files[0].name'],
        ['file sha256 invalid', (m) => {
            m.bundles[0].files[0].sha256 = 'x'
        }, 'bundles[0].files[0].sha256'],
        ['archive without extract', (m) => {
            m.bundles[1] = bChrome()
            delete m.bundles[1].archives[0].extract
        }, 'bundles[1].archives[0].extract'],
        ['archive extract.member instead of files', (m) => {
            m.bundles[1] = bChrome()
            m.bundles[1].archives[0].extract = { type: 'zip', member: 'a.exe', sha256: sha(exeA), size: 1 }
        }, 'bundles[1].archives[0].extract.member'],
        ['archive extract.files empty', (m) => {
            m.bundles[1] = bChrome()
            m.bundles[1].archives[0].extract.files = []
        }, 'bundles[1].archives[0].extract.files'],
        ['archive member path duplicates a file path', (m) => {
            m.bundles[1] = bChrome()
            m.bundles[1].files = [{ path: 'portable/App/Chrome-bin/1.0/CHROME.exe', url: VURL, sha256: sha(vdll), size: vdll.length }]
        }, 'bundles[1].archives[0].extract.files[0].path'],
        ['archive url releases/latest', (m) => {
            m.bundles[1] = bPack()
            m.bundles[1].archives[0].url = 'https://github.com/o/r/releases/latest/download/pack.zip'
        }, 'bundles[1].archives[0].url'],
        ['archive parts with a top-level sha256', (m) => {
            m.bundles[1] = bChrome()
            m.bundles[1].archives[0].sha256 = sha(exeA)
        }, 'bundles[1].archives[0]'],
        ['archive extract type', (m) => {
            m.bundles[1] = bChrome()
            m.bundles[1].archives[0].extract.type = '7z'
        }, 'bundles[1].archives[0].extract.type'],
        ['commit missing with a repo file in pinned mode', (m) => {
            delete m.commit
        }, 'commit'],
    ]
    for (let [label, fn, field] of bads) {
        it(`should reject E_MANIFEST before any download or folder creation: ${label} (M1, M6)`, async function() {
            let m = mf({ bundles: [bConn()] })
            fn(m)
            let root = fx('b-bad')
            let e = await catchErr(ens(m, { pkgRoot: root, fetch: failFetch }))
            assert.strict.deepStrictEqual([e && e.code, e && e.step], ['E_MANIFEST', 'manifest'], String(e && e.message))
            assert.strict.equal(e.field, field, e.message)
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(fs.readdirSync(root), [])
        })
    }

    it(`should accept a manifest with bundles only (no files), and a floating manifest whose bundle files come from master (M1, M5, M6)`, async function() {
        let root = fx('b-floating')
        routes[`/raw.githubusercontent.com/yuda-lyu/w-b/master/bin/conn/conn.exe`] = exeA
        routes[`/raw.githubusercontent.com/yuda-lyu/w-b/master/bin/conn/Newtonsoft.Json.dll`] = dllB
        routes[`/raw.githubusercontent.com/yuda-lyu/w-b/master/bin/conn/sub/data.bin`] = datC
        let base = { schema: 1, pkg: 'w-b', mode: 'floating', repo: 'yuda-lyu/w-b', bundles: [bConn()] }
        routes['/raw.githubusercontent.com/yuda-lyu/w-b/master/bin/manifest.json'] = Buffer.from(JSON.stringify(base))
        let r = await ens(base, { pkgRoot: root })
        sameTree(r.conn, connFiles)
        assert.strict.equal(fetchCalls.filter((u) => u.includes('/master/bin/conn/')).length, 3)
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})
