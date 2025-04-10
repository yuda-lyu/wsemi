import crypto from 'crypto'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'


/**
 * 前端計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} inp 輸入檔案Blob或File
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @returns {Promise} 回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 * @example
 * need test in browser
 *
 * let fl = 'FILE'
 * console.log(getFileHash(fl))
 * // => '{hash}'
 *
 */
async function getFileHash(inp, opt = {}) {

    //check
    if (!isblob(inp) && !isfile(inp)) {
        return Promise.reject(`inp is not a Blob or File`)
    }

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'sha512'
    }

    //kp
    let kp = {
        'SHA-1': 'SHA-1',
        'SHA-256': 'SHA-256',
        'SHA-384': 'SHA-384',
        'SHA-512': 'SHA-512',
        'sha1': 'SHA-1',
        'sha256': 'SHA-256',
        'sha384': 'SHA-384',
        'sha512': 'SHA-512',
    }

    //_type
    let _type = get(kp, type, '')

    //check
    if (!isestr(_type)) {
        return Promise.reject(`type[${type}] must be one of [ 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512' ]`)
    }

    //ab
    let ab = await inp.arrayBuffer()

    //hashBuffer, 計算hash
    let hashBuffer = await crypto.subtle.digest(_type, ab)

    //hashArray, 轉為byte array
    let hashArray = Array.from(new Uint8Array(hashBuffer))

    //hashHex, 轉hex字串
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return hashHex
}


export default getFileHash
