import path from 'path'
import fs from 'fs'
import each from 'lodash-es/each.js'
import fsIsFolder from './fsIsFolder.mjs'


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
 * let rs
 *
 * rs = fsTreeFolder(fd)
 * console.log(rs)
 * // => [
 * //   { isFolder: false, level: 1, path: './d/a.txt', name: 'a.txt' },
 * //   { isFolder: true, level: 1, path: './d/ee', name: 'ee' }
 * // ]
 *
 * rs = fsTreeFolder(fd, null)
 * console.log(rs)
 * // => [
 * //   { isFolder: false, level: 1, path: './d/a.txt', name: 'a.txt' },
 * //   { isFolder: true, level: 1, path: './d/ee', name: 'ee' },
 * //   { isFolder: false, level: 2, path: './d/ee/b.txt', name: 'b.txt' },
 * //   { isFolder: true, level: 2, path: './d/ee/eee', name: 'eee' },
 * //   { isFolder: false, level: 3, path: './d/ee/eee/c.txt', name: 'c.txt' }
 * // ]
 *
 */
function fsTreeFolder(fd, levelLimit = 1) {
    let level = 1

    //check
    if (!fsIsFolder(fd)) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //tree
    function tree(fd) {
        let rs = []

        //check
        if (!fsIsFolder(fd)) {
            return rs
        }

        //readdirSync
        let items = fs.readdirSync(fd)

        //each
        each(items, function(item) {

            //fp
            let fp = path.resolve(fd, item)

            //stat
            let stat = null
            try {
                stat = fs.statSync(fp)
            }
            catch (err) {}

            //proc
            if (stat && stat.isDirectory()) {

                //push
                rs.push({
                    isFolder: true,
                    level,
                    path: fp,
                    name: path.basename(fp),
                })

                //tree
                level += 1
                if (level <= levelLimit || levelLimit === null) {
                    rs = rs.concat(tree(fp))
                }

                level -= 1

            }
            else {

                //push
                rs.push({
                    isFolder: false,
                    level,
                    path: fp,
                    name: path.basename(fp),
                })

            }

        })

        return rs
    }

    return tree(fd)
}


export default fsTreeFolder
