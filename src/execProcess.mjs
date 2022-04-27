import cp from 'child_process'
import isestr from './isestr.mjs'


/**
 * 呼叫執行檔執行
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcess.test.mjs Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串, 若為註冊系統的全域指令, 例如可直接給'Python', 腳本需自行接收呼叫引數, 並將回傳資料轉json字串後print/log到dos視窗, 即可由nodejs接收
 * @param {String|Array} args 輸入腳本檔案位置字串或參數
 * @returns {*} 回傳任意資料
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
function execProcess(prog, args) {

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

    })
}


export default execProcess
