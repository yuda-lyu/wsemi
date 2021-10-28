import get from 'lodash/get'
import size from 'lodash/size'
import isarr from './isarr.mjs'


/**
 * 合併二維陣列mat1與mat2
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matConcat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入要被提取的資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=istart] 輸入結束的欄位指標整數，若不輸入則等同於istart
 * @returns {Array} 回傳提取的資料陣列
 * @example
 *
 * let mat1
 * let mat2
 *
 * mat1 = [['a', 'b'], [1.1, 2.2]]
 * mat2 = [['c', 'd'], [10.1, 20.2]]
 * console.log(matConcat(mat1, mat2))
 * // => [
 * //   [ 'a', 'b', 'c', 'd' ],
 * //   [ 1.1, 2.2, 10.1, 20.2 ]
 * // ]
 *
 * mat1 = [['a', 'b', 'c'], [1, 2, 3], [1.1, 2.2, 3.3]]
 * mat2 = [['x', 'y'], [-10.1, -20.2]]
 * console.log(matConcat(mat1, mat2))
 * // => [
 * //   [ 'a', 'b', 'c', 'x', 'y' ],
 * //   [ 1, 2, 3, -10.1, -20.2 ],
 * //   [ 1.1, 2.2, 3.3, null, null ]
 * // ]
 *
 * mat1 = [['a', 'b'], [1.1, 2.2]]
 * mat2 = [['x', 'y', 'z'], [-1, -2, -3], [-10.1, -20.2, -30.3]]
 * console.log(matConcat(mat1, mat2))
 * // => [
 * //   [ 'a', 'b', 'x', 'y', 'z' ],
 * //   [ 1.1, 2.2, -1, -2, -3 ],
 * //   [ null, null, -10.1, -20.2, -30.3 ]
 * // ]
 *
 */
function matConcat(mat1, mat2) {

    //check
    if (!isarr(mat1)) {
        return []
    }
    if (!isarr(mat2)) {
        return []
    }
    if (size(mat1) === 0 && size(mat2) === 0) {
        return []
    }

    //n1, cn1, n2, cn2
    let n1 = size(mat1)
    let cn1 = size(get(mat1, 0, []))
    let n2 = size(mat2)
    let cn2 = size(get(mat2, 0, []))

    //mat
    let mat = []
    let n = Math.max(n1, n2)
    for (let i = 0; i < n; i++) {
        let arr = []
        let jj = -1
        for (let j = 0; j < cn1; j++) {
            jj++
            let v = get(mat1, `${i}.${j}`, null)
            arr[jj] = v
        }
        for (let j = 0; j < cn2; j++) {
            jj++
            let v = get(mat2, `${i}.${j}`, null)
            arr[jj] = v
        }
        mat[i] = arr
    }

    return mat
}


export default matConcat
