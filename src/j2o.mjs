import isestr from './isestr.mjs'


/**
 * json文字轉任意資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/j2o.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} v 輸入json格式字串
 * @returns {*} 回傳任意資料
 */
function j2o(v) {

    //check
    if (!isestr(v)) {
        return {}
    }

    let c = {}
    try {
        c = JSON.parse(v)
    }
    catch (err) {
        c = {}
    }

    return c
}


export default j2o
