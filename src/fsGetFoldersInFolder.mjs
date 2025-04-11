import path from 'path'
import fs from 'fs'
import fsGetFoldersInFolderCore from './fsGetFoldersInFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFoldersInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的資料夾，設定null為無窮遍歷所有資料夾，預設1
 * @returns {Array} 回傳列舉資料夾陣列
 * @example
 * //need test in nodejs
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let t = '_test_fsGetFoldersInFolder'
 *     let fdt = './_test_fsGetFoldersInFolder'
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
 *     let r1 = fsGetFoldersInFolder(fdt, 1)
 *     console.log('fsGetFoldersInFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsGetFoldersInFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = fsGetFoldersInFolder(fdt, null)
 *     console.log('fsGetFoldersInFolder(levelLimit=null)', ftpaths(rall))
 *     ms.push({ 'fsGetFoldersInFolder(evelLimit=null)': ftpaths(rall) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms))
 *     return ms
 * }
 * test()
 * // fsGetFoldersInFolder(levelLimit=1) [
 * //   { level: 1, path: './abc', name: 'abc' },
 * //   { level: 1, path: './def', name: 'def' },
 * //   { level: 1, path: './mno', name: 'mno' }
 * // ]
 * // fsGetFoldersInFolder(levelLimit=null) [
 * //   { level: 1, path: './abc', name: 'abc' },
 * //   { level: 1, path: './def', name: 'def' },
 * //   { level: 2, path: './def/ijk', name: 'ijk' },
 * //   { level: 1, path: './mno', name: 'mno' },
 * //   { level: 2, path: './mno/pqr', name: 'pqr' }
 * // ]
 * // ms [{"fsGetFoldersInFolder(evelLimit=1)":[{"level":1,"path":"./abc","name":"abc"},{"level":1,"path":"./def","name":"def"},{"level":1,"path":"./mno","name":"mno"}]},{"fsGetFoldersInFolder(evelLimit=null)":[{"level":1,"path":"./abc","name":"abc"},{"level":1,"path":"./def","name":"def"},{"level":2,"path":"./def/ijk","name":"ijk"},{"level":1,"path":"./mno","name":"mno"},{"level":2,"path":"./mno/pqr","name":"pqr"}]}]
 *
 */
function fsGetFoldersInFolder(fd, levelLimit = 1) {
    return fsGetFoldersInFolderCore(fd, levelLimit, { path, fs })
}


export default fsGetFoldersInFolder
