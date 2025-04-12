import fs from 'fs'
import crypto from 'crypto'
import fsGetFileHashCore from './fsGetFileHashCore.mjs'


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
 *     console.log('fsGetFileXxHash(sha512)', h1)
 *     ms.push({ 'fsGetFileXxHash(sha512)': h1 })
 *
 *     let h2 = await fsGetFileXxHash(fp, { type: 'sha256' })
 *     console.log('fsGetFileXxHash(sha256)', h2)
 *     ms.push({ 'fsGetFileXxHash(sha256)': h2 })
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
 * // fsGetFileXxHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // fsGetFileXxHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // ms [
 * //   {
 * //     'fsGetFileXxHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'fsGetFileXxHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   }
 * // ]
 *
 */
function fsGetFileXxHash(fp, opt = {}) {
    return fsGetFileHashCore(fp, { fs, crypto, ...opt })
}


export default fsGetFileXxHash
