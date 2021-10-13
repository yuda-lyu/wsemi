import size from 'lodash/size'
import isearr from './isearr.mjs'
import ispint from './ispint.mjs'


/**
 * 依照指定數量切分陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSep.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列
 * @param {Integer} num 輸入要切分數量的整數
 * @returns {Array} 回傳切割後的陣列
 * @example
 *
 * let arr = ['a', 123, 'xyz', 5.678, null, 'd', [], { x: 'x1', y: 'y1' }]
 *
 * console.log(arrSep(arr, 2))
 * // => [
 * //   [ 'a', 123 ],
 * //   [ 'xyz', 5.678 ],
 * //   [ null, 'd' ],
 * //   [ [], { x: 'x1', y: 'y1' } ]
 * // ]
 *
 * console.log(arrSep(arr, 3))
 * // => [
 * //   [ 'a', 123, 'xyz' ],
 * //   [ 5.678, null, 'd' ],
 * //   [ [], { x: 'x1', y: 'y1' } ]
 * // ]
 *
 */
function arrSep(arr, num) {

    //check
    if (!isearr(arr)) {
        return []
    }
    if (!ispint(num)) {
        return []
    }

    //n
    let n = size(arr)

    //rs
    let rs = []
    for (let i = 0; i < n; i += num) {
        let r = []
        for (let j = 0; j < num; j++) {
            let k = i + j
            if (k < n) {
                r.push(arr[k])
            }
        }
        rs.push(r)
    }

    return rs
}


export default arrSep
