import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join, resolve, sep } from 'path'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsTaskCp from '../src/fsTaskCp.mjs'
import { runChildCase } from './tools/runChildCase.mjs'
import { traceRec } from './tools/timeKit.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`fsTaskCp`, function() {

    //rmDir, 移除資料夾並回驗已不存在(Windows下chokidar剛關閉時可能短暫被占用, 故重試至成功或逾30次)
    let rmDir = async (dir) => {
        for (let i = 0; i < 30; i++) {
            fsDeleteFolder(dir)
            if (!fs.existsSync(dir)) {
                return true
            }
            await new Promise((resolve) => setTimeout(resolve, 100))
        }
        return false
    }

    //test, 步進式(R-TRACE-01): 做一個來源端操作 → 等偵測端以觀察事件回報該操作已處理完(偵測端紀錄檔已更新) → 才做下一個操作
    //  原於3/6/9s操作、12s clear、15s結算: 偵測端經fsWatchFile(chokidar等寫入穩定約2s)再加300ms debounce, 各操作約+2.4s才收到change, 與12s之clear賽跑(第3次約11.4s),
    //  且1000ms之tar處理鏈與其後之操作重疊; 負載下change晚於clear或與下一操作之change被合併而少一組recv/done
    //  tar處理(模擬)改為非同步完成(setImmediate): 原1000ms之時長非規格, 規格為「recv後、pm.resolve前為執行中, resolve後才更新紀錄檔」
    let trLast = null //最近一次test之觀察事件, 供it斷言
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

            let tr = traceRec({ guard: 40000 }) //等事件之防懸置上限: 遠大於各步正常耗時(約2.4s, 平行全套測試之高負載下放寬)
            trLast = tr
            let otk = fsTaskCp(fpc, fpt, { onTrace: tr.on })

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

                setImmediate(() => {
                //console.log(`tar deal task done`)
                    msTar.push({ type: 'tar-done', msg: JSON.stringify(msg.kpCmp) })
                    msg.pm.resolve()
                })

            })

            let steps = async () => {

                //第0步: 建立資料夾(原於1ms後建立)
                fsCreateFolder(fp)

                //第1步: 來源端新增abc.txt, 等偵測端處理完(紀錄檔更新)
                let k = tr.mark()
                fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
                otkSrc.set('abc.txt', 'hash_a1')
                await tr.wait((e) => e.type === 'record', k)

                //第2步: 來源端改abc.txt並新增def.txt, 等偵測端處理完
                k = tr.mark()
                fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
                otkSrc.set('abc.txt', 'hash_a2')
                fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
                otkSrc.set('def.txt', 'hash_b1')
                await tr.wait((e) => e.type === 'record', k)

                //第3步: 來源端刪除abc.txt, 等偵測端處理完
                k = tr.mark()
                fsDeleteFile(`${fp}/abc.txt`)
                otkSrc.remove('abc.txt')
                await tr.wait((e) => e.type === 'record', k)

            }

            steps()
                .then(async () => {
                    otkTar.clear()
                    let ok = (await Promise.all([rmDir(fp), rmDir(fpc), rmDir(fpt)])).every((v) => v)
                    assert.ok(ok, 'fixture not removed')
                    let ms = {
                        msSrc,
                        msTar,
                    }
                    //console.log('ms', ms)
                    resolve(ms)
                })
                .catch(async (err) => {
                    otkTar.clear()
                    await Promise.all([rmDir(fp), rmDir(fpc), rmDir(fpt)])
                    reject(err)
                })

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

    //fmt, 觀察事件轉為簡式字串: recv add、run、emit +1 -0 ~0 =0(新增/刪除/變更/相同之件數)、settle ok、record、skip(no src)、clear
    let fmt = (e) => {
        if (e.type === 'recv') {
            return `recv ${e.kind}`
        }
        if (e.type === 'emit') {
            return `emit +${e.add} -${e.del} ~${e.diff} =${e.same}`
        }
        if (e.type === 'settle') {
            return `settle ${e.ok ? 'ok' : 'fail'}`
        }
        if (e.type === 'skip') {
            return `skip (${e.reason})`
        }
        return e.type
    }

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)

        //觀察事件: 三個來源端操作各經 收到變更→debounce到期→比對派發→任務成功→更新偵測端紀錄檔, 依序且不合併
        assert.strict.deepStrictEqual(trLast.events.map(fmt), [
            'recv add', 'run', 'emit +1 -0 ~0 =0', 'settle ok', 'record',
            'recv change', 'run', 'emit +1 -0 ~1 =0', 'settle ok', 'record',
            'recv change', 'run', 'emit +0 -1 ~0 =1', 'settle ok', 'record',
            'clear',
        ])
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

    describe(`fsTaskCp 觀察回調(onTrace, R-TRACE-01)`, function() {

        //夾具根目錄, 每案獨立子資料夾(src、tar)
        let root = join(__dirname, '_tmp', 'fsTaskCpTrace')

        after(async function() {
            let rr = resolve(root)
            assert.ok(rr.endsWith(`${sep}test${sep}_tmp${sep}fsTaskCpTrace`), `unexpected fixture root: ${rr}`)
            assert.ok(await rmDir(rr), `fixture root not removed: ${rr}`)
        })

        //guard, 防懸置: 以真實計時器限制p須於ms內settle, 只防懸置, 不表達規格
        let guard = (p, ms = 40000) => new Promise((resolve, reject) => {
            let t = setTimeout(() => reject(new Error(`guard: not settled within ${ms}ms`)), ms)
            p.then((v) => {
                clearTimeout(t)
                resolve(v)
            }, (e) => {
                clearTimeout(t)
                reject(e)
            })
        })

        //runTrace, 於夾具內建立fsTaskCp(帶觀察回調)與偵測端, 先寫偵測端紀錄檔(o.tar原文, 可省)與來源端紀錄檔(o.src原文, 偵測端建立後才寫以觸發偵測), 再執行o.run(ctx); 結束必clear並移除夾具
        //  o.onChange為change監聽器(省略則立即resolve其pm), o.meta為收集(this, 事件是否凍結)之陣列(省略則不收集); 回傳{ tr, tarRecord }, tarRecord為結束時偵測端紀錄檔之內容(不存在為null)
        let runTrace = async (name, o) => {
            let dir = join(root, name)
            let fdSrc = join(dir, 'src')
            let fdTar = join(dir, 'tar')
            fs.mkdirSync(fdSrc, { recursive: true })
            fs.mkdirSync(fdTar, { recursive: true })
            if (typeof o.tar === 'string') {
                fs.writeFileSync(join(fdTar, 'fpHash.json'), o.tar, 'utf8')
            }
            let tr = traceRec({ guard: 40000 })
            let onTrace = function(e) {
                if (o.meta) {
                    o.meta.push([this, Object.isFrozen(e)])
                }
                tr.on(e)
            }
            let otk = fsTaskCp(fdSrc, fdTar, { onTrace })
            let ev = otk.buildTar()
            ev.on('error', () => {})
            ev.on('change', (msg) => {
                if (o.onChange) {
                    o.onChange(msg)
                }
                else {
                    msg.pm.resolve()
                }
            })
            let tarRecord = null
            try {
                fs.writeFileSync(join(fdSrc, 'fpHash.json'), o.src, 'utf8')
                await o.run({ tr, ev, fdSrc, fdTar })
                let fpTar = join(fdTar, 'fpHash.json')
                if (fs.existsSync(fpTar)) {
                    tarRecord = JSON.parse(fs.readFileSync(fpTar, 'utf8'))
                }
            }
            finally {
                ev.clear()
            }
            assert.ok(await rmDir(dir), `fixture not removed: ${dir}`)
            return { tr, tarRecord }
        }

        let isEv = (type) => (e) => e.type === type

        //runOnce, 同一情境(偵測端紀錄{old.txt}、來源端紀錄{a.txt}: 比對得del old.txt與add a.txt)以指定之onTrace執行至change事件之pm.resolve且偵測端紀錄檔更新
        //  同步點為pm.resolve後讓出一輪(setImmediate): 其前之microtask已更新偵測端紀錄檔; 不依賴onTrace, 故未傳或無效之onTrace亦可同步
        //  noOpt為true時省略第3參數opt
        let runOnce = async (name, onTrace, noOpt = false) => {
            let dir = join(root, name)
            let fdSrc = join(dir, 'src')
            let fdTar = join(dir, 'tar')
            fs.mkdirSync(fdSrc, { recursive: true })
            fs.mkdirSync(fdTar, { recursive: true })
            fs.writeFileSync(join(fdTar, 'fpHash.json'), '{"old.txt":"h9"}', 'utf8')
            let otk = noOpt ? fsTaskCp(fdSrc, fdTar) : fsTaskCp(fdSrc, fdTar, onTrace === undefined ? {} : { onTrace })
            let evS = otk.buildSrc()
            let ev = otk.buildTar()
            let r = null
            try {
                r = await guard(new Promise((resolve) => {
                    ev.on('change', (msg) => {
                        let kpCmp = JSON.parse(JSON.stringify(msg.kpCmp))
                        msg.pm.resolve()
                        setImmediate(() => {
                            resolve({ kpCmp, tar: JSON.parse(fs.readFileSync(join(fdTar, 'fpHash.json'), 'utf8')) })
                        })
                    })
                    evS.writeKp({ 'a.txt': 'h1' })
                }))
            }
            finally {
                ev.clear()
            }
            assert.ok(await rmDir(dir), `fixture not removed: ${dir}`)
            return r
        }

        it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
            this.timeout(120000)
            //R-TRACE-01 P3: 未傳觀察回調(含省略第3參數opt)時行為不變; P4: 回調之拋錯與回傳值不影響偵測、不產生未處理之rejection
            let un = []
            let onUn = (v) => un.push(String(v))
            process.on('unhandledRejection', onUn)
            let rec = traceRec()
            let rs = []
            try {
                //六種情境互相獨立, 並行執行以縮短總耗時(各約2.4秒)
                rs = await Promise.all([
                    runOnce('p3-none', undefined),
                    runOnce('p3-noopt', undefined, true),
                    runOnce('p3-rec', rec.on),
                    runOnce('p3-throw', () => {
                        throw new Error('trace boom')
                    }),
                    runOnce('p3-reject', () => Promise.reject(new Error('trace reject'))),
                    runOnce('p3-invalid', 'abc'),
                ])
                await new Promise((resolve) => setImmediate(resolve)) //讓回調回傳之rejection有機會成為unhandledRejection
            }
            finally {
                process.removeListener('unhandledRejection', onUn)
            }
            //六種結果完全相同: kpCmp依自有鍵比對得del old.txt與add a.txt, 任務成功後偵測端紀錄檔更新為來源端內容
            let exp = {
                kpCmp: { del: [{ fp: 'old.txt', hash: 'h9' }], add: [{ fp: 'a.txt', hash: 'h1' }], same: [], diff: [] },
                tar: { 'a.txt': 'h1' },
            }
            assert.strict.deepStrictEqual(rs, [exp, exp, exp, exp, exp, exp])
            assert.strict.deepStrictEqual(un, [])
            //紀錄器確有收到完整事件
            assert.strict.deepStrictEqual(rec.events.map(fmt), ['recv add', 'run', 'emit +1 -1 ~0 =0', 'settle ok', 'record', 'clear'])
        })

        it(`should notify recv, run, skip, emit, settle, record and clear through onTrace with frozen events of primitive fields and no receiver`, async function() {
            this.timeout(120000)
            //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4)
            let meta = []
            let src = '{"a.txt":"h1"}'
            let tar = '{"old.txt":"h9"}'
            //三個情境互相獨立, 並行執行
            let [a, b, c] = await Promise.all([
                //A: 正常一輪(收到add→比對派發→任務成功→更新紀錄檔), 之後來源端紀錄檔被刪除(收到unlink)而無來源紀錄不偵測
                runTrace('fields-a', {
                    meta,
                    src,
                    tar,
                    run: async ({ tr, fdSrc }) => {
                        await tr.wait(isEv('record'))
                        fs.rmSync(join(fdSrc, 'fpHash.json'))
                        await tr.wait((e) => e.type === 'skip' || e.type === 'emit', 0, 2) //預期為skip; 缺陷版若仍比對派發則為emit(第2個emit計入), 免懸置
                    },
                }),
                //B: 監聽器同步拋錯, 該次pm被reject(settle ok為false)而不更新偵測端紀錄檔
                runTrace('fields-b', {
                    meta,
                    src,
                    tar,
                    onChange: () => {
                        throw new Error('boom')
                    },
                    run: async ({ tr }) => {
                        await tr.wait(isEv('settle'))
                    },
                }),
                //C: 來源端紀錄為空物件(無來源紀錄)不偵測
                runTrace('fields-c', {
                    meta,
                    src: '{}',
                    run: async ({ tr }) => {
                        await tr.wait((e) => e.type === 'skip' || e.type === 'emit')
                    },
                }),
            ])
            assert.strict.deepStrictEqual(a.tr.events.map(fmt), ['recv add', 'run', 'emit +1 -1 ~0 =0', 'settle ok', 'record', 'recv unlink', 'run', 'skip (no src)', 'clear'])
            assert.strict.deepStrictEqual(a.tarRecord, { 'a.txt': 'h1' })
            assert.strict.deepStrictEqual(b.tr.events.map(fmt), ['recv add', 'run', 'emit +1 -1 ~0 =0', 'settle fail', 'clear'])
            assert.strict.deepStrictEqual(b.tarRecord, { 'old.txt': 'h9' }) //任務失敗不更新紀錄檔
            assert.strict.deepStrictEqual(c.tr.events.map(fmt), ['recv add', 'run', 'skip (no src)', 'clear'])
            assert.strict.deepStrictEqual(c.tarRecord, null)
            //各type之欄位固定(排序後)
            let keys = {}
            for (let e of [...a.tr.events, ...b.tr.events, ...c.tr.events]) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { recv: 'kind,type', run: 'type', skip: 'reason,type', emit: 'add,del,diff,same,type', settle: 'ok,type', record: 'type', clear: 'type' })
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual([...a.tr.events, ...b.tr.events, ...c.tr.events].every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
        })

        it(`should update the tar record only after msg.pm resolves`, async function() {
            this.timeout(120000)
            //JSDoc: 使用接收事件資訊msg內的pm做為回傳執行成功與否狀態; 執行成功才更新偵測端紀錄檔
            let held = null
            let r = await runTrace('hold', {
                src: '{"a.txt":"h1"}',
                tar: '{"old.txt":"h9"}',
                onChange: (msg) => {
                    held = msg
                },
                run: async ({ tr, fdTar }) => {
                    await tr.wait(isEv('emit'))
                    //change已派發而pm未settle: 無settle與record事件, 偵測端紀錄檔仍為舊內容
                    assert.strict.deepStrictEqual(tr.events.map(fmt), ['recv add', 'run', 'emit +1 -1 ~0 =0'])
                    assert.strict.deepStrictEqual(JSON.parse(fs.readFileSync(join(fdTar, 'fpHash.json'), 'utf8')), { 'old.txt': 'h9' })
                    held.pm.resolve()
                    await tr.wait(isEv('record'))
                    assert.strict.deepStrictEqual(JSON.parse(fs.readFileSync(join(fdTar, 'fpHash.json'), 'utf8')), { 'a.txt': 'h1' })
                },
            })
            assert.strict.deepStrictEqual(r.tr.events.map(fmt), ['recv add', 'run', 'emit +1 -1 ~0 =0', 'settle ok', 'record', 'clear'])
        })

        it(`should notify clear once and nothing after clear, while a detection already queued in the debounce still runs and dispatches change`, async function() {
            this.timeout(120000)
            //clear不取消已排入debounce(300ms)之偵測(現行行為, 見JSDoc opt.onTrace): 收到變更後立即clear, 偵測仍執行並派發change(任務成功後仍更新紀錄檔), 但clear後不再通知
            let gotChange = null
            let pChange = new Promise((resolve) => {
                gotChange = resolve
            })
            let r = await runTrace('clear-pending', {
                src: '{"a.txt":"h1"}',
                onChange: (msg) => {
                    msg.pm.resolve()
                    setImmediate(gotChange) //pm.resolve之後續(更新紀錄檔)為microtask, 讓出一輪後即已完成
                },
                run: async ({ tr, ev }) => {
                    await tr.wait(isEv('recv'))
                    ev.clear()
                    ev.clear() //重複呼叫不重複通知
                    await guard(pChange)
                },
            })
            assert.strict.deepStrictEqual(r.tr.events.map(fmt), ['recv add', 'clear'])
            assert.strict.deepStrictEqual(r.tarRecord, { 'a.txt': 'h1' })
        })

    })

})
