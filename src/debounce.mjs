import each from 'lodash/each'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import isint from './isint.mjs'


let q = {} //queue
let t = null //timer


function detect() {
    if (t !== null) {
        return
    }
    t = setInterval(() => {
        //console.log('q', q)

        //detect
        each(q, (v, key) => {
            let t = Date.now() - v.time
            if (t > v.ms) { //超過指定延時則呼叫指定func
                if (isfun(v.func)) {
                    v.func()
                }
                delete q[key] //刪除佇列內key紀錄
            }
        })

        //clear
        if (!iseobj(q)) {
            clearInterval(t)
            t = null
        }

    }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗
}


/**
 * 函數去除抖動
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/debounce.test.js Github}
 * @memberOf wsemi
 * @param {String} key 輸入標記用關鍵字字串
 * @param {Function} f 輸入調用函數
 * @param {Integer} [ms=300] 輸入未有調用的時間區間，為正整數，預設300ms
 * @example
 * let i = 0
 * let j = 0
 * function core(i) {
 *     j++
 *     console.log('j', j, 'i', i)
 * }
 * function fn() {
 *     i++
 *     console.log('i', i)
 *     debounce('key for test', () => {
 *         core(i)
 *     }, 300)
 * }
 * setTimeout(function() {
 *     fn()
 * }, 120)
 * setTimeout(function() {
 *     fn()
 * }, 240)
 * setTimeout(function() {
 *     fn()
 * }, 360)
 * // i 1
 * // i 2
 * // i 3
 * // j 1 i 3
 */
function debounce(key, func, ms = 300) {

    //check
    if (!isestr(key)) {
        console.log('need key')
        return
    }
    if (!isfun(func)) {
        console.log('need function')
        return
    }
    if (!isint(ms)) {
        console.log('ms need integer')
        return
    }

    //update
    q[key] = { func, ms, time: Date.now() }

    //detect
    detect()

}


export default debounce
