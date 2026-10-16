import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import pmMarkHandled from './_pmMarkHandled.mjs'


/**
 * 於進入時讀取呼叫端之容器(陣列或鍵值物件)為內部陣列，pmMap、pmSeries、pmChain共用，內部共用不對外(R-PM-SETTLE-01規則17、R-OBJ-ITER-01)
 *
 * 真陣列(Array.isArray)以索引迴圈複製為明確建立之普通陣列(不使用slice：其結果由使用端之Symbol.species決定，且保留空洞語意)；
 * 鍵值物件(isobj為真，或isarr為真而非真陣列者即以Symbol.toStringTag偽稱Array之物件)依自有可列舉字串鍵(Object.keys)展開為[{ k, v }]，length與其他鍵同為一般鍵，不依其length迭代；
 * 判定或讀取拋錯(元素getter拋錯、已撤銷Proxy、Symbol.toStringTag讀取即拋錯等)時，已讀到之元素若為先行產生之原生Promise則先標記已處理(其後不會被取用，否則其reject成為未處理之rejection)，再將該錯誤拋出，由呼叫端以reject回報
 *
 * @param {*} rs 輸入容器
 * @param {Boolean} [onlyArray=false] 輸入是否只接受真陣列，預設false
 * @returns {Object|null} 回傳{ items, useObj }，useObj為true時items各元素為{ k, v }；非陣列且非物件(onlyArray為true時非真陣列)則回傳null
 * @throws 判定或讀取拋錯時拋出該錯誤
 */
function pmReadItems(rs, onlyArray = false) {
    let items = []
    let useObj = false
    try {
        if (Array.isArray(rs)) {
            let n = rs.length
            items.length = n
            for (let i = 0; i < n; i++) {
                if (i in rs) {
                    items[i] = rs[i]
                }
            }
        }
        else if (!onlyArray && (isobj(rs) || isarr(rs))) {
            useObj = true
            let ks = Object.keys(rs)
            for (let i = 0; i < ks.length; i++) {
                items.push({ k: ks[i], v: rs[ks[i]] })
            }
        }
        else {
            return null
        }
    }
    catch (err) {
        items.forEach((it) => {
            pmMarkHandled(useObj ? it.v : it)
        })
        throw err
    }
    return { items, useObj }
}


export default pmReadItems
