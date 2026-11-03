import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import every from 'lodash-es/every.js'
import isarr from './isarr.mjs'


/**
 * 合併二維陣列mat1與mat2
 *
 * mat1與mat2皆為必須參數，須為二維陣列(陣列且各元素皆為陣列)，檢測順序為mat1(陣列、各元素為陣列)、mat2(陣列、各元素為陣列)，無效throw Error('invalid mat1: must be an array')、Error('invalid mat1: must be an array of arrays')、Error('invalid mat2: must be an array')或Error('invalid mat2: must be an array of arrays')，訊息不帶輸入值；空陣列為合法資料：兩者皆為[]回傳[]，只有一邊為[]則另一邊照常回傳(列數與欄數以另一邊為準)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matConcat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat1 輸入左側二維陣列，必須參數，須為二維陣列(空陣列合法)
 * @param {Array} mat2 輸入右側二維陣列，必須參數，須為二維陣列(空陣列合法)
 * @returns {Array} 回傳合併後之二維陣列，列數為兩者較大者，缺少之儲存格補null；兩者皆為[]時回傳[]
 * @throws {Error} mat1或mat2非陣列、或有元素非陣列時throw Error('invalid mat1: must be an array')、Error('invalid mat1: must be an array of arrays')、Error('invalid mat2: must be an array')、Error('invalid mat2: must be an array of arrays')，訊息不帶輸入值
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
 * console.log(matConcat([], [[1, 2]]))
 * // => [ [ 1, 2 ] ]
 *
 * console.log(matConcat([], []))
 * // => []
 *
 * try {
 *     matConcat([1], [2])
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid mat1: must be an array of arrays
 *
 */
function matConcat(mat1, mat2) {

    //check, mat1與mat2為必須參數, 依mat1(陣列, 各元素為陣列)、mat2(陣列, 各元素為陣列)序, 無效throw(訊息不帶值)
    if (!isarr(mat1)) {
        throw new Error('invalid mat1: must be an array')
    }
    if (!every(mat1, isarr)) { //lodash every依索引走訪, 空洞視為undefined而無效
        throw new Error('invalid mat1: must be an array of arrays')
    }
    if (!isarr(mat2)) {
        throw new Error('invalid mat2: must be an array')
    }
    if (!every(mat2, isarr)) {
        throw new Error('invalid mat2: must be an array of arrays')
    }

    //check, 空陣列為合法資料
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
