import isu8arr from './isu8arr.mjs'
import iseint from './iseint.mjs'
import isenum from './isenum.mjs'
import isbol from './isbol.mjs'


/**
 * 寫入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 *
 * value為資料值，照IEEE754原樣編碼：型別為number者(含±Infinity、NaN、-0)寫出正確之位元樣式(與Node之Buffer.writeFloatLE/writeDoubleLE一致，NaN為quiet NaN)；字串只收十進位有效數字(isenum，去頭尾空白後取值)，'0x10'、'Infinity'、'NaN'、''等不收；其餘型別(布林、null、包裝物件、BigInt等)不收
 * 其餘參數皆為必須參數，數值參數須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)；offset須為索引(0~4294967294)，mLen與nBytes須為個數(1~4294967295)，且須滿足offset+nBytes不大於buffer長度、mLen小於nBytes*8-1(至少留1位元給指數)且不大於52(JS數值尾數位數，超過者無法精確編碼)、指數位元數eLen(nBytes*8-mLen-1)不大於30(內部以32位元整數位移運算，31以上位移溢位而數值失真)，標準浮點數為(mLen 23, nBytes 4)與(mLen 52, nBytes 8)
 * 成功回傳true，任一輸入無效回傳null且不寫入buffer
 *
 * Fork: {@link https://github.com/toots/buffer-browserify/blob/master/buffer_ieee754.js buffer_ieee754}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufWrite.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} value 輸入要寫入之數字，number型別照IEEE754原樣編碼(含±Infinity、NaN)，字串只收十進位有效數字
 * @param {Uint8Array|Buffer} buffer 輸入被寫入的Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer|String} offset 輸入平移整數，須為有效整數且為索引(0~4294967294，數字字串亦可)，且offset+nBytes不大於buffer長度，否則回傳null
 * @param {Boolean} isBE 輸入是否為大端序Big-Endian
 * @param {Integer|String} mLen 輸入有效位數整數，須為有效整數且為1~52(數字字串亦可)，且小於nBytes*8-1、使指數位元數nBytes*8-mLen-1不大於30，否則回傳null
 * @param {Integer|String} nBytes 輸入使用位元組整數，須為有效整數且為1~4294967295(數字字串亦可)，且使指數位元數nBytes*8-mLen-1不大於30，否則回傳null
 * @returns {Boolean|null} 回傳寫入成功為true，輸入無效為null
 * @example
 *
 * let offset = 0
 * let isBE = true
 * let mLen = 52
 * let nBytes = 8
 *
 * let i = 1447656645380 //new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
 * let b = Buffer.alloc(8)
 * let r = bufWrite(i, b, offset, isBE, mLen, nBytes)
 * console.log(r)
 * // => true
 * console.log(b)
 * // >= <Buffer 42 75 10 f0 f6 30 40 00>
 * console.log(new Uint8Array(b))
 * // => Uint8Array [66, 117, 16, 240, 246, 48, 64, 0]
 *
 * bufWrite(Infinity, b, offset, isBE, mLen, nBytes)
 * console.log(b)
 * // >= <Buffer 7f f0 00 00 00 00 00 00>
 *
 * r = bufWrite('0x10', b, offset, isBE, mLen, nBytes)
 * console.log(r)
 * // => null
 *
 */
function bufWrite(value, buffer, offset, isBE, mLen, nBytes) {

    //check, value為資料值: number型別(含±Infinity、NaN、-0)照IEEE754原樣編碼, 字串只收十進位有效數字(isenum), 其餘型別不收
    if (typeof value === 'string') {
        if (!isenum(value)) {
            return null
        }
        value = Number(value)
    }
    else if (typeof value !== 'number') {
        return null
    }
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

    //寫入範圍不可超出buffer(越界時對typed array之寫入會被靜默忽略而造成資料遺失), 且至少留1位元給指數(eLen = nBytes * 8 - mLen - 1 >= 1)
    if (offset + nBytes > buffer.length) {
        return null
    }
    if (mLen >= nBytes * 8 - 1) {
        return null
    }

    //有效位數mLen不可大於52: JS數值(雙精度)尾數最多52位元(另有隱含位元), 超過者無法精確編碼, 與bufRead讀回之數值失真, 故不寫入
    if (mLen > 52) {
        return null
    }

    //指數位元數eLen不可大於30: 內部以32位元有號整數位移運算(1 << eLen、e << mLen)計算, eLen為31以上時位移溢位而數值失真
    let eLen = nBytes * 8 - mLen - 1
    if (eLen > 30) {
        return null
    }

    //單精度(mLen 23, nBytes 4)先以Math.fround依IEEE754捨入至最近偶數(含次正規數與溢位為Infinity), 下方之捨入補償rt為向上捨入, 遇恰在兩可表示值正中間之值(如16777217)會與Node之Buffer.writeFloatLE差1個ulp
    if (mLen === 23 && nBytes === 4) {
        value = Math.fround(value)
    }

    let e
    let m
    let c
    let eMax = (1 << eLen) - 1
    let eBias = eMax >> 1
    let rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    let i = isBE ? (nBytes - 1) : 0
    let d = isBE ? -1 : 1
    let s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

    value = Math.abs(value)

    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? Math.pow(2, mLen - 1) : 0 //NaN為quiet NaN(尾數最高位元為1), 與Node之Buffer.writeFloatLE/writeDoubleLE一致
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

    return true
}


export default bufWrite
