import fs from 'fs'
import path from 'path'
import assert from 'assert'
import getFileName from '../src/getFileName.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsRenameFolder from '../src/fsRenameFolder.mjs'
import fsWatchFolder from '../src/fsWatchFolder.mjs'
import { traceRec } from './tools/timeKit.mjs'
import { sleep, waitUntil, withFakeChokidar, fiveOnTrace, collectUnhandled } from './tools/fsWatchKit.mjs'


describe(`fsWatchFolder`, function() {

    //guard, 等事件之防懸置上限(只防懸置, 真實檔案監看每個操作之事件約2.1秒內到達)
    let guard = 45000

    //act, 做一個檔案操作, 並等被測函數回報該操作之全部n個emit事件(一個rename操作會產生unlink與add等多個事件)
    let act = async (tr, n, fun) => {
        let from = tr.mark()
        fun()
        await tr.wait((e) => e.type === 'emit', from, n)
    }

    //test, 真實檔案監看(chokidar, awaitWriteFinish穩定期約2.1秒)之事件來源是作業系統與chokidar而非被測函數之計時器, 不能用假時鐘
    //  原以每3秒排一個檔案操作並於固定時刻收結果, 負載下事件延遲>=約0.9秒即下一操作先發生(rename、刪除使add被吞)或事件晚於結束計時器, 造成少一筆或型別序錯(R-TRACE-01)
    //  改為步進式: 做一個操作→等onTrace之emit事件(該操作之全部事件)→才做下一個; 起始先等ready; 預期事件序列同原案
    let test = async () => {
        let fp = './_test_fsWatchFolder'

        fsDeleteFolder(fp)

        let ms = []
        let tr = traceRec({ guard })
        let ev = fsWatchFolder(fp, { onTrace: tr.on })
        ev.on('change', (msg) => {
            // console.log(msg.type, getFileName(msg.fp))
            ms.push({ type: msg.type, fp: getFileName(msg.fp) })
        })

        try {

            //監看路徑尚不存在: 先等到一次輪詢確認不存在且尚無watcher, 再建立資料夾
            await tr.wait((e) => e.type === 'tick' && !e.watching && !e.exists)
            await act(tr, 1, () => fsCreateFolder(fp)) //addDir
            await tr.wait((e) => e.type === 'ready') //初始掃描完成後, 其後之add與change才經穩定期

            await act(tr, 1, () => fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')) //add
            await act(tr, 2, () => fsRenameFile(`${fp}/abc.txt`, `${fp}/abc.txt` + '.tmp')) //unlink, add
            await act(tr, 2, () => fsRenameFile(`${fp}/abc.txt` + '.tmp', `${fp}/abc.txt`)) //unlink, add
            await act(tr, 1, () => fs.writeFileSync(`${fp}/abc.txt`, 'def', 'utf8')) //change
            await act(tr, 1, () => fsCreateFolder(`${fp}/test-fd`)) //addDir
            await act(tr, 2, () => fsRenameFolder(`${fp}/test-fd`, `${fp}/test-fd` + '-tmp')) //unlinkDir, addDir
            await act(tr, 2, () => fsRenameFolder(`${fp}/test-fd` + '-tmp', `${fp}/test-fd`)) //unlinkDir, addDir
            await act(tr, 1, () => fsDeleteFile(`${fp}/abc.txt`)) //unlink
            await act(tr, 1, () => fsDeleteFolder(`${fp}/test-fd`)) //unlinkDir
            await act(tr, 1, () => fsDeleteFolder(fp)) //unlinkDir, 被監看之資料夾本身消失

            //收尾: 消失後unWatch關閉watcher並設為null, 等closed再等一次輪詢(watching:false), 此後不應再有任何事件(如重複之unlinkDir)
            let ec = await tr.wait((e) => e.type === 'closed')
            await tr.wait((e) => e.type === 'tick' && !e.watching, tr.events.indexOf(ec) + 1)

        }
        finally {
            ev.clear()
            fsDeleteFolder(fp)
        }

        return { ms, emits: tr.events.filter((e) => e.type === 'emit') }
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // addDir _test_fsWatchFolder
    // add abc.txt
    // unlink abc.txt
    // add abc.txt.tmp
    // unlink abc.txt.tmp
    // add abc.txt
    // change abc.txt
    // addDir test-fd
    // unlinkDir test-fd
    // addDir test-fd-tmp
    // unlinkDir test-fd-tmp
    // addDir test-fd
    // unlink abc.txt
    // unlinkDir test-fd
    // unlinkDir _test_fsWatchFolder
    let ms = [
        { type: 'addDir', fp: '_test_fsWatchFolder' },
        { type: 'add', fp: 'abc.txt' },
        { type: 'unlink', fp: 'abc.txt' },
        { type: 'add', fp: 'abc.txt.tmp' },
        { type: 'unlink', fp: 'abc.txt.tmp' },
        { type: 'add', fp: 'abc.txt' },
        { type: 'change', fp: 'abc.txt' },
        { type: 'addDir', fp: 'test-fd' },
        { type: 'unlinkDir', fp: 'test-fd' },
        { type: 'addDir', fp: 'test-fd-tmp' },
        { type: 'unlinkDir', fp: 'test-fd-tmp' },
        { type: 'addDir', fp: 'test-fd' },
        { type: 'unlink', fp: 'abc.txt' },
        { type: 'unlinkDir', fp: 'test-fd' },
        { type: 'unlinkDir', fp: '_test_fsWatchFolder' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r.ms, rr)
        //觀察回調: emit事件(即將派發)與change監聽器收到者一一對應; 除被監看資料夾本身之消失外皆來自chokidar(src為watcher), 該消失chokidar不偵測故由週期輪詢合成(src為timer)
        assert.strict.deepStrictEqual(r.emits.map((e) => ({ type: e.kind, fp: getFileName(e.fp) })), rr)
        assert.strict.deepStrictEqual(r.emits.slice(0, -1).every((e) => e.src === 'watcher'), true)
        if (process.platform === 'win32') {
            assert.strict.deepStrictEqual(r.emits[r.emits.length - 1].src, 'timer')
        }
    })

    //
    //以下為語意案(R-TRACE-01), 各用專屬夾具資料夾
    //

    it(`should poll with tick(exists:false, watching:false) and create no watcher while the folder is absent, then notify watch, emit addDir and ready after it appears, and clear, unwatch, closed on clear`, async function() {
        //JSDoc: 資料夾尚不存在時週期輪詢只回報tick; 出現後建立chokidar watcher(watch), 初始掃描派發addDir後ready; clear停止全部監聽
        let fd = './_test_fsWatchFolder_s1'
        fsDeleteFolder(fd)
        let tr = traceRec({ guard })
        let ev = fsWatchFolder(fd, { onTrace: tr.on, timeInterval: 20 })
        try {
            await tr.wait((e) => e.type === 'tick', 0, 3)
            //不存在期間: 只有tick且皆為(尚無watcher, 路徑不存在)
            assert.strict.deepStrictEqual(tr.events.every((e) => e.type === 'tick' && e.watching === false && e.exists === false), true)

            //出現: 看到資料夾之那次tick(watching:false, exists:true)之後緊接watch, 初始掃描之addDir早於ready, 其後之tick皆已有watcher
            let from = tr.mark()
            fsCreateFolder(fd)
            await tr.wait((e) => e.type === 'ready', from)
            let rest = tr.events.slice(from)
            assert.strict.deepStrictEqual(rest.slice(0, 2).map((e) => e.type), ['tick', 'watch'])
            assert.strict.deepStrictEqual({ w: rest[0].watching, x: rest[0].exists }, { w: false, x: true })
            let after = rest.slice(2)
            assert.strict.deepStrictEqual(after.filter((e) => e.type === 'tick').every((e) => e.watching === true && e.exists === true), true)
            let others = after.filter((e) => e.type !== 'tick')
            assert.strict.deepStrictEqual(others.map((e) => e.type), ['emit', 'ready'])
            assert.strict.deepStrictEqual({ kind: others[0].kind, fp: others[0].fp, src: others[0].src }, { kind: 'addDir', fp: path.resolve(fd), src: 'watcher' })

            //clear: clear→unwatch→closed, clearInterval使其後不再有任何事件(含tick)
            let iClear = tr.mark()
            ev.clear()
            await tr.wait((e) => e.type === 'closed', iClear)
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
        }
    })

    it(`should synthesize a timer unlinkDir when the watched folder itself disappears, then unwatch and closed, and watch again when the folder reappears`, async function() {
        //JSDoc: 被監看之資料夾消失以週期輪詢偵測並派發unlinkDir(chokidar不會回報被監看之根資料夾消失), 隨後unWatch關閉watcher使之可再次建立
        let fd = './_test_fsWatchFolder_s2'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        let ms = []
        let tr = traceRec({ guard })
        let ev = fsWatchFolder(fd, { onTrace: tr.on, timeInterval: 20 })
        ev.on('change', (msg) => {
            ms.push(msg.type)
        })
        try {
            await tr.wait((e) => e.type === 'ready')

            //消失
            let from = tr.mark()
            fsDeleteFolder(fd)
            await tr.wait((e) => e.type === 'closed', from)
            let rest = tr.events.slice(from)
            let ie = rest.findIndex((e) => e.type === 'emit')
            //該次輪詢(watching:true, exists:false)緊接emit(unlinkDir, 資料夾本身), 其後依序unwatch、closed
            assert.strict.deepStrictEqual({ w: rest[ie - 1].watching, x: rest[ie - 1].exists, t: rest[ie - 1].type }, { w: true, x: false, t: 'tick' })
            assert.strict.deepStrictEqual({ kind: rest[ie].kind, fp: rest[ie].fp }, { kind: 'unlinkDir', fp: path.resolve(fd) })
            if (process.platform === 'win32') {
                assert.strict.deepStrictEqual(rest[ie].src, 'timer')
            }
            assert.strict.deepStrictEqual(rest.filter((e) => e.type !== 'tick').map((e) => e.type), ['emit', 'unwatch', 'closed'])
            assert.strict.deepStrictEqual(ms, ['addDir', 'unlinkDir']) //初始掃描之addDir與消失之unlinkDir, unlinkDir只派發一次

            //closed後watcher為null: 輪詢回到(watching:false, exists:false)且不再派發
            let ic = tr.events.findIndex((e, i) => i >= from && e.type === 'closed')
            let tk = await tr.wait((e) => e.type === 'tick' && !e.watching, ic + 1)
            assert.strict.deepStrictEqual({ w: tk.watching, x: tk.exists }, { w: false, x: false })

            //再現: 重新建立watcher
            let from2 = tr.mark()
            fsCreateFolder(fd)
            await tr.wait((e) => e.type === 'ready', from2)
            assert.strict.deepStrictEqual(tr.events.slice(from2).filter((e) => e.type !== 'tick').map((e) => e.type), ['watch', 'emit', 'ready'])
            assert.strict.deepStrictEqual(ms, ['addDir', 'unlinkDir', 'addDir'])
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
        }
    })

    it(`should notify nothing after clear (clear, unwatch, closed only) even for a write pending inside the watcher`, async function() {
        //JSDoc: clear為停止全部監聽, 其後不再通知(unwatch與closed為資源釋放之回報); 事件以clear事件斷言, 否定斷言保留一個略長於穩定期(約2.1秒)之觀察窗
        let fd = './_test_fsWatchFolder_s3'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        fs.writeFileSync(`${fd}/a.txt`, 'abc', 'utf8')
        let ms = []
        let tr = traceRec({ guard })
        let ev = fsWatchFolder(fd, { onTrace: tr.on, timeInterval: 20 })
        ev.on('change', (msg) => {
            ms.push(msg.type + '|' + getFileName(msg.fp))
        })
        try {
            await tr.wait((e) => e.type === 'ready')
            assert.strict.deepStrictEqual(ms, ['addDir|_test_fsWatchFolder_s3', 'add|a.txt'])

            //寫入一個新檔(穩定期內尚未回報)後立即clear; 關閉完成後重複clear不再通知(clear事件只有首次)
            fs.writeFileSync(`${fd}/b.txt`, 'def', 'utf8')
            let iClear = tr.mark()
            ev.clear()
            await tr.wait((e) => e.type === 'closed', iClear)
            ev.clear()
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])

            //觀察窗(否定斷言): 略長於穩定期, 其間不得再有任何事件或派發
            await sleep(2600)
            assert.strict.deepStrictEqual(tr.types(iClear), ['clear', 'unwatch', 'closed'])
            assert.strict.deepStrictEqual(ms, ['addDir|_test_fsWatchFolder_s3', 'add|a.txt'])
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
        }
    })

    it(`should notify emit for each watcher event with kind, resolved fp and src before the change listener, error before the error listener, and nothing after clear (fake chokidar)`, async function() {
        //以假watcher決定性地送出ready、all、error(不經作業系統與穩定期); JSDoc: watcher自身出錯以error事件回報{ fun: 'watcher', msg }
        let fd = './_test_fsWatchFolder_f1'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        try {
            await withFakeChokidar(async (ws) => {
                let rec = traceRec({ guard })
                let order = []
                let ev = fsWatchFolder(fd, {
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
                assert.strict.deepStrictEqual([w.args[0], w.args[1].awaitWriteFinish, w.args[1].usePolling], [fd, true, false])
                assert.strict.deepStrictEqual([w.listenerCount('all'), w.listenerCount('error'), w.listenerCount('ready')], [1, 1, 1])

                w.emit('ready')
                w.emit('all', 'add', `${fd}/a.txt`, undefined)
                w.emit('all', 'unlinkDir', `${fd}/sub`, undefined)
                w.emit('error', Object.assign(new Error('boom'), { code: 'EPERM' }))

                let es = rec.events.filter((e) => e.type !== 'tick')
                assert.strict.deepStrictEqual(es.map((e) => e.type), ['watch', 'ready', 'emit', 'emit', 'error'])
                assert.strict.deepStrictEqual(es.filter((e) => e.type === 'emit').map((e) => ({ kind: e.kind, fp: e.fp, src: e.src })), [
                    { kind: 'add', fp: path.resolve(`${fd}/a.txt`), src: 'watcher' },
                    { kind: 'unlinkDir', fp: path.resolve(`${fd}/sub`), src: 'watcher' },
                ])
                assert.strict.deepStrictEqual(es[4].fun, 'watcher')
                //每個事件之回報皆早於對應之監聽器
                assert.strict.deepStrictEqual(order, ['trace:watch', 'trace:ready', 'trace:emit', 'change:add', 'trace:emit', 'change:unlinkDir', 'trace:error', 'error:watcher:EPERM'])

                //clear: clear→unwatch(以被監看路徑呼叫)→closed; 其後即使watcher再送事件亦不再通知
                let iClear = rec.mark()
                ev.clear()
                await rec.wait((e) => e.type === 'closed', iClear)
                assert.strict.deepStrictEqual(rec.types(iClear), ['clear', 'unwatch', 'closed'])
                assert.strict.deepStrictEqual([w.unwatched, w.closeCount], [[fd], 1])
                let n = rec.mark()
                w.emit('ready')
                w.emit('all', 'add', `${fd}/b.txt`, undefined)
                w.emit('error', new Error('late'))
                assert.strict.deepStrictEqual(rec.mark(), n)
            })
        }
        finally {
            fsDeleteFolder(fd)
        }
    })

    it(`should synthesize unlinkDir with src timer, then unwatch and closed, and create a new watcher when the folder reappears (fake chokidar)`, async function() {
        //以假watcher決定性地驗證: 資料夾消失由週期輪詢合成unlinkDir(先emit再unwatch、closed), closed後watcher為null使再現時重新建立
        let fd = './_test_fsWatchFolder_f2'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        try {
            await withFakeChokidar(async (ws) => {
                let rec = traceRec({ guard })
                let ev = fsWatchFolder(fd, { onTrace: rec.on, timeInterval: 20 })
                let got = []
                ev.on('change', (m) => got.push({ type: m.type, fp: m.fp, stats: m.stats }))
                try {
                    await rec.wait((e) => e.type === 'watch')
                    let from = rec.mark()
                    fsDeleteFolder(fd)
                    await rec.wait((e) => e.type === 'closed', from)
                    assert.strict.deepStrictEqual(rec.events.slice(from).filter((e) => e.type !== 'tick').map((e) => `${e.type}${e.kind ? ':' + e.kind : ''}${e.src ? ':' + e.src : ''}`), ['emit:unlinkDir:timer', 'unwatch', 'closed'])
                    assert.strict.deepStrictEqual(got, [{ type: 'unlinkDir', fp: path.resolve(fd), stats: undefined }])
                    assert.strict.deepStrictEqual([ws[0].unwatched, ws[0].closeCount], [[fd], 1])

                    //closed後輪詢不再派發; 再現後重新建立watcher(第2個)
                    let ic = rec.events.findIndex((e, i) => i >= from && e.type === 'closed')
                    await rec.wait((e) => e.type === 'tick' && !e.watching && !e.exists, ic + 1)
                    assert.strict.deepStrictEqual(ws.length, 1)
                    let from2 = rec.mark()
                    fsCreateFolder(fd)
                    await rec.wait((e) => e.type === 'watch', from2)
                    assert.strict.deepStrictEqual(ws.length, 2)
                    assert.strict.deepStrictEqual(got.length, 1)
                }
                finally {
                    ev.clear()
                }
            })
        }
        finally {
            fsDeleteFolder(fd)
        }
    })

    //
    //以下為P3/P4案(R-TRACE-01)
    //

    //runP3, 預先建好夾具(資料夾與一個檔), 初始掃描(穩定期之前)即同步回報addDir與add, 故不需等ready與穩定期
    let runP3 = async (onTrace) => {
        let fd = './_test_fsWatchFolder_p3'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        fs.writeFileSync(`${fd}/a.txt`, 'abc', 'utf8')
        let ms = []
        let errs = []
        let ev = fsWatchFolder(fd, { onTrace, timeInterval: 20 })
        ev.on('error', (e) => errs.push(e.fun))
        ev.on('change', (m) => {
            ms.push({ type: m.type, fp: getFileName(m.fp) })
        })
        try {
            await waitUntil(() => ms.length >= 2)
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
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
        let rr = { ms: [{ type: 'addDir', fp: '_test_fsWatchFolder_p3' }, { type: 'add', fp: 'a.txt' }], errs: [] }
        assert.strict.deepStrictEqual([rs, un], [[rr, rr, rr, rr, rr], []])
        assert.strict.deepStrictEqual(rec.events.length > 0, true)
    })

    it(`should listen to ready only when onTrace is a function, and otherwise attach the same listeners as before (fake chokidar)`, async function() {
        //P3: 為取得ready而多掛之監聽器只在傳了onTrace時才掛, 不改變原行為(all、error各一個)
        let fd = './_test_fsWatchFolder_f3'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        try {
            let rec = traceRec()
            let counts = []
            await withFakeChokidar(async (ws) => {
                for (let { onTrace } of fiveOnTrace(rec.on)) {
                    let n = ws.length
                    let ev = fsWatchFolder(fd, { onTrace, timeInterval: 20 })
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
            fsDeleteFolder(fd)
        }
    })

    it(`should notify frozen events of fixed primitive fields per type with no receiver (fake chokidar)`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let fd = './_test_fsWatchFolder_f4'
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        try {
            let meta = []
            let rec = traceRec({ guard })
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            await withFakeChokidar(async (ws) => {
                let ev = fsWatchFolder(fd, { onTrace, timeInterval: 20 })
                ev.on('error', () => {})
                try {
                    await rec.wait((e) => e.type === 'watch')
                    ws[0].emit('ready')
                    ws[0].emit('all', 'add', `${fd}/a.txt`, undefined) //src: watcher
                    ws[0].emit('error', new Error('boom'))
                    fsDeleteFolder(fd)
                    await rec.wait((e) => e.type === 'closed') //src: timer, unwatch, closed
                }
                finally {
                    ev.clear() //watcher已為null, 只通知clear
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
                emit: 'fp,kind,src,type',
                error: 'fun,type',
                unwatch: 'type',
                closed: 'type',
                clear: 'type',
            })
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual(rec.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
            //各type之取值: emit之src分watcher與timer; error之fun為watcher
            assert.strict.deepStrictEqual(rec.events.filter((e) => e.type === 'emit').map((e) => e.src), ['watcher', 'timer'])
            assert.strict.deepStrictEqual(rec.events.find((e) => e.type === 'error').fun, 'watcher')
        }
        finally {
            fsDeleteFolder(fd)
        }
    })

})
