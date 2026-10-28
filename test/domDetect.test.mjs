import assert from 'assert'
import domDetect from '../src/domDetect.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


//本函數於瀏覽器執行, 以ResizeObserver、MutationObserver、window與document偵測元素尺寸, nodejs無此等物件, 故以假環境覆蓋全域
//  假ResizeObserver與假MutationObserver只記錄觀察對象, 由測試呼叫fireRO、fireMO或frame觸發回呼, 可精確控制瀏覽器於何時回報
//  假元素之尺寸、是否在頁面中、display與父元素由測試直接設定; 隱藏以display:none且尺寸0模擬(延後發出前之確認只看是否被繪製, 不讀外框)
//  瀏覽器本身之語義(只觀察content-box時漏掉padding變化、行內元素不回報、開始觀察必回報一次、同盒再observe不重建觀察、捲軸佔寬、確認不強制重排等)非本檔所能驗證, 已另以真瀏覽器實測


let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


class Ele {
    constructor(w, h, o = {}) {
        this.nodeType = 1
        this.display = o.display || 'block'
        this.isConnected = o.connected !== false
        this.parentElement = o.parent || null
        if (o.cv) {
            //checkVisibility, 同瀏覽器: 不在頁面中或自身、祖先為display:none者為false
            this.checkVisibility = () => {
                let e = this
                while (e) {
                    if (!e.isConnected || e.display === 'none') {
                        return false
                    }
                    e = e.parentElement
                }
                return true
            }
        }
        this.size(w, h, o.cw, o.ch)
    }

    size(w, h, cw, ch) {
        this.offsetWidth = w
        this.offsetHeight = h
        this.clientWidth = (cw !== undefined) ? cw : w
        this.clientHeight = (ch !== undefined) ? ch : h
    }
}


//hide, show, 以display隱藏與顯示(同v-show), 隱藏時尺寸為0
function hide(el) {
    el.display = 'none'
    el.size(0, 0)
}


function show(el, w, h) {
    el.display = 'block'
    el.size(w, h)
}


let envCur = null


//mkEnv, 建立假window與document並覆蓋全域
function mkEnv(o = {}) {
    let env = {
        ros: [],
        mos: [],
        listeners: [],
        dds: [],
    }

    class RO {
        constructor(cb) {
            this.cb = cb
            this.targets = new Map()
            this.last = new Map() //各觀察對象上次回報之尺寸, 新建之觀察為undefined(與瀏覽器相同, 開始觀察必回報一次)
            env.ros.push(this)
        }

        observe(t, opt) {
            //同瀏覽器(Blink、Gecko)之實作: 已以同一盒觀察者再observe直接返回, 不重建觀察(上次回報之尺寸不歸零), 與規範所寫之先unobserve不同
            let box = (opt && opt.box) ? opt.box : 'content-box'
            if (this.targets.get(t) === box) {
                return
            }
            this.targets.set(t, box)
            this.last.set(t, undefined)
        }

        unobserve(t) {
            this.targets.delete(t)
            this.last.delete(t)
        }

        disconnect() {
            this.targets.clear()
            this.last.clear()
        }
    }

    class MO {
        constructor(cb) {
            this.cb = cb
            this.active = false
            env.mos.push(this)
        }

        observe(t, opt) {
            this.active = true
            this.target = t
            this.opt = opt
        }

        disconnect() {
            this.active = false
        }
    }

    env.window = {
        innerWidth: 1200,
        innerHeight: 800,
        ResizeObserver: o.noRO ? undefined : RO,
        MutationObserver: MO,
        addEventListener: (type, fn) => {
            env.listeners.push({ type, fn })
        },
        removeEventListener: (type, fn) => {
            env.listeners = env.listeners.filter((l) => !(l.type === type && l.fn === fn))
        },
        getComputedStyle: (e) => {
            //未插入DOM之元素取不到計算後樣式, display為空字串, 與瀏覽器一致
            return { display: e.isConnected ? e.display : '' }
        },
    }
    env.document = { documentElement: { name: 'html' } }
    globalThis.window = env.window
    globalThis.document = env.document

    //fireRO, 瀏覽器回報ele之尺寸變化; box不給時兩種盒皆回報, 給定時只回報觀察該盒者
    env.fireRO = (ele, box) => {
        for (let ro of env.ros) {
            let b = ro.targets.get(ele)
            if (b !== undefined && (box === undefined || b === box)) {
                ro.cb([{ target: ele }], ro)
            }
        }
    }

    //frame, 逐幀模型: 同瀏覽器之ResizeObserver, 各觀察對象所觀察之盒尺寸與上次回報不同(新建之觀察必不同)時才回報
    //  fireRO為測試直接指定回報, 不理會上次回報之尺寸; 需要「尺寸未變即不回報」之語義者用frame
    env.frame = () => {
        for (let ro of env.ros) {
            let entries = []
            for (let [t, box] of ro.targets) {
                let cur = box === 'border-box' ? `${t.offsetWidth}x${t.offsetHeight}` : `${t.clientWidth}x${t.clientHeight}`
                if (ro.last.get(t) !== cur) {
                    ro.last.set(t, cur)
                    entries.push({ target: t })
                }
            }
            if (entries.length > 0) {
                ro.cb(entries, ro)
            }
        }
    }

    //fireMO, DOM變動
    env.fireMO = () => {
        for (let m of env.mos) {
            if (m.active) {
                m.cb([], m)
            }
        }
    }

    //resizeWindow
    env.resizeWindow = (w, h) => {
        env.window.innerWidth = w
        env.window.innerHeight = h
        for (let l of env.listeners.slice()) {
            if (l.type === 'resize') {
                l.fn({ type: 'resize' })
            }
        }
    }

    env.moActive = () => env.mos.filter((m) => m.active).length
    env.observed = (ele) => env.ros.map((ro) => ro.targets.get(ele)).filter((b) => b !== undefined).sort()
    env.nRoTargets = () => env.ros.reduce((n, ro) => n + ro.targets.size, 0)

    //dd, 建立偵測器並記錄事件; 測試結束時統一clear, 避免模組共用之MutationObserver跨測試殘留
    env.dd = (f, opt) => {
        let d = domDetect(f, opt)
        let rec = {
            d,
            resize: [],
            rww: [],
        }
        if (d) {
            d.on('resize', (m) => rec.resize.push(m))
            d.on('resizeWithWindow', (m) => rec.rww.push(m))
            env.dds.push(d)
        }
        return rec
    }

    envCur = env
    return env
}


//ws, 各resize事件之寬
function ws(rec) {
    return rec.resize.map((m) => m.snew.offsetWidth)
}


//以觀察回調(opt.onTrace)同步, 不以固定等待(R-TRACE-01): 定期量測(輪詢、行內元素)為setInterval, 判定為變化後再以setTimeout延後1ms發出, 為兩跳之鏈, 負載下固定等待可先結束而使測試提早改變狀態(2026-10-28主控全套於高負載時即因此少一筆)
//settle, 等索引from之後各次判定為變化之量測(check之changed為true)之結果(emit或skip, 以seq對應)
async function settle(tr, from) {
    for (let e of tr.events.slice(from)) {
        if (e.type === 'check' && e.changed) {
            await tr.wait((x) => (x.type === 'emit' || x.type === 'skip') && x.seq === e.seq, from)
        }
    }
}


//sample, 等此後下一次指定來源(poll、inline)之量測及其結果; 測試於呼叫前同步改動之狀態必於該次量測讀到
async function sample(tr, source) {
    let from = tr.mark()
    await tr.wait((e) => e.type === 'check' && e.source === source, from)
    await settle(tr, from)
}


//inlines, 自索引from起行內元素定期量測之開始與停止
function inlines(tr, from = 0) {
    return tr.events.slice(from).filter((e) => e.type === 'inline').map((e) => e.on)
}


//clearAll, 清除目前環境之偵測器; 用假時鐘之測試於還原時鐘前呼叫, 使其計時器於假時鐘內清除
function clearAll(env) {
    for (let d of env.dds) {
        d.clear()
    }
}


describe(`domDetect`, function() {

    afterEach(function() {
        if (envCur) {
            for (let d of envCur.dds) {
                d.clear()
            }
            envCur = null
        }
    })

    after(function() {
        delete globalThis.window
        delete globalThis.document
    })

    //--- 首次與事件內容 ---

    it(`should emit resize and resizeWithWindow once the element is first measured`, async function() {
        //D9 首次取得非0尺寸時發出, sold為0
        let env = mkEnv()
        let el = new Ele(300, 40, { cw: 290, ch: 30 })
        let r = env.dd(() => el)
        env.fireRO(el)
        await sleep(10)
        //width、height為比較用尺寸, 未給getSize時同offsetWidth、offsetHeight
        let snew = { offsetWidth: 300, offsetHeight: 40, clientWidth: 290, clientHeight: 30, windowWidth: 1200, windowHeight: 800, width: 300, height: 40 }
        let sold = { offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0, windowWidth: 0, windowHeight: 0, width: 0, height: 0 }
        let smode = { width: 'larger', height: 'larger' }
        assert.strict.deepStrictEqual(r.resize, [{ sold, snew, smode, ele: el }])
        assert.strict.deepStrictEqual(r.rww, [{ sold, snew, smode, ele: el, from: 'dom' }])
    })

    it(`should observe both the border box and the content box`, function() {
        //F1 比較用之offsetWidth即border-box; content-box則負責捲軸出現或消失
        let env = mkEnv()
        let el = new Ele(300, 40)
        env.dd(() => el)
        assert.strict.deepStrictEqual(env.observed(el), ['border-box', 'content-box'])
    })

    it(`should emit when only the border box changes, such as padding or border`, async function() {
        //F1、G1 只改padding或border時content-box不變, 須靠border-box之回報
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        el.size(340, 40, 340, 40)
        env.fireRO(el, 'border-box')
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 340])
    })

    it(`should keep clientWidth fresh when only the content box changes, such as a scrollbar`, async function() {
        //F1、G8 捲軸出現時offsetWidth不變而clientWidth變小, 不發出dom事件, 但之後視窗事件須帶最新之clientWidth
        let env = mkEnv()
        let el = new Ele(300, 100)
        let r = env.dd(() => el)
        env.fireRO(el)
        await sleep(10)
        el.size(300, 100, 285, 100)
        env.fireRO(el, 'content-box')
        await sleep(10)
        env.resizeWindow(1000, 800)
        assert.strict.deepStrictEqual(ws(r), [300])
        let last = r.rww[r.rww.length - 1]
        assert.strict.deepStrictEqual([last.from, last.snew.clientWidth, last.snew.offsetWidth], ['window', 285, 300])
    })

    //--- 比較規則 ---

    it(`should not emit a zero size, and emit again when shown at the same size`, async function() {
        //D1、D5 尺寸為0不發出; 由隱藏恢復顯示時即使尺寸相同亦發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        el.size(0, 0)
        env.fireRO(el)
        el.size(300, 40)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 300])
        assert.strict.deepStrictEqual(r.resize[1].sold.offsetWidth, 0)
    })

    it(`should emit when small changes accumulate beyond the tolerance when toleranceBounce is 0`, async function() {
        //F2、G3 toleranceBounce為0(舊版行為): 比較基準為上次發出之尺寸, 每次+1px不超過容許誤差1, 累積至2px即發出, sold與smode皆相對於基準
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { toleranceBounce: 0 })
        for (let w of [300, 301, 302, 303, 304, 303, 302]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 302, 304, 302])
        assert.strict.deepStrictEqual(r.resize.map((m) => m.sold.offsetWidth), [0, 300, 302, 304])
        assert.strict.deepStrictEqual(r.resize.map((m) => m.smode.width), ['larger', 'larger', 'larger', 'smaller'])
    })

    it(`should emit every change when tolerancePixel is 0`, async function() {
        //缺陷B 原以ispint驗證故0被改回1
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { tolerancePixel: 0 })
        for (let w of [300, 301, 303]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 303])
    })

    it(`should fall back to a tolerance of one for an invalid tolerancePixel`, async function() {
        //toleranceBounce為0使容許誤差內之301不發出, 以301是否發出區分容許誤差為1或0
        for (let tol of [-1, 'x', 1.5, null]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { tolerancePixel: tol, toleranceBounce: 0 })
            for (let w of [300, 301, 303]) {
                el.size(w, 40)
                env.fireRO(el)
            }
            await sleep(10)
            assert.strict.deepStrictEqual(ws(r), [300, 303], String(tol))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should compare the height as well as the width`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        el.size(300, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetHeight, m.smode.width, m.smode.height]), [[40, 'larger', 'larger'], [60, '', 'larger']])
    })

    it(`should give no direction for an axis within the tolerance when the other axis triggers`, async function() {
        //預設下寬+1px自行發出; 之後高+20px觸發發出時寬差為0: 寬之方向須為空, 否則依方向判斷變寬或變窄之使用端會誤動作
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        el.size(301, 40)
        env.fireRO(el)
        el.size(301, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 40, 'larger', ''], [301, 60, '', 'larger']])
        assert.strict.deepStrictEqual([r.resize[1].sold.offsetWidth, r.resize[1].sold.offsetHeight], [300, 40])
    })

    it(`should give no direction for an axis within the tolerance when the other axis triggers and toleranceBounce is 0`, async function() {
        //toleranceBounce為0(舊版行為): 寬先+1px(未超過容許誤差, 不發出), 之後高+20px觸發發出: 寬之方向須為空
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { toleranceBounce: 0 })
        env.fireRO(el)
        el.size(301, 40)
        env.fireRO(el)
        el.size(301, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 60, '', 'larger']])
        assert.strict.deepStrictEqual([r.resize[1].sold.offsetWidth, r.resize[1].sold.offsetHeight], [300, 40])
    })

    //--- 容許誤差內之變化與回授 ---

    it(`should emit every same-direction change within the tolerance by default`, async function() {
        //容許誤差內之同向變化(逐px動畫或拖曳)照常發出, 末段恰差1px者不得被略過; 反向一次(304→303)未達跳動次數亦發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 301, 302, 303, 304, 303, 302]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 302, 303, 304, 303, 302])
        assert.strict.deepStrictEqual(r.resize.map((m) => m.sold.offsetWidth), [0, 300, 301, 302, 303, 304, 303])
        assert.strict.deepStrictEqual(r.resize.map((m) => m.smode.width), ['larger', 'larger', 'larger', 'larger', 'larger', 'smaller', 'smaller'])
    })

    it(`should give no direction for a bouncing axis when the other axis triggers`, async function() {
        //寬於容許誤差內來回跳動達次數而不再發出(301→300), 之後高+20px觸發發出: 寬之方向須為空(殘餘之跳動不帶出方向)
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 301, 300, 301, 300]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        el.size(300, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 40, 'larger', ''], [300, 40, 'smaller', ''], [301, 40, 'larger', ''], [300, 60, '', 'larger']])
    })

    it(`should stop emitting within-tolerance changes after bouncing toleranceBounce times`, async function() {
        //使用端於事件內改變尺寸所形成之1px來回回授: 反向第3次(預設)起不再發出, 回授即中斷
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 301, 300, 301, 300, 301, 300, 301]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 300, 301])
    })

    it(`should count bounces the same whether the first change is up or down`, async function() {
        //首次量得前無前次量測, 首次之尺寸不帶方向: 先減後增之來回跳動與先增後減者同樣於反向第3次停止(皆發出4次)
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 299, 300, 299, 300, 299, 300, 299]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 299, 300, 299])
    })

    it(`should resume within-tolerance changes after a same-direction change or a change beyond the tolerance`, async function() {
        //跳動停止後: 同向之容許誤差內變化(301→302)恢復發出; 超過容許誤差之變化(302→305)照常發出且重新計數
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 301, 300, 301, 300, 301, 302, 305, 306, 305, 306, 305, 306]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 300, 301, 302, 305, 306, 305, 306])
    })

    it(`should count bounces per axis`, async function() {
        //寬來回跳動而停止時, 高之同向逐px變化照常發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        let seq = [[300, 40], [301, 40], [300, 40], [301, 40], [300, 41], [301, 42], [300, 43]]
        for (let [w, h] of seq) {
            el.size(w, h)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 40, 'larger', ''], [300, 40, 'smaller', ''], [301, 40, 'larger', ''], [300, 41, '', 'larger'], [301, 42, '', 'larger'], [300, 43, '', 'larger']])
    })

    it(`should judge both axes on every measurement even when one of them already triggers`, async function() {
        //寬逐px前進(每次皆判定而發出), 高同時於40、41來回跳動: 高須每次各自判定, 反向第3次起不判定而方向為空; 若寬已判定即略過高, 高之方向與計次皆錯
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let [w, h] of [[300, 40], [301, 41], [302, 40], [303, 41], [304, 40], [305, 41]]) {
            el.size(w, h)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.smode.width, m.smode.height]), [[300, 'larger', 'larger'], [301, 'larger', 'larger'], [302, 'larger', 'smaller'], [303, 'larger', 'larger'], [304, 'larger', ''], [305, 'larger', '']])
    })

    it(`should apply toleranceBounce as given, and fall back to three for an invalid value`, async function() {
        //給1: 反向第1次起不再發出; 給Infinity: 永不停止; 無效(-1、'x'、1.5、null)用預設3
        let seq = [300, 301, 300, 301, 300, 301, 300]
        let run = async (tb) => {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { toleranceBounce: tb })
            for (let w of seq) {
                el.size(w, 40)
                env.fireRO(el)
            }
            await sleep(10)
            let out = ws(r)
            for (let d of env.dds) {
                d.clear()
            }
            return out
        }
        assert.strict.deepStrictEqual(await run(1), [300, 301])
        assert.strict.deepStrictEqual(await run('2'), [300, 301, 300])
        assert.strict.deepStrictEqual(await run(Infinity), seq)
        for (let tb of [-1, 'x', 1.5, null]) {
            assert.strict.deepStrictEqual(await run(tb), [300, 301, 300, 301], String(tb))
        }
    })

    it(`should emit nothing within an infinite tolerance regardless of toleranceBounce`, async function() {
        //容許誤差為Infinity仍為任何變化皆不發出(首次量得亦同)
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { tolerancePixel: Infinity, toleranceBounce: Infinity })
        for (let w of [300, 301, 350, 302]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [])
    })

    it(`should stop a one-way feedback within the tolerance after ten emits`, async function() {
        //使用端於事件內使尺寸同向再+1px(例如以含框線之offsetHeight設定撐開自身之子元素高): 容許誤差內同向連續發出10次後中斷, 不得逐次無限增長
        let env = mkEnv()
        let el = new Ele(100, 40)
        let tr = traceRec()
        let r = env.dd(() => el, { onTrace: tr.on })
        r.d.on('resize', (m) => {
            el.size(m.snew.offsetWidth + 1, 40)
            env.fireRO(el)
        })
        env.fireRO(el)
        //回授為逐次延後1ms之鏈, 以觀察回調等到第11次發出; 其監聽器內之+1px(111)於同一回呼內同步量測, 續行時已記錄
        let e11 = await tr.wait((e) => e.type === 'emit', 0, 11)
        assert.strict.deepStrictEqual([ws(r).length, ws(r)[ws(r).length - 1], el.offsetWidth], [11, 110, 111])
        //中斷: 第11次發出後之量測(兩盒各一次)皆判定為不變化, 不再交付發出, 故不會有第12次
        let after = tr.events.slice(tr.events.indexOf(e11) + 1)
        assert.strict.deepStrictEqual(after.map((e) => [e.type, e.width, e.changed]), [['check', 111, false], ['check', 111, false]])
    })

    it(`should skip one within-tolerance change after ten same-direction emits, and emit the next change that exceeds the tolerance`, async function() {
        //非回授之持續逐px變化: 連續10次後之第11次(311)不發出, 下一次(312)相對基準310已超過容許誤差而照發並重新計數, 其後313～322再連續10次照發
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        let seq = []
        for (let w = 300; w <= 322; w++) {
            seq.push(w)
        }
        for (let w of seq) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        let exp = seq.filter((w) => w !== 311)
        assert.strict.deepStrictEqual(ws(r), exp)
    })

    it(`should reset the one-way count on a reversal`, async function() {
        //連續10次後之311不發出; 反向回到310時與基準相同而不發出, 其後309為反向後之同向變化照常發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        let seq = []
        for (let w = 300; w <= 311; w++) {
            seq.push(w)
        }
        seq.push(310, 309)
        for (let w of seq) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 309])
    })

    it(`should not limit within-tolerance changes when toleranceBounce is Infinity`, async function() {
        //給Infinity: 容許誤差內之變化一律發出(不阻斷回授), 同向連續超過10次亦發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { toleranceBounce: Infinity })
        let seq = []
        for (let w = 300; w <= 315; w++) {
            seq.push(w)
        }
        for (let w of seq) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), seq)
    })

    it(`should not take finding a lost element again as a reversal`, async function() {
        //跳動計數至2(方向為-)後元素暫時取不到再取回(同尺寸), 之後-1px: 取不到之期間無量測, 不得以0為前次量測而誤計反向, 297照常發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let cur = el
        let r = env.dd(() => cur)
        for (let w of [300, 299, 298, 299, 298]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        cur = null
        r.d.refresh()
        await sleep(10)
        cur = el
        r.d.refresh()
        await sleep(10)
        el.size(297, 40)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 299, 298, 299, 298, 297])
    })

    it(`should not compare directions across a replaced element`, async function() {
        //跳動計數至2(方向為-)後元素被移除而換為寬299之新節點: 不同元素之量測不比較方向, 新節點之299為容許誤差內之變化照常發出(若以舊節點之298比較則誤計第3次反向而不發出)
        let env = mkEnv()
        let a = new Ele(300, 40)
        let cur = a
        let r = env.dd(() => cur)
        for (let w of [300, 299, 298, 299, 298]) {
            a.size(w, 40)
            env.fireRO(a)
        }
        await sleep(10)
        let b = new Ele(299, 40)
        cur = b
        a.isConnected = false
        a.size(0, 0)
        env.fireRO(a)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 299, 298, 299, 298, 299])
    })

    it(`should not carry the bounce count across a hidden period`, async function() {
        //來回跳動計數至2後隱藏再顯示: 隱藏使回授中斷, 顯示後重新計數, 其後之來回跳動同樣於反向第3次停止(顯示後發出4次)
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        for (let w of [300, 301, 300, 301]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        hide(el)
        env.fireRO(el)
        show(el, 301, 40)
        env.fireRO(el)
        for (let w of [300, 301, 300, 301]) {
            el.size(w, 40)
            env.fireRO(el)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300, 301, 300, 301, 301, 300, 301, 300])
    })

    it(`should not count a change without a movement toward the one-way limit`, async function() {
        //換為寬299之新節點: 與舊節點發出之298差1而判定為變化, 但相鄰量測無移動可言, 不計入同向連續上限; 其後300～309連續10次照發
        let env = mkEnv()
        let a = new Ele(298, 40)
        let cur = a
        let r = env.dd(() => cur)
        env.fireRO(a)
        await sleep(10)
        let b = new Ele(299, 40)
        cur = b
        a.isConnected = false
        a.size(0, 0)
        env.fireRO(a)
        await sleep(10)
        for (let w = 300; w <= 309; w++) {
            b.size(w, 40)
            env.fireRO(b)
        }
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309])
    })

    //--- 發出時點與清除 ---

    it(`should emit asynchronously by default and synchronously with sync`, async function() {
        //D14 sync時於ResizeObserver回呼內同步發出, 供須於繪製前更新版面之使用端
        let env = mkEnv()
        let el1 = new Ele(300, 40)
        let el2 = new Ele(300, 40)
        let r1 = env.dd(() => el1)
        let r2 = env.dd(() => el2, { sync: true })
        env.fireRO(el1)
        env.fireRO(el2)
        let n = [r1.resize.length, r2.resize.length]
        await sleep(10)
        assert.strict.deepStrictEqual(n, [0, 1])
        assert.strict.deepStrictEqual([r1.resize.length, r2.resize.length], [1, 1])
    })

    it(`should not emit scheduled events after clear`, async function() {
        //缺陷A 已排定之事件於clear後不得發出; 兩種模式共用同一段發出與清除
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        r.d.clear()
        await sleep(10)
        assert.strict.deepStrictEqual([r.resize.length, r.rww.length], [0, 0])
    })

    it(`should clear at any time, even before the element exists, and release everything`, async function() {
        //D2 元素尚未取得即clear不得拋錯, 且觀察器、共用MutationObserver與視窗監聽全數解除; 重複clear無害
        let env = mkEnv()
        let el = null
        let r = env.dd(() => el)
        assert.strict.deepStrictEqual(env.moActive(), 1)
        assert.doesNotThrow(() => {
            r.d.clear()
            r.d.clear()
        })
        el = new Ele(300, 40)
        env.fireMO()
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual([env.moActive(), env.nRoTargets(), env.listeners.length, r.resize.length], [0, 0, 0, 0])
    })

    it(`should release the observers, the shared MutationObserver and the window listener on clear`, async function() {
        //已觀察元素後clear, 兩個ResizeObserver皆解除
        let env = mkEnv()
        let el = new Ele(0, 0)
        let r = env.dd(() => el)
        env.fireRO(el)
        assert.strict.deepStrictEqual([env.nRoTargets(), env.moActive(), env.listeners.length], [2, 1, 1])
        r.d.clear()
        el.size(300, 40)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual([env.nRoTargets(), env.moActive(), env.listeners.length, r.resize.length], [0, 0, 0, 0])
    })

    it(`should not emit resizeWithWindow when a resize listener clears`, async function() {
        //clear後不再發出任何事件, 含同一次發出之第二個事件
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        r.d.on('resize', () => {
            r.d.clear()
        })
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual([r.resize.length, r.rww.length], [1, 0])
    })

    it(`should stop window events after clear`, function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { sync: true })
        env.fireRO(el)
        env.resizeWindow(1000, 800)
        r.d.clear()
        env.resizeWindow(900, 800)
        assert.strict.deepStrictEqual(r.rww.filter((m) => m.from === 'window').map((m) => m.snew.windowWidth), [1000])
    })

    //--- 元素之取得與替換 ---

    it(`should pick up an element that appears later`, async function() {
        //D3 起初取不到, 登記等待; DOM變動時取得並觀察, 量測後不再等待
        let env = mkEnv()
        let el = null
        let r = env.dd(() => el)
        assert.strict.deepStrictEqual(env.moActive(), 1)
        el = new Ele(250, 40)
        env.fireMO()
        assert.strict.deepStrictEqual(env.observed(el), ['border-box', 'content-box'])
        assert.strict.deepStrictEqual(env.moActive(), 1)
        env.fireRO(el)
        assert.strict.deepStrictEqual(env.moActive(), 0)
        el.size(350, 40)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [250, 350])
    })

    it(`should follow a replacement node`, async function() {
        //D4 舊節點移出(ResizeObserver回報其尺寸變0)時重新取得元素, 改觀察新節點
        let env = mkEnv()
        let a = new Ele(200, 40)
        let cur = a
        let r = env.dd(() => cur)
        env.fireRO(a)
        await sleep(10) //舊節點之尺寸於替換前發出; 延後發出前即被替換者不發出, 見下方延後發出之測試
        let b = new Ele(320, 40)
        cur = b
        a.isConnected = false
        a.size(0, 0)
        env.fireRO(a)
        assert.strict.deepStrictEqual([env.observed(a), env.observed(b)], [[], ['border-box', 'content-box']])
        b.size(400, 40)
        env.fireRO(b)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [200, 320, 400])
    })

    it(`should follow a node that is hidden, removed and replaced while hidden`, async function() {
        //D11 已隱藏之元素再被移除時尺寸0→0不會回報, 故尺寸為0時亦須等待DOM變動
        let env = mkEnv()
        let a = new Ele(200, 40)
        let cur = a
        let r = env.dd(() => cur)
        env.fireRO(a)
        assert.strict.deepStrictEqual(env.moActive(), 0)
        await sleep(10) //舊節點之尺寸於隱藏前發出; 延後發出前即隱藏者不發出, 見下方延後發出之測試
        a.size(0, 0)
        env.fireRO(a)
        assert.strict.deepStrictEqual(env.moActive(), 1)
        a.isConnected = false
        let b = new Ele(0, 0)
        cur = b
        env.fireMO()
        env.fireRO(b)
        b.size(280, 40)
        env.fireRO(b)
        b.size(330, 40)
        env.fireRO(b)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [200, 280, 330])
        assert.strict.deepStrictEqual(env.moActive(), 0)
    })

    it(`should keep waiting after picking a new element until it is measured visible`, function() {
        //等待中經DOM變動取得新節點, 須待新節點量測為可見才退出等待
        let env = mkEnv()
        let a = new Ele(0, 0)
        let cur = a
        env.dd(() => cur)
        env.fireRO(a)
        assert.strict.deepStrictEqual(env.moActive(), 1)
        cur = new Ele(300, 40)
        env.fireMO()
        assert.strict.deepStrictEqual(env.moActive(), 1)
        env.fireRO(cur)
        assert.strict.deepStrictEqual(env.moActive(), 0)
    })

    it(`should not follow a new element while the old one stays visible, unless watchIdentity`, async function() {
        //D12 預設於元素可見時不監看DOM變動; watchIdentity時持續監看
        for (let watchIdentity of [false, true]) {
            let env = mkEnv()
            let a = new Ele(200, 40)
            let cur = a
            let r = env.dd(() => cur, { watchIdentity })
            env.fireRO(a)
            let b = new Ele(320, 40)
            cur = b
            env.fireMO()
            env.fireRO(b)
            await sleep(10)
            assert.strict.deepStrictEqual([ws(r), env.moActive()], watchIdentity ? [[200, 320], 1] : [[200], 0], String(watchIdentity))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should treat a throwing f or a non element as not found`, async function() {
        //F5 f拋錯或回傳非元素時視為取不到, 不中斷偵測
        let env = mkEnv()
        let mode = 'throw'
        let el = new Ele(300, 40)
        let f = () => {
            if (mode === 'throw') {
                throw new Error('f boom')
            }
            if (mode === 'obj') {
                return { offsetWidth: 300, offsetHeight: 40 }
            }
            return el
        }
        let r = null
        assert.doesNotThrow(() => {
            r = env.dd(f)
        })
        mode = 'obj'
        env.fireMO()
        assert.strict.deepStrictEqual(env.nRoTargets(), 0)
        mode = 'ele'
        env.fireMO()
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [300])
    })

    //--- 行內元素、視窗與共用觀察器 ---

    it(`should measure an inline element periodically, and stop once it is no longer inline`, async function() {
        //F4 非替換之行內元素ResizeObserver不回報, 改以定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let tr = traceRec()
        let r = env.dd(() => el, { timeInterval: 5, onTrace: tr.on })
        await sample(tr, 'inline')
        el.size(137, 18)
        await sample(tr, 'inline')
        el.display = 'block'
        let from = tr.mark()
        env.fireRO(el)
        let n = r.resize.length
        el.size(200, 18)
        await sleep(30) //否定斷言之觀察窗: 已非行內, 不得再定期量測(負載只使窗內取樣變少而漏抓, 不會誤判)
        let nStopped = r.resize.length
        let polled = tr.events.slice(from).filter((e) => e.type === 'check' && e.source === 'inline').length
        let fromRO = tr.mark()
        env.fireRO(el)
        await settle(tr, fromRO)
        assert.strict.deepStrictEqual(ws(r), [27, 137, 200])
        assert.strict.deepStrictEqual([n, nStopped], [2, 2])
        //ResizeObserver回報時判定已非行內而停止定期量測, 其後無定期量測
        assert.strict.deepStrictEqual([inlines(tr), inlines(tr, from), polled], [[true, false], [false], 0])
    })

    it(`should measure an inline element that was taken before being connected`, async function() {
        //Vue指令之bind時序: 元素於插入DOM前即建立偵測器, 此時取不到display而判為非行內; 插入後須於DOM變動時重判為行內並改定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline', connected: false })
        let tr = traceRec()
        let r = env.dd(() => el, { timeInterval: 5, onTrace: tr.on })
        await sleep(30) //否定斷言之觀察窗: 插入前判為非行內, 不定期量測
        let before = tr.types()
        el.isConnected = true
        env.fireMO()
        let started = inlines(tr)
        await sample(tr, 'inline')
        el.size(137, 18)
        await sample(tr, 'inline')
        assert.strict.deepStrictEqual(ws(r), [27, 137])
        //插入前無任何量測; 插入之DOM變動時重判為行內而開始定期量測
        assert.strict.deepStrictEqual([before, started], [[], [true]])
    })

    it(`should resume measuring an inline element after it is removed and inserted again`, async function() {
        //如keep-alive: 行內元素移出DOM時定期量測量到尺寸0並判為非行內而停止, 插回後須於DOM變動時重判為行內並恢復定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let tr = traceRec()
        let r = env.dd(() => el, { timeInterval: 5, onTrace: tr.on })
        await sample(tr, 'inline')
        el.isConnected = false
        el.size(0, 0)
        await sample(tr, 'inline')
        let stopped = inlines(tr)
        el.isConnected = true
        el.size(27, 18)
        env.fireMO()
        await sample(tr, 'inline')
        el.size(137, 18)
        await sample(tr, 'inline')
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
        //移出時量到0並停止定期量測, 插回之DOM變動時恢復
        assert.strict.deepStrictEqual([stopped, inlines(tr)], [[true, false], [true, false, true]])
    })

    it(`should keep measuring an inline element while it hides itself, and pick up the size once shown`, async function() {
        //如v-show: 行內元素自身設display:none時取得之display為none而非inline, 若因此停止定期量測, 顯示後行內元素ResizeObserver又不回報即永不量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let tr = traceRec()
        let r = env.dd(() => el, { timeInterval: 5, onTrace: tr.on })
        await sample(tr, 'inline')
        el.display = 'none'
        el.size(0, 0)
        let from = tr.mark()
        await sample(tr, 'inline')
        let hidden = tr.events.slice(from).filter((e) => e.type === 'check').map((e) => [e.source, e.width])
        el.display = 'inline'
        el.size(27, 18)
        await sample(tr, 'inline')
        el.size(137, 18)
        await sample(tr, 'inline')
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
        //隱藏期間仍定期量測(量到0), 從未停止
        assert.strict.deepStrictEqual([hidden, inlines(tr)], [[['inline', 0]], [true]])
    })

    it(`should resume an inline element that was hidden, removed and inserted again while hidden`, async function() {
        //隱藏期間移出(不在頁面中而停止量測)再插回時仍為隱藏, 須依曾判定為行內而恢復定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let tr = traceRec()
        let r = env.dd(() => el, { timeInterval: 5, onTrace: tr.on })
        await sample(tr, 'inline')
        el.display = 'none'
        el.size(0, 0)
        await sample(tr, 'inline')
        el.isConnected = false
        await sample(tr, 'inline')
        let stopped = inlines(tr)
        el.isConnected = true
        env.fireMO()
        let resumedWhileHidden = inlines(tr)
        el.display = 'inline'
        el.size(27, 18)
        await sample(tr, 'inline')
        el.size(137, 18)
        await sample(tr, 'inline')
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
        //移出時停止, 插回時仍為隱藏即依曾判定為行內而恢復定期量測
        assert.strict.deepStrictEqual([stopped, resumedWhileHidden], [[true, false], [true, false, true]])
    })

    it(`should not poll a hidden element that was never measured as inline`, async function() {
        //區塊元素自身隱藏時不定期量測(如v-show隱藏之元件), 顯示時由ResizeObserver回報
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { timeInterval: 5 })
        env.fireRO(el)
        el.display = 'none'
        el.size(0, 0)
        env.fireRO(el)
        el.display = 'block'
        el.size(300, 40)
        await sleep(30)
        let n = r.resize.length
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual([n, ws(r)], [1, [300, 300]])
    })

    it(`should not carry the inline state over to a replacement element`, async function() {
        //是否曾為行內只屬於當時之元素; 換成隱藏之新節點時不得沿用而定期量測
        let env = mkEnv()
        let a = new Ele(27, 18, { display: 'inline' })
        let cur = a
        let tr = traceRec()
        let r = env.dd(() => cur, { timeInterval: 5, onTrace: tr.on })
        await sample(tr, 'inline')
        let b = new Ele(0, 0, { display: 'none' })
        cur = b
        await sample(tr, 'inline')
        let stopped = inlines(tr)
        b.display = 'block'
        b.size(300, 40)
        let from = tr.mark()
        await sleep(30) //否定斷言之觀察窗: 新節點不沿用行內而不定期量測
        let n = r.resize.length
        let polled = tr.events.slice(from).length
        let fromRO = tr.mark()
        env.fireRO(b)
        await settle(tr, fromRO)
        assert.strict.deepStrictEqual([n, ws(r)], [1, [27, 300]])
        //換成隱藏之新節點時停止定期量測, 其後無量測
        assert.strict.deepStrictEqual([stopped, polled], [[true, false], 0])
    })

    it(`should give no direction on window events after a change within the tolerance`, async function() {
        //元素+1px未超過容許誤差而不發出, 其後之視窗事件不得帶出該方向
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        await sleep(10)
        el.size(301, 40)
        env.fireRO(el)
        await sleep(10)
        env.resizeWindow(1000, 800)
        let w = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(w.map((m) => [m.snew.offsetWidth, m.smode]), [[301, { width: '', height: '' }]])
    })

    it(`should give no direction on window events after a change of the border box only`, async function() {
        //只改padding時只有border-box之觀察器回報, 發出後無第二次回報可把方向歸零; 其後之視窗事件不得帶出該方向
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        await sleep(10)
        el.size(340, 40, 300, 40)
        env.fireRO(el, 'border-box')
        await sleep(10)
        env.resizeWindow(1000, 800)
        let w = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(ws(r), [300, 340])
        assert.strict.deepStrictEqual(w.map((m) => m.smode), [{ width: '', height: '' }])
    })

    it(`should carry the comparison baseline as sold on window events`, async function() {
        //sold為比較基準(上次發出事件時之尺寸), 視窗事件與dom事件同義; 未判定為變化之最新量測只出現於snew(toleranceBounce為0使容許誤差內之301不發出)
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { toleranceBounce: 0 })
        env.fireRO(el)
        await sleep(10)
        el.size(301, 40)
        env.fireRO(el)
        await sleep(10)
        env.resizeWindow(1000, 800)
        let w = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(w.map((m) => [m.sold.offsetWidth, m.snew.offsetWidth]), [[300, 301]])
    })

    it(`should carry the current window size in resizeWithWindow from the window`, async function() {
        //F3、G4 元素尺寸未變時, 視窗事件之視窗尺寸仍須為當下之值
        let env = mkEnv()
        let el = new Ele(200, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        await sleep(10)
        env.resizeWindow(1000, 700)
        env.resizeWindow(600, 500)
        let ev = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(ev.map((m) => [m.snew.windowWidth, m.snew.windowHeight, m.snew.offsetWidth]), [[1000, 700, 200], [600, 500, 200]])
        assert.strict.deepStrictEqual(ev.map((m) => 'ele' in m), [false, false])
        assert.strict.deepStrictEqual(ws(r), [200])
    })

    it(`should share one MutationObserver among waiting detectors`, function() {
        //D2、D8 共用MutationObserver僅於有偵測器等待時啟用, 最後一個退出等待時解除
        let env = mkEnv()
        let r1 = env.dd(() => null)
        let r2 = env.dd(() => null)
        assert.strict.deepStrictEqual([env.mos.length, env.moActive()], [1, 1])
        assert.strict.deepStrictEqual(env.mos[0].target, env.document.documentElement)
        assert.strict.deepStrictEqual(env.mos[0].opt, { childList: true, subtree: true })
        r1.d.clear()
        assert.strict.deepStrictEqual(env.moActive(), 1)
        r2.d.clear()
        assert.strict.deepStrictEqual(env.moActive(), 0)
    })

    it(`should update the waiting state even when a sync listener throws`, function() {
        //G9 sync時監聽器之拋錯會外拋至ResizeObserver回呼, 等待狀態仍須更新
        let env = mkEnv()
        let el = new Ele(0, 0)
        let r = env.dd(() => el, { sync: true })
        r.d.on('resize', () => {
            throw new Error('consumer boom')
        })
        env.fireRO(el)
        assert.strict.deepStrictEqual(env.moActive(), 1)
        el.size(300, 40)
        assert.throws(() => env.fireRO(el), /consumer boom/)
        assert.strict.deepStrictEqual([ws(r), env.moActive()], [[300], 0])
    })

    //--- 輪詢模式 ---

    it(`should use polling when mode is polling or ResizeObserver is missing`, async function() {
        for (let [o, opt] of [[{}, { mode: 'polling', timeInterval: 5 }], [{ noRO: true }, { timeInterval: 5 }]]) {
            let env = mkEnv(o)
            let el = new Ele(300, 40)
            let tr = traceRec()
            let r = env.dd(() => el, { ...opt, onTrace: tr.on })
            await sample(tr, 'poll')
            assert.strict.deepStrictEqual([ws(r), env.ros.length, env.mos.length], [[300], 0, 0], JSON.stringify(o))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should apply the same rules in polling mode`, async function() {
        //輪詢與ResizeObserver共用比較、發出、視窗事件與清除: 容許誤差內之同向變化照常發出、尺寸0不發出、恢復顯示再發出、視窗尺寸取當下值
        let env = mkEnv()
        let el = new Ele(300, 40)
        let tr = traceRec()
        let r = env.dd(() => el, { mode: 'polling', timeInterval: 5, onTrace: tr.on })
        for (let w of [300, 301, 302, 0, 302]) {
            el.size(w, w === 0 ? 0 : 40)
            await sample(tr, 'poll')
        }
        env.resizeWindow(900, 600)
        r.d.clear()
        let nCleared = tr.mark()
        el.size(400, 40)
        await sleep(25) //否定斷言之觀察窗: clear後不再取樣與發出
        assert.strict.deepStrictEqual(ws(r), [300, 301, 302, 302])
        assert.strict.deepStrictEqual(r.rww.filter((m) => m.from === 'window').map((m) => m.snew.windowWidth), [900])
        assert.strict.deepStrictEqual(env.listeners.length, 0)
        //尺寸0之量測判定為變化但不發出(zero); clear後無事件
        assert.strict.deepStrictEqual([tr.events.filter((e) => e.type === 'skip').map((e) => e.reason), tr.mark() - nCleared], [['zero'], 0])
    })

    it(`should treat a throwing f as not found in polling mode`, async function() {
        //F5 與ResizeObserver模式一致, 不因f拋錯而於每次輪詢拋出
        let env = mkEnv()
        let ok = false
        let el = new Ele(300, 40)
        let tr = traceRec()
        let r = env.dd(() => {
            if (!ok) {
                throw new Error('f boom')
            }
            return el
        }, { mode: 'polling', timeInterval: 5, onTrace: tr.on })
        let miss = await tr.wait((e) => e.type === 'check')
        ok = true
        await sample(tr, 'poll')
        assert.strict.deepStrictEqual(ws(r), [300])
        //f拋錯之取樣視為取不到元素
        assert.strict.deepStrictEqual([miss.source, miss.found], ['poll', false])
    })

    it(`should return null for an invalid f`, function() {
        let log = console.log
        console.log = () => {}
        try {
            for (let o of [{}, { mode: 'polling' }]) {
                let env = mkEnv()
                let d = domDetect('x', o)
                assert.strict.deepStrictEqual([d, env.listeners.length, env.ros.length], [null, 0, 0], JSON.stringify(o))
            }
        }
        finally {
            console.log = log
        }
    })

    //--- 延後發出之再確認與略過後之重新比較 ---

    it(`should not emit when the element is hidden between the measurement and the deferred emit`, async function() {
        //缺陷一: 量測後、延後發出前元素已隱藏, 若照發則監聽器讀到尺寸0
        let env = mkEnv()
        let el = new Ele(300, 36)
        let live = []
        let r = env.dd(() => el)
        r.d.on('resize', () => live.push(el.offsetHeight))
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        hide(el)
        await sleep(5)
        assert.strict.deepStrictEqual([r.resize.map((m) => m.snew.offsetHeight), live], [[36], [36]])
    })

    it(`should not emit when an ancestor hides the element between the measurement and the deferred emit, with or without checkVisibility`, async function() {
        //確認元素是否被繪製: 有checkVisibility時以其判定, 否則逐層檢查display
        for (let cv of [false, true]) {
            let env = mkEnv()
            let parent = new Ele(400, 100, { cv })
            let el = new Ele(300, 36, { cv, parent })
            let r = env.dd(() => el)
            env.frame()
            await sleep(5)
            el.size(300, 40)
            env.frame()
            parent.display = 'none'
            el.size(0, 0)
            await sleep(5)
            assert.strict.deepStrictEqual(r.resize.map((m) => m.snew.offsetHeight), [36], `cv=${cv}`)
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should use checkVisibility when available, which also covers content-visibility`, async function() {
        //checkVisibility另涵蓋content-visibility:hidden等display以外之不被繪製, 有則以其判定; 以其回傳false而display非none模擬
        let env = mkEnv()
        let el = new Ele(300, 36, { cv: true })
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        el.checkVisibility = () => false
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => m.snew.offsetHeight), [36])
    })

    it(`should still emit when the element is rendered but collapsed to zero between the measurement and the deferred emit`, async function() {
        //刻意(同1.9.5): 發出前之確認只計算樣式不讀外框(讀外框則多偵測器時每次確認皆強制重排), 仍被繪製而尺寸縮為0者照發量測時之快照
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        el.size(300, 0)
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => m.snew.offsetHeight), [36, 40])
    })

    it(`should emit the change once shown again at the same size before the next frame`, async function() {
        //略過後元素於下一幀前恢復顯示且尺寸不變時, 瀏覽器不再回報(上次回報之尺寸未變), 須重新觀察使下一幀回報, 否則此次變化永不發出
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        hide(el)
        await sleep(5)
        show(el, 300, 40)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetHeight, m.sold.offsetHeight, m.smode.height]), [[36, 0, 'larger'], [40, 0, 'larger']])
    })

    it(`should wait for DOM changes right after skipping an element hidden by display`, async function() {
        //略過時最新量測歸0而依[尺寸為0時等待DOM變動]登記等待: 元素仍在頁面中(display:none)者亦然, 不依賴重新觀察之首次回報(舊版Safari對0尺寸之新觀察不回報), 否則隱藏期間被替換之節點無從跟隨
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        let waitingVisible = env.moActive()
        el.size(300, 40)
        env.frame()
        hide(el)
        await sleep(5)
        assert.strict.deepStrictEqual([ws(r), waitingVisible, env.moActive()], [[300], 0, 1])
    })

    it(`should emit a different size once shown again after a skipped emit`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        hide(el)
        await sleep(5)
        show(el, 300, 50)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => m.snew.offsetHeight), [36, 50])
    })

    it(`should not emit when the element is removed before the deferred emit, and wait for it to come back`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        el.isConnected = false
        el.size(0, 0)
        await sleep(5)
        let n = r.resize.length
        let waitingAfterSkip = env.moActive() //略過時最新量測歸0, 即登記等待DOM變動, 不依賴重新觀察之首次回報(舊版Safari對0尺寸之新觀察不回報)
        env.frame()
        let waitingWhileRemoved = env.moActive()
        el.isConnected = true
        el.size(300, 40)
        env.fireMO()
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual([n, waitingAfterSkip, waitingWhileRemoved, r.resize.map((m) => m.snew.offsetHeight), env.moActive()], [1, 1, 1, [36, 40], 0])
    })

    it(`should re-observe the current element when the skipped emit belonged to a replaced node`, async function() {
        //舊節點之延後發出因已移出而略過, 新節點已於同一幀比較且同尺寸(未判變化)時, 須重新觀察新節點, 否則使用端永遠停在舊尺寸
        let env = mkEnv()
        let a = new Ele(300, 36)
        let cur = a
        let r = env.dd(() => cur)
        env.frame()
        await sleep(5)
        a.size(300, 40)
        env.frame()
        let b = new Ele(300, 40)
        cur = b
        a.isConnected = false
        a.size(0, 0)
        env.frame() //舊節點回報尺寸0時改觀察新節點, 新節點與基準同尺寸而不判變化
        env.frame() //新節點於兩個觀察器皆已回報, 之後尺寸未變即不再回報
        await sleep(5)
        let n = r.resize.length
        env.frame()
        await sleep(5)
        let last = r.resize[r.resize.length - 1]
        assert.strict.deepStrictEqual([n, r.resize.map((m) => m.snew.offsetHeight), last.ele === b], [1, [36, 40], true])
    })

    it(`should keep a newer baseline when an older deferred emit is skipped`, async function() {
        //較舊之延後發出略過時, 若其後已判定較新之變化, 不得把基準歸0, 否則之後容許誤差內之變化被誤判而多發(toleranceBounce為0, 以容許誤差內之301是否發出偵測基準是否被歸0)
        let env = mkEnv()
        let a = new Ele(300, 36)
        let cur = a
        let r = env.dd(() => cur, { toleranceBounce: 0 })
        env.frame()
        await sleep(5)
        a.size(300, 40)
        env.frame()
        let b = new Ele(300, 60)
        cur = b
        a.isConnected = false
        a.size(0, 0)
        env.frame()
        await sleep(5)
        b.size(301, 60)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight]), [[300, 36], [300, 60]])
    })

    it(`should not emit window events after a skipped emit until the element is measured again`, async function() {
        //略過時元素已隱藏, 最新量測亦歸0, 其後之視窗事件不得帶出隱藏前之尺寸
        let env = mkEnv()
        let el = new Ele(300, 36)
        let r = env.dd(() => el)
        env.frame()
        await sleep(5)
        el.size(300, 40)
        env.frame()
        hide(el)
        await sleep(5)
        env.resizeWindow(1000, 800)
        show(el, 300, 40)
        env.frame()
        await sleep(5)
        env.resizeWindow(900, 800)
        let w = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(w.map((m) => [m.snew.windowWidth, m.snew.offsetHeight]), [[900, 40]])
    })

    it(`should measure again on the next sample after a skipped emit in polling mode and for an inline element`, async function() {
        //延後發出因元素不被繪製而略過後比較基準歸0, 下一次取樣即重新比較而發出; 所驗為計時器之先後(略過先於下一次取樣), 以假時鐘控制(R-TRACE-01 P5)
        //  以真實計時器時, 隱藏期間若先有一次取樣量到0, 比較基準亦因該次而歸0, 掩蓋略過時未歸0之缺陷(變異M09於真實計時器下時抓時漏)
        for (let [opt, display, source] of [[{ mode: 'polling', timeInterval: 5 }, 'block', 'poll'], [{ timeInterval: 5 }, 'inline', 'inline']]) {
            let clock = useFakeClock()
            try {
                let env = mkEnv()
                let el = new Ele(27, 18, { display })
                let tr = traceRec()
                let r = env.dd(() => el, { ...opt, onTrace: tr.on })
                await clock.advance(7) //第5ms取樣量到27, 第6ms發出
                el.size(137, 18)
                let from = tr.mark()
                r.d.refresh() //判定為變化, 延後至第8ms發出
                el.display = 'none'
                el.size(0, 0)
                await clock.advance(1) //第8ms: 延後發出時元素已不被繪製而略過; 下一次取樣在第10ms
                let between = tr.events.slice(from).map((e) => [e.type, e.type === 'check' ? e.source : e.reason])
                el.display = display
                el.size(137, 18)
                await clock.advance(4) //第10ms取樣量到137而判定為變化, 第11ms發出
                assert.strict.deepStrictEqual([ws(r), r.resize[r.resize.length - 1].sold.offsetWidth], [[27, 137], 0], display)
                //refresh之判定與其略過(hidden)之間無取樣; 恢復顯示後之取樣判定為變化
                assert.strict.deepStrictEqual(between, [['check', 'refresh'], ['skip', 'hidden']], display)
                assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'check' && e.source === source).map((e) => [e.width, e.changed]), [[27, true], [137, true]], display)
                clearAll(env)
            }
            finally {
                clock.restore()
            }
        }
    })

    //--- 多偵測器之延後發出 ---

    it(`should run each deferred emit in its own task, so a later listener sees the microtask effects of an earlier one`, async function() {
        //延後發出各自一個task(同1.9.5與瀏覽器對各回呼之慣例): 前一個監聽器之microtask(如Vue之DOM更新)於下一個監聽器前已套用, 且監聽器不集中於同一個task而形成長任務
        let env = mkEnv()
        let e1 = new Ele(300, 40)
        let e2 = new Ele(200, 40)
        let order = []
        let r1 = env.dd(() => e1)
        let r2 = env.dd(() => e2)
        r1.d.on('resize', () => {
            order.push('l1')
            Promise.resolve().then(() => order.push('m1'))
        })
        r2.d.on('resize', () => order.push('l2'))
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(order, ['l1', 'm1', 'l2'])
    })

    it(`should see an element hidden synchronously by an earlier listener in the same batch`, async function() {
        //各自於發出前確認: 同一批前一個監聽器同步隱藏後一個元素時, 後者不發出
        let env = mkEnv()
        let e1 = new Ele(300, 40)
        let e2 = new Ele(200, 40)
        let r1 = env.dd(() => e1)
        let r2 = env.dd(() => e2)
        env.frame()
        await sleep(5)
        let armed = true
        r1.d.on('resize', () => {
            if (armed) {
                armed = false
                hide(e2)
            }
        })
        e1.size(310, 40)
        e2.size(210, 40)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual([ws(r1), ws(r2)], [[300, 310], [200]])
    })

    it(`should skip a detector cleared by an earlier listener in the same batch`, async function() {
        let env = mkEnv()
        let e1 = new Ele(300, 40)
        let e2 = new Ele(200, 40)
        let r1 = env.dd(() => e1)
        let r2 = env.dd(() => e2)
        r1.d.on('resize', () => r2.d.clear())
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual([ws(r1), ws(r2), r2.rww.length], [[300], [], 0])
    })

    it(`should keep emitting to other detectors when a listener throws, and still surface the error`, async function() {
        //監聽器拋錯不得中斷同一批其他偵測器之發出, 錯誤自該次發出之task拋出而仍可察覺
        let env = mkEnv()
        let caught = []
        let st = globalThis.setTimeout
        globalThis.setTimeout = (fn, ms) => st(() => {
            try {
                fn()
            }
            catch (err) {
                caught.push(err.message)
            }
        }, ms)
        try {
            let e1 = new Ele(300, 40)
            let e2 = new Ele(200, 40)
            let r1 = env.dd(() => e1)
            let r2 = env.dd(() => e2)
            r1.d.on('resize', () => {
                throw new Error('consumer boom')
            })
            env.frame()
            await sleep(10)
            await sleep(10) //事件迴圈忙碌時計時器可能與上一段等待同批到期, 再等一輪
            assert.strict.deepStrictEqual([ws(r1), r1.rww.length, ws(r2), r2.rww.length, caught], [[300], 0, [200], 1, ['consumer boom']])
        }
        finally {
            globalThis.setTimeout = st
        }
    })

    //--- 視窗通道之零尺寸規則 ---

    it(`should not emit window events while the element is hidden, zero in one dimension, or not measured yet`, async function() {
        //缺陷二: 視窗事件與dom事件同規則, 最新量測任一維為0不發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.resizeWindow(1100, 800) //尚未量得
        env.frame()
        await sleep(5)
        env.resizeWindow(1000, 800) //可見
        el.size(0, 0)
        env.frame()
        await sleep(5)
        env.resizeWindow(900, 800) //隱藏
        el.size(300, 0)
        env.frame()
        await sleep(5)
        env.resizeWindow(800, 800) //寬大於0高為0
        el.size(300, 40)
        env.frame()
        await sleep(5)
        env.resizeWindow(700, 800) //恢復顯示
        let w = r.rww.filter((m) => m.from === 'window')
        assert.strict.deepStrictEqual(w.map((m) => m.snew.windowWidth), [1000, 700])
        assert.strict.deepStrictEqual(ws(r), [300, 300])
    })

    it(`should not emit window events once the element is no longer rendered, before it is measured again`, async function() {
        //視窗事件於同一幀之ResizeObserver回報前派發, 視窗改變本身使元素隱藏時(如媒體查詢)最新量測仍為隱藏前之尺寸, 須另確認元素當下被繪製
        for (let cv of [false, true]) {
            let env = mkEnv()
            let el = new Ele(300, 40, { cv })
            let r = env.dd(() => el)
            env.frame()
            await sleep(5)
            hide(el)
            env.resizeWindow(900, 800)
            show(el, 300, 40)
            env.resizeWindow(1000, 800)
            let w = r.rww.filter((m) => m.from === 'window')
            assert.strict.deepStrictEqual(w.map((m) => m.snew.windowWidth), [1000], `cv=${cv}`)
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should not emit window events once f finds no element, even if the old element stays rendered`, async function() {
        //f改回傳null而舊元素仍在頁面中且可見: 偵測對象已不存在, 最新量測歸0, 視窗事件不得帶出舊元素之尺寸
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let polling = opt.mode === 'polling'
            let env = mkEnv()
            let el = new Ele(300, 40)
            let cur = el
            let tr = traceRec()
            let r = env.dd(() => cur, { ...opt, onTrace: tr.on })
            let from = tr.mark()
            env.frame()
            if (polling) {
                await sample(tr, 'poll')
            }
            else {
                await settle(tr, from)
            }
            cur = null
            from = tr.mark()
            if (!polling) {
                r.d.refresh() //ResizeObserver模式由refresh重新取得元素(舊元素未變, 瀏覽器不回報); 輪詢模式由定期取樣重新取得
            }
            let miss = await tr.wait((e) => e.type === 'check', from)
            env.resizeWindow(900, 800)
            assert.strict.deepStrictEqual([ws(r), r.rww.filter((m) => m.from === 'window').length], [[300], 0], JSON.stringify(opt))
            assert.strict.deepStrictEqual(miss.found, false, JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should not emit window events while f finds no element, in both modes`, async function() {
        //取不到元素時最新量測歸0, 視窗事件不發出; 比較基準不動, 同尺寸之元素再出現時不發出dom事件(同1.9.5)
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let polling = opt.mode === 'polling'
            let env = mkEnv()
            let el = new Ele(300, 40)
            let cur = el
            let tr = traceRec()
            let r = env.dd(() => cur, { ...opt, onTrace: tr.on })
            //step, 同步改動後等其量測之結果: 輪詢模式等下一次取樣, ResizeObserver模式之回報於frame內同步量測
            let step = async (act) => {
                let from = tr.mark()
                act()
                if (polling) {
                    await sample(tr, 'poll')
                }
                else {
                    await settle(tr, from)
                }
                return tr.events.slice(from).filter((e) => e.type === 'check').map((e) => e.found)
            }
            await step(() => env.frame())
            env.resizeWindow(1000, 800)
            let fMiss = await step(() => {
                cur = null
                el.isConnected = false
                el.size(0, 0)
                env.frame()
            })
            env.resizeWindow(900, 800)
            let b = new Ele(300, 40)
            let fBack = await step(() => {
                cur = b
                env.fireMO()
                env.frame()
            })
            env.resizeWindow(800, 800)
            let w = r.rww.filter((m) => m.from === 'window')
            assert.strict.deepStrictEqual([w.map((m) => m.snew.windowWidth), ws(r)], [[1000, 800], [300]], JSON.stringify(opt))
            //取不到之量測與再取得之量測皆已發生
            assert.strict.deepStrictEqual([fMiss.includes(false), fBack.length > 0 && fBack.every((v) => v)], [true, true], JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    //--- getSize、getBase、throttle、refresh ---

    it(`should compare the size given by getSize and carry it as width and height`, async function() {
        //box-sizing為border-box且只改padding時外框不變、內容區變小, 給getSize(內容區)者須發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { getSize: (e) => ({ width: e.clientWidth, height: e.clientHeight }) })
        env.frame()
        await sleep(5)
        el.size(300, 40, 260, 40)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.width, m.smode.width]), [[300, 300, 'larger'], [300, 260, 'smaller']])
    })

    it(`should not emit while getSize throws or gives no number, and emit once it gives a size`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let mode = 'throw'
        let r = env.dd(() => el, {
            getSize: () => {
                if (mode === 'throw') {
                    throw new Error('size boom')
                }
                if (mode === 'nan') {
                    return { width: 'abc', height: 40 }
                }
                return { width: 280, height: 40 }
            },
        })
        env.frame()
        await sleep(5)
        mode = 'nan'
        el.size(310, 40)
        env.frame()
        await sleep(5)
        mode = 'ok'
        el.size(320, 40)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.width]), [[320, 280]])
    })

    it(`should compare against getBase, skip axes that are not numbers, and not emit when already in line at mount`, async function() {
        //比較基準為使用端目前套用之尺寸, 掛載時一致不發出; 某軸非數字(如固定寬度)該軸不比
        for (let opt of [{}, { sync: true }, { mode: 'polling', timeInterval: 5 }]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let chart = { w: 300, h: 40, fixW: false }
            let tr = traceRec()
            let r = env.dd(() => el, { ...opt, getBase: () => ({ width: chart.fixW ? 'fixed' : chart.w, height: chart.h }), onTrace: tr.on })
            r.d.on('resize', (m) => {
                if (!chart.fixW) {
                    chart.w = m.snew.width
                }
                chart.h = m.snew.height
            })
            //step, 等此步之量測及其結果: 輪詢模式等下一次取樣, ResizeObserver模式之回報於frame內同步量測(R-TRACE-01; 原以固定等待30ms, 輪詢模式於負載下少一筆)
            let step = async () => {
                let from = tr.mark()
                env.frame()
                if (opt.mode === 'polling') {
                    await sample(tr, 'poll')
                }
                else {
                    await settle(tr, from)
                }
            }
            await step()
            el.size(350, 40)
            await step()
            chart.fixW = true
            el.size(400, 40)
            await step()
            el.size(400, 60)
            await step()
            assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.width, m.snew.height]), [[350, 40], [400, 60]], JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should not emit a deferred change that the consumer has already applied`, async function() {
        //延後發出前再比一次getBase, 使用端已自行同步時不發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let chart = { w: 300, h: 40 }
        let r = env.dd(() => el, { getBase: () => ({ width: chart.w, height: chart.h }) })
        env.frame()
        await sleep(5)
        el.size(350, 40)
        env.frame()
        chart.w = 350
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.length, 0)
    })

    it(`should not compare an axis when getBase throws`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, {
            getBase: () => {
                throw new Error('base boom')
            },
        })
        env.frame()
        await sleep(5)
        el.size(350, 60)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual(r.resize.length, 0)
    })

    it(`should give directions against the consumer size at the deferred emit`, async function() {
        //有給getBase者延後發出前再比一次, 方向依發出當下與使用端尺寸之比較重給: 空檔內使用端已同步之軸不給方向; 同批多次變化時相對前一次發出後之使用端尺寸
        let env = mkEnv()
        let el = new Ele(300, 40)
        let base = { w: 300, h: 40 }
        let r = env.dd(() => el, { getBase: () => ({ width: base.w, height: base.h }) })
        r.d.on('resize', (m) => {
            base.w = m.snew.offsetWidth
            base.h = m.snew.offsetHeight
        })
        env.fireRO(el)
        el.size(400, 60)
        env.fireRO(el)
        base.w = 400
        await sleep(10)
        el.size(500, 60)
        env.fireRO(el)
        el.size(450, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.smode.width, m.smode.height]), [[400, '', 'larger'], [500, 'larger', ''], [450, 'smaller', '']])
    })

    it(`should skip an older deferred change that the consumer already applied while a newer one is pending`, async function() {
        //發出前之再比較以使用端當下之尺寸為準(不以尚未處理之較新量測), 使用端已同步之較舊項不發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let base = { w: 300, h: 40 }
        let r = env.dd(() => el, { getBase: () => ({ width: base.w, height: base.h }) })
        r.d.on('resize', (m) => {
            base.w = m.snew.offsetWidth
            base.h = m.snew.offsetHeight
        })
        env.frame()
        await sleep(5)
        el.size(350, 40)
        env.frame()
        el.size(380, 40)
        env.frame()
        base.w = 350
        await sleep(5)
        assert.strict.deepStrictEqual([ws(r), base.w], [[380], 380])
    })

    it(`should compare against a pending deferred emit with getBase, so the consumer does not end at a stale size`, async function() {
        //有尚未發出之變化時使用端尺寸將被其更新; 其後量得與使用端當下相近之尺寸若仍與使用端當下比較, 會判為未變化, 前一個發出套用後使用端即停在過期尺寸
        let env = mkEnv()
        let el = new Ele(257, 43)
        let base = { w: 257, h: 43 }
        let r = env.dd(() => el, { tolerancePixel: 2, getBase: () => ({ width: base.w, height: base.h }) })
        r.d.on('resize', (m) => {
            base.w = m.snew.offsetWidth
            base.h = m.snew.offsetHeight
        })
        env.frame()
        await sleep(5)
        el.size(245, 40)
        env.frame()
        el.size(256, 41)
        env.frame()
        await sleep(5)
        assert.strict.deepStrictEqual([ws(r), [base.w, base.h]], [[245, 256], [256, 41]])
    })

    it(`should keep a within-tolerance axis at the deferred re-compare with getBase only when toleranceBounce is not 0`, async function() {
        //延後發出前使用端已自行套用與量測差1px之尺寸(容許誤差2內): 給0(舊版行為)時容許誤差內一律不發出; 預設時判定時已為變化且與使用端當下仍不同之軸照發, 使用端得以同步至實際尺寸
        let run = async (opt) => {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let base = { w: 300, h: 40 }
            let r = env.dd(() => el, { tolerancePixel: 2, ...opt, getBase: () => ({ width: base.w, height: base.h }) })
            r.d.on('resize', (m) => {
                base.w = m.snew.offsetWidth
                base.h = m.snew.offsetHeight
            })
            env.fireRO(el)
            await sleep(10)
            el.size(305, 40)
            env.fireRO(el)
            base.w = 304
            await sleep(10)
            let out = r.resize.map((m) => [m.snew.offsetWidth, m.smode.width])
            for (let d of env.dds) {
                d.clear()
            }
            return [out, base.w]
        }
        assert.strict.deepStrictEqual(await run({ toleranceBounce: 0 }), [[], 304])
        assert.strict.deepStrictEqual(await run({}), [[[305, 'larger']], 305])
    })

    it(`should throttle with the first change at once and the last change at the end of the window`, async function() {
        //節流窗口之長短本身即規格, 以假時鐘推進(R-TRACE-01 P5); 原以真實等待累計對60ms窗口, 負載下窗口內之讀值與尾端皆不穩
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let clock = useFakeClock()
            try {
                let env = mkEnv()
                let el = new Ele(300, 40)
                let tr = traceRec()
                let r = env.dd(() => el, { ...opt, throttle: 60, onTrace: tr.on })
                env.frame()
                await clock.advance(10)
                for (let w of [310, 320, 330]) {
                    el.size(w, 40)
                    env.frame()
                    await clock.advance(10)
                }
                let during = ws(r)
                await clock.advance(100)
                assert.strict.deepStrictEqual([during, ws(r)], [[300], [300, 330]], JSON.stringify(opt))
                //首次立即(延後1ms)發出, 窗口內之變化併入尾端, 以最後一次之量測發出
                assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').map((e) => [e.width, e.deferred]), [[300, true], [330, true]], JSON.stringify(opt))
                clearAll(env)
            }
            finally {
                clock.restore()
            }
        }
    })

    it(`should cancel the pending throttled emit on clear`, async function() {
        //假時鐘(R-TRACE-01 P5): clear須在60ms窗口結束前
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { throttle: 60 })
            env.frame()
            await clock.advance(10)
            el.size(310, 40)
            env.frame()
            await clock.advance(10)
            r.d.clear()
            await clock.advance(110)
            assert.strict.deepStrictEqual(ws(r), [300])
        }
        finally {
            clock.restore()
        }
    })

    it(`should not schedule the pending throttled emit after clear`, async function() {
        //clear時取消節流待發出者: 已排定之事件本就因clear而不發出, 但不取消時節流計時器殘留至窗口結束後仍排定延後發出
        //假時鐘(R-TRACE-01 P5): clear須在60ms窗口結束前; 攔截者包裝假時鐘之setTimeout
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { throttle: 60 })
            env.frame()
            await clock.advance(10)
            el.size(310, 40)
            env.frame()
            await clock.advance(10)
            let delays = []
            let st = globalThis.setTimeout
            globalThis.setTimeout = (fn, ms) => {
                delays.push(ms)
                return st(fn, ms)
            }
            try {
                r.d.clear()
                await clock.advance(110)
            }
            finally {
                globalThis.setTimeout = st
            }
            assert.strict.deepStrictEqual([ws(r), delays.filter((ms) => ms === 1)], [[300], []])
        }
        finally {
            clock.restore()
        }
    })

    it(`should clear the timers of scheduled deferred emits on clear`, async function() {
        //clear時取消已排定之延後發出計時器, 不殘留至觸發
        let env = mkEnv()
        let ids = []
        let cleared = []
        let st = globalThis.setTimeout
        let ct = globalThis.clearTimeout
        globalThis.setTimeout = (fn, ms) => {
            let id = st(fn, ms)
            if (ms === 1) {
                ids.push(id)
            }
            return id
        }
        globalThis.clearTimeout = (id) => {
            cleared.push(id)
            return ct(id)
        }
        try {
            let el = new Ele(300, 40)
            let r = env.dd(() => el)
            env.frame()
            r.d.clear()
            await sleep(10)
            assert.strict.deepStrictEqual([ids.length > 0, ids.every((id) => cleared.includes(id)), r.resize.length], [true, true, 0])
        }
        finally {
            globalThis.setTimeout = st
            globalThis.clearTimeout = ct
        }
    })

    it(`should defer the first throttled emit unless sync`, async function() {
        //節流之首次發出與未節流相同: 非sync時延後發出(發出前確認元素仍被繪製), sync時於回呼內同步發出
        for (let sync of [false, true]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { throttle: 40, sync })
            env.frame()
            let nNow = r.resize.length
            await sleep(10)
            assert.strict.deepStrictEqual([nNow, ws(r)], [sync ? 1 : 0, [300]], `sync=${sync}`)
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should emit the first change synchronously and the rest deferred with throttle and sync`, async function() {
        //假時鐘(R-TRACE-01 P5): 尾端於60ms窗口結束時觸發, 再延後1ms發出
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let live = []
            let tr = traceRec()
            let r = env.dd(() => el, { throttle: 60, sync: true, onTrace: tr.on })
            r.d.on('resize', () => live.push(el.offsetWidth))
            env.frame()
            let nSync = r.resize.length
            el.size(310, 40)
            env.frame()
            let nWindow = r.resize.length
            await clock.advance(110)
            assert.strict.deepStrictEqual([nSync, nWindow, ws(r), live], [1, 1, [300, 310], [300, 310]])
            //首次於回呼內同步發出, 尾端延後發出
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'emit').map((e) => [e.width, e.deferred]), [[300, false], [310, true]])
            clearAll(env)
        }
        finally {
            clock.restore()
        }
    })

    it(`should not emit an older deferred measurement after a newer one was emitted synchronously`, async function() {
        //sync時refresh為延後發出, 其後同一幀內之回報以sync同步發出較新之量測, 較舊之refresh不得再發出, 否則以事件套用尺寸之使用端最後停在過期尺寸
        let env = mkEnv()
        let el = new Ele(300, 40)
        let base = { w: 300, h: 40 }
        let r = env.dd(() => el, { sync: true, getBase: () => ({ width: base.w, height: base.h }) })
        r.d.on('resize', (m) => {
            base.w = m.snew.offsetWidth
            base.h = m.snew.offsetHeight
        })
        env.fireRO(el)
        el.size(350, 40)
        r.d.refresh()
        el.size(400, 40)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual([ws(r), base.w], [[400], 400])
    })

    it(`should not emit an older throttled trailing measurement after a newer one was emitted synchronously`, async function() {
        //sync且節流時後續發出為延後發出; 其1ms空檔若被延誤至節流窗口結束後, 期間之回報為首次而同步發出較新之量測, 較舊之後續發出不得再發出
        //假時鐘(R-TRACE-01 P5): 節流以Date.now判定窗口, 原以真實等待與忙等, 負載下尾端之重排使攔下之筆數不定
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let held = []
            let st = globalThis.setTimeout
            let tr = traceRec()
            let r = env.dd(() => el, { sync: true, throttle: 20, onTrace: tr.on })
            env.fireRO(el) //首次, 同步發出300
            el.size(310, 40)
            env.fireRO(el) //窗口內, 待後續發出
            globalThis.setTimeout = (fn, ms) => {
                if (ms === 1) {
                    held.push(fn) //攔下後續發出之延後, 模擬其被延誤
                    return 0
                }
                return st(fn, ms)
            }
            try {
                await clock.advance(40)
            }
            finally {
                globalThis.setTimeout = st
            }
            await clock.advance(25) //超過節流時間, 使下一次回報為首次; 尾端已觸發, 無待觸發之計時器
            el.size(320, 40)
            env.fireRO(el) //首次, 同步發出320
            let from = tr.mark()
            for (let fn of held) {
                fn() //被延誤之後續發出(310)此時才執行
            }
            assert.strict.deepStrictEqual([held.length, ws(r)], [1, [300, 320]])
            //被延誤之310因已處理較新之量測而略過
            assert.strict.deepStrictEqual(tr.events.slice(from).map((e) => [e.type, e.reason]), [['skip', 'stale']])
            clearAll(env)
        }
        finally {
            clock.restore()
        }
    })

    it(`should not emit a throttled trailing change that the consumer has already applied`, async function() {
        //有給getBase者節流之後續發出亦於發出前再比一次, 窗口內使用端已自行同步時不發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let base = { w: 300, h: 40 }
        let r = env.dd(() => el, { throttle: 40, getBase: () => ({ width: base.w, height: base.h }) })
        r.d.on('resize', (m) => {
            base.w = m.snew.offsetWidth
            base.h = m.snew.offsetHeight
        })
        env.frame()
        await sleep(5)
        el.size(350, 40)
        env.frame()
        await sleep(5)
        el.size(380, 40)
        env.frame()
        base.w = 380
        await sleep(80)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        assert.strict.deepStrictEqual(ws(r), [350])
    })

    it(`should merge a refresh within the throttle window into the trailing emit`, async function() {
        //節流窗口內之refresh併入節流, 於窗口結束時以最後一次之量測發出
        //假時鐘(R-TRACE-01 P5): 窗口內讀值須在60ms窗口結束前
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let chart = { w: 300, h: 40, fixW: false }
            let tr = traceRec()
            let r = env.dd(() => el, { throttle: 60, getBase: () => ({ width: chart.fixW ? null : chart.w, height: chart.h }), onTrace: tr.on })
            r.d.on('resize', (m) => {
                chart.w = m.snew.offsetWidth
                chart.h = m.snew.offsetHeight
            })
            el.size(310, 40)
            env.frame()
            await clock.advance(10)
            chart.fixW = true
            el.size(360, 40)
            env.frame()
            chart.fixW = false
            r.d.refresh()
            await clock.advance(10)
            let nInWindow = r.resize.length
            await clock.advance(90)
            assert.strict.deepStrictEqual([nInWindow, ws(r)], [1, [310, 360]])
            //refresh之判定為變化, 併入尾端而以其量測發出
            let rf = tr.events.find((e) => e.type === 'check' && e.source === 'refresh')
            assert.strict.deepStrictEqual([rf.changed, tr.events.filter((e) => e.type === 'emit').map((e) => [e.seq === rf.seq, e.width])], [true, [[false, 310], [true, 360]]])
            clearAll(env)
        }
        finally {
            clock.restore()
        }
    })

    it(`should restore the sync state after a throwing listener with throttle and sync`, async function() {
        //sync時節流之首次於回呼內同步發出, 監聽器拋錯外拋後同步旗標須復原, 其後之refresh仍為延後發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { throttle: 20, sync: true })
        let boom = true
        r.d.on('resize', () => {
            if (boom) {
                boom = false
                throw new Error('consumer boom')
            }
        })
        assert.throws(() => env.fireRO(el), /consumer boom/)
        await sleep(40)
        el.size(330, 40)
        r.d.refresh()
        let nNow = r.resize.length
        await sleep(10)
        assert.strict.deepStrictEqual([nNow, ws(r)], [1, [300, 330]])
    })

    it(`should not emit the later deferred change of a detector cleared by the listener of the earlier one`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        r.d.on('resize', () => r.d.clear())
        el.size(300, 40)
        r.d.refresh()
        el.size(340, 40)
        r.d.refresh()
        await sleep(10)
        assert.strict.deepStrictEqual([ws(r), r.rww.length], [[300], 0])
    })

    it(`should skip a throttled emit of a hidden element and emit once it is shown again`, async function() {
        //假時鐘(R-TRACE-01 P5): 尾端於60ms窗口結束時觸發, 再延後1ms發出
        let clock = useFakeClock()
        try {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let tr = traceRec()
            let r = env.dd(() => el, { throttle: 60, onTrace: tr.on })
            env.frame()
            await clock.advance(10)
            el.size(310, 40)
            env.frame()
            hide(el)
            await clock.advance(110)
            let n = r.resize.length
            let skips = tr.events.filter((e) => e.type === 'skip').map((e) => e.reason)
            show(el, 310, 40)
            env.frame()
            await clock.advance(110)
            assert.strict.deepStrictEqual([n, ws(r)], [1, [300, 310]])
            //隱藏時之尾端略過(hidden)
            assert.strict.deepStrictEqual(skips, ['hidden'])
            clearAll(env)
        }
        finally {
            clock.restore()
        }
    })

    it(`should compare again on refresh in both modes`, async function() {
        //比較基準因尺寸以外之原因改變(例如取消固定寬度)時, refresh立即重新比較並延後發出
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let chart = { w: 300, h: 40, fixW: true }
            let r = env.dd(() => el, { ...opt, getBase: () => ({ width: chart.fixW ? null : chart.w, height: chart.h }) })
            r.d.on('resize', (m) => { //使用端於事件內套用新尺寸, 否則之後每次量測皆判定為變化
                chart.w = m.snew.width
                chart.h = m.snew.height
            })
            env.frame()
            await sleep(30)
            el.size(380, 40)
            env.frame()
            await sleep(30)
            let n = r.resize.length
            chart.fixW = false
            r.d.refresh()
            let nSync = r.resize.length
            await sleep(20) //延後發出之計時器於負載下可能延誤, 等待放寬
            assert.strict.deepStrictEqual([n, nSync, ws(r)], [0, 0, [380]], JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should do nothing on refresh after clear or before the element exists`, async function() {
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let env = mkEnv()
            let el = null
            let calls = 0
            let r = env.dd(() => {
                calls++
                return el
            }, opt)
            assert.doesNotThrow(() => r.d.refresh(), JSON.stringify(opt))
            el = new Ele(300, 40)
            r.d.clear()
            let callsAtClear = calls
            assert.doesNotThrow(() => r.d.refresh(), JSON.stringify(opt))
            env.frame()
            await sleep(10)
            assert.strict.deepStrictEqual([r.resize.length, env.moActive(), env.listeners.length, calls - callsAtClear], [0, 0, 0, 0], JSON.stringify(opt))
        }
    })

    it(`should not loop when a listener calls refresh`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        r.d.on('resize', () => r.d.refresh())
        env.frame()
        await sleep(20)
        assert.strict.deepStrictEqual(ws(r), [300])
    })

    //--- 觀察回調(onTrace) ---

    it(`should notify measurements, emits, skips and inline polling through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let env = mkEnv()
        let tr = traceRec()
        let meta = []
        let onTrace = function(e) {
            meta.push([this, Object.isFrozen(e)])
            tr.on(e)
        }
        let el = new Ele(300, 40)
        let base = { w: 300, h: 40 }
        let r = env.dd(() => el, { getBase: () => ({ width: base.w, height: base.h }), onTrace })
        r.d.on('resize', (m) => {
            base.w = m.snew.width
            base.h = m.snew.height
        })
        let from = tr.mark()
        env.frame() //掛載時與使用端一致: 不判定為變化
        el.size(350, 40)
        env.frame() //判定為變化並延後發出350
        await settle(tr, from)
        from = tr.mark()
        el.size(400, 40)
        env.frame()
        base.w = 400 //延後發出前使用端已自行套用: 略過(base)
        await settle(tr, from)
        from = tr.mark()
        hide(el)
        env.frame() //尺寸0: 判定為變化但不發出(zero)
        await settle(tr, from)
        let il = new Ele(27, 18, { display: 'inline' })
        env.dd(() => il, { timeInterval: 5, onTrace })
        await sample(tr, 'inline')
        il.display = 'block'
        env.fireRO(il) //已非行內: 停止定期量測
        assert.strict.deepStrictEqual(ws(r), [350])
        let pick = (e) => {
            if (e.type === 'check') {
                return [e.type, e.source, e.found, e.width, e.changed, e.seq !== null]
            }
            if (e.type === 'emit') {
                return [e.type, e.width, e.deferred]
            }
            if (e.type === 'skip') {
                return [e.type, e.reason]
            }
            return [e.type, e.on]
        }
        assert.strict.deepStrictEqual(tr.events.map(pick), [
            ['check', 'observer', true, 300, false, false],
            ['check', 'observer', true, 300, false, false],
            ['check', 'observer', true, 350, true, true],
            ['check', 'observer', true, 350, false, false],
            ['emit', 350, true],
            ['check', 'observer', true, 400, true, true],
            ['check', 'observer', true, 400, false, false],
            ['skip', 'base'],
            ['check', 'observer', true, 0, true, true],
            ['check', 'observer', true, 0, false, false],
            ['skip', 'zero'],
            ['inline', true],
            ['check', 'inline', true, 27, true, true],
            ['emit', 27, true],
            ['check', 'observer', true, 27, false, false],
            ['inline', false],
            ['check', 'observer', true, 27, false, false],
        ])
        //各type之欄位固定且皆為原始值
        let keys = {}
        for (let e of tr.events) {
            keys[e.type] = Object.keys(e).join(',')
            assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
        }
        assert.strict.deepStrictEqual(keys, {
            check: 'type,source,found,width,height,changed,seq',
            emit: 'type,seq,width,height,deferred',
            skip: 'type,seq,reason',
            inline: 'type,on',
        })
        assert.strict.deepStrictEqual(meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變; P4: 回調之拋錯與回傳值不影響偵測、不產生未處理之rejection
        //以假時鐘使各次執行之時序相同, 比較事件序列
        let run = async (mode, onTrace) => {
            let clock = useFakeClock()
            try {
                let env = mkEnv()
                let el = new Ele(300, 40)
                let base = { w: 300, h: 40 }
                let opt = { timeInterval: 5, throttle: 20, getBase: () => ({ width: base.w, height: base.h }) }
                if (mode === 'polling') {
                    opt.mode = 'polling'
                }
                if (onTrace !== undefined) {
                    opt.onTrace = onTrace
                }
                let r = env.dd(() => el, opt)
                r.d.on('resize', (m) => {
                    base.w = m.snew.width
                    base.h = m.snew.height
                })
                for (let [w, h] of [[310, 40], [320, 40], [321, 40], [0, 0], [320, 40], [320, 52]]) {
                    if (w === 0) {
                        hide(el)
                    }
                    else {
                        show(el, w, h)
                    }
                    env.frame()
                    await clock.advance(30)
                }
                el.size(330, 52)
                r.d.refresh()
                await clock.advance(30)
                env.resizeWindow(900, 700)
                clearAll(env)
                return {
                    resize: r.resize.map((m) => [m.sold.width, m.snew.width, m.snew.height, m.smode.width, m.smode.height]),
                    rww: r.rww.map((m) => [m.from, m.snew.width, m.snew.windowWidth]),
                    listeners: env.listeners.length,
                }
            }
            finally {
                clock.restore()
            }
        }
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        try {
            for (let mode of ['observer', 'polling']) {
                let a = await run(mode, undefined)
                let rec = traceRec()
                let b = await run(mode, rec.on)
                let c = await run(mode, () => {
                    throw new Error('trace boom')
                })
                let d = await run(mode, () => Promise.reject(new Error('trace reject')))
                let e = await run(mode, 'abc')
                await new Promise((resolve) => setImmediate(resolve))
                assert.strict.deepStrictEqual([b, c, d, e], [a, a, a, a], mode)
                assert.strict.deepStrictEqual([a.resize.length >= 4, rec.events.length > 0], [true, true], mode)
            }
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        assert.strict.deepStrictEqual(un, [])
    })

    //--- 不變式 ---

    it(`should never emit a zero size, and end within the tolerance of the actual size`, async function() {
        //以固定種子之亂數產生尺寸變化序列(含0與小幅變化), 每次變化後瀏覽器皆回報, 須滿足:
        //  (1) 不發出尺寸為0之事件 (2) 靜止時最後一次發出之尺寸與實際尺寸之差不超過容許誤差
        let seed = 20260925
        let rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0
            let v = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v
            return ((v ^ (v >>> 14)) >>> 0) / 4294967296
        }
        for (let k = 0; k < 200; k++) {
            let env = mkEnv()
            let tol = k % 3
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { tolerancePixel: tol, sync: true })
            let w = 300
            let h = 40
            for (let i = 0; i < 30; i++) {
                let x = rnd()
                if (x < 0.1) {
                    el.size(0, 0)
                }
                else {
                    w = Math.max(1, w + Math.floor(rnd() * 7) - 3)
                    h = Math.max(1, h + Math.floor(rnd() * 3) - 1)
                    el.size(w, h)
                }
                env.fireRO(el)
            }
            el.size(w, h)
            env.fireRO(el)
            assert.strict.deepStrictEqual(r.resize.filter((m) => !(m.snew.offsetWidth > 0 && m.snew.offsetHeight > 0)).length, 0, `run=${k}`)
            let last = r.resize[r.resize.length - 1]
            assert.ok(Math.abs(last.snew.offsetWidth - w) <= tol && Math.abs(last.snew.offsetHeight - h) <= tol, `run=${k} last=${last.snew.offsetWidth}x${last.snew.offsetHeight} real=${w}x${h}`)
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should decide every change by the documented rules within the tolerance, on random sequences`, async function() {
        //以固定種子之亂數產生寬之變化序列(多為±1, 含不變、容許誤差外、隱藏), 每次變化後瀏覽器皆回報, 同步與延後各半, 發出之寬須與依JSDoc規則寫成之模型逐筆相同:
        //  超過容許誤差必發出並使計次歸0; 容許誤差內之非0差照常發出, 惟連續反向達toleranceBounce次後不發出(直到同向或超過容許誤差), 同向連續發出10次後不發出(直到反向或超過容許誤差);
        //  方向取相鄰兩次量測(同一元素且皆可見)之差, 不相鄰(隱藏)時判定狀態歸0; toleranceBounce為0時容許誤差內一律不發出, 為Infinity時一律發出; 容許誤差為Infinity時皆不發出; 尺寸為0不發出
        let seed = 20260930
        let rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0
            let v = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v
            return ((v ^ (v >>> 14)) >>> 0) / 4294967296
        }
        let model = (seq, tol, tb) => {
            let b = 0 //比較基準
            let p = 0 //上次量測
            let dir = 0
            let n = 0
            let m = 0
            let out = []
            for (let v of seq) {
                let adjacent = p > 0 && v > 0
                if (!adjacent) {
                    dir = 0
                    n = 0
                    m = 0
                }
                let step = adjacent ? v - p : 0
                if (step !== 0) {
                    let s = step > 0 ? 1 : -1
                    let rev = dir !== 0 && s !== dir
                    n = rev ? n + 1 : 0
                    if (rev) {
                        m = 0
                    }
                    dir = s
                }
                let d = b - v
                let judged = false
                if (Math.abs(d) > tol) {
                    n = 0
                    m = 0
                    judged = true
                }
                else if (d !== 0 && tol !== Infinity) {
                    if (tb === Infinity) {
                        judged = true
                    }
                    else if (n < tb && m < 10) {
                        if (step !== 0) {
                            m++
                        }
                        judged = true
                    }
                }
                if (judged) {
                    b = v
                    if (v > 0) {
                        out.push(v)
                    }
                }
                p = v
            }
            return out
        }
        for (let k = 0; k < 300; k++) {
            let tol = [0, 1, 1, 2, Infinity][k % 5]
            let tb = [0, 1, 2, 3, 3, 5, Infinity][k % 7]
            let sync = k % 2 === 0
            let oneWay = k % 3 === 0 //多為+1之長單向段, 使同向連續上限亦被驗到
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { tolerancePixel: tol, toleranceBounce: tb, sync })
            let seq = []
            let w = 300
            let len = 10 + Math.floor(rnd() * 30)
            for (let i = 0; i < len; i++) {
                let hide = rnd() < 0.05
                let x = rnd()
                let v = 0 //隱藏
                if (!hide) {
                    let st = 0
                    if (oneWay) {
                        st = x < 0.85 ? 1 : x < 0.92 ? 0 : x < 0.97 ? -1 : 2 + Math.floor(rnd() * 3)
                    }
                    else {
                        st = x < 0.4 ? 1 : x < 0.75 ? -1 : x < 0.83 ? 0 : x < 0.95 ? (2 + Math.floor(rnd() * 3)) * (rnd() < 0.5 ? 1 : -1) : Math.floor(rnd() * 41) - 20
                    }
                    w = Math.max(1, w + st)
                    v = w
                }
                seq.push(v)
                el.size(v, v === 0 ? 0 : 40)
                env.fireRO(el)
            }
            if (!sync) {
                await sleep(5)
            }
            assert.strict.deepStrictEqual(ws(r), model(seq, tol, tb), `run=${k} tol=${tol} tb=${tb} sync=${sync} seq=${JSON.stringify(seq)}`)
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should never call a listener while the element is hidden, and end with the actual size, under hides, refreshes and sync`, async function() {
        //逐幀模型(尺寸未變即不回報), 以固定種子之亂數穿插: 變化、隱藏(於量測與發出之間亦然)、於下一幀前恢復顯示、refresh、推進一幀、推進時間, 於延後、sync、有無getBase四種模式須滿足:
        //  (1) 監聽器被呼叫時元素當下必被繪製 (2) 恢復顯示並靜止後, 最後一次發出之尺寸(有給getBase者為使用端所套用之尺寸)與實際尺寸之差不超過容許誤差(無永久漏發, 亦不以過期尺寸收尾)
        let seed = 20260926
        let rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0
            let v = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v
            return ((v ^ (v >>> 14)) >>> 0) / 4294967296
        }
        for (let [mode, sync, useBase] of [['deferred', false, false], ['sync', true, false], ['deferredGetBase', false, true], ['syncGetBase', true, true]]) {
            for (let k = 0; k < 40; k++) {
                let env = mkEnv()
                let tol = k % 3
                let el = new Ele(300, 40)
                let base = { w: 300, h: 40 }
                let opt = { tolerancePixel: tol, sync }
                if (useBase) {
                    opt.getBase = () => ({ width: base.w, height: base.h })
                }
                let r = env.dd(() => el, opt)
                let bad = 0
                r.d.on('resize', (m) => {
                    if (!(el.display !== 'none' && el.offsetWidth > 0 && el.offsetHeight > 0)) {
                        bad++
                    }
                    base.w = m.snew.offsetWidth
                    base.h = m.snew.offsetHeight
                })
                let w = 300
                let h = 40
                let visible = true
                let ops = []
                env.frame()
                await sleep(3)
                for (let i = 0; i < 24; i++) {
                    let x = rnd()
                    if (x < 0.2) {
                        visible = false
                        hide(el)
                        ops.push('hide')
                    }
                    else if (x < 0.4) {
                        visible = true
                        show(el, w, h)
                        ops.push('show')
                    }
                    else if (x < 0.5) {
                        r.d.refresh()
                        ops.push('refresh')
                    }
                    else {
                        w = Math.max(1, w + Math.floor(rnd() * 41) - 20)
                        h = Math.max(1, h + Math.floor(rnd() * 11) - 5)
                        if (visible) {
                            el.size(w, h)
                        }
                        ops.push(`size${w}x${h}`)
                    }
                    if (rnd() < 0.6) {
                        env.frame()
                        ops.push('frame')
                    }
                    if (rnd() < 0.5) {
                        await sleep(3)
                        ops.push('tick')
                    }
                }
                show(el, w, h)
                for (let j = 0; j < 3; j++) {
                    env.frame()
                    await sleep(3)
                }
                let last = r.resize[r.resize.length - 1]
                let fw = useBase ? base.w : (last ? last.snew.offsetWidth : 0)
                let fh = useBase ? base.h : (last ? last.snew.offsetHeight : 0)
                let msg = `mode=${mode} run=${k} final=${fw}x${fh} real=${w}x${h} ops=${ops.join(',')}`
                assert.strict.deepStrictEqual(bad, 0, msg)
                assert.ok(Math.abs(fw - w) <= tol && Math.abs(fh - h) <= tol, msg)
                for (let d of env.dds) {
                    d.clear()
                }
            }
        }
    })

})
