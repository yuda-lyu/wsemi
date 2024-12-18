import fs from 'fs'
import crypto from 'crypto'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFile from './fsIsFile.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


function fsGetFileHashAsync(fp, type = 'sha512') {

    //pm
    let pm = genPm()

    //check
    if (!fsIsFile(fp)) {
        pm.reject(`fp[${fp}] is not a file`)
    }

    try {

        //createHash
        let hash = crypto.createHash(type)

        //createReadStream
        let input = fs.createReadStream(fp)

        //readable
        input.on('readable', () => {
            let data = input.read()
            if (data) {
                hash.update(data)
            }
            else {
                pm.resolve(hash.digest('hex'))
            }
        })

        //error
        input.on('error', (err) => {
            pm.reject(err.toString())
        })

    }
    catch (err) {
        pm.reject(err.toString())
    }

    return pm
}


function fsGetFileHashSync(fp, type = 'sha512') {

    //check
    if (!fsIsFile(fp)) {
        throw new Error(`fp[${fp}] is not a file`)
    }

    //r
    let buffer = fs.readFileSync(fp)
    let hash = crypto.createHash(type)
    hash.update(buffer, 'utf8')
    let r = hash.digest('hex')

    return r
}


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案位置
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {String|Promise} 若useSync=true回傳檔案HASH值字串，若useSync=false則回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 *
 * @example
 * need test in nodejs.
 *
 * let r
 *
 * r = fsGetFileHash(fp, {
 *   type: 'sha512',
 *   useSync: true,
 * })
 * console.log(r)
 * // => '{HASH值}'
 *
 * r = await fsGetFileHash(fp, {
 *   type: 'sha512',
 *   useSync: false,
 * })
 * console.log(r)
 * // => '{HASH值}'
 *
 */
function fsGetFileHash(fp, opt = {}) {

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'sha512'
    }

    //useSync
    let useSync = get(opt, 'useSync', '')
    if (!isbol(useSync)) {
        useSync = true
    }

    let r = ''
    if (useSync) {
        r = fsGetFileHashSync(fp, type)
    }
    else {
        r = fsGetFileHashAsync(fp, type)
    }

    return r
}


export default fsGetFileHash
