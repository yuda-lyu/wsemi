import xxhashWasm from 'xxhash-wasm'
import get from 'lodash-es/get.js'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


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
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入切片長度數字，單位位元，預設64*1024*1024(64mb)
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

    //chunkSize
    let chunkSize = get(opt, 'chunkSize')
    if (!isnum(chunkSize)) {
        chunkSize = 64 * 1024 * 1024 //64mb
    }
    chunkSize = cdbl(chunkSize)

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
