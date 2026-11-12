//browserFakeKit, 供browserView系、openLink、domAlert之單元測試使用之最小假window與document(ws430), 並覆蓋全域window與document
//  可觀察: createElement(所建元素清單)、appendChild/removeChild、元素之click、window.open(呼叫與回傳)、URL.createObjectURL/revokeObjectURL(呼叫與Blob)、addEventListener與事件派送
//  計時器不在此替身, 由測試以node:test之mock.timers假時鐘控制(setTimeout、setInterval、Date)
//  瀏覽器本身之語義(彈出視窗攔截、Blob網址之載入、innerHTML之解析、樣式計算與版面)非本檔所能驗證, 另以真Chromium實測(不納入本套件測試)


//mkBrowserFake, 建立並安裝假環境
//  o.open: 'window'(預設, 回傳假分頁物件)、'null'(模擬被攔截回null)、'throw'(拋錯)
//  o.createObjectURL: 'ok'(預設)、'missing'(無此函數)、'throw'(拋錯)
//  o.noBody: true時document.body為null
function mkBrowserFake(o = {}) {
    let env = {
        created: [], //所有createElement建立之元素
        opens: [], //window.open之參數
        urls: [], //createObjectURL之{ url, blob }
        revokes: [], //revokeObjectURL之url
        clicks: [], //元素click時之{ tag, href, target, connected }
    }
    let nUrl = 0

    class Ele {
        constructor(tag) {
            this.nodeType = 1
            this.tagName = String(tag).toUpperCase()
            this.attrs = new Map()
            this.style = {}
            this.children = []
            this.parentNode = null
            this.listeners = []
            this.innerHTML = ''
            this.offsetHeight = 40
            this.id = ''
            this.href = ''
            this.target = ''
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

        setAttribute(k, v) {
            this.attrs.set(k, String(v))
        }

        getAttribute(k) {
            return this.attrs.has(k) ? this.attrs.get(k) : null
        }

        removeAttribute(k) {
            this.attrs.delete(k)
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
            if (i < 0) {
                throw new Error('fake: not a child')
            }
            this.children.splice(i, 1)
            c.parentNode = null
            return c
        }

        addEventListener(name, fn) {
            this.listeners.push({ name, fn })
        }

        removeEventListener(name, fn) {
            let i = this.listeners.findIndex((l) => l.name === name && l.fn === fn)
            if (i >= 0) {
                this.listeners.splice(i, 1)
            }
        }

        nListeners(name) {
            return this.listeners.filter((l) => l.name === name).length
        }

        //dispatch, 對本元素派發事件(不冒泡)
        dispatch(name) {
            let ev = { type: name, target: this, currentTarget: this }
            for (let l of this.listeners.slice()) {
                if (l.name === name) {
                    l.fn(ev)
                }
            }
            return ev
        }

        click() {
            env.clicks.push({ tag: this.tagName, href: this.href, target: this.target, connected: this.isConnected })
            this.dispatch('click')
        }

        //find, 以條件找子孫元素(深度優先)
        find(f) {
            for (let c of this.children) {
                if (f(c)) {
                    return c
                }
                let r = c.find(f)
                if (r) {
                    return r
                }
            }
            return null
        }

        querySelector(q) {
            if (typeof q === 'string' && q.startsWith('#')) {
                let id = q.substring(1)
                return this.find((e) => e.id === id)
            }
            return null
        }
    }

    let body = new Ele('body')
    env.body = body
    env.Ele = Ele

    env.document = {
        body: o.noBody ? null : body,
        createElement: (tag) => {
            let e = new Ele(tag)
            env.created.push(e)
            return e
        },
        querySelector: (q) => {
            if (q === 'body') {
                return o.noBody ? null : body
            }
            return body.querySelector(q)
        },
    }

    let URLf = {}
    if (o.createObjectURL !== 'missing') {
        URLf.createObjectURL = (blob) => {
            if (o.createObjectURL === 'throw') {
                throw new Error('fake createObjectURL failed')
            }
            nUrl++
            let url = `blob:fake/${nUrl}`
            env.urls.push({ url, blob })
            return url
        }
        URLf.revokeObjectURL = (url) => {
            env.revokes.push(url)
        }
    }

    env.window = {
        URL: URLf,
        open: (url) => {
            env.opens.push(url)
            if (o.open === 'null') {
                return null
            }
            if (o.open === 'throw') {
                throw new Error('fake open failed')
            }
            return { closed: false }
        },
    }

    saveGlobals()
    globalThis.window = env.window
    globalThis.document = env.document
    return env
}


//保存首次安裝前之全域window、document描述符(連續mk而未clear者只保存一次), clearBrowserFake時還原
let saved = null
function saveGlobals() {
    if (saved !== null) {
        return
    }
    saved = {
        window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
        document: Object.getOwnPropertyDescriptor(globalThis, 'document'),
    }
}


//clearBrowserFake, 移除mkBrowserFake設定之全域, 並還原安裝前之描述符(原本不存在者刪除); 未安裝(含連續呼叫)時不動作, 為冪等
function clearBrowserFake() {
    if (saved === null) {
        return
    }
    for (let k of ['window', 'document']) {
        delete globalThis[k]
        let d = saved !== null ? saved[k] : undefined
        if (d !== undefined) {
            Object.defineProperty(globalThis, k, d)
        }
    }
    saved = null
}


//track, 追蹤Promise之狀態(st.v為'pending'、'resolved'、'rejected'), 不等待計時器; 非thenable者st.v為'not-promise'
function track(p) {
    let st = { v: 'pending' }
    if (!p || typeof p.then !== 'function') {
        st.v = 'not-promise'
        return st
    }
    p.then(() => {
        st.v = 'resolved'
    }, () => {
        st.v = 'rejected'
    })
    return st
}


//flush, 執行已排入之微任務(不經計時器, 故假時鐘下亦可用)
async function flush(n = 10) {
    for (let i = 0; i < n; i++) {
        await Promise.resolve()
    }
}


export {
    mkBrowserFake,
    clearBrowserFake,
    track,
    flush
}
