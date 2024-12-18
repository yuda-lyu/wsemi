import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsIsFolder from './fsIsFolder.mjs'
import fsTreeFolder from './fsTreeFolder.mjs'


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
 * let rs
 *
 * rs = fsGetFoldersInFolder(fd)
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './a', name: 'a' },
 * //   { level: 1, path: './za', name: 'za' }
 * // ]
 *
 * rs = fsGetFoldersInFolder(fd, null)
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './a', name: 'a' },
 * //   { level: 1, path: './za', name: 'za' },
 * //   { level: 2, path: './a/b', name: 'b' },
 * //   { level: 2, path: './a/zb', name: 'zb' },
 * //   { level: 3, path: './a/b/c', name: 'c' },
 * //   { level: 3, path: './a/b/zc', name: 'zc' }
 * // ]
 *
 */
function fsGetFoldersInFolder(fd, levelLimit = 1) {

    //check
    if (!fsIsFolder(fd)) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = []
    fps = fsTreeFolder(fd, levelLimit)
    fps = filter(fps, { isFolder: true })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFoldersInFolder
