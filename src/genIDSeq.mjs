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
 * // => 01980453-935d-700e-a331-633e52a16055 (is random)
 *
 */
function genIDSeq() {
    let id = uuidv7()
    return id
}


export default genIDSeq
