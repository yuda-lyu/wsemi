/**
 * 錯誤值轉字串且保證不拋錯，內部共用不對外
 *
 * 一般Error同其toString('名稱: 訊息')，拋出之值為null、undefined時為'null'、'undefined'；無法轉字串者(無原型物件、已撤銷之Proxy、toString會拋錯者)退取字串message，仍無則為'unknown error'
 *
 * 使用端: catch內須把呼叫端可能拋出之任意值轉為字串者(try內會執行呼叫端之toJSON、getter、Proxy陷阱、回調或注入之fs等)，如o2j、obj2str、obj2stru8arr
 *
 * 刻意不匯入任何模組(含getErrorMessage): 本模組供基礎轉換函數(含cint等被getErrorMessage匯入者)使用, 有匯入即可能形成循環匯入
 *
 * @param {*} err 輸入錯誤值
 * @returns {String} 回傳字串
 */
function errToStr(err) {
    try {
        return String(err)
    }
    catch (e) {}
    try {
        let m = err.message
        if (typeof m === 'string' && m !== '') {
            return m
        }
    }
    catch (e) {}
    return 'unknown error'
}


export default errToStr
