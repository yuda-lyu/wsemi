import get from 'lodash-es/get.js'
import isNumber from 'lodash-es/isNumber.js'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'


/**
 * 前端針對DOM元素監聽指標(滑鼠、觸控、觸控筆)之按下、拖曳與放開
 *
 * 以Pointer Events單一模型處理滑鼠、觸控與觸控筆，不另掛mouse與touch事件；本函數追蹤的是指標之按下→拖曳→放開，與HTML Drag and Drop無關。pointerdown掛於元素(可給多個元素，子孫冒泡亦算，同一事件經冒泡送達多個元素時只處理一次)，pointermove、pointerup與pointercancel掛於window之capture階段，故指標移出元素或瀏覽器視窗仍持續追蹤，內層元素stopPropagation亦不會漏掉放開。同時只服務一個指標，press與free恆成對，drag只出現於兩者之間；狀態一律先於emit異動，監聽器拋錯時不會留下半套狀態
 *
 * 滑鼠僅主鍵可起手，觸控筆之筆尖與橡皮擦端可起手、按住筆身側鍵接觸(相當於右鍵)不可，合成事件無button屬性者維持可起手。拖曳中以buttons判定接觸是否仍在：接觸位元(筆尖或主鍵為1、橡皮擦端為32)消失即解鎖，故拖出瀏覽器視窗外放開而收不到pointerup者，回到視窗內移動時自我解鎖；已按住主鍵再按下或放開其他鍵不影響拖曳(Pointer Events對和弦按鍵只發pointermove，故會多發座標相同之drag)；以物件模擬之事件未帶buttons者視為仍按住，以`new PointerEvent`合成時須自行給buttons，其預設值0會被視為已放開。已上鎖時滑鼠再按下主鍵視為接手，先替既有之鎖補發free再發press；滑鼠之鎖不被觸控或觸控筆接手，觸控與觸控筆亦不互相接手
 *
 * 觸控以起手指之pointerId與pointerType鎖定，其餘手指之落下、移動與放開皆不影響本次拖曳；手勢被系統中斷(pointercancel，如瀏覽器接手捲動、Android長按選單、拖曳中啟動原生拖放)時只解鎖不定值。起手元素於拖曳途中被移出DOM時，瀏覽器會把後續之pointer事件改派給指標下之元素，window仍收得到，故不會殘鎖(touch事件模型則會)。若仍遺失放開事件，下一次同型別之pointerdown其isPrimary為true(isPrimary依pointerType各自計算)即代表落下時無其他同型指標在場、原指標早已離開，視為殘鎖而先補發free再重新上鎖；isPrimary為false者為他指落下，不得重新定錨；未帶isPrimary之合成事件無從證明有效，一律視為殘鎖。Pointer Events無「當前全部觸點」清單可查，放開事件遺失後若他指先落於元素外、再有手指落於元素(isPrimary為false)，本函數無從判定殘鎖，須待滑鼠接手；此情形於window收取事件之模型下僅合成事件可達
 *
 * 呼叫端須自備樣式：元素需`user-select:none`避免拖曳時選取文字，`touch-action:none`避免瀏覽器接手捲動(此為契約，Pointer Events規範上無法取消原生捲動)，`-webkit-touch-callout:none`避免iOS長按選單。元素未設touch-action者，由本函數於觸控或觸控筆上鎖時取消eleTouchMove之touchmove(非被動監聽)保住手勢，見cancelTouchMove，此為Chromium實測可行之退路而非跨瀏覽器保證；觸控或觸控筆上鎖時另抑制元素之contextmenu(僅非滑鼠來源者)，避免Android長按選單以pointercancel中斷手勢，滑鼠右鍵選單不受影響
 *
 * 本函數不對pointerdown與touchstart呼叫preventDefault亦不stopPropagation，故相容之mousedown、mouseup與click照常發出(輕點後瀏覽器仍產生click)，內層元素可自行stopPropagation pointerdown以排除自己。pointerType未知(合成事件或瀏覽器無法判定裝置)者視為滑鼠
 *
 * 已知限制：拖曳中呼叫clear只停止而不補發free；clear只移除DOM監聽，不移除以on掛上之監聽器；已按住其他鍵時再按下主鍵，瀏覽器只發pointermove不發pointerdown，故無法起手；需瀏覽器支援Pointer Events(Safari與iOS 13以上、Chrome 55以上、Firefox 59以上、IE11)，不支援者收不到事件亦不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragPointer.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement|Array} ele 輸入元素或元素陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.canPress=()=>true] 輸入是否可按下之判斷函數，於每次pointerdown時(含已上鎖時)呼叫一次並帶入事件，回傳false即忽略該次按下，既不上鎖亦不影響既有之鎖，供呼叫端判斷可編輯狀態或排除特定元素，須為純判斷且拖曳中不重新評估，拋錯時不上鎖且錯誤外拋，預設()=>true
 * @param {Boolean|Function} [opt.cancelTouchMove=true] 輸入是否於觸控或觸控筆上鎖時取消eleTouchMove之touchmove事件布林值或函數，函數時帶入事件並回傳布林值，為false時不掛touchmove監聽，預設true
 * @param {HTMLElement|Array} [opt.eleTouchMove=ele] 輸入掛touchmove監聽之元素或元素陣列，預設為ele；把手位於大面板內時可指定把手，使非被動監聽不掛於整個面板而拖慢其內容之觸控捲動，預設ele
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽press、drag、free事件，clear為釋放監聽。press與drag帶{clientX,clientY,pointerType,event}，free帶{pointerType,reason,event}，pointerType為'mouse'、'touch'或'pen'，reason為'up'(放開)、'cancel'(被系統取消)、'buttonsLost'(接觸位元消失之自癒)、'takeover'(被新按下接手)之一，event為觸發之原始事件
 * @example
 * need test in browser
 *
 * //監聽dom
 * let dp = domDragPointer(document.querySelector('#id'), { canPress: () => editable })
 * dp.on('press', (msg) => {})
 * dp.on('drag', (msg) => {})
 * dp.on('free', (msg) => {})
 *
 * //釋放監聽
 * dp.clear()
 *
 */
function domDragPointer(ele, opt = {}) {

    //toEles, 元素或元素陣列轉陣列, 去除無addEventListener者
    function toEles(v) {
        let vs = Array.isArray(v) ? v : [v]
        return vs.filter((e) => e && isfun(e.addEventListener))
    }

    //eles
    let eles = toEles(ele)

    //canPress
    let canPress = get(opt, 'canPress', null)
    if (!isfun(canPress)) {
        canPress = () => true
    }

    //cancelTouchMove, 布林轉函數; false時為null代表不掛監聽
    let cancelTouchMove = get(opt, 'cancelTouchMove', null)
    if (isbol(cancelTouchMove)) {
        cancelTouchMove = cancelTouchMove ? () => true : null
    }
    else if (!isfun(cancelTouchMove)) {
        cancelTouchMove = () => true
    }

    //elesTouchMove
    let elesTouchMove = toEles(get(opt, 'eleTouchMove', null))
    if (elesTouchMove.length === 0) {
        elesTouchMove = eles
    }

    //ev
    let ev = evem()

    //pressType, 目前上鎖之指標型別, 為'mouse'、'touch'、'pen'之一, 未上鎖時為''
    let pressType = ''

    //pressId, 上鎖指標之pointerId; 起手事件未帶pointerId時為null
    let pressId = null

    //lastPointerdown, 最近一次處理之pointerdown事件; 多元素時同一事件經冒泡會送達多個元素, 以物件身分去重
    let lastPointerdown = null

    //listeners, 已掛上之監聽, clear時逐一移除, 使掛上與移除天然成對; options須一併保存, capture階段之監聽移除時須給相同之capture
    let listeners = []

    //isLocked
    function isLocked() {
        return pressType !== ''
    }

    //isTouchLike, 觸控與觸控筆之處置相同(捲動抑制、長按選單、以isPrimary判殘鎖)
    function isTouchLike(type) {
        return type === 'touch' || type === 'pen'
    }

    //getType, 事件未帶pointerType(合成事件)或為空字串(規範: 無法判定裝置)時視為滑鼠
    function getType(e) {
        let t = get(e, 'pointerType', '')
        if (t !== 'touch' && t !== 'pen') {
            t = 'mouse'
        }
        return t
    }

    //getId
    function getId(e) {
        let id = get(e, 'pointerId', null)
        if (id === undefined) {
            id = null
        }
        return id
    }

    //isOwn, 事件是否屬於上鎖之指標; 事件帶有pointerType時型別須相同, 任一方無pointerId時無從比對, 視為同一指標(無資訊採解鎖側, 寧可解鎖也不留殘鎖)
    function isOwn(e) {
        if (('pointerType' in e) && getType(e) !== pressType) {
            return false
        }
        let id = getId(e)
        if (pressId === null || id === null) {
            return true
        }
        return id === pressId
    }

    //isStale, 已上鎖時新落下之同型別指標是否代表既有之鎖為殘留
    function isStale(e) {

        //同pointerId再落下: 同時接觸之指標其id不重複, 故原指標早已離開
        let id = getId(e)
        if (id !== null && pressId !== null && id === pressId) {
            return true
        }

        //isPrimary為true代表落下時無其他同型指標在場, 原指標早已離開; 為false者為他指落下, 不得重新定錨
        let isPrimary = get(e, 'isPrimary', null)
        if (isPrimary === true) {
            return true
        }
        if (isPrimary === false) {
            return false
        }

        //合成事件未帶isPrimary, 無從證明有效者視為殘留, 寧可重新上鎖也不讓指標就此失效
        return true
    }

    //isButtonAllowed, 滑鼠只處理主鍵, 中鍵與右鍵不得起手; 觸控筆之筆尖(0)與橡皮擦端(5)可起手, 按住筆身側鍵接觸(2, 相當於右鍵)不得起手; 觸控之button恆為0
    //  以'button' in e判定使無button屬性之合成事件維持可起手
    function isButtonAllowed(e) {
        if (!('button' in e)) {
            return true
        }
        if (getType(e) === 'pen') {
            return e.button === 0 || e.button === 5
        }
        return e.button === 0
    }

    //isContactLost, 接觸位元(筆尖或主鍵為1、橡皮擦端為32)是否已消失; buttons非數字(合成事件)視為仍按住
    function isContactLost(e) {
        if (!isNumber(e.buttons)) {
            return false
        }
        return (e.buttons & 33) === 0
    }

    //lock, 上鎖之唯一寫法
    function lock(type, id) {
        pressType = type
        pressId = id
    }

    //unlock, 解鎖之唯一寫法, 全部狀態成套歸零
    function unlock() {
        pressType = ''
        pressId = null
    }

    //getMsg
    function getMsg(e) {
        return { clientX: e.clientX, clientY: e.clientY, pointerType: getType(e), event: e }
    }

    //press, 上鎖並發press之唯一寫法
    //  已上鎖時為接手既有之鎖, 先替該鎖補發free, 使press與free恆成對; 狀態一律先於emit異動
    function press(e) {
        let taken = isLocked()
        let prevType = pressType
        lock(getType(e), getId(e))
        if (taken) {
            ev.emit('free', { pointerType: prevType, reason: 'takeover', event: e })

            //check, free之監聽器內呼叫clear時已解鎖, 不得再發press
            if (!isLocked()) {
                return
            }

        }
        ev.emit('press', getMsg(e))
    }

    //free, 解鎖並發free之唯一寫法
    function free(e, reason) {
        let prevType = pressType
        unlock()
        ev.emit('free', { pointerType: prevType, reason, event: e })
    }

    //listen, 掛監聽之唯一寫法, 同步記錄供clear移除
    function listen(target, type, fun, options) {
        target.addEventListener(type, fun, options)
        listeners.push({ target, type, fun, options })
    }

    //funPointerdown
    let funPointerdown = (e) => {

        //check, 同一事件只處理一次
        if (e === lastPointerdown) {
            return
        }
        lastPointerdown = e

        //check
        if (!isButtonAllowed(e)) {
            return
        }

        //check, 呼叫端政策; 於上鎖前評估, 拋錯時不留任何狀態
        if (!canPress(e)) {
            return
        }

        //type
        let type = getType(e)

        //check, 已上鎖時之接手規則
        if (isLocked()) {
            if (type === 'mouse') {
                //滑鼠一律接手: 滑鼠之鎖此時必為殘留(pointerup遺失且其間無pointermove), 觸控之鎖則以滑鼠為其救援通道
            }
            else if (pressType !== type) {
                //觸控或觸控筆不得接手滑鼠或另一型別之鎖
                return
            }
            else if (!isStale(e)) {
                //他指落下不得重新定錨
                return
            }
        }

        //press
        press(e)

    }

    //funPointermove
    let funPointermove = (e) => {

        //check
        if (!isLocked()) {
            return
        }

        //check, 非上鎖指標之移動不得搶值
        if (!isOwn(e)) {
            return
        }

        //check, 接觸位元消失即自我解鎖: 拖出瀏覽器視窗外放開時收不到pointerup, 回到視窗內移動時解鎖; 主鍵已放而其他鍵仍按住時亦解鎖
        if (isContactLost(e)) {
            free(e, 'buttonsLost')
            return
        }

        //emit
        ev.emit('drag', getMsg(e))

    }

    //funPointerup, 與pointercancel共用, 兩者皆只解鎖不定值; pointercancel為手勢被系統中斷, 其座標不可信
    let funPointerup = (e) => {

        //check
        if (!isLocked()) {
            return
        }

        //check, 非上鎖指標之放開或取消不終止本次拖曳
        if (!isOwn(e)) {
            return
        }

        free(e, (get(e, 'type', '') === 'pointercancel') ? 'cancel' : 'up')

    }

    //funTouchmove, 捲動抑制墊片, 不含任何狀態邏輯; 非touch類上鎖時不擋, 否則元素上起手之一般頁面捲動會失效
    let funTouchmove = (e) => {
        if (!isTouchLike(pressType)) {
            return
        }
        if (!cancelTouchMove(e)) {
            return
        }
        domCancelEvent(e) //事件不可取消(瀏覽器已開始捲動)時其內直接跳出
    }

    //funContextmenu, 僅於觸控或觸控筆上鎖時抑制長按選單, 且事件自述為滑鼠來源者不抑制(contextmenu於現代瀏覽器為PointerEvent, 帶pointerType);
    //  contextmenu為獨立事件, 抑制它不會連帶抑制mousedown/mouseup與click
    let funContextmenu = (e) => {
        if (!isTouchLike(pressType)) {
            return
        }
        if (get(e, 'pointerType', '') === 'mouse') {
            return
        }
        e.preventDefault()
    }

    function add() {

        //eles
        for (let el of eles) {
            listen(el, 'pointerdown', funPointerdown)
            listen(el, 'contextmenu', funContextmenu)
        }

        //elesTouchMove
        if (cancelTouchMove !== null) {
            for (let el of elesTouchMove) {
                listen(el, 'touchmove', funTouchmove, { passive: false }) //必須使用passive=false否則無法cancel
            }
        }

        //window, capture階段: 內層元素stopPropagation時仍收得到, 不需於元素另掛pointerup當救援
        listen(window, 'pointermove', funPointermove, { capture: true })
        listen(window, 'pointerup', funPointerup, { capture: true })
        listen(window, 'pointercancel', funPointerup, { capture: true })

    }

    function clear() {

        //unlock, 釋放監聽時一併歸零狀態; 拖曳中呼叫時只停止, 不補發free
        unlock()
        lastPointerdown = null

        //removeEventListener, 須帶相同之options, 否則capture階段之監聽永遠移不掉
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


export default domDragPointer
