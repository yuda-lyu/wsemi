import fs from 'fs'
import crypto from 'crypto'
import fsGetFileHashCore from './fsGetFileHashCore.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法為'xxhash64'時，使用切片長度數字，單位位元，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsGetFileHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     fsWriteText(fp, 'xyz')
 *
 *     let h1 = await fsGetFileHash(fp)
 *     console.log('fsGetFileHash(sha512)', h1)
 *     ms.push({ 'fsGetFileHash(sha512)': h1 })
 *
 *     let h2 = await fsGetFileHash(fp, { type: 'sha256' })
 *     console.log('fsGetFileHash(sha256)', h2)
 *     ms.push({ 'fsGetFileHash(sha256)': h2 })
 *
 *     let h3 = await fsGetFileHash(fp, { type: 'xxhash64' })
 *     console.log('fsGetFileHash(xxhash64)', h3)
 *     ms.push({ 'fsGetFileHash(xxhash64)': h3 })
 *
 *     let h4 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
 *     console.log('fsGetFileHash(xxhash64,chunkSize=16mb)', h4)
 *     ms.push({ 'fsGetFileHash(xxhash64,chunkSize=16mb)': h4 })
 *
 *     let h5 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
 *     console.log('fsGetFileHash(xxhash64,chunkSize=4mb)', h5)
 *     ms.push({ 'fsGetFileHash(xxhash64,chunkSize=4mb)': h5 })
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
 * // fsGetFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // fsGetFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // fsGetFileHash(xxhash64) feba48465b833ca1
 * // fsGetFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
 * // fsGetFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
 * // ms [
 * //   {
 * //     'fsGetFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'fsGetFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   },
 * //   { 'fsGetFileHash(xxhash64)': 'feba48465b833ca1' },
 * //   { 'fsGetFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
 * //   { 'fsGetFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
 * // ]
 *
 */
function fsGetFileHash(fp, opt = {}) {
    return fsGetFileHashCore(fp, { fs, crypto, ...opt })
}


export default fsGetFileHash
