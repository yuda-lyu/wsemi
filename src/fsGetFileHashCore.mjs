import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import fsGetFileBasicHashCore from './fsGetFileBasicHashCore.mjs'
import fsGetFileXxHashCore from './fsGetFileXxHashCore.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法為'xxhash64'時，使用切片長度數字，單位位元，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject代表回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileHash
 *
 */
function fsGetFileHashCore(fp, opt = {}) {

    //fs, crypto
    let fs = get(opt, 'fs')
    let crypto = get(opt, 'crypto')

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'sha512'
    }

    //chunkSize
    let chunkSize = get(opt, 'chunkSize')
    if (!isnum(chunkSize)) {
        chunkSize = 64 * 1024 * 1024 //64mb
    }
    chunkSize = cdbl(chunkSize)

    //pm
    let pm = genPm()

    //check
    if (!fsIsFileCore(fp, { fs })) {
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
