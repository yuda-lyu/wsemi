import xxhashWasm from 'xxhash-wasm'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs計算檔案xxHash64值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileXxHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入切片長度數字，單位位元，上限2^30(1024*1024*1024，1gb)，非正整數(0、負數、小數、非數字)或超過上限時使用預設值，預設64*1024*1024(64mb)
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

        //chunkSize
        let chunkSize = get(opt, 'chunkSize')
        if (!ispint(chunkSize)) {
            chunkSize = 64 * 1024 * 1024 //64mb, 非正整數一律用預設: 0時串流不讀任何資料即end而得空內容之雜湊(偽成功), 負數與小數則createReadStream拋highWaterMark錯誤
        }
        chunkSize = cint(chunkSize)
        if (chunkSize > 2 ** 30) {
            chunkSize = 64 * 1024 * 1024 //超過上限2^30(1gb, 同Node之Readable.read(n)之上限1GiB)用預設: Node 24實測highWaterMark為2^31時只發open即永久懸置, 2^32時不讀資料即end而得空內容之雜湊(偽成功), 2^53以上(含Infinity)則reject RangeError
        }

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
