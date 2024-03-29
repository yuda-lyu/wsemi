import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsTreeFolder from './fsTreeFolder.mjs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 列舉指定資料夾下的檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，預設1
 * @returns {Array} 回傳列舉檔案或資料夾陣列
 * @example
 * //need test in nodejs
 *
 * let fd = './d'
 *
 * fsGetFilesInFolder(fd)
 * // => [ './d/a.txt' ]
 *
 * fsGetFilesInFolder(fd, null)
 * // => [ './d/a.txt', './d/ee/b.txt', './d/ee/eee/c.txt' ]
 *
 */
function fsGetFilesInFolder(fd, levelLimit = 1) {

    //fsTreeFolder
    let rs = fsTreeFolder(fd, levelLimit)

    //filter
    rs = filter(rs, (v) => {
        return fsIsFile(v.path)
    })

    //map
    rs = map(rs, 'path')

    return rs
}


export default fsGetFilesInFolder
