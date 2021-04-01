import genPm from './genPm.mjs'
import blob2ab from './blob2ab.mjs'


/**
 * 前端Blob或input檔案物件轉Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2u8arr.test.js Github}
 * @memberOf wsemi
 * @param {Blob|File} bb 輸入Blob或File
 * @returns {Promise} 回傳Promise，resolve回傳Blob或File的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let u8aIn = new Uint8Array([97, 98, 99, 230, 184, 172, 232, 169, 166])
 * let bb = new Blob([u8aIn])
 * blob2u8arr(bb)
 *     .then(function(u8aOut){
 *         console.log(u8aOut)
 *         // => Uint8Array(9) [97, 98, 99, 230, 184, 172, 232, 169, 166]
 *     })
 *
 */
function blob2u8arr(bb) {

    //pm
    let pm = genPm()

    //blob2ab
    blob2ab(bb)
        .then((ab) => {

            //u8a
            let u8a = new Uint8Array(ab)

            //resolve
            pm.resolve(u8a)

        })
        .catch((err) => {

            //reject
            pm.reject(err)

        })

    return pm
}


export default blob2u8arr
