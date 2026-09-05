import { spawn } from 'child_process'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import isp0int from './isp0int.mjs'
import execProcessKillPid from './execProcessKillPid.mjs'
import execCliCore from './execCliCore.mjs'


//buildSpawnArgs, buildSpawnEnv, 共用核心
let { buildSpawnArgs, buildSpawnEnv } = execCliCore


/**
 * 建立互動式stdio工作階段(session)，用於stdio協定型之長駐CLI(如MCP之stdio伺服器、codex app-server等一行一則JSON之程式)，與execCli「寫完input即關閉stdin並等待結束」之一次性契約不同，本函數維持stdin開啟，由呼叫端逐次write，直到呼叫stop()才關閉stdin並等待子進程自行退出，逾寬限期則以execProcessKillPid樹殺
 * Windows下npm全域安裝之命令為.cmd批次檔，內部經execCliCore.buildSpawnArgs解析為以node執行其JS入口，不使用shell:true，故樹殺可確實涵蓋子孫程序
 * 本函數不throw亦不reject，spawn失敗(如ENOENT)以onExit與stop()之結果物件回報
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCliSession.test.mjs Github}
 * @memberOf wsemi
 * @param {String} command 輸入執行檔名稱字串，可為註冊系統的全域指令或執行檔路徑
 * @param {Array} [args=[]] 輸入參數字串陣列，預設[]
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.cwd=process.cwd()] 輸入子進程工作目錄字串，預設process.cwd()
 * @param {Object} [opt.env=undefined] 輸入本次額外注入之環境變數物件，語意同execCli，預設undefined
 * @param {Number} [opt.timeoutMs=null] 輸入整體逾時毫秒正整數，逾時即樹殺並於結果標timeout:true，預設null代表不限制(工作階段為長駐，不沿用execCli之120000)
 * @param {Number} [opt.exitGraceMs=2000] 輸入stop()關閉stdin後等待子進程自行退出之寬限毫秒非負整數，逾期即樹殺，預設2000
 * @param {Number} [opt.killWaitMs=3000] 輸入樹殺後等待exit事件之上限毫秒非負整數，逾期仍未退出則於結果標exited:false並結束等待，預設3000
 * @param {Number} [opt.stderrKeep=4000] 輸入stderr保留尾端字元數非負整數，預設4000
 * @param {Function} [opt.onLine=undefined] 輸入stdout逐行回調函數，格式為(line)=>{}，line不含換行(\\r\\n與\\n皆視為換行)，子進程結束時殘餘之不完整行亦會發出，預設undefined
 * @param {Function} [opt.onStdout=undefined] 輸入stdout原始片段回調函數，格式為(chunk)=>{}，已經UTF-8跨chunk解碼，供非行式協定(如LSP之Content-Length分幀)自行分幀，預設undefined
 * @param {Function} [opt.onStderr=undefined] 輸入stderr片段回調函數，格式為(chunk)=>{}，預設undefined
 * @param {Function} [opt.onExit=undefined] 輸入子進程結束回調函數，格式為(result)=>{}，result同stop()之回傳，預設undefined
 * @returns {Object} 回傳工作階段物件s，內含pid(子進程pid，spawn失敗為null)、exited(是否已結束布林值)、write(str)(寫入stdin，回傳Promise，resolve為是否寫入成功布林值，子進程已結束時靜默resolve(false))、writeLine(str)(補換行後寫入)、stop()(關閉stdin並等待結束，回傳Promise，resolve回傳結果物件，內含code、signal、exited、timeout、killed、error、stderr、durationMs、pid；多次呼叫回傳同一Promise)
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     let nodeBin = process.execPath
 *
 *     //逐行回顯程式, 收到EOF即結束
 *     let sc = `
 *         let rl = require('readline').createInterface({ input: process.stdin })
 *         rl.on('line', (l) => process.stdout.write('echo:' + l + '\\n'))
 *         rl.on('close', () => process.exit(0))
 *     `
 *
 *     let lines = []
 *     let s = execCliSession(nodeBin, ['-e', sc], {
 *         onLine: (line) => {
 *             lines.push(line)
 *         },
 *     })
 *     await s.writeLine('abc')
 *     await s.writeLine('中文')
 *     let r = await s.stop() //關閉stdin, 子進程收到EOF自行退出
 *     console.log(lines, r.code, r.exited, r.killed)
 *     // => [ 'echo:abc', 'echo:中文' ] 0 true false
 *
 *     //不理會EOF之程式, stop()逾寬限期即樹殺
 *     let s2 = execCliSession(nodeBin, ['-e', 'setInterval(() => {}, 1000)'], { exitGraceMs: 300 })
 *     let r2 = await s2.stop()
 *     console.log(r2.exited, r2.killed)
 *     // => true true
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
function execCliSession(command, args = [], opt = {}) {

    //args
    if (!isarr(args)) {
        args = []
    }

    //opt
    if (!isobj(opt)) {
        opt = {}
    }

    //cwd
    let cwd = get(opt, 'cwd')
    if (!isestr(cwd)) {
        cwd = process.cwd()
    }

    //envExtra
    let envExtra = get(opt, 'env')
    if (!isobj(envExtra)) {
        envExtra = undefined
    }

    //timeoutMs, 預設null不限制
    let timeoutMs = get(opt, 'timeoutMs')
    if (!ispint(timeoutMs)) {
        timeoutMs = null
    }

    //exitGraceMs
    let exitGraceMs = get(opt, 'exitGraceMs')
    if (!isp0int(exitGraceMs)) {
        exitGraceMs = 2000
    }

    //killWaitMs
    let killWaitMs = get(opt, 'killWaitMs')
    if (!isp0int(killWaitMs)) {
        killWaitMs = 3000
    }

    //stderrKeep
    let stderrKeep = get(opt, 'stderrKeep')
    if (!isp0int(stderrKeep)) {
        stderrKeep = 4000
    }

    //callbacks
    let onLine = get(opt, 'onLine')
    let onStdout = get(opt, 'onStdout')
    let onStderr = get(opt, 'onStderr')
    let onExit = get(opt, 'onExit')

    //startTime
    let startTime = Date.now()

    //state
    let settled = false
    let result = null
    let timedOut = false
    let killed = false
    let stopping = false
    let stderrTail = ''
    let lineBuf = ''
    let timer = null
    let graceTimer = null
    let killTimer = null
    let pmExit = genPm() //子進程結束(或確認無法結束)時resolve
    let pmStop = null

    //s
    let s = {
        pid: null,
        exited: false,
        write: null,
        writeLine: null,
        stop: null,
    }

    //settle, 只執行一次: 整理結果, 標記exited, 觸發onExit, 喚醒stop()
    let settle = (r) => {
        if (settled) {
            return
        }
        settled = true
        clearTimeout(timer)
        clearTimeout(graceTimer)
        clearTimeout(killTimer)
        result = {
            code: null,
            signal: null,
            exited: true,
            timeout: timedOut,
            killed,
            error: '',
            stderr: stderrTail,
            durationMs: Date.now() - startTime,
            pid: s.pid,
            ...r,
        }
        s.exited = true
        if (isfun(onExit)) {
            onExit(result)
        }
        pmExit.resolve(result)
    }

    //stopNoProc, 未能spawn時之stop
    let stopNoProc = () => {
        if (pmStop) {
            return pmStop
        }
        pmStop = genPm()
        pmExit.then((r) => {
            pmStop.resolve(r)
        })
        return pmStop
    }

    //command必填字串: 不spawn, 以timer脫勾後settle使onExit於本函數回傳後才觸發
    if (!isestr(command)) {
        s.write = async () => false
        s.writeLine = async () => false
        s.stop = stopNoProc
        setTimeout(() => {
            settle({ error: 'command 須為非空字串' })
        }, 1)
        return s
    }

    //spawn
    let sp = buildSpawnArgs(command, args)
    let proc
    try {
        proc = spawn(sp.file, sp.args, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
            env: buildSpawnEnv(envExtra),
            ...sp.opt,
        })
    }
    catch (err) {
        //spawn同步拋錯(如參數無效EINVAL)
        s.write = async () => false
        s.writeLine = async () => false
        s.stop = stopNoProc
        setTimeout(() => {
            settle({ error: `${err.code || 'UNKNOWN'}: ${err.message}` })
        }, 1)
        return s
    }
    s.pid = proc.pid || null

    //TextDecoder, 跨chunk邊界正確解碼UTF-8, 避免多位元組中文字元被切成亂碼(U+FFFD)
    let stdoutDecoder = new TextDecoder('utf-8')
    let stderrDecoder = new TextDecoder('utf-8')

    //emitLines, 以\n切行, 去尾端\r, 殘餘保留至下次; flush時把殘餘不完整行一併發出
    let emitLines = (str, flush) => {
        lineBuf += str
        let idx = lineBuf.indexOf('\n')
        while (idx >= 0) {
            let line = lineBuf.slice(0, idx)
            lineBuf = lineBuf.slice(idx + 1)
            if (line.endsWith('\r')) {
                line = line.slice(0, -1)
            }
            if (isfun(onLine)) {
                onLine(line)
            }
            idx = lineBuf.indexOf('\n')
        }
        if (flush && lineBuf !== '') {
            let line = lineBuf
            lineBuf = ''
            if (line.endsWith('\r')) {
                line = line.slice(0, -1)
            }
            if (isfun(onLine)) {
                onLine(line)
            }
        }
    }

    //appendStderr, 保留尾端stderrKeep字元
    let appendStderr = (str) => {
        if (stderrKeep === 0) {
            stderrTail = ''
            return
        }
        stderrTail = (stderrTail + str).slice(-stderrKeep)
    }

    //stdout data
    proc.stdout.on('data', (chunk) => {
        let str = stdoutDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (isfun(onStdout)) {
            onStdout(str)
        }
        emitLines(str, false)
    })

    //stderr data
    proc.stderr.on('data', (chunk) => {
        let str = stderrDecoder.decode(chunk, { stream: true })
        if (!str) {
            return
        }
        if (isfun(onStderr)) {
            onStderr(str)
        }
        appendStderr(str)
    })

    //stdin, 子進程提早關閉stdin時write/end會觸發EPIPE, 需listen'error'才不會拋unhandled event
    proc.stdin.on('error', () => {})

    //kill, 樹殺並等待exit, 逾killWaitMs仍未退出則以exited:false結束等待
    let kill = (errorIfStuck) => {
        killed = true
        execProcessKillPid(proc.pid)
            .catch(() => {}) //pid可能已結束, 忽略error
        killTimer = setTimeout(() => {
            if (settled) {
                return
            }
            settle({ code: null, exited: false, error: errorIfStuck })
        }, killWaitMs)
    }

    //timer, 整體逾時
    if (timeoutMs !== null) {
        timer = setTimeout(() => {
            if (settled) {
                return
            }
            timedOut = true
            kill(`TIMEOUT after ${timeoutMs / 1000}s(子進程未能結束)`)
        }, timeoutMs)
    }

    //error, 監聽(例如執行spawn本身)錯誤訊息, 可能為'找不到可執行檔'(ENOENT), '權限不足', '系統資源用盡'等
    proc.on('error', (err) => {
        settle({ error: `${err.code || 'UNKNOWN'}: ${err.message}` })
    })

    //close
    proc.on('close', (code, signal) => {
        if (settled) {
            return
        }

        //flush decoder殘餘與不完整行
        let fOut = stdoutDecoder.decode()
        if (fOut) {
            if (isfun(onStdout)) {
                onStdout(fOut)
            }
            emitLines(fOut, false)
        }
        emitLines('', true)
        let fErr = stderrDecoder.decode()
        if (fErr) {
            if (isfun(onStderr)) {
                onStderr(fErr)
            }
            appendStderr(fErr)
        }

        //error, 自行stop()所致之樹殺不視為錯誤
        let error = ''
        if (timedOut) {
            error = `TIMEOUT after ${timeoutMs / 1000}s`
        }
        else if (!killed) {
            if (signal) {
                error = `Signal: ${signal}`
            }
            else if (code !== 0) {
                error = `Exit code ${code}`
            }
        }

        settle({ code, signal, error })
    })

    //write
    s.write = (str) => {
        let pm = genPm()
        if (settled || stopping || proc.stdin.destroyed || !proc.stdin.writable) {
            pm.resolve(false)
            return pm
        }
        try {
            proc.stdin.write(String(str), 'utf8', (err) => {
                pm.resolve(!err)
            })
        }
        catch {
            pm.resolve(false)
        }
        return pm
    }

    //writeLine
    s.writeLine = (str) => {
        return s.write(String(str) + '\n')
    }

    //stop, 關閉stdin → 等exitGraceMs → 未退出即樹殺 → 等exit; 多次呼叫回傳同一Promise
    s.stop = () => {
        if (pmStop) {
            return pmStop
        }
        pmStop = genPm()
        if (settled) {
            pmStop.resolve(result)
            return pmStop
        }
        stopping = true
        try {
            proc.stdin.end()
        }
        catch {}
        graceTimer = setTimeout(() => {
            if (settled) {
                return
            }
            kill('STOP_TIMEOUT(子進程未能結束)')
        }, exitGraceMs)
        pmExit.then((r) => {
            pmStop.resolve(r)
        })
        return pmStop
    }

    return s
}


export default execCliSession
