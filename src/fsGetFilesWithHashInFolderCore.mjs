import get from 'lodash-es/get.js'
import pmSeries from './pmSeries.mjs'
import isestr from './isestr.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsGetFilesInFolderCore from './fsGetFilesInFolderCore.mjs'
import fsGetFileHashCore from './fsGetFileHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案與對應HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFilesWithHashInFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)reject說明字串'invalid opt: must be an object'(不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦reject說明字串'invalid arguments: must be fd and opt only'
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、readdirSync(讀取串流之createReadStream於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing …'(不帶輸入值)
 * @param {Object} opt.path 輸入path物件，須提供resolve、basename；缺漏同opt.fs，reject說明字串'invalid opt.path: must be an object providing resolve, basename'
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash(opt.type為'xxhash64'時不需要)；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為'xxhash64'或crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be \'xxhash64\' or one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於列舉與讀檔(入口檢查，資料夾無檔案時亦檢查)
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳列舉檔案陣列，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是資料夾時reject說明字串'invalid fd: must be an existing folder'；Node原生錯誤(列舉、讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'
 * @example
 * //need test in nodejs
 *
 * //see fsGetFilesWithHashInFolder
 *
 */
async function fsGetFilesWithHashInFolderCore(fd, opt = {}) {
    try {

        //check, 第2參數之遷移期檢查(R-LEVEL-LIMIT-02): 給了而非物件(舊寫法之levelLimit數字等)即reject說明字串, fd無效者先報fd, 先於讀取opt之鍵
        let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
        if (msgOpt) {
            return Promise.reject(msgOpt)
        }

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

        //check, 注入之fs、path、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷; crypto僅非xxhash64時需要, 以說明字串reject(不帶輸入值)
        let msgDeps = chkFsDeps({ fs, path, crypto }, type === 'xxhash64' ? { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'] } : { fs: ['statSync', 'lstatSync', 'readdirSync'], path: ['resolve', 'basename'], crypto: ['createHash'] })
        if (msgDeps) {
            return Promise.reject(msgDeps)
        }

        //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 先於列舉與讀檔(資料夾無檔案時亦檢查); 允許集合為'xxhash64'與注入之crypto.getHashes()
        let msgType = chkHashType(type, { crypto, xx: true })
        if (msgType) {
            return Promise.reject(msgType)
        }
        if (type === undefined || type === null) {
            type = 'md5'
        }

        //check
        if (!fsIsFolderCore(fd, { fs })) {
            return Promise.reject('invalid fd: must be an existing folder')
        }

        //fps
        //optDbg, 本函數之opt轉交作為debug、funLog之來源(R-OPT-VAL-01), 由fsTreeFolderCore於opt.levelLimit非預期時才讀一次(V11), 有效時不讀; opt.levelLimit之判定由fsTreeFolderCore單一擁有
        let fps = fsGetFilesInFolderCore(fd, { path, fs, levelLimit: get(opt, 'levelLimit'), optDbg: opt })

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
        return Promise.reject(fsErrMsg(err))
    }
}


export default fsGetFilesWithHashInFolderCore
