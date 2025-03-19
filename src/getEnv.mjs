import isWindow from './isWindow.mjs'


/**
 * 取得運行環境
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getEnv.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳運行環境物件
 * @example
 *
 * console.log(getEnv())
 * // => { isBrowser: false, isWebWorker: false, isNode: true }
 *
 */
function getEnv() {

    //isBrowser
    let isBrowser = isWindow()

    //isWebWorker
    //let isWebWorker = typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope' //於ie11的webworker內失效
    let isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope

    //isNode
    let isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null

    //若在WebWorker也代表在瀏覽器
    isBrowser = isBrowser || isWebWorker

    //此處沒偵測nodejs的Worker Threads

    //r
    let r = {
        isBrowser,
        isWebWorker,
        isNode,
    }

    return r
}


export default getEnv
