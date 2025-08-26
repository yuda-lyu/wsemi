import cp from 'child_process'
import get from 'lodash-es/get.js'
import isearr from './isearr.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import genPm from './genPm.mjs'
import strleft from './strleft.mjs'
import strright from './strright.mjs'


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

    //pm
    let pm = genPm()

    //cmsg, cerr
    let cmsg = ''
    let cerr = ''

    //r
    let r = null
    if (mode === 'spawn') {
        // console.log('mode',mode)
        let cr = strleft(prog, 1)
        let cl = strright(prog, 1)
        if (cr === `"` || cl === `"` || cr === `'` || cl === `'`) {
            throw new Error('prog of spawn doens not need to add quotes')
        }
        r = cp.spawn(prog, args, {
            windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
            encoding: codeCmd,
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
    else {
        throw new Error(`invalid mode[${mode}]`)
    }

    //stdout data
    r.stdout.on('data', (data) => {
        // console.log('stdout chunk:', data.toString().trim())

        //cdata
        let cdata = data.toString().trim()

        //megre
        cmsg += cdata + '\n'

        //cbStdout
        if (isfun(cbStdout)) {
            cbStdout(cdata)
        }

    })

    //stderr data
    r.stderr.on('data', (data) => {
        // console.error('stderr chunk:', data.toString().trim())

        //cdata
        let cdata = data.toString().trim()

        //megre
        cerr += cdata + '\n'

        //cbStderr
        if (isfun(cbStderr)) {
            cbStderr(cdata)
        }

    })

    // //exit, 會比close先觸發故不使用
    // r.on('exit', (code) => {
    //     // console.log('exit code', code)
    // })

    //close
    r.on('close', (code) => {
        // console.log('close code', code)
        // if (code !== 0) {
        //     pm.reject(`code=${code} and stderr='${cerr}'`)
        // }
        // else if(isestr(cerr)){
        //     pm.reject(cerr)
        // }
        if (isestr(cerr)) {
            pm.reject(cerr)
        }
        else {
            pm.resolve(cmsg)
        }
    })

    //error, 監聽(例如執行spawn本身)錯誤訊息, 可能為'找不到可執行檔','權限不足','系統資源用盡'等
    r.on('error', (err) => {
        pm.reject(err)
    })

    return pm
}


export default execProcess
