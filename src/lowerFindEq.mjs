//lowerFindEq: 單欄等值條件之IR節點(主鍵條件用: selectByPk、del、save的預讀), 規則見CLAUDE_rulebook.md R-LOWER-01 IR-08.
//節點形狀與語意同src/lowerFind.mjs檔頭(cmp eq 或 bool eq, null原型, p為find.<欄名>), 與同一值經lowerFind所得IR相同(selectByPk與select共用快取鍵).
//wsemi慣例一檔一個預設匯出, 故自lowerFind.mjs分出; 純JS, 零import, 下列clean/node為與lowerFind.mjs相同之兩個小函數, 由測試核對兩者輸出一致.

let clean = (s, n) => {
    // eslint-disable-next-line no-control-regex
    let t = String(s).replace(/[\u0000-\u001f\u007f]/g, '?')
    return t.length > n ? `${t.slice(0, n)}...` : t
}
let node = (o) => Object.assign(Object.create(null), o)


/**
 * 單欄等值條件之IR節點(主鍵條件用)
 *
 * 回傳與lowerFind同形之null原型節點：布林值為bool節點(op為eq)，其餘為cmp節點(op為eq)，p為find.欄名(欄名限30字元並以?取代控制字元)。輸入值不再檢核(含±Infinity，float8主鍵可為±Infinity)，須已由呼叫端之主鍵檢核擔保為字串、數字、布林或Date；Date原樣保留(同一實例)。與同一值經lowerFind所得之IR相同，故selectByPk與select可共用快取鍵。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/lowerFindEq.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入欄名字串(已檢核)
 * @param {String|Number|Boolean|Date} v 輸入主鍵值(已檢核)
 * @returns {Object} 回傳IR節點(null原型)
 * @example
 *
 * console.log(JSON.stringify(lowerFindEq('id', 'k1')))
 * // => {"t":"cmp","c":"id","op":"eq","v":"k1","p":"find.id"}
 *
 * console.log(JSON.stringify(lowerFindEq('flag', true)))
 * // => {"t":"bool","c":"flag","op":"eq","v":true,"p":"find.flag"}
 *
 */
function lowerFindEq(c, v) {
    let p = `find.${clean(c, 30)}`
    if (typeof v === 'boolean') {
        return node({ t: 'bool', c, op: 'eq', v, p })
    }
    return node({ t: 'cmp', c, op: 'eq', v, p })
}


export default lowerFindEq
