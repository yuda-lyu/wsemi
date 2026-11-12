import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import pmSeries from './pmSeries.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFolderBasicHashCore from './fsGetFolderBasicHashCore.mjs'
import errToStr from './_errToStr.mjs'
import chkFsPath from './_chkFsPath.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾，且計算各自HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderWithHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)，非預期之輸入(含0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設1，Infinity不視為無窮遍歷(無窮遍歷請設定null)，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @param {Boolean} [opt.forFile=true] 輸入是否針對檔案計算HASH值，預設true
 * @param {Boolean} [opt.forFolder=false] 輸入是否針對檔案計算HASH值，預設false
 * @param {Boolean} [opt.debug=false] 輸入是否於levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳檔案或資料夾陣列且含HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * //need test in nodejs
 *
 * //see fsTreeFolderWithHash
 *
 */
async function fsTreeFolderWithHashCore(fd, levelLimit = 1, opt = {}) {
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

        //forFile
        let forFile = get(opt, 'forFile', null)
        if (!isbol(forFile)) {
            forFile = true
        }

        //forFolder
        let forFolder = get(opt, 'forFolder', null)
        if (!isbol(forFolder)) {
            forFolder = false
        }

        //optDbg, 本函數之opt轉交fsTreeFolderCore作為debug、funLog之來源(R-OPT-VAL-01), 由其於levelLimit非預期時才讀一次(V11), 有效時不讀
        return await core(fd, levelLimit, { path, fs, crypto, type, forFile, forFolder, optDbg: opt })
    }
    catch (err) {
        //opt不可讀之Error、前置檢查之字串、fsTreeFolderCore之readdirSync(EPERM等)Error、注入之fs拋出之任意值, 一律轉字串; 已為字串者原樣
        return Promise.reject(errToStr(err))
    }
}


//core, 列舉並計算HASH; 任何失敗由fsTreeFolderWithHashCore統一轉字串reject
async function core(fd, levelLimit, { path, fs, crypto, type, forFile, forFolder, optDbg }) {

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgFd = chkFsPath(fd, 'fd')
    if (msgFd) {
        return Promise.reject(msgFd)
    }

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        return Promise.reject(`fd[${fd}] is not a folder`)
    }

    // //check, 改交由fsTreeFolderCore檢核
    // if (levelLimit !== null && ispint(levelLimit)) {
    //     levelLimit = cint(levelLimit)
    //     if (levelLimit < 1) {
    //         levelLimit = 1
    //     }
    // }

    //vfps
    let vfps = fsTreeFolderCore(fd, levelLimit, { path, fs, optDbg })
    // console.log('vfps', vfps)

    //add hash
    vfps = await pmSeries(vfps, async(v) => {
        let hash = ''
        if (forFile && !v.isFolder) {
            hash = await fsGetFileBasicHashCore(v.path, { fs, crypto, type })
            // console.log('file', v.path, hash)
        }
        if (forFolder && v.isFolder) {
            hash = await fsGetFolderBasicHashCore(v.path, { path, fs, crypto, type })
            // console.log('folder', v.path, hash)
        }
        v.hash = hash
        return v
    })

    return vfps
}


export default fsTreeFolderWithHashCore
