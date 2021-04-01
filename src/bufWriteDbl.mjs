import bufWrite from './bufWrite.mjs'


/**
 * 寫入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)內的浮點數資料，需先依照nBytes宣告Uint8Array或Buffer空間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bufWriteDbl.test.js Github}
 * @memberOf wsemi
 * @param {Number} value 輸入數字
 * @param {Uint8Array|Buffer} buffer 輸入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)資料
 * @param {Integer} [offset=0] 輸入平移整數，預設0
 * @param {Boolean} [isBE=true] 輸入是否為大端序Big-Endian，預設true
 * @param {Integer} [mLen=52] 輸入有效位數整數，預設52
 * @param {Integer} [nBytes=8] 輸入使用位元組整數，預設8
 * @returns {Number} 回傳數字
 * @example
 *
 * let i = 1447656645380 //new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
 * let b = Buffer.alloc(8)
 * bufWriteDbl(i, b)
 * console.log(b)
 * // >= <Buffer 42 75 10 f0 f6 30 40 00>
 * console.log(new Uint8Array(b))
 * // => Uint8Array [66, 117, 16, 240, 246, 48, 64, 0]
 *
 */
function bufWriteDbl(value, buffer, offset = 0, isBE = true, mLen = 52, nBytes = 8) {
    return bufWrite(value, buffer, offset, isBE, mLen, nBytes)
}


export default bufWriteDbl
