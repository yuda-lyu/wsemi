import ispint from './ispint.mjs'
import ispm from './ispm.mjs'
import isfun from './isfun.mjs'
import cint from './cint.mjs'


/**
 * 非同步函數進行防抖
 *
 * 同時僅會執行一個佇列(非同步函數)，到達防抖時間才會取最後一個佇列執行，待其執行完畢，若期間有新佇列進來，一樣取最後佇列執行
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmDebounce.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [ms=300] 輸入未有調用的時間區間，為正整數，預設300ms
 * @returns {Function} 回傳Function，輸入為非同步函數與其輸入，會推入佇列後並循序等待執行，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息
 * @example
 *
 * let dbc = pmDebounce(300)
 *
 * let i = 0
 * let d = 100
 * setTimeout(() => {
 *     let t = setInterval(() => {
 *         i += d
 *         console.log(i, 'ms')
 *         if (i > 2500) {
 *             clearInterval(t)
 *         }
 *     }, d)
 * }, 1)
 *
 * let n = 0
 * function test(rin) {
 *     console.log(i, 'ms', 'test in:', rin)
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(() => {
 *             n++
 *             let rout = `${rin}:${n}`
 *             console.log(i, 'ms', 'test out:', rout)
 *             resolve(rout)
 *         }, 500)
 *     })
 * }
 *
 * setTimeout(() => {
 *     setTimeout(() => {
 *         dbc(async() => {
 *             return test('a')
 *         }, 'a')
 *     }, 1)
 *     //1ms, a進入排程, 但a尚未發呆300ms故無法執行
 *     setTimeout(() => {
 *         dbc(async() => {
 *             return test('b')
 *         }, 'b')
 *     }, 100)
 *     //100ms, b進入排程, 因b尚未發呆300ms故無法執行
 *     //400ms, 因b已發呆300ms故開始執行, 此時也取消a, 400ms開始, 至900ms結束
 *     setTimeout(() => {
 *         dbc(async() => {
 *             return test('c')
 *         }, 'c')
 *     }, 500)
 *     setTimeout(() => {
 *         dbc(async() => {
 *             return test('d')
 *         }, 'd')
 *     }, 800)
 *     //500與800ms, c與d皆進入排程, 但b還在執行中故無法執行c與d
 *     //900ms, b執行完, 故取最後d開始執行, c已取消, 900ms開始, 至1400ms結束
 *     //1400ms, d執行完, 無任何排程等待
 *     setTimeout(() => {
 *         dbc(async() => {
 *             return test('e')
 *         }, 'e')
 *     }, 1500)
 *     //1500ms, e進入排程, 目前無任何排程, 但因e尚未發呆300ms故無法執行
 *     //1800ms, 因e已發呆300ms故開始執行, 1800ms開始, 至2300ms結束
 *     //2300ms, e執行完
 * }, 20)
 * // 100 ms
 * // 200 ms
 * // 300 ms
 * // 400 ms
 * // 400 ms test in: b
 * // 500 ms
 * // 600 ms
 * // 700 ms
 * // 800 ms
 * // 900 ms
 * // 900 ms test out: b:1
 * // 900 ms test in: d
 * // 1000 ms
 * // 1100 ms
 * // 1200 ms
 * // 1300 ms
 * // 1400 ms
 * // 1400 ms test out: d:2
 * // 1500 ms
 * // 1600 ms
 * // 1700 ms
 * // 1800 ms
 * // 1800 ms test in: e
 * // 1900 ms
 * // 2000 ms
 * // 2100 ms
 * // 2200 ms
 * // 2300 ms
 * // 2300 ms test out: e:3
 * // 2400 ms
 * // 2500 ms
 * // 2600 ms
 *
 */
function pmDebounce(ms = 300) {

    function ClsDebounce(ms) {
        let q = [] //queue
        let t = null //timer
        let tLast = null
        let state = 'wait'

        //ms
        if (!ispint(ms)) {
            ms = 300
        }
        ms = cint(ms)

        function detect() {

            //check
            if (t !== null) {
                return
            }

            //check
            if (state !== 'wait') {
                return
            }

            //setInterval
            t = setInterval(() => {
                //console.log('q', q)

                //check
                if (state !== 'wait') {
                    return
                }

                //check
                if (state === 'wait' && q.length === 0) {
                    clearInterval(t)
                    t = null
                    return
                }

                //b
                let b = false
                if (tLast === null) {
                    b = true
                }
                else {
                    let tDiff = Date.now() - tLast
                    b = tDiff > ms
                }

                //check
                if (b) { //超過指定延時則呼叫指定func

                    //state
                    state = 'doing'
                    // console.log('state1', state)

                    //update
                    tLast = Date.now()

                    //取最後的任務與清空佇列
                    let m = q.pop()
                    q = []
                    // console.log('m', m)

                    //執行最後的任務
                    let r = m.func(...m.input)
                    if (ispm(r)) {
                        r
                            .then((res) => {
                                m.output = res
                            })
                            .catch((err) => {
                                m.output = { err }
                            })
                            .finally(() => {
                                state = 'wait'
                                // console.log('state2a', state, 'q', q)
                            })
                    }
                    else {
                        m.output = r
                        state = 'wait'
                        // console.log('state2b', state, 'q', q)
                    }

                }

                //clear
                if (state === 'wait' && q.length === 0) {
                    clearInterval(t)
                    t = null
                }

            }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗

        }

        function run(func, ...input) {

            //check
            if (!isfun(func)) {
                console.log('func is not a function')
                return
            }

            //first tLast
            if (tLast === null) {
                tLast = Date.now()
            }
            else if (state === 'wait') {
                tLast = Date.now()
            }

            //push
            q.push({
                func,
                input,
                output: null,
            })
            // console.log('push q', q)

            //detect
            detect()

        }

        return run
    }

    return new ClsDebounce(ms)
}


export default pmDebounce
