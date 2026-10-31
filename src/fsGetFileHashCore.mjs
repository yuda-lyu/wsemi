import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import isestr from './isestr.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFileXxHashCore from './fsGetFileXxHashCore.mjs'
import errToStr from './_errToStr.mjs'
import optVal from './_optVal.mjs'


//chunkSize: opt類參數, 有效整數且為個數(iseint, use: 'count', 1~2^30, 同fsGetFileXxHashCore), 非預期改用預設64mb; 於此即判定並改用預設, 傳給fsGetFileXxHashCore者為解析後之值
let RULE_CHUNK_SIZE = { fn: 'fsGetFileHashCore', name: 'opt.chunkSize', kind: 'eint', chk: { use: 'count', min: 1, max: 2 ** 30 } }


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'
 * @param {Number|String} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法字串為'xxhash64'時，使用切片長度，單位位元，opt類參數(有效整數，1~2^30即1024*1024*1024即1gb，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、0、負數、小數、超過上限、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設64*1024*1024(64mb)
 * @param {Boolean} [opt.debug=false] 輸入是否於chunkSize為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileHash
 *
 */
function fsGetFileHashCore(fp, opt = {}) {

    //pm
    let pm = genPm()

    //讀取opt與check, 本函數非async, opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出與注入之fs之lstatSync拋錯須於此攔截, 否則成同步拋錯
    let fs = null
    let crypto = null
    let type = ''
    let chunkSize = 0
    let isFile = false
    try {

        //fs, crypto
        fs = get(opt, 'fs')
        crypto = get(opt, 'crypto')

        //type
        type = get(opt, 'type', '')
        if (!isestr(type)) {
            type = 'sha512'
        }

        //chunkSize, opt類參數(預設64mb), 須為有效整數且為1~2^30, 非預期(含Infinity、0、負數、小數、超過上限)視為未給、改用預設
        chunkSize = optVal(get(opt, 'chunkSize'), 64 * 1024 * 1024, RULE_CHUNK_SIZE, opt)

        //check
        isFile = fsIsFileCore(fp, { fs })

    }
    catch (err) {
        pm.reject(errToStr(err))
        return pm
    }
    if (!isFile) {
        pm.reject(`fp[${fp}] is not a file`)
        return pm
    }

    if (type === 'xxhash64') {
        return fsGetFileXxHashCore(fp, { fs, chunkSize })
    }
    else {
        return fsGetFileBasicHashCore(fp, { fs, crypto, type })
    }

}


export default fsGetFileHashCore
