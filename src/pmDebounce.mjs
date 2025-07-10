import ispint from './ispint.mjs'
import ispm from './ispm.mjs'
import isfun from './isfun.mjs'
import cint from './cint.mjs'


/**
 * 非同步函數進行防抖
 *
 * 同時僅會執行一個佇列(非同步函數)，到達防抖時間才會取最後一個佇列執行，待其執行完畢，若期間有新佇列進來則儲存，待執行完畢後取最後佇列出來執行
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
 * if (true) {
 *     console.log(i, 'ms')
 *     let t = setInterval(() => { //dbc內時間比較快
 *         i += d
 *         if (i % 100 === 0) {
 *             console.log(i, 'ms')
 *         }
 *         if (i >= 2000) {
 *             clearInterval(t)
 *         }
 *     }, d)
 * }
 *
 * let ms = []
 *
 * let n = 0
 * function test(rin) {
 *     console.log(i, 'ms', 'test in:', rin)
 *     ms.push(`test in: ${rin}`)
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(() => {
 *             n++
 *             let rout = `${rin}:${n}`
 *             console.log(i, 'ms', 'test out:', rout)
 *             ms.push(`test out: ${rout}`)
 *             resolve(rout)
 *         }, 500)
 *     })
 * }
 *
 * if (true) {
 *
 *     setTimeout(() => {
 *         dbc(async(inp) => {
 *             return test(inp)
 *         }, 'a') //無阻攔時1->300發呆, 300->800執行
 *     }, 1)
 *     //1ms, a進入排程, 但a尚未發呆300ms, 故a無法執行
 *     setTimeout(() => {
 *         dbc(async(inp) => {
 *             return test(inp)
 *         }, 'b') //無阻攔時200->500發呆, 500->1000執行
 *     }, 200)
 *     //200ms, b進入排程, 同時排程前面還有a, 故只會取最末b出來判識(a被強制剔除), 因b尚未發呆完300ms故b無法執行
 *     setTimeout(() => {
 *         dbc(async(inp) => {
 *             return test(inp)
 *         }, 'c') //無阻攔時600->900發呆, 900->1400執行
 *     }, 600)
 *     //500ms, b已發呆完開始執行
 *     //600ms, c進入排程, 因b已於500ms開始執行(b執行為500->1000), c進入排程只能等待
 *     setTimeout(() => {
 *         dbc(async(inp) => {
 *             return test(inp)
 *         }, 'd') //無阻攔時900->1200發呆, 1200->1700執行
 *     }, 900)
 *     //900ms, d進入排程, 因b執行尚未結束, d雖可進入排程, 同時排程前面還有c, 故c與d皆為等待
 *     //1000ms, b已執行完, 取最末d出來判識(c被強制剔除), d須發呆300ms才能開始執行
 *     //1200ms, d已發呆完, 開始執行(d執行為1200->1700)
 *     //1700ms, d執行完
 *
 * }
 * //0 ms
 * //100 ms
 * //200 ms
 * //300 ms
 * //400 ms
 * //400 ms test in: b
 * //500 ms
 * //600 ms
 * //700 ms
 * //800 ms
 * //900 ms
 * //900 ms test out: b:1
 * //1000 ms
 * //1100 ms
 * //1200 ms
 * //1200 ms test in: d
 * //1300 ms
 * //1400 ms
 * //1500 ms
 * //1600 ms
 * //1700 ms
 * //1700 ms test out: d:2
 * //1800 ms
 * //1900 ms
 * //2000 ms
 * setTimeout(() => {
 *     console.log(ms)
 *     // => [ 'test in: b', 'test out: b:1', 'test in: d', 'test out: d:2' ]
 * }, 2200) //實測setInterval因多次執行會比較不準, 故顯示2000ms結束, 實際為2200ms之後
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
            // console.log('start detect')

            //setInterval
            t = setInterval(() => {
                //console.log('q', q)

                //check
                if (tLast === null) {
                    throw new Error(`invalid tLast`)
                }

                //check
                if (state !== 'wait') {
                    return
                }

                //check
                if (state === 'wait' && q.length === 0) {
                    clearInterval(t)
                    t = null
                    tLast = null
                    return
                }

                //tNow
                let tNow = Date.now()
                // console.log('ii', getIt())

                //tDiff
                let tDiff = tNow - tLast

                //b
                let b = tDiff > ms

                //check
                if (b) { //超過指定延時則呼叫指定func

                    //state
                    state = 'doing'

                    //update, 直接使用前面計算時間差之時間點
                    tLast = tNow

                    //取最後的任務與清空佇列
                    let m = q.pop()
                    q = []
                    // console.log('m', m)

                    //執行最末任務
                    // console.log('fun start ii', getIt(), 'ms', tDiff, m.input)
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

                                //update, 因func計算時間可能較長, 得重新更新時間點
                                tLast = Date.now()

                                // console.log('fun(async) end ii', getIt(), 'ms', m.input)
                            })
                    }
                    else {
                        m.output = r
                        state = 'wait'

                        // console.log('fun(sync) end_i', getIt(), 'ms', m.input)
                    }

                }

                //clear
                if (state === 'wait' && q.length === 0) {
                    clearInterval(t)
                    t = null
                    tLast = null
                }

            }, 20) //20ms偵測, 啟動後跑timer, 無佇列則會停止減耗

        }

        function run(func, ...input) {

            //check
            if (!isfun(func)) {
                console.log('func is not a function')
                return
            }
            // console.log('call run ii', Date.now() - _tNow, 'ms', input)

            //first tLast
            if (tLast === null) {
                tLast = Date.now()
            }
            else if (state === 'wait') {
                tLast = Date.now()
            }
            else {
                // console.log('state', state)
                //不更新tLast
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
