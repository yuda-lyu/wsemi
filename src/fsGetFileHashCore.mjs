import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFileXxHashCore from './fsGetFileXxHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import optVal from './_optVal.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'


//chunkSize: opt類參數, 有效整數且為個數(iseint, use: 'count', 1~2^30, 同fsGetFileXxHashCore), 非預期改用預設64mb; 於此即判定並改用預設, 傳給fsGetFileXxHashCore者為解析後之值
let RULE_CHUNK_SIZE = { fn: 'fsGetFileHashCore', name: 'opt.chunkSize', kind: 'eint', chk: { use: 'count', min: 1, max: 2 ** 30 } }


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync(讀取串流之createReadStream於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing statSync, lstatSync'(不帶輸入值)
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash(opt.type為'xxhash64'時不需要)；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為'xxhash64'或crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be \'xxhash64\' or one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於讀檔(入口檢查)
 * @param {Number|String} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法字串為'xxhash64'時，使用切片長度，單位位元，opt類參數(有效整數，1~2^30即1024*1024*1024即1gb，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、0、負數、小數、超過上限、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設64*1024*1024(64mb)
 * @param {Boolean} [opt.debug=false] 輸入是否於chunkSize為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是檔案時reject說明字串'invalid fp: must be an existing file'；Node原生錯誤(讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileHash
 *
 */
function fsGetFileHashCore(fp, opt = {}) {

    //pm
    let pm = genPm()

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFp = chkFsPath(fp, 'fp')
    if (msgFp) {
        pm.reject(msgFp)
        return pm
    }

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

        //type, 未給(undefined、null)取預設, 給了須通過檢核(安全相關opt, 無效即拒絕不改用預設, 見下)
        type = get(opt, 'type')

        //chunkSize, opt類參數(預設64mb), 須為有效整數且為1~2^30, 非預期(含Infinity、0、負數、小數、超過上限)視為未給、改用預設
        chunkSize = optVal(get(opt, 'chunkSize'), 64 * 1024 * 1024, RULE_CHUNK_SIZE, opt)

        //check, 注入之fs缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷, 以說明字串reject(不帶輸入值); crypto僅非xxhash64時需要, 由fsGetFileBasicHashCore於相同訊息下檢查(xxhash64不經crypto)
        let msgDeps = chkFsDeps({ fs }, { fs: ['statSync', 'lstatSync'] })
        if (msgDeps) {
            pm.reject(msgDeps)
            return pm
        }

        //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 先於讀檔; 允許集合為'xxhash64'與注入之crypto.getHashes()
        let msgType = chkHashType(type, { crypto, xx: true })
        if (msgType) {
            pm.reject(msgType)
            return pm
        }
        if (type === undefined || type === null) {
            type = 'sha512'
        }

        //check, 非xxhash64之路徑需用crypto.createHash: 相依缺漏先於讀檔(含判斷檔案是否存在)回報, 與fsGetFileBasicHashCore同訊息同順序(R-FS-DEPS-01); xxhash64不經crypto, 不檢查
        if (type !== 'xxhash64') {
            let msgCrypto = chkFsDeps({ crypto }, { crypto: ['createHash'] })
            if (msgCrypto) {
                pm.reject(msgCrypto)
                return pm
            }
        }

        //check
        isFile = fsIsFileCore(fp, { fs })

    }
    catch (err) {
        pm.reject(fsErrMsg(err))
        return pm
    }
    if (!isFile) {
        pm.reject('invalid fp: must be an existing file')
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
