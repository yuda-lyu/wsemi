import isu8arr from './isu8arr.mjs'
import iseint from './iseint.mjs'
import isbol from './isbol.mjs'


/**
 * 讀取Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 *
 * 全部參數皆為必須參數，數值參數須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)；offset須為索引(0~4294967294)，mLen與nBytes須為個數(1~4294967295)，且須滿足offset+nBytes不大於buffer長度、mLen小於nBytes*8-1(至少留1位元給指數)，否則(含越界、負數、Infinity、小數)回傳null
 *
 * Fork: {@link https://github.com/toots/buffer-browserify/blob/master/buffer_ieee754.js buffer_ieee754}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufRead.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer|String} offset 輸入平移整數，須為有效整數且為索引(0~4294967294，數字字串亦可)，且offset+nBytes不大於buffer長度，否則回傳null
 * @param {Boolean} isBE 輸入是否為大端序Big-Endian
 * @param {Integer|String} mLen 輸入有效位數整數，須為有效整數且為1~4294967295(數字字串亦可)，且小於nBytes*8-1，否則回傳null
 * @param {Integer|String} nBytes 輸入使用位元組整數，須為有效整數且為1~4294967295(數字字串亦可)，否則回傳null
 * @returns {Number} 回傳數字，輸入無效回傳null
 * @example
 *
 * let offset = 0
 * let isBE = true
 * let mLen = 52
 * let nBytes = 8
 * let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0]) //1447656645380
 * let j = bufRead(b, offset, isBE, mLen, nBytes)
 * console.log(j)
 * // => 1447656645380
 *
 */
function bufRead(buffer, offset, isBE, mLen, nBytes) {

    //check
    if (!isu8arr(buffer)) {
        return null
    }
    if (!iseint(offset, { use: 'index' })) {
        return null
    }
    if (!isbol(isBE)) {
        return null
    }
    if (!iseint(mLen, { use: 'count', min: 1 })) {
        return null
    }
    if (!iseint(nBytes, { use: 'count', min: 1 })) {
        return null
    }

    //判定有效整數後取轉換值, 其後只用轉換值(字串型數字不可參與offset + i之+)
    offset = Number(offset)
    mLen = Number(mLen)
    nBytes = Number(nBytes)

    //讀取範圍不可超出buffer(越界時buffer[…]為undefined, 位移運算會得到失真之數值), 且至少留1位元給指數(eLen = nBytes * 8 - mLen - 1 >= 1)
    if (offset + nBytes > buffer.length) {
        return null
    }
    if (mLen >= nBytes * 8 - 1) {
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
