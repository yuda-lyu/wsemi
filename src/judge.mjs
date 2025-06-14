import get from 'lodash-es/get.js'
import isnum from './isnum.mjs'
import isbol from './isbol.mjs'
import preciseNum from './preciseNum.mjs'
import Decimal from 'decimal.js'


function gte(x1, x2) {
    return new Decimal(x1).gte(x2)
}

function gt(x1, x2) {
    return new Decimal(x1).gt(x2)
}

function lte(x1, x2) {
    return new Decimal(x1).lte(x2)
}

function lt(x1, x2) {
    return new Decimal(x1).lt(x2)
}

function eq(x1, x2) {
    return new Decimal(x1).eq(x2)
}

function neq(x1, x2) {
    return !eq(x1, x2)
}

/**
 * 使用指定條件判斷兩數字成立與否
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/judge.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number} x1 輸入數字字串或數字，若要精準判識得要用字串
 * @param {String} op 輸入操作符號字串，可使用'==='、'!=='、'>='、'<='、'>'、'<'
 * @param {NuString|Number} x2 輸入數字字串或數字，若要精準判識得要用字串
 * @param {Object} [opt={}] 輸設定物件，預設{}
 * @param {Boolean} [opt.withPreciseNum=true] 輸是否自動轉原始精度之數字字串布林值，預設true
 * @returns {Number} 回傳判斷布林值
 * @example
 *
 * let x1
 * let op
 * let x2
 * let b
 *
 * x1 = 0
 * op = '>='
 * x2 = 0
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 0, '>=', 0 true
 *
 * x1 = 1
 * op = '>='
 * x2 = 1
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 1, '>=', 1 true
 *
 * //浮點數誤差
 * x1 = 0.3
 * op = '>='
 * x2 = 0.1 + 0.2
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 0.3, '>=', 0.30000000000000004 false
 *
 * x1 = 0.3
 * op = '>='
 * x2 = 0.1 + 0.2
 * b = judge(x1, op, x2, { withPreciseNum: true }) //default
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 0.3, '>=', 0.30000000000000004 true
 *
 * x1 = 0.3
 * op = '>='
 * x2 = Decimal.sum(0.1, 0.2).toString()
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 0.3, '>=', 0.3 true
 *
 * x1 = Decimal.sum(0.1, 0.2).toString()
 * op = '>='
 * x2 = 0.3
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 0.3, '>=', 0.3 true
 *
 * //加法順序會導致不同的誤差
 * x1 = 4.67 + 7.12 + 94.4
 * op = '>='
 * x2 = 94.4 + 7.12 + 4.67
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 106.19, '>=', 106.19000000000001 false
 *
 * x1 = 4.67 + 7.12 + 94.4
 * op = '>='
 * x2 = 94.4 + 7.12 + 4.67
 * b = judge(x1, op, x2, { withPreciseNum: true }) //default
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 106.19, '>=', 106.19000000000001 true
 *
 * x1 = Decimal.sum(4.67, 7.12, 94.4).toString()
 * op = '>='
 * x2 = Decimal.sum(94.4, 7.12, 4.67).toString()
 * b = judge(x1, op, x2, { withPreciseNum: false })
 * console.log(`${x1}, '${op}', ${x2}`, b)
 * // => 106.19, '>=', 106.19 true
 *
 */
function judge(x1, op, x2, opt = {}) {

    //check
    if (!isnum(x1)) {
        throw new Error(`x1 is not a number`)
    }
    if (!isnum(x2)) {
        throw new Error(`x2 is not a number`)
    }

    //withPreciseNum
    let withPreciseNum = get(opt, 'withPreciseNum')
    if (!isbol(withPreciseNum)) {
        withPreciseNum = true
    }

    //preciseNum
    if (withPreciseNum) {
        x1 = preciseNum(x1)
        x2 = preciseNum(x2)
    }

    if (op === '===') {
        return eq(x1, x2)
    }
    else if (op === '!==') {
        return neq(x1, x2)
    }
    else if (op === '>=') {
        return gte(x1, x2)
    }
    else if (op === '>') {
        return gt(x1, x2)
    }
    else if (op === '<=') {
        return lte(x1, x2)
    }
    else if (op === '<') {
        return lt(x1, x2)
    }
    else {
        console.log(op)
        throw new Error(`invalid op[${op}]`)
    }
}


export default judge
