import assert from 'assert'
import domDetect from '../src/domDetect.mjs'


//本函數於瀏覽器執行, 以ResizeObserver、MutationObserver、window與document偵測元素尺寸, nodejs無此等物件, 故以假環境覆蓋全域
//  假ResizeObserver與假MutationObserver只記錄觀察對象, 由測試呼叫fireRO、fireMO觸發回呼, 可精確控制瀏覽器於何時回報
//  假元素之尺寸、是否在頁面中與display由測試直接設定
//  瀏覽器本身之語義(只觀察content-box時漏掉padding變化、行內元素不回報、開始觀察必回報一次、捲軸佔寬等)非本檔所能驗證, 已另以真瀏覽器實測


let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


class Ele {
    constructor(w, h, o = {}) {
        this.nodeType = 1
        this.display = o.display || 'block'
        this.isConnected = o.connected !== false
        this.size(w, h, o.cw, o.ch)
    }

    size(w, h, cw, ch) {
        this.offsetWidth = w
        this.offsetHeight = h
        this.clientWidth = (cw !== undefined) ? cw : w
        this.clientHeight = (ch !== undefined) ? ch : h
    }
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
            env.ros.push(this)
        }

        observe(t, opt) {
            this.targets.set(t, (opt && opt.box) ? opt.box : 'content-box')
        }

        unobserve(t) {
            this.targets.delete(t)
        }

        disconnect() {
            this.targets.clear()
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
        let snew = { offsetWidth: 300, offsetHeight: 40, clientWidth: 290, clientHeight: 30, windowWidth: 1200, windowHeight: 800 }
        let sold = { offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0, windowWidth: 0, windowHeight: 0 }
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
        let r = env.dd(() => el)
        env.resizeWindow(1000, 800)
        r.d.clear()
        env.resizeWindow(900, 800)
        assert.strict.deepStrictEqual(r.rww.map((m) => m.snew.windowWidth), [1000])
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
        await sleep(25)
        ok = true
        await sleep(25)
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

})
