import tagOf from './_tagOf.mjs'


/**
 * 轉型函數專用之拆包(內部共用不對外)，將String、Number、Boolean包裝物件以內部槽取出原始值，其餘輸入原樣回傳
 *
 * 判斷函數(isstr、isnum、isbol等)只收原始值，包裝物件為false(dspec〈輸入參數之檢測機制〉§11 W-20)；
 * 轉型函數(cdbl、cint、cstr、cbol)轉型本即盡力轉成可用之值，故照舊拆包，其拆包統一經本函數，不再依賴判斷函數收包裝物件
 *
 * 以內部槽判定(String.prototype.valueOf等對非該型包裝物件拋TypeError)，不呼叫物件自身之valueOf與toString，偽造Symbol.toStringTag之一般物件不算包裝物件
 *
 * @param {*} v 輸入任意值
 * @returns {*} 回傳原始值(包裝物件)或原值
 */
function unbox(v) {

    //原始值與null直接回傳, 最快路徑
    if (v === null || typeof v !== 'object') {
        return v
    }

    //以內部標籤預篩, 再以內部槽確認(標籤可偽造, 內部槽不可)
    let tag = tagOf(v)
    try {
        if (tag === '[object String]') {
            return String.prototype.valueOf.call(v)
        }
        if (tag === '[object Number]') {
            return Number.prototype.valueOf.call(v)
        }
        if (tag === '[object Boolean]') {
            return Boolean.prototype.valueOf.call(v)
        }
    }
    catch (err) {
        //標籤偽造而無內部槽, 非包裝物件, 原樣回傳
    }

    return v
}


export default unbox
