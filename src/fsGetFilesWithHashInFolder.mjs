import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsGetFilesWithHashInFolderCore from './fsGetFilesWithHashInFolderCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，Infinity不視為無窮遍歷(無窮遍歷請設定null)，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @param {Boolean} [opt.debug=false] 輸入是否於levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
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
 *     let r1 = await fsGetFilesWithHashInFolder(fdt, 1)
 *     console.log('fsGetFilesWithHashInFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = await fsGetFilesWithHashInFolder(fdt, null)
 *     console.log('fsGetFilesWithHashInFolder(levelLimit=null)', ftpaths(rall))
 *     ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=null)': ftpaths(rall) })
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
 * // fsGetFilesWithHashInFolder(levelLimit=null) [
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
 * // ms [{"fsGetFilesWithHashInFolder(evelLimit=1)":[{"level":1,"path":"./z1.txt","name":"z1.txt","hashType":"md5","hash":"3b770ebe9b04f171f0ead0e07d8e2882"}]},{"fsGetFilesWithHashInFolder(evelLimit=null)":[{"level":2,"path":"./abc/z2.txt","name":"z2.txt","hashType":"md5","hash":"5cb7e380d019de63c643aef55b8534d0"},{"level":3,"path":"./def/ijk/z3.txt","name":"z3.txt","hashType":"md5","hash":"a61d1457beb4684e254ce60379c8ae7b"},{"level":1,"path":"./z1.txt","name":"z1.txt","hashType":"md5","hash":"3b770ebe9b04f171f0ead0e07d8e2882"}]}]
 *
 */
async function fsGetFilesWithHashInFolder(fd, levelLimit = 1, opt = {}) {
    try {
        return fsGetFilesWithHashInFolderCore(fd, levelLimit, { path, fs, crypto, ...opt })
    }
    catch (err) {
        return Promise.reject(errToStr(err)) //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 於async函數內未捕捉即以Error物件reject
    }
}


export default fsGetFilesWithHashInFolder
