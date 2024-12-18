import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsTreeFolder from './fsTreeFolder.mjs'
import fsIsFolder from './fsIsFolder.mjs'


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
 * let rs
 *
 * rs = fsGetFilesInFolder(fd)
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './d/a.txt', name: 'a.txt' },
 * //   { level: 1, path: './d/za.json', name: 'za.json' }
 * // ]
 *
 * rs = fsGetFilesInFolder(fd, null)
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './d/a.txt', name: 'a.txt' },
 * //   { level: 1, path: './d/za.json', name: 'za.json' },
 * //   { level: 2, path: './d/ee/b.txt', name: 'b.txt' },
 * //   { level: 2, path: './d/ee/zb.json', name: 'zb.json' },
 * //   { level: 3, path: './d/ee/eee/c.txt', name: 'c.txt' },
 * //   { level: 3, path: './d/ee/eee/zc.json', name: 'zc.json' }
 * // ]
 *
 */
function fsGetFilesInFolder(fd, levelLimit = 1) {

    //check
    if (!fsIsFolder(fd)) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = []
    fps = fsTreeFolder(fd, levelLimit)
    fps = filter(fps, { isFolder: false })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFilesInFolder
