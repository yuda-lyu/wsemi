import path from 'path'
import fs from 'fs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，預設1
 * @returns {Array} 回傳列舉檔案或資料夾陣列
 * @example
 * //need test in nodejs
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let t = '_test_fsTreeFolder'
 *     let fdt = './_test_fsTreeFolder'
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
 *     let r1 = fsTreeFolder(fdt, 1)
 *     console.log('fsTreeFolder(levelLimit=1)', ftpaths(r1))
 *     ms.push({ 'fsTreeFolder(evelLimit=1)': ftpaths(r1) })
 *
 *     let rall = fsTreeFolder(fdt, null)
 *     console.log('fsTreeFolder(levelLimit=null)', ftpaths(rall))
 *     ms.push({ 'fsTreeFolder(evelLimit=null)': ftpaths(rall) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms))
 *     return ms
 * }
 * test()
 * // fsTreeFolder(levelLimit=1) [
 * //   { isFolder: true, level: 1, path: './abc', name: 'abc' },
 * //   { isFolder: true, level: 1, path: './def', name: 'def' },
 * //   { isFolder: true, level: 1, path: './mno', name: 'mno' },
 * //   { isFolder: false, level: 1, path: './z1.txt', name: 'z1.txt' }
 * // ]
 * // fsTreeFolder(levelLimit=null) [
 * //   { isFolder: true, level: 1, path: './abc', name: 'abc' },
 * //   { isFolder: false, level: 2, path: './abc/z2.txt', name: 'z2.txt' },
 * //   { isFolder: true, level: 1, path: './def', name: 'def' },
 * //   { isFolder: true, level: 2, path: './def/ijk', name: 'ijk' },
 * //   {
 * //     isFolder: false,
 * //     level: 3,
 * //     path: './def/ijk/z3.txt',
 * //     name: 'z3.txt'
 * //   },
 * //   { isFolder: true, level: 1, path: './mno', name: 'mno' },
 * //   { isFolder: true, level: 2, path: './mno/pqr', name: 'pqr' },
 * //   { isFolder: false, level: 1, path: './z1.txt', name: 'z1.txt' }
 * // ]
 * // ms [{"fsTreeFolder(evelLimit=1)":[{"isFolder":true,"level":1,"path":"./abc","name":"abc"},{"isFolder":true,"level":1,"path":"./def","name":"def"},{"isFolder":true,"level":1,"path":"./mno","name":"mno"},{"isFolder":false,"level":1,"path":"./z1.txt","name":"z1.txt"}]},{"fsTreeFolder(evelLimit=null)":[{"isFolder":true,"level":1,"path":"./abc","name":"abc"},{"isFolder":false,"level":2,"path":"./abc/z2.txt","name":"z2.txt"},{"isFolder":true,"level":1,"path":"./def","name":"def"},{"isFolder":true,"level":2,"path":"./def/ijk","name":"ijk"},{"isFolder":false,"level":3,"path":"./def/ijk/z3.txt","name":"z3.txt"},{"isFolder":true,"level":1,"path":"./mno","name":"mno"},{"isFolder":true,"level":2,"path":"./mno/pqr","name":"pqr"},{"isFolder":false,"level":1,"path":"./z1.txt","name":"z1.txt"}]}]
 *
 */
function fsTreeFolder(fd, levelLimit = 1) {
    return fsTreeFolderCore(fd, levelLimit, { path, fs })
}


export default fsTreeFolder
