import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import isestr from './isestr.mjs'
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
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs針對新舊資料夾進行差異同步
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSyncFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源資料夾字串
 * @param {String} fdTar 輸入目標資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @returns {Promise} 回傳Promise，resolve回傳是否有進行同步的布林值，reject回傳錯誤訊息字串(含複製失敗，與刪除目標內多出之檔案或資料夾失敗)
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

        //type
        let type = get(opt, 'type', '')
        if (!isestr(type)) {
            type = 'md5'
        }

        return await core(fdSrc, fdTar, { path, fs, crypto, type })
    }
    catch (err) {
        //opt不可讀之Error、前置檢查與複製失敗之字串、fsTreeFolderCore之readdirSync(EPERM等)Error、注入之fs拋出之任意值, 一律轉字串; 已為字串者原樣
        return Promise.reject(errToStr(err))
    }
}


//resultFailed, 複製(fsCopyFolderCore、fsCopyFileCore)與刪除(fsDeleteFolderCore、fsDeleteFileCore)之結果物件帶error鍵即失敗; 以鍵判定而不以error值之真假判定(error值可為null等非字串之值)
function resultFailed(rc) {
    return Object.prototype.hasOwnProperty.call(rc, 'error')
}


//core, 差異同步; 任何失敗由fsSyncFolderCore統一轉字串reject
async function core(fdSrc, fdTar, { path, fs, crypto, type }) {
    let levelLimit = null

    //check
    if (!fsIsFolderCore(fdSrc, { fs })) {
        return Promise.reject(`fdSrc[${fdSrc}] is not a folder`)
    }

    //b
    let b = false

    //check
    if (!fsIsFolderCore(fdTar, { fs })) {
        let rc = await fsCopyFolderCore(fdSrc, fdTar, { path, fs, useSync: false })
        if (resultFailed(rc)) {
            //原丟棄結果物件而恆回true(目標為既有檔案、上層為檔案等複製失敗時偽成功)
            return Promise.reject(errToStr(rc.error))
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
                return Promise.reject(errToStr(rd.error))
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
                return Promise.reject(errToStr(rd.error))
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
                return Promise.reject(errToStr(rc.error))
            }
        }
    })

    return b
}


export default fsSyncFolderCore
