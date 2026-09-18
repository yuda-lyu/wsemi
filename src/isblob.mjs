/**
 * 判斷是否為Blob或其子型別(File)
 *
 * File繼承自Blob，具備Blob全部方法，由input type=file取得者皆為File，故一併視為Blob；若須區分File請用isfile。瀏覽器與NodeJS(18以上)皆有Blob，NodeJS 20以上有File
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isblob.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * let bb = new Blob([new Uint8Array([66, 97, 115])])
 * console.log(isblob(bb))
 * // => true
 *
 * let fl = new File([new Uint8Array([66, 97, 115])], 'a.txt')
 * console.log(isblob(fl))
 * // => true
 *
 */
function isblob(v) {

    //以標籤判定, 跨iframe等不同realm時instanceof會失效而標籤仍有效; File之標籤為[object File]而非[object Blob], 須一併列入
    let c = Object.prototype.toString.call(v)
    if (c === '[object Blob]' || c === '[object File]') {
        return true
    }

    //其他Blob子型別以instanceof判定, 無Blob之環境須先確認其存在
    try {
        if (typeof Blob !== 'undefined' && v instanceof Blob) {
            return true
        }
    }
    catch (err) {}

    return false
}


export default isblob
