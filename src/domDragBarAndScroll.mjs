import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'
import domDragPointer from './domDragPointer.mjs'


/**
 * 前端針對指定panel與bar的DOM元素監聽滾輪與拖曳bar事件
 *
 * 指標之按下、拖曳與放開全部交由domDragPointer(Pointer Events單一模型，滑鼠、觸控、觸控筆同一套規則)處理，本函數只負責通道判定、座標語義與滾輪。同時只服務一條通道(bar、panel觸控)，pressBar與freeBar恆成對，dragBar只出現於兩者之間。原語同時掛於bar與panel(bar位於panel之內時冒泡上來之同一事件只處理一次，bar不在panel內亦可運作)；通道於按下當下依target決定並記住：bar內起手者為bar通道(任何指標)，其餘為panel觸控通道(僅觸控與觸控筆，滑鼠不進入，且需useTouchDragForPanel)。bar通道發絕對座標，panel觸控通道發經比例縮放之相對位移，兩者語義不同
 *
 * 滑鼠僅主鍵可起手；拖曳中接觸位元消失即解鎖(拖出瀏覽器視窗外放開者回到視窗內移動時自癒)，已按住主鍵再按下或放開其他鍵不影響拖曳(但會多發座標相同之dragBar)。已上鎖時滑鼠再按下主鍵視為接手，先替既有之鎖補發freeBar再發pressBar。觸控以起手指之pointerId鎖定，其餘手指之落下、移動與放開皆不影響本次拖曳，手勢被系統中斷(pointercancel，如瀏覽器接手捲動、拖曳中啟動原生拖放)時只解鎖不定值；起手元素於拖曳途中被移出DOM時瀏覽器會改派事件給指標下之元素，故不會殘鎖，殘鎖之復原規則見domDragPointer
 *
 * 呼叫端須自備樣式：bar需`user-select:none`避免拖曳時選取文字，觸控場景另需`touch-action:none`避免瀏覽器接手捲動(此為契約)；未設者由本函數於bar通道上鎖時取消bar之touchmove保住手勢，此為Chromium實測可行之退路而非跨瀏覽器保證。panel觸控通道覆蓋呼叫端之任意內容，不保證不選字；panel通道未以stopTouchDragPropagationForPanel擋下捲動時，瀏覽器接手捲動即以pointercancel結束該次拖曳(touch事件模型下捲動與拖曳會並行)。觸控或觸控筆拖曳中另抑制bar與panel之contextmenu
 *
 * 已知限制：同一panel掛兩個實例時一次滾輪會各發一次scrollPanel；拖曳中呼叫clear只停止而不補發freeBar；和弦按鍵之限制與瀏覽器支援範圍見domDragPointer
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
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽scrollPanel、pressBar、dragBar、freeBar事件，clear為釋放監聽。scrollPanel帶{ratioY,ratioX}為該軸之滾動方向(1、-1或0)，pressBar與dragBar帶{clientY,clientX,pointerType}，pointerType為'mouse'、'touch'或'pen'，freeBar不帶參數
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
    if (!isfun(getHeighRatio)) {
        getHeighRatio = () => 1
    }

    //getWidthRatio, 因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前widthRatio
    let getWidthRatio = get(opt, 'getWidthRatio', null)
    if (!isfun(getWidthRatio)) {
        getWidthRatio = () => 1
    }

    //stopScrollPropagationForPanel
    let stopScrollPropagationForPanel = get(opt, 'stopScrollPropagationForPanel', null)
    if (!isbol(stopScrollPropagationForPanel)) {
        stopScrollPropagationForPanel = false
    }

    //stopTouchDragPropagationForPanel
    let stopTouchDragPropagationForPanel = get(opt, 'stopTouchDragPropagationForPanel', null)
    if (!isbol(stopTouchDragPropagationForPanel)) {
        stopTouchDragPropagationForPanel = false
    }

    //useTouchDragForPanel
    let useTouchDragForPanel = get(opt, 'useTouchDragForPanel', null)
    if (!isbol(useTouchDragForPanel)) {
        useTouchDragForPanel = true
    }

    //ele
    let elePanel = panel
    let eleBar = bar

    //ev
    let ev = evem()

    //pressFrom, 目前上鎖之通道, 為'bar'、'panel'之一, 未上鎖時為''; 於press當下依target決定並記住, 拖曳中target會變故不可重判
    let pressFrom = ''

    //pendings, 旗標墊片之待辦: pointer事件早於其相容之touch與mouse事件(Chromium實測與規範一致), 故於pointer事件內記下, 由緊接之相容事件消費
    //  觸控之相容touch事件緊接各pointer事件; 滑鼠與觸控筆之相容mouseup緊接pointerup; 觸控之相容mouse事件只於輕點時於touchend後補發且當時已解鎖
    //  故touch待辦只對觸控設定、mouseup待辦只對非觸控設定, 否則待辦無人消費而誤擋下一次事件
    let pendings = { touchstart: false, touchend: false, mouseup: false }

    //listeners, 本函數自掛之監聽(不含原語內部者), clear時逐一移除
    let listeners = []

    //listen
    function listen(target, type, fun, options) {
        target.addEventListener(type, fun, options)
        listeners.push({ target, type, fun, options })
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

    //isMouse, 事件未帶pointerType(合成事件)時視為滑鼠, 與原語一致
    function isMouse(e) {
        let t = get(e, 'pointerType', '')
        return t !== 'touch' && t !== 'pen'
    }

    //inBar, 事件之target是否位於bar內(含bar自身)
    function inBar(e) {
        let t = get(e, 'target', null)
        if (!t) {
            return false
        }
        if (t === eleBar) {
            return true
        }
        return isfun(eleBar.contains) && eleBar.contains(t)
    }

    //getMsg, bar通道發絕對座標; panel通道發縮放座標, 用滑動距離拖曳頁面, 實際是傳移動距離給bar, 另需被heighRatio與widthRatio修正比例
    function getMsg(msg) {
        if (pressFrom === 'bar') {
            return { clientY: msg.clientY, clientX: msg.clientX, pointerType: msg.pointerType }
        }
        return { clientY: -msg.clientY * getHeighRatio(), clientX: -msg.clientX * getWidthRatio(), pointerType: msg.pointerType }
    }

    //dp, 單一原語實例掛於bar與panel, 鎖只有一把; canPress只是述詞, 通道於press處理器內依target決定
    //  eleTouchMove: 非被動之touchmove監聽恆掛於bar(與舊模型相同), panel通道啟用時另掛於panel(與舊模型相同); 停用時panel不得平白多一個scroll-blocking監聽
    //  cancelTouchMove: bar通道恆取消(使觸控拖曳期間頁面不被捲動), panel通道依旗標(擋下會導致無法左右拖曳元素, 開啟overflow-x:auto者無法使用)
    let dp = domDragPointer([eleBar, elePanel], {
        canPress: (e) => {

            //bar通道, 任何指標
            if (inBar(e)) {
                return true
            }

            //panel通道, 僅觸控與觸控筆, 且需啟用
            if (!useTouchDragForPanel) {
                return false
            }
            if (isMouse(e)) {
                return false
            }
            return true

        },
        eleTouchMove: useTouchDragForPanel ? [eleBar, elePanel] : eleBar,
        cancelTouchMove: () => {
            if (pressFrom === 'bar') {
                return true
            }
            if (pressFrom === 'panel') {
                return stopTouchDragPropagationForPanel
            }
            return false
        },
    })

    //press
    dp.on('press', (msg) => {

        //pressFrom
        pressFrom = inBar(msg.event) ? 'bar' : 'panel'

        //pendings, 全部重設, 再依通道、型別與旗標設定
        pendings.touchstart = (pressFrom === 'panel' && stopTouchDragPropagationForPanel && msg.pointerType === 'touch')
        pendings.touchend = false
        pendings.mouseup = false

        //emit
        ev.emit('pressBar', getMsg(msg))

    })

    //drag
    dp.on('drag', (msg) => {
        ev.emit('dragBar', getMsg(msg))
    })

    //free
    dp.on('free', (msg) => {

        //from
        let from = pressFrom
        pressFrom = ''

        //pendings, 僅由放開或取消事件解鎖時才設定(接手、自癒不設), 由緊接之相容事件消費
        let isRelease = (msg.reason === 'up' || msg.reason === 'cancel')
        pendings.touchstart = false
        pendings.touchend = (from === 'panel' && stopTouchDragPropagationForPanel && isRelease && msg.pointerType === 'touch')
        pendings.mouseup = (from !== '' && stopScrollPropagationForPanel && isRelease && msg.pointerType !== 'touch')

        //emit
        ev.emit('freeBar')

    })

    function add() {

        //touch墊片(panel), 僅旗標為true時掛: panel通道以觸控起手與放開(或被取消)時取消其touchstart與touchend(或touchcancel), 使其不向上傳遞
        if (useTouchDragForPanel && stopTouchDragPropagationForPanel) {
            listen(elePanel, 'touchstart', (e) => {
                if (pendings.touchstart) {
                    pendings.touchstart = false
                    domCancelEvent(e)
                }
            })
            let funTouchend = (e) => {
                if (pendings.touchend) {
                    pendings.touchend = false
                    domCancelEvent(e) //touchcancel依規範不可取消, domCancelEvent對其無作用
                }
            }
            listen(elePanel, 'touchend', funTouchend)
            listen(elePanel, 'touchcancel', funTouchend)
        }

        //mouseup墊片(window), 僅旗標為true時掛; pointerup之preventDefault不會抑制相容之mouseup, 故仍須於mouseup取消
        if (stopScrollPropagationForPanel) {
            listen(window, 'mouseup', (e) => {
                if (pendings.mouseup) {
                    pendings.mouseup = false
                    domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
                }
            })
        }

        //wheel, window與document之scroll與wheel不掛監聽: 該二事件於該處無法取消(cancelable=false), 即便使用passive=false亦然
        listen(elePanel, 'wheel', (e) => {

            //cancel, 須先於emit, 否則監聽器拋錯時本行不會執行而漏擋
            if (stopScrollPropagationForPanel) {
                domCancelEvent(e) //要禁止外部元素如body被滑鼠捲動
            }

            //emit
            ev.emit('scrollPanel', { ratioY: getSign(e.deltaY), ratioX: getSign(e.deltaX) }) //寬版頁面, 用滾輪上下捲動, 實際是傳移動方向給bar

        })

    }

    function clear() {

        //clear, 原語; 拖曳中呼叫時只停止, 不補發freeBar
        dp.clear()

        //reset
        pressFrom = ''
        pendings.touchstart = false
        pendings.touchend = false
        pendings.mouseup = false

        //removeEventListener
        for (let l of listeners) {
            l.target.removeEventListener(l.type, l.fun, l.options)
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
