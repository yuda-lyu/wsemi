/**
 * 產生Promise物件，具備鏈式resolve與reject
 * 主要受jQuery Deferred概念啟發
 * @memberOf wsemi
 * @returns {Object} 回傳Promise物件
 */
function genPm() {

    let resolve
    let reject
    let p = new Promise(function() {
        resolve = arguments[0]
        reject = arguments[1]
    })
    p.resolve = resolve
    p.reject = reject

    return p
}


export default genPm
