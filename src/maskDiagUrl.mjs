import { NONE, MASK, tryCall, isObjLike, isProxy, gd, hasOwn, arrVals } from './_diagKit.mjs'


/**
 * 連線字串之回顯：建構期錯誤訊息要提到使用端給的連線字串時使用，只回顯套件宣告之scheme，不回顯主機與其他任何部分
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01：url含://且其前之scheme(不分大小寫)在opt.schemes內者回傳「宣告之scheme://***」；其餘(含看似scheme之秘密、無://者、非字串)一律回傳***
 *
 * url為包裝字串者以原始值處理；回傳之scheme取自opt.schemes之宣告值(不取自url)；永不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagUrl.test.mjs Github}
 * @memberOf wsemi
 * @param {String} url 輸入連線字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.schemes=[]] 輸入可回顯之scheme字串陣列，如['postgres','mysql']，預設[]
 * @returns {String} 回傳回顯字串
 * @example
 *
 * console.log(maskDiagUrl('postgres://u:pw@db.example.com:5432/app', { schemes: ['postgres'] }))
 * // => 'postgres://***'
 *
 * console.log(maskDiagUrl('myPasswordXYZ://host', { schemes: ['postgres'] }))
 * // => '***'
 *
 */
function maskDiagUrl(url, opt) {
    try {
        let u = url
        if (isObjLike(u) && !isProxy(u)) {
            let p = tryCall(String.prototype.valueOf, u)
            u = p === NONE ? null : p
        }
        if (typeof u !== 'string') {
            return MASK
        }
        let i = u.indexOf('://')
        if (i <= 0) {
            return MASK
        }
        let sc = u.slice(0, i).toLowerCase()
        let schemes = []
        if (isObjLike(opt) && !isProxy(opt)) {
            let d = gd(opt, 'schemes')
            schemes = d !== undefined && hasOwn(d, 'value') && Array.isArray(d.value) && !isProxy(d.value) ? arrVals(d.value, false) : [] //陣列項只讀自有資料屬性(不執行getter)
        }
        for (let s of schemes) {
            if (typeof s === 'string' && /^[A-Za-z][A-Za-z0-9+.-]{0,19}$/.test(s) && s.toLowerCase() === sc) {
                return `${s}://${MASK}`
            }
        }
        return MASK
    }
    catch (err) {
        return MASK
    }
}


export default maskDiagUrl
