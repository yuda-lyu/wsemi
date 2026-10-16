import size from 'lodash-es/size.js'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import pm2resolve from './pm2resolve.mjs'


/**
 * 函數去除抖動
 *
 * 呼叫無回傳值，任務不被等待；任務同步拋錯或其Promise被reject時以console.log記錄而不外拋(不產生未處理之rejection)，不影響後續佇列；輸入非函數時不排入佇列(不影響已排入之任務)，以console.log記錄'func is not a function'
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/debounce.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [ms=300] 輸入未有調用的時間區間，為正整數，預設300ms
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
function debounce(ms = 300) {

    function ClsDebounce(ms) {
        let q = [] //queue
        let t = null //timer
        let tLast = Date.now() //先初始化, 之後由每次run覆蓋

        //ms
        if (!ispint(ms)) {
            ms = 300
        }
        ms = cint(ms)

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
                    return
                }

                //tDiff
                let tDiff = Date.now() - tLast

                //check
                if (tDiff > ms) { //超過指定延時則呼叫指定func

                    //取最後的任務與清空佇列
                    let m = q.pop()
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

            //detect
            detect()

        }

        return run
    }

    return new ClsDebounce(ms)
}


export default debounce
