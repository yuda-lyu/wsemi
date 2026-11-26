/* eslint-disable no-new-wrappers */ //本檔刻意以包裝物件(new String、new Boolean、new Number)為受測輸入(包裝物件對安全相關opt無效, W-20)
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import chkHashType from '../src/_chkHashType.mjs'
import fsGetFileHash from '../src/fsGetFileHash.mjs'
import fsGetFileHashCore from '../src/fsGetFileHashCore.mjs'
import fsGetFileBasicHash from '../src/fsGetFileBasicHash.mjs'
import fsGetFileBasicHashCore from '../src/fsGetFileBasicHashCore.mjs'
import fsGetFileXxHash from '../src/fsGetFileXxHash.mjs'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'
import fsGetFolderBasicHashCore from '../src/fsGetFolderBasicHashCore.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import fsGetFilesWithHashInFolderCore from '../src/fsGetFilesWithHashInFolderCore.mjs'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'
import fsTreeFolderWithHashCore from '../src/fsTreeFolderWithHashCore.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import fsSyncFolderCore from '../src/fsSyncFolderCore.mjs'
import fsTask from '../src/fsTask.mjs'
import getFileHash from '../src/getFileHash.mjs'
import getFileBasicHash from '../src/getFileBasicHash.mjs'
import fsEnsureBins from '../src/fsEnsureBins.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import fsDownloadFileVerify from '../src/fsDownloadFileVerify.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsCopyFile from '../src/fsCopyFile.mjs'
import fsCopyFolder from '../src/fsCopyFolder.mjs'
import fsMergeFiles from '../src/fsMergeFiles.mjs'


//第492項第3批 W-08、W-09: 安全相關opt(影響演算法、校驗、是否連網、下載來源、取哪些檔)為K3之例外, 給了而無效即拒絕(fail-closed), 不改用預設
//  單一擁有者: src/_chkHashType.mjs(雜湊演算法)、fsEnsureBinsCore/fsDownloadFileVerifyCore之入口檢查; 規格: 輸入參數之檢測機制 §11(安全相關opt為K3之例外)
//  另: 對外12函數之注入鍵(fs、path、crypto等)給undefined視為未給取Node內建(W-10延伸, src/_mergeInject.mjs)
describe(`fs 安全相關opt與注入鍵(R-HASH-TYPE-01、R-SEC-OPT-01)`, function() {

    let fx = path.resolve('./test/_tmp/fsSecurityOpts')
    let fpA = path.join(fx, 'a.txt') //內容abc
    let fdFull = path.join(fx, 'full') //內有a.txt、b.txt
    let fdEmpty = path.join(fx, 'empty') //空資料夾
    let fpNope = path.join(fx, 'nope-secret-token', 'x.txt') //不存在之檔
    let fdNope = path.join(fx, 'nope-secret-token') //不存在之資料夾

    let MSG_NODE = 'invalid opt.type: must be one of crypto.getHashes()'
    let MSG_XX = `invalid opt.type: must be 'xxhash64' or one of crypto.getHashes()`

    let hexOf = (alg, s) => crypto.createHash(alg).update(s).digest('hex')

    before(function() {
        fs.rmSync(fx, { recursive: true, force: true })
        fs.mkdirSync(fdFull, { recursive: true })
        fs.mkdirSync(fdEmpty, { recursive: true })
        fs.writeFileSync(fpA, 'abc')
        fs.writeFileSync(path.join(fdFull, 'a.txt'), 'abc')
        fs.writeFileSync(path.join(fdFull, 'b.txt'), 'defg')
    })

    after(function() {
        fs.rmSync(fx, { recursive: true, force: true })
        assert.strict.deepStrictEqual(fs.existsSync(fx), false)
    })

    //rej, 取Promise之拒絕值(未拒絕時回傳{ resolved })
    let rej = async (pm) => {
        try {
            let v = await pm
            return { resolved: v }
        }
        catch (err) {
            return err
        }
    }

    //thr, 取同步拋出之Error訊息(未拋出為null)
    let thr = (f) => {
        try {
            f()
            return null
        }
        catch (err) {
            return err.message
        }
    }

    //無效之type值(給了而無效: 非字串、空字串、包裝物件、不在crypto.getHashes()之字串、原型鏈名稱)
    let badTypes = [
        ['number', 123],
        ['true', true],
        ['false', false],
        ['object', {}],
        ['array', ['md5']],
        ['empty string', ''],
        ['wrapper String', new String('md5')],
        ['unknown name', 'foo'],
        ['upper case alias not in getHashes', 'MD5'],
        ['prototype key constructor', 'constructor'],
        ['prototype key toString', 'toString'],
        ['prototype key __proto__', '__proto__'],
        ['prototype key hasOwnProperty', 'hasOwnProperty'],
    ]

    describe(`_chkHashType`, function() {

        it(`should treat undefined and null as not given and return null (the caller takes the default)`, function() {
            //規格: opt給undefined或null為未給(K3), 取預設
            assert.strict.deepStrictEqual([chkHashType(undefined, { crypto }), chkHashType(null, { crypto }), chkHashType(undefined, { list: ['a'] })], [null, null, null])
        })

        it(`should accept the members of crypto.getHashes() and reject the others, case-sensitively and by array membership (not by object keys)`, function() {
            //規格: 允許之演算法以crypto.getHashes()為準, 不受原型鏈名稱誤判
            for (let t of crypto.getHashes()) {
                assert.strict.deepStrictEqual(chkHashType(t, { crypto }), null, t)
            }
            for (let [n, v] of badTypes) {
                assert.strict.deepStrictEqual(chkHashType(v, { crypto }), MSG_NODE, n)
            }
        })

        it(`should additionally accept 'xxhash64' only when the path supports it (xx: true) and word the message accordingly`, function() {
            assert.strict.deepStrictEqual([chkHashType('xxhash64', { crypto, xx: true }), chkHashType('xxhash64', { crypto })], [null, MSG_NODE])
            assert.strict.deepStrictEqual(chkHashType('foo', { crypto, xx: true }), MSG_XX)
        })

        it(`should use the fixed list when given (order of keys irrelevant) and name the parameter in the message without the given value`, function() {
            let list = ['md5', 'sha256']
            assert.strict.deepStrictEqual([chkHashType('md5', { list }), chkHashType('constructor', { list }), chkHashType('sha1', { list, name: 'opt.typeHash' })], [null, `invalid opt.type: must be one of 'md5', 'sha256'`, `invalid opt.typeHash: must be one of 'md5', 'sha256'`])
        })

        it(`should accept any non-empty string when the injected crypto offers no getHashes (it cannot be checked, createHash decides), and still reject non-strings and ''`, function() {
            let c1 = { createHash() {} }
            let c2 = {
                getHashes() {
                    throw new Error('boom')
                }
            }
            assert.strict.deepStrictEqual([chkHashType('whatever', { crypto: c1 }), chkHashType('whatever', { crypto: c2 }), chkHashType('', { crypto: c1 }), chkHashType(5, { crypto: c1 })], [null, null, MSG_NODE, MSG_NODE])
        })

    })

    //站點: 各函數之type檢查(public與Core), 路徑故意給不存在者以證明type之檢查先於「是否為檔案/資料夾」與任何讀檔
    let sites = [
        { fn: 'fsGetFileHash', xx: true, call: (p, o) => fsGetFileHash(p.file, o) },
        { fn: 'fsGetFileHashCore', xx: true, call: (p, o) => fsGetFileHashCore(p.file, { fs, crypto, ...o }) },
        { fn: 'fsGetFileBasicHash', xx: false, call: (p, o) => fsGetFileBasicHash(p.file, o) },
        { fn: 'fsGetFileBasicHashCore', xx: false, call: (p, o) => fsGetFileBasicHashCore(p.file, { fs, crypto, ...o }) },
        { fn: 'fsGetFolderBasicHash', xx: false, folder: true, call: (p, o) => fsGetFolderBasicHash(p.folder, o) },
        { fn: 'fsGetFolderBasicHashCore', xx: false, folder: true, call: (p, o) => fsGetFolderBasicHashCore(p.folder, { fs, path, crypto, ...o }) },
        { fn: 'fsGetFilesWithHashInFolder', xx: true, folder: true, call: (p, o) => fsGetFilesWithHashInFolder(p.folder, { levelLimit: 1, ...o }) }, //第2參數即opt(R-LEVEL-LIMIT-02)
        { fn: 'fsGetFilesWithHashInFolderCore', xx: true, folder: true, call: (p, o) => fsGetFilesWithHashInFolderCore(p.folder, { fs, path, crypto, levelLimit: 1, ...o }) },
        { fn: 'fsTreeFolderWithHash', xx: false, folder: true, call: (p, o) => fsTreeFolderWithHash(p.folder, { levelLimit: 1, ...o }) },
        { fn: 'fsTreeFolderWithHashCore', xx: false, folder: true, call: (p, o) => fsTreeFolderWithHashCore(p.folder, { fs, path, crypto, levelLimit: 1, ...o }) },
        { fn: 'fsSyncFolder', xx: false, folder: true, call: (p, o) => fsSyncFolder(p.folder, p.tar, o) },
        { fn: 'fsSyncFolderCore', xx: false, folder: true, call: (p, o) => fsSyncFolderCore(p.folder, p.tar, { fs, path, crypto, ...o }) },
    ]

    describe(`給了而無效之type須拒絕(W-08)`, function() {

        for (let s of sites) {
            for (let [n, v] of badTypes) {

                it(`${s.fn} should reject the fixed message without the value when opt.type is ${n}, before any file is read (the path does not exist)`, async function() {
                    //規格: 雜湊演算法給了而無效即拒絕(不改用預設), 訊息依V19列舉類寫one of、不帶輸入值; 檢查於入口先於任何讀檔(不存在之路徑仍得此訊息)
                    let tar = path.join(fx, `tar-${s.fn}`)
                    let r = await rej(s.call({ file: fpNope, folder: fdNope, tar }, { type: v }))
                    assert.strict.deepStrictEqual(r, s.xx ? MSG_XX : MSG_NODE)
                })

            }
        }

    })

    describe(`未給(undefined、null)取預設, 有效之type照用`, function() {

        it(`should take the defaults of the file functions (sha512) and of the folder functions (md5) when opt.type is undefined or null`, async function() {
            for (let t of [undefined, null]) {
                assert.strict.deepStrictEqual(await fsGetFileHash(fpA, { type: t }), hexOf('sha512', 'abc'))
                assert.strict.deepStrictEqual(await fsGetFileBasicHash(fpA, { type: t }), hexOf('sha512', 'abc'))
                assert.strict.deepStrictEqual(await fsGetFolderBasicHash(fdFull, { type: t }), [hexOf('md5', 'abc'), hexOf('md5', 'defg')].join('|'))
                let ls = await fsGetFilesWithHashInFolder(fdFull, { levelLimit: 1, type: t })
                assert.strict.deepStrictEqual(ls.map((v) => [v.name, v.hashType, v.hash]), [['a.txt', 'md5', hexOf('md5', 'abc')], ['b.txt', 'md5', hexOf('md5', 'defg')]])
                let ts = await fsTreeFolderWithHash(fdFull, { levelLimit: 1, type: t })
                assert.strict.deepStrictEqual(ts.map((v) => [v.name, v.hash]), [['a.txt', hexOf('md5', 'abc')], ['b.txt', hexOf('md5', 'defg')]])
            }
        })

        it(`should use a valid type as given: sha256 for every function, xxhash64 only where supported`, async function() {
            assert.strict.deepStrictEqual(await fsGetFileHash(fpA, { type: 'sha256' }), hexOf('sha256', 'abc'))
            assert.strict.deepStrictEqual(await fsGetFileBasicHash(fpA, { type: 'sha1' }), hexOf('sha1', 'abc'))
            assert.strict.deepStrictEqual(await fsGetFolderBasicHash(fdFull, { type: 'sha256' }), [hexOf('sha256', 'abc'), hexOf('sha256', 'defg')].join('|'))
            let h = await fsGetFileHash(fpA, { type: 'xxhash64' })
            assert.strict.deepStrictEqual(/^[0-9a-f]{16}$/.test(h), true)
            let ls = await fsGetFilesWithHashInFolder(fdFull, { levelLimit: 1, type: 'xxhash64' })
            assert.strict.deepStrictEqual(ls.map((v) => v.hashType), ['xxhash64', 'xxhash64'])
        })

    })

    describe(`同一函數之所有路徑一致(fsSyncFolder)與資料夾無檔案時亦檢查`, function() {

        it(`should reject an invalid type and not create the target when the target folder does not exist (the whole-copy path does not hash)`, async function() {
            //規格: 同一函數之所有路徑一致(含fsSyncFolderCore目標不存在時); 原: 目標不存在時type完全不被使用而成功複製
            let tar = path.join(fx, 'sync-tar-new')
            let r = await rej(fsSyncFolder(fdFull, tar, { type: 'foo' }))
            assert.strict.deepStrictEqual([r, fs.existsSync(tar)], [MSG_NODE, false])
        })

        it(`should reject an invalid type and leave the target unchanged when the target folder exists`, async function() {
            let tar = path.join(fx, 'sync-tar-exist')
            fs.mkdirSync(tar, { recursive: true })
            fs.writeFileSync(path.join(tar, 'old.txt'), 'old')
            let r = await rej(fsSyncFolder(fdFull, tar, { type: 'foo' }))
            assert.strict.deepStrictEqual([r, fs.readdirSync(tar)], [MSG_NODE, ['old.txt']])
        })

        it(`should sync normally with a valid type (the control)`, async function() {
            let tar = path.join(fx, 'sync-tar-ok')
            let b = await fsSyncFolder(fdFull, tar, { type: 'sha256' })
            assert.strict.deepStrictEqual([b, fs.readdirSync(tar)], [true, ['a.txt', 'b.txt']])
        })

        it(`should reject an invalid type of the folder functions even when the folder has no file (原: 空資料夾不呼叫createHash而回空雜湊)`, async function() {
            let r1 = await rej(fsGetFolderBasicHash(fdEmpty, { type: 'foo' }))
            let r2 = await rej(fsTreeFolderWithHash(fdEmpty, { levelLimit: 1, type: 'foo' }))
            let r3 = await rej(fsGetFilesWithHashInFolder(fdEmpty, { levelLimit: 1, type: 'foo' }))
            assert.strict.deepStrictEqual([r1, r2, r3], [MSG_NODE, MSG_NODE, MSG_XX])
        })

    })

    describe(`fsGetFileHashCore 之相依檢查先於讀檔(與fsGetFileBasicHashCore同順序)`, function() {

        it(`should reject the invalid crypto before any file access when the algorithm needs crypto, and not check crypto for xxhash64`, async function() {
            //外審(terra)指出: 原不存在之fp配無效crypto時先statSync、回'invalid fp', 與同族fsGetFileBasicHashCore(相依先於讀檔)不一致
            let calls = []
            let spyFs = new Proxy(fs, {
                get(t, k) {
                    if (typeof t[k] === 'function') {
                        return (...a) => {
                            calls.push(k)
                            return t[k](...a)
                        }
                    }
                    return t[k]
                }
            })
            let fpNope = path.join(fx, 'order-nope.bin')
            let r1 = await rej(fsGetFileHashCore(fpNope, { fs: spyFs, crypto: null }))
            let n1 = calls.length
            let r2 = await rej(fsGetFileHashCore(fpNope, { fs: spyFs, crypto: {}, type: 'sha256' }))
            let n2 = calls.length
            let r3 = await rej(fsGetFileHashCore(fpNope, { fs: spyFs, crypto: null, type: 'xxhash64' }))
            assert.strict.deepStrictEqual([r1, n1, r2, n2], ['invalid opt.crypto: must be an object providing createHash', 0, 'invalid opt.crypto: must be an object providing createHash', 0])
            assert.strict.deepStrictEqual([r3, calls.length > n2], ['invalid fp: must be an existing file', true])
        })

    })

    describe(`getFileHash、getFileBasicHash(Blob, hash-wasm)`, function() {

        let blob = () => new Blob(['abc'])

        it(`should reject the fixed message without the value for every invalid type, including prototype key names`, async function() {
            let list = `'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'md5', 'sha1', 'sha256', 'sha384', 'sha512'`
            //'MD5'屬此二函數之合法鍵(hash-wasm之別名), 不在其無效表(但不在crypto.getHashes()內, 屬Node端函數之無效表)
            for (let [n, v] of badTypes.filter(([n]) => n !== 'upper case alias not in getHashes')) {
                assert.strict.deepStrictEqual(await rej(getFileBasicHash(blob(), { type: v })), `invalid opt.type: must be one of ${list}`, `basic ${n}`)
                assert.strict.deepStrictEqual(await rej(getFileHash(blob(), { type: v })), `invalid opt.type: must be one of ${list}, 'xxhash64'`, `hash ${n}`)
            }
        })

        it(`getFileHash should use the type it checked (K4): a getter of opt.type read twice must not switch the algorithm between the check and the hashing`, async function() {
            //外審(terra)指出: 檢核後把原opt轉交下游, 下游再讀一次getter, 首讀'sha256'、次讀undefined時靜默改用預設sha512
            //讀取次數不計(展開opt時getter會再被呼叫一次, 其值被已檢核之type覆寫), 以結果之演算法為準
            let n = 0
            let opt = {
                get type() {
                    n++
                    return n === 1 ? 'sha256' : undefined
                }
            }
            let h = await getFileHash(blob(), opt)
            assert.strict.deepStrictEqual(h, hexOf('sha256', 'abc'))
        })

        it(`should take the default sha512 for undefined and null and accept the documented names and aliases`, async function() {
            let want = hexOf('sha512', 'abc')
            assert.strict.deepStrictEqual([await getFileHash(blob(), { type: undefined }), await getFileHash(blob(), { type: null }), await getFileBasicHash(blob(), { type: null })], [want, want, want])
            assert.strict.deepStrictEqual([await getFileHash(blob(), { type: 'SHA-256' }), await getFileBasicHash(blob(), { type: 'md5' })], [hexOf('sha256', 'abc'), hexOf('md5', 'abc')])
            assert.strict.deepStrictEqual(/^[0-9a-f]{16}$/.test(await getFileHash(blob(), { type: 'xxhash64' })), true)
        })

        it(`should not accept xxhash64 in getFileBasicHash (only getFileHash dispatches it)`, async function() {
            let r = await rej(getFileBasicHash(blob(), { type: 'xxhash64' }))
            assert.strict.deepStrictEqual(typeof r, 'string')
            assert.strict.deepStrictEqual(r.startsWith('invalid opt.type: must be one of '), true)
        })

    })

    describe(`fsTask opt.typeHash`, function() {

        it(`should throw synchronously for an invalid typeHash before creating the storage folder, with the fixed message`, function() {
            for (let [n, v] of badTypes) {
                let st = path.join(fx, `task-st-${n.replace(/\W/g, '_')}`)
                let m = thr(() => fsTask(fdFull, { fdStorage: st, typeHash: v }))
                assert.strict.deepStrictEqual([n, m, fs.existsSync(st)], [n, `invalid opt.typeHash: must be 'xxhash64' or one of crypto.getHashes()`, false])
            }
        })

        it(`should accept undefined, null, a getHashes() member and xxhash64`, function() {
            for (let t of [undefined, null, 'sha256', 'xxhash64']) {
                let st = path.join(fx, `task-st-ok-${String(t)}`)
                let ev = fsTask(fdFull, { fdStorage: st, typeHash: t, timeInterval: 3600000 })
                ev.clear()
                assert.strict.deepStrictEqual(fs.existsSync(st), true, String(t))
            }
        })

    })

    //fsEnsureBins: 安全相關opt(offline、mirror、fetch、names、floatingManifestUrl)給了而無效即E_ARG(不改用預設); names: []為合法之空資料; 非安全opt(cacheDir、onProgress)非預期視為未給
    describe(`fsEnsureBins(Core) 之opt(W-09)`, function() {

        let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
        let manifest = {
            schema: 1,
            pkg: 'w-sec-test',
            mode: 'pinned',
            repo: 'o/r',
            files: [{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 }],
        }
        let calls = 0
        let fetchSpy = () => {
            calls++
            return Promise.reject(new Error('no network allowed'))
        }
        let fdRoot = path.join(fx, 'ensure-root')

        beforeEach(function() {
            calls = 0
            fs.rmSync(fdRoot, { recursive: true, force: true })
            fs.mkdirSync(fdRoot, { recursive: true })
        })

        let bad = async (opt) => {
            let e = await rej(fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, ...opt }))
            return { code: e.code, step: e.step, message: e.message, calls, root: fs.readdirSync(fdRoot) }
        }

        let argBads = [
            ['offline string yes', { offline: 'yes' }, 'fsEnsureBins: invalid opt.offline: must be a boolean'],
            ['offline string true', { offline: 'true' }, 'fsEnsureBins: invalid opt.offline: must be a boolean'],
            ['offline number', { offline: 1 }, 'fsEnsureBins: invalid opt.offline: must be a boolean'],
            ['offline wrapper Boolean', { offline: new Boolean(true) }, 'fsEnsureBins: invalid opt.offline: must be a boolean'],
            ['mirror number', { mirror: 123 }, 'fsEnsureBins: invalid opt.mirror: must be a string'],
            ['mirror object', { mirror: {} }, 'fsEnsureBins: invalid opt.mirror: must be a string'],
            ['mirror true', { mirror: true }, 'fsEnsureBins: invalid opt.mirror: must be a string'],
            ['mirror local path with a NUL character (not silently falling back to the source url)', { mirror: 'bad\0mirror' }, 'fsEnsureBins: invalid opt.mirror (or W_BIN_MIRROR): must not contain a NUL character'],
            ['fetch string', { fetch: 'x' }, 'fsEnsureBins: invalid opt.fetch: must be a function'],
            ['fetch number', { fetch: 123 }, 'fsEnsureBins: invalid opt.fetch: must be a function'],
            ['names empty string', { names: '' }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names array with empty string', { names: [''] }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names array with number', { names: [1] }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names number', { names: 123 }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names object', { names: {} }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names sparse array (a hole is not an element)', { names: new Array(1) }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['names array with a hole between valid names', {
                names: (() => {
                    let a = ['a.bin', 'a.bin']; delete a[1]; return a
                })()
            }, 'fsEnsureBins: invalid opt.names: must be a non-empty string or an array of non-empty strings'],
            ['env null (would hide W_BIN_OFFLINE of the process)', { env: null }, 'fsEnsureBins: invalid opt.env: must be an object'],
            ['env number', { env: 5 }, 'fsEnsureBins: invalid opt.env: must be an object'],
            ['env string', { env: 'W_BIN_OFFLINE=1' }, 'fsEnsureBins: invalid opt.env: must be an object'],
            ['floatingManifestUrl http', { floatingManifestUrl: 'http://example.com/secret-url-token' }, 'fsEnsureBins: invalid opt.floatingManifestUrl: must be an https url without credentials'],
            ['floatingManifestUrl number', { floatingManifestUrl: 5 }, 'fsEnsureBins: invalid opt.floatingManifestUrl: must be an https url without credentials'],
        ]

        for (let [n, opt, msg] of argBads) {
            it(`should reject E_ARG with the fixed message (not the default) before any network or file access when ${n}`, async function() {
                //規格: 安全相關opt給了而無效即拒絕, 不改用預設(offline:'yes'若改預設false會靜默變成連網); 訊息依V19且不帶輸入值
                let r = await bad(opt)
                assert.strict.deepStrictEqual(r, { code: 'E_ARG', step: 'argument', message: msg, calls: 0, root: [] })
            })
        }

        it(`should accept names: [] as legal empty data: nothing is fetched, nothing is created, the result is empty`, async function() {
            //規格: names: []為合法之空資料(不取任何檔、回空結果, 2026-11-03「空資料不是錯誤」); 原: E_ARG
            let r = await fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, names: [] })
            assert.strict.deepStrictEqual([Object.keys(r), calls, fs.readdirSync(fdRoot)], [[], 0, []])
        })

        it(`names: [] of a floating manifest should not fetch the trunk manifest nor write manifest-last.json (empty selection needs nothing), and the checks of floatingManifestUrl still run first`, async function() {
            let mf = { schema: 1, pkg: 'w-sec-flt', mode: 'floating', repo: 'o/r', files: [{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: '0'.repeat(64), size: 1 }] }
            let r = await fsEnsureBins(mf, { pkgRoot: fdRoot, fetch: fetchSpy, names: [] })
            assert.strict.deepStrictEqual([Object.keys(r), calls, fs.readdirSync(fdRoot)], [[], 0, []])
            //網址不在清單所屬repo之原始檔夾下者仍E_ARG(安全相關opt之檢核不因空選取而略過)
            let e = await rej(fsEnsureBins(mf, { pkgRoot: fdRoot, fetch: fetchSpy, names: [], floatingManifestUrl: 'https://raw.githubusercontent.com/other/repo/master/m.json' }))
            assert.strict.deepStrictEqual([e.code, e.step, calls, fs.readdirSync(fdRoot)], ['E_ARG', 'argument', 0, []])
        })

        it(`the cause of E_ARG for an unreadable opt should be a new fixed Error for a native error (no path, syscall) and the original object for an error of the caller`, async function() {
            let nat = new Error(`EPERM: operation not permitted, open 'C:/secret-dir-token/x.txt'`)
            nat.code = 'EPERM'
            nat.syscall = 'open'
            nat.path = 'C:/secret-dir-token/x.txt'
            let own = new RangeError('caller error')
            let e1 = await rej(fsEnsureBins(manifest, {
                pkgRoot: fdRoot,
                fetch: fetchSpy,
                get names() {
                    throw nat
                }
            }))
            let e2 = await rej(fsEnsureBins(manifest, {
                pkgRoot: fdRoot,
                fetch: fetchSpy,
                get names() {
                    throw own
                }
            }))
            assert.strict.deepStrictEqual([e1.code, e1.cause === nat, e1.cause.message, e1.cause.code, Object.keys(e1.cause), e1.message.includes('secret-dir-token')], ['E_ARG', false, 'operation failed (code EPERM)', 'EPERM', ['code'], false])
            assert.strict.deepStrictEqual([e2.code, e2.cause === own], ['E_ARG', true])
        })

        it(`E_MANIFEST for a manifest file that is not valid JSON should not carry a fragment of the file in the message or the cause`, async function() {
            let fp = path.join(fdRoot, 'bad-manifest.json')
            fs.writeFileSync(fp, 'SECRET_JSON_TOKEN not json')
            let e = await rej(fsEnsureBins(fp, { pkgRoot: fdRoot, fetch: fetchSpy }))
            assert.strict.deepStrictEqual([e.code, e.message, e.cause.message, e.cause.name], ['E_MANIFEST', 'fsEnsureBins: the manifest file is not valid JSON', 'SyntaxError: invalid syntax', 'Error'])
            assert.strict.deepStrictEqual(JSON.stringify([e.message, e.cause.message, e.stack.split('\n')[0]]).includes('SECRET_JSON_TOKEN'), false)
        })

        it(`should treat a cacheDir containing a NUL character as not given (K3 default), the same result as without cacheDir`, async function() {
            let e1 = await rej(fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, offline: true }))
            let e2 = await rej(fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, offline: true, cacheDir: 'bad\0cache' }))
            assert.strict.deepStrictEqual([e1.code, e2.code, calls], ['E_OFFLINE_MISSING', 'E_OFFLINE_MISSING', 0])
        })

        it(`should treat a non-string cacheDir and a non-function onProgress as not given (non-security opt: default, no error)`, async function() {
            for (let v of [123, {}, true, []]) {
                let r = await fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, names: [], cacheDir: v })
                assert.strict.deepStrictEqual(Object.keys(r), [], `cacheDir ${JSON.stringify(v)}`)
            }
            for (let v of ['x', 1, {}, true]) {
                let r = await fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: fetchSpy, names: [], onProgress: v })
                assert.strict.deepStrictEqual(Object.keys(r), [], `onProgress ${JSON.stringify(v)}`)
            }
            assert.strict.deepStrictEqual([calls, fs.readdirSync(fdRoot)], [0, []])
        })

        it(`should treat undefined and null of the security opts as not given (default), not as invalid`, async function() {
            //規格(K3): opt為undefined或null為未給, 取預設; 離線(offline: true)而無快取時回E_OFFLINE_MISSING(不連網), 重點是不因undefined、null而E_ARG
            let e = await rej(fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: undefined, names: null, offline: true, mirror: null, floatingManifestUrl: null, cacheDir: null, onProgress: undefined, maxAttempts: undefined }))
            assert.strict.deepStrictEqual([e.code, e.step], ['E_OFFLINE_MISSING', 'offline'])
            let r = await fsEnsureBins(manifest, { pkgRoot: fdRoot, fetch: undefined, names: [], offline: undefined, mirror: undefined })
            assert.strict.deepStrictEqual(Object.keys(r), [])
        })

        it(`should keep the same opt rules for fsEnsureBinsCore (the entry of the public function only adds the injected modules)`, async function() {
            let r = await rej(fsEnsureBinsCore(manifest, { pkgRoot: fdRoot, fs, path, crypto, spawn() {}, Readable: (await import('stream')).Readable, pipeline() {}, env: {}, offline: 'yes' }))
            assert.strict.deepStrictEqual([r.code, r.message], ['E_ARG', 'fsEnsureBins: invalid opt.offline: must be a boolean'])
        })

    })

    describe(`fsDownloadFileVerify 之安全相關參數(W-09)`, function() {

        let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
        let fpOut = path.join(fx, 'verify-out', 'x.bin')
        let calls = 0
        let fetchSpy = () => {
            calls++
            return Promise.reject(new Error('no network allowed'))
        }

        beforeEach(function() {
            calls = 0
        })

        it(`should reject E_ARG without fetching when opt.fetch is given but not a function (the global fetch is not used instead)`, async function() {
            for (let v of [123, 'x', {}, true]) {
                let e = await rej(fsDownloadFileVerify('https://example.com/secret-url-token/a.bin', fpOut, { sha256: sha }, { fetch: v }))
                assert.strict.deepStrictEqual([e.code, e.step], ['E_ARG', 'argument'], JSON.stringify(v))
            }
        })

        it(`the cause of E_ARG for an unreadable opt should be a new fixed Error for a native error (no path, syscall), the original object for an error of the caller`, async function() {
            let nat = Object.assign(new Error(`EPERM: operation not permitted, open 'C:/secret-dir-token/x.txt'`), { code: 'EPERM', syscall: 'open', path: 'C:/secret-dir-token/x.txt' })
            let own = new RangeError('caller error')
            let e1 = await rej(fsDownloadFileVerify('https://example.com/a.bin', fpOut, { sha256: sha }, {
                get fetch() {
                    throw nat
                }
            }))
            let e2 = await rej(fsDownloadFileVerify('https://example.com/a.bin', fpOut, {
                get sha256() {
                    throw own
                }
            }, { fetch: fetchSpy }))
            let e3 = await rej(fsDownloadFileVerify('https://example.com/a.bin', fpOut, {
                get sha256() {
                    throw nat
                }
            }, { fetch: fetchSpy }))
            assert.strict.deepStrictEqual([e1.code, e1.step, e1.cause === nat, e1.cause.message, e1.cause.code, Object.keys(e1.cause), e1.message.includes('secret-dir-token')], ['E_ARG', 'argument', false, 'operation failed (code EPERM)', 'EPERM', ['code'], false])
            assert.strict.deepStrictEqual([e2.code, e2.cause === own], ['E_ARG', true])
            assert.strict.deepStrictEqual([e3.code, e3.cause === nat, e3.cause.message, e3.message.includes('secret-dir-token'), calls], ['E_ARG', false, 'operation failed (code EPERM)', false, 0])
        })

        it(`should reject E_ARG without fetching for wrapper objects of urlIn, fpOut and the expected sha256 and size (no unwrapping)`, async function() {
            let cases = [
                [new String('https://example.com/a.bin'), fpOut, { sha256: sha }, 'invalid urlIn: must be a non-empty string'],
                ['https://example.com/a.bin', new String(fpOut), { sha256: sha }, 'invalid fpOut: must be a non-empty file path without NUL that does not end with a path separator'],
                ['https://example.com/a.bin', fpOut, { sha256: new String(sha) }, 'invalid expected.sha256: must be a string of 64 hexadecimal characters'],
                ['https://example.com/a.bin', fpOut, { sha256: sha, size: new Number(3) }, 'invalid expected.size: must be a non-negative integer'],
            ]
            for (let [u, f, x, msg] of cases) {
                let e = await rej(fsDownloadFileVerify(u, f, x, { fetch: fetchSpy }))
                assert.strict.deepStrictEqual([e.code, e.step, e.message, calls, fs.existsSync(path.dirname(fpOut))], ['E_ARG', 'argument', msg, 0, false], msg)
            }
        })

    })

    //對外12函數之注入鍵給undefined視為未給, 取Node內建(W-10延伸); null、缺方法者仍由Core fail-closed
    describe(`對外函數之注入鍵給undefined取Node內建(R-FS-DEPS-01規則5)`, function() {

        let fdI = path.join(fx, 'inject')
        let u = { fs: undefined, path: undefined, crypto: undefined }

        before(function() {
            fs.mkdirSync(path.join(fdI, 'src', 'sub'), { recursive: true })
            fs.writeFileSync(path.join(fdI, 'src', 'p1.txt'), 'abc')
            fs.writeFileSync(path.join(fdI, 'src', 'sub', 'p2.txt'), 'def')
        })

        it(`fsCreateFile should create the file when opt.fs is undefined`, function() {
            let fp = path.join(fdI, 'cf', 'a.txt')
            let r = fsCreateFile(fp, 'abc', { fs: undefined })
            assert.strict.deepStrictEqual([r.success, fs.readFileSync(fp, 'utf8')], [`done: ${fp}`, 'abc'])
        })

        it(`fsCopyFile and fsCopyFolder should copy when opt.fs and opt.path are undefined (sync and async)`, async function() {
            let fpSrc = path.join(fdI, 'src', 'p1.txt')
            let fpT1 = path.join(fdI, 'cp1', 't.txt')
            let fpT2 = path.join(fdI, 'cp2', 't.txt')
            assert.strict.deepStrictEqual(fsCopyFile(fpSrc, fpT1, { fs: undefined, path: undefined }).success, `done: ${fpT1}`)
            assert.strict.deepStrictEqual((await fsCopyFile(fpSrc, fpT2, { fs: undefined, path: undefined, useSync: false })).success, `done: ${fpT2}`)
            let fdT1 = path.join(fdI, 'cpf1')
            let fdT2 = path.join(fdI, 'cpf2')
            assert.strict.deepStrictEqual(fsCopyFolder(path.join(fdI, 'src'), fdT1, { fs: undefined, path: undefined }).success, `done: ${fdT1}`)
            assert.strict.deepStrictEqual((await fsCopyFolder(path.join(fdI, 'src'), fdT2, { fs: undefined, path: undefined, useSync: false })).success, `done: ${fdT2}`)
            assert.strict.deepStrictEqual([fs.readFileSync(path.join(fdT1, 'sub', 'p2.txt'), 'utf8'), fs.readFileSync(path.join(fdT2, 'sub', 'p2.txt'), 'utf8'), fs.readFileSync(fpT1, 'utf8'), fs.readFileSync(fpT2, 'utf8')], ['def', 'def', 'abc', 'abc'])
        })

        it(`fsMergeFiles should merge when opt.fs is undefined`, async function() {
            let p1 = path.join(fdI, 'mg', 'p1')
            let p2 = path.join(fdI, 'mg', 'p2')
            fs.mkdirSync(path.join(fdI, 'mg'), { recursive: true })
            fs.writeFileSync(p1, 'ab')
            fs.writeFileSync(p2, 'cd')
            let out = path.join(fdI, 'mg', 'out.txt')
            let r = await fsMergeFiles([p1, p2], out, { fs: undefined })
            assert.strict.deepStrictEqual([r.path, fs.readFileSync(out, 'utf8')], [out, 'abcd'])
        })

        it(`the hash functions should work when opt.fs, opt.path and opt.crypto are undefined`, async function() {
            let fp = path.join(fdI, 'src', 'p1.txt')
            let fd = path.join(fdI, 'src')
            assert.strict.deepStrictEqual(await fsGetFileHash(fp, { ...u, type: 'sha256' }), hexOf('sha256', 'abc'))
            assert.strict.deepStrictEqual(await fsGetFileBasicHash(fp, { ...u, type: 'sha256' }), hexOf('sha256', 'abc'))
            assert.strict.deepStrictEqual(/^[0-9a-f]{16}$/.test(await fsGetFileXxHash(fp, { fs: undefined })), true)
            assert.strict.deepStrictEqual(await fsGetFolderBasicHash(fd, { ...u, type: 'sha256' }), [hexOf('sha256', 'abc'), hexOf('sha256', 'def')].join('|'))
            assert.strict.deepStrictEqual((await fsGetFilesWithHashInFolder(fd, { ...u, levelLimit: 2, type: 'sha256' })).map((v) => v.hash).sort(), [hexOf('sha256', 'def'), hexOf('sha256', 'abc')].sort())
            assert.strict.deepStrictEqual((await fsTreeFolderWithHash(fd, { ...u, levelLimit: 1 })).map((v) => v.name), ['p1.txt', 'sub'])
        })

        it(`fsSyncFolder should sync when opt.fs, opt.path and opt.crypto are undefined`, async function() {
            let tar = path.join(fdI, 'sync-tar')
            let b = await fsSyncFolder(path.join(fdI, 'src'), tar, { ...u })
            assert.strict.deepStrictEqual([b, fs.readFileSync(path.join(tar, 'sub', 'p2.txt'), 'utf8')], [true, 'def'])
        })

        it(`fsEnsureBins should take every injected module and env from Node when they are undefined`, async function() {
            let manifest = { schema: 1, pkg: 'w-sec-test', mode: 'pinned', repo: 'o/r', files: [{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913', size: 3 }] }
            let r = await fsEnsureBins(manifest, { pkgRoot: path.join(fdI, 'eb'), names: [], fs: undefined, path: undefined, crypto: undefined, Readable: undefined, pipeline: undefined, spawn: undefined, env: undefined })
            assert.strict.deepStrictEqual(Object.keys(r), [])
        })

        it(`null (not undefined) is still invalid: the Core reports it fail-closed`, async function() {
            let fp = path.join(fdI, 'src', 'p1.txt')
            assert.strict.deepStrictEqual(await rej(fsGetFileHash(fp, { fs: null })), 'invalid opt.fs: must be an object providing statSync, lstatSync')
            assert.strict.deepStrictEqual(fsCreateFile(path.join(fdI, 'cfn', 'a.txt'), 'x', { fs: null }).error, 'invalid opt.fs: must be an object providing statSync, lstatSync, writeFileSync')
            let m = { schema: 1, pkg: 'w-sec-test', mode: 'pinned', repo: 'o/r', files: [{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913', size: 3 }] }
            let e = await rej(fsEnsureBins(m, { pkgRoot: path.join(fdI, 'eb2'), names: [], fs: null }))
            assert.strict.deepStrictEqual([e.code, e.message], ['E_ARG', 'fsEnsureBins: invalid opt.fs: must be an object providing mkdirSync, lstatSync, statSync, realpathSync, openSync, closeSync, writeSync, readFileSync, createReadStream, createWriteStream, renameSync, unlinkSync, rmSync'])
        })

    })

})
