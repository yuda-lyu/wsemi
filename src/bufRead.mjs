import isu8arr from './isu8arr.mjs'
import isint from './isint.mjs'
import isbol from './isbol.mjs'


/**
 * 讀取Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 *
 * Fork: {@link https://github.com/toots/buffer-browserify buffer-browserify}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufRead.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer} offset 輸入平移整數
 * @param {Boolean} isBE 輸入是否為大端序Big-Endian
 * @param {Integer} mLen 輸入有效位數整數
 * @param {Integer} nBytes 輸入使用位元組整數
 * @returns {Number} 回傳數字
 * @example
 * let offset = 0
 * let isBE = true
 * let mLen = 52
 * let nBytes = 8
 * let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0]) //1447656645380
 * let j = bufRead(b, offset, isBE, mLen, nBytes)
 * console.log(j)
 * // => 1447656645380
 */
function bufRead(buffer, offset, isBE, mLen, nBytes) {

    //check
    if (!isu8arr(buffer)) {
        return null
    }
    if (!isint(offset)) {
        return null
    }
    if (!isbol(isBE)) {
        return null
    }
    if (!isint(mLen)) {
        return null
    }
    if (!isint(nBytes)) {
        return null
    }

    let e
    let m
    let eLen = nBytes * 8 - mLen - 1
    let eMax = (1 << eLen) - 1
    let eBias = eMax >> 1
    let nBits = -7
    let i = isBE ? 0 : (nBytes - 1)
    let d = isBE ? 1 : -1
    let s = buffer[offset + i]

    i += d

    e = s & ((1 << (-nBits)) - 1)
    s >>= (-nBits)
    nBits += eLen
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

    m = e & ((1 << (-nBits)) - 1)
    e >>= (-nBits)
    nBits += mLen
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

    if (e === 0) {
        e = 1 - eBias
    }
    else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
    }
    else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}


export default bufRead
