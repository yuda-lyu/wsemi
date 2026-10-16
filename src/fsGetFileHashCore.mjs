import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFileXxHashCore from './fsGetFileXxHashCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法字串為'xxhash64'時，使用切片長度數字，單位位元，上限2^30(1024*1024*1024，1gb)，非正整數(0、負數、小數、非數字)或超過上限時使用預設值，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileHash
 *
 */
function fsGetFileHashCore(fp, opt = {}) {

    //pm
    let pm = genPm()

    //讀取opt與check, 本函數非async, opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出與注入之fs之lstatSync拋錯須於此攔截, 否則成同步拋錯
    let fs = null
    let crypto = null
    let type = ''
    let chunkSize = 0
    let isFile = false
    try {

        //fs, crypto
        fs = get(opt, 'fs')
        crypto = get(opt, 'crypto')

        //type
        type = get(opt, 'type', '')
        if (!isestr(type)) {
            type = 'sha512'
        }

        //chunkSize
        chunkSize = get(opt, 'chunkSize')
        if (!isnum(chunkSize)) {
            chunkSize = 64 * 1024 * 1024 //64mb
        }
        chunkSize = cdbl(chunkSize)

        //check
        isFile = fsIsFileCore(fp, { fs })

    }
    catch (err) {
        pm.reject(errToStr(err))
        return pm
    }
    if (!isFile) {
        pm.reject(`fp[${fp}] is not a file`)
        return pm
    }

    if (type === 'xxhash64') {
        return fsGetFileXxHashCore(fp, { fs, chunkSize })
    }
    else {
        return fsGetFileBasicHashCore(fp, { fs, crypto, type })
    }

}


export default fsGetFileHashCore
