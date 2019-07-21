import isestr from './isestr.mjs'


/**
 * 判斷是否為廣義無效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isEmail.test.js Github}
 * @memberOf wsemi
 * @param {String} email 輸入email字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isEmail('abc@mail.com')
 * // => true
 *
 * isEmail('abc@a.b')
 * // => false
 */
function isEmail(email) {

    //check
    if (!isestr(email)) {
        return false
    }

    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}


export default isEmail
