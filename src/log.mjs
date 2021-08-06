import genID from './genID.mjs'
import now2str from './now2str.mjs'
import o2j from './o2j.mjs'
import isfun from './isfun.mjs'


/**
 * log紀錄封裝器
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/log.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳事件物件，可呼叫事件init與log。init傳入紀錄器函數，可為sync或async，紀錄器會收到一個數據物件，此需由紀錄實做儲存方式。log為外部呼叫的紀錄函數，紀錄函數會收到src(觸發來源)、mode(紀錄種類)、msg(紀錄訊息)，回傳係為init取得之紀錄器函數回傳，故可能為sync(一般回傳)或async(Promise)。
 * @example
 *
 * let ms = []
 * let lg = log()
 * lg.init(function(v) {
 *     console.log(v)
 *     ms.push({
 *         src: v.src,
 *         mode: v.mode,
 *         msg: v.msg,
 *     })
 * })
 *
 * lg.log('service:web', 'infor', 'abc')
 * lg.log('service:web', 'error', 'def')
 * lg.log('service:api', 'infor', 'xyz')
 * console.log(ms)
 * // {
 * //   id: '{random-id}',
 * //   src: 'service:web',
 * //   mode: 'infor',
 * //   msg: '"abc"',
 * //   time: '2021-08-06T14:05:38+08:00'
 * // }
 * // {
 * //   id: '{random-id}',
 * //   src: 'service:web',
 * //   mode: 'error',
 * //   msg: '"def"',
 * //   time: '2021-08-06T14:05:38+08:00'
 * // }
 * // {
 * //   id: '{random-id}',
 * //   src: 'service:api',
 * //   mode: 'infor',
 * //   msg: '"xyz"',
 * //   time: '2021-08-06T14:05:38+08:00'
 * // }
 * // [
 * //   { src: 'service:web', mode: 'infor', msg: '"abc"' },
 * //   { src: 'service:web', mode: 'error', msg: '"def"' },
 * //   { src: 'service:api', mode: 'infor', msg: '"xyz"' }
 * // ]
 *
 */
function log() {
    let logger = null

    function logInit(loggerFun) {

        //check
        if (!isfun(loggerFun)) {
            throw new Error('loggerFun is not function')
        }

        //save
        logger = loggerFun //sync or async function

    }

    function logRecord(src, mode, msg) {

        //check
        if (logger === null) {
            throw new Error('no logger: need to construct by init')
        }

        //time
        let time = now2str()

        //d
        let d = {
            id: genID(),
            src,
            mode,
            msg: o2j(msg),
            time,
        }

        //logger
        return logger(d)
    }

    return {
        init: logInit,
        log: logRecord,
    }
}


export default log
