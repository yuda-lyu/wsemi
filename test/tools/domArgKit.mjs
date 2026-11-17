//domArgKit.mjs: DOM函數之輸入檢測測試共用載具(ws492e, 排程第492項第4批)
//  作法: 以domEditKit.mjs之mkEditDom(fakeDom.mjs為底)為基礎, 補:
//    NOT_ESTR: 非「非空原始字串」之值(含包裝物件new String)
//    mkQueryEnv: 假document.querySelector/querySelectorAll, 仿原生語義: 參數經String()強制轉成字串當選擇器(null→'null'、5→'5'),
//      選擇器語法不合(如'5'、'[[')拋SyntaxError(訊息含選擇器全文, 供驗不外洩), 呼叫皆記錄於env.qcalls(供驗「檢測先於呼叫原生API」)
//      只支援'#id'、'.cls'、'tag'、'[name=value]'或'[name]'
//    mkEvent: 事件物件(cancelable、stopPropagation、preventDefault之呼叫記錄)
//  瀏覽器本身之語義(真實選擇器解析、事件派送、捲動)非本檔所能驗證, 另以真瀏覽器實測(見報告)
import { mkEditDom, NOT_ELE } from './domEditKit.mjs'


//NOT_ESTR, 非非空原始字串之值; [標籤, 值]
const NOT_ESTR = [
    ['undefined', undefined],
    ['null', null],
    [`''`, ''],
    ['0', 0],
    ['5', 5],
    ['NaN', NaN],
    ['true', true],
    ['{}', {}],
    ['[]', []],
    [`['#a']`, ['#a']],
    ['function', () => {}],
    ['Symbol', Symbol('x')],
    ['new String', new String('#a')], // eslint-disable-line no-new-wrappers
]


//SIMPLE, 假選擇器支援之簡單語法
const SIMPLE = /^(#[A-Za-z_][\w-]*|\.[A-Za-z_][\w-]*|[A-Za-z][\w-]*|\[[A-Za-z][\w-]*(=[\w-]+)?\])$/


//mkQueryEnv, 於mkEditDom之上補假querySelector/querySelectorAll; 用畢呼叫env.restore()
function mkQueryEnv() {
    let env = mkEditDom()

    //qcalls, 呼叫原生查詢API之紀錄: { fn, arg }
    env.qcalls = []

    //mk, 建立元素並接於body下; o: { id, cls, name }
    env.mk = (tag = 'div', o = {}) => {
        let e = new env.Ele(tag)
        if (o.id) {
            e.setAttribute('id', o.id)
        }
        if (o.cls) {
            e.setAttribute('class', o.cls)
        }
        if (o.name) {
            e.setAttribute('name', o.name)
        }
        env.body.appendChild(e)
        return e
    }

    //walk, 深度優先走訪body下全部元素
    let walk = (e, out) => {
        for (let c of e.children) {
            out.push(c)
            walk(c, out)
        }
        return out
    }

    //match
    let match = (e, sel) => {
        if (sel[0] === '#') {
            return e.getAttribute('id') === sel.slice(1)
        }
        if (sel[0] === '.') {
            return String(e.getAttribute('class') || '').split(/\s+/).includes(sel.slice(1))
        }
        if (sel[0] === '[') {
            let [k, v] = sel.slice(1, -1).split('=')
            return v === undefined ? e.getAttribute(k) !== null : e.getAttribute(k) === v
        }
        return e.tagName === sel.toUpperCase()
    }

    //check, 仿原生: 參數經String()強制轉成字串, 語法不合拋SyntaxError(訊息含選擇器全文)
    let check = (fn, q) => {
        env.qcalls.push({ fn, arg: q })
        let s = typeof q === 'symbol' ? null : String(q)
        if (s === null || !SIMPLE.test(s)) {
            throw new SyntaxError(`Failed to execute '${fn}' on 'Document': '${String(s)}' is not a valid selector.`)
        }
        return s
    }

    let rawQuery = env.document.querySelector
    env.document.querySelector = (q) => {
        if (q === 'body') {
            return rawQuery(q)
        }
        let s = check('querySelector', q)
        let r = walk(env.body, []).find((e) => match(e, s))
        return r === undefined ? null : r
    }
    env.document.querySelectorAll = (q) => {
        let s = check('querySelectorAll', q)
        let r = walk(env.body, []).filter((e) => match(e, s))
        r.item = (i) => r[i] || null //NodeList有item
        return r
    }

    return env
}


//mkEvent, 事件物件; o: { cancelable, throwOn: 'stopPropagation'|'preventDefault' }
function mkEvent(o = {}) {
    let ev = {
        cancelable: o.cancelable === undefined ? true : o.cancelable,
        calls: [],
        stopPropagation() {
            ev.calls.push('stopPropagation')
            if (o.throwOn === 'stopPropagation') {
                throw new Error('boom')
            }
        },
        preventDefault() {
            ev.calls.push('preventDefault')
            if (o.throwOn === 'preventDefault') {
                throw new Error('boom')
            }
        },
    }
    return ev
}


//mkDownloadEnv, 於mkEditDom之上補downloadFileFrom*用到之瀏覽器介面: window.document(使isWindow為true)、元素之click(記錄href、download與點擊當下是否已接於頁面)、window.URL.createObjectURL/revokeObjectURL(記錄); 用畢呼叫env.restore()
//  真實下載(瀏覽器之儲存行為)非本檔所能驗證, 另以真瀏覽器實測
function mkDownloadEnv() {
    let env = mkEditDom()
    env.window.document = env.document
    env.clicks = []
    env.urls = []
    env.revoked = []
    env.Ele.prototype.click = function() {
        env.clicks.push({ href: this.href, download: this.download, connected: this.isConnected })
    }
    env.window.URL = {
        createObjectURL: (blob) => {
            env.urls.push(blob)
            return `blob:fake-${env.urls.length}`
        },
        revokeObjectURL: (u) => {
            env.revoked.push(u)
        },
    }
    //nothing, 無效輸入時未建立任何元素、未點擊、未建立網址
    env.nothing = () => env.created.length === 0 && env.clicks.length === 0 && env.urls.length === 0 && env.body.children.length === 0
    return env
}


//fadeTrace, 呼叫domFadeIn或domFadeOut(須先以mock.timers.enable({ apis: ['setTimeout', 'setInterval'] })啟用假計時器), 每推進step毫秒記錄一次ele.style.opacity(尚未設定為undefined), 共steps次
function fadeTrace(mock, fn, env, opt, steps = 40, step = 10) {
    let ele = env.mk('div')
    let tr = []
    fn(ele, opt)
    for (let i = 0; i < steps; i++) {
        mock.timers.tick(step)
        tr.push(ele.style.opacity)
    }
    return tr
}


export { NOT_ELE, NOT_ESTR, mkQueryEnv, mkDownloadEnv, mkEvent, fadeTrace }
