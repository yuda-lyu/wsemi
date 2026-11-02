import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isearr from './isearr.mjs'
import iseint from './iseint.mjs'
import iseobj from './iseobj.mjs'


/**
 * 依照指定數量切分陣列
 *
 * 切分數量為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為1~4294967295(個數)；無效時，num為整數之舊寫法回傳[]，num為設定物件且numCount與numGroup皆無效則拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSep.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列
 * @param {Integer|String|Object} num 輸入要切分數量的正整數或設定物件，可給予鍵'numCount'或'numGroup'而對應值皆為正整數(有效整數，1~4294967295，數字字串亦可，Infinity、0、小數、'0x10'、包裝物件等為無效)，numCount代表原本num表示每個切割後群組內所擁有的元素數量上限，numGroup代表欲切割成幾個群組數量
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
function arrSep(arr, opt) {

    //check
    if (!isearr(arr)) {
        return []
    }

    //check, 切分數量為必須參數, 判定有效整數後取轉換值使用(檢測之值即使用之值, 數字字串不可直接參與迴圈之+=)
    let chk = { use: 'count', min: 1 }
    if (!iseint(opt, chk) && !iseobj(opt)) {
        return []
    }

    let mode = ''
    let num = null
    if (iseint(opt, chk)) {
        num = Number(opt)
        mode = 'numCount'
    }
    else if (iseobj(opt)) {
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
