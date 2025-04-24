import cp from 'child_process'
import iconv from 'iconv-lite'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'


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
 *     let prog = 'prog.exe'
 *     let args = 'input'
 *     execProcess(prog, args)
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 * if (true) {
 *     let prog = `"C:\\Program Files\\7-Zip\\7z.exe"`
 *     let pw = 'AbcD1234'
 *     let args = `a aaa.7z aaa.txt -p${pw}`
 *     execProcess(prog, args)
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

    //cbStdout
    let cbStdout = get(opt, 'cbStdout')

    //cbStderr
    let cbStderr = get(opt, 'cbStderr')

    //codeCmd
    let codeCmd = get(opt, 'codeCmd')
    if (!isestr(codeCmd)) {
        codeCmd = 'big5'
    }

    return new Promise(function(resolve, reject) {
        let msg = ''

        //spawn: 非同步執行命令，適合處理大量資料或長時間執行的程式，輸出以串流方式處理。spawnSync 為 spawn 的同步版本。
        //exec: 在 shell 中非同步執行命令，輸出被緩衝，適合輸出量較小的情況。execSync 為 exec 的同步版本。
        //execFile: 直接執行可執行檔案，不經過 shell，非同步執行，適合執行已知的可執行檔案。execFileSync 為 execFile 的同步版本。

        //exec
        //不能用同步版execSync, 須提供cpu控制權給調用端, 才能驅動例如偵測檔案等進行額外顯示
        //執行程序時會使用當前作業系統語系, 故回傳時得要依照當前語系進行指定解碼, 才不會有亂碼
        let r = cp.exec(`${prog} ${args}`, { encoding: 'buffer' }, (err, stdout, stderr) => {
            // console.log('stdout', stdout)
            // console.log('stderr', stderr)
            if (err) {
                return reject(err)
            }

            try {
                stdout = iconv.decode(stdout, codeCmd)
            }
            catch (err) {}
            try {
                stderr = iconv.decode(stderr, codeCmd)
            }
            catch (err) {}

            //stderr, 若stderr與stdout同時有, 則先添加stderr再添加stdout
            if (isestr(stderr)) {
                // console.log('stderr', stderr)
                msg += stderr
            }

            //stdout
            if (isestr(stdout)) {
                // console.log('stdout', stdout)
                msg += stdout
            }

        })

        // //exit, 會比close先觸發
        // r.on('exit', (code) => {
        //     // console.log('exit code', code)
        // })

        //close
        r.on('close', (code) => {
            // console.log('close code', code)
            resolve(msg)
        })

        //cbStdout
        if (isfun(cbStdout)) {
            r.stdout.on('data', function (data) {
                data = iconv.decode(data, codeCmd)
                // console.log('stdout', data)
                cbStdout(data)
            })
        }

        //cbStderr
        if (isfun(cbStderr)) {
            r.stderr.on('data', function (data) {
                data = iconv.decode(data, codeCmd)
                // console.log('stderr', data)
                cbStderr(data)
            })
        }

    })
}


export default execProcess
