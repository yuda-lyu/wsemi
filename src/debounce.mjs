import size from 'lodash-es/size.js'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import pm2resolve from './pm2resolve.mjs'
import getTrace from './getTrace.mjs'


/**
 * 函數去除抖動
 *
 * 呼叫無回傳值，任務不被等待；任務同步拋錯或其Promise被reject時以console.log記錄而不外拋(不產生未處理之rejection)，不影響後續佇列；輸入非函數時不排入佇列(不影響已排入之任務)，以console.log記錄'func is not a function'
 *
 * 回傳之函數另帶cancel()：立即停止偵測(清除偵測計時器)並丟棄尚未執行之任務，回傳undefined；已開始執行之任務(含其尚未完成之Promise)不受影響、不被中止；未有待執行之任務時呼叫亦無妨(只通知事件)；cancel之後再呼叫去除抖動函數，則如同初次呼叫重新排入並開始偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/debounce.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [ms=300] 輸入未有調用的時間區間，為正整數，預設300ms
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'push'時為任務排入佇列(含size為排入後之佇列長度)，'start'時為開始偵測(每10ms檢查一次是否已超過ms未有調用)，'run'時為已超過ms未有調用而即將執行最後之任務(含dropped為被捨棄之較早任務數)，'stop'時為佇列已空而停止偵測，'cancel'時為呼叫cancel()(含dropped為被丟棄之待執行任務數、stopped為是否停止了進行中之偵測布林值；cancel不另通知'stop')；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響去除抖動，預設null
 * @returns {Function} 回傳去除抖動函數，格式為(func, ...input)=>undefined，func為欲去除抖動之任務函數，input為呼叫func時之引數；另帶cancel方法
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let dbc = debounce(300)
 *
 *             let i = 0
 *             function core(name) {
 *                 i++
 *                 ms.push({ name, i })
 *                 console.log({ name, i })
 *             }
 *
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('A')
 *                 })
 *             }, 100)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('B')
 *                 })
 *             }, 200)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('C')
 *                 })
 *             }, 250)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('D')
 *                 })
 *             }, 350)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('E')
 *                 })
 *             }, 400)
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 800)
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // { name: 'E', i: 1 }
 *     // [{"name":"E","i":1}]
 *
 *     function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let dbc = debounce(300)
 *
 *             let i = 0
 *             function core(name) {
 *                 i++
 *                 ms.push({ name, i })
 *                 console.log({ name, i })
 *             }
 *
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('A')
 *                 })
 *             }, 50)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('B')
 *                 })
 *             }, 100)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('C')
 *                 })
 *             }, 150)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('D')
 *                 })
 *             }, 500)
 *             setTimeout(function() {
 *                 dbc(() => {
 *                     core('E')
 *                 })
 *             }, 550)
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 1400)
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // { name: 'C', i: 1 }
 *     // { name: 'E', i: 2 }
 *     // [{"name":"C","i":1},{"name":"E","i":2}]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function debounce(ms = 300, opt = {}) {

    function ClsDebounce(ms) {
        let q = [] //queue
        let t = null //timer
        let tLast = Date.now() //先初始化, 之後由每次run覆蓋

        //ms
        if (!ispint(ms)) {
            ms = 300
        }
        ms = cint(ms)

        //trace, 觀察回調(opt.onTrace), 未給時為null
        let trace = getTrace(opt)

        function detect() {
            if (t !== null) {
                return
            }
            t = setInterval(() => {
            //console.log('q', q)

                //check
                if (size(q) === 0) {
                    clearInterval(t)
                    t = null
                    if (trace) {
                        trace('stop', {})
                    }
                    return
                }

                //tDiff
                let tDiff = Date.now() - tLast

                //check
                if (tDiff > ms) { //超過指定延時則呼叫指定func

                    //取最後的任務與清空佇列
                    let m = q.pop()
                    if (trace) {
                        trace('run', { dropped: q.length })
                    }
                    q = []

                    //執行最後任務, 不論成功失敗都須持續執行至無佇列
                    //有可能為sync或async, async時不await, 須持續執行至無佇列; 結果經pm2resolve正規化, 同步拋錯與非同步reject一律記錄, 不使計時器回呼拋錯亦不產生未處理之rejection
                    pm2resolve(m.func)(...m.input)
                        .then((res) => {
                            if (res.state === 'error') {
                                //記錄本身亦可能拋錯(如值之util.inspect.custom會拋), 須包try, 否則成為未處理之rejection(同evEmit之通報)
                                try {
                                    console.log('m.func catch', res.msg)
                                }
                                catch (err) {}
                            }
                        })

                }

            }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗
            if (trace) {
                trace('start', {})
            }
        }

        function run(func, ...input) {

            //check
            if (!isfun(func)) {
                console.log('func is not a function')
                return
            }

            //save
            tLast = Date.now()
            q.push({ func, input })
            if (trace) {
                trace('push', { size: q.length })
            }

            //detect
            detect()

        }

        //cancel, 停止偵測並丟棄待執行之任務; 已開始執行之任務(含其Promise)不受影響; 之後再呼叫run則重新開始偵測
        function cancel() {
            let dropped = q.length
            let stopped = t !== null
            if (stopped) {
                clearInterval(t)
                t = null
            }
            q = []
            if (trace) {
                trace('cancel', { dropped, stopped })
            }
        }
        run.cancel = cancel

        return run
    }

    return new ClsDebounce(ms)
}


export default debounce
