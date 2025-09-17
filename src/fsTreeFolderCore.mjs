import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，預設1
 * @returns {Array} 回傳列舉檔案或資料夾陣列
 * @example
 * //need test in nodejs
 *
 * //see fsTreeFolder
 *
 */
function fsTreeFolderCore(fd, levelLimit = 1, opt = {}) {
    let level = 1

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //check
    if (levelLimit !== null && ispint(levelLimit)) {
        levelLimit = cint(levelLimit)
        if (levelLimit < 1) {
            levelLimit = 1
        }
    }

    //tree
    function tree(fd) {
        let rs = []

        //check
        if (!fsIsFolderCore(fd, { fs })) {
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


export default fsTreeFolderCore
