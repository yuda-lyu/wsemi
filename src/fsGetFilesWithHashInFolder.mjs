import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsGetFilesWithHashInFolderCore from './fsGetFilesWithHashInFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法，預設'md5'
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息
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
    return fsGetFilesWithHashInFolderCore(fd, levelLimit, { path, fs, crypto, ...opt })
}


export default fsGetFilesWithHashInFolder
