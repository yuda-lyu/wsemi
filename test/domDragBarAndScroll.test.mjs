import assert from 'assert'
import domDragBarAndScroll from '../src/domDragBarAndScroll.mjs'


//本函數於建構時即存取window與document, nodejs無此二者, 故以假物件覆蓋全域再建構
//  假元素只記錄addEventListener之處理器, 由測試直接派發合成事件, 可精確斷言事件種類/次數/順序,
//  以及preventDefault與stopPropagation是否被呼叫, 這些於真瀏覽器只能間接觀察
//  bar為panel之子節點(六個消費端皆如此), panel掛於document、document掛於window, 故dispatch會逐層往上跑以模擬冒泡直至window
//  事件模型為Pointer Events: 滑鼠pointerId固定1(Chrome亦如此), 觸控自1起另計(型別不同不衝突); touch與mouse事件只作為墊片之對象派發
//  lastEvent保留最近一次派發之事件物件, 供處理器拋錯(dispatch無回傳)時仍可檢查該事件
class Ele {
    constructor(name, parent) {
        this.name = name
        this.parent = parent || null
        this.hs = {}
        this.lastEvent = null
    }

    addEventListener(type, fn, opts) {
        if (!this.hs[type]) {
            this.hs[type] = []
        }
        this.hs[type].push({ fn, opts })
    }

    removeEventListener(type, fn) {
        if (this.hs[type]) {
            this.hs[type] = this.hs[type].filter((h) => h.fn !== fn)
        }
    }

    contains(node) {
        let n = node
        while (n) {
            if (n === this) {
                return true
            }
            n = n.parent
        }
        return false
    }

    nListeners() {
        return Object.keys(this.hs).reduce((n, k) => n + this.hs[k].length, 0)
    }

    types() {
        return Object.keys(this.hs).filter((k) => this.hs[k].length > 0).sort()
    }

    dispatch(type, init = {}) {
        let e = {
            type,
            cancelable: true,
            target: this,
            ...init,
            defaultPrevented: false,
            propagationStopped: false,
        }
        e.preventDefault = () => {
            e.defaultPrevented = true
        }
        e.stopPropagation = () => {
            e.propagationStopped = true
        }
        this.lastEvent = e
        let node = this
        while (node !== null) {
            for (let h of (node.hs[type] || []).slice()) {
                h.fn(e)
            }
            if (e.propagationStopped) {
                break
            }
            node = node.parent
        }
        return e
    }
}


//事件建構
function md(x, extra = {}) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: 0, ...extra }
}
function mm(x, buttons = 1, y = 0) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, buttons, clientX: x, clientY: y }
}
function mu(button = 0) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, button, buttons: 0, clientX: 0, clientY: 0 }
}
function td(id, x, isPrimary = true, y = 0) {
    return { pointerType: 'touch', pointerId: id, isPrimary, button: 0, buttons: 1, clientX: x, clientY: y }
}
function tm(id, x, y = 0) {
    return { pointerType: 'touch', pointerId: id, isPrimary: true, buttons: 1, clientX: x, clientY: y }
}
function tu(id) {
    return { pointerType: 'touch', pointerId: id, isPrimary: true, button: 0, buttons: 0, clientX: 0, clientY: 0 }
}


//mk, 建立一組panel/bar/window/document與das, 並記錄其發出之事件
//  seq只記clientX供比對事件序列, full記完整事件名與參數供比對座標內容
function mk(opt) {
    let win = new Ele('window')
    let doc = new Ele('document', win)
    globalThis.window = win
    globalThis.document = doc
    let panel = new Ele('panel', doc)
    let bar = new Ele('bar', panel)
    let seq = []
    let full = []
    let das = domDragBarAndScroll(panel, bar, opt)
    das.on('pressBar', (...args) => {
        seq.push(`press:${args[0].clientX}`)
        full.push(['pressBar', ...args])
    })
    das.on('dragBar', (...args) => {
        seq.push(`drag:${args[0].clientX}`)
        full.push(['dragBar', ...args])
    })
    das.on('freeBar', (...args) => {
        seq.push('free')
        full.push(['freeBar', ...args])
    })
    das.on('scrollPanel', (...args) => {
        seq.push(`scroll:${args[0].ratioY}/${args[0].ratioX}`)
        full.push(['scrollPanel', ...args])
    })
    return { panel, bar, win, doc, das, seq, full }
}


//probeState, 以不改變狀態之探測事件讀出目前之鎖: 滑鼠移動(buttons=1)只在barMouse時發dragBar,
//  指定pointerId之觸控移動, 在barTouch時發絕對座標, 在panelTouch時發縮放座標
function probeState(t) {
    let rs = []
    let n = t.seq.length
    t.win.dispatch('pointermove', mm(77))
    if (t.seq.length > n) {
        rs.push('barMouse')
    }
    for (let id of [1, 2]) {
        n = t.seq.length
        t.win.dispatch('pointermove', tm(id, 77))
        let got = t.seq.slice(n).join(',')
        if (got === 'drag:77') {
            rs.push(`barTouch#${id}`)
        }
        else if (got === 'drag:-77') {
            rs.push(`panelTouch#${id}`)
        }
        else if (got !== '') {
            rs.push(`unexpected(${got})`)
        }
    }
    return rs.length > 0 ? rs.join('+') : 'idle'
}


//STATES, 狀態機之四個前置狀態; 起手指pointerId為1, 起手座標10
let STATES = {
    idle: () => {},
    barMouse: (t) => {
        t.bar.dispatch('pointerdown', md(10))
    },
    barTouch: (t) => {
        t.bar.dispatch('pointerdown', td(1, 10))
    },
    panelTouch: (t) => {
        t.panel.dispatch('pointerdown', td(1, 10))
    },
}
let STATE_LABEL = { idle: 'idle', barMouse: 'barMouse', barTouch: 'barTouch#1', panelTouch: 'panelTouch#1' }


//TOUCH_EVENTS, 觸控之pointer事件, bar與panel共用同一組定義
//  另一指之pointerId為2; isPrimary為true者代表落下時無其他手指在場(起手指已離開), 為false者代表起手指仍在
let TOUCH_EVENTS = {
    'pointerdown touch of another finger while the starting finger is still down': ['pointerdown', td(2, 20, false)],
    'pointerdown touch, primary, after the starting finger is gone': ['pointerdown', td(2, 20, true)],
    'pointerdown touch reusing the pointerId of the starting finger': ['pointerdown', td(1, 20, false)],
    'pointerdown touch without pointerId nor isPrimary': ['pointerdown', { pointerType: 'touch', clientX: 20 }],
    'pointermove of the starting finger': ['pointermove', tm(1, 20)],
    'pointermove of another finger': ['pointermove', tm(2, 20)],
    'pointerup of the starting finger': ['pointerup', tu(1)],
    'pointerup of another finger': ['pointerup', tu(2)],
    'pointercancel of the starting finger': ['pointercancel', tu(1)],
    'pointercancel of another finger': ['pointercancel', tu(2)],
    'pointercancel without any pointer information': ['pointercancel', {}],
}


//TABLE, 狀態×事件之全表; 每格為'發出之事件序列|事件後之狀態', same表狀態不變
//  欄序為 idle, barMouse, barTouch, panelTouch
//  第二欄為函數者直接執行; 為'bar'或'panel'者, 以標題去掉該前綴後查TOUCH_EVENTS並派發於該元素
//  標「契約變更」者為由touch事件模型改為pointer事件模型後之差異, 皆只有合成事件可達
let S4 = (v) => [v, v, v, v]
let TAKE_OVER_BY_MOUSE = ['press:20|barMouse', 'free,press:20|barMouse', 'free,press:20|barMouse', 'free,press:20|barMouse']
let FREE_IF_MOUSE = ['|same', 'free|idle', '|same', '|same']
let TABLE = [

    //--- 滑鼠 ---
    ['bar pointerdown mouse with the primary button', (t) => t.bar.dispatch('pointerdown', md(20)), TAKE_OVER_BY_MOUSE],
    ['bar pointerdown without a button property', (t) => t.bar.dispatch('pointerdown', { clientX: 20 }), TAKE_OVER_BY_MOUSE],
    ['bar pointerdown mouse with the middle button', (t) => t.bar.dispatch('pointerdown', md(20, { button: 1, buttons: 4 })), S4('|same')],
    ['bar pointerdown mouse with the right button', (t) => t.bar.dispatch('pointerdown', md(20, { button: 2, buttons: 2 })), S4('|same')],
    ['panel pointerdown mouse outside the bar', (t) => t.panel.dispatch('pointerdown', md(20)), S4('|same')],
    //契約變更: 舊模型之mouseup刻意不判來源作為觸控遺失touchend之救援; 新模型觸控之放開由window capture階段收取, 不會遺失, 滑鼠之pointerup只解滑鼠之鎖
    ['bar pointerup mouse', (t) => t.bar.dispatch('pointerup', mu(0)), FREE_IF_MOUSE],
    ['window pointerup mouse', (t) => t.win.dispatch('pointerup', mu(0)), FREE_IF_MOUSE],
    ['window pointerup mouse of the right button', (t) => t.win.dispatch('pointerup', mu(2)), FREE_IF_MOUSE],
    ['window pointermove mouse with a button held', (t) => t.win.dispatch('pointermove', mm(20, 1)),
        ['|same', 'drag:20|same', '|same', '|same']],
    ['window pointermove mouse without a buttons property', (t) => t.win.dispatch('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 20 }),
        ['|same', 'drag:20|same', '|same', '|same']],
    ['window pointermove mouse with no button held', (t) => t.win.dispatch('pointermove', mm(20, 0)),
        ['|same', 'free|idle', '|same', '|same']],

    //--- bar 觸控(事件派發於bar, 會冒泡至panel與window) ---
    ['bar pointerdown touch of another finger while the starting finger is still down', 'bar',
        ['press:20|barTouch#2', '|same', '|same', '|same']],
    ['bar pointerdown touch, primary, after the starting finger is gone', 'bar',
        ['press:20|barTouch#2', '|same', 'free,press:20|barTouch#2', 'free,press:20|barTouch#2']],
    ['bar pointerdown touch reusing the pointerId of the starting finger', 'bar',
        ['press:20|barTouch#1', '|same', 'free,press:20|barTouch#1', 'free,press:20|barTouch#1']],
    //契約變更: 舊模型無觸點之touchstart被忽略; pointer事件必有指標, 未帶pointerId者視為殘鎖接手, 之後任何觸控id之移動皆屬它
    ['bar pointerdown touch without pointerId nor isPrimary', 'bar',
        ['press:20|barTouch#1+barTouch#2', '|same', 'free,press:20|barTouch#1+barTouch#2', 'free,press:20|barTouch#1+barTouch#2']],
    ['bar pointermove of the starting finger', 'bar',
        ['|same', '|same', 'drag:20|same', 'drag:-20|same']],
    ['bar pointermove of another finger', 'bar', S4('|same')],
    ['bar pointerup of the starting finger', 'bar',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['bar pointerup of another finger', 'bar', S4('|same')],
    ['bar pointercancel of the starting finger', 'bar',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['bar pointercancel of another finger', 'bar', S4('|same')],
    //契約變更: 無任何指標資訊時採解鎖側, 含滑鼠之鎖(舊模型touchcancel只影響觸控通道)
    ['bar pointercancel without any pointer information', 'bar',
        ['|same', 'free|idle', 'free|idle', 'free|idle']],

    //--- panel 觸控(事件派發於panel, 不經bar) ---
    ['panel pointerdown touch of another finger while the starting finger is still down', 'panel',
        ['press:-20|panelTouch#2', '|same', '|same', '|same']],
    ['panel pointerdown touch, primary, after the starting finger is gone', 'panel',
        ['press:-20|panelTouch#2', '|same', 'free,press:-20|panelTouch#2', 'free,press:-20|panelTouch#2']],
    ['panel pointerdown touch reusing the pointerId of the starting finger', 'panel',
        ['press:-20|panelTouch#1', '|same', 'free,press:-20|panelTouch#1', 'free,press:-20|panelTouch#1']],
    ['panel pointerdown touch without pointerId nor isPrimary', 'panel',
        ['press:-20|panelTouch#1+panelTouch#2', '|same', 'free,press:-20|panelTouch#1+panelTouch#2', 'free,press:-20|panelTouch#1+panelTouch#2']],
    //契約變更: 起手指之移動與放開不論派發於何處皆被服務(真實裝置下隱式捕獲使其必派發於起手元素, 舊模型之bar通道只監聽bar故看不到)
    ['panel pointermove of the starting finger', 'panel',
        ['|same', '|same', 'drag:20|same', 'drag:-20|same']],
    ['panel pointermove of another finger', 'panel', S4('|same')],
    ['panel pointerup of the starting finger', 'panel',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['panel pointerup of another finger', 'panel', S4('|same')],
    ['panel pointercancel of the starting finger', 'panel',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['panel pointercancel of another finger', 'panel', S4('|same')],
    ['panel pointercancel without any pointer information', 'panel',
        ['|same', 'free|idle', 'free|idle', 'free|idle']],

    //--- 滾輪與清理 ---
    ['panel wheel', (t) => t.panel.dispatch('wheel', { deltaY: -120, deltaX: 60 }), S4('scroll:-1/1|same')],
    ['clear', (t) => t.das.clear(), S4('|idle')],

]


//runCell, 建立前置狀態後執行事件, 回傳'發出之事件序列|事件後之狀態'
function runCell(opt, state, act) {
    let t = mk(opt)
    STATES[state](t)
    let n = t.seq.length
    if (typeof act === 'function') {
        act(t)
    }
    else {
        let [type, init] = TOUCH_EVENTS[act.name]
        t[act.on].dispatch(type, init)
    }
    let emitted = t.seq.slice(n).join(',')
    return `${emitted}|${probeState(t)}`
}


describe(`domDragBarAndScroll`, function() {

    after(function() {
        delete globalThis.window
        delete globalThis.document
    })

    //--- 狀態×事件全表 ---

    describe(`state machine, every state against every event`, function() {
        let names = Object.keys(STATES)
        for (let [title, act, expects] of TABLE) {
            let a = act
            if (typeof act === 'string') {
                a = { on: act, name: title.slice(act.length + 1) }
            }
            names.forEach((state, i) => {
                let exp = expects[i].replace('|same', `|${STATE_LABEL[state]}`)
                it(`should handle [${state}] x [${title}] as [${exp}]`, function() {
                    assert.strict.deepStrictEqual(runCell({}, state, a), exp)
                })
            })
        }
    })

    describe(`state machine, panel touch events with useTouchDragForPanel false`, function() {
        //c4 現有八個呼叫點皆傳false, 此時panel上之按下一律不得上鎖; 起手指之移動與放開則不論派發位置皆被服務(契約變更, 見TABLE)
        let EXP = {
            'pointerdown touch of another finger while the starting finger is still down': S4('|same'),
            'pointerdown touch, primary, after the starting finger is gone': S4('|same'),
            'pointerdown touch reusing the pointerId of the starting finger': S4('|same'),
            'pointerdown touch without pointerId nor isPrimary': S4('|same'),
            'pointermove of the starting finger': ['|same', '|same', 'drag:20|same'],
            'pointermove of another finger': S4('|same'),
            'pointerup of the starting finger': ['|same', '|same', 'free|idle'],
            'pointerup of another finger': S4('|same'),
            'pointercancel of the starting finger': ['|same', '|same', 'free|idle'],
            'pointercancel of another finger': S4('|same'),
            'pointercancel without any pointer information': ['|same', 'free|idle', 'free|idle'],
        }
        for (let name of Object.keys(TOUCH_EVENTS)) {
            ['idle', 'barMouse', 'barTouch'].forEach((state, i) => {
                let exp = EXP[name][i].replace('|same', `|${STATE_LABEL[state]}`)
                it(`should handle [${state}] x [panel ${name}] as [${exp}]`, function() {
                    assert.strict.deepStrictEqual(runCell({ useTouchDragForPanel: false }, state, { on: 'panel', name }), exp)
                })
            })
        }
    })

    //--- 滑鼠通道 ---

    it(`should emit pressBar, dragBar and freeBar for a primary button drag`, function() {
        //a1 基準路徑
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(250))
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'drag:300', 'free'])
    })

    it(`should ignore the middle and right button on pointerdown`, function() {
        //a2、a3 中鍵與右鍵不得上鎖
        for (let button of [1, 2]) {
            let t = mk({ useTouchDragForPanel: false })
            t.bar.dispatch('pointerdown', md(130, { button }))
            t.win.dispatch('pointermove', mm(300, 4))
            assert.strict.deepStrictEqual(t.seq, [], `button=${button}`)
        }
    })

    it(`should still lock for a synthetic event without a button property`, function() {
        //n12 合成事件之button為undefined, 以'button' in e判定故維持原本可上鎖之行為
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', { clientX: 130 })
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should unlock itself when a pointermove arrives with no button held`, function() {
        //a5 拖出瀏覽器視窗外放開後收不到pointerup, 回到視窗內移動時自癒
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(250))
        t.win.dispatch('pointermove', mm(330, 0))
        t.win.dispatch('pointermove', mm(400, 0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'free'])
    })

    it(`should unlock on pointerup from any button`, function() {
        //a4 pointerup代表最後一鍵放開, 不判按鍵
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.win.dispatch('pointerup', mu(2))
        t.win.dispatch('pointermove', mm(300))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should unlock on a pointerup received by the bar itself, via bubbling`, function() {
        //a7 嵌入panel攔截事件時仍由window capture階段收取(capture之語義於真瀏覽器另驗, 此處只驗冒泡路徑)
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.bar.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should emit exactly one freeBar per lock`, function() {
        //契約: 一次上鎖只對應一次freeBar
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.bar.dispatch('pointerup', mu())
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq.filter((v) => v === 'free').length, 1)
    })

    it(`should close the stale lock before a new pointerdown takes over`, function() {
        //d3 pointerup遺失且其間無pointermove時, 再次按下主鍵代表前一把鎖必為殘留; 先補發freeBar再發pressBar, 使兩者恆成對
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.bar.dispatch('pointerdown', md(140))
        t.win.dispatch('pointermove', mm(200))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should let the mouse take over a touch lock, closing it first`, function() {
        //d3 滑鼠為觸控之救援通道, 主鍵按下即接手; 被接手之觸控其後續事件不再作用
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        t.bar.dispatch('pointerdown', md(140))
        t.win.dispatch('pointermove', tm(1, 200))
        t.win.dispatch('pointermove', mm(210))
        t.win.dispatch('pointerup', tu(1))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:210', 'free'])
    })

    it(`should ignore a touch that lands while a mouse drag is in progress`, function() {
        //d3 滑鼠之鎖不被觸控接手; 其自有buttons自癒與pointerup
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.bar.dispatch('pointerdown', td(1, 140))
        t.win.dispatch('pointermove', tm(1, 200))
        t.win.dispatch('pointerup', tu(1))
        t.win.dispatch('pointermove', mm(210))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:210', 'free'])
    })

    //--- 滾輪通道 ---

    it(`should emit scrollPanel on wheel`, function() {
        //a8
        let t = mk({ useTouchDragForPanel: false })
        t.panel.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        t.panel.dispatch('wheel', { deltaY: 3, deltaX: -0.5 })
        assert.strict.deepStrictEqual(t.seq, ['scroll:-1/1', 'scroll:1/-1'])
    })

    it(`should emit zero for the axis whose delta is zero`, function() {
        //n8 一般滑鼠滾輪之deltaX恆為0, 該軸方向須為0而非NaN
        let t = mk({ useTouchDragForPanel: false })
        t.panel.dispatch('wheel', { deltaY: -120, deltaX: 0 })
        t.panel.dispatch('wheel', { deltaY: 0, deltaX: 40 })
        t.panel.dispatch('wheel', { deltaY: -0, deltaX: 0 })
        assert.strict.deepStrictEqual(t.full.map((v) => v[1]), [
            { ratioY: -1, ratioX: 0 },
            { ratioY: 0, ratioX: 1 },
            { ratioY: 0, ratioX: 0 },
        ])
    })

    it(`should emit scrollPanel from wheel on the bar, via bubbling`, function() {
        //n5 bar上滾輪仍捲動面板, 屬刻意
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        assert.strict.deepStrictEqual(t.seq, ['scroll:-1/1'])
    })

    it(`should cancel the wheel only when stopScrollPropagationForPanel is set`, function() {
        //c6
        let a = mk({})
        let e1 = a.panel.dispatch('wheel', { deltaY: -120, deltaX: 0 })
        let b = mk({ stopScrollPropagationForPanel: true })
        let e2 = b.panel.dispatch('wheel', { deltaY: -120, deltaX: 0 })
        assert.strict.deepStrictEqual([e1.defaultPrevented, e1.propagationStopped], [false, false])
        assert.strict.deepStrictEqual([e2.defaultPrevented, e2.propagationStopped], [true, true])
    })

    //--- bar 觸控通道 ---

    it(`should emit pressBar, dragBar and freeBar for a single finger drag`, function() {
        //b1 基準路徑
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        t.bar.dispatch('pointermove', tm(1, 200))
        t.bar.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should work when the first finger pointerId is zero`, function() {
        //N5 判定須嚴格比null而非以真值判斷
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(0, 130))
        t.bar.dispatch('pointermove', tm(0, 200))
        t.bar.dispatch('pointerup', tu(0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should track a starting finger whose pointerId is zero against other fingers`, function() {
        //N5 起手指pointerId為0時仍須以pointerId追蹤
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(0, 115))
        t.bar.dispatch('pointerdown', td(1, 300, false))
        t.bar.dispatch('pointermove', tm(1, 360))
        t.bar.dispatch('pointerup', tu(1))
        t.bar.dispatch('pointermove', tm(0, 160))
        t.bar.dispatch('pointerup', tu(0))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160', 'free'])
    })

    it(`should unlock on pointercancel without emitting a position`, function() {
        //b2 手勢被系統中斷, 座標不可信故只解鎖不定值
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        t.bar.dispatch('pointermove', tm(1, 200))
        t.bar.dispatch('pointercancel', tu(1))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should not re-anchor when a second finger lands`, function() {
        //b4 第二指落下不得重新定錨
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        t.bar.dispatch('pointerdown', td(2, 300, false))
        assert.strict.deepStrictEqual(t.seq, ['press:115'])
    })

    it(`should ignore a move of a finger other than the one that started the drag`, function() {
        //b5 第二指移動不得搶值
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        t.bar.dispatch('pointerdown', td(2, 300, false))
        t.bar.dispatch('pointermove', tm(2, 360))
        assert.strict.deepStrictEqual(t.seq, ['press:115'])
    })

    it(`should not end the drag when a finger other than the starting one is lifted`, function() {
        //b7 非起手指抬起不得終止拖曳
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        t.bar.dispatch('pointerdown', td(2, 300, false))
        t.bar.dispatch('pointerup', tu(2))
        t.bar.dispatch('pointermove', tm(1, 160))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160'])
    })

    it(`should end the drag when the starting finger is lifted`, function() {
        //b6
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        t.bar.dispatch('pointerdown', td(2, 300, false))
        t.bar.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'free'])
    })

    it(`should not end the drag when only another finger is cancelled`, function() {
        //n6 pointercancel須比對起手指
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        t.bar.dispatch('pointerdown', td(2, 300, false))
        t.bar.dispatch('pointercancel', tu(2))
        t.bar.dispatch('pointermove', tm(1, 160))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160'])
    })

    it(`should unlock on a pointercancel that carries no pointer information`, function() {
        //n13 無資訊時採安全側, 寧可解鎖也不留殘鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        t.bar.dispatch('pointercancel', {})
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should not throw when pointerdown carries no pointer information, and lock as a mouse`, function() {
        //b8 合成事件; 未帶pointerType者視為滑鼠, 與n12對稱
        let t = mk({ useTouchDragForPanel: false })
        let r = () => {
            t.bar.dispatch('pointerdown', {})
        }
        assert.doesNotThrow(r)
        assert.strict.deepStrictEqual(`${t.seq.join(',')}|${probeState(t)}`, 'press:undefined|barMouse')
    })

    it(`should cancel the touchmove of the bar while a touch drag is locked, whichever finger moves`, function() {
        //R2 墊片不判手指: 第二指移動時頁面亦不可被捲動
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 115))
        let e = t.bar.dispatch('touchmove', {})
        assert.strict.deepStrictEqual([e.defaultPrevented, e.propagationStopped], [true, true])
    })

    it(`should cancel only the touchmove of the bar, never its touchstart or touchend`, function() {
        //c6 bar之touchstart與touchend不擋預設行為, 否則輕點bar後瀏覽器不再產生click
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        let e1 = t.bar.dispatch('touchstart', {})
        let e2 = t.bar.dispatch('touchmove', {})
        t.bar.dispatch('pointerup', tu(1))
        let e3 = t.bar.dispatch('touchend', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented, e3.defaultPrevented], [false, true, false])
    })

    it(`should not cancel a bar touchmove while the bar is not locked by a touch`, function() {
        //未上鎖或由滑鼠上鎖時, bar之touchmove不得擋預設行為, 否則bar上起手之一般頁面捲動會失效
        let t = mk({ useTouchDragForPanel: false })
        let e1 = t.bar.dispatch('touchmove', {})
        t.bar.dispatch('pointerdown', md(130))
        let e2 = t.bar.dispatch('touchmove', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    it(`should not cancel a touchmove that is not cancelable`, function() {
        //瀏覽器已開始捲動時事件不可取消, 不得對其呼叫preventDefault
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        let e = t.bar.dispatch('touchmove', { cancelable: false })
        assert.strict.deepStrictEqual([e.defaultPrevented, e.propagationStopped], [false, false])
    })

    it(`should prevent the contextmenu on the panel only while a touch or pen drag is locked`, function() {
        //觸控拖曳中長按會叫出選單並以pointercancel中斷手勢; 滑鼠右鍵選單不受影響
        let t = mk({ useTouchDragForPanel: false })
        let e0 = t.bar.dispatch('contextmenu', {})
        t.bar.dispatch('pointerdown', md(130))
        let e1 = t.bar.dispatch('contextmenu', {})
        t.win.dispatch('pointerup', mu())
        t.bar.dispatch('pointerdown', td(1, 130))
        let e2 = t.bar.dispatch('contextmenu', {})
        t.win.dispatch('pointerup', tu(1))
        let e3 = t.bar.dispatch('contextmenu', {})
        assert.strict.deepStrictEqual([e0, e1, e2, e3].map((e) => e.defaultPrevented), [false, false, true, false])
    })

    //--- 殘鎖之復原 ---

    it(`should recover from a lost pointerup on the next primary touch`, function() {
        //d1 放開事件遺失時(新模型下僅合成可達), 下一次primary之pointerdown代表前手勢已結束, 先補發freeBar再重新上鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(5, 130))
        t.bar.dispatch('pointermove', tm(5, 150))
        t.bar.dispatch('pointerdown', td(7, 140, true))
        t.bar.dispatch('pointermove', tm(7, 200))
        t.bar.dispatch('pointerup', tu(7))
        t.bar.dispatch('pointerdown', td(9, 140, true))
        t.bar.dispatch('pointermove', tm(9, 260))
        t.bar.dispatch('pointerup', tu(9))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:150', 'free', 'press:140', 'drag:200', 'free', 'press:140', 'drag:260', 'free'])
    })

    it(`should recover from a lost pointerup when the pointerId is reused`, function() {
        //d1 新落下之手指與起手指同pointerId, 代表原起手指早已離開, 即使isPrimary為false
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(0, 130))
        t.bar.dispatch('pointermove', tm(0, 150))
        t.bar.dispatch('pointerdown', td(0, 140, false))
        t.bar.dispatch('pointermove', tm(0, 200))
        t.bar.dispatch('pointerup', tu(0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:150', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should recover from a lost pointerup in the panel touch channel too`, function() {
        //d1
        let t = mk({})
        t.panel.dispatch('pointerdown', td(5, 300))
        t.panel.dispatch('pointerdown', td(7, 280, true))
        t.panel.dispatch('pointermove', tm(7, 240))
        t.panel.dispatch('pointerup', tu(7))
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'free', 'press:-280', 'drag:-240', 'free'])
    })

    it(`should recover a stale bar touch lock through a touch on the panel`, function() {
        //d1 殘鎖來自bar通道, 下一次觸控落在panel非bar處
        let t = mk({})
        t.bar.dispatch('pointerdown', td(5, 130))
        t.panel.dispatch('pointerdown', td(7, 280, true))
        t.panel.dispatch('pointermove', tm(7, 240))
        t.panel.dispatch('pointerup', tu(7))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:-280', 'drag:-240', 'free'])
    })

    //--- 指標資訊不完整之合成事件 ---

    it(`should serve pointer events that carry no pointerId`, function() {
        //d2 測試工具常見之合成事件; 無從比對時任一同型別之移動與放開皆屬起手指標
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', { pointerType: 'touch', clientX: 130 })
        t.bar.dispatch('pointermove', { pointerType: 'touch', clientX: 200 })
        t.bar.dispatch('pointerup', { pointerType: 'touch' })
        t.bar.dispatch('pointerdown', { pointerType: 'touch', clientX: 140 })
        t.bar.dispatch('pointermove', { pointerType: 'touch', clientX: 220 })
        t.bar.dispatch('pointerup', { pointerType: 'touch' })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free', 'press:140', 'drag:220', 'free'])
    })

    it(`should serve incomplete pointer events in the panel touch channel too`, function() {
        //d2 bar與panel共用同一組規則
        let t = mk({})
        t.panel.dispatch('pointerdown', { pointerType: 'touch', clientX: 300 })
        t.panel.dispatch('pointermove', { pointerType: 'touch', clientX: 260 })
        t.panel.dispatch('pointerup', { pointerType: 'touch' })
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'drag:-260', 'free'])
    })

    //--- 通道互斥 ---

    it(`should emit pressBar once when a bar touch bubbles up to the panel`, function() {
        //n1 bar位於panel之內, 且useTouchDragForPanel預設為true; 單一原語實例, 冒泡不會造成第二次pressBar
        let t = mk({})
        t.bar.dispatch('pointerdown', td(1, 130))
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should serve a whole bar touch drag once when the panel touch channel is enabled`, function() {
        //n1、N1b 整段手勢皆只由bar通道服務, pointerId重用亦然
        let t = mk({})
        t.bar.dispatch('pointerdown', td(0, 130))
        t.bar.dispatch('pointermove', tm(0, 200))
        t.bar.dispatch('pointerup', tu(0))
        t.bar.dispatch('pointerdown', td(0, 140))
        t.bar.dispatch('pointermove', tm(0, 210))
        t.bar.dispatch('pointerup', tu(0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free', 'press:140', 'drag:210', 'free'])
    })

    it(`should not end a bar drag when another finger is lifted on the panel`, function() {
        //n4 第二指落在panel非bar處並抬起, 不得中斷bar之拖曳
        let t = mk({})
        t.bar.dispatch('pointerdown', td(1, 130))
        t.panel.dispatch('pointerdown', td(2, 300, false))
        t.panel.dispatch('pointerup', tu(2))
        t.bar.dispatch('pointermove', tm(1, 200))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200'])
    })

    it(`should not emit dragBar from mouse movement while a touch drag is in progress`, function() {
        //b12 觸控上鎖時不得以絕對座標發dragBar, 否則污染panel通道之縮放座標語義
        let t = mk({})
        t.panel.dispatch('pointerdown', td(1, 300))
        t.win.dispatch('pointermove', mm(380, 0))
        t.win.dispatch('pointermove', mm(400, 1))
        assert.strict.deepStrictEqual(t.seq, ['press:-300'])
    })

    it(`should keep the mouse channel working after a touch lock ended`, function() {
        //R1 回歸釘樁: 解鎖須全部狀態成套歸零, 否則殘留之pointerId會讓滑鼠通道永久失效
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', td(1, 130))
        t.win.dispatch('pointerup', mu())
        t.bar.dispatch('pointerup', tu(1))
        let n = t.seq.length
        t.bar.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(250))
        t.win.dispatch('pointermove', mm(300))
        assert.strict.deepStrictEqual(t.seq.slice(n), ['press:130', 'drag:250', 'drag:300'])
    })

    //--- panel 觸控通道 ---

    it(`should emit scaled coordinates for the panel touch channel`, function() {
        //座標語義: panel通道發經比例縮放之相對位移, 與bar通道之絕對座標不同
        let t = mk({ getHeighRatio: () => 0.5, getWidthRatio: () => 0.5 })
        t.panel.dispatch('pointerdown', td(1, 300, true, 200))
        t.panel.dispatch('pointermove', tm(1, 260, 180))
        t.panel.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.seq, ['press:-150', 'drag:-130', 'free'])
    })

    it(`should ignore the panel touch channel when useTouchDragForPanel is false`, function() {
        //c4 現有八個呼叫點皆傳false
        let t = mk({ useTouchDragForPanel: false })
        t.panel.dispatch('pointerdown', td(1, 300))
        t.panel.dispatch('pointermove', tm(1, 260))
        t.panel.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.seq, [])
    })

    it(`should never let the mouse into the panel touch channel`, function() {
        //panel通道僅觸控與觸控筆; 滑鼠於panel非bar處按下不得上鎖
        let t = mk({})
        t.panel.dispatch('pointerdown', md(300))
        t.win.dispatch('pointermove', mm(260))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, [])
    })

    it(`should serve a pen in the panel touch channel`, function() {
        let t = mk({})
        t.panel.dispatch('pointerdown', { ...td(1, 300), pointerType: 'pen' })
        t.panel.dispatch('pointermove', { ...tm(1, 260), pointerType: 'pen' })
        t.panel.dispatch('pointerup', { ...tu(1), pointerType: 'pen' })
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'drag:-260', 'free'])
        assert.strict.deepStrictEqual(t.full[0][1].pointerType, 'pen')
    })

    it(`should track the starting finger in the panel touch channel too`, function() {
        //b11 panel通道同樣以pointerId鎖定
        let t = mk({})
        t.panel.dispatch('pointerdown', td(1, 300))
        t.panel.dispatch('pointermove', tm(2, 100))
        t.panel.dispatch('pointercancel', {})
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'free'])
    })

    it(`should cancel the panel touch events only when stopTouchDragPropagationForPanel is set`, function() {
        //c6 旗標控制panel之touchstart、touchmove、touchend三者; 未上鎖時之touchmove與touchend一律不擋
        //   pointer事件早於其相容之touch事件, 故先派發pointer事件再派發touch事件
        let run = (opt) => {
            let t = mk(opt)
            let e0 = t.panel.dispatch('touchmove', {})
            t.panel.dispatch('pointerdown', td(1, 300))
            let e1 = t.panel.dispatch('touchstart', {})
            t.panel.dispatch('pointermove', tm(1, 260))
            let e2 = t.panel.dispatch('touchmove', {})
            t.panel.dispatch('pointermove', tm(2, 100))
            let e3 = t.panel.dispatch('touchmove', {})
            t.panel.dispatch('pointerup', tu(1))
            let e4 = t.panel.dispatch('touchend', {})
            let e5 = t.panel.dispatch('touchend', {})
            return [e0, e1, e2, e3, e4, e5].map((e) => e.defaultPrevented && e.propagationStopped)
        }
        assert.strict.deepStrictEqual(run({ stopTouchDragPropagationForPanel: false }), [false, false, false, false, false, false])
        assert.strict.deepStrictEqual(run({ stopTouchDragPropagationForPanel: true }), [false, true, true, true, true, false])
    })

    it(`should not cancel a panel touchstart that is ignored`, function() {
        //他指落下被忽略時不擋其預設行為, 與bar通道一致
        let t = mk({ stopTouchDragPropagationForPanel: true })
        t.panel.dispatch('pointerdown', td(1, 300))
        t.panel.dispatch('touchstart', {})
        t.panel.dispatch('pointerdown', td(2, 100, false))
        let e = t.panel.dispatch('touchstart', {})
        assert.strict.deepStrictEqual(e.defaultPrevented, false)
    })

    it(`should not cancel the bar touch events through the panel flag`, function() {
        //旗標只管panel通道; bar通道之touchstart與touchend恆不擋
        let t = mk({ stopTouchDragPropagationForPanel: true })
        t.bar.dispatch('pointerdown', td(1, 130))
        let e1 = t.bar.dispatch('touchstart', {})
        t.bar.dispatch('pointerup', tu(1))
        let e2 = t.bar.dispatch('touchend', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    //--- 事件參數 ---

    it(`should emit both axes of the absolute coordinates and the pointerType for the bar channel`, function() {
        //bar之滑鼠與觸控皆發絕對座標, 兩軸皆須正確, 且不受比例函數影響; freeBar不帶參數
        let t = mk({ useTouchDragForPanel: false, getHeighRatio: () => 0.5, getWidthRatio: () => 0.25 })
        t.bar.dispatch('pointerdown', md(10, { clientY: 11 }))
        t.win.dispatch('pointermove', mm(20, 1, 21))
        t.win.dispatch('pointerup', mu())
        t.bar.dispatch('pointerdown', td(1, 30, true, 31))
        t.bar.dispatch('pointermove', tm(1, 40, 41))
        t.bar.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.full, [
            ['pressBar', { clientY: 11, clientX: 10, pointerType: 'mouse' }],
            ['dragBar', { clientY: 21, clientX: 20, pointerType: 'mouse' }],
            ['freeBar'],
            ['pressBar', { clientY: 31, clientX: 30, pointerType: 'touch' }],
            ['dragBar', { clientY: 41, clientX: 40, pointerType: 'touch' }],
            ['freeBar'],
        ])
    })

    it(`should scale each axis by its own ratio for the panel touch channel`, function() {
        //clientY用getHeighRatio, clientX用getWidthRatio, 兩者不得互換
        let t = mk({ getHeighRatio: () => 0.5, getWidthRatio: () => 0.25 })
        t.panel.dispatch('pointerdown', td(1, 100, true, 200))
        t.panel.dispatch('pointermove', tm(1, 80, 160))
        t.panel.dispatch('pointerup', tu(1))
        assert.strict.deepStrictEqual(t.full, [
            ['pressBar', { clientY: -100, clientX: -25, pointerType: 'touch' }],
            ['dragBar', { clientY: -80, clientX: -20, pointerType: 'touch' }],
            ['freeBar'],
        ])
    })

    it(`should read the ratios at the moment of each event`, function() {
        //比例由外部函數提供, 係因組件或內容物尺寸會變動, 故每次發事件皆須重新取值
        let r = 1
        let t = mk({ getHeighRatio: () => r, getWidthRatio: () => r })
        t.panel.dispatch('pointerdown', td(1, 100, true, 100))
        r = 0.5
        t.panel.dispatch('pointermove', tm(1, 100, 100))
        assert.strict.deepStrictEqual(t.seq, ['press:-100', 'drag:-50'])
    })

    //--- 監聽器拋錯與重入 ---

    it(`should cancel the touchmove even when the dragBar listener throws`, function() {
        //N3a 墊片與emit彼此獨立, 消費端拋錯時拖曳中頁面仍不可被捲動
        let t = mk({ useTouchDragForPanel: false })
        t.das.on('dragBar', () => {
            throw new Error('consumer boom')
        })
        t.bar.dispatch('pointerdown', td(1, 130))
        assert.throws(() => t.bar.dispatch('pointermove', tm(1, 200)), /consumer boom/) //監聽器拋錯仍外拋至emit呼叫端, 與evem一致
        let e = t.bar.dispatch('touchmove', {})
        assert.strict.deepStrictEqual(e.defaultPrevented, true)
    })

    it(`should cancel the panel events, the mouseup and the wheel even when a listener throws`, function() {
        //N3a 狀態與待辦皆先於emit異動
        let t = mk({ stopTouchDragPropagationForPanel: true, stopScrollPropagationForPanel: true })
        for (let name of ['pressBar', 'dragBar', 'freeBar', 'scrollPanel']) {
            t.das.on(name, () => {
                throw new Error('consumer boom')
            })
        }
        let rs = []
        let run = (ele, type, init) => {
            let e = ele.dispatch(type, init)
            rs.push(`${type}:${e.defaultPrevented}`)
        }
        assert.throws(() => t.panel.dispatch('pointerdown', td(1, 300)), /consumer boom/)
        run(t.panel, 'touchstart', {})
        assert.throws(() => t.panel.dispatch('pointermove', tm(1, 260)), /consumer boom/)
        run(t.panel, 'touchmove', {})
        assert.throws(() => t.panel.dispatch('pointerup', tu(1)), /consumer boom/)
        run(t.panel, 'touchend', {})
        assert.throws(() => t.panel.dispatch('wheel', { deltaY: -120, deltaX: 0 }), /consumer boom/)
        rs.push(`wheel:${t.panel.lastEvent.defaultPrevented}`)
        assert.throws(() => t.bar.dispatch('pointerdown', md(130)), /consumer boom/)
        assert.throws(() => t.win.dispatch('pointerup', mu()), /consumer boom/)
        run(t.win, 'mouseup', {})
        assert.strict.deepStrictEqual(rs, ['touchstart:true', 'touchmove:true', 'touchend:true', 'wheel:true', 'mouseup:true'])
    })

    it(`should change its state before emitting, so a throwing listener leaves no half state`, function() {
        //pressBar之監聽器拋錯時鎖已上, 其後拖曳照常; freeBar之監聽器拋錯時鎖已解, 不留殘鎖
        let t = mk({ useTouchDragForPanel: false })
        let boom = true
        t.das.on('pressBar', () => {
            if (boom) {
                throw new Error('consumer boom')
            }
        })
        t.das.on('freeBar', () => {
            if (boom) {
                throw new Error('consumer boom')
            }
        })
        assert.throws(() => t.bar.dispatch('pointerdown', md(130)), /consumer boom/)
        t.win.dispatch('pointermove', mm(200))
        assert.throws(() => t.win.dispatch('pointerup', mu()), /consumer boom/)
        boom = false
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should stay silent when clear is called inside a listener`, function() {
        //監聽器內呼叫clear為合法用法(如拖曳至某處即銷毀元件)
        for (let name of ['pressBar', 'dragBar', 'freeBar']) {
            let t = mk({ useTouchDragForPanel: false })
            t.das.on(name, () => {
                t.das.clear()
            })
            let r = () => {
                t.bar.dispatch('pointerdown', md(130))
                t.win.dispatch('pointermove', mm(200))
                t.win.dispatch('pointerup', mu())
                t.bar.dispatch('pointerdown', md(140))
            }
            assert.doesNotThrow(r, name)
            let exp = { pressBar: ['press:130'], dragBar: ['press:130', 'drag:200'], freeBar: ['press:130', 'drag:200', 'free'] }
            assert.strict.deepStrictEqual(t.seq, exp[name], name)
            assert.strict.deepStrictEqual([t.panel.nListeners(), t.bar.nListeners(), t.win.nListeners()], [0, 0, 0], name)
        }
    })

    it(`should not emit pressBar when clear is called by the freeBar listener of a take over`, function() {
        //d3 接手時先補發freeBar再發pressBar; 若freeBar之監聽器已呼叫clear, 不得再發pressBar
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.das.on('freeBar', () => {
            t.das.clear()
        })
        t.bar.dispatch('pointerdown', md(140))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    //--- 選項與清理 ---

    it(`should work without the opt argument`, function() {
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document', win)
        let panel = new Ele('panel', globalThis.document)
        let bar = new Ele('bar', panel)
        let seq = []
        let das = domDragBarAndScroll(panel, bar)
        das.on('pressBar', (d) => seq.push(`press:${d.clientX}`))
        panel.dispatch('pointerdown', td(1, 300))
        assert.strict.deepStrictEqual(seq, ['press:-300'])
    })

    it(`should fall back to a ratio of one when the ratio getters are not functions`, function() {
        //c7
        let t = mk({ getHeighRatio: 'x', getWidthRatio: null })
        t.panel.dispatch('pointerdown', td(1, 300, true, 200))
        assert.strict.deepStrictEqual(t.full, [['pressBar', { clientY: -200, clientX: -300, pointerType: 'touch' }]])
    })

    it(`should fall back to the default when a flag is not a boolean`, function() {
        //c7 useTouchDragForPanel預設true, 兩個stop旗標預設false
        let t = mk({ useTouchDragForPanel: 'no', stopTouchDragPropagationForPanel: 1, stopScrollPropagationForPanel: 'yes' })
        t.panel.dispatch('pointerdown', td(1, 300))
        let e1 = t.panel.dispatch('touchstart', {})
        let e2 = t.panel.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'scroll:-1/1'])
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    it(`should cancel the panel touch propagation only when asked`, function() {
        //c6 stopTouchDragPropagationForPanel
        let a = mk({ stopTouchDragPropagationForPanel: false })
        a.panel.dispatch('pointerdown', td(1, 300))
        let e1 = a.panel.dispatch('touchstart', {})
        let b = mk({ stopTouchDragPropagationForPanel: true })
        b.panel.dispatch('pointerdown', td(1, 300))
        let e2 = b.panel.dispatch('touchstart', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, true])
    })

    it(`should cancel the window mouseup only for the release of a lock and when stopScrollPropagationForPanel is set`, function() {
        //c6 pointerup早於相容之mouseup, 故於pointerup解鎖時記下待辦, 由緊接之mouseup消費; 未上鎖之mouseup不擋
        let run = (opt) => {
            let t = mk(opt)
            let e1 = t.win.dispatch('mouseup', {})
            t.bar.dispatch('pointerdown', md(130))
            t.win.dispatch('pointerup', mu())
            let e2 = t.win.dispatch('mouseup', {})
            let e3 = t.win.dispatch('mouseup', {})
            return [e1.defaultPrevented, e2.defaultPrevented, e3.defaultPrevented]
        }
        assert.strict.deepStrictEqual(run({}), [false, false, false])
        assert.strict.deepStrictEqual(run({ stopScrollPropagationForPanel: true }), [false, true, false])
    })

    it(`should not cancel a mouseup after a lock freed by self healing or by a touch`, function() {
        //待辦只由放開事件設定; 自癒與觸控之放開不設
        let t = mk({ stopScrollPropagationForPanel: true })
        t.bar.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(200, 0))
        let e1 = t.win.dispatch('mouseup', {})
        t.bar.dispatch('pointerdown', td(1, 130))
        t.win.dispatch('pointerup', tu(1))
        let e2 = t.win.dispatch('mouseup', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    it(`should cancel the mouseup after a pen lock is released, since a pen fires compatibility mouse events too`, function() {
        //觸控筆與滑鼠同樣於pointerup後緊接相容mouseup(真瀏覽器實測), 待辦須對非觸控設定; 觸控之相容mouse事件於touchend後才補發, 見上一案
        let t = mk({ stopScrollPropagationForPanel: true })
        t.bar.dispatch('pointerdown', { ...td(1, 130), pointerType: 'pen' })
        t.win.dispatch('pointerup', { ...tu(1), pointerType: 'pen' })
        let e1 = t.win.dispatch('mouseup', {})
        let e2 = t.win.dispatch('mouseup', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [true, false])
    })

    it(`should register only the listeners it needs`, function() {
        //c2 原語掛於bar與panel(pointerdown、contextmenu)與window(capture階段); 非被動之touchmove恆掛於bar, useTouchDragForPanel為true時另掛於panel(兩者皆與舊模型相同),
        //   為false時panel不得平白多一個scroll-blocking監聽(八個現役呼叫點皆如此); panel之touchstart/touchend/touchcancel墊片與window之mouseup墊片僅旗標為true時掛
        let t1 = mk({})
        assert.strict.deepStrictEqual(t1.panel.types(), ['contextmenu', 'pointerdown', 'touchmove', 'wheel'])
        assert.strict.deepStrictEqual(t1.bar.types(), ['contextmenu', 'pointerdown', 'touchmove'])
        assert.strict.deepStrictEqual(t1.win.types(), ['pointercancel', 'pointermove', 'pointerup'])
        assert.strict.deepStrictEqual(t1.doc.types(), [])
        assert.strict.deepStrictEqual([t1.panel.nListeners(), t1.bar.nListeners(), t1.win.nListeners(), t1.doc.nListeners()], [4, 3, 3, 0])
        let t2 = mk({ useTouchDragForPanel: false })
        assert.strict.deepStrictEqual([t2.panel.types(), t2.bar.types(), t2.win.types()], [['contextmenu', 'pointerdown', 'wheel'], ['contextmenu', 'pointerdown', 'touchmove'], ['pointercancel', 'pointermove', 'pointerup']])
        assert.strict.deepStrictEqual([t2.panel.nListeners(), t2.bar.nListeners(), t2.win.nListeners(), t2.doc.nListeners()], [3, 3, 3, 0])
        let t3 = mk({ stopTouchDragPropagationForPanel: true, stopScrollPropagationForPanel: true })
        assert.strict.deepStrictEqual(t3.panel.types(), ['contextmenu', 'pointerdown', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'wheel'])
        assert.strict.deepStrictEqual(t3.win.types(), ['mouseup', 'pointercancel', 'pointermove', 'pointerup'])
        let t4 = mk({ useTouchDragForPanel: false, stopTouchDragPropagationForPanel: true })
        assert.strict.deepStrictEqual([t4.panel.types(), t4.bar.types()], [['contextmenu', 'pointerdown', 'wheel'], ['contextmenu', 'pointerdown', 'touchmove']])
    })

    it(`should register the touchmove listeners as non passive and the window listeners in the capture phase`, function() {
        let b = mk({})
        let ps = [b.bar.hs.touchmove, b.panel.hs.touchmove].map((hs) => hs.map((h) => h.opts && h.opts.passive))
        assert.strict.deepStrictEqual(ps, [[false], [false]])
        let cs = ['pointermove', 'pointerup', 'pointercancel'].map((k) => b.win.hs[k].map((h) => h.opts && h.opts.capture))
        assert.strict.deepStrictEqual(cs, [[true], [true], [true]])
    })

    it(`should work when the bar is not a descendant of the panel`, function() {
        //bar不在panel內時各自收取起手事件, 契約與舊模型相同
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document', win)
        let panel = new Ele('panel', globalThis.document)
        let bar = new Ele('bar', globalThis.document)
        let seq = []
        let das = domDragBarAndScroll(panel, bar)
        das.on('pressBar', (d) => seq.push(`press:${d.clientX}`))
        das.on('dragBar', (d) => seq.push(`drag:${d.clientX}`))
        das.on('freeBar', () => seq.push('free'))
        bar.dispatch('pointerdown', md(130))
        win.dispatch('pointermove', mm(200))
        win.dispatch('pointerup', mu())
        bar.dispatch('pointerdown', td(1, 140))
        let e = bar.dispatch('touchmove', {})
        bar.dispatch('pointerup', tu(1))
        panel.dispatch('pointerdown', td(2, 300))
        panel.dispatch('pointerup', tu(2))
        assert.strict.deepStrictEqual(seq, ['press:130', 'drag:200', 'free', 'press:140', 'free', 'press:-300', 'free'])
        assert.strict.deepStrictEqual(e.defaultPrevented, true)
    })

    it(`should not leave a pending touchstart after a pen press on the panel`, function() {
        //觸控筆不產生相容touch事件, 若於pen按下時記下待辦, 會誤擋下一次他指之touchstart
        let t = mk({ stopTouchDragPropagationForPanel: true })
        t.panel.dispatch('pointerdown', { ...td(1, 300), pointerType: 'pen' })
        t.panel.dispatch('pointerdown', td(2, 100, false)) //他指落下, 被忽略
        let e = t.panel.dispatch('touchstart', {})
        assert.strict.deepStrictEqual(e.defaultPrevented, false)
    })

    it(`should consume the pending touchend with a touchcancel after a pointercancel`, function() {
        //pointercancel之後接的是touchcancel而非touchend, 待辦須由它消費, 否則殘留至下一次無關之touchend
        let t = mk({ stopTouchDragPropagationForPanel: true })
        t.panel.dispatch('pointerdown', td(1, 300))
        t.panel.dispatch('touchstart', {})
        t.panel.dispatch('pointercancel', tu(1))
        let e1 = t.panel.dispatch('touchcancel', {})
        let e2 = t.panel.dispatch('touchend', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [true, false])
    })

    it(`should remove every listener it registered`, function() {
        //c2 add與clear對稱
        for (let opt of [{}, { useTouchDragForPanel: false }, { stopTouchDragPropagationForPanel: true }, { stopScrollPropagationForPanel: true }]) {
            let t = mk(opt)
            t.das.clear()
            assert.strict.deepStrictEqual([t.panel.nListeners(), t.bar.nListeners(), t.win.nListeners(), t.doc.nListeners()], [0, 0, 0, 0], JSON.stringify(opt))
        }
    })

    it(`should stop emitting after clear, even when called mid drag`, function() {
        //a9、c1 拖曳中clear須停止且狀態歸零
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('pointerdown', md(130))
        t.das.clear()
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should not throw when clear is called twice`, function() {
        let t = mk({ useTouchDragForPanel: false })
        assert.doesNotThrow(() => {
            t.das.clear()
            t.das.clear()
        })
    })

    it(`should keep two instances on the same panel independent`, function() {
        //c8 兩實例之鎖互不干擾, 清理其一不影響另一; 但滾輪會各發一次, 屬已知限制
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document', win)
        let panel = new Ele('panel', globalThis.document)
        let bar1 = new Ele('bar1', panel)
        let bar2 = new Ele('bar2', panel)
        let s1 = []
        let s2 = []
        let d1 = domDragBarAndScroll(panel, bar1, { useTouchDragForPanel: false })
        let d2 = domDragBarAndScroll(panel, bar2, { useTouchDragForPanel: false })
        d1.on('dragBar', (d) => s1.push(d.clientX))
        d2.on('dragBar', (d) => s2.push(d.clientX))
        d1.on('scrollPanel', () => s1.push('scroll'))
        d2.on('scrollPanel', () => s2.push('scroll'))
        bar1.dispatch('pointerdown', md(100))
        win.dispatch('pointermove', mm(200))
        bar2.dispatch('pointerdown', td(1, 50))
        bar2.dispatch('pointermove', tm(1, 60))
        panel.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        d1.clear()
        win.dispatch('pointermove', mm(300))
        bar2.dispatch('pointermove', tm(1, 70))
        assert.strict.deepStrictEqual([s1, s2], [[200, 'scroll'], [60, 'scroll', 70]])
    })

    //--- 不變式 ---

    it(`should keep pressBar and freeBar paired for any sequence of events, and never end up stuck`, function() {
        //以固定種子之亂數產生事件序列, 不論序列是否為實際裝置所能產生, 皆須滿足:
        //  (1) pressBar與freeBar嚴格交替且由pressBar起頭, dragBar只出現於兩者之間
        //  (2) 任何狀態下, 一次完整之滑鼠主鍵手勢必被完整服務
        //  (3) 非滑鼠上鎖之任何狀態下, 一次完整之新的primary觸控手勢必被完整服務
        let seed = 20260922
        let rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0
            let v = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v
            return ((v ^ (v >>> 14)) >>> 0) / 4294967296
        }
        let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
        let ids = [0, 1, 2]
        let rndX = () => Math.floor(rnd() * 400)
        let acts = [
            (t) => t.bar.dispatch('pointerdown', md(rndX(), { button: pick([0, 0, 0, 1, 2]) })),
            (t) => t.bar.dispatch('pointerup', mu()),
            (t) => t.win.dispatch('pointerup', mu(pick([0, 2]))),
            (t) => t.win.dispatch('pointermove', mm(rndX(), pick([0, 1, 1, 1]))),
            (t) => pick([t.bar, t.panel]).dispatch('pointerdown', td(pick(ids), rndX(), pick([true, false]))),
            (t) => pick([t.bar, t.panel]).dispatch('pointermove', tm(pick(ids), rndX())),
            (t) => pick([t.bar, t.panel]).dispatch('pointerup', tu(pick(ids))),
            (t) => pick([t.bar, t.panel]).dispatch('pointercancel', pick([tu(pick(ids)), {}])),
            (t) => pick([t.bar, t.panel]).dispatch('touchmove', {}),
            (t) => t.panel.dispatch('wheel', { deltaY: pick([-120, 0, 120]), deltaX: pick([-60, 0, 60]) }),
        ]
        let checkStream = (seq, tag) => {
            let pressed = false
            seq.forEach((v, i) => {
                let k = v.split(':')[0]
                if (k === 'press') {
                    assert.strict.deepStrictEqual(pressed, false, `${tag}: pressBar while pressed at ${i}: ${seq.join(' ')}`)
                    pressed = true
                }
                else if (k === 'free') {
                    assert.strict.deepStrictEqual(pressed, true, `${tag}: freeBar while not pressed at ${i}: ${seq.join(' ')}`)
                    pressed = false
                }
                else if (k === 'drag') {
                    assert.strict.deepStrictEqual(pressed, true, `${tag}: dragBar while not pressed at ${i}: ${seq.join(' ')}`)
                }
            })
            return pressed
        }
        let kinds = (seq) => seq.map((v) => v.split(':')[0]).join(',')
        for (let opt of [{}, { useTouchDragForPanel: false }]) {
            for (let k = 0; k < 300; k++) {
                let tag = `opt=${JSON.stringify(opt)} run=${k}`
                let t = mk(opt)
                for (let i = 0; i < 25; i++) {
                    pick(acts)(t)
                }

                //(1)
                let pressed = checkStream(t.seq, tag)

                //(3), 新手指之pointerId為9, 不與序列內者重複, 且為primary
                if (probeState(t).indexOf('barMouse') < 0) {
                    let n = t.seq.length
                    t.bar.dispatch('pointerdown', td(9, 500, true))
                    t.bar.dispatch('pointermove', tm(9, 501))
                    t.bar.dispatch('pointerup', tu(9))
                    let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
                    assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: touch gesture`)
                    pressed = false
                }

                //(2)
                let n = t.seq.length
                t.bar.dispatch('pointerdown', md(500))
                t.win.dispatch('pointermove', mm(501))
                t.win.dispatch('pointerup', mu())
                let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
                assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: mouse gesture`)

                //(1), 含收尾手勢
                checkStream(t.seq, tag)
            }
        }
    })

})
