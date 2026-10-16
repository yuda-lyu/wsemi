import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'


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
 * @returns {Object} 回傳事件物件，可呼叫事件get、getFromCache，get為封裝後封裝原本非同步函數，getFromCache為提供取用快取版之非同步函數，若有快取則優先使用，若超過指定次數則自動執行get使能取得快取。getFromCache於嘗試nTrigger次之後，若尚無快取且無任何執行中之get(含直接呼叫者)才觸發get，觸發之get失敗時不向外報錯而續等，超過nMax次(每次間隔1000ms)仍無快取時reject Error('exceeded nMax[nMax]')。get為直接執行fun並回傳其自身之結果(失敗則reject其錯誤)，不與執行中者共用；寫入快取依啟動先後，先啟動而後完成者之結果不覆蓋後啟動者已寫入之快取。fun非函數時get以TypeError被reject，getFromCache吞下其錯誤而持續輪詢至nMax後reject
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

    //快取
    let cc = null

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
        return (async () => {
            try {
                let r = await fun(...inputs) //fun同步拋錯或非函數亦由async承接為reject
                if (seq > seqCc) {
                    cc = r
                    seqCc = seq
                }
                return r
            }
            finally {
                seqsRunning.delete(seq) //不論成功失敗皆移除, 否則一次失敗後getFromCache永不再嘗試取得; 不於回傳之Promise上掛處理器, 呼叫端未接之失敗仍為未處理之rejection
            }
        })()
    }

    //_getFromCache, 提供取用快取版之非同步函數, 若有快取則優先使用, 若超過指定次數則執行get使能取得快取
    let _getFromCache = async(...inputs) => {
        for (let i = 1; i <= nMax; i++) {

            //exec, 已有快取時不觸發(優先使用快取), 有任一執行中之get(含直接呼叫之get)時亦不觸發
            if (i > nTrigger && cc === null && seqsRunning.size === 0) {
                // console.log('執行get使能取得快取...')
                await _get(...inputs)
                    .catch(() => {}) //取得快取時不向外報錯
            }

            //check
            if (cc !== null) {
                break
            }

            //delay
            await delay(1000) //偵測週期1000ms

        }
        if (cc === null) {
            throw new Error(`exceeded nMax[${nMax}]`)
        }
        return cc
    }

    return {
        get: _get,
        getFromCache: _getFromCache,
    }
}


export default cacheBd
