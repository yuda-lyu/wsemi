import { v7 as uuidv7 } from 'uuid'


/**
 * 基於uuidv7產生循序隨機id
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genIDSeq.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳uuid字串
 * @example
 *
 * console.log(genIDSeq())
 * // => Is1NyImU3A9fyqFyYBWuJu4ivXXcGZAb (is random)
 *
 */
function genIDSeq() {
    let id = uuidv7()
    return id
}


export default genIDSeq
