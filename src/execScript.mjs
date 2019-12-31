import cp from 'child_process'
import isarr from './isarr.mjs'


//nodejs 12.14時stdout on data會收到奇怪符號, 原因未知, 先通過判斷是否為utf8剔除, 也就是程序輸出入皆限定為utf8即可, 但建議避免直接傳中文改編碼成base64再傳
function isUtf8(buf) {
    //from https://github.com/hcodes/isutf8/

    //check
    if (!buf) {
        return false
    }

    //check
    let i = 0
    let len = buf.length
    while (i < len) {
        // UTF8-1 = %x00-7F
        if (buf[i] <= 0x7F) {
            i++

            continue
        }

        // UTF8-2 = %xC2-DF UTF8-tail
        if (buf[i] >= 0xC2 && buf[i] <= 0xDF) {
            // if(buf[i + 1] >= 0x80 && buf[i + 1] <= 0xBF) {
            if (buf[i + 1] >> 6 === 2) {
                i += 2

                continue
            }
            else {
                return false
            }
        }

        // UTF8-3 = %xE0 %xA0-BF UTF8-tail
        // UTF8-3 = %xED %x80-9F UTF8-tail
        if (
            (
                (buf[i] === 0xE0 && buf[i + 1] >= 0xA0 && buf[i + 1] <= 0xBF) ||
                    (buf[i] === 0xED && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x9F)
            ) && buf[i + 2] >> 6 === 2
        ) {
            i += 3

            continue
        }

        // UTF8-3 = %xE1-EC 2( UTF8-tail )
        // UTF8-3 = %xEE-EF 2( UTF8-tail )
        if (
            (
                (buf[i] >= 0xE1 && buf[i] <= 0xEC) ||
                    (buf[i] >= 0xEE && buf[i] <= 0xEF)
            ) &&
                buf[i + 1] >> 6 === 2 &&
                buf[i + 2] >> 6 === 2
        ) {
            i += 3

            continue
        }

        // UTF8-4 = %xF0 %x90-BF 2( UTF8-tail )
        //          %xF1-F3 3( UTF8-tail )
        //          %xF4 %x80-8F 2( UTF8-tail )
        if (
            (
                (buf[i] === 0xF0 && buf[i + 1] >= 0x90 && buf[i + 1] <= 0xBF) ||
                    (buf[i] >= 0xF1 && buf[i] <= 0xF3 && buf[i + 1] >> 6 === 2) ||
                    (buf[i] === 0xF4 && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x8F)
            ) &&
            buf[i + 2] >> 6 === 2 &&
            buf[i + 3] >> 6 === 2
        ) {
            i += 4

            continue
        }

        return false
    }

    return true
}


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
        let bOut = []
        process.stdout.on('data', function(data) {
            // console.log('stdout data', data)
            // console.log('isUtf8', isUtf8(data))
            // console.log('to ascii', data.toString('ascii'))
            // console.log('to b64', data.toString('base64'))
            // console.log('to utf8', data.toString('utf8'))
            if (isUtf8(data)) {
                bOut.push(data)
            }
        })
        // process.stdout.on('end', function() {
        //     console.log('stdout end', rOut)
        //     resolve(rOut)
        // })

        //rError
        let bError = []
        process.stderr.on('data', function(data) {
            // console.log('stderr data', data)
            if (isUtf8(data)) {
                bError.push(data)
            }
        })
        // process.stderr.on('end', function() { //有可能無錯誤但監聽到stderr end事件, 進而導致回傳錯誤又無錯誤數據, 改統一使用process close處理回傳數據與狀態
        //     console.log('stderr end', rError)
        //     reject(rError)
        // })

        process.on('close', function (code) {
            if (bOut.length > 0) {
                let b = Buffer.concat(bOut)
                let s = b.toString('utf8')
                resolve(s)
            }
            else if (bError.length > 0) {
                let b = Buffer.concat(bError)
                let s = b.toString('utf8')
                reject(s)
            }
            else {
                reject(`process is aborted unexpectedly with code ${code}`) //無任何數據回傳但程序被強制中止
            }
        })

    })
}


export default execScript
