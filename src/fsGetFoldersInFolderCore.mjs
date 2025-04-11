import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import map from 'lodash-es/map.js'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFoldersInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的資料夾，設定null為無窮遍歷所有資料夾，預設1
 * @returns {Array} 回傳列舉資料夾陣列
 * @example
 * //need test in nodejs
 *
 * //see fsGetFoldersInFolder
 *
 */
function fsGetFoldersInFolderCore(fd, levelLimit = 1, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = []
    fps = fsTreeFolderCore(fd, levelLimit, { path, fs })
    fps = filter(fps, { isFolder: true })
    fps = map(fps, (v) => {
        delete v.isFolder
        return v
    })

    return fps
}


export default fsGetFoldersInFolderCore
