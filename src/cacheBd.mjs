import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'
import getTrace from './getTrace.mjs'


/**
 * 非同步函數快取，封裝指定非同步函數與再提供取用快取版
 *
 * get須定期或高執行率，getFromCache雖能自己自動調用，但僅第1次取得後數據就無法更新，此會導致一直取得舊數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cacheBd.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.nMax=200] 輸入使用快取版之總嘗試次數，為正整數，超過則報錯，預設200
 * @param {Integer} [opt.nTrigger=3] 輸入嘗試指定次數，為正整數，若嘗試指定次數之後皆無快取則須自動執行get用以取得快取，預設3
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部邏輯事件發生當下同步呼叫(輪詢之等待本身不通知，其間隔由delay提供)，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷，事件欄位只含數字與布林，不含fun之輸入與回傳值；type為'poll'時為getFromCache每次嘗試之判定(含call為本實例第幾次getFromCache呼叫、i為第幾次嘗試、cached為是否已有快取、running為執行中之get數、trigger為是否因此觸發get，須i大於nTrigger且無快取且無執行中之get)，觸發時緊接著通知該次get，'get'時為get開始(含seq為本實例第幾次get，不論直接呼叫或由getFromCache觸發)，'done'時為該次get結束(含seq、ok為fun是否未失敗、cached為其結果是否寫入快取，先啟動而後完成者不覆蓋後啟動者已寫入之快取時為false)且早於該次get之settle，'settle'時為getFromCache結束(含call、ok為是否取得快取，超過nMax而reject時為false)且早於其settle；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響快取，預設null
 * @returns {Object} 回傳事件物件，可呼叫事件get、getFromCache，get為封裝後封裝原本非同步函數，getFromCache為提供取用快取版之非同步函數，若有快取則優先使用，若超過指定次數則自動執行get使能取得快取。getFromCache於嘗試nTrigger次之後，若尚無快取且無任何執行中之get(含直接呼叫者)才觸發get，觸發之get失敗時不向外報錯而續等，超過nMax次(每次間隔1000ms)仍無快取時reject Error('exceeded nMax[nMax]')。get為直接執行fun並回傳其自身之結果(失敗則reject其錯誤)，不與執行中者共用；寫入快取依啟動先後，先啟動而後完成者之結果不覆蓋後啟動者已寫入之快取；fun成功回傳之任何值(含null與undefined)皆視為已有快取，是否已有快取不以回傳值判定。fun非函數時get以TypeError被reject，getFromCache吞下其錯誤而持續輪詢至nMax後reject
 * @example
 *
 * let test1 = async () => {
 *     let ms = []
 *
 *     let fun = async(p1, p2) => {
 *         await delay(300)
 *         return `${p1}:${p2}`
 *     }
 *
 *     let bc = cacheBd(fun)
 *     let execFun = bc.get
 *     let execFunCache = bc.getFromCache
 *
 *     let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
 *     pm1
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ result: `pm1-${res}` })
 *         })
 *
 *     let pm2 = execFun(4.56, 'def') //pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
 *     pm2
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ result: `pm2-${res}` })
 *         })
 *
 *     let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
 *     pm3
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ result: `pm3-${res}` })
 *         })
 *
 *     await Promise.all([pm1, pm2, pm3])
 *     // console.log('rs', rs)
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test1()
 * // ms [
 * //   { result: 'pm2-4.56:def' },
 * //   { result: 'pm1-4.56:def' },
 * //   { result: 'pm3-4.56:def' }
 * // ]
 *
 * let test2 = async () => {
 *     let ms = []
 *
 *     let fun = async(p1, p2) => {
 *         await delay(300)
 *         return `${p1}:${p2}`
 *     }
 *
 *     let bc = cacheBd(fun)
 *     let execFun = bc.get
 *     let execFunCache = bc.getFromCache
 *
 *     setTimeout(() => {
 *         console.log('pm1 exec..')
 *         let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
 *         pm1
 *             .then((res) => {
 *                 console.log('pm1 then', res)
 *                 ms.push({ result: `pm1-${res}` })
 *             })
 *     }, 1)
 *
 *     setTimeout(() => {
 *         console.log('pm2 exec..')
 *         let pm2 = execFun(4.56, 'def') //1000ms後, pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
 *         pm2
 *             .then((res) => {
 *                 console.log('pm2 then', res)
 *                 ms.push({ result: `pm2-${res}` })
 *             })
 *     }, 1000)
 *
 *     setTimeout(() => {
 *         console.log('pm3 exec..')
 *         let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
 *         pm3
 *             .then((res) => {
 *                 console.log('pm3 then', res)
 *                 ms.push({ result: `pm3-${res}` })
 *             })
 *     }, 3000)
 *
 *     await delay(5000)
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test2()
 * // ms [
 * //   { result: 'pm2-4.56:def' },
 * //   { result: 'pm1-4.56:def' },
 * //   { result: 'pm3-4.56:def' }
 * // ]
 *
 * let test3 = async () => {
 *     let ms = []
 *
 *     let fun = async(p1, p2) => {
 *         await delay(300)
 *         return `${p1}:${p2}`
 *     }
 *
 *     let bc = cacheBd(fun)
 *     let execFun = bc.get
 *     let execFunCache = bc.getFromCache
 *
 *     setTimeout(() => {
 *         console.log('pm1 exec..')
 *         let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待, 3000ms將執行get與自己的輸入, 並最先回傳
 *         pm1
 *             .then((res) => {
 *                 console.log('pm1 then', res)
 *                 ms.push({ result: `pm1-${res}` })
 *             })
 *     }, 1)
 *
 *     setTimeout(() => {
 *         console.log('pm2 exec..')
 *         let pm2 = execFun(4.56, 'def') //3500ms後, pm2執行原本函數與使用輸入, 計算完畢則會覆蓋快取, 此快取將再給等待或之後取得快取使用
 *         pm2
 *             .then((res) => {
 *                 console.log('pm2 then', res)
 *                 ms.push({ result: `pm2-${res}` })
 *             })
 *     }, 3500)
 *
 *     setTimeout(() => {
 *         console.log('pm3 exec..')
 *         let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
 *         pm3
 *             .then((res) => {
 *                 console.log('pm3 then', res)
 *                 ms.push({ result: `pm3-${res}` })
 *             })
 *     }, 4500)
 *
 *     await delay(6500)
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test3()
 * // ms [
 * //   { result: 'pm1-123:abc' },
 * //   { result: 'pm2-4.56:def' },
 * //   { result: 'pm3-4.56:def' }
 * // ]
 *
 */
function cacheBd(fun, opt = {}) {

    //nMax
    let nMax = get(opt, 'nMax')
    if (!ispint(nMax)) {
        nMax = 200
    }
    nMax = cint(nMax)

    //nTrigger
    let nTrigger = get(opt, 'nTrigger')
    if (!ispint(nTrigger)) {
        nTrigger = 3
    }
    nTrigger = cint(nTrigger)

    //觀察回調, 未傳時為null, 各站點以if (trace)略過而不組事件物件
    let trace = getTrace(opt)
    let nCall = 0 //getFromCache呼叫序號, 僅於通知時遞增

    //快取, 是否已有快取以hasCc判定(fun成功回傳之任何值皆算, 含null與undefined), 不以值判定
    let cc = null
    let hasCc = false

    //啟動序號, 每次get遞增; seqCc為已寫入快取者之啟動序號, 先啟動而後完成者之結果不覆蓋後啟動者已寫入之快取
    let seqStart = 0
    let seqCc = 0

    //執行中之get之啟動序號集合, 取代布林lock: 任一次get結束(含失敗)不得使其他執行中者被視為未執行
    let seqsRunning = new Set()

    //_get, 封裝原本非同步函數, 回傳其自身之結果, 若發生錯誤則向外報錯
    let _get = (...inputs) => {
        seqStart += 1
        let seq = seqStart
        seqsRunning.add(seq) //先登記再執行: fun同步拋錯時async內之finally於回傳前即執行, 須已登記方能移除
        if (trace) {
            trace('get', { seq })
        }
        return (async () => {
            let ok = false //fun是否未失敗, 僅供觀察回調
            let cached = false //結果是否寫入快取, 僅供觀察回調
            try {
                let r = await fun(...inputs) //fun同步拋錯或非函數亦由async承接為reject
                ok = true
                if (seq > seqCc) {
                    cc = r
                    hasCc = true
                    seqCc = seq
                    cached = true
                }
                return r
            }
            finally {
                seqsRunning.delete(seq) //不論成功失敗皆移除, 否則一次失敗後getFromCache永不再嘗試取得; 不於回傳之Promise上掛處理器, 呼叫端未接之失敗仍為未處理之rejection
                if (trace) {
                    trace('done', { seq, ok, cached })
                }
            }
        })()
    }

    //_getFromCache, 提供取用快取版之非同步函數, 若有快取則優先使用, 若超過指定次數則執行get使能取得快取
    let _getFromCache = async(...inputs) => {
        let call = 0 //本次呼叫序號, 僅供觀察回調
        if (trace) {
            call = ++nCall
        }
        for (let i = 1; i <= nMax; i++) {

            //exec, 已有快取時不觸發(優先使用快取), 有任一執行中之get(含直接呼叫之get)時亦不觸發
            let trigger = (i > nTrigger && !hasCc && seqsRunning.size === 0)
            if (trace) {
                trace('poll', { call, i, cached: hasCc, running: seqsRunning.size, trigger })
            }
            if (trigger) {
                // console.log('執行get使能取得快取...')
                await _get(...inputs)
                    .catch(() => {}) //取得快取時不向外報錯
            }

            //check
            if (hasCc) {
                break
            }

            //delay
            await delay(1000) //偵測週期1000ms

        }
        if (!hasCc) {
            if (trace) {
                trace('settle', { call, ok: false })
            }
            throw new Error(`exceeded nMax[${nMax}]`)
        }
        if (trace) {
            trace('settle', { call, ok: true })
        }
        return cc
    }

    return {
        get: _get,
        getFromCache: _getFromCache,
    }
}


export default cacheBd
