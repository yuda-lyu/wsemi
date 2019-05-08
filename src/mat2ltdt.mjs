import take from 'lodash/take'
import tail from 'lodash/tail'
import isearr from './isearr.mjs'
import keysmat2ltdt from './keysmat2ltdt.mjs'


/**
 * 由mdata第1行當head，其餘當data，轉ltdt
 * mdata第1行需為字串陣列，才能當head
 * @export
 * @param {Array} mdata 輸入資料陣列
 * @returns {Array} 回傳物件陣列
 */
export default function mat2ltdt(mdata) {

    //check
    if (!isearr(mdata)) {
        return []
    }

    let keys = take(mdata)
    let data = tail(mdata)

    return keysmat2ltdt(keys, data)
}
