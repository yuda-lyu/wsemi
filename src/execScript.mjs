import cp from 'child_process'
import get from 'lodash-es/get'
import filter from 'lodash-es/filter'
import map from 'lodash-es/map'
import join from 'lodash-es/join'
import isarr from './isarr.mjs'


// //nodejs 12.14時stdout on data會收到奇怪符號, 原因未知, 先通過判斷是否為utf8剔除, 也就是程序輸出入皆限定為utf8即可, 但建議避免直接傳中文改編碼成base64再傳
// function isUtf8(buf) {
//     //from https://github.com/hcodes/isutf8/

//     //check
//     if (!buf) {
//         return false
//     }

//     //check
//     let i = 0
//     let len = buf.length
//     while (i < len) {
//         // UTF8-1 = %x00-7F
//         if (buf[i] <= 0x7F) {
//             i++

//             continue
//         }

//         // UTF8-2 = %xC2-DF UTF8-tail
//         if (buf[i] >= 0xC2 && buf[i] <= 0xDF) {
//             // if(buf[i + 1] >= 0x80 && buf[i + 1] <= 0xBF) {
//             if (buf[i + 1] >> 6 === 2) {
//                 i += 2

//                 continue
//             }
//             else {
//                 return false
//             }
//         }

//         // UTF8-3 = %xE0 %xA0-BF UTF8-tail
//         // UTF8-3 = %xED %x80-9F UTF8-tail
//         if (
//             (
//                 (buf[i] === 0xE0 && buf[i + 1] >= 0xA0 && buf[i + 1] <= 0xBF) ||
//                     (buf[i] === 0xED && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x9F)
//             ) && buf[i + 2] >> 6 === 2
//         ) {
//             i += 3

//             continue
//         }

//         // UTF8-3 = %xE1-EC 2( UTF8-tail )
//         // UTF8-3 = %xEE-EF 2( UTF8-tail )
//         if (
//             (
//                 (buf[i] >= 0xE1 && buf[i] <= 0xEC) ||
//                     (buf[i] >= 0xEE && buf[i] <= 0xEF)
//             ) &&
//                 buf[i + 1] >> 6 === 2 &&
//                 buf[i + 2] >> 6 === 2
//         ) {
//             i += 3

//             continue
//         }

//         // UTF8-4 = %xF0 %x90-BF 2( UTF8-tail )
//         //          %xF1-F3 3( UTF8-tail )
//         //          %xF4 %x80-8F 2( UTF8-tail )
//         if (
//             (
//                 (buf[i] === 0xF0 && buf[i + 1] >= 0x90 && buf[i + 1] <= 0xBF) ||
//                     (buf[i] >= 0xF1 && buf[i] <= 0xF3 && buf[i + 1] >> 6 === 2) ||
//                     (buf[i] === 0xF4 && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x8F)
//             ) &&
//             buf[i + 2] >> 6 === 2 &&
//             buf[i + 3] >> 6 === 2
//         ) {
//             i += 4

//             continue
//         }

//         return false
//     }

//     return true
// }


/**
 * 呼叫執行檔或程式語言prog執行scp腳本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execScript.test.mjs Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串, 若為註冊系統的全域指令, 例如可直接給'Python', 腳本需自行接收呼叫引數, 並將回傳資料轉json字串後print/log到dos視窗, 即可由nodejs接收
 * @param {String|Array} args 輸入腳本檔案位置字串或參數
 * @returns {*} 回傳任意資料
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

    function toUtf8(c) {
        try {
            return c.toString('utf8')
        }
        catch (err) {}
        return ''
    }

    //execSync
    //execSync('"/path/to/test file/test.sh" arg1 arg2');
    // let res = cp.execSync(`${prog} ${cmd}`)
    // console.log('execSync res', res, res.toString(), toUtf8(res))

    //execFileSync
    //execFileSync('node', ['--version']
    // let res = cp.execFileSync(prog, [cmd])
    // console.log('execFileSync res', res, res.toString(), toUtf8(res))

    // //spawnSync
    // let res = cp.spawnSync(prog, [cmd])
    // console.log('spawnSync res', res)
    // each(res.output, (v) => {
    //     console.log('res output', toUtf8(v))
    // })

    return new Promise(function(resolve, reject) {

        //check
        if (!isarr(args)) {
            args = [args]
        }

        //spawnSync
        let res = cp.spawnSync(prog, args)
        // console.log('spawnSync res', res)
        let r = filter(res.output, (v) => {
            return v !== null
        })
        r = map(r, (v) => {
            return toUtf8(v)
        })
        let cstdout = join(r, '')
        let cstderr = get(res, 'error.message')
        // console.log('spawnSync stdout', cstdout)
        // console.log('spawnSync stderr', cstderr)
        if (cstderr) {
            reject(cstderr)
        }
        else {
            resolve(cstdout)
        }

    })
}


export default execScript
