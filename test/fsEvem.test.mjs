import fs from 'fs'
import path from 'path'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsEvem from '../src/fsEvem.mjs'
import { traceRec } from './tools/timeKit.mjs'
import { waitUntil, withFakeChokidar, fiveOnTrace, collectUnhandled } from './tools/fsWatchKit.mjs'


describe(`fsEvem`, function() {

    //guard, 等事件之防懸置上限(只防懸置, 真實檔案監看每個事件約2.1秒內到達)
    let guard = 45000

    //test, 事件經chokidar(fsWatchFolder, awaitWriteFinish穩定期約2.1秒)送達, 事件來源是作業系統與chokidar而非被測函數之計時器, 不能用假時鐘
    //  原以setInterval每3000ms發一個事件並與獨立之12000ms結束計時器賽跑, 負載下第3筆晚於12秒而少一筆, 或相鄰兩次寫入被合併(R-TRACE-01)
    //  改為步進式: 起始先等ready, 每發一個事件就等該事件經監看送達本程序監聽器(onTrace之emit事件)才發下一個; 預期同原案[1,2,3]
    let test = async () => {
        let fd = './_evps'

        fsDeleteFolder(fd)

        let ms = []
        let tr = traceRec({ guard })
        let ev = fsEvem({ onTrace: tr.on })

        ev.on('conut', (msg) => {
            // console.log('conut', msg)
            ms.push(msg)
        })

        let types = []
        try {

            //內部watcher就緒(初始掃描完成)後, 其後寫入之事件檔案才經穩定期被接收
            await tr.wait((e) => e.type === 'ready')

            for (let n = 1; n <= 3; n++) {
                let from = tr.mark()
                ev.emit('conut', n)
                await tr.wait((e) => e.type === 'emit' && e.evName === 'conut', from)
            }

            types = tr.types()

        }
        finally {
            ev.clear()
        }

        return { ms, types, events: tr.events }
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // conut 1
    // conut 2
    // conut 3
    let ms = [1, 2, 3]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r.ms, rr)
        //觀察回調: 資料夾本身之addDir被略過(kind)、ready後每次emit先寫出事件檔案(write)再經監看送達本程序(emit), 無其他略過
        assert.strict.deepStrictEqual(r.types, ['skip', 'ready', 'write', 'emit', 'write', 'emit', 'write', 'emit'])
        let sk = r.events[0]
        assert.strict.deepStrictEqual({ reason: sk.reason, kind: sk.kind }, { reason: 'kind', kind: 'addDir' })
        assert.strict.deepStrictEqual(r.events.filter((e) => e.type === 'write' || e.type === 'emit').every((e) => e.evName === 'conut'), true)
    })

    //
    //以下為語意案(R-TRACE-01), 各用專屬夾具資料夾
    //

    //mkFx, 建立夾具資料夾: foo為合法事件檔案({ pkg, time }), bad.txt內容非JSON, num.txt內容為合法JSON但非物件, emp為空檔案
    let mkFx = (fd) => {
        fsDeleteFolder(fd)
        fsCreateFolder(fd)
        fs.writeFileSync(`${fd}/foo`, JSON.stringify({ pkg: { a: 1 }, time: 't1' }), 'utf8')
        fs.writeFileSync(`${fd}/bad.txt`, 'not json', 'utf8')
        fs.writeFileSync(`${fd}/num.txt`, '123', 'utf8')
        fs.writeFileSync(`${fd}/emp`, '', 'utf8')
    }

    it(`should skip events of non add/change kinds or of content that is not a non-empty object, and emit the others to the local listeners after emit is notified`, async function() {
        //JSDoc: 事件檔案內容變更由watcher接收再於本地派發; 以初始掃描(穩定期之前)同步送達夾具之各檔案
        let fd = './_test_fsEvem_s1'
        mkFx(fd)
        let tr = traceRec({ guard })
        let order = []
        let ev = fsEvem({
            fd,
            timeInterval: 20,
            onTrace: (e) => {
                order.push('trace:' + e.type + (e.evName ? ':' + e.evName : ''))
                tr.on(e)
            },
        })
        let got = []
        ev.on('foo', (pkg, time) => {
            order.push('listener:foo')
            got.push([pkg, time])
        })
        try {
            await tr.wait((e) => e.type === 'ready')

            //初始掃描: 資料夾本身addDir被略過(kind), 三個內容不合者被略過(content), 合法者派發; 檔案之順序依掃描而定故排序後比較
            let sk = tr.events.filter((e) => e.type === 'skip').map((e) => `${e.reason}|${e.kind}|${e.evName}`)
            assert.strict.deepStrictEqual(sk.filter((s) => s.startsWith('kind|')).length, 1)
            assert.strict.deepStrictEqual(sk.filter((s) => s.startsWith('kind|'))[0].startsWith('kind|addDir|'), true)
            assert.strict.deepStrictEqual(sk.filter((s) => s.startsWith('content|')).sort(), ['content|add|bad', 'content|add|emp', 'content|add|num'])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').map((e) => e.evName), ['foo'])
            assert.strict.deepStrictEqual(got, [[{ a: 1 }, 't1']])
            //emit事件緊接於監聽器之前(先通知再派發)
            assert.strict.deepStrictEqual(order.indexOf('trace:emit:foo') + 1, order.indexOf('listener:foo'))

            //寫出: emit一個事件即同步寫出事件檔案並通知write(evName); 事件檔案內容為{ pkg, time }
            let from = tr.mark()
            ev.emit('ping', { n: 1 })
            let ws = tr.events.slice(from)
            assert.strict.deepStrictEqual(ws.map((e) => `${e.type}|${e.evName}`), ['write|ping'])
            let c = JSON.parse(fs.readFileSync(`${fd}/ping`, 'utf8'))
            assert.strict.deepStrictEqual([c.pkg, typeof c.time], [{ n: 1 }, 'string'])

            //寫出失敗(事件名稱為空字串致寫入目標為資料夾)同步拋錯, 不通知write
            let from2 = tr.mark()
            assert.throws(() => ev.emit('', 1))
            assert.strict.deepStrictEqual(tr.types(from2), [])

            //本地派發(msg含keySys者不寫檔): 先通知emit再派發給監聽器, 不寫檔
            let loc = []
            ev.on('loc', (pkg, time) => loc.push([pkg, time]))
            let from3 = tr.mark()
            ev.emit('loc', { '[::pkg_content::]': { pkg: 'P', time: 'T' } })
            assert.strict.deepStrictEqual(tr.types(from3), ['emit'])
            assert.strict.deepStrictEqual(loc, [['P', 'T']])
            assert.strict.deepStrictEqual(fs.existsSync(`${fd}/loc`), false)
        }
        finally {
            ev.clear()
        }
    })

    it(`should notify clear once and nothing afterwards`, async function() {
        //JSDoc: clear為停止全部監聽(並刪除事件檔案資料夾); clear後不再通知
        let fd = './_test_fsEvem_s2'
        mkFx(fd)
        let tr = traceRec({ guard })
        let ev = fsEvem({ fd, timeInterval: 20, onTrace: tr.on })
        try {
            await tr.wait((e) => e.type === 'ready')
            let from = tr.mark()
            ev.clear()
            ev.clear()
            assert.strict.deepStrictEqual(tr.types(from), ['clear'])

            //clear後之emit(寫入目標資料夾已刪除, 同步拋錯; 即使寫入成功亦不通知)
            try {
                ev.emit('x', 1)
            }
            catch (err) {}
            assert.strict.deepStrictEqual(tr.types(from), ['clear'])
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
        }
    })

    //
    //以下為P3/P4案(R-TRACE-01)
    //

    //runP3, 預先建好夾具, 初始掃描(穩定期之前)即同步送達合法事件檔案, 故不需等ready與穩定期
    let runP3 = async (onTrace) => {
        let fd = './_test_fsEvem_p3'
        mkFx(fd)
        let got = []
        let errs = []
        let ev = fsEvem({ fd, timeInterval: 20, onTrace })
        ev.on('error', (e) => errs.push(e.fun))
        ev.on('foo', (pkg, time) => got.push([pkg, time]))
        try {
            await waitUntil(() => got.length >= 1)
        }
        finally {
            ev.clear()
            fsDeleteFolder(fd)
        }
        return { got, errs }
    }

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變; P4: 回調之拋錯與回傳值不影響事件傳遞、不產生未處理之rejection
        let rec = traceRec()
        let { result: rs, un } = await collectUnhandled(async () => {
            let rs = []
            for (let { onTrace } of fiveOnTrace(rec.on)) {
                rs.push(await runP3(onTrace))
            }
            return rs
        })
        let rr = { got: [[{ a: 1 }, 't1']], errs: [] }
        assert.strict.deepStrictEqual([rs, un], [[rr, rr, rr, rr, rr], []])
        assert.strict.deepStrictEqual(rec.events.length > 0, true)
    })

    it(`should not forward onTrace to the inner fsWatchFolder, and listen to its ready only when onTrace is a function (fake chokidar)`, async function() {
        //P3: 事件流不混(只有本函數之type, 無內部之tick、watch等); 為取得ready而多掛之監聽器只在傳了onTrace時才掛
        let fd = './_test_fsEvem_f3'
        mkFx(fd)
        try {
            let rec = traceRec()
            let counts = []
            await withFakeChokidar(async (ws) => {
                for (let { onTrace } of fiveOnTrace(rec.on)) {
                    let n = ws.length
                    let ev = fsEvem({ fd, timeInterval: 20, onTrace })
                    try {
                        await waitUntil(() => ws.length > n)
                        let w = ws[n]
                        counts.push([w.listenerCount('all'), w.listenerCount('error'), w.listenerCount('ready')])
                        w.emit('ready')
                    }
                    finally {
                        ev.clear()
                        mkFx(fd)
                    }
                }
            })
            //undefined、非函數(abc)不掛ready; 紀錄器、拋錯、回傳rejection皆為函數故掛
            assert.strict.deepStrictEqual(counts, [[1, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]])
            //紀錄器只收到本函數之type(ready與clear), 無內部fsWatchFolder之tick、watch、unwatch、closed等
            assert.strict.deepStrictEqual(rec.types(), ['ready', 'clear'])
        }
        finally {
            fsDeleteFolder(fd)
        }
    })

    it(`should notify frozen events of fixed primitive fields per type with no receiver (fake chokidar)`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let fd = './_test_fsEvem_f4'
        mkFx(fd)
        try {
            let meta = []
            let rec = traceRec({ guard })
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            await withFakeChokidar(async (ws) => {
                let ev = fsEvem({ fd, timeInterval: 20, onTrace })
                ev.on('foo', () => {})
                try {
                    await waitUntil(() => ws.length > 0)
                    let w = ws[0]
                    w.emit('ready') //ready
                    w.emit('all', 'addDir', path.resolve(fd), undefined) //skip(kind)
                    w.emit('all', 'add', path.resolve(`${fd}/foo`), undefined) //emit
                    w.emit('all', 'add', path.resolve(`${fd}/bad.txt`), undefined) //skip(content)
                    ev.emit('ping', { n: 1 }) //write
                }
                finally {
                    ev.clear() //clear
                }
            })
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, {
                ready: 'type',
                skip: 'evName,kind,reason,type',
                emit: 'evName,type',
                write: 'evName,type',
                clear: 'type',
            })
            assert.strict.deepStrictEqual(rec.types(), ['ready', 'skip', 'emit', 'skip', 'write', 'clear'])
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual(rec.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
            //各type之取值
            assert.strict.deepStrictEqual(rec.events.filter((e) => e.type === 'skip').map((e) => `${e.reason}|${e.kind}|${e.evName}`).map((s) => s.replace(/\|[^|]*$/, '|')), ['kind|addDir|', 'content|add|'])
            assert.strict.deepStrictEqual(rec.events.filter((e) => e.type === 'emit' || e.type === 'write').map((e) => `${e.type}|${e.evName}`), ['emit|foo', 'write|ping'])
        }
        finally {
            fsDeleteFolder(fd)
        }
    })

})
