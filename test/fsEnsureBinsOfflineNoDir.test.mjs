import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import zipStore from './tools/zipStore.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec)§O3離線; 規則帳本R-BIN-ENSURE-01
//離線缺檔(E_OFFLINE_MISSING)而reject時, 不得留下本次新建之資料夾(快取根及其上層、<sha256>夾、.work-*暫存夾); 原本已存在之夾不動;
//離線且全部命中快取、非離線之行為不變(bin-ffmpeg回饋: 離線缺檔仍會在套件根建立空的bin-cache/)
//全部不連外網且不開本機服務: 鏡像為本地資料夾, 或以注入之fetch回應http鏡像(網址為.invalid, 不會真的連線)
describe(`fsEnsureBins offline missing leaves no new folder`, function() {
    this.timeout(60000)

    let fdt = path.resolve('./test/_tmp/fsEnsureBinsOfflineNoDir')
    let unhandled = []
    let onUnhandled = (e) => {
        unhandled.push(String(e))
    }

    let sha = (b) => {
        return crypto.createHash('sha256').update(b).digest('hex')
    }
    let C1 = '0123456789abcdef0123456789abcdef01234567'
    let tool = Buffer.from(Array.from({ length: 20000 }, (v, i) => (i * 7) % 256))
    let toolBad = Buffer.from(tool)
    toolBad[100] = (toolBad[100] + 1) % 256 //同長度、內容不同
    let tool2 = Buffer.from(Array.from({ length: 15000 }, (v, i) => (i * 13) % 256))
    let tool2Bad = Buffer.from(tool2)
    tool2Bad[10] = (tool2Bad[10] + 1) % 256
    let exe = Buffer.from(Array.from({ length: 30000 }, (v, i) => (i * 3) % 256))
    let zip = zipStore([{ name: 'k6-v1/k6.exe', data: exe }, { name: 'k6-v1/LICENSE', data: Buffer.from('license') }])
    let ffexe = Buffer.from(Array.from({ length: 40000 }, (v, i) => (i * 11) % 256))
    let ffzip = zipStore([{ name: 'ff/ffmpeg.exe', data: ffexe }])
    let n3 = Math.ceil(ffzip.length / 3)
    let ffparts = [ffzip.subarray(0, n3), ffzip.subarray(n3, n3 * 2), ffzip.subarray(n3 * 2)]
    let VURL = 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip'
    let MIRROR_URL = 'http://mirror.invalid/mirror'

    let mf = (files, over = {}) => {
        return { schema: 1, pkg: 'w-t', mode: 'pinned', repo: 'yuda-lyu/w-t', commit: C1, files, ...over }
    }
    let fTool = (over = {}) => {
        return { name: 'tool.exe', path: 'bin/tool.exe', sha256: sha(tool), size: tool.length, ...over }
    }
    let fTool2 = (over = {}) => {
        return { name: 'tool2.exe', path: 'bin/tool2.exe', sha256: sha(tool2), size: tool2.length, ...over }
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

    //fx, 每案專用之套件根目錄(已建立)
    let nfx = 0
    let fx = (name) => {
        nfx++
        let fd = path.join(fdt, `${nfx}-${name}`)
        fs.mkdirSync(fd, { recursive: true })
        return fd
    }

    let fetchCalls = []
    let failFetch = (u) => {
        fetchCalls.push(String(u))
        throw new Error(`network must not be used: ${u}`)
    }

    //ens, 呼叫Core並注入Node模組, 環境變數預設空; 預設離線且不得連網
    let ens = (manifest, opt = {}) => {
        return fsEnsureBinsCore(manifest, { fs, path, crypto, Readable, pipeline, spawn, env: {}, fetch: failFetch, retryDelayMs: 10, offline: true, ...opt })
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

    //recFs, 記錄mkdirSync與rmdirSync之呼叫
    let recFs = () => {
        let rec = { mkdirs: [], rmdirs: [] }
        rec.fs = {
            ...fs,
            mkdirSync: (p, o) => {
                rec.mkdirs.push(String(p))
                return fs.mkdirSync(p, o)
            },
            rmdirSync: (p, o) => {
                rec.rmdirs.push(String(p))
                return fs.rmdirSync(p, o)
            },
        }
        return rec
    }

    //walk, 列出資料夾內所有項目(相對路徑, 以/分隔), 不跟隨連結
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
        return r.sort()
    }

    let putFile = (fp, buf) => {
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, buf)
        return fp
    }
    let putMirror = (mirror, buf, name, shaOf = buf) => {
        return putFile(path.join(mirror, 'w-t', sha(shaOf), name), buf)
    }

    before(function() {
        process.on('unhandledRejection', onUnhandled)
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
    })

    after(function() {
        fsDeleteFolder(fdt)
        process.removeListener('unhandledRejection', onUnhandled)
    })

    beforeEach(function() {
        fetchCalls = []
    })

    //---------------- 三種快取根 × 三種檔案, 離線且無鏡像: 離線判定先於建夾, 不建任何資料夾 ----------------

    let kinds = {
        direct: () => [fTool()],
        archive: () => [fK6()],
        parts: () => [fFf()],
    }
    let roots = {
        'default <pkgRoot>/bin-cache': (root) => {
            return { pkgRoot: root }
        },
        'opt.cacheDir': (root) => {
            return { pkgRoot: root, cacheDir: path.join(root, 'deep', 'er', 'cache') }
        },
        'env W_BIN_CACHE': (root) => {
            return { pkgRoot: root, env: { W_BIN_CACHE: path.join(root, 'envcache') } }
        },
    }
    for (let [kn, files] of Object.entries(kinds)) {
        for (let [rn, optOf] of Object.entries(roots)) {
            it(`should not create any folder when the ${kn} file is missing offline without a mirror (cache root: ${rn}) (O3)`, async function() {
                let root = fx(`a-${kn}`)
                let rec = recFs()
                let e = await catchErr(ens(mf(files()), { ...optOf(root), fs: rec.fs }))
                assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
                assert.strict.deepStrictEqual(walk(root), []) //套件根下沒有任何新資料夾(快取根及其上層皆未建)
                assert.strict.deepStrictEqual(rec.mkdirs, []) //離線判定先於建夾: 連mkdirSync都不呼叫
                assert.strict.deepStrictEqual(fetchCalls, [])
            })
        }
    }

    it(`should reject E_OFFLINE_MISSING, not E_FS, when no folder can be created at all and the archive or parts are missing offline (O3, E3)`, async function() {
        //唯讀之套件根: 離線缺檔須報缺檔(含準備方法), 不可因建不了暫存夾而報E_FS
        let denied = {
            ...fs,
            mkdirSync: (p) => {
                let err = new Error(`EACCES: permission denied, mkdir '${p}'`)
                err.code = 'EACCES'
                throw err
            },
        }
        for (let files of [[fK6()], [fFf()], [fTool()]]) {
            let root = fx('denied')
            let e = await catchErr(ens(mf(files), { pkgRoot: root, fs: denied }))
            assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING', JSON.stringify(e && e.message))
            assert.strict.equal(e.message.includes('how to prepare'), true)
            assert.strict.deepStrictEqual(walk(root), [])
        }
    })

    //---------------- 有鏡像但取不到(空鏡像、鏡像檔不符、http鏡像404或內容不符): 嘗試中建立之空夾須清掉 ----------------

    let mirrors = {
        'local mirror folder without the file': {
            opt: (root) => {
                fs.mkdirSync(path.join(root, 'mirror'), { recursive: true })
                return { mirror: path.join(root, 'mirror') }
            },
        },
        'local mirror folder with a tampered file': {
            opt: (root, kn) => {
                let mirror = path.join(root, 'mirror')
                if (kn === 'direct') {
                    putMirror(mirror, toolBad, 'tool.exe', tool)
                }
                else if (kn === 'archive') {
                    putMirror(mirror, exe.subarray(0, 100), 'k6.exe', exe) //最終檔位置放不符者
                    putMirror(mirror, Buffer.concat([zip, Buffer.from('x')]), 'k6-v1.zip', zip) //壓縮檔位置放不符者
                }
                else {
                    putMirror(mirror, ffexe.subarray(0, 100), 'ffmpeg.exe', ffexe)
                    ffparts.forEach((b, i) => {
                        putMirror(mirror, Buffer.concat([b, Buffer.from('x')]), `ff.zip.00${i + 1}`, b)
                    })
                }
                return { mirror }
            },
        },
        'http mirror answering 404': {
            opt: () => {
                return {
                    mirror: MIRROR_URL,
                    fetch: (u) => {
                        fetchCalls.push(String(u))
                        return Promise.resolve(new Response('not found', { status: 404 }))
                    },
                }
            },
            http: true,
        },
        'http mirror answering a tampered body': {
            opt: () => {
                return {
                    mirror: MIRROR_URL,
                    fetch: (u) => {
                        fetchCalls.push(String(u))
                        return Promise.resolve(new Response(Buffer.from('tampered'), { status: 200 }))
                    },
                }
            },
            http: true,
        },
    }
    for (let [kn, files] of Object.entries(kinds)) {
        for (let [mn, m] of Object.entries(mirrors)) {
            it(`should leave no new folder when the ${kn} file is not obtained from a mirror offline (${mn}) (O3)`, async function() {
                let root = fx(`b-${kn}`)
                let o = m.opt(root, kn)
                let before = walk(root) //鏡像本身(測試備妥者)不算
                let e = await catchErr(ens(mf(files()), { pkgRoot: root, ...o }))
                assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
                assert.strict.deepStrictEqual(walk(root), before)
                if (m.http) {
                    assert.strict.equal(fetchCalls.length > 0, true) //確有嘗試鏡像(離線不連GitHub或廠商網址)
                    assert.strict.equal(fetchCalls.every((u) => u.startsWith(MIRROR_URL)), true)
                }
            })
        }
    }

    //---------------- 混合: 部分命中快取、部分缺檔; 原本已存在之夾不動 ----------------

    it(`should leave the cache untouched when some files hit the cache and the others are missing offline (O3)`, async function() {
        let root = fx('mix-hit')
        let fp = putFile(path.join(root, 'bin-cache', sha(tool), 'tool.exe'), tool)
        let before = walk(root)
        let rec = recFs()
        let e = await catchErr(ens(mf([fTool(), fK6(), fFf()]), { pkgRoot: root, fs: rec.fs }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(e.missing.map((v) => v.name), ['k6.exe', 'ffmpeg.exe']) //命中者不列為缺
        assert.strict.deepStrictEqual(walk(root), before)
        assert.strict.equal(fs.readFileSync(fp).equals(tool), true)
        assert.strict.deepStrictEqual(rec.mkdirs, [])
    })

    it(`should keep a cache root that already exists even when it is empty (O3)`, async function() {
        let root = fx('mix-emptyroot')
        fs.mkdirSync(path.join(root, 'bin-cache'))
        let mirror = path.join(root, 'mirror')
        fs.mkdirSync(mirror)
        let before = walk(root)
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, mirror })) //有鏡像: 會建暫存夾再刪
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(walk(root), before)
        assert.strict.equal(fs.existsSync(path.join(root, 'bin-cache')), true)
    })

    it(`should keep an empty <sha256> folder that already exists, and remove none of the folders it did not create (O3)`, async function() {
        let root = fx('mix-emptysha')
        let dirB = path.join(root, 'bin-cache', sha(tool2))
        fs.mkdirSync(dirB, { recursive: true })
        let before = walk(root)
        let e = await catchErr(ens(mf([fTool2()]), {
            pkgRoot: root,
            mirror: MIRROR_URL,
            fetch: () => Promise.resolve(new Response(Buffer.from('tampered'), { status: 200 })),
        }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(walk(root), before)
        assert.strict.equal(fs.existsSync(dirB), true)
    })

    it(`should keep what it got from the mirror and leave no empty folder for the file it could not get (O3)`, async function() {
        let root = fx('mix-got')
        let mirror = path.join(root, 'mirror')
        putMirror(mirror, tool, 'tool.exe') //tool.exe取得
        putMirror(mirror, tool2Bad, 'tool2.exe', tool2) //tool2.exe鏡像檔不符而拒用
        let e = await catchErr(ens(mf([fTool(), fTool2()]), { pkgRoot: root, mirror }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(e.missing.map((v) => v.name), ['tool2.exe'])
        assert.strict.deepStrictEqual(walk(root).filter((v) => !v.startsWith('mirror')), ['bin-cache', `bin-cache/${sha(tool)}`, `bin-cache/${sha(tool)}/tool.exe`])
        assert.strict.equal(fs.readFileSync(path.join(root, 'bin-cache', sha(tool), 'tool.exe')).equals(tool), true) //已取得者留在快取
    })

    it(`should leave no folder in the trunk (floating) mode offline, and not write the copy of the trunk manifest (O3, M5)`, async function() {
        let root = fx('floating')
        let m = { schema: 1, pkg: 'w-f', mode: 'floating', repo: 'yuda-lyu/w-f', commit: C1, files: [fTool(), fK6()] }
        let e = await catchErr(ens(m, { pkgRoot: root }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
        assert.strict.deepStrictEqual(walk(root), []) //沒有bin-cache, 也沒有manifest-last.json
        assert.strict.deepStrictEqual(fetchCalls, [])
    })

    //---------------- 不變: 離線全部命中、非離線、傳入之fs無rmdirSync ----------------

    it(`should not change what it does when every file hits the cache offline (O3)`, async function() {
        let root = fx('allhit')
        putFile(path.join(root, 'bin-cache', sha(tool), 'tool.exe'), tool)
        putFile(path.join(root, 'bin-cache', sha(exe), 'k6.exe'), exe)
        let before = walk(root)
        let rec = recFs()
        let r = await ens(mf([fTool(), fK6()]), { pkgRoot: root, fs: rec.fs })
        assert.strict.deepStrictEqual(Object.keys(r), ['tool.exe', 'k6.exe'])
        assert.strict.equal(r['tool.exe'], path.join(root, 'bin-cache', sha(tool), 'tool.exe'))
        assert.strict.deepStrictEqual(walk(root), before)
        assert.strict.deepStrictEqual(rec.mkdirs, [])
        assert.strict.deepStrictEqual(rec.rmdirs, []) //沒有缺檔: 不清資料夾
    })

    it(`should still create the cache and not remove folders when online, including when a download fails (not offline)`, async function() {
        let root = fx('online')
        let rec = recFs()
        let r = await ens(mf([fTool()]), {
            pkgRoot: root,
            offline: false,
            fs: rec.fs,
            fetch: () => Promise.resolve(new Response(tool, { status: 200, headers: { 'content-length': String(tool.length) } })),
        })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(tool), true)
        assert.strict.equal(r['tool.exe'], path.join(root, 'bin-cache', sha(tool), 'tool.exe'))
        assert.strict.deepStrictEqual(rec.rmdirs, [])
        let root2 = fx('online404')
        let rec2 = recFs()
        let e = await catchErr(ens(mf([fTool()]), {
            pkgRoot: root2,
            offline: false,
            maxAttempts: 1,
            fs: rec2.fs,
            fetch: () => Promise.resolve(new Response('nf', { status: 404 })),
        }))
        assert.strict.deepStrictEqual([e && e.code, e && e.status], ['E_HTTP', 404])
        assert.strict.deepStrictEqual(rec2.rmdirs, []) //非離線: 不清資料夾
        assert.strict.equal(fs.existsSync(path.join(root2, 'bin-cache')), true) //非離線之建夾行為不變
    })

    it(`should still reject E_OFFLINE_MISSING when the passed fs has no rmdirSync (the empty folders it made are then left)`, async function() {
        let root = fx('normdir')
        let mirror = path.join(root, 'mirror')
        fs.mkdirSync(mirror)
        let fsNo = { ...fs, rmdirSync: undefined }
        let e = await catchErr(ens(mf([fK6()]), { pkgRoot: root, mirror, fs: fsNo }))
        assert.strict.equal(e && e.code, 'E_OFFLINE_MISSING')
    })

    it(`should not produce unhandled rejections in this suite`, function() {
        assert.strict.deepStrictEqual(unhandled, [])
    })

})
