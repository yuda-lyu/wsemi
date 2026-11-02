import optVal from './_optVal.mjs'


let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
let radix = chars.length

//len: opt類參數(JSDoc [len=32]), 有效整數且為個數(iseint, use: 'count', min: 1), 非預期(含0、負數、小數、Infinity、'0x4'、包裝物件、超出個數範圍)改用預設32; 位置參數無opt物件可帶debug, 故不警告
let RULE_LEN = { fn: 'genID', name: 'len', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生隨機id
 *
 * len為opt類參數(預設32)，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為個數(1~4294967295)，非預期之輸入(0、負數、小數、Infinity、'0x4'、包裝物件等)視為未給而改用預設32，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genID.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} [len=32] 輸入uuid長度，opt類參數(有效整數，1~4294967295，數字字串亦可)，非預期之輸入視為未給而改用預設，預設32
 * @returns {String} 回傳uuid字串
 * @example
 *
 * console.log(genID())
 * // => Is1NyImU3A9fyqFyYBWuJu4ivXXcGZAb (is random)
 *
 * console.log(genID(8))
 * // => 7aK2xQ9d (is random)
 *
 * console.log(genID(Infinity).length)
 * // => 32 (非預期之輸入改用預設)
 *
 */
function genID(len = 32) {
    let uuid = []

    //len為opt類參數, 非預期改用預設32, 有效則取轉換值
    len = optVal(len, 32, RULE_LEN)

    //uuid
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]

    //rfc4122, version 4 form
    // //requires these characters
    // uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    // uuid[14] = '4'
    // //fill in random data.  At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
    // let r
    // for (i = 0; i < 36; i++) {
    //     if (!uuid[i]) {
    //         r = 0 | Math.random() * 16
    //         uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
    //     }
    // }

    let r = uuid.join('')

    return r
}


export default genID
