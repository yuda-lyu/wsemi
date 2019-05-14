import isestr from './isestr.mjs'
import isu8arr from './isu8arr.mjs'
import u8arr2blob from './u8arr2blob.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'


/**
 * 前端下載binary資料成為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromU8Arr.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {Uint8Array} u8a 輸入Uint8Array資料
 * @example
 *
 */
function downloadFileFromU8Arr(cfn, u8a) {

    //check
    if (!isestr(cfn)) {
        console.warn('no filename')
        return
    }
    if (!isu8arr(u8a)) {
        console.warn('no data')
        return
    }

    //轉blob
    let blob = u8arr2blob(u8a)

    //downloadFileFromBlob
    downloadFileFromBlob(cfn, blob)

}


export default downloadFileFromU8Arr
