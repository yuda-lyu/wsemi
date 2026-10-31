import Decimal from 'decimal.js'
import get from 'lodash-es/get.js'
import isenum from './isenum.mjs'
import isbol from './isbol.mjs'
import preciseNum from './preciseNum.mjs'


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
 * withPreciseNum為true(預設)時，兩數先經preciseNum取12位有效數字(消除浮點誤差)再精確比較：差異落在第12位有效數字之內者可區分(如1e-11與0、1 + 1e-10與1)，第13位起才不同者視為相等(如1 + 1e-12與1，惟為捨入後比較，跨越第12位進位邊界者仍被區分)；
 * 浮點誤差累積落在第13位起者(如0.1累加1000次得99.9999999999986)視為相等(與100相等)，但誤差已落入第12位之內者不視為相等，須更大容差之比較請自行取整後再比。
 * (舊版以固定eps = 1e-9判位數，近似與量級無關之絕對容差，且使小於1e-9之小數歸零，已於2026-10-31修正，見preciseNum；12位為相對容差，絕對值約10至1000時與舊版同級，更大者較寬、小於1者較嚴，小數值不歸零。)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/judge.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number} x1 輸入數字字串或數字，若要精準判識得要用字串，需為有效數字(定義見isenum，不收Infinity與'0x10'等)，否則throw Error('x1 is not a number')
 * @param {String} op 輸入操作符號字串，可使用'==='、'!=='、'>='、'<='、'>'、'<'
 * @param {NuString|Number} x2 輸入數字字串或數字，若要精準判識得要用字串，需為有效數字(定義見isenum，不收Infinity與'0x10'等)，否則throw Error('x2 is not a number')
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
    if (!isenum(x1)) {
        throw new Error(`x1 is not a number`)
    }
    if (!isenum(x2)) {
        throw new Error(`x2 is not a number`)
    }

    //數字字串去頭尾空白(Decimal不接受前後空白), 其後一律使用去空白後之值(檢測之值即為使用之值); 不轉Number以保留精準判識
    if (typeof x1 === 'string') {
        x1 = x1.trim()
    }
    if (typeof x2 === 'string') {
        x2 = x2.trim()
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
        if (x1 === x2) { //預先判斷可加速
            return true
        }
        return eq(x1, x2)
    }
    else if (op === '!==') {
        return neq(x1, x2)
    }
    else if (op === '>=') {
        if (x1 === x2) { //預先判斷可加速
            return true
        }
        return gte(x1, x2)
    }
    else if (op === '>') {
        return gt(x1, x2)
    }
    else if (op === '<=') {
        if (x1 === x2) { //預先判斷可加速
            return true
        }
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
