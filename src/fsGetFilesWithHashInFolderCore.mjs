import get from 'lodash-es/get.js'
import pmSeries from './pmSeries.mjs'
import isestr from './isestr.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsGetFilesInFolderCore from './fsGetFilesInFolderCore.mjs'
import fsGetFileHashCore from './fsGetFileHashCore.mjs'
import errToStr from './_errToStr.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，null與Infinity皆不視為無窮遍歷(無窮遍歷請給大有限值，如4294967295)，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、readdirSync(讀取串流之createReadStream於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing …'(不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，reject說明字串'invalid opt.path: must be an object providing resolve, basename'
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash(opt.type為'xxhash64'時不需要)；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @param {Boolean} [opt.debug=false] 輸入是否於levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsGetFilesWithHashInFolder
 *
 */
async function fsGetFilesWithHashInFolderCore(fd, levelLimit = 1, opt = {}) {
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

        //check, 注入之fs、path、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷; crypto僅非xxhash64時需要, 以說明字串reject(不帶輸入值)
        let msgDeps = chkFsDeps({ fs, path, crypto }, type === 'xxhash64' ? { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'] } : { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'], crypto: ['createHash'] })
        if (msgDeps) {
            return Promise.reject(msgDeps)
        }

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            return Promise.reject(`fd[${fd}] is not a folder`)
        }

        //fps
        //optDbg, 本函數之opt轉交作為debug、funLog之來源(R-OPT-VAL-01), 由fsTreeFolderCore於levelLimit非預期時才讀一次(V11), 有效時不讀
        let fps = fsGetFilesInFolderCore(fd, levelLimit, { path, fs, optDbg: opt })

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
    catch (err) {
        //fsGetFilesInFolderCore之readdirSync(EPERM等)Error、注入之fs拋出之任意值, 一律轉字串; 已為字串者(fsGetFileHashCore之reject)原樣
        return Promise.reject(errToStr(err))
    }
}


export default fsGetFilesWithHashInFolderCore
