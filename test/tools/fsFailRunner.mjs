//fsFailRunner.mjs: R-FS-REJECT-01(fs系Promise之拒絕值一律為字串、不同步拋出、不偽成功、不懸置、不殘留資源)與R-FS-RESULT-01之5、7(結果物件之error恆為truthy、不同步拋出)之子行程執行器
//  範圍: fsDeleteFileSafe(Core)、fsDeleteFolderSafe(Core)、fsMergeFiles(Core)、fsDownloadFile(Core)、fsBuildWriteStreamText、fsCopyFile(Core)、fsCopyFolder(Core)、fsSrlog、fsWriteJson、fsReadTextCore、fsWriteTextCore、fsCreateFileCore、fsCreateFolderCore、fsDeleteFileCore、fsDeleteFolderCore、fsRenameFileCore、fsRenameFolderCore、fsCleanFolderCore
//  每個案例於獨立子行程執行(不污染mocha之worker), 預設掛unhandledRejection與uncaughtException記錄器與看門狗(settle逾時回{ s: 'pending' }, 整案逾時以watchdog結果行結束)
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得); 夾具一律建於本檔往上一層之_tmp/fsFail-<案名>/, 用到才建(mkFx), 結束(finally)先執行登記之清理(解除ACL拒絕、銷毀攔得之串流、殺子程序樹並以tasklist回驗)再刪除該案資料夾, 不動_tmp根目錄
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught, cleanupError })輸出至stdout, 由test/tools/fsFailRun.mjs之runFsFail剖析
//用法: node test/tools/fsFailRunner.mjs <caseName> [exitMode]
//  exitMode=nohandler: 不掛記錄器; 未處理之rejection使行程以離開碼1結束(無結果行), 用於驗證fsSrlog之內部Promise不致無處理器之行程崩潰
/* eslint-disable no-throw-literal */ //本執行器刻意拋出非Error之值(null、undefined、字串、一般物件)作為注入物之受測輸入
import fs from 'fs'
import path from 'path'
import { EventEmitter } from 'events'
import { spawn, execFileSync } from 'child_process'
import { pathToFileURL, fileURLToPath } from 'url'
import { safeStr, revoked, showValue } from './caseKit.mjs'

let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let fdTmp = fileURLToPath(new URL('../_tmp/', import.meta.url))
let [caseName, exitMode] = process.argv.slice(2)
let fx = path.join(fdTmp, 'fsFail-' + caseName) //本案夾具資料夾, 需要夾具之案例以mkFx()建立
let user = process.env.USERNAME

async function imp(name) {
    return (await import(pathToFileURL(path.join(implDir, name + '.mjs')).href)).default
}

let unhandled = []
let uncaught = []
if (exitMode !== 'nohandler') {
    process.on('unhandledRejection', (r) => {
        unhandled.push(safeStr(r))
    })
    process.on('uncaughtException', (e) => {
        uncaught.push(safeStr(e))
    })
}

//sleep, 等待ms毫秒
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//kind, 值之類別: 'string'、'null'、'undefined'、'Error'、'exotic'(instanceof即拋錯者)或typeof
function kind(v) {
    if (v === null) {
        return 'null'
    }
    if (typeof v === 'string') {
        return 'string'
    }
    try {
        if (v instanceof Error) {
            return 'Error'
        }
    }
    catch (e) {
        return 'exotic'
    }
    return typeof v
}

//dv, 值轉為可JSON化之描述: 字串為{ k: 'string', v }; Error為{ k: 'Error', v: String(err) }; 一般物件(結果物件)為{ k: 'result', keys, error?, success? }; 其餘為{ k, v: showValue }
//  斷言時可分辨「以字串reject」與「以Error物件reject」, 及結果物件之error為null/undefined(falsy)
function dv(v) {
    let k = kind(v)
    if (k === 'string') {
        return { k, v }
    }
    if (k === 'null' || k === 'undefined') {
        return { k }
    }
    if (k === 'Error') {
        let s = ''
        try {
            s = String(v)
        }
        catch (e) {
            s = '<String() throws>'
        }
        return { k, v: s }
    }
    if (k === 'object') {
        let proto = null
        try {
            proto = Object.getPrototypeOf(v)
        }
        catch (e) {}
        if (proto === Object.prototype) {
            let o = { k: 'result', keys: Object.keys(v).sort() }
            if (Object.prototype.hasOwnProperty.call(v, 'error')) {
                o.error = dv(v.error)
            }
            if (Object.prototype.hasOwnProperty.call(v, 'success')) {
                o.success = dv(v.success)
            }
            return o
        }
    }
    return { k, v: showValue(v) }
}

//run, 呼叫fn並記錄結果: 同步拋出為{ s: 'syncThrow', ... }、回傳非Promise為{ s: 'return', ... }、Promise為settle之結果
//  分辨「同步拋出」與「reject」(R-FS-REJECT-01之2), 及「回傳結果物件」與「回傳Promise」
function run(fn, ms = 3000) {
    let p
    try {
        p = fn()
    }
    catch (e) {
        return Promise.resolve({ s: 'syncThrow', ...dv(e) })
    }
    if (!(p instanceof Promise)) {
        return Promise.resolve({ s: 'return', ...dv(p) })
    }
    return settle(p, ms)
}

//settle, 等待p之結果, 逾時回{ s: 'pending' }(R-FS-REJECT-01之5不得懸置), resolve/reject之值經dv
function settle(p, ms = 3000) {
    return new Promise((resolve) => {
        let t = setTimeout(() => resolve({ s: 'pending' }), ms)
        p.then((v) => {
            clearTimeout(t)
            resolve({ s: 'resolve', ...dv(v) })
        }, (e) => {
            clearTimeout(t)
            resolve({ s: 'reject', ...dv(e) })
        })
    })
}

//thrower, 回傳呼叫即拋出v之函數
function thrower(v) {
    return () => {
        throw v
    }
}

//清理登記: 案例於finally刪除夾具前依登記之逆序執行(解除ACL、銷毀串流、殺子程序樹), 失敗記入cleanupError
let cleanups = []
function onCleanup(fn) {
    cleanups.push(fn)
}

//mkFx, 建立本案夾具資料夾(先清除殘留)並回傳其路徑
function mkFx() {
    fs.mkdirSync(fdTmp, { recursive: true })
    fs.rmSync(fx, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    fs.mkdirSync(fx, { recursive: true })
    return fx
}

//fxp, 夾具內之路徑
function fxp(...p) {
    return path.join(fx, ...p)
}

//denyRD, 以icacls拒絕目前使用者讀取(檔案: stat成功而開檔EPERM; 資料夾: readdir EPERM), 並登記解除
function denyRD(p) {
    execFileSync('icacls', [p, '/deny', `${user}:(RD)`], { stdio: 'pipe' })
    onCleanup(() => {
        execFileSync('icacls', [p, '/remove:d', user], { stdio: 'pipe' })
    })
}

//pidAlive, 以tasklist判定PID是否仍存在
function pidAlive(pid) {
    let s = execFileSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    return s.includes(`"${pid}"`)
}

//spawnHold, 起子程序持有資源(檔案或cwd)並登記: 殺樹(taskkill /T /F, 陣列參數免shell)後以tasklist回驗PID已消失
async function spawnHold(cmd, args, cwd, msWait) {
    let cp = spawn(cmd, args, { cwd, stdio: 'ignore', windowsHide: true })
    onCleanup(async () => {
        try {
            execFileSync('taskkill', ['/pid', String(cp.pid), '/T', '/F'], { stdio: 'pipe' })
        }
        catch (e) {}
        for (let i = 0; i < 30; i++) {
            if (!pidAlive(cp.pid)) {
                await sleep(200) //孫程序(ping)隨樹結束後釋放檔案控制代碼
                return
            }
            await sleep(100)
        }
        throw new Error(`pid ${cp.pid} still alive after taskkill`)
    })
    await sleep(msWait)
    return cp
}

//captureFs, 以fs代理攔截createReadStream、createWriteStream取得串流實例, 供斷言失敗後是否destroy(fd是否釋放, R-FS-REJECT-01之6); 清理時一律銷毀
function captureFs(ext = {}) {
    let streams = []
    let fsP = {
        ...fs,
        createReadStream: (...a) => {
            let s = fs.createReadStream(...a)
            streams.push({ t: 'read', s })
            return s
        },
        createWriteStream: (...a) => {
            let s = fs.createWriteStream(...a)
            streams.push({ t: 'write', s })
            return s
        },
        ...ext,
    }
    onCleanup(async () => {
        streams.forEach(({ s }) => s.destroy())
        await sleep(50)
    })
    return { fsP, streams }
}

//streamState, 串流之狀態: destroyed與fd(null代表已關閉)
function streamState(streams) {
    return streams.map(({ t, s }) => ({ t, destroyed: s.destroyed, fdClosed: s.fd === null || s.fd === undefined }))
}

//activeFs, 迄今仍存活之fs類資源(FSReqCallback、FileHandle)
function activeFs() {
    return process.getActiveResourcesInfo().filter((n) => n === 'FSReqCallback' || n === 'FileHandle' || n === 'FSReqPromise')
}

//fakeErrStream, 可由案例控制之事件串流(EventEmitter), 支援pipe/destroy之最小介面, ms毫秒後以v發出error
function fakeErrStream(v, ms = 20) {
    let s = new EventEmitter()
    s.pipe = (d) => d
    s.destroy = () => {}
    setTimeout(() => s.emit('error', v), ms)
    return s
}

//statFile, 使fsIsFileCore之前置檢查視為檔案之lstat結果
let statFile = { isDirectory: () => false, isSymbolicLink: () => false, isFile: () => true }

//busyErr, 回傳每次呼叫皆拋出code為EBUSY之Error('busy <第n次>')之函數與計數
function busyErr() {
    let st = { n: 0 }
    st.fn = () => {
        st.n++
        let e = new Error('busy ' + st.n)
        e.code = 'EBUSY'
        throw e
    }
    return st
}

//seqOp, 依plan逐次決定注入之op(unlinkSync、rmSync)之行為並計數(外審 opus F18、F19: 重試中轉成功、EBUSY後非EBUSY、重試期間標的消失)
//  plan之項: 'EBUSY'拋code為EBUSY之Error('busy <第n次>')、'EPERM'拋code為EPERM之Error('perm <第n次>')、'vanish'先以真實op刪除標的再拋EBUSY(模擬重試期間標的被他方刪除)、'real'呼叫真實op; plan用盡後一律'real'
function seqOp(real, plan) {
    let st = { n: 0 }
    st.fn = (...a) => {
        st.n++
        let step = plan[st.n - 1] || 'real'
        if (step === 'real') {
            return real(...a)
        }
        if (step === 'vanish') {
            real(...a)
            step = 'EBUSY'
        }
        let e = new Error((step === 'EBUSY' ? 'busy ' : 'perm ') + st.n)
        e.code = step
        throw e
    }
    return st
}

//realErr, 取得真實fs之SystemError(ENOENT)
function realErr() {
    try {
        fs.readFileSync(path.join(fdTmp, '__no_such_dir__', 'x.txt'))
    }
    catch (e) {
        return e
    }
}

//withFetch, 暫時替換globalThis.fetch
async function withFetch(fake, f) {
    let orig = globalThis.fetch
    globalThis.fetch = fake
    try {
        return await f()
    }
    finally {
        globalThis.fetch = orig
    }
}

//lstatBoom, 對外函數經opt.fs覆蓋內建fs: statSync正常、lstatSync拋Error('lstat boom')
function lstatBoom() {
    return { ...fs, statSync: () => ({}), lstatSync: thrower(new Error('lstat boom')) }
}

let cases = {

    //======== fsDeleteFileSafe(Core) ========
    DF01: async () => {
        let f = await imp('fsDeleteFileSafe')
        let p = fxp('nope.txt')
        return { p, res: await run(() => f(p)) }
    },
    DF02: async () => {
        mkFx()
        fs.mkdirSync(fxp('folderA'))
        let f = await imp('fsDeleteFileSafe')
        let p = fxp('folderA')
        return { p, res: await run(() => f(p)) }
    },
    DF03: async () => {
        mkFx()
        let p = fxp('busy.txt')
        await spawnHold('cmd.exe', ['/d', '/c', 'ping -n 30 127.0.0.1 > busy.txt'], fx, 800)
        let f = await imp('fsDeleteFileSafe')
        let res = await run(() => f(p, { numRetry: 2 }), 8000)
        return { res, exists: fs.existsSync(p) }
    },
    DF04: async () => {
        mkFx()
        let p = fxp('a.txt')
        fs.writeFileSync(p, 'a')
        let e = realErr()
        let f = await imp('fsDeleteFileSafeCore')
        return { expect: String(e), res: await run(() => f(p, { fs: { ...fs, unlinkSync: thrower(e) } })) }
    },
    DF05: async () => {
        mkFx()
        let p = fxp('a.txt')
        fs.writeFileSync(p, 'a')
        let f = await imp('fsDeleteFileSafeCore')
        return { res: await run(() => f(p, { fs: { ...fs, unlinkSync: thrower(null) } })) }
    },
    DF06: async () => {
        mkFx()
        let p = fxp('a.txt')
        fs.writeFileSync(p, 'a')
        let f = await imp('fsDeleteFileSafeCore')
        return { res: await run(() => f(p, { fs: { ...fs, unlinkSync: thrower('str') } })) }
    },
    DF07: async () => {
        mkFx()
        let p = fxp('a.txt')
        fs.writeFileSync(p, 'a')
        let b = busyErr()
        let f = await imp('fsDeleteFileSafeCore')
        let res = await run(() => f(p, { numRetry: 2, fs: { ...fs, unlinkSync: b.fn } }))
        return { res, calls: b.n, exists: fs.existsSync(p) }
    },
    DF08: async () => {
        let f = await imp('fsDeleteFileSafe')
        return { res: await run(() => f('x', { fs: lstatBoom() })) }
    },
    DF09: async () => {
        mkFx()
        let p = fxp('a.txt')
        fs.writeFileSync(p, 'a')
        let f = await imp('fsDeleteFileSafeCore')
        return { res: await run(() => f(p, { fs: { ...fs, unlinkSync: thrower(revoked()) } })) }
    },
    //DF10~DF12: numRetry=3, unlinkSync依seqOp之plan: EBUSY後成功、EBUSY後EPERM、EBUSY期間標的被刪除(第2次真實unlinkSync得ENOENT)
    DF10: () => safeSeqCase('fsDeleteFileSafeCore', 'unlinkSync', ['EBUSY']),
    DF11: () => safeSeqCase('fsDeleteFileSafeCore', 'unlinkSync', ['EBUSY', 'EPERM']),
    DF12: () => safeSeqCase('fsDeleteFileSafeCore', 'unlinkSync', ['vanish']),

    //======== fsDeleteFolderSafe(Core) ========
    DD01: async () => {
        let f = await imp('fsDeleteFolderSafe')
        let p = fxp('nopeDir')
        return { p, res: await run(() => f(p)) }
    },
    DD02: async () => {
        mkFx()
        let p = fxp('file.txt')
        fs.writeFileSync(p, 'a')
        let f = await imp('fsDeleteFolderSafe')
        return { p, res: await run(() => f(p)) }
    },
    DD03: async () => {
        mkFx()
        let b = fxp('busyDir')
        fs.mkdirSync(b)
        fs.writeFileSync(path.join(b, 'x.txt'), 'x')
        await spawnHold(process.execPath, ['-e', 'setTimeout(()=>{},30000)'], b, 500)
        let f = await imp('fsDeleteFolderSafe')
        let res = await run(() => f(b, { numRetry: 2 }), 8000)
        return { res, exists: fs.existsSync(b) }
    },
    DD04: async () => {
        mkFx()
        let p = fxp('dir')
        fs.mkdirSync(p)
        let e = realErr()
        let f = await imp('fsDeleteFolderSafeCore')
        return { expect: String(e), res: await run(() => f(p, { fs: { ...fs, rmSync: thrower(e) } })) }
    },
    DD05: async () => {
        mkFx()
        let p = fxp('dir')
        fs.mkdirSync(p)
        let f = await imp('fsDeleteFolderSafeCore')
        return { res: await run(() => f(p, { fs: { ...fs, rmSync: thrower(null) } })) }
    },
    DD06: async () => {
        mkFx()
        let p = fxp('dir')
        fs.mkdirSync(p)
        let b = busyErr()
        let f = await imp('fsDeleteFolderSafeCore')
        let res = await run(() => f(p, { numRetry: 2, fs: { ...fs, rmSync: b.fn } }))
        return { res, calls: b.n, exists: fs.existsSync(p) }
    },
    DD07: async () => {
        let f = await imp('fsDeleteFolderSafe')
        return { res: await run(() => f('x', { fs: lstatBoom() })) }
    },
    DD08: async () => {
        mkFx()
        let p = fxp('dir')
        fs.mkdirSync(p)
        let f = await imp('fsDeleteFolderSafeCore')
        return { res: await run(() => f(p, { fs: { ...fs, rmSync: thrower(revoked()) } })) }
    },
    //DD09~DD11: 同DF10~DF12之資料夾版(rmSync)
    DD09: () => safeSeqCase('fsDeleteFolderSafeCore', 'rmSync', ['EBUSY']),
    DD10: () => safeSeqCase('fsDeleteFolderSafeCore', 'rmSync', ['EBUSY', 'EPERM']),
    DD11: () => safeSeqCase('fsDeleteFolderSafeCore', 'rmSync', ['vanish']),

    //======== fsMergeFiles(Core) ========
    MG01: async () => {
        let f = await imp('fsMergeFiles')
        return { res: await run(() => f('x', fxp('o.bin'))) }
    },
    MG02: async () => {
        let f = await imp('fsMergeFiles')
        return { res: await run(() => f([], fxp('o.bin'))) }
    },
    MG03: async () => {
        mkFx()
        let p = fxp('nope.bin')
        let f = await imp('fsMergeFiles')
        return { p, res: await run(() => f([p], fxp('o.bin'))) }
    },
    MG04: async () => {
        mkFx()
        fs.writeFileSync(fxp('s0'), 'A')
        fs.mkdirSync(fxp('out'))
        let f = await imp('fsMergeFiles')
        let res = await run(() => f([fxp('s0')], fxp('out')))
        return { res, sliceKept: fs.existsSync(fxp('s0')) }
    },
    MG05: async () => {
        let f = await imp('fsMergeFiles')
        return { res: await run(() => f(['x'], fxp('o.bin'), { fs: lstatBoom() })) }
    },
    //MG06: 對外函數+opt.fs之lstatSync拋message非字串之一般物件({ message: 42 }、{ message: null }; 外審 opus F15)
    MG06: async () => {
        let f = await imp('fsMergeFiles')
        let res = {}
        for (let [k, v] of [['message42', { message: 42 }], ['messageNull', { message: null }]]) {
            res[k] = await run(() => f(['x'], fxp('o.bin'), { fs: { ...fs, statSync: () => ({}), lstatSync: thrower(v) } }))
        }
        return { res }
    },
    //MG07: 同一不可讀之opt(fs之getter拋出各值)分別給對外fsMergeFiles(展開即拋)與fsMergeFilesCore(get即拋)之拒絕值(fsopt ⑦-1); 路徑為本案夾具資料夾內不存在之路徑(不建夾具)
    MG07: async () => {
        let fo = await imp('fsMergeFiles')
        let fc = await imp('fsMergeFilesCore')
        let vals = {
            Error: new Error('getter boom'),
            null: null,
            string: 'str',
            message42: { message: 42 },
            plainMsg: { message: 'pm' },
            noProtoMsg: Object.assign(Object.create(null), { message: 'np' }),
        }
        let res = {}
        for (let [k, v] of Object.entries(vals)) {
            let mk = () => Object.defineProperty({}, 'fs', { enumerable: true, get: thrower(v) })
            res[k] = {
                outer: await run(() => fo([fxp('s0')], fxp('o.bin'), mk())),
                core: await run(() => fc([fxp('s0')], fxp('o.bin'), mk())),
            }
        }
        return { res }
    },

    //======== fsDownloadFile(Core) ========
    DL01: async () => {
        let f = await imp('fsDownloadFile')
        return { res: await run(() => f('', fxp('x.bin'))) }
    },
    DL02: async () => {
        let f = await imp('fsDownloadFile')
        return { res: await run(() => f('http://127.0.0.1:1/x', '')) }
    },
    DL03: async () => {
        let f = await imp('fsDownloadFileCore')
        return { res: await run(() => f('http://127.0.0.1:1/x', fxp('x.bin'), { fs })) }
    },
    DL04: async () => {
        mkFx()
        let f = await imp('fsDownloadFile')
        let p = fxp('x.bin')
        let res = await withFetch(async () => new Response('nf', { status: 404, statusText: 'Not Found' }), () => run(() => f('http://fake.invalid/x', p)))
        return { p, res }
    },
    DL05: async () => {
        mkFx()
        let f = await imp('fsDownloadFile')
        let p = fxp('x.bin')
        return { p, res: await run(() => f('http://127.0.0.1:1/x', p), 10000) }
    },
    DL06: async () => {
        mkFx()
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let f = await imp('fsDownloadFile')
        let p = fxp('fileP.txt', 'x.bin')
        let res = await withFetch(async () => new Response('abc', { status: 200 }), () => run(() => f('http://fake.invalid/x', p)))
        return { p, res }
    },
    DL07: async () => {
        mkFx()
        let f = await imp('fsDownloadFileCore')
        let { pipeline } = await import('stream/promises')
        let p = fxp('x.bin')
        let res = await withFetch(async () => new Response('abc', { status: 200 }), () => run(() => f('http://fake.invalid/x', p, { fs, pipeline })))
        return { p, res, leftover: [fs.existsSync(p), fs.existsSync(p + '.download')] }
    },
    DL08: async () => {
        let f = await imp('fsDownloadFileCore')
        let { pipeline } = await import('stream/promises')
        let p = fxp('x.bin')
        return { p, res: await run(() => f('http://fake.invalid/x', p, { fs: lstatBoom(), pipeline })) }
    },

    //======== fsBuildWriteStreamText ========
    WS01: async () => {
        mkFx()
        fs.mkdirSync(fxp('dir'))
        let b = (await imp('fsBuildWriteStreamText'))()
        return { res: await run(() => b.create(fxp('dir'))) }
    },
    WS02: async () => {
        mkFx()
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let b = (await imp('fsBuildWriteStreamText'))()
        return { res: await run(() => b.create(fxp('fileP.txt', 'x.txt'))) }
    },
    WS03: async () => {
        let b = (await imp('fsBuildWriteStreamText'))()
        return { res: await run(() => b.create(undefined)) }
    },
    WS05: async () => {
        mkFx()
        fs.mkdirSync(fxp('dir'))
        let b = (await imp('fsBuildWriteStreamText'))()
        let create = await run(() => b.create(fxp('dir')))
        await sleep(100)
        let end = await run(() => b.end(), 1500)
        return { create: create.s, end }
    },
    WS06: async () => {
        let b = (await imp('fsBuildWriteStreamText'))()
        return { end: await run(() => b.end(), 1500) }
    },
    WS07: async () => {
        mkFx()
        let b = (await imp('fsBuildWriteStreamText'))()
        let pm = b.create(fxp('t.txt'))
        b.write('abc')
        let end = await run(() => b.end())
        let create = await settle(pm)
        return { create, end, content: fs.readFileSync(fxp('t.txt'), 'utf8') }
    },
    //WS08: JSDoc範例之流程(create→write→write→end→await pm)整段包try, fp為undefined(create同步失敗; 外審 opus F14); stage為拋出時之步驟, caught為所捕捉之值
    WS08: () => docFlowCase(undefined, false),
    //WS09: create(fp為undefined)後呼叫端未接其Promise(不await、不catch)
    WS09: async () => {
        let b = (await imp('fsBuildWriteStreamText'))()
        let syncThrow = null
        try {
            b.create(undefined)
        }
        catch (e) {
            syncThrow = safeStr(e)
        }
        await sleep(100)
        return { syncThrow }
    },
    //WS10: 同WS08之流程, fp為既有資料夾(開檔EISDIR, 非同步'error'), end之後(串流已出錯)再write一次
    WS10: async () => {
        mkFx()
        fs.mkdirSync(fxp('dir'))
        return docFlowCase(fxp('dir'), true)
    },
    //WS11: 未呼叫create即write
    WS11: async () => {
        let b = (await imp('fsBuildWriteStreamText'))()
        return { res: await run(() => b.write('x')) }
    },

    //======== fsCopyFile(Core) ========
    CF01: async () => {
        let f = await imp('fsCopyFile')
        let p = fxp('nope.txt')
        return { p, res: await run(() => f(p, fxp('x.txt'), { useSync: false })) }
    },
    CF02: async () => {
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'abc'.repeat(1000))
        fs.mkdirSync(fxp('tarDir'))
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFileCore')
        let res = await run(() => f(fxp('a.txt'), fxp('tarDir'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },
    CF03: async () => {
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'a')
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let f = await imp('fsCopyFile')
        return { res: await run(() => f(fxp('a.txt'), fxp('fileP.txt', 'x.txt'), { useSync: false })) }
    },
    CF04: async () => {
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'a')
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let f = await imp('fsCopyFile')
        return { res: await run(() => f(fxp('a.txt'), fxp('fileP.txt', 'x.txt'))) }
    },
    CF05: async () => {
        let f = await imp('fsCopyFile')
        return { res: await run(() => f('x', fxp('x.txt'), { useSync: false, fs: lstatBoom() })) }
    },
    CF06: async () => {
        let f = await imp('fsCopyFile')
        return { res: await run(() => f('x', fxp('x.txt'), { fs: lstatBoom() })) }
    },
    CF07: async () => {
        mkFx()
        let { fsP, streams } = captureFs({
            statSync: () => ({}),
            lstatSync: () => statFile,
        })
        fsP.createReadStream = () => fakeErrStream(null)
        let f = await imp('fsCopyFileCore')
        let res = await run(() => f('x', fxp('y.txt'), { path, fs: fsP, useSync: false }))
        await sleep(100)
        return { res, streams: streamState(streams) }
    },
    CF08: async () => {
        mkFx()
        fs.writeFileSync(fxp('deny.txt'), 'abc')
        denyRD(fxp('deny.txt'))
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFileCore')
        let res = await run(() => f(fxp('deny.txt'), fxp('out.txt'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },
    CF09: async () => {
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'a')
        let f = await imp('fsCopyFile')
        return { res: await run(() => f(fxp('a.txt'), undefined, { useSync: false })) }
    },
    CF10: async () => {
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'a')
        let f = await imp('fsCopyFileCore')
        let o = {}
        for (let [k, v] of [['null', null], ['undefined', undefined], ['empty', '']]) {
            o[k] = await run(() => f(fxp('a.txt'), fxp('b.txt'), { path, fs: { ...fs, copyFileSync: thrower(v) } }))
        }
        return o
    },
    CF11: async () => {
        //寫入流之建構子同步拋錯(fpTar含NUL, 路徑驗證於建構子內): 已建立之讀取流須銷毀(外審 opus F01)
        mkFx()
        fs.writeFileSync(fxp('a.txt'), 'abc'.repeat(1000))
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFileCore')
        let res = await run(() => f(fxp('a.txt'), fxp('x\0y.txt'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },

    //======== fsCopyFolder(Core) ========
    CD01: async () => {
        let f = await imp('fsCopyFolder')
        let p = fxp('nopeDir')
        return { p, res: await run(() => f(p, fxp('tar'), { useSync: false })) }
    },
    CD02: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        fs.writeFileSync(fxp('src', 'a.txt'), 'abc'.repeat(1000))
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFolderCore')
        let res = await run(() => f(fxp('src'), fxp('fileP.txt', 'sub'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },
    CD03: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        fs.writeFileSync(fxp('src', 'a.txt'), 'a')
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let f = await imp('fsCopyFolder')
        return { res: await run(() => f(fxp('src'), fxp('fileP.txt', 'sub'))) }
    },
    CD04: async () => {
        let f = await imp('fsCopyFolder')
        return { res: await run(() => f('x', fxp('tar'), { useSync: false, fs: lstatBoom() })) }
    },
    CD05: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        denyRD(fxp('src'))
        let f = await imp('fsCopyFolder')
        return { res: await run(() => f(fxp('src'), fxp('tar'), { useSync: false })) }
    },
    CD06: async () => {
        let f = await imp('fsCopyFolder')
        return { res: await run(() => f('x', fxp('tar'), { fs: lstatBoom() })) }
    },
    CD07: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        fs.writeFileSync(fxp('src', 'deny.txt'), 'abc')
        denyRD(fxp('src', 'deny.txt'))
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFolderCore')
        let res = await run(() => f(fxp('src'), fxp('tar'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },
    CD08: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        fs.writeFileSync(fxp('src', 'a.txt'), 'a')
        let { fsP, streams } = captureFs()
        fsP.createReadStream = () => fakeErrStream(null)
        let f = await imp('fsCopyFolderCore')
        let res = await run(() => f(fxp('src'), fxp('tar'), { path, fs: fsP, useSync: false }))
        await sleep(100)
        return { res, streams: streamState(streams) }
    },
    CD09: async () => {
        mkFx()
        fs.mkdirSync(fxp('src'))
        let f = await imp('fsCopyFolderCore')
        let o = {}
        for (let [k, v] of [['null', null], ['undefined', undefined]]) {
            o[k] = await run(() => f(fxp('src'), fxp('tar'), { path, fs: { ...fs, readdirSync: thrower(v) } }))
        }
        return o
    },
    CD10: async () => {
        //寫入流之建構子同步拋錯(目標夾名含NUL): 已建立之讀取流須銷毀(外審 opus F01, CF11 對稱)
        mkFx()
        fs.mkdirSync(fxp('src'))
        fs.writeFileSync(fxp('src', 'a.txt'), 'abc'.repeat(1000))
        let { fsP, streams } = captureFs()
        let f = await imp('fsCopyFolderCore')
        let res = await run(() => f(fxp('src'), fxp('ta\0r'), { path, fs: fsP, useSync: false }))
        await sleep(300)
        return { res, streams: streamState(streams), active: activeFs() }
    },

    //======== fsSrlog ========
    EV02: async () => {
        mkFx()
        let f = (await imp('fsSrlog'))({ fdLog: fxp('log'), useLoc: false })
        let o = { a: 1 }
        o.self = o
        let res = await run(() => f('x', o))
        await sleep(200)
        return { res }
    },
    EV03: async () => {
        mkFx()
        fs.writeFileSync(fxp('fileP.txt'), 'p')
        let f = (await imp('fsSrlog'))({ fdLog: fxp('fileP.txt', 'log'), useLoc: false })
        let res = await run(() => f('x'))
        await sleep(200)
        return { res }
    },

    //======== fsWriteJson ========
    RO17: async () => {
        mkFx()
        let f = await imp('fsWriteJson')
        let o = {}
        let e = new Error('boom')
        o.error = await run(() => f(fxp('e.json'), { toJSON: thrower(e) }))
        o.errorSame = null
        try {
            o.errorSame = f(fxp('e2.json'), { toJSON: thrower(e) }).error === e
        }
        catch (err) {}
        o.str = await run(() => f(fxp('s.json'), { toJSON: thrower('str') }))
        return o
    },
    RO18: async () => {
        mkFx()
        let f = await imp('fsWriteJson')
        let p = fxp('x.json')
        let res = await run(() => f(p, { toJSON: thrower(null) }))
        return { res, written: fs.existsSync(p) }
    },
    RO19: async () => {
        mkFx()
        let f = await imp('fsWriteJson')
        let p = fxp('x.json')
        let res = await run(() => f(p, { toJSON: thrower(undefined) }))
        return { res, written: fs.existsSync(p) }
    },
    RO19b: async () => {
        mkFx()
        let f = await imp('fsWriteJson')
        let p = fxp('x.json')
        let res = await run(() => f(p, { toJSON: thrower('') }))
        return { res, written: fs.existsSync(p) }
    },

    //======== fsReadTextCore、fsWriteTextCore、fsCreateFileCore ========
    RO22: async () => {
        let f = await imp('fsReadTextCore')
        let o = {}
        for (let [k, v] of [['null', null], ['undefined', undefined]]) {
            o[k] = await run(() => f('x', { fs: { readFileSync: thrower(v) } }))
        }
        return o
    },
    RO23: async () => {
        mkFx()
        let f = await imp('fsWriteTextCore')
        let o = {}
        for (let [k, v] of [['null', null], ['undefined', undefined]]) {
            o[k] = await run(() => f(fxp(k + '.txt'), 'x', { fs: { ...fs, writeFileSync: thrower(v) } }))
        }
        return o
    },
    RO24: async () => {
        mkFx()
        let f = await imp('fsCreateFileCore')
        let o = {}
        for (let [k, v] of [['null', null], ['undefined', undefined]]) {
            o[k] = await run(() => f(fxp(k + '.txt'), 'x', { fs: { ...fs, writeFileSync: thrower(v) } }))
        }
        return o
    },

    //======== R-FS-RESULT-01之5補齊(fso2): 實際操作之fs函數拋出null、undefined、Error ========
    RO25: () => opThrowCase('fsDeleteFileCore', 'unlinkSync', (k) => [mkFile(k + '.txt')]),
    RO26: () => opThrowCase('fsDeleteFolderCore', 'rmSync', (k) => [mkDir(k)]),
    RO27: () => opThrowCase('fsCreateFolderCore', 'mkdirSync', (k) => [fxp(k)]),
    RO28: () => opThrowCase('fsRenameFileCore', 'renameSync', (k) => [mkFile(k + '.txt'), fxp(k + '-new.txt')]),
    RO29: () => opThrowCase('fsRenameFolderCore', 'renameSync', (k) => [mkDir(k), fxp(k + '-new')]),
    RO30: () => opThrowCase('fsCleanFolderCore', 'readdirSync', (k) => [mkDir(k)], true),
    RO39: async () => {
        //真Error(跨realm、無原型)原樣回傳(外審 opus F03): 以_isRealError判定, 同R-CODEC-ERR-01規則1之真Error
        mkFx()
        let vm = await import('vm')
        let f = await imp('fsDeleteFileCore')
        let cross = vm.runInNewContext('let e = new Error("x"); e.code = "ENOENT"; e')
        let nullProto = Object.setPrototypeOf(new Error('np'), null)
        let o = {}
        for (let [k, v] of [['crossRealm', cross], ['nullProto', nullProto]]) {
            let r = f(mkFile(k + '.txt'), { fs: { ...fs, unlinkSync: thrower(v) } })
            o[k] = { same: r.error === v, code: typeof r.error === 'object' && r.error !== null ? r.error.code : undefined }
        }
        return o
    },
    RO30b: async () => {
        //目標不存在而自動建立時mkdirSync拋null: fsCreateFolderCore之error須truthy, 否則fsCleanFolderCore之if (r.error)不成立而回success
        mkFx()
        let f = await imp('fsCleanFolderCore')
        let p = fxp('create-null')
        let res = await run(() => f(p, { path, fs: { ...fs, mkdirSync: thrower(null) } }))
        return { res, created: fs.existsSync(p) }
    },

    //======== R-FS-RESULT-01之7(fso2): 前置檢查之lstatSync拋錯時不同步拋出而回{ error } ========
    RO31: () => lstatThrowCase('fsDeleteFileCore', (k) => [mkFile(k + '.txt')]),
    RO32: () => lstatThrowCase('fsDeleteFolderCore', (k) => [mkDir(k)]),
    RO33: () => lstatThrowCase('fsCreateFolderCore', (k) => [mkDir(k)]),
    RO34: () => lstatThrowCase('fsRenameFileCore', (k) => [mkFile(k + '.txt'), fxp(k + '-new.txt')]),
    RO35: () => lstatThrowCase('fsRenameFolderCore', (k) => [mkDir(k), fxp(k + '-new')]),
    RO36: () => lstatThrowCase('fsCleanFolderCore', (k) => [mkDir(k)], true),
    RO37: () => lstatThrowCase('fsWriteTextCore', (k) => [fxp(k + '.txt'), 'x']),
    RO38: () => lstatThrowCase('fsCreateFileCore', (k) => [fxp(k + '.txt'), 'x']),
}

//mkFile、mkDir, 於夾具內建立檔案或資料夾並回傳其路徑(前置檢查以真實statSync通過)
function mkFile(name) {
    let p = fxp(name)
    fs.writeFileSync(p, 'x')
    return p
}
function mkDir(name) {
    let p = fxp(name)
    fs.mkdirSync(p)
    return p
}

//safeSeqCase, fsDeleteFileSafeCore/fsDeleteFolderSafeCore(numRetry=3)之注入op依seqOp之plan動作: 標的為夾具內之檔案a.txt或內含檔案之資料夾d, 回傳結果、op呼叫次數與標的是否仍在
async function safeSeqCase(name, op, plan) {
    mkFx()
    let p = null
    if (op === 'unlinkSync') {
        p = mkFile('a.txt')
    }
    else {
        p = mkDir('d')
        fs.writeFileSync(path.join(p, 'x.txt'), 'x')
    }
    let st = seqOp((...a) => fs[op](...a), plan)
    let f = await imp(name)
    let res = await run(() => f(p, { numRetry: 3, fs: { ...fs, [op]: st.fn } }))
    return { p, res, calls: st.n, exists: fs.existsSync(p) }
}

//docFlowCase, fsBuildWriteStreamText依JSDoc範例之流程(create→write→write→end→await pm)整段包try呼叫(呼叫端之寫法: 任一步同步拋出即跳至catch而不再await pm)
//  stage為拋出(或完成)時之步驟, end為end()之結果(1.5秒未settle為pending), caught為所捕捉之值(經dv); writeAfter為true時於end之後(串流已出錯)再write一次
async function docFlowCase(fp, writeAfter) {
    let b = (await imp('fsBuildWriteStreamText'))()
    let stage = 'create'
    let end = null
    let caught = null
    try {
        let pm = b.create(fp)
        stage = 'write'
        b.write('abc')
        b.write('中文')
        stage = 'end'
        end = await settle(b.end(), 1500)
        if (writeAfter) {
            stage = 'writeAfterError'
            b.write('late')
        }
        stage = 'awaitPm'
        await pm
        stage = 'done'
    }
    catch (e) {
        caught = dv(e)
    }
    return { stage, end, caught }
}

//opThrowCase, 注入之fs以真實fs為底, 僅實際操作之op(unlinkSync、rmSync、mkdirSync、renameSync、readdirSync)拋出null、undefined、Error('boom'), 逐值呼叫name之函數(prep(k)回傳opt以外之參數)
async function opThrowCase(name, op, prep, withPath = false) {
    mkFx()
    let f = await imp(name)
    let o = {}
    for (let [k, v] of [['null', null], ['undefined', undefined], ['Error', new Error('boom')]]) {
        let args = prep(k)
        let opt = { fs: { ...fs, [op]: thrower(v) } }
        if (withPath) {
            opt.path = path
        }
        o[k] = await run(() => f(...args, opt))
    }
    return o
}

//lstatThrowCase, 注入之fs以真實fs為底(statSync真實, 故標的存在), 僅lstatSync拋出Error('lstat boom')、null, 逐值呼叫name之函數(prep(k)回傳opt以外之參數)
async function lstatThrowCase(name, prep, withPath = false) {
    mkFx()
    let f = await imp(name)
    let o = {}
    for (let [k, v] of [['Error', new Error('lstat boom')], ['null', null]]) {
        let args = prep(k)
        let opt = { fs: { ...fs, lstatSync: thrower(v) } }
        if (withPath) {
            opt.path = path
        }
        o[k] = await run(() => f(...args, opt))
    }
    return o
}

//optUnreadableCase, opt本身或其屬性不可讀(R-FS-REJECT-01 規則2、R-FS-RESULT-01 規則7, 外審 opus F02): 以getter拋Error('getter boom')之opt(屬性名key, 預設fs)、已撤銷之Proxy逐形呼叫name之函數
//  useSyncFalse為true時另加getterAsync形({ useSync: false }而key之getter拋錯, 結果物件須以Promise resolve); prep()回傳opt以外之參數, 一律為本案夾具資料夾內不存在之路徑(不建夾具, 不以repo內既有檔為標的)
async function optUnreadableCase(name, prep, { key = 'fs', useSyncFalse = false } = {}) {
    let f = await imp(name)
    let mkGetter = (base) => Object.defineProperty(base, key, { enumerable: true, get: thrower(new Error('getter boom')) })
    let forms = { getter: mkGetter({}), revoked: revoked() }
    if (useSyncFalse) {
        forms.getterAsync = mkGetter({ useSync: false })
    }
    let o = {}
    for (let [k, opt] of Object.entries(forms)) {
        o[k] = await run(() => f(...prep(), opt))
    }
    return o
}

//OU-<函數>, 各函數之opt不可讀案例(prep與選項見optUnreadableCase)
let ouSpecs = [
    ['fsDeleteFileSafe', () => [fxp('nope.txt')]],
    ['fsDeleteFileSafeCore', () => [fxp('nope.txt')]],
    ['fsDeleteFolderSafe', () => [fxp('nopeDir')]],
    ['fsDeleteFolderSafeCore', () => [fxp('nopeDir')]],
    ['fsMergeFiles', () => [[fxp('s0')], fxp('o.bin')]],
    ['fsMergeFilesCore', () => [[fxp('s0')], fxp('o.bin')]],
    ['fsDownloadFileCore', () => ['http://127.0.0.1:1/x', fxp('x.bin')]],
    ['fsCopyFile', () => [fxp('nope.txt'), fxp('x.txt')], { useSyncFalse: true }],
    ['fsCopyFileCore', () => [fxp('nope.txt'), fxp('x.txt')], { useSyncFalse: true }],
    ['fsCopyFolder', () => [fxp('nopeDir'), fxp('tar')], { useSyncFalse: true }],
    ['fsCopyFolderCore', () => [fxp('nopeDir'), fxp('tar')], { useSyncFalse: true }],
    ['fsCreateFile', () => [fxp('a.txt'), 'x']],
    ['fsCreateFileCore', () => [fxp('a.txt'), 'x']],
    ['fsCleanFolderCore', () => [fxp('d')]],
    ['fsDeleteFileCore', () => [fxp('nope.txt')]],
    ['fsCreateFolderCore', () => [fxp('d')]],
    ['fsDeleteFolderCore', () => [fxp('nopeDir')]],
    ['fsRenameFileCore', () => [fxp('a.txt'), fxp('b.txt')]],
    ['fsRenameFolderCore', () => [fxp('a'), fxp('b')]],
    ['fsReadTextCore', () => [fxp('a.txt')]],
    ['fsWriteTextCore', () => [fxp('a.txt'), 'x']],
    ['fsWriteJson', () => [fxp('a.json'), { a: 1 }], { key: 'useFormat' }], //fsWriteJson只讀opt.useFormat(不讀fs)
]
for (let [name, prep, o] of ouSpecs) {
    cases['OU-' + name] = () => optUnreadableCase(name, prep, o)
}

//看門狗: 整案逾時(案例本身之settle皆有逾時, 此為最後防線)即輸出watchdog結果並結束
let wd = setTimeout(() => {
    console.log('@@R@@' + JSON.stringify({ out: { watchdog: true }, unhandled, uncaught, cleanupError: null }))
    process.exit(0)
}, 40000)

//logs, 案例期間console.log之內容(fsSrlog之失敗記錄, R-FS-REJECT-01之7), 結果行輸出前還原
let logs = []
let clOrig = console.log
console.log = (...a) => {
    try {
        logs.push(a.map((x) => (typeof x === 'string' ? x : safeStr(x))).join(' '))
    }
    catch (e) {}
}

let out
let cleanupError = null
try {
    if (!Object.prototype.hasOwnProperty.call(cases, caseName)) {
        throw new Error('unknown case: ' + caseName)
    }
    out = await cases[caseName]()
}
catch (e) {
    out = { runnerError: safeStr(e) }
}
finally {
    //逆序執行登記之清理, 再刪除本案夾具資料夾(不動_tmp根目錄); 失敗不吞掉, 記入結果由runFsFail擲出
    for (let fn of cleanups.reverse()) {
        try {
            await fn()
        }
        catch (e) {
            cleanupError = (cleanupError ? cleanupError + '; ' : '') + safeStr(e)
        }
    }
    try {
        fs.rmSync(fx, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    }
    catch (e) {
        cleanupError = (cleanupError ? cleanupError + '; ' : '') + safeStr(e)
    }
}
await sleep(100) //收集延後之未處理rejection(nohandler模式下即於此使行程以離開碼1結束)
console.log = clOrig
clearTimeout(wd)
console.log('@@R@@' + JSON.stringify({ out, logs, unhandled, uncaught, cleanupError }))
process.exit(0)
