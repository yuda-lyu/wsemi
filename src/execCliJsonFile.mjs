import fs from 'fs'
import path from 'path'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import isarr from './isarr.mjs'
import execCli from './execCli.mjs'
import execCliFailDetail from './execCliFailDetail.mjs'
import makeLineEmitter from './_makeLineEmitter.mjs'
import callUser from './_callUser.mjs'
import execSpawnError from './_execSpawnError.mjs'
import execThrownMsg from './_execThrownMsg.mjs'
import getErrorMessage from './getErrorMessage.mjs'


//isStr, 非空原始字串(傳給spawn與檔案路徑者只收原始字串, 不收String包裝物件)
function isStr(v) {
    return typeof v === 'string' && v !== ''
}


//readInput, 讀取並判型呼叫端輸入, 一次讀取成快照; 輸入不可讀(getter拋錯、已撤銷之Proxy等)時直接拋出, 由呼叫端承接
function readInput(opt) {

    //opt, 非物件視為{}(其後script檢查會回報缺漏)
    if (opt === null || typeof opt !== 'object' || isarr(opt)) {
        opt = {}
    }

    //script, outputPath, 必須參數
    let script = get(opt, 'script', null)
    let outputPath = get(opt, 'outputPath', null)
    let missing = ''
    if (!isStr(script)) {
        missing = 'script'
    }
    else if (!isStr(outputPath)) {
        missing = 'outputPath'
    }

    //args, 非陣列視為[]; 取快照(逐項讀取)
    let args = get(opt, 'args', null)
    if (!isarr(args)) {
        args = []
    }
    else {
        args = [...args]
    }

    //exe, 非預期輸入改用'node'
    let exe = get(opt, 'exe', null)
    if (!isStr(exe)) {
        exe = 'node'
    }

    //onProgress, progressPrefix, onTrace
    let onProgress = get(opt, 'onProgress', null)
    if (!isfun(onProgress)) {
        onProgress = null
    }
    let prefix = get(opt, 'progressPrefix', '')
    if (typeof prefix !== 'string') {
        prefix = ''
    }
    let onTrace = get(opt, 'onTrace', null)
    if (!isfun(onTrace)) {
        onTrace = null
    }

    //execCli之選項, 值原樣交execCli判型(非預期輸入由其改用預設)
    let optCli = {
        timeoutMs: get(opt, 'timeoutMs'),
        cwd: get(opt, 'cwd'),
        maxRetries: get(opt, 'maxRetries'),
        retryDelayMs: get(opt, 'retryDelayMs'),
    }

    return { missing, script, outputPath, args, exe, onProgress, prefix, onTrace, optCli }
}


/**
 * 以子進程執行CLI腳本，結果由子進程寫入JSON檔，執行完成後讀回解析，並可逐行接收子進程之進度輸出
 *
 * 為execCli家族成員(建於execCli之上，沿用其逾時、進程樹清理、重試)，適用於結果不走stdout之情形：子進程之stdout常混有進度訊息與第三方套件雜訊，由stdout切出JSON並不可靠，故約定由腳本將結果JSON寫至指定檔案；進度與重試歷程仍可經onProgress逐行取得。子進程另帶來進程隔離之好處：會啟動瀏覽器之腳本卡死時可被逾時樹殺，不拖住主進程
 *
 * 約定：腳本以[script, ...args, outputPath]之順序接收命令列參數(outputPath恆為最後一個，原樣傳入)，且須於結束前將結果以JSON寫入outputPath；outputPath為相對路徑時，子進程與本函數皆以opt.cwd(未給則為本進程工作目錄)為基準解析，故讀回之檔案即子進程寫入之檔案
 *
 * 失敗以結構化物件回報而不reject，呼叫端可在允許個別失敗之迴圈內逐筆處理：子進程失敗(未啟動、逾時、非零離開碼、重試用盡)回傳{ status: 'error', message }，message為execCli之error字串附上execCliFailDetail之摘要(嘗試次數與stderr前段，超長補刪節號)；成功離開後結果檔不存在、無法讀取或非有效JSON回傳{ status: 'error', message: 'JSON parse failed: ...' }；opt及其選項值不可讀(getter拋錯、已撤銷之Proxy等)時回傳{ status: 'error', message: '<錯誤碼>: <訊息>' }(同execCli，無錯誤碼者為UNKNOWN)。成功時回傳JSON.parse之結果原樣(不包裝)，故腳本自行寫入之內容若含status鍵，呼叫端須自行與失敗物件區分
 *
 * 必須參數(opt.script與opt.outputPath)缺漏或非非空原始字串時reject Error('execCliJsonFile 需要 script')或Error('execCliJsonFile 需要 outputPath')，此時不啟動子進程；其餘opt鍵之非預期輸入視為未給，改用預設。執行前不清除outputPath，若子進程離開碼為0卻未寫入，將讀到該路徑上原有內容，請於每次執行使用新路徑或由腳本確保寫入
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCliJsonFile.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} opt 輸入設定物件，必須給定
 * @param {String} opt.script 輸入腳本路徑非空原始字串(傳給exe之第1個參數)，必須給定
 * @param {String} opt.outputPath 輸入結果JSON檔路徑非空原始字串(傳給腳本之最後1個參數，由腳本寫入、本函數讀回)，必須給定
 * @param {Array} [opt.args=[]] 輸入夾在script與outputPath之間之參數陣列，非陣列視為未給，預設[]
 * @param {String} [opt.exe='node'] 輸入執行檔非空原始字串，非預期輸入視為未給，預設'node'
 * @param {Number} [opt.timeoutMs] 輸入每次嘗試之逾時毫秒正整數，同execCli.timeoutMs(預設120000)
 * @param {String} [opt.cwd] 輸入子進程工作目錄，同execCli.cwd(預設為本進程工作目錄)
 * @param {Number} [opt.maxRetries=0] 輸入失敗後最大重試次數非負整數，同execCli.maxRetries，預設0
 * @param {Number} [opt.retryDelayMs] 輸入重試間隔毫秒正整數，同execCli.retryDelayMs(預設5000，實際間隔為其乘以重試次數且上限15000)
 * @param {Function} [opt.onProgress=null] 輸入進度回調函數，格式為(line, isErr)=>{}，子進程每輸出一完整行(stdout與stderr各自切行)即同步呼叫，每行先trim(去除前後空白，含行尾\r)，trim後為空者(空行、純空白行)不回報，故回調收到的行已無前後空白，isErr為true代表該行來自stderr；子進程某次嘗試結束時殘留之無換行半行，於該次嘗試結束(settle)時補回報(同受trim規則)，不與下一次嘗試之輸出黏成一行；回調內拋錯之處置同execCli之onStdout(不影響本函數之輸出累積與結果，錯誤原樣重拋為未捕捉例外)，預設null
 * @param {String} [opt.progressPrefix=''] 輸入進度行前綴字串，非空時onProgress只收(trim後)以此字串開頭之行(stdout與stderr皆套用，前綴比對用trim後之字串，故縮排之前綴行亦收)，非字串視為未給，預設''代表全收
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，原樣轉交execCli(事件種類與語意同execCli.onTrace，如'attempt'、'retry'、'settle'、'done')，供測試以事件(而非等待時間)同步與診斷，預設null
 * @returns {Promise} 回傳Promise，resolve回傳結果檔JSON解析後之值，或失敗物件{ status: 'error', message }；必須參數不合時reject Error
 * @example
 * need test in nodejs.
 *
 * //腳本/tmp/cli.mjs(以[...args, outputPath]接收參數，將結果寫入outputPath)：
 * //    import fs from 'fs'
 * //    let outputPath = process.argv[process.argv.length - 1]
 * //    console.log('[step] working')
 * //    fs.writeFileSync(outputPath, JSON.stringify({ ok: 1 }), 'utf8')
 *
 * async function test() {
 *
 *     let lines = []
 *     let r1 = await execCliJsonFile({
 *         script: '/tmp/cli.mjs',
 *         outputPath: '/tmp/out.json',
 *         exe: process.execPath,
 *         timeoutMs: 10000,
 *         progressPrefix: '[step]',
 *         onProgress: (line, isErr) => {
 *             lines.push([line, isErr])
 *         },
 *     })
 *     console.log(r1, lines)
 *     // => { ok: 1 } [ [ '[step] working', false ] ]
 *
 *     let r2 = await execCliJsonFile({ script: '/tmp/not-exist.mjs', outputPath: '/tmp/out2.json', exe: process.execPath })
 *     console.log(r2.status, r2.message)
 *     // => error Exit code 1，共試 1 次 → ...Cannot find module...
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function execCliJsonFile(opt) {

    //readInput, 輸入不可讀以結構化失敗物件回報(同execCli)
    let inp = null
    try {
        inp = readInput(opt)
    }
    catch (err) {
        let e = execSpawnError(err)
        return {
            status: 'error',
            message: `${e.code}: ${execThrownMsg(e, err)}`,
        }
    }
    let { missing, script, outputPath, args, exe, onProgress, prefix, onTrace, optCli } = inp

    //check, 必須參數(回傳Promise者以reject回報, 不同步拋出)
    if (missing !== '') {
        throw new Error(`execCliJsonFile 需要 ${missing}`)
    }

    //emitter, stdout與stderr各建一份(共用緩衝會互相插隊)
    let emitOut = null
    let emitErr = null
    if (onProgress !== null) {
        emitOut = makeLineEmitter((line) => {
            onProgress(line, false)
        }, prefix)
        emitErr = makeLineEmitter((line) => {
            onProgress(line, true)
        }, prefix)
        optCli.onStdout = emitOut
        optCli.onStderr = emitErr
    }

    //onTrace, 觀察回調原樣轉交execCli(事件同execCli); 有進度回調者另於每次嘗試定案(settle)時先補回報該次殘留之無換行半行, 免延到下次嘗試才回報或與其第一段輸出黏成一行
    if (onTrace !== null || emitOut !== null) {
        optCli.onTrace = (e) => {
            if (emitOut !== null && e.type === 'settle') {
                callUser(emitOut.flush)
                callUser(emitErr.flush)
            }
            if (onTrace !== null) {
                return onTrace(e) //拋錯與回傳之rejection由execCli之getTrace隔離
            }
        }
    }

    //execCli
    let r = await execCli(exe, [script, ...args, outputPath], optCli)

    //最後殘留之半行(未經settle事件者之保險)
    if (emitOut !== null) {
        callUser(emitOut.flush)
        callUser(emitErr.flush)
    }

    //failed
    if (!r.ok) {
        return {
            status: 'error',
            message: `${r.error}${execCliFailDetail(r)}`,
        }
    }

    //read and parse, 相對路徑以子進程之工作目錄為基準(與腳本寫入之位置一致)
    try {
        let base = isStr(optCli.cwd) ? optCli.cwd : process.cwd()
        return JSON.parse(fs.readFileSync(path.resolve(base, outputPath), 'utf8'))
    }
    catch (err) {
        return {
            status: 'error',
            message: `JSON parse failed: ${getErrorMessage(err)}`,
        }
    }

}


export default execCliJsonFile
