import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
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


/**
 * 後端nodejs針對新舊資料夾進行差異同步
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSyncFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源資料夾字串
 * @param {String} fdTar 輸入目標資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @returns {Promise} 回傳Promise，resolve代表同步成功，reject代表回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * //see fsSyncFolder
 *
 */
async function fsSyncFolderCore(fdSrc, fdTar, opt = {}) {
    let levelLimit = null

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
    if (!fsIsFolderCore(fdSrc, { fs })) {
        throw new Error(`fdSrc[${fdSrc}] is not a folder`)
    }

    //check
    if (!fsIsFolderCore(fdTar, { fs })) {
        await fsCopyFolderCore(fdSrc, fdTar, { path, fs, useSync: false })
        return
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

    //先針對fdTar內刪除已消失之資料夾
    await pmSeries(r.del, async(v) => {
        if (v.isFolder) {
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('del folder', fpTar)
            fsDeleteFolderCore(fpTar, { fs })
        }
    })

    //再針對fdTar內刪除已消失之檔案, 可能有些檔案已於前階段刪除資料夾時已被刪除, 故不能偵測error報錯
    await pmSeries(r.del, async(v) => {
        if (!v.isFolder) {
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('del file', fpTar)
            fsDeleteFileCore(fpTar, { fs })
        }
    })

    //再針對fdSrc內新增或變更的檔案進行複製過去fdTar
    await pmSeries([...r.add, ...r.diff], async(v) => {
        if (!v.isFolder) {
            let fpSrc = path.resolve(fdSrc, v.rpath)
            let fpTar = path.resolve(fdTar, v.rpath)
            // console.log('copy file', fpSrc, fpTar)
            await fsCopyFileCore(fpSrc, fpTar, { path, fs, useSync: false })
        }
    })

}


export default fsSyncFolderCore
