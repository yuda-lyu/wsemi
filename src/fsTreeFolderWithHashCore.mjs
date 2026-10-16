import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import pmSeries from './pmSeries.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsTreeFolderCore from './fsTreeFolderCore.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFolderBasicHashCore from './fsGetFolderBasicHashCore.mjs'
import errToStr from './_errToStr.mjs'


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
 * @returns {Promise} 回傳Promise，resolve回傳檔案或資料夾陣列且含HASH值，reject回傳錯誤訊息字串
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

        return await core(fd, levelLimit, { path, fs, crypto, type, forFile, forFolder })
    }
    catch (err) {
        //opt不可讀之Error、前置檢查之字串、fsTreeFolderCore之readdirSync(EPERM等)Error、注入之fs拋出之任意值, 一律轉字串; 已為字串者原樣
        return Promise.reject(errToStr(err))
    }
}


//core, 列舉並計算HASH; 任何失敗由fsTreeFolderWithHashCore統一轉字串reject
async function core(fd, levelLimit, { path, fs, crypto, type, forFile, forFolder }) {

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
