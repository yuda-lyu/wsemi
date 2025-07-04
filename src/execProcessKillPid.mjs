import cstr from './cstr.mjs'
import execProcess from './execProcess.mjs'


/**
 * Windows下強制關閉指定PID程序
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcessKillPid.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pid 輸入程序pid字串
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
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
async function execProcessKillPid(pid) {

    //execProcess, 執行windows指令taskkill去中止pid, 不論是哪種mode都有機率觸發「ERROR: The process "{pid}" not found.」
    let cmd = 'taskkill'
    let args = ['/pid', cstr(pid), '/T', '/F']
    let r = await execProcess(cmd, args) //預設spawn
    // let r = await execProcess(cmd, args, { mode: 'spawn' })
    // let r = await execProcess(cmd, args, { mode: 'exec' })
    // let r = await execProcess(cmd, args, { mode: 'exec', useChcp:true })
    // let r = await execProcess(cmd, args, { mode: 'execFile' })
    // console.log('r', r)

    return r
}


export default execProcessKillPid
