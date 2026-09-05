import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import ispint from './ispint.mjs'
import execCliSession from './execCliSession.mjs'


/**
 * 對stdio協定型CLI依序送出一行一則JSON之請求並收集回應(疊於execCliSession之上)，適用codex app-server、MCP之stdio伺服器等以換行分隔JSON之協定(LSP為Content-Length分幀，不適用)
 * 不內建任何協定知識，initialize/initialized等握手由呼叫端以請求陣列表達
 * 本函數不throw，一律以結果物件之ok與error、errorType欄位回報成敗
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
 * @param {Array} [requests=[]] 輸入請求物件陣列，每項為{ method, params }(請求，等回應)或{ notify, params }(通知，不等回應)，params可省略，預設[]
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeoutMs=120000] 輸入整體逾時毫秒正整數，涵蓋全部請求與收尾，逾時即樹殺，預設120000
 * @param {String} [opt.cwd=process.cwd()] 輸入子進程工作目錄字串，預設process.cwd()
 * @param {Object} [opt.env=undefined] 輸入額外注入之環境變數物件，語意同execCli，預設undefined
 * @param {Number} [opt.exitGraceMs=2000] 輸入收尾stop()之寬限毫秒，語意同execCliSession，預設2000
 * @param {String|Boolean} [opt.jsonrpc=undefined] 輸入每則訊息附加之jsonrpc欄位值，true代表'2.0'(MCP等JSON-RPC 2.0協定需要)，字串則原樣附加，預設undefined代表不附加(codex app-server不需要)
 * @param {Boolean} [opt.continueOnError=false] 輸入回應含error時是否繼續送出後續請求布林值，預設false
 * @param {Function} [opt.onNotify=undefined] 輸入伺服器通知(無id訊息)回調函數，格式為(msg)=>{}，預設undefined
 * @param {Function} [opt.onServerRequest=undefined] 輸入伺服器發給客戶端之請求(帶id且含method)回調函數，格式為(msg, session)=>{}，可用session.writeLine回覆，預設undefined
 * @param {Function} [opt.onStderr=undefined] 輸入stderr片段回調函數，格式為(chunk)=>{}，預設undefined
 * @returns {Promise} 回傳Promise，resolve回傳結果物件，內含ok(是否全部成功布林值)、results(以method為鍵之result物件，失敗者為null)、responses(依序之回應陣列，每項為{ id, method, result, error })、error(錯誤訊息字串，成功時為空字串)、errorType(錯誤類型字串: params(參數錯誤)、notfound(命令不存在)、timeout(逾時)、exit(子進程於回應前結束)、rpc(回應含error)，成功時為空字串)、durationMs(耗時毫秒)、exitCode(子進程離開碼)
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
    }

    //opt
    if (!isobj(opt)) {
        opt = {}
    }

    //timeoutMs
    let timeoutMs = get(opt, 'timeoutMs')
    if (!ispint(timeoutMs)) {
        timeoutMs = 120000
    }

    //jsonrpc
    let jsonrpc = get(opt, 'jsonrpc')
    if (jsonrpc === true) {
        jsonrpc = '2.0'
    }
    if (!isestr(jsonrpc)) {
        jsonrpc = null
    }

    //continueOnError
    let continueOnError = get(opt, 'continueOnError')
    if (!isbol(continueOnError)) {
        continueOnError = false
    }

    //callbacks
    let onNotify = get(opt, 'onNotify')
    let onServerRequest = get(opt, 'onServerRequest')

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
        cwd: get(opt, 'cwd'),
        env: get(opt, 'env'),
        timeoutMs,
        exitGraceMs: get(opt, 'exitGraceMs'),
        onStderr: get(opt, 'onStderr'),
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
                if (isfun(onServerRequest)) {
                    onServerRequest(msg, s)
                }
                return
            }

            //伺服器通知: 無id
            if (isfun(onNotify)) {
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
        else if (isestr(r.error) && r.error.includes('ENOENT')) {
            errorType = 'notfound'
        }
        let error = isestr(r.error) ? r.error : `子進程於回應前結束(code ${r.code})`
        return rFail(errorType, `${method}: ${error}`, { results, responses, exitCode: r.code })
    }

    //依序送出
    let failed = null
    for (let q of requests) {

        //通知: 不配id, 送出即繼續
        if (!isestr(q.method)) {
            let ok = await s.writeLine(JSON.stringify(buildMsg(undefined, q.notify, q.params)))
            if (!ok) {
                let r = exitResult || (await s.stop())
                failed = exitToFail(r, q.notify)
                break
            }
            continue
        }

        //請求: 配id並等待回應
        let id = nextId
        nextId += 1
        let pm = genPm()
        pending.set(id, { method: q.method, pm })
        let ok = await s.writeLine(JSON.stringify(buildMsg(id, q.method, q.params)))
        if (!ok) {
            pending.delete(id)
            let r = exitResult || (await s.stop())
            failed = exitToFail(r, q.method)
            break
        }
        let got = await pm

        //子進程於回應前結束
        if (got.exit) {
            failed = exitToFail(got.exit, q.method)
            break
        }

        //回應
        let msg = got.msg
        if ('error' in msg && msg.error !== null && msg.error !== undefined) {
            results[q.method] = null
            responses.push({ id, method: q.method, result: null, error: msg.error })
            if (!continueOnError) {
                let em = get(msg, 'error.message')
                failed = rFail('rpc', `${q.method}: ${isestr(em) ? em : JSON.stringify(msg.error)}`, { results, responses })
                break
            }
            continue
        }
        results[q.method] = msg.result
        responses.push({ id, method: q.method, result: msg.result, error: null })
    }

    //收尾: 全部完成(或已失敗)後才stop, 此時之退出不視為失敗
    let r = await s.stop()

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
