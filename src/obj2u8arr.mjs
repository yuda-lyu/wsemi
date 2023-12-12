import each from 'lodash-es/each'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import getBufferSize from './getBufferSize.mjs'
import obj2stru8arr from './obj2stru8arr.mjs'
import str2u8arr from './str2u8arr.mjs'
import bufWriteDbl from './bufWriteDbl.mjs'


// function concatU8arr(a, b) { //處理大檔時Nodejs記憶體會不足
//     return Uint8Array.from([...a, ...b])
// }
function concatU8arr(a, b) {
    let ia = getBufferSize(a)
    let ib = getBufferSize(b)
    let tmp = new Uint8Array(ia + ib)
    tmp.set(new Uint8Array(a), 0)
    tmp.set(new Uint8Array(b), ia)
    return tmp
}


/**
 * 物件或陣列資料轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Object|Array} data 輸入物件或陣列資料，物件內可支援Uint8Array、Uint16Array、ArrayBuffer，注意因ArrayBuffer無法直接操作(非View，只有TypedArray與DataView可操作)故預設會轉Uint8Array進行處理
 * @returns {Uint8Array} 回傳Uint8Array
 * @example
 *
 * let data = {
 *     a: [123, 45.67, 'test中文'],
 *     b: {
 *         c: new Uint8Array([66, 97, 115]),
 *     },
 * }
 * let u8a = obj2u8arr(data)
 * console.log(u8a)
 * // => Uint8Array [
 * //     64,  24,   0,   0,   0,  0,  0,   0,  91,  53,  56,  44,
 * //     51,  93, 123,  34,  97, 34, 58,  91,  49,  50,  51,  44,
 * //     52,  53,  46,  54,  55, 44, 34, 116, 101, 115, 116, 228,
 * //    184, 173, 230, 150, 135, 34, 93,  44,  34,  98,  34,  58,
 * //    123,  34,  99,  34,  58, 34, 91,  85, 105, 110, 116,  56,
 * //     65, 114, 114,  97, 121, 93, 58,  58,  48,  34, 125, 125,
 * //     66,  97, 115
 * // ]
 *
 */
function obj2u8arr(data) {
    let bs = []
    let r = []

    //check
    if (!isearr(data) && !iseobj(data)) {
        return null
    }

    //addBin
    let pkLens = []
    let pkBins = []
    function addBin(b) {
        pkLens.push(getBufferSize(b))
        pkBins.push(b)
    }

    try {

        //obj2stru8arr
        let sb = obj2stru8arr(data) //序列化數據, 分別為無Uint8Array序列化字串(results), 以及各Uint8Array數據(binarys)
        //console.log('sb', sb)

        //sb.results
        let bMain = str2u8arr(sb.results) //無Uint8Array序列化字串轉二進位數據(Uint8Array)
        addBin(bMain) //加入無Uint8Array序列化字串二進位數據(Uint8Array)

        //sb.binarys
        each(sb.binarys, (b) => {
            addBin(b) //加入各分塊二進位數據(Uint8Array)
        })

        //bPks
        let vPks = pkLens //各分塊長度資訊
        let bPks = str2u8arr(JSON.stringify(vPks)) //各分塊長度資訊序列化成字串, 再轉二進位數據(Uint8Array)

        //push head
        let ibHead = 8 //預設用開頭8 bytes來儲存分塊資訊之長度
        let bHead = new Uint8Array(ibHead) //宣告
        bufWriteDbl(getBufferSize(bPks), bHead) //寫入分塊資訊之長度
        bs.push(bHead) //推入開頭儲存分塊資訊之長度

        //push
        bs.push(bPks) //推入各分塊資訊長度陣列

        //push
        each(pkBins, (b) => {
            bs.push(b) //推入各分塊資訊
        })

        //flatten
        each(bs, (b) => {
            r = concatU8arr(r, b) //合併各二進位數據
        })

    }
    catch (err) {
        return null
    }

    return r
}


export default obj2u8arr
