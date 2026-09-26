import get from 'lodash-es/get.js'
import throttle from 'lodash-es/throttle.js'
import ispint from './ispint.mjs'
import isp0int from './isp0int.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import evem from './evem.mjs'
import isfun from './isfun.mjs'


//2020年曾以IntersectionObserver與ResizeObserver實作(詳細請查git紀錄), 因實作缺陷致WTextSelect下拉選單不穩而改為輪詢:
//1.元素尺寸為0(隱藏或移出DOM)時仍發出resize, 使用端讀到高度0而算錯版面
//2.clear未防空值, 元素尚未取得即clear時拋錯, 且已建立之觀察器與已排定之事件未解除
//3.觀察器只綁首次取得之元素, 元素被換成新節點後即失去偵測

//現已恢復並用以ResizeObserver偵測尺寸, 並以共用MutationObserver於[元素取不到、不在頁面中或尺寸為0]時重新取得元素, 逐一對應上述缺陷; 無ResizeObserver或MutationObserver時退回輪詢


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


function getThrottle(opt) {
    let t = get(opt, 'throttle', null)
    if (!ispint(t)) { //未給或0表示不節流
        t = 0
    }
    return t
}


function getFun(opt, key) {
    let f = get(opt, key, null)
    return isfun(f) ? f : null
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


//toNum, 非數字(含拋錯、未給)者為null
function toNum(v) {
    return isnum(v) ? cdbl(v) : null
}


function sizeZero() {
    return {
        offsetWidth: 0,
        offsetHeight: 0,
        clientWidth: 0,
        clientHeight: 0,
        windowWidth: 0,
        windowHeight: 0,
        width: 0,
        height: 0,
    }
}


//measure, width與height為比較用尺寸: 預設同offsetWidth與offsetHeight(border-box), 有給getSize時取其回傳(例如使用端依內容區繪製者)
function measure(p, getSize) {
    let r = {
        offsetWidth: p.offsetWidth,
        offsetHeight: p.offsetHeight,
        clientWidth: p.clientWidth,
        clientHeight: p.clientHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        width: p.offsetWidth,
        height: p.offsetHeight,
    }
    if (getSize) {
        let s = null
        try {
            s = getSize(p)
        }
        catch (err) {
            s = null
        }
        r.width = toNum(get(s, 'width', null)) || 0
        r.height = toNum(get(s, 'height', null)) || 0
    }
    return r
}


//isShown, 量測時元素可見(外框非0)且比較用尺寸非0
function isShown(s) {
    return s.offsetWidth > 0 && s.offsetHeight > 0 && s.width > 0 && s.height > 0
}


//isRendered, 元素當下是否被繪製: 在頁面中且自身與祖先皆非display:none
//  只需計算樣式不需排版: 若讀外框(offsetWidth)確認, 前一個監聽器改動DOM後(同步寫入或Vue於microtask更新)之每次確認皆強制重排, N個偵測器即N次排版
//  有checkVisibility時以其判定(另涵蓋content-visibility:hidden等), 否則逐層檢查display; 不讀外框, 故元素仍被繪製而尺寸縮為0者視為被繪製
function isRendered(p) {
    if (!p || !p.isConnected) {
        return false
    }
    if (isfun(p.checkVisibility)) {
        return p.checkVisibility()
    }
    let e = p
    while (e && e.nodeType === 1) {
        let display = ''
        try {
            display = window.getComputedStyle(e).display
        }
        catch (err) {
            display = ''
        }
        if (display === 'none') {
            return false
        }
        e = e.parentElement || (e.parentNode && e.parentNode.host) || null //Shadow DOM內之頂層節點改查其宿主
    }
    return true
}


//createCore, 輪詢與ResizeObserver兩種模式共用之比較、發出、視窗事件與清除, 使兩者之規則只寫一處
//  比較基準預設為上次判定變化時之尺寸sb, 差值超過容許誤差才更新; 若每次量測皆更新基準, 緩慢之連續小變化(如逐px拖曳或縮放視窗)永遠不會超過容許誤差, 累積再大也不發出
//  尺寸為0時差值必超過容許誤差而使基準歸0, 故由隱藏恢復顯示時必發出
//  有給getBase時比較基準改為使用端目前套用之尺寸(例如圖表目前寬高), 故掛載時尺寸已一致者不發出, 且與偵測器之回報次序無關
//  onReobserve為延後發出因元素已不被繪製而略過時, 請觀察層重新觀察目前元素並登記等待之函數(輪詢模式不需要, 下一次取樣即重新比較)
function createCore(ev, opt, onReobserve) {

    //tolerancePixel
    let tolerancePixel = getTolerancePixel(opt)

    //sync, 於ResizeObserver回呼內同步發出事件(繪製前), 供須於同一幀更新版面之使用端(例如圖表重繪); 預設以setTimeout脫勾
    let sync = get(opt, 'sync', false) === true

    //getSize, getBase, throttleTime
    let getSize = getFun(opt, 'getSize')
    let getBase = getFun(opt, 'getBase')
    let throttleTime = getThrottle(opt)

    //cleared, sd, sb, pLast, timers, seqCheck, seqPost
    let cleared = false
    let sd = sizeZero() //最新量測
    let sb = sizeZero() //上次判定變化時之尺寸
    let pLast = null //最新量測之元素, 供視窗事件確認其當下是否被繪製
    let timers = new Set()
    let seqCheck = 0 //判定變化之序號
    let seqPost = 0 //已處理(發出, 或因尺寸0、不被繪製、使用端已同步而不發出)之最新序號

    //readBase, 比較基準: 有給getBase時取其回傳(該軸非數字表示該軸不比較, 例如固定寬度), 否則為sb
    //  pending為判定變化時: 有給getBase且尚有未處理之延後發出者, 使用端尺寸將被其更新, 故比較之軸改以其量測(sb)比較;
    //  否則之後量得與使用端當下相近之尺寸會被判為未變化, 待延後發出套用後使用端即停在過期尺寸; 發出前之再比較(pending為false)則以使用端當下之尺寸比較
    let readBase = (pending) => {
        if (!getBase) {
            return {
                width: sb.width,
                height: sb.height,
            }
        }
        let b = null
        try {
            b = getBase()
        }
        catch (err) {
            b = null
        }
        let width = toNum(get(b, 'width', null))
        let height = toNum(get(b, 'height', null))
        if (pending && seqPost < seqCheck) {
            return {
                width: width === null ? null : sb.width,
                height: height === null ? null : sb.height,
            }
        }
        return {
            width,
            height,
        }
    }

    //diff, 各軸相對比較基準之差與是否超過容許誤差
    let diff = (snew, pending) => {
        let base = readBase(pending)
        let dw = base.width === null ? 0 : base.width - snew.width
        let dh = base.height === null ? 0 : base.height - snew.height
        return {
            dw,
            dh,
            bw: Math.abs(dw) > tolerancePixel,
            bh: Math.abs(dh) > tolerancePixel,
        }
    }

    //mode, 方向只於該軸超過容許誤差時給: 容許誤差內之差值視同未變化(不發事件), 若仍給方向, 另一軸觸發之事件會帶出該軸之殘餘方向
    let mode = (d) => {
        return {
            width: d.bw ? (d.dw > 0 ? 'smaller' : 'larger') : '',
            height: d.bh ? (d.dh > 0 ? 'smaller' : 'larger') : '',
        }
    }

    //skip, 延後發出前元素已不被繪製而不發出:
    //  若此為最近一次判定之變化(之後未再判定), 比較基準與最新量測歸0, 並請觀察層重新觀察目前元素; 否則元素於下一幀前恢復顯示且尺寸與隱藏前相同時ResizeObserver不再回報(上次回報之尺寸未變), 此次變化即永不發出
    //  之後已再判定變化者由該次發出處理, 不得歸0, 否則覆蓋較新之比較基準
    let skip = (snew) => {
        if (sb !== snew) {
            return
        }
        sb = sizeZero()
        sd = sizeZero()
        if (onReobserve) {
            onReobserve()
        }
    }

    //post, 發出事件
    //  deferred為延後發出(setTimeout、節流之後續呼叫或refresh): 自量測至發出之間元素可能已隱藏或移出頁面, 若照發則使用端讀到尺寸0而算錯版面(即上方2020年缺陷1), 故發出前確認元素當下仍被繪製;
    //  有給getBase者亦再比較一次, 期間使用端已自行同步尺寸時不發出, 方向亦依當下比較重給
    let post = (sold, snew, sm, p, seq, deferred) => {

        //cleared, clear後不再發出已排定之事件
        if (cleared) {
            return
        }

        //seq, 已處理較新之量測者不發出較舊者: sync時refresh或節流之後續發出為延後發出, 可能晚於其後已同步發出之事件, 照發則使用端最後收到過期尺寸
        if (seq < seqPost) {
            return
        }
        seqPost = seq

        //尺寸為0(隱藏或移出DOM)不發出
        if (!isShown(snew)) {
            return
        }

        //deferred
        if (deferred) {
            if (!isRendered(p)) {
                skip(snew)
                return
            }
            if (getBase) {
                let d = diff(snew, false)
                if (!d.bw && !d.bh) {
                    return
                }
                sm = mode(d)
            }
        }

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

    //fire, 於ResizeObserver回呼內同步發出(inSync)或延後發出
    //  延後發出各自一個task: 前一個監聽器於microtask之DOM異動(如Vue之非同步更新)於下一個發出前已套用, 且監聽器不集中於同一個task; 發出前之確認只需樣式(isRendered), 故不因此強制重排
    let inSync = false
    let fire = (sold, snew, sm, p, seq) => {
        if (inSync) {
            post(sold, snew, sm, p, seq, false)
            return
        }
        let t = setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
            timers.delete(t)
            post(sold, snew, sm, p, seq, true)
        }, 1)
        timers.add(t)
    }

    //fireThrottled, 節流: 首次立即(同步或延後), 其後throttleTime內至多一次並以最後一次之量測延後發出
    let fireThrottled = null
    if (throttleTime > 0) {
        fireThrottled = throttle(fire, throttleTime)
    }

    //deliver, now為於ResizeObserver回呼內同步發出
    let deliver = (sold, snew, sm, p, seq, now) => {
        inSync = now
        try {
            if (fireThrottled) {
                fireThrottled(sold, snew, sm, p, seq)
            }
            else {
                fire(sold, snew, sm, p, seq)
            }
        }
        finally {
            inSync = false
        }
    }

    //check, 量測並與比較基準比較
    let check = (p, allowSync) => {
        if (cleared) {
            return
        }

        //取不到元素: 最新量測歸0, 視窗事件不發出(同移出頁面); 比較基準不動, 同尺寸之元素再出現時與既有行為相同不發出dom事件
        if (!p) {
            sd = sizeZero()
            pLast = null
            return
        }

        //new size
        let snew = measure(p, getSize)

        //save
        sd = snew
        pLast = p

        //diff
        let d = diff(snew, true)
        if (!d.bw && !d.bh) {
            return
        }

        //sold, sb
        let sold = sb
        sb = snew

        //deliver
        seqCheck++
        deliver(sold, snew, mode(d), p, seqCheck, allowSync && sync)

    }

    //fWindowResize, 視窗尺寸取當下值, 否則元素尺寸未變時會一直帶著上次量測時之視窗尺寸
    //  sold為比較基準, 與dom事件同義; 任何超過容許誤差之變化皆已立即更新比較基準, 故最新量測與比較基準之差必在容許誤差內, 方向恆為空
    //  元素隱藏、移出頁面、取不到或尚未量得尺寸(最新量測為0)時不發出, 與dom事件之規則一致, 否則使用端於視窗改變時讀到尺寸0而算錯版面
    //  視窗事件於同一幀之ResizeObserver回報前派發, 視窗改變本身使元素隱藏時(如媒體查詢)最新量測仍為隱藏前之尺寸, 故另確認元素當下仍被繪製(只需樣式, 不強制重排)
    let fWindowResize = (e) => {
        if (cleared) {
            return
        }
        sd = {
            ...sd,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
        }
        if (!isShown(sd) || !isRendered(pLast)) {
            return
        }
        ev.emit('resizeWithWindow', {
            sold: sb,
            snew: sd,
            smode: {
                width: '',
                height: '',
            },
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
        if (fireThrottled) {
            fireThrottled.cancel()
        }
        window.removeEventListener('resize', fWindowResize)
        pLast = null
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

    //setInterval, 取不到元素時亦交check處理(最新量測歸0)
    let timer = setInterval(() => {
        core.check(getEle(f), false)
    }, getTimeInterval(opt))

    //refresh, 立即重新取得元素並比較(延後發出); clear後不再呼叫f, 同ResizeObserver模式
    ev.refresh = () => {
        if (core.isCleared()) {
            return
        }
        core.check(getEle(f), false)
    }

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
    //  延後發出略過時重新觀察目前元素, 並依[尺寸為0時等待DOM變動]登記等待(最新量測已歸0), 不依賴重新觀察之首次回報(舊版Safari對0尺寸之新觀察不回報)
    let ev = evem()
    let core = createCore(ev, opt, () => {
        reobserve()
        updateWaiting()
    })

    //ele, timerInline, inlineConn, eleInline, roBorder, roContent
    let ele = null
    let timerInline = null
    let inlineConn = false //上次判定是否為行內時元素是否在頁面中
    let eleInline = false //目前元素是否曾判定為行內, 換成新節點時歸零
    let roBorder = null
    let roContent = null

    //observe, 同時觀察border-box與content-box: 比較用之offsetWidth即border-box, 只觀察content-box會漏掉只改padding或border之變化; content-box則使捲軸出現或消失時clientWidth保持最新, 且getSize依內容區量測時只改padding之變化亦會回報
    let observe = () => {
        roBorder.observe(ele, { box: 'border-box' })
        roContent.observe(ele)
    }

    //reobserve, 重新觀察目前元素: 新建之觀察於下一幀回報一次, 供延後發出被略過後重新比較
    //  須先unobserve: 瀏覽器對已以同一盒觀察之元素再observe直接返回, 不重建觀察(Chromium實測)
    let reobserve = () => {
        if (core.isCleared() || !ele) {
            return
        }
        roBorder.unobserve(ele)
        roContent.unobserve(ele)
        observe()
    }

    //syncInline, 非替換之行內元素ResizeObserver不回報(規範明定), 取得之元素為display:inline時改以定期量測, 不為inline時停止
    //  元素自身隱藏(display:none, 如v-show)時看不出顯示後之型別: 曾判定為行內者持續定期量測, 否則顯示時ResizeObserver會回報; 不在頁面中時display為空字串, 停止量測, 待插入頁面時(onDomChange)重判
    let syncInline = () => {
        let display = ''
        if (ele) {
            try {
                display = window.getComputedStyle(ele).display
            }
            catch (err) {
                display = ''
            }
        }
        inlineConn = !!(ele && ele.isConnected)
        if (display === 'inline') {
            eleInline = true
        }
        else if (display !== 'none' && display !== '') {
            eleInline = false
        }
        let inline = display === 'inline' || (display === 'none' && eleInline)
        if (inline && timerInline === null) {
            timerInline = setInterval(onResize, timeInterval)
        }
        else if (!inline && timerInline !== null) {
            clearInterval(timerInline)
            timerInline = null
        }
    }

    //retarget, 重新取得元素: 換成新節點時改觀察新節點, 新節點之首次回報由check比較
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
        eleInline = false
        if (ele) {
            observe()
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
    //  元素插入或移出頁面時重判是否為行內: 不在頁面中之元素取不到display而判為非行內(如Vue指令之bind時元素尚未插入, 或行內元素移出後定期量測已停止), 行內元素ResizeObserver又不回報, 不於插入後重判則永不量測
    //  僅於在頁面與否改變時重判, 等待中之其他DOM變動不重複讀取樣式
    let onDomChange = () => {
        retarget()
        if (ele && ele.isConnected !== inlineConn) {
            syncInline()
        }
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

    //refresh, 立即重新取得元素並比較(延後發出), 供比較基準因尺寸以外之原因改變時使用(例如getBase之固定寬度被取消)
    ev.refresh = () => {
        retarget()
        core.check(ele, false)
        syncInline()
        updateWaiting()
    }

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
 * 瀏覽器支援ResizeObserver與MutationObserver時以其偵測(即時且閒置時不耗資源)，否則退回定期輪詢，兩者之比較規則與事件相同：以比較用尺寸(預設offsetWidth、offsetHeight)與比較基準之差超過容許誤差即發出，比較基準預設為上次發出事件時之尺寸，故緩慢之連續小變化累積超過容許誤差亦會發出；尺寸為0(隱藏或移出DOM)不發出，由隱藏恢復顯示時會發出，首次取得非0尺寸時會發出；延後發出(非同步、節流或refresh)時，發出前元素已不被繪製(移出頁面，或自身或祖先為display:none)者不發出，待其再顯示時重新比較(同由隱藏恢復顯示，sold為0、smode兩軸為'larger')，此確認只計算樣式而不讀外框，故元素仍被繪製而尺寸於空檔內縮為0者照發；sync為true時refresh與節流之後續發出仍為延後發出，其量測早於已處理之事件者不發出
 *
 * 元素可取不到、中途消失或重建為新節點：取不到、不在頁面中或尺寸為0時，於DOM變動時重新以f取得元素並改觀察之。行內元素(display:inline)ResizeObserver不回報，該偵測器改以定期量測，元素自身隱藏(display:none，如v-show)期間亦持續，顯示後即可量得；是否為行內於取得元素、ResizeObserver回報、定期量測及元素插入或移出頁面時判定
 *
 * 事件內容：sold為上次判定變化時之量測，snew為本次量測(另含width、height為比較用尺寸)，smode為寬與高相對比較基準之變化方向('larger'、'smaller'或'')，僅該軸之差超過容許誤差時給方向，否則為''，有給getBase者延後發出時依發出當下與使用端尺寸之比較重給，ele為元素；from為'window'之事件無ele，其snew為最新量測，其中視窗尺寸取事件當下之值，其smode寬與高恆為''(視窗事件不代表元素尺寸變化，且最新量測與比較基準之差必在容許誤差內)；視窗事件於最新量測之任一維為0(隱藏、移出頁面、取不到元素、尚未量得尺寸，或寬高其一為0之元素)，或元素當下不被繪製(例如媒體查詢隨視窗改變而隱藏)時不發出，與dom事件之規則一致
 *
 * 已知限制：ResizeObserver模式下，僅屬性變化(如class)使f改指他元素、或Shadow DOM內之節點被替換時不會跟隨，行內元素自取得起即自身為display:none(未曾以行內顯示過)、之後僅以style或class改為顯示者不會開始量測，此類使用端請用mode:'polling'；sync為true時監聽器不得使所監聽元素之尺寸於同一幀內再變，否則瀏覽器回報ResizeObserver loop錯誤；Safari 15.4以前不支援觀察border-box，只改padding或border之變化於該處不會發出
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
 * @param {Function} [opt.getSize=null] 輸入比較用尺寸函數，傳入元素，回傳{width,height}，供依內容區或特定量測方式繪製之使用端(例如圖表依clientWidth扣除padding)，給予時只改padding、元素內出現或消失捲軸等外框不變之變化亦會發出，回傳非數字或拋錯之軸視為0(不發出)，預設null表示使用offsetWidth、offsetHeight
 * @param {Function} [opt.getBase=null] 輸入比較基準函數，回傳使用端目前套用之尺寸{width,height}，該軸非數字(含拋錯)表示該軸不比較(例如固定寬度)，給予時以其取代上次發出事件時之尺寸，故掛載時尺寸已一致者不發出(其後事件之sold於首次判定變化前為0)，由隱藏恢復顯示時若與使用端尺寸相同亦不發出；使用端須於事件內套用新尺寸(getBase之回傳隨之更新)，否則之後每次回報皆判定為變化而發出，預設null
 * @param {Integer} [opt.throttle=0] 輸入節流時間整數，單位毫秒，首次立即發出，其後每throttle毫秒至多發出一次並以最後一次之量測發出(其sold為最後一次判定變化前之量測，可能未曾發出)，clear時取消待發出者，僅作用於元素尺寸之事件(resize與from為'dom'之resizeWithWindow)，視窗事件不節流，預設0表示不節流
 * @returns {Object} 回傳物件，可使用on、refresh與clear函數，on可監聽resize與resizeWithWindow事件，refresh為立即重新量測並比較(延後發出，給throttle時併入節流而至多延後throttle毫秒)，供比較基準因尺寸以外之原因改變時使用，clear為釋放監聽，可於任何時點呼叫(含元素尚未取得)，並取消已排定之事件
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
