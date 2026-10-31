import ispint from './ispint.mjs'
import isfun from './isfun.mjs'
import cint from './cint.mjs'
import pm2resolve from './pm2resolve.mjs'
import getTrace from './getTrace.mjs'
import getDiag from './getDiag.mjs'


/**
 * 非同步函數進行防抖
 *
 * 同時僅會執行一個佇列(非同步函數)，到達防抖時間才會取最後一個佇列執行，待其執行完畢，若期間有新佇列進來則儲存，待執行完畢後取最後佇列出來執行
 *
 * 防抖時間(ms)自最後一次調用起算，任務執行中進來之調用亦計入；每20ms偵測一次，任務執行完畢時若自最後一次調用起已閒置滿ms，即於下一次偵測執行最後之佇列，未滿則只再等剩餘時間(不因任務執行完畢而重新起算)
 *
 * 任務之結果經pm2resolve正規化，任務同步拋錯或其Promise被reject皆視為執行完畢，記錄而不外拋(不產生未處理之rejection)，不影響後續佇列
 *
 * 記錄經getDiag(opt)之出口(診斷輸出與遮罩之單一實作，規則R-DIAG-01)：任務拋出之值常含權杖、使用者識別或資料值，不得原樣輸出。預設以console.error只輸出固定詞彙之label'[wsemi pmDebounce] task threw'與安全摘要{ errType, errCode }；opt.logDetail為true時改輸出遮罩後之拋出值；opt.funLog為函數時輸出只交給它，不寫console。輸入非函數時以console.log輸出固定詞彙'[wsemi pmDebounce] func is not a function'(同樣可由opt.funLog接管)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmDebounce.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [ms=300] 輸入未有調用的時間區間，為正整數，預設300ms
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'push'時為任務排入佇列(含size為排入後之佇列長度)，'start'時為開始偵測(每20ms檢查一次是否已超過ms未有調用)，'run'時為已超過ms未有調用而即將執行最後之任務(含dropped為被捨棄之較早任務數)，'done'時為被執行之任務已執行完畢(含ok為是否成功，其後才恢復可執行下一批)，'stop'時為佇列已空而停止偵測；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響去除抖動，預設null
 * @param {Boolean} [opt.logDetail=false] 輸入是否於console輸出遮罩後之任務拋出值，須為true才生效，同getDiag，建構時取快照，預設false(只輸出安全摘要)
 * @param {Function} [opt.funLog=null] 輸入診斷輸出函數，格式為(label, safe, detail)=>{}，給予時記錄只交給它而不寫console，同getDiag，建構時取快照，預設null
 * @returns {Function} 回傳Function，輸入為非同步函數與其輸入，會推入佇列後等待執行，呼叫無回傳值，被執行任務之結果與錯誤皆不回傳給呼叫端，須由任務自行處理；輸入非函數時不排入佇列(不影響已排入之任務)，記錄'func is not a function'
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
 *     //900ms, d進入排程, 因b執行尚未結束, d雖可進入排程, 同時排程前面還有c, 故c與d皆為等待, 發呆時間自最後一次調用(d, 900ms)起算
 *     //1000ms, b已執行完, 取最末d出來判識(c被強制剔除), 此時d僅發呆100ms(900->1000)未滿300ms, 故再等剩餘200ms
 *     //1200ms, d已發呆滿300ms(900->1200), 開始執行(d執行為1200->1700)
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
function pmDebounce(ms = 300, opt = {}) {

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

        //trace, 觀察回調(opt.onTrace), 未給時為null
        let trace = getTrace(opt)

        //diag, 診斷輸出出口(opt.logDetail、opt.funLog, 建構時取快照; 任務拋出之值與固定詞彙之記錄皆經此, 不原樣console輸出)
        let diag = getDiag(opt)

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
                    if (trace) {
                        trace('stop', {})
                    }
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

                    //取最後的任務與清空佇列
                    let m = q.pop()
                    if (trace) {
                        trace('run', { dropped: q.length })
                    }
                    q = []
                    // console.log('m', m)

                    //執行最末任務, 結果經pm2resolve正規化(同步回傳、同步拋錯、Promise皆同), 其必定resolve, 故必定恢復wait而不停擺, 亦不使計時器回呼拋錯
                    // console.log('fun start ii', getIt(), 'ms', tDiff, m.input)
                    pm2resolve(m.func)(...m.input)
                        .then((res) => {
                            if (trace) {
                                trace('done', { ok: res.state === 'success' })
                            }
                            m.output = (res.state === 'success') ? res.msg : { err: res.msg }
                            if (res.state === 'error') {
                                //比照debounce經diag記錄失敗(永不拋錯), 外層try為最後防線, 否則成為未處理之rejection
                                try {
                                    diag('[wsemi pmDebounce] task threw', diag.brief(res.msg), () => res.msg, 'error')
                                }
                                catch (err) {}
                            }
                        })
                        .finally(() => {
                            //恢復wait, 不更新tLast: 防抖時間自最後一次調用起算, 任務完成時已閒置滿ms者於下一次偵測即執行, 未滿者只等剩餘時間
                            state = 'wait'

                            // console.log('fun end ii', getIt(), 'ms', m.input)
                        })

                }

            }, 20) //20ms偵測, 啟動後跑timer, 無佇列則會停止減耗
            if (trace) {
                trace('start', {})
            }

        }

        function run(func, ...input) {

            //check
            if (!isfun(func)) {
                diag('[wsemi pmDebounce] func is not a function')
                return
            }
            // console.log('call run ii', Date.now() - _tNow, 'ms', input)

            //tLast, 每次調用皆更新為最後一次調用之時間, 任務執行中進來之調用亦計入
            tLast = Date.now()

            //push
            q.push({
                func,
                input,
                output: null,
            })
            // console.log('push q', q)
            if (trace) {
                trace('push', { size: q.length })
            }

            //detect
            detect()

        }

        return run
    }

    return new ClsDebounce(ms)
}


export default pmDebounce
