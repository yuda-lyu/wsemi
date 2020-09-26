/**
 * 以Promise開啟鏈式
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmIni.test.js Github}
 * @memberOf wsemi
 * @returns {Promise} 回傳Promise
 * @example
 * need test in browser
 *
 * pmIni()
 *     .then(function() {
 *         console.log('then')
 *         //code here
 *     })
 *
 */
function pmIni() {
    return Promise.resolve()
}

export default pmIni
