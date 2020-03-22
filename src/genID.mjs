import ispint from './ispint.mjs'
import cint from './cint.mjs'


let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
let radix = chars.length

/**
 * 產生隨機id
 *
 * Depend on: {@link https://gist.github.com/Wind4/3baa40b26b89b686e4f2 Math.uuid.js}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genID.test.js Github}
 * @memberOf wsemi
 * @param {Integer} [len=32] 輸入uuid長度，為正整數，預設32
 * @returns {String} 回傳uuid字串
 * @example
 * console.log(genID())
 * // => Is1NyImU3A9fyqFyYBWuJu4ivXXcGZAb (is random)
 */
function genID(len = 32) {
    let uuid = []

    //check
    if (ispint(len)) {
        len = cint(len)
    }
    else {
        len = 32
    }

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
