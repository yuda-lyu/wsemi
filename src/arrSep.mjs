import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isearr from './isearr.mjs'
import ispint from './ispint.mjs'
import iseobj from './iseobj.mjs'


/**
 * 依照指定數量切分陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSep.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列
 * @param {Integer|Object} num 輸入要切分數量的正整數或設定物件，可給予鍵'numCount'或'numGroup'而對應值皆為正整數，numCount代表原本num表示每個切割後群組內所擁有的元素數量上限，numGroup代表欲切割成幾個群組數量
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

    //check
    if (!ispint(opt) && !iseobj(opt)) {
        return []
    }

    let mode = ''
    let num = null
    if (ispint(opt)) {
        num = opt
        mode = 'numCount'
    }
    else if (iseobj(opt)) {
        if (ispint(get(opt, 'numCount'))) {
            num = opt.numCount
            mode = 'numCount'
        }
        else if (ispint(get(opt, 'numGroup'))) {
            num = opt.numGroup
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
