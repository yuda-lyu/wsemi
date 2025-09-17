import get from 'lodash-es/get.js'
import join from 'lodash-es/join.js'
import isestr from './isestr.mjs'
import pmSeries from './pmSeries.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'


/**
 * 後端nodejs計算資料夾HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFolderBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @returns {Promise} 回傳Promise，resolve回傳資料夾HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsGetFolderBasicHash
 *
 */
async function fsGetFolderBasicHashCore(fd, opt = {}) {

    //path, fs, crypto
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')
    let crypto = get(opt, 'crypto')

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'md5'
    }

    //hashs
    let hashs = []
    let vfps = fsTreeFolderCore(fd, null, { path, fs })
    await pmSeries(vfps, async (v) => {

        //check
        if (v.isFolder) {
            return
        }

        //hash
        let hash = await fsGetFileBasicHashCore(v.path, { fs, crypto, type })

        //push
        hashs.push(hash)

    })

    //hash
    let hash = join(hashs, '|')
    // console.log('hashs', hashs)
    // console.log('hash', hash)

    return hash
}


export default fsGetFolderBasicHashCore
