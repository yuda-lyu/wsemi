import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import ispint from './ispint.mjs'
import execCliSession from './execCliSession.mjs'
import execSpawnError from './_execSpawnError.mjs'
import execThrownMsg from './_execThrownMsg.mjs'


/**
 * 對stdio協定型CLI依序送出一行一則JSON之請求並收集回應(疊於execCliSession之上)，適用codex app-server、MCP之stdio伺服器等以換行分隔JSON之協定(LSP為Content-Length分幀，不適用)
 * 不內建任何協定知識，initialize/initialized等握手由呼叫端以請求陣列表達
 * 本函數不throw亦不reject，一律以結果物件之ok與error、errorType欄位回報成敗，error不含args與env之值；command、args、requests、opt或其選項值不可讀(getter拋錯、已撤銷之Proxy等)時不啟動子進程，errorType為params；請求之params無法序列化為JSON(如含BigInt、循環參照)時errorType亦為params，error為'<method>: 無法序列化為JSON: <訊息>'，已啟動之子進程照常經stop()結束
 *
 * 規則:
 *   - 請求物件含method者為請求，自動配id(自0遞增)並等待同id之回應；含notify者為通知，不配id，送出即繼續
 *   - 回應之判定為「有id且含result或error」；帶id但含method者為伺服器發給客戶端之請求，交由onServerRequest處理(未提供則忽略)；無id者為伺服器通知，交由onNotify(未提供則忽略)
 *   - 依序送出、逐一等待；任一回應含error即中止(results[該方法]=null，errorType='rpc')，除非continueOnError=true
 *   - 全部完成後才stop()；此時之退出不視為失敗
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCliJsonRpc.test.mjs Github}
 * @memberOf wsemi
 * @param {String} command 輸入執行檔名稱字串
 * @param {Array} [args=[]] 輸入參數字串陣列，預設[]
 * @param {Array} [requests=[]] 輸入請求物件陣列，每項為{ method, params }(請求，等回應)或{ notify, params }(通知，不等回應)，params可省略，陣列於呼叫時讀取為快照(其後對該陣列之增刪不影響本次送出)，預設[]
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeoutMs=120000] 輸入整體逾時毫秒正整數，涵蓋全部請求與收尾，逾時即樹殺，預設120000
 * @param {String} [opt.cwd=process.cwd()] 輸入子進程工作目錄字串，預設process.cwd()
 * @param {Object} [opt.env=undefined] 輸入額外注入之環境變數物件，語意同execCli，預設undefined
 * @param {Number} [opt.exitGraceMs=2000] 輸入收尾stop()之寬限毫秒，語意同execCliSession，預設2000
 * @param {String|Boolean} [opt.jsonrpc=undefined] 輸入每則訊息附加之jsonrpc欄位值，true代表'2.0'(MCP等JSON-RPC 2.0協定需要)，字串則原樣附加，預設undefined代表不附加(codex app-server不需要)
 * @param {Boolean} [opt.continueOnError=false] 輸入回應含error時是否繼續送出後續請求布林值，預設false
 * @param {Function} [opt.onNotify=undefined] 輸入伺服器通知(無id訊息)回調函數，格式為(msg)=>{}，預設undefined
 * @param {Function} [opt.onServerRequest=undefined] 輸入伺服器發給客戶端之請求(帶id且含method)回調函數，格式為(msg, session)=>{}，可用session.writeLine回覆，預設undefined
 * @param {Function} [opt.onStderr=undefined] 輸入stderr片段回調函數，格式為(chunk)=>{}，預設undefined。onNotify、onServerRequest、onStderr內拋出之錯誤不會被攔截，將成為未捕捉例外，請於回調內自行處理(該錯誤於回調返回後立即(微任務)原樣重拋，不影響其餘訊息之處理與本函數之結果)
 * @returns {Promise} 回傳Promise，resolve回傳結果物件，內含ok(是否全部成功布林值)、results(以method為鍵之result物件，失敗者為null)、responses(依序之回應陣列，每項為{ id, method, result, error })、error(錯誤訊息字串，成功時為空字串)、errorType(錯誤類型字串: params(參數錯誤，含輸入不可讀與params無法序列化)、notfound(子進程未能啟動，如命令不存在、npm shim之入口檔不存在、非有效執行檔、權限不足、cwd不存在、交execCliSession之cwd、env、exitGraceMs之值不可讀)、timeout(逾時)、exit(已啟動之子進程於回應前結束)、rpc(回應含error)，成功時為空字串)、durationMs(耗時毫秒)、exitCode(子進程離開碼)
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     let nodeBin = process.execPath
 *
 *     //模擬一行一則JSON之伺服器: 收到請求回{ id, result }, 方法為fail者回error, 收到EOF即結束
 *     let sc = `
 *         let rl = require('readline').createInterface({ input: process.stdin })
 *         rl.on('line', (l) => {
 *             let m = JSON.parse(l)
 *             if (m.id === undefined) return
 *             if (m.method === 'fail') {
 *                 process.stdout.write(JSON.stringify({ id: m.id, error: { code: -1, message: 'bad' } }) + '\\n')
 *             }
 *             else {
 *                 process.stdout.write(JSON.stringify({ id: m.id, result: { method: m.method, params: m.params } }) + '\\n')
 *             }
 *         })
 *         rl.on('close', () => process.exit(0))
 *     `
 *
 *     let r = await execCliJsonRpc(nodeBin, ['-e', sc], [
 *         { method: 'initialize', params: { clientInfo: { name: 'demo' } } },
 *         { notify: 'initialized' },
 *         { method: 'account/read' },
 *     ])
 *     console.log(r.ok, JSON.stringify(r.errorType), r.results['account/read'], r.exitCode)
 *     // => true "" { method: 'account/read' } 0
 *
 *     let r2 = await execCliJsonRpc(nodeBin, ['-e', sc], [
 *         { method: 'fail' },
 *         { method: 'never' },
 *     ])
 *     console.log(r2.ok, r2.errorType, r2.results, r2.error)
 *     // => false rpc { fail: null } fail: bad
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function execCliJsonRpc(command, args = [], requests = [], opt = {}) {

    //startTime
    let startTime = Date.now()

    //rFail, 統一失敗結構
    let rFail = (errorType, error, ext = {}) => {
        return {
            ok: false,
            results: {},
            responses: [],
            error,
            errorType,
            durationMs: Date.now() - startTime,
            exitCode: null,
            ...ext,
        }
    }

    //輸入之讀取與判型一律於此try內: 拋錯者(command、args、requests、opt或其選項值之getter拋錯、已撤銷之Proxy等不可讀之輸入)以errorType為params之結果物件回報, 不reject, 不啟動子進程
    //交給execCliSession之cwd、env、exitGraceMs亦於此讀取而原樣轉交, 其判型由execCliSession負責(不可讀之值由其以未能啟動回報, 即notfound)
    let timeoutMs = 120000
    let jsonrpc = null
    let continueOnError = false
    let onNotify
    let onServerRequest
    let optSession = {}
    let reqs = [] //requests之快照(入口逐項讀取之元素), 其後依序送出時迭代此陣列, 不再迭代呼叫端之陣列
    try {
        let v

        //command
        if (!isestr(command)) {
            return rFail('params', 'command 須為非空字串')
        }

        //args
        if (!isarr(args)) {
            args = []
        }

        //requests
        if (!isarr(requests)) {
            return rFail('params', 'requests 須為陣列')
        }
        for (let i = 0; i < requests.length; i++) {
            let q = requests[i]
            if (!isobj(q) || (!isestr(q.method) && !isestr(q.notify))) {
                return rFail('params', `requests[${i}] 須為含method或notify之物件`)
            }
            reqs.push(q)
        }

        //opt
        if (!isobj(opt)) {
            opt = {}
        }

        //timeoutMs
        v = get(opt, 'timeoutMs')
        timeoutMs = ispint(v) ? v : 120000

        //jsonrpc
        v = get(opt, 'jsonrpc')
        if (v === true) {
            v = '2.0'
        }
        jsonrpc = isestr(v) ? v : null

        //continueOnError
        v = get(opt, 'continueOnError')
        continueOnError = isbol(v) ? v : false

        //callbacks, 於此判型一次(非函數者為undefined), onLine內不再觸及呼叫端之值
        v = get(opt, 'onNotify')
        onNotify = isfun(v) ? v : undefined
        v = get(opt, 'onServerRequest')
        onServerRequest = isfun(v) ? v : undefined

        //optSession, onStderr同為回調而於此判型(不可讀為params); cwd、env、exitGraceMs原樣轉交execCliSession判型
        v = get(opt, 'onStderr')
        optSession = {
            cwd: get(opt, 'cwd'),
            env: get(opt, 'env'),
            exitGraceMs: get(opt, 'exitGraceMs'),
            onStderr: isfun(v) ? v : undefined,
        }

    }
    catch (err) {
        let e = execSpawnError(err)
        return rFail('params', `${e.code}: ${execThrownMsg(e, err)}`)
    }

    //state
    let pending = new Map() //id → { method, pm }
    let exitResult = null
    let nextId = 0
    let results = {}
    let responses = []

    //buildMsg
    let buildMsg = (id, method, params) => {
        let m = {}
        if (jsonrpc !== null) {
            m.jsonrpc = jsonrpc
        }
        if (id !== undefined) {
            m.id = id
        }
        m.method = method
        if (params !== undefined) {
            m.params = params
        }
        return m
    }

    //s
    let s = execCliSession(command, args, {
        ...optSession,
        timeoutMs,
        onLine: (line) => {
            line = line.trim()
            if (line === '') {
                return
            }

            //parse, 非JSON行(如日誌)忽略
            let msg
            try {
                msg = JSON.parse(line)
            }
            catch {
                return
            }
            if (!isobj(msg)) {
                return
            }

            //hasId
            let hasId = (msg.id !== undefined && msg.id !== null)

            //回應: 有id且含result或error
            if (hasId && (('result' in msg) || ('error' in msg))) {
                let p = pending.get(msg.id)
                if (p) {
                    pending.delete(msg.id)
                    p.pm.resolve({ msg })
                }
                return
            }

            //伺服器→客戶端之請求: 帶id且含method
            if (hasId && isestr(msg.method)) {
                if (onServerRequest !== undefined) { //已於入口判型(函數或undefined), onLine內不再判型呼叫端之值(值於入口後撤銷時判型會拋出)
                    onServerRequest(msg, s)
                }
                return
            }

            //伺服器通知: 無id
            if (onNotify !== undefined) { //同onServerRequest
                onNotify(msg)
            }
        },
        onExit: (r) => {
            exitResult = r

            //子進程結束, 喚醒所有等待中之請求
            for (let [id, p] of pending) { // eslint-disable-line no-unused-vars
                p.pm.resolve({ exit: r })
            }
            pending.clear()
        },
    })

    //exitToFail, 依退出結果判別errorType
    let exitToFail = (r, method) => {
        let errorType = 'exit'
        if (r.timeout) {
            errorType = 'timeout'
        }
        else if (r.pid === null || r.pid === undefined) {
            errorType = 'notfound' //子進程從未啟動(execCliSession之pid為null): 不論錯誤碼(ENOENT、UNKNOWN、EPERM、參數檢查錯誤、cwd不存在等)皆屬無法啟動, 不以錯誤字樣判定
        }
        let error = isestr(r.error) ? r.error : `子進程於回應前結束(code ${r.code})`
        return rFail(errorType, `${method}: ${error}`, { results, responses, exitCode: r.code })
    }

    //依序送出, 迭代入口之快照reqs(迭代呼叫端之陣列位於try外, 陷阱非決定性之Proxy陣列會於此拋出而reject且子進程殘留至逾時)
    let failed = null
    for (let q of reqs) {

        //line, 讀取請求物件並序列化須在try內: params無法序列化(BigInt、循環參照、toJSON拋錯、已撤銷之Proxy等)時以params回報並break, 交下方收尾之stop()結束子進程(不得直接拋出而使子進程殘留至逾時); 其後一律用讀取當下之快照
        let method
        let notify
        let isNotify
        let id
        let line
        try {
            method = q.method
            notify = q.notify
            isNotify = !isestr(method)
            id = isNotify ? undefined : nextId
            line = JSON.stringify(buildMsg(id, isNotify ? notify : method, q.params))
        }
        catch (err) {
            let e = execSpawnError(err)
            let name = typeof method === 'string' && method !== '' ? method : (typeof notify === 'string' ? notify : 'request') //catch內不再呼叫可拋錯之判型
            failed = rFail('params', `${name}: 無法序列化為JSON: ${execThrownMsg(e, err)}`, { results, responses })
            break
        }

        //通知: 不配id, 送出即繼續
        if (isNotify) {
            let ok = await s.writeLine(line)
            if (!ok) {
                let r = exitResult || (await s.stop())
                failed = exitToFail(r, notify)
                break
            }
            continue
        }

        //請求: 配id並等待回應
        nextId += 1
        let pm = genPm()
        pending.set(id, { method, pm })
        let ok = await s.writeLine(line)
        if (!ok) {
            pending.delete(id)
            let r = exitResult || (await s.stop())
            failed = exitToFail(r, method)
            break
        }
        let got = await pm

        //子進程於回應前結束
        if (got.exit) {
            failed = exitToFail(got.exit, method)
            break
        }

        //回應
        let msg = got.msg
        if ('error' in msg && msg.error !== null && msg.error !== undefined) {
            results[method] = null
            responses.push({ id, method, result: null, error: msg.error })
            if (!continueOnError) {
                let em = get(msg, 'error.message')
                failed = rFail('rpc', `${method}: ${isestr(em) ? em : JSON.stringify(msg.error)}`, { results, responses })
                break
            }
            continue
        }
        results[method] = msg.result
        responses.push({ id, method, result: msg.result, error: null })
    }

    //收尾: 全部完成(或已失敗)後才stop, 此時之退出不視為失敗
    let r = await s.stop()

    //未啟動: 尚未失敗而子進程從未啟動(requests為空陣列時迴圈不經exitToFail), 同exitToFail一律notfound, 不得偽回成功
    if (!failed && (r.pid === null || r.pid === undefined)) {
        let error = isestr(r.error) ? r.error : '子進程未能啟動'
        failed = rFail('notfound', error, { results, responses, exitCode: r.code })
    }

    //failed
    if (failed) {
        failed.durationMs = Date.now() - startTime
        if (failed.exitCode === null) {
            failed.exitCode = r.code
        }
        return failed
    }

    //continueOnError下若有rpc錯誤仍以ok:false回報, 但results與responses完整
    let rpcErrs = responses.filter((x) => x.error !== null)
    if (rpcErrs.length > 0) {
        let x = rpcErrs[0]
        let em = get(x, 'error.message')
        return {
            ok: false,
            results,
            responses,
            error: `${x.method}: ${isestr(em) ? em : JSON.stringify(x.error)}`,
            errorType: 'rpc',
            durationMs: Date.now() - startTime,
            exitCode: r.code,
        }
    }

    return {
        ok: true,
        results,
        responses,
        error: '',
        errorType: '',
        durationMs: Date.now() - startTime,
        exitCode: r.code,
    }
}


export default execCliJsonRpc
