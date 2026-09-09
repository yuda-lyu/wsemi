import map from 'lodash-es/map.js'
import isarr from './isarr.mjs'
import blob2b64 from './blob2b64.mjs'


/**
 * 前端Blob或input檔案物件陣列，逐一轉為各檔案之Base64資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blobs2b64s.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} bbs 輸入Blob或File陣列
 * @returns {Promise} 回傳Promise，resolve回傳各Blob或File的Base64資料，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let b64 = 'YWJj5ris6Kmm'
 * let u8a = b642u8arr(b64)
 * let bb = new Blob([u8a])
 * let bbs = [bb]
 * blobs2b64s(bbs)
 *     .then(function(b64){
 *         console.log(b64)
 *         // => ["data:application/octet-stream;base64,YWJj5ris6Kmm"]
 *     })
 *
 */
function blobs2b64s(bbs) {

    //check, 非陣列時lodash之map會得[], 再Promise.all([])即靜默resolve [], 使無效輸入被當成功
    if (!isarr(bbs)) {
        return Promise.reject('invalid bbs')
    }

    //check, 空陣列為合法輸入且對應空結果, 行為與下方Promise.all([])相同, 此處明示以與上方之非陣列拒絕區隔
    if (bbs.length === 0) {
        return Promise.resolve([])
    }

    //pms
    let pms = map(bbs, function(bb) {
        return blob2b64(bb)
    })

    return Promise.all(pms)
}


export default blobs2b64s
