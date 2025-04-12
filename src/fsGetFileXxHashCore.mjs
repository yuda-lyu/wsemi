import xxhashWasm from 'xxhash-wasm'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'


/**
 * 後端nodejs計算檔案xxHash64值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileXxHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入切片長度數字，單位位元，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileXxHash
 *
 */
async function fsGetFileXxHashCore(fp, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //chunkSize
    let chunkSize = get(opt, 'chunkSize')
    if (!isnum(chunkSize)) {
        chunkSize = 64 * 1024 * 1024 //64mb
    }
    chunkSize = cdbl(chunkSize)

    //check
    if (!fsIsFileCore(fp, { fs })) {
        return Promise.reject(`fp is not a file`)
    }

    //pm
    let pm = genPm()

    //stream無法被try catch, 此處是攔截stream以外錯誤
    try {

        //hasher
        let { create64 } = await xxhashWasm()
        let hasher = create64()

        //calc hash
        let stream = fs.createReadStream(fp, { highWaterMark: chunkSize })
        stream.on('data', chunk => {
            hasher.update(chunk)
        })
        stream.on('end', () => {
            let hash = hasher.digest().toString(16).padStart(16, '0')
            pm.resolve(hash)
        })
        stream.on('error', pm.reject)

    }
    catch (err) {
        pm.reject(err.toString())
    }

    return pm
}


export default fsGetFileXxHashCore
