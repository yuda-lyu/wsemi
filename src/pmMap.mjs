import each from 'lodash/each'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'
import queue from './queue.mjs'


/**
 * Promise的mapSeries
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmMap.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * let takeLimit = 2
 * let rs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * //pmMap
 * pmMap(rs, function (v, k) {
 *     console.log('call', v)
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             console.log('resolve', v)
 *             resolve('#' + v)
 *         }, 300)
 *     })
 * }, takeLimit)
 *     .then(function(res) {
 *         console.log('pmMap then', JSON.stringify(res))
 *     })
 *     .catch(function(err) {
 *         console.log('pmMap catch', err)
 *     })
 *
 * // call 1
 * // call 2
 * // resolve 1
 * // call 3
 * // resolve 2
 * // call 4
 * // resolve 3
 * // call 5
 * // resolve 4
 * // call 6
 * // resolve 5
 * // call 7
 * // resolve 6
 * // call 8
 * // resolve 7
 * // call 9
 * // resolve 8
 * // call 10
 * // resolve 9
 * // resolve 10
 * // pmMap then ["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]
 *
 * // when run pmMap by takeLimit<=0
 * // call 1
 * // call 2
 * // call 3
 * // call 4
 * // call 5
 * // call 6
 * // call 7
 * // call 8
 * // call 9
 * // call 10
 * // resolve 1
 * // resolve 2
 * // resolve 3
 * // resolve 4
 * // resolve 5
 * // resolve 6
 * // resolve 7
 * // resolve 8
 * // resolve 9
 * // resolve 10
 * // pmMap then ["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]
 *
 */
function pmMap(rs, fn, takeLimit = 0) {
    let ts = []
    let abort = false

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs)) {
        pm.reject('rs is not array')
        return pm
    }

    //default fn
    if (!isfun(fn)) {
        fn = function(v) {
            return v
        }
    }

    //queue
    let q = queue(takeLimit)

    //message
    q.on('message', function(qs) {
        //console.log('message', JSON.stringify(qs))

        //check
        if (abort) {
            return
        }

        //get
        let v = q.get()
        //console.log('get', v)

        //fn
        fn(v.value, v.key)
            .then((res) => {

                //push
                ts.push(res)

            })
            .catch((err) => {

                //abort
                abort = true

                //reject
                pm.reject(err)

            })
            .finally(() => {

                //cb
                q.cb()

                //end
                if (ts.length === rs.length) {

                    //resolve
                    pm.resolve(ts)

                }

            })

    })

    //push, 因queue emit為即時觸發故push需放最後
    each(rs, (v, k) => {
        q.push({
            key: k,
            value: v,
        })
    })

    return pm
}


export default pmMap
