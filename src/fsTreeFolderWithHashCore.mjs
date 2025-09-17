import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import pmSeries from './pmSeries.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFolderBasicHashCore from './fsGetFolderBasicHashCore.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾，且計算各自HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderWithHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Integer} [levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，設定null為無窮遍歷所有檔案與資料夾，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @param {Boolean} [opt.forFile=true] 輸入是否針對檔案計算HASH值，預設true
 * @param {Boolean} [opt.forFolder=false] 輸入是否針對檔案計算HASH值，預設false
 * @returns {Promise} 回傳Promise，resolve回傳檔案或資料夾陣列且含HASH值，reject代表回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * //see fsTreeFolderWithHash
 *
 */
async function fsTreeFolderWithHashCore(fd, levelLimit = 1, opt = {}) {

    //path, fs, crypto
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

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        throw new Error(`fd[${fd}] is not a folder`)
    }

    // //check, 改交由fsTreeFolderCore檢核
    // if (levelLimit !== null && ispint(levelLimit)) {
    //     levelLimit = cint(levelLimit)
    //     if (levelLimit < 1) {
    //         levelLimit = 1
    //     }
    // }

    //vfps
    let vfps = fsTreeFolderCore(fd, levelLimit, { path, fs })
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
