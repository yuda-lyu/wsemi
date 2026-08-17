import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import ispm from './ispm.mjs'
import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'


/**
 * 為Promise添加逾時限制
 *
 * 以Promise.race令pm與計時器競速，pm先完成則原樣回傳其resolve或reject之結果，逾時則reject一個Error
 * 該Error之message為'timeout[ms數ms]'(有label時置於前綴)，並帶有code為'TIMEOUT'與timeout為逾時毫秒數等欄位，供呼叫端辨別為逾時而非pm自身之錯誤
 * 注意JavaScript無法中止已啟動之Promise，逾時僅代表不再等待其結果，pm內之工作仍會繼續執行至自然結束，若需一併中止內部工作(如子進程)須由pm自行處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmTimeout.test.mjs Github}
 * @memberOf wsemi
 * @param {Promise} pm 輸入Promise物件，非Promise時擲出錯誤'invalid pm'
 * @param {Integer} ms 輸入逾時毫秒數，須為非負整數，為0代表下一輪事件迴圈即逾時，其餘擲出錯誤'invalid ms[ms數]'
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.label=''] 輸入識別字串，將置於逾時錯誤訊息之前綴以利辨識來源，非有效字串時回退為空字串，預設''
 * @returns {Promise} 回傳Promise，pm先完成則resolve或reject其結果，逾時則reject一個code為'TIMEOUT'之Error
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     //pm先完成則原樣回傳其結果
 *     let r1 = await pmTimeout(delay(10).then(() => 'ok'), 1000)
 *     console.log('r1', r1)
 *     // => r1 ok
 *
 *     //逾時則reject一個code為'TIMEOUT'之Error
 *     try {
 *         await pmTimeout(delay(3000), 100)
 *     }
 *     catch (err) {
 *         console.log('r2', err.message, err.code, err.timeout)
 *         // => r2 timeout[100ms] TIMEOUT 100
 *     }
 *
 *     //有label時置於訊息前綴
 *     try {
 *         await pmTimeout(delay(3000), 100, { label: 'fetchUser' })
 *     }
 *     catch (err) {
 *         console.log('r3', err.message)
 *         // => r3 fetchUser timeout[100ms]
 *     }
 *
 *     //pm自身之reject原樣傳出, 其code非'TIMEOUT'故可與逾時區分
 *     try {
 *         await pmTimeout(Promise.reject(new Error('mine')), 1000)
 *     }
 *     catch (err) {
 *         console.log('r4', err.message, err.code)
 *         // => r4 mine undefined
 *     }
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function pmTimeout(pm, ms, opt = {}) {

    //check, pm與ms給錯視為程式撰寫錯誤而擲出錯誤
    if (!ispm(pm)) {
        throw new Error(`invalid pm`)
    }

    //check
    if (!isp0int(ms)) {
        throw new Error(`invalid ms[${ms}]`)
    }

    //label
    let label = get(opt, 'label', null)
    if (!isestr(label)) {
        label = ''
    }

    //msgErr, label為空時不加前綴, 避免訊息出現多餘之前導空白
    let msgErr = `timeout[${ms}ms]`
    if (isestr(label)) {
        msgErr = `${label} ${msgErr}`
    }

    //timeout, 計時器用Promise, 逾時即reject
    let t
    let timeout = genPm()
    t = setTimeout(() => {
        let e = new Error(msgErr)
        e.code = 'TIMEOUT' //供呼叫端辨別為逾時而非pm自身之錯誤
        e.timeout = ms
        timeout.reject(e)
    }, ms)

    //race, 先完成者勝出
    //無論勝負皆須clearTimeout: pm先完成時若不清除, 計時器會持續佔住event loop而延後process結束
    //pm逾時落敗後其自身之reject仍由Promise.race內部掛載之handler接住, 不會產生unhandled rejection
    let r = Promise.race([pm, timeout])
        .finally(() => clearTimeout(t))

    return r
}


export default pmTimeout
