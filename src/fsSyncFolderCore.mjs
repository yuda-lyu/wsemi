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
import toResultError from './_toResultError.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'
import isPathInside from './_isPathInside.mjs'


//目標路徑經過連結、整份複製之來源含連結之固定訊息(不帶路徑; R-FS-SYNC-LINK-01)
let MSG_TAR_LINK = 'invalid sync target: must not be or cross a link inside fdTar'
let MSG_SRC_LINK = 'invalid fdSrc: must not contain a link'


/**
 * 後端nodejs針對新舊資料夾進行差異同步
 *
 * 比對之相對路徑僅於opt.path.sep為反斜線(Windows)時把反斜線換成'/'；其他平台之反斜線為合法之檔名字元，照原樣比對、刪除與寫入
 * 目標資料夾存在而做差異同步時，將刪除與寫入之路徑字串須嚴格位於目標資料夾內(以opt.path.relative核對，不得為目標資料夾本身、其外或另一磁碟機)，任一不合即reject說明字串'invalid sync target: must be strictly inside fdTar'(不帶輸入值)，此次不做任何刪除與寫入
 * 寫入與刪除不經過目標資料夾內之連結：本次要刪除與寫入之各目標路徑，自目標資料夾之下一段起以opt.fs.lstatSync逐段判定，任一段(含目標本身)為連結(符號連結、Windows之junction)即reject說明字串'invalid sync target: must not be or cross a link inside fdTar'(不帶輸入值)，此次不做任何刪除與寫入；目標資料夾本身(使用者指定之路徑)為連結者允許，不在判定範圍
 * 目標不是資料夾(不存在、為檔案或本身為連結)時整份複製(不刪除目標多出之項目)：寫入前先走訪來源，來源任一層含連結即reject說明字串'invalid fdSrc: must not contain a link'，寫入目標之對應路徑(目標資料夾本身除外)含連結即reject同上之目標訊息，皆不做任何寫入；複製期間每次建資料夾與寫檔前再判定一次且不建立任何連結，此時才發現者亦reject(已寫入目標內之項目保留)
 * 差異同步之來源內含目錄連結者視為不含檔案之資料夾(不進入列舉)；任一端之檔案連結於列舉雜湊時reject
 * 連結之判定以opt.fs.lstatSync之isSymbolicLink()為準，判定回非'ENOENT'、'ENOTDIR'之錯誤即reject
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSyncFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源資料夾字串
 * @param {String} fdTar 輸入目標資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync、mkdirSync、readdirSync、createReadStream、createWriteStream、unlinkSync、rmSync(刪除目標多出之項目先於複製，故須於第一個刪除或複製之前齊備)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing …'(不帶輸入值，先於任何複製與刪除)
 * @param {Object} opt.path 輸入path物件，須提供resolve、dirname、join、basename、relative、isAbsolute與非空字串sep；缺漏同opt.fs，reject說明字串'invalid opt.path: must be an object providing …'
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


//kindByLstat, 以注入之lstatSync(不跟進連結)判定路徑: 'link'(符號連結、Windows之junction)、'dir'、'other'; 不存在(ENOENT)或上層不是資料夾(ENOTDIR)回'none'; 其他錯誤照拋(無法判定即不放行)
function kindByLstat(fp, { fs }) {
    let s = null
    try {
        s = fs.lstatSync(fp)
    }
    catch (err) {
        let code = get(err, 'code')
        if (code === 'ENOENT' || code === 'ENOTDIR') {
            return 'none'
        }
        throw err
    }
    if (s.isSymbolicLink()) {
        return 'link'
    }
    return s.isDirectory() ? 'dir' : 'other'
}


//crossesLink, 差異同步之連結核對: 各目標路徑自root(目標資料夾, 本身不查)之下一段起逐段判定, 任一段(含目標本身)為連結即回true; 遇不存在或非資料夾即止(其下沒有項目); 同一路徑只查一次
function crossesLink(root, fps, { path, fs }) {
    let kinds = new Map()
    for (let fp of fps) {
        let cur = root
        for (let seg of path.relative(root, fp).split(path.sep)) {
            cur = path.join(cur, seg)
            if (!kinds.has(cur)) {
                kinds.set(cur, kindByLstat(cur, { fs }))
            }
            let kind = kinds.get(cur)
            if (kind === 'link') {
                return true
            }
            if (kind !== 'dir') {
                break
            }
        }
    }
    return false
}


//chkCopyLinks, 整份複製之連結核對: 寫入前走訪全部來源(組路徑與遞迴之判定同fsCopyFolderCore: path.join、lstatSync), 來源任一項為連結回MSG_SRC_LINK, 其於fdTar內之對應路徑任一段(fdTar本身不查)為連結回MSG_TAR_LINK, 全部合格回null
function chkCopyLinks(fdSrc, fdTar, { path, fs }) {

    //walk, bTo為對應之目標資料夾是否可能存在項目(不存在或非資料夾者其下沒有項目, 不再判定目標)
    let walk = (fdFrom, fdTo, bTo) => {
        for (let name of fs.readdirSync(fdFrom)) {
            let fpFrom = path.join(fdFrom, name)
            let s = fs.lstatSync(fpFrom)
            if (s.isSymbolicLink()) {
                return MSG_SRC_LINK
            }
            let fpTo = path.join(fdTo, name)
            let kind = bTo ? kindByLstat(fpTo, { fs }) : 'none'
            if (kind === 'link') {
                return MSG_TAR_LINK
            }
            if (s.isDirectory()) {
                let msg = walk(fpFrom, fpTo, kind === 'dir')
                if (msg) {
                    return msg
                }
            }
        }
        return null
    }

    return walk(fdSrc, fdTar, true)
}


//guardCopyFs, 整份複製(fsCopyFolderCore)所用之fs: 每次建資料夾與寫檔前以crossesLink再判定該目標路徑(來源與目標重疊時, 複製途中會列舉出事前走訪所沒有之路徑), 且不建立任何連結(同步不把來源之連結建到目標)
function guardCopyFs(fdTar, { path, fs }) {
    let root = path.resolve(fdTar)
    let guard = (fp) => {
        let fpAbs = path.resolve(fp)
        if (isPathInside(root, fpAbs, { path }) && crossesLink(root, [fpAbs], { path, fs })) {
            throw MSG_TAR_LINK
        }
    }
    return {
        statSync: (...args) => fs.statSync(...args),
        lstatSync: (...args) => fs.lstatSync(...args),
        readdirSync: (...args) => fs.readdirSync(...args),
        createReadStream: (...args) => fs.createReadStream(...args),
        readlinkSync: (...args) => fs.readlinkSync(...args),
        mkdirSync: (fp, ...args) => {
            guard(fp)
            return fs.mkdirSync(fp, ...args)
        },
        createWriteStream: (fp, ...args) => {
            guard(fp)
            return fs.createWriteStream(fp, ...args)
        },
        symlinkSync: () => {
            throw MSG_SRC_LINK
        },
    }
}


//core, 差異同步; 任何失敗由fsSyncFolderCore統一轉字串reject
async function core(fdSrc, fdTar, { path, fs, crypto, type }) {

    //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
    let msgPath = chkFsPath(fdSrc, 'fdSrc') || chkFsPath(fdTar, 'fdTar')
    if (msgPath) {
        return Promise.reject(msgPath)
    }

    //check, 注入之fs、path、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷、複製與刪除, 以說明字串reject(不帶輸入值)
    let msgDeps = chkFsDeps({ fs, path, crypto }, {
        fs: ['statSync', 'lstatSync', 'mkdirSync', 'readdirSync', 'createReadStream', 'createWriteStream', 'unlinkSync', 'rmSync'], //多步驟破壞性Core: 刪除目標多出之項目先於複製, 方法須於第一個破壞性動作前齊備
        path: ['resolve', 'dirname', 'join', 'basename', 'relative', 'isAbsolute', 'sep:string'],
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
        //連結核對(R-FS-SYNC-LINK-01), 整份複製會把來源之連結原樣建到目標、亦會寫過目標內既有之連結, 先於任何寫入拒收; 走訪之失敗與複製失敗同一轉換
        let msgLink = null
        try {
            msgLink = chkCopyLinks(fdSrc, fdTar, { path, fs })
        }
        catch (err) {
            return Promise.reject(fsErrMsg(toResultError(err)))
        }
        if (msgLink) {
            return Promise.reject(msgLink)
        }
        let rc = await fsCopyFolderCore(fdSrc, fdTar, { path, fs: guardCopyFs(fdTar, { path, fs }), useSync: false })
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
        //僅分隔字元為反斜線(Windows)時換成'/'; 其他平台之反斜線為合法之檔名字元, 照原樣比對與操作(R-FS-SYNC-PATH-01)
        if (dlm === '\\') {
            rpath = rpath.replaceAll('\\', '/')
        }
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
    let vfpsSrc = await fsTreeFolderWithHashCore(fdSrc, { path, fs, crypto, type, forFile: true, forFolder: false }) //全部層級: 不給opt.levelLimit即窮舉全部(R-LEVEL-LIMIT-02)
    vfpsSrc = cvs(vfpsSrc, path.resolve(fdSrc))
    // console.log('vfpsSrc', vfpsSrc)

    //vfpsTar
    let vfpsTar = await fsTreeFolderWithHashCore(fdTar, { path, fs, crypto, type, forFile: true, forFolder: false })
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

    //vsDel, vsCopy, 將刪除(目標多出之資料夾與檔案)與寫入(新增、變更之檔案)之項目, 附上目標路徑
    let addFpTar = (vs) => map(vs, (v) => {
        return { ...v, fpTar: path.resolve(fdTar, v.rpath) }
    })
    let vsDel = addFpTar(r.del)
    let vsCopy = addFpTar([...r.add, ...r.diff].filter((v) => !v.isFolder))

    //落點核對(R-FS-SYNC-PATH-01), 目標路徑須嚴格位於fdTar內, 任一不合即reject固定訊息(不帶路徑), 全部核對先於任何刪除與寫入; 其後以核對過之同一路徑操作
    let fdTarAbs = path.resolve(fdTar)
    let fpTars = map([...vsDel, ...vsCopy], (v) => v.fpTar)
    if (fpTars.some((fp) => !isPathInside(fdTarAbs, fp, { path }))) {
        return Promise.reject('invalid sync target: must be strictly inside fdTar')
    }

    //連結核對(R-FS-SYNC-LINK-01), 目標資料夾內之連結使刪除與寫入落到目標資料夾外, 全部核對先於任何刪除與寫入
    if (crossesLink(fdTarAbs, fpTars, { path, fs })) {
        return Promise.reject(MSG_TAR_LINK)
    }

    //先針對fdTar內刪除已消失之資料夾
    await pmSeries(vsDel, async(v) => {
        if (v.isFolder) {
            let fpTar = v.fpTar
            // console.log('del folder', fpTar)
            let rd = fsDeleteFolderCore(fpTar, { fs })
            if (resultFailed(rd)) {
                //原丟棄結果物件, 刪除失敗(被占用、無權限等)仍回true而目標殘留多出之資料夾
                return Promise.reject(fsErrMsg(rd.error))
            }
        }
    })

    //再針對fdTar內刪除已消失之檔案, 已於前階段隨資料夾刪除者fsDeleteFileCore回success(目標不存在仍算刪除成功), 不致誤報
    await pmSeries(vsDel, async(v) => {
        if (!v.isFolder) {
            let fpTar = v.fpTar
            // console.log('del file', fpTar)
            let rd = fsDeleteFileCore(fpTar, { fs })
            if (resultFailed(rd)) {
                //原丟棄結果物件, 刪除失敗(被占用、無權限等)仍回true而目標殘留多出之檔案
                return Promise.reject(fsErrMsg(rd.error))
            }
        }
    })

    //再針對fdSrc內新增或變更的檔案進行複製過去fdTar
    await pmSeries(vsCopy, async(v) => {
        let fpSrc = path.resolve(fdSrc, v.rpath)
        let fpTar = v.fpTar
        // console.log('copy file', fpSrc, fpTar)
        let rc = await fsCopyFileCore(fpSrc, fpTar, { path, fs, useSync: false })
        if (resultFailed(rc)) {
            //原丟棄結果物件, 複製失敗仍回true
            return Promise.reject(fsErrMsg(rc.error))
        }
    })

    return b
}


export default fsSyncFolderCore
