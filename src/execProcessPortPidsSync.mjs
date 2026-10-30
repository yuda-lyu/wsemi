import kit from './_execPortPids.mjs'


/**
 * 查詢監聽指定TCP埠之程序PID之同步版（跨平台，Windows/Linux/macOS），供行程之exit、signal處理器等不可非同步之處使用，非同步版見execProcessPortPids
 *
 * 判定規則、資料來源與其順序同execProcessPortPids(兩者共用同一套解析與判定流程)：監聽列為TCP、本地埠相符、遠端位址為萬用位址(0.0.0.0、::、[::]、*)且遠端埠為0(或*)、PID大於0，不依狀態欄；Windows先`netstat -ano`，查無或失敗時以PowerShell之`Get-NetTCPConnection -LocalPort <埠>`確認，其查無才判無人；Linux/macOS為`lsof -nP -iTCP:<埠> -sTCP:LISTEN -t`(非root時看不到他人帳號之程序，此時之空陣列不代表他人帳號無人監聽)
 *
 * 子指令以child_process.spawnSync執行，期間阻塞事件迴圈，Windows下最久約為2倍opt.timeout(預設各10000毫秒)
 *
 * 失敗與無人嚴格分開：回傳空陣列代表已確認無人監聽；查詢失敗(指令不存在或無法啟動、逾時、非預期之離開碼、輸出無法解析、埠號不合法、opt不可讀)一律回傳null，絕不以空陣列表示失敗，呼叫端可據以fail-closed；失敗之訊息字串(同execProcessPortPids之reject訊息)可由opt.onTrace之settle事件之msg取得。本函數不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessPortPidsSync.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} port 輸入埠號，須為1~65535之整數，可為字串型數字(依ispint判定)或包裝物件(new Number、new String，以其原始值判定)，其餘物件為不合法
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.timeout=10000] 輸入每個子指令之逾時毫秒數，可為字串型數字，小數無條件進位為整數，非正數或非數字時為預設值；逾時即強制結束該子指令並視為失敗，預設10000
 * @param {Boolean} [opt.useBoth=false] 輸入Windows下netstat有查到時是否仍以Get-NetTCPConnection再查並取聯集，為true時Get-NetTCPConnection失敗即回傳null(不以netstat之部分結果代替)，預設false
 * @param {String} [opt.platform=process.platform] 輸入作業系統字串，'win32'走netstat與Get-NetTCPConnection，其餘走lsof，供測試，預設process.platform
 * @param {Function} [opt.exec=null] 輸入同步執行子指令之函數，供測試以固定輸出驗證，格式為(prog, args, { src, timeout, maxBuffer })=>result，src為資料來源字串'netstat'、'powershell'、'lsof'，result須為與child_process.spawnSync同形之物件{ status, stdout, error }(說明同execProcessPortPids之opt.exec)；拋錯、回傳非物件或回傳Promise(同步版無法等待)皆視為該子指令失敗。預設null為內建之spawnSync執行函數(隱藏視窗、不經shell、逾時或輸出超過64MB即強制結束子指令)
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，type與欄位同execProcessPortPids：'run'(即將執行子指令；src、timeout)、'result'(子指令已結束並判定；src、ok、reason、code、count)、'settle'(即將回傳；ok、reason、src、count、msg，失敗時msg為失敗訊息字串)；opt不可讀者屬取得回調前之失敗，回傳null且不通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響本函數，預設null
 * @returns {Array|null} 回傳PID數字陣列(去重、由小到大)，空陣列代表無人監聽；查詢失敗回傳null
 * @example
 * //need test in nodejs
 *
 * if (true) {
 *     let pids = execProcessPortPidsSync(8080)
 *     if (pids === null) {
 *         //查詢失敗, 不可視為無人監聽
 *     }
 *     else if (pids.length === 0) {
 *         //已確認無人監聽
 *     }
 * }
 *
 * if (true) {
 *     //行程結束前確認埠已釋放, 失敗訊息由onTrace之settle事件取得
 *     process.on('exit', () => {
 *         let msg = ''
 *         let pids = execProcessPortPidsSync(8080, { onTrace: (e) => { if (e.type === 'settle') { msg = e.msg } } })
 *         console.log(pids, msg)
 *     })
 * }
 *
 */
function execProcessPortPidsSync(port, opt = {}) {

    //readInput, opt不可讀者無觀察回調, 直接回傳null
    let inp = kit.readInput(port, opt, kit.runCmdSync)
    if (inp.err !== null) {
        return null
    }
    let { timeout, useBoth, platform, exec, trace, sysRoot } = inp.cfg

    //check port
    if (inp.port === null) {
        let r = { ok: false, src: null, pids: null, msg: kit.MSG_PORT }
        kit.traceSettle(trace, r, 'port')
        return null
    }
    let n = inp.port

    //runOne, 執行一個資料來源之子指令並判定, 不拋錯
    let runOne = (src) => {
        kit.traceRun(trace, src, timeout)
        let c = null
        try {
            let cmd = kit.buildCmd(src, n, sysRoot)
            let res = exec(cmd.prog, cmd.args, { src, timeout, maxBuffer: kit.MAX_BUFFER })
            if (res !== null && typeof res === 'object' && typeof res.then === 'function') {
                //同步版無法等待, 先標記已處理再視為失敗, 免其rejection成為未處理
                try {
                    res.then(null, () => {})
                }
                catch (err) {}
                c = kit.classifyThrown('exec returned a Promise, which the sync version cannot wait for')
            }
            else {
                c = kit.classify(src, res, n, timeout)
            }
        }
        catch (err) {
            c = kit.classifyThrown(err)
        }
        kit.traceResult(trace, src, c)
        return c
    }

    //依判定流程逐一執行
    let r = null
    try {
        let it = kit.plan(n, platform, useBoth)
        let step = it.next()
        while (!step.done) {
            step = it.next(runOne(step.value))
        }
        r = step.value
    }
    catch (err) {
        //防禦: 各步皆已攔錯, 不應發生
        r = { ok: false, src: null, pids: null, msg: `port[${n}] listener query failed: ${kit.classifyThrown(err).detail}` }
    }
    kit.traceSettle(trace, r, r.ok ? 'ok' : 'query')
    return r.ok ? r.pids : null
}


export default execProcessPortPidsSync
