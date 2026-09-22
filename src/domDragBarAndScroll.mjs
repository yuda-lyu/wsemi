import get from 'lodash-es/get.js'
import isBoolean from 'lodash-es/isBoolean.js'
import isFunction from 'lodash-es/isFunction.js'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'


/**
 * 前端針對指定panel與bar的DOM元素監聽滾輪與拖曳bar事件
 *
 * 同時只服務一條通道(bar滑鼠、bar觸控、panel觸控)，pressBar與freeBar恆成對，dragBar只出現於兩者之間。bar位於panel之內時，bar上起手之觸控只由bar通道處理，不因冒泡而重複發事件。bar通道發絕對座標，panel觸控通道發經比例縮放之相對位移，兩者語義不同
 *
 * 滑鼠僅主鍵可上鎖；拖出瀏覽器視窗外放開時收不到mouseup，回到視窗內移動時以buttons為0自我解鎖(以`new MouseEvent`合成mousemove時須自行給buttons，其預設值0會被視為已放開)。bar與window之mouseup刻意不判來源與按鍵，作為觸控通道遺失touchend時的最後救援。已上鎖時再按下主鍵視為接手，先替既有之鎖補發freeBar再發pressBar
 *
 * 觸控以起手那一指之identifier鎖定，其餘手指之落下、移動與放開皆不影響本次拖曳，手勢被系統中斷(touchcancel)時只解鎖不定值。起手元素於拖曳途中被移出DOM時(如消費端重繪bar之內容)，瀏覽器不再把後續之touchmove與touchend送達bar，鎖因而殘留；下一次touchstart時以touches驗證起手指是否仍在，不在即視為殘鎖，先補發freeBar再重新上鎖。事件未帶足觸點資訊時(合成事件)，有identifier者改自touches比對，無identifier者取第一點，無從判斷時一律採解鎖側
 *
 * 呼叫端須自備樣式：bar需`user-select:none`避免拖曳時選取文字，觸控場景另需`touch-action`避免瀏覽器接手捲動。拖曳期間勿重繪或移除bar內之元素，起手元素一旦脫離DOM，當次觸控拖曳即中斷(下一次觸控會自行復原)
 *
 * 已知限制：同一panel掛兩個實例時一次滾輪會各發一次scrollPanel；單指輕點bar時瀏覽器另會補發相容滑鼠事件，故pressBar與freeBar各發兩次；拖曳中呼叫clear只停止而不補發freeBar
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragBarAndScroll.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} panel 輸入panel元素
 * @param {HTMLElement} bar 輸入bar元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.getHeighRatio=()=>1] 輸入取得高度比例函數，因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前heighRatio，預設()=>1
 * @param {Function} [opt.getWidthRatio=()=>1] 輸入取得寬度比例函數，因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前widthRatio，預設()=>1
 * @param {Boolean} [opt.stopScrollPropagationForPanel=false] 輸入是否停用滑鼠捲動事件向上傳遞布林值，預設false
 * @param {Boolean} [opt.stopTouchDragPropagationForPanel=false] 輸入是否停用手機拖曳事件向上傳遞布林值，預設false
 * @param {Boolean} [opt.useTouchDragForPanel=true] 輸入是否使用手機拖曳事件布林值，預設true
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽scrollPanel、pressBar、dragBar、freeBar事件，clear為釋放監聽。scrollPanel帶{ratioY,ratioX}為該軸之滾動方向(1、-1或0)，pressBar與dragBar帶{clientY,clientX}，freeBar不帶參數
 * @example
 * need test in browser
 *
 * //監聽dom
 * let divPanel = document.querySelector('#id_panel')
 * let divBar = document.querySelector('#id_bar')
 * let getHeighRatio = () => 0.9
 * let das = domDragBarAndScroll(divPanel, divBar, { getHeighRatio, stopScrollPropagationForPanel: true, stopTouchDragPropagationForPanel: true })
 * das.on('scrollPanel', () => {})
 * das.on('pressBar', () => {})
 * das.on('dragBar', () => {})
 * das.on('freeBar', () => {})
 *
 * //釋放監聽
 * das.clear()
 *
 */
function domDragBarAndScroll(panel, bar, opt = {}) {

    //getHeighRatio, 因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前heighRatio
    let getHeighRatio = get(opt, 'getHeighRatio', null)
    if (!isFunction(getHeighRatio)) {
        getHeighRatio = () => 1
    }

    //getWidthRatio, 因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前widthRatio
    let getWidthRatio = get(opt, 'getWidthRatio', null)
    if (!isFunction(getWidthRatio)) {
        getWidthRatio = () => 1
    }

    //stopScrollPropagationForPanel
    let stopScrollPropagationForPanel = get(opt, 'stopScrollPropagationForPanel', null)
    if (!isBoolean(stopScrollPropagationForPanel)) {
        stopScrollPropagationForPanel = false
    }

    //stopTouchDragPropagationForPanel
    let stopTouchDragPropagationForPanel = get(opt, 'stopTouchDragPropagationForPanel', null)
    if (!isBoolean(stopTouchDragPropagationForPanel)) {
        stopTouchDragPropagationForPanel = false
    }

    //useTouchDragForPanel
    let useTouchDragForPanel = get(opt, 'useTouchDragForPanel', null)
    if (!isBoolean(useTouchDragForPanel)) {
        useTouchDragForPanel = true
    }

    //ele
    let elePanel = panel
    let eleBar = bar

    //ev
    let ev = evem()

    //pressFrom, 目前上鎖之通道, 為'barMouse'、'barTouch'、'panelTouch'之一, 未上鎖時為''
    let pressFrom = ''

    //pressTouchId, 觸控通道之起手指identifier; 滑鼠通道, 或起手事件未帶identifier時為null
    let pressTouchId = null

    //listeners, 已掛上之監聽, clear時逐一移除, 使掛上與移除天然成對
    let listeners = []

    //evBarTouchstart, bar通道最近一次收到之touchstart事件, 供panel通道辨識冒泡上來之同一事件
    let evBarTouchstart = null

    //isLocked
    function isLocked() {
        return pressFrom !== ''
    }

    //lock, 上鎖之唯一寫法, 全部狀態成套設定
    function lock(from, id) {
        pressFrom = from
        pressTouchId = (id === undefined) ? null : id
    }

    //unlock, 解鎖之唯一寫法, 全部狀態成套歸零
    //  解鎖規則若手寫於各處, 任一處漏改即造成狀態殘留(如觸控起手後被mouseup打斷, 殘留之identifier會讓滑鼠通道永久失效)
    function unlock() {
        pressFrom = ''
        pressTouchId = null
    }

    //press, 上鎖並發pressBar之唯一寫法
    //  已上鎖時為接手既有之鎖, 先替該鎖補發freeBar, 使pressBar與freeBar恆成對; 狀態一律先於emit異動, 監聽器拋錯時才不會留下半套狀態
    function press(from, id, msg) {
        let taken = isLocked()
        lock(from, id)
        if (taken) {
            ev.emit('freeBar')

            //check, freeBar之監聽器內呼叫clear時已解鎖, 不得再發pressBar
            if (!isLocked()) {
                return
            }

        }
        ev.emit('pressBar', msg)
    }

    //free, 解鎖並發freeBar之唯一寫法
    function free() {
        unlock()
        ev.emit('freeBar')
    }

    //listen, 掛監聽之唯一寫法, 同步記錄供clear移除
    function listen(target, type, fun, options) {
        target.addEventListener(type, fun, options)
        listeners.push({ target, type, fun })
    }

    //getSign, 取滾動方向; 不可用delta/Math.abs(delta), 一般滑鼠滾輪之deltaX恆為0, 該式會得NaN
    function getSign(v) {
        if (v > 0) {
            return 1
        }
        if (v < 0) {
            return -1
        }
        return 0
    }

    //getTouches, 取事件內指定之觸點清單, 無該清單或清單為空時回null
    function getTouches(e, key) {
        let ts = get(e, key, null)
        if (!ts || !(ts.length > 0)) {
            return null
        }
        return ts
    }

    //findTouch, 自觸點清單取指定identifier者, 無則回null
    function findTouch(ts, id) {
        for (let i = 0; i < ts.length; i++) {
            let t = ts[i]
            if (t && t.identifier === id) {
                return t
            }
        }
        return null
    }

    //getTouchNew, 取本次新落下之觸點, 無則回null
    //  changedTouches為本次變動者, touches為當前全部接觸點, 故起手須取前者; 合成事件可能只帶touches, 此時退而取之
    function getTouchNew(e) {
        let ts = getTouches(e, 'changedTouches')
        if (ts === null) {
            ts = getTouches(e, 'touches')
        }
        if (ts === null) {
            return null
        }
        return ts[0] || null
    }

    //getTouchOwn, 取起手那一指, 本次事件與該指無關時回null
    //  changedTouches有內容時只認它, 不可再退至touches, 否則他指移動時會以起手指之舊座標重複發dragBar
    function getTouchOwn(e) {
        let ts = getTouches(e, 'changedTouches')
        if (ts === null) {
            ts = getTouches(e, 'touches')
        }
        if (ts === null) {
            return null
        }

        //起手事件未帶identifier時無從比對, 沿用取第一點之行為
        if (pressTouchId === null) {
            return ts[0] || null
        }

        return findTouch(ts, pressTouchId)
    }

    //isTouchOwnReleased, 本次touchend或touchcancel是否為起手指放開或被取消
    function isTouchOwnReleased(e) {

        //起手事件未帶identifier時無從比對, 沿用任一touchend皆解鎖之行為
        if (pressTouchId === null) {
            return true
        }

        //changedTouches為本次放開或被取消者
        let ts = getTouches(e, 'changedTouches')
        if (ts !== null) {
            return findTouch(ts, pressTouchId) !== null
        }

        //合成事件可能只帶touches(仍在接觸者), 起手指不在其中即已放開
        ts = getTouches(e, 'touches')
        if (ts !== null) {
            return findTouch(ts, pressTouchId) === null
        }

        //無任何觸點資訊時採安全側, 寧可解鎖也不留殘鎖
        return true
    }

    //isLockAlive, 觸控起手時既有之鎖是否仍有效; 無從證明有效者一律視為殘留, 寧可重新上鎖也不讓觸控就此失效
    //  起手元素於拖曳途中被移出DOM時, 後續之touchmove與touchend不再送達, 鎖即殘留; 若一律忽略已上鎖時之touchstart, 觸控將無法再拖曳
    function isLockAlive(e, t) {

        //滑鼠之鎖無從由觸控事件驗證, 視為有效; 其殘留另由mousemove之buttons、mouseup與再次mousedown處理
        if (pressFrom === 'barMouse') {
            return true
        }

        //起手事件未帶identifier, 無從比對
        if (pressTouchId === null) {
            return false
        }

        //新落下者與起手指同identifier: 同時接觸之手指其identifier不重複, 故原起手指早已離開(Chrome與Firefox之identifier自0起重用)
        if (t.identifier === pressTouchId) {
            return false
        }

        //touches為當前全部接觸點, 起手指仍在其中才是有效之鎖(iOS之identifier不重用, 須靠此判定)
        let ts = getTouches(e, 'touches')
        if (ts === null) {
            return false
        }
        return findTouch(ts, pressTouchId) !== null
    }

    //addMouseChannel, bar之滑鼠通道
    function addMouseChannel() {

        //mousedown
        listen(eleBar, 'mousedown', (e) => {

            //check, 只處理主鍵, 中鍵與右鍵不得上鎖; 以'button' in e判定使無button屬性之合成事件維持原本可上鎖之行為
            if ('button' in e && e.button !== 0) {
                return
            }

            //press, 已上鎖時亦接手: 滑鼠之鎖此時必為殘留(mouseup遺失且其間無mousemove), 觸控之鎖則以滑鼠為其救援通道
            press('barMouse', null, { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 上鎖與紀錄點擊y座標

        })

        //mouseup, 可由window之mouseup自動解鎖, 不過若嵌入panel有攔截mouseup事件(例如popup)會導致外面window收不到mouseup事件, 故bar的mouseup事件仍需要監聽處理解鎖行為
        //  刻意不判來源與按鍵: 此為觸控通道遺失touchend時的最後救援, 與split.js、MUI之終止側作法一致
        listen(eleBar, 'mouseup', () => {
            if (isLocked()) {
                free() //窄版bar, 解鎖
            }
        })

        //mousemove
        listen(window, 'mousemove', (e) => {

            //check, 僅服務滑鼠通道; 觸控上鎖時不得以絕對座標發dragBar, 否則會污染panel通道之縮放座標語義
            if (pressFrom !== 'barMouse') {
                return
            }

            //check, 拖出瀏覽器視窗外放開時收不到mouseup, 回到視窗內移動時以buttons為0自我解鎖
            if (e.buttons === 0) {
                free()
                return
            }

            //emit
            ev.emit('dragBar', { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 用鎖與滑動距離拖曳bar

        })

        //mouseup, 刻意不判來源與按鍵, 理由同bar之mouseup
        listen(window, 'mouseup', (e) => {
            if (!isLocked()) {
                return
            }

            //cancel, 須先於emit, 否則監聽器拋錯時本行不會執行而漏擋
            if (stopScrollPropagationForPanel) {
                domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
            }

            free() //寬版bar, 解鎖

        })

    }

    //addWheelChannel, panel之滾輪通道
    //  window與document之scroll與wheel不掛監聽: 曾嘗試於上鎖時取消該二者, 以避免手機拖曳觸底時連帶捲動外層頁面, 但其於該處無法取消(cancelable=false), 即便使用passive=false亦然
    //  且Chrome對掛於window與document之wheel監聽預設視為passive以加速捲動, 明確給passive:false反會放棄該處理
    function addWheelChannel() {
        listen(elePanel, 'wheel', (e) => {

            //cancel, 須先於emit, 否則監聽器拋錯時本行不會執行而漏擋
            if (stopScrollPropagationForPanel) {
                domCancelEvent(e) //要禁止外部元素如body被滑鼠捲動
            }

            //emit
            ev.emit('scrollPanel', { ratioY: getSign(e.deltaY), ratioX: getSign(e.deltaX) }) //寬版頁面, 用滾輪上下捲動, 實際是傳移動方向給bar

        })
    }

    //addTouchChannel, bar與panel之觸控通道除元素、座標語義與擋預設行為之時機外規則完全相同, 故共用同一組處理器, 每條規則只寫一處
    function addTouchChannel(ele, from, getMsg, cancel) {

        //touchstart
        listen(ele, 'touchstart', (e) => {

            //check, bar上起手之觸控只由bar通道處理; bar位於panel之內, bar上之touchstart會冒泡至panel, 若不擋則同一次觸控會發兩次pressBar且第二次為縮放座標
            //  不可改以「已上鎖即忽略」判定: identifier重用時, 冒泡上來之同一事件與殘鎖後之新觸控無從區分
            if (from === 'barTouch') {
                evBarTouchstart = e
            }
            else if (e === evBarTouchstart) {
                evBarTouchstart = null
                return
            }

            //t, 無觸點時忽略, 不可直接取用而拋錯
            let t = getTouchNew(e)
            if (t === null) {
                return
            }

            //check, 已上鎖且該鎖仍有效者為他指落下, 不得重新定錨; 該鎖為殘留者則由press接手
            if (isLocked() && isLockAlive(e, t)) {
                return
            }

            //cancel, 須先於getMsg與emit, 否則比例函數或監聽器拋錯時本行不會執行而漏擋
            if (cancel.start) {
                domCancelEvent(e)
            }

            //press
            press(from, t.identifier, getMsg(t))

        })

        //touchmove
        listen(ele, 'touchmove', (e) => {

            //check, 通道互斥須為顯式判定, 不可依賴domCancelEvent之stopPropagation副作用(事件不可取消時該副作用不會發生)
            if (pressFrom !== from) {
                return
            }

            //cancel, 須先於起手指判定與emit, 否則他指移動或監聽器拋錯時本行不會執行, 拖曳期間頁面即可被捲動
            if (cancel.move) {
                domCancelEvent(e) //要禁止外部元素如body被拖曳移動畫面
            }

            //t, 非起手指之移動不得搶值
            let t = getTouchOwn(e)
            if (t === null) {
                return
            }

            //emit
            ev.emit('dragBar', getMsg(t))

        }, { passive: false }) //必須使用passive=false否則無法cancel

        //touchend與touchcancel共用, 兩者皆只解鎖不定值; touchcancel為手勢被系統中斷(如瀏覽器接手捲動、長按選單), 其座標不可信
        //  touchcancel依規範不可取消, domCancelEvent對其無作用
        let funTouchend = (e) => {

            //check
            if (pressFrom !== from) {
                return
            }

            //check, 非起手指放開或被取消不終止本次拖曳
            if (!isTouchOwnReleased(e)) {
                return
            }

            //cancel
            if (cancel.end) {
                domCancelEvent(e)
            }

            free()

        }
        listen(ele, 'touchend', funTouchend)
        listen(ele, 'touchcancel', funTouchend)

    }

    function add() {

        //addMouseChannel
        addMouseChannel()

        //addWheelChannel
        addWheelChannel()

        //addTouchChannel, 窄版bar, 發絕對座標; 拖曳期間一律禁止頁面被拖曳捲動, touchstart與touchend不擋, 否則輕點bar後瀏覽器不再產生click
        addTouchChannel(eleBar, 'barTouch', (t) => {
            return { clientY: t.clientY, clientX: t.clientX }
        }, { start: false, move: true, end: false })

        //addTouchChannel, 窄版頁面, 用滑動距離拖曳頁面, 實際是傳移動距離給bar, 僅取起手觸擊點座標, 另需被heighRatio與widthRatio修正比例
        //  是否擋預設行為由旗標控制, 因擋下會導致無法左右拖曳元素(開啟overflow-x:auto者無法使用)
        //  停用時不掛監聽, 避免panel平白多一個passive:false之touchmove監聽
        if (useTouchDragForPanel) {
            let b = stopTouchDragPropagationForPanel
            addTouchChannel(elePanel, 'panelTouch', (t) => {
                return { clientY: -t.clientY * getHeighRatio(), clientX: -t.clientX * getWidthRatio() }
            }, { start: b, move: b, end: b })
        }

    }

    function clear() {

        //unlock, 釋放監聽時一併歸零狀態; 拖曳中呼叫時只停止, 不補發freeBar
        unlock()
        evBarTouchstart = null

        //removeEventListener
        for (let l of listeners) {
            l.target.removeEventListener(l.type, l.fun)
        }
        listeners = []

    }

    //add
    add()

    //save
    ev.clear = clear

    return ev
}


export default domDragBarAndScroll
