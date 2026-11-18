import treeKill from 'tree-kill'
import genPm from './genPm.mjs'
import getErrorMessage from './getErrorMessage.mjs'
import getTrace from './getTrace.mjs'
import iseint from './iseint.mjs'


//pid之有效範圍: 1至2147483647之整數(iseint之use:'int32'與min:1), 不含0與負數(POSIX之kill(0)為殺本行程群組、kill(-1)為殺所有可殺之程序, 屬安全相關, fail-closed), 上限為作業系統pid_t之範圍(大於其者經int轉換會環繞成負值而殺行程群組)
let PID_CHK = { use: 'int32', min: 1 }
let PID_DESC = 'an integer from 1 to 2147483647'


/**
 * 強制關閉指定PID程序及其子孫程序（跨平台，Windows/Linux/macOS）
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessKillPid.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} pid 輸入程序pid，必須參數，須為1至2147483647(作業系統pid_t之上限，大於其者經int轉換會環繞成負值而殺行程群組)之整數，可為十進位數字字串(去頭尾空白後轉為數字使用，如' 12 '為12，'+12'為12，'1.0'為1，'4.2e5'為420000，判定同iseint)；0、負數、小數(如1.5)、超出範圍、'0x10'等非十進位寫法、尾綴雜字、''、null、undefined、布林、陣列、物件、NaN、Infinity、BigInt、Symbol、包裝物件皆無效，無效時於呼叫tree-kill(殺任何程序)之前reject，不做任何殺程序之動作(POSIX之kill(0)、kill(-1)為殺行程群組或全部可殺之程序，故不得以轉型放行)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為即將呼叫tree-kill(含pid為傳給tree-kill之數字，pid無效時不會發出)，'done'時為tree-kill回報成功而即將resolve(含pid)，'fail'時為tree-kill回報失敗或pid無效而即將reject(含pid，pid無效者為null；msg為reject訊息中冒號後之錯誤訊息字串，pid無效者為整句固定訊息)；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響本函數；opt或onTrace不可讀(getter拋錯、已撤銷之Proxy)時視同未給回調，預設null
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息`pid[N] killed`(N為轉換後之數字)，reject回傳錯誤訊息字串：pid無效為固定訊息`invalid pid: must be an integer from 1 to 2147483647`(不含pid之值，且不殺任何程序)；殺程序失敗為`pid[N] kill failed: 訊息`(N為轉換後之數字)；Windows下訊息含taskkill之輸出，其為系統字碼頁而可能無法正確顯示；本函數不同步拋錯
 * @example
 * //need test in nodejs
 *
 * if (true) {
 *     let pid = 123456
 *     execProcessKillPid(pid)
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 */
function execProcessKillPid(pid, opt = {}) {

    // //execProcess, 執行windows指令taskkill去中止pid, 不論是哪種mode都有機率觸發「ERROR: The process "{pid}" not found.」
    // let cmd = 'taskkill'
    // let args = ['/pid', cstr(pid), '/T', '/F']
    // let r = await execProcess(cmd, args) //預設spawn
    // // let r = await execProcess(cmd, args, { mode: 'spawn' })
    // // let r = await execProcess(cmd, args, { mode: 'exec' })
    // // let r = await execProcess(cmd, args, { mode: 'exec', useChcp:true })
    // // let r = await execProcess(cmd, args, { mode: 'execFile' })
    // // console.log('r', r)

    //pm
    let pm = genPm()

    //trace, 觀察回調(opt.onTrace), 未給時為null; opt不可讀(getter拋錯、已撤銷之Proxy)時視同未給, 回調屬觀察用途不得改變本函數既有行為
    let trace = null
    try {
        trace = getTrace(opt)
    }
    catch (err) {
        trace = null
    }

    //check pid, 必須參數(R-EXEC-ARG-01): 須為1至2147483647之整數或其十進位數字字串, 檢測之值即使用之值(K4, 轉換後之數字); 無效以固定訊息reject(V19、V20: 不含pid之值), 先於任何殺程序之動作(V17)
    //  不用Number()轉型: null、''、[]得0、true得1、'0x10'得16、小數經取整、負數照交tree-kill, 而0與負數於POSIX為殺行程群組或全部可殺之程序; 判型用iseint(不拋錯、不呼叫被檢測值之方法, 包裝物件視為無效)
    let ok = false
    try {
        ok = iseint(pid, PID_CHK)
    }
    catch (err) {
        ok = false
    }
    if (!ok) {
        let msg = `invalid pid: must be ${PID_DESC}`
        if (trace) {
            trace('fail', { pid: null, msg })
        }
        pm.reject(msg)
        return pm
    }
    let npid = Number(pid)

    //treeKill, Windows內部呼叫「taskkill /pid PID /T /F」, Linux/macOS則以ps/pgrep遞迴尋找子pid後逐一發signal
    //失敗時tree-kill給Error物件(taskkill失敗等), 轉為錯誤訊息字串, 與resolve之訊息格式對稱
    if (trace) {
        trace('start', { pid: npid })
    }
    treeKill(npid, 'SIGKILL', (err) => {
        if (err) {
            let msg = getErrorMessage(err)
            if (trace) {
                trace('fail', { pid: npid, msg })
            }
            pm.reject(`pid[${npid}] kill failed: ${msg}`)
        }
        else {
            if (trace) {
                trace('done', { pid: npid })
            }
            pm.resolve(`pid[${npid}] killed`)
        }
    })

    return pm
}


export default execProcessKillPid
