import j2o from './j2o.mjs'
import o2j from './o2j.mjs'


/**
 * 暴力cloneDeep物件
 *
 * 以JSON序列化再還原(o2j後j2o)取得與輸入斷開參照之純資料副本，故只保留JSON可表示者：函數於陣列內為null、於物件內略去，undefined於陣列內為null、於物件內略去，NaN與±Infinity為null，Date為ISO字串，Map、Set等無自有可列舉字串鍵之物件為{}；輸入為undefined時回傳undefined。
 *
 * 失敗時不拋錯、不提供狀態：不可序列化之頂層值(函數、Symbol、BigInt、循環參照之物件等)回傳{}，而{}亦為合法輸出(如oo({}))，故無法由回傳值判斷成敗(同C6編碼與序列化之處置，只補文件)。須辨識失敗者，改以o2j(o, false, { returnWithStateAndMsg: true })取得{ state, msg }，或先以自己的判斷確認輸入可序列化。
 *
 * 與lodash之cloneDeep之分工：cloneDeep保留Date、Map、Set、undefined、循環參照等型別並複製之，需完整複製者用cloneDeep；oo只在需要JSON可表示之純資料副本(去除函數、斷開所有參照、確定可再序列化)時使用。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/oo.test.mjs Github}
 * @memberOf wsemi
 * @param {*} o 輸入任意資料
 * @returns {*} 回傳任意資料；不可序列化之頂層值回傳{}(無法由回傳值判斷成敗)，undefined回傳undefined
 * @example
 *
 * console.log(oo([1, '3', 'abc']))
 * // => [1, '3', 'abc']
 *
 * console.log(oo([1, '3', 'abc', function(){}]))
 * // => [1, '3', 'abc', null]
 *
 * console.log(oo({ a: 12.34, b: 'abc' }))
 * // => { a: 12.34, b: 'abc' }
 *
 * console.log(oo({ a: 12.34, b: 'abc', c: function(){} }))
 * // => { a: 12.34, b: 'abc' }
 *
 * console.log(oo(function(){}), oo({}))
 * // => {} {} (不可序列化之頂層值與合法之空物件不可區分)
 *
 */
function oo(o) {

    //check
    if (o === undefined) {
        return undefined
    }

    return j2o(o2j(o))
}


export default oo
