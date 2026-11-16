/* eslint-disable no-new-wrappers */ //本檔刻意以包裝物件(new Number)作為無效輸入
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fsTreeFolder from '../src/fsTreeFolder.mjs'
import fsTreeFolderCore from '../src/fsTreeFolderCore.mjs'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'
import fsTreeFolderWithHashCore from '../src/fsTreeFolderWithHashCore.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'
import fsGetFilesInFolderCore from '../src/fsGetFilesInFolderCore.mjs'
import fsGetFoldersInFolder from '../src/fsGetFoldersInFolder.mjs'
import fsGetFoldersInFolderCore from '../src/fsGetFoldersInFolderCore.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import fsGetFilesWithHashInFolderCore from '../src/fsGetFilesWithHashInFolderCore.mjs'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import fsTask from '../src/fsTask.mjs'
import { traceRec } from './tools/timeKit.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//W-11(排程第492項第2批 ws492c): levelLimit之null依K3取預設1(與0、負、小數、Infinity同), 不再為無窮遍歷; 無窮遍歷由呼叫端給大有限值(4294967295)
//  fs列舉家族10函數(fsTreeFolder(Core)、fsTreeFolderWithHash(Core)、fsGetFilesInFolder(Core)、fsGetFoldersInFolder(Core)、fsGetFilesWithHashInFolder(Core))與fsTask一致
//  內部需全部層級者(fsGetFolderBasicHash、fsSyncFolder)改給大有限值, 行為不變
//W-12: 路徑型opt鍵(fsSrlog.fdLog、fsTask.fdStorage、fsEvem.fd)非字串、空字串、含NUL視為非預期, 改用預設
describe(`levelLimit之null取預設與路徑型opt鍵(W-11、W-12)`, function() {

    let fd = path.resolve('./test/_tmp/fsLevelLimitOptPath')
    let R = (p) => `${fd}/${p}`
    let BIG = 4294967295

    //夾具: t/ 下 f1.txt(層1)、a/f2.txt(層2)、a/b/f3.txt(層3)、a/b/c/f4.txt(層4); 資料夾 a(層1)、b(層2)、c(層3)
    let mkTree = () => {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(R('t/a/b/c'), { recursive: true })
        fs.writeFileSync(R('t/f1.txt'), 'f1')
        fs.writeFileSync(R('t/a/f2.txt'), 'f2')
        fs.writeFileSync(R('t/a/b/f3.txt'), 'f3')
        fs.writeFileSync(R('t/a/b/c/f4.txt'), 'f4')
    }

    before(function() {
        mkTree()
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
    })

    let names = (arr) => arr.map((v) => v.name).sort()

    //funs: [名稱, (levelLimit) => 結果之名稱陣列(排序後)], 同步與非同步皆以await統一
    let real = { fs, path, crypto }
    let funs = [
        ['fsTreeFolder', async (lv) => names(fsTreeFolder(R('t'), lv))],
        ['fsTreeFolderCore', async (lv) => names(fsTreeFolderCore(R('t'), lv, real))],
        ['fsTreeFolderWithHash', async (lv) => names(await fsTreeFolderWithHash(R('t'), lv))],
        ['fsTreeFolderWithHashCore', async (lv) => names(await fsTreeFolderWithHashCore(R('t'), lv, real))],
        ['fsGetFilesInFolder', async (lv) => names(fsGetFilesInFolder(R('t'), lv))],
        ['fsGetFilesInFolderCore', async (lv) => names(fsGetFilesInFolderCore(R('t'), lv, real))],
        ['fsGetFoldersInFolder', async (lv) => names(fsGetFoldersInFolder(R('t'), lv))],
        ['fsGetFoldersInFolderCore', async (lv) => names(fsGetFoldersInFolderCore(R('t'), lv, real))],
        ['fsGetFilesWithHashInFolder', async (lv) => names(await fsGetFilesWithHashInFolder(R('t'), lv))],
        ['fsGetFilesWithHashInFolderCore', async (lv) => names(await fsGetFilesWithHashInFolderCore(R('t'), lv, real))],
    ]

    describe(`fs列舉家族10函數: levelLimit之null與預設1相同, 與大有限值不同`, function() {
        for (let [name, f] of funs) {
            it(`${name}: null同未給、同1(不遍歷下層), 異於${BIG}`, async function() {
                let l1 = await f(1)
                let lNull = await f(null)
                let lUndef = await f(undefined)
                let lBig = await f(BIG)
                assert.deepStrictEqual(lNull, l1, `${name}(null) must equal level 1`)
                assert.deepStrictEqual(lUndef, l1)
                assert.ok(lBig.length > l1.length, `${name}(${BIG}) must go deeper than level 1`)
            })

            it(`${name}: 0、負、小數、Infinity、'0x10'、包裝物件與null同(皆取預設1)`, async function() {
                let l1 = await f(1)
                for (let v of [0, -1, 1.5, Infinity, '0x10', new Number(3), NaN, 'abc', true, {}, []]) {
                    assert.deepStrictEqual(await f(v), l1, `${name}(${String(typeof v)}) must equal level 1`)
                }
            })
        }

        it(`大有限值4294967295遍歷全部層級(檔案4個、資料夾3個)`, async function() {
            assert.deepStrictEqual(await funs[4][1](BIG), ['f1.txt', 'f2.txt', 'f3.txt', 'f4.txt'])
            assert.deepStrictEqual(await funs[6][1](BIG), ['a', 'b', 'c'])
            assert.strictEqual((await funs[0][1](BIG)).length, 7)
        })

        it(`null不再為無窮遍歷: 與修前相反之案例(深層檔不在null之結果內)`, async function() {
            assert.deepStrictEqual(await funs[4][1](null), ['f1.txt'])
            assert.deepStrictEqual(await funs[6][1](null), ['a'])
        })
    })

    describe(`內部需全部層級者行為不變(改給大有限值)`, function() {

        it(`fsGetFolderBasicHash: 深層(層4)檔案內容改變, 雜湊必變`, async function() {
            mkTree()
            let h1 = await fsGetFolderBasicHash(R('t'))
            fs.writeFileSync(R('t/a/b/c/f4.txt'), 'f4-changed')
            let h2 = await fsGetFolderBasicHash(R('t'))
            assert.notStrictEqual(h1, h2)
            assert.strictEqual(h2.split('|').length, 4, 'all 4 files at all levels are hashed')
        })

        it(`fsSyncFolder: 深層(層4)檔案一併同步(目標已存在時走雜湊比對)`, async function() {
            mkTree()
            fs.mkdirSync(R('tar'), { recursive: true })
            fs.writeFileSync(R('tar/old.txt'), 'old')
            let b = await fsSyncFolder(R('t'), R('tar'))
            assert.strictEqual(b, true)
            assert.strictEqual(fs.readFileSync(R('tar/a/b/c/f4.txt'), 'utf8'), 'f4')
            assert.strictEqual(fs.readFileSync(R('tar/a/b/f3.txt'), 'utf8'), 'f3')
            assert.ok(!fs.existsSync(R('tar/old.txt')), 'extra file in target is removed')
        })
    })

    describe(`fsTask levelLimit(opt): null取預設1, 與列舉家族一致`, function() {

        //scanFiles, 以觀察回調等第1輪掃描結束, 回傳掃到之檔案數
        let scanFiles = async (opt) => {
            let tr = traceRec()
            let ev = fsTask(R('t'), { fdStorage: R(`st_${Math.random().toString(36).slice(2)}`), timeInterval: 40, onTrace: tr.on, ...opt })
            ev.on('change', (msg) => {
                msg.pm.resolve()
            })
            try {
                let e = await tr.wait((x) => x.type === 'scan' && x.phase === 'end')
                return e.files
            }
            finally {
                ev.clear()
            }
        }

        it(`levelLimit為null、未給、0、Infinity: 只掃第1層(1個檔); 給4294967295掃4個檔`, async function() {
            mkTree()
            assert.strictEqual(await scanFiles({}), 1)
            assert.strictEqual(await scanFiles({ levelLimit: null }), 1)
            assert.strictEqual(await scanFiles({ levelLimit: 0 }), 1)
            assert.strictEqual(await scanFiles({ levelLimit: Infinity }), 1)
            assert.strictEqual(await scanFiles({ levelLimit: BIG }), 4)
            assert.strictEqual(await scanFiles({ levelLimit: 2 }), 2)
        })
    })

    //======== W-12 路徑型opt鍵 ========
    describe(`路徑型opt鍵(fsSrlog.fdLog、fsEvem.fd、fsTask.fdStorage): 非字串、空字串、含NUL視為非預期而改用預設`, function() {

        let fdRun = path.resolve('./test/_tmp/fsLevelLimitOptPath_run')
        let runner = path.resolve('./test/tools/fsOptPathRunner.mjs')

        let runCase = (caseName) => {
            fs.rmSync(fdRun, { recursive: true, force: true })
            fs.mkdirSync(fdRun, { recursive: true })
            return runChildCase(runner, caseName, { cwd: fdRun, timeout: 60000 }).r
        }

        after(function() {
            fs.rmSync(fdRun, { recursive: true, force: true })
        })

        let cases = [
            ['srlog', 'syslog', 'fsSrlog opt.fdLog'],
            ['evem', '_evps', 'fsEvem opt.fd'],
            ['task', '_tkfs', 'fsTask opt.fdStorage'],
        ]
        for (let [caseName, def, label] of cases) {
            it(`${label}: 非預期之輸入(含NUL、空字串、數字、物件、包裝String、Buffer、null、未給)皆改用預設./${def}, 不拋錯`, function() {
                this.timeout(120000)
                let r = runCase(caseName)
                assert.strictEqual(Object.keys(r).length, 13)
                for (let [k, v] of Object.entries(r)) {
                    assert.strictEqual(v.threw, '', `${k}: must not throw, got ${v.threw}`)
                    let items = v.items.filter((n) => n !== 'watch')
                    assert.deepStrictEqual(items, [def], `${k}: default folder must be created, no stray folder`)
                }
            })
        }
    })

    describe(`fsTask 紀錄資料夾無法使用(有效字串但該路徑已是檔案): 同步拋錯而非靜默重複派發`, function() {

        it(`fdStorage指向既有檔案: 建構時同步拋出Error, 不啟動計時器、不派發`, function() {
            mkTree()
            fs.writeFileSync(R('blocker'), 'i am a file')
            let emits = 0
            let onTrace = (e) => {
                if (e.type === 'emit') {
                    emits++
                }
            }
            assert.throws(() => {
                let ev = fsTask(R('t'), { fdStorage: R('blocker'), timeInterval: 40, onTrace })
                ev.clear()
            }, /^Error: fsTask: opt\.fdStorage can not be created or used as a folder$/)
            assert.strictEqual(emits, 0)
            assert.strictEqual(fs.readFileSync(R('blocker'), 'utf8'), 'i am a file')
        })

        it(`訊息不帶路徑(V20); 有效可建立之fdStorage照常`, function() {
            mkTree()
            fs.writeFileSync(R('blocker'), 'x')
            try {
                fsTask(R('t'), { fdStorage: R('blocker') })
                assert.fail('should throw')
            }
            catch (err) {
                assert.ok(!err.message.includes(fd))
            }
            let ev = fsTask(R('t'), { fdStorage: R('ok/st'), timeInterval: 100000 })
            ev.clear()
            assert.ok(fs.statSync(R('ok/st')).isDirectory())
        })
    })
})
