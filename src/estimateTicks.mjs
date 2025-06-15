import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import range from 'lodash-es/range.js'
import first from 'lodash-es/first.js'
import last from 'lodash-es/last.js'
import sortBy from 'lodash-es/sortBy.js'
import filter from 'lodash-es/filter.js'
import isnum from './isnum.mjs'
import isearr from './isearr.mjs'
import isint from './isint.mjs'
import cdbl from './cdbl.mjs'
import round from './round.mjs'
import ceil from './ceil.mjs'
import preciseNum from './preciseNum.mjs'


let norm = (v) => {
    let b = 1
    if (v < 0) {
        b = -1
    }
    v = Math.abs(v)
    let rr = null
    if (v < 0.1) {
        for (let i = 1; i < 16; i++) {
            let r = Math.pow(10, i)
            v *= r
            if (v < 1) {
                rr = {
                    r: 1 / r, //乘值恢復v
                    v: b * v,
                }
                break
            }
        }
    }
    else if (v < 1) {
        return {
            r: 1, //乘值恢復v
            v: b * v,
        }
    }
    else if (v >= 1) {
        for (let i = 1; i < 16; i++) {
            let r = Math.pow(10, i)
            v /= r
            if (v < 1) {
                rr = {
                    r, //乘值恢復v
                    v: b * v,
                }
                break
            }
        }
    }

    if (rr === null) {
        throw new Error(`can not normalize v[${v}]`)
    }
    return rr
}

/**
 * 給予最小與最大值，估計適合的繪圖刻度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/./blob/master/test/estimateTicks.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} rmin 輸入數字或字串
 * @param {Number|String} rmax 輸入數字或字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.testTickNums=[3, 4, 5]] 輸入可供測試刻度數量陣列，預設[3, 4, 5]
 * @returns {Object} 回傳繪圖刻度物件，包含刻度數量tickNum、刻度間距tickInterval、刻度位置tickPositions
 * @example
 *
 * let rmin = null
 * let rmax = null
 * let r = null
 *
 * // -4.66~-3.11
 * rmin = -4.66
 * rmax = -3.11
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin -4.66 rmax -3.11 r { tickNum: 3, tickInterval: 0.8, tickPositions: [ -4.7, -3.9, -3.1 ], tickDig: 1 }
 *
 * // 0~0.9
 * rmin = 0
 * rmax = 0.9
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0 rmax 0.9 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ], tickDig: 1 }
 *
 * // 0~1
 * rmin = 0
 * rmax = 1
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0 rmax 1 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ], tickDig: 1 }
 *
 * // 0~99
 * rmin = 0
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0~100
 * rmin = 0
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0.1~0.9
 * rmin = 0.1
 * rmax = 0.9
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.1 rmax 0.9 r { tickNum: 3, tickInterval: 0.4, tickPositions: [ 0.1, 0.5, 0.9 ], tickDig: 1 }
 *
 * // 0.1~1
 * rmin = 0.1
 * rmax = 1
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.1 rmax 1 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ], tickDig: 1 }
 *
 * // 0.1~99
 * rmin = 0.1
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.1 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0.1~100
 * rmin = 0.1
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.1 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0.1~100.1
 * rmin = 0.1
 * rmax = 100.1
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.1 rmax 100.1 r { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ], tickDig: 0 }
 *
 * // 0.89~0.9
 * rmin = 0.89
 * rmax = 0.9
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.89 rmax 0.9 r { tickNum: 3, tickInterval: 0.01, tickPositions: [ 0.88, 0.89, 0.9 ], tickDig: 1 }
 *
 * // 0.89~1
 * rmin = 0.89
 * rmax = 1
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.89 rmax 1 r { tickNum: 3, tickInterval: 0.1, tickPositions: [ 0.8, 0.9, 1 ], tickDig: 1 }
 *
 * // 0.89~99
 * rmin = 0.89
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.89 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0.89~100
 * rmin = 0.89
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.89 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ], tickDig: 0 }
 *
 * // 0.89~100.89
 * rmin = 0.89
 * rmax = 100.89
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 0.89 rmax 100.89 r { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ], tickDig: 0 }
 *
 * // 50.89~99
 * rmin = 50.89
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 50.89 rmax 99 r { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ], tickDig: 0 }
 *
 * // 50.89~100
 * rmin = 50.89
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 50.89 rmax 100 r { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ], tickDig: 0 }
 *
 * // 90.89~99
 * rmin = 90.89
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 90.89 rmax 99 r { tickNum: 4, tickInterval: 3, tickPositions: [ 90, 93, 96, 99 ], tickDig: 0 }
 *
 * // 90.89~100
 * rmin = 90.89
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 90.89 rmax 100 r { tickNum: 3, tickInterval: 5, tickPositions: [ 90, 95, 100 ], tickDig: 0 }
 *
 * // 98.9~99
 * rmin = 98.9
 * rmax = 99
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 98.9 rmax 99 r { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ], tickDig: 0 }
 *
 * // 98.9~100
 * rmin = 98.9
 * rmax = 100
 * r = estimateTicks(rmin, rmax)
 * console.log('rmin', rmin, 'rmax', rmax, 'r', r)
 * // => rmin 98.9 rmax 100 r { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ], tickDig: 0 }
 *
 */
function estimateTicks(rmin, rmax, opt = {}) {

    //check rmin
    if (!isnum(rmin)) {
        throw new Error(`rmin is not a number`)
    }
    rmin = cdbl(rmin)

    //check rmax
    if (!isnum(rmax)) {
        throw new Error(`rmax is not a number`)
    }
    rmax = cdbl(rmax)

    //check rmin=rmax
    if (rmin === rmax) {
        let tickInterval = null
        if (rmin === 0) {
            tickInterval = 1
        }
        else {
            tickInterval = Math.abs(rmin / 10)
        }
        let tickDig = preciseNum(tickInterval, { returnDigit: true })
        // console.log('tickDig', tickDig)
        tickInterval = round(tickInterval, tickDig)
        return {
            tickNum: 3,
            tickInterval,
            tickPositions: [rmin - tickInterval, rmin, rmin + tickInterval],
            tickDig,
        }
    }

    //check rmin>rmax
    if (rmin > rmax) {
        throw new Error(`rmin[${rmin}] > rmax[${rmax}]`)
    }

    //testTickNums
    let testTickNums = get(opt, 'testTickNums')
    if (!isearr(testTickNums)) {
        testTickNums = [3, 4, 5]
    }

    let vmin = rmin
    let vmax = rmax
    // console.log('vmin', vmin)
    // console.log('vmax', vmax)

    let nmMin = norm(vmin)
    let nmMax = norm(vmax)
    let rat = Math.max(nmMin.r, nmMax.r)
    let irat = Math.log10(rat)
    // console.log('rat', rat, 'irat', irat, 'nmMin.r', nmMin.r, 'nmMax.r', nmMax.r)

    let yMin = vmin / rat
    let yMax = vmax / rat
    // console.log('yMin', yMin)
    // console.log('yMax', yMax)

    let yCenter = (yMin + yMax) / 2
    // console.log('yCenter', yCenter)

    let yRng = yMax - yMin
    // console.log('yRng', yRng)

    let tks = []
    each(testTickNums, (tickNum) => {
        // console.log('tickNum', tickNum)

        let yIntrv = yRng / (tickNum - 1)
        // console.log('yIntrv', yIntrv)
        // let yIntrvStr = preciseNum(yIntrv)
        // console.log('yIntrvStr', yIntrvStr)
        let yIntrvIdg = preciseNum(yIntrv, { returnDigit: true })
        // console.log('yIntrvIdg', yIntrvIdg)

        //限制yIntrvIdg, 因數據已正規化, 只選擇小數位2位以內去測試
        yIntrvIdg = Math.min(yIntrvIdg, 2)

        //testIdgs
        let testIdgs = range(yIntrvIdg, -1, -1)
        // console.log('testIdgs', testIdgs)

        each(testIdgs, (idg) => {
            // console.log('idg', idg)

            //idgTrue
            let idgTrue = idg - irat
            idgTrue = Math.max(idgTrue, 0)
            // console.log('idgTrue', idgTrue)

            //間距取指定位數之大值
            let testTickInterval = ceil(yIntrv, idg)
            // console.log('testTickInterval', testTickInterval)

            //testTickIntervalDown
            let testTickIntervalDown = testTickInterval - 1 / Math.pow(10, idg)
            testTickIntervalDown = round(testTickIntervalDown, idg)
            // console.log('testTickIntervalDown', testTickIntervalDown)

            //testTickIntervalUp
            let testTickIntervalUp = testTickInterval + 1 / Math.pow(10, idg)
            testTickIntervalUp = round(testTickIntervalUp, idg)
            // console.log('testTickIntervalUp', testTickIntervalUp)

            //testTickIntervals, 添加上下同小數位數之間距
            let testTickIntervals = [
                testTickIntervalDown,
                testTickInterval,
                testTickIntervalUp,
            ]
            testTickIntervals = filter(testTickIntervals, (v) => {
                return v > 0
            })
            // console.log('testTickIntervals', testTickIntervals)

            //重新指定數據中點
            let testCenter = round(yCenter, idg)
            // console.log('testCenter', testCenter)

            //testCenterDown
            let testCenterDown = testCenter - 1 / Math.pow(10, idg)
            testCenterDown = round(testCenterDown, idg)
            // console.log('testCenterDown', testCenterDown)

            //testCenterUp
            let testCenterUp = testCenter + 1 / Math.pow(10, idg)
            testCenterUp = round(testCenterUp, idg)
            // console.log('testCenterUp', testCenterUp)

            //testCenters, 添加上下同小數位數之數據中點
            let testCenters = [
                testCenterDown,
                testCenter,
                testCenterUp,
            ]
            // console.log('testCenters', testCenters)

            each(testTickIntervals, (tickInterval) => {

                //tickIntervalTrue
                let tickIntervalTrue = rat * tickInterval
                tickIntervalTrue = round(tickIntervalTrue, idgTrue)
                // console.log('tickIntervalTrue', tickIntervalTrue)

                each(testCenters, (rngCenter) => {

                    //tickPositions, tickPositionsTrue
                    let tickPositions = []
                    let tickPositionsTrue = []
                    if (true) {

                        let tickNumHalf = (tickNum - 1) / 2
                        let tMin = rngCenter - tickNumHalf * tickInterval
                        for (let i = 0; i < tickNum; i++) {
                            let v = tMin + i * tickInterval
                            v = round(v, idg)
                            tickPositions.push(v)
                            let vTrue = rat * v
                            vTrue = round(vTrue, idgTrue)
                            tickPositionsTrue.push(vTrue)
                        }
                    }
                    // console.log('tickPositions', tickPositions)

                    //minTick
                    let minTick = first(tickPositions)
                    // console.log('minTick', minTick)

                    //maxTick
                    let maxTick = last(tickPositions)
                    // console.log('maxTick', maxTick)

                    //check
                    if (minTick > yMin || maxTick < yMax) {
                        return true //跳出換下一個
                    }

                    //overMin
                    let overMin = (yMin - minTick) / yRng
                    // console.log('overMin', overMin)

                    //overMax
                    let overMax = (maxTick - yMax) / yRng
                    // console.log('overMax', overMax)

                    //rd
                    let rd = (overMin + overMax) / 2
                    // console.log('rd', rd)

                    //numInt, 真實刻度值為整數時, 降低權重
                    let numInt = 0
                    each(tickPositionsTrue, (v) => {
                        if (isint(v)) {
                            numInt++
                        }
                    })
                    let ratInt = numInt / tickNum
                    // console.log('numInt', numInt)
                    // console.log('ratInt', ratInt)

                    //num0, 正規化刻度值為0時, 降低權重
                    let num0 = 0
                    each(tickPositions, (v) => {
                        if (v === 0) {
                            num0++
                        }
                    })
                    let rat0 = num0 / tickNum
                    // console.log('num0', num0)
                    // console.log('rat0', rat0)

                    //num5, 正規化刻度值為5,50,500...等序列時, 降低權重
                    let num5 = 0
                    each(tickPositions, (v) => {
                        if (v === 0.5) {
                            num5++
                        }
                    })
                    let rat5 = num5 / tickNum
                    // console.log('num5', num5)
                    // console.log('rat5', rat5)

                    //num10, 正規化刻度值為10,100,1000...等序列時, 降低權重
                    let num10 = 0
                    each(tickPositions, (v) => {
                        if (v === 1) {
                            num10++
                        }
                    })
                    let rat10 = num10 / tickNum
                    // console.log('num10', num10)
                    // console.log('rat10', rat10)

                    //fitness, 適應函數值
                    let fitness = rd + (idg * 0.2) + (tickNum * 0.1) + (overMin * 1.5) + (overMax * 1.5) + (1 - ratInt * 0.25) + (1 - rat0 * 0.4) + (1 - rat5 * 0.3) + (1 - rat10 * 0.3)

                    //tk
                    let tk = {
                        diff: rd,
                        rngCenter,
                        numInt,
                        ratInt,
                        num0,
                        rat0,
                        num5,
                        rat5,
                        num10,
                        rat10,
                        overMin,
                        overMax,
                        fitness,
                        idg,
                        tickNum,
                        _tickDig: idg,
                        // __tickInterval: yIntrv,
                        _tickInterval: tickInterval,
                        _tickPositions: tickPositions,
                        tickDig: idgTrue,
                        tickInterval: tickIntervalTrue,
                        tickPositions: tickPositionsTrue,
                    }
                    // console.log('tk', tk)

                    //push
                    tks.push(tk)

                })

            })

        })

    })
    // console.log('tks', tks)

    //sortBy
    tks = sortBy(tks, 'fitness')
    // console.log('tks(sortBy)', tks)

    //tk
    let tk = get(tks, 0)
    // console.log('tk', tk)

    return {
        tickNum: tk.tickNum,
        tickInterval: tk.tickInterval,
        tickPositions: tk.tickPositions,
        tickDig: tk.tickDig,
    }
}


export default estimateTicks
