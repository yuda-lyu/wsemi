import isfun from './isfun.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'


/**
 * 函數去除抖動
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/debounce.test.js Github}
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
        let tLast = null

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

                let tDiff = Date.now() - tLast
                if (tDiff > ms) { //超過指定延時則呼叫指定func

                    //取最後的任務與清空佇列
                    let m = q.pop()
                    q = []

                    //執行最後的任務
                    m.func(...m.input)

                }

                //clear
                if (q.length === 0) {
                    clearInterval(t)
                    t = null
                }

            }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗
        }

        function run(func, ...input) {

            //check
            if (!isfun(func)) {
                console.log('func is not function')
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
