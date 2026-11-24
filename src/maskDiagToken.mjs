import { LIM, gd, hasOwn, isProxy, isIndexKey, ctlToQ } from './_diagKit.mjs'


//tok, 單一值之遮罩(陣列逐項, 至多LIM.depth層)
let tok = (v, depth) => {
    if (Array.isArray(v) && !isProxy(v)) {
        if (depth >= LIM.depth) {
            return '(object)'
        }
        //逐項(只讀自有資料屬性之索引鍵, 不執行getter; 空洞保留為空洞, 存取器之項為'(unreadable)'), 長度同原陣列
        let r = []
        for (let k of Reflect.ownKeys(v)) {
            if (!isIndexKey(k)) {
                continue
            }
            let d = gd(v, k)
            if (d === undefined) {
                continue
            }
            r[k] = hasOwn(d, 'value') ? tok(d.value, depth + 1) : '(unreadable)'
        }
        r.length = v.length
        return r
    }
    if (v === undefined || v === null || v === '') {
        return ''
    }
    if (typeof v !== 'string') {
        return `(${typeof v})`
    }
    let n = v.length
    let k = Math.min(4, Math.floor(n / 8))
    if (k === 0) {
        return `(len=${n})`
    }
    return `${ctlToQ(v.slice(0, k))}...${ctlToQ(v.slice(n - k))}(len=${n})`
}


/**
 * 權杖之遮罩：只露出頭尾各min(4, floor(n/8))個字元並附長度，供log記錄權杖、金鑰等憑證時辨識是哪一把而不露出其值
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則17。字串長度n(UTF-16碼元數)，k=min(4, floor(n/8))：k為0(n<8)回'(len=n)'，否則回'頭k字元...尾k字元(len=n)'，
 * 露出之頭尾字元中之控制字元、格式字元與行/段分隔符換成?(同maskDiagCtrl)；undefined、null、''回''；陣列逐項遮罩(回同長之陣列，空洞保留，巢狀陣列至多8層，更深者為'(object)'，存取器之項不讀而為'(unreadable)')；
 * 其他非字串(含包裝字串、可偵測之Proxy)回'(typeof之名稱)'，如'(number)'、'(object)'、'(boolean)'；不執行使用端程式、永不拋錯(內部失敗回'(unreadable)')
 *
 * 露出之字元數隨長度增加(n=8~15露1、16~23露2、24~31露3、32以上露4)，長度至少8才露出；短於32字元之權杖露出之比例較高，不宜用於短密碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagToken.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入權杖字串或其陣列
 * @returns {String|Array} 回傳遮罩後字串，輸入為陣列時回傳逐項遮罩之陣列
 * @example
 *
 * console.log(maskDiagToken('0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b'))
 * // => '0199...4a5b(len=36)'
 *
 * console.log(maskDiagToken('abcdefgh'), maskDiagToken('abc'), maskDiagToken(''), maskDiagToken(12345))
 * // => 'a...h(len=8)' '(len=3)' '' '(number)'
 *
 * console.log(maskDiagToken(['abcdefghijklmnop', 'x']))
 * // => [ 'ab...op(len=16)', '(len=1)' ]
 *
 * console.log(maskDiagToken('\nbcdefghijklmno\r'))
 * // => '?b...o?(len=16)'
 *
 */
function maskDiagToken(v) {
    try {
        return tok(v, 0)
    }
    catch (err) {
        return '(unreadable)'
    }
}


export default maskDiagToken
