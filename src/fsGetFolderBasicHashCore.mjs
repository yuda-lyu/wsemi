import get from 'lodash-es/get.js'
import join from 'lodash-es/join.js'
import pmSeries from './pmSeries.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'


/**
 * 後端nodejs計算資料夾HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFolderBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、readdirSync(讀取串流之createReadStream於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing …'(不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，reject說明字串'invalid opt.path: must be an object providing resolve, basename'
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於列舉與讀檔(入口檢查，資料夾無檔案時亦檢查)
 * @returns {Promise} 回傳Promise，resolve回傳資料夾HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是資料夾時reject說明字串'invalid fd: must be an existing folder'；Node原生錯誤(列舉、讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'
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

        //type, 未給(undefined、null)取預設, 給了須通過檢核(安全相關opt, 無效即拒絕不改用預設, 見下)
        let type = get(opt, 'type')

        //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
        let msgFd = chkFsPath(fd, 'fd')
        if (msgFd) {
            return Promise.reject(msgFd)
        }

        //check, 注入之fs、path、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷, 以說明字串reject(不帶輸入值)
        let msgDeps = chkFsDeps({ fs, path, crypto }, { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'], crypto: ['createHash'] })
        if (msgDeps) {
            return Promise.reject(msgDeps)
        }

        //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 先於列舉與讀檔(資料夾無檔案時亦檢查); 允許集合為注入之crypto.getHashes()
        let msgType = chkHashType(type, { crypto })
        if (msgType) {
            return Promise.reject(msgType)
        }
        if (type === undefined || type === null) {
            type = 'md5'
        }

        //check, 與其他前置檢查一致以說明字串reject(原由fsTreeFolderCore拋Error)
        if (!fsIsFolderCore(fd, { fs })) {
            return Promise.reject('invalid fd: must be an existing folder')
        }

        //全部層級: levelLimit之null改取預設1(K3), 無窮遍歷以大有限值(iseint use:'count'之上限)表示
        let vfps = fsTreeFolderCore(fd, 4294967295, { path, fs })
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
        return Promise.reject(fsErrMsg(err))
    }

    //hash
    let hash = join(hashs, '|')
    // console.log('hashs', hashs)
    // console.log('hash', hash)

    return hash
}


export default fsGetFolderBasicHashCore
