import assert from 'assert'
//import domShowInputAndGetFiles from '../src/domShowInputAndGetFiles.mjs'
import domShowInputAndGetFiles from '../src/domShowInputAndGetFiles.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { mkBrowser, mkFile, fiveOnTrace, collectUnhandled, mkMeta, flush } from './tools/domFilesKit.mjs'


describe(`domShowInputAndGetFiles`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`domShowInputAndGetFiles 觀察回調(R-TRACE-01)`, function() {

    //以最小假瀏覽器(test/tools/domFilesKit.mjs之mkBrowser)驗證opt.onTrace之事件語意; 原生選檔視窗與focus、change、cancel事件之先後非本檔驗證範圍, 依函數註解所載之現象(舊瀏覽器僅有window之focus, change可能比focus晚逾300ms)手動依序派發
    //1500ms取消判定窗(evCancel之setTimeout)本身即規格, 於假時鐘下以advance精確推進(P5), 其餘斷言事件序列與內容(P1、P2)
    //未傳回調時行為不變、回調之拋錯與回傳rejection不影響選檔處理、不產生未處理之rejection(P3、P4)

    let env = null

    beforeEach(function() {
        env = mkBrowser()
    })

    afterEach(function() {
        env.restore()
    })

    //start, 呼叫函數並取得其input; seq記錄onTrace事件('t:<type>')與click('click')之先後; 以opt覆寫其餘設定
    let start = (opt = {}) => {
        let seq = []
        let tr = traceRec()
        env.onClick = () => seq.push('click')
        let onTrace = (e) => {
            seq.push('t:' + e.type)
            tr.on(e)
        }
        let pm = domShowInputAndGetFiles({ onTrace, ...opt })
        let inp = env.document.querySelector('input')
        return { pm, inp, seq, tr }
    }

    //nameOf, 結果之檔名陣列
    let nameOf = (r) => r.files.map((f) => f.name)

    it(`should notify open before the click and settle by change with the files count and the DOM is cleaned`, async function() {
        let { pm, inp, seq, tr } = start({ multiple: true })
        //JSDoc onTrace: open為已建立input並綁定監聽而即將觸發點擊(含生效後之multiple、entireHierarchy); 事件於點擊之前通知
        assert.strict.deepStrictEqual(seq, ['t:open', 'click'])
        assert.strict.deepStrictEqual(tr.events[0], { type: 'open', multiple: true, entireHierarchy: false })
        assert.strict.deepStrictEqual({ type: inp.getAttribute('type'), multiple: inp.hasAttribute('multiple'), focus: env.window.nListeners('focus') }, { type: 'file', multiple: true, focus: 1 })
        inp.files = [mkFile('a.txt'), mkFile('b.txt')]
        inp.dispatchEvent({ type: 'change' })
        let r = await pm
        //JSDoc onTrace: settle為即將resolve, by為change代表由change事件結束, files為檔案數量, errs為超過sizeMbLimit之檔案數量
        assert.strict.deepStrictEqual(tr.events[1], { type: 'settle', by: 'change', files: 2, errs: 0 })
        assert.strict.deepStrictEqual(seq, ['t:open', 'click', 't:settle'])
        assert.strict.deepStrictEqual(nameOf(r), ['a.txt', 'b.txt'])
        //結束後input移除、監聽解除
        assert.strict.deepStrictEqual({ children: env.body.children.length, change: inp.nListeners('change'), cancel: inp.nListeners('cancel'), focus: env.window.nListeners('focus') }, { children: 0, change: 0, cancel: 0, focus: 0 })
    })

    it(`should notify settle with errs for files larger than sizeMbLimit (the files are still returned)`, async function() {
        let { pm, inp, tr } = start({ sizeMbLimit: 1 })
        inp.files = [mkFile('small.txt', 0.5), mkFile('big.bin', 2)]
        inp.dispatchEvent({ type: 'change' })
        let r = await pm
        //JSDoc onTrace: settle之errs為超過sizeMbLimit之檔案數量(domGetFiles於errs記錄超限者, files仍含全部)
        assert.strict.deepStrictEqual(tr.events[1], { type: 'settle', by: 'change', files: 2, errs: 1 })
        assert.strict.deepStrictEqual({ names: nameOf(r), errKeys: Object.keys(r.errs) }, { names: ['small.txt', 'big.bin'], errKeys: ['1'] })
    })

    it(`should notify cancel and then settle by cancel with no files when the input cancel event arrives`, async function() {
        let { pm, inp, seq, tr } = start()
        inp.dispatchEvent({ type: 'cancel' })
        let r = await pm
        //JSDoc onTrace: cancel為收到input之cancel事件而即將以空檔案結束, 其後settle by為cancel
        assert.strict.deepStrictEqual(seq, ['t:open', 'click', 't:cancel', 't:settle'])
        assert.strict.deepStrictEqual(tr.events.slice(1), [{ type: 'cancel' }, { type: 'settle', by: 'cancel', files: 0, errs: 0 }])
        assert.strict.deepStrictEqual({ files: r.files, errs: r.errs, focus: env.window.nListeners('focus') }, { files: [], errs: {}, focus: 0 })
    })

    it(`should notify focus then judge with cancel true exactly 1500ms later and settle by focus with no files when no change arrives`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, seq, tr } = start()
            env.window.dispatch('focus')
            //JSDoc onTrace: focus為收到window之focus事件(舊瀏覽器備援)而排定1500ms後判定(ms固定1500); 1500ms本身即規格(假時鐘)
            await clock.advance(1499)
            assert.strict.deepStrictEqual(seq, ['t:open', 'click', 't:focus'])
            await clock.advance(1)
            await tr.wait((e) => e.type === 'settle')
            //JSDoc onTrace: judge之cancel為true代表此時尚未收到change而視為取消, 其後settle by為focus
            assert.strict.deepStrictEqual(tr.events.slice(1), [{ type: 'focus', ms: 1500 }, { type: 'judge', cancel: true }, { type: 'settle', by: 'focus', files: 0, errs: 0 }])
            let r = await pm
            assert.strict.deepStrictEqual({ files: r.files, body: env.body.children.length }, { files: [], body: 0 })
        }
        finally {
            clock.restore()
        }
    })

    it(`should settle by change (not as cancelled) and notify judge with cancel false when change arrives after the focus but before the 1500ms judgement`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, inp, seq, tr } = start()
            env.window.dispatch('focus')
            await clock.advance(1499) //change比focus晚逾300ms仍在判定窗內(實測於Windows/Chrome可穩定重現, 見函數註解)
            inp.files = [mkFile('late.txt')]
            inp.dispatchEvent({ type: 'change' })
            let r = await pm
            assert.strict.deepStrictEqual(nameOf(r), ['late.txt'])
            await clock.advance(1)
            await tr.wait((e) => e.type === 'judge')
            //JSDoc onTrace: judge之cancel為false代表change已先處理而不再結束; 全程只有一次settle
            assert.strict.deepStrictEqual(seq, ['t:open', 'click', 't:focus', 't:settle', 't:judge'])
            assert.strict.deepStrictEqual(tr.events.slice(1), [{ type: 'focus', ms: 1500 }, { type: 'settle', by: 'change', files: 1, errs: 0 }, { type: 'judge', cancel: false }])
        }
        finally {
            clock.restore()
        }
    })

    it(`should ignore a change that arrives after the cancel judgement has settled (no second settle)`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, inp, seq, tr } = start()
            env.window.dispatch('focus')
            await clock.advance(1500)
            await tr.wait((e) => e.type === 'settle')
            let r = await pm
            //判定窗之後才到之change: 監聽已移除而不處理(只有取消那一次settle)
            inp.files = [mkFile('toolate.txt')]
            inp.dispatchEvent({ type: 'change' })
            await flush()
            assert.strict.deepStrictEqual(seq, ['t:open', 'click', 't:focus', 't:judge', 't:settle'])
            assert.strict.deepStrictEqual(r.files, [])
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify open with entireHierarchy true and multiple true and not bind the window focus fallback`, async function() {
        let { pm, inp, seq, tr } = start({ entireHierarchy: true })
        //JSDoc opt.entireHierarchy: 啟用時強制multiple為true、使用webkitdirectory; JSDoc onTrace: open之值為生效後者; 不綁定window之focus備援故無focus事件
        assert.strict.deepStrictEqual(tr.events[0], { type: 'open', multiple: true, entireHierarchy: true })
        assert.strict.deepStrictEqual({ dir: inp.hasAttribute('webkitdirectory'), focus: env.window.nListeners('focus') }, { dir: true, focus: 0 })
        env.window.dispatch('focus')
        assert.strict.deepStrictEqual(seq, ['t:open', 'click'])
        //取消仍由input之cancel事件偵測
        inp.dispatchEvent({ type: 'cancel' })
        let r = await pm
        assert.strict.deepStrictEqual(r.files, [])
    })

    it(`should notify open with false for a non-boolean multiple and work without any option`, async function() {
        let a = start({ multiple: 'yes', entireHierarchy: 1 })
        assert.strict.deepStrictEqual(a.tr.events[0], { type: 'open', multiple: false, entireHierarchy: false })
        a.inp.dispatchEvent({ type: 'cancel' })
        await a.pm
        let pm = domShowInputAndGetFiles() //opt預設{}
        env.document.querySelector('input').dispatchEvent({ type: 'cancel' })
        assert.strict.deepStrictEqual((await pm).files, [])
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響選檔處理、不產生未處理之rejection
        let un = collectUnhandled()
        let rec = traceRec()
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                env.restore()
                env = mkBrowser()
                let clock = useFakeClock()
                try {
                    let call = () => (onTrace === undefined ? domShowInputAndGetFiles({ multiple: true }) : domShowInputAndGetFiles({ multiple: true, onTrace }))
                    let out = []
                    let snap = async (label, pm) => {
                        let r = await pm
                        out.push([label, nameOf(r), Object.keys(r.errs).length, env.body.children.length, env.window.nListeners('focus')])
                    }
                    let q = () => env.document.querySelector('input')
                    //change
                    let pa = call()
                    q().files = [mkFile('a.txt'), mkFile('b.txt')]
                    q().dispatchEvent({ type: 'change' })
                    await snap('change', pa)
                    //input之cancel事件
                    let pb = call()
                    q().dispatchEvent({ type: 'cancel' })
                    await snap('cancel', pb)
                    //focus備援: 判定窗內無change
                    let pc = call()
                    env.window.dispatch('focus')
                    await clock.advance(1500)
                    await snap('focus', pc)
                    //focus備援: 判定窗內change
                    let pd = call()
                    env.window.dispatch('focus')
                    await clock.advance(400)
                    q().files = [mkFile('c.txt')]
                    q().dispatchEvent({ type: 'change' })
                    await snap('late', pd)
                    await clock.advance(1100)
                    got.push(out)
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
        let one = [
            ['change', ['a.txt', 'b.txt'], 0, 0, 0],
            ['cancel', [], 0, 0, 0],
            ['focus', [], 0, 0, 0],
            ['late', ['c.txt'], 0, 0, 0],
        ]
        assert.strict.deepStrictEqual(got, [one, one, one, one, one])
        assert.strict.deepStrictEqual(un.list, [])
        //紀錄器確有收到事件(含取消路徑與判定窗)
        assert.strict.deepStrictEqual(['open', 'cancel', 'focus', 'judge', 'settle'].every((t) => rec.events.some((e) => e.type === t)), true)
    })

    it(`should notify open, cancel, focus, judge and settle with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4)
        let clock = useFakeClock()
        try {
            let rec = traceRec()
            let m = mkMeta(rec.on)
            let call = () => domShowInputAndGetFiles({ onTrace: m.fn })
            let q = () => env.document.querySelector('input')
            let p1 = call() //open
            q().dispatchEvent({ type: 'cancel' }) //cancel, settle(cancel)
            await p1
            let p2 = call()
            env.window.dispatch('focus') //focus
            await clock.advance(1500) //judge, settle(focus)
            await p2
            let p3 = call()
            q().files = [mkFile('a.txt')]
            q().dispatchEvent({ type: 'change' }) //settle(change)
            await p3
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { open: 'entireHierarchy,multiple,type', cancel: 'type', focus: 'ms,type', judge: 'cancel,type', settle: 'by,errs,files,type' })
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
