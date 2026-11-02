//domEditKit.mjs: domIsFocused、domAppend、domPrepend、copyStrToClipboard 與其內部呼叫端之測試共用載具(ws286a)
//  作法: 以fakeDom.mjs之mkFakeDom為底(覆蓋全域window與document), 於該次mkFakeDom產生之Ele類別補上這幾個函數用到之真DOM語義:
//    insertAdjacentHTML('beforeend'|'afterbegin')以標記子節點('#html'元素, 帶html字串)落於末端/前端, 可驗插入位置
//    insertBefore(c, ref)與firstChild; removeChild遇非子節點拋錯(同真DOM之NotFoundError, 供驗清理不覆蓋原錯誤); select()
//    document.body、document.activeElement、document.createElement(記錄所建元素)、document.execCommand(記錄呼叫當下之焦點元素與其value)
//  env.ops: 對DOM之寫入操作紀錄(appendChild/insertBefore/insertAdjacentHTML/removeChild), 無效輸入須先於任何副作用故其長度須為0
//  瀏覽器本身之語義(真實焦點判定、剪貼簿權限、execCommand之實際複製)非本檔所能驗證, 另須於瀏覽器實測
import { mkFakeDom, clearFakeDom } from './fakeDom.mjs'


//NOT_ELE, 非DOM元素之值(isEle為false), 含帶nodeType=1之純物件; [標籤, 值]
const NOT_ELE = [
    ['undefined', undefined],
    ['null', null],
    [`''`, ''],
    [`'div'`, 'div'],
    [`'#id'`, '#id'],
    ['0', 0],
    ['1', 1],
    ['NaN', NaN],
    ['true', true],
    ['{}', {}],
    ['[]', []],
    ['plain object with nodeType 1', { nodeType: 1 }],
    ['function', () => {}],
    ['Symbol', Symbol('x')],
]


//mkEditDom, 建立假DOM並補上真DOM語義; 用畢呼叫env.restore()
function mkEditDom() {
    let env = mkFakeDom()
    let P = env.Ele.prototype

    //ops
    env.ops = []

    //removeChild, 非子節點拋錯(同真DOM)
    let rawRemoveChild = P.removeChild
    P.removeChild = function(c) {
        if (!this.children.includes(c)) {
            throw new Error('NotFoundError')
        }
        env.ops.push('removeChild')
        return rawRemoveChild.call(this, c)
    }

    //appendChild
    let rawAppendChild = P.appendChild
    P.appendChild = function(c) {
        env.ops.push('appendChild')
        return rawAppendChild.call(this, c)
    }

    //insertBefore, ref為null時接於末端(同真DOM)
    P.insertBefore = function(c, ref) {
        env.ops.push('insertBefore')
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

    //firstChild
    Object.defineProperty(P, 'firstChild', {
        configurable: true,
        get() {
            return this.children[0] || null
        },
    })

    //insertAdjacentHTML, 以標記子節點('#html'元素, html欄位為插入之字串)代表插入結果
    P.insertAdjacentHTML = function(pos, html) {
        env.ops.push(`insertAdjacentHTML:${pos}`)
        let m = new env.Ele('#html')
        m.html = html
        m.parentNode = this
        if (pos === 'afterbegin') {
            this.children.unshift(m)
        }
        else if (pos === 'beforeend') {
            this.children.push(m)
        }
        else {
            throw new Error('mkEditDom: unsupported position')
        }
    }

    //select, focusOnSelect為true時取得焦點(document.activeElement=本元素), 為false時維持原焦點(模擬鎖定焦點區域內無法聚焦)
    env.focusOnSelect = true
    env.selects = []
    P.select = function() {
        env.selects.push(this)
        if (env.focusOnSelect) {
            env.document.activeElement = this
        }
    }

    //document
    env.document.body = env.body
    env.document.activeElement = env.body

    //createElement, 記錄所建元素
    env.created = []
    env.document.createElement = (tag) => {
        let e = new env.Ele(tag)
        env.created.push(e)
        return e
    }

    //execCommand, 記錄呼叫當下之焦點元素(value與是否在頁面中), copyMode: 'ok'回true、'false'回false、'throw'拋錯; onCopy(焦點元素)供測試於複製當下動手腳
    env.copyMode = 'ok'
    env.copyCalls = []
    env.onCopy = null
    env.document.execCommand = (cmd) => {
        let ae = env.document.activeElement
        env.copyCalls.push({ cmd, value: ae ? ae.value : undefined, connected: Boolean(ae && ae.isConnected), tag: ae ? ae.tagName : '' })
        if (env.onCopy) {
            env.onCopy(ae)
        }
        if (env.copyMode === 'throw') {
            throw new Error('internal-detail-boom')
        }
        return env.copyMode !== 'false'
    }

    //mkParent, 建立接於body下之容器元素
    env.mkParent = (tag = 'div') => {
        let e = new env.Ele(tag)
        rawAppendChild.call(env.body, e)
        return e
    }

    //resetOps, 清空操作紀錄與所建元素/呼叫紀錄(佈置完成後呼叫)
    env.resetOps = () => {
        env.ops.length = 0
        env.created.length = 0
        env.selects.length = 0
        env.copyCalls.length = 0
    }

    //snap, 以字串表示目前body下整棵樹(標籤、標記節點之html), 供驗DOM未被變動
    let walk = (e) => `${e.tagName}${e.html !== undefined ? `[${e.html}]` : ''}(${e.children.map(walk).join(',')})`
    env.snap = () => walk(env.body)

    env.restore = clearFakeDom
    return env
}


export { NOT_ELE, mkEditDom }
