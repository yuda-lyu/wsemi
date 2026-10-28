import treeKill from 'tree-kill'
import genPm from './genPm.mjs'
import getErrorMessage from './getErrorMessage.mjs'
import getTrace from './getTrace.mjs'


/**
 * 強制關閉指定PID程序及其子孫程序（跨平台，Windows/Linux/macOS）
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessKillPid.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} pid 輸入程序pid
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為即將呼叫tree-kill(含pid為傳給tree-kill之數字，非有限數字者為null)，'done'時為tree-kill回報成功而即將resolve(含pid)，'fail'時為tree-kill回報失敗而即將reject(含pid；msg為reject訊息中冒號後之錯誤訊息字串)；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響本函數；opt或onTrace不可讀(getter拋錯、已撤銷之Proxy)時視同未給回調，預設null
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息`pid[N] killed`，reject回傳錯誤訊息字串`pid[N] kill failed: 訊息`；Windows下訊息含taskkill之輸出，其為系統字碼頁而可能無法正確顯示
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

    //treeKill, Windows內部呼叫「taskkill /pid PID /T /F」, Linux/macOS則以ps/pgrep遞迴尋找子pid後逐一發signal
    //失敗時tree-kill給Error物件(pid非數字、taskkill失敗等), 轉為錯誤訊息字串, 與resolve之訊息格式對稱
    let npid = Number(pid)
    let tpid = null //事件用之pid, 非有限數字(NaN、Infinity)為null
    if (trace) {
        tpid = Number.isFinite(npid) ? npid : null
        trace('start', { pid: tpid })
    }
    treeKill(npid, 'SIGKILL', (err) => {
        if (err) {
            let msg = getErrorMessage(err)
            if (trace) {
                trace('fail', { pid: tpid, msg })
            }
            pm.reject(`pid[${pid}] kill failed: ${msg}`)
        }
        else {
            if (trace) {
                trace('done', { pid: tpid })
            }
            pm.resolve(`pid[${pid}] killed`)
        }
    })

    return pm
}


export default execProcessKillPid
