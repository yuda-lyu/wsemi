import isnum from './isnum.mjs'
import isu8arr from './isu8arr.mjs'
import isint from './isint.mjs'
import isbol from './isbol.mjs'
import cdbl from './cdbl.mjs'


/**
 * 寫入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufWrite.test.js Github}
 * @memberOf wsemi
 * @param {Number} value 輸入數字
 * @param {Uint8Array|Buffer} buffer 輸入被寫入的Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer} offset 輸入平移整數
 * @param {Boolean} isBE 輸入是否為大端序Big-Endian
 * @param {Integer} mLen 輸入有效位數整數
 * @param {Integer} nBytes 輸入使用位元組整數
 * @example
 * let offset = 0
 * let isBE = true
 * let mLen = 52
 * let nBytes = 8
 *
 * let i = 1447656645380 //new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
 * let b = Buffer.alloc(8)
 * bufWrite(i, b, offset, isBE, mLen, nBytes)
 * console.log(b)
 * // >= <Buffer 42 75 10 f0 f6 30 40 00>
 * console.log(new Uint8Array(b))
 * // => Uint8Array [66, 117, 16, 240, 246, 48, 64, 0]
 */
function bufWrite(value, buffer, offset, isBE, mLen, nBytes) {

    //check
    if (!isnum(value)) {
        return null
    }
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

    //cdbl
    value = cdbl(value)

    let e
    let m
    let c
    let eLen = nBytes * 8 - mLen - 1
    let eMax = (1 << eLen) - 1
    let eBias = eMax >> 1
    let rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    let i = isBE ? (nBytes - 1) : 0
    let d = isBE ? -1 : 1
    let s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

    value = Math.abs(value)

    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
    }
    else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--
            c *= 2
        }
        if (e + eBias >= 1) {
            value += rt / c
        }
        else {
            value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
            e++
            c /= 2
        }

        if (e + eBias >= eMax) {
            m = 0
            e = eMax
        }
        else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen)
            e = e + eBias
        }
        else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
            e = 0
        }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

    e = (e << mLen) | m
    eLen += mLen
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

    buffer[offset + i - d] |= s * 128

    return null
}


export default bufWrite
