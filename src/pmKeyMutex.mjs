

/**
 * 依key分組之非同步互斥鎖(per-key mutex)，相同key之呼叫循序執行(排隊)，不同key之呼叫互不影響可並行
 *
 * 通過new建構後回傳run函數，run(key, fn)會將fn接在該key當前佇列尾端，等前面同key之fn皆執行完畢才輪到自己執行。可用於避免同一資源(以key識別)被並發存取，例如同一檔案、同一帳號、同一筆資料之非同步操作須序列化時
 *
 * 各caller之成敗互相獨立：某個fn拋錯(reject)只會將錯誤傳回給該次呼叫者，不會阻擋同key後續排隊之caller執行。不同key各自獨立排隊，彼此並行。當某key之佇列全數結束(無排隊中亦無執行中)，會自動清除該key之內部記錄，避免Map無限增長
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmKeyMutex.test.mjs Github}
 * @memberOf wsemi
 * @returns {Function} 回傳run函數，第1參數key為分組識別字串(相同key循序執行，不同key並行)，第2參數fn為待執行之非同步函數(回傳Promise)。run回傳為Promise，resolve回傳fn成功結果而reject回傳fn失敗結果
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         let ms = []
 *         let mx = pmKeyMutex()
 *
 *         function fun(key, v, d) {
 *             console.log('call', key + '-' + v)
 *             ms.push('call ' + key + '-' + v)
 *             return new Promise(function(resolve) {
 *                 setTimeout(function() {
 *                     console.log('resolve', key + '-' + v)
 *                     ms.push('resolve ' + key + '-' + v)
 *                     resolve('#' + v)
 *                 }, d)
 *             })
 *         }
 *
 *         //相同key 'A' 之 a1、a2 循序執行(a1完成才換a2), 不同key 'B' 之 b1 與 'A' 並行
 *         let pms = []
 *         pms.push(mx('A', () => fun('A', 'a1', 300)).then(r => ms.push('then A-a1: ' + r)))
 *         pms.push(mx('A', () => fun('A', 'a2', 100)).then(r => ms.push('then A-a2: ' + r)))
 *         pms.push(mx('B', () => fun('B', 'b1', 200)).then(r => ms.push('then B-b1: ' + r)))
 *         await Promise.all(pms)
 *         return ms
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call A-a1
 *     // call B-b1
 *     // resolve B-b1
 *     // resolve A-a1
 *     // call A-a2
 *     // resolve A-a2
 *     // ["call A-a1","call B-b1","resolve B-b1","then B-b1: #b1","resolve A-a1","call A-a2","then A-a1: #a1","resolve A-a2","then A-a2: #a2"]
 *
 *     async function test2() {
 *         let ms = []
 *         let mx = pmKeyMutex()
 *
 *         function funOk(v, d) {
 *             return new Promise(function(resolve) {
 *                 setTimeout(function() {
 *                     resolve('#' + v)
 *                 }, d)
 *             })
 *         }
 *         function funErr(v, d) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(function() {
 *                     reject('err-' + v)
 *                 }, d)
 *             })
 *         }
 *
 *         //同key 'K' 中 k2 拋錯, 只會將錯誤傳回k2之呼叫者, 不會阻擋後續排隊之k3執行
 *         let pms = []
 *         pms.push(mx('K', () => funOk('k1', 100)).then(r => ms.push('then k1: ' + r), e => ms.push('catch k1: ' + e)))
 *         pms.push(mx('K', () => funErr('k2', 100)).then(r => ms.push('then k2: ' + r), e => ms.push('catch k2: ' + e)))
 *         pms.push(mx('K', () => funOk('k3', 100)).then(r => ms.push('then k3: ' + r), e => ms.push('catch k3: ' + e)))
 *         await Promise.all(pms)
 *         return ms
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // ["then k1: #k1","catch k2: err-k2","then k3: #k3"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmKeyMutex() {

    function ClsPmKeyMutex() {

        //每個 key 對應一條 Promise chain 之尾端 (下一個 caller 須 await 它)
        let chains = new Map()

        //每個 key 當前排隊中 (含執行中) 的 caller 數, 用於最後一個釋放時清掉 entry
        let counts = new Map()

        let run = async (key, fn) => {

            //取得當前 chain 尾; 若無則以 resolved promise 起頭
            let prev = chains.get(key) || Promise.resolve()

            //新 caller 接在尾端: 不論 prev 成功或失敗, 都要輪到自己執行 fn
            //(prev 的成敗不該影響後續 caller 是否有機會跑)
            let next = prev.then(async () => {
                return await fn()
            }, async () => {
                return await fn()
            })

            //把 chain 尾推進到自己; 用 .catch(() => {}) 包一層防止 unhandled rejection
            //(後續 caller 仍從原 next 取結果, 此包裝只影響「鏈尾 reference」)
            chains.set(key, next.catch(() => {}))

            //increment 計數
            counts.set(key, (counts.get(key) || 0) + 1)

            try {
                return await next
            }
            finally {
                //caller 結束 (不論成敗) → decrement 計數
                let cnt = counts.get(key) - 1
                if (cnt <= 0) {
                    //最後一個 caller 結束 → 清掉 entry 避免 Map 無限增長
                    counts.delete(key)
                    chains.delete(key)
                }
                else {
                    counts.set(key, cnt)
                }
            }
        }

        return run
    }

    return new ClsPmKeyMutex()
}


export default pmKeyMutex
