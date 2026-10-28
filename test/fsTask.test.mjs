import fs from 'fs'
import assert from 'assert'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fsTask from '../src/fsTask.mjs'
import getFileName from '../src/getFileName.mjs'
import { traceRec } from './tools/timeKit.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`fsTask 檔案來源之紀錄須為一般物件(R-OBJ-ITER-01 候選9)`, function() {

    //fpHash.json、fpResult.json 讀自檔案(可能被竄改或損毀), 須視為一般物件之字典: length 為一般鍵, 非一般物件者視為無紀錄
    let root = join(__dirname, '_tmp', 'fsTaskRecord')
    let wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    let item = (p) => [{ type: 'file', path: p }]

    //測試自建自刪(只刪本案資料夾, 不刪 test/_tmp 根目錄)
    after(function() {
        fs.rmSync(root, { recursive: true, force: true })
        assert.strict.strictEqual(fs.existsSync(root), false)
    })

    //mk, 建立案例資料夾: watch 為監看夾(可預放檔案), _tkfs 為儲存夾(可預寫紀錄檔原文)
    let mk = (name, { hash = null, result = null, files = {} } = {}) => {
        let base = join(root, name)
        fs.rmSync(base, { recursive: true, force: true })
        let fd = join(base, 'watch')
        let st = join(base, '_tkfs')
        fs.mkdirSync(fd, { recursive: true })
        fs.mkdirSync(st, { recursive: true })
        for (let [fn, c] of Object.entries(files)) {
            fs.writeFileSync(join(fd, fn), c, 'utf8')
        }
        if (hash !== null) {
            fs.writeFileSync(join(st, 'fpHash.json'), hash, 'utf8')
        }
        if (result !== null) {
            fs.writeFileSync(join(st, 'fpResult.json'), result, 'utf8')
        }
        return { fd, st }
    }

    //watch, 以 40 ms 輪詢 ms 毫秒, 收集 change 事件並立即 resolve 其 pm
    let watch = async (c, ms = 400) => {
        let events = []
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 40 })
        ev.on('change', (msg) => {
            events.push({ type: msg.type, fp: msg.fp, fn: msg.fn, hash: msg.hash })
            msg.pm.resolve()
        })
        try {
            await wait(ms)
        }
        finally {
            ev.clear()
        }
        return events
    }

    let readJson = (c, fn) => JSON.parse(fs.readFileSync(join(c.st, fn), 'utf8'))
    let sortBy = (arr) => [...arr].sort((a, b) => (a.fp < b.fp ? -1 : 1))

    //以下為以觀察回調(opt.onTrace)同步之版本(R-TRACE-01): 原以固定時窗(300~500ms)等待首輪(含2輪)掃描、派發並更新紀錄檔後斷言, 掃描慢於時窗時events少一筆或紀錄檔尚未更新
    //isIdle, 一輪比對結果無任何變更(即先前所有變更皆已派發並記入紀錄檔)
    let isIdle = (e) => e.type === 'compare' && e.add + e.del + e.diff === 0

    //watchUntil, 以 40 ms 輪詢, 收集 change 事件並立即 resolve 其 pm, 等到出現「無任何變更」之比對才停止並回傳事件與觀察紀錄器; 若比對已超過 maxRounds 輪仍未收斂(如重複派發同一變更)亦停止, 交由斷言判定, 以免缺陷版懸置
    let watchUntil = async (c, maxRounds) => {
        let tr = traceRec()
        let events = []
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 40, onTrace: tr.on })
        ev.on('change', (msg) => {
            events.push({ type: msg.type, fp: msg.fp, fn: msg.fn, hash: msg.hash })
            msg.pm.resolve()
        })
        try {
            await tr.wait((e) => isIdle(e) || (e.type === 'compare' && tr.events.filter((x) => x.type === 'compare').length > maxRounds))
        }
        finally {
            ev.clear()
        }
        return { events, tr }
    }

    //seq, 觀察事件轉為簡式字串序列; 略去tick與skip(其有無與次數取決於計時器相對於掃描之時差, 非規格), 路徑類欄位不列入(由change事件斷言)
    let seq = (tr) => tr.events.filter((e) => e.type !== 'tick' && e.type !== 'skip').map((e) => {
        if (e.type === 'scan') {
            return e.phase === 'start' ? 'scan:start' : `scan:end files=${e.files} records=${e.records}`
        }
        if (e.type === 'compare') {
            return `compare +${e.add} -${e.del} ~${e.diff} =${e.same}`
        }
        if (e.type === 'emit' || e.type === 'record') {
            return `${e.type} ${e.kind}`
        }
        if (e.type === 'settle') {
            return `settle ${e.kind} ${e.ok ? 'ok' : 'fail'}`
        }
        return e.type
    })

    it(`should treat a length key of fpHash.json as an ordinary path: one del event per recorded key and none repeated`, async function() {
        //修前: 整個字典依 length 當類陣列迭代, 每個輪詢週期重複派發 { type: 'del', fp: '0', fn: '0', hash: '' }
        let c = mk('hash-length', { hash: '{"length":1,"a":"h"}' })
        let { events, tr } = await watchUntil(c, 4)
        //每鍵恰一個del事件且不重複(修前之缺陷版重複派發而不收斂, 比對超過4輪即停止並使此斷言失敗)
        assert.strict.deepStrictEqual(sortBy(events), [
            { type: 'del', fp: 'a', fn: 'a', hash: 'h' },
            { type: 'del', fp: 'length', fn: 'length', hash: 1 },
        ])
        assert.strict.deepStrictEqual(readJson(c, 'fpHash.json'), {})
        //恰2輪掃描各派發1個del並於派發後更新紀錄檔(紀錄筆數2→1→0), 第3輪為無變更之比對, 隨後clear
        assert.strict.deepStrictEqual(seq(tr), [
            'scan:start', 'scan:end files=0 records=2', 'compare +0 -2 ~0 =0', 'emit del', 'settle del ok', 'record del',
            'scan:start', 'scan:end files=0 records=1', 'compare +0 -1 ~0 =0', 'emit del', 'settle del ok', 'record del',
            'scan:start', 'scan:end files=0 records=0', 'compare +0 -0 ~0 =0', 'clear',
        ])
    })

    it(`should dispatch one del event for a recorded path and update the record (control without length)`, async function() {
        let c = mk('hash-control', { hash: '{"a":"h"}' })
        let { events, tr } = await watchUntil(c, 3)
        assert.strict.deepStrictEqual(events, [{ type: 'del', fp: 'a', fn: 'a', hash: 'h' }])
        assert.strict.deepStrictEqual(readJson(c, 'fpHash.json'), {})
        assert.strict.deepStrictEqual(seq(tr), [
            'scan:start', 'scan:end files=0 records=1', 'compare +0 -1 ~0 =0', 'emit del', 'settle del ok', 'record del',
            'scan:start', 'scan:end files=0 records=0', 'compare +0 -0 ~0 =0', 'clear',
        ])
    })

    it(`should dispatch add once for a watched file named length`, async function() {
        let c = mk('hash-file-length', { files: { length: 'abc' } })
        let { events, tr } = await watchUntil(c, 3)
        assert.strict.deepStrictEqual(events.map((v) => [v.type, v.fn]), [['add', 'length']])
        assert.strict.deepStrictEqual(Object.keys(readJson(c, 'fpHash.json')), [events[0].fp])
        assert.strict.deepStrictEqual(seq(tr), [
            'scan:start', 'scan:end files=1 records=0', 'compare +1 -0 ~0 =0', 'emit add', 'settle add ok', 'record add',
            'scan:start', 'scan:end files=1 records=1', 'compare +0 -0 ~0 =1', 'clear',
        ])
    })

    let notObjs = ['["a","b"]', '"abc"', '123', 'null', 'true', '{bad', '']
    for (let content of notObjs) {
        it(`should treat fpHash.json as no record when it is not a plain object (${JSON.stringify(content)}): no event for an empty folder`, async function() {
            let c = mk('hash-notobj', { hash: content })
            let events = await watch(c, 300)
            assert.strict.deepStrictEqual(events, [])
        })

        it(`should dispatch add once for a new file and record it when fpHash.json is not a plain object (${JSON.stringify(content)})`, async function() {
            let c = mk('hash-notobj-file', { hash: content, files: { 'f.txt': 'abc' } })
            let { events, tr } = await watchUntil(c, 3)
            assert.strict.deepStrictEqual(events.map((v) => [v.type, v.fn]), [['add', 'f.txt']])
            assert.strict.deepStrictEqual(Object.keys(readJson(c, 'fpHash.json')), [events[0].fp])
            //非一般物件視為無紀錄(records=0): 第1輪add派發並寫入紀錄檔, 第2輪為無變更之比對
            assert.strict.deepStrictEqual(seq(tr), [
                'scan:start', 'scan:end files=1 records=0', 'compare +1 -0 ~0 =0', 'emit add', 'settle add ok', 'record add',
                'scan:start', 'scan:end files=1 records=1', 'compare +0 -0 ~0 =1', 'clear',
            ])
        })
    }

    it(`should keep other results and the length key when fpResult.json has a length key and a result is taken`, function() {
        //修前: each 依 length 當類陣列迭代, 其他結果全被清空, 檔案寫成 {}
        let c = mk('result-length', { result: JSON.stringify({ 'length': 0, 'a|h': item('x'), 'b|h': item('y') }) })
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
        try {
            assert.strict.deepStrictEqual(ev.getAndEliminateResult('a', 'h'), item('x'))
        }
        finally {
            ev.clear()
        }
        assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'length': 0, 'b|h': item('y') })
    })

    it(`should keep other results when a result is taken (control without length)`, function() {
        let c = mk('result-control', { result: JSON.stringify({ 'a|h': item('x'), 'b|h': item('y') }) })
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
        try {
            assert.strict.deepStrictEqual(ev.getAndEliminateResult('a', 'h'), item('x'))
        }
        finally {
            ev.clear()
        }
        assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'b|h': item('y') })
    })

    for (let content of notObjs) {
        it(`should treat fpResult.json as no record when it is not a plain object (${JSON.stringify(content)}): setResult does not throw and results can be taken`, function() {
            //修前: 字串/數字/null/布林使 setResult 拋 TypeError, 字串被展開寫成 {"0":"a",...}
            let c = mk('result-notobj', { result: content })
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
            try {
                assert.strict.deepStrictEqual(ev.getAndEliminateResult('x', 'y'), [])
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), {})
                ev.setResult('f', 'h', item('p'))
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'f|h': item('p') })
                assert.strict.deepStrictEqual(ev.getAndEliminateResult('f', 'h'), item('p'))
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), {})
            }
            finally {
                ev.clear()
            }
        })
    }

    describe(`fsTask 觀察回調(onTrace, R-TRACE-01)`, function() {

        //runOnce, 同一情境(紀錄檔含已不存在之gone、資料夾新增a.txt: 依序派發del gone、add a.txt)以指定之onTrace執行, 兩個change皆settle且紀錄檔更新後回傳結果
        //  同步點為第2個change之pm.resolve後讓出一輪(setImmediate): 其前之microtask已完成紀錄檔寫入; 不依賴onTrace, 故未傳或無效之onTrace亦可同步; 防懸置用真實計時器
        let runOnce = (onTrace) => new Promise((resolve, reject) => {
            let c = mk('trace-p3', { hash: '{"gone":"h0"}', files: { 'a.txt': 'abc' } })
            let opt = { fdStorage: c.st, timeInterval: 40 }
            if (onTrace !== undefined) {
                opt.onTrace = onTrace
            }
            let ev = fsTask(c.fd, opt)
            let events = []
            let tGuard = setTimeout(() => {
                ev.clear()
                reject(new Error('runOnce: not finished'))
            }, 20000)
            ev.on('change', (msg) => {
                events.push({ type: msg.type, fn: msg.fn, hash: msg.hash })
                msg.pm.resolve()
                if (events.length === 2) {
                    setImmediate(() => {
                        clearTimeout(tGuard)
                        ev.clear()
                        resolve({ events, record: readJson(c, 'fpHash.json') })
                    })
                }
            })
        })

        it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
            //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳值不影響偵測、不產生未處理之rejection
            let un = []
            let onUn = (v) => un.push(String(v))
            process.on('unhandledRejection', onUn)
            let rec = traceRec()
            let rs = []
            try {
                for (let onTrace of [undefined, rec.on, () => {
                    throw new Error('trace boom')
                }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                    rs.push(await runOnce(onTrace))
                }
                await new Promise((resolve) => setImmediate(resolve)) //讓回調回傳之rejection有機會成為unhandledRejection
            }
            finally {
                process.removeListener('unhandledRejection', onUn)
            }
            //五種結果完全相同: 先del gone後add a.txt, 紀錄檔只剩a.txt
            for (let r of rs) {
                assert.strict.deepStrictEqual(r, rs[0])
            }
            assert.strict.deepStrictEqual(rs[0].events.map((v) => [v.type, v.fn]), [['del', 'gone'], ['add', 'a.txt']])
            assert.strict.deepStrictEqual(Object.keys(rs[0].record).map(getFileName), ['a.txt'])
            assert.strict.deepStrictEqual(un, [])
            //紀錄器確有收到事件(兩輪變更皆已記入紀錄檔)
            assert.strict.deepStrictEqual(rec.events.filter((e) => e.type === 'record').map((e) => e.kind), ['del', 'add'])
        })

        it(`should notify tick, skip, scan, compare, emit, settle, record, fail and clear through onTrace with frozen events of primitive fields and no receiver`, async function() {
            //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4)
            let meta = []
            let tr = traceRec()
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                tr.on(e)
            }

            //情境A: add, 該change之pm待輪詢被lock擋下(skip)後才settle, 至紀錄檔更新(tick、skip、scan、compare、emit、settle ok、record)
            let k = tr.mark()
            let cA = mk('trace-fields-a', { files: { 'a.txt': 'abc' } })
            let evA = fsTask(cA.fd, { fdStorage: cA.st, timeInterval: 20, onTrace })
            evA.on('change', (msg) => {
                tr.wait((e) => e.type === 'skip', tr.mark()).then(() => msg.pm.resolve(), () => {})
            })
            try {
                await tr.wait((e) => e.type === 'record', k)
            }
            finally {
                evA.clear() //clear
            }

            //情境B: 監聽器同步拋錯, 該change之pm被reject(settle ok為false)
            k = tr.mark()
            let cB = mk('trace-fields-b', { files: { 'a.txt': 'abc' } })
            let evB = fsTask(cB.fd, { fdStorage: cB.st, timeInterval: 20, onTrace })
            evB.on('error', () => {})
            evB.on('change', () => {
                throw new Error('boom')
            })
            try {
                await tr.wait((e) => e.type === 'settle' && !e.ok, k)
            }
            finally {
                evB.clear()
            }

            //情境C: 計算雜湊失敗(無效之雜湊方法), 該輪掃描中止(fail)
            k = tr.mark()
            let cC = mk('trace-fields-c', { files: { 'a.txt': 'abc' } })
            let evC = fsTask(cC.fd, { fdStorage: cC.st, timeInterval: 20, typeHash: 'nosuchalg', onTrace })
            try {
                await tr.wait((e) => e.type === 'fail', k)
            }
            finally {
                evC.clear()
            }

            //各type之欄位固定(排序後); scan依phase分列
            let keys = {}
            for (let e of tr.events) {
                keys[e.type === 'scan' ? `scan:${e.phase}` : e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, {
                'tick': 'busy,type',
                'skip': 'reason,type',
                'scan:start': 'phase,type',
                'scan:end': 'files,phase,records,type',
                'compare': 'add,del,diff,same,type',
                'emit': 'fp,kind,type',
                'settle': 'fp,kind,ok,type',
                'record': 'fp,kind,type',
                'fail': 'type',
                'clear': 'type',
            })
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual(tr.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
            //欄位值: skip之reason為lock; emit、settle、record之kind為add、fp為字串; 拋錯之監聽器使settle之ok為false
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'skip').every((e) => e.reason === 'lock'), true)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').every((e) => e.kind === 'add' && getFileName(e.fp) === 'a.txt'), true)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'settle').map((e) => e.ok), [true, false])
        })

        it(`should hold the next dispatch while a change is unsettled: polling goes on (skip) without scanning, and the next change is dispatched after the record`, async function() {
            //JSDoc: 每輪偵測只派發一個變更檔並等待其msg.pm settle後才進行下一個(嚴格順序)
            let c = mk('trace-lock', { files: { 'a.txt': 'A', 'b.txt': 'B' } })
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 20, onTrace: tr.on })
            let fns = []
            ev.on('change', (msg) => {
                fns.push(msg.fn)
                if (fns.length === 1) {
                    //待輪詢在pm未settle期間持續進行(被lock擋下之skip, 或缺陷版之scan)後才settle
                    tr.wait((e) => e.type === 'skip' || e.type === 'scan', tr.mark()).then(() => msg.pm.resolve(), () => {})
                }
                else {
                    msg.pm.resolve()
                }
            })
            try {
                await tr.wait((e) => e.type === 'record', 0, 2)
            }
            finally {
                ev.clear()
            }
            let types = tr.events.map((e) => e.type)
            let iEmit1 = types.indexOf('emit')
            let iSettle1 = types.indexOf('settle')
            let iRecord1 = types.indexOf('record')
            let iEmit2 = types.indexOf('emit', iEmit1 + 1)
            //第1個change之emit至settle之間僅有tick與skip(不掃描、不比對、不再派發), 且至少有一個skip, 其reason為lock
            let between = tr.events.slice(iEmit1 + 1, iSettle1)
            assert.strict.deepStrictEqual(between.every((e) => e.type === 'tick' || e.type === 'skip'), true)
            assert.strict.deepStrictEqual(between.filter((e) => e.type === 'skip').length >= 1, true)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'skip').every((e) => e.reason === 'lock'), true)
            //第2個change於第1個change之紀錄檔更新之後才派發, 且為另一個檔案
            assert.strict.deepStrictEqual(iSettle1 < iRecord1 && iRecord1 < iEmit2, true)
            assert.strict.deepStrictEqual([...fns].sort(), ['a.txt', 'b.txt'])
            assert.strict.deepStrictEqual(types.filter((t) => t === 'emit').length, 2)
        })

        it(`should settle a change as failed when its listener throws, keep the record, and dispatch the same change again in the next round`, async function() {
            //JSDoc: 任務失敗(pm被reject)不更新紀錄故下輪會重試同一檔; change監聽器同步拋錯時先reject該次msg.pm再以error事件回報
            let c = mk('trace-fail-listener', { files: { 'a.txt': 'abc' } })
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 40, onTrace: tr.on })
            let errs = []
            ev.on('error', (e) => errs.push(e.fun))
            let n = 0
            ev.on('change', (msg) => {
                n++
                if (n === 1) {
                    throw new Error('boom')
                }
                msg.pm.resolve()
            })
            try {
                await tr.wait((e) => e.type === 'record')
            }
            finally {
                ev.clear()
            }
            assert.strict.deepStrictEqual(seq(tr), [
                'scan:start', 'scan:end files=1 records=0', 'compare +1 -0 ~0 =0', 'emit add', 'settle add fail',
                'scan:start', 'scan:end files=1 records=0', 'compare +1 -0 ~0 =0', 'emit add', 'settle add ok', 'record add',
                'clear',
            ])
            assert.strict.deepStrictEqual(errs, ['listener'])
            assert.strict.deepStrictEqual(Object.keys(readJson(c, 'fpHash.json')).map(getFileName), ['a.txt'])
        })

        it(`should report fail and keep scanning when a scan fails (invalid hash type)`, async function() {
            let c = mk('trace-fail-scan', { files: { 'a.txt': 'abc' } })
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 20, typeHash: 'nosuchalg', onTrace: tr.on })
            let changes = 0
            ev.on('change', () => {
                changes++
            })
            try {
                await tr.wait((e) => e.type === 'fail', 0, 2)
            }
            finally {
                ev.clear()
            }
            //每輪皆開始掃描後失敗, 不比對、不派發; 失敗後下一輪仍會掃描(定時器不中止)
            assert.strict.deepStrictEqual(seq(tr), ['scan:start', 'fail', 'scan:start', 'fail', 'clear'])
            assert.strict.deepStrictEqual(changes, 0)
            assert.strict.deepStrictEqual(fs.existsSync(join(c.st, 'fpHash.json')), false)
        })

        it(`should dispatch add, diff and del for one file in turn, each recorded before the next operation`, async function() {
            let c = mk('trace-kinds')
            let fp = join(c.fd, 'f.txt')
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 40, onTrace: tr.on })
            let events = []
            ev.on('change', (msg) => {
                events.push({ type: msg.type, fn: msg.fn, hash: msg.hash })
                msg.pm.resolve()
            })
            try {
                //每個操作於上一個變更之紀錄檔更新事件之後進行(此時無掃描進行中, 也尚未有下一輪掃描)
                let k = tr.mark()
                fs.writeFileSync(fp, 'v1', 'utf8')
                await tr.wait((e) => e.type === 'record' && e.kind === 'add', k)
                k = tr.mark()
                fs.writeFileSync(fp, 'v2', 'utf8')
                await tr.wait((e) => e.type === 'record' && e.kind === 'diff', k)
                k = tr.mark()
                fs.rmSync(fp)
                await tr.wait((e) => e.type === 'record' && e.kind === 'del', k)
            }
            finally {
                ev.clear()
            }
            assert.strict.deepStrictEqual(events.map((v) => [v.type, v.fn]), [['add', 'f.txt'], ['diff', 'f.txt'], ['del', 'f.txt']])
            //add與diff之hash為新內容之雜湊而不同, del之hash為刪除前最後記錄者(同diff)
            assert.strict.deepStrictEqual(events[0].hash !== events[1].hash, true)
            assert.strict.deepStrictEqual(events[2].hash, events[1].hash)
            //每個emit事件之kind與fp同其change事件之type與fp; 各次比對之件數對應該種變更
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').map((e) => [e.kind, getFileName(e.fp)]), [['add', 'f.txt'], ['diff', 'f.txt'], ['del', 'f.txt']])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'compare' && !isIdle(e)).map((e) => `+${e.add} -${e.del} ~${e.diff}`), ['+1 -0 ~0', '+0 -0 ~1', '+0 -1 ~0'])
            assert.strict.deepStrictEqual(readJson(c, 'fpHash.json'), {})
        })

        it(`should notify clear once and nothing after clear`, async function() {
            let c = mk('trace-clear')
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 20, onTrace: tr.on })
            await tr.wait(isIdle) //至少已有一輪完整偵測(此時無掃描進行中)
            ev.clear()
            ev.clear() //重複呼叫不重複通知
            let n = tr.events.length
            assert.strict.deepStrictEqual(tr.events[n - 1].type, 'clear')
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'clear').length, 1)
            //否定斷言之觀察窗(clear後不再有事件): 短暫真實等待, 窗內事件變少只會漏抓不會誤判; 停止本身已由上列clear事件斷言
            await new Promise((resolve) => setTimeout(resolve, 150))
            assert.strict.deepStrictEqual(tr.events.length, n)
        })

        it(`should not notify the settle and record of a change that is settled after clear`, async function() {
            //JSDoc opt.onTrace: clear後不再通知; 已派發而pm未settle者於clear後才settle: 該任務仍照常處理(同舊版), 但不再有settle與record事件
            let c = mk('trace-clear-pending', { files: { 'a.txt': 'abc' } })
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 20, onTrace: tr.on })
            let held = null
            ev.on('change', (msg) => {
                held = msg //刻意不settle
            })
            await tr.wait((e) => e.type === 'emit')
            ev.clear()
            let n = tr.events.length
            assert.strict.deepStrictEqual(tr.events[n - 1].type, 'clear')
            held.pm.resolve()
            await new Promise((resolve) => setImmediate(resolve)) //pm.resolve之後續為microtask, 讓出一輪即已全數執行
            assert.strict.deepStrictEqual(tr.events.length, n)
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'settle' || e.type === 'record').length, 0)
        })

        it(`should not start a scan while the previous scan is running: scans never overlap and a pending change is dispatched once`, async function() {
            //busy守門(見src註解): lock於await calcHash之後才取得, 掃描慢於timeInterval時多輪會同時通過lock檢查而對同一檔重複派工
            let c = mk('trace-busy')
            for (let i = 0; i < 40; i++) {
                fs.writeFileSync(join(c.fd, `f${i}.txt`), 'x'.repeat(20000), 'utf8')
            }
            let tr = traceRec()
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 2, onTrace: tr.on }) //掃描40個檔需數十次非同步讀取, 遠長於2ms
            let fns = []
            ev.on('change', (msg) => {
                fns.push(msg.fn) //刻意不settle pm
            })
            try {
                await tr.wait((e) => e.type === 'emit')
                await tr.wait((e) => e.type === 'skip' || e.type === 'emit', tr.mark(), 10) //派發後輪詢持續進行(被lock擋下之skip)10次; 缺陷版之重複派發(emit)亦計入, 免懸置
            }
            finally {
                ev.clear()
            }
            //掃描開始與結束嚴格交替(上一輪未結束不再開始新的一輪)
            let phases = tr.events.filter((e) => e.type === 'scan').map((e) => e.phase)
            assert.strict.deepStrictEqual(phases.every((p, i) => p === (i % 2 === 0 ? 'start' : 'end')), true)
            //pm未settle期間只派發1次
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').length, 1)
            assert.strict.deepStrictEqual(fns.length, 1)
            //掃描進行中到期之定時器被略過(busy為true)
            assert.strict.deepStrictEqual(tr.events.some((e) => e.type === 'tick' && e.busy === true), true)
        })

    })

})

describe(`fsTask`, function() {

    //test, 步進式(R-TRACE-01): 做一個檔案操作 → 等被測函數以觀察事件回報該操作已處理完(紀錄檔已更新) → 才做下一個操作
    //  原於3/6/9/12s排定操作、15s結算, 偵測為500ms輪詢加2000ms模擬計算: 負載下偵測延遲使'del def.txt'晚於15s而少一筆, 或掃描中途讀到abc=mnop而def尚未出現使diff先於add def
    //  操作皆於「無掃描進行中」之時點做(上一個變更之紀錄檔更新事件之後: lock尚未釋放, 下一輪定時器尚未到期), 故一次掃描必看到完整的操作結果
    let trLast = null //最近一次test之觀察事件, 供it斷言
    let test = async () => {
        return new Promise((resolve, reject) => {
            let ms = []

            let fpc = './_tkfs'
            fsDeleteFolder(fpc) //預先清除fsTask持久化數據資料夾

            let fpt = './_test_fsTask'
            fsDeleteFolder(fpt) //預先清除任務資料夾

            let fpr = './_test_fsTask_result'
            fsCreateFolder(fpr) //創建結果資料夾

            let tr = traceRec() //等事件之防懸置上限為預設20秒, 遠大於各步正常耗時
            trLast = tr
            let ev = fsTask(fpt, { timeInterval: 500, onTrace: tr.on })
            ev.on('change', (msg) => {
                // console.log(msg.type, msg.fn)

                //content
                let c = ''
                try {
                    c = fs.readFileSync(msg.fp, 'utf8')
                }
                catch (err) {}

                if (msg.fn === 'abc.txt') {
                    //僅針對abc.txt任務

                    if (msg.type === 'add' || msg.type === 'diff') {
                        //針對新增或變更任務

                        // console.log(`task[${msg.fn}]`, `content[${c}]`, 'calculating')
                        ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'calculating' })

                        //模擬計算延遲: 原為2000ms計時器, 其用意是計算比輪詢(500ms)慢, 即計算期間輪詢持續進行但不得再派發(嚴格順序), 時長本身非規格; 改為等觀察到輪詢在計算期間被lock擋下(skip事件)才算完成
                        tr.wait((e) => e.type === 'skip', tr.mark()).then(() => {

                            //模擬計算完儲存結果
                            fs.writeFileSync(`${fpr}/res1.json`, 'res1', 'utf8')
                            fs.writeFileSync(`${fpr}/res2.json`, 'res2', 'utf8')

                            //使用setResult紀錄完成分析後之關聯結果檔
                            ev.setResult(msg.fp, msg.hash, [
                                {
                                    type: 'file',
                                    path: `${fpr}/res1.json`,
                                },
                                {
                                    type: 'file',
                                    path: `${fpr}/res2.json`,
                                },
                            ])

                            // console.log(`task[${msg.fn}]`, `content[${c}]`, 'save-result')
                            ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'save-result' })

                            msg.pm.resolve()
                        }, () => {}) //逾防懸置上限(整案已因等待事件逾時而失敗)則不再處理

                    }
                    else { //msg.type === 'del'
                        //針對任務刪除

                        // console.log(`task[${msg.fn}]`, 'remove-task')
                        ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-task' })

                        //刪除任務時, 自動刪除關聯結果檔
                        let rrs = ev.getAndEliminateResult(msg.fp, msg.hash)
                        // console.log('rrs', rrs)
                        for (let k = 0; k < rrs.length; k++) {
                            fsDeleteFile(rrs[k].path)
                        }

                        // console.log(`task[${msg.fn}]`, 'remove-result')
                        ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-result' })

                        msg.pm.resolve()
                    }

                }
                else {
                    //針對其他任務

                    // console.log(`task[${msg.fn}]`, `content[${c}]`, 'skip')
                    ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'skip' })
                    msg.pm.resolve()
                }

            })

            let isRecord = (kind, fn) => (e) => e.type === 'record' && e.kind === kind && getFileName(e.fp) === fn

            let steps = async () => {

                //第0步: 建立任務資料夾(原於1ms後建立), 先有一輪偵測(任務資料夾為空)
                fsCreateFolder(fpt)
                await tr.wait((e) => e.type === 'compare' && e.add + e.del + e.diff === 0)

                //第1步: 新增abc.txt, 等其add處理完(含模擬計算與紀錄檔更新)
                let k = tr.mark()
                fs.writeFileSync(`${fpt}/abc.txt`, 'abc', 'utf8')
                await tr.wait(isRecord('add', 'abc.txt'), k)

                //第2步: abc.txt改為mnop並新增def.txt(同步連寫), 等add def.txt與diff abc.txt處理完
                k = tr.mark()
                fs.writeFileSync(`${fpt}/abc.txt`, 'mnop', 'utf8')
                fs.writeFileSync(`${fpt}/def.txt`, 'def', 'utf8')
                await tr.wait(isRecord('add', 'def.txt'), k)
                await tr.wait(isRecord('diff', 'abc.txt'), k)

                //第3步: 刪除abc.txt, 等del abc.txt處理完
                k = tr.mark()
                fsDeleteFile(`${fpt}/abc.txt`)
                await tr.wait(isRecord('del', 'abc.txt'), k)

                //第4步: 最終階段清除任務資料夾(def.txt隨之消失), 等del def.txt處理完
                k = tr.mark()
                fsDeleteFolder(fpt)
                await tr.wait(isRecord('del', 'def.txt'), k)

            }

            steps()
                .then(() => {
                    ev.clear() //結束後中止ev
                    fsDeleteFolder(fpc) //結束後清除fsTask持久化數據資料夾
                    fsDeleteFolder(fpr) //結束後清除結果資料夾
                    fsDeleteFolder(fpt)
                    // console.log('ms', ms)
                    resolve(ms)
                })
                .catch((err) => {
                    ev.clear()
                    fsDeleteFolder(fpc)
                    fsDeleteFolder(fpr)
                    fsDeleteFolder(fpt)
                    reject(err)
                })

        })
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // add abc.txt
    // task[abc.txt] content[abc] calculating
    // task[abc.txt] content[abc] save-result
    // add def.txt
    // task[def.txt] content[def] skip
    // diff abc.txt
    // task[abc.txt] content[mnop] calculating
    // task[abc.txt] content[mnop] save-result
    // del abc.txt
    // task[abc.txt] remove-task
    // task[abc.txt] remove-result
    // del def.txt
    // task[def.txt] content[] skip
    let ms = [
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'calculating' },
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'save-result' },
        { type: 'add', fp: 'def.txt', content: 'def', mode: 'skip' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'calculating' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'save-result' },
        { type: 'del', fp: 'abc.txt', mode: 'remove-task' },
        { type: 'del', fp: 'abc.txt', mode: 'remove-result' },
        { type: 'del', fp: 'def.txt', content: '', mode: 'skip' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)

        //觀察事件: 變更依序派發(add abc、add def、diff abc、del abc、del def; 同次比對add先於diff)
        let evs = trLast.events
        assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'emit').map((e) => `${e.kind} ${getFileName(e.fp)}`), ['add abc.txt', 'add def.txt', 'diff abc.txt', 'del abc.txt', 'del def.txt'])
        //每個變更皆於派發後settle成功並更新紀錄檔, 嚴格順序: 其emit至settle之間僅有tick與skip(輪詢持續進行但不掃描、不再派發)
        let types = evs.map((e) => e.type)
        let idxs = types.map((t, i) => (t === 'emit' ? i : -1)).filter((i) => i >= 0)
        assert.strict.deepStrictEqual(idxs.length, 5)
        for (let i of idxs) {
            let j = types.indexOf('settle', i)
            assert.strict.deepStrictEqual(evs[j].ok, true)
            assert.strict.deepStrictEqual(types[j + 1], 'record')
            assert.strict.deepStrictEqual(evs.slice(i + 1, j).every((e) => e.type === 'tick' || e.type === 'skip'), true)
        }
        //模擬計算(add abc、diff abc)期間輪詢持續進行: 其emit至settle之間必有skip(被lock擋下)
        for (let i of [idxs[0], idxs[2]]) {
            let j = types.indexOf('settle', i)
            assert.strict.deepStrictEqual(evs.slice(i + 1, j).some((e) => e.type === 'skip'), true)
        }
    })

})
