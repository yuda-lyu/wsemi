import assert from 'assert'
//import domShowInputDatatime from '../src/domShowInputDatatime.mjs'
import domShowInputDatatime from '../src/domShowInputDatatime.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { mkBrowser, fiveOnTrace, collectUnhandled, mkMeta, flush } from './tools/domFilesKit.mjs'


describe(`domShowInputDatatime`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`domShowInputDatatime 觀察回調(R-TRACE-01)`, function() {

    //以最小假瀏覽器(test/tools/domFilesKit.mjs之mkBrowser)驗證opt.onTrace之事件語意; 原生日曆視窗與change、focusout事件之先後非本檔驗證範圍, 依函數註解所載之現象(focusout比change快, 觸發時間最小可能為20ms)手動依序派發
    //1ms延遲彈出(setTimeout 1)與50ms延遲觸發(evFocusout之setTimeout)本身即規格, 於假時鐘下以advance精確推進(P5), 其餘斷言事件序列與內容(P1、P2)
    //未傳回調時行為不變、回調之拋錯與回傳rejection不影響時間選取、不產生未處理之rejection(P3、P4)

    let env = null
    let btn = null

    beforeEach(function() {
        env = mkBrowser()
        btn = env.mkEle('button') //觸發元素(須在頁面中且有父層)
    })

    afterEach(function() {
        env.restore()
    })

    //start, 呼叫函數(eleRef為btn); seq記錄onTrace事件('t:<type>')與showPicker('showPicker')之先後
    let start = (time, opt = {}) => {
        let seq = []
        let tr = traceRec()
        env.onShowPicker = () => seq.push('showPicker')
        let onTrace = (e) => {
            seq.push('t:' + e.type)
            tr.on(e)
        }
        let pm = domShowInputDatatime(time, { eleRef: btn, onTrace, ...opt })
        return { pm, seq, tr }
    }

    //inpOf, 取得頁面中的時間輸入框
    let inpOf = () => env.document.querySelector('input')

    //pending, 取Promise是否已settle之探針(讓出一次事件迴圈後讀取)
    let probe = (pm) => {
        let st = { settled: false, v: undefined }
        pm.then((v) => {
            st.settled = true
            st.v = v
        })
        return st
    }

    it(`should notify mount at once and picker 1ms later before showPicker is called`, async function() {
        let clock = useFakeClock()
        try {
            let { seq, tr } = start('2000-01-01T00:00:00')
            //JSDoc onTrace: mount為已將時間輸入框放入頁面而排定1ms後延遲彈出(含生效後之inpType、withValue為是否帶預設值); 1ms延遲本身即規格(假時鐘)
            assert.strict.deepStrictEqual(tr.events, [{ type: 'mount', inpType: 'datetime-local', withValue: true }])
            assert.strict.deepStrictEqual({ value: inpOf().value, showPicker: env.nShowPicker, change: inpOf().nListeners('change') }, { value: '2000-01-01T00:00', showPicker: 0, change: 0 })
            await clock.advance(1)
            //JSDoc onTrace: picker為延遲後已綁定change監聽而即將彈出日曆視窗; 事件於showPicker之前通知
            assert.strict.deepStrictEqual(seq, ['t:mount', 't:picker', 'showPicker'])
            assert.strict.deepStrictEqual({ showPicker: env.nShowPicker, change: inpOf().nListeners('change'), focusout: btn.nListeners('focusout') }, { showPicker: 1, change: 1, focusout: 1 })
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify mount with the effective inpType and withValue (date type, invalid type, no or invalid time)`, function() {
        //假時鐘下呼叫, 使1ms延遲彈出之計時器於還原時一併丟棄(不在測試結束後觸發)
        let clock = useFakeClock()
        try {
            let cases = [
                ['2000-01-01', { type: 'date' }, 'date', true, '2000-01-01'],
                ['2000-01-01T08:09:10', { type: 'date' }, 'date', false, ''], //date型態要求日期字串
                ['2000-01-01T08:09:10', {}, 'datetime-local', true, '2000-01-01T08:09'],
                ['2000-01-01T08:09:10', { type: 'time' }, 'datetime-local', true, '2000-01-01T08:09'], //無效型態退回datetime-local
                [undefined, {}, 'datetime-local', false, ''],
                ['abc', {}, 'datetime-local', false, ''],
            ]
            for (let [time, opt, inpType, withValue, value] of cases) {
                env.restore()
                env = mkBrowser()
                btn = env.mkEle('button')
                let { tr } = start(time, opt)
                assert.strict.deepStrictEqual({ time, ev: tr.events, value: inpOf().value, hasAttr: inpOf().hasAttribute('value') }, { time, ev: [{ type: 'mount', inpType, withValue }], value, hasAttr: withValue })
            }
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify change and settle by change with the new time and clean up when the input change event arrives`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, seq, tr } = start('2000-01-01T00:00:00')
            await clock.advance(1)
            let inp = inpOf()
            inp.value = '2000-02-03T04:05'
            inp.dispatchEvent({ type: 'change' })
            let r = await pm
            //JSDoc onTrace: change為收到輸入框之change事件(含value為輸入框之值), settle之by為change、changed為true、value為將resolve之新時間(datetime-local補':00')
            assert.strict.deepStrictEqual(tr.events.slice(2), [{ type: 'change', value: '2000-02-03T04:05' }, { type: 'settle', by: 'change', changed: true, value: '2000-02-03T04:05:00' }])
            assert.strict.deepStrictEqual(seq.slice(3), ['t:change', 't:settle'])
            assert.strict.deepStrictEqual(r, '2000-02-03T04:05:00')
            //結束後輸入框移除、監聽解除
            assert.strict.deepStrictEqual({ children: env.body.children.map((c) => c.tagName), change: inp.nListeners('change'), focusout: btn.nListeners('focusout') }, { children: ['BUTTON'], change: 0, focusout: 0 })
        }
        finally {
            clock.restore()
        }
    })

    it(`should settle by change with the date string as is for the date type`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, tr } = start('2000-01-01', { type: 'date' })
            await clock.advance(1)
            inpOf().value = '2001-03-04'
            inpOf().dispatchEvent({ type: 'change' })
            let r = await pm
            //JSDoc @returns: date型態回傳日期字串(不補時間)
            assert.strict.deepStrictEqual(tr.events.slice(2), [{ type: 'change', value: '2001-03-04' }, { type: 'settle', by: 'change', changed: true, value: '2001-03-04' }])
            assert.strict.deepStrictEqual(r, '2001-03-04')
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify focusout and settle by focusout with changed false exactly 50ms later and never resolve when the picker is dismissed`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, seq, tr } = start('2000-01-01T00:00:00')
            let st = probe(pm)
            await clock.advance(1)
            btn.dispatchEvent({ type: 'focusout' })
            //JSDoc onTrace: focusout為觸發元素收到focusout而排定50ms後觸發(ms固定50); 50ms本身即規格(假時鐘)
            await clock.advance(49)
            assert.strict.deepStrictEqual(seq, ['t:mount', 't:picker', 'showPicker', 't:focusout'])
            await clock.advance(1)
            await tr.wait((e) => e.type === 'settle')
            //JSDoc onTrace: settle之changed為false、value為null代表未變更時間(Promise不會resolve, 見函數註解「未變更時間」)
            assert.strict.deepStrictEqual(tr.events.slice(2), [{ type: 'focusout', ms: 50 }, { type: 'settle', by: 'focusout', changed: false, value: null }])
            await flush()
            assert.strict.deepStrictEqual(st.settled, false)
            assert.strict.deepStrictEqual({ children: env.body.children.map((c) => c.tagName), focusout: btn.nListeners('focusout') }, { children: ['BUTTON'], focusout: 0 })
        }
        finally {
            clock.restore()
        }
    })

    it(`should settle by change and notify skip when the change arrives within the 50ms after the focusout (change slower than focusout)`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, seq, tr } = start('2000-01-01T00:00:00')
            await clock.advance(1)
            btn.dispatchEvent({ type: 'focusout' })
            await clock.advance(30)
            inpOf().value = '2000-05-06T07:08'
            inpOf().dispatchEvent({ type: 'change' })
            let r = await pm
            await clock.advance(20)
            await tr.wait((e) => e.type === 'skip')
            //JSDoc onTrace: skip為觸發時已有先前之觸發而略過(by為略過者之來源); 全程只有一次settle
            assert.strict.deepStrictEqual(tr.events.slice(2), [{ type: 'focusout', ms: 50 }, { type: 'change', value: '2000-05-06T07:08' }, { type: 'settle', by: 'change', changed: true, value: '2000-05-06T07:08:00' }, { type: 'skip', by: 'focusout' }])
            assert.strict.deepStrictEqual(seq.slice(-2), ['t:settle', 't:skip'])
            assert.strict.deepStrictEqual(r, '2000-05-06T07:08:00')
        }
        finally {
            clock.restore()
        }
    })

    it(`should settle by change with changed false and never resolve when the change value is empty`, async function() {
        let clock = useFakeClock()
        try {
            let { pm, tr } = start('2000-01-01T00:00:00')
            let st = probe(pm)
            await clock.advance(1)
            inpOf().value = ''
            inpOf().dispatchEvent({ type: 'change' })
            //JSDoc onTrace: change之value為空字串; 空值視為未變更, settle之changed為false、value為null
            assert.strict.deepStrictEqual(tr.events.slice(2), [{ type: 'change', value: '' }, { type: 'settle', by: 'change', changed: false, value: null }])
            await flush()
            assert.strict.deepStrictEqual(st.settled, false)
        }
        finally {
            clock.restore()
        }
    })

    it(`should insert the input after document.activeElement when eleRef is not an element`, async function() {
        let clock = useFakeClock()
        try {
            env.document.activeElement = btn
            let tr = traceRec()
            let pm = domShowInputDatatime('2000-01-01T00:00:00', { eleRef: 'not-an-element', onTrace: tr.on })
            await clock.advance(1)
            //eleRef無效時退回document.activeElement: 輸入框容器緊接於其後, 其focusout被監聽
            assert.strict.deepStrictEqual({ next: btn.nextSibling.getAttribute('name'), focusout: btn.nListeners('focusout') }, { next: 'GrpDomShowDatatime', focusout: 1 })
            inpOf().value = '2000-01-02T03:04'
            inpOf().dispatchEvent({ type: 'change' })
            assert.strict.deepStrictEqual(await pm, '2000-01-02T03:04:00')
        }
        finally {
            clock.restore()
        }
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響時間選取、不產生未處理之rejection
        let un = collectUnhandled()
        let rec = traceRec()
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                env.restore()
                env = mkBrowser()
                btn = env.mkEle('button')
                let clock = useFakeClock()
                try {
                    let call = (time, opt = {}) => (onTrace === undefined ? domShowInputDatatime(time, { eleRef: btn, ...opt }) : domShowInputDatatime(time, { eleRef: btn, onTrace, ...opt }))
                    let out = []
                    let snap = async (label, pm) => {
                        let st = probe(pm)
                        await flush()
                        out.push([label, st.settled, st.v, env.body.children.length, btn.nListeners('focusout')])
                    }
                    //change(datetime-local)
                    let pa = call('2000-01-01T00:00:00')
                    await clock.advance(1)
                    inpOf().value = '2000-02-03T04:05'
                    inpOf().dispatchEvent({ type: 'change' })
                    await snap('change', pa)
                    //change(date)
                    let pb = call('2000-01-01', { type: 'date' })
                    await clock.advance(1)
                    inpOf().value = '2001-03-04'
                    inpOf().dispatchEvent({ type: 'change' })
                    await snap('date', pb)
                    //focusout取消(不resolve)
                    let pc = call('2000-01-01T00:00:00')
                    await clock.advance(1)
                    btn.dispatchEvent({ type: 'focusout' })
                    await clock.advance(50)
                    await snap('focusout', pc)
                    //focusout後change(窗內)
                    let pd = call('2000-01-01T00:00:00')
                    await clock.advance(1)
                    btn.dispatchEvent({ type: 'focusout' })
                    await clock.advance(30)
                    inpOf().value = '2000-05-06T07:08'
                    inpOf().dispatchEvent({ type: 'change' })
                    await snap('race', pd)
                    await clock.advance(20)
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
            ['change', true, '2000-02-03T04:05:00', 1, 0],
            ['date', true, '2001-03-04', 1, 0],
            ['focusout', false, undefined, 1, 0],
            ['race', true, '2000-05-06T07:08:00', 1, 0],
        ]
        assert.strict.deepStrictEqual(got, [one, one, one, one, one])
        assert.strict.deepStrictEqual(un.list, [])
        //紀錄器確有收到事件(含略過)
        assert.strict.deepStrictEqual(['mount', 'picker', 'focusout', 'change', 'skip', 'settle'].every((t) => rec.events.some((e) => e.type === t)), true)
    })

    it(`should notify mount, picker, focusout, change, skip and settle with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4)
        let clock = useFakeClock()
        try {
            let rec = traceRec()
            let m = mkMeta(rec.on)
            let call = () => domShowInputDatatime('2000-01-01T00:00:00', { eleRef: btn, onTrace: m.fn })
            let p1 = call() //mount, picker
            await clock.advance(1)
            btn.dispatchEvent({ type: 'focusout' }) //focusout
            await clock.advance(30)
            inpOf().value = '2000-05-06T07:08'
            inpOf().dispatchEvent({ type: 'change' }) //change, settle
            await p1
            await clock.advance(20) //skip
            await rec.wait((e) => e.type === 'skip')
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { mount: 'inpType,type,withValue', picker: 'type', focusout: 'ms,type', change: 'type,value', skip: 'by,type', settle: 'by,changed,type,value' })
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
