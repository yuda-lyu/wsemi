import genPm from './genPm.mjs'
import kit from './_execPortPids.mjs'


/**
 * 查詢監聽指定TCP埠之程序PID（跨平台，Windows/Linux/macOS），同步版見execProcessPortPidsSync
 *
 * 監聽列之判定：TCP、本地埠相符、遠端位址為萬用位址(0.0.0.0、::、[::]、*)且遠端埠為0(或*)、PID大於0；不依狀態欄(狀態值可能錯誤，Windows 11 build 26300＋KB5127936實測監聽中之socket狀態值為0、netstat因而整列漏列；狀態文字亦隨語系)。故僅綁定而未監聽之socket(無對端)亦會列入，其同樣佔用該埠
 *
 * Windows：先執行`netstat -ano`(約數十毫秒；不加-p TCP，該參數只列IPv4會漏掉以::監聽者)，查到即採用；查無或失敗時再以PowerShell之`Get-NetTCPConnection -LocalPort <埠>`確認(約1秒；只輸出數值與位址欄位，不受字碼頁影響，不以-State篩選)，其查無才判無人。netstat之查無不採信，故netstat失敗與查無同樣轉查Get-NetTCPConnection，最終之查無以其結果為準。opt.useBoth為true時兩者皆查並取聯集(netstat可能只列出部分監聽列，須確認「監聽者恰為某程序」時使用)。執行檔以%SystemRoot%下之絕對路徑呼叫，不依PATH
 *
 * Linux/macOS：`lsof -nP -iTCP:<埠> -sTCP:LISTEN -t`，lsof查無時以離開碼1結束視為無人；非root時lsof看不到他人帳號之程序，故此時之空陣列不代表他人帳號無人監聽(lsof之限制)
 *
 * 失敗與無人嚴格分開：resolve之空陣列代表已確認無人監聽；查詢失敗(指令不存在或無法啟動、逾時、非預期之離開碼、輸出無法解析、埠號不合法、opt不可讀)一律reject錯誤訊息字串，絕不以空陣列表示失敗，呼叫端可據以fail-closed。本函數不同步拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessPortPids.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} port 輸入埠號，必須參數(無預設)，須為有效整數且在1~65535(依iseint { use: 'port' }判定，數字字串亦可，去頭尾空白後取值)；非預期之輸入(非有效整數、小數、0、超出範圍、Infinity、'0x50'、包裝物件如new Number與new String、其餘物件、非數字)為不合法，reject錯誤訊息`port is not an integer between 1 and 65535`，不視為未給、不改用預設
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.timeout=10000] 輸入每個子指令之逾時毫秒數，可為字串型數字，小數無條件進位為整數，非正數或非數字時為預設值；逾時即強制結束該子指令並視為失敗。Windows下最多依序執行2個子指令，最久約為2倍timeout，預設10000
 * @param {Boolean} [opt.useBoth=false] 輸入Windows下netstat有查到時是否仍以Get-NetTCPConnection再查並取聯集，為true時Get-NetTCPConnection失敗即reject(不以netstat之部分結果代替)，預設false
 * @param {String} [opt.platform=process.platform] 輸入作業系統字串，'win32'走netstat與Get-NetTCPConnection，其餘走lsof，供測試，預設process.platform
 * @param {Function} [opt.exec=null] 輸入執行子指令之函數，供測試以固定輸出驗證，格式為(prog, args, { src, timeout, maxBuffer })=>result，src為資料來源字串'netstat'、'powershell'、'lsof'，result(或resolve之值)須為與child_process.spawnSync同形之物件{ status, stdout, error }：status為離開碼數字(因訊號結束者為null)、stdout為字串或Buffer(Buffer以latin1解碼)、error為無法啟動或逾時之Error物件(code為'ETIMEDOUT'者視為逾時)否則為null；拋錯、reject或回傳非物件皆視為該子指令失敗；回傳永不落定之Promise時本函數亦不落定(逾時由該函數自行負責)。預設null為內建之執行函數(隱藏視窗、不經shell、逾時或stdout超過64MB即強制結束子指令)
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'run'時為即將執行子指令(含src為資料來源字串、timeout為逾時毫秒數)，'result'時為子指令已結束並判定(含src、ok為是否成功、reason為'ok'、'timeout'、'error'(無法啟動或輸出過大)、'code'(非預期之離開碼)、'parse'(輸出無法解析)、'exec'(執行函數拋錯或回傳不合)、code為離開碼數字或null、count為查到之PID數，失敗為null)，'settle'時為即將resolve或reject(含ok、reason為'ok'、'port'(埠號不合法)、'query'(查詢失敗)、src為採用之資料來源字串'netstat'、'powershell'、'netstat+powershell'、'lsof'(失敗為null)、count為PID數(失敗為null)、msg為reject之訊息字串(成功為空字串))；opt不可讀者屬取得回調前之失敗，reject說明字串且不通知；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響本函數，預設null
 * @returns {Promise} 回傳Promise，resolve回傳PID數字陣列(去重、由小到大)，空陣列代表無人監聽；reject回傳錯誤訊息字串：埠號不合法為`port is not an integer between 1 and 65535`，opt不可讀為`opt is not readable: 訊息`，查詢失敗為`port[N] listener query failed: 各資料來源之說明`(說明之格式不保證固定，呼叫端勿解析)
 * @example
 * //need test in nodejs
 *
 * if (true) {
 *     execProcessPortPids(8080)
 *         .then(function(pids) {
 *             console.log('then', pids)
 *             // => [ 12345 ] (無人監聽時為[])
 *         })
 *         .catch(function(msg) {
 *             //查詢失敗, 不可視為無人監聽
 *             console.log('catch', msg)
 *         })
 * }
 *
 * if (true) {
 *     //確認監聽者恰為自建之子程序, 兩者皆查取聯集, 查詢失敗即fail-closed
 *     let pids = await execProcessPortPids(8080, { useBoth: true })
 *     let owned = pids.length === 1 && pids[0] === child.pid
 * }
 *
 */
function execProcessPortPids(port, opt = {}) {

    //pm
    let pm = genPm()

    //readInput, opt不可讀者無觀察回調, 直接reject
    let inp = kit.readInput(port, opt, kit.runCmd)
    if (inp.err !== null) {
        pm.reject(inp.err)
        return pm
    }
    let { timeout, useBoth, platform, exec, trace, sysRoot } = inp.cfg

    //check port
    if (inp.port === null) {
        let r = { ok: false, src: null, pids: null, msg: kit.MSG_PORT }
        kit.traceSettle(trace, r, 'port')
        pm.reject(r.msg)
        return pm
    }
    let n = inp.port

    //runOne, 執行一個資料來源之子指令並判定, 不reject
    let runOne = async (src) => {
        kit.traceRun(trace, src, timeout)
        let c = null
        try {
            let cmd = kit.buildCmd(src, n, sysRoot)
            let res = await exec(cmd.prog, cmd.args, { src, timeout, maxBuffer: kit.MAX_BUFFER })
            c = kit.classify(src, res, n, timeout)
        }
        catch (err) {
            c = kit.classifyThrown(err)
        }
        kit.traceResult(trace, src, c)
        return c
    }

    //core, 依判定流程逐一執行
    let core = async () => {
        let it = kit.plan(n, platform, useBoth)
        let step = it.next()
        while (!step.done) {
            let c = await runOne(step.value)
            step = it.next(c)
        }
        return step.value
    }

    //core之各步皆已攔錯而不reject; 第二個處理器為防禦(必定落定、不產生未處理之rejection)
    core()
        .then((r) => {
            kit.traceSettle(trace, r, r.ok ? 'ok' : 'query')
            if (r.ok) {
                pm.resolve(r.pids)
            }
            else {
                pm.reject(r.msg)
            }
        }, (err) => {
            let r = { ok: false, src: null, pids: null, msg: `port[${n}] listener query failed: ${kit.classifyThrown(err).detail}` }
            kit.traceSettle(trace, r, 'query')
            pm.reject(r.msg)
        })

    return pm
}


export default execProcessPortPids
