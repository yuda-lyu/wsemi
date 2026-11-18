//execArgGuardRunner.mjs: R-EXEC-ARG-01(execProcess之prog與args、execProcessKillPid之pid之輸入檢測)之子行程執行器
//  於獨立子行程以「攔截替身」取代child_process之spawn、exec、execFile(與process.kill), 記錄呼叫次數並阻擋, 替身一律不呼叫真實之函數, 故任何輸入(含修前之碼、含0與負數之pid)皆不可能真的建立程序或殺程序:
//    驗「無效輸入先於任何程序之建立或殺程序(V17)」以攔截記錄為準(不是看結果字串), 並以有效輸入之對照案證明替身確實計到呼叫(陽性對照, 不使「0次」流於空洞)
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得, 測試複製到修前副本旁即測副本之src); 須於替身掛上後才載入被測模組(tree-kill於載入時即取走child_process之spawn與exec)
//  結果以一行'@@R@@'開頭之JSON輸出至stdout, 由呼叫端(runChildCase)剖析; 案例之輸出只含標籤、結果與呼叫之函數名(殺程序案另含呼叫之pid), 不含輸入值
//用法: node test/tools/execArgGuardRunner.mjs <caseName>
/* eslint-disable no-new-wrappers -- 輸入值軸刻意以包裝物件驗證其為無效 */
import cp from 'child_process'
import path from 'path'
import { EventEmitter } from 'events'
import { pathToFileURL, fileURLToPath } from 'url'
import { revoked } from './caseKit.mjs'

let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let [caseName] = process.argv.slice(2)
let node = process.execPath

//--- 攔截替身(須先於載入被測模組) ---
let calls = [] //本案例迄今之呼叫記錄(字串)
let mkChild = (code = 0) => {
    let c = new EventEmitter()
    c.stdout = new EventEmitter()
    c.stderr = new EventEmitter()
    c.pid = 4242
    c.kill = () => true
    setImmediate(() => c.emit('close', code))
    return c
}
let lastFn = (a) => {
    for (let i = a.length - 1; i >= 0; i--) {
        if (typeof a[i] === 'function') {
            return a[i]
        }
    }
    return null
}
let realExec = cp.exec
cp.spawn = (...a) => {
    calls.push(`spawn ${typeof a[0] === 'string' ? a[0].slice(0, 12) : '?'} ${Array.isArray(a[1]) ? a[1].map((x) => String(x).slice(0, 12)).join(' ') : ''}`.trim())
    //POSIX之tree-kill以ps/pgrep找子行程, 無子行程時其離開碼為1(離開碼0而無輸出時tree-kill內部對null呼叫forEach); 其餘(execProcess之子進程)離開碼0
    return mkChild((a[0] === 'ps' || a[0] === 'pgrep') ? 1 : 0)
}
//同步版與fork亦一律攔截(不呼叫真實函數)
cp.spawnSync = () => {
    calls.push('spawnSync')
    return { pid: 0, status: 0, signal: null, output: [null, Buffer.alloc(0), Buffer.alloc(0)], stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) }
}
cp.execSync = () => {
    calls.push('execSync')
    return Buffer.alloc(0)
}
cp.execFileSync = () => {
    calls.push('execFileSync')
    return Buffer.alloc(0)
}
cp.fork = () => {
    calls.push('fork')
    return mkChild()
}
cp.execFile = (...a) => {
    calls.push('execFile')
    let cb = lastFn(a)
    let c = mkChild()
    if (cb) {
        setImmediate(() => cb(null, Buffer.alloc(0), Buffer.alloc(0)))
    }
    return c
}
cp.exec = (...a) => {
    calls.push(`exec ${typeof a[0] === 'string' && /^taskkill /.test(a[0]) ? a[0].slice(0, 40) : (typeof a[0] === 'string' && a[0] === 'chcp' ? 'chcp' : '')}`.trim())
    let cb = lastFn(a)
    let c = mkChild()
    if (cb) {
        setImmediate(() => cb(null, 'Active code page: 65001', ''))
    }
    return c
}
process.kill = (pid, sig) => {
    calls.push(`kill ${pid} ${sig}`)
    return true
}
if (cp.exec === realExec) {
    throw new Error('stub not installed')
}

async function imp(name) {
    return (await import(pathToFileURL(path.join(implDir, name + '.mjs')).href)).default
}

//settle, 等待p之結果, 逾時回{ s: 'pending' }
function settle(p, ms = 8000) {
    return new Promise((resolve) => {
        let t = setTimeout(() => resolve({ s: 'pending' }), ms)
        Promise.resolve(p).then((v) => {
            clearTimeout(t)
            resolve({ s: 'resolve', v: typeof v === 'string' ? v.slice(0, 200) : typeof v })
        }, (e) => {
            clearTimeout(t)
            let v = typeof e === 'string' ? e : (e instanceof Error ? e.message : typeof e)
            resolve({ s: 'reject', v: String(v).slice(0, 300) })
        })
    })
}

//cell, 執行一格並回傳{ k, s, v, calls }, calls為該格期間之攔截記錄(陣列)
async function cell(k, fn) {
    calls = []
    let r
    try {
        r = await settle(fn())
    }
    catch (e) {
        //同步拋出(修前之碼對Symbol、已撤銷之Proxy等同步拋錯; 契約為reject不同步拋)
        r = { s: 'throw', v: String(e instanceof Error ? e.message : typeof e).slice(0, 200) }
    }
    await new Promise((resolve) => setImmediate(resolve))
    await new Promise((resolve) => setImmediate(resolve))
    return { k, ...r, calls: calls.slice() }
}

//輸入值軸(標籤只用於定位, 不含值之內容)
let SECRET = 'SECRET_7d1f'
let progBad = [
    ['undefined', undefined], ['null', null], ['empty', ''], ['zero', 0], ['number', 5], ['NaN', NaN], ['true', true], ['false', false],
    ['object', {}], ['array', []], ['arrayOfStr', ['node']], ['function', () => 'x'], ['symbol', Symbol('s')], ['bigint', 5n],
    ['wrapStr', new String(SECRET)], ['objToString', { toString: () => SECRET }], ['nul', `${SECRET}\0x`], ['nulOnly', '\0'], ['revoked', revoked()],
]
let argsBadContainer = [
    ['undefined', undefined], ['null', null], ['number', 5], ['NaN', NaN], ['true', true], ['object', {}], ['function', () => 'x'], ['symbol', Symbol('s')],
    ['bigint', 5n], ['wrapStr', new String(SECRET)], ['revoked', revoked()], ['fakeTag', { [Symbol.toStringTag]: 'Array', length: 0 }],
]
let argsBadElement = [
    ['undefined', undefined], ['null', null], ['true', true], ['false', false], ['object', {}], ['array', []], ['function', () => 'x'], ['symbol', Symbol('s')],
    ['NaN', NaN], ['Infinity', Infinity], ['-Infinity', -Infinity], ['bigint', 5n], ['wrapStr', new String(SECRET)], ['nul', `${SECRET}\0x`],
]
let modes = [['spawn', {}], ['exec', { mode: 'exec' }], ['execFile', { mode: 'execFile' }], ['spawn+auto', { codeCmd: 'auto' }], ['exec+auto', { mode: 'exec', codeCmd: 'auto' }]]

//--- execProcess ---
let cases = {

    //prog無效 × 模式: 一律reject固定訊息, 且攔截記錄為空(含取系統字碼頁之chcp)
    procBad: async () => {
        let execProcess = await imp('execProcess')
        let out = []
        for (let [mk, opt] of modes) {
            for (let [pk, pv] of progBad) {
                out.push(await cell(`${mk}|${pk}`, () => execProcess(pv, ['-e', '1'], opt)))
            }
        }
        return out
    },

    //args無效(容器與元素) × 模式
    argsBad: async () => {
        let execProcess = await imp('execProcess')
        let out = []
        for (let [mk, opt] of modes) {
            for (let [ak, av] of argsBadContainer) {
                out.push(await cell(`${mk}|container|${ak}`, () => execProcess(node, av, opt)))
            }
            for (let [ak, av] of argsBadElement) {
                out.push(await cell(`${mk}|element|${ak}`, () => execProcess(node, ['-e', av, 'x'], opt))) //元素索引1
            }
            out.push(await cell(`${mk}|string|nul`, () => execProcess(node, `${SECRET}\0x`, opt)))
            out.push(await cell(`${mk}|sparse`, () => execProcess(node, new Array(3), opt)))
            let lengthTrap = new Proxy([], {
                get(t, k) {
                    if (k === 'length') {
                        throw new Error(SECRET)
                    }
                    return t[k]
                },
            })
            out.push(await cell(`${mk}|lengthThrows`, () => execProcess(node, lengthTrap, opt)))
        }
        return out
    },

    //陽性對照: 有效輸入各模式恰建立一個程序(auto者win32另有chcp), 證明替身確實計到呼叫
    procOk: async () => {
        let execProcess = await imp('execProcess')
        let out = []
        for (let [mk, opt] of modes) {
            out.push(await cell(`${mk}|valid`, () => execProcess(node, ['-e', '1', 5, 'a b', ''], opt)))
            out.push(await cell(`${mk}|validStr`, () => execProcess(node, '-v', opt)))
            out.push(await cell(`${mk}|validEmptyArgs`, () => execProcess(node, [], opt)))
        }
        return out
    },

    //spawn模式prog以引號起頭或結尾: 於任何程序(含取系統字碼頁之chcp)之前reject; exec與execFile模式不檢引號(陽性對照: 建立一個程序)
    procQuote: async () => {
        let execProcess = await imp('execProcess')
        let out = []
        let quoted = [['dq-both', `"${node}"`], ['dq-start', `"${node}`], ['dq-end', `${node}"`], ['sq-both', `'${node}'`], ['sq-start', `'${node}`], ['sq-end', `${node}'`]]
        for (let [mk, opt] of modes) {
            for (let [qk, qv] of quoted) {
                out.push(await cell(`${mk}|${qk}`, () => execProcess(qv, ['-e', '1'], opt)))
            }
        }
        return out
    },

    //替身之陽性對照: 直接呼叫各替身, 證明每一個皆會記錄(含process.kill, 使win32上亦有其對照)
    stubControl: async () => {
        calls = []
        cp.spawn('x', [])
        cp.exec('y', () => {})
        cp.execFile('z', [], () => {})
        cp.spawnSync('a')
        cp.execSync('b')
        cp.execFileSync('c')
        cp.fork('d')
        process.kill(424242, 'SIGKILL')
        await new Promise((resolve) => setImmediate(resolve))
        return calls.slice()
    },
}

//--- execProcessKillPid ---
let pidBad = [
    ['undefined', undefined], ['null', null], ['empty', ''], ['space', ' '], ['zero', 0], ['negZero', -0], ['one-neg', -1], ['neg', -999], ['float', 1.5],
    ['strZero', '0'], ['strNeg', '-1'], ['strFloat', '1.5'], ['strHex', '0x10'], ['strAlpha', '12abc'], ['strBlank-neg', ' -5 '], ['strOct', '0o7'],
    ['over-int32', 2147483648], ['wrap-int32', 4294967294], ['uint32', 4294967295], ['safeMax', 2 ** 53 - 1], ['unsafe', 2 ** 53], ['huge', 1e21], ['strHuge', '99999999999999999999'],
    ['NaN', NaN], ['Infinity', Infinity], ['-Infinity', -Infinity], ['true', true], ['false', false], ['array', []], ['array1', [5]], ['object', {}], ['bigint', 5n],
    ['symbol', Symbol('s')], ['function', () => 5], ['wrapNumber', new Number(5)], ['wrapString', new String('5')], ['revoked', revoked()],
    ['objValueOf', { valueOf: () => 5 }], ['strFullWidth', '１２'],
]
let pidOk = [
    ['num', 424242, '424242'], ['str', '424242', '424242'], ['strSpaces', ' 424242 ', '424242'], ['strPlus', '+424242', '424242'], ['strLeadingZero', '0424242', '424242'],
    ['one', 1, '1'], ['int32Max', 2147483647, '2147483647'], ['strInt32Max', '2147483647', '2147483647'], ['strSci', '4.2e5', '420000'],
]
cases.killBad = async () => {
    let kill = await imp('execProcessKillPid')
    let out = []
    for (let [k, v] of pidBad) {
        out.push(await cell(k, () => kill(v)))
    }
    return out
}
cases.killOk = async () => {
    let kill = await imp('execProcessKillPid')
    let out = []
    for (let [k, v, expect] of pidOk) {
        let r = await cell(k, () => kill(v))
        out.push({ ...r, expect })
    }
    return out
}

let out
try {
    if (!Object.prototype.hasOwnProperty.call(cases, caseName)) {
        throw new Error('unknown case: ' + caseName)
    }
    out = await cases[caseName]()
}
catch (e) {
    out = { runnerError: e instanceof Error ? e.message : String(e) }
}
console.log('@@R@@' + JSON.stringify({ out }))
process.exit(0)
