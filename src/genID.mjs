import ispint from './ispint.mjs'


/**
 * 產生隨機id
 * Wind4/Math.uuid.js
 * https://gist.github.com/Wind4/3baa40b26b89b686e4f2
 * @memberOf wsemi
 * @param {PositiveInteger} [len=undefined] 輸入uuid長度，為正整數，預設不使用，產生uuid為32位(rfc4122格式)
 * @returns {String} 回傳uuid字串
 */
function genID(len) {

    let i
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    let uuid = []
    let radix = chars.length

    if (ispint(len)) {
        //compact form

        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    }
    else {
        //rfc4122, version 4 form

        //requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        //fill in random data.  At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
        let r
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }

    let r = uuid.join('')

    return r
}


export default genID
