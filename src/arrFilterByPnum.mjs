import map from 'lodash/map'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import isearr from './isearr.mjs'
import ispnum from './ispnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 各陣列內元素相加，可輸入n個同長度陣列，若需輸入之陣列長度不同則回傳空陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByPnum.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arguments 輸入n個陣列，需同長度，其內元素皆會轉為浮點數，各陣列針對各元素進行相加總
 * @returns {Array} 回傳各元素相加後陣列
 * @example
 *
 *
 *
 */
function arrFilterByPnum(arr) {

    // //check
    // if (!isearr(arr)) {
    //     return []
    // }

    // //cloneDeep
    // arr = cloneDeep(arr)

    // //filter
    // arr = filter(arr, ispnum)

    // //map
    // arr = map(arr, cdbl)

    // return arr
}


export default arrFilterByPnum
