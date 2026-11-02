import bufRead from './bufRead.mjs'


/**
 * 讀取Uint8Array(Nodejs,Browser)或Buffer(Nodejs)內的浮點數資料
 * 參數規則同bufRead：offset、mLen、nBytes須為有效整數且須滿足offset+nBytes不大於buffer長度、mLen不大於52、指數位元數nBytes*8-mLen-1介於1至30，否則回傳null
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufReadDbl.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer|String} [offset=0] 輸入平移整數，預設0
 * @param {Boolean} [isBE=true] 輸入是否為大端序Big-Endian，預設true
 * @param {Integer|String} [mLen=52] 輸入有效位數整數，預設52
 * @param {Integer|String} [nBytes=8] 輸入使用位元組整數，預設8
 * @returns {Number} 回傳數字，輸入無效回傳null
 * @example
 *
 * let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0]) //1447656645380
 * let j = bufReadDbl(b)
 * console.log(j)
 * // => 1447656645380
 *
 */
function bufReadDbl(buffer, offset = 0, isBE = true, mLen = 52, nBytes = 8) {
    return bufRead(buffer, offset, isBE, mLen, nBytes)
}


export default bufReadDbl
