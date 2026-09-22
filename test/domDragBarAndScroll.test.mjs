import assert from 'assert'
import domDragBarAndScroll from '../src/domDragBarAndScroll.mjs'


//本函數於建構時即存取window與document, nodejs無此二者, 故以假物件覆蓋全域再建構
//  假元素只記錄addEventListener之處理器, 由測試直接派發合成事件, 可精確斷言事件種類/次數/順序,
//  以及preventDefault與stopPropagation是否被呼叫, 這些於真瀏覽器只能間接觀察
//  bar為panel之子節點(六個消費端皆如此), 故dispatch會逐層往上跑以模擬冒泡
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


//tc, 建立假觸點
function tc(id, x, y = 0) {
    return { identifier: id, clientX: x, clientY: y }
}


//te, 建立假觸控事件之內容; touches為當前全部接觸點, changedTouches為本次變動者
function te(touches, changed) {
    return { touches, changedTouches: (changed !== undefined) ? changed : touches }
}


//mk, 建立一組panel/bar/window/document與das, 並記錄其發出之事件
//  seq只記clientX供比對事件序列, full記完整事件名與參數供比對座標內容
function mk(opt) {
    let win = new Ele('window')
    let doc = new Ele('document')
    globalThis.window = win
    globalThis.document = doc
    let panel = new Ele('panel')
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
//  於bar派發指定identifier之touchmove, 在barTouch時發絕對座標, 在panelTouch時(冒泡至panel)發縮放座標
function probeState(t) {
    let rs = []
    let n = t.seq.length
    t.win.dispatch('mousemove', { clientX: 77, buttons: 1 })
    if (t.seq.length > n) {
        rs.push('barMouse')
    }
    for (let id of [1, 2]) {
        n = t.seq.length
        t.bar.dispatch('touchmove', te([tc(id, 77)], [tc(id, 77)]))
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


//STATES, 狀態機之四個前置狀態; 起手指identifier為1, 起手座標10
let STATES = {
    idle: () => {},
    barMouse: (t) => {
        t.bar.dispatch('mousedown', { button: 0, clientX: 10 })
    },
    barTouch: (t) => {
        t.bar.dispatch('touchstart', te([tc(1, 10)]))
    },
    panelTouch: (t) => {
        t.panel.dispatch('touchstart', te([tc(1, 10)]))
    },
}
let STATE_LABEL = { idle: 'idle', barMouse: 'barMouse', barTouch: 'barTouch#1', panelTouch: 'panelTouch#1' }


//TOUCH_EVENTS, 觸控事件十一種, bar與panel共用同一組定義
//  起手指仍在者其touches含identifier=1, 已不在者不含; 同identifier再落下代表原起手指早已離開
let TOUCH_EVENTS = {
    'touchstart of another finger while the starting finger is still down': ['touchstart', te([tc(1, 10), tc(2, 20)], [tc(2, 20)])],
    'touchstart of another finger after the starting finger is gone': ['touchstart', te([tc(2, 20)], [tc(2, 20)])],
    'touchstart reusing the identifier of the starting finger': ['touchstart', te([tc(1, 20)], [tc(1, 20)])],
    'touchstart without any touch point': ['touchstart', te([], [])],
    'touchmove of the starting finger': ['touchmove', te([tc(1, 20)], [tc(1, 20)])],
    'touchmove of another finger': ['touchmove', te([tc(1, 10), tc(2, 20)], [tc(2, 20)])],
    'touchend of the starting finger': ['touchend', te([], [tc(1, 20)])],
    'touchend of another finger': ['touchend', te([tc(1, 10)], [tc(2, 20)])],
    'touchcancel of the starting finger': ['touchcancel', { ...te([], [tc(1, 20)]), cancelable: false }],
    'touchcancel of another finger': ['touchcancel', { ...te([tc(1, 10)], [tc(2, 20)]), cancelable: false }],
    'touchcancel without any touch point': ['touchcancel', { ...te([], []), cancelable: false }],
}


//TABLE, 狀態×事件之全表; 每格為'發出之事件序列|事件後之狀態', same表狀態不變
//  欄序為 idle, barMouse, barTouch, panelTouch
//  第二欄為函數者直接執行; 為'bar'或'panel'者, 以標題去掉該前綴後查TOUCH_EVENTS並派發於該元素
let S4 = (v) => [v, v, v, v]
let TAKE_OVER_BY_MOUSE = ['press:20|barMouse', 'free,press:20|barMouse', 'free,press:20|barMouse', 'free,press:20|barMouse']
let FREE_IF_LOCKED = ['|same', 'free|idle', 'free|idle', 'free|idle']
let TABLE = [

    //--- 滑鼠 ---
    ['bar mousedown with the primary button', (t) => t.bar.dispatch('mousedown', { button: 0, clientX: 20 }), TAKE_OVER_BY_MOUSE],
    ['bar mousedown without a button property', (t) => t.bar.dispatch('mousedown', { clientX: 20 }), TAKE_OVER_BY_MOUSE],
    ['bar mousedown with the middle button', (t) => t.bar.dispatch('mousedown', { button: 1, clientX: 20 }), S4('|same')],
    ['bar mousedown with the right button', (t) => t.bar.dispatch('mousedown', { button: 2, clientX: 20 }), S4('|same')],
    ['bar mouseup', (t) => t.bar.dispatch('mouseup', { button: 0 }), FREE_IF_LOCKED],
    ['window mouseup', (t) => t.win.dispatch('mouseup', { button: 0 }), FREE_IF_LOCKED],
    ['window mouseup of the right button', (t) => t.win.dispatch('mouseup', { button: 2 }), FREE_IF_LOCKED],
    ['window mousemove with a button held', (t) => t.win.dispatch('mousemove', { clientX: 20, buttons: 1 }),
        ['|same', 'drag:20|same', '|same', '|same']],
    ['window mousemove without a buttons property', (t) => t.win.dispatch('mousemove', { clientX: 20 }),
        ['|same', 'drag:20|same', '|same', '|same']],
    ['window mousemove with no button held', (t) => t.win.dispatch('mousemove', { clientX: 20, buttons: 0 }),
        ['|same', 'free|idle', '|same', '|same']],

    //--- bar 觸控(事件派發於bar, 會冒泡至panel) ---
    ['bar touchstart of another finger while the starting finger is still down', 'bar',
        ['press:20|barTouch#2', '|same', '|same', '|same']],
    ['bar touchstart of another finger after the starting finger is gone', 'bar',
        ['press:20|barTouch#2', '|same', 'free,press:20|barTouch#2', 'free,press:20|barTouch#2']],
    ['bar touchstart reusing the identifier of the starting finger', 'bar',
        ['press:20|barTouch#1', '|same', 'free,press:20|barTouch#1', 'free,press:20|barTouch#1']],
    ['bar touchstart without any touch point', 'bar', S4('|same')],
    ['bar touchmove of the starting finger', 'bar',
        ['|same', '|same', 'drag:20|same', 'drag:-20|same']],
    ['bar touchmove of another finger', 'bar', S4('|same')],
    ['bar touchend of the starting finger', 'bar',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['bar touchend of another finger', 'bar', S4('|same')],
    ['bar touchcancel of the starting finger', 'bar',
        ['|same', '|same', 'free|idle', 'free|idle']],
    ['bar touchcancel of another finger', 'bar', S4('|same')],
    ['bar touchcancel without any touch point', 'bar',
        ['|same', '|same', 'free|idle', 'free|idle']],

    //--- panel 觸控(事件派發於panel, 不經bar) ---
    ['panel touchstart of another finger while the starting finger is still down', 'panel',
        ['press:-20|panelTouch#2', '|same', '|same', '|same']],
    ['panel touchstart of another finger after the starting finger is gone', 'panel',
        ['press:-20|panelTouch#2', '|same', 'free,press:-20|panelTouch#2', 'free,press:-20|panelTouch#2']],
    ['panel touchstart reusing the identifier of the starting finger', 'panel',
        ['press:-20|panelTouch#1', '|same', 'free,press:-20|panelTouch#1', 'free,press:-20|panelTouch#1']],
    ['panel touchstart without any touch point', 'panel', S4('|same')],
    ['panel touchmove of the starting finger', 'panel',
        ['|same', '|same', '|same', 'drag:-20|same']],
    ['panel touchmove of another finger', 'panel', S4('|same')],
    ['panel touchend of the starting finger', 'panel',
        ['|same', '|same', '|same', 'free|idle']],
    ['panel touchend of another finger', 'panel', S4('|same')],
    ['panel touchcancel of the starting finger', 'panel',
        ['|same', '|same', '|same', 'free|idle']],
    ['panel touchcancel of another finger', 'panel', S4('|same')],
    ['panel touchcancel without any touch point', 'panel',
        ['|same', '|same', '|same', 'free|idle']],

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
        //c4 現有八個呼叫點皆傳false, 此時panel之觸控事件一律不得影響任何狀態
        for (let name of Object.keys(TOUCH_EVENTS)) {
            for (let state of ['idle', 'barMouse', 'barTouch']) {
                let exp = `|${STATE_LABEL[state]}`
                it(`should handle [${state}] x [panel ${name}] as [${exp}]`, function() {
                    assert.strict.deepStrictEqual(runCell({ useTouchDragForPanel: false }, state, { on: 'panel', name }), exp)
                })
            }
        }
    })

    //--- 滑鼠通道 ---

    it(`should emit pressBar, dragBar and freeBar for a primary button drag`, function() {
        //a1 基準路徑
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.win.dispatch('mousemove', { clientX: 250, buttons: 1 })
        t.win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'drag:300', 'free'])
    })

    it(`should ignore the middle and right button on mousedown`, function() {
        //a2、a3 中鍵與右鍵不得上鎖
        for (let button of [1, 2]) {
            let t = mk({ useTouchDragForPanel: false })
            t.bar.dispatch('mousedown', { button, clientX: 130 })
            t.win.dispatch('mousemove', { clientX: 300, buttons: 4 })
            assert.strict.deepStrictEqual(t.seq, [], `button=${button}`)
        }
    })

    it(`should still lock for a synthetic event without a button property`, function() {
        //n12 合成事件之button為undefined, 以'button' in e判定故維持原本可上鎖之行為
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { clientX: 130 })
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should unlock itself when a mousemove arrives with no button held`, function() {
        //a5 拖出瀏覽器視窗外放開後收不到mouseup, 回到視窗內移動時自癒
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.win.dispatch('mousemove', { clientX: 250, buttons: 1 })
        t.win.dispatch('mousemove', { clientX: 330, buttons: 0 })
        t.win.dispatch('mousemove', { clientX: 400, buttons: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'free'])
    })

    it(`should unlock on mouseup from any button, as a last resort rescue`, function() {
        //a4 刻意不判按鍵, 與split.js及MUI之終止側一致
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.win.dispatch('mouseup', { button: 2 })
        t.win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should unlock on a mouseup received by the bar itself`, function() {
        //a7 嵌入panel攔截mouseup時window收不到, 故bar自身亦須解鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.bar.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should emit exactly one freeBar per lock`, function() {
        //契約: 一次上鎖只對應一次freeBar
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.bar.dispatch('mouseup', { button: 0 })
        t.win.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq.filter((v) => v === 'free').length, 1)
    })

    it(`should close the stale lock before a new mousedown takes over`, function() {
        //d3 mouseup遺失且其間無mousemove時, 再次按下主鍵代表前一把鎖必為殘留; 先補發freeBar再發pressBar, 使兩者恆成對
        //   對標jQuery UI之_mouseDown:「We may have missed mouseup (out of window)」即先呼叫_mouseUp再重新開始
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.bar.dispatch('mousedown', { button: 0, clientX: 140 })
        t.win.dispatch('mousemove', { clientX: 200, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should let the mouse take over a touch lock, closing it first`, function() {
        //d3 滑鼠為觸控通道遺失touchend時之救援通道, 主鍵按下即接手; 被接手之觸控其後續事件不再作用
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.bar.dispatch('mousedown', { button: 0, clientX: 140 })
        t.bar.dispatch('touchmove', te([tc(1, 200)]))
        t.win.dispatch('mousemove', { clientX: 210, buttons: 1 })
        t.bar.dispatch('touchend', te([], [tc(1, 200)]))
        t.win.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:210', 'free'])
    })

    it(`should ignore a touch that lands while a mouse drag is in progress`, function() {
        //d3 滑鼠之鎖無從由觸控事件驗證是否殘留, 視為有效; 其自有buttons自癒與mouseup
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.bar.dispatch('touchstart', te([tc(1, 140)]))
        t.bar.dispatch('touchmove', te([tc(1, 200)]))
        t.bar.dispatch('touchend', te([], [tc(1, 200)]))
        t.win.dispatch('mousemove', { clientX: 210, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
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
        //n8 一般滑鼠滾輪之deltaX恆為0, 該軸方向須為0而非NaN, 否則消費端以其累加位置時會得到NaN
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
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.bar.dispatch('touchmove', te([tc(1, 200)]))
        t.bar.dispatch('touchend', te([], [tc(1, 200)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should work when the first finger identifier is zero`, function() {
        //N5 Chrome之第一指identifier常為0, 判定須嚴格比null而非以真值判斷
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(0, 130)]))
        t.bar.dispatch('touchmove', te([tc(0, 200)]))
        t.bar.dispatch('touchend', te([], [tc(0, 200)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should track a starting finger whose identifier is zero against other fingers`, function() {
        //N5 起手指identifier為0時仍須以identifier追蹤, 不可因0為假值而退回「取第一點、任一指放開皆解鎖」
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(0, 115)], [tc(0, 115)]))
        t.bar.dispatch('touchstart', te([tc(0, 115), tc(1, 300)], [tc(1, 300)]))
        t.bar.dispatch('touchmove', te([tc(0, 115), tc(1, 360)], [tc(1, 360)]))
        t.bar.dispatch('touchend', te([tc(0, 115)], [tc(1, 360)]))
        t.bar.dispatch('touchmove', te([tc(0, 160)], [tc(0, 160)]))
        t.bar.dispatch('touchend', te([], [tc(0, 160)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160', 'free'])
    })

    it(`should unlock on touchcancel without emitting a position`, function() {
        //b2 手勢被系統中斷, 座標不可信故只解鎖不定值
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.bar.dispatch('touchmove', te([tc(1, 200)]))
        t.bar.dispatch('touchcancel', te([], [tc(1, 200)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should not re-anchor when a second finger lands`, function() {
        //b4 第二指落下不得重新定錨
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        t.bar.dispatch('touchstart', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115'])
    })

    it(`should ignore a move of a finger other than the one that started the drag`, function() {
        //b5 第二指移動不得搶值
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        t.bar.dispatch('touchstart', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        t.bar.dispatch('touchmove', te([tc(1, 115), tc(2, 360)], [tc(2, 360)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115'])
    })

    it(`should not end the drag when a finger other than the starting one is lifted`, function() {
        //b7 非起手指抬起不得終止拖曳
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        t.bar.dispatch('touchstart', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        t.bar.dispatch('touchend', te([tc(1, 115)], [tc(2, 300)]))
        t.bar.dispatch('touchmove', te([tc(1, 160)], [tc(1, 160)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160'])
    })

    it(`should end the drag when the starting finger is lifted`, function() {
        //b6
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        t.bar.dispatch('touchstart', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        t.bar.dispatch('touchend', te([tc(2, 300)], [tc(1, 115)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'free'])
    })

    it(`should not end the drag when only another finger is cancelled`, function() {
        //n6 touchcancel須比對起手指
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        t.bar.dispatch('touchstart', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        t.bar.dispatch('touchcancel', te([tc(1, 115)], [tc(2, 300)]))
        t.bar.dispatch('touchmove', te([tc(1, 160)], [tc(1, 160)]))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160'])
    })

    it(`should unlock on a touchcancel that carries no changed touches`, function() {
        //n13 無資訊時採安全側, 寧可解鎖也不留殘鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.bar.dispatch('touchcancel', te([], []))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    it(`should not throw when touchstart carries no touch point`, function() {
        //b8 僅合成事件可達, 但取值防護須與panel通道對稱
        let t = mk({ useTouchDragForPanel: false })
        let r = () => {
            t.bar.dispatch('touchstart', te([], []))
            t.bar.dispatch('touchstart', {})
        }
        assert.doesNotThrow(r)
        assert.strict.deepStrictEqual(t.seq, [])
    })

    it(`should cancel the default action even for a move of another finger`, function() {
        //R2 擋預設行為須先於起手指判定, 否則第二指移動時頁面可被捲動
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 115)], [tc(1, 115)]))
        let e = t.bar.dispatch('touchmove', te([tc(1, 115), tc(2, 300)], [tc(2, 300)]))
        assert.strict.deepStrictEqual([e.defaultPrevented, e.propagationStopped], [true, true])
    })

    it(`should cancel only the touchmove of the bar, never its touchstart or touchend`, function() {
        //c6 bar之touchstart與touchend不擋預設行為, 否則輕點bar後瀏覽器不再產生click
        let t = mk({ useTouchDragForPanel: false })
        let e1 = t.bar.dispatch('touchstart', te([tc(1, 130)]))
        let e2 = t.bar.dispatch('touchmove', te([tc(1, 200)]))
        let e3 = t.bar.dispatch('touchend', te([], [tc(1, 200)]))
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented, e3.defaultPrevented], [false, true, false])
    })

    it(`should not cancel a bar touchmove while the bar touch channel is not the one locked`, function() {
        //未上鎖或由他通道上鎖時, bar之touchmove不得擋預設行為, 否則bar上起手之一般頁面捲動會失效
        let t = mk({ useTouchDragForPanel: false })
        let e1 = t.bar.dispatch('touchmove', te([tc(1, 200)]))
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        let e2 = t.bar.dispatch('touchmove', te([tc(1, 200)]))
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    //--- 殘鎖之復原 ---

    it(`should recover from a lost touchend on the next touch, identifiers not reused`, function() {
        //d1 起手元素於拖曳途中被移出DOM時(消費端重繪bar之內容), 其後之touchmove與touchend不再冒泡至bar, 鎖即殘留
        //   iOS之identifier不重用; 下一次touchstart時起手指已不在touches內, 須視為殘鎖而先補發freeBar再重新上鎖
        //   對標: jQuery UI先收尾再重新開始, split.js與MUI直接重新定錨, 三者皆不會就此失效
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(5, 130)]))
        t.bar.dispatch('touchmove', te([tc(5, 150)]))
        t.bar.dispatch('touchstart', te([tc(7, 140)]))
        t.bar.dispatch('touchmove', te([tc(7, 200)]))
        t.bar.dispatch('touchend', te([], [tc(7, 200)]))
        t.bar.dispatch('touchstart', te([tc(9, 140)]))
        t.bar.dispatch('touchmove', te([tc(9, 260)]))
        t.bar.dispatch('touchend', te([], [tc(9, 260)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:150', 'free', 'press:140', 'drag:200', 'free', 'press:140', 'drag:260', 'free'])
    })

    it(`should recover from a lost touchend on the next touch, identifiers reused`, function() {
        //d1 Chrome與Firefox之identifier自0起重用; 新落下之手指與起手指同identifier, 代表原起手指早已離開
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(0, 130)]))
        t.bar.dispatch('touchmove', te([tc(0, 150)]))
        t.bar.dispatch('touchstart', te([tc(0, 140)]))
        t.bar.dispatch('touchmove', te([tc(0, 200)]))
        t.bar.dispatch('touchend', te([], [tc(0, 200)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:150', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should recover from a lost touchend in the panel touch channel too`, function() {
        //d1 panel通道之起手元素為panel內任一子元素, 捲動面板重繪內容時更容易遇到
        let t = mk({})
        t.panel.dispatch('touchstart', te([tc(5, 300)]))
        t.panel.dispatch('touchstart', te([tc(7, 280)]))
        t.panel.dispatch('touchmove', te([tc(7, 240)]))
        t.panel.dispatch('touchend', te([], [tc(7, 240)]))
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'free', 'press:-280', 'drag:-240', 'free'])
    })

    it(`should recover a stale bar touch lock through a touch on the panel`, function() {
        //d1 殘鎖來自bar通道, 下一次觸控落在panel非bar處
        let t = mk({})
        t.bar.dispatch('touchstart', te([tc(5, 130)]))
        t.panel.dispatch('touchstart', te([tc(7, 280)]))
        t.panel.dispatch('touchmove', te([tc(7, 240)]))
        t.panel.dispatch('touchend', te([], [tc(7, 240)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:-280', 'drag:-240', 'free'])
    })

    //--- 觸點資訊不完整之合成事件 ---

    it(`should serve touch events that carry only touches, without identifier`, function() {
        //d2 測試工具常見之合成事件只帶touches, 無changedTouches亦無identifier; 無從比對時沿用原本取第一點、任一touchend皆解鎖之行為
        //   與滑鼠通道保留無button屬性之合成事件(n12)對稱
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { touches: [{ clientX: 130, clientY: 0 }] })
        t.bar.dispatch('touchmove', { touches: [{ clientX: 200, clientY: 0 }] })
        t.bar.dispatch('touchend', { touches: [] })
        t.bar.dispatch('touchstart', { touches: [{ clientX: 140, clientY: 0 }] })
        t.bar.dispatch('touchmove', { touches: [{ clientX: 220, clientY: 0 }] })
        t.bar.dispatch('touchend', { touches: [] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free', 'press:140', 'drag:220', 'free'])
    })

    it(`should serve touch events that carry only touches, with identifier`, function() {
        //d2 無changedTouches時退而自touches取起手指; touchend時起手指已不在touches內即為放開
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { touches: [tc(1, 130)] })
        t.bar.dispatch('touchmove', { touches: [tc(1, 200), tc(2, 300)] })
        t.bar.dispatch('touchend', { touches: [tc(1, 200)] })
        t.bar.dispatch('touchmove', { touches: [tc(1, 210)] })
        t.bar.dispatch('touchend', { touches: [] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'drag:210', 'free'])
    })

    it(`should serve touch events that carry only changedTouches`, function() {
        //d2 另一類合成事件只帶changedTouches
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { changedTouches: [tc(1, 130)] })
        t.bar.dispatch('touchmove', { changedTouches: [tc(1, 200)] })
        t.bar.dispatch('touchend', { changedTouches: [tc(1, 200)] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should serve touch events that carry only changedTouches, without identifier`, function() {
        //d2 無identifier時無從比對, 任一touchend皆解鎖; 不可因changedTouches內找不到identifier而永不解鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { changedTouches: [{ clientX: 130, clientY: 0 }] })
        t.bar.dispatch('touchmove', { changedTouches: [{ clientX: 200, clientY: 0 }] })
        t.bar.dispatch('touchend', { changedTouches: [{ clientX: 200, clientY: 0 }] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free']) //freeBar須發於touchend當下, 而非等到下一次touchstart接手時才補發
        t.bar.dispatch('touchstart', { changedTouches: [{ clientX: 140, clientY: 0 }] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free', 'press:140'])
    })

    it(`should fall back to touches when changedTouches is present but empty`, function() {
        //d2 以new TouchEvent合成而只給touches時, changedTouches為空清單而非undefined, 同樣須退而取touches
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { touches: [tc(1, 130)], changedTouches: [] })
        t.bar.dispatch('touchmove', { touches: [tc(1, 200)], changedTouches: [] })
        t.bar.dispatch('touchend', { touches: [], changedTouches: [] })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should unlock on a touchend that carries no touch information at all`, function() {
        //d2 無任何觸點資訊時採安全側, 寧可解鎖也不留殘鎖, 與touchcancel同一原則
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.bar.dispatch('touchend', {})
        t.bar.dispatch('touchstart', te([tc(2, 140)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140'])
    })

    it(`should not keep a lock it cannot prove alive when a touchstart carries no touches`, function() {
        //d2 touchstart未帶touches即無從驗證起手指是否仍在, 採安全側視為殘鎖
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', { changedTouches: [tc(1, 115)] })
        t.bar.dispatch('touchstart', { changedTouches: [tc(2, 300)] })
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'free', 'press:300'])
    })

    it(`should serve incomplete touch events in the panel touch channel too`, function() {
        //d2 bar與panel共用同一組取點規則
        let t = mk({})
        t.panel.dispatch('touchstart', { touches: [{ clientX: 300, clientY: 0 }] })
        t.panel.dispatch('touchmove', { touches: [{ clientX: 260, clientY: 0 }] })
        t.panel.dispatch('touchend', { touches: [] })
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'drag:-260', 'free'])
    })

    //--- 通道互斥 ---

    it(`should emit pressBar once when a bar touch bubbles up to the panel`, function() {
        //n1 bar位於panel之內, 且useTouchDragForPanel預設為true; 冒泡不得造成第二次pressBar
        let t = mk({}) //不傳useTouchDragForPanel, 取其預設值true
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should serve a whole bar touch drag once when the panel touch channel is enabled`, function() {
        //n1、N1b 整段手勢皆只由bar通道服務; identifier重用時第二段手勢之touchstart亦不得因冒泡而被panel通道誤判為殘鎖
        let t = mk({})
        t.bar.dispatch('touchstart', te([tc(0, 130)]))
        t.bar.dispatch('touchmove', te([tc(0, 200)]))
        t.bar.dispatch('touchend', te([], [tc(0, 200)]))
        t.bar.dispatch('touchstart', te([tc(0, 140)]))
        t.bar.dispatch('touchmove', te([tc(0, 210)]))
        t.bar.dispatch('touchend', te([], [tc(0, 210)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free', 'press:140', 'drag:210', 'free'])
    })

    it(`should not let a bar touchmove reach the panel channel even when the event is not cancelable`, function() {
        //N1b 通道互斥須為顯式判定, 不可依賴domCancelEvent之stopPropagation副作用(事件不可取消時該副作用不會發生)
        let t = mk({})
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        let e = t.bar.dispatch('touchmove', { ...te([tc(1, 200)]), cancelable: false })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200'])
        assert.strict.deepStrictEqual([e.defaultPrevented, e.propagationStopped], [false, false])
    })

    it(`should not end a bar drag when another finger is lifted on the panel`, function() {
        //n4 第二指落在panel非bar處並抬起, 不得中斷bar之拖曳
        let t = mk({})
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.panel.dispatch('touchstart', te([tc(1, 130), tc(2, 300)], [tc(2, 300)]))
        t.panel.dispatch('touchend', te([tc(1, 130)], [tc(2, 300)]))
        t.bar.dispatch('touchmove', te([tc(1, 200)]))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200'])
    })

    it(`should not emit dragBar from mouse movement while a touch drag is in progress`, function() {
        //b12 觸控上鎖時不得以絕對座標發dragBar, 否則污染panel通道之縮放座標語義
        let t = mk({})
        t.panel.dispatch('touchstart', te([tc(1, 300)]))
        t.win.dispatch('mousemove', { clientX: 380, buttons: 0 })
        t.win.dispatch('mousemove', { clientX: 400, buttons: 1 })
        assert.strict.deepStrictEqual(t.seq, ['press:-300'])
    })

    it(`should keep the mouse channel working after a touch lock was cut short by a mouseup`, function() {
        //R1 回歸釘樁: 解鎖須全部狀態成套歸零, 否則殘留之identifier會讓滑鼠通道永久失效
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        t.win.dispatch('mouseup', { button: 0 })
        t.bar.dispatch('touchend', te([], [tc(1, 130)]))
        let n = t.seq.length
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.win.dispatch('mousemove', { clientX: 250, buttons: 1 })
        t.win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        assert.strict.deepStrictEqual(t.seq.slice(n), ['press:130', 'drag:250', 'drag:300'])
    })

    //--- panel 觸控通道 ---

    it(`should emit scaled coordinates for the panel touch channel`, function() {
        //座標語義: panel通道發經比例縮放之相對位移, 與bar通道之絕對座標不同
        let t = mk({ getHeighRatio: () => 0.5, getWidthRatio: () => 0.5 })
        t.panel.dispatch('touchstart', te([tc(1, 300, 200)]))
        t.panel.dispatch('touchmove', te([tc(1, 260, 180)]))
        t.panel.dispatch('touchend', te([], [tc(1, 260, 180)]))
        assert.strict.deepStrictEqual(t.seq, ['press:-150', 'drag:-130', 'free'])
    })

    it(`should ignore the panel touch channel when useTouchDragForPanel is false`, function() {
        //c4 現有八個呼叫點皆傳false
        let t = mk({ useTouchDragForPanel: false })
        t.panel.dispatch('touchstart', te([tc(1, 300)]))
        t.panel.dispatch('touchmove', te([tc(1, 260)]))
        t.panel.dispatch('touchend', te([], [tc(1, 260)]))
        assert.strict.deepStrictEqual(t.seq, [])
    })

    it(`should track the starting finger in the panel touch channel too`, function() {
        //b11 panel通道同樣以identifier鎖定
        let t = mk({})
        t.panel.dispatch('touchstart', te([tc(1, 300)], [tc(1, 300)]))
        t.panel.dispatch('touchmove', te([tc(1, 300), tc(2, 100)], [tc(2, 100)]))
        t.panel.dispatch('touchcancel', te([], []))
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'free'])
    })

    it(`should cancel the panel touch events only when stopTouchDragPropagationForPanel is set`, function() {
        //c6 旗標控制panel之touchstart、touchmove、touchend三者; 未上鎖時之touchmove與touchend一律不擋
        let run = (opt) => {
            let t = mk(opt)
            let e0 = t.panel.dispatch('touchmove', te([tc(1, 300)]))
            let e1 = t.panel.dispatch('touchstart', te([tc(1, 300)]))
            let e2 = t.panel.dispatch('touchmove', te([tc(1, 260)]))
            let e3 = t.panel.dispatch('touchmove', te([tc(1, 260), tc(2, 100)], [tc(2, 100)]))
            let e4 = t.panel.dispatch('touchend', te([], [tc(1, 260)]))
            let e5 = t.panel.dispatch('touchend', te([], [tc(1, 260)]))
            return [e0, e1, e2, e3, e4, e5].map((e) => e.defaultPrevented && e.propagationStopped)
        }
        assert.strict.deepStrictEqual(run({ stopTouchDragPropagationForPanel: false }), [false, false, false, false, false, false])
        assert.strict.deepStrictEqual(run({ stopTouchDragPropagationForPanel: true }), [false, true, true, true, true, false])
    })

    it(`should not cancel a panel touchstart that is ignored`, function() {
        //他指落下被忽略時不擋其預設行為, 與bar通道一致
        let t = mk({ stopTouchDragPropagationForPanel: true })
        t.panel.dispatch('touchstart', te([tc(1, 300)]))
        let e = t.panel.dispatch('touchstart', te([tc(1, 300), tc(2, 100)], [tc(2, 100)]))
        assert.strict.deepStrictEqual(e.defaultPrevented, false)
    })

    //--- 事件參數 ---

    it(`should emit both axes of the absolute coordinates for the bar channels`, function() {
        //bar之滑鼠與觸控通道皆發絕對座標, 兩軸皆須正確, 且不受比例函數影響; freeBar不帶參數
        let t = mk({ useTouchDragForPanel: false, getHeighRatio: () => 0.5, getWidthRatio: () => 0.25 })
        t.bar.dispatch('mousedown', { button: 0, clientX: 10, clientY: 11 })
        t.win.dispatch('mousemove', { clientX: 20, clientY: 21, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
        t.bar.dispatch('touchstart', te([tc(1, 30, 31)]))
        t.bar.dispatch('touchmove', te([tc(1, 40, 41)]))
        t.bar.dispatch('touchend', te([], [tc(1, 40, 41)]))
        assert.strict.deepStrictEqual(t.full, [
            ['pressBar', { clientY: 11, clientX: 10 }],
            ['dragBar', { clientY: 21, clientX: 20 }],
            ['freeBar'],
            ['pressBar', { clientY: 31, clientX: 30 }],
            ['dragBar', { clientY: 41, clientX: 40 }],
            ['freeBar'],
        ])
    })

    it(`should scale each axis by its own ratio for the panel touch channel`, function() {
        //clientY用getHeighRatio, clientX用getWidthRatio, 兩者不得互換
        let t = mk({ getHeighRatio: () => 0.5, getWidthRatio: () => 0.25 })
        t.panel.dispatch('touchstart', te([tc(1, 100, 200)]))
        t.panel.dispatch('touchmove', te([tc(1, 80, 160)]))
        t.panel.dispatch('touchend', te([], [tc(1, 80, 160)]))
        assert.strict.deepStrictEqual(t.full, [
            ['pressBar', { clientY: -100, clientX: -25 }],
            ['dragBar', { clientY: -80, clientX: -20 }],
            ['freeBar'],
        ])
    })

    it(`should read the ratios at the moment of each event`, function() {
        //比例由外部函數提供, 係因組件或內容物尺寸會變動, 故每次發事件皆須重新取值
        let r = 1
        let t = mk({ getHeighRatio: () => r, getWidthRatio: () => r })
        t.panel.dispatch('touchstart', te([tc(1, 100, 100)]))
        r = 0.5
        t.panel.dispatch('touchmove', te([tc(1, 100, 100)]))
        assert.strict.deepStrictEqual(t.seq, ['press:-100', 'drag:-50'])
    })

    //--- 監聽器拋錯與重入 ---

    it(`should cancel the default action even when a listener throws`, function() {
        //N3a 擋預設行為須先於emit, 否則消費端拋錯時拖曳中頁面可被捲動
        let t = mk({ useTouchDragForPanel: false })
        t.das.on('dragBar', () => {
            throw new Error('consumer boom')
        })
        t.bar.dispatch('touchstart', te([tc(1, 130)]))
        let r = () => {
            t.bar.dispatch('touchmove', te([tc(1, 200)]))
        }
        assert.throws(r, /consumer boom/) //監聽器拋錯仍外拋至emit呼叫端, 與evem一致
        assert.strict.deepStrictEqual(t.bar.lastEvent.defaultPrevented, true)
    })

    it(`should cancel the panel events and the wheel even when a listener throws`, function() {
        //N3a 同一原則套用於全部會擋預設行為之處理器
        let t = mk({ stopTouchDragPropagationForPanel: true, stopScrollPropagationForPanel: true })
        for (let name of ['pressBar', 'dragBar', 'freeBar', 'scrollPanel']) {
            t.das.on(name, () => {
                throw new Error('consumer boom')
            })
        }
        let rs = []
        let run = (ele, type, init) => {
            assert.throws(() => ele.dispatch(type, init), /consumer boom/, type)
            rs.push(`${type}:${ele.lastEvent.defaultPrevented}`)
        }
        run(t.panel, 'touchstart', te([tc(1, 300)]))
        run(t.panel, 'touchmove', te([tc(1, 260)]))
        run(t.panel, 'touchend', te([], [tc(1, 260)]))
        run(t.panel, 'wheel', { deltaY: -120, deltaX: 0 })
        assert.throws(() => t.bar.dispatch('mousedown', { button: 0, clientX: 130 }), /consumer boom/)
        run(t.win, 'mouseup', { button: 0 })
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
        assert.throws(() => t.bar.dispatch('mousedown', { button: 0, clientX: 130 }), /consumer boom/)
        t.win.dispatch('mousemove', { clientX: 200, buttons: 1 })
        assert.throws(() => t.win.dispatch('mouseup', { button: 0 }), /consumer boom/)
        boom = false
        t.win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
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
                t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
                t.win.dispatch('mousemove', { clientX: 200, buttons: 1 })
                t.win.dispatch('mouseup', { button: 0 })
                t.bar.dispatch('mousedown', { button: 0, clientX: 140 })
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
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.das.on('freeBar', () => {
            t.das.clear()
        })
        t.bar.dispatch('mousedown', { button: 0, clientX: 140 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    //--- 選項與清理 ---

    it(`should work without the opt argument`, function() {
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document')
        let panel = new Ele('panel')
        let bar = new Ele('bar', panel)
        let seq = []
        let das = domDragBarAndScroll(panel, bar)
        das.on('pressBar', (d) => seq.push(`press:${d.clientX}`))
        panel.dispatch('touchstart', te([tc(1, 300)]))
        assert.strict.deepStrictEqual(seq, ['press:-300'])
    })

    it(`should fall back to a ratio of one when the ratio getters are not functions`, function() {
        //c7
        let t = mk({ getHeighRatio: 'x', getWidthRatio: null })
        t.panel.dispatch('touchstart', te([tc(1, 300, 200)]))
        assert.strict.deepStrictEqual(t.full, [['pressBar', { clientY: -200, clientX: -300 }]])
    })

    it(`should fall back to the default when a flag is not a boolean`, function() {
        //c7 useTouchDragForPanel預設true, 兩個stop旗標預設false
        let t = mk({ useTouchDragForPanel: 'no', stopTouchDragPropagationForPanel: 1, stopScrollPropagationForPanel: 'yes' })
        let e1 = t.panel.dispatch('touchstart', te([tc(1, 300)]))
        let e2 = t.panel.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        assert.strict.deepStrictEqual(t.seq, ['press:-300', 'scroll:-1/1'])
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, false])
    })

    it(`should cancel the panel touch propagation only when asked`, function() {
        //c6 stopTouchDragPropagationForPanel
        let a = mk({ stopTouchDragPropagationForPanel: false })
        let e1 = a.panel.dispatch('touchstart', te([tc(1, 300)]))
        let b = mk({ stopTouchDragPropagationForPanel: true })
        let e2 = b.panel.dispatch('touchstart', te([tc(1, 300)]))
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, true])
    })

    it(`should cancel the window mouseup only when locked and stopScrollPropagationForPanel is set`, function() {
        //c6
        let run = (opt) => {
            let t = mk(opt)
            let e1 = t.win.dispatch('mouseup', { button: 0 })
            t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
            let e2 = t.win.dispatch('mouseup', { button: 0 })
            return [e1.defaultPrevented, e2.defaultPrevented]
        }
        assert.strict.deepStrictEqual(run({}), [false, false])
        assert.strict.deepStrictEqual(run({ stopScrollPropagationForPanel: true }), [false, true])
    })

    it(`should register only the listeners it needs`, function() {
        //c2 panel之觸控通道停用時不掛其監聽, 避免panel平白多一個不可被動化(passive:false)之touchmove監聽
        //   window與document不掛scroll與wheel: 該二事件於該處無法取消, 掛了亦無作用
        let t1 = mk({})
        assert.strict.deepStrictEqual(t1.panel.types(), ['touchcancel', 'touchend', 'touchmove', 'touchstart', 'wheel'])
        assert.strict.deepStrictEqual(t1.bar.types(), ['mousedown', 'mouseup', 'touchcancel', 'touchend', 'touchmove', 'touchstart'])
        assert.strict.deepStrictEqual(t1.win.types(), ['mousemove', 'mouseup'])
        assert.strict.deepStrictEqual(t1.doc.types(), [])
        assert.strict.deepStrictEqual([t1.panel.nListeners(), t1.bar.nListeners(), t1.win.nListeners(), t1.doc.nListeners()], [5, 6, 2, 0])
        let t2 = mk({ useTouchDragForPanel: false })
        assert.strict.deepStrictEqual(t2.panel.types(), ['wheel'])
        assert.strict.deepStrictEqual([t2.panel.nListeners(), t2.bar.nListeners(), t2.win.nListeners(), t2.doc.nListeners()], [1, 6, 2, 0])
    })

    it(`should register the touchmove listeners as non passive`, function() {
        //touchmove須可取消才能阻止頁面被拖曳捲動, 故必須明確給passive:false
        let t = mk({})
        let ps = [t.bar.hs.touchmove, t.panel.hs.touchmove].map((hs) => hs.map((h) => h.opts && h.opts.passive))
        assert.strict.deepStrictEqual(ps, [[false], [false]])
    })

    it(`should remove every listener it registered`, function() {
        //c2 add與clear對稱
        for (let opt of [{}, { useTouchDragForPanel: false }]) {
            let t = mk(opt)
            t.das.clear()
            assert.strict.deepStrictEqual([t.panel.nListeners(), t.bar.nListeners(), t.win.nListeners(), t.doc.nListeners()], [0, 0, 0, 0])
        }
    })

    it(`should stop emitting after clear, even when called mid drag`, function() {
        //a9、c1 拖曳中clear須停止且狀態歸零
        let t = mk({ useTouchDragForPanel: false })
        t.bar.dispatch('mousedown', { button: 0, clientX: 130 })
        t.das.clear()
        t.win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        t.win.dispatch('mouseup', { button: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should not throw when clear is called twice`, function() {
        let t = mk({ useTouchDragForPanel: false })
        let r = () => {
            t.das.clear()
            t.das.clear()
        }
        assert.doesNotThrow(r)
    })

    it(`should keep two instances on the same panel independent`, function() {
        //c8 兩實例之鎖互不干擾, 清理其一不影響另一; 但滾輪會各發一次, 屬已知限制
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document')
        let panel = new Ele('panel')
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
        bar1.dispatch('mousedown', { button: 0, clientX: 100 })
        win.dispatch('mousemove', { clientX: 200, buttons: 1 })
        bar2.dispatch('touchstart', te([tc(1, 50)]))
        bar2.dispatch('touchmove', te([tc(1, 60)]))
        panel.dispatch('wheel', { deltaY: -120, deltaX: 60 })
        d1.clear()
        win.dispatch('mousemove', { clientX: 300, buttons: 1 })
        bar2.dispatch('touchmove', te([tc(1, 70)]))
        assert.strict.deepStrictEqual([s1, s2], [[200, 'scroll'], [60, 'scroll', 70]])
    })

    //--- 不變式 ---

    it(`should keep pressBar and freeBar paired for any sequence of events, and never end up stuck`, function() {
        //以固定種子之亂數產生事件序列, 不論序列是否為實際裝置所能產生, 皆須滿足:
        //  (1) pressBar與freeBar嚴格交替且由pressBar起頭, dragBar只出現於兩者之間
        //  (2) 任何狀態下, 一次完整之滑鼠主鍵手勢必被完整服務
        //  (3) 非滑鼠上鎖之任何狀態下, 一次完整之新觸控手勢必被完整服務
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
        let rndTouches = () => ids.filter(() => rnd() < 0.5).map((id) => tc(id, rndX()))
        let acts = [
            (t) => t.bar.dispatch('mousedown', { button: pick([0, 0, 0, 1, 2]), clientX: rndX() }),
            (t) => t.bar.dispatch('mouseup', { button: 0 }),
            (t) => t.win.dispatch('mouseup', { button: pick([0, 2]) }),
            (t) => t.win.dispatch('mousemove', { clientX: rndX(), buttons: pick([0, 1, 1, 1]) }),
            (t) => pick([t.bar, t.panel]).dispatch('touchstart', te(rndTouches(), [tc(pick(ids), rndX())])),
            (t) => pick([t.bar, t.panel]).dispatch('touchmove', te(rndTouches(), [tc(pick(ids), rndX())])),
            (t) => pick([t.bar, t.panel]).dispatch('touchend', te(rndTouches(), [tc(pick(ids), rndX())])),
            (t) => pick([t.bar, t.panel]).dispatch('touchcancel', te(rndTouches(), pick([[], [tc(pick(ids), 0)]]))),
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

                //(3), 新手指之identifier為9, 不與序列內者重複, 且touches只含該指
                if (probeState(t).indexOf('barMouse') < 0) {
                    let n = t.seq.length
                    t.bar.dispatch('touchstart', te([tc(9, 500)]))
                    t.bar.dispatch('touchmove', te([tc(9, 501)]))
                    t.bar.dispatch('touchend', te([], [tc(9, 501)]))
                    let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
                    assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: touch gesture`)
                    pressed = false
                }

                //(2)
                let n = t.seq.length
                t.bar.dispatch('mousedown', { button: 0, clientX: 500 })
                t.win.dispatch('mousemove', { clientX: 501, buttons: 1 })
                t.win.dispatch('mouseup', { button: 0 })
                let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
                assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: mouse gesture`)

                //(1), 含收尾手勢
                checkStream(t.seq, tag)
            }
        }
    })

})
