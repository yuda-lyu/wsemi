import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'


/**
 * 取設定物件之觀察回調(opt.onTrace)，回傳通知函數或null，供計時器相關函數(輪詢、偵測、重試、節流、防抖、排程、逾時、等待)共用同一套規則，不各自手寫
 *
 * 本函數供wsemi自身與其他自有套件(w-*)之計時器相關函數取得觀察回調，統一以單一擁有者實作，避免各套件自寫等價版本而分歧。觀察回調用於讓測試與診斷以「事件發生」而非「等待毫秒」同步，規則見sgud/rule/rulebook.md之R-TRACE-01
 *
 * 觀察回調於函數內部之事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }：type為各函數於JSDoc列舉之固定字串，其餘欄位為原始值(數字、字串、布林或null)之快照，不含內部可變狀態與Error物件
 *
 * 回調不帶接收者呼叫(this為undefined)，回傳值不使用；其同步拋錯與回傳Promise之rejection皆忽略，故不中斷被觀察之函數、不改變其結果，亦不產生未處理之rejection
 *
 * opt.onTrace未給或非函數時回傳null，呼叫端以if (trace)略過組事件物件，使未傳回調時之行為、時序與效能同未支援前；函數被釋放(停止、清除)後呼叫端不應再通知
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTrace.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，取其onTrace屬性，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，格式為(e)=>{}，e為凍結之事件物件{ type, ... }，預設null
 * @returns {Function|null} 回傳通知函數，格式為(type, info)=>{}，type為事件類型字串，info為事件之其餘欄位物件；opt.onTrace非函數時回傳null
 * @example
 *
 * //被觀察函數之內部
 * function work(opt = {}) {
 *     let trace = getTrace(opt)
 *     let n = 0
 *     let t = setInterval(() => {
 *         n++
 *         if (trace) {
 *             trace('tick', { n })
 *         }
 *         if (n >= 2) {
 *             clearInterval(t)
 *         }
 *     }, 10)
 * }
 *
 * //使用端
 * work({
 *     onTrace: (e) => {
 *         console.log(e)
 *     },
 * })
 * // => { type: 'tick', n: 1 }
 * // => { type: 'tick', n: 2 }
 *
 */
function getTrace(opt) {
    let fn = get(opt, 'onTrace', null)
    if (!isfun(fn)) {
        return null
    }
    return (type, info) => {
        try {
            let r = fn(Object.freeze({ type, ...info }))
            if (r && isfun(r.catch)) {
                r.catch(() => {})
            }
        }
        catch (err) {}
    }
}


export default getTrace
