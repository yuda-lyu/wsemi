import isarr from './isarr.mjs'
import _cellText from './_cellText.mjs'


/**
 * 合併二維陣列mat1與mat2
 *
 * mat1與mat2皆為必須參數，須為二維陣列(陣列且各元素皆為陣列)，檢測順序為mat1(陣列、各列為陣列)、mat2(陣列、各列為陣列)，無效throw Error('invalid mat1: must be an array')、Error('invalid mat1: row[i] is not an array')、Error('invalid mat2: must be an array')或Error('invalid mat2: row[i] is not an array')，訊息只含索引不含值(外層空位視為非陣列)；空陣列為合法資料：兩者皆為[]回傳[]，只有一邊為[]則另一邊照常回傳(列數與欄數以另一邊為準)
 * 列數取兩者較大者；各矩陣之欄數取其最長之列，較短之列、缺少之列、列內空位與undefined之儲存格補opt.empty(預設null)，null原樣；物件與陣列之儲存格不深拷貝；每列皆為新陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matConcat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat1 輸入左側二維陣列，必須參數，須為二維陣列(空陣列合法)
 * @param {Array} mat2 輸入右側二維陣列，必須參數，須為二維陣列(空陣列合法)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {*} [opt.empty=null] 輸入補值(原樣放入)，函數視為null，預設null
 * @returns {Array} 回傳合併後之二維陣列，列數為兩者較大者，各矩陣之欄數為其最長之列，缺少之儲存格補opt.empty；兩者皆為[]時回傳[]
 * @throws {Error} mat1或mat2非陣列、或有列非陣列時throw Error('invalid mat1: must be an array')、Error('invalid mat1: row[i] is not an array')、Error('invalid mat2: must be an array')、Error('invalid mat2: row[i] is not an array')，訊息只含索引不含值
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
 * mat1 = [[], ['a', 'b']]
 * mat2 = [['x'], ['y', 'z']]
 * console.log(matConcat(mat1, mat2, { empty: '' }))
 * // => [ [ '', '', 'x', '' ], [ 'a', 'b', 'y', 'z' ] ]
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
 * // => invalid mat1: row[0] is not an array
 *
 */
function matConcat(mat1, mat2, opt = {}) {

    //check, mat1與mat2為必須參數, 依mat1(陣列, 各列為陣列)、mat2(陣列, 各列為陣列)序, 無效throw(訊息只含索引, 不帶值)
    //rows1, rows2, 各列之快照(每列只讀一次, 檢查之列即其後使用之列, 不呼叫輸入陣列之方法)
    let snap = (mat, name) => {
        let rows = []
        for (let i = 0; i < mat.length; i++) { //依索引走訪, 空洞視為undefined而無效
            let r = mat[i]
            if (!isarr(r)) {
                throw new Error(`invalid ${name}: row[${i}] is not an array`)
            }
            rows.push(r)
        }
        return rows
    }
    if (!isarr(mat1)) {
        throw new Error('invalid mat1: must be an array')
    }
    let rows1 = snap(mat1, 'mat1')
    if (!isarr(mat2)) {
        throw new Error('invalid mat2: must be an array')
    }
    let rows2 = snap(mat2, 'mat2')

    //check, 空陣列為合法資料
    if (rows1.length === 0 && rows2.length === 0) {
        return []
    }

    //empty, 補值(中性、可設定), 函數視為null
    let empty = _cellText.readFill(opt, 'empty', null)

    //n1, cn1, n2, cn2, 欄數取各矩陣最長之列
    let maxLen = (rows) => {
        let m = 0
        for (let r of rows) {
            m = Math.max(m, r.length)
        }
        return m
    }
    let n1 = rows1.length
    let cn1 = maxLen(rows1)
    let n2 = rows2.length
    let cn2 = maxLen(rows2)

    //cell, 缺少之列、超出該列長度、空位與undefined補empty
    let cell = (rows, i, j) => {
        if (i >= rows.length) {
            return empty
        }
        let v = rows[i][j]
        return v === undefined ? empty : v
    }

    //mat
    let mat = []
    let n = Math.max(n1, n2)
    for (let i = 0; i < n; i++) {
        let arr = []
        for (let j = 0; j < cn1; j++) {
            arr.push(cell(rows1, i, j))
        }
        for (let j = 0; j < cn2; j++) {
            arr.push(cell(rows2, i, j))
        }
        mat.push(arr)
    }

    return mat
}


export default matConcat
