import assert from 'assert'
import domDetect from '../src/domDetect.mjs'


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

    it(`should emit when small changes accumulate beyond the tolerance`, async function() {
        //F2、G3 比較基準為上次發出之尺寸: 每次+1px不超過容許誤差1, 累積至2px即發出, sold與smode皆相對於基準
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
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
        for (let tol of [-1, 'x', 1.5, null]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { tolerancePixel: tol })
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
        //寬先+1px(未超過容許誤差, 不發出), 之後高+20px觸發發出: 寬之方向須為空, 否則依方向判斷變寬或變窄之使用端會誤動作
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el)
        env.fireRO(el)
        el.size(301, 40)
        env.fireRO(el)
        el.size(301, 60)
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 60, '', 'larger']])
        assert.strict.deepStrictEqual([r.resize[1].sold.offsetWidth, r.resize[1].sold.offsetHeight], [300, 40])
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
        let r = env.dd(() => el, { timeInterval: 5 })
        await sleep(30)
        el.size(137, 18)
        await sleep(30)
        el.display = 'block'
        env.fireRO(el)
        let n = r.resize.length
        el.size(200, 18)
        await sleep(30)
        let nStopped = r.resize.length
        env.fireRO(el)
        await sleep(10)
        assert.strict.deepStrictEqual(ws(r), [27, 137, 200])
        assert.strict.deepStrictEqual([n, nStopped], [2, 2])
    })

    it(`should measure an inline element that was taken before being connected`, async function() {
        //Vue指令之bind時序: 元素於插入DOM前即建立偵測器, 此時取不到display而判為非行內; 插入後須於DOM變動時重判為行內並改定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline', connected: false })
        let r = env.dd(() => el, { timeInterval: 5 })
        await sleep(30)
        el.isConnected = true
        env.fireMO()
        await sleep(30)
        el.size(137, 18)
        await sleep(30)
        assert.strict.deepStrictEqual(ws(r), [27, 137])
    })

    it(`should resume measuring an inline element after it is removed and inserted again`, async function() {
        //如keep-alive: 行內元素移出DOM時定期量測量到尺寸0並判為非行內而停止, 插回後須於DOM變動時重判為行內並恢復定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let r = env.dd(() => el, { timeInterval: 5 })
        await sleep(30)
        el.isConnected = false
        el.size(0, 0)
        await sleep(30)
        el.isConnected = true
        el.size(27, 18)
        env.fireMO()
        await sleep(30)
        el.size(137, 18)
        await sleep(30)
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
    })

    it(`should keep measuring an inline element while it hides itself, and pick up the size once shown`, async function() {
        //如v-show: 行內元素自身設display:none時取得之display為none而非inline, 若因此停止定期量測, 顯示後行內元素ResizeObserver又不回報即永不量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let r = env.dd(() => el, { timeInterval: 5 })
        await sleep(30)
        el.display = 'none'
        el.size(0, 0)
        await sleep(30)
        el.display = 'inline'
        el.size(27, 18)
        await sleep(30)
        el.size(137, 18)
        await sleep(30)
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
    })

    it(`should resume an inline element that was hidden, removed and inserted again while hidden`, async function() {
        //隱藏期間移出(不在頁面中而停止量測)再插回時仍為隱藏, 須依曾判定為行內而恢復定期量測
        let env = mkEnv()
        let el = new Ele(27, 18, { display: 'inline' })
        let r = env.dd(() => el, { timeInterval: 5 })
        await sleep(30)
        el.display = 'none'
        el.size(0, 0)
        await sleep(30)
        el.isConnected = false
        await sleep(30)
        el.isConnected = true
        env.fireMO()
        await sleep(30)
        el.display = 'inline'
        el.size(27, 18)
        await sleep(30)
        el.size(137, 18)
        await sleep(30)
        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
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
        let r = env.dd(() => cur, { timeInterval: 5 })
        await sleep(30)
        let b = new Ele(0, 0, { display: 'none' })
        cur = b
        await sleep(30)
        b.display = 'block'
        b.size(300, 40)
        await sleep(30)
        let n = r.resize.length
        env.fireRO(b)
        await sleep(10)
        assert.strict.deepStrictEqual([n, ws(r)], [1, [27, 300]])
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
        //sold為比較基準(上次發出事件時之尺寸), 視窗事件與dom事件同義; 未超過容許誤差之最新量測只出現於snew
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
            let r = env.dd(() => el, opt)
            await sleep(30)
            assert.strict.deepStrictEqual([ws(r), env.ros.length, env.mos.length], [[300], 0, 0], JSON.stringify(o))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should apply the same rules in polling mode`, async function() {
        //輪詢與ResizeObserver共用比較、發出、視窗事件與清除: 累積超過容許誤差即發出、尺寸0不發出、恢復顯示再發出、視窗尺寸取當下值
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { mode: 'polling', timeInterval: 5 })
        for (let w of [300, 301, 302, 0, 302]) {
            el.size(w, w === 0 ? 0 : 40)
            await sleep(25)
        }
        env.resizeWindow(900, 600)
        r.d.clear()
        el.size(400, 40)
        await sleep(25)
        assert.strict.deepStrictEqual(ws(r), [300, 302, 302])
        assert.strict.deepStrictEqual(r.rww.filter((m) => m.from === 'window').map((m) => m.snew.windowWidth), [900])
        assert.strict.deepStrictEqual(env.listeners.length, 0)
    })

    it(`should treat a throwing f as not found in polling mode`, async function() {
        //F5 與ResizeObserver模式一致, 不因f拋錯而於每次輪詢拋出
        let env = mkEnv()
        let ok = false
        let el = new Ele(300, 40)
        let r = env.dd(() => {
            if (!ok) {
                throw new Error('f boom')
            }
            return el
        }, { mode: 'polling', timeInterval: 5 })
        await sleep(50)
        ok = true
        await sleep(50) //輪詢與延後發出之計時器於負載下可能延誤, 等待放寬
        assert.strict.deepStrictEqual(ws(r), [300])
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
        //較舊之延後發出略過時, 若其後已判定較新之變化, 不得把基準歸0, 否則之後容許誤差內之變化被誤判而多發
        let env = mkEnv()
        let a = new Ele(300, 36)
        let cur = a
        let r = env.dd(() => cur)
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
        for (let [opt, display] of [[{ mode: 'polling', timeInterval: 5 }, 'block'], [{ timeInterval: 5 }, 'inline']]) {
            let env = mkEnv()
            let el = new Ele(27, 18, { display })
            let r = env.dd(() => el, opt)
            await sleep(30)
            el.size(137, 18)
            r.d.refresh()
            el.display = 'none'
            el.size(0, 0)
            await sleep(3)
            el.display = display
            el.size(137, 18)
            await sleep(30)
            assert.strict.deepStrictEqual([ws(r), r.resize[r.resize.length - 1].sold.offsetWidth], [[27, 137], 0], display)
            for (let d of env.dds) {
                d.clear()
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
            let env = mkEnv()
            let el = new Ele(300, 40)
            let cur = el
            let r = env.dd(() => cur, opt)
            env.frame()
            await sleep(30)
            cur = null
            if (opt.mode !== 'polling') {
                r.d.refresh() //ResizeObserver模式由refresh重新取得元素(舊元素未變, 瀏覽器不回報); 輪詢模式由定期取樣重新取得
            }
            await sleep(30)
            env.resizeWindow(900, 800)
            assert.strict.deepStrictEqual([ws(r), r.rww.filter((m) => m.from === 'window').length], [[300], 0], JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should not emit window events while f finds no element, in both modes`, async function() {
        //取不到元素時最新量測歸0, 視窗事件不發出; 比較基準不動, 同尺寸之元素再出現時不發出dom事件(同1.9.5)
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let cur = el
            let r = env.dd(() => cur, opt)
            env.frame()
            await sleep(30)
            env.resizeWindow(1000, 800)
            cur = null
            el.isConnected = false
            el.size(0, 0)
            env.frame()
            await sleep(30)
            env.resizeWindow(900, 800)
            let b = new Ele(300, 40)
            cur = b
            env.fireMO()
            env.frame()
            await sleep(30)
            env.resizeWindow(800, 800)
            let w = r.rww.filter((m) => m.from === 'window')
            assert.strict.deepStrictEqual([w.map((m) => m.snew.windowWidth), ws(r)], [[1000, 800], [300]], JSON.stringify(opt))
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
            let r = env.dd(() => el, { ...opt, getBase: () => ({ width: chart.fixW ? 'fixed' : chart.w, height: chart.h }) })
            r.d.on('resize', (m) => {
                if (!chart.fixW) {
                    chart.w = m.snew.width
                }
                chart.h = m.snew.height
            })
            let step = async () => {
                env.frame()
                await sleep(30)
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

    it(`should throttle with the first change at once and the last change at the end of the window`, async function() {
        for (let opt of [{}, { mode: 'polling', timeInterval: 5 }]) {
            let env = mkEnv()
            let el = new Ele(300, 40)
            let r = env.dd(() => el, { ...opt, throttle: 60 })
            env.frame()
            await sleep(10)
            for (let w of [310, 320, 330]) {
                el.size(w, 40)
                env.frame()
                await sleep(10)
            }
            let during = ws(r)
            await sleep(100)
            await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
            assert.strict.deepStrictEqual([during, ws(r)], [[300], [300, 330]], JSON.stringify(opt))
            for (let d of env.dds) {
                d.clear()
            }
        }
    })

    it(`should cancel the pending throttled emit on clear`, async function() {
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { throttle: 60 })
        env.frame()
        await sleep(10)
        el.size(310, 40)
        env.frame()
        await sleep(10)
        r.d.clear()
        await sleep(100)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        assert.strict.deepStrictEqual(ws(r), [300])
    })

    it(`should not schedule the pending throttled emit after clear`, async function() {
        //clear時取消節流待發出者: 已排定之事件本就因clear而不發出, 但不取消時節流計時器殘留至窗口結束後仍排定延後發出
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { throttle: 60 })
        env.frame()
        await sleep(10)
        el.size(310, 40)
        env.frame()
        await sleep(10)
        let delays = []
        let st = globalThis.setTimeout
        globalThis.setTimeout = (fn, ms) => {
            delays.push(ms)
            return st(fn, ms)
        }
        try {
            r.d.clear()
            await sleep(100)
            await sleep(10)
        }
        finally {
            globalThis.setTimeout = st
        }
        assert.strict.deepStrictEqual([ws(r), delays.filter((ms) => ms === 1)], [[300], []])
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
        let env = mkEnv()
        let el = new Ele(300, 40)
        let live = []
        let r = env.dd(() => el, { throttle: 60, sync: true })
        r.d.on('resize', () => live.push(el.offsetWidth))
        env.frame()
        let nSync = r.resize.length
        el.size(310, 40)
        env.frame()
        let nWindow = r.resize.length
        await sleep(100)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        assert.strict.deepStrictEqual([nSync, nWindow, ws(r), live], [1, 1, [300, 310], [300, 310]])
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
        let env = mkEnv()
        let el = new Ele(300, 40)
        let held = []
        let st = globalThis.setTimeout
        let r = env.dd(() => el, { sync: true, throttle: 20 })
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
            await sleep(40)
        }
        finally {
            globalThis.setTimeout = st
        }
        let t0 = Date.now()
        while (Date.now() - t0 < 25) {
            //忙等超過節流時間, 使下一次回報為首次(節流以Date.now判定)
        }
        el.size(320, 40)
        env.fireRO(el) //首次, 同步發出320
        for (let fn of held) {
            fn() //被延誤之後續發出(310)此時才執行
        }
        await sleep(10)
        assert.strict.deepStrictEqual([held.length, ws(r)], [1, [300, 320]])
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
        let env = mkEnv()
        let el = new Ele(300, 40)
        let chart = { w: 300, h: 40, fixW: false }
        let r = env.dd(() => el, { throttle: 60, getBase: () => ({ width: chart.fixW ? null : chart.w, height: chart.h }) })
        r.d.on('resize', (m) => {
            chart.w = m.snew.offsetWidth
            chart.h = m.snew.offsetHeight
        })
        el.size(310, 40)
        env.frame()
        await sleep(10)
        chart.fixW = true
        el.size(360, 40)
        env.frame()
        chart.fixW = false
        r.d.refresh()
        await sleep(10)
        let nInWindow = r.resize.length
        await sleep(80)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        assert.strict.deepStrictEqual([nInWindow, ws(r)], [1, [310, 360]])
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
        let env = mkEnv()
        let el = new Ele(300, 40)
        let r = env.dd(() => el, { throttle: 60 })
        env.frame()
        await sleep(10)
        el.size(310, 40)
        env.frame()
        hide(el)
        await sleep(100)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        let n = r.resize.length
        show(el, 310, 40)
        env.frame()
        await sleep(100)
        await sleep(10) //節流之後續發出於節流計時器觸發後再延後1ms發出, 再等一輪
        assert.strict.deepStrictEqual([n, ws(r)], [1, [300, 310]])
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
