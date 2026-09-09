import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'
import getBufferSize from './getBufferSize.mjs'
import bufReadDbl from './bufReadDbl.mjs'
import u8arr2str from './u8arr2str.mjs'
import stru8arr2obj from './stru8arr2obj.mjs'


function sliceU8arr(u8a, inds) {
    let i = 0
    let j = 0
    let r = []
    each(inds, (ind) => {
        j = i + ind
        let t = u8a.slice(i, j)
        i = j
        r.push(t)
    })
    return r
}


/**
 * Uint8Array轉物件或陣列資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Object|Array} 回傳物件或陣列資料，物件內可支援Uint8Array、Uint16Array、ArrayBuffer，因obj2u8arr預設會把ArrayBuffer轉Uint8Array進行操作，故物件內原為ArrayBuffer者會以Uint8Array返回；輸入非Uint8Array或封包損毀時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let u8a = new Uint8Array([
 *     64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44,
 *     51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
 *     52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
 *     184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
 *     123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101,
 *     70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97,
 *     121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115
 * ])
 * let data = u8arr2obj(u8a)
 * console.log(data)
 * // => { a: [ 123, 45.67, 'test中文' ], b: { c: Uint8Array [ 66, 97, 115 ] } }
 *
 * console.log(u8arr2obj(new Uint8Array([1, 2, 3]), { returnWithStateAndMsg: true }))
 * // => {
 * //     state: 'error',
 * //     msg: 'SyntaxError: Unexpected end of JSON input'
 * // }
 *
 */
function u8arr2obj(u8a, opt = {}) {
    let data = {}

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return {}
        }
    }

    //check
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    try {

        //bHead, bOthers
        let ibHead = 8 //預設用開頭8 bytes來儲存分塊資訊區之長度
        let bHead = u8a.slice(0, ibHead) //分塊資訊區長度之二進位數據(Uint8Array)
        let bOthers = u8a.slice(ibHead, getBufferSize(u8a)) //其他之二進位數據(Uint8Array)

        //lenHead
        let lenHead = bufReadDbl(bHead) //讀取分塊資訊區長度
        let bvPks = bOthers.slice(0, lenHead) //分塊資訊區之二進位數據(Uint8Array)
        let bbPks = bOthers.slice(lenHead, getBufferSize(bOthers)) //各分塊區之二進位數據(Uint8Array)

        //vPks, 內部各轉換函數一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯
        let rcvPks = u8arr2str(bvPks, { returnWithStateAndMsg: true }) //取得分塊資訊區二進位數據(Uint8Array)內文字
        if (rcvPks.state === 'error') {
            return retError(`u8arr2str: ${rcvPks.msg}`)
        }
        let cvPks = rcvPks.msg
        let vPks = JSON.parse(cvPks) //算得分塊資訊, 為陣列, 各元素代表各分塊長度

        //bPks
        let bPks = sliceU8arr(bbPks, vPks) //依照各分塊長度切出分各分塊之二進位數據(Uint8Array)

        //results, to sb.results
        let bMain = bPks.shift() //bPks[0], 第1區塊為無Uint8Array序列化字串之二進位數據(Uint8Array)
        let rresults = u8arr2str(bMain, { returnWithStateAndMsg: true }) //取得無Uint8Array序列化字串
        if (rresults.state === 'error') {
            return retError(`u8arr2str: ${rresults.msg}`)
        }
        let results = rresults.msg

        //binarys , to sb.binarys
        let binarys = bPks //others, 其他塊皆為Uint8Array之二進位數據(Uint8Array)

        //data
        let r = stru8arr2obj({ results, binarys }, { returnWithStateAndMsg: true }) //反序列化數據, 由無Uint8Array序列化字串與Uint8Array之二進位數據算得原本資料
        if (r.state === 'error') {
            return retError(`stru8arr2obj: ${r.msg}`)
        }
        data = r.msg

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: data,
        }
    }
    else {
        return data
    }
}


export default u8arr2obj
