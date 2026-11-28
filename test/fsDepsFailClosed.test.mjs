/* eslint-disable no-new-wrappers */ //本檔刻意以包裝物件(new String)作為無效輸入
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { pathToFileURL } from 'url'
import execCliCore from '../src/execCliCore.mjs'
import fsCleanFolderCore from '../src/fsCleanFolderCore.mjs'
import fsCopyFileCore from '../src/fsCopyFileCore.mjs'
import fsCopyFolderCore from '../src/fsCopyFolderCore.mjs'
import fsCreateFileCore from '../src/fsCreateFileCore.mjs'
import fsCreateFolderCore from '../src/fsCreateFolderCore.mjs'
import fsDeleteFileCore from '../src/fsDeleteFileCore.mjs'
import fsDeleteFileSafeCore from '../src/fsDeleteFileSafeCore.mjs'
import fsDeleteFolderCore from '../src/fsDeleteFolderCore.mjs'
import fsDeleteFolderSafeCore from '../src/fsDeleteFolderSafeCore.mjs'
import fsDownloadFileCore from '../src/fsDownloadFileCore.mjs'
import fsDownloadFileVerifyCore from '../src/fsDownloadFileVerifyCore.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'
import fsExistsCore from '../src/fsExistsCore.mjs'
import fsGetFileBasicHashCore from '../src/fsGetFileBasicHashCore.mjs'
import fsGetFileHashCore from '../src/fsGetFileHashCore.mjs'
import fsGetFileXxHashCore from '../src/fsGetFileXxHashCore.mjs'
import fsGetFilesInFolderCore from '../src/fsGetFilesInFolderCore.mjs'
import fsGetFilesWithHashInFolderCore from '../src/fsGetFilesWithHashInFolderCore.mjs'
import fsGetFolderBasicHashCore from '../src/fsGetFolderBasicHashCore.mjs'
import fsGetFoldersInFolderCore from '../src/fsGetFoldersInFolderCore.mjs'
import fsIsFileCore from '../src/fsIsFileCore.mjs'
import fsIsFolderCore from '../src/fsIsFolderCore.mjs'
import fsMergeFilesCore from '../src/fsMergeFilesCore.mjs'
import fsReadTextCore from '../src/fsReadTextCore.mjs'
import fsRenameFileCore from '../src/fsRenameFileCore.mjs'
import fsRenameFolderCore from '../src/fsRenameFolderCore.mjs'
import fsSyncFolderCore from '../src/fsSyncFolderCore.mjs'
import fsTreeFolderCore from '../src/fsTreeFolderCore.mjs'
import fsTreeFolderWithHashCore from '../src/fsTreeFolderWithHashCore.mjs'
import fsWriteTextAtomicCore from '../src/fsWriteTextAtomicCore.mjs'
import fsWriteTextCore from '../src/fsWriteTextCore.mjs'
import fsExists from '../src/fsExists.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsDeleteFileSafe from '../src/fsDeleteFileSafe.mjs'
import fsDeleteFolderSafe from '../src/fsDeleteFolderSafe.mjs'
import fsDownloadFile from '../src/fsDownloadFile.mjs'
import fsDownloadFileVerify from '../src/fsDownloadFileVerify.mjs'
import fsEnsureBins from '../src/fsEnsureBins.mjs'
import fsGetBinManifestEntry from '../src/fsGetBinManifestEntry.mjs'
import fsTask from '../src/fsTask.mjs'
import { traceRec } from './tools/timeKit.mjs'


//R-FS-DEPS-01(排程第492項第2批 ws492c; W-02、W-10、W-18與N-A之fs函數; 輸入規格 K2、K3、P4、V17、V19、V20、C12、S4、R-FS-INVALID-PATH-01):
//  ①各fs*Core不自行匯入fs、path、crypto、stream, 缺注入鍵(未給、null、缺方法)須依其家族通道fail-closed(不得回成功、不得動檔案、訊息'invalid opt.<名>: must be …'不帶值)
//  ②判斷類(fsIsFile、fsIsFolder、fsExists及Core)收非字串路徑(Buffer、Uint8Array、URL、包裝String)一律false
//  ③對外函數之注入鍵給undefined取Node內建, null與缺方法者reject
//  ④N-A之入口檢測: 檢測先於副作用, 訊息依V19且不帶值
describe(`fs deps fail-closed (R-FS-DEPS-01)`, function() {

    let fd = path.resolve('./test/_tmp/fsDepsFailClosed')
    let R = (p) => `${fd}/${p}`

    //real, 全部注入鍵齊全之真實相依
    let real = { fs, path, crypto, Readable, pipeline }

    //snap, 夾具快照(路徑、型別、大小、內容), 供斷言無任何增刪改
    let snap = () => {
        let rs = []
        let walk = (d) => {
            for (let n of fs.readdirSync(d).sort()) {
                let p = `${d}/${n}`
                let s = fs.lstatSync(p)
                if (s.isDirectory()) {
                    rs.push(`${p.slice(fd.length)}/`)
                    walk(p)
                }
                else {
                    rs.push(`${p.slice(fd.length)}:${s.size}:${fs.readFileSync(p, 'utf8')}`)
                }
            }
        }
        walk(fd)
        return rs.join('|')
    }

    //reset, 重建夾具: a.txt、b.txt、d/(x.txt、sub/y.txt)、dst/、m.part1、m.part2
    let reset = () => {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(`${fd}/d/sub`, { recursive: true })
        fs.mkdirSync(`${fd}/dst`, { recursive: true })
        fs.writeFileSync(R('a.txt'), 'hello')
        fs.writeFileSync(R('b.txt'), 'world')
        fs.writeFileSync(R('d/x.txt'), 'xx')
        fs.writeFileSync(R('d/sub/y.txt'), 'yy')
        fs.writeFileSync(R('m.part1'), '1')
        fs.writeFileSync(R('m.part2'), '2')
        fs.writeFileSync(R('dst/old.txt'), 'old') //同步目標內多出之檔(缺方法時不得被先刪)
        fs.mkdirSync(R('e')) //空資料夾(無檔可雜湊, 驗相依檢查不因「無檔」而略過)
    }

    before(function() {
        reset()
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
    })

    //run, 依通道執行並正規化結果: env(同步結果物件)、rej(Promise reject)、thr(同步拋出)、envP(Promise resolve結果物件)
    let run = async (ch, f) => {
        try {
            let r = f()
            if (ch === 'rej' || ch === 'envP') {
                assert.ok(r && typeof r.then === 'function', 'must return a promise')
                try {
                    return { kind: ch === 'envP' ? 'resolve' : 'resolve', v: await r }
                }
                catch (e) {
                    return { kind: 'reject', v: e }
                }
            }
            return { kind: 'return', v: r }
        }
        catch (e) {
            return { kind: 'throw', v: e }
        }
    }

    //msgOf, 取錯誤訊息字串(字串、Error、{ error })
    let msgOf = (x) => {
        if (typeof x === 'string') {
            return x
        }
        if (x instanceof Error) {
            return x.message
        }
        if (x && x.error !== undefined) {
            return msgOf(x.error)
        }
        return String(x)
    }

    //======== A. 各Core於缺注入鍵時依家族通道fail-closed(W-02) ========

    //cores: [名稱, 函數, 引數(夾具內之有效輸入), 通道, 完整注入(opt)]
    //  通道: env=同步回{ error }; envP=回Promise(resolve { error }); rej=Promise reject; thr=同步拋出; bool=判斷類同步拋出(不回false)
    let cores = [
        ['fsCleanFolderCore', fsCleanFolderCore, [R('d')], 'env', real],
        ['fsCopyFileCore', fsCopyFileCore, [R('a.txt'), R('dst/a2.txt')], 'env', real],
        ['fsCopyFileCore(useSync=false)', fsCopyFileCore, [R('a.txt'), R('dst/a3.txt')], 'envP', { ...real, useSync: false }],
        ['fsCopyFolderCore', fsCopyFolderCore, [R('d'), R('dst/d2')], 'env', real],
        ['fsCopyFolderCore(useSync=false)', fsCopyFolderCore, [R('d'), R('dst/d3')], 'envP', { ...real, useSync: false }],
        ['fsCreateFileCore', fsCreateFileCore, [R('new1/new.txt'), 'abc'], 'env', real],
        ['fsCreateFolderCore', fsCreateFolderCore, [R('newd/n2')], 'env', real],
        ['fsDeleteFileCore', fsDeleteFileCore, [R('a.txt')], 'env', real],
        ['fsDeleteFolderCore', fsDeleteFolderCore, [R('d')], 'env', real],
        ['fsDeleteFileSafeCore', fsDeleteFileSafeCore, [R('a.txt')], 'rej', real],
        ['fsDeleteFolderSafeCore', fsDeleteFolderSafeCore, [R('d')], 'rej', real],
        ['fsExistsCore', fsExistsCore, [R('a.txt')], 'bool', real],
        ['fsIsFileCore', fsIsFileCore, [R('a.txt')], 'bool', real],
        ['fsIsFolderCore', fsIsFolderCore, [R('d')], 'bool', real],
        ['fsGetFileBasicHashCore', fsGetFileBasicHashCore, [R('a.txt')], 'rej', real],
        ['fsGetFileHashCore', fsGetFileHashCore, [R('a.txt')], 'rej', real],
        ['fsGetFileXxHashCore', fsGetFileXxHashCore, [R('a.txt')], 'rej', real],
        ['fsGetFilesInFolderCore', fsGetFilesInFolderCore, [R('d')], 'thr', real], //第2參數即opt(R-LEVEL-LIMIT-02)
        ['fsGetFoldersInFolderCore', fsGetFoldersInFolderCore, [R('d')], 'thr', real],
        ['fsTreeFolderCore', fsTreeFolderCore, [R('d')], 'thr', real],
        ['fsGetFilesWithHashInFolderCore', fsGetFilesWithHashInFolderCore, [R('d')], 'rej', real],
        ['fsGetFolderBasicHashCore', fsGetFolderBasicHashCore, [R('d')], 'rej', real],
        ['fsTreeFolderWithHashCore', fsTreeFolderWithHashCore, [R('d')], 'rej', real],
        ['fsMergeFilesCore', fsMergeFilesCore, [[R('m.part1'), R('m.part2')], R('merged.txt')], 'rej', real],
        ['fsReadTextCore', fsReadTextCore, [R('a.txt')], 'env', real],
        ['fsRenameFileCore', fsRenameFileCore, [R('a.txt'), R('ren/a-r.txt')], 'env', real],
        ['fsRenameFolderCore', fsRenameFolderCore, [R('d'), R('ren2/d-r')], 'env', real],
        ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst/sync')], 'rej', real],
        ['fsWriteTextAtomicCore', fsWriteTextAtomicCore, [R('w1/w.txt'), 'abc'], 'env', real],
        ['fsWriteTextCore', fsWriteTextCore, [R('w2/w.txt'), 'abc'], 'env', real],
        ['fsDownloadFileCore', fsDownloadFileCore, ['http://127.0.0.1:1/x', R('dl/dl.bin')], 'rej', real],
    ]

    //optsOf, 缺注入鍵之各種給法(未給opt、空opt、fs為null、fs為空物件); 其餘注入鍵(path、crypto等)皆給齊, 只缺fs
    let missCases = [
        ['noopt', () => undefined],
        ['{}', () => ({})],
        ['{fs:null}', (full) => ({ ...full, fs: null })],
        ['{fs:{}}', (full) => ({ ...full, fs: {} })],
        ['{fs:undefined}', (full) => ({ ...full, fs: undefined })],
    ]

    describe(`缺opt.fs: 依家族通道fail-closed, 不回成功, 不動檔案`, function() {

        it(`站點完整性: src/fs*Core.mjs 全數列入本表(或為另行測試之fsDownloadFileVerifyCore、fsEnsureBinsCore), 新增Core而未列入即紅`, function() {
            let files = fs.readdirSync('./src').filter((n) => /^fs.*Core\.mjs$/.test(n)).map((n) => n.replace('.mjs', ''))
            let covered = new Set([...cores.map((c) => c[0].replace(/\(.*\)$/, '')), 'fsDownloadFileVerifyCore', 'fsEnsureBinsCore'])
            assert.deepStrictEqual(files.filter((n) => !covered.has(n)), [])
            assert.strictEqual(files.length, 31, 'R-FS-DEPS-01站點全集為31個fs*Core')
        })

        for (let [name, f, args, ch, full] of cores) {

            //useSync=false者(回Promise)之未給opt/空opt會走同步預設, 改以僅帶useSync旗標(不帶fs)代之
            let cs = ch === 'envP' ? [['{useSync:false}', () => ({ useSync: false })], ...missCases.slice(2)] : missCases
            for (let [lab, mk] of cs) {
                it(`${name} ${lab}`, async function() {
                    this.timeout(30000)
                    reset()
                    let before = snap()
                    let o = mk(full)
                    let call = () => (o === undefined ? f(...args) : f(...args, o))
                    let r = await run(ch === 'env' || ch === 'bool' || ch === 'thr' ? (ch === 'env' ? 'env' : ch) : ch, call)

                    //依通道: 不得有success、不得回布林(判斷類)、訊息不帶值
                    if (ch === 'env') {
                        assert.strictEqual(r.kind, 'return')
                        assert.ok(r.v && r.v.error, `${name}: must return { error }`)
                        assert.strictEqual(r.v.success, undefined, `${name}: must not report success`)
                    }
                    else if (ch === 'envP') {
                        assert.strictEqual(r.kind, 'resolve')
                        assert.ok(r.v && r.v.error, `${name}: must resolve { error }`)
                        assert.strictEqual(r.v.success, undefined)
                    }
                    else if (ch === 'rej') {
                        assert.strictEqual(r.kind, 'reject', `${name}: must reject, got ${r.kind}`)
                    }
                    else {
                        assert.strictEqual(r.kind, 'throw', `${name}: must throw, got ${r.kind}`)
                    }
                    let msg = msgOf(r.kind === 'reject' || r.kind === 'throw' ? r.v : r.v)

                    //R-FS-DEPS-01訊息: 新增檢測者以'invalid opt.fs: must be …'起頭, 既有之Safe/Verify/Ensure維持其原訊息, 皆不帶輸入值(fd路徑)
                    if (!/^(fsDeleteFileSafeCore|fsDeleteFolderSafeCore)$/.test(name)) {
                        assert.ok(msg.startsWith('invalid opt.fs: must be an object providing '), `${name}: message was ${msg}`)
                    }
                    assert.ok(!msg.includes(fd), `${name}: message must not echo the path`)
                    assert.strictEqual(snap(), before, `${name}: fixture must not change`)
                })
            }
        }
    })

    //======== A1b. 缺必要之「主操作方法」(fs 其餘方法齊全, 只少一個): 依通道fail-closed, 訊息列出方法清單 ========
    describe(`缺必要之主操作方法(opt.fs齊全, 只少一個方法)`, function() {

        let wrap3 = (f) => (a, b, c) => f(a, { ...c, levelLimit: 2 }) //列舉類: (fd, opt), opt.levelLimit與注入相依同在opt(R-LEVEL-LIMIT-02)
        let opMiss = [
            ['fsCreateFolderCore', fsCreateFolderCore, [R('newd/n2')], 'env', 'mkdirSync'],
            ['fsCreateFileCore', fsCreateFileCore, [R('new1/new.txt'), 'abc'], 'env', 'writeFileSync'],
            ['fsWriteTextCore', fsWriteTextCore, [R('w2/w.txt'), 'abc'], 'env', 'writeFileSync'],
            ['fsRenameFileCore', fsRenameFileCore, [R('a.txt'), R('ren/a-r.txt')], 'env', 'renameSync'],
            ['fsRenameFolderCore', fsRenameFolderCore, [R('d'), R('ren2/d-r')], 'env', 'renameSync'],
            ['fsDeleteFileCore', fsDeleteFileCore, [R('a.txt')], 'env', 'unlinkSync'],
            ['fsDeleteFolderCore', fsDeleteFolderCore, [R('d')], 'env', 'rmSync'],
            ['fsReadTextCore', fsReadTextCore, [R('a.txt')], 'env', 'readFileSync'],
            ['fsCleanFolderCore', fsCleanFolderCore, [R('d')], 'env', 'readdirSync'],
            ['fsCopyFileCore', fsCopyFileCore, [R('a.txt'), R('dst/a2.txt')], 'env', 'copyFileSync'],
            ['fsCopyFolderCore', fsCopyFolderCore, [R('d'), R('dst/d2')], 'env', 'readdirSync'],
            ['fsCopyFolderCore', fsCopyFolderCore, [R('d'), R('dst/d2')], 'env', 'copyFileSync'], //僅來源深層有檔時, 缺方法不得回成功
            ['fsDownloadFileCore', fsDownloadFileCore, ['http://127.0.0.1:1/x', R('dl/dl.bin')], 'rej', 'renameSync'],
            ['fsTreeFolderCore', wrap3(fsTreeFolderCore), [R('d'), 0], 'thr', 'readdirSync'],
            ['fsGetFilesWithHashInFolderCore', wrap3(fsGetFilesWithHashInFolderCore), [R('d'), 0], 'rej', 'readdirSync'],
            ['fsGetFolderBasicHashCore', fsGetFolderBasicHashCore, [R('d')], 'rej', 'readdirSync'],
            ['fsTreeFolderWithHashCore', wrap3(fsTreeFolderWithHashCore), [R('d'), 0], 'rej', 'readdirSync'],
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'readdirSync'], //目標已存在(含old.txt): 缺方法時不得先刪目標多出之項目
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'mkdirSync'],
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'createReadStream'],
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'createWriteStream'],
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'unlinkSync'],
            ['fsSyncFolderCore', fsSyncFolderCore, [R('d'), R('dst')], 'rej', 'rmSync'],
            ['fsMergeFilesCore', fsMergeFilesCore, [[R('m.part1'), R('m.part2')], R('a.txt')], 'rej', 'createReadStream'], //輸出檔已存在: 缺方法時不得先截斷
            ['fsMergeFilesCore', fsMergeFilesCore, [[R('m.part1'), R('m.part2')], R('a.txt')], 'rej', 'createWriteStream'],
            ['fsMergeFilesCore', fsMergeFilesCore, [[R('m.part1'), R('m.part2')], R('merged.txt')], 'rej', 'unlinkSync'], //缺切片刪除方法時不得合併後回成功而切片仍在
            ['fsCleanFolderCore', fsCleanFolderCore, [R('d')], 'env', 'rmSync'], //含子資料夾: 缺方法時不得先刪其他項目
            ['fsCleanFolderCore', fsCleanFolderCore, [R('d')], 'env', 'unlinkSync'],
            ['fsCopyFolderCore(useSync=false)', fsCopyFolderCore, [R('d'), R('dst/d3')], 'envP', 'createReadStream', { useSync: false }],
            ['fsCopyFolderCore(useSync=false)', fsCopyFolderCore, [R('d'), R('dst/d3')], 'envP', 'createWriteStream', { useSync: false }],
            ['fsCopyFileCore(useSync=false)', fsCopyFileCore, [R('a.txt'), R('dst/a3.txt')], 'envP', 'createReadStream', { useSync: false }],
            ['fsCopyFileCore(useSync=false)', fsCopyFileCore, [R('a.txt'), R('dst/a3.txt')], 'envP', 'createWriteStream', { useSync: false }],
            ['fsDownloadFileCore', fsDownloadFileCore, ['http://127.0.0.1:1/x', R('dl/dl.bin')], 'rej', 'createWriteStream'],
            ['fsWriteTextAtomicCore', fsWriteTextAtomicCore, [R('w1/w.txt'), 'abc'], 'env', 'mkdirSync'],
            ['fsWriteTextAtomicCore', fsWriteTextAtomicCore, [R('w1/w.txt'), 'abc'], 'env', 'writeFileSync'],
            ['fsWriteTextAtomicCore', fsWriteTextAtomicCore, [R('w1/w.txt'), 'abc'], 'env', 'renameSync'],
            ['fsWriteTextAtomicCore', fsWriteTextAtomicCore, [R('w1/w.txt'), 'abc'], 'env', 'unlinkSync'],
        ]
        for (let [name, f, args, ch, method, extra] of opMiss) {
            it(`${name} 缺${method}: fail-closed, 訊息列出${method}, 不動檔案`, async function() {
                reset()
                let before = snap()
                let r = await run(ch, () => f(...args, { ...real, ...extra, fs: { ...fs, [method]: undefined } }))
                assert.strictEqual(r.kind, ch === 'env' ? 'return' : ch === 'envP' ? 'resolve' : ch === 'rej' ? 'reject' : 'throw')
                let msg = msgOf(r.v)
                assert.ok(msg.startsWith('invalid opt.fs: must be an object providing ') && msg.includes(method), `${name}: ${msg}`)
                if (ch === 'env' || ch === 'envP') {
                    assert.strictEqual(r.v.success, undefined)
                }
                assert.strictEqual(snap(), before)
            })
        }

        it(`fsSyncFolderCore path.sep為空字串或非字串: reject(原使刪除目標之解析結果可離開目標資料夾)`, async function() {
            reset()
            let before = snap()
            for (let sep of ['', undefined, null, 5]) {
                let p2 = { resolve: path.resolve, dirname: path.dirname, join: path.join, basename: path.basename, relative: path.relative, isAbsolute: path.isAbsolute, sep }
                let m = await fsSyncFolderCore(R('d'), R('dst'), { ...real, path: p2 }).then(() => 'resolved', (e) => e)
                assert.strictEqual(m, 'invalid opt.path: must be an object providing resolve, dirname, join, basename, relative, isAbsolute, sep')
            }
            assert.strictEqual(snap(), before)
        })

        it(`fsCopyFolderCore 同步複製: 深層檔案複製失敗須向上傳遞(原回成功), 缺copyFileSync亦然`, function() {
            reset()
            let fsx = {
                ...fs,
                copyFileSync: (s, d) => {
                    if (s.endsWith('y.txt')) {
                        throw new Error('EIO')
                    }
                    return fs.copyFileSync(s, d)
                }
            }
            let r = fsCopyFolderCore(R('d'), R('dst/d9'), { ...real, fs: fsx })
            assert.strictEqual(r.success, undefined)
            assert.ok(r.error && String(r.error).includes('EIO'))
            assert.ok(!fs.existsSync(R('dst/d9/sub/y.txt')))
            let r2 = fsCopyFolderCore(R('d'), R('dst/d10'), real)
            assert.ok(r2.success)
            assert.strictEqual(fs.readFileSync(R('dst/d10/sub/y.txt'), 'utf8'), 'yy')
        })

        it(`判斷類缺lstatSync(statSync仍在): 拋出且訊息為'statSync, lstatSync'; fsExistsCore只需statSync`, function() {
            let fsx = { statSync: fs.statSync }
            assert.throws(() => fsIsFolderCore(R('d'), { fs: fsx }), /^Error: invalid opt\.fs: must be an object providing statSync, lstatSync$/)
            assert.throws(() => fsIsFileCore(R('a.txt'), { fs: fsx }), /^Error: invalid opt\.fs: must be an object providing statSync, lstatSync$/)
            assert.strictEqual(fsExistsCore(R('a.txt'), { fs: fsx }), true)
        })

        it(`檔案雜湊類缺lstatSync(statSync仍在): reject純說明字串(無'Error: '前綴), 清單為'statSync, lstatSync'`, async function() {
            reset()
            let m = 'invalid opt.fs: must be an object providing statSync, lstatSync'
            let o = { ...real, fs: { statSync: fs.statSync } }
            let pick = (p) => p.then(() => 'resolved', (e) => e)
            assert.strictEqual(await pick(fsGetFileHashCore(R('a.txt'), o)), m)
            assert.strictEqual(await pick(fsGetFileBasicHashCore(R('a.txt'), o)), m)
            assert.strictEqual(await pick(fsGetFileXxHashCore(R('a.txt'), o)), m)
        })

        it(`相依缺漏不因「無檔可處理」而略過: 空資料夾缺crypto仍reject(雜湊類)`, async function() {
            reset()
            let m = 'invalid opt.crypto: must be an object providing createHash'
            let pick = (p) => p.then(() => 'resolved', (e) => e)
            assert.strictEqual(await pick(fsGetFilesWithHashInFolderCore(R('e'), { fs, path, levelLimit: 1 })), m)
            assert.strictEqual(await pick(fsGetFolderBasicHashCore(R('e'), { fs, path })), m)
            assert.strictEqual(await pick(fsTreeFolderWithHashCore(R('e'), { fs, path, levelLimit: 1 })), m)
            assert.strictEqual(await pick(fsSyncFolderCore(R('e'), R('dst/sync-e'), { fs, path })), m)
        })
    })

    //======== A2. 缺其他注入鍵(path、crypto、Readable、pipeline)時同樣fail-closed ========
    describe(`缺opt.path、opt.crypto、opt.Readable、opt.pipeline`, function() {

        let cases = [
            ['fsCleanFolderCore path', 'env', () => fsCleanFolderCore(R('d'), { fs }), 'invalid opt.path: must be an object providing join'],
            ['fsCopyFileCore path', 'env', () => fsCopyFileCore(R('a.txt'), R('dst/a2.txt'), { fs }), 'invalid opt.path: must be an object providing dirname'],
            ['fsCopyFolderCore path', 'env', () => fsCopyFolderCore(R('d'), R('dst/d2'), { fs }), 'invalid opt.path: must be an object providing dirname, resolve'],
            ['fsCopyFolderCore path(useSync=false)', 'envP', () => fsCopyFolderCore(R('d'), R('dst/d2'), { fs, useSync: false }), 'invalid opt.path: must be an object providing dirname, join'],
            ['fsTreeFolderCore path', 'thr', () => fsTreeFolderCore(R('d'), { fs, levelLimit: 1 }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsGetFilesInFolderCore path', 'thr', () => fsGetFilesInFolderCore(R('d'), { fs, levelLimit: 1 }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsGetFoldersInFolderCore path', 'thr', () => fsGetFoldersInFolderCore(R('d'), { fs, levelLimit: 1 }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsGetFilesWithHashInFolderCore path', 'rej', () => fsGetFilesWithHashInFolderCore(R('d'), { fs, crypto, levelLimit: 1 }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsGetFolderBasicHashCore path', 'rej', () => fsGetFolderBasicHashCore(R('d'), { fs, crypto }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsTreeFolderWithHashCore path', 'rej', () => fsTreeFolderWithHashCore(R('d'), { fs, crypto, levelLimit: 1 }), 'invalid opt.path: must be an object providing resolve, basename'],
            ['fsSyncFolderCore path', 'rej', () => fsSyncFolderCore(R('d'), R('dst/sync'), { fs, crypto }), 'invalid opt.path: must be an object providing resolve, dirname, join, basename, relative, isAbsolute, sep'],
            ['fsSyncFolderCore crypto', 'rej', () => fsSyncFolderCore(R('d'), R('dst/sync'), { fs, path }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsGetFileBasicHashCore crypto', 'rej', () => fsGetFileBasicHashCore(R('a.txt'), { fs }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsGetFileHashCore crypto(sha512)', 'rej', () => fsGetFileHashCore(R('a.txt'), { fs }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsGetFilesWithHashInFolderCore crypto', 'rej', () => fsGetFilesWithHashInFolderCore(R('d'), { fs, path, levelLimit: 1 }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsGetFolderBasicHashCore crypto', 'rej', () => fsGetFolderBasicHashCore(R('d'), { fs, path }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsTreeFolderWithHashCore crypto', 'rej', () => fsTreeFolderWithHashCore(R('d'), { fs, path, levelLimit: 1 }), 'invalid opt.crypto: must be an object providing createHash'],
            ['fsDownloadFileCore Readable', 'rej', () => fsDownloadFileCore('http://127.0.0.1:1/x', R('dl/dl.bin'), { fs, pipeline }), 'invalid opt.Readable: must be an object providing fromWeb'],
            ['fsDownloadFileCore pipeline', 'rej', () => fsDownloadFileCore('http://127.0.0.1:1/x', R('dl/dl.bin'), { fs, Readable }), 'invalid opt.pipeline: must be a function'],
            ['fsDownloadFileCore pipeline非函數', 'rej', () => fsDownloadFileCore('http://127.0.0.1:1/x', R('dl/dl.bin'), { fs, Readable, pipeline: {} }), 'invalid opt.pipeline: must be a function'],
        ]
        for (let [name, ch, f, exp] of cases) {
            it(name, async function() {
                reset()
                let before = snap()
                let r = await run(ch, f)
                assert.strictEqual(r.kind, ch === 'env' ? 'return' : ch === 'envP' ? 'resolve' : ch === 'rej' ? 'reject' : 'throw')
                assert.strictEqual(msgOf(r.v), exp)
                if (ch === 'env' || ch === 'envP') {
                    assert.strictEqual(r.v.success, undefined)
                }
                assert.strictEqual(snap(), before)
            })
        }

        it(`fsGetFileHashCore type為xxhash64時不需crypto`, async function() {
            reset()
            let h = await fsGetFileHashCore(R('a.txt'), { fs, type: 'xxhash64' })
            assert.ok(/^[0-9a-f]{16}$/.test(h))
        })

        it(`fsGetFilesWithHashInFolderCore type為xxhash64時不需crypto`, async function() {
            reset()
            let rs = await fsGetFilesWithHashInFolderCore(R('d'), { fs, path, type: 'xxhash64', levelLimit: 1 })
            assert.strictEqual(rs.length, 1)
            assert.ok(/^[0-9a-f]{16}$/.test(rs[0].hash))
        })
    })

    //======== A3. W-02 假成功: fsDeleteFileCore、fsDeleteFolderCore ========
    describe(`fsDeleteFileCore、fsDeleteFolderCore未傳fs不得回成功(原回'does not exist'之假成功且檔案仍在)`, function() {

        it(`fsDeleteFileCore 對存在之檔未傳fs: 回{ error }, 檔案仍在; 傳fs才刪除`, function() {
            reset()
            let r = fsDeleteFileCore(R('a.txt'))
            assert.strictEqual(r.success, undefined)
            assert.strictEqual(r.error, 'invalid opt.fs: must be an object providing statSync, lstatSync, unlinkSync')
            assert.ok(fs.existsSync(R('a.txt')))
            let r2 = fsDeleteFileCore(R('a.txt'), { fs })
            assert.ok(String(r2.success).startsWith('done: '))
            assert.ok(!fs.existsSync(R('a.txt')))
        })

        it(`fsDeleteFolderCore 對存在之資料夾未傳fs: 回{ error }, 資料夾仍在; 傳fs才刪除`, function() {
            reset()
            let r = fsDeleteFolderCore(R('d'))
            assert.strictEqual(r.success, undefined)
            assert.strictEqual(r.error, 'invalid opt.fs: must be an object providing statSync, lstatSync, rmSync')
            assert.ok(fs.existsSync(R('d/x.txt')))
            let r2 = fsDeleteFolderCore(R('d'), { fs })
            assert.ok(String(r2.success).startsWith('done: '))
            assert.ok(!fs.existsSync(R('d')))
        })

        it(`無效路徑仍先於相依檢查回報路徑錯誤(不帶值)`, function() {
            assert.strictEqual(fsDeleteFileCore(null).error, 'invalid fp: must be a non-empty string')
            assert.strictEqual(fsDeleteFolderCore('').error, 'invalid fd: must be a non-empty string')
        })

        it(`真實不存在之路徑傳齊fs: 仍為'does not exist'成功(無效與不存在分開)`, function() {
            reset()
            assert.strictEqual(fsDeleteFileCore(R('nope.txt'), { fs }).success, `file does not exist: ${R('nope.txt')}`)
            assert.strictEqual(fsDeleteFolderCore(R('nope'), { fs }).success, `folder does not exist: ${R('nope')}`)
        })
    })

    //======== A4. execCliCore.buildSpawnEnv: envExtra非一般物件視為未給 ========
    describe(`execCliCore.buildSpawnEnv`, function() {
        let { buildSpawnEnv } = execCliCore
        let base = () => buildSpawnEnv()

        it(`非一般物件(null、字串、數字、陣列、布林、函數)視為未給, 不拋錯, 不展開為環境變數鍵`, function() {
            let b = base()
            for (let v of [null, 'abc', 5, ['x', 'y'], true, () => 1, NaN]) {
                let e = buildSpawnEnv(v)
                assert.deepStrictEqual(Object.keys(e).sort(), Object.keys(b).sort())
                assert.strictEqual(e['0'], undefined)
                assert.strictEqual(e.PYTHONIOENCODING, 'utf-8')
            }
        })

        it(`一般物件仍併入(同名以envExtra為準), 值為undefined移除該變數`, function() {
            let e = buildSpawnEnv({ WSEMI_T492C: 'v1', PYTHONIOENCODING: 'big5' })
            assert.strictEqual(e.WSEMI_T492C, 'v1')
            assert.strictEqual(e.PYTHONIOENCODING, 'big5')
            let k = Object.keys(process.env)[0]
            assert.strictEqual(Object.prototype.hasOwnProperty.call(buildSpawnEnv({ [k]: undefined }), k) && buildSpawnEnv({ [k]: undefined })[k] !== undefined, false)
        })

        it(`Object.create(null)之物件亦為一般物件`, function() {
            let o = Object.create(null)
            o.WSEMI_T492C = 'v2'
            assert.strictEqual(buildSpawnEnv(o).WSEMI_T492C, 'v2')
        })
    })

    //======== B. W-18 判斷類路徑非字串一律false ========
    describe(`判斷類fs函數收非字串路徑(Buffer、Uint8Array、URL、包裝String)一律false`, function() {

        let nonStr = () => {
            let p = path.resolve(R('a.txt'))
            let d = path.resolve(R('d'))
            return [
                ['Buffer(檔)', Buffer.from(p), 'file'],
                ['Uint8Array(檔)', new Uint8Array(Buffer.from(p)), 'file'],
                ['URL(檔)', pathToFileURL(p), 'file'],
                ['new String(檔)', new String(p), 'file'],
                ['Buffer(夾)', Buffer.from(d), 'folder'],
                ['Uint8Array(夾)', new Uint8Array(Buffer.from(d)), 'folder'],
                ['URL(夾)', pathToFileURL(d), 'folder'],
                ['new String(夾)', new String(d), 'folder'],
            ]
        }
        let fns = [
            ['fsExists', (v) => fsExists(v)],
            ['fsIsFile', (v) => fsIsFile(v)],
            ['fsIsFolder', (v) => fsIsFolder(v)],
            ['fsExistsCore', (v) => fsExistsCore(v, { fs })],
            ['fsIsFileCore', (v) => fsIsFileCore(v, { fs })],
            ['fsIsFolderCore', (v) => fsIsFolderCore(v, { fs })],
        ]

        for (let [fname, f] of fns) {
            it(`${fname}: 非字串路徑回false(即使路徑指向存在之檔或夾)`, function() {
                reset()
                for (let [lab, v] of nonStr()) {
                    assert.strictEqual(f(v), false, `${fname}(${lab}) must be false`)
                }
            })
        }

        it(`對照: 同一路徑以字串給仍為true(無效與存在分開)`, function() {
            reset()
            let p = path.resolve(R('a.txt'))
            let d = path.resolve(R('d'))
            assert.strictEqual(fsExists(p), true)
            assert.strictEqual(fsExists(d), true)
            assert.strictEqual(fsIsFile(p), true)
            assert.strictEqual(fsIsFile(d), false)
            assert.strictEqual(fsIsFolder(d), true)
            assert.strictEqual(fsIsFolder(p), false)
            assert.strictEqual(fsExistsCore(p, { fs }), true)
            assert.strictEqual(fsIsFileCore(p, { fs }), true)
            assert.strictEqual(fsIsFolderCore(d, { fs }), true)
        })

        it(`空字串、含NUL、其他非字串仍為false`, function() {
            for (let v of ['', 'a\0b', null, undefined, 0, 5, {}, [], true, () => 1, Symbol('x')]) {
                assert.strictEqual(fsExists(v), false)
                assert.strictEqual(fsIsFile(v), false)
                assert.strictEqual(fsIsFolder(v), false)
                assert.strictEqual(fsExistsCore(v), false, 'invalid path is false even without fs')
                assert.strictEqual(fsIsFileCore(v), false)
                assert.strictEqual(fsIsFolderCore(v), false)
            }
        })

        it(`不存在之字串路徑為false且有注入fs缺漏時仍拋錯(相依無效不被當成不存在)`, function() {
            assert.strictEqual(fsExistsCore(R('nope.txt'), { fs }), false)
            assert.throws(() => fsExistsCore(R('a.txt'), {}), /^Error: invalid opt\.fs: must be an object providing statSync$/)
            assert.throws(() => fsIsFileCore(R('a.txt'), { fs: { statSync: fs.statSync } }), /^Error: invalid opt\.fs: must be an object providing statSync, lstatSync$/)
        })
    })

    //======== C. W-10 對外函數之注入鍵undefined取預設, null與缺方法者reject ========
    describe(`對外函數注入鍵給undefined取Node內建, null與缺方法者reject`, function() {

        it(`fsDeleteFileSafe {fs:undefined}: 取預設fs, 實際刪除`, async function() {
            reset()
            let r = await fsDeleteFileSafe(R('a.txt'), { fs: undefined })
            assert.ok(String(r).startsWith('done: '), String(r))
            assert.ok(!fs.existsSync(R('a.txt')))
        })

        it(`fsDeleteFileSafe {fs:null}、{fs:{}}: reject, 不視為不存在, 檔案仍在`, async function() {
            reset()
            for (let o of [{ fs: null }, { fs: {} }]) {
                let m = await fsDeleteFileSafe(R('a.txt'), o).then(() => 'resolved', (e) => e)
                assert.ok(String(m).startsWith('invalid opt.fs: '), String(m))
                assert.ok(fs.existsSync(R('a.txt')))
            }
        })

        it(`fsDeleteFolderSafe {fs:undefined}: 取預設fs, 實際刪除`, async function() {
            reset()
            let r = await fsDeleteFolderSafe(R('d'), { fs: undefined })
            assert.ok(String(r).startsWith('done: '), String(r))
            assert.ok(!fs.existsSync(R('d')))
        })

        it(`fsDeleteFolderSafe {fs:null}: reject, 資料夾仍在`, async function() {
            reset()
            let m = await fsDeleteFolderSafe(R('d'), { fs: null }).then(() => 'resolved', (e) => e)
            assert.ok(String(m).startsWith('invalid opt.fs: '), String(m))
            assert.ok(fs.existsSync(R('d/x.txt')))
        })

        it(`fsDownloadFileVerify 四個注入鍵皆undefined: 取預設, 越過參數檢查(連線被拒而非E_ARG)`, async function() {
            this.timeout(30000)
            reset()
            let e = await fsDownloadFileVerify('http://127.0.0.1:1/x', R('v/v.bin'), { sha256: 'a'.repeat(64) }, { fs: undefined, crypto: undefined, Readable: undefined, pipeline: undefined, maxAttempts: 1 }).then(() => null, (err) => err)
            assert.ok(e instanceof Error)
            assert.notStrictEqual(e.code, 'E_ARG', e.message)
        })

        it(`fsDownloadFileVerify 注入鍵為null、缺方法: E_ARG(不下載)`, async function() {
            this.timeout(30000)
            reset()
            for (let o of [{ fs: null }, { crypto: null }, { Readable: null }, { pipeline: null }, { fs: {} }, { crypto: {} }, { Readable: {} }, { pipeline: {} }]) {
                let e = await fsDownloadFileVerify('http://127.0.0.1:1/x', R('v/v.bin'), { sha256: 'a'.repeat(64) }, { ...o, maxAttempts: 1 }).then(() => null, (err) => err)
                assert.ok(e instanceof Error)
                assert.strictEqual(e.code, 'E_ARG', `${Object.keys(o)[0]}: ${e.message}`)
            }
        })

        it(`Core本身無內建可取: fsDownloadFileVerifyCore 之注入鍵undefined為缺漏, E_ARG`, async function() {
            let e = await fsDownloadFileVerifyCore('http://127.0.0.1:1/x', R('v/v.bin'), { sha256: 'a'.repeat(64) }, { ...real, fs: undefined, maxAttempts: 1 }).then(() => null, (err) => err)
            assert.strictEqual(e.code, 'E_ARG')
        })

        it(`fsEnsureBinsCore 缺注入鍵: E_ARG(不回成功)`, async function() {
            let e = await fsEnsureBinsCore({ schemaVersion: 1, bins: [] }, { pkgRoot: fd }).then(() => null, (err) => err)
            assert.strictEqual(e.code, 'E_ARG')
        })
    })

    //======== D. N-A: 入口檢測先於副作用, 訊息依V19且不帶值 ========
    describe(`fsCreateFileCore data(檢測先於建立上層資料夾; null取預設)`, function() {

        it(`無效data: 回{ error: 'invalid data: …' }, 不建立上層資料夾, 不寫檔`, function() {
            reset()
            let before = snap()
            for (let v of [5, 0, true, false, {}, [], ['a'], () => 1, new String('x'), Symbol('s'), 1n, new ArrayBuffer(2), NaN]) {
                let r = fsCreateFileCore(R('newdir/sub/f.txt'), v, { fs })
                assert.strictEqual(r.error, 'invalid data: must be a string, Buffer, TypedArray or DataView', String(typeof v))
                assert.strictEqual(r.success, undefined)
                assert.ok(!fs.existsSync(R('newdir')), 'parent folder must not be created')
                assert.strictEqual(snap(), before)
            }
        })

        it(`null與undefined視為未給取預設'': 建立空檔`, function() {
            reset()
            assert.ok(fsCreateFileCore(R('n1/f1.txt'), null, { fs }).success)
            assert.ok(fsCreateFileCore(R('n1/f2.txt'), undefined, { fs }).success)
            assert.ok(fsCreateFileCore(R('n1/f3.txt'), '', { fs }).success)
            for (let n of ['f1', 'f2', 'f3']) {
                assert.strictEqual(fs.readFileSync(R(`n1/${n}.txt`), 'utf8'), '')
            }
        })

        it(`有效data(字串、Buffer、Uint8Array、DataView、Int16Array)照寫`, function() {
            reset()
            let vs = [['s', 'abc', 'abc'], ['b', Buffer.from('xyz'), 'xyz'], ['u', new Uint8Array([65, 66]), 'AB'], ['v', new DataView(new Uint8Array([67, 68]).buffer), 'CD'], ['i', new Int16Array([0x4241]), 'AB']]
            for (let [k, v, exp] of vs) {
                assert.ok(fsCreateFileCore(R(`ok/${k}.txt`), v, { fs }).success, k)
                assert.strictEqual(fs.readFileSync(R(`ok/${k}.txt`), 'utf8'), exp, k)
            }
        })

        it(`對外函數fsCreateFile同行為`, function() {
            reset()
            assert.strictEqual(fsCreateFile(R('cf/x.txt'), 7).error, 'invalid data: must be a string, Buffer, TypedArray or DataView')
            assert.ok(!fs.existsSync(R('cf')))
            assert.ok(fsCreateFile(R('cf/y.txt'), null).success)
            assert.strictEqual(fs.readFileSync(R('cf/y.txt'), 'utf8'), '')
        })
    })

    describe(`fsWriteText、fsWriteTextCore c須為字串(檢測先於建立上層資料夾)`, function() {

        it(`非字串c: 回{ error: 'invalid c: must be a string' }, 不建立上層資料夾, 不帶值`, function() {
            reset()
            let before = snap()
            for (let v of [undefined, null, 0, 5, true, {}, [], ['a'], () => 1, Buffer.from('abc'), new Uint8Array(2), new String('x'), Symbol('s'), 1n]) {
                for (let f of [(c) => fsWriteTextCore(R('wd/sub/f.txt'), c, { fs }), (c) => fsWriteText(R('wd/sub/f.txt'), c)]) {
                    let r = f(v)
                    assert.strictEqual(r.error, 'invalid c: must be a string')
                    assert.strictEqual(r.success, undefined)
                    assert.ok(!fs.existsSync(R('wd')), 'parent folder must not be created')
                    assert.strictEqual(snap(), before)
                }
            }
        })

        it(`字串c(含空字串)照寫; 路徑無效時先報路徑`, function() {
            reset()
            assert.strictEqual(fsWriteTextCore(R('wd/a.txt'), '', { fs }).success, R('wd/a.txt'))
            assert.strictEqual(fs.readFileSync(R('wd/a.txt'), 'utf8'), '')
            assert.strictEqual(fsWriteText(R('wd/b.txt'), '中文').success, R('wd/b.txt'))
            assert.strictEqual(fs.readFileSync(R('wd/b.txt'), 'utf8'), '中文')
            assert.strictEqual(fsWriteTextCore('', 5, { fs }).error, 'invalid fp: must be a non-empty string')
        })
    })

    describe(`fsDownloadFileCore 入口檢測(urlIn、fpOut; S4、R-FS-INVALID-PATH-01), 先於fetch與寫檔`, function() {

        let fetchCalls = 0
        let fetchOrg = globalThis.fetch

        beforeEach(function() {
            fetchCalls = 0
            globalThis.fetch = async () => {
                fetchCalls++
                return { ok: false, status: 404, statusText: 'nf', headers: { get: () => null }, body: { cancel: async () => {} } }
            }
        })

        afterEach(function() {
            globalThis.fetch = fetchOrg
        })

        let call = (u, p, o = real) => fsDownloadFileCore(u, p, o).then(() => 'resolved', (e) => e)

        it(`urlIn非空字串: 'invalid urlIn: must be a non-empty string'`, async function() {
            reset()
            let before = snap()
            for (let v of [undefined, null, '', '   ', 5, {}, [], true, () => 1, new String('http://127.0.0.1:1/x')]) {
                assert.strictEqual(await call(v, R('dl/a.bin')), 'invalid urlIn: must be a non-empty string')
            }
            assert.strictEqual(fetchCalls, 0)
            assert.strictEqual(snap(), before)
        })

        it(`urlIn非良構http或https網址: 'invalid urlIn: must be a valid http or https url', 不回顯值`, async function() {
            reset()
            let before = snap()
            for (let v of ['not a url', 'abc', '/a/b', 'ftp://127.0.0.1/x', 'file:///c:/x', 'javascript:alert(1)', 'http://']) {
                let m = await call(v, R('dl/a.bin'))
                assert.strictEqual(m, 'invalid urlIn: must be a valid http or https url', v)
            }
            assert.strictEqual(fetchCalls, 0)
            assert.strictEqual(snap(), before)
        })

        it(`urlIn帶帳密: 'invalid urlIn: must not contain credentials', 訊息不含帳密`, async function() {
            reset()
            let m = await call('http://user:SECRETPW@127.0.0.1:1/x', R('dl/a.bin'))
            assert.strictEqual(m, 'invalid urlIn: must not contain credentials')
            assert.ok(!m.includes('SECRETPW') && !m.includes('user'))
            let m2 = await call('https://onlyuser@127.0.0.1:1/x', R('dl/a.bin'))
            assert.strictEqual(m2, 'invalid urlIn: must not contain credentials')
            assert.strictEqual(fetchCalls, 0)
            assert.ok(!fs.existsSync(R('dl')))
        })

        it(`fpOut無效: 非字串、空字串、包裝String、含NUL分訊息, 不帶值, 先於fetch與建立資料夾`, async function() {
            reset()
            let before = snap()
            let u = 'http://127.0.0.1:1/x'
            for (let v of [undefined, null, '', 0, 5, {}, [], true, () => 1, new String('a.bin'), Buffer.from('a.bin')]) {
                assert.strictEqual(await call(u, v), 'invalid fpOut: must be a non-empty string')
            }
            assert.strictEqual(await call(u, R('dl/a\0b.bin')), 'invalid fpOut: must not contain a NUL character')
            assert.strictEqual(fetchCalls, 0)
            assert.strictEqual(snap(), before)
        })

        it(`有效輸入與完整相依: 越過檢測進入下載(fetch被呼叫一次), 失敗訊息為下載失敗(不以invalid起頭)`, async function() {
            reset()
            let m = await call('http://127.0.0.1:1/x', R('dl/a.bin'))
            assert.strictEqual(fetchCalls, 1)
            //第492項第3批(V20): 下載失敗之訊息為'failed to download: <原因>', 不帶網址與路徑
            assert.strictEqual(m, 'failed to download: status[404] nf')
            assert.ok(!String(m).startsWith('invalid '))
            assert.ok(!String(m).includes('127.0.0.1') && !String(m).includes('a.bin'), String(m))
        })

        it(`fsDownloadFile對外函數同行為`, async function() {
            reset()
            let m = await fsDownloadFile('http://u:p@127.0.0.1:1/x', R('dl/a.bin')).then(() => 'resolved', (e) => e)
            assert.strictEqual(m, 'invalid urlIn: must not contain credentials')
            assert.strictEqual(fetchCalls, 0)
        })
    })

    describe(`fsEnsureBins(Core) manifest字串路徑與opt.pkgRoot(空字串、NUL於入口判無效, 與不存在分開)`, function() {

        let ens = (m, o = {}) => fsEnsureBins(m, { pkgRoot: fd, offline: true, ...o }).then(() => null, (e) => e)

        it(`manifest為空字串: E_ARG 'invalid manifest: must be a non-empty string'`, async function() {
            reset()
            let e = await ens('')
            assert.strictEqual(e.code, 'E_ARG')
            assert.strictEqual(e.message, 'fsEnsureBins: invalid manifest: must be a non-empty string')
        })

        it(`manifest含NUL: E_ARG 'invalid manifest: must not contain a NUL character', 不回顯路徑`, async function() {
            reset()
            let e = await ens('man\0ifest.json')
            assert.strictEqual(e.code, 'E_ARG')
            assert.strictEqual(e.message, 'fsEnsureBins: invalid manifest: must not contain a NUL character')
        })

        it(`manifest為有效但不存在之路徑: 仍為E_MANIFEST(與無效分開)`, async function() {
            reset()
            let e = await ens('nope-manifest.json')
            assert.strictEqual(e.code, 'E_MANIFEST')
        })

        it(`opt.pkgRoot含NUL: E_ARG 'invalid opt.pkgRoot: must not contain a NUL character'; 空字串仍為E_ARG`, async function() {
            reset()
            let e = await ens({ schemaVersion: 1, bins: [] }, { pkgRoot: `${fd}/a\0b` })
            assert.strictEqual(e.code, 'E_ARG')
            assert.strictEqual(e.message, 'fsEnsureBins: invalid opt.pkgRoot: must not contain a NUL character')
            let e2 = await ens({ schemaVersion: 1, bins: [] }, { pkgRoot: '' })
            assert.strictEqual(e2.code, 'E_ARG')
        })

        it(`fsEnsureBinsCore 缺注入鍵: E_ARG(不下載)`, async function() {
            let e = await fsEnsureBinsCore('m.json', { pkgRoot: fd }).then(() => null, (err) => err)
            assert.strictEqual(e.code, 'E_ARG')
        })
    })

    describe(`fsGetBinManifestEntry fp(R-FS-INVALID-PATH-01: 分訊息, 不帶值, 與不存在分開)`, function() {

        it(`非字串、空字串、包裝String: 'invalid fp: must be a non-empty string'`, async function() {
            for (let v of [undefined, null, '', 0, 5, {}, [], true, () => 1, new String('a.bin'), Buffer.from('a.bin'), NaN]) {
                let m = await fsGetBinManifestEntry(v).then(() => 'resolved', (e) => e)
                assert.strictEqual(m, 'invalid fp: must be a non-empty string')
            }
        })

        it(`含NUL: 'invalid fp: must not contain a NUL character'`, async function() {
            let m = await fsGetBinManifestEntry('a\0b').then(() => 'resolved', (e) => e)
            assert.strictEqual(m, 'invalid fp: must not contain a NUL character')
        })

        it(`有效但不存在之路徑: 不以invalid起頭(與無效分開)`, async function() {
            reset()
            let m = await fsGetBinManifestEntry(R('nope.bin')).then(() => 'resolved', (e) => String(e))
            assert.ok(!m.startsWith('invalid fp'), m)
        })

        it(`有效檔: 照常產生清單項`, async function() {
            reset()
            let r = await fsGetBinManifestEntry(R('a.txt'), { name: 'a.txt' })
            assert.strictEqual(r.name, 'a.txt')
            assert.strictEqual(r.size, 5)
            assert.strictEqual(r.sha256, crypto.createHash('sha256').update('hello').digest('hex'))
        })
    })

    //======== D2. 外審補格(terra): 必須參數先於 opt 讀取與注入方法之呼叫、列舉 Core 之相依先於「是否為資料夾」、buildSpawnEnv 之型別標籤 ========
    describe(`必須參數先於opt之讀取與注入方法之呼叫(V17); 列舉Core相依先於資料夾判斷`, function() {

        it(`fsGetBinManifestEntry: fp無效時opt之getter拋錯不得蓋過說明字串`, async function() {
            let opt = {
                get name() {
                    throw new Error('private value')
                }
            }
            let m = await fsGetBinManifestEntry('', opt).then(() => 'resolved', (e) => e)
            assert.strictEqual(m, 'invalid fp: must be a non-empty string')
        })

        it(`fsDownloadFileCore: urlIn、fpOut無效時opt之getter拋錯不得蓋過說明字串`, async function() {
            let opt = {
                get fs() {
                    throw new Error('secret injected getter')
                }
            }
            assert.strictEqual(await fsDownloadFileCore('', R('a.txt'), opt).then(() => 'resolved', (e) => e), 'invalid urlIn: must be a non-empty string')
            assert.strictEqual(await fsDownloadFileCore('http://127.0.0.1:1/x', '', opt).then(() => 'resolved', (e) => e), 'invalid fpOut: must be a non-empty string')
        })

        it(`fsEnsureBins: manifest為空字串時, 注入之path.resolve不得被呼叫(無副作用)`, async function() {
            reset()
            let calls = 0
            let pathSpy = {
                ...path,
                resolve: (...a) => {
                    calls++
                    return path.resolve(...a)
                }
            }
            let e = await fsEnsureBins('', { pkgRoot: fd, path: pathSpy, offline: true }).then(() => null, (err) => err)
            assert.strictEqual(e.code, 'E_ARG')
            assert.strictEqual(e.message, 'fsEnsureBins: invalid manifest: must be a non-empty string')
            assert.strictEqual(calls, 0)
        })

        it(`fsEnsureBins: opt.pkgRoot為空字串或非字串, 訊息依V19`, async function() {
            for (let v of ['', 5, null, {}]) {
                let e = await fsEnsureBins({ schemaVersion: 1, bins: [] }, { pkgRoot: v }).then(() => null, (err) => err)
                assert.strictEqual(e.code, 'E_ARG')
                assert.strictEqual(e.message, 'fsEnsureBins: invalid opt.pkgRoot: must be a non-empty string')
            }
        })

        it(`fsGetFilesInFolderCore、fsGetFoldersInFolderCore: 缺path時先報相依(不先報'invalid fd: must be an existing folder'), 且先於任何fs呼叫`, function() {
            reset()
            let calls = 0
            let fsSpy = {
                ...fs,
                statSync: (...a) => {
                    calls++
                    return fs.statSync(...a)
                }
            }
            for (let f of [fsGetFilesInFolderCore, fsGetFoldersInFolderCore]) {
                for (let target of [R('nope'), R('d')]) {
                    assert.throws(() => f(target, { fs: fsSpy, path: undefined, levelLimit: 1 }), /^Error: invalid opt\.path: must be an object providing resolve, basename$/)
                }
            }
            assert.strictEqual(calls, 0)
        })
    })

    describe(`execCliCore.buildSpawnEnv 之型別標籤(Symbol.toStringTag)`, function() {
        let { buildSpawnEnv } = execCliCore

        it(`偽稱Object標籤之陣列與標籤getter拋錯者, 視為未給(不展開、不拋錯)`, function() {
            let a = ['env-injected']
            a[Symbol.toStringTag] = 'Object'
            let bad = {
                get [Symbol.toStringTag]() {
                    throw new Error('bad tag')
                }
            }
            let b = buildSpawnEnv()
            for (let v of [a, bad]) {
                let e = buildSpawnEnv(v)
                assert.strictEqual(e['0'], undefined)
                assert.deepStrictEqual(Object.keys(e).sort(), Object.keys(b).sort())
            }
        })
    })

    describe(`fsTask 紀錄資料夾之可用判定(指向資料夾之連結可用; 紀錄檔位置被資料夾占用者不可用)`, function() {

        it(`fdStorage為指向資料夾之junction: 可用, 不拋錯(原可用, 勿誤拒)`, async function() {
            reset()
            fs.mkdirSync(R('stg'))
            fs.symlinkSync(R('stg'), R('lnk'), 'junction')
            let tr = traceRec()
            let ev = fsTask(R('d'), { fdStorage: R('lnk'), timeInterval: 40, onTrace: tr.on })
            ev.on('change', (msg) => {
                msg.pm.resolve()
            })
            try {
                await tr.wait((x) => x.type === 'scan' && x.phase === 'end')
            }
            finally {
                ev.clear()
            }
            assert.ok(fs.existsSync(R('stg')))
        })

        it(`fpHash.json 位置已是資料夾: 建構時同步拋錯(否則永遠寫不進而重複派發)`, function() {
            reset()
            fs.mkdirSync(R('stg2/fpHash.json'), { recursive: true })
            assert.throws(() => fsTask(R('d'), { fdStorage: R('stg2') }), /^Error: fsTask: opt\.fdStorage can not be created or used as a folder$/)
        })
    })

    //======== E. 正對照: 相依齊全時各Core行為不變(不因新檢測而誤拒) ========
    describe(`相依齊全時正常運作(正對照)`, function() {

        it(`create/rename/copy/delete/write/read 一輪`, async function() {
            reset()
            assert.ok(fsCreateFolderCore(R('p/q'), { fs }).success)
            assert.ok(fsCreateFileCore(R('p/q/f.txt'), 'abc', { fs }).success)
            assert.ok(fsRenameFileCore(R('p/q/f.txt'), R('p/q/g.txt'), { fs }).success)
            assert.ok(fsCopyFileCore(R('p/q/g.txt'), R('p/c/g.txt'), { fs, path }).success)
            assert.ok((await fsCopyFileCore(R('p/q/g.txt'), R('p/c/h.txt'), { fs, path, useSync: false })).success)
            assert.ok(fsCopyFolderCore(R('p/q'), R('p/q2'), { fs, path }).success)
            assert.ok((await fsCopyFolderCore(R('p/q'), R('p/q3'), { fs, path, useSync: false })).success)
            assert.ok(fsRenameFolderCore(R('p/q2'), R('p/q4'), { fs }).success)
            assert.strictEqual(fsReadTextCore(R('p/q4/g.txt'), { fs }).success, 'abc')
            assert.ok(fsWriteTextCore(R('p/w.txt'), 'w', { fs }).success)
            assert.ok(fsWriteTextAtomicCore(R('p/wa.txt'), 'wa', { fs }).success)
            assert.ok(fsCleanFolderCore(R('p/q3'), { fs, path }).success)
            assert.ok(fsDeleteFileCore(R('p/w.txt'), { fs }).success)
            assert.ok(fsDeleteFolderCore(R('p/q4'), { fs }).success)
            assert.strictEqual(await fsDeleteFileSafeCore(R('p/wa.txt'), { fs }), `done: ${R('p/wa.txt')}`)
            assert.ok(fsExistsCore(R('p/c/g.txt'), { fs }))
        })

        it(`hash/列舉/合併/同步 一輪`, async function() {
            reset()
            let h = await fsGetFileHashCore(R('a.txt'), real)
            assert.strictEqual(h, crypto.createHash('sha512').update('hello').digest('hex'))
            assert.strictEqual(await fsGetFileBasicHashCore(R('a.txt'), real), h)
            assert.strictEqual(fsTreeFolderCore(R('d'), { ...real, levelLimit: 2 }).length, 3)
            assert.strictEqual(fsGetFilesInFolderCore(R('d'), { ...real, levelLimit: 2 }).length, 2)
            assert.strictEqual(fsGetFoldersInFolderCore(R('d'), { ...real, levelLimit: 2 }).length, 1)
            assert.strictEqual((await fsGetFilesWithHashInFolderCore(R('d'), { ...real, levelLimit: 2 })).length, 2)
            assert.strictEqual((await fsTreeFolderWithHashCore(R('d'), { ...real, levelLimit: 2 })).length, 3) //資料夾項目亦列入(forFolder僅決定是否算其雜湊)
            assert.ok((await fsGetFolderBasicHashCore(R('d'), real)).length > 0)
            let m = await fsMergeFilesCore([R('m.part1'), R('m.part2')], R('mg/merged.txt'), real)
            assert.strictEqual(m.filename, 'merged.txt')
            assert.strictEqual(fs.readFileSync(R('mg/merged.txt'), 'utf8'), '12')
            assert.strictEqual(await fsSyncFolderCore(R('d'), R('dst/s2'), real), true)
            assert.strictEqual(fs.readFileSync(R('dst/s2/sub/y.txt'), 'utf8'), 'yy')
        })
    })
})
