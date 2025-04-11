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
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {String|Promise} 若useSync=true回傳檔案HASH值字串，若useSync=false則回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 *
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
 *     let h1 = fsGetFileHash(fp)
 *     console.log('fsGetFileHash(sha512)(sync)', h1)
 *     ms.push({ 'fsGetFileHash(sha512)(sync)': h1 })
 *
 *     let h2 = await fsGetFileHash(fp, { useSync: false })
 *     console.log('fsGetFileHash(sha512)(async)', h2)
 *     ms.push({ 'fsGetFileHash(sha512)(async)': h2 })
 *
 *     let h3 = fsGetFileHash(fp, { type: 'sha256' })
 *     console.log('fsGetFileHash(sha256)(sync)', h3)
 *     ms.push({ 'fsGetFileHash(sha256)(sync)': h3 })
 *
 *     let h4 = await fsGetFileHash(fp, { useSync: false, type: 'sha256' })
 *     console.log('fsGetFileHash(sha256)(async)', h4)
 *     ms.push({ 'fsGetFileHash(sha256)(async)': h4 })
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
 * // fsGetFileHash(sha512)(sync) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // fsGetFileHash(sha512)(async) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // fsGetFileHash(sha256)(sync) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // fsGetFileHash(sha256)(async) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // ms [
 * //   {
 * //     'fsGetFileHash(sha512)(sync)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'fsGetFileHash(sha512)(async)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'fsGetFileHash(sha256)(sync)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   },
 * //   {
 * //     'fsGetFileHash(sha256)(async)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   }
 * // ]
 *
 */
function fsGetFileHash(fp, opt = {}) {
    return fsGetFileHashCore(fp, { fs, crypto, ...opt })
}


export default fsGetFileHash
