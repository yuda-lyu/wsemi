import each from 'lodash/each'
import keys from 'lodash/keys'
import reverse from 'lodash/reverse'
import size from 'lodash/size'
import range from 'lodash/range'
import isEqual from 'lodash/isEqual'
import isarr from './isarr.mjs'
import arrhas from './arrhas.mjs'


/**
 * 由物件陣列ltdt轉陣列vrtable(使用value,style,rowspan儲存)
 *
 * @export
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} mergerowkeys 輸入需合併列的關鍵字keys，為字串陣列
 * @returns {Array} 回傳物件陣列
 */
export default function ltdt2vrtsable(ltdt, mergerowkeys) {

    //check
    if (!isarr(ltdt)) {
        return []
    }
    if (!isarr(mergerowkeys)) {
        return []
    }

    //tabkeys
    let tabkeys = keys(ltdt[0])

    //ws, 轉為正規化陣列
    let ws = []
    each(ltdt, function(r) {
        let item = {}
        each(tabkeys, function(key) {
            //結構資料, r[key]需有value與style
            item[key] = {
                value: r[key].value, //使用value屬性
                style: r[key].style, //使用style屬性
                rowspan: 1, //全表儲存格預設1
            }
        })
        ws.push(item)
    })

    //計算rowspan
    let qs = reverse(ws) //逆序
    let n = size(qs)
    each(tabkeys, function(key) {
        if (arrhas(key, mergerowkeys)) {
            let veq = range(0, n, 0)
            let veqlast = range(0, n, 0)
            let vsum = range(1, n + 1, 0)
            each(qs, function(r, ind) {
                if (ind > 0) {
                    let v1 = qs[ind - 1][key].value
                    let v0 = qs[ind][key].value
                    if (isEqual(v1, v0)) { //若值等於前面元素
                        veq[ind - 1] = 1 //前面元素標為1
                        veq[ind] = 1 //當前元素標為1
                        vsum[ind] = vsum[ind - 1] + 1 //累計數量, 為日後rowspan
                    }
                    if (veq[ind - 1] === 1 && veq[ind] === 1) { //查找重複元素之最後者
                        veqlast[ind - 1] = 0 //前者元素標回0
                        veqlast[ind] = 1 //當前元素標為1
                    }
                }
            })
            each(qs, function(r, ind) {
                if (veq[ind] === 1) { //屬於有重複元素者
                    if (veqlast[ind] === 1) {
                        qs[ind][key].rowspan = vsum[ind] //最後者設為sum
                    }
                    else {
                        qs[ind][key].rowspan = null //否則都清空為null
                    }
                }
            })
        }
    })
    let tabrows = reverse(qs) //轉回正序

    return tabrows
}
