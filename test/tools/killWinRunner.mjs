//killWinRunner.mjs: execProcessKillPid681.test.mjs之子行程執行器(第681項)
//  於獨立子行程以「攔截替身」取代child_process之spawn、exec、execFile、fork與process.kill並記錄(含options), 替身一律不呼叫真實函數, 故不可能真的建立程序或殺程序;
//  須於替身掛上後才載入被測模組(tree-kill於載入時即取走child_process之spawn與exec); 被測實作之src根由環境變數WSEMI_KILL681_SRC指定(修前紅用), 未給為本檔往上兩層之src/
//  案例(argv[2]):
//    ok       win32: 殺有效pid, 子行程之離開碼0
//    fail     win32: 子行程離開碼128且stderr有輸出
//    spawnerr win32: spawn發出error事件(如ENOENT), 其後不再發close
//    both     win32: 先發error再發close(只能落定一次)
//    emfile   win32: spawn提前返回(EMFILE), child.stdout與child.stderr為null, 下一個tick發出error事件(不得同步拋、不得有未接之error)
//    linux    以process.platform='linux'載入: 走tree-kill之ps/pgrep路徑(不得建taskkill)
//  結果以一行'@@R@@'開頭之JSON輸出至stdout
import cp from 'child_process'
import path from 'path'
import { EventEmitter } from 'events'
import { syncBuiltinESMExports } from 'module'
import { pathToFileURL, fileURLToPath } from 'url'


let implDir = process.env.WSEMI_KILL681_SRC ? path.resolve(process.env.WSEMI_KILL681_SRC) : fileURLToPath(new URL('../../src/', import.meta.url))
let [caseName] = process.argv.slice(2)

let calls = [] //{ fn, file, args, opts }
let mode = 'ok'
let mkChild = (kind) => {
    let c = new EventEmitter()
    c.stdout = new EventEmitter()
    c.stderr = new EventEmitter()
    if (kind !== 'ps' && mode === 'emfile') {
        c.stdout = null //EMFILE、ENFILE時spawn提前返回, 不建stdio
        c.stderr = null
    }
    c.pid = 4242
    c.kill = () => true
    setImmediate(() => {
        if (kind !== 'ps' && mode === 'emfile') {
            c.emit('error', Object.assign(new Error('spawn taskkill EMFILE'), { code: 'EMFILE' }))
        }
        else if (kind === 'ps') {
            c.emit('close', 1) //POSIX之tree-kill以ps/pgrep找子行程, 無子行程時離開碼為1
        }
        else if (mode === 'ok') {
            c.emit('close', 0)
        }
        else if (mode === 'fail') {
            c.stderr.emit('data', Buffer.from('ERROR: The process "424242" not found.\r\n'))
            c.emit('close', 128)
        }
        else if (mode === 'spawnerr') {
            c.emit('error', Object.assign(new Error('spawn taskkill ENOENT'), { code: 'ENOENT' }))
        }
        else if (mode === 'both') {
            c.emit('error', new Error('boom'))
            c.emit('close', 1)
        }
    })
    return c
}
let rec = (fn, a) => {
    let opts = a.find((x) => x && typeof x === 'object' && !Array.isArray(x))
    calls.push({ fn, file: typeof a[0] === 'string' ? a[0].slice(0, 60) : '?', args: Array.isArray(a[1]) ? a[1].map((x) => String(x).slice(0, 20)) : [], opts: opts ? { windowsHide: opts.windowsHide, shell: opts.shell, stdio: opts.stdio } : null })
}
cp.spawn = (...a) => {
    rec('spawn', a)
    return mkChild(a[0] === 'ps' || a[0] === 'pgrep' ? 'ps' : 'x')
}
cp.exec = (...a) => {
    rec('exec', a)
    let cb = a.find((x) => typeof x === 'function')
    let c = mkChild('x')
    if (cb) {
        setImmediate(() => cb(null, '', ''))
    }
    return c
}
cp.execFile = (...a) => {
    rec('execFile', a)
    let cb = a.find((x) => typeof x === 'function')
    let c = mkChild('x')
    if (cb) {
        setImmediate(() => cb(null, '', ''))
    }
    return c
}
cp.fork = (...a) => {
    rec('fork', a)
    return mkChild('x')
}
cp.spawnSync = (...a) => {
    rec('spawnSync', a)
    return { pid: 0, status: 0, signal: null, output: [null, Buffer.alloc(0), Buffer.alloc(0)], stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) }
}
cp.execSync = (...a) => {
    rec('execSync', a)
    return Buffer.alloc(0)
}
process.kill = (pid, sig) => {
    calls.push({ fn: 'kill', file: String(pid), args: [String(sig)], opts: null })
    return true
}
//具名匯入(import { spawn })之綁定不隨cp.spawn之替換更新, 同步之使任何匯入寫法皆取得替身(替身恆不呼叫真實函數)
syncBuiltinESMExports()
if (cp.spawn.toString().indexOf('rec(') < 0) {
    throw new Error('stub not installed')
}

//platform, 載入前決定(tree-kill與被測模組於呼叫時讀process.platform)
let realPlatform = process.platform
let setPlatform = (p) => {
    Object.defineProperty(process, 'platform', { value: p, configurable: true })
}

let settle = (p, ms = 8000) => new Promise((resolve) => {
    let t = setTimeout(() => resolve({ s: 'pending' }), ms)
    Promise.resolve(p).then((v) => {
        clearTimeout(t)
        resolve({ s: 'resolve', v: typeof v === 'string' ? v.slice(0, 300) : typeof v })
    }, (e) => {
        clearTimeout(t)
        resolve({ s: 'reject', v: String(typeof e === 'string' ? e : (e instanceof Error ? e.message : typeof e)).slice(0, 400) })
    })
})

let out
try {
    let kill = (await import(pathToFileURL(path.join(implDir, 'execProcessKillPid.mjs')).href)).default
    if (caseName === 'linux') {
        setPlatform('linux')
    }
    else {
        mode = caseName
        if (realPlatform !== 'win32') {
            setPlatform('win32') //非Windows主機以win32之路徑驗證(替身不呼叫真實函數)
        }
    }
    calls = []
    let events = []
    let r = await settle(kill(424242, { onTrace: (e) => events.push(e.type) }))
    //等待事件佇列清空(有第二次落定之機會)
    await new Promise((resolve) => setTimeout(resolve, 50))
    out = { r, calls, events, platform: process.platform }
}
catch (e) {
    out = { runnerError: e instanceof Error ? e.message : String(e) }
}
console.log('@@R@@' + JSON.stringify({ out }))
process.exit(0)
