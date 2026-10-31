import xxhashWasm from 'xxhash-wasm'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import errToStr from './_errToStr.mjs'
import optVal from './_optVal.mjs'


//chunkSize: opt類參數, 有效整數且為個數(iseint, use: 'count', 1~2^30), 非預期改用預設64mb
//  下限: 0時串流不讀任何資料即end而得空內容之雜湊(偽成功), 負數與小數則createReadStream拋highWaterMark錯誤
//  上限2^30(1gb, 同Node之Readable.read(n)之上限1GiB): Node 24實測highWaterMark為2^31時只發open即永久懸置, 2^32時不讀資料即end而得空內容之雜湊(偽成功), 2^53以上(含Infinity)則reject RangeError
let RULE_CHUNK_SIZE = { fn: 'fsGetFileXxHashCore', name: 'opt.chunkSize', kind: 'eint', chk: { use: 'count', min: 1, max: 2 ** 30 } }


/**
 * 後端nodejs計算檔案xxHash64值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileXxHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number|String} [opt.chunkSize=64*1024*1024] 輸入切片長度，單位位元，opt類參數(有效整數，1~2^30即1024*1024*1024即1gb，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、0、負數、小數、超過上限、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設64*1024*1024(64mb)
 * @param {Boolean} [opt.debug=false] 輸入是否於chunkSize為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileXxHash
 *
 */
async function fsGetFileXxHashCore(fp, opt = {}) {

    //pm
    let pm = genPm()

    //stream無法被try catch, 此處是攔截stream以外錯誤; 讀取opt與前置檢查亦置於try內(opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 注入之fs之lstatSync可拋出任意值, 於async函數內未捕捉即以Error物件reject)
    try {

        //fs
        let fs = get(opt, 'fs')

        //chunkSize, opt類參數(預設64mb), 須為有效整數且為1~2^30, 非預期(含Infinity、0、負數、小數、超過上限)視為未給、改用預設
        let chunkSize = optVal(get(opt, 'chunkSize'), 64 * 1024 * 1024, RULE_CHUNK_SIZE, opt)

        //check
        if (!fsIsFileCore(fp, { fs })) {
            pm.reject(`fp is not a file`)
            return pm
        }

        //hasher
        let { create64 } = await xxhashWasm()
        let hasher = create64()

        //calc hash
        let stream = fs.createReadStream(fp, { highWaterMark: chunkSize })

        //fail, 監聽器內出錯(注入之fs所產串流之data可為非Buffer之值使hasher.update拋錯): 轉字串reject並銷毀串流, 監聽器內未保護之呼叫拋錯即成未捕捉例外且pm不settle
        let fail = (err) => {
            pm.reject(errToStr(err))
            try {
                stream.destroy()
            }
            catch (e) {}
        }

        stream.on('data', (chunk) => {
            try {
                hasher.update(chunk)
            }
            catch (err) {
                fail(err)
            }
        })
        stream.on('end', () => {
            try {
                let hash = hasher.digest().toString(16).padStart(16, '0')
                pm.resolve(hash)
            }
            catch (err) {
                fail(err)
            }
        })
        stream.on('error', (err) => {
            pm.reject(errToStr(err)) //與fsGetFileBasicHashCore一致, 串流以任意值(含null、undefined)出錯皆轉字串
        })

    }
    catch (err) {
        pm.reject(errToStr(err)) //注入之fs與第三方wasm載入可拋出任意值
    }

    return pm
}


export default fsGetFileXxHashCore
