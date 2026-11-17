import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'
import ltdtDiffByKey from './ltdtDiffByKey.mjs'
import pmSeries from './pmSeries.mjs'
import fsCopyFileCore from './fsCopyFileCore.mjs'
import fsDeleteFileCore from './fsDeleteFileCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCopyFolderCore from './fsCopyFolderCore.mjs'
import fsDeleteFolderCore from './fsDeleteFolderCore.mjs'
import fsTreeFolderWithHashCore from './fsTreeFolderWithHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'


/**
 * 後端nodejs針對新舊資料夾進行差異同步
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSyncFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源資料夾字串
 * @param {String} fdTar 輸入目標資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、mkdirSync、readdirSync、createReadStream、createWriteStream、unlinkSync、rmSync(刪除目標多出之項目先於複製，故須於第一個刪除或複製之前齊備)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing …'(不帶輸入值，先於任何複製與刪除)
 * @param {Object} opt.path 輸入path物件，須提供resolve、dirname、join、basename與非空字串sep；缺漏同opt.fs，reject說明字串'invalid opt.path: must be an object providing …'
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設；入口檢查先於任何複製與刪除，且目標資料夾不存在而整份複製(不經雜湊)時亦檢查，同一函數所有路徑一致
 * @returns {Promise} 回傳Promise，resolve回傳是否有進行同步的布林值，reject回傳錯誤訊息字串(含複製失敗，與刪除目標內多出之檔案或資料夾失敗；Node原生錯誤之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)')，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；來源不是資料夾時reject說明字串'invalid fdSrc: must be an existing folder'
 * @example
 * //need test in nodejs
 *
 * //see fsSyncFolder
 *
 */
async function fsSyncFolderCore(fdSrc, fdTar, opt = {}) {
    try {

        //path, fs, crypto, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於async函數內未捕捉即以Error物件reject
        let path = get(opt, 'path')
        let fs = get(opt, 'fs')
        let crypto = get(opt, 'crypto')

        //type, 未給(undefined、null)取預設, 給了須通過檢核(安全相關opt, 無效即拒絕不改用預設, 見core)
        let type = get(opt, 'type')

        return await core(fdSrc, fdTar, { path, fs, crypto, type })
    }
    catch (err) {
        //opt不可讀之Error、前置檢查與複製失敗之字串、fsTreeFolderCore之readdirSync(EPERM等)Error、注入之fs拋出之任意值, 一律轉字串; 已為字串者原樣; 原生錯誤改固定詞彙加錯誤碼(不帶路徑)
        return Promise.reject(fsErrMsg(err))
    }
}


//resultFailed, 複製(fsCopyFolderCore、fsCopyFileCore)與刪除(fsDeleteFolderCore、fsDeleteFileCore)之結果物件帶error鍵即失敗; 以鍵判定而不以error值之真假判定(error值可為null等非字串之值)
function resultFailed(rc) {
    return Object.prototype.hasOwnProperty.call(rc, 'error')
}


//core, 差異同步; 任何失敗由fsSyncFolderCore統一轉字串reject
async function core(fdSrc, fdTar, { path, fs, crypto, type }) {
    let levelLimit = 4294967295 //全部層級: levelLimit之null取預設1(K3), 無窮遍歷以大有限值(iseint use:'count'之上限)表示

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPah = chkFsPath(fdSrc, 'fdSrc') || chkFsPath(fdTar, 'fdTar')
    if (msgPah) {
        return Promise.reject(msgPah)
    }

    //check, 注入之fs、path、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷、複製與刪除, 以說明字串reject(不帶輸入值)
    let msgDeps = chkFsDeps({ fs, path, crypto }, {
        fs: ['statSync', 'lstatSync', 'mkdirSync', 'readdirSync', 'createReadStream', 'createWriteStream', 'unlinkSync', 'rmSync'], //多步驟破壞性Core: 刪除目標多出之項目先於複製, 方法須於第一個破壞性動作前齊備
        path: ['resolve', 'dirname', 'join', 'basename', 'sep:string'],
        crypto: ['createHash'],
    })
    if (msgDeps) {
        return Promise.reject(msgDeps)
    }

    //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 先於任何複製與刪除, 且置於「目標不存在而整份複製」分支之前(該分支不經雜湊, 同一無效type不得有時拒絕有時成功); 允許集合為注入之crypto.getHashes()
    let msgType = chkHashType(type, { crypto })
    if (msgType) {
        return Promise.reject(msgType)
    }
    if (type === undefined || type === null) {
        type = 'md5'
    }

    //check
    if (!fsIsFolderCore(fdSrc, { fs })) {
        return Promise.reject('invalid fdSrc: must be an existing folder')
    }

    //b
    let b = false

    //check
    if (!fsIsFolderCore(fdTar, { fs })) {
        let rc = await fsCopyFolderCore(fdSrc, fdTar, { path, fs, useSync: false })
        if (resultFailed(rc)) {
            //原丟棄結果物件而恆回true(目標為既有檔案、上層為檔案等複製失敗時偽成功)
            return Promise.reject(fsErrMsg(rc.error))
        }
        b = true
        return b
    }

    //dlm, ndlm
    let dlm = path.sep
    let ndlm = path.sep.length

    //cv
    let cv = (v, fpRep) => {
        let ftype = v.isFolder ? 'folder' : 'file'
        let rpath = v.path.replace(fpRep, '')
        if (strleft(rpath, ndlm) === dlm) {
            rpath = strdelleft(rpath, ndlm)
        }
        rpath = rpath.replaceAll('\\', '/')
        let vv = {
            id: `${ftype}|${rpath}`, //可能檔名與資料夾名相同, 故須給予ftype做區分
            isFolder: v.isFolder,
            name: v.name,
            rpath,
            hash: v.hash,
        }
        return vv
    }

    //cvs
    let cvs = (vs, fpRep) => {
        vs = map(vs, (v) => {
            return cv(v, fpRep)
        })
        return vs
    }

    //vfpsSrc
    let vfpsSrc = await fsTreeFolderWithHashCore(fdSrc, levelLimit, { path, fs, crypto, type, forFile: true, forFolder: false })
    vfpsSrc = cvs(vfpsSrc, path.resolve(fdSrc))
    // console.log('vfpsSrc', vfpsSrc)

    //vfpsTar
    let vfpsTar = await fsTreeFolderWithHashCore(fdTar, levelLimit, { path, fs, crypto, type, forFile: true, forFolder: false })
    vfpsTar = cvs(vfpsTar, path.resolve(fdTar))
    // console.log('vfpsTar', vfpsTar)

    //ltdtDiffByKey
    let r = ltdtDiffByKey(vfpsTar, vfpsSrc, 'id', { withInfor: false })
    // console.log('ltdtDiffByKey', r)
    //   del: [ {...} ],
    //   add: [ {...} ],
    //   same: [ {...} ],
    //   diff: [ {...} ],

    //b, 有任一刪除, 新增或變更, 代表需進行同步
    b = size(r.del) > 0 || size(r.add) > 0 || size(r.diff) > 0

    //先針對fdTar內刪除已消失之資料夾
    await pmSeries(r.del, async(v) => {
        if (v.isFolder) {
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('del folder', fpTar)
            let rd = fsDeleteFolderCore(fpTar, { fs })
            if (resultFailed(rd)) {
                //原丟棄結果物件, 刪除失敗(被占用、無權限等)仍回true而目標殘留多出之資料夾
                return Promise.reject(fsErrMsg(rd.error))
            }
        }
    })

    //再針對fdTar內刪除已消失之檔案, 已於前階段隨資料夾刪除者fsDeleteFileCore回success(目標不存在仍算刪除成功), 不致誤報
    await pmSeries(r.del, async(v) => {
        if (!v.isFolder) {
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('del file', fpTar)
            let rd = fsDeleteFileCore(fpTar, { fs })
            if (resultFailed(rd)) {
                //原丟棄結果物件, 刪除失敗(被占用、無權限等)仍回true而目標殘留多出之檔案
                return Promise.reject(fsErrMsg(rd.error))
            }
        }
    })

    //再針對fdSrc內新增或變更的檔案進行複製過去fdTar
    await pmSeries([...r.add, ...r.diff], async(v) => {
        if (!v.isFolder) {
            let fpSrc = path.resolve(fdSrc, v.rpath)
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('copy file', fpSrc, fpTar)
            let rc = await fsCopyFileCore(fpSrc, fpTar, { path, fs, useSync: false })
            if (resultFailed(rc)) {
                //原丟棄結果物件, 複製失敗仍回true
                return Promise.reject(fsErrMsg(rc.error))
            }
        }
    })

    return b
}


export default fsSyncFolderCore
