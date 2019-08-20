/**
 * 取得運行環境
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getEnv.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳運行環境物件
 * @example
 * getEnv()
 * // => { isBrowser: false, isWebWorker: false, isNode: true }
 */
function getEnv() {

    //isBrowser
    let isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

    //isWebWorker
    let isWebWorker = typeof self === 'object' &&
        self.constructor &&
        self.constructor.name === 'DedicatedWorkerGlobalScope'

    //isNode
    let isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null

    //若在WebWorker也代表在瀏覽器
    isBrowser = isBrowser || isWebWorker

    //此處沒偵測nodejs的Worker Threads

    let r = {
        isBrowser,
        isWebWorker,
        isNode
    }

    return r
}


export default getEnv
