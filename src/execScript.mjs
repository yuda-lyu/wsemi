import cp from 'child_process'
import concat from 'lodash/concat'


/**
 * 呼叫執行檔或程式語言prog執行scp腳本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execScript.test.js Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串, 若為註冊系統的全域指令, 例如可直接給'Python', 腳本需自行接收呼叫引數, 並將回傳資料轉json字串後print/log到dos視窗, 即可由nodejs接收
 * @param {String|Array} scp 輸入腳本檔案位置字串或參數
 * @returns {*} 回傳任意資料
 * @example
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

        //spawn
        let process = cp.spawn(prog, args)

        //result
        process.stdout.on('data', function(data) {
            data = data.toString('utf8')
            resolve(data)
        })

        //reject
        process.stderr.on('data', function(data) {
            data = data.toString('utf8')
            reject(data)
        })

    })
}


export default execScript
