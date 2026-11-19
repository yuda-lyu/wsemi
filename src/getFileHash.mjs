import get from 'lodash-es/get.js'
// import isnum from './isnum.mjs'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'
// import cdbl from './cdbl.mjs'
import getFileBasicHash from './getFileBasicHash.mjs'
import getFileXxHash from './getFileXxHash.mjs'
import chkHashType from './_chkHashType.mjs'


/**
 * 計算檔案HASH值
 *
 * 瀏覽器端輸入檔案Blob或File，可支援大檔
 *
 * 因Node.js亦已支援Blob，可用new Blob([fs.readFileSync(fp)])取得Blob做為輸入
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} inp 輸入檔案Blob或File
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為'MD5'、'SHA-1'、'SHA-256'、'SHA-384'、'SHA-512'、'md5'、'sha1'、'sha256'、'sha384'、'sha512'、'xxhash64'之一(原始字串，包裝物件、數字、空字串、原型鏈名稱如'constructor'皆無效)，無效時reject說明字串'invalid opt.type: must be one of ...'(不帶輸入值)，不改用預設
 * @param {Number|String} [opt.chunkSize=64*1024*1024] 輸入計算時使用之切片長度，單位位元，由getFileXxHash(type為'xxhash64')或getFileBasicHash(其他type)解析，opt類參數(有效整數，1~2^30即1024*1024*1024即1gb，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、0、負數、小數、超過上限、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設64*1024*1024(64mb)，雜湊結果不因chunkSize而不同
 * @param {Boolean} [opt.debug=false] 輸入是否於chunkSize為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 * @example
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_getFileHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     fsWriteText(fp, 'xyz')
 *
 *     let ab = fs.readFileSync(fp)
 *     let bb = new Blob([ab])
 *
 *     let h1 = await getFileHash(bb)
 *     console.log('getFileHash(sha512)', h1)
 *     ms.push({ 'getFileHash(sha512)': h1 })
 *
 *     let h2 = await getFileHash(bb, { type: 'sha256' })
 *     console.log('getFileHash(sha256)', h2)
 *     ms.push({ 'getFileHash(sha256)': h2 })
 *
 *     let h3 = await getFileHash(bb, { type: 'xxhash64' })
 *     console.log('getFileHash(xxhash64)', h3)
 *     ms.push({ 'getFileHash(xxhash64)': h3 })
 *
 *     let h4 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
 *     console.log('getFileHash(xxhash64,chunkSize=16mb)', h4)
 *     ms.push({ 'getFileHash(xxhash64,chunkSize=16mb)': h4 })
 *
 *     let h5 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
 *     console.log('getFileHash(xxhash64,chunkSize=4mb)', h5)
 *     ms.push({ 'getFileHash(xxhash64,chunkSize=4mb)': h5 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // getFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // getFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // getFileHash(xxhash64) feba48465b833ca1
 * // getFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
 * // getFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
 * // ms [
 * //   {
 * //     'getFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'getFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   },
 * //   { 'getFileHash(xxhash64)': 'feba48465b833ca1' },
 * //   { 'getFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
 * //   { 'getFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
 * // ]
 *
 */
async function getFileHash(inp, opt = {}) {

    //check
    if (!isblob(inp) && !isfile(inp)) {
        return Promise.reject('invalid inp: must be a Blob or a File')
    }

    //type, 未給(undefined、null)取預設, 給了須通過檢核(安全相關opt, 無效即拒絕不改用預設, 見下)
    let type = get(opt, 'type')

    //chunkSize, 本函數未使用此區域變數(opt原樣轉交下游, 由getFileBasicHash與getFileXxHash各自解析chunkSize), 先註解保留以免日後需要時重寫
    // let chunkSize = get(opt, 'chunkSize')
    // if (!isnum(chunkSize)) {
    //     chunkSize = 64 * 1024 * 1024 //64mb
    // }
    // chunkSize = cdbl(chunkSize)

    //kp
    let kp = {
        'MD5': 'md5',
        'SHA-1': 'sha1',
        'SHA-256': 'sha256',
        'SHA-384': 'sha384',
        'SHA-512': 'sha512',
        'md5': 'md5',
        'sha1': 'sha1',
        'sha256': 'sha256',
        'sha384': 'sha384',
        'sha512': 'sha512',
        'xxhash64': 'xxhash64',
    }

    //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 不改用預設; 成員比對不經物件鍵查找('constructor'、'toString'等原型鏈名稱不被誤判為有效); 訊息不帶輸入值(V20)
    let msgType = chkHashType(type, { list: Object.keys(kp) })
    if (msgType) {
        return Promise.reject(msgType)
    }
    if (type === undefined || type === null) {
        type = 'sha512'
    }

    //檢核之值即使用之值(K4): 下游getFileBasicHash會再讀opt.type(opt.type可為getter, 兩次讀取值可不同而靜默改用另一演算法), 故以展開後覆寫type之物件轉交
    let optUse = { ...opt, type }

    if (type === 'xxhash64') {
        return getFileXxHash(inp, optUse)
    }
    else {
        return getFileBasicHash(inp, optUse)
    }
}


export default getFileHash
