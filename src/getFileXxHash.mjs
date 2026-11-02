import xxhashWasm from 'xxhash-wasm'
import get from 'lodash-es/get.js'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'
import optVal from './_optVal.mjs'


//chunkSize: opt類參數, 有效整數且為個數(iseint, use: 'count', 1~2^30, 同fsGetFileXxHashCore), 非預期改用預設64mb
let RULE_CHUNK_SIZE = { fn: 'getFileXxHash', name: 'opt.chunkSize', kind: 'eint', chk: { use: 'count', min: 1, max: 2 ** 30 } }


/**
 * 計算檔案xxHash64值
 *
 * 瀏覽器端輸入檔案Blob或File，可支援大檔
 *
 * 因Node.js亦已支援Blob，可用new Blob([fs.readFileSync(fp)])取得Blob做為輸入
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileXxHash.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} inp 輸入檔案Blob或File
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number|String} [opt.chunkSize=64*1024*1024] 輸入切片長度，單位位元，opt類參數(有效整數，1~2^30即1024*1024*1024即1gb，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、0、負數、小數、超過上限、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設64*1024*1024(64mb)，雜湊結果不因chunkSize而不同
 * @param {Boolean} [opt.debug=false] 輸入是否於chunkSize為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 * @example
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_getFileXxHash'
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
 *     let h1 = await getFileXxHash(bb)
 *     console.log('getFileXxHash', h1)
 *     ms.push({ 'getFileXxHash': h1 })
 *
 *     let h2 = await getFileXxHash(bb, { chunkSize: 16 * 1024 * 1024 })
 *     console.log('getFileXxHash(chunkSize=16mb)', h2)
 *     ms.push({ 'getFileXxHash(chunkSize=16mb)': h2 })
 *
 *     let h3 = await getFileXxHash(bb, { chunkSize: 4 * 1024 * 1024 })
 *     console.log('getFileXxHash(chunkSize=4mb)', h3)
 *     ms.push({ 'getFileXxHash(chunkSize=4mb)': h3 })
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
 * // getFileXxHash feba48465b833ca1
 * // getFileXxHash(chunkSize=16mb) feba48465b833ca1
 * // getFileXxHash(chunkSize=4mb) feba48465b833ca1
 * // ms [
 * //   { getFileXxHash: 'feba48465b833ca1' },
 * //   { 'getFileXxHash(chunkSize=16mb)': 'feba48465b833ca1' },
 * //   { 'getFileXxHash(chunkSize=4mb)': 'feba48465b833ca1' }
 * // ]
 *
 */
async function getFileXxHash(inp, opt = {}) {

    //check
    if (!isblob(inp) && !isfile(inp)) {
        console.log('inp', inp)
        return Promise.reject(`inp is not a Blob or File`)
    }

    //chunkSize, opt類參數(預設64mb), 須為有效整數且為1~2^30, 非預期(含Infinity、0、負數、小數、超過上限)視為未給、改用預設; 0或負數會使切片不前進而不終止
    let chunkSize = optVal(get(opt, 'chunkSize'), 64 * 1024 * 1024, RULE_CHUNK_SIZE, opt)

    //hasher
    let { create64 } = await xxhashWasm()
    let hasher = create64() //create32()

    //calc hash
    let offset = 0
    while (offset < inp.size) {
        let chunk = inp.slice(offset, offset + chunkSize)
        let buffer = await chunk.arrayBuffer()
        hasher.update(new Uint8Array(buffer))
        offset += chunkSize
        // await new Promise(r => setTimeout(r, 0)) // 讓 UI 有機會更新
    }
    let hash = hasher.digest().toString(16).padStart(16, '0')

    return hash
}


export default getFileXxHash
