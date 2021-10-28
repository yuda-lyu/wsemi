import map from 'lodash/map'
import isearr from './isearr.mjs'
import arrFilterByPnum from './arrFilterByPnum.mjs'


/**
 * 過濾陣列內元素僅保留正數(不含0)，並且自動轉數值，再轉log10(Math.log)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByPnumAndToLog.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入原始陣列
 * @returns {Array} 回傳新陣列
 * @example
 *
 * let arr
 *
 * arr = ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2']
 * console.log(arrFilterByPnumAndToLog(arr))
 * // => [
 * //   -0.6931471805599453,
 * //   0,
 * //   0.09531017980432493,
 * //   0.09531017980432493,
 * //   0.7884573603642703
 * // ]
 *
 * arr = ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0']
 * console.log(arrFilterByPnumAndToLog(arr))
 * // => []
 *
 */
function arrFilterByPnumAndToLog(arr) {

    //check
    if (!isearr(arr)) {
        return []
    }

    //不用cloneDeep

    //arrFilterByPnum, 有使用cloneDeep
    arr = arrFilterByPnum(arr)

    //map
    arr = map(arr, Math.log)

    return arr
}


export default arrFilterByPnumAndToLog
