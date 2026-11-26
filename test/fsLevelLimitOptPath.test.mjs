import assert from 'assert'
import fs from 'fs'
import path from 'path'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import fsTask from '../src/fsTask.mjs'
import { traceRec } from './tools/timeKit.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//W-11(排程第492項第2批 ws492c)之fs列舉家族10函數部分已由R-LEVEL-LIMIT-02取代(第2參數改為opt, 未給opt.levelLimit即窮舉全部), 其測試移至test/fsLevelLimitOpt.test.mjs
//  內部需全部層級者(fsGetFolderBasicHash、fsSyncFolder)改為不給opt.levelLimit, 行為不變(本檔保留)
//  fsTask之opt.levelLimit(預設1)不在R-LEVEL-LIMIT-02之列, 行為不變(本檔保留)
//W-12: 路徑型opt鍵(fsSrlog.fdLog、fsTask.fdStorage、fsEvem.fd)非字串、空字串、含NUL視為非預期, 改用預設
describe(`內部全部層級、fsTask之levelLimit與路徑型opt鍵(W-11、W-12)`, function() {

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

    describe(`內部需全部層級者行為不變(不給opt.levelLimit即窮舉全部)`, function() {

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

        it(`fsSyncFolder: 目標端深層(層4)之內容相異檔被覆蓋、多出檔被移除(來源端與目標端兩次列舉皆窮舉全部)`, async function() {
            mkTree()
            fs.mkdirSync(R('tar/a/b/c'), { recursive: true })
            fs.writeFileSync(R('tar/a/b/f3.txt'), 'f3') //與來源相同, 保留
            fs.writeFileSync(R('tar/a/b/c/f4.txt'), 'OLD4') //與來源相異, 應被覆蓋
            fs.writeFileSync(R('tar/a/b/c/x9.txt'), 'x9') //來源無, 應被移除
            let b = await fsSyncFolder(R('t'), R('tar'))
            assert.strictEqual(b, true)
            assert.strictEqual(fs.readFileSync(R('tar/a/b/c/f4.txt'), 'utf8'), 'f4', 'deep differing file in target is overwritten')
            assert.ok(!fs.existsSync(R('tar/a/b/c/x9.txt')), 'deep extra file in target is removed')
            assert.strictEqual(fs.readFileSync(R('tar/a/b/f3.txt'), 'utf8'), 'f3')
            assert.strictEqual(fs.readFileSync(R('tar/f1.txt'), 'utf8'), 'f1')
            assert.strictEqual(fs.readFileSync(R('tar/a/f2.txt'), 'utf8'), 'f2')
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
