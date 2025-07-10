import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'


/**
 * 封裝非同步函數與再提供使用快取版
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cacheBd.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [nMax=200] 輸入使用快取版之總嘗試次數整數，超過則報錯，預設200
 * @param {Integer} [nTrigger=3] 輸入嘗試指定次數整數，若嘗試指定次數之後皆無快取則須自動執行get用以取得快取，預設3
 * @returns {Object} 回傳事件物件，可呼叫事件get、getByCache，get為封裝後封裝原本非同步函數，getByCache為提供取用快取版之非同步函數，若有快取則優先使用，若超過指定次數則自動執行get使能取得快取
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
 *     let execFunCache = bc.getByCache
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
 *     let execFunCache = bc.getByCache
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
 *     let execFunCache = bc.getByCache
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

    //函數執行狀態
    let lock = false

    //_get, 封裝原本非同步函數
    let _get = async(...inputs) => {
        lock = true
        cc = await fun(...inputs) //若發生錯誤則向外報錯
        lock = false
        return cc
    }

    //_getByCache, 提供取用快取版之非同步函數, 若有快取則優先使用, 若超過指定次數則執行get使能取得快取
    let _getByCache = async(...inputs) => {
        for (let i = 1; i <= nMax; i++) {

            //exec
            if (i > nTrigger && !lock) {
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
        getByCache: _getByCache,
    }
}


export default cacheBd
