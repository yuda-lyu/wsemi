//fakeDom, 供domDrag、domDragPreview之單元測試使用之最小假DOM, 並覆蓋全域window與document
//  元素: 屬性(可計寫入次數)、監聽(可計數與派發)、子節點、是否在頁面中(由是否接在body下決定)、深拷貝、外框、以'input[type=radio]'查詢子孫
//  document.elementsFromPoint由測試以setStack指定各座標之元素堆疊(由上而下), 模擬瀏覽器之命中判定
//  window之監聽不分capture與冒泡; 以bubble同一事件物件依序送達元素與window, 模擬事件送達多處
//  瀏覽器本身之語義(命中判定、事件派送順序、原生拖放、觸控之target固定為起手元素、觸控捲動等)非本檔所能驗證, 另以真瀏覽器實測


function mkFakeDom() {
    let env = {
        stacks: new Map(), //'x,y' → 元素陣列
    }

    class Ele {
        constructor(tag = 'div', o = {}) {
            this.nodeType = 1
            this.tagName = String(tag).toUpperCase()
            this.attrs = new Map()
            this.nSet = new Map() //屬性名 → setAttribute次數
            this.listeners = []
            this.children = []
            this.parentNode = null
            this.style = {}
            this.offsetWidth = o.w === undefined ? 100 : o.w
            this.offsetHeight = o.h === undefined ? 40 : o.h
            this.rect = o.rect || { left: 0, top: 0, width: this.offsetWidth, height: this.offsetHeight }
        }

        get isConnected() {
            let e = this
            while (e) {
                if (e === env.body) {
                    return true
                }
                e = e.parentNode
            }
            return false
        }

        get parentElement() {
            return this.parentNode
        }

        setAttribute(k, v) {
            this.attrs.set(k, String(v))
            this.nSet.set(k, (this.nSet.get(k) || 0) + 1)
        }

        getAttribute(k) {
            return this.attrs.has(k) ? this.attrs.get(k) : null
        }

        removeAttribute(k) {
            this.attrs.delete(k)
        }

        addEventListener(name, fn, opt) {
            this.listeners.push({ name, fn, opt })
        }

        removeEventListener(name, fn) {
            let i = this.listeners.findIndex((l) => l.name === name && l.fn === fn)
            if (i >= 0) {
                this.listeners.splice(i, 1)
            }
        }

        nListeners(name) {
            return this.listeners.filter((l) => name === undefined || l.name === name).length
        }

        //dispatch, 對本元素派發事件(不冒泡), target預設為本元素
        dispatch(name, e = {}) {
            return env.bubble([this], name, e)
        }

        //fire, 以既有事件物件呼叫本元素之監聽
        fire(ev) {
            for (let l of this.listeners.slice()) {
                if (l.name === ev.type) {
                    l.fn(ev)
                }
            }
        }

        //matches, querySelectorAll, 只支援'input[type=radio]'
        matches(q) {
            return q === 'input[type=radio]' && this.tagName === 'INPUT' && this.getAttribute('type') === 'radio'
        }

        querySelectorAll(q) {
            let out = []
            let walk = (e) => {
                for (let c of e.children) {
                    if (c.matches(q)) {
                        out.push(c)
                    }
                    walk(c)
                }
            }
            walk(this)
            return out
        }

        appendChild(c) {
            if (c.parentNode) {
                c.parentNode.removeChild(c)
            }
            c.parentNode = this
            this.children.push(c)
            return c
        }

        removeChild(c) {
            let i = this.children.indexOf(c)
            if (i >= 0) {
                this.children.splice(i, 1)
            }
            c.parentNode = null
            return c
        }

        remove() {
            if (this.parentNode) {
                this.parentNode.removeChild(this)
            }
        }

        cloneNode(deep) {
            let n = new Ele(this.tagName, { w: this.offsetWidth, h: this.offsetHeight, rect: { ...this.rect } })
            for (let [k, v] of this.attrs) {
                n.attrs.set(k, v)
            }
            if (deep) {
                for (let c of this.children) {
                    n.appendChild(c.cloneNode(true))
                }
            }
            return n
        }

        getBoundingClientRect() {
            return { ...this.rect }
        }
    }

    //mkEvent, 事件物件: preventDefault記錄於defaultPrevented
    //  觸控: touch為{ x, y, id }之單一觸點, 放於changedTouches, touches於touchend/touchcancel為空否則同之; 多指以changed與all分別給changedTouches與touches; id未給者之觸點無identifier(合成事件)
    let toTouch = (t) => {
        let o = { clientX: t.x, clientY: t.y }
        if (t.id !== undefined) {
            o.identifier = t.id
        }
        return o
    }
    let mkEvent = (type, e = {}) => {
        let ev = { type, cancelable: true, defaultPrevented: false, ...e }
        ev.preventDefault = () => {
            ev.defaultPrevented = true
        }
        let changed = e.changed || (e.touch ? [e.touch] : null)
        if (changed) {
            let ended = type === 'touchend' || type === 'touchcancel'
            ev.changedTouches = changed.map(toTouch)
            ev.touches = (e.all || (ended ? [] : changed)).map(toTouch)
            delete ev.touch
            delete ev.changed
            delete ev.all
        }
        return ev
    }

    //window
    let winListeners = []
    env.window = {
        addEventListener: (name, fn, opt) => {
            winListeners.push({ name, fn, opt })
        },
        removeEventListener: (name, fn) => {
            let i = winListeners.findIndex((l) => l.name === name && l.fn === fn)
            if (i >= 0) {
                winListeners.splice(i, 1)
            }
        },
    }
    let fireWin = (ev) => {
        for (let l of winListeners.slice()) {
            if (l.name === ev.type) {
                l.fn(ev)
            }
        }
    }

    //bubble, 同一事件物件依序送達path各元素(由內而外), toWindow時再送達window
    env.bubble = (path, name, e = {}, toWindow = false) => {
        let ev = mkEvent(name, { target: path[0], ...e })
        for (let el of path) {
            el.fire(ev)
        }
        if (toWindow) {
            fireWin(ev)
        }
        return ev
    }

    //winDispatch, 對window派發事件; 滑鼠事件之target預設為該座標堆疊最上層元素(同瀏覽器)
    env.winDispatch = (name, e = {}) => {
        let tar = {}
        if (!('target' in e) && e.clientX !== undefined) {
            tar.target = (env.stacks.get(`${e.clientX},${e.clientY}`) || [])[0] || null
        }
        let ev = mkEvent(name, { ...tar, ...e })
        fireWin(ev)
        return ev
    }
    env.nWinListeners = (name) => winListeners.filter((l) => name === undefined || l.name === name).length

    let body = new Ele('body')
    env.body = body
    env.Ele = Ele

    //document
    env.document = {
        createElement: (tag) => new Ele(tag),
        querySelector: (q) => (q === 'body' ? body : null),
        elementsFromPoint: (x, y) => {
            return env.stacks.get(`${x},${y}`) || []
        },
    }

    //setStack, 指定座標之元素堆疊(由上而下)
    env.setStack = (x, y, els) => {
        env.stacks.set(`${x},${y}`, els)
    }

    //previews, 目前body下之預覽容器數
    let walkCount = (e, f) => {
        let n = 0
        for (let c of e.children) {
            if (f(c)) {
                n++
            }
            n += walkCount(c, f)
        }
        return n
    }
    env.previews = () => walkCount(body, (c) => c.getAttribute('dragpreviewid') !== null)

    globalThis.window = env.window
    globalThis.document = env.document
    return env
}


//clearFakeDom, 移除mkFakeDom設定之全域
function clearFakeDom() {
    delete globalThis.window
    delete globalThis.document
}


//trackIntervals, 追蹤setInterval之存活數, 回傳{ active(), restore() }
function trackIntervals() {
    let si = globalThis.setInterval
    let ci = globalThis.clearInterval
    let act = new Set()
    globalThis.setInterval = (fn, ms) => {
        let id = si(fn, ms)
        act.add(id)
        return id
    }
    globalThis.clearInterval = (id) => {
        act.delete(id)
        return ci(id)
    }
    return {
        active: () => act.size,
        restore: () => {
            for (let id of act) {
                ci(id)
            }
            globalThis.setInterval = si
            globalThis.clearInterval = ci
        },
    }
}


//tick, 等待一個macrotask(其前之microtask皆已執行)
function tick() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}


export {
    mkFakeDom,
    clearFakeDom,
    trackIntervals,
    tick
}
