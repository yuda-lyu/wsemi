//delTraceKit.mjs: fsDeleteFileSafe(Core)、fsDeleteFolderSafe(Core)之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  mkFake: 注入式假fs(不觸及實體檔案), unlinkSync(檔案版)或rmSync(資料夾版)依plan逐次動作並計數
//  runFake: 於假時鐘下執行並推進ms毫秒(重試間隔300ms本身即規格, P5), 回傳settle之結果
//  mkRec: 以timeKit之traceRec為底, 另記每事件通知當下之(假時鐘)時刻, lines()回傳'事件簡式@時刻'
//  fiveOnTrace: P3/P4之五種回調(未傳、紀錄器、拋錯、回傳rejection、非函數)
import { traceRec, useFakeClock } from './timeKit.mjs'
import { revoked } from './codecThrown.mjs'


//fmt, 事件轉為簡式字串: attempt1、retry1/EBUSY/300(n/code/ms)、done3、skip:not-exist/0(reason/n)、giveup3/EBUSY(n/code)、fail1/EPERM(n/code, 無code為null)
function fmt(e) {
    if (e.type === 'attempt' || e.type === 'done') {
        return `${e.type}${e.n}`
    }
    if (e.type === 'retry') {
        return `retry${e.n}/${e.code}/${e.ms}`
    }
    if (e.type === 'skip') {
        return `skip:${e.reason}/${e.n}`
    }
    if (e.type === 'giveup') {
        return `giveup${e.n}/${e.code}`
    }
    if (e.type === 'fail') {
        return `fail${e.n}/${e.code}`
    }
    return JSON.stringify(e)
}


//mkRec, 觀察回調紀錄器: on傳給opt.onTrace, events為已收到之事件, lines()為各事件'簡式@通知當下之Date.now()'(假時鐘下為虛擬時刻)
function mkRec() {
    let tr = traceRec()
    let at = []
    let on = (e) => {
        at.push(Date.now())
        tr.on(e)
    }
    let lines = () => tr.events.map((e, i) => `${fmt(e)}@${at[i]}`)
    return { on, events: tr.events, wait: tr.wait, lines }
}


//mkFake, 注入式假fs: op為'unlinkSync'(檔案版)或'rmSync'(資料夾版)
//  plan之項(第n次呼叫op之動作, plan用盡後'ok'): 'ok'成功並使標的消失、'EBUSY'與'EPERM'與'ENOENT'拋code為該值之Error('<code> <n>')(標的仍在)、'gone'使標的消失後拋code為ENOENT之Error、
//  'null'拋null、'revoked'拋已撤銷之Proxy、'num'拋code為數字之Error
//  o.missing為true時標的不存在; o.wrongKind為true時標的種類不符(檔案版為資料夾、資料夾版為檔案)
function mkFake(op, plan, o = {}) {
    let st = { exists: !o.missing, calls: 0 }
    let isFolder = op === 'rmSync'
    let wrongKind = !!o.wrongKind
    let mkErr = (code, msg) => Object.assign(new Error(msg), { code })
    let fs = {
        statSync: () => {
            if (!st.exists) {
                throw mkErr('ENOENT', 'stat ENOENT')
            }
            return {}
        },
        lstatSync: () => ({
            isDirectory: () => (isFolder ? !wrongKind : wrongKind),
            isFile: () => (isFolder ? wrongKind : !wrongKind),
            isSymbolicLink: () => false,
        }),
    }
    fs[op] = () => {
        st.calls++
        let step = plan[st.calls - 1] || 'ok'
        if (step === 'ok') {
            st.exists = false
            return
        }
        if (step === 'gone') {
            st.exists = false
            throw mkErr('ENOENT', `gone ${st.calls}`)
        }
        if (step === 'null') {
            throw null // eslint-disable-line no-throw-literal
        }
        if (step === 'revoked') {
            throw revoked()
        }
        if (step === 'num') {
            throw Object.assign(new Error(`num ${st.calls}`), { code: 5 })
        }
        throw mkErr(step, `${step} ${st.calls}`)
    }
    return { fs, st }
}


//runFake, 啟用假時鐘執行make()並推進ms毫秒, 回傳{ s: 'resolve'|'reject', v }; 立即掛上處理器(不讓reject成為未處理), 推進後仍未settle即擲出(不直接await以免懸置並使假時鐘無法restore)
async function runFake(make, ms) {
    let clock = useFakeClock()
    try {
        let done = false
        let out = make().then((v) => ({ s: 'resolve', v }), (e) => ({ s: 'reject', v: e }))
        out.then(() => {
            done = true
        })
        await clock.advance(ms)
        await new Promise((resolve) => setImmediate(resolve)) //真實setImmediate讓出, 使已可進行之microtask全數執行
        if (!done) {
            throw new Error('not settled within the advanced fake time')
        }
        return await out
    }
    finally {
        clock.restore()
    }
}


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


export { fmt, mkRec, mkFake, runFake, fiveOnTrace }
