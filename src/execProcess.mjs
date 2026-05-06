import cp from 'child_process'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import strleft from './strleft.mjs'
import strright from './strright.mjs'
import arrHas from './arrHas.mjs'
import execProcessKillPid from './execProcessKillPid.mjs'


/**
 * 呼叫執行檔執行
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcess.test.mjs Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串，若為註冊系統的全域指令，例如可直接給'Python'，腳本需自行接收呼叫引數，並將回傳資料轉json字串後print/log到dos視窗，即可由nodejs接收
 * @param {String|Array} args 輸入腳本檔案位置字串或參數
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Function} [opt.cbStdout=null] 輸入回調stdout函數，預設null
 * @param {Function} [opt.cbStderr=null] 輸入回調stderr函數，預設null
 * @param {String} [opt.codeCmd='big5'] 輸入讀回程序的stdout與stderr回應的解碼字串，為當前作業系統語系，預設'big5'
 * @param {Number} [opt.timeout=null] 輸入逾時毫秒數，預設null表示不限制；逾時觸發時會調用execProcessKillPid強制關閉子進程及其子孫程序，並reject回傳逾時訊息
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * if (true) {
 *     let prog = 'taskkill'
 *     let args = ['/pid', '{pid}', '/T', '/F']
 *     let r = await execProcess(prog, args) //預設spawn
 * }
 *
 * if (true) {
 *     let prog = `C:\\Program Files\\7-Zip\\7z.exe`
 *     let pw = 'AbcD1234'
 *     let args = `a abc.7z abc.txt -p${pw}`
 *     execProcess(prog, args, { mode: 'execFile' })
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 */
function execProcess(prog, args, opt = {}) {

    //check
    if (!isearr(args) && !isestr(args)) {
        throw new Error(`args is not an effective array or string`)
    }
    if (isestr(args)) {
        args = [args]
    }

    //mode
    // spawn: 非同步執行命令，適合處理大量資料或長時間執行的程式，輸出以串流方式處理。spawnSync 為 spawn 的同步版本。
    // exec: 在 shell 中非同步執行命令，輸出被緩衝，適合輸出量較小的情況。execSync 為 exec 的同步版本。
    // execFile: 直接執行可執行檔案，不經過 shell，非同步執行，適合執行已知的可執行檔案。execFileSync 為 execFile 的同步版本。
    let mode = get(opt, 'mode')
    if (mode !== 'spawn' && mode !== 'exec' && mode !== 'execFile') {
        mode = 'spawn'
    }
    // console.log('mode',mode)

    //cbStdout
    let cbStdout = get(opt, 'cbStdout')

    //cbStderr
    let cbStderr = get(opt, 'cbStderr')

    //codeCmd
    let codeCmd = get(opt, 'codeCmd')
    if (!isestr(codeCmd)) {
        codeCmd = 'utf8'
    }

    //useChcp
    let useChcp = get(opt, 'useChcp')
    if (!isbol(useChcp)) {
        useChcp = false
    }

    //timeout
    let timeout = get(opt, 'timeout')
    if (!isnum(timeout) || timeout <= 0) {
        timeout = null
    }

    //pm
    let pm = genPm()

    //check
    if (!arrHas(mode, ['spawn', 'exec', 'execFile'])) {
        pm.reject(`invalid mode[${mode}]`)
        return pm
    }

    //r, cmsg
    let r = null
    let cmsg = ''
    // let cout = ''
    // let cerr = ''
    try {
        if (mode === 'spawn') {
            // console.log('mode',mode)
            let cr = strleft(prog, 1)
            let cl = strright(prog, 1)
            if (cr === `"` || cl === `"` || cr === `'` || cl === `'`) {
                throw new Error('prog of spawn doens not need to add quotes')
            }
            r = cp.spawn(prog, args, {
                windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                // encoding: codeCmd, //spawn無encoding, 因輸出是buffer無法指定, encoding只能用於exec/execFile
                shell: false,
            }) //spwan的prog與args內檔案, 都不需要用單/雙引號括住, 已內建處理機制, 額外添加單/雙引號會導致錯誤
        }
        else if (mode === 'exec') {
            // console.log('mode',mode)
            let cpre = ''
            if (useChcp) {
                cpre = `cmd /c chcp 65001>nul &&`
            }
            // console.log(`${cpre} ${prog} ${args.join(' ')} & exit`)
            r = cp.exec(`${cpre} ${prog} ${args.join(' ')} & exit`, {
                windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                encoding: codeCmd,
            })
        }
        else if (mode === 'execFile') {
            // console.log('mode',mode)
            r = cp.execFile(prog, args, {
                windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                encoding: codeCmd,
            })
        }
    }
    catch (err) {
        pm.reject(err)
        return pm
    }

    //stdout data
    r.stdout.on('data', (data) => {
        // console.log('stdout chunk:', data.toString())

        //cdata
        let cdata = ''
        if (mode === 'spawn') {
            cdata = data.toString(codeCmd)
        }
        else {
            cdata = data.toString()
        }

        //megre
        // cout += cdata + '\n'
        cmsg += cdata + '\n'

        //cbStdout
        if (isfun(cbStdout)) {
            cbStdout(cdata)
        }

    })

    //stderr data, 太多程式把warning或log輸出到stderr, 已無法視為有err發生
    r.stderr.on('data', (data) => {
        // console.error('stderr chunk:', data.toString())

        //cdata
        let cdata = ''
        if (mode === 'spawn') {
            cdata = data.toString(codeCmd)
        }
        else {
            cdata = data.toString()
        }

        //megre
        // cerr += cdata + '\n'
        cmsg += cdata + '\n'

        //cbStderr
        if (isfun(cbStderr)) {
            cbStderr(cdata)
        }

    })

    // //exit, 會比close先觸發故不使用
    // r.on('exit', (code) => {
    //     // console.log('exit code', code)
    // })

    //timer, 若有設定timeout, 逾時觸發時調用execProcessKillPid殺整棵程序樹
    let timer = null
    let bTimeout = false
    if (timeout !== null) {
        timer = setTimeout(() => {
            bTimeout = true
            if (r && r.pid) {
                //fire-and-forget, 殺掉子進程後close/error事件會接著觸發, 由bTimeout決定reject訊息
                execProcessKillPid(r.pid)
                    .catch(() => {}) //pid可能已結束, 忽略error
            }
        }, timeout)
    }

    //close
    r.on('close', (code) => {
        // console.log('close code', code)
        if (timer !== null) {
            clearTimeout(timer)
        }
        if (bTimeout) {
            pm.reject(`timeout[${timeout}ms]:\n${cmsg}`)
        }
        else if (code !== 0) {
            pm.reject(`code[${code}]:\n${cmsg}`)
        }
        else {
            pm.resolve(cmsg)
        }
    })

    //error, 監聽(例如執行spawn本身)錯誤訊息, 可能為'找不到可執行檔','權限不足','系統資源用盡'等
    r.on('error', (err) => {
        if (timer !== null) {
            clearTimeout(timer)
        }
        pm.reject(err)
    })

    return pm
}


export default execProcess
