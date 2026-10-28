import isfun from './isfun.mjs'
import isEle from './isEle.mjs'
import genPm from './genPm.mjs'
import delay from './delay.mjs'
import optNum from './_optNum.mjs'
import detector from './_detector.mjs'
import getTrace from './getTrace.mjs'


/**
 * 前端偵測DOM元素(及其子元素)是否已穩定
 *
 * 一輪偵測: 相隔timeDiff取兩次位置與尺寸(getBoundingClientRect，含transform位移)，並取子樹內進行中之動畫(getAnimations)；等該批動畫結束或取消後再取一次位置與動畫數，整輪期間位置皆未變且從頭到尾皆無動畫才視為穩定，期間曾有動畫或位移即回報不穩定，由下一輪再判。動畫只計playState為running且iterations有限者：已結束但因fill:forwards仍被回傳之動畫不計，否則子元素做完進場動畫後父元素會永遠不穩定；無限循環動畫(如spinner)永不結束，不計亦不等待，否則整輪永不落定
 *
 * 已知限制：等待中之動畫若被暫停(未取消亦未結束)，該輪於其恢復或取消前不結束；未被繪製(未插入或display:none)之元素位置恆為0，判為穩定，須先確認被繪製者可用domIsRendered
 *
 * 元素無效或無getBoundingClientRect時：promise模式回傳被拒絕之Promise(原因為'invalid element'或'invalid element.getBoundingClientRect')；event模式仍回傳可使用create、on、dispose之物件但永不觸發，其error為原因，可偵測時error為null
 *
 * event模式之create於microtask啟動第一輪(晚於本次同步流程，故create後才插入之元素亦從插入後量起)，重複呼叫無效，dispose後呼叫亦無效；stable之監聽器拋錯時有error監聽者則發出error事件，否則console.error，不中斷偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsStable.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='promise'] 輸入模式字串，可使用'promise'與'event'，'promise'代表一次性偵測並回傳Promise(resolve回傳該輪是否穩定布林值)，'event'代表持續性偵測並回傳EventEmitter，啟動時立即開始第一輪，之後每timeDetect啟動一輪(前一輪未完不重疊)，穩定狀態改變時emit('stable', bool)，初始視為不穩定故第一次穩定會emit true，預設'promise'
 * @param {Number} [opt.tolerance=0] 輸入位置容許誤差數字，單位px，須為不小於0之數字(可為數字字串，Infinity代表任何變化皆容許)，無效時用預設，預設0表示須完全相同
 * @param {Number} [opt.timeDiff=100] 輸入位置前後比對之時間差數字，單位ms，須為數字(可為數字字串)，0為立即比對，負數視為0，超過計時器上限(含Infinity)者夾至上限，無效時用預設，預設100
 * @param {Number} [opt.timeDetect=50] 輸入event模式輪詢偵測間隔數字，單位ms，須為大於0之數字(可為數字字串)，超過計時器上限(含Infinity)者夾至上限，無效時用預設，預設50
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；每輪以seq(自1起之輪序號，promise模式恆為1)對應：'round'(含seq)為一輪開始(取第一次位置前)，'rect'(含seq、at、x、y、w、h)為第at次(1至3)位置取樣之結果，'anims'(含seq、at、n)為第at次(1至2)取得進行中且會結束之動畫數n，'judge'(含seq、stable、moved)為該輪判定結果(stable為是否穩定，moved為三次位置是否超出tolerance)，'fail'(含seq)為量測拋錯而該輪失敗(promise模式隨後reject)；event模式另有'skip'(含seq、reason)為輪詢時前一輪(seq)未完而略過(reason恆為'busy')，'emit'(含seq、stable)為穩定狀態改變而即將emit('stable')，'done'(含seq)為該輪(含emit之派發)已結束而可啟動下一輪，'dispose'(含seq，為已啟動之最後一輪序號)為釋放，釋放後不再通知(進行中之一輪亦然)；promise模式於judge或fail之後才resolve或reject；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響偵測，預設null
 * @returns {Promise|Object} 回傳物件，給予'promise'時回傳Promise(resolve回傳當前是否穩定布林值，reject回傳錯誤訊息)，給予'event'時回傳EventEmitter，可使用create、on、dispose函數與error屬性，dispose回傳true
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 *
 * //promise, 一次性偵測
 * let b = await domIsStable(ele)
 * console.log(b)
 * // => true or false
 *
 * //event, 持續偵測
 * let ev = domIsStable(ele, { mode: 'event' })
 * ev.on('stable', (b) => {
 *     console.log('stable', b)
 * })
 * ev.create()
 * //...
 * ev.dispose()
 *
 */
function domIsStable(ele, opt = {}) {

    //mode
    let mode = detector.getMode(opt)

    //check ele
    if (!isEle(ele)) {
        return detector.detectorFail(mode, 'invalid element')
    }

    //check getBoundingClientRect
    if (!isfun(ele.getBoundingClientRect)) {
        return detector.detectorFail(mode, 'invalid element.getBoundingClientRect')
    }

    //tolerance, 位置容許誤差(px)
    let tolerance = optNum(opt, 'tolerance', 0, { min: 0, inf: 'keep' })

    //timeDiff, 位置前後比對的時間差(ms), 0為有效(使用端如w-component-vue之v-domstable允許0)
    let timeDiff = optNum(opt, 'timeDiff', 100, { min: 0, below: 'clamp', timer: true })

    //timeDetect, 偵測時間差(ms), 須大於0, 否則為高頻輪詢
    let timeDetect = optNum(opt, 'timeDetect', 50, { min: 0, minOpen: true, timer: true })

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

    //getRect: 取螢幕位置與尺寸(getBoundingClientRect的left/top會反映transform位移)
    let getRect = () => {
        let r = ele.getBoundingClientRect()
        return { x: r.left, y: r.top, w: r.width, h: r.height }
    }

    //sameRect: 兩次位置/尺寸是否在誤差內相同
    let sameRect = (a, b) => {
        return !!a && !!b &&
            Math.abs(a.x - b.x) <= tolerance &&
            Math.abs(a.y - b.y) <= tolerance &&
            Math.abs(a.w - b.w) <= tolerance &&
            Math.abs(a.h - b.h) <= tolerance
    }

    //isActive: 動畫是否進行中且會結束
    //  只計playState為running者: 已結束但因fill:forwards仍被getAnimations回傳者(playState為finished)與暫停者不計, 否則子元素做完進場動畫後父元素會永遠不穩定
    //  無限循環動畫(iterations為Infinity, 如spinner)永不結束, 其finished永不落定, 不計亦不等待, 否則整輪吊死; 故子樹有spinner不影響穩定判定
    //  剛建立尚未開始之transition為running且pending, 屬進行中, 須計入
    let isActive = (a) => {
        try {
            return a.playState === 'running' && Number.isFinite(a.effect.getTiming().iterations)
        }
        catch (err) {
            return false
        }
    }

    //getAnims: 取得子樹內進行中且會結束之動畫, 不支援getAnimations時退化為空陣列
    let getAnims = () => {
        try {
            return ele.getAnimations({ subtree: true }).filter(isActive)
        }
        catch (err) {
            return []
        }
    }

    //core, seq為輪序號, tr為通知觀察回調之函數(null代表不通知)
    let core = async (seq, tr) => {

        //pm
        let pm = genPm()

        try {

            if (tr) {
                tr('round', { seq })
            }

            //r1、r2, 相隔timeDiff取兩次位置
            let r1 = getRect()
            if (tr) {
                tr('rect', { seq, at: 1, x: r1.x, y: r1.y, w: r1.w, h: r1.h })
            }
            await delay(timeDiff)
            let r2 = getRect()
            if (tr) {
                tr('rect', { seq, at: 2, x: r2.x, y: r2.y, w: r2.w, h: r2.h })
            }

            //anims, 視窗結束當下進行中之動畫, 須於等待之前取得並計入判定
            //  若只看等完之後的數量, 等完幾乎必為0, 而transition剛建立時有一至數個frame尚未位移, 視窗尾端建立者r1與r2皆未見位移, 整段動畫會被漏判為穩定
            let anims = getAnims()
            let n1 = anims.length
            if (tr) {
                tr('anims', { seq, at: 1, n: n1 })
            }

            //等這批動畫結束或被取消(取消時finished為reject, 以allSettled一律通過), 再取一次動畫數與位置
            await Promise.allSettled(anims.map((a) => a.finished))
            let n2 = getAnims().length
            if (tr) {
                tr('anims', { seq, at: 2, n: n2 })
            }
            let r3 = getRect()
            if (tr) {
                tr('rect', { seq, at: 3, x: r3.x, y: r3.y, w: r3.w, h: r3.h })
            }

            //b, 整輪期間位置皆未變且從頭到尾皆無動畫才視為穩定, 期間曾有動畫或位移即回報不穩定, 由下一輪再判
            let b = sameRect(r1, r2) && sameRect(r1, r3) && n1 === 0 && n2 === 0

            //judge, 於resolve之前通知
            if (tr) {
                tr('judge', { seq, stable: b, moved: !(sameRect(r1, r2) && sameRect(r1, r3)) })
            }

            //resolve
            pm.resolve(b)

        }
        catch (err) {
            if (tr) {
                tr('fail', { seq })
            }
            pm.reject(err)
        }

        return pm
    }

    //promise
    if (mode === 'promise') {
        return core(1, trace)
    }

    //event, 啟動時立即開始第一輪, 之後每timeDetect啟動一輪, 前一輪未完(例如等待動畫)不另起新輪; 釋放後進行中之一輪結果由骨架丟棄(釋放後之emit不發出)
    return detector.detectorEvent((emit, addCleanup) => {
        let stopped = false
        let bLock = false
        let bLast = false
        let timer = null
        let nSeq = 0 //已啟動之輪數(輪序號)

        //tr, 通知觀察回調, 釋放後不再通知(進行中之一輪亦然), 未給觀察回調時為null
        let tr = null
        if (trace) {
            tr = (type, info) => {
                if (!stopped) {
                    trace(type, info)
                }
            }
        }

        addCleanup(() => {
            if (tr) {
                tr('dispose', { seq: nSeq })
            }
            stopped = true
            clearInterval(timer)
        })
        let round = () => {
            if (stopped || bLock) {
                if (tr && bLock) {
                    tr('skip', { seq: nSeq, reason: 'busy' })
                }
                return
            }
            bLock = true
            nSeq++
            let seq = nSeq
            core(seq, tr)
                .then((bNow) => {
                    if (bLast !== bNow) {
                        bLast = bNow
                        if (tr) {
                            tr('emit', { seq, stable: bNow })
                        }
                        emit('stable', bNow) //監聽器拋錯由evEmit處理, 不會進入下方之catch
                    }
                })
                .catch(() => {
                    //量測本身之錯誤, 由下一輪再判
                })
                .finally(() => {
                    bLock = false
                    if (tr) {
                        tr('done', { seq })
                    }
                })
        }
        timer = setInterval(round, timeDetect)
        round()
    }, { tag: 'domIsStable' })
}


export default domIsStable
