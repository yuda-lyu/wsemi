import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import isenum from './isenum.mjs'


//本檔為內部使用, 不由index匯出


/**
 * 檢測maxmins各區間之上下限並取值(arrGroupByMaxmin、arrLookupByMaxmin共用, 單一擁有者)
 *
 * 使用者2026-11-02: 區間上下限屬使用方設定之邊界, 以isenum判定, Infinity、'0x10'、包裝物件等皆為非預期, 表「無上下限」由呼叫端給適當之有限極值;
 * 上下限無效(含未給、null)即throw Error(`invalid maxmins[索引].鍵: must be a valid number`), 訊息不帶輸入值; 設定錯即報錯, 不靜默略過該區間
 *
 * 先檢測全部區間再回傳, 故是否報錯與arr之內容無關; 每個鍵只讀一次, 回傳轉換後之數值(檢測之值即使用之值)
 *
 * @param {Array} maxmins 輸入maxmins陣列(呼叫端已確認為有效陣列)
 * @param {String} keyMax 輸入各區間儲存最大值之欄位字串
 * @param {String} keyMin 輸入各區間儲存最小值之欄位字串
 * @returns {Array} 回傳與maxmins逐位對應之[{ rmax, rmin }]，皆為number
 */
function maxminsLimits(maxmins, keyMax, keyMin) {
    let rs = []
    each(maxmins, (mm, kmm) => {

        //rmax
        let rmax = get(mm, keyMax, null)
        if (!isenum(rmax)) {
            throw new Error(`invalid maxmins[${kmm}].${keyMax}: must be a valid number`)
        }

        //rmin
        let rmin = get(mm, keyMin, null)
        if (!isenum(rmin)) {
            throw new Error(`invalid maxmins[${kmm}].${keyMin}: must be a valid number`)
        }

        rs.push({
            rmax: Number(rmax),
            rmin: Number(rmin),
        })
    })
    return rs
}


export default maxminsLimits
