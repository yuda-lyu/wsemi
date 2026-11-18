import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isarr from './isarr.mjs'
import iseint from './iseint.mjs'
import isobj from './isobj.mjs'


/**
 * 依照指定數量切分陣列
 *
 * arr須為陣列，非陣列(含未給、null、字串、物件等)回傳空陣列[]，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)，此時不檢查opt。opt為必須參數且與arr有無資料無關：須為設定物件(含空物件{})，非物件(含未給、null、整數、字串、陣列等)throw Error('invalid opt: must be an object with numCount or numGroup')；舊式整數寫法arrSep(arr, 3)已移除(自有套件不做舊版相容)，請改用{ numCount: 3 }。設定物件之numCount(每組個數上限)與numGroup(組數)為二擇一必給，各須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為1~4294967295(個數)，兩者皆無效(含未給、空物件{})則throw Error('invalid opt.numCount or opt.numGroup')，兩者皆有效時採numCount；訊息皆不帶輸入值。檢測順序為arr、opt。arr為空陣列(opt有效)時為合法資料，回傳[]；單一空元素之陣列([null]、['']、[{}]、[[]]、[undefined])視為一個元素，照常切分而保留
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSep.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列，須為陣列(空陣列合法，回傳[])，非陣列回傳[]；[null]、['']、[{}]視為一個元素而保留
 * @param {Object} opt 輸入設定物件，必須參數(arr為有效陣列時才檢查)，須含鍵'numCount'或'numGroup'(二擇一必給)而對應值皆為正整數(有效整數，1~4294967295，數字字串亦可，Infinity、0、小數、'0x10'、包裝物件等為無效)，numCount代表每個切割後群組內所擁有的元素數量上限，numGroup代表欲切割成幾個群組數量；非物件或兩鍵皆無效throw
 * @param {Integer|String} opt.numCount 輸入每個切割後群組內所擁有的元素數量上限，與opt.numGroup二擇一必給，兩者皆有效時採用numCount
 * @param {Integer|String} opt.numGroup 輸入欲切割成幾個群組之數量，與opt.numCount二擇一必給，numCount無效時才採用
 * @returns {Array} 回傳切割後的陣列；arr非陣列或為空陣列時回傳[]
 * @throws {Error} arr為陣列而opt非物件時throw Error('invalid opt: must be an object with numCount or numGroup')；opt為物件而numCount與numGroup皆無效(含{})時throw Error('invalid opt.numCount or opt.numGroup')；訊息皆不帶輸入值
 * @example
 *
 * let arr = ['a', 123, 'xyz', 5.678, null, 'd', [], { x: 'x1', y: 'y1' }]
 *
 * console.log(arrSep(arr, { numCount: 2 }))
 * // => [
 * //   [ 'a', 123 ],
 * //   [ 'xyz', 5.678 ],
 * //   [ null, 'd' ],
 * //   [ [], { x: 'x1', y: 'y1' } ]
 * // ]
 *
 * console.log(arrSep(arr, { numCount: 3 }))
 * // => [
 * //   [ 'a', 123, 'xyz' ],
 * //   [ 5.678, null, 'd' ],
 * //   [ [], { x: 'x1', y: 'y1' } ]
 * // ]
 *
 * console.log(arrSep([1, 2, 3, 4, 5], { numGroup: 2 }))
 * // => [ [ 1, 3, 5 ], [ 2, 4 ] ]
 *
 * console.log(arrSep([], { numCount: 2 }))
 * // => []
 *
 * console.log(arrSep([null], { numCount: 2 }))
 * // => [ [ null ] ] (單一空元素視為一個元素, 不被當成空陣列)
 *
 * console.log(arrSep('abc', { numCount: 2 }))
 * // => [] (arr非陣列回傳空結果, 不拋錯)
 *
 * try {
 *     arrSep(arr, 3)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid opt: must be an object with numCount or numGroup
 *
 * try {
 *     arrSep(arr, { numCount: 0 })
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid opt.numCount or opt.numGroup
 *
 */
function arrSep(arr, opt) {

    //check, arr為第1參數, 非陣列回傳空結果[](不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16), 不檢查opt
    if (!isarr(arr)) {
        return []
    }

    //check, opt為必須參數(與arr有無資料無關), 須為設定物件, 非物件throw(訊息不帶值); 舊式整數寫法已移除(W-07, 原則14: 自有套件不做舊版相容, 第223項併結)
    if (!isobj(opt)) {
        throw new Error('invalid opt: must be an object with numCount or numGroup')
    }

    //numCount與numGroup為二擇一必給(V10), 皆以iseint(use: 'count', min: 1)判定, 判定通過後取轉換值使用(檢測之值即使用之值, 數字字串不可直接參與迴圈之+=)
    let chk = { use: 'count', min: 1 }
    let mode = ''
    let num = null
    let vCount = get(opt, 'numCount') //每個鍵只讀一次, 檢測之值即使用之值
    if (iseint(vCount, chk)) {
        num = Number(vCount)
        mode = 'numCount'
    }
    else {
        let vGroup = get(opt, 'numGroup')
        if (iseint(vGroup, chk)) {
            num = Number(vGroup)
            mode = 'numGroup'
        }
        else {
            throw new Error('invalid opt.numCount or opt.numGroup')
        }
    }

    //n, 空陣列為合法資料回傳[]; 單一空元素([null]、['']、[{}]、[[]])為一個元素, 不得被當成空陣列而丟棄(W-19, 比照第三批)
    let n = size(arr)
    if (n === 0) {
        return []
    }

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
