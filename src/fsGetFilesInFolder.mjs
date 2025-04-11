import path from 'path'
import fs from 'fs'
import fsGetFilesInFolderCore from './fsGetFilesInFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @returns {Array} 回傳列舉檔案陣列
 * @example
 * //need test in nodejs
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let t = '_test_fsGetFilesInFolder'
 *     let fdt = './_test_fsGetFilesInFolder'
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
 *     let r1 = fsGetFilesInFolder(fdt, 1)
 *     console.log('fsGetFilesInFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsGetFilesInFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = fsGetFilesInFolder(fdt, null)
 *     console.log('fsGetFilesInFolder(levelLimit=null)', ftpaths(rall))
 *     ms.push({ 'fsGetFilesInFolder(evelLimit=null)': ftpaths(rall) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms))
 *     return ms
 * }
 * test()
 * // fsGetFilesInFolder(levelLimit=1) [ { level: 1, path: './z1.txt', name: 'z1.txt' } ]
 * // fsGetFilesInFolder(levelLimit=null) [
 * //   { level: 2, path: './abc/z2.txt', name: 'z2.txt' },
 * //   { level: 3, path: './def/ijk/z3.txt', name: 'z3.txt' },
 * //   { level: 1, path: './z1.txt', name: 'z1.txt' }
 * // ]
 * // ms [{"fsGetFilesInFolder(evelLimit=1)":[{"level":1,"path":"./z1.txt","name":"z1.txt"}]},{"fsGetFilesInFolder(evelLimit=null)":[{"level":2,"path":"./abc/z2.txt","name":"z2.txt"},{"level":3,"path":"./def/ijk/z3.txt","name":"z3.txt"},{"level":1,"path":"./z1.txt","name":"z1.txt"}]}]
 *
 */
function fsGetFilesInFolder(fd, levelLimit = 1) {
    return fsGetFilesInFolderCore(fd, levelLimit, { path, fs })
}


export default fsGetFilesInFolder
