import { spawn } from 'child_process'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import delay from './delay.mjs'
import cint from './cint.mjs'
import isnum from './isnum.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import isp0int from './isp0int.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'
import strTruncate from './strTruncate.mjs'
import execProcessKillPid from './execProcessKillPid.mjs'
import execCliCore from './execCliCore.mjs'


//buildSpawnArgs, buildSpawnEnv, 共用核心已抽至execCliCore
let { buildSpawnArgs, buildSpawnEnv } = execCliCore


//optTruncate, 供strTruncate裁切失敗結果之stdout與stderr時, 於刪節號後標註原始總長度
let optTruncate = {
    funWithMsg: (str) => `(truncated, total ${str.length} chars)`,
}


/**
 * 建立驗證函式
 * 支援'nonempty', 'json', 'min:100'或自訂函式, 多規則可用逗號串接
 *
 * @param {String|Function} rule 輸入驗證規則字串或自訂函式
 * @returns {Function|null} 回傳驗證函式, 無有效規則回傳null
 */
function buildValidator(rule) {

    //自訂函式直接使用
    if (isfun(rule)) {
        return rule
    }

    //check
    if (!isestr(rule)) {
        return null
    }

    //checks
    let checks = rule.split(',').map((r) => r.trim()).filter(Boolean)
    if (checks.length === 0) {
        return null
    }

    return (stdout) => {
        for (let check of checks) {

            if (check === 'nonempty') {
                if (!isestr(stdout) || stdout.trim() === '') {
                    return false
                }
            }

            else if (check === 'json') {
                try {
                    JSON.parse(stdout)
                }
                catch {
                    return false
                }
            }

            else if (strleft(check, 4) === 'min:') {

                //規則本身無效(如min:abc) → 視為驗證失敗, 不靜默跳過
                let smin = strdelleft(check, 4)
                if (!isnum(smin)) {
                    return false
                }

                let min = cint(smin)
                if (!isestr(stdout) || stdout.length < min) {
                    return false
                }
            }

        }
        return true
    }
}


/**
 * 單次非同步呼叫(內部使用, 不含重試邏輯)
 *
 * @param {String} command 輸入執行檔名稱字串
 * @param {Array} [args=[]] 輸入參數陣列
 * @param {Object} [opt={}] 輸入設定物件
 * @returns {Promise} 回傳Promise, resolve回傳結果物件
 */
function execCliOnce(command, args = [], opt = {}) {

    //opt, 已由execCli前置校驗, 此處僅取預設值
    let {
        timeoutMs = 120000,
        cwd = process.cwd(),
        input = undefined,
        validate = undefined,
        maxBuffer = 10 * 1024 * 1024,
        onStdout = undefined,
        onStderr = undefined,
        env: envExtra = undefined,
    } = opt

    //validator
    let validator = buildValidator(validate)

    //startTime
    let startTime = Date.now()

    //pm
    let pm = genPm()

    //envSpawn, 併入process.env(同名以envExtra為準, 含PYTHONIOENCODING)
    //每次attempt於此重新求值並僅作用於該次子進程, 不動本進程process.env, 故並行調用可各自帶不同值
    let envSpawn = buildSpawnEnv(envExtra)

    //spawn
    let winSpawn = buildSpawnArgs(command, args)
    let proc = spawn(winSpawn.file, winSpawn.args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
        env: envSpawn,
        ...winSpawn.opt,
    })

    let stdout = ''
    let stderr = ''

    //TextDecoder, 跨chunk邊界正確解碼UTF-8, 避免多位元組中文字元被切成亂碼(U+FFFD)
    //改用全域TextDecoder而非node內建string_decoder, 避免打包時多引入一個node builtin
    let stdoutDecoder = new TextDecoder('utf-8')
    let stderrDecoder = new TextDecoder('utf-8')

    let settled = false
    let timedOut = false

    //stdout data, 經TextDecoder跨chunk解碼
    proc.stdout.on('data', (chunk) => {
        let str = stdoutDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (isfun(onStdout)) {
            onStdout(str)
        }
        if (stdout.length < maxBuffer) {
            stdout += str
        }
    })

    //stderr data, 經TextDecoder跨chunk解碼
    proc.stderr.on('data', (chunk) => {
        let str = stderrDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (isfun(onStderr)) {
            onStderr(str)
        }
        if (stderr.length < maxBuffer) {
            stderr += str
        }
    })

    //stdin, 子進程提早關閉stdin時write/end會觸發EPIPE, 需listen'error'才不會拋unhandled event
    proc.stdin.on('error', () => {})
    if (input !== undefined) {
        proc.stdin.write(input, 'utf8')
    }
    proc.stdin.end()

    //timer, 逾時觸發時調用execProcessKillPid殺整棵程序樹
    let timer = setTimeout(() => {
        if (settled) {
            return
        }
        timedOut = true

        //fire-and-forget, 殺掉子進程後close事件會接著觸發, 由timedOut決定回傳訊息
        execProcessKillPid(proc.pid)
            .catch(() => {}) //pid可能已結束, 忽略error

        //保險: kill後若close事件遲未觸發(kill被忽略/權限不足), 3s後強制resolve避免永久hang
        //unref確保正常情況(close立即觸發)不會因此延後process結束
        setTimeout(() => {
            if (settled) {
                return
            }
            settled = true
            pm.resolve({
                ok: false,
                stdout: strTruncate(stdout, 500, optTruncate),
                stderr: strTruncate(stderr, 500, optTruncate),
                code: null,
                error: `TIMEOUT after ${timeoutMs / 1000}s(子進程未能結束)`,
                durationMs: Date.now() - startTime,
                pid: proc.pid,
            })
        }, 3000).unref()

    }, timeoutMs)

    //error, 監聽(例如執行spawn本身)錯誤訊息, 可能為'找不到可執行檔'(ENOENT), '權限不足', '系統資源用盡'等
    proc.on('error', (err) => {
        if (settled) {
            return
        }
        settled = true
        clearTimeout(timer)
        pm.resolve({
            ok: false,
            stdout: '',
            stderr: '',
            code: null,
            error: `${err.code || 'UNKNOWN'}: ${err.message}`,
            durationMs: Date.now() - startTime,
            pid: proc.pid,
        })
    })

    //close
    proc.on('close', (code, signal) => {
        if (settled) {
            return
        }
        settled = true
        clearTimeout(timer)

        //flush decoder殘餘(valid UTF-8結尾通常為空, 保險起見仍flush)
        let fOut = stdoutDecoder.decode()
        if (fOut && stdout.length < maxBuffer) {
            stdout += fOut
        }
        let fErr = stderrDecoder.decode()
        if (fErr && stderr.length < maxBuffer) {
            stderr += fErr
        }

        //durationMs
        let durationMs = Date.now() - startTime

        //timeout
        if (timedOut) {
            pm.resolve({
                ok: false,
                stdout: strTruncate(stdout, 500, optTruncate),
                stderr: strTruncate(stderr, 500, optTruncate),
                code,
                error: `TIMEOUT after ${timeoutMs / 1000}s`,
                durationMs,
                pid: proc.pid,
            })
            return
        }

        //code
        if (code !== 0) {
            pm.resolve({
                ok: false,
                stdout: strTruncate(stdout, 500, optTruncate),
                stderr: strTruncate(stderr, 1000, optTruncate),
                code,
                error: signal ? `Signal: ${signal}` : `Exit code ${code}`,
                durationMs,
                pid: proc.pid,
            })
            return
        }

        //validator
        if (validator && !validator(stdout)) {
            pm.resolve({
                ok: false,
                stdout: strTruncate(stdout, 500, optTruncate),
                stderr: strTruncate(stderr, 500, optTruncate),
                code: 0,
                error: 'OUTPUT_VALIDATION_FAILED',
                durationMs,
                pid: proc.pid,
            })
            return
        }

        pm.resolve({
            ok: true,
            stdout,
            stderr,
            code: 0,
            error: '',
            durationMs,
            pid: proc.pid,
        })

    })

    return pm
}


/**
 * 通用CLI子程序調用，封裝逾時、進程樹清理、輸出驗證、結構化錯誤回報與自動重試
 * 各參數原樣傳遞給目標CLI，支援中文
 * Windows下npm全域安裝之命令為.cmd批次檔，Node.js spawn無法直接執行(CVE-2024-27980安全修正後回EINVAL)，內部已參考cross-spawn自動解析.cmd入口並繞過cmd.exe，故可支援含多行文字之參數
 * 本函數不throw，一律以結果物件之ok與error欄位回報成敗
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCli.test.mjs Github}
 * @memberOf wsemi
 * @param {String} command 輸入執行檔名稱字串，例如'node'、'curl'、'claude'等，可為註冊系統的全域指令或執行檔路徑
 * @param {Array} [args=[]] 輸入參數字串陣列，內容原樣傳遞給目標CLI，預設[]
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeoutMs=120000] 輸入逾時毫秒正整數，逾時將調用execProcessKillPid強制關閉子進程及其子孫程序，預設120000
 * @param {String} [opt.cwd=process.cwd()] 輸入子進程工作目錄字串，預設process.cwd()
 * @param {String} [opt.input=undefined] 輸入傳入子進程stdin之字串，預設undefined代表不寫入stdin
 * @param {String|Function} [opt.validate=undefined] 輸入stdout驗證規則字串或自訂驗證函數，規則字串支援'nonempty'(非空)、'json'(可JSON.parse)、'min:100'(長度下限)，多規則可用逗號串接例如'nonempty,json'，自訂函數為(stdout)=>Boolean，預設undefined代表不驗證
 * @param {Number} [opt.maxBuffer=10485760] 輸入stdout與stderr各自累積之最大字元數正整數，超過部分將不再累積，預設10485760(10MB)
 * @param {Function} [opt.onStdout=undefined] 輸入stdout串流回調函數，格式為(chunk)=>{}，預設undefined
 * @param {Function} [opt.onStderr=undefined] 輸入stderr串流回調函數，格式為(chunk)=>{}，預設undefined
 * @param {Object} [opt.env=undefined] 輸入本次調用額外注入之環境變數物件，會併入process.env之後(同名以此為準，含PYTHONIOENCODING)，僅作用於該次子進程而不影響本進程之process.env，故並行調用可各自帶不同值；值為undefined代表移除該變數(可遮蔽繼承值)，值為null會成為字面字串'null'故建議勿傳；Windows下環境變數大小寫不敏感，同名不同大小寫(如Path與PATH)亦視為同名覆蓋，預設undefined代表不覆寫任何變數
 * @param {Number} [opt.maxRetries=0] 輸入失敗後最大重試次數非負整數，遇ENOENT(命令不存在)或exit code 2(參數錯誤)視為不可重試而立即中止，預設0
 * @param {Number} [opt.retryDelayMs=5000] 輸入重試間隔毫秒正整數，實際間隔為retryDelayMs乘以重試次數且上限15000ms，預設5000
 * @returns {Promise} 回傳Promise，resolve回傳結果物件，內含ok(是否成功布林值)、stdout(標準輸出字串)、stderr(標準錯誤字串)、code(離開碼)、error(錯誤訊息字串，成功時為空字串)、durationMs(耗時毫秒)、pid(子進程pid)、attempts(實際嘗試次數)
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     let nodeBin = process.execPath
 *
 *     let r1 = await execCli(nodeBin, ['-e', 'process.stdout.write("hello")'])
 *     console.log('r1', r1.ok, r1.stdout)
 *     // => r1 true hello
 *
 *     let r2 = await execCli(nodeBin, ['-e', 'process.exit(3)'])
 *     console.log('r2', r2.ok, r2.code, r2.error)
 *     // => r2 false 3 Exit code 3
 *
 *     let r3 = await execCli(nodeBin, ['-e', 'process.stdin.on("data",(d)=>process.stdout.write(d))'], { input: '中文測試' })
 *     console.log('r3', r3.ok, r3.stdout)
 *     // => r3 true 中文測試
 *
 *     let r4 = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 'json' })
 *     console.log('r4', r4.ok, r4.error)
 *     // => r4 false OUTPUT_VALIDATION_FAILED
 *
 *     let r5 = await execCli(nodeBin, ['-e', 'setTimeout(()=>{},30000)'], { timeoutMs: 500 })
 *     console.log('r5', r5.ok, r5.error)
 *     // => r5 false TIMEOUT after 0.5s
 *
 *     let r6 = await execCli(nodeBin, ['-e', 'process.stdout.write(process.env.API_KEY)'], { env: { API_KEY: 'KEY_A' } })
 *     console.log('r6', r6.ok, r6.stdout, process.env.API_KEY)
 *     // => r6 true KEY_A undefined (僅作用於該次子進程, 本進程process.env不受影響)
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function execCli(command, args = [], opt = {}) {

    //command必填字串: 本函數以error物件回報失敗(非throw風格), 故回傳統一error結構
    if (!isestr(command)) {
        return {
            ok: false,
            stdout: '',
            stderr: '',
            code: null,
            error: 'command 須為非空字串',
            durationMs: 0,
            attempts: 0,
        }
    }

    //args: 若提供須為陣列, 否則回退為空陣列
    if (!isarr(args)) {
        args = []
    }

    //opt: 若提供須為物件, 否則回退為空物件
    if (!isobj(opt)) {
        opt = {}
    }

    let { maxRetries = 0, retryDelayMs = 5000, ...onceOpt } = opt

    //cwd: 非空字串, 無效回退預設process.cwd()
    let cwd = get(onceOpt, 'cwd', null)
    if (!isestr(cwd)) {
        onceOpt.cwd = process.cwd()
    }
    else {
        onceOpt.cwd = cwd
    }

    //input: 傳入stdin的字串, 無效回退預設undefined(未提供 = 不寫stdin)
    let input = get(onceOpt, 'input', null)
    if (!isestr(input)) {
        onceOpt.input = undefined
    }
    else {
        onceOpt.input = input
    }

    //env: 逐次注入之環境變數物件, 無效回退預設undefined(未提供 = 不覆寫任何變數)
    let env = get(onceOpt, 'env', null)
    if (!isobj(env)) {
        onceOpt.env = undefined
    }
    else {
        onceOpt.env = env
    }

    //validate: 驗證規則字串, 無效回退預設undefined(未提供 = 不驗證)
    //注意: validate亦可為自訂函數(buildValidator支援), 故先放行function不覆蓋
    let validate = get(onceOpt, 'validate', null)
    if (isfun(validate)) {
        onceOpt.validate = validate
    }
    else if (!isestr(validate)) {
        onceOpt.validate = undefined
    }
    else {
        onceOpt.validate = validate
    }

    //onStdout / onStderr: 串流回調函數, 無效回退預設undefined(未提供 = 不回調)
    let onStdout = get(onceOpt, 'onStdout', null)
    if (!isfun(onStdout)) {
        onceOpt.onStdout = undefined
    }
    else {
        onceOpt.onStdout = onStdout
    }
    let onStderr = get(onceOpt, 'onStderr', null)
    if (!isfun(onStderr)) {
        onceOpt.onStderr = undefined
    }
    else {
        onceOpt.onStderr = onStderr
    }

    //maxRetries: 非負整數(可為0), 無效回退預設0
    if (!isp0int(maxRetries)) {
        maxRetries = 0
    }
    else {
        maxRetries = cint(maxRetries)
    }

    //retryDelayMs: 正整數, 無效回退預設5000
    if (!ispint(retryDelayMs)) {
        retryDelayMs = 5000
    }
    else {
        retryDelayMs = cint(retryDelayMs)
    }

    //timeoutMs: 正整數, 無效回退預設120000
    let timeoutMs = get(onceOpt, 'timeoutMs', null)
    if (!ispint(timeoutMs)) {
        onceOpt.timeoutMs = 120000
    }
    else {
        onceOpt.timeoutMs = cint(timeoutMs)
    }

    //maxBuffer: 正整數, 無效回退預設10MB
    let maxBuffer = get(onceOpt, 'maxBuffer', null)
    if (!ispint(maxBuffer)) {
        onceOpt.maxBuffer = 10 * 1024 * 1024
    }
    else {
        onceOpt.maxBuffer = cint(maxBuffer)
    }

    let lastResult
    let totalAttempts = 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {

        //delay, 重試間隔隨次數遞增, 上限15000ms
        if (attempt > 0) {
            let ms = Math.min(retryDelayMs * attempt, 15000)
            await delay(ms)
        }

        lastResult = await execCliOnce(command, args, onceOpt)
        totalAttempts = attempt + 1

        if (lastResult.ok) {
            lastResult.attempts = totalAttempts
            return lastResult
        }

        //不可重試的錯誤
        if (lastResult.error.includes('ENOENT')) {
            break //命令不存在, 重試無意義
        }
        if (lastResult.code === 2) {
            break //參數錯誤, 重試無意義
        }

    }

    lastResult.attempts = totalAttempts

    return lastResult
}


export default execCli
