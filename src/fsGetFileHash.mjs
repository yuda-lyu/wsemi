import fs from 'fs'
import crypto from 'crypto'
import genPm from './genPm.mjs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案位置
 * @param {String} [type='sha512'] 輸入檔案位置
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 */
function fsGetFileHash(fp, type = 'sha512') {

    //pm
    let pm = genPm()

    //check
    if (!fsIsFile(fp)) {
        pm.reject(`路徑[${fp}]非檔案`)
    }

    try {

        //createHash
        let hash = crypto.createHash(type)

        //createReadStream
        let input = fs.createReadStream(fp)

        //readable
        input.on('readable', () => {
            let data = input.read()
            if (data) {
                hash.update(data)
            }
            else {
                pm.resolve(hash.digest('hex'))
            }
        })

        //error
        input.on('error', (err) => {
            pm.reject(err.toString())
        })

    }
    catch (err) {
        pm.reject(err.toString())
    }

    return pm
}


export default fsGetFileHash
