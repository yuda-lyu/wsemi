import {
    // createAdler32(): Promise<IHasher>
    // createBLAKE2b(bits?: number, key?: IDataType): Promise<IHasher> // default is 512 bits
    // createBLAKE2s(bits?: number, key?: IDataType): Promise<IHasher> // default is 256 bits
    // createBLAKE3(bits?: number, key?: IDataType): Promise<IHasher> // default is 256 bits
    // createCRC32(polynomial?: number): Promise<IHasher> // default polynomial is 0xedb88320, for CRC32C use 0x82f63b78
    // createCRC64(polynomial?: number): Promise<IHasher> // default polynomial is 'c96c5795d7870f42' (ECMA)
    // createKeccak(bits?: 224 | 256 | 384 | 512): Promise<IHasher> // default is 512 bits
    // createMD4(): Promise<IHasher>
    createMD5, //createMD5(): Promise<IHasher>
    // createRIPEMD160(): Promise<IHasher>
    createSHA1, //createSHA1(): Promise<IHasher>
    // createSHA224(): Promise<IHasher>
    createSHA256, //createSHA256(): Promise<IHasher>
    createSHA384, //// createSHA384(): Promise<IHasher>
    createSHA512 //createSHA512(): Promise<IHasher>
    // createSHA3(bits?: 224 | 256 | 384 | 512): Promise<IHasher> // default is 512 bits
    // createSM3(): Promise<IHasher>
    // createWhirlpool(): Promise<IHasher>
    // createXXHash32(seed: number): Promise<IHasher>
    // createXXHash64(seedLow: number, seedHigh: number): Promise<IHasher>
    // createXXHash3(seedLow: number, seedHigh: number): Promise<IHasher>
    // createXXHash128(seedLow: number, seedHigh: number): Promise<IHasher>
    // createHMAC(hashFunction: Promise<IHasher>, key: IDataType): Promise<IHasher>
} from 'hash-wasm'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isblob from './isblob.mjs'
import isfile from './isfile.mjs'
import haskey from './haskey.mjs'
import cdbl from './cdbl.mjs'


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
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'
 * @returns {Promise} 回傳Promise，此時若成功則resolve代表檔案HASH值，若失敗則reject錯誤訊息
 * @example
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_getFileBasicHash'
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
 *     let h1 = await getFileBasicHash(bb)
 *     console.log('getFileBasicHash(sha512)', h1)
 *     ms.push({ 'getFileBasicHash(sha512)': h1 })
 *
 *     let h2 = await getFileBasicHash(bb, { type: 'sha256' })
 *     console.log('getFileBasicHash(sha256)', h2)
 *     ms.push({ 'getFileBasicHash(sha256)': h2 })
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
 * // getFileBasicHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
 * // getFileBasicHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
 * // ms [
 * //   {
 * //     'getFileBasicHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
 * //   },
 * //   {
 * //     'getFileBasicHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
 * //   }
 * // ]
 *
 */
async function getFileBasicHash(inp, opt = {}) {

    //瀏覽器crypto.subtle.digest是只支援一次性記憶體計算, 又只能非同步async計算, 故採用hash-wasm計算可支援超大檔

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
        'MD5': createMD5,
        'SHA-1': createSHA1,
        'SHA-256': createSHA256,
        'SHA-384': createSHA384,
        'SHA-512': createSHA512,
        'md5': createMD5,
        'sha1': createSHA1,
        'sha256': createSHA256,
        'sha384': createSHA384,
        'sha512': createSHA512,
    }
    // createMD5, //createMD5(): Promise<IHasher>
    // createSHA1, //createSHA1(): Promise<IHasher>
    // createSHA256, //createSHA256(): Promise<IHasher>
    // createSHA512, //createSHA512(): Promise<IHasher>
    // createSHA3 //createSHA3(bits?: 224 | 256 | 384 | 512): Promise<IHasher> // default is 512 bits

    //check
    if (!haskey(kp, type)) {
        return Promise.reject(`type[${type}] must be one of [ 'md5', 'sha1', 'sha256', 'sha384', 'sha512' ]`)
    }

    //funCreate
    let funCreate = get(kp, type)

    //hasher
    let hasher = await funCreate()

    //calc hash
    let offset = 0
    while (offset < inp.size) {
        let chunk = inp.slice(offset, offset + chunkSize)
        let buffer = await chunk.arrayBuffer()
        hasher.update(new Uint8Array(buffer))
        offset += chunkSize
    }
    let hashHex = hasher.digest()

    return hashHex
}


export default getFileBasicHash
