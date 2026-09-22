import assert from 'assert'
import domDragPointer from '../src/domDragPointer.mjs'


//本函數於建構時即存取window, nodejs無此, 故以假物件覆蓋全域再建構
//  假元素只記錄addEventListener之處理器, 由測試直接派發合成事件, 可精確斷言事件種類/次數/順序,
//  以及preventDefault與stopPropagation是否被呼叫, 這些於真瀏覽器只能間接觀察
//  dispatch會逐層往上跑以模擬冒泡, 最後到達window; 不模擬capture階段(capture之語義於真瀏覽器另驗)
//  target為派發之元素, 供canPress判定
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


//事件建構: 滑鼠pointerId固定1(Chrome亦如此), 觸控自2起
function md(x, extra = {}) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: 0, ...extra }
}
function mm(x, buttons = 1) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, buttons, clientX: x, clientY: 0 }
}
function mu(button = 0) {
    return { pointerType: 'mouse', pointerId: 1, isPrimary: true, button, buttons: 0, clientX: 0, clientY: 0 }
}
function td(id, x, isPrimary = true, type = 'touch') {
    return { pointerType: type, pointerId: id, isPrimary, button: 0, buttons: 1, clientX: x, clientY: 0 }
}
function tm(id, x, type = 'touch') {
    return { pointerType: type, pointerId: id, isPrimary: true, buttons: 1, clientX: x, clientY: 0 }
}
function tu(id, type = 'touch') {
    return { pointerType: type, pointerId: id, isPrimary: true, button: 0, buttons: 0, clientX: 0, clientY: 0 }
}


//mk, 建立一組ele(含子節點child)/window/document與dp, 並記錄其發出之事件
function mk(opt) {
    let win = new Ele('window')
    let doc = new Ele('document', win)
    globalThis.window = win
    globalThis.document = doc
    let ele = new Ele('ele', doc)
    let child = new Ele('child', ele)
    let seq = []
    let full = []
    let dp = domDragPointer(ele, opt)
    dp.on('press', (m) => {
        seq.push(`press:${m.clientX}`)
        full.push(['press', m])
    })
    dp.on('drag', (m) => {
        seq.push(`drag:${m.clientX}`)
        full.push(['drag', m])
    })
    dp.on('free', (m) => {
        seq.push('free')
        full.push(['free', m])
    })
    return { ele, child, win, doc, dp, seq, full }
}


//probeState, 以不改變狀態之探測事件讀出目前之鎖: 滑鼠移動(buttons=1)只在mouse鎖時發drag, 觸控id之移動只在該id上鎖時發drag
function probeState(t) {
    let rs = []
    let n = t.seq.length
    t.win.dispatch('pointermove', mm(77))
    if (t.seq.length > n) {
        rs.push('mouse')
    }
    for (let id of [2, 3]) {
        n = t.seq.length
        t.win.dispatch('pointermove', tm(id, 77))
        if (t.seq.length > n) {
            rs.push(`touch#${id}`)
        }
    }
    return rs.length > 0 ? rs.join('+') : 'idle'
}


//STATES, 三個前置狀態; 起手觸控之pointerId為2, 起手座標10
let STATES = {
    idle: () => {},
    mouse: (t) => {
        t.ele.dispatch('pointerdown', md(10))
    },
    touch: (t) => {
        t.ele.dispatch('pointerdown', td(2, 10))
    },
}
let STATE_LABEL = { idle: 'idle', mouse: 'mouse', touch: 'touch#2' }


//TABLE, 狀態×事件之全表; 每格為'發出之事件序列|事件後之狀態', same表狀態不變; 欄序為 idle, mouse, touch
let S3 = (v) => [v, v, v]
let TABLE = [

    //--- 滑鼠按下 ---
    ['ele pointerdown mouse with the primary button', (t) => t.ele.dispatch('pointerdown', md(20)),
        ['press:20|mouse', 'free,press:20|mouse', 'free,press:20|mouse']],
    ['child pointerdown mouse, bubbling', (t) => t.child.dispatch('pointerdown', md(20)),
        ['press:20|mouse', 'free,press:20|mouse', 'free,press:20|mouse']],
    ['ele pointerdown without a button property', (t) => t.ele.dispatch('pointerdown', { clientX: 20 }),
        ['press:20|mouse', 'free,press:20|mouse', 'free,press:20|mouse']],
    ['ele pointerdown mouse with the middle button', (t) => t.ele.dispatch('pointerdown', md(20, { button: 1, buttons: 4 })), S3('|same')],
    ['ele pointerdown mouse with the right button', (t) => t.ele.dispatch('pointerdown', md(20, { button: 2, buttons: 2 })), S3('|same')],

    //--- 滑鼠移動與放開 ---
    ['window pointermove mouse with a button held', (t) => t.win.dispatch('pointermove', mm(20, 1)),
        ['|same', 'drag:20|same', '|same']],
    ['window pointermove mouse without a buttons property', (t) => t.win.dispatch('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 20 }),
        ['|same', 'drag:20|same', '|same']],
    ['window pointermove mouse with no button held', (t) => t.win.dispatch('pointermove', mm(20, 0)),
        ['|same', 'free|idle', '|same']],
    ['window pointerup mouse', (t) => t.win.dispatch('pointerup', mu(0)),
        ['|same', 'free|idle', '|same']],
    ['window pointerup mouse of the right button', (t) => t.win.dispatch('pointerup', mu(2)),
        ['|same', 'free|idle', '|same']],
    ['child pointerup mouse, bubbling', (t) => t.child.dispatch('pointerup', mu(0)),
        ['|same', 'free|idle', '|same']],
    ['window pointercancel mouse', (t) => t.win.dispatch('pointercancel', { pointerType: 'mouse', pointerId: 1 }),
        ['|same', 'free|idle', '|same']],

    //--- 觸控按下 ---
    ['ele pointerdown touch of another finger while the starting finger is still down', (t) => t.ele.dispatch('pointerdown', td(3, 20, false)),
        ['press:20|touch#3', '|same', '|same']],
    ['ele pointerdown touch, primary, after the starting finger is gone', (t) => t.ele.dispatch('pointerdown', td(3, 20, true)),
        ['press:20|touch#3', '|same', 'free,press:20|touch#3']],
    ['ele pointerdown touch reusing the pointerId of the starting finger', (t) => t.ele.dispatch('pointerdown', td(2, 20, false)),
        ['press:20|touch#2', '|same', 'free,press:20|touch#2']],
    ['ele pointerdown touch without pointerId nor isPrimary', (t) => t.ele.dispatch('pointerdown', { pointerType: 'touch', clientX: 20 }),
        ['press:20|touch#2+touch#3', '|same', 'free,press:20|touch#2+touch#3']],
    ['ele pointerdown pen, primary', (t) => t.ele.dispatch('pointerdown', td(3, 20, true, 'pen')),
        ['press:20|idle', '|same', '|same']],

    //--- 觸控移動與放開 ---
    ['window pointermove of the starting finger', (t) => t.win.dispatch('pointermove', tm(2, 20)),
        ['|same', '|same', 'drag:20|same']],
    ['window pointermove of another finger', (t) => t.win.dispatch('pointermove', tm(3, 20)),
        S3('|same')],
    ['window pointerup of the starting finger', (t) => t.win.dispatch('pointerup', tu(2)),
        ['|same', '|same', 'free|idle']],
    ['window pointerup of another finger', (t) => t.win.dispatch('pointerup', tu(3)),
        S3('|same')],
    ['window pointercancel of the starting finger', (t) => t.win.dispatch('pointercancel', tu(2)),
        ['|same', '|same', 'free|idle']],
    ['window pointercancel of another finger', (t) => t.win.dispatch('pointercancel', tu(3)),
        S3('|same')],
    ['window pointerup without any pointer information', (t) => t.win.dispatch('pointerup', {}),
        ['|same', 'free|idle', 'free|idle']],
    ['window pointercancel without any pointer information', (t) => t.win.dispatch('pointercancel', {}),
        ['|same', 'free|idle', 'free|idle']],

    //--- 清理 ---
    ['clear', (t) => t.dp.clear(), S3('|idle')],

]


//runCell
function runCell(opt, state, act) {
    let t = mk(opt)
    STATES[state](t)
    let n = t.seq.length
    act(t)
    let emitted = t.seq.slice(n).join(',')
    return `${emitted}|${probeState(t)}`
}


describe(`domDragPointer`, function() {

    after(function() {
        delete globalThis.window
        delete globalThis.document
    })

    //--- 狀態×事件全表 ---

    describe(`state machine, every state against every event`, function() {
        let names = Object.keys(STATES)
        for (let [title, act, expects] of TABLE) {
            names.forEach((state, i) => {
                let exp = expects[i].replace('|same', `|${STATE_LABEL[state]}`)
                it(`should handle [${state}] x [${title}] as [${exp}]`, function() {
                    assert.strict.deepStrictEqual(runCell({}, state, act), exp)
                })
            })
        }
    })

    //--- 滑鼠 ---

    it(`should emit press, drag and free for a primary button drag`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(250))
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'drag:300', 'free'])
    })

    it(`should carry coordinates, pointerType and the event in the payload`, function() {
        let t = mk({})
        let e1 = t.ele.dispatch('pointerdown', md(10, { clientY: 11 }))
        let e2 = t.win.dispatch('pointermove', { ...mm(20), clientY: 21 })
        let e3 = t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.full, [
            ['press', { clientX: 10, clientY: 11, pointerType: 'mouse', event: e1 }],
            ['drag', { clientX: 20, clientY: 21, pointerType: 'mouse', event: e2 }],
            ['free', { pointerType: 'mouse', reason: 'up', event: e3 }],
        ])
    })

    it(`should report the type of the lock being freed, not of the event, on take over`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        let e = t.ele.dispatch('pointerdown', md(140))
        assert.strict.deepStrictEqual(t.full.map((v) => [v[0], v[1].pointerType]), [['press', 'touch'], ['free', 'touch'], ['press', 'mouse']])
        assert.strict.deepStrictEqual([t.full[1][1].reason, t.full[1][1].event], ['takeover', e])
    })

    it(`should unlock itself when a pointermove arrives with no button held`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(250))
        t.win.dispatch('pointermove', mm(330, 0))
        t.win.dispatch('pointermove', mm(400, 0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:250', 'free'])
    })

    it(`should close the stale lock before a new pointerdown takes over`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.ele.dispatch('pointerdown', md(140))
        t.win.dispatch('pointermove', mm(200))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should let the mouse take over a touch lock, closing it first`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        t.ele.dispatch('pointerdown', md(140))
        t.win.dispatch('pointermove', tm(2, 200))
        t.win.dispatch('pointermove', mm(210))
        t.win.dispatch('pointerup', tu(2))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'drag:210', 'free'])
    })

    it(`should ignore a touch that lands while a mouse drag is in progress`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.ele.dispatch('pointerdown', td(2, 140))
        t.win.dispatch('pointermove', tm(2, 200))
        t.win.dispatch('pointerup', tu(2))
        t.win.dispatch('pointermove', mm(210))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:210', 'free'])
    })

    it(`should not let a touch pointer with the same id as the mouse steal a mouse drag`, function() {
        //isOwn須比對型別: 合成或他家瀏覽器之觸控pointerId可能與滑鼠相同
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', tm(1, 200))
        t.win.dispatch('pointerup', tu(1))
        t.win.dispatch('pointermove', mm(210))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:210'])
    })

    //--- 觸控 ---

    it(`should emit press, drag and free for a single finger drag`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        t.win.dispatch('pointermove', tm(2, 200))
        t.win.dispatch('pointerup', tu(2))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should work when the pointerId is zero`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(0, 130))
        t.win.dispatch('pointermove', tm(0, 200))
        t.win.dispatch('pointermove', tm(1, 300))
        t.win.dispatch('pointerup', tu(1))
        t.win.dispatch('pointerup', tu(0))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should serve the second finger only after the first is gone, tracked by isPrimary`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 115))
        t.ele.dispatch('pointerdown', td(3, 300, false))
        t.win.dispatch('pointermove', tm(3, 360))
        t.win.dispatch('pointerup', tu(3))
        t.win.dispatch('pointermove', tm(2, 160))
        t.win.dispatch('pointerup', tu(2))
        t.ele.dispatch('pointerdown', td(4, 140, true))
        t.win.dispatch('pointerup', tu(4))
        assert.strict.deepStrictEqual(t.seq, ['press:115', 'drag:160', 'free', 'press:140', 'free'])
    })

    it(`should recover from a lost pointerup when a primary touch lands again`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        t.win.dispatch('pointermove', tm(2, 150))
        t.ele.dispatch('pointerdown', td(3, 140, true))
        t.win.dispatch('pointermove', tm(3, 200))
        t.win.dispatch('pointerup', tu(3))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:150', 'free', 'press:140', 'drag:200', 'free'])
    })

    it(`should treat a pen like touch but never let it take over a touch lock`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        t.ele.dispatch('pointerdown', td(9, 140, true, 'pen'))
        t.win.dispatch('pointermove', tm(9, 200, 'pen'))
        t.win.dispatch('pointerup', tu(9, 'pen'))
        t.win.dispatch('pointermove', tm(2, 160))
        t.win.dispatch('pointerup', tu(2))
        t.ele.dispatch('pointerdown', td(9, 140, true, 'pen'))
        t.win.dispatch('pointermove', tm(9, 220, 'pen'))
        t.win.dispatch('pointerup', tu(9, 'pen'))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:160', 'free', 'press:140', 'drag:220', 'free'])
        assert.strict.deepStrictEqual(t.full[3][1].pointerType, 'pen')
    })

    //--- canPress ---

    it(`should not lock when canPress returns false, and pass the event to it`, function() {
        let seen = []
        let ok = false
        let t = mk({
            canPress: (e) => {
                seen.push(e.clientX)
                return ok
            },
        })
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(200))
        ok = true
        t.ele.dispatch('pointerdown', md(140))
        t.win.dispatch('pointermove', mm(210))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:140', 'drag:210', 'free'])
        assert.strict.deepStrictEqual(seen, [130, 140])
    })

    it(`should not consult canPress for a non primary button`, function() {
        let n = 0
        let t = mk({
            canPress: () => {
                n++
                return true
            },
        })
        t.ele.dispatch('pointerdown', md(130, { button: 2 }))
        assert.strict.deepStrictEqual([n, t.seq], [0, []])
    })

    it(`should fall back to always pressable when canPress is not a function`, function() {
        let t = mk({ canPress: 'x' })
        t.ele.dispatch('pointerdown', md(130))
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    //--- touchmove墊片 ---

    it(`should cancel the touchmove of the element only while a touch pointer is locked`, function() {
        let t = mk({})
        let e0 = t.ele.dispatch('touchmove', {})
        t.ele.dispatch('pointerdown', md(130))
        let e1 = t.ele.dispatch('touchmove', {})
        t.win.dispatch('pointerup', mu())
        t.ele.dispatch('pointerdown', td(2, 130))
        let e2 = t.child.dispatch('touchmove', {})
        let e3 = t.ele.dispatch('touchmove', { cancelable: false })
        t.win.dispatch('pointerup', tu(2))
        let e4 = t.ele.dispatch('touchmove', {})
        let rs = [e0, e1, e2, e3, e4].map((e) => e.defaultPrevented && e.propagationStopped)
        assert.strict.deepStrictEqual(rs, [false, false, true, false, false])
    })

    it(`should cancel the touchmove for a pen lock too`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(9, 130, true, 'pen'))
        let e = t.ele.dispatch('touchmove', {})
        assert.strict.deepStrictEqual(e.defaultPrevented, true)
    })

    it(`should consult cancelTouchMove when it is a function`, function() {
        let b = false
        let t = mk({ cancelTouchMove: (e) => b })
        t.ele.dispatch('pointerdown', td(2, 130))
        let e1 = t.ele.dispatch('touchmove', {})
        b = true
        let e2 = t.ele.dispatch('touchmove', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, true])
    })

    it(`should not register a touchmove listener when cancelTouchMove is false`, function() {
        let t = mk({ cancelTouchMove: false })
        assert.strict.deepStrictEqual(t.ele.types(), ['contextmenu', 'pointerdown'])
    })

    it(`should register the touchmove listener as non passive`, function() {
        let t = mk({})
        assert.strict.deepStrictEqual(t.ele.hs.touchmove.map((h) => h.opts && h.opts.passive), [false])
    })

    //--- contextmenu ---

    it(`should prevent the contextmenu only while a touch or pen pointer is locked`, function() {
        let t = mk({})
        let e0 = t.ele.dispatch('contextmenu', {})
        t.ele.dispatch('pointerdown', md(130))
        let e1 = t.ele.dispatch('contextmenu', {})
        t.win.dispatch('pointerup', mu())
        t.ele.dispatch('pointerdown', td(2, 130))
        let e2 = t.child.dispatch('contextmenu', {})
        t.win.dispatch('pointerup', tu(2))
        let e3 = t.ele.dispatch('contextmenu', {})
        assert.strict.deepStrictEqual([e0, e1, e2, e3].map((e) => e.defaultPrevented), [false, false, true, false])
        assert.strict.deepStrictEqual(e2.propagationStopped, false)
    })

    //--- 監聽器拋錯與重入 ---

    it(`should change its state before emitting, so a throwing listener leaves no half state`, function() {
        let t = mk({})
        let boom = true
        t.dp.on('press', () => {
            if (boom) {
                throw new Error('consumer boom')
            }
        })
        t.dp.on('free', () => {
            if (boom) {
                throw new Error('consumer boom')
            }
        })
        assert.throws(() => t.ele.dispatch('pointerdown', md(130)), /consumer boom/)
        t.win.dispatch('pointermove', mm(200))
        assert.throws(() => t.win.dispatch('pointerup', mu()), /consumer boom/)
        boom = false
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should stay silent when clear is called inside a listener`, function() {
        for (let name of ['press', 'drag', 'free']) {
            let t = mk({})
            t.dp.on(name, () => {
                t.dp.clear()
            })
            let r = () => {
                t.ele.dispatch('pointerdown', md(130))
                t.win.dispatch('pointermove', mm(200))
                t.win.dispatch('pointerup', mu())
                t.ele.dispatch('pointerdown', md(140))
            }
            assert.doesNotThrow(r, name)
            let exp = { press: ['press:130'], drag: ['press:130', 'drag:200'], free: ['press:130', 'drag:200', 'free'] }
            assert.strict.deepStrictEqual(t.seq, exp[name], name)
            assert.strict.deepStrictEqual([t.ele.nListeners(), t.win.nListeners()], [0, 0], name)
        }
    })

    it(`should not emit press when clear is called by the free listener of a take over`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.dp.on('free', () => {
            t.dp.clear()
        })
        t.ele.dispatch('pointerdown', md(140))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free'])
    })

    //--- 監聽與清理 ---

    it(`should register only the listeners it needs, window ones in the capture phase`, function() {
        let t = mk({})
        assert.strict.deepStrictEqual(t.ele.types(), ['contextmenu', 'pointerdown', 'touchmove'])
        assert.strict.deepStrictEqual(t.win.types(), ['pointercancel', 'pointermove', 'pointerup'])
        assert.strict.deepStrictEqual(t.doc.types(), [])
        let caps = ['pointermove', 'pointerup', 'pointercancel'].map((k) => t.win.hs[k].map((h) => h.opts && h.opts.capture))
        assert.strict.deepStrictEqual(caps, [[true], [true], [true]])
    })

    it(`should remove every listener it registered`, function() {
        let t = mk({})
        t.dp.clear()
        assert.strict.deepStrictEqual([t.ele.nListeners(), t.win.nListeners(), t.doc.nListeners()], [0, 0, 0])
    })

    it(`should stop emitting after clear, even when called mid drag`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.dp.clear()
        t.win.dispatch('pointermove', mm(300))
        t.win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(t.seq, ['press:130'])
    })

    it(`should not throw when clear is called twice`, function() {
        let t = mk({})
        assert.doesNotThrow(() => {
            t.dp.clear()
            t.dp.clear()
        })
    })

    it(`should work without the opt argument`, function() {
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document')
        let ele = new Ele('ele')
        let seq = []
        let dp = domDragPointer(ele)
        dp.on('press', (m) => seq.push(`press:${m.clientX}`))
        ele.dispatch('pointerdown', md(130))
        assert.strict.deepStrictEqual(seq, ['press:130'])
    })

    //--- free之reason、eleTouchMove、觸控筆按鍵、canPress拋錯 ---

    it(`should report the reason of each free`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointerup', mu())
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(200, 0))
        t.ele.dispatch('pointerdown', td(2, 130))
        t.win.dispatch('pointercancel', tu(2))
        t.ele.dispatch('pointerdown', td(2, 130))
        t.ele.dispatch('pointerdown', md(140))
        assert.strict.deepStrictEqual(t.full.filter((v) => v[0] === 'free').map((v) => v[1].reason), ['up', 'buttonsLost', 'cancel', 'takeover'])
    })

    it(`should free when the primary button is released while another button is still held, and keep dragging otherwise`, function() {
        //和弦按鍵: 已按住主鍵再按右鍵只發pointermove(buttons=3), 放開右鍵亦只發pointermove(buttons=1), 皆繼續拖曳; 放開主鍵而右鍵仍按住(buttons=2)則接觸位元消失, 解鎖
        let t = mk({})
        t.ele.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', { ...mm(200), button: 2, buttons: 3 })
        t.win.dispatch('pointermove', { ...mm(210), button: 2, buttons: 1 })
        t.win.dispatch('pointermove', { ...mm(220), button: 0, buttons: 2 })
        t.win.dispatch('pointermove', mm(230, 2))
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'drag:210', 'free'])
        assert.strict.deepStrictEqual(t.full[3][1].reason, 'buttonsLost')
    })

    it(`should keep dragging with the pen eraser and free when its contact bit is gone`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', { ...td(9, 130, true, 'pen'), button: 5, buttons: 32 })
        t.win.dispatch('pointermove', { ...tm(9, 200, 'pen'), buttons: 32 })
        t.win.dispatch('pointermove', { ...tm(9, 210, 'pen'), buttons: 0 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'drag:200', 'free'])
    })

    it(`should accept an array of elements and handle a bubbling pointerdown only once`, function() {
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document', win)
        let outer = new Ele('outer', globalThis.document)
        let inner = new Ele('inner', outer)
        let apart = new Ele('apart', globalThis.document)
        let seq = []
        let dp = domDragPointer([inner, outer, apart, 'x'])
        dp.on('press', (m) => seq.push(`press:${m.clientX}@${m.event.target.name}`))
        dp.on('free', () => seq.push('free'))
        inner.dispatch('pointerdown', md(130)) //送達inner與outer, 只處理一次
        win.dispatch('pointerup', mu())
        apart.dispatch('pointerdown', md(140)) //不在同一棵樹之元素亦可起手
        win.dispatch('pointerup', mu())
        assert.strict.deepStrictEqual(seq, ['press:130@inner', 'free', 'press:140@apart', 'free'])
        assert.strict.deepStrictEqual([inner.types(), outer.types(), apart.types()], [['contextmenu', 'pointerdown', 'touchmove'], ['contextmenu', 'pointerdown', 'touchmove'], ['contextmenu', 'pointerdown', 'touchmove']])
        dp.clear()
        assert.strict.deepStrictEqual([inner.nListeners(), outer.nListeners(), apart.nListeners(), win.nListeners()], [0, 0, 0, 0])
    })

    it(`should not prevent a contextmenu that reports a mouse source even while a touch is locked`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(2, 130))
        let e1 = t.ele.dispatch('contextmenu', { pointerType: 'mouse' })
        let e2 = t.ele.dispatch('contextmenu', { pointerType: 'touch' })
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [false, true])
    })

    it(`should ignore a pointerdown that does not reach the element`, function() {
        let t = mk({})
        t.doc.dispatch('pointerdown', md(130))
        t.win.dispatch('pointermove', mm(200))
        assert.strict.deepStrictEqual(t.seq, [])
    })

    it(`should hang the touchmove listener on eleTouchMove when given, and fall back to ele otherwise`, function() {
        let t = mk({ eleTouchMove: 'x' })
        assert.strict.deepStrictEqual(t.ele.types(), ['contextmenu', 'pointerdown', 'touchmove'])
        let win = new Ele('window')
        globalThis.window = win
        globalThis.document = new Ele('document', win)
        let ele = new Ele('ele', globalThis.document)
        let child = new Ele('child', ele)
        let dp = domDragPointer(ele, { eleTouchMove: child })
        assert.strict.deepStrictEqual([ele.types(), child.types()], [['contextmenu', 'pointerdown'], ['touchmove']])
        ele.dispatch('pointerdown', td(2, 130))
        let e1 = child.dispatch('touchmove', {})
        let e2 = ele.dispatch('touchmove', {})
        assert.strict.deepStrictEqual([e1.defaultPrevented, e2.defaultPrevented], [true, false])
        dp.clear()
        assert.strict.deepStrictEqual([ele.nListeners(), child.nListeners(), win.nListeners()], [0, 0, 0])
    })

    it(`should accept the pen tip and the eraser but not the barrel button`, function() {
        let t = mk({})
        t.ele.dispatch('pointerdown', td(9, 130, true, 'pen'))
        t.win.dispatch('pointerup', tu(9, 'pen'))
        t.ele.dispatch('pointerdown', { ...td(9, 140, true, 'pen'), button: 5, buttons: 32 })
        t.win.dispatch('pointerup', tu(9, 'pen'))
        t.ele.dispatch('pointerdown', { ...td(9, 150, true, 'pen'), button: 2, buttons: 2 })
        assert.strict.deepStrictEqual(t.seq, ['press:130', 'free', 'press:140', 'free'])
    })

    it(`should not lock and rethrow when canPress throws`, function() {
        let t = mk({
            canPress: () => {
                throw new Error('policy boom')
            },
        })
        assert.throws(() => t.ele.dispatch('pointerdown', md(130)), /policy boom/)
        t.win.dispatch('pointermove', mm(200))
        assert.strict.deepStrictEqual(`${t.seq.join(',')}|${probeState(t)}`, '|idle')
    })

    //--- 不變式 ---

    it(`should keep press and free paired for any sequence of events, and never end up stuck`, function() {
        //以固定種子之亂數產生事件序列, 不論序列是否為實際裝置所能產生, 皆須滿足:
        //  (1) press與free嚴格交替且由press起頭, drag只出現於兩者之間
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
        let ids = [2, 3, 4]
        let rndX = () => Math.floor(rnd() * 400)
        let acts = [
            (t) => t.ele.dispatch('pointerdown', md(rndX(), { button: pick([0, 0, 0, 1, 2]) })),
            (t) => t.win.dispatch('pointerup', mu(pick([0, 2]))),
            (t) => t.win.dispatch('pointermove', mm(rndX(), pick([0, 1, 1, 1]))),
            (t) => pick([t.ele, t.child]).dispatch('pointerdown', td(pick(ids), rndX(), pick([true, false]))),
            (t) => t.win.dispatch('pointermove', tm(pick(ids), rndX())),
            (t) => t.win.dispatch('pointerup', tu(pick(ids))),
            (t) => t.win.dispatch('pointercancel', pick([tu(pick(ids)), {}])),
            (t) => t.ele.dispatch('touchmove', {}),
            (t) => t.ele.dispatch('contextmenu', {}),
        ]
        let checkStream = (seq, tag) => {
            let pressed = false
            seq.forEach((v, i) => {
                let k = v.split(':')[0]
                if (k === 'press') {
                    assert.strict.deepStrictEqual(pressed, false, `${tag}: press while pressed at ${i}: ${seq.join(' ')}`)
                    pressed = true
                }
                else if (k === 'free') {
                    assert.strict.deepStrictEqual(pressed, true, `${tag}: free while not pressed at ${i}: ${seq.join(' ')}`)
                    pressed = false
                }
                else if (k === 'drag') {
                    assert.strict.deepStrictEqual(pressed, true, `${tag}: drag while not pressed at ${i}: ${seq.join(' ')}`)
                }
            })
            return pressed
        }
        let kinds = (seq) => seq.map((v) => v.split(':')[0]).join(',')
        for (let k = 0; k < 400; k++) {
            let tag = `run=${k}`
            let t = mk({})
            for (let i = 0; i < 25; i++) {
                pick(acts)(t)
            }

            //(1)
            let pressed = checkStream(t.seq, tag)

            //(3), 新手指之pointerId為9, 不與序列內者重複, 且為primary
            if (probeState(t).indexOf('mouse') < 0) {
                let n = t.seq.length
                t.ele.dispatch('pointerdown', td(9, 500, true))
                t.win.dispatch('pointermove', tm(9, 501))
                t.win.dispatch('pointerup', tu(9))
                let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
                assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: touch gesture`)
                pressed = false
            }

            //(2)
            let n = t.seq.length
            t.ele.dispatch('pointerdown', md(500))
            t.win.dispatch('pointermove', mm(501))
            t.win.dispatch('pointerup', mu())
            let exp = pressed ? 'free,press,drag,free' : 'press,drag,free'
            assert.strict.deepStrictEqual(kinds(t.seq.slice(n)), exp, `${tag}: mouse gesture`)

            //(1), 含收尾手勢
            checkStream(t.seq, tag)
        }
    })

})
