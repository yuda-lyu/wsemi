//timeKit.mjs: 計時器相關函數之測試工具, 規則見sgud/rule/rulebook.md之R-TRACE-01
//  traceRec: 觀察回調(opt.onTrace)之紀錄器, 測試以「等第N個事件」為同步點並對事件內容斷言, 不以固定等待後檢查(負載下計時器與其回呼之時差不定)
//  useFakeClock: 假時鐘, 「延遲多久才觸發」本身即規格者(防抖之等待、節流之窗口、逾時門檻)用之, 時間只由advance推進
import { mock } from 'node:test'


//防懸置上限用模組載入時保存之真實計時器: 假時鐘(useFakeClock)會取代globalThis.setTimeout/clearTimeout, 守門若用被取代者, 假時鐘下事件不來時守門不會觸發而整案懸置(規格P5③)
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


/**
 * 建立觀察回調之紀錄器
 *
 * 事件由被測函數同步呼叫on送入, 依序存於events; wait回傳之Promise於符合條件之事件出現時resolve, 其後續為microtask, 故測試續行時該事件所在之回呼(task)已執行完畢, 其內之量測、派發與其排定之計時器皆已完成或已排定
 *
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.guard=20000] 輸入wait之防懸置上限毫秒數, 逾時reject並列出已收到之事件; 只防懸置, 須遠大於正常耗時, 不可用來表達規格之時間要求; 以模組載入時保存之真實計時器計時, 假時鐘(useFakeClock)下亦會觸發
 * @returns {Object} 回傳物件{ on, events, mark, wait, types }: on為傳給opt.onTrace之回調; events為已收到之事件陣列; mark()回傳目前事件數, 作為其後wait之起點; wait(pred, from=0, n=1)回傳Promise, 自索引from起第n個符合pred之事件出現時resolve該事件(已收到者亦計入); types(from=0)回傳自from起各事件之type陣列
 */
function traceRec(opt = {}) {
    let guard = opt.guard !== undefined ? opt.guard : 20000
    let events = []
    let waiters = []

    let count = (w, upto) => {
        let k = 0
        for (let i = w.from; i < upto; i++) {
            if (w.pred(events[i])) {
                k++
                if (k >= w.n) {
                    return events[i]
                }
            }
        }
        return null
    }

    let on = (e) => {
        events.push(e)
        for (let w of waiters.slice()) {
            let hit = count(w, events.length)
            if (hit) {
                waiters.splice(waiters.indexOf(w), 1)
                realClearTimeout(w.t)
                w.resolve(hit)
            }
        }
    }

    let wait = (pred, from = 0, n = 1) => {
        return new Promise((resolve, reject) => {
            let w = { pred, from, n, resolve }
            let hit = count(w, events.length)
            if (hit) {
                resolve(hit)
                return
            }
            w.t = realSetTimeout(() => {
                waiters.splice(waiters.indexOf(w), 1)
                reject(new Error(`traceRec: event #${n} from index ${from} not received within ${guard}ms, got ${JSON.stringify(events.slice(from))}`))
            }, guard)
            waiters.push(w)
        })
    }

    let mark = () => events.length

    let types = (from = 0) => events.slice(from).map((e) => e.type)

    return { on, events, mark, wait, types }
}


/**
 * 啟用假時鐘(Node內建node:test之mock.timers, 取代setTimeout、setInterval與Date), 時間只由advance推進
 *  advance逐1ms推進, 每1ms之後以真實setImmediate讓出一次, 使該ms內各回呼所產生之microtask於下一ms前執行; 同一ms內之多個回呼之間不讓出(與真實不同), 故規格涉及「同一ms內各回呼之間microtask先執行」者不可用假時鐘
 *  啟用後以setTimeout為基礎之sleep不會自行結束, 測試內一律改用advance; 須於finally呼叫restore
 *  performance.now、setImmediate、process.nextTick不受影響; 以performance.now計時之被測函數不適用
 *
 * @param {Number} [now=0] 輸入起始時間毫秒數
 * @returns {Object} 回傳{ advance(ms), restore() }, advance回傳Promise
 */
function useFakeClock(now = 0) {
    let si = setImmediate
    mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now })
    let advance = async (ms) => {
        for (let i = 0; i < ms; i++) {
            mock.timers.tick(1)
            await new Promise((resolve) => si(resolve))
        }
    }
    let restore = () => {
        mock.timers.reset()
    }
    return { advance, restore }
}


export {
    traceRec,
    useFakeClock
}
