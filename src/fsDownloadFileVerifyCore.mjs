// import fs from 'fs'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isfun from './isfun.mjs'
import isbol from './isbol.mjs'
import optNum from './_optNum.mjs'
import cst from './_const.mjs'


//同程序內進行中之下載, 鍵為正式檔之絕對路徑(Windows不分大小寫), 值為進行中工作之陣列(同一檔可有期望值或選項不同之多個工作)
let _inflight = new Map()

//本函數自建之錯誤(mkErr所建), 錯誤代碼為E_ARG、E_EXPECTED、E_HTTP、E_NETWORK、E_TIMEOUT、E_TIMEOUT_TOTAL、E_SIZE_MISMATCH、E_HASH_MISMATCH、E_FS、E_RENAME
//以身分判定而非以code判定: 傳入元件(fetch、fs、串流)所拋值可能帶同名code, 不可被當成本函數自建之錯誤
let _own = new WeakSet()

//暫時性檔案占用之錯誤代碼(Windows下防毒掃描常見), 更名與刪除暫存檔時重試
let codesBusy = ['EPERM', 'EBUSY', 'EACCES']

//所需之fs方法, 於入口取出並綁定, 之後不再讀取opt.fs之屬性(檢查之值即使用之值)
let fnsFs = ['mkdirSync', 'realpathSync', 'openSync', 'closeSync', 'createWriteStream', 'createReadStream', 'renameSync', 'unlinkSync', 'statSync']


function mkErr(code, msg, extra = {}) {
    let err = new Error(msg)
    err.code = code
    Object.assign(err, extra)
    _own.add(err)
    return err
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, Math.min(ms, cst.TIMER_TIME_MAX))
    })
}


function now() {
    return performance.now() //單調時計, 不受系統校時影響
}


function short(h) {
    return isestr(h) ? `${h.slice(0, 16)}...` : 'unknown'
}


//errMsg, 任意拋出值之訊息字串
function errMsg(err) {
    try {
        let m = get(err, 'message')
        if (isestr(m)) {
            return m
        }
        return String(err)
    }
    catch (e) {
        return 'unknown error'
    }
}


//describeNet, 網路層錯誤(undici之TypeError: fetch failed/terminated, 原因在cause)轉為簡短說明
function describeNet(err) {
    let msg = errMsg(err)
    let d = ''
    try {
        let c = get(err, 'cause')
        if (c) {
            d = `${get(c, 'code', '') || ''} ${get(c, 'message', '') || ''}`.trim()
        }
    }
    catch (e) {}
    return maskUrl(d ? `${msg} (${d})` : msg) //底層錯誤文字可能帶回請求之網址, 一併遮蔽帳密
}


//isOwnErr, 是否為本函數自建之錯誤(身分判定, 不讀取其屬性, 不會拋錯)
function isOwnErr(err) {
    return _own.has(err)
}


//codeOf, 取傳入元件所拋值之code; 該值之code getter拋錯時視為無code, 不讓原錯誤漏出
function codeOf(err) {
    try {
        return get(err, 'code')
    }
    catch (e) {
        return undefined
    }
}


//maskUrl, 文字內之網址若帶帳密(scheme://user:pass@host)則遮蔽之(全部出現處, 前面可有空白等其他文字), 用於錯誤訊息與錯誤物件, 不讓帳密落入log
function maskUrl(s) {
    return String(s).replace(/([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^/?#\s]*@/g, '$1***@')
}


//unwrap, 包裝物件(new String/Number/Boolean)取其內部原始值(不呼叫物件自身可被覆寫之方法), 其餘值原樣回傳; 使檢查之值即使用之值
function unwrap(v) {
    if (v !== null && typeof v === 'object') {
        for (let P of [String, Number, Boolean]) {
            try {
                return P.prototype.valueOf.call(v)
            }
            catch (e) {}
        }
    }
    return v
}


//parseSize, 位元組數須為非負安全整數(數值)或十進位整數字串(前後空白可): 小數、指數、十六進位、超過安全整數者回傳-1(轉數字會失真或非整數); 回傳非負安全整數或-1
function parseSize(v) {
    if (typeof v === 'number') {
        return Number.isSafeInteger(v) && v >= 0 ? v + 0 : -1 //+0使-0成為0
    }
    if (typeof v === 'string' && /^\s*\d+\s*$/.test(v)) {
        let n = Number(v)
        return Number.isSafeInteger(n) ? n : -1
    }
    return -1
}


//dropBody, 取消回應本體以釋放連線; 不等待其落定(底層cancel可能永不落定), 失敗不影響結果
function dropBody(res) {
    try {
        let p = res.body.cancel()
        if (p && isfun(p.catch)) {
            p.catch(() => {})
        }
    }
    catch (err) {}
}


//normExpected, 檢核期望值, 回傳{ sha256(小寫), size(未給或null則null) }或{ err }
//各值只讀取一次並解包為原始值(包裝物件之方法可被覆寫, 不可檢查一個值而使用另一個值)
function normExpected(v) {
    let sha256 = unwrap(get(v, 'sha256'))
    let size = unwrap(get(v, 'size'))
    if (!isestr(sha256) || !/^[0-9a-fA-F]{64}$/.test(sha256)) {
        return { err: `sha256 must be a string of 64 hexadecimal characters` }
    }
    if (size === undefined || size === null) {
        size = null
    }
    else {
        size = parseSize(size)
        if (size < 0) {
            return { err: `size must be a non-negative integer when given` }
        }
    }
    return { sha256: sha256.toLowerCase(), size }
}


function descExp(exp) {
    return exp.size === null ? 'size not given' : `${exp.size} bytes`
}


//splitPath, 拆出所在資料夾與檔名; 以最後一個分隔符切分(保留UNC之前置雙反斜線), 根目錄保留分隔符
//Windows之分隔符為/與\, 其他系統只有/(反斜線為合法檔名字元, 不可當分隔符)
//Windows之磁碟相對路徑('C:a.bin')之資料夾為'C:'(該磁碟之目前資料夾), 不可把'C:a.bin'當檔名(冒號會成為替代資料流)
function splitPath(fp, win32) {
    let i = win32 ? Math.max(fp.lastIndexOf('/'), fp.lastIndexOf('\\')) : fp.lastIndexOf('/')
    if (i < 0) {
        if (win32 && /^[A-Za-z]:/.test(fp)) {
            return { fd: fp.slice(0, 2), name: fp.slice(2) }
        }
        return { fd: '', name: fp }
    }
    let fd = fp.slice(0, i)
    if (fd === '' || (win32 && /^[A-Za-z]:$/.test(fd))) {
        fd = fp.slice(0, i + 1) //'/'、'C:\'
    }
    return { fd, name: fp.slice(i + 1) }
}


//remainMs, 整體截止前之剩餘毫秒, 已用盡即拋E_TIMEOUT_TOTAL
function remainMs(ctx, step) {
    let remain = ctx.deadline - now()
    if (remain <= 0) {
        throw mkErr('E_TIMEOUT_TOTAL', `the total time budget of ${ctx.totalMs}ms is used up`, { step })
    }
    return Math.min(remain, cst.TIMER_TIME_MAX)
}


//waitClose, 等寫入串流關閉, 最多等ms毫秒, 回傳是否已關閉
//除'close'事件外也輪詢closed屬性: 串流以emitClose:false建立時已關閉但不會發出'close'事件
function waitClose(ws, ms) {
    if (ws.closed) {
        return Promise.resolve(true)
    }
    return new Promise((resolve) => {
        let timer = null
        let poll = null
        let done = (v) => {
            clearTimeout(timer)
            clearInterval(poll)
            ws.removeListener('close', onClose)
            resolve(v)
        }
        let onClose = () => {
            done(true)
        }
        timer = setTimeout(() => {
            done(false)
        }, ms)
        poll = setInterval(() => {
            if (ws.closed) {
                done(true)
            }
        }, 20)
        ws.once('close', onClose)
    })
}


//openReq, 單一請求之計時: 連續stallMs沒有資料(touch)中止, 整體超過截止時間中止, 中止原因存於reason
//guard包住請求期間之每個等待(fetch、pipeline), 中止時即落定, 不依賴被等待者是否響應signal; close時中止請求, 釋放未讀完之本體與連線
function openReq(ctx, step) {
    let remain = remainMs(ctx, step)
    let ac = new AbortController()
    let reason = null
    let pmAbort = new Promise((resolve, reject) => {
        ac.signal.addEventListener('abort', () => {
            reject(reason !== null ? reason : ac.signal.reason)
        }, { once: true })
    })
    pmAbort.catch(() => {})
    let abort = (err) => {
        if (reason === null && !ac.signal.aborted) {
            reason = err
            ac.abort(err)
        }
    }
    let timerTotal = setTimeout(() => {
        abort(mkErr('E_TIMEOUT_TOTAL', `the total time budget of ${ctx.totalMs}ms is used up`))
    }, remain)
    let timerStall = null
    let timerFb = null
    let touch = () => {
        clearTimeout(timerStall)
        timerStall = setTimeout(() => {
            abort(mkErr('E_TIMEOUT', `no data received for ${ctx.stallMs}ms`))
        }, ctx.stallMs)
    }
    touch()
    return {
        signal: ac.signal,
        touch,
        reason: () => reason,
        guard: (pm) => {
            return Promise.race([pm, pmAbort])
        },
        stop: (fallbackMs) => {
            //網路階段結束(本體已讀完並寫出, 或某一端已先出錯), 停止停滯與整體計時, 之後之等待各自設上限, 其錯誤不得被計時器之中止原因取代
            //給fallbackMs者(某一端已先出錯): 若傳入之pipeline仍不落定, 於該時間後以不帶原因之abort使guard落定(原因不寫入reason, 不取代先出錯之一端)
            clearTimeout(timerTotal)
            clearTimeout(timerStall)
            if (fallbackMs !== undefined && !ac.signal.aborted) {
                clearTimeout(timerFb)
                timerFb = setTimeout(() => {
                    ac.abort()
                }, fallbackMs)
            }
        },
        close: () => {
            clearTimeout(timerTotal)
            clearTimeout(timerStall)
            clearTimeout(timerFb)
            if (!ac.signal.aborted) {
                ac.abort()
            }
        },
    }
}


//tagErr, 整理請求過程之錯誤: 計時器中止的以中止原因為準, 非本函數定義之錯誤視為網路錯誤
function tagErr(err, req, step) {
    let e = req.reason() || err
    if (!isOwnErr(e)) {
        e = mkErr('E_NETWORK', describeNet(e), { cause: e })
    }
    if (!e.step) {
        e.step = step
    }
    return e
}


//getExpected, 取得本次嘗試之期望值; 期望值為函數時每次嘗試前呼叫, 以整體截止時間為上限(逾時以signal通知該函數)
async function getExpected(ctx, attempt) {
    if (ctx.expFn === null) {
        return ctx.expStatic
    }
    let remain = remainMs(ctx, 'expected')
    let ac = new AbortController()
    let timer = null
    let errTimeout = mkErr('E_TIMEOUT_TOTAL', `the total time budget of ${ctx.totalMs}ms is used up while getting the expected value`, { step: 'expected' })
    let pmTimeout = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            ac.abort(errTimeout)
            reject(errTimeout)
        }, remain)
    })
    let v
    try {
        //以不帶接收者之方式呼叫(this不為內部脈絡), 呼叫端之函數不得取得或改寫內部狀態
        let fn = ctx.expFn
        let pmFn = Promise.resolve().then(() => {
            return fn({ attempt, signal: ac.signal })
        })
        v = await Promise.race([pmFn, pmTimeout])
    }
    catch (err) {
        if (err === errTimeout) {
            throw err
        }
        let retryable = false
        try {
            retryable = get(err, 'retryable') === true
        }
        catch (e) {}
        throw mkErr('E_EXPECTED', `the expected function failed: ${errMsg(err)}`, { step: 'expected', retryable, cause: err })
    }
    finally {
        clearTimeout(timer)
    }
    let r
    try {
        r = normExpected(v)
    }
    catch (err) {
        r = { err: `can not be read (${errMsg(err)})` }
    }
    if (r.err) {
        throw mkErr('E_EXPECTED', `the expected function returned an invalid value: ${r.err}`, { step: 'expected' })
    }
    return r
}


//hashFile, 讀檔計算SHA-256與大小, 至多ms毫秒(逾時拋E_TIMEOUT_TOTAL, 並銷毀讀取串流)
async function hashFile(ctx, fp, ms, step) {
    let rs = null
    let timer = null
    try {
        let pmRead = (async () => {
            let hash = ctx.crypto.createHash('sha256')
            let size = 0
            rs = ctx.fs.createReadStream(fp)
            for await (let chunk of rs) {
                size += chunk.length
                hash.update(chunk)
            }
            return { sha256: hash.digest('hex'), size }
        })()
        let pmTimeout = new Promise((resolve, reject) => {
            timer = setTimeout(() => {
                reject(mkErr('E_TIMEOUT_TOTAL', `reading "${fp}" did not finish within ${ms}ms`, { step }))
            }, Math.max(ms, 1))
        })
        return await Promise.race([pmRead, pmTimeout])
    }
    finally {
        clearTimeout(timer)
        if (rs !== null) {
            try {
                rs.destroy()
            }
            catch (err) {}
        }
    }
}


//matchFile, 檔案內容是否即為期望值(大小與SHA-256皆相符), 相符回傳其大小; 不存在、不符、讀取失敗或逾ms毫秒皆回傳-1
async function matchFile(ctx, fp, exp, ms) {
    try {
        let st = ctx.fs.statSync(fp)
        if (!st.isFile()) {
            return -1
        }
        if (exp.size !== null && st.size !== exp.size) {
            return -1
        }
        let r = await hashFile(ctx, fp, ms, 'verify')
        if (r.sha256 !== exp.sha256 || (exp.size !== null && r.size !== exp.size)) {
            return -1
        }
        return r.size
    }
    catch (err) {
        return -1
    }
}


//fetchToTemp, 串流下載至暫存檔並同時計算SHA-256與大小, 再重讀暫存檔核對, 相符才回傳, 不符拋錯(暫存檔由呼叫端清除)
//tmp為{ fp, owned }: 暫存檔由本次以排他方式建立成功後owned為true(之後須由本次清除); 建立失敗(含同名檔已存在)者不屬於本次, 不得刪除
async function fetchToTemp(ctx, exp, tmp) {
    let step = 'request'
    let req = openReq(ctx, step)
    let ws = null
    let side = '' //最先出錯之一端: 'src'(網路)或'ws'(寫檔)
    let errWs = null
    let res = null
    let pmFetch = null
    let bodyTaken = false //回應本體是否已交給串流(之後由串流之銷毀負責取消)
    let closeWaited = false //是否已等過寫入串流關閉而未關閉(失敗清理不重複等待)
    try {

        //fetch, 放棄等待後才落定之回應(傳入之fetch不響應中止時)由finally取消其本體; 以不帶接收者之方式呼叫(this不為內部脈絡)
        let fnFetch = ctx.fetch
        pmFetch = Promise.resolve().then(() => {
            return fnFetch(ctx.urlIn, { signal: req.signal })
        })
        res = await req.guard(pmFetch)
        req.touch()
        if (!get(res, 'ok')) {
            let status = get(res, 'status')
            let statusText = get(res, 'statusText', '') || ''
            dropBody(res)
            throw mkErr('E_HTTP', `HTTP ${status} ${statusText}`.trim(), { status, step })
        }

        //回應宣告之大小與期望不同(且未經內容編碼與分塊傳輸)即不必下載, 常見於期望值與檔案因快取而不同步
        //  content-encoding(gzip等)時fetch自動解壓而標頭為壓縮後大小, transfer-encoding存在時依RFC須忽略content-length, 兩者皆不核對
        if (exp.size !== null) {
            let cl = res.headers.get('content-length')
            let ce = res.headers.get('content-encoding')
            let te = res.headers.get('transfer-encoding')
            if (isestr(cl) && /^\d+$/.test(cl.trim()) && (!isestr(ce) || ce.trim().toLowerCase() === 'identity') && !isestr(te) && Number(cl.trim()) !== exp.size) {
                dropBody(res)
                throw mkErr('E_SIZE_MISMATCH', `size mismatch: expected ${exp.size} bytes, the server announces ${cl.trim()} bytes`, { step: 'verify', actual: { sha256: null, size: Number(cl.trim()) } })
            }
        }

        //暫存檔, 以排他方式(wx)同步建立: 建立成功才屬於本次; 同名檔已存在(EEXIST)或其他開檔失敗皆非本次建立之檔, 不得刪除
        step = 'download'
        let fd = null
        try {
            fd = ctx.fs.openSync(tmp.fp, 'wx')
        }
        catch (err) {
            dropBody(res)
            let msg = codeOf(err) === 'EEXIST' ? `the temporary file "${tmp.fp}" already exists and does not belong to this call` : `can not create the temporary file "${tmp.fp}": ${errMsg(err)}`
            throw mkErr('E_FS', msg, { step, cause: err })
        }
        tmp.owned = true
        try {
            ws = ctx.fs.createWriteStream(tmp.fp, { fd })
        }
        catch (err) {
            let noteClose = ''
            try {
                ctx.fs.closeSync(fd)
            }
            catch (e) {
                noteClose = `; closing its descriptor also failed: ${errMsg(e)}`
            }
            dropBody(res)
            throw mkErr('E_FS', `can not write the temporary file "${tmp.fp}": ${errMsg(err)}${noteClose}`, { step, cause: err })
        }

        //錯誤之歸屬: pipeline因一端出錯而銷毀其他端時, 其他端亦以同一錯誤emit error, 故以最先出錯之一端判定(寫入端最先者為磁碟錯誤, 不論有無syscall)
        //  最先出錯後即停止停滯與整體計時(其後關閉較慢時, 晚到之計時中止不得取代先出錯之一端), 若傳入之pipeline仍不落定則5秒後使guard落定
        ws.on('error', (err) => {
            if (side === '') {
                side = 'ws'
                errWs = err
                req.stop(5000)
            }
        })

        //串流寫入暫存檔並計算雜湊, 超過期望大小即中止, 不讓異常回應寫滿磁碟
        let hash = ctx.crypto.createHash('sha256')
        let size = 0
        let cap = exp.size
        let src = null
        if (res.body) {
            try {
                src = ctx.Readable.fromWeb(res.body)
            }
            catch (err) {
                //回應本體不是WHATWG ReadableStream(如傳入之fetch回傳Node之Readable本體): 確定性之介面不相容, 不是暫時性之網路錯誤, 不重試(本體由finally取消)
                throw mkErr('E_ARG', `opt.fetch must return a Response whose body is a WHATWG ReadableStream: ${errMsg(err)}`, { step, cause: err })
            }
            bodyTaken = true
        }
        else {
            src = ctx.Readable.from([])
        }
        src.on('error', () => {
            if (side === '') {
                side = 'src'
                req.stop(5000)
            }
        })
        let check = async function* (source) {
            for await (let chunk of source) {
                size += chunk.length
                if (cap !== null && size > cap) {
                    throw mkErr('E_SIZE_MISMATCH', `size mismatch: expected ${cap} bytes, received more than that`, { step: 'verify', actual: { sha256: null, size: null } })
                }
                hash.update(chunk)
                req.touch()
                yield chunk
            }
        }

        //pipeline帶入signal: 停滯或整體時間用盡時連同寫入端(含本文已讀完後等待寫出與關閉的階段)一併中止; guard使不響應中止之傳入串流亦不致懸置
        let fnPipeline = ctx.pipeline
        await req.guard(fnPipeline(src, check, ws, { signal: req.signal }))
        req.stop()

        //等檔案控制代碼關閉, 才能重讀與更名
        if (!(await waitClose(ws, 5000))) {
            closeWaited = true
            throw mkErr('E_FS', `the temporary file "${tmp.fp}" was not closed within 5s`, { step })
        }

        //verify
        let sha256 = hash.digest('hex')
        let actual = { sha256, size }
        if (cap !== null && size !== cap) {
            throw mkErr('E_SIZE_MISMATCH', `size mismatch: expected ${cap} bytes, received ${size} bytes (sha256 ${short(sha256)})`, { step: 'verify', actual })
        }
        if (sha256 !== exp.sha256) {
            throw mkErr('E_HASH_MISMATCH', `sha256 mismatch: expected ${short(exp.sha256)} (${descExp(exp)}), received ${short(sha256)} (${size} bytes)`, { step: 'verify', actual })
        }

        //重讀暫存檔核對: 寫入後至此暫存檔被改動(防毒處置、同資料夾之其他寫入者)即失敗而不更名
        step = 'verify'
        let disk = null
        try {
            disk = await hashFile(ctx, tmp.fp, remainMs(ctx, step), step)
        }
        catch (err) {
            if (isOwnErr(err)) {
                throw err
            }
            throw mkErr('E_FS', `can not read back the temporary file "${tmp.fp}": ${errMsg(err)}`, { step, cause: err })
        }
        if (disk.sha256 !== sha256 || disk.size !== size) {
            throw mkErr('E_HASH_MISMATCH', `the temporary file "${tmp.fp}" changed after it was written: received ${short(sha256)} (${size} bytes), on disk ${short(disk.sha256)} (${disk.size} bytes)`, { step, actual: disk })
        }

        return actual
    }
    catch (err) {

        //確保暫存檔之檔案控制代碼已關閉, 呼叫端才能刪除
        if (ws !== null && !ws.closed) {
            ws.destroy()
            if (!closeWaited) {
                await waitClose(ws, 5000)
            }
        }

        if (req.reason() === null && !isOwnErr(err) && side === 'ws') {
            throw mkErr('E_FS', `can not write the temporary file "${tmp.fp}": ${errMsg(errWs)}`, { step: 'download', cause: errWs })
        }
        throw tagErr(err, req, step)
    }
    finally {
        req.close()
        if (res === null && pmFetch !== null) {
            pmFetch.then(dropBody, () => {})
        }
        else if (res !== null && !bodyTaken) {
            dropBody(res) //已收到回應但本體未交給串流(失敗於交出之前): 取消之, 不依賴傳入之fetch響應中止
        }
    }
}


//renameFinal, 暫存檔經驗證後更名為正式檔名(覆蓋舊檔), 回傳是否由本次更名; Windows下剛寫入之執行檔偶遭防毒掃描占用而更名失敗, 故有界重試;
//更名失敗但正式檔名已是期望內容(他方已完成同一下載)視為成功(回傳false, 暫存檔仍屬本次)
async function renameFinal(ctx, fpTmp, exp) {
    let lastErr = null
    for (let i = 1; i <= ctx.renameAttempts; i++) {
        try {
            ctx.fs.renameSync(fpTmp, ctx.fpAbs)
            return true
        }
        catch (err) {
            lastErr = err
            if (await matchFile(ctx, ctx.fpAbs, exp, ctx.stallMs) >= 0) {
                return false
            }
            if (!codesBusy.includes(codeOf(lastErr))) {
                break
            }
            if (i < ctx.renameAttempts) {
                await sleep(Math.min(ctx.retryDelayMs, 200) * i)
            }
        }
    }
    throw mkErr('E_RENAME', `the verified temporary file can not be renamed to "${ctx.fp}": ${errMsg(lastErr)}`, { step: 'rename', cause: lastErr })
}


//removeTemp, 刪除暫存檔(已不存在視為成功), 暫時性占用重試, 回傳最後的錯誤(成功回傳null), 由呼叫端如實呈現
//檔案以unlinkSync刪除(R-FS-RESULT-01規則3)
async function removeTemp(ctx, fpTmp) {
    let lastErr = null
    for (let i = 1; i <= 3; i++) {
        try {
            ctx.fs.unlinkSync(fpTmp)
            return null
        }
        catch (err) {
            if (codeOf(err) === 'ENOENT') {
                return null
            }
            lastErr = err
            if (!codesBusy.includes(codeOf(err))) {
                break
            }
            if (i < 3) {
                await sleep(Math.min(ctx.retryDelayMs, 200) * i)
            }
        }
    }
    return lastErr === null ? new Error('unknown error') : lastErr
}


//attemptOnce, 一次完整嘗試: 取期望值, 下載至暫存檔並驗證, 更名; 不論成敗皆清本次之暫存檔, 正式檔名只在驗證通過後才以更名寫入
async function attemptOnce(ctx, attempt) {
    let exp = await getExpected(ctx, attempt)
    ctx.expLast = exp

    //正式檔已是期望內容時不下載; 既有檔無法讀取或讀取逾時者視為不符
    if (ctx.useSkipIfMatch) {
        let size = await matchFile(ctx, ctx.fpAbs, exp, remainMs(ctx, 'verify'))
        if (size >= 0) {
            return { sha256: exp.sha256, size, downloaded: false }
        }
    }

    //暫存檔名帶pid與亂數, 同程序或跨程序之並行下載各寫各的暫存檔; 以排他方式建立, 名稱碰撞時失敗而不覆寫
    let rnd = `${Math.random().toString(16).slice(2)}000000000000`.slice(0, 12)
    let tmp = {
        fp: `${ctx.fpAbs}.${ctx.pid}.${rnd}.part`,
        owned: false,
    }
    let errMain = null
    let actual = null
    try {
        actual = await fetchToTemp(ctx, exp, tmp)
        if (await renameFinal(ctx, tmp.fp, exp)) {
            tmp.owned = false //暫存檔已成為正式檔, 舊名稱不再屬於本次, 不得再依名稱刪除
        }
    }
    catch (err) {
        errMain = err
    }

    //清本次建立之暫存檔
    if (tmp.owned) {
        let errClean = await removeTemp(ctx, tmp.fp)
        if (errClean !== null) {
            ctx.leftovers.push({ fp: tmp.fp, error: errClean })
        }
    }

    if (errMain !== null) {
        throw errMain
    }
    return { sha256: actual.sha256, size: actual.size, downloaded: true }
}


//isRetryable, 暫時性錯誤(含快取不同步造成之雜湊/大小不符)才重試, 參數、磁碟、更名、其他4xx與時間用盡不重試
function isRetryable(err, ctx) {
    let code = get(err, 'code')
    if (code === 'E_NETWORK' || code === 'E_TIMEOUT') {
        return true
    }
    if (code === 'E_HASH_MISMATCH' || code === 'E_SIZE_MISMATCH') {
        return ctx.retryOnMismatch
    }
    if (code === 'E_HTTP') {
        let s = get(err, 'status')
        return (s >= 500 && s <= 599) || s === 408 || s === 429
    }
    if (code === 'E_EXPECTED') {
        return get(err, 'retryable') === true
    }
    return false
}


//hintOf, 依錯誤類別給可據以處置之建議
function hintOf(err, ctx) {
    let code = get(err, 'code')
    let status = get(err, 'status')
    if (code === 'E_HASH_MISMATCH' || code === 'E_SIZE_MISMATCH') {
        return `hint: the file on the server is not the expected one; a cache may serve an older or newer file for a few minutes after an update, or the content was altered in transit; retry later, check the expected value, proxy and antivirus`
    }
    if (code === 'E_EXPECTED') {
        return `hint: the expected value can not be obtained; check its source (e.g. the manifest) and retry`
    }
    if (code === 'E_HTTP') {
        if (status === 429) {
            return `hint: the server is limiting the request rate (HTTP 429), retry later`
        }
        if (status === 408) {
            return `hint: the server timed out waiting for the request (HTTP 408), retry later; check the network and proxy`
        }
        if (status >= 500 && status <= 599) {
            return `hint: the server has a temporary problem, retry later`
        }
        return `hint: the file does not exist at the url or access is denied, check the url`
    }
    if (code === 'E_NETWORK' || code === 'E_TIMEOUT') {
        return `hint: check the network and proxy, and retry later`
    }
    if (code === 'E_TIMEOUT_TOTAL') {
        return `hint: the connection is too slow for the total time budget(opt.totalMs), check the network or raise opt.totalMs`
    }
    if (code === 'E_FS') {
        return `hint: check the free disk space and the write permission of the folder of "${ctx.fp}"`
    }
    if (code === 'E_RENAME') {
        return `hint: "${ctx.fp}" may be in use or locked by antivirus, close the programs using it and retry`
    }
    return ''
}


//finalErr, 帶出哪一步失敗、預期與實際、建議、刪不掉之暫存檔
function finalErr(ctx, errLast, nAttempt, noteStop) {
    let code = get(errLast, 'code')
    let step = get(errLast, 'step') || 'unknown'
    let lines = [`failed to download url[${ctx.urlShow}] to file[${ctx.fp}] (code ${code}, step ${step}, attempt ${nAttempt} of ${ctx.maxAttempts}): ${errMsg(errLast)}`]
    let hint = hintOf(errLast, ctx)
    if (hint) {
        lines.push(hint)
    }
    if (noteStop) {
        lines.push(noteStop)
    }
    if (step === 'share') {
        lines.push(`note: the shared download is still in progress and may replace file[${ctx.fp}] later`)
    }
    else {
        lines.push(`note: file[${ctx.fp}] was not modified by this call`)
    }
    for (let v of ctx.leftovers) {
        lines.push(`note: the temporary file "${v.fp}" could not be removed (${errMsg(v.error)}), it is not a verified file, remove it manually`)
    }
    let err = mkErr(code, maskUrl(lines.join('\n')), { //訊息內任何出現處之網址帳密皆遮蔽(含底層錯誤文字帶回之網址)
        step,
        attempts: nAttempt,
        url: ctx.urlShow,
        fp: ctx.fp,
        expected: ctx.expLast,
        actual: get(errLast, 'actual', null),
        leftovers: ctx.leftovers,
        cause: errLast,
    })
    let status = get(errLast, 'status')
    if (status !== undefined) {
        err.status = status
    }
    if (ctx.leftovers.length > 0) {
        err.cleanupError = ctx.leftovers[0].error
    }
    return err
}


//run, 依序嘗試至成功、不可重試之錯誤、次數用盡或整體時間不足以再等待
async function run(ctx) {
    ctx.deadline = now() + ctx.totalMs
    let errLast = null
    let nAttempt = 0
    let noteStop = ''
    for (let i = 1; i <= ctx.maxAttempts; i++) {
        nAttempt = i
        try {
            let r = await attemptOnce(ctx, i)
            return {
                fp: ctx.fp,
                sha256: r.sha256,
                size: r.size,
                attempts: i,
                downloaded: r.downloaded,
                leftovers: ctx.leftovers,
            }
        }
        catch (err) {
            errLast = err
        }
        if (!isRetryable(errLast, ctx)) {
            break
        }
        if (i >= ctx.maxAttempts) {
            break
        }
        let delay = ctx.retryDelayMs * i
        if (now() + delay >= ctx.deadline) {
            noteStop = `retry stopped: waiting ${delay}ms would exceed the total time budget of ${ctx.totalMs}ms`
            break
        }
        if (ctx.onRetry !== null) {
            try {
                let fnRetry = ctx.onRetry //不帶接收者呼叫(this不為內部脈絡)
                let r = fnRetry({ attempt: i, maxAttempts: ctx.maxAttempts, delayMs: delay, error: errLast })
                if (r && isfun(r.catch)) {
                    r.catch(() => {})
                }
            }
            catch (err) {}
        }
        await sleep(delay)
    }
    throw finalErr(ctx, errLast, nAttempt, noteStop)
}


//buildCtx, 檢核參數並建立執行脈絡, 不通過者拋E_ARG; 呼叫端傳入之模組與函數於此取出並綁定, 之後不再讀取opt
function buildCtx(urlIn, fpOut, expected, opt) {
    let bad = (msg, cause) => {
        let extra = { step: 'argument', attempts: 0 }
        if (cause !== undefined) {
            extra.cause = cause
        }
        return mkErr('E_ARG', msg, extra)
    }

    //check urlIn, fpOut, 包裝字串(new String)先解包為原始值, 其後之檢查、切分、請求、更名皆用同一個值(包裝物件之方法可被覆寫)
    urlIn = unwrap(urlIn)
    fpOut = unwrap(fpOut)
    if (!isestr(urlIn)) {
        throw bad(`urlIn is not an effective string`)
    }

    //平台, 決定路徑分隔符(Windows為/與\, 其他為/)與檔名限制
    let pid = 0
    let win32 = false
    try {
        pid = get(globalThis, 'process.pid', 0) || 0
        win32 = get(globalThis, 'process.platform') === 'win32'
    }
    catch (err) {}

    //check fpOut, 結尾為路徑分隔符者為資料夾, 非檔案路徑; 檔名不得為空、'.'、'..', Windows下檔名內不得有冒號(替代資料流或磁碟代號而無檔名)
    if (!isestr(fpOut) || (win32 ? /[\\/]$/ : /\/$/).test(fpOut)) {
        throw bad(`fpOut is not an effective file path`)
    }
    let nameOut = splitPath(fpOut, win32).name
    if (nameOut === '' || nameOut === '.' || nameOut === '..') {
        throw bad(`fpOut is not an effective file path: its file name is empty, '.' or '..'`)
    }
    if (win32 && nameOut.includes(':')) {
        throw bad(`fpOut is not an effective file path: its file name contains ':'`)
    }

    //expected
    let expFn = null
    let expStatic = null
    if (isfun(expected)) {
        expFn = expected
    }
    else {
        let r
        try {
            r = normExpected(expected)
        }
        catch (err) {
            throw bad(`expected can not be read: ${errMsg(err)}`, err)
        }
        if (r.err) {
            throw bad(`expected is invalid: ${r.err}`)
        }
        expStatic = r
    }

    //opt, 讀取置於try內: opt本身或其屬性(含所傳模組之方法)不可讀(getter拋錯、已撤銷之Proxy)時以參數錯誤reject
    let o = {}
    o.refs = [] //所取出之原始方法(綁定前), 供共用判定: 同一模組物件於兩次呼叫間被換了方法者不共用
    try {

        //fs
        o.fsRaw = get(opt, 'fs')
        o.fs = {}
        for (let k of fnsFs) {
            let f = get(o.fsRaw, k)
            if (!isfun(f)) {
                throw bad(`opt.fs is not an effective fs (needs ${fnsFs.join(', ')})`)
            }
            o.refs.push(f)
            o.fs[k] = f.bind(o.fsRaw)
        }

        //crypto
        o.cryptoRaw = get(opt, 'crypto')
        let createHash = get(o.cryptoRaw, 'createHash')
        if (!isfun(createHash)) {
            throw bad(`opt.crypto is not an effective crypto (needs createHash)`)
        }
        o.refs.push(createHash)
        o.crypto = { createHash: createHash.bind(o.cryptoRaw) }

        //Readable
        o.ReadableRaw = get(opt, 'Readable')
        let fromWeb = get(o.ReadableRaw, 'fromWeb')
        let from = get(o.ReadableRaw, 'from')
        if (!isfun(fromWeb) || !isfun(from)) {
            throw bad(`opt.Readable is not an effective stream.Readable`)
        }
        o.refs.push(fromWeb, from)
        o.Readable = { fromWeb: fromWeb.bind(o.ReadableRaw), from: from.bind(o.ReadableRaw) }

        //pipeline
        o.pipeline = get(opt, 'pipeline')
        if (!isfun(o.pipeline)) {
            throw bad(`opt.pipeline is not a function`)
        }

        //fetch, 未給(undefined或null)才用全域fetch, 給了卻不是函數者為參數錯誤(不靜默改用全域fetch)
        o.fetchRaw = get(opt, 'fetch')
        if (o.fetchRaw !== undefined && o.fetchRaw !== null && !isfun(o.fetchRaw)) {
            throw bad(`opt.fetch is not a function`)
        }
        o.maxAttempts = optNum(opt, 'maxAttempts', 3, { min: 1, int: true })
        o.retryDelayMs = optNum(opt, 'retryDelayMs', 1000, { min: 0, timer: true })
        o.stallMs = optNum(opt, 'stallMs', 30000, { min: 0, minOpen: true, timer: true })
        o.totalMs = optNum(opt, 'totalMs', 600000, { min: 0, minOpen: true, timer: true })
        o.retryOnMismatch = unwrap(get(opt, 'retryOnMismatch')) //包裝布林(new Boolean(false))解包為原始值, 否則其為truthy
        o.useShare = unwrap(get(opt, 'useShare'))
        o.useSkipIfMatch = unwrap(get(opt, 'useSkipIfMatch'))
        o.onRetry = get(opt, 'onRetry')
    }
    catch (err) {
        if (isOwnErr(err)) {
            throw err
        }
        throw bad(`opt can not be read: ${errMsg(err)}`, err)
    }

    //fetch, 未給時於每次請求時取用全域fetch; 此時網址須可解析且為http或https(其餘為參數錯誤, 不視為可重試之網路錯誤)
    let fetchFn = null
    let fetchRaw = null
    if (isfun(o.fetchRaw)) {
        fetchFn = o.fetchRaw
        fetchRaw = o.fetchRaw
    }
    else if (isfun(globalThis.fetch)) {
        let u = null
        try {
            u = new URL(urlIn)
        }
        catch (err) {
            throw bad(`urlIn is not a valid url: ${errMsg(err)}`, err)
        }
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            throw bad(`urlIn must be an http or https url when the global fetch is used, got ${u.protocol}`)
        }
        if (u.username !== '' || u.password !== '') {
            throw bad(`urlIn must not contain credentials (user:password@) when the global fetch is used, give opt.fetch to handle authentication`)
        }
        fetchFn = (u, init) => {
            return globalThis.fetch(u, init)
        }
    }
    else {
        throw bad(`fetch is not available, give opt.fetch or use Node.js 18 or later`)
    }

    return {
        urlIn,
        urlShow: maskUrl(urlIn),
        fp: fpOut,
        fpAbs: '',
        expFn,
        expStatic,
        expLast: expStatic,
        fsRaw: o.fsRaw,
        cryptoRaw: o.cryptoRaw,
        ReadableRaw: o.ReadableRaw,
        refs: o.refs,
        fs: o.fs,
        crypto: o.crypto,
        Readable: o.Readable,
        pipeline: o.pipeline,
        fetch: fetchFn,
        fetchRaw,
        maxAttempts: o.maxAttempts,
        retryDelayMs: o.retryDelayMs,
        stallMs: o.stallMs,
        totalMs: o.totalMs,
        renameAttempts: 5,
        retryOnMismatch: isbol(o.retryOnMismatch) ? o.retryOnMismatch : true,
        useShare: isbol(o.useShare) ? o.useShare : true,
        useSkipIfMatch: isbol(o.useSkipIfMatch) ? o.useSkipIfMatch : false,
        onRetry: isfun(o.onRetry) ? o.onRetry : null,
        pid,
        win32,
        leftovers: [],
        deadline: 0,
    }
}


//sameJob, 進行中之工作是否與本次呼叫同一工作, 才可共用: 同網址、同期望值、同一所傳入之模組與fetch、同樣之重試與略過設定
function sameJob(job, ctx) {
    if (job.urlIn !== ctx.urlIn || job.fsRaw !== ctx.fsRaw || job.fetchRaw !== ctx.fetchRaw) {
        return false
    }
    if (job.cryptoRaw !== ctx.cryptoRaw || job.ReadableRaw !== ctx.ReadableRaw || job.pipeline !== ctx.pipeline) {
        return false
    }
    if (job.refs.length !== ctx.refs.length || job.refs.some((f, i) => f !== ctx.refs[i])) {
        return false //同一模組物件但取出之方法不同(兩次呼叫之間被換了方法)
    }
    if (job.maxAttempts !== ctx.maxAttempts || job.retryOnMismatch !== ctx.retryOnMismatch || job.useSkipIfMatch !== ctx.useSkipIfMatch) {
        return false
    }
    if (job.expFn !== null || ctx.expFn !== null) {
        return job.expFn === ctx.expFn
    }
    return job.expStatic.sha256 === ctx.expStatic.sha256 && job.expStatic.size === ctx.expStatic.size
}


//joinJob, 加入進行中之同一工作: 結果與錯誤與該工作相同(同一物件), 惟以本次呼叫之totalMs為等待上限
function joinJob(job, ctx) {
    let timer = null
    let pmTimeout = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            let e = mkErr('E_TIMEOUT_TOTAL', `the total time budget of ${ctx.totalMs}ms is used up while waiting for the shared download`, { step: 'share' })
            reject(finalErr(ctx, e, 0, ''))
        }, ctx.totalMs)
    })
    return Promise.race([job.pm, pmTimeout])
        .finally(() => {
            clearTimeout(timer)
        })
}


/**
 * 後端nodejs下載網址成為檔案並驗證完整性(SHA-256與大小), 可傳入fs與fetch
 *
 * 用於下載執行檔或二進位資產: 內容先串流寫入同資料夾之暫存檔`<fpOut之絕對路徑>.<pid>.<亂數>.part`(以排他方式同步建立, 不覆寫亦不刪除既有同名檔), 同時計算SHA-256與大小(驗證fetch解碼content-encoding後之內容, fetch不支援之編碼則為原始內容), 與期望值相符且重讀暫存檔仍相符才更名為fpOut(覆蓋舊檔)。任何失敗路徑皆不在fpOut留下未驗證或不完整之檔, 舊檔原樣保留; 每次嘗試後清除本次建立之暫存檔, 刪不掉時如實回報(不稱已清除)。
 *
 * fpOut於呼叫當下即依當時之工作路徑解析為絕對路徑(其所在資料夾不存在時先建立; Windows之磁碟相對路徑如'C:a.bin'依該磁碟之目前資料夾), 之後之檔案操作皆用該絕對路徑; 回傳之fp為呼叫端所給之字串。fpOut之檔名不得為空、'.'或'..'(E_ARG), Windows下檔名內不得有冒號(替代資料流, 或只有磁碟代號而無檔名, E_ARG); Windows以/與\為路徑分隔符, 其他系統只有/(反斜線為合法之檔名字元); 暫存檔名為正式檔名加上約30字元之後綴, 檔名逼近系統上限時建立暫存檔失敗(E_FS)。
 *
 * 期望值expected為物件{ sha256, size }(sha256為64碼十六進位、大小寫不拘, size為位元組數、選填, undefined或null視為未給), 或為函數(可為async), 於每次嘗試前呼叫並回傳該物件(供每次重取清單之用法), 函數收到{ attempt, signal }, signal於整體時間用盡時中止; 函數拋錯時錯誤代碼為E_EXPECTED, 所拋錯誤帶retryable為true者重試, 否則不重試。
 *
 * 給size時: 回應之content-length(未經內容編碼與分塊傳輸者)與size不符即不下載, 內容超過size即中止, 正常結束而短少亦失敗(E_SIZE_MISMATCH); 傳輸中斷造成之短少為E_NETWORK。
 *
 * 可重試之錯誤: 連線錯誤(E_NETWORK)、HTTP 5xx、408、429(E_HTTP)、停滯(E_TIMEOUT)、雜湊或大小不符(E_HASH_MISMATCH、E_SIZE_MISMATCH, opt.retryOnMismatch為false時不重試); 不可重試: 其他HTTP狀態、參數錯誤(E_ARG, 使用全域fetch時網址須為可解析之http或https)、磁碟錯誤(E_FS)、更名失敗(E_RENAME)、整體時間用盡(E_TIMEOUT_TOTAL)。第n次重試前等待retryDelayMs*n毫秒, 等待會超過整體時間上限時即停止。整體時間上限以單調時計(performance.now)計算, 約束取期望值、網路、寫入暫存檔與重讀核對階段(各等待點皆以此為上限, 不依賴fetch或串流是否響應中止); 驗證通過後之更名與清理不計入: 其退避另加至多約3秒, 更名失敗時比對fpOut內容之讀取每次至多stallMs。
 *
 * 更名失敗(EPERM、EBUSY、EACCES, Windows下常為防毒掃描占用)時最多共嘗試5次; 更名失敗但fpOut已是期望內容(他方已完成)視為成功。
 *
 * 同程序內對同一fpOut(以其絕對路徑判定, Windows不分大小寫)、同一網址、同一期望值(物件比對sha256與size, 函數比對是否同一函數)、同一opt.fs、opt.crypto、opt.Readable、opt.pipeline與opt.fetch、同樣之maxAttempts、retryOnMismatch與useSkipIfMatch之併發呼叫共用同一次下載, 共用者收到同一個結果物件或錯誤物件(其中fp為最先呼叫者所給之字串), 等待以各自之totalMs為上限(逾時者E_TIMEOUT_TOTAL, step為'share', 共用之下載續行且其後仍可能更新fpOut); 其餘選項(stallMs、retryDelayMs、onRetry)依最先呼叫者。不符上述條件者各自下載, 同一fpOut之期望值不同時以最後完成更名者為最終內容。opt.useShare為false時各自下載。
 *
 * 網址與請求: 未給opt.fetch而使用全域fetch時, 網址須為可解析之http或https且不得帶帳密(user:password@, E_ARG), 需要認證時請傳入自訂之opt.fetch; 錯誤訊息與錯誤物件之url會遮蔽網址內之帳密。傳入之opt.fetch須回傳本體(body)為WHATWG ReadableStream之Response(如undici之fetch), 回傳Node之Readable本體者不支援(E_ARG, step為download, 不重試); opt.fetch給了卻不是函數者為E_ARG(只有undefined或null才使用全域fetch)。傳入之函數(期望值函數、fetch、pipeline、onRetry)皆不帶接收者呼叫(this為undefined)。共用之下載以最先呼叫者之totalMs計時, totalMs較長之後到者亦收到該次下載因其totalMs用盡之失敗。本體寫完後等待暫存檔寫入串流關閉至多5秒(同時輪詢串流之closed屬性, 以emitClose:false建立而不發出close事件者亦可判定), 失敗清理時不重複等待; 該等待不受totalMs約束。
 *
 * 參數之包裝物件(new String、new Number、new Boolean)一律先解包為原始值再檢查與使用(不呼叫其可被覆寫之方法), 檢查之值即使用之值。size為非負安全整數, 或十進位整數字串(前後空白可); 小數、指數、十六進位、帶正負號、超過安全整數之字串為E_ARG。本函數自建之錯誤以身分判定(傳入元件所拋值即使帶同名code, 亦不視為本函數之錯誤: 傳入fs之getter拋出者為E_ARG, 傳入fetch拋出者為E_NETWORK, 先出錯之寫入端為E_FS)。錯誤訊息內任何出現處之網址帳密(含底層錯誤文字帶回者)皆遮蔽, 但cause仍為原始錯誤物件。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDownloadFileVerify.test.mjs Github}
 * @memberOf wsemi
 * @param {String} urlIn 輸入下載網址字串
 * @param {String} fpOut 輸入儲存檔案路徑字串, 所在資料夾不存在時自動建立
 * @param {Object|Function} expected 輸入期望值物件{ sha256, size }, 或回傳該物件之函數(可為async, 每次嘗試前呼叫, 收到{ attempt, signal })
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入fs，須有mkdirSync、realpathSync、openSync、closeSync、createWriteStream、createReadStream、renameSync、unlinkSync、statSync，預設null
 * @param {Object} [opt.crypto=null] 輸入crypto，須有createHash，預設null
 * @param {Function} [opt.Readable=null] 輸入stream之Readable，須有fromWeb、from，預設null
 * @param {Function} [opt.pipeline=null] 輸入stream/promises之pipeline，預設null
 * @param {Function} [opt.fetch=null] 輸入fetch函數，未給時於每次請求時取用全域fetch，預設null
 * @param {Integer} [opt.maxAttempts=3] 輸入最多嘗試次數，正整數(可為數字字串)，無效時使用預設值，預設3
 * @param {Number} [opt.retryDelayMs=1000] 輸入重試間隔基數毫秒，第n次重試前等待retryDelayMs*n，亦為更名與刪除暫存檔重試間隔之基數(上限200)，非負數，無效時使用預設值，預設1000
 * @param {Number} [opt.stallMs=30000] 輸入連續沒收到資料(含等待回應標頭)視為停滯之毫秒數，正數，無效時使用預設值，預設30000
 * @param {Number} [opt.totalMs=600000] 輸入整體時間上限毫秒數，正數，無效時使用預設值，超過計時器上限(2147483647)時夾至上限，預設600000
 * @param {Boolean} [opt.retryOnMismatch=true] 輸入雜湊或大小不符時是否重試，預設true
 * @param {Boolean} [opt.useShare=true] 輸入同程序內併發呼叫是否共用同一次下載，預設true
 * @param {Boolean} [opt.useSkipIfMatch=false] 輸入每次嘗試取得期望值後，fpOut已是期望內容時是否不下載直接成功(回傳downloaded為false)，既有檔無法讀取視為不符，預設false
 * @param {Function} [opt.onRetry=null] 輸入重試前之通知函數，收到{ attempt, maxAttempts, delayMs, error }，其拋錯或回傳之rejection皆忽略，預設null
 * @returns {Promise} 回傳Promise，resolve回傳結果物件{ fp, sha256, size, attempts, downloaded, leftovers }，sha256為小寫，leftovers為先前嘗試刪不掉之暫存檔陣列[{ fp, error }]；reject回傳Error物件，其code為'E_ARG'、'E_EXPECTED'、'E_HTTP'、'E_NETWORK'、'E_TIMEOUT'、'E_TIMEOUT_TOTAL'、'E_SIZE_MISMATCH'、'E_HASH_MISMATCH'、'E_FS'、'E_RENAME'之一，另帶step('argument'、'prepare'、'expected'、'request'、'download'、'verify'、'rename'、'share')、attempts(已嘗試次數，參數錯誤、建立資料夾錯誤與共用等待逾時為0)；E_ARG以外另帶url、fp、expected(最後使用之期望值)、actual(已計算之實際值或null)、leftovers、cleanupError(有刪不掉之暫存檔時為第一個之錯誤)、status(HTTP錯誤時)、cause，message含失敗步驟、預期與實際(雜湊截短為16碼)、建議與刪不掉之暫存檔；E_ARG(入口之參數錯誤)只另帶cause(有時); 下載途中之E_ARG(回應本體不是WHATWG ReadableStream)與其他代碼同帶上述欄位
 * @example
 * //need test in nodejs
 *
 * //see fsDownloadFileVerify
 *
 */
async function fsDownloadFileVerifyCore(urlIn, fpOut, expected, opt = {}) {

    //ctx
    let ctx = null
    try {
        ctx = buildCtx(urlIn, fpOut, expected, opt)
    }
    catch (err) {
        return Promise.reject(err)
    }

    //mkdir, realpath: 於入口同步完成, 以呼叫當下之工作路徑固定正式檔之絕對路徑(之後await期間工作路徑改變不影響)
    //資料夾已存在者不呼叫mkdirSync(Windows下對磁碟根'C:\'以recursive建立會拋EPERM)
    let { fd, name } = splitPath(ctx.fp, ctx.win32)
    try {
        if (fd !== '') {
            let isDir = false
            try {
                isDir = ctx.fs.statSync(fd).isDirectory()
            }
            catch (err) {}
            if (!isDir) {
                ctx.fs.mkdirSync(fd, { recursive: true })
            }
        }
        let real = ctx.fs.realpathSync(fd === '' ? '.' : fd)
        if (!isestr(real)) {
            throw new Error(`realpathSync returned a non-string`)
        }
        //realpath結尾已有分隔符(根目錄)則不再補; 分隔符依平台(其他系統之反斜線為資料夾名稱的一部分, 不是分隔符)
        ctx.fpAbs = (ctx.win32 ? /[\\/]$/ : /\/$/).test(real) ? `${real}${name}` : `${real}${ctx.win32 ? '\\' : '/'}${name}`
    }
    catch (err) {
        let e = mkErr('E_FS', `can not prepare folder "${fd === '' ? '.' : fd}": ${errMsg(err)}`, { step: 'prepare', attempts: 0, cause: err })
        return Promise.reject(finalErr(ctx, e, 0, ''))
    }

    //useShare
    if (!ctx.useShare) {
        return run(ctx)
    }
    let key = ctx.win32 ? ctx.fpAbs.toLowerCase() : ctx.fpAbs
    let jobs = _inflight.get(key)
    if (jobs === undefined) {
        jobs = []
        _inflight.set(key, jobs)
    }
    let cur = jobs.find((job) => {
        return sameJob(job, ctx)
    })
    if (cur !== undefined) {
        return joinJob(cur, ctx)
    }
    let job = {
        urlIn: ctx.urlIn,
        expFn: ctx.expFn,
        expStatic: ctx.expStatic,
        fsRaw: ctx.fsRaw,
        cryptoRaw: ctx.cryptoRaw,
        ReadableRaw: ctx.ReadableRaw,
        refs: ctx.refs,
        pipeline: ctx.pipeline,
        fetchRaw: ctx.fetchRaw,
        maxAttempts: ctx.maxAttempts,
        retryOnMismatch: ctx.retryOnMismatch,
        useSkipIfMatch: ctx.useSkipIfMatch,
        pm: null,
    }
    job.pm = run(ctx)
        .finally(() => {
            let l = _inflight.get(key)
            if (l !== undefined) {
                let i = l.indexOf(job)
                if (i >= 0) {
                    l.splice(i, 1)
                }
                if (l.length === 0) {
                    _inflight.delete(key)
                }
            }
        })
    jobs.push(job)
    return job.pm
}


export default fsDownloadFileVerifyCore
