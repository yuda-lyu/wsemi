import fs from 'fs'
import path from 'path'
import assert from 'assert'
import getFileName from '../src/getFileName.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import fsWatchFile from '../src/fsWatchFile.mjs'
import { traceRec } from './tools/timeKit.mjs'
import { sleep, waitUntil, withFakeChokidar, fiveOnTrace, collectUnhandled } from './tools/fsWatchKit.mjs'


describe(`fsWatchFile`, function() {

    //guard, 等事件之防懸置上限(只防懸置, 真實檔案監看每個操作之事件約2.1秒內到達)
    let guard = 45000

    //act, 做一個檔案操作, 並等被測函數回報該操作之全部n個emit事件
    let act = async (tr, n, fun) => {
        let from = tr.mark()
        fun()
        await tr.wait((e) => e.type === 'emit', from, n)
    }

    //test, 真實檔案監看(chokidar, awaitWriteFinish穩定期約2.1秒)之事件來源是作業系統與chokidar而非被測函數之計時器, 不能用假時鐘
    //  原以固定時刻(1/3000/6000/9000/12000ms)排程檔案操作並於15000ms收結果, 負載下事件延遲>=約0.9秒即下一操作(rename、刪除)先發生使add被吞, 或最後unlink晚於結束計時器, 造成少一筆或型別序錯(R-TRACE-01)
    //  改為步進式: 做一個操作→等onTrace之emit事件→才做下一個; 起始先等ready; 預期事件序列同原案
    let test = async () => {
        let fp = './_test_fsWatchFile.txt'

        fsDeleteFile(fp)
        fsDeleteFile(fp + '.tmp')

        let ms = []
        let tr = traceRec({ guard })
        let ev = fsWatchFile(fp, { onTrace: tr.on })
        ev.on('change', (msg) => {
            // console.log(msg.type, getFileName(msg.fp))
            ms.push({ type: msg.type, fp: getFileName(msg.fp) })
        })

        try {

            //監看檔案尚不存在: 先等到一次輪詢確認不存在且尚無watcher, 再建立檔案
            await tr.wait((e) => e.type === 'tick' && !e.watching && !e.exists)
            await act(tr, 1, () => fs.writeFileSync(fp, 'abc', 'utf8')) //add(初始掃描, 尚未進入穩定期)
            await tr.wait((e) => e.type === 'ready') //初始掃描完成後, 其後之add與change才經穩定期

            await act(tr, 1, () => fsRenameFile(fp, fp + '.tmp')) //unlink
            await act(tr, 1, () => fsRenameFile(fp + '.tmp', fp)) //add
            await act(tr, 1, () => fs.writeFileSync(fp, 'def', 'utf8')) //change
            await act(tr, 1, () => fsDeleteFile(fp)) //unlink

            //收尾: 最後一個unlink後保留一個短暫觀察窗(否定斷言: 不應再有多餘事件), 原案為15秒結束前之3秒
            await sleep(300)

        }
        finally {
            ev.clear()
            fsDeleteFile(fp)
            fsDeleteFile(fp + '.tmp')
        }

        return { ms, emits: tr.events.filter((e) => e.type === 'emit') }
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // add _test_fsWatchFile.txt
    // unlink _test_fsWatchFile.txt
    // add _test_fsWatchFile.txt
    // change _test_fsWatchFile.txt
    // unlink _test_fsWatchFile.txt
    let ms = [
        { type: 'add', fp: '_test_fsWatchFile.txt' },
        { type: 'unlink', fp: '_test_fsWatchFile.txt' },
        { type: 'add', fp: '_test_fsWatchFile.txt' },
        { type: 'change', fp: '_test_fsWatchFile.txt' },
        { type: 'unlink', fp: '_test_fsWatchFile.txt' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r.ms, rr)
        //觀察回調: emit事件(即將派發)與change監聽器收到者一一對應
        assert.strict.deepStrictEqual(r.emits.map((e) => ({ type: e.kind, fp: getFileName(e.fp) })), rr)
    })

    //
    //以下為語意案(R-TRACE-01), 各用專屬夾具
    //

    it(`should poll with tick(exists:false, watching:false) and create no watcher while the file is absent, then notify watch, emit add and ready after it appears, and clear, unwatch, closed on clear`, async function() {
        //JSDoc: 檔案尚不存在時週期輪詢只回報tick; 出現後建立chokidar watcher(watch), 初始掃描派發add後ready; 已有watcher時不再查檔案(exists為null); clear停止全部監聽
        let fp = './_test_fsWatchFile_s1.txt'
        fsDeleteFile(fp)
        let tr = traceRec({ guard })
        let ev = fsWatchFile(fp, { onTrace: tr.on, timeInterval: 20 })
        try {
            await tr.wait((e) => e.type === 'tick', 0, 3)
            //不存在期間: 只有tick且皆為(尚無watcher, 路徑不存在)
            assert.strict.deepStrictEqual(tr.events.every((e) => e.type === 'tick' && e.watching === false && e.exists === false), true)

            //出現: 看到檔案之那次tick(watching:false, exists:true)之後緊接watch, 初始掃描之add早於ready, 其後之tick皆已有watcher(不再查檔案)
            let from = tr.mark()
            fs.writeFileSync(fp, 'abc', 'utf8')
            await tr.wait((e) => e.type === 'ready', from)
            let rest = tr.events.slice(from)
            assert.strict.deepStrictEqual(rest.slice(0, 2).map((e) => e.type), ['tick', 'watch'])
            assert.strict.deepStrictEqual({ w: rest[0].watching, x: rest[0].exists }, { w: false, x: true })
            let after = rest.slice(2)
            assert.strict.deepStrictEqual(after.filter((e) => e.type === 'tick').every((e) => e.watching === true && e.exists === null), true)
            let others = after.filter((e) => e.type !== 'tick')
            assert.strict.deepStrictEqual(others.map((e) => e.type), ['emit', 'ready'])
            assert.strict.deepStrictEqual({ kind: others[0].kind, fp: others[0].fp }, { kind: 'add', fp: path.resolve(fp) })

            //clear: clear→unwatch→closed, clearInterval使其後不再有任何事件(含tick); 關閉完成後重複clear不再通知
            let iClear = tr.mark()
            ev.clear()
            await tr.wait((e) => e.type === 'closed', iClear)
            ev.clear()
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])
        }
        finally {
            ev.clear()
            fsDeleteFile(fp)
        }
    })

    it(`should notify nothing after clear (clear, unwatch, closed only) even for a write pending inside the watcher`, async function() {
        //JSDoc: clear為停止全部監聽, 其後不再通知(unwatch與closed為資源釋放之回報); 事件以clear事件斷言, 否定斷言保留一個略長於穩定期(約2.1秒)之觀察窗
        let fp = './_test_fsWatchFile_s2.txt'
        fsDeleteFile(fp)
        fs.writeFileSync(fp, 'abc', 'utf8')
        let ms = []
        let tr = traceRec({ guard })
        let ev = fsWatchFile(fp, { onTrace: tr.on, timeInterval: 20 })
        ev.on('change', (msg) => {
            ms.push(msg.type)
        })
        try {
            await tr.wait((e) => e.type === 'ready')
            assert.strict.deepStrictEqual(ms, ['add'])

            //修改(穩定期內尚未回報)後立即clear
            fs.writeFileSync(fp, 'defg', 'utf8')
            let iClear = tr.mark()
            ev.clear()
            await tr.wait((e) => e.type === 'closed', iClear)
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])

            //觀察窗(否定斷言): 略長於穩定期, 其間不得再有任何事件或派發
            await sleep(2600)
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])
            assert.strict.deepStrictEqual(ms, ['add'])
        }
        finally {
            ev.clear()
            fsDeleteFile(fp)
        }
    })

    it(`should notify emit for each watcher event with kind and resolved fp before the change listener, error before the error listener, and nothing after clear (fake chokidar)`, async function() {
        //以假watcher決定性地送出ready、all、error(不經作業系統與穩定期); JSDoc: watcher自身出錯以error事件回報{ fun: 'watcher', msg }
        let fp = './_test_fsWatchFile_f1.txt'
        fsDeleteFile(fp)
        fs.writeFileSync(fp, 'abc', 'utf8')
        try {
            await withFakeChokidar(async (ws) => {
                let rec = traceRec({ guard })
                let order = []
                let ev = fsWatchFile(fp, {
                    onTrace: (e) => {
                        if (e.type !== 'tick') {
                            order.push('trace:' + e.type)
                        }
                        rec.on(e)
                    },
                    timeInterval: 20,
                })
                ev.on('change', (m) => order.push('change:' + m.type))
                ev.on('error', (m) => order.push('error:' + m.fun + ':' + m.msg.code))
                await rec.wait((e) => e.type === 'watch')
                let w = ws[0]

                //chokidar.watch之引數與監聽器: all、error各一, 傳了onTrace才多監聽ready
                assert.strict.deepStrictEqual([w.args[0], w.args[1].awaitWriteFinish, w.args[1].usePolling], [fp, true, false])
                assert.strict.deepStrictEqual([w.listenerCount('all'), w.listenerCount('error'), w.listenerCount('ready')], [1, 1, 1])

                w.emit('ready')
                w.emit('all', 'change', fp, undefined)
                w.emit('all', 'unlink', fp, undefined)
                w.emit('error', Object.assign(new Error('boom'), { code: 'EPERM' }))

                let es = rec.events.filter((e) => e.type !== 'tick')
                assert.strict.deepStrictEqual(es.map((e) => e.type), ['watch', 'ready', 'emit', 'emit', 'error'])
                assert.strict.deepStrictEqual(es.filter((e) => e.type === 'emit').map((e) => ({ kind: e.kind, fp: e.fp })), [
                    { kind: 'change', fp: path.resolve(fp) },
                    { kind: 'unlink', fp: path.resolve(fp) },
                ])
                assert.strict.deepStrictEqual(es[4].fun, 'watcher')
                //每個事件之回報皆早於對應之監聽器
                assert.strict.deepStrictEqual(order, ['trace:watch', 'trace:ready', 'trace:emit', 'change:change', 'trace:emit', 'change:unlink', 'trace:error', 'error:watcher:EPERM'])

                //clear: clear→unwatch(以被監看路徑呼叫)→closed; 其後即使watcher再送事件亦不再通知
                let iClear = rec.mark()
                ev.clear()
                await rec.wait((e) => e.type === 'closed', iClear)
                assert.strict.deepStrictEqual(rec.types(iClear), ['clear', 'unwatch', 'closed'])
                assert.strict.deepStrictEqual([w.unwatched, w.closeCount], [[fp], 1])
                let n = rec.mark()
                w.emit('ready')
                w.emit('all', 'add', fp, undefined)
                w.emit('error', new Error('late'))
                assert.strict.deepStrictEqual(rec.mark(), n)
            })
        }
        finally {
            fsDeleteFile(fp)
        }
    })

    //
    //以下為P3/P4案(R-TRACE-01)
    //

    //runP3, 預先建好夾具(一個檔), 初始掃描(穩定期之前)即同步回報add, 故不需等ready與穩定期
    let runP3 = async (onTrace) => {
        let fp = './_test_fsWatchFile_p3.txt'
        fsDeleteFile(fp)
        fs.writeFileSync(fp, 'abc', 'utf8')
        let ms = []
        let errs = []
        let ev = fsWatchFile(fp, { onTrace, timeInterval: 20 })
        ev.on('error', (e) => errs.push(e.fun))
        ev.on('change', (m) => {
            ms.push({ type: m.type, fp: getFileName(m.fp) })
        })
        try {
            await waitUntil(() => ms.length >= 1)
        }
        finally {
            ev.clear()
            fsDeleteFile(fp)
        }
        return { ms, errs }
    }

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變; P4: 回調之拋錯與回傳值不影響監看、不產生未處理之rejection
        let rec = traceRec()
        let { result: rs, un } = await collectUnhandled(async () => {
            let rs = []
            for (let { onTrace } of fiveOnTrace(rec.on)) {
                rs.push(await runP3(onTrace))
            }
            return rs
        })
        let rr = { ms: [{ type: 'add', fp: '_test_fsWatchFile_p3.txt' }], errs: [] }
        assert.strict.deepStrictEqual([rs, un], [[rr, rr, rr, rr, rr], []])
        assert.strict.deepStrictEqual(rec.events.length > 0, true)
    })

    it(`should listen to ready only when onTrace is a function, and otherwise attach the same listeners as before (fake chokidar)`, async function() {
        //P3: 為取得ready而多掛之監聽器只在傳了onTrace時才掛, 不改變原行為(all、error各一個)
        let fp = './_test_fsWatchFile_f3.txt'
        fsDeleteFile(fp)
        fs.writeFileSync(fp, 'abc', 'utf8')
        try {
            let rec = traceRec()
            let counts = []
            await withFakeChokidar(async (ws) => {
                for (let { onTrace } of fiveOnTrace(rec.on)) {
                    let n = ws.length
                    let ev = fsWatchFile(fp, { onTrace, timeInterval: 20 })
                    try {
                        await waitUntil(() => ws.length > n)
                        let w = ws[n]
                        counts.push([w.listenerCount('all'), w.listenerCount('error'), w.listenerCount('ready')])
                    }
                    finally {
                        ev.clear()
                    }
                }
            })
            //undefined、非函數(abc)不掛ready; 紀錄器、拋錯、回傳rejection皆為函數故掛
            assert.strict.deepStrictEqual(counts, [[1, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]])
        }
        finally {
            fsDeleteFile(fp)
        }
    })

    it(`should notify frozen events of fixed primitive fields per type with no receiver (fake chokidar)`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let fp = './_test_fsWatchFile_f4.txt'
        fsDeleteFile(fp)
        fs.writeFileSync(fp, 'abc', 'utf8')
        try {
            let meta = []
            let rec = traceRec({ guard })
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            await withFakeChokidar(async (ws) => {
                let ev = fsWatchFile(fp, { onTrace, timeInterval: 20 })
                ev.on('error', () => {})
                try {
                    await rec.wait((e) => e.type === 'watch')
                    ws[0].emit('ready')
                    ws[0].emit('all', 'add', fp, undefined)
                    ws[0].emit('error', new Error('boom'))
                    await rec.wait((e) => e.type === 'tick' && e.watching) //已有watcher之輪詢
                }
                finally {
                    let iClear = rec.mark()
                    ev.clear()
                    await rec.wait((e) => e.type === 'closed', iClear)
                }
            })
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, {
                tick: 'exists,type,watching',
                watch: 'type',
                ready: 'type',
                emit: 'fp,kind,type',
                error: 'fun,type',
                unwatch: 'type',
                closed: 'type',
                clear: 'type',
            })
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual(rec.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
            //error之fun為watcher
            assert.strict.deepStrictEqual(rec.events.find((e) => e.type === 'error').fun, 'watcher')
        }
        finally {
            fsDeleteFile(fp)
        }
    })

})
