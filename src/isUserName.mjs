import genPm from './genPm.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為有效使用者名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserName.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve為空代表有效，reject為錯誤訊息
 */
function isUserName(v) {

    let df = genPm()

    if (!isestr(v)) {
        df.reject('請輸入字串')
    }
    else if (v === '') {
        df.reject('請填入姓名')
    }
    else {
        df.resolve()
    }

    return df
}


export default isUserName
