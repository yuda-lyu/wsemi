import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import isestr from './isestr.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsGetFilesInFolder from './fsGetFilesInFolder.mjs'
import fsGetFileHash from './fsGetFileHash.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法，預設'md5'
 * @returns {Array} 回傳列舉檔案陣列
 * @example
 * //need test in nodejs
 *
 * let rs
 *
 * rs = fsGetFilesWithHashInFolder(fd, 1, { type: 'md5' })
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './d/a.txt', name: 'a.txt', hashType: 'md5', hash: '{HASH值}' },
 * //   { level: 1, path: './d/za.json', name: 'za.json', hashType: 'md5', hash: '{HASH值}' }
 * // ]
 *
 * rs = fsGetFilesWithHashInFolder(fd, null, { type: 'md5' })
 * console.log(rs)
 * // => [
 * //   { level: 1, path: './d/a.txt', name: 'a.txt', hashType: 'md5', hash: '{HASH值}'  },
 * //   { level: 1, path: './d/za.json', name: 'za.json', hashType: 'md5', hash: '{HASH值}' },
 * //   { level: 2, path: './d/ee/b.txt', name: 'b.txt', hashType: 'md5', hash: '{HASH值}' },
 * //   { level: 2, path: './d/ee/zb.json', name: 'zb.json', hashType: 'md5', hash: '{HASH值}' },
 * //   { level: 3, path: './d/ee/eee/c.txt', name: 'c.txt', hashType: 'md5', hash: '{HASH值}' },
 * //   { level: 3, path: './d/ee/eee/zc.json', name: 'zc.json', hashType: 'md5', hash: '{HASH值}' }
 * // ]
 *
 */
function fsGetFilesWithHashInFolder(fd, levelLimit = 1, opt = {}) {

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'md5'
    }

    //check
    if (!fsIsFolder(fd)) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = fsGetFilesInFolder(fd, levelLimit)
    fps = map(fps, (v) => {

        //ph
        let ph = get(v, 'path', '')

        //hash
        v.hashType = type
        v.hash = ''
        if (isestr(ph)) {
            v.hash = fsGetFileHash(ph, {
                type,
                mode: 'sync',
            })
        }

        return v
    })

    return fps
}


export default fsGetFilesWithHashInFolder
