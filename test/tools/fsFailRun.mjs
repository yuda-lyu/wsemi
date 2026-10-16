//fsFailRun.mjs: R-FS-REJECT-01、R-FS-RESULT-01之5各測試檔(fso組)共用之子行程呼叫端, 執行test/tools/fsFailRunner.mjs之指定案例並剖析其輸出
//  各測試檔一律import此函數, 不得在測試檔內另寫近似之run(); 子行程與結果行之處理委派runChildCase(各執行器共用)
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runChildCase } from './runChildCase.mjs'


let runner = fileURLToPath(new URL('./fsFailRunner.mjs', import.meta.url))
let fdTmp = fileURLToPath(new URL('../_tmp/', import.meta.url))


/**
 * 於獨立子行程執行fsFailRunner.mjs之一個案例
 *
 * @param {String} caseName 案例名稱(fsFailRunner.mjs內cases之鍵)
 * @param {Object} [opt={}] 輸入設定物件, 傳給runChildCase
 * @param {String} [opt.exitMode=''] 輸入結束模式字串, 為'nohandler'時執行器不掛未處理rejection與未捕捉例外之記錄器(驗無處理器時行程不崩潰), 預設''
 * @param {Number} [opt.timeout=60000] 輸入子行程逾時毫秒數, 預設60000
 * @param {Boolean} [opt.allowNoResult=false] 輸入無結果行是否不視為錯誤布林值(nohandler模式之子行程崩潰時無結果行), 預設false
 * @returns {Object} 回傳{ r, ms, status, signal, stderr }, r為子行程輸出之結果物件({ out, logs, unhandled, uncaught, cleanupError }, 無結果行時為null), ms為耗時, status為離開碼, signal為被終止之訊號, stderr為子行程之stderr字串
 */
function runFsFail(caseName, opt = {}) {
    let rc
    try {
        rc = runChildCase(runner, caseName, { timeout: 60000, ...opt })
    }
    finally {
        //子行程崩潰(nohandler模式之未處理rejection)或逾時被終止時未執行其finally, 於此補刪本案夾具資料夾(與執行器同一路徑, 不動_tmp根目錄)
        fs.rmSync(path.join(fdTmp, 'fsFail-' + caseName), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    }

    //執行器本身出錯(未知案例等)或夾具、子程序未能清除屬測試基礎設施問題, 直接擲出而不讓其殘留或被誤判為受測者之結果
    if (rc.r !== null && rc.r.out && rc.r.out.runnerError) {
        throw new Error(`${caseName}: 執行器出錯: ${rc.r.out.runnerError}`)
    }
    if (rc.r !== null && rc.r.cleanupError) {
        throw new Error(`${caseName}: 夾具或子程序未能清除: ${rc.r.cleanupError}`)
    }

    return rc
}


/**
 * 子行程結果之未處理rejection與未捕捉例外(R-PM-SETTLE-01之2: 皆須為空), 與ev0並用於斷言
 *
 * @param {Object} r 輸入runFsFail回傳之r
 * @returns {Object} 回傳{ unhandled, uncaught }
 */
function ev(r) {
    return { unhandled: r.unhandled, uncaught: r.uncaught }
}
let ev0 = { unhandled: [], uncaught: [] }


/**
 * 執行器run()對「同步回傳僅含error鍵之結果物件」之描述(非同步拋出、非Promise), 供斷言之預期值
 *
 * @param {String} v 輸入error之字串值(error為字串時), 或String(err)(error為Error物件時)
 * @param {Boolean} [isErr=false] 輸入error是否為Error物件布林值, 預設false(字串)
 * @returns {Object} 回傳{ s: 'return', k: 'result', keys: ['error'], error: { k, v } }
 */
function rErr(v, isErr = false) {
    return { s: 'return', k: 'result', keys: ['error'], error: { k: isErr ? 'Error' : 'string', v } }
}


//RULE_OU, opt不可讀案例之期望所對應之規則句(CLAUDE_rulebook.md), 同一規則句只寫於此
let RULE_OU = {
    reject: 'R-FS-REJECT-01 規則2: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)同, 對外函數之{ fs, ...opt }展開與Core之get(opt, …)皆在try內, 不得同步拋出、不得以非字串reject',
    result: 'R-FS-RESULT-01 規則7: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)同, 對外函數之{ fs, ...opt }展開與Core之get(opt, …)皆在try內(useSync:false者resolve{ error })',
}


/**
 * 定義「opt不可讀」之mocha之it(於describe內呼叫): 執行fsFailRunner.mjs之'OU-<函數>'案例(getter拋Error('getter boom')、已撤銷之Proxy, 結果物件族另有useSync:false之getter形), 依族斷言
 *
 * @param {String} name 輸入函數名稱字串
 * @param {String} kind 輸入函數之族字串: 'reject'(回傳Promise, 拒絕值為String(err))、'rejectMsg'(回傳Promise, 拒絕值為message, 即fsMergeFilesCore與其對外fsMergeFiles)、'result'(同步回結果物件)、'resultAsync'(結果物件且支援useSync:false)
 */
function itOptUnreadable(name, kind) {
    let isReject = kind === 'reject' || kind === 'rejectMsg'
    let rule = isReject ? RULE_OU.reject : RULE_OU.result
    it(`OU-${name} opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy) [${rule}]`, function() {
        let { r } = runFsFail('OU-' + name)
        let o = r.out
        let rv = o.revoked
        if (isReject) {
            //R-FS-REJECT-01 規則2、規則1: getter拋Error('getter boom')者不同步拋出而以字串reject, 值為String(err)(fsMergeFilesCore、fsMergeFiles依規則1之例外為message)
            assert.strict.deepStrictEqual(o.getter, { s: 'reject', k: 'string', v: kind === 'rejectMsg' ? 'getter boom' : 'Error: getter boom' })
            //R-FS-REJECT-01 規則2、規則1: 已撤銷之Proxy(展開或讀取即拋TypeError)者不同步拋出而以字串reject, 值為String(err)即'TypeError: 訊息'(fsMergeFilesCore、fsMergeFiles為message, 不帶名稱; 訊息全文為引擎之陷阱描述, 不屬規格)
            assert.strict.deepStrictEqual({ s: rv.s, k: rv.k, typeErrorStr: /^TypeError: /.test(String(rv.v)) }, { s: 'reject', k: 'string', typeErrorStr: kind !== 'rejectMsg' })
        }
        else {
            //R-FS-RESULT-01 規則7、規則5: getter拋Error('getter boom')者不同步拋出而回{ error }, error為該Error原樣(真Error原樣回傳)
            assert.strict.deepStrictEqual(o.getter, rErr('Error: getter boom', true))
            //R-FS-RESULT-01 規則7、規則5: 已撤銷之Proxy者不同步拋出而回{ error }, error為引擎拋出之TypeError原樣(useSync不可讀而為預設true, 同步回傳)
            assert.strict.deepStrictEqual({ s: rv.s, k: rv.k, keys: rv.keys, ek: rv.error ? rv.error.k : null, typeErrorStr: !!rv.error && /^TypeError: /.test(String(rv.error.v)) }, { s: 'return', k: 'result', keys: ['error'], ek: 'Error', typeErrorStr: true })
            if (kind === 'resultAsync') {
                //R-FS-RESULT-01 規則7: useSync:false而opt.fs之getter拋錯者回Promise並resolve{ error }(不觸發reject), error為該Error原樣
                assert.strict.deepStrictEqual(o.getterAsync, { s: 'resolve', k: 'result', keys: ['error'], error: { k: 'Error', v: 'Error: getter boom' } })
            }
        }
        //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException
        assert.strict.deepStrictEqual(ev(r), ev0)
    })
}


export { runFsFail, ev, ev0, rErr, itOptUnreadable }
