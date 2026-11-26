import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsGetFilesWithHashInFolderCore from './fsGetFilesWithHashInFolderCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import mergeInject from './_mergeInject.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)reject說明字串'invalid opt: must be an object'(不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦reject說明字串'invalid arguments: must be fd and opt only'
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為'xxhash64'或crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be \'xxhash64\' or one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於列舉與讀檔(資料夾無檔案時亦檢查)
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是資料夾時reject說明字串'invalid fd: must be an existing folder'；Node原生錯誤(列舉、讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'；opt.path、opt.fs、opt.crypto給undefined視為未給而取Node內建
 * @example
 * //need test in nodejs
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let t = '_test_fsGetFilesWithHashInFolder'
 *     let fdt = './_test_fsGetFilesWithHashInFolder'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let ftpath = (v) => {
 *         // console.log(v, 'v.path', v.path)
 *         let ss = _.split(v.path, t)
 *         // console.log('ss', ss)
 *         let p = ss[1]
 *         p = p.replaceAll('\\', '/')
 *         p = `.${p}`
 *         // console.log('p', p)
 *         v.path = p
 *         return v
 *     }
 *
 *     let ftpaths = (vs) => {
 *         return _.map(_.cloneDeep(vs), ftpath)
 *     }
 *
 *     fsWriteText(`${fdt}/z1.txt`, 'z1')
 *     fsWriteText(`${fdt}/abc/z2.txt`, 'z2')
 *     fsWriteText(`${fdt}/def/ijk/z3.txt`, 'z3')
 *     fsCreateFolder(`${fdt}/mno/pqr`)
 *
 *     let r1 = await fsGetFilesWithHashInFolder(fdt, { levelLimit: 1 })
 *     console.log('fsGetFilesWithHashInFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = await fsGetFilesWithHashInFolder(fdt)
 *     console.log('fsGetFilesWithHashInFolder(levelLimit=unset)', ftpaths(rall))
 *     ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=unset)': ftpaths(rall) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms))
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // fsGetFilesWithHashInFolder(levelLimit=1) [
 * //   {
 * //     level: 1,
 * //     path: './z1.txt',
 * //     name: 'z1.txt',
 * //     hashType: 'md5',
 * //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
 * //   }
 * // ]
 * // fsGetFilesWithHashInFolder(levelLimit=unset) [
 * //   {
 * //     level: 2,
 * //     path: './abc/z2.txt',
 * //     name: 'z2.txt',
 * //     hashType: 'md5',
 * //     hash: '5cb7e380d019de63c643aef55b8534d0'
 * //   },
 * //   {
 * //     level: 3,
 * //     path: './def/ijk/z3.txt',
 * //     name: 'z3.txt',
 * //     hashType: 'md5',
 * //     hash: 'a61d1457beb4684e254ce60379c8ae7b'
 * //   },
 * //   {
 * //     level: 1,
 * //     path: './z1.txt',
 * //     name: 'z1.txt',
 * //     hashType: 'md5',
 * //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
 * //   }
 * // ]
 * // ms [{"fsGetFilesWithHashInFolder(evelLimit=1)":[{"level":1,"path":"./z1.txt","name":"z1.txt","hashType":"md5","hash":"3b770ebe9b04f171f0ead0e07d8e2882"}]},{"fsGetFilesWithHashInFolder(evelLimit=unset)":[{"level":2,"path":"./abc/z2.txt","name":"z2.txt","hashType":"md5","hash":"5cb7e380d019de63c643aef55b8534d0"},{"level":3,"path":"./def/ijk/z3.txt","name":"z3.txt","hashType":"md5","hash":"a61d1457beb4684e254ce60379c8ae7b"},{"level":1,"path":"./z1.txt","name":"z1.txt","hashType":"md5","hash":"3b770ebe9b04f171f0ead0e07d8e2882"}]}]
 *
 */
async function fsGetFilesWithHashInFolder(fd, opt = {}) {
    try {

        //check, 第2參數非物件(舊寫法之levelLimit數字等)或第3個引數有給即reject說明字串(R-LEVEL-LIMIT-02), fd無效者先報fd
        let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
        if (msgOpt) {
            return Promise.reject(msgOpt)
        }

        return fsGetFilesWithHashInFolderCore(fd, mergeInject({ path, fs, crypto }, opt)) //opt.path、opt.fs、opt.crypto給undefined視為未給取Node內建(V5)
    }
    catch (err) {
        return Promise.reject(fsErrMsg(err)) //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 於async函數內未捕捉即以Error物件reject; 拋出者為Node原生錯誤時改固定詞彙加錯誤碼(W-23)
    }
}


export default fsGetFilesWithHashInFolder
