import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import isestr from './isestr.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileBasicHash
 *
 */
function fsGetFileBasicHashCore(fp, opt = {}) {

    //fs, crypto
    let fs = get(opt, 'fs')
    let crypto = get(opt, 'crypto')

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'sha512'
    }

    //pm
    let pm = genPm()

    //check
    if (!fsIsFileCore(fp, { fs })) {
        pm.reject(`fp[${fp}] is not a file`)
        return pm
    }

    //stream無法被try catch, 此處是攔截stream以外錯誤
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


export default fsGetFileBasicHashCore
