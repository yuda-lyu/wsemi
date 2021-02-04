import size from 'lodash/size'
import get from 'lodash/get'
import each from 'lodash/each'
import reverse from 'lodash/reverse'
import toNumber from 'lodash/toNumber'
import isNumber from 'lodash/isNumber'
import cloneDeep from 'lodash/cloneDeep'
import isnum from './isnum.mjs'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'


let inXRange = 'in x-range'
let outOfXRange = 'out of x-range'
let orderList = 'order list'
let reverseOrderList = 'reverse order list'


function toArrayXY(ps, opt = {}) {

    //若無數據回傳空陣列
    if (size(ps) <= 0) {
        return []
    }

    //keyX
    let keyX = get(opt, 'keyX')
    if (!isestr(keyX)) {
        keyX = 'x'
    }

    //keyY
    let keyY = get(opt, 'keyY')
    if (!isestr(keyY)) {
        keyY = 'y'
    }

    //rs
    let rs = []
    each(ps, (v) => {
        let x = null
        let y = null
        if (isarr(v) && size(v) >= 2) {
            x = get(v, 0)
            y = get(v, 1)
        }
        else {
            x = get(v, keyX, null)
            y = get(v, keyY, null)
        }
        if (isnum(x) && isnum(y)) {
            x = toNumber(x)
            y = toNumber(y)
            rs.push({
                x,
                y,
            })
        }
    })

    return rs
}


function checkTrend(ps) {

    //check
    let bOrder = true
    let bReverseOrder = true
    for (let i = 1; i < size(ps); i++) {
        let p0 = ps[i - 1]
        let p1 = ps[i]
        if (bOrder && p0.x > p1.x) { //有遞減出現
            bOrder = false
        }
        if (bReverseOrder && p0.x < p1.x) { //有遞增出現
            bReverseOrder = false
        }
        if (p0.x === p1.x) {
            return {
                err: `x can not be equal: i=${i}, x=${p0.x}`
            }
        }
    }

    if (bOrder) {
        return orderList
    }
    if (bReverseOrder) {
        return reverseOrderList
    }
    return 'no'
}


function checkLimit(ps, x) {

    //xmin, xmax, 外部已確保x為遞增
    let xmin = null
    let xmax = null
    xmin = ps[0].x
    xmax = ps[size(ps) - 1].x

    //lt, less than lower limit
    if (x < xmin) {
        return {
            err: outOfXRange,
            msg: `x[${x}] less than lower limit[${xmin}]`,
            data: {
                ps,
                x,
                xmin,
                xmax,
            },
        }
    }

    //gt, greater than upper limit
    if (x > xmax) {
        return {
            err: outOfXRange,
            msg: `x[${x}] greater than upper limit[${xmax}]`,
            data: {
                ps,
                x,
                xmin,
                xmax,
            },
        }
    }

    return inXRange
}


function interp1Linear(ps, x) {
    //尋找x對應y值, 採各點之間線性內插

    //checkLimit
    let cl = checkLimit(ps, x)
    if (cl !== inXRange) {
        return cl
    }

    //r
    let r = null
    for (let i = 1; i < size(ps); i++) {
        let p0 = ps[i - 1]
        let p1 = ps[i]
        if (p0.x <= x && x <= p1.x) {
            r = ((x - p0.x) * p1.y + (p1.x - x) * p0.y) / (p1.x - p0.x)
            break
        }
    }

    //check, 有檢核x是否超過上下限, 此處應該不會用到
    if (r === null) {
        return {
            err: outOfXRange
        }
    }

    return r
}


function interp1Stairs(ps, x, opt = {}) {
    //每個點為bar中點, 尋找x所在之bar值(y)

    //xMin, 擴充最小x值範圍
    let xMin = get(opt, 'xMin')
    if (isNumber(xMin)) {
        //外部已確保x為遞增
        if (xMin >= ps[0].x) {
            return {
                err: `xMin=${xMin} >= ps[0].x=${ps[0].x}`
            }
        }
        let p = {
            x: xMin,
            y: ps[0].y, //使用第一筆數據y
        }
        ps = [p, ...ps] //遞增數據得添加xMin於最前
    }

    //xMax, 擴充最大x值範圍
    let xMax = get(opt, 'xMax')
    if (isNumber(xMax)) {
        //外部已確保x為遞增
        if (xMax <= ps[size(ps) - 1].x) {
            return {
                err: `xMax=${xMax} <= ps[size(ps)-1].x=${ps[size(ps) - 1].x}`
            }
        }
        let p = {
            x: xMax,
            y: ps[size(ps) - 1].y, //使用最後一筆數據y

        }
        ps = [...ps, p] //遞增數據得添加xMax於最後
    }

    //checkLimit
    let cl = checkLimit(ps, x)
    if (cl !== inXRange) {
        return cl
    }

    //r
    let r = null
    for (let i = 0; i < size(ps); i++) {
        let p0 = get(ps, i - 1, null)
        let p1 = get(ps, i, null)
        let p2 = get(ps, i + 1, null)
        let x0 = p1.x
        if (p0) {
            x0 = (p0.x + p1.x) / 2 //若有前者, 則取前者與自己x的平均值作為起點
        }
        let x1 = p1.x
        if (p2) {
            x1 = (p2.x + p1.x) / 2 //若有後者, 則取後者與自己x的平均值作為終點
        }
        if (x0 <= x && x <= x1) {
            r = p1.y
            break
        }
    }

    //check, 有檢核x是否超過上下限, 此處應該不會用到
    if (r === null) {
        return {
            err: outOfXRange
        }
    }

    return r
}


function interp1Blocks(ps, x) {
    //第1點為起點, 其餘各點為各bar終點, 尋找x所在之bar值(y)

    //checkLimit
    let cl = checkLimit(ps, x)
    if (cl !== inXRange) {
        return cl
    }

    //r
    let r = null
    for (let i = 1; i < size(ps); i++) {
        let p0 = ps[i - 1]
        let p1 = ps[i]
        let x0 = p0.x
        let x1 = p1.x
        if (x0 <= x && x <= x1) {
            r = p1.y
            break
        }
    }

    //check, 有檢核x是否超過上下限, 此處應該不會用到
    if (r === null) {
        return {
            err: outOfXRange
        }
    }

    return r
}


/**
 * 一維數據內插
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/interp1.test.js Github}
 * @memberOf wsemi
 * @param {Array} ps 輸入一維數據，格式可支援兩種，第一種各點為陣列[[x1,y1],[x2,y2],...]，例如[[0.1,5],[0.2,12],...]，第二種各點為物件，屬性至少要有x與y，格式為[{x:x1,y:y1},{x:x2,y:y2},...]，例如[{x:0.1,y:5},{x:0.2,y:12},...]，key值x與y可由opt更換
 * @param {Number} x 輸入要內插點的x值
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode=''] 輸入內插方法，可選'linear'、'stairs'、'blocks'，預設'linear'
 * @param {String} [opt.keyX='x'] 輸入若數據為物件陣列，取物件x值時的key字串，預設為'x'
 * @param {String} [opt.keyY='y'] 輸入若數據為物件陣列，取物件y值時的key字串，預設為'y'
 * @param {Number} [opt.xMin=undefined] 輸入若mode='stairs'，更改x範圍下限值，預設為undefined
 * @param {Number} [opt.xMax=undefined] 輸入若mode='stairs'，更改x範圍上限值，預設為undefined
 * @returns {Number|Object} 回傳內插結果數值，或是無法內插時之錯誤訊息物件
 * @example
 *
 * let r
 * let x
 *
 * let ps = [
 *     { x: 1, y: 0.2 },
 *     { x: 3, y: 1.2 },
 *     { x: 4, y: 2 },
 * ]
 *
 * let opt = {
 *     mode: 'stairs',
 * }
 *
 * let optX = {
 *     mode: 'stairs',
 *     xMin: 0,
 *     xMax: 4.5,
 * }
 *
 * let optP = {
 *     keyX: 'a',
 *     keyY: 'b',
 * }
 *
 * let psP = [
 *     { a: 1, b: 0.2 },
 *     { a: 3, b: 1.2 },
 *     { a: 4, b: 2 },
 * ]
 *
 * x = 0
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=0 r={"err":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = 1
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=1 r=0.2
 *
 * x = 2
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=2 r=0.7
 *
 * x = 2.6
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=2.6 r=1
 *
 * x = 3
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=3 r=1.2
 *
 * x = 3.5
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=3.5 r=1.6
 *
 * x = 4
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=4 r=2
 *
 * x = 5
 * r = interp1(ps, x)
 * console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear: x=5 r={"err":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = -1
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=-1 r={"err":"x[-1] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":-1,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = 0.51
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=0.51 r={"err":"x[0.51] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0.51,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = 1
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=1 r=0.2
 *
 * x = 1.9
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=1.9 r=0.2
 *
 * x = 2
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=2 r=0.2
 *
 * x = 2.1
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=2.1 r=1.2
 *
 * x = 2.5
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=2.5 r=1.2
 *
 * x = 3
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=3 r=1.2
 *
 * x = 3.49
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=3.49 r=1.2
 *
 * x = 3.5
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=3.5 r=1.2
 *
 * x = 3.51
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=3.51 r=2
 *
 * x = 4
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=4 r=2
 *
 * x = 4.5
 * r = interp1(ps, x, opt)
 * console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs: x=4.5 r={"err":"x[4.5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":4.5,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = -1
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=-1 r={"err":"x[-1] less than lower limit[0]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":-1,"trend":"increasing sequence","xmin":0,"xmax":4.5}}
 *
 * x = 0
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=0 r=0.2
 *
 * x = 0.49
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=0.49 r=0.2
 *
 * x = 0.5
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=0.5 r=0.2
 *
 * x = 0.51
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=0.51 r=0.2
 *
 * x = 1
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=1 r=0.2
 *
 * x = 1.9
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=1.9 r=0.2
 *
 * x = 2
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=2 r=0.2
 *
 * x = 2.1
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=2.1 r=1.2
 *
 * x = 2.5
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=2.5 r=1.2
 *
 * x = 3
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=3 r=1.2
 *
 * x = 3.49
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=3.49 r=1.2
 *
 * x = 3.5
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=3.5 r=1.2
 *
 * x = 3.51
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=3.51 r=2
 *
 * x = 4
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=4 r=2
 *
 * x = 4.49
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=4.49 r=2
 *
 * x = 4.5
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=4.5 r=2
 *
 * x = 4.51
 * r = interp1(ps, x, optX)
 * console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
 * // => stairs with x-limit: x=4.51 r={"err":"x[4.51] greater than upper limit[4.5]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":4.51,"trend":"increasing sequence","xmin":0,"xmax":4.5}}
 *
 * x = 0
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=0 r={"err":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 * x = 1
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=1 r=0.2
 *
 * x = 2
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=2 r=0.7
 *
 * x = 2.6
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=2.6 r=1
 *
 * x = 3
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=3 r=1.2
 *
 * x = 3.5
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=3.5 r=1.6
 *
 * x = 4
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=4 r=2
 *
 * x = 5
 * r = interp1(psP, x, optP)
 * console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
 * // => linear by keyX & keyY: x=5 r={"err":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"trend":"increasing sequence","xmin":1,"xmax":4}}
 *
 */
function interp1(ps, x, opt = {}) {

    //check
    if (!isearr(ps)) {
        return {
            err: 'ps is not array'
        }
    }
    if (!isNumber(x)) {
        return {
            err: 'x is not number'
        }
    }

    //toArrayXY
    let psEff = toArrayXY(ps, opt)

    //check
    if (get(psEff, 'err')) {
        return get(psEff, 'err')
    }

    //check
    if (size(psEff) === 0) {
        return {
            err: 'ps is not effective array',
            ps,
            psEff,
        }
    }

    //checkIncrea
    let trend = checkTrend(psEff)

    //check
    if (trend === 'no') {
        return {
            err: 'psEff is not increasing or decreasing'
        }
    }

    //反序
    if (trend === reverseOrderList) {
        trend = orderList
        psEff = reverse(psEff)
    }

    //mode
    let mode = get(opt, 'mode')
    if (mode !== 'linear' && mode !== 'stairs' && mode !== 'blocks') {
        mode = 'linear'
    }

    try {
        if (mode === 'linear') {
            return interp1Linear(psEff, x)
        }
        else if (mode === 'blocks') {
            return interp1Blocks(psEff, x)
        }
        else if (mode === 'stairs') {
            return interp1Stairs(psEff, x, opt)
        }
    }
    catch (err) {
        return {
            err: err.toString(),
        }
    }

}

export default interp1

