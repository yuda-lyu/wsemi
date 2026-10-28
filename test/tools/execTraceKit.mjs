//execTraceKit.mjs: execProcess、execProcessKillPid之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  recTrace: 以timeKit之traceRec為底, 另記每事件回調時之this與是否凍結(P4)
//  fiveOnTrace: P3/P4之五種回調(未傳、紀錄器、拋錯、回傳rejection、非函數)
//  collectUnhandled: 收集unhandledRejection
//  gateScript、mkGate: 事件閘門子行程腳本與其閘門檔, 使子行程多次輸出之先後由父行程見到上一筆之事件才放行(因果順序), 不靠子行程內計時器隔開
//  untilTrue、withGuard: 條件輪詢與防懸置, 皆用模組載入時保存之真實計時器(假時鐘下亦有效)
//  isAlive、waitExit、waitStdout、reapTree: 子行程就緒與結束之可觀察條件, 與殘留子行程之殺樹回驗
import cp from 'child_process'
import fs from 'fs'
import { traceRec } from './timeKit.mjs'


//真實計時器: 假時鐘(useFakeClock)會取代globalThis.setTimeout/clearTimeout, 防懸置與輪詢須用載入時保存者
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//realSleep, 真實等待ms毫秒, 僅供否定斷言之觀察窗(窗內事件變少只會漏抓不會使正確實作失敗), 不得用於肯定斷言
function realSleep(ms) {
    return new Promise((resolve) => {
        realSetTimeout(resolve, ms)
    })
}


//withGuard, 以真實計時器為pm加上防懸置上限, 逾時reject(只防懸置, 須遠大於正常耗時, 不表達規格之時間要求)
function withGuard(pm, ms, what) {
    return new Promise((resolve, reject) => {
        let t = realSetTimeout(() => {
            reject(new Error(`withGuard: ${what} not done within ${ms}ms`))
        }, ms)
        pm.then((v) => {
            realClearTimeout(t)
            resolve(v)
        }, (e) => {
            realClearTimeout(t)
            reject(e)
        })
    })
}


//untilTrue, 每step毫秒(真實計時器)輪詢cond直到成立, 逾guard毫秒reject(只防懸置)
async function untilTrue(cond, opt = {}) {
    let guard = opt.guard !== undefined ? opt.guard : 15000
    let step = opt.step !== undefined ? opt.step : 10
    let what = opt.what !== undefined ? opt.what : 'condition'
    let t0 = performance.now()
    while (!cond()) {
        if (performance.now() - t0 > guard) {
            throw new Error(`untilTrue: ${what} not met within ${guard}ms`)
        }
        await realSleep(step)
    }
}


//isAlive, 用signal 0檢查pid是否還存在(不真的送signal); 程序已結束時process.kill拋ESRCH
function isAlive(pid) {
    try {
        process.kill(pid, 0)
        return true
    }
    catch (e) {
        return false
    }
}


//tasklistHas, win32以tasklist查pid是否仍在(其他平台回false)
function tasklistHas(pid) {
    if (process.platform !== 'win32') {
        return false
    }
    let r = cp.spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'latin1', windowsHide: true, timeout: 30000 })
    return String(r.stdout).includes(`"${pid}"`)
}


//reapTree, 殘留子行程之殺樹與回驗: win32以taskkill /T /F, 其他平台送SIGKILL, 之後等pid消失並以tasklist回驗; 回傳是否已消失
//  僅於失敗路徑(子行程未依預期結束)呼叫, 已正常結束者不得呼叫(pid可能已被重用)
async function reapTree(pid) {
    try {
        if (process.platform === 'win32') {
            cp.spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, timeout: 30000 })
        }
        else {
            process.kill(pid, 'SIGKILL')
        }
    }
    catch (e) {}
    try {
        await untilTrue(() => !isAlive(pid), { guard: 10000, what: `pid ${pid} gone` })
    }
    catch (e) {
        return false
    }
    return !tasklistHas(pid)
}


//waitExit, 回傳Promise於child之exit事件時resolve exit code; 須在child建立後立即呼叫(避免漏掉事件)
function waitExit(child) {
    let st = { done: false, code: undefined }
    let pm = new Promise((resolve) => {
        child.once('exit', (code) => {
            st.done = true
            st.code = code
            resolve(code)
        })
    })
    pm.st = st
    return pm
}


//waitStdout, 回傳Promise於child之stdout累積內容符合re時resolve累積字串; 須在child建立後立即呼叫
function waitStdout(child, re) {
    return new Promise((resolve) => {
        let buf = ''
        let on = (d) => {
            buf += d.toString()
            if (re.test(buf)) {
                child.stdout.off('data', on)
                resolve(buf)
            }
        }
        child.stdout.on('data', on)
    })
}


//recTrace, 觀察回調紀錄器: on傳給opt.onTrace; meta記每事件回調時之[this, 是否凍結]
function recTrace(opt = {}) {
    let tr = traceRec(opt)
    let meta = []
    let on = function(e) {
        meta.push([this, Object.isFrozen(e)])
        tr.on(e)
    }
    return { on, events: tr.events, mark: tr.mark, wait: tr.wait, types: tr.types, meta }
}


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


//collectUnhandled, 收集unhandledRejection, stop()回傳字串陣列並取消監聽
function collectUnhandled() {
    let un = []
    let on = (v) => un.push(String(v))
    process.on('unhandledRejection', on)
    return {
        stop: () => {
            process.off('unhandledRejection', on)
            return un
        },
    }
}


//gateScript, 事件閘門子行程腳本(以node -e執行, argv[1]為閘門檔前綴、argv[2]為步驟'o:61,e:62'): 依序輸出各步(o為stdout、e為stderr, 後接位元組十六進位), 第k步輸出後須等閘門檔<前綴><k>存在才輸出第k+1步
//  輸出之先後由父行程開閘門之時機(見到上一筆之事件)決定, 不靠子行程內計時器隔開; 輪詢閘門檔之間隔只影響反應速度; 30秒(自身起算)未等到閘門即以離開碼9結束, 防殘留
const gateScript = [
    'const fs=require("fs")',
    'const g=process.argv[1]',
    'const steps=process.argv[2].split(",").map((s)=>s.split(":"))',
    'const t0=Date.now()',
    'let i=0',
    'function next(){const st=steps[i];process[st[0]==="e"?"stderr":"stdout"].write(Buffer.from(st[1],"hex"));i++;if(i>=steps.length){return};const iv=setInterval(()=>{if(fs.existsSync(g+i)){clearInterval(iv);next()}else if(Date.now()-t0>30000){process.exit(9)}},5)}',
    'next()',
].join(';')


//mkGate, 於dir建立閘門檔: base為前綴, open(k)開第k道閘門(放行第k+1步), openAll(n)開前n道(收尾放行剩餘步驟, 使子行程自然結束)
function mkGate(dir) {
    fs.mkdirSync(dir, { recursive: true })
    let base = dir.replace(/[\\/]+$/, '') + '/g'
    let open = (k) => {
        fs.writeFileSync(base + k, '')
    }
    let openAll = (n) => {
        for (let k = 1; k <= n; k++) {
            open(k)
        }
    }
    let clear = () => {
        fs.rmSync(dir, { recursive: true, force: true })
    }
    return { base, open, openAll, clear }
}


//finishCase, execProcess案例之收尾: 放行全部閘門使子行程自然結束, 等被測函數落定(防懸置); 仍未落定者(被測函數缺陷使其懸置)依spawn事件之pid殺樹並回驗, 最後刪閘門夾; 回傳殘留子行程是否已清乾淨
async function finishCase(pm, tr, gate, nGate) {
    if (gate) {
        gate.openAll(nGate)
    }
    let done = false
    let st = pm.then(() => {
        done = true
    }, () => {
        done = true
    })
    try {
        await withGuard(st, 10000, 'settle at finishCase')
    }
    catch (e) {}
    let ev = tr.events.find((x) => x.type === 'spawn')
    let gone = true
    if (!done && ev && typeof ev.pid === 'number') {
        gone = await reapTree(ev.pid)
    }
    if (gate) {
        gate.clear()
    }
    return gone
}


export {
    finishCase,
    realSleep,
    withGuard,
    untilTrue,
    isAlive,
    tasklistHas,
    reapTree,
    waitExit,
    waitStdout,
    recTrace,
    fiveOnTrace,
    collectUnhandled,
    gateScript,
    mkGate
}
