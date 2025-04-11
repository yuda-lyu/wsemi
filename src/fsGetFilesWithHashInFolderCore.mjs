import get from 'lodash-es/get.js'
import pmSeries from './pmSeries.mjs'
import isestr from './isestr.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsGetFilesInFolderCore from './fsGetFilesInFolderCore.mjs'
import fsGetFileHashCore from './fsGetFileHashCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法，預設'md5'
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * //see fsGetFilesWithHashInFolder
 *
 */
async function fsGetFilesWithHashInFolderCore(fd, levelLimit = 1, opt = {}) {

    //path, fs, crypto
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')
    let crypto = get(opt, 'crypto')

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'md5'
    }

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    //fps
    let fps = fsGetFilesInFolderCore(fd, levelLimit, { path, fs })

    //add hash
    fps = await pmSeries(fps, async (v) => {

        //ph
        let ph = get(v, 'path', '')

        //hash
        v.hashType = type
        v.hash = ''
        if (isestr(ph)) {
            v.hash = await fsGetFileHashCore(ph, {
                fs,
                crypto,
                type,
                useSync: false, //使用非同步才能支援大檔
            })
        }

        return v
    })

    return fps
}


export default fsGetFilesWithHashInFolderCore
