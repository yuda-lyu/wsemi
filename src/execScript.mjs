import cp from 'child_process'
import isarr from './isarr.mjs'


/**
 * 呼叫執行檔或程式語言prog執行scp腳本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execScript.test.js Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串, 若為註冊系統的全域指令, 例如可直接給'Python', 腳本需自行接收呼叫引數, 並將回傳資料轉json字串後print/log到dos視窗, 即可由nodejs接收
 * @param {String|Array} scp 輸入腳本檔案位置字串或參數
 * @returns {*} 回傳任意資料
 * @example
 * //need test in nodejs
 * let prog = 'python'
 * let scp = 'fun.py'
 * let pa = 'sin'
 * let pb = '12'
 * let pc = '34.56'
 * execScript(prog, [scp, pa, pb, pc])
 *     .then(function(data) {
 *         console.log('then', data)
 *     })
 *     .catch(function(data) {
 *         console.log('catch', data)
 *     })
 *
 * let prog = 'prog.exe'
 * let arg = 'input'
 * execScript(prog, arg)
 *     .then(function(data) {
 *         console.log('then', data)
 *     })
 *     .catch(function(data) {
 *         console.log('catch', data)
 *     })
 */
function execScript(prog, args) {
    return new Promise(function(resolve, reject) {

        //check
        if (!isarr(args)) {
            args = [args]
        }

        //spawn
        let process = cp.spawn(prog, args)

        //rOut
        let rOut = ''
        process.stdout.on('data', function(data) {
            //console.log('stdout data', data)
            rOut += data.toString('utf8')
        })
        // process.stdout.on('end', function() {
        //     console.log('stdout end', rOut)
        //     resolve(rOut)
        // })

        //rError
        let rError = ''
        process.stderr.on('data', function(data) {
            //console.log('stderr data', data)
            rError += data.toString('utf8')
        })
        // process.stderr.on('end', function() { //有可能無錯誤但監聽到stderr end事件, 進而導致回傳錯誤又無錯誤數據, 改統一使用process close處理回傳數據與狀態
        //     console.log('stderr end', rError)
        //     reject(rError)
        // })

        process.on('close', function (code) {
            if (rOut) {
                resolve(rOut)
            }
            else if (rError) {
                reject(rError)
            }
            else {
                reject(`process is aborted unexpectedly with code ${code}`) //無任何數據回傳但程序被強制中止
            }
        })

    })
}


export default execScript
