import cst from './_const.mjs'
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
import getErrorMessage from './getErrorMessage.mjs'
import errToStr from './_errToStr.mjs'
import execProcessKillPid from './execProcessKillPid.mjs'
import execCliCore from './execCliCore.mjs'
import execSpawnError from './_execSpawnError.mjs'
import execThrownMsg from './_execThrownMsg.mjs'
import callUser from './_callUser.mjs'
import getTrace from './getTrace.mjs'


//buildSpawnArgs, buildSpawnEnv, 共用核心已抽至execCliCore
let { buildSpawnArgs, buildSpawnEnv } = execCliCore


//pidOf, 觀察回調事件用之子進程pid(未能啟動者proc.pid為undefined, 事件欄位只放數字或null)
function pidOf(proc) {
    return typeof proc.pid === 'number' ? proc.pid : null
}


//kNoRetry, 無法啟動子進程之同步錯誤所產生之結果物件(確定性失敗, 重試無意義), 供execCli判定不重試, 不擴充對外之結果物件欄位
let kNoRetry = new WeakSet()


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
 * @param {Function|null} [trace=null] 輸入觀察回調之通知函數(getTrace之回傳), 格式為(type, info)=>{}, 預設null代表不通知
 * @returns {Promise} 回傳Promise, resolve回傳結果物件
 */
function execCliOnce(command, args = [], opt = {}, trace = null) {

    //opt, 已由execCli前置校驗, 此處僅取預設值
    let {
        timeoutMs = 120000,
        cwd = process.cwd(),
        input = undefined,
        validate: validator = null, //已於parseInput經buildValidator建立(驗證函數或null), 此處(含重試)不再判型呼叫端之值
        maxBuffer = 10 * 1024 * 1024,
        onStdout = undefined,
        onStderr = undefined,
        env: envExtra = undefined,
    } = opt

    //startTime
    let startTime = Date.now()

    //pm
    let pm = genPm()

    //spawn, 同步拋錯(EPERM、UNKNOWN、ENAMETOOLONG、參數檢查錯誤等)以結果物件回報而不reject, 且屬確定性失敗不重試; buildSpawnArgs(含不存在之.cmd/.bat)與buildSpawnEnv之拋錯亦同
    let proc
    try {

        //envSpawn, 併入process.env(同名以envExtra為準, 含PYTHONIOENCODING); 須在try內, env物件展開拋錯(如getter拋錯)亦以結果物件回報
        //每次attempt於此重新求值並僅作用於該次子進程, 不動本進程process.env, 故並行調用可各自帶不同值
        let envSpawn = buildSpawnEnv(envExtra)

        let winSpawn = buildSpawnArgs(command, args, { cwd, env: envSpawn })
        proc = spawn(winSpawn.file, winSpawn.args, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
            env: envSpawn,
            ...winSpawn.opt,
        })
    }
    catch (err) {
        let e = execSpawnError(err, { cwd })
        let r = {
            ok: false,
            stdout: '',
            stderr: '',
            code: null,
            error: `${e.code}: ${e.message}`,
            durationMs: Date.now() - startTime,
            pid: undefined, //與'error'事件(如ENOENT)之結果一致: 未能啟動者帶pid鍵且其值為undefined(JSDoc契約)
        }
        kNoRetry.add(r)
        if (trace) {
            trace('settle', { reason: 'error', code: null, signal: null })
        }
        pm.resolve(r)
        return pm
    }

    //spawn, 子進程已建立(未能啟動者於其後由'error'事件回報, 此時pid為null)
    if (trace) {
        trace('spawn', { pid: pidOf(proc) })
    }

    let stdout = ''
    let stderr = ''

    //TextDecoder, 跨chunk邊界正確解碼UTF-8, 避免多位元組中文字元被切成亂碼(U+FFFD)
    //改用全域TextDecoder而非node內建string_decoder, 避免打包時多引入一個node builtin
    let stdoutDecoder = new TextDecoder('utf-8')
    let stderrDecoder = new TextDecoder('utf-8')

    let settled = false
    let timedOut = false
    let timer = null

    //error, 須於存取stdio前監聽: node對EMFILE、ENFILE不建立stdio即於nextTick發出'error', 先存取會拋TypeError且'error'無人監聽而拉倒程序
    //  可能為'找不到可執行檔'(ENOENT), '權限不足', '系統資源用盡'等, 訊息經execSpawnError去除參數值
    proc.on('error', (err) => {
        if (settled) {
            return
        }
        settled = true
        clearTimeout(timer)
        let e = execSpawnError(err, { cwd })
        if (trace) {
            trace('settle', { reason: 'error', code: null, signal: null })
        }
        pm.resolve({
            ok: false,
            stdout: '',
            stderr: '',
            code: null,
            error: `${e.code}: ${e.message}`,
            durationMs: Date.now() - startTime,
            pid: proc.pid,
        })
    })

    //stdio, EMFILE、ENFILE時node未建立(undefined), 由上方error回報
    if (!proc.stdout || !proc.stderr || !proc.stdin) {
        return pm
    }

    //stdout data, 經TextDecoder跨chunk解碼; 回調經callUser, 拋錯(不攔截, 改於下一輪重拋)不致中斷累積
    proc.stdout.on('data', (chunk) => {
        let str = stdoutDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (onStdout !== undefined) { //已於parseInput判型(函數或undefined), 監聽器內不再判型呼叫端之值(值於入口後撤銷時判型會於監聽器內拋出)
            callUser(onStdout, str)
        }
        let kept = stdout.length < maxBuffer
        if (kept) {
            stdout += str
        }
        if (trace && !settled) {
            trace('data', { stream: 'stdout', len: str.length, size: stdout.length, kept })
            if (kept && stdout.length >= maxBuffer) {
                trace('full', { stream: 'stdout', size: stdout.length })
            }
        }
    })

    //stderr data, 經TextDecoder跨chunk解碼
    proc.stderr.on('data', (chunk) => {
        let str = stderrDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (onStderr !== undefined) { //同onStdout
            callUser(onStderr, str)
        }
        let kept = stderr.length < maxBuffer
        if (kept) {
            stderr += str
        }
        if (trace && !settled) {
            trace('data', { stream: 'stderr', len: str.length, size: stderr.length, kept })
            if (kept && stderr.length >= maxBuffer) {
                trace('full', { stream: 'stderr', size: stderr.length })
            }
        }
    })

    //stdin, 子進程提早關閉stdin時write/end會觸發EPIPE, 需listen'error'才不會拋unhandled event
    proc.stdin.on('error', () => {})
    if (input !== undefined) {
        proc.stdin.write(input, 'utf8')
    }
    proc.stdin.end()

    //timer, 逾時觸發時調用execProcessKillPid殺整棵程序樹
    timer = setTimeout(() => {
        if (settled) {
            return
        }
        timedOut = true
        if (trace) {
            trace('timeout', { ms: timeoutMs })
            trace('kill', { pid: pidOf(proc) })
        }

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
            if (trace) {
                trace('settle', { reason: 'stuck', code: null, signal: null })
            }
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
            if (trace) {
                trace('settle', { reason: 'timeout', code, signal })
            }
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
            if (trace) {
                trace('settle', { reason: 'exit', code, signal })
            }
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

        //resolveOk
        let resolveOk = () => {
            if (trace) {
                trace('settle', { reason: 'ok', code, signal })
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
        }

        //無驗證
        if (!validator) {
            resolveOk()
            return
        }

        //validator, 以原生Promise承接: 自訂函數同步拋錯或其Promise被reject視同驗證失敗(不成為未捕捉例外、不使本次呼叫懸置), 回傳Promise者以其結果判定, 真值為通過
        //拋錯訊息以'validate threw: 訊息'前綴於stderr(error仍恰為OUTPUT_VALIDATION_FAILED, 下游以此判定驗證失敗)
        //拋錯與否另以bThrew標記(拋出之值可為null、undefined, 不可拿值當旗標); 訊息取getErrorMessage, 為空者(null、undefined等)退為errToStr, 並截斷同stderr
        new Promise((resolve) => {
            resolve(validator(stdout))
        })
            .then((b) => {
                return { pass: !!b, bThrew: false, err: null }
            }, (err) => {
                return { pass: false, bThrew: true, err }
            })
            .then(({ pass, bThrew, err }) => {
                if (pass) {
                    resolveOk()
                    return
                }
                let se = strTruncate(stderr, 500, optTruncate)
                if (bThrew) {
                    let m = getErrorMessage(err)
                    if (m === '') {
                        m = errToStr(err)
                    }
                    m = strTruncate(m, 500, optTruncate)
                    se = `validate threw: ${m}${se !== '' ? `\n${se}` : ''}`
                }
                if (trace) {
                    trace('settle', { reason: 'validate', code, signal })
                }
                pm.resolve({
                    ok: false,
                    stdout: strTruncate(stdout, 500, optTruncate),
                    stderr: se,
                    code: 0,
                    error: 'OUTPUT_VALIDATION_FAILED',
                    durationMs,
                    pid: proc.pid,
                })
            })

    })

    return pm
}


/**
 * execCli之輸入判型與預設值(內部使用), 讀取或判型拋錯(getter拋錯、已撤銷之Proxy等不可讀之輸入)時直接拋出, 由execCli承接
 *
 * @param {*} command 輸入執行檔名稱
 * @param {*} args 輸入參數陣列
 * @param {*} opt 輸入設定物件
 * @returns {Object} 回傳{ rInvalid }(command無效之結果物件)或{ args, maxRetries, retryDelayMs, onceOpt, trace }
 */
function parseInput(command, args, opt) {

    //command必填字串: 本函數以error物件回報失敗(非throw風格), 故回傳統一error結構
    if (!isestr(command)) {
        return {
            rInvalid: {
                ok: false,
                stdout: '',
                stderr: '',
                code: null,
                error: 'command 須為非空字串',
                durationMs: 0,
                attempts: 0,
            },
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
    //  通過isestr者(含包裝物件new String)於此轉為原始字串: stdin.write只收原始字串, 包裝物件會於spawn後(本try外)同步拋錯而reject且子進程殘留; 轉字串拋錯者於此以結果物件回報
    let input = get(onceOpt, 'input', null)
    if (!isestr(input)) {
        onceOpt.input = undefined
    }
    else {
        onceOpt.input = String(input)
    }

    //env: 逐次注入之環境變數物件, 無效回退預設undefined(未提供 = 不覆寫任何變數)
    let env = get(onceOpt, 'env', null)
    if (!isobj(env)) {
        onceOpt.env = undefined
    }
    else {
        onceOpt.env = env
    }

    //validate: 驗證規則字串或自訂函數, 於此經buildValidator判型並建立驗證函數一次(無有效規則為null = 不驗證), execCliOnce(含重試)直接使用而不再判型呼叫端之值
    let validate = get(onceOpt, 'validate', null)
    onceOpt.validate = buildValidator(validate)

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
    onceOpt.timeoutMs = Math.min(onceOpt.timeoutMs, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //maxBuffer: 正整數, 無效回退預設10MB
    let maxBuffer = get(onceOpt, 'maxBuffer', null)
    if (!ispint(maxBuffer)) {
        onceOpt.maxBuffer = 10 * 1024 * 1024
    }
    else {
        onceOpt.maxBuffer = cint(maxBuffer)
    }

    //trace, 觀察回調(opt.onTrace), 取自onceOpt(opt展開之副本, 不再讀取呼叫端之opt), 置於其餘判型之後使既有失敗路徑不變; 未給時為null
    let trace = getTrace(onceOpt)

    return { args, maxRetries, retryDelayMs, onceOpt, trace }
}


/**
 * 通用CLI子程序調用，封裝逾時、進程樹清理、輸出驗證、結構化錯誤回報與自動重試
 * 各參數原樣傳遞給目標CLI，支援中文
 * Windows下npm全域安裝之命令為.cmd批次檔，Node.js spawn無法直接執行(CVE-2024-27980安全修正後回EINVAL)，內部已參考cross-spawn自動解析.cmd入口並繞過cmd.exe，故可支援含多行文字之參數
 * 本函數不throw亦不reject，一律以結果物件之ok與error欄位回報成敗，error不含args與env之值(子程序自身之輸出另見stdout、stderr)；command、args、opt或其選項值不可讀(getter拋錯、已撤銷之Proxy等)時亦以結果物件回報，error為'<錯誤碼>: <訊息>'(無錯誤碼者為UNKNOWN，拋出非Error之值時訊息為該值之文字)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCli.test.mjs Github}
 * @memberOf wsemi
 * @param {String} command 輸入執行檔名稱字串，例如'node'、'curl'、'claude'等，可為註冊系統的全域指令或執行檔路徑
 * @param {Array} [args=[]] 輸入參數字串陣列，內容原樣傳遞給目標CLI，預設[]
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeoutMs=120000] 輸入逾時毫秒正整數，逾時將調用execProcessKillPid強制關閉子進程及其子孫程序，預設120000
 * @param {String} [opt.cwd=process.cwd()] 輸入子進程工作目錄字串，預設process.cwd()；不存在或非資料夾時以結果物件回報error為'ENOENT: cwd is not an existing folder: <cwd>'(未能啟動，不重試)
 * @param {String} [opt.input=undefined] 輸入傳入子進程stdin之字串，預設undefined代表不寫入stdin
 * @param {String|Function} [opt.validate=undefined] 輸入stdout驗證規則字串或自訂驗證函數，規則字串支援'nonempty'(非空)、'json'(可JSON.parse)、'min:100'(長度下限)，多規則可用逗號串接例如'nonempty,json'，自訂函數為(stdout)=>Boolean或回傳Promise(以其resolve值判定)，回傳真值為通過；自訂函數拋錯或其Promise被reject視同驗證失敗(error為'OUTPUT_VALIDATION_FAILED'，stderr前綴'validate threw: 錯誤訊息'，訊息截斷至500字元)；自訂函數回傳之Promise不受timeoutMs約束(子進程已結束)，永不落定時本函數亦不落定，durationMs不含驗證時間，預設undefined代表不驗證
 * @param {Number} [opt.maxBuffer=10485760] 輸入stdout與stderr各自累積之最大字元數正整數，超過部分將不再累積，預設10485760(10MB)
 * @param {Function} [opt.onStdout=undefined] 輸入stdout串流回調函數，格式為(chunk)=>{}，回調內拋出之錯誤不會被攔截，將成為未捕捉例外，請於回調內自行處理(該錯誤於回調返回後立即(微任務)原樣重拋，不影響本函數之輸出累積與結果)，預設undefined
 * @param {Function} [opt.onStderr=undefined] 輸入stderr串流回調函數，格式為(chunk)=>{}，行為同onStdout，預設undefined
 * @param {Object} [opt.env=undefined] 輸入本次調用額外注入之環境變數物件，會併入process.env之後(同名以此為準，含PYTHONIOENCODING)，僅作用於該次子進程而不影響本進程之process.env，故並行調用可各自帶不同值；值為undefined代表移除該變數(可遮蔽繼承值)，值為null會成為字面字串'null'故建議勿傳；Windows下環境變數大小寫不敏感，同名不同大小寫(如Path與PATH)亦視為同名覆蓋，預設undefined代表不覆寫任何變數
 * @param {Number} [opt.maxRetries=0] 輸入失敗後最大重試次數非負整數，遇ENOENT(命令不存在、不存在之.cmd/.bat、npm shim之入口檔不存在)、exit code 2(參數錯誤)或無法啟動子進程之同步錯誤(如參數過長、權限不足、非有效執行檔、參數含空字元)視為不可重試而立即中止，預設0
 * @param {Number} [opt.retryDelayMs=5000] 輸入重試間隔毫秒正整數，實際間隔為retryDelayMs乘以重試次數且上限15000ms，預設5000
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；欄位皆為原始值，不含stdout與stderr之內文(只有長度)；type為'attempt'時為即將啟動第n次嘗試(含n，由1起算)，'retry'時為上次嘗試失敗而即將等待ms毫秒後啟動第n次嘗試(含n、ms；n由2起算，ms即實際間隔)，'spawn'時為子進程已建立(含pid，未能啟動者為null)，'data'時為收到一段已解碼之輸出(含stream為'stdout'或'stderr'、len為該段字元數、size為處理後該串流已累積之字元數、kept為該段是否被累積；累積量已達maxBuffer者kept為false且size不變；子進程結束時殘餘之解碼不通知，settle之後亦不通知)，'full'時為該串流累積量首次達到maxBuffer(含stream、size)，'timeout'時為timeoutMs逾時計時器觸發而即將樹殺(含ms為timeoutMs)，'kill'時為即將以execProcessKillPid樹殺(含pid)，'settle'時為本次嘗試即將定案(含reason：'ok'為離開碼0且通過驗證，'exit'為非零離開碼或被訊號終止，'timeout'為逾時樹殺後close，'validate'為驗證失敗，'error'為子進程未能啟動，'stuck'為樹殺後3秒仍未收到close而強制定案；另含code為離開碼數字或null、signal為終止訊號字串或null)，'done'時為整個呼叫即將回傳(含n為實際嘗試次數、ok、reason：成功為'ok'，失敗為'spawn'(無法啟動子進程之同步錯誤)、'enoent'(命令不存在)、'code2'(離開碼2)等不可重試者，其餘含maxRetries為0者為'exhausted')；command無效或opt不可讀而在啟動前即回報者無事件；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響本函數，預設null
 * @returns {Promise} 回傳Promise，resolve回傳結果物件，內含ok(是否成功布林值)、stdout(標準輸出字串)、stderr(標準錯誤字串)、code(離開碼)、error(錯誤訊息字串，成功時為空字串)、durationMs(耗時毫秒)、pid(子進程pid)、attempts(實際嘗試次數)。子進程未能啟動時(spawn同步拋錯、'error'事件、不存在之.cmd/.bat、npm shim之入口檔不存在、cwd不存在、輸入不可讀等)code為null且結果帶pid鍵、其值為undefined；已啟動者(含逾時、訊號結束、非零離開、驗證失敗)皆帶pid數值；command非非空字串時不啟動，attempts為0且不帶pid鍵
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

    //parseInput, 輸入之讀取與判型一律於此try內: 拋錯者(command、args、opt或其選項值之getter拋錯、已撤銷之Proxy等不可讀之輸入)以結果物件回報, 同spawn同步錯誤(code null、帶pid鍵且為undefined、attempts 1、不重試), 不reject
    let startTime = Date.now()
    let p
    try {
        p = parseInput(command, args, opt)
    }
    catch (err) {
        let e = execSpawnError(err)
        return {
            ok: false,
            stdout: '',
            stderr: '',
            code: null,
            error: `${e.code}: ${execThrownMsg(e, err)}`,
            durationMs: Date.now() - startTime,
            pid: undefined, //同spawn同步錯誤: 未能啟動者帶pid鍵且其值為undefined(JSDoc契約)
            attempts: 1,
        }
    }
    if (p.rInvalid) {
        return p.rInvalid
    }
    let { maxRetries, retryDelayMs, onceOpt, trace } = p
    args = p.args

    let lastResult
    let totalAttempts = 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {

        //delay, 重試間隔隨次數遞增, 上限15000ms
        if (attempt > 0) {
            let ms = Math.min(retryDelayMs * attempt, 15000)
            if (trace) {
                trace('retry', { n: attempt + 1, ms })
            }
            await delay(ms)
        }

        if (trace) {
            trace('attempt', { n: attempt + 1 })
        }
        lastResult = await execCliOnce(command, args, onceOpt, trace)
        totalAttempts = attempt + 1

        if (lastResult.ok) {
            lastResult.attempts = totalAttempts
            if (trace) {
                trace('done', { n: totalAttempts, ok: true, reason: 'ok' })
            }
            return lastResult
        }

        //不可重試的錯誤
        if (kNoRetry.has(lastResult)) {
            break //無法啟動子進程之同步錯誤(參數過長、權限不足、非有效執行檔、參數檢查錯誤等), 重試無意義
        }
        if (lastResult.error.includes('ENOENT')) {
            break //命令不存在, 重試無意義
        }
        if (lastResult.code === 2) {
            break //參數錯誤, 重試無意義
        }

    }

    lastResult.attempts = totalAttempts

    //done, 失敗而結束的原因(判定順序同上方迴圈內之不可重試判斷): 'spawn'為無法啟動子進程之同步錯誤, 'enoent'為命令不存在, 'code2'為離開碼2, 其餘(含maxRetries為0)為'exhausted'
    if (trace) {
        let reason = 'exhausted'
        if (kNoRetry.has(lastResult)) {
            reason = 'spawn'
        }
        else if (lastResult.error.includes('ENOENT')) {
            reason = 'enoent'
        }
        else if (lastResult.code === 2) {
            reason = 'code2'
        }
        trace('done', { n: totalAttempts, ok: false, reason })
    }

    return lastResult
}


export default execCli
