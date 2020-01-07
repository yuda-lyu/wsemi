import bufWrite from './bufWrite.mjs'


/**
 * 讀取Uint8Array(Nodejs,Browser)或Buffer(Nodejs)內的浮點數資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufWriteDbl.test.js Github}
 * @memberOf wsemi
 * @param {Number} value 輸入數字
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer} offset 輸入平移整數
 * @param {Boolean} isBE 輸入是否為大端序Big-Endian
 * @param {Integer} mLen 輸入有效位數整數
 * @param {Integer} nBytes 輸入使用位元組整數
 * @returns {Number} 回傳數字
 * @example
 * let i = 1447656645380 //new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
 * let b = Buffer.alloc(8)
 * bufWriteDbl(i, b)
 * console.log(b)
 * // >= <Buffer 42 75 10 f0 f6 30 40 00>
 * console.log(new Uint8Array(b))
 * // => Uint8Array [66, 117, 16, 240, 246, 48, 64, 0]
 */
function bufWriteDbl(value, buffer, offset = 0, isBE = true, mLen = 52, nBytes = 8) {
    return bufWrite(value, buffer, offset, isBE, mLen, nBytes)
}


export default bufWriteDbl
