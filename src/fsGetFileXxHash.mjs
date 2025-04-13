import fs from 'fs'
import fsGetFileXxHashCore from './fsGetFileXxHashCore.mjs'


/**
 * 後端nodejs計算檔案xxHash64值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileXxHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入切片長度數字，單位位元，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsGetFileXxHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     fsWriteText(fp, 'xyz')
 *
 *     let h1 = await fsGetFileXxHash(fp)
 *     console.log('fsGetFileXxHash(64mb)', h1)
 *     ms.push({ 'fsGetFileXxHash(64mb)': h1 })
 *
 *     let h2 = await fsGetFileXxHash(fp, { chunkSize: 16 * 1024 * 1024 })
 *     console.log('fsGetFileXxHash(16mb)', h2)
 *     ms.push({ 'fsGetFileXxHash(16mb)': h2 })
 *
 *     let h3 = await fsGetFileXxHash(fp, { chunkSize: 4 * 1024 * 1024 })
 *     console.log('fsGetFileXxHash(4mb)', h3)
 *     ms.push({ 'fsGetFileXxHash(4mb)': h3 })
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
 * // fsGetFileXxHash(64mb) feba48465b833ca1
 * // fsGetFileXxHash(16mb) feba48465b833ca1
 * // fsGetFileXxHash(4mb) feba48465b833ca1
 * // ms [
 * //   { 'fsGetFileXxHash(64mb)': 'feba48465b833ca1' },
 * //   { 'fsGetFileXxHash(16mb)': 'feba48465b833ca1' },
 * //   { 'fsGetFileXxHash(4mb)': 'feba48465b833ca1' }
 * // ]
 *
 */
function fsGetFileXxHash(fp, opt = {}) {
    return fsGetFileXxHashCore(fp, { fs, ...opt })
}


export default fsGetFileXxHash
