import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import isp0int from './isp0int.mjs'
import evem from './evem.mjs'
import isfun from './isfun.mjs'


//2020年曾以IntersectionObserver與ResizeObserver實作(即下方註解舊碼), 因下列實作缺陷致WTextSelect下拉選單不穩而改為輪詢:
//1.元素尺寸為0(隱藏或移出DOM)時仍發出resize, 使用端讀到高度0而算錯版面
//2.clear未防空值, 元素尚未取得即clear時拋錯, 且已建立之觀察器與已排定之事件未解除
//3.觀察器只綁首次取得之元素, 元素被換成新節點後即失去偵測
//現以ResizeObserver偵測尺寸, 並以共用MutationObserver於[元素取不到、不在頁面中或尺寸為0]時重新取得元素, 逐一對應上述缺陷; 無ResizeObserver或MutationObserver時退回輪詢


// function domDetect(f, opt = {}) {

//使用IntersectionObserver與ResizeObserver時, 當顯隱頻繁導致元素尚未出現需等待與過快清除時, 會導致WTextSelect下拉選單無法穩定出現內容問題

//     let ele = null
//     let obInts = null
//     let obRes = null

//     //tolerancePixel
//     let tolerancePixel = get(opt, 'tolerancePixel', null)
//     if (!ispint(tolerancePixel)) {
//         tolerancePixel = 1
//     }

//     //ev
//     let ev = evem()

//     //timer, sold
//     let timer
//     let sold = {
//         offsetWidth: 0,
//         offsetHeight: 0,
//     }

//     //check
//     if (!isfun(f)) {
//         console.log('invalid f', f)
//         return ev
//     }

//     //check
//     if (!window.IntersectionObserver) {
//         console.log('invalid IntersectionObserver')
//         return ev
//     }

//     //check
//     if (!window.ResizeObserver) {
//         console.log('invalid ResizeObserver')
//         return ev
//     }

//     //setInterval
//     timer = setInterval(() => {

//         //execute
//         let eleTemp = f()

//         //check
//         if (eleTemp) {

//             //save
//             ele = eleTemp

//             //obInts
//             if (!obInts) {
//                 obInts = new window.IntersectionObserver((entries) => {
//                     let entry = entries[0]

//                     setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
//                         ev.emit('display', { mode: entry.isIntersecting ? 'show' : 'hide', ele })
//                     }, 1)

//                 })
//                 obInts.observe(ele)
//             }

//             //obRes
//             if (!obRes) {
//                 obRes = new window.ResizeObserver((entries) => {
//                     // let entry = entries[0]

//                     //new size
//                     let snew = {
//                         offsetWidth: ele.offsetWidth,
//                         offsetHeight: ele.offsetHeight,
//                     }

//                     //save sold
//                     let soldt = { ...sold }

//                     //tolerancePixel
//                     let bw = Math.abs(sold.offsetWidth - snew.offsetWidth) > tolerancePixel
//                     let bh = Math.abs(sold.offsetHeight - snew.offsetHeight) > tolerancePixel

//                     if (bw || bh) {
//                         setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
//                             ev.emit('resize', { sold: soldt, snew, ele })
//                             ev.emit('resizeWithWindow', { sold: soldt, snew, ele, from: 'dom' })
//                         }, 1)
//                     }

//                     //save
//                     sold = snew

//                 })
//                 obRes.observe(ele)
//             }

//             //clearInterval
//             clearInterval(timer)

//         }

//     }, 10)

//     //fWindowResize
//     let fWindowResize = (e) => {
//         ev.emit('resizeWithWindow', { snew: sold, from: 'window' })
//     }
//     window.addEventListener('resize', fWindowResize)

//     //clear
//     ev.clear = () => {
//         obInts.unobserve(ele)
//         obRes.unobserve(ele)
//         clearInterval(timer) //若一直沒偵測到元素故也需要強制中止timer
//         window.removeEventListener('resize', fWindowResize)
//     }

//     return ev
// }


//waiting, 等待重新取得元素之偵測器; mo, 共用之MutationObserver, 僅於有偵測器等待時啟用
let waiting = new Set()
let mo = null


function waitAdd(fn) {
    waiting.add(fn)
    if (!mo) {
        mo = new window.MutationObserver(() => {
            for (let g of Array.from(waiting)) {
                g()
            }
        })
        mo.observe(document.documentElement, { childList: true, subtree: true })
    }
}


function waitRemove(fn) {
    waiting.delete(fn)
    if (waiting.size === 0 && mo) {
        mo.disconnect()
        mo = null
    }
}


function getTimeInterval(opt) {
    let timeInterval = get(opt, 'timeInterval', null)
    if (!ispint(timeInterval)) {
        timeInterval = 20
    }
    return timeInterval
}


function getTolerancePixel(opt) {
    let tolerancePixel = get(opt, 'tolerancePixel', null)
    if (!isp0int(tolerancePixel)) { //可給0, 表示任何變化皆發出
        tolerancePixel = 1
    }
    return tolerancePixel
}


//getEle, f()拋錯或回傳非元素時視為取不到, 不中斷偵測
function getEle(f) {
    let p = null
    try {
        p = f()
    }
    catch (err) {
        p = null
    }
    return (p && p.nodeType === 1) ? p : null
}


function sizeZero() {
    return {
        offsetWidth: 0,
        offsetHeight: 0,
        clientWidth: 0,
        clientHeight: 0,
        windowWidth: 0,
        windowHeight: 0,
    }
}


function measure(p) {
    return {
        offsetWidth: p.offsetWidth,
        offsetHeight: p.offsetHeight,
        clientWidth: p.clientWidth,
        clientHeight: p.clientHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
    }
}


//createCore, 輪詢與ResizeObserver兩種模式共用之比較、發出、視窗事件與清除, 使兩者之規則只寫一處
//  比較基準sb為上次發出事件時之尺寸, 差值超過容許誤差才更新; 若每次量測皆更新基準, 緩慢之連續小變化(如逐px拖曳或縮放視窗)永遠不會超過容許誤差, 累積再大也不發出
//  尺寸為0時差值必超過容許誤差而使基準歸0, 故由隱藏恢復顯示時必發出
function createCore(ev, opt) {

    //tolerancePixel
    let tolerancePixel = getTolerancePixel(opt)

    //sync, 於ResizeObserver回呼內同步發出事件(繪製前), 供須於同一幀更新版面之使用端(例如圖表重繪); 預設以setTimeout脫勾
    let sync = get(opt, 'sync', false) === true

    //cleared, st, sd, sb, smode, timers
    let cleared = false
    let st = sizeZero() //前次量測
    let sd = sizeZero() //最新量測
    let sb = sizeZero() //比較基準, 上次發出事件時之尺寸
    let smode = {
        width: '',
        height: '',
    }
    let timers = new Set()

    //emit
    let emit = (sold, snew, sm, p) => {

        //cleared, clear後不再發出已排定之事件
        if (cleared) {
            return
        }

        //detect resize, 尺寸為0(隱藏或移出DOM)不發出
        if (snew.offsetWidth > 0 && snew.offsetHeight > 0) {
            ev.emit('resize', {
                sold,
                snew,
                smode: sm,
                ele: p,
            })

            //cleared, resize之監聽器內可能呼叫clear
            if (cleared) {
                return
            }

            ev.emit('resizeWithWindow', {
                sold,
                snew,
                smode: sm,
                ele: p,
                from: 'dom',
            })
        }

    }

    //check, 量測並與比較基準比較
    let check = (p, allowSync) => {
        if (cleared || !p) {
            return
        }

        //new size
        let snew = measure(p)

        //dw, dh
        let dw = sb.offsetWidth - snew.offsetWidth
        let dh = sb.offsetHeight - snew.offsetHeight

        //bw, bh
        let bw = Math.abs(dw) > tolerancePixel
        let bh = Math.abs(dh) > tolerancePixel

        //smode
        smode = {
            width: dw > 0 ? 'smaller' : (dw < 0 ? 'larger' : ''),
            height: dh > 0 ? 'smaller' : (dh < 0 ? 'larger' : ''),
        }

        //save
        st = sd
        sd = snew

        //check
        if (!bw && !bh) {
            return
        }

        //sold, sb
        let sold = sb
        sb = snew
        let sm = { ...smode }

        //emit
        if (allowSync && sync) {
            emit(sold, snew, sm, p)
            return
        }
        let t = setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
            timers.delete(t)
            emit(sold, snew, sm, p)
        }, 1)
        timers.add(t)

    }

    //fWindowResize, 視窗尺寸取當下值, 否則元素尺寸未變時會一直帶著上次量測時之視窗尺寸
    let fWindowResize = (e) => {
        if (cleared) {
            return
        }
        sd = {
            ...sd,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
        }
        ev.emit('resizeWithWindow', {
            sold: st,
            snew: sd,
            smode,
            from: 'window',
        })
    }
    window.addEventListener('resize', fWindowResize)

    //clear
    let clear = () => {
        cleared = true
        for (let t of timers) {
            clearTimeout(t)
        }
        timers.clear()
        window.removeEventListener('resize', fWindowResize)
    }

    return {
        check,
        clear,
        isCleared: () => cleared,
        isVisible: () => sd.offsetWidth > 0 && sd.offsetHeight > 0,
    }
}


function domDetectByPolling(f, opt = {}) {

    //check
    if (!isfun(f)) {
        console.log('invalid f', f)
        return null
    }

    //ev, core
    let ev = evem()
    let core = createCore(ev, opt)

    //setInterval
    let timer = setInterval(() => {
        let p = getEle(f)
        if (p) {
            core.check(p, false)
        }
    }, getTimeInterval(opt))

    //clear
    ev.clear = () => {
        clearInterval(timer)
        core.clear()
    }

    return ev
}


function domDetectByObserver(f, opt = {}) {

    //check
    if (!isfun(f)) {
        console.log('invalid f', f)
        return null
    }

    //watchIdentity, 元素可見時亦持續於DOM變動時重新取得元素, 供f()可能於舊元素仍可見時改回傳他元素之使用端
    let watchIdentity = get(opt, 'watchIdentity', false) === true

    //timeInterval, 行內元素改以定期量測時使用
    let timeInterval = getTimeInterval(opt)

    //ev, core
    let ev = evem()
    let core = createCore(ev, opt)

    //ele, timerInline, roBorder, roContent
    let ele = null
    let timerInline = null
    let roBorder = null
    let roContent = null

    //syncInline, 非替換之行內元素ResizeObserver不回報(規範明定), 取得之元素為display:inline時改以定期量測, 不為inline時停止
    let syncInline = () => {
        let inline = false
        if (ele) {
            try {
                inline = window.getComputedStyle(ele).display === 'inline'
            }
            catch (err) {
                inline = false
            }
        }
        if (inline && timerInline === null) {
            timerInline = setInterval(onResize, timeInterval)
        }
        else if (!inline && timerInline !== null) {
            clearInterval(timerInline)
            timerInline = null
        }
    }

    //retarget, 重新取得元素: 換成新節點時改觀察新節點, 新節點之首次回報由check比較
    //  同時觀察border-box與content-box: 比較用之offsetWidth即border-box, 只觀察content-box會漏掉只改padding或border之變化; content-box則使捲軸出現或消失時clientWidth保持最新
    let retarget = () => {
        if (core.isCleared()) {
            return
        }
        let p = getEle(f)
        if (p === ele) {
            return
        }
        if (ele) {
            roBorder.unobserve(ele)
            roContent.unobserve(ele)
        }
        ele = p
        if (ele) {
            roBorder.observe(ele, { box: 'border-box' })
            roContent.observe(ele)
        }
        syncInline()
    }

    //updateWaiting, 元素取不到、不在頁面中或尺寸為0時登記等待DOM變動:
    //  元素消失(移除或換新節點)時ResizeObserver無從得知新節點, 且已隱藏(尺寸0)之元素再被移除時尺寸0→0不會回報, 故尺寸為0時亦須等待
    let updateWaiting = () => {
        if (core.isCleared()) {
            return
        }
        let visible = ele && ele.isConnected && core.isVisible()
        if (visible && !watchIdentity) {
            waitRemove(onDomChange)
        }
        else {
            waitAdd(onDomChange)
        }
    }

    //onDomChange, 僅重新取得元素不量測, 避免強制重排版; 換新節點後由ResizeObserver之首次回報觸發check
    let onDomChange = () => {
        retarget()
        updateWaiting()
    }

    //onResize
    let onResize = () => {
        retarget()
        try {
            core.check(ele, true)
        }
        finally {
            //sync模式下監聽器拋錯時仍須更新行內與等待狀態
            syncInline()
            updateWaiting()
        }
    }

    //roBorder, roContent
    roBorder = new window.ResizeObserver(onResize)
    roContent = new window.ResizeObserver(onResize)

    //initialize
    retarget()
    updateWaiting()

    //clear, 可於任何時點呼叫(含元素尚未取得), 並取消已排定之事件
    ev.clear = () => {
        if (core.isCleared()) {
            return
        }
        core.clear()
        waitRemove(onDomChange)
        roBorder.disconnect()
        roContent.disconnect()
        if (timerInline !== null) {
            clearInterval(timerInline)
            timerInline = null
        }
        ele = null
    }

    return ev
}


/**
 * 前端針對DOM元素監聽resize、resizeWithWindow事件，其中resizeWithWindow為dom resize與window resize皆會觸發的事件
 *
 * 瀏覽器支援ResizeObserver與MutationObserver時以其偵測(即時且閒置時不耗資源)，否則退回定期輪詢，兩者之比較規則與事件相同：以offsetWidth、offsetHeight與比較基準之差超過容許誤差即發出，比較基準為上次發出事件時之尺寸，故緩慢之連續小變化累積超過容許誤差亦會發出；尺寸為0(隱藏或移出DOM)不發出，由隱藏恢復顯示時會發出，首次取得非0尺寸時會發出
 *
 * 元素可取不到、中途消失或重建為新節點：取不到、不在頁面中或尺寸為0時，於DOM變動時重新以f取得元素並改觀察之。行內元素(display:inline)ResizeObserver不回報，該偵測器改以定期量測
 *
 * 事件內容：sold為比較基準(上次發出事件時之尺寸)，snew為本次量測，smode為寬與高相對比較基準之變化方向('larger'、'smaller'或'')，ele為元素；from為'window'之事件其snew為最新量測，其中視窗尺寸取事件當下之值
 *
 * 已知限制：ResizeObserver模式下，僅屬性變化(如class)使f改指他元素、或Shadow DOM內之節點被替換時不會跟隨，此類使用端請用mode:'polling'；sync為true時監聽器不得使所監聽元素之尺寸於同一幀內再變，否則瀏覽器回報ResizeObserver loop錯誤；Safari 15.4以前不支援觀察border-box，只改padding或border之變化於該處不會發出
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} f 輸入取得dom函數，可回傳null表示目前取不到
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode=''] 輸入偵測模式字串，給'polling'則強制使用定期輪詢，預設''
 * @param {Integer} [opt.timeInterval=20] 輸入定期偵測時間整數，單位毫秒，用於輪詢模式與行內元素，預設20
 * @param {Integer} [opt.tolerancePixel=1] 輸入容許誤差整數，單位px，可給0表示任何變化皆發出，預設1
 * @param {Boolean} [opt.sync=false] 輸入是否於ResizeObserver回呼內同步發出事件布林值，true時使用端可於瀏覽器繪製前更新版面(例如圖表重繪)，僅ResizeObserver模式有效，預設false
 * @param {Boolean} [opt.watchIdentity=false] 輸入元素可見時是否仍於DOM變動時重新取得元素布林值，f可能於舊元素仍可見時改回傳另一元素者給true，僅ResizeObserver模式有效，預設false
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽resize與resizeWithWindow事件，clear為釋放監聽，可於任何時點呼叫(含元素尚未取得)，並取消已排定之事件
 * @example
 * need test in browser
 *
 * //監聽dom
 * let de = domDetect(() => {
 *     return document.querySelector('#id')
 * })
 * de.on('resize', (s) => {
 *     console.log('resize', s)
 * })
 * de.on('resizeWithWindow', (s) => {
 *     console.log('resizeWithWindow', s)
 * })
 *
 * //釋放監聽
 * de.clear()
 *
 */
function domDetect(f, opt = {}) {
    let useObserver = typeof window !== 'undefined' && !!window.ResizeObserver && !!window.MutationObserver && get(opt, 'mode', '') !== 'polling'
    if (useObserver) {
        return domDetectByObserver(f, opt)
    }
    return domDetectByPolling(f, opt)
}


export default domDetect
