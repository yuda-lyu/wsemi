import fs from 'fs'
import crypto from 'crypto'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import mergeInject from './_mergeInject.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileBasicHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於讀檔
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是檔案時reject說明字串'invalid fp: must be an existing file'；Node原生錯誤(讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'；opt.fs、opt.crypto給undefined視為未給而取Node內建
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsGetFileBasicHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     fsWriteText(fp, 'xyz')
 *
 *     let h1 = await fsGetFileBasicHash(fp)
 *     console.log('fsGetFileBasicHash(sha512)', h1)
 *     ms.push({ 'fsGetFileBasicHash(sha512)': h1 })
 *
 *     let h2 = await fsGetFileBasicHash(fp, { type: 'sha256' })
 *     console.log('fsGetFileBasicHash(sha256)', h2)
 *     ms.push({ 'fsGetFileBasicHash(sha256)': h2 })
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
 * // fsGetFileBasicHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // fsGetFileBasicHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // ms [
 * //   {
 * //     'fsGetFileBasicHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'fsGetFileBasicHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   }
 * // ]
 *
 */
function fsGetFileBasicHash(fp, opt = {}) {
    try {
        return fsGetFileBasicHashCore(fp, mergeInject({ fs, crypto }, opt)) //opt.fs、opt.crypto給undefined視為未給取Node內建(V5)
    }
    catch (err) {
        return Promise.reject(fsErrMsg(err)) //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 本函數非async, 於try外即成同步拋錯; 拋出者為Node原生錯誤時改固定詞彙加錯誤碼(W-23)
    }
}


export default fsGetFileBasicHash
