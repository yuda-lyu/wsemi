import map from 'lodash/map'
import blob2u8arr from './blob2u8arr.mjs'


/**
 * 前端Blob或input檔案物件陣列，逐一轉為各檔案之Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blobs2u8arrs.test.js Github}
 * @memberOf wsemi
 * @param {Blob|File} bbs 輸入Blob或File陣列
 * @returns {Promise} 回傳Promise，resolve回傳各Blob或File的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([97, 98, 99, 230, 184, 172, 232, 169, 166])
 * let bb = new Blob([u8a])
 * let bbs = [bb]
 * blobs2u8arrs(bbs)
 *     .then(function(u8as){
 *         console.log(u8as)
 *         // => [Uint8Array(9)]
 *         //      0: Uint8Array(9) [97, 98, 99, 230, 184, 172, 232, 169, 166]
 *         //      length: 1
 *     })
 *
 */
function blobs2u8arrs(bbs) {

    //pms
    let pms = map(bbs, function(bb) {
        return blob2u8arr(bb)
    })

    return Promise.all(pms)
}


export default blobs2u8arrs
