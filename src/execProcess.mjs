import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import cp from 'child_process'
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

    function toUtf8(c) {
        try {
            return c.toString('utf8')
        }
        catch (err) {}
        return ''
    }

    return new Promise(function(resolve, reject) {
        let msg = ''

        //exec
        let r = cp.exec(`${prog} ${args}`, (err, stdout, stderr) => {
            // console.log('stdout', stdout)
            // console.log('stderr', stderr)
            if (err) {
                return reject(err)
            }

            //stdout
            stdout = toUtf8(stdout)
            if (isestr(stdout)) {
                // console.log('stdout', stdout)
                msg += stdout
            }

            //stderr
            stderr = toUtf8(stderr)
            if (isestr(stderr)) {
                // console.log('stderr', stderr)
                msg += stderr
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
                // console.log('stdout', data)
                cbStdout(data)
            })
        }

        //cbStderr
        if (isfun(cbStderr)) {
            r.stderr.on('data', function (data) {
                // console.log('stderr', data)
                cbStderr(data)
            })
        }

    })
}


export default execProcess
