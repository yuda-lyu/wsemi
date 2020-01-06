import map from 'lodash/map'
import blob2u8arr from './blob2u8arr.mjs'


/**
 * 前端Blob或input檔案物件陣列，逐一轉為各檔案之Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blobs2u8arrs.test.js Github}
 * @memberOf wsemi
 * @param {Array} bbs 輸入Blob或File陣列
 * @returns {Promise} 回傳Promise，resolve回傳各Blob或File的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function blobs2u8arrs(bbs) {

    //pms
    let pms = map(bbs, function(bb) {
        return blob2u8arr(bb)
    })

    return Promise.all(pms)
}


export default blobs2u8arrs
