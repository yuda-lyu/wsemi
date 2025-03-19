import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'


/**
 * 回傳當前高精度時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeHp.test.mjs Github}
 * @memberOf wsemi
 * @returns {Number} 回傳當前時間數字
 * @example
 *
 * let t = getTimeHp()
 * console.log('t', t)
 *
 */
function getTimeHp() {

    //g
    let g = getGlobal()

    //getTimeNode
    let getTimeNode = () => {
        // return g.process.hrtime.bigint()
        return Number(g.process.hrtime.bigint()) / 1e6
    }

    //getTimeBrowser
    let getTimeBrowser = () => {
        return g.performance.now()
    }

    //iswin
    let iswin = isWindow()

    //getTime
    let getTime = null
    if (iswin) {
        getTime = getTimeBrowser
    }
    else {
        getTime = getTimeNode
    }

    return getTime
}


export default getTimeHp
