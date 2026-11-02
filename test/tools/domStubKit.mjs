//domStubKit.mjs: 載入「於Node內無法直接載入或須替身之前端模組」之測試共用載具(ws272c)
//  問題: domShowImages(viewerjs與其css)、domTooltip(tippy.js與其css)於Node無法載入(.css副檔名); domConvertToPic(@zumer/snapdom)須觀察傳入之scale; domShowInputAndGetFilesU8Arrs須觀察轉交給domShowInputAndGetFiles之選項
//  作法: 以node:module之register註冊解析/載入掛鉤, 僅對「以?stub=N為查詢字串載入之src模組」生效(其餘模組載入不受影響): .css換為空模組, viewerjs/tippy.js/@zumer/snapdom/./domShowInputAndGetFiles.mjs換為記錄呼叫之替身;
//        替身模組在主執行緒內執行(掛鉤只轉換原始碼), 以globalThis.__ws272cStub記錄呼叫供測試斷言; 不新增依賴
//  用法: let domShowImages = await loadStubbed('domShowImages'); resetStub(); ...; stub().viewers
import { register } from 'node:module'


//替身模組原始碼(皆於主執行緒執行, 以globalThis.__ws272cStub記錄)
//注意: 記錄物件於呼叫當下才取(resetStub會換新物件), 不可於模組載入時取一次
let SRC_VIEWER = [
    'let S = () => globalThis.__ws272cStub',
    'export default class Viewer {',
    '    constructor(img, opts) {',
    '        this.img = img',
    '        this.opts = opts',
    '        this.viewer = S().viewerEle',
    '        S().viewers.push(this)',
    '    }',
    '    show() {',
    '        if (this.opts.shown) {',
    '            this.opts.shown()',
    '        }',
    '    }',
    '    hide(b) {',
    '        S().hides.push(b)',
    '    }',
    '    destroy() {',
    '        S().destroys++',
    '    }',
    '}',
].join('\n')

let SRC_TIPPY = [
    'let S = () => globalThis.__ws272cStub',
    'export default function tippy(ele, opts) {',
    '    let tp = {',
    '        shown: 0,',
    '        destroyed: 0,',
    '        show() {',
    '            tp.shown++',
    '        },',
    '        destroy() {',
    '            tp.destroyed++',
    '        },',
    '    }',
    '    S().tippyCalls.push({ ele, opts, tp })',
    '    return tp',
    '}',
].join('\n')

let SRC_SNAPDOM = [
    'let S = () => globalThis.__ws272cStub',
    'let mk = (kind) => async (el, o) => {',
    '    S().snapCalls.push({ kind, o })',
    '    return { src: \'data:image/png;base64,AAAA\' }',
    '}',
    'export const snapdom = { toPng: mk(\'png\'), toJpg: mk(\'jpg\'), toSvg: mk(\'svg\') }',
].join('\n')

let SRC_DSIAGF = [
    'let S = () => globalThis.__ws272cStub',
    'export default function domShowInputAndGetFiles(opt) {',
    '    S().dsiagfCalls.push(opt)',
    '    return new Promise(() => {})',
    '}',
].join('\n')

let SRC_EMPTY = 'export default {}'


//掛鉤(於另一執行緒執行, 不可引用本檔之變數): 依parentURL是否含?stub=決定是否替換
let HOOK = [
    'const MAP = {',
    '    \'viewerjs\': \'stub:viewerjs\',',
    '    \'tippy.js\': \'stub:tippy\',',
    '    \'@zumer/snapdom\': \'stub:snapdom\',',
    '    \'./domShowInputAndGetFiles.mjs\': \'stub:dsiagf\',',
    '}',
    'export async function resolve(specifier, context, nextResolve) {',
    '    if (context.parentURL && context.parentURL.includes(\'?stub=\')) {',
    '        if (context.parentURL.includes(\'nodayjs=1\')) {',
    '            //dayjs不可用: dayjs換為undefined, 且其相對匯入之整條依賴鏈沿用同一查詢字串載入(使鏈內各模組之dayjs皆為undefined)',
    '            if (specifier === \'dayjs\') {',
    '                return { url: \'stub:dayjsMissing\', shortCircuit: true }',
    '            }',
    '            if (specifier.startsWith(\'./\')) {',
    '                let r = await nextResolve(specifier, context)',
    '                return { ...r, url: r.url + new URL(context.parentURL).search, shortCircuit: true }',
    '            }',
    '        }',
    '        if (specifier.endsWith(\'.css\')) {',
    '            return { url: \'stub:css\', shortCircuit: true }',
    '        }',
    '        if (Object.prototype.hasOwnProperty.call(MAP, specifier)) {',
    '            return { url: MAP[specifier], shortCircuit: true }',
    '        }',
    '    }',
    '    return nextResolve(specifier, context)',
    '}',
    'const SRC = ' + JSON.stringify({ 'stub:css': SRC_EMPTY, 'stub:viewerjs': SRC_VIEWER, 'stub:tippy': SRC_TIPPY, 'stub:snapdom': SRC_SNAPDOM, 'stub:dsiagf': SRC_DSIAGF, 'stub:dayjsMissing': 'export default undefined' }),
    'export async function load(url, context, nextLoad) {',
    '    if (Object.prototype.hasOwnProperty.call(SRC, url)) {',
    '        return { format: \'module\', source: SRC[url], shortCircuit: true }',
    '    }',
    '    return nextLoad(url, context)',
    '}',
].join('\n')


let registered = false
let seq = 0


//stub, 目前之替身記錄
function stub() {
    return globalThis.__ws272cStub
}


//resetStub, 重設替身記錄(每案開始前呼叫)
function resetStub() {
    globalThis.__ws272cStub = {
        viewers: [],
        hides: [],
        destroys: 0,
        viewerEle: null,
        tippyCalls: [],
        snapCalls: [],
        dsiagfCalls: [],
    }
    return globalThis.__ws272cStub
}


//loadStubbed, 以替身載入src內之模組(每次呼叫為獨立之模組實例), 回傳其預設匯出
async function loadStubbed(name, o = {}) {
    if (!registered) {
        register('data:text/javascript,' + encodeURIComponent(HOOK), import.meta.url)
        registered = true
    }
    if (!globalThis.__ws272cStub) {
        resetStub()
    }
    seq++
    //o.noDayjs為true時, 模組鏈內之dayjs為undefined(模擬UMD未載入dayjs全域)
    let url = new URL(`../../src/${name}.mjs?stub=${seq}${o.noDayjs === true ? '&nodayjs=1' : ''}`, import.meta.url).href
    let m = await import(url)
    return m.default
}


export { loadStubbed, resetStub, stub }
