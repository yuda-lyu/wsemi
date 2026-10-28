import assert from 'assert'
//import domDropFiles from '../src/domDropFiles.mjs'
import domDropFiles from '../src/domDropFiles.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { mkBrowser, mkFile, mkDataTransfer, mkDragEvent, fiveOnTrace, collectUnhandled, mkMeta, flush } from './tools/domFilesKit.mjs'


describe(`domDropFiles`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`domDropFiles 觀察回調(R-TRACE-01)`, function() {

    //以最小假瀏覽器(test/tools/domFilesKit.mjs之mkBrowser)與假拖放事件驗證opt.onTrace之事件語意; 瀏覽器本身之拖放事件派送非本檔驗證範圍, 依函數註解所載之現象手動依序派發
    //100ms判定(dgOut之setTimeout)本身即規格, 於假時鐘下以advance精確推進(P5), 其餘斷言事件序列與內容(P1、P2); 讀取拖曳內容為純microtask鏈, 以files或error事件為同步點
    //未傳回調時行為不變、回調之拋錯與回傳rejection不影響拖曳處理、不產生未處理之rejection(P3、P4)
    //seq記錄onTrace事件('t:<type>')與使用端事件('ev:<name>')之通知先後, 驗證JSDoc「事件皆於派發對應事件之前通知」

    let env = null

    beforeEach(function() {
        env = mkBrowser()
    })

    afterEach(function() {
        env.restore()
    })

    //mk, 建立被監聽元素與ev; o.cb為true時getFiles監聽器內呼叫cb、o.boom為true時getFiles監聽器於記錄後拋錯; got為getFiles收到之訊息
    let mk = (o = {}) => {
        let ele = env.document.createElement('div')
        let seq = []
        let got = []
        let tr = traceRec()
        let onTrace = (e) => {
            seq.push('t:' + e.type)
            tr.on(e)
        }
        let ev = domDropFiles(ele, { onTrace })
        ev.on('dropIn', () => seq.push('ev:dropIn'))
        ev.on('dropOut', () => seq.push('ev:dropOut'))
        ev.on('error', () => seq.push('ev:error'))
        ev.on('getFiles', (msg) => {
            seq.push('ev:getFiles')
            got.push(msg)
            if (o.cb) {
                msg.cb()
            }
            if (o.boom) {
                throw new Error('listener boom')
            }
        })
        return { ele, ev, seq, got, tr }
    }

    //dtOk, 一般檔案1個(files)與項目2個(1檔案、1資料夾含1檔案)之dataTransfer: files有type者1、entries共3(a.txt、d、b.txt)、其中檔案2
    let dtOk = () => mkDataTransfer({
        files: [mkFile('a.txt'), { name: 'dir', type: '' }],
        entries: [{ file: 'a.txt' }, { dir: 'd', children: [{ file: 'b.txt' }] }],
    })

    //dtBad, 讀取files時拋錯之dataTransfer(treeFiles讀v.type拋錯 → treeDataTransfer reject → 派發error)
    let dtBad = () => {
        let bad = { name: 'x' }
        let get = () => {
            throw new Error('type boom')
        }
        Object.defineProperty(bad, 'type', { get })
        return { files: [bad], items: [] }
    }

    it(`should notify in with emit true only for the first entering and before dropIn is emitted`, function() {
        let { ele, seq, tr } = mk()
        ele.dispatchEvent(mkDragEvent('dragenter'))
        ele.dispatchEvent(mkDragEvent('dragover'))
        ele.dispatchEvent(mkDragEvent('dragover'))
        //JSDoc onTrace: in為收到dragenter、dragover或drop, emit為是否為自上次移出後首次移入而即將派發dropIn; 事件於派發dropIn之前通知
        assert.strict.deepStrictEqual(tr.events.map((e) => [e.type, e.emit]), [['in', true], ['in', false], ['in', false]])
        assert.strict.deepStrictEqual(seq, ['t:in', 'ev:dropIn', 't:in', 't:in'])
    })

    it(`should notify out with by dragleave and then leave with emit true exactly 100ms later before dropOut is emitted`, async function() {
        let clock = useFakeClock()
        try {
            let { ele, seq, tr } = mk()
            ele.dispatchEvent(mkDragEvent('dragenter'))
            ele.dispatchEvent(mkDragEvent('dragleave'))
            //JSDoc onTrace: out為收到dragleave而暫視為移出並排定100ms後判定(by為dragleave、ms固定100); 100ms本身即規格(假時鐘)
            await clock.advance(99)
            assert.strict.deepStrictEqual(seq, ['t:in', 'ev:dropIn', 't:out'])
            await clock.advance(1)
            let leave = await tr.wait((e) => e.type === 'leave')
            //JSDoc onTrace: leave為100ms後之判定, emit為true代表期間未再移入而即將派發dropOut
            assert.strict.deepStrictEqual({ out: tr.events[1], leave }, { out: { type: 'out', by: 'dragleave', ms: 100 }, leave: { type: 'leave', emit: true } })
            assert.strict.deepStrictEqual(seq, ['t:in', 'ev:dropIn', 't:out', 't:leave', 'ev:dropOut'])
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify leave with emit false and not emit dropOut when it enters again within the 100ms window`, async function() {
        let clock = useFakeClock()
        try {
            let { ele, seq, tr } = mk()
            ele.dispatchEvent(mkDragEvent('dragenter'))
            ele.dispatchEvent(mkDragEvent('dragleave'))
            await clock.advance(99)
            ele.dispatchEvent(mkDragEvent('dragover')) //第99ms又移入(dragleave後緊接子元素之dragenter/dragover為常態)
            await clock.advance(1)
            await tr.wait((e) => e.type === 'leave')
            //JSDoc onTrace: leave之emit為false代表期間又收到in而不派發dropOut; 此時仍為移入狀態, 其後之dragover不重複派發dropIn
            ele.dispatchEvent(mkDragEvent('dragover'))
            assert.strict.deepStrictEqual(seq, ['t:in', 'ev:dropIn', 't:out', 't:in', 't:leave', 't:in'])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'leave' || e.type === 'in').map((e) => e.emit), [true, false, false, false])
            //真正移出後(100ms內無再移入)才派發dropOut, 且只一次
            ele.dispatchEvent(mkDragEvent('dragleave'))
            await clock.advance(100)
            await tr.wait((e) => e.type === 'leave', 0, 2)
            assert.strict.deepStrictEqual(seq.slice(6), ['t:out', 't:leave', 'ev:dropOut'])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'leave').map((e) => e.emit), [false, true])
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify drop, in and files with the counts before getFiles is emitted, then out by cb and leave after the user calls cb`, async function() {
        let clock = useFakeClock()
        try {
            let { ele, seq, got, tr } = mk({ cb: true })
            ele.dispatchEvent(mkDragEvent('drop', dtOk()))
            let files = await tr.wait((e) => e.type === 'files')
            //JSDoc onTrace: drop為收到drop而開始讀取; files之files為dataTransfer.files有類型者數量(1)、filesTree為遍歷後之檔案數量(a.txt、b.txt共2)、entries為遍歷後之檔案與資料夾總數(a.txt、d、b.txt共3)
            assert.strict.deepStrictEqual(files, { type: 'files', files: 1, filesTree: 2, entries: 3 })
            //事件值與派發給使用端之getFiles內容一致
            assert.strict.deepStrictEqual(got.map((m) => [m.files.length, m.filesTree.length, m.entries.length]), [[1, 2, 3]])
            //JSDoc onTrace: 事件皆於派發對應事件之前通知; cb被呼叫(out by cb)後100ms才判定
            assert.strict.deepStrictEqual(seq, ['t:drop', 't:in', 'ev:dropIn', 't:files', 'ev:getFiles', 't:out'])
            assert.strict.deepStrictEqual(tr.events[tr.events.length - 1], { type: 'out', by: 'cb', ms: 100 })
            await clock.advance(100)
            await tr.wait((e) => e.type === 'leave')
            assert.strict.deepStrictEqual(seq.slice(6), ['t:leave', 'ev:dropOut'])
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify error before error is emitted when reading the dropped content fails or the getFiles listener throws`, async function() {
        //JSDoc onTrace: error為讀取失敗或getFiles之監聽器拋錯而即將派發error
        let a = mk()
        a.ele.dispatchEvent(mkDragEvent('drop', dtBad()))
        await a.tr.wait((e) => e.type === 'error')
        assert.strict.deepStrictEqual(a.seq, ['t:drop', 't:in', 'ev:dropIn', 't:error', 'ev:error'])
        let b = mk({ boom: true })
        b.ele.dispatchEvent(mkDragEvent('drop', dtOk()))
        await b.tr.wait((e) => e.type === 'error')
        assert.strict.deepStrictEqual(b.seq, ['t:drop', 't:in', 'ev:dropIn', 't:files', 'ev:getFiles', 't:error', 'ev:error'])
    })

    it(`should notify off once, remove the DOM listeners and notify nothing more (pending judgement and reading included) after ev.off()`, async function() {
        let clock = useFakeClock()
        try {
            //排定中之100ms判定
            let a = mk()
            assert.strict.deepStrictEqual(a.ele.nListeners(), 4)
            a.ele.dispatchEvent(mkDragEvent('dragenter'))
            a.ele.dispatchEvent(mkDragEvent('dragleave'))
            a.ev.off()
            a.ev.off() //重複呼叫不重複通知
            await clock.advance(100)
            //JSDoc onTrace: 呼叫off之後不再通知(含off前已排定之100ms判定), 其對ev之派發維持原行為(舊版off只移除DOM監聽, 不取消已排定之判定)
            assert.strict.deepStrictEqual(a.seq, ['t:in', 'ev:dropIn', 't:out', 't:off', 'ev:dropOut'])
            assert.strict.deepStrictEqual(a.ele.nListeners(), 0)
            a.ele.dispatchEvent(mkDragEvent('dragenter')) //監聽已移除
            assert.strict.deepStrictEqual(a.seq.length, 5)
            //讀取中
            let b = mk()
            b.ele.dispatchEvent(mkDragEvent('drop', dtOk()))
            b.ev.off()
            await flush()
            assert.strict.deepStrictEqual(b.seq, ['t:drop', 't:in', 'ev:dropIn', 't:off', 'ev:getFiles'])
        }
        finally {
            clock.restore()
        }
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調(含省略第2參數)時行為不變; P4: 回調之拋錯與回傳之rejection不影響拖曳處理、不產生未處理之rejection
        let un = collectUnhandled()
        let rec = traceRec()
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                let clock = useFakeClock()
                try {
                    let ele = env.document.createElement('div')
                    let out = []
                    let ev = onTrace === undefined ? domDropFiles(ele) : domDropFiles(ele, { onTrace })
                    ev.on('dropIn', () => out.push('dropIn'))
                    ev.on('dropOut', () => out.push('dropOut'))
                    ev.on('error', (err) => out.push('error:' + err.message))
                    ev.on('getFiles', (m) => {
                        out.push(`getFiles:${m.files.length}/${m.filesTree.length}/${m.entries.length}`)
                        m.cb()
                    })
                    //drop成功(getFiles、cb、100ms後dropOut)
                    ele.dispatchEvent(mkDragEvent('dragenter'))
                    ele.dispatchEvent(mkDragEvent('drop', dtOk()))
                    await flush()
                    await clock.advance(100)
                    //drop失敗(error)
                    ele.dispatchEvent(mkDragEvent('drop', dtBad()))
                    await flush()
                    //移出後又移入(100ms內)不派發dropOut
                    ele.dispatchEvent(mkDragEvent('dragleave'))
                    await clock.advance(60)
                    ele.dispatchEvent(mkDragEvent('dragover'))
                    await clock.advance(40)
                    //真正移出
                    ele.dispatchEvent(mkDragEvent('dragleave'))
                    await clock.advance(100)
                    ev.off()
                    got.push({ out, listeners: ele.nListeners() })
                }
                finally {
                    clock.restore()
                }
            }
            await flush()
            await flush()
        }
        finally {
            un.stop()
        }
        //使用端事件序列: dragenter的dropIn → drop成功(getFiles、cb後100ms的dropOut) → drop失敗(再移入故dropIn、error) → 移出後60ms又移入不派發 → 真正移出後100ms的dropOut
        let one = {
            out: ['dropIn', 'getFiles:1/2/3', 'dropOut', 'dropIn', 'error:type boom', 'dropOut'],
            listeners: 0,
        }
        assert.strict.deepStrictEqual(got, [one, one, one, one, one])
        assert.strict.deepStrictEqual(un.list, [])
        //紀錄器確有收到事件
        assert.strict.deepStrictEqual(rec.events.length > 0, true)
        assert.strict.deepStrictEqual(rec.events.some((e) => e.type === 'files') && rec.events.some((e) => e.type === 'error') && rec.events.some((e) => e.type === 'off'), true)
    })

    it(`should accept an omitted, null or non-object second parameter as no callback (including being used directly as an array callback)`, function() {
        //opt為選用: 省略、null、數字(如[ele].map(domDropFiles)傳入之索引)皆視同未傳回調, 行為同舊版
        let eles = [env.document.createElement('div'), env.document.createElement('div'), env.document.createElement('div')]
        let evs = [domDropFiles(eles[0]), domDropFiles(eles[1], null), ...eles.slice(2).map(domDropFiles)]
        let out = []
        evs.forEach((ev, i) => ev.on('dropIn', () => out.push(i)))
        eles.forEach((ele) => ele.dispatchEvent(mkDragEvent('dragenter')))
        assert.strict.deepStrictEqual(out, [0, 1, 2])
    })

    it(`should notify in, out, leave, drop, files, error and off with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4)
        let clock = useFakeClock()
        try {
            let rec = traceRec()
            let m = mkMeta(rec.on)
            let ele = env.document.createElement('div')
            let ev = domDropFiles(ele, { onTrace: m.fn })
            ev.on('getFiles', (msg) => msg.cb())
            ele.dispatchEvent(mkDragEvent('dragenter')) //in
            ele.dispatchEvent(mkDragEvent('dragleave')) //out(dragleave)
            await clock.advance(100) //leave
            ele.dispatchEvent(mkDragEvent('drop', dtOk())) //drop, in, files, out(cb)
            await rec.wait((e) => e.type === 'out' && e.by === 'cb')
            await clock.advance(100) //leave
            ele.dispatchEvent(mkDragEvent('drop', dtBad())) //drop, in, error
            await rec.wait((e) => e.type === 'error')
            ev.off() //off
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { in: 'emit,type', out: 'by,ms,type', leave: 'emit,type', drop: 'type', files: 'entries,files,filesTree,type', error: 'type', off: 'type' })
            //欄位皆為原始值(數字、字串、布林或null)
            assert.strict.deepStrictEqual(rec.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            //事件為凍結物件, 回調不帶接收者(this為undefined)
            assert.strict.deepStrictEqual(m.meta.length > 0 && m.meta.length === rec.events.length && m.meta.every(([self, frozen]) => self === undefined && frozen), true)
        }
        finally {
            clock.restore()
        }
    })

})
