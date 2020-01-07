import bufRead from './bufRead.mjs'


/**
 * 讀取Uint8Array(Nodejs,Browser)或Buffer(Nodejs)內的浮點數資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufReadDbl.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer} [offset=0] 輸入平移整數，預設0
 * @param {Boolean} [isBE=true] 輸入是否為大端序Big-Endian，預設true
 * @param {Integer} [mLen=52] 輸入有效位數整數，預設52
 * @param {Integer} [nBytes=8] 輸入使用位元組整數，預設8
 * @returns {Number} 回傳數字
 * @example
 * let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0]) //1447656645380
 * let j = bufReadDbl(b)
 * console.log(j)
 * // => 1447656645380
 */
function bufReadDbl(buffer, offset = 0, isBE = true, mLen = 52, nBytes = 8) {
    return bufRead(buffer, offset, isBE, mLen, nBytes)
}


export default bufReadDbl
