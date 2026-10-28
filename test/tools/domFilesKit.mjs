//domFilesKit.mjs: domDropFiles、domShowInputAndGetFiles、domShowInputDatatime之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  mkBrowser: 最小假瀏覽器環境(覆蓋全域window、document、MouseEvent), 只實作三函數(含其依賴之domAppend、domFind、domRemove、domTriggerEvent、domGetFiles、domCancelEvent)用到者:
//    元素: 屬性、子節點、insertAdjacentHTML('beforeend')與innerHTML(僅解析<tag attr="v" bool />之簡單標籤)、insertBefore、監聽(含capture旗標)與dispatchEvent、input之value與files與showPicker
//    document: querySelector/querySelectorAll只支援'body'、'#id'、'[name=x]'、'tag'; activeElement可由測試指定
//    瀏覽器本身之語義(原生選檔視窗、focus與change之先後、拖放事件派送)非本檔所能驗證, 由測試依各函數註解所載之實測現象手動依序派發事件模擬
//  mkDataTransfer: 拖放之dataTransfer替身(files與items.webkitGetAsEntry)
//  fiveOnTrace、collectUnhandled、mkMeta: P3/P4之五種回調、未處理rejection收集、事件凍結與接收者檢查


//parse, 解析簡單html為元素樹: 只支援<tag attr="v" bool />, input視為不需結束標籤, 文字節點忽略
function parse(env, html) {
    let roots = []
    let stack = []
    let re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g
    let m
    while ((m = re.exec(html)) !== null) {
        let close = m[1]
        let tag = m[2]
        let attrs = m[3]
        let selfClose = m[4]
        if (close) {
            stack.pop()
            continue
        }
        let el = new FEle(env, tag)
        let ra = /([\w-]+)(?:="([^"]*)")?/g
        let a
        while ((a = ra.exec(attrs)) !== null) {
            el.setAttribute(a[1], a[2] === undefined ? '' : a[2])
        }
        if (stack.length > 0) {
            stack[stack.length - 1].appendChild(el)
        }
        else {
            roots.push(el)
        }
        if (!selfClose && tag.toLowerCase() !== 'input') {
            stack.push(el)
        }
    }
    return roots
}


class FEle {

    constructor(env, tag = 'div') {
        this.env = env
        this.nodeType = 1
        this.nodeName = String(tag).toUpperCase()
        this.tagName = this.nodeName
        this.attrs = new Map()
        this.children = []
        this.parentNode = null
        this.style = {}
        this.listeners = []
        this._value = undefined
        this.files = []
    }

    get nextSibling() {
        if (!this.parentNode) {
            return null
        }
        let a = this.parentNode.children
        return a[a.indexOf(this) + 1] || null
    }

    get value() {
        if (this._value !== undefined) {
            return this._value
        }
        return this.attrs.has('value') ? this.attrs.get('value') : ''
    }

    set value(v) {
        this._value = v
    }

    get innerHTML() {
        return ''
    }

    set innerHTML(html) {
        for (let c of this.children) {
            c.parentNode = null
        }
        this.children = []
        for (let c of parse(this.env, html)) {
            this.appendChild(c)
        }
    }

    setAttribute(k, v) {
        this.attrs.set(k, String(v))
    }

    getAttribute(k) {
        return this.attrs.has(k) ? this.attrs.get(k) : null
    }

    hasAttribute(k) {
        return this.attrs.has(k)
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

    insertBefore(c, ref) {
        if (c.parentNode) {
            c.parentNode.removeChild(c)
        }
        c.parentNode = this
        let i = ref ? this.children.indexOf(ref) : -1
        if (i < 0) {
            this.children.push(c)
        }
        else {
            this.children.splice(i, 0, c)
        }
        return c
    }

    insertAdjacentHTML(pos, html) {
        if (pos !== 'beforeend') {
            throw new Error('FEle.insertAdjacentHTML: only beforeend is supported')
        }
        for (let c of parse(this.env, html)) {
            this.appendChild(c)
        }
    }

    addEventListener(name, fn, opt) {
        this.listeners.push({ name, fn, capture: typeof opt === 'boolean' ? opt : !!(opt && opt.capture) })
    }

    removeEventListener(name, fn, opt) {
        let capture = typeof opt === 'boolean' ? opt : !!(opt && opt.capture)
        let i = this.listeners.findIndex((l) => l.name === name && l.fn === fn && l.capture === capture)
        if (i >= 0) {
            this.listeners.splice(i, 1)
        }
    }

    nListeners(name) {
        return this.listeners.filter((l) => name === undefined || l.name === name).length
    }

    //dispatchEvent, 以本元素為this同步呼叫監聽器(同瀏覽器), 並於事件類型為click時通知env.onClick(模擬原生選檔視窗被開啟)
    dispatchEvent(ev) {
        if (ev.target === undefined) {
            ev.target = this
        }
        for (let l of this.listeners.slice()) {
            if (l.name === ev.type) {
                l.fn.call(this, ev)
            }
        }
        if (ev.type === 'click' && this.env.onClick) {
            this.env.onClick(this)
        }
        return true
    }

    showPicker() {
        this.env.nShowPicker++
        if (this.env.onShowPicker) {
            this.env.onShowPicker(this)
        }
    }

}


//mkBrowser, 建立假瀏覽器並覆蓋全域; 用畢須呼叫restore
function mkBrowser() {
    let env = {
        onClick: null, //(inp)=>{}, input被click(模擬原生選檔視窗開啟)時呼叫
        onShowPicker: null, //(inp)=>{}, showPicker被呼叫時
        nShowPicker: 0,
    }

    let body = new FEle(env, 'body')
    env.body = body

    //walk
    let walk = (root, pred, out) => {
        for (let c of root.children) {
            if (pred(c)) {
                out.push(c)
            }
            walk(c, pred, out)
        }
        return out
    }

    //pred, 支援'#id'、'[name=x]'、'tag'
    let mkPred = (sel) => {
        let m = null
        if ((m = /^#(.+)$/.exec(sel)) !== null) {
            return (e) => e.getAttribute('id') === m[1]
        }
        if ((m = /^\[name=["']?([^"'\]]+)["']?\]$/.exec(sel)) !== null) {
            return (e) => e.getAttribute('name') === m[1]
        }
        if (/^[a-zA-Z]+$/.test(sel)) {
            return (e) => e.tagName === sel.toUpperCase()
        }
        throw new Error(`mkBrowser: unsupported selector ${sel}`)
    }

    let document = {
        activeElement: body,
        createElement: (tag) => new FEle(env, tag),
        querySelector: (sel) => {
            if (sel === 'body') {
                return body
            }
            return walk(body, mkPred(sel), [])[0] || null
        },
        querySelectorAll: (sel) => walk(body, mkPred(sel), []),
    }
    env.document = document

    //window
    let winListeners = []
    let window = {
        document,
        addEventListener: (name, fn, opt) => {
            winListeners.push({ name, fn, opt })
        },
        removeEventListener: (name, fn) => {
            let i = winListeners.findIndex((l) => l.name === name && l.fn === fn)
            if (i >= 0) {
                winListeners.splice(i, 1)
            }
        },
        nListeners: (name) => winListeners.filter((l) => name === undefined || l.name === name).length,
        dispatch: (name, e = {}) => {
            let ev = { type: name, ...e }
            for (let l of winListeners.slice()) {
                if (l.name === name) {
                    l.fn.call(window, ev)
                }
            }
            return ev
        },
    }
    env.window = window

    class MouseEvent {
        constructor(type, init = {}) {
            this.type = type
            Object.assign(this, init)
        }
    }

    //覆蓋全域, restore還原
    let keys = ['window', 'document', 'MouseEvent']
    let vals = { window, document, MouseEvent }
    let prev = {}
    for (let k of keys) {
        prev[k] = Object.getOwnPropertyDescriptor(globalThis, k)
        Object.defineProperty(globalThis, k, { value: vals[k], configurable: true, writable: true, enumerable: false })
    }
    env.restore = () => {
        for (let k of keys) {
            delete globalThis[k]
            if (prev[k]) {
                Object.defineProperty(globalThis, k, prev[k])
            }
        }
    }

    //mkEle, 建立元素並接到body下(isConnected概念), 供當作觸發元素
    env.mkEle = (tag = 'button') => {
        let e = new FEle(env, tag)
        body.appendChild(e)
        return e
    }

    return env
}


//mkFile, 檔案替身(size單位mb)
function mkFile(name, sizeMb = 0.001, type = 'text/plain') {
    return { name, type, size: Math.round(sizeMb * 1024 * 1024) }
}


//mkEntry, FileSystemEntry替身: { file: 'a.txt' }為檔案(failRead為true時讀取失敗)、{ dir: 'd', children: [...] }為資料夾
function mkEntry(spec) {
    if (spec.dir !== undefined) {
        return {
            isFile: false,
            isDirectory: true,
            name: spec.dir,
            fullPath: '/' + spec.dir,
            createReader: () => ({ readEntries: (ok) => ok((spec.children || []).map(mkEntry)) }),
        }
    }
    return {
        isFile: true,
        isDirectory: false,
        name: spec.file,
        fullPath: '/' + spec.file,
        file: (ok, ng) => {
            if (spec.failRead) {
                ng(new Error('read fail'))
            }
            else {
                ok(mkFile(spec.file))
            }
        },
    }
}


//mkDataTransfer, dataTransfer替身: files為File替身陣列(無type者domDropFiles略過)、entries為mkEntry之規格陣列(items.webkitGetAsEntry回傳)
function mkDataTransfer({ files = [], entries = [] } = {}) {
    return {
        files,
        items: entries.map((spec) => ({ webkitGetAsEntry: () => mkEntry(spec) })),
    }
}


//mkDragEvent, 拖放事件替身(可取消, domCancelEvent會呼叫stopPropagation與preventDefault)
function mkDragEvent(type, dataTransfer) {
    let ev = {
        type,
        cancelable: true,
        defaultPrevented: false,
        dataTransfer,
        stopPropagation: () => {},
        preventDefault: () => {
            ev.defaultPrevented = true
        },
    }
    return ev
}


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


//collectUnhandled, 掛上unhandledRejection收集器; stop()移除, list為已收集之字串
function collectUnhandled() {
    let list = []
    let on = (v) => list.push(String(v))
    process.on('unhandledRejection', on)
    return { list, stop: () => process.off('unhandledRejection', on) }
}


//mkMeta, 包裝onTrace以記錄每個事件通知當下之[this, 是否凍結]
function mkMeta(on) {
    let meta = []
    let fn = function(e) {
        meta.push([this, Object.isFrozen(e)])
        on(e)
    }
    return { fn, meta }
}


//flush, 以真實setImmediate讓出事件迴圈, 使已可進行之microtask全數執行
const realSetImmediate = setImmediate
function flush() {
    return new Promise((resolve) => realSetImmediate(resolve))
}


export { FEle, mkBrowser, mkFile, mkEntry, mkDataTransfer, mkDragEvent, fiveOnTrace, collectUnhandled, mkMeta, flush }
