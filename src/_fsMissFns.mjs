/**
 * 檢查注入之fs物件是否提供指定函數(內部用)，回傳缺少者之名稱陣列；fs不是物件(含null)時視為全部缺少，讀取成員拋錯者視為缺少
 *
 * @param {*} fs 輸入fs物件
 * @param {Array} names 輸入需要之函數名稱陣列
 * @returns {Array} 回傳缺少之函數名稱陣列，空陣列代表齊全
 */
function fsMissFns(fs, names) {
    let ok = fs !== null && (typeof fs === 'object' || typeof fs === 'function')
    return names.filter((name) => {
        if (!ok) {
            return true
        }
        try {
            return typeof fs[name] !== 'function'
        }
        catch (err) {
            return true
        }
    })
}


export default fsMissFns
