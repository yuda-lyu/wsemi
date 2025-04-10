import cp from 'child_process'
import isarr from './isarr.mjs'


/**
 * 呼叫執行檔或程式語言prog執行scp腳本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execScript.test.mjs Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串，若為註冊系統的全域指令，例如可直接給'Python'，腳本需自行接收呼叫引數，並將回傳資料轉json字串後print/log到dos視窗，即可由nodejs接收
 * @param {String|Array} args 輸入腳本檔案位置字串或參數
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * if(true){
 *     let prog = 'python'
 *     let scp = 'fun.py'
 *     let pa = 'sin'
 *     let pb = '12'
 *     let pc = '34.56'
 *     execScript(prog, [scp, pa, pb, pc])
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 * if(true){
 *     let prog = 'prog.exe'
 *     let args = 'input'
 *     execScript(prog, args)
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 * if(true){
 *     let prog = 'C:\\Program Files\\7-Zip\\7z.exe'
 *     let pw = 'AbcD1234'
 *     let args = ['a', 'aaa.7z', 'aaa.txt', '-p' + pw]
 *     execScript(prog, args)
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 */
function execScript(prog, args) {
    return new Promise(function(resolve, reject) {

        //check
        if (!isarr(args)) {
            args = [args]
        }

        //spawn: 非同步執行命令，適合處理大量資料或長時間執行的程式，輸出以串流方式處理。spawnSync 為 spawn 的同步版本。
        //exec: 在 shell 中非同步執行命令，輸出被緩衝，適合輸出量較小的情況。execSync 為 exec 的同步版本。
        //execFile: 直接執行可執行檔案，不經過 shell，非同步執行，適合執行已知的可執行檔案。execFileSync 為 execFile 的同步版本。

        //spawnSync
        let res = cp.spawnSync(prog, args, { encoding: 'utf8' })
        // console.log('spawnSync res', res)
        // let r = filter(res.output, (v) => {
        //     return v !== null
        // })
        // r = map(r, (v) => {
        //     return toUtf8(v)
        // })
        // let cstdout = join(r, '')
        // let cstderr = get(res, 'error.message')
        // console.log('stdout', cstdout)
        // console.log('stderr', cstderr)
        if (res.stderr) {
            // reject(cstderr)
            reject(res.stderr)
        }
        else {
            // resolve(cstdout)
            resolve(res.stdout)
        }

    })
}


export default execScript
