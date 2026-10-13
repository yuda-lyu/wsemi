import treeKill from 'tree-kill'
import genPm from './genPm.mjs'
import getErrorMessage from './getErrorMessage.mjs'


/**
 * 強制關閉指定PID程序及其子孫程序（跨平台，Windows/Linux/macOS）
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessKillPid.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} pid 輸入程序pid
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
function execProcessKillPid(pid) {

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

    //treeKill, Windows內部呼叫「taskkill /pid PID /T /F」, Linux/macOS則以ps/pgrep遞迴尋找子pid後逐一發signal
    //失敗時tree-kill給Error物件(pid非數字、taskkill失敗等), 轉為錯誤訊息字串, 與resolve之訊息格式對稱
    treeKill(Number(pid), 'SIGKILL', (err) => {
        if (err) {
            pm.reject(`pid[${pid}] kill failed: ${getErrorMessage(err)}`)
        }
        else {
            pm.resolve(`pid[${pid}] killed`)
        }
    })

    return pm
}


export default execProcessKillPid
