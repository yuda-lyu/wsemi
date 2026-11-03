import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import iseint from './iseint.mjs'
import isobj from './isobj.mjs'


/**
 * 依照指定數量切分陣列
 *
 * arr與切分數量(opt)皆為必須參數，型別檢測與arr有無資料無關：arr須為陣列，非陣列throw Error('invalid arr: must be an array')；切分數量須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為1~4294967295(個數)，或為設定物件(含空物件{})，非此二者(含未給、0、null、''、陣列等)throw Error('invalid opt: must be a positive integer or an object with numCount or numGroup')，設定物件之numCount與numGroup皆無效(含空物件{})則throw Error('invalid opt.numCount or opt.numGroup')；訊息皆不帶輸入值。檢測順序為arr、opt。arr為空陣列(切分數量有效)時為合法資料，回傳[]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSep.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列，必須參數，須為陣列(空陣列合法，回傳[])，非陣列throw Error('invalid arr: must be an array')
 * @param {Integer|String|Object} opt 輸入要切分數量的正整數或設定物件，必須參數，可給予鍵'numCount'或'numGroup'而對應值皆為正整數(有效整數，1~4294967295，數字字串亦可，Infinity、0、小數、'0x10'、包裝物件等為無效)，numCount代表原本num表示每個切割後群組內所擁有的元素數量上限，numGroup代表欲切割成幾個群組數量；整數寫法與設定物件之無效值皆throw
 * @returns {Array} 回傳切割後的陣列；arr為空陣列時回傳[]
 * @throws {Error} arr非陣列時throw Error('invalid arr: must be an array')；opt既非有效整數亦非物件時throw Error('invalid opt: must be a positive integer or an object with numCount or numGroup')；opt為物件而numCount與numGroup皆無效(含{})時throw Error('invalid opt.numCount or opt.numGroup')；訊息皆不帶輸入值
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
 * console.log(arrSep([], 2))
 * // => []
 *
 * try {
 *     arrSep(arr, 0)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid opt: must be a positive integer or an object with numCount or numGroup
 *
 */
function arrSep(arr, opt) {

    //check, arr為必須參數, 非陣列throw(訊息不帶值)
    if (!isarr(arr)) {
        throw new Error('invalid arr: must be an array')
    }

    //check, 切分數量為必須參數(與arr有無資料無關), 判定有效整數後取轉換值使用(檢測之值即使用之值, 數字字串不可直接參與迴圈之+=)
    let chk = { use: 'count', min: 1 }
    if (!iseint(opt, chk) && !isobj(opt)) {
        throw new Error('invalid opt: must be a positive integer or an object with numCount or numGroup')
    }

    let mode = ''
    let num = null
    if (iseint(opt, chk)) {
        num = Number(opt)
        mode = 'numCount'
    }
    else if (isobj(opt)) {
        if (iseint(get(opt, 'numCount'), chk)) {
            num = Number(opt.numCount)
            mode = 'numCount'
        }
        else if (iseint(get(opt, 'numGroup'), chk)) {
            num = Number(opt.numGroup)
            mode = 'numGroup'
        }
        else {
            throw new Error(`invalid opt.numCount or opt.numGroup`)
        }
    }

    //check, 空陣列為合法資料回傳[]; 僅含單一廣義無效元素(null、''、{}、[]等)之陣列維持原行為回傳[](本次不動)
    if (!isearr(arr)) {
        return []
    }

    //n
    let n = size(arr)

    //rs
    let rs = []
    if (mode === 'numCount') {
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
    }
    else if (mode === 'numGroup') {

        //預先初始化為陣列
        for (let g = 0; g < num; g++) {
            rs[g] = []
        }

        let g = -1
        for (let i = 0; i < n; i++) {

            //g
            g++
            if (g > num - 1) {
                g = 0
            }

            //push
            rs[g].push(arr[i])

        }

    }

    return rs
}


export default arrSep
