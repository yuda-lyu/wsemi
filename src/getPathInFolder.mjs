import fs from 'fs'
import filter from 'lodash/filter'
import map from 'lodash/map'


/**
 * 列舉指定資料夾下的全部檔案或資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getPathInFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {boolean} [filterFolder=false] 輸入是否為資料夾，預設為false
 * @param {string} [filterName=''] 輸入欲過濾名稱字串，預設為''
 * @returns {Array} 回傳列舉檔案或資料夾陣列
 * @example
 * let fd = 'folder p'
 * getPathInFolder(fd)
 * // => ['file p1','file p2','file p3']
 *
 * getPathInFolder(fd, true)
 * // => ['folder p4','folder p5']
 */
function getPathInFolder(fd, filterFolder = false, filterName = '') {

    //check
    if (!fs.existsSync(fd)) {
        return []
    }

    //readdir
    let ltfs = fs.readdirSync(fd, { withFileTypes: true })

    //filter
    ltfs = filter(ltfs, function(v) {
        let b = !v.isDirectory()
        if (filterFolder) {
            b = !b
        }
        return b
    })

    //map
    ltfs = map(ltfs, function(v) {
        return v.name
    })

    //filter
    if (filterName !== '') {
        ltfs = filter(ltfs, function (v) {
            return v.indexOf(filterName) >= 0
        })
    }

    return ltfs
}


export default getPathInFolder
