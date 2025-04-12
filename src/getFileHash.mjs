import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'
import haskey from './haskey.mjs'
import cdbl from './cdbl.mjs'
import getFileBasicHash from './getFileBasicHash.mjs'
import getFileXxHash from './getFileXxHash.mjs'


/**
 * 計算檔案HASH值
 *
 * 瀏覽器端輸入檔案Blob或File，可支援大檔
 *
 * 因Node.js亦已支援Blob，可用new Blob([fs.readFileSync(fp)])取得Blob做為輸入
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileHash.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} inp 輸入檔案Blob或File
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法，預設'sha512'
 * @param {Number} [opt.chunkSize=64*1024*1024] 輸入計算HASH方法為'xxhash64'時，使用切片長度數字，單位位元，預設64*1024*1024(64mb)
 * @returns {Promise} 回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 * @example
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_getFileHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     fsWriteText(fp, 'xyz')
 *
 *     let ab = fs.readFileSync(fp)
 *     let bb = new Blob([ab])
 *
 *     let h1 = await getFileHash(bb)
 *     console.log('getFileHash(sha512)', h1)
 *     ms.push({ 'getFileHash(sha512)': h1 })
 *
 *     let h2 = await getFileHash(bb, { type: 'sha256' })
 *     console.log('getFileHash(sha256)', h2)
 *     ms.push({ 'getFileHash(sha256)': h2 })
 *
 *     let h3 = await getFileHash(bb, { type: 'xxhash64' })
 *     console.log('getFileHash(xxhash64)', h3)
 *     ms.push({ 'getFileHash(xxhash64)': h3 })
 *
 *     let h4 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
 *     console.log('getFileHash(xxhash64,chunkSize=16mb)', h4)
 *     ms.push({ 'getFileHash(xxhash64,chunkSize=16mb)': h4 })
 *
 *     let h5 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
 *     console.log('getFileHash(xxhash64,chunkSize=4mb)', h5)
 *     ms.push({ 'getFileHash(xxhash64,chunkSize=4mb)': h5 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // getFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // getFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // getFileHash(xxhash64) feba48465b833ca1
 * // getFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
 * // getFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
 * // ms [
 * //   {
 * //     'getFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'getFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   },
 * //   { 'getFileHash(xxhash64)': 'feba48465b833ca1' },
 * //   { 'getFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
 * //   { 'getFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
 * // ]
 *
 */
async function getFileHash(inp, opt = {}) {

    //check
    if (!isblob(inp) && !isfile(inp)) {
        console.log('inp', inp)
        return Promise.reject(`inp is not a Blob or File`)
    }

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

    //kp
    let kp = {
        'MD5': 'md5',
        'SHA-1': 'sha1',
        'SHA-256': 'sha256',
        'SHA-384': 'sha384',
        'SHA-512': 'sha512',
        'md5': 'md5',
        'sha1': 'sha1',
        'sha256': 'sha256',
        'sha384': 'sha384',
        'sha512': 'sha512',
        'xxhash64': 'xxhash64',
    }

    //check
    if (!haskey(kp, type)) {
        return Promise.reject(`type[${type}] must be one of [ 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'xxhash64' ]`)
    }

    if (type === 'xxhash64') {
        return getFileXxHash(inp, opt)
    }
    else {
        return getFileBasicHash(inp, opt)
    }
}


export default getFileHash
