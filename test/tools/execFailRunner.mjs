//execFailRunner.mjs: R-EXEC-FAIL-01之6~12(執行外部程序家族execProcess、execCli、execCliSession、execCliJsonRpc之失敗回報)之子行程執行器
//  每個案例於獨立子行程執行(不污染mocha之worker), 預設掛unhandledRejection與uncaughtException記錄器與看門狗(settle逾時回{ s: 'pending' })
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得); 夾具一律建於本檔往上一層之_tmp/execFail-<案名>/, 案例開頭建立, 結束(finally)刪除該案資料夾, 不動_tmp根目錄
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught })輸出至stdout, 由test/tools/execFailRun.mjs之runExecFail剖析
//用法: node test/tools/execFailRunner.mjs <caseName> [exitMode]
//  exitMode=nohandler: 不掛記錄器, 案例完成後立即process.exit(0); 用於驗證無處理器時回調拋出之錯誤仍使行程以離開碼1結束並印出錯誤(未被吞掉, 亦未因呼叫端隨即結束而遺失)
import fs from 'fs'
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { safeStr, revoked } from './caseKit.mjs'

let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let fdTmp = fileURLToPath(new URL('../_tmp/', import.meta.url))
let [caseName, exitMode] = process.argv.slice(2)
let fx = path.join(fdTmp, 'execFail-' + caseName) //本案夾具資料夾, 需要夾具之案例以mkFx()建立
let node = process.execPath

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

//uniq, 迄今記錄之未捕捉例外訊息(去重後排序, 不因同一錯誤發生次數不同而變動)
function uniq() {
    return [...new Set(uncaught)].sort()
}

//sleep, 等待ms毫秒, 供收集延後發生之未捕捉例外
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//settle, 等待p之結果, 逾時回{ s: 'pending' }, reject回{ s: 'reject', v: 訊息字串 }
//  與pmSettleRunner之settle契約不同而分立: 本檔之結果須可JSON化(reject轉訊息字串), 且受測者皆回傳Promise而以Promise.resolve承接
function settle(p, ms = 15000) {
    return new Promise((resolve) => {
        let t = setTimeout(() => resolve({ s: 'pending' }), ms)
        Promise.resolve(p).then((v) => {
            clearTimeout(t)
            resolve({ s: 'resolve', v })
        }, (e) => {
            clearTimeout(t)
            resolve({ s: 'reject', v: safeStr(e) })
        })
    })
}

//res, settle結果為resolve時以f轉為斷言用之物件, 否則原樣回{ s, v }(使斷言失敗時可判讀為逾時或reject, 而非讀取欄位之TypeError)
function res(r, f) {
    return r.s === 'resolve' ? f(r.v) : { s: r.s, v: r.v }
}

//pk, execCli結果之pid契約: 是否帶pid鍵與其值之型別
function pk(r) {
    return { hasPidKey: Object.prototype.hasOwnProperty.call(r, 'pid'), pidType: typeof r.pid }
}

//boom, 回傳呼叫即拋出Error(m)之函數, 作為會拋錯之呼叫端回調
function boom(m) {
    return () => {
        throw new Error(m)
    }
}

//mkFx, 建立本案夾具資料夾(先清除殘留)並回傳其路徑
function mkFx() {
    fs.mkdirSync(fdTmp, { recursive: true })
    fs.rmSync(fx, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    fs.mkdirSync(fx, { recursive: true })
    return fx
}

//mkFile, 寫出夾具檔(上層資料夾不存在則先建立)
function mkFile(fp, content) {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.writeFileSync(fp, content)
}

//夾具檔內容
let contentUserCmd = '@echo off\r\necho hello-from-user-cmd\r\n' //可直接執行之批次檔, 輸出hello-from-user-cmd
let contentFakeExe = 'MZ-not-a-real-pe' //副檔名為.exe而內容非有效PE

//scRpcServer, 一行一則JSON之伺服器腳本: 每收到一則請求, 以同一次write送出head所指之訊息與該請求之回應(同一chunk)
function scRpcServer(head) {
    return 'let rl=require("readline").createInterface({input:process.stdin});rl.on("line",(l)=>{let m=JSON.parse(l);process.stdout.write(JSON.stringify(' + head + ')+"\\n"+JSON.stringify({jsonrpc:"2.0",id:m.id,result:{ok:1}})+"\\n")})'
}

let cases = {

    //R-EXEC-FAIL-01之11: 自訂validate同步拋錯視同驗證失敗(不成為未捕捉例外, 不使本次呼叫懸置)
    validateThrows: async () => {
        let execCli = await imp('execCli')
        let r = await settle(execCli(node, ['-e', 'process.stdout.write("x")'], { validate: boom('v-boom') }), 8000)
        return res(r, (v) => ({ ok: v.ok, error: v.error, stderrHead: v.stderr.split('\n')[0], ...pk(v) }))
    },

    //R-EXEC-FAIL-01之11: 自訂validate回傳Promise時以其結果判定, reject視同驗證失敗; 驗證耗時不受timeoutMs約束(子進程已結束); 永不落定者依原生語意等待(本函數亦不落定)
    validateAsync: async () => {
        let execCli = await imp('execCli')
        let f = async (validate, opt = {}, ms = 8000) => {
            let r = await settle(execCli(node, ['-e', 'process.stdout.write("x")'], { validate, ...opt }), ms)
            return res(r, (v) => ({ ok: v.ok, error: v.error, threw: v.stderr.startsWith('validate threw: ') }))
        }
        let out = {
            asyncFalse: await f(async () => false),
            asyncTrue: await f(async () => true),
            asyncReject: await f(async () => {
                throw new Error('a-boom')
            }),
        }
        //兩個耗時案例並行(各自獨立): 慢於timeoutMs(1500)之驗證仍以其結果判定; 永不落定者於看門狗(2500)時仍為pending
        let [slowTrue, neverSettles] = await Promise.all([
            f(async () => {
                await sleep(2200)
                return true
            }, { timeoutMs: 1500 }),
            f(() => new Promise(() => {}), { timeoutMs: 1500 }, 2500),
        ])
        return { ...out, slowTrue, neverSettles }
    },

    //R-EXEC-FAIL-01之11: 自訂validate拋出之值可為null、undefined、已撤銷之Proxy、超長訊息之Error, 一律視同驗證失敗, stderr首行為'validate threw: 訊息'(訊息不可得者為unknown error, 超長者截斷)
    validateThrowValues: async () => {
        let execCli = await imp('execCli')
        let f = async (v) => {
            let r = await settle(execCli(node, ['-e', 'process.stdout.write("x")'], {
                validate: () => {
                    throw v
                },
            }), 8000)
            return res(r, (x) => ({ ok: x.ok, error: x.error, stderrHead: x.stderr.split('\n')[0].slice(0, 40), stderrLen: x.stderr.length }))
        }
        return {
            throwNull: await f(null),
            throwUndefined: await f(undefined),
            throwRevoked: await f(revoked()),
            throwHuge: await f(new Error('x'.repeat(200000))),
        }
    },

    //R-EXEC-FAIL-01之6、9: 不存在之.cmd/.bat(絕對路徑、只給檔名、含目錄之相對路徑)不交cmd.exe, 為ENOENT、code null、pid鍵為undefined、不重試
    missingBatch: async () => {
        mkFx()
        let execCli = await imp('execCli')
        let out = {}
        for (let [k, cmd, cwd] of [
            ['absCmd', path.join(fx, 'missing.cmd'), undefined],
            ['absBat', path.join(fx, 'missing.bat'), undefined],
            ['bareCmd', 'wsemi-not-exist-zz.cmd', undefined],
            ['bareBat', 'wsemi-not-exist-zz.bat', undefined],
            ['relCmd', '.\\missing.cmd', fx],
        ]) {
            let r = await settle(execCli(cmd, [], { cwd, maxRetries: 2, retryDelayMs: 100 }))
            out[k] = res(r, (v) => ({ error: v.error.replace(fx, '<fx>'), code: v.code, attempts: v.attempts, ...pk(v) }))
        }
        return out
    },

    //R-EXEC-FAIL-01之6(對照): 存在之批次檔仍可執行
    batchStillRuns: async () => {
        mkFx()
        mkFile(path.join(fx, 'user.cmd'), contentUserCmd)
        let execCli = await imp('execCli')
        let a = await settle(execCli(path.join(fx, 'user.cmd'), []))
        //只給檔名而位於子進程cwd者: 同cmd.exe, 子進程env無NoDefaultCurrentDirectoryInExePath時可找到
        let b = await settle(execCli('user.cmd', [], { cwd: fx, env: { NoDefaultCurrentDirectoryInExePath: undefined } }))
        //PATH內之批次檔(只給檔名): npm.cmd
        let c = await settle(execCli('npm.cmd', ['--version'], { maxRetries: 0 }))
        //含目錄之相對路徑: 以子進程cwd為基準(同cmd.exe)
        let d = await settle(execCli('.\\user.cmd', [], { cwd: fx, maxRetries: 0 }))
        return {
            abs: res(a, (v) => ({ ok: v.ok, out: v.stdout.trim() })),
            bareInCwd: res(b, (v) => ({ ok: v.ok, out: v.stdout.trim() })),
            npmCmd: res(c, (v) => ({ ok: v.ok, isVer: /^\d+\.\d+\.\d+/.test(v.stdout.trim()) })),
            relInCwd: res(d, (v) => ({ ok: v.ok, out: v.stdout.trim() })),
        }
    },

    //R-EXEC-FAIL-01之6: 只給檔名之批次檔位於子進程cwd, 但子進程env有NoDefaultCurrentDirectoryInExePath: cmd.exe不搜cwd, 故視為查無(ENOENT、不重試)
    bareBatchNoDefaultCwd: async () => {
        mkFx()
        mkFile(path.join(fx, 'user.cmd'), contentUserCmd)
        let execCli = await imp('execCli')
        let r = await settle(execCli('user.cmd', [], { cwd: fx, env: { NoDefaultCurrentDirectoryInExePath: '1' }, maxRetries: 2, retryDelayMs: 100 }))
        return res(r, (v) => ({ ok: v.ok, code: v.code, error: v.error, attempts: v.attempts, ...pk(v) }))
    },

    //R-EXEC-FAIL-01之6: npm shim(cmd-shim格式)以只給檔名(帶.cmd)與不帶副檔名兩種方式呼叫, 皆應解析入口以node直接執行(多行參數不被cmd.exe截斷)
    bareShimNodeDirect: async () => {
        mkFx()
        let execCli = await imp('execCli')
        let dirShim = path.join(fx, 'shim')
        mkFile(path.join(dirShim, 'node_modules', 'zzpkg', 'bin', 'cli.js'), 'process.stdout.write(JSON.stringify(process.argv.slice(2)))\n')
        let shim = [
            '@ECHO off',
            'GOTO start',
            ':find_dp0',
            'SET dp0=%~dp0',
            'EXIT /b',
            ':start',
            'SETLOCAL',
            'CALL :find_dp0',
            '',
            'IF EXIST "%dp0%\\node.exe" (',
            '  SET "_prog=%dp0%\\node.exe"',
            ') ELSE (',
            '  SET "_prog=node"',
            '  SET PATHEXT=%PATHEXT:;.JS;=;%',
            ')',
            '',
            'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\zzpkg\\bin\\cli.js" %*',
            '',
        ].join('\r\n')
        mkFile(path.join(dirShim, 'zzshim.cmd'), shim)
        process.env.PATH = dirShim + ';' + process.env.PATH
        let args = ['a\nb', 'c d']
        let f = async (cmd) => {
            let r = await settle(execCli(cmd, args, { maxRetries: 0 }))
            return res(r, (v) => {
                let argv = null
                try {
                    argv = JSON.parse(v.stdout)
                }
                catch (e) {}
                return { ok: v.ok, argvSame: JSON.stringify(argv) === JSON.stringify(args) }
            })
        }
        return { withExt: await f('zzshim.cmd'), noExt: await f('zzshim') }
    },

    //R-EXEC-FAIL-01之6: 只給命令名而其所在PATH目錄含非ASCII字元(如中文使用者名稱下之%APPDATA%\npm)
    nonAsciiPathCommand: async () => {
        mkFx()
        let execCli = await imp('execCli')
        let bin = path.join(fx, '中文bin')
        mkFile(path.join(bin, 'zzfoo2.cmd'), contentUserCmd)
        process.env.PATH = bin + ';' + process.env.PATH
        let r = await settle(execCli('zzfoo2', []))
        return res(r, (v) => ({ ok: v.ok, out: v.stdout.trim() }))
    },

    //R-EXEC-FAIL-01之7、9: cwd不存在或非資料夾時error指明cwd(execCli兩路、execCliSession、只給檔名之批次檔經同步catch)
    cwdNotFolder: async () => {
        mkFx()
        mkFile(path.join(fx, 'user.cmd'), contentUserCmd)
        let execCli = await imp('execCli')
        let ses = await imp('execCliSession')
        let out = {}
        for (let [k, cwd] of [['missing', path.join(fx, 'no-such-dir')], ['isFile', path.join(fx, 'user.cmd')]]) {
            let r = await settle(execCli(node, ['-e', '1'], { cwd, maxRetries: 2, retryDelayMs: 100 }))
            out[k] = res(r, (v) => ({ error: v.error.replace(fx, '<fx>'), code: v.code, attempts: v.attempts, ...pk(v) }))
        }
        let ss = ses(node, ['-e', '1'], { cwd: path.join(fx, 'no-such-dir') })
        let rs = await settle(ss.stop(), 8000)
        out.session = res(rs, (v) => ({ error: v.error.replace(fx, '<fx>'), pid: v.pid }))
        //只給檔名之批次檔且cwd不存在: buildSpawnArgs同步拋ENOENT, 經同步catch仍指明cwd
        let rb = await settle(execCli('user.cmd', [], { cwd: path.join(fx, 'no-such-dir'), maxRetries: 2, retryDelayMs: 100 }))
        out.bareBatch = res(rb, (v) => ({ error: v.error.replace(fx, '<fx>'), code: v.code, attempts: v.attempts, ...pk(v) }))
        //execCliSession同(與execCli之bareBatch對稱): 同步catch仍指明cwd
        let sb = ses('user.cmd', [], { cwd: path.join(fx, 'no-such-dir') })
        let rsb = await settle(sb.stop(), 8000)
        out.sessionBareBatch = res(rsb, (v) => ({ error: v.error.replace(fx, '<fx>'), pid: v.pid }))
        return out
    },

    //R-EXEC-FAIL-01之6: cwd給相對於本進程cwd之路徑時, 只給檔名之批次檔仍依子進程cwd(轉絕對路徑)解析並可執行(execCli、execCliSession)
    relCwdBareBatch: async () => {
        mkFx()
        let sub = path.join(fx, 'sub')
        mkFile(path.join(sub, 'zzrel.cmd'), '@echo off\r\necho hello-rel\r\n')
        let rel = path.relative(process.cwd(), sub)
        let env = { NoDefaultCurrentDirectoryInExePath: undefined }
        let execCli = await imp('execCli')
        let ses = await imp('execCliSession')
        let r1 = await settle(execCli('zzrel.cmd', [], { cwd: rel, env }))
        let lines = []
        let s = ses('zzrel.cmd', [], { cwd: rel, env, onLine: (l) => lines.push(l) })
        let r2 = await settle(s.stop(), 10000)
        return {
            relIsRelative: !path.isAbsolute(rel),
            execCli: res(r1, (v) => ({ ok: v.ok, out: v.stdout.trim() })),
            session: res(r2, (v) => ({ error: v.error, got: lines.includes('hello-rel') })),
        }
    },

    //R-EXEC-FAIL-01之7: 有效之junction作cwd(或本進程cwd為junction)時, 命令不存在之error仍指向命令而非cwd
    junctionCwd: async () => {
        mkFx()
        let real = path.join(fx, 'real')
        let jcwd = path.join(fx, 'jcwd')
        fs.mkdirSync(real)
        mkFile(path.join(real, 'zzin.cmd'), '@echo off\r\necho hello-in-junction\r\n')
        fs.symlinkSync(real, jcwd, 'junction')
        let env = { NoDefaultCurrentDirectoryInExePath: undefined }
        let execCli = await imp('execCli')
        let ses = await imp('execCliSession')
        let out = {}

        //(a) execCli, 命令不存在
        let ra = await settle(execCli('wsemi-not-exist-zz', [], { cwd: jcwd }))
        out.cliMissing = res(ra, (v) => v.error)

        //(b) execCli, 命令存在(junction為有效之cwd)
        let rb = await settle(execCli(node, ['-e', 'process.stdout.write(process.cwd())'], { cwd: jcwd }))
        out.cliOk = res(rb, (v) => v.ok)

        //(c) execCliSession, 命令不存在
        let rc = await settle(ses('wsemi-not-exist-zz', [], { cwd: jcwd }).stop(), 8000)
        out.sessionMissing = res(rc, (v) => v.error)

        //(e) 只給檔名之不存在批次檔(buildSpawnArgs同步拋ENOENT, 經同步catch)
        let re = await settle(execCli('wsemi-not-exist-zz.cmd', [], { cwd: jcwd }))
        out.cliMissingBatch = res(re, (v) => v.error)

        //(f) 只給檔名之存在批次檔位於junction指向之資料夾內
        let rf = await settle(execCli('zzin.cmd', [], { cwd: jcwd, env }))
        out.cliBatchInside = res(rf, (v) => ({ ok: v.ok, out: v.stdout.trim() }))

        //(d) 本進程cwd為junction且execCli未給cwd; 結束前須chdir回原處才能刪除夾具
        let orig = process.cwd()
        try {
            process.chdir(jcwd)
            let rd = await settle(execCli('wsemi-not-exist-zz', []))
            out.procCwdJunction = res(rd, (v) => v.error)
        }
        finally {
            process.chdir(orig)
        }
        return out
    },

    //R-EXEC-FAIL-01之12: execCliSession之串流回調拋錯(依文件不攔截, 仍為未捕捉例外)不得造成: 其餘行不送達、收尾不settle(stop()誤報)、stderr尾段遺失
    //看門狗皆遠小於killWaitMs、exitGraceMs(皆60000), 不以牆鐘門檻判定
    sessionCallbacks: async () => {
        let ses = await imp('execCliSession')
        let big = { killWaitMs: 60000, exitGraceMs: 60000 }
        let out = {}

        //onLine: 末行無換行, 於收尾flush時拋錯
        let exitSeen = false
        //各子案之錯誤訊息互異, 使uncaught可逐一驗證每個呼叫點皆原樣重拋(單一呼叫點被吞掉時不被他案之同名訊息掩蓋)
        let s1 = ses(node, ['-e', 'process.stdout.write("tail-no-newline")'], {
            ...big,
            onLine: boom('onLine flush boom'),
            onExit: () => {
                exitSeen = true
            },
        })
        let r1 = await settle(s1.stop(), 8000)
        out.sessionOnLineFlush = res(r1, (v) => ({ code: v.code, exited: v.exited, error: v.error, exitSeen }))

        //onStdout: 拋錯, 同chunk之行仍送達onLine
        let lines = []
        let s2 = ses(node, ['-e', 'process.stdout.write("l1\\nl2\\n")'], { ...big, onStdout: boom('onStdout data boom'), onLine: (l) => lines.push(l) })
        let r2 = await settle(s2.stop(), 8000)
        out.sessionOnStdoutLines = { s: r2.s, lines }

        //onLine: 同chunk之第一行拋錯, 第二行須即時送達(與onStdout拋錯對稱); 子進程寫出後持續存活至stdin EOF, 故第二行若被延至收尾才送達即視為逾時
        let seen = []
        let s8 = null
        let pmL2 = new Promise((resolve) => {
            s8 = ses(node, ['-e', 'process.stdin.on("end",()=>process.exit(0));process.stdin.resume();process.stdout.write("l1\\nl2\\n")'], {
                ...big,
                onLine: (l) => {
                    seen.push(l)
                    if (seen.length === 2) {
                        resolve()
                    }
                    if (l === 'l1') {
                        throw new Error('onLine chunk boom')
                    }
                },
            })
        })
        let g8 = await settle(pmL2, 4000)
        let r8 = await settle(s8.stop(), 8000)
        out.sessionOnLineSameChunk = { got: g8.s, seen, stopped: r8.s }

        //onStdout: 末端不完整多位元組, 於收尾flush時首次被呼叫而拋錯
        let s5 = ses(node, ['-e', 'process.stdout.write(Buffer.from([0xe4,0xb8]))'], { ...big, onStdout: boom('onStdout flush boom') })
        let r5 = await settle(s5.stop(), 8000)
        out.sessionOnStdoutFlush = res(r5, (v) => ({ code: v.code, exited: v.exited, error: v.error }))

        //onStderr: 拋錯, 該段仍計入結果之stderr尾段
        let s6 = ses(node, ['-e', 'process.stderr.write("e1");process.exitCode=3'], { ...big, onStderr: boom('onStderr data boom') })
        let r6 = await settle(s6.stop(), 8000)
        out.sessionOnStderrData = res(r6, (v) => ({ code: v.code, error: v.error, stderr: v.stderr }))

        //onStderr: 末端不完整多位元組, 於收尾flush時首次被呼叫而拋錯(與onStdout之收尾flush對稱)
        let s7 = ses(node, ['-e', 'process.stderr.write(Buffer.from([0xe4,0xb8]))'], { ...big, onStderr: boom('onStderr flush boom') })
        let r7 = await settle(s7.stop(), 8000)
        out.sessionOnStderrFlush = res(r7, (v) => ({ code: v.code, exited: v.exited, error: v.error, stderr: v.stderr }))

        //仍為未捕捉例外(文件契約: 不攔截)
        await sleep(100)
        out.uncaught = uniq()
        return out
    },

    //R-EXEC-FAIL-01之12: execProcess之cbStdout、cbStderr於收尾flush時拋錯(依文件不攔截, 仍為未捕捉例外), 不得使execProcess不落定
    execProcessCbFlush: async () => {
        let execProcess = await imp('execProcess')
        let out = {}

        //末端不完整多位元組, cbStdout於收尾時首次被呼叫而拋錯(兩子案之訊息互異, 使uncaught可逐一驗證皆原樣重拋)
        let r3 = await settle(execProcess(node, ['-e', 'process.stdout.write(Buffer.from([0xe4,0xb8]))'], { cbStdout: boom('cbStdout flush boom') }), 8000)
        out.execProcessCbFlush = r3.s

        //cbStderr同(與cbStdout對稱)
        let r4 = await settle(execProcess(node, ['-e', 'process.stderr.write(Buffer.from([0xe4,0xb8]))'], { cbStderr: boom('cbStderr flush boom') }), 8000)
        out.execProcessCbStderrFlush = r4.s

        //仍為未捕捉例外(文件契約: 不攔截)
        await sleep(100)
        out.uncaught = uniq()
        return out
    },

    //R-EXEC-FAIL-01之12: execProcess之cbStdout、cbStderr於data時拋錯(依文件不攔截, 仍為未捕捉例外), 該段輸出仍計入resolve之合併字串(與收尾flush對稱)
    execProcessCbData: async () => {
        let execProcess = await imp('execProcess')
        let r1 = await settle(execProcess(node, ['-e', 'process.stdout.write("x")'], { cbStdout: boom('cbStdout data boom') }), 8000)
        let r2 = await settle(execProcess(node, ['-e', 'process.stderr.write("y")'], { cbStderr: boom('cbStderr data boom') }), 8000)
        await sleep(100)
        return { cbStdoutData: r1, cbStderrData: r2, uncaught: uniq() }
    },

    //R-EXEC-FAIL-01之12: execCliJsonRpc之onNotify、onServerRequest拋錯(依文件不攔截, 仍為未捕捉例外), 同一chunk內之回應仍須送達(否則卡至逾時)
    rpcSameChunk: async () => {
        let rpc = await imp('execCliJsonRpc')
        let out = {}

        //通知與回應同一chunk, onNotify拋錯
        let r1 = await settle(rpc(node, ['-e', scRpcServer('{jsonrpc:"2.0",method:"note",params:{}}')], [{ method: 'initialize' }], { onNotify: boom('onNotify boom'), timeoutMs: 60000 }), 8000)
        out.rpcSameChunk = res(r1, (v) => ({ ok: v.ok }))

        //伺服器→客戶端請求與回應同一chunk, onServerRequest拋錯(與onNotify對稱)
        let r2 = await settle(rpc(node, ['-e', scRpcServer('{jsonrpc:"2.0",id:99,method:"roots/list"}')], [{ method: 'initialize' }], { onServerRequest: boom('onServerRequest boom'), timeoutMs: 60000 }), 8000)
        out.rpcSameChunkServerRequest = res(r2, (v) => ({ ok: v.ok }))

        //仍為未捕捉例外(文件契約: 不攔截)
        await sleep(100)
        out.uncaught = uniq()
        return out
    },

    //R-EXEC-FAIL-01之6: execCliSession之只給檔名之批次檔依子進程env解析(env移除NoDefaultCurrentDirectoryInExePath時可找到cwd內者)
    sessionBareBatchEnv: async () => {
        mkFx()
        mkFile(path.join(fx, 'user.cmd'), contentUserCmd)
        let ses = await imp('execCliSession')
        let lines = []
        let s = ses('user.cmd', [], { cwd: fx, env: { NoDefaultCurrentDirectoryInExePath: undefined }, onLine: (l) => lines.push(l) })
        let r = await settle(s.stop(), 10000)
        return res(r, (v) => ({ error: v.error, got: lines.includes('hello-from-user-cmd') }))
    },

    //R-EXEC-FAIL-01之8: env物件之getter拋錯以結果物件回報(execCli不reject、execCliSession不throw), error不含env之值、不重試
    envGetterThrows: async () => {
        let execCli = await imp('execCli')
        let ses = await imp('execCliSession')
        let env = {}
        Object.defineProperty(env, 'X_SECRET', {
            enumerable: true,
            get() {
                throw new Error('env getter boom')
            },
        })
        let r = await settle(execCli(node, ['-e', '1'], { env, maxRetries: 2, retryDelayMs: 100 }), 8000)
        let out = r.s === 'resolve' ? { s: r.s, ok: r.v.ok, code: r.v.code, error: r.v.error, attempts: r.v.attempts, ...pk(r.v) } : { s: r.s, v: r.v }
        //execCliSession(與execCli對稱): 不throw, 以stop()之結果物件回報
        let s = null
        let threw = false
        try {
            s = ses(node, ['-e', '1'], { env })
        }
        catch (e) {
            threw = true
        }
        let rs = threw ? { s: 'threw' } : await settle(s.stop(), 8000)
        out.session = res(rs, (v) => ({ error: v.error, pid: v.pid, exited: v.exited }))
        return out
    },

    //R-EXEC-FAIL-01之9: execCli之pid契約——未能啟動者帶pid鍵且為undefined、已啟動者為數值、command無效者不帶pid鍵
    pidContract: async () => {
        mkFx()
        mkFile(path.join(fx, 'fake.exe'), contentFakeExe)
        let execCli = await imp('execCli')
        let a = await settle(execCli(node, ['a\u0000b']))
        let b = await settle(execCli(path.join(fx, 'missing.exe'), []))
        let c = await settle(execCli(path.join(fx, 'fake.exe'), []))
        let d = await settle(execCli(node, ['-e', 'process.exit(1)']))
        let e = await settle(execCli('', []))
        return {
            syncNul: res(a, (v) => ({ code: v.code, ...pk(v) })),
            asyncEnoent: res(b, (v) => ({ code: v.code, ...pk(v) })),
            nonPe: res(c, (v) => ({ code: v.code, ...pk(v) })),
            startedExit1: res(d, (v) => ({ code: v.code, ...pk(v) })),
            emptyCommand: res(e, (v) => ({ code: v.code, attempts: v.attempts, ...pk(v) })),
        }
    },

    //R-EXEC-FAIL-01之12: execCli之onStdout、onStderr拋錯(不攔截, 仍為未捕捉例外)時, 該段輸出仍累積於結果之stdout、stderr
    onStdoutThrowsKeepsOutput: async () => {
        let execCli = await imp('execCli')
        let r = await settle(execCli(node, ['-e', 'process.stdout.write("x");process.stderr.write("y")'], {
            onStdout: boom('onStdout boom'),
            onStderr: boom('onStderr boom'),
        }), 8000)
        await sleep(100)
        return { ...res(r, (v) => ({ ok: v.ok, stdout: v.stdout, stderr: v.stderr })), uncaught: uniq() }
    },

    //R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1: execCliSession之onExit拋錯(不攔截, 仍為未捕捉例外)時, stop()仍settle(已啟動與未能啟動)
    sessionOnExitThrows: async () => {
        mkFx()
        let ses = await imp('execCliSession')
        let a = ses(node, ['-e', '1'], { onExit: boom('onExit started boom') })
        let ra = await settle(a.stop(), 5000)
        let b = ses(path.join(fx, 'missing.exe'), [], { onExit: boom('onExit spawnFail boom') })
        let rb = await settle(b.stop(), 5000)
        await sleep(100)
        return { started: ra.s, spawnFail: rb.s, uncaught: uniq() }
    },

    //R-EXEC-FAIL-01之10: execCliJsonRpc之errorType依子進程是否曾啟動判定, 未啟動者一律notfound, 已啟動後結束為exit
    rpcErrorType: async () => {
        mkFx()
        mkFile(path.join(fx, 'fake.exe'), contentFakeExe)
        let rpc = await imp('execCliJsonRpc')
        let q = [{ method: 'initialize' }]
        let f = async (cmd, args, opt = {}) => {
            let r = await settle(rpc(cmd, args, q, { timeoutMs: 8000, ...opt }), 12000)
            return res(r, (v) => v.errorType)
        }
        return {
            notFound: await f('wsemi-not-exist-zz', []),
            nonPe: await f(path.join(fx, 'fake.exe'), []),
            nulArg: await f(node, ['a\u0000b']),
            cwdMissing: await f(node, ['-e', '1'], { cwd: path.join(fx, 'no-such-dir') }),
            exitEarly: await f(node, ['-e', 'process.exit(3)']),
        }
    },

    //以下三案(守門)於exitMode=nohandler執行: 無記錄器時, 回調拋出之錯誤須使行程以離開碼1結束並印出錯誤
    //  案例內await結果後立即process.exit(0): 重拋若改用setTimeout等晚於呼叫端續行之機制, 錯誤即被此exit搶先而遺失(離開碼0)
    rethrowExecProcessFlush: async () => {
        let execProcess = await imp('execProcess')
        await execProcess(node, ['-e', 'process.stdout.write(Buffer.from([0xe4,0xb8]))'], { cbStdout: boom('cb boom') })
        process.exit(0)
    },

    rethrowSessionOnExit: async () => {
        let ses = await imp('execCliSession')
        let s = ses(node, ['-e', '1'], { onExit: boom('cb boom') })
        await s.stop()
        process.exit(0)
    },

    rethrowExecCliOnStdout: async () => {
        let execCli = await imp('execCli')
        await execCli(node, ['-e', 'process.stdout.write("x")'], { onStdout: boom('cb boom') })
        process.exit(0)
    },
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
    //刪除本案夾具資料夾(不動_tmp根目錄); 失敗不吞掉, 記入結果由runExecFail擲出
    try {
        fs.rmSync(fx, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    }
    catch (e) {
        cleanupError = safeStr(e)
    }
}
if (exitMode === 'nohandler') {
    console.log('@@R@@' + JSON.stringify({ out, cleanupError }))
    process.exit(0)
}
await sleep(100)
console.log('@@R@@' + JSON.stringify({ out, unhandled, uncaught, cleanupError }))
process.exit(0)
