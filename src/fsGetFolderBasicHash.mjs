import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsGetFolderBasicHashCore from './fsGetFolderBasicHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import mergeInject from './_mergeInject.mjs'


/**
 * 後端nodejs計算資料夾HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFolderBasicHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於列舉與讀檔(資料夾無檔案時亦檢查)
 * @returns {Promise} 回傳Promise，resolve回傳資料夾HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是資料夾時reject說明字串'invalid fd: must be an existing folder'；Node原生錯誤(列舉、讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'；opt.path、opt.fs、opt.crypto給undefined視為未給而取Node內建
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsGetFolderBasicHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fp
 *
 *     fp = `${fdt}/abc/t1.txt`
 *     fsWriteText(fp, 'abc-t1')
 *
 *     fp = `${fdt}/def/xyz/t2.txt`
 *     fsWriteText(fp, 'def-xyz-t2')
 *
 *     let h1 = await fsGetFolderBasicHash(fdt)
 *     console.log('fsGetFolderBasicHash(md5)', h1)
 *     ms.push({ 'fsGetFolderBasicHash(md5)': h1 })
 *
 *     let h2 = await fsGetFolderBasicHash(fdt, { type: 'sha256' })
 *     console.log('fsGetFolderBasicHash(sha256)', h2)
 *     ms.push({ 'fsGetFolderBasicHash(sha256)': h2 })
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
 * // fsGetFolderBasicHash(md5) 45d11ad27b97bc3bb664260189ec0dcc|ac8cf7366d7adf0743d6561133d404b3
 * // fsGetFolderBasicHash(sha256) 2cc76b7a715d35c3b8f2d2585b144907883ea9167d230afbee4c4a5ab0634152|bf2fa34249f4dbbd72b3a754b56f4beb9b8dede8b64e21ce8b83696e6febb8bb
 * // ms [
 * //   {
 * //     'fsGetFolderBasicHash(md5)': '45d11ad27b97bc3bb664260189ec0dcc|ac8cf7366d7adf0743d6561133d404b3'
 * //   },
 * //   {
 * //     'fsGetFolderBasicHash(sha256)': '2cc76b7a715d35c3b8f2d2585b144907883ea9167d230afbee4c4a5ab0634152|bf2fa34249f4dbbd72b3a754b56f4beb9b8dede8b64e21ce8b83696e6febb8bb'
 * //   }
 * // ]
 *
 */
function fsGetFolderBasicHash(fd, opt = {}) {
    try {
        return fsGetFolderBasicHashCore(fd, mergeInject({ path, fs, crypto }, opt)) //opt.path、opt.fs、opt.crypto給undefined視為未給取Node內建(V5)
    }
    catch (err) {
        return Promise.reject(fsErrMsg(err)) //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 本函數非async, 於try外即成同步拋錯; 拋出者為Node原生錯誤時改固定詞彙加錯誤碼(W-23)
    }
}


export default fsGetFolderBasicHash
