import cloneDeep from 'lodash/cloneDeep'
import pullAll from 'lodash/pullAll'


/**
 * 由vall陣列移除vdel陣列
 *
 * @export
 * @param {Array} vall 輸入要被刪除的任意資料陣列
 * @param {Array} vdel 輸入要刪除的任意資料陣列
 * @returns {Array} 回傳被刪除的任意資料陣列
 */
export default function arrpull(vall, vdel) {

    let t = cloneDeep(vall)
    pullAll(t, vdel)

    return t
}
