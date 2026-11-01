import get from 'lodash-es/get.js'
import join from 'lodash-es/join.js'
import isestr from './isestr.mjs'
import pmSeries from './pmSeries.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import errToStr from './_errToStr.mjs'
import chkFsPath from './_chkFsPath.mjs'


/**
 * 後端nodejs計算資料夾HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFolderBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @returns {Promise} 回傳Promise，resolve回傳資料夾HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * //see fsGetFolderBasicHash
 *
 */
async function fsGetFolderBasicHashCore(fd, opt = {}) {

    //hashs
    let hashs = []
    try {

        //path, fs, crypto, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於async函數內未捕捉即以Error物件reject
        let path = get(opt, 'path')
        let fs = get(opt, 'fs')
        let crypto = get(opt, 'crypto')

        //type
        let type = get(opt, 'type', '')
        if (!isestr(type)) {
            type = 'md5'
        }

        //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
        let msgFd = chkFsPath(fd, 'fd')
        if (msgFd) {
            return Promise.reject(msgFd)
        }

        //check, 與其他前置檢查一致以說明字串reject(原由fsTreeFolderCore拋Error)
        if (!fsIsFolderCore(fd, { fs })) {
            return Promise.reject(`fd[${fd}] is not a folder`)
        }

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

    }
    catch (err) {
        //fsTreeFolderCore之readdirSync(EPERM等)Error與注入之fs可拋出任意值, 一律轉字串; 已為字串者(fsGetFileBasicHashCore之reject)原樣
        return Promise.reject(errToStr(err))
    }

    //hash
    let hash = join(hashs, '|')
    // console.log('hashs', hashs)
    // console.log('hash', hash)

    return hash
}


export default fsGetFolderBasicHashCore
