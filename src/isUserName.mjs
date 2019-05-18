import genPm from './genPm.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為有效使用者名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserName.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve為空代表有效，reject為錯誤訊息
 * @example
 * isUserName('我的名稱')
 *   .then(function() {
 *     //code here
 *   })
 */
function isUserName(v) {

    let df = genPm()

    //check
    if (!isestr(v)) {
        df.reject('請填入姓名')
        return df
    }

    df.resolve()
    return df
}


export default isUserName
