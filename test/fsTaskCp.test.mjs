import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join, resolve, sep } from 'path'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsTaskCp from '../src/fsTaskCp.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`fsTaskCp`, function() {

    let test = async () => {
        return new Promise((resolve, reject) => {
            let msSrc = []
            let msTar = []

            let fp = './_taskcp'
            fsDeleteFolder(fp) //預先清除fsTaskCp持久化數據資料夾

            let fpc = './_taskcpSrc'
            fsDeleteFolder(fpc) //預先清除fsTaskCp持久化數據資料夾

            let fpt = './_taskcpTar'
            fsDeleteFolder(fpt) //預先清除fsTaskCp持久化數據資料夾

            let otk = fsTaskCp(fpc, fpt)

            let otkSrc = otk.buildSrc()
            otkSrc.on('set', (msg) => {
            //console.log(`src send task...`, msg)
                msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
            })
            otkSrc.on('remove', (msg) => {
            //console.log(`src send task...`, msg)
                msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
            })

            let otkTar = otk.buildTar()
            otkTar.on('change', (msg) => {
            // console.log('otkTar change', msg)

                //接收任務
                //console.log(`tar recv task...`, msg.kpCmp)
                msTar.push({ type: 'tar-recv', msg: JSON.stringify(msg.kpCmp) })

                setTimeout(() => {
                //console.log(`tar deal task done`)
                    msTar.push({ type: 'tar-done', msg: JSON.stringify(msg.kpCmp) })
                    msg.pm.resolve()
                }, 1000)

            })

            setTimeout(() => {
                fsCreateFolder(fp)
            }, 1)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
                otkSrc.set('abc.txt', 'hash_a1')
            }, 3000)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
                otkSrc.set('abc.txt', 'hash_a2')
                fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
                otkSrc.set('def.txt', 'hash_b1')
            }, 6000)

            setTimeout(() => {
                fsDeleteFile(`${fp}/abc.txt`)
                otkSrc.remove('abc.txt')
            }, 9000)

            setTimeout(() => {
                otkTar.clear()
            }, 12000)

            setTimeout(() => {
                fsDeleteFolder(fp)
                fsDeleteFolder(fpc)
                fsDeleteFolder(fpt)
                let ms = {
                    msSrc,
                    msTar,
                }
                //console.log('ms', ms)
                resolve(ms)
            }, 15000)

        })
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a1' }
    // tar recv task... {
    //   del: [],
    //   add: [ { fp: 'abc.txt', hash: 'hash_a1' } ],
    //   same: [],
    //   diff: []
    // }
    // tar deal task done
    // src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a2' }
    // src send task... { type: 'set', fp: 'def.txt', hash: 'hash_b1' }
    // tar recv task... {
    //   del: [],
    //   add: [ { fp: 'def.txt', hash: 'hash_b1' } ],
    //   same: [],
    //   diff: [ { fp: 'abc.txt', hash: 'hash_a2' } ]
    // }
    // src send task... { type: 'remove', fp: 'abc.txt' }
    // tar deal task done
    // tar recv task... {
    //   del: [ { fp: 'abc.txt', hash: 'hash_a2' } ],
    //   add: [],
    //   same: [ { fp: 'def.txt', hash: 'hash_b1' } ],
    //   diff: []
    // }
    // tar deal task done
    let ms = {
        msSrc: [
            {
                type: 'src-send',
                msg: '{"type":"set","fp":"abc.txt","hash":"hash_a1"}'
            },
            {
                type: 'src-send',
                msg: '{"type":"set","fp":"abc.txt","hash":"hash_a2"}'
            },
            {
                type: 'src-send',
                msg: '{"type":"set","fp":"def.txt","hash":"hash_b1"}'
            },
            { type: 'src-send', msg: '{"type":"remove","fp":"abc.txt"}' }
        ],
        msTar: [
            {
                type: 'tar-recv',
                msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
            },
            {
                type: 'tar-done',
                msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
            },
            {
                type: 'tar-recv',
                msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
            },
            {
                type: 'tar-done',
                msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
            },
            {
                type: 'tar-recv',
                msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
            },
            {
                type: 'tar-done',
                msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
            }
        ]
    }

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`fsTaskCp 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //夾具根目錄, 每案獨立子資料夾(src、tar); 只刪本夾具, 不刪上層test/_tmp
        let root = join(__dirname, '_tmp', 'fsTaskCpLen')

        //移除夾具: 先斷言路徑位於夾具根之下, 刪後回驗不存在(Windows下chokidar剛關閉時可能短暫被占用, 故重試)
        let removeFixture = async (dir) => {
            let rd = resolve(dir)
            assert.ok(rd.startsWith(resolve(root) + sep), `fixture out of root: ${rd}`)
            for (let i = 0; i < 30; i++) {
                try {
                    fs.rmSync(rd, { recursive: true, force: true })
                }
                catch (err) {}
                if (!fs.existsSync(rd)) {
                    return true
                }
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
            return false
        }

        //於夾具內建立fsTaskCp, 寫入來源端紀錄, 等待buildTar之第一個change事件並回傳kpCmp(經JSON轉換)
        //  opt.tarRaw: 偵測端fpHash.json之原始文字(先寫); opt.srcKp: 以buildSrc().writeKp寫入之物件; opt.srcRaw: 改直接寫入來源端fpHash.json之原始文字
        let runCase = async (name, opt) => {
            let dir = join(root, name)
            let fdSrc = join(dir, 'src')
            let fdTar = join(dir, 'tar')
            fs.mkdirSync(fdSrc, { recursive: true })
            fs.mkdirSync(fdTar, { recursive: true })
            let ev = null
            let kpCmp = null
            let failure = null
            try {
                if (typeof opt.tarRaw === 'string') {
                    fs.writeFileSync(join(fdTar, 'fpHash.json'), opt.tarRaw, 'utf8')
                }
                let otk = fsTaskCp(fdSrc, fdTar)
                let evS = otk.buildSrc()
                ev = otk.buildTar() //先建立偵測再寫入來源端紀錄
                kpCmp = await new Promise((resolve, reject) => {
                    let t = setTimeout(() => reject(new Error(`timeout waiting for the change event of ${name}`)), 20000) //平行執行全套測試時負載高, 放寬等待
                    ev.on('change', (msg) => {
                        clearTimeout(t)
                        resolve(JSON.parse(JSON.stringify(msg.kpCmp)))
                    })
                    if (typeof opt.srcRaw === 'string') {
                        fs.writeFileSync(join(fdSrc, 'fpHash.json'), opt.srcRaw, 'utf8')
                    }
                    else {
                        evS.writeKp(opt.srcKp)
                    }
                })
            }
            catch (err) {
                failure = err
            }
            if (ev !== null) {
                ev.clear() //停止監聽
            }
            let removed = await removeFixture(dir)
            if (failure !== null) {
                throw failure
            }
            assert.ok(removed, `fixture not removed: ${dir}`)
            assert.ok(!fs.existsSync(dir))
            return kpCmp
        }

        after(async function() {
            let rr = resolve(root)
            assert.ok(rr.endsWith(`${sep}test${sep}_tmp${sep}fsTaskCpLen`), `unexpected fixture root: ${rr}`)
            for (let i = 0; i < 30; i++) {
                try {
                    fs.rmSync(rr, { recursive: true, force: true })
                }
                catch (err) {}
                if (!fs.existsSync(rr)) {
                    break
                }
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
            assert.ok(!fs.existsSync(rr), `fixture root not removed: ${rr}`)
        })

        describe(`紀錄檔含length鍵(非負整數)時, change事件之kpCmp依自有鍵比對`, function() {

            let cases = [
                ['A 來源端{length:1,a.txt}、偵測端無紀錄', { srcKp: { 'length': 1, 'a.txt': 'h1' } }, {
                    del: [], add: [{ fp: 'length', hash: 1 }, { fp: 'a.txt', hash: 'h1' }], same: [], diff: [],
                }],
                ['B 來源端{a.txt,length:3}(length在後)、偵測端無紀錄', { srcKp: { 'a.txt': 'h1', 'length': 3 } }, {
                    del: [], add: [{ fp: 'a.txt', hash: 'h1' }, { fp: 'length', hash: 3 }], same: [], diff: [],
                }],
                ['C 兩端皆有length: 偵測端{length:2,a.txt:h1}、來源端{length:3,a.txt:h1,b.txt:h2}', {
                    tarRaw: '{"length":2,"a.txt":"h1"}', srcKp: { 'length': 3, 'a.txt': 'h1', 'b.txt': 'h2' },
                }, {
                    del: [], add: [{ fp: 'b.txt', hash: 'h2' }], same: [{ fp: 'a.txt', hash: 'h1' }], diff: [{ fp: 'length', hash: 3 }],
                }],
                ['D 偵測端有length而來源端移除: 偵測端{length:2,a.txt}、來源端{a.txt}', {
                    tarRaw: '{"length":2,"a.txt":"h1"}', srcKp: { 'a.txt': 'h1' },
                }, {
                    del: [{ fp: 'length', hash: 2 }], add: [], same: [{ fp: 'a.txt', hash: 'h1' }], diff: [],
                }],
                ['E length 為 -0(JSON -0 在 isLength 為真): 來源端{"length":-0,a.txt}', { srcRaw: '{"length":-0,"a.txt":"h1"}' }, {
                    del: [], add: [{ fp: 'length', hash: 0 }, { fp: 'a.txt', hash: 'h1' }], same: [], diff: [],
                }],
            ]
            for (let [name, opt, exp] of cases) {
                it(`should compare by own keys: ${name}`, async function() {
                    this.timeout(40000)
                    let kpCmp = await runCase('case' + name[0], opt)
                    assert.strict.deepStrictEqual(kpCmp, exp)
                })
            }

        })

        describe(`無length鍵或length非陣列樣之紀錄: 行為不變(行為鎖定)`, function() {

            let cases = [
                ['F 一般鍵: 刪(old.txt)、增(d.txt)、同(a.txt)、異(b/c.txt)', {
                    tarRaw: '{"a.txt":"h1","b/c.txt":"hX","old.txt":"h9"}', srcKp: { 'a.txt': 'h1', 'b/c.txt': 'h2', 'd.txt': 'h3' },
                }, {
                    del: [{ fp: 'old.txt', hash: 'h9' }], add: [{ fp: 'd.txt', hash: 'h3' }], same: [{ fp: 'a.txt', hash: 'h1' }], diff: [{ fp: 'b/c.txt', hash: 'h2' }],
                }],
                ['G 偵測端紀錄檔內容為null(j2o得null)時視為無紀錄', {
                    tarRaw: 'null', srcKp: { 'a.txt': 'h1' },
                }, {
                    del: [], add: [{ fp: 'a.txt', hash: 'h1' }], same: [], diff: [],
                }],
                ['H length 為字串數字(非陣列樣)仍為一般鍵', {
                    tarRaw: '{"length":"3"}', srcKp: { 'length': '4', 'a.txt': 'h1' },
                }, {
                    del: [], add: [{ fp: 'a.txt', hash: 'h1' }], same: [], diff: [{ fp: 'length', hash: '4' }],
                }],
                ['I length 為null', { srcKp: { 'length': null, 'a.txt': 'h1' } }, {
                    del: [], add: [{ fp: 'length', hash: null }, { fp: 'a.txt', hash: 'h1' }], same: [], diff: [],
                }],
                ['J length 為1.5與負數: 偵測端{length:-1}、來源端{length:1.5}', {
                    tarRaw: '{"length":-1}', srcKp: { 'length': 1.5, 'a.txt': 'h1' },
                }, {
                    del: [], add: [{ fp: 'a.txt', hash: 'h1' }], same: [], diff: [{ fp: 'length', hash: 1.5 }],
                }],
                ['K 純數字檔名鍵: fp 仍為字串(不得被轉成數字索引)', { srcRaw: '{"0":"h0","10":"h10"}' }, {
                    del: [], add: [{ fp: '0', hash: 'h0' }, { fp: '10', hash: 'h10' }], same: [], diff: [],
                }],
            ]
            for (let [name, opt, exp] of cases) {
                it(`should keep the behavior: ${name}`, async function() {
                    this.timeout(40000)
                    let kpCmp = await runCase('case' + name[0], opt)
                    assert.strict.deepStrictEqual(kpCmp, exp)
                })
            }

        })

        describe(`極大length於限額子行程: 不依length迭代`, function() {

            let runner = join(__dirname, 'tools', 'objIterG4Runner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB: 修前之實作對 length>=5e6 即耗盡堆積而崩潰, 離開碼 134; 夾具由子行程於test/_tmp/fsTaskCpLen/child-<N>/自建自刪, 崩潰時由此處補刪
            for (let len of [1e8, MAX, 4294967295]) {
                it(`should report length and a.txt in kpCmp.add when length is ${len}`, async function() {
                    this.timeout(90000)
                    let dir = join(root, `child-${len}`)
                    let rc = null
                    try {
                        rc = runChildCase(runner, `fsTaskCp:basic:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 40000 })
                    }
                    finally {
                        let removed = await removeFixture(dir)
                        assert.ok(removed && !fs.existsSync(dir), `fixture not removed: ${dir}`)
                    }
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    assert.strict.strictEqual(rc.r.error, undefined)
                    assert.strict.deepStrictEqual(rc.r.out, {
                        del: [], add: [{ fp: 'length', hash: len }, { fp: 'a.txt', hash: 'h1' }], same: [], diff: [],
                    })
                })
            }

        })

    })

})
