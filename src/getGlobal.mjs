/**
 * 取得運行環境中的頂層物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getGlobal.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳頂層物件，若無法取得則回傳null
 * @example
 * console.log(getGlobal())
 * // => global object in running environment
 */
function getGlobal() {

    if (typeof self !== 'undefined') {
        return self
    }
    if (typeof window !== 'undefined') {
        return window //於borwser的型別為[object Window]
    }
    if (typeof global !== 'undefined') {
        return global //於nodejs的型別為[object global]
    }

    return null
}


export default getGlobal
