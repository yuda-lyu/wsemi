import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import sortBy from 'lodash-es/sortBy.js'
import genID from './genID.mjs'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import replace from './replace.mjs'
import haskey from './haskey.mjs'
import optVal from './_optVal.mjs'
import domFadeIn from './domFadeIn.mjs'
import domFadeOut from './domFadeOut.mjs'


//kpIcon
let iconSuccess = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 426.667 426.667" style="width:24px; height:24px; enable-background:new 0 0 426.667 426.667" xml:space="preserve"><path style="fill:#6ac259" d="M213.333,0C95.518,0,0,95.514,0,213.333s95.518,213.333,213.333,213.333  c117.828,0,213.333-95.514,213.333-213.333S331.157,0,213.333,0z M174.199,322.918l-93.935-93.931l31.309-31.309l62.626,62.622 l140.894-140.898l31.309,31.309L174.199,322.918z"/></svg>`
let iconError = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 496.158 496.158" style="width:24px; height:24px; enable-background:new 0 0 496.158 496.158" xml:space="preserve"><path style="fill:#e04f5f" d="M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085  c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z"/><path style="fill:#fff" d="M277.042,248.082l72.528-84.196c7.91-9.182,6.876-23.041-2.31-30.951  c-9.172-7.904-23.032-6.876-30.947,2.306l-68.236,79.212l-68.229-79.212c-7.91-9.188-21.771-10.216-30.954-2.306  c-9.186,7.91-10.214,21.77-2.304,30.951l72.522,84.196l-72.522,84.192c-7.91,9.182-6.882,23.041,2.304,30.951  c4.143,3.569,9.241,5.318,14.316,5.318c6.161,0,12.294-2.586,16.638-7.624l68.229-79.212l68.236,79.212  c4.338,5.041,10.47,7.624,16.637,7.624c5.069,0,10.168-1.749,14.311-5.318c9.186-7.91,10.22-21.77,2.31-30.951L277.042,248.082z"/></svg>`
let iconWarning = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 497.472 497.472" style="width:24px; height:24px; enable-background:new 0 0 497.472 497.472" xml:space="preserve"><g transform="matrix(1.25 0 0 -1.25 0 45)"><path style="fill:#ffcc4d" d="M24.374-357.857c-20.958,0-30.197,15.223-20.548,33.826L181.421,17.928     c9.648,18.603,25.463,18.603,35.123,0L394.14-324.031c9.671-18.603,0.421-33.826-20.548-33.826H24.374z"/><path style="fill:#231f20" d="M173.605-80.922c0,14.814,10.934,23.984,25.395,23.984c14.12,0,25.407-9.512,25.407-23.984 V-216.75c0-14.461-11.287-23.984-25.407-23.984c-14.461,0-25.395,9.182-25.395,23.984V-80.922z M171.489-289.056 c0,15.167,12.345,27.511,27.511,27.511c15.167,0,27.523-12.345,27.523-27.511c0-15.178-12.356-27.523-27.523-27.523 C183.834-316.579,171.489-304.234,171.489-289.056"/></g></svg>`
let iconInfor = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 496.16 496.16" style="width:24px; height:24px; enable-background:new 0 0 496.158 496.158;" xml:space="preserve"><path d="m496.16 248.08c0-137.02-111.07-248.08-248.08-248.08-137.01 0-248.08 111.06-248.08 248.08 0 137 111.07 248.07 248.08 248.07 137.01 0 248.08-111.07 248.08-248.07z" fill="#25B7D3"/><g fill="#fff"><path d="m315.25 359.56c-1.387-2.032-4.048-2.755-6.27-1.702-24.582 11.637-52.482 23.94-57.958 25.015-0.138-0.123-0.357-0.348-0.644-0.737-0.742-1.005-1.103-2.318-1.103-4.015 0-13.905 10.495-56.205 31.192-125.72 17.451-58.406 19.469-70.499 19.469-74.514 0-6.198-2.373-11.435-6.865-15.146-4.267-3.519-10.229-5.302-17.719-5.302-12.459 0-26.899 4.73-44.146 14.461-16.713 9.433-35.352 25.41-55.396 47.487-1.569 1.729-1.733 4.314-0.395 6.228 1.34 1.915 3.825 2.644 5.986 1.764 7.037-2.872 42.402-17.359 47.557-20.597 4.221-2.646 7.875-3.989 10.861-3.989 0.107 0 0.199 4e-3 0.276 0.01 0.036 0.198 0.07 0.5 0.07 0.933 0 3.047-0.627 6.654-1.856 10.703-30.136 97.641-44.785 157.5-44.785 182.99 0 8.998 2.501 16.242 7.432 21.528 5.025 5.393 11.803 8.127 20.146 8.127 8.891 0 19.712-3.714 33.08-11.354 12.936-7.392 32.68-23.653 60.363-49.717 1.793-1.687 2.092-4.426 0.705-6.458z"/><path d="m314.28 76.672c-4.925-5.041-11.227-7.597-18.729-7.597-9.34 0-17.475 3.691-24.176 10.971-6.594 7.16-9.938 15.946-9.938 26.113 0 8.033 2.463 14.69 7.32 19.785 4.922 5.172 11.139 7.794 18.476 7.794 8.958 0 17.049-3.898 24.047-11.586 6.876-7.553 10.363-16.433 10.363-26.393 1e-3 -7.654-2.476-14.075-7.363-19.087z"/></g></svg>`
let iconCancel = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 512.001 512.001" style="width:12px; height:12px; enable-background:new 0 0 512.001 512.001;" xml:space="preserve"><g><g><path d="M284.286,256.002L506.143,34.144c7.811-7.811,7.811-20.475,0-28.285c-7.811-7.81-20.475-7.811-28.285,0L256,227.717L34.143,5.859c-7.811-7.811-20.475-7.811-28.285,0c-7.81,7.811-7.811,20.475,0,28.285l221.857,221.857L5.858,477.859c-7.811,7.811-7.811,20.475,0,28.285c3.905,3.905,9.024,5.857,14.143,5.857c5.119,0,10.237-1.952,14.143-5.857L256,284.287l221.857,221.857c3.905,3.905,9.024,5.857,14.143,5.857s10.237-1.952,14.143-5.857c7.811-7.811,7.811-20.475,0-28.285L284.286,256.002z"/></g></g></svg>`
let kpIcon = {
    success: iconSuccess,
    error: iconError,
    warning: iconWarning,
    infor: iconInfor,
    cancel: iconCancel,
}


let q = {} //queue
let timer = null


//opt類數值參數之規則(isenum, R-OPT-VAL-01), 非預期(含NaN、Infinity、'0x10'、包裝物件、非數字)視為未給、改用該欄預設
//time只與經過時間(Date.now之差)比較、不交給原生計時器, 故不設計時器上限; 內寬、邊框寬、圓角為非負; 關閉按鈕平移可為負
let mkRule = (name, chk, defDesc) => ({ fn: 'domAlert', name, kind: 'enum', chk, defDesc })
let RULE_TIME = mkRule('opt.time', { use: 'nonnegative' })
let RULE_BORDER_WIDTH = mkRule('opt.borderWidth', { use: 'nonnegative' })
let RULE_BORDER_RADIUS = mkRule('opt.borderRadius', { use: 'nonnegative' })
let PADDING_DEF = { top: 14, right: 26, bottom: 14, left: 14 }
let RULE_PADDING = {
    top: mkRule('opt.paddingStyle.top', { use: 'nonnegative' }),
    right: mkRule('opt.paddingStyle.right', { use: 'nonnegative' }),
    bottom: mkRule('opt.paddingStyle.bottom', { use: 'nonnegative' }),
    left: mkRule('opt.paddingStyle.left', { use: 'nonnegative' }),
}
//sget, 讀取opt之鍵, 讀取拋錯(拋錯之getter、已撤銷之Proxy)視為未給而回預設(規格§4 V11)
function sget(o, k, d) {
    try {
        return get(o, k, d)
    }
    catch (err) {
        return d
    }
}


//sstyle, 字串型opt去除分號後放入樣式(行為不改: 非字串得空字串); 判型拋錯(如已撤銷之Proxy)亦得空字串
function sstyle(v) {
    try {
        return replace(v, ';', '')
    }
    catch (err) {
        return ''
    }
}


//isOptObj, 設定物件: 非null之物件且非陣列; 不依可由Symbol.toStringTag自訂之標籤(帶自訂標籤之一般物件仍為設定物件, 同修前), 判型拋錯(已撤銷之Proxy)視為false
function isOptObj(v) {
    try {
        return typeof v === 'object' && v !== null && !Array.isArray(v)
    }
    catch (err) {
        return false
    }
}


//sis, 判型, 判型拋錯(如已撤銷之Proxy)視為false
function sis(f, v) {
    try {
        return f(v)
    }
    catch (err) {
        return false
    }
}


let RULE_SHIFT = {
    top: mkRule('opt.closeIconShift.top', undefined, '10 unless opt.closeIconShift.bottom is given'),
    right: mkRule('opt.closeIconShift.right', undefined, '10 unless opt.closeIconShift.left is given'),
    bottom: mkRule('opt.closeIconShift.bottom', undefined, 'none'),
    left: mkRule('opt.closeIconShift.left', undefined, 'none'),
}


function calcItemLocationCore(position) {

    //找同樣postion
    let r = filter(q, { position })

    //依照開始時間排序
    r = sortBy(r, 'timeStart')

    //calc
    let dx = 16
    let dy = 16
    let top = dy
    each(r, (v) => {
        if (!q[v.id].ele) {
            q[v.id].ele = document.querySelector(`#${v.id}`)
        }
        q[v.id].loc.top = top
        q[v.id].loc.height = q[v.id].ele.offsetHeight
        top += q[v.id].loc.height + dy
    })

    //update
    each(r, (v) => {

        //top, bottom
        if (position.indexOf('bottom-') >= 0) {
            q[v.id].ele.style.bottom = `${q[v.id].loc.top}px`
            q[v.id].loc.bottom = q[v.id].loc.top
        }
        else {
            q[v.id].ele.style.top = `${q[v.id].loc.top}px`
            //q[v.id].loc.top = q[v.id].loc.top //不需要儲存至自己
        }

        //left, right
        if (position.indexOf('-left') >= 0) {
            q[v.id].ele.style.left = `${dx}px`
            q[v.id].loc.left = dx
        }
        else {
            q[v.id].ele.style.right = `${dx}px`
            q[v.id].loc.right = dx
        }

        //show
        q[v.id].ele.style.zIndex = 200000
        q[v.id].ele.style.opacity = 1
        q[v.id].ele.style.transform = '' //IE11無法使用null來清除style, 需使用設定為空字串
        q[v.id].ele.style.transform = null

    })

}


function calcItemLocation() {
    let ps = ['top-right', 'top-left', 'bottom-right', 'bottom-left']
    each(ps, (position) => {
        calcItemLocationCore(position)
    })
}


function removeItemByID(id) {

    //check, 已移除者不再處理(時間到與按✕可能先後發生)
    let v = q[id]
    if (!v) {
        return
    }

    //刪除元素
    if (v.ele && v.ele.parentNode) {
        v.ele.parentNode.removeChild(v.ele)
    }

    //刪除佇列內key紀錄
    delete q[id]

    //calcItemLocation
    calcItemLocation()

}


function closeItemByID(id) {

    //check, 已關閉者(時間到或已按過✕)不再處理
    let v = q[id]
    if (!v) {
        return
    }

    //先resolve再移除(同時間到之關閉順序)
    v.pm.resolve()

    //removeItemByID
    removeItemByID(id)

}


function addItem({ id, position, time, pm, ele }) {
    //console.log('addItem', id, position, time)

    //push
    q[id] = {
        id,
        position,
        ele: ele || null,
        loc: {
            height: null,
            top: null,
            bottom: null,
            left: null,
            right: null,
        },
        timeShow: time,
        timeStart: Date.now(),
        pm,
    }

    //calcItemLocation
    calcItemLocation()

    //check
    if (timer !== null) {
        return
    }

    //setInterval
    timer = setInterval(() => {
        //console.log('q', q)

        //detect
        each(q, (v) => {

            //t
            let t = Date.now() - v.timeStart

            //check, 超過指定延時則視為離開
            if (t > v.timeShow) {

                //close, 先resolve再移除
                closeItemByID(v.id)

            }

        })

        //clear, 當無任何訊息存在
        if (!iseobj(q)) {
            clearInterval(timer)
            timer = null
        }

    }, 50) //50ms偵測, 啟動後跑timer, 無佇列則會停止減耗

}


/**
 * 前端彈出訊息視窗
 *
 * 輸入之處置(使用者2026-11-12定):
 * 1. msg須為非空之原始字串(包裝物件new String、不可讀之Proxy等皆無效，規格§3.4 S1)，否則不顯示、回傳已完成(resolved)之Promise(不拋錯亦不reject，呼叫端以fire-and-forget方式呼叫時不會產生未處理之rejection)；
 * 2. opt非物件(含null、陣列、不可讀之Proxy)視為{}(以typeof與Array.isArray判定，帶自訂Symbol.toStringTag之一般物件仍為設定物件)；paddingStyle、closeIconShift同；opt之各鍵讀取拋錯(拋錯之getter、已撤銷之Proxy)視為未給(規格§4 V11)；
 * 3. 數值類opt(time、paddingStyle各鍵、borderWidth、borderRadius、closeIconShift各鍵)逐一以isenum檢查(有限數字或數字字串)，非預期之輸入(含NaN、Infinity、'0x10'、包裝物件、非數字，及time、paddingStyle、borderWidth、borderRadius之負數)視為未給而改用該欄預設，不報錯；
 * 4. paddingStyle部分給鍵時，未給或無效之鍵保留該鍵預設(top:14、right:26、bottom:14、left:14)；closeIconShift部分給鍵時，未給之鍵保留預設(top:10、right:10)，但同軸已給有效值者不再套用另一端之預設(給bottom而未給top時不設top，給left而未給right時不設right)，以免上下或左右同時定位；
 * 5. 關閉: 顯示時間到、或按關閉按鈕(✕)時，皆先resolve回傳之Promise再移除彈窗；關閉按鈕與滑鼠移入移出之淡入淡出以addEventListener綁定，不使用行內事件屬性與全域函數(嚴格CSP下亦可用)；
 * 6. 外框、內寬層與關閉按鈕以createElement建立，msg與圖標以innerHTML插入內寬層內之內容容器，其HTML之解析限於該容器: msg含未閉合之標籤(如'<textarea>abc')時不再吞入其後之關閉按鈕與版面(修前整段一起解析而會)；正常HTML之外觀、位置與修前相同；
 * 7. 需於瀏覽器執行: msg有效而無document(nodejs等)時，建立元素失敗而同步拋出執行環境之錯誤(既有行為，不回Promise)。
 *
 * 安全注意(行為不改): msg與opt.icon以HTML插入彈窗(innerHTML)，字串型opt(textColor、backgroundColor、borderColor、shadowStyle)去除分號後直接放入樣式；不可傳入未經跳脫之外部文字(使用者輸入、伺服器回應等)，純文字請先以htmlEncode跳脫。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAlert.test.mjs Github}
 * @memberOf wsemi
 * @param {String} msg 輸入彈窗訊息字串，可為html(以HTML插入，外部文字須先以htmlEncode跳脫)，須為非空之原始字串，否則不顯示並回傳已完成之Promise
 * @param {Object} [opt={}] 輸入設定物件，非物件(含null)視為{}，預設{}
 * @param {String} [opt.type='success'] 輸入訊息種類字串，可使用'success'、'warning'、'error'，預設'success'
 * @param {String} [opt.icon=''] 輸入圖標字串，可為html(以HTML插入，不可傳未經跳脫之外部文字)，預設依照type給予指定圖標，指定圖標詳見程式碼
 * @param {String} [opt.position='top-right'] 輸入位置字串，可使用'top-right'、'top-left'、'bottom-right'、'bottom-left'，預設'top-right'
 * @param {Number} [opt.time=4000] 輸入顯示時間長度數字，單位為毫秒ms，須為有限且非負之數字(可為字串型數字)，非預期之輸入(含NaN、Infinity、負數、非數字)視為未給而改用預設，預設4000
 * @param {Object} [opt.paddingStyle={top:14,right:26,bottom:14,left:14}] 輸入內寬設定物件，可輸入top、bottom、left、right，單位為px，各鍵須為有限且非負之數字(可為字串型數字)，未給或無效之鍵用該鍵預設，預設{top:14,right:26,bottom:14,left:14}
 * @param {String} [opt.textColor='#000'] 輸入文字顏色字串，直接放入樣式(不可傳未經檢查之外部文字)，預設'#000'
 * @param {String} [opt.backgroundColor='#fff'] 輸入背景顏色字串，直接放入樣式(不可傳未經檢查之外部文字)，預設'#fff'
 * @param {Number} [opt.borderWidth=1] 輸入邊框寬度數字，單位px，須為有限且非負之數字(可為字串型數字)，非預期之輸入改用預設，預設1
 * @param {String} [opt.borderColor='#ebeef5'] 輸入邊框顏色字串，直接放入樣式(不可傳未經檢查之外部文字)，預設'#ebeef5'
 * @param {Number} [opt.borderRadius=8] 輸入邊框圓角數字，單位px，須為有限且非負之數字(可為字串型數字)，非預期之輸入改用預設，預設8
 * @param {String} [opt.shadowStyle='0 2px 12px 0 rgba(0,0,0,.1)'] 輸入陰影樣式字串，直接放入樣式(不可傳未經檢查之外部文字)，預設'0 2px 12px 0 rgba(0,0,0,.1)'
 * @param {Object} [opt.closeIconShift={top:10,right:10}] 輸入關閉按鈕平移距離設定物件，可輸入top、bottom、left、right，單位為px，各鍵須為有限數字(可為負數、字串型數字)，無效之鍵視為未給；未給之鍵保留預設(top:10、right:10)，但給bottom而未給top時不設top、給left而未給right時不設right，預設{top:10,right:10}
 * @param {Boolean} [opt.debug=false] 輸入是否於數值類opt為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve代表彈窗關閉(顯示時間到或按關閉按鈕)，msg無效時回傳已完成之Promise，無reject(無document時之同步拋錯見上方第7點)
 * @example
 * need test in browser
 *
 * domAlert('提示訊息')
 *
 * domAlert('提示訊息', {type:'error'})
 *
 * domAlert('提示訊息', {backgroundColor:'rgba(220,220,220,0.3)'})
 *
 * domAlert(htmlEncode(textFromUser)) //外部文字先跳脫
 *
 */
function domAlert(msg, opt = {}) {

    //check, msg須為非空之原始字串(規格§3.4 S1, 以typeof判定不讀取輸入之任何屬性), 無效不顯示, 回傳已完成之Promise(回傳型別恆為Promise)
    if (typeof msg !== 'string' || msg.length === 0) {
        return Promise.resolve()
    }

    //opt, 非物件(含null、陣列、判型拋錯之已撤銷Proxy)視為{}
    if (!isOptObj(opt)) {
        opt = {}
    }

    //type
    let type = sget(opt, 'type', 'success')
    if (!sis((v) => haskey(kpIcon, v), type)) {
        type = 'success'
    }

    //icon
    let icon = sget(opt, 'icon', null)
    if (sis(isestr, icon)) {
        //若為有效字串, 則優先使用icon
    }
    else {
        //否則由type與kpIcon取得icon
        icon = kpIcon[type]
    }

    //position, 讀取一次
    let position = 'top-right'
    let optPosition = sget(opt, 'position', null)
    if (optPosition === 'top-left' || optPosition === 'bottom-right' || optPosition === 'bottom-left') {
        position = optPosition
    }

    //time, 有限且非負之數字, 非預期(含NaN、Infinity, 原為永不自動關閉)改用預設4000
    let col = optVal.defer() //數值類opt判定時只收集, 全部讀完後才至多讀一次opt.debug(V11)
    let time = col.take(sget(opt, 'time', null), 4000, RULE_TIME)

    //paddingStyle, 物件之各鍵逐一檢查, 未給或無效之鍵用該鍵預設(原為部分給鍵時其餘變0)
    let paddingStyle = sget(opt, 'paddingStyle', null)
    let pad = { ...PADDING_DEF }
    if (isOptObj(paddingStyle)) {
        each(['top', 'right', 'bottom', 'left'], (k) => {
            pad[k] = col.take(sget(paddingStyle, k, null), PADDING_DEF[k], RULE_PADDING[k])
        })
    }

    //usePaddingStyle
    let usePaddingStyle = `padding:${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px;`

    //textColor
    let textColor = sget(opt, 'textColor', '#000')
    textColor = sstyle(textColor)

    //backgroundColor
    let backgroundColor = sget(opt, 'backgroundColor', '#fff')
    backgroundColor = sstyle(backgroundColor)

    //borderWidth
    let borderWidth = col.take(sget(opt, 'borderWidth', null), 1, RULE_BORDER_WIDTH)

    //borderColor
    let borderColor = sget(opt, 'borderColor', '#ebeef5')
    borderColor = sstyle(borderColor)

    //borderRadius
    let borderRadius = col.take(sget(opt, 'borderRadius', null), 8, RULE_BORDER_RADIUS)

    //shadowStyle
    let shadowStyle = sget(opt, 'shadowStyle', '0 2px 12px 0 rgba(0,0,0,.1)')
    shadowStyle = sstyle(shadowStyle)

    //closeIconShift, 各鍵逐一檢查(無效視為未給); 未給之鍵保留預設top:10、right:10, 但同軸已給有效值者不套用另一端之預設
    let closeIconShift = sget(opt, 'closeIconShift', null)
    let shift = { top: null, right: null, bottom: null, left: null }
    if (isOptObj(closeIconShift)) {
        each(['top', 'right', 'bottom', 'left'], (k) => {
            shift[k] = col.take(sget(closeIconShift, k, null), null, RULE_SHIFT[k])
        })
    }
    if (shift.top === null && shift.bottom === null) {
        shift.top = 10
    }
    if (shift.left === null && shift.right === null) {
        shift.right = 10
    }

    //debug警告, 有非預期者才讀opt.debug/funLog一次(讀取拋錯視為未給)
    col.flush(opt)

    //useCloseIconPosition
    let cssShift = (k) => {
        return shift[k] === null ? '' : `${k}:${shift[k]}px;`
    }
    let useCloseIconPosition = `position:absolute; ${cssShift('top')} ${cssShift('right')} ${cssShift('bottom')} ${cssShift('left')}`

    //id
    let id = `alt-${genID()}`
    let idCancel = `alt-${genID()}`

    //panel
    let div = document.createElement('div')
    div.id = id
    div.style.position = 'fixed'
    div.style.transition = 'transform 0.3s, top 0.5s, bottom 0.5s'
    div.style.zIndex = -1 //待恢復至200000
    div.style.opacity = 0.001 //待恢復至1
    if (position.indexOf('-left') >= 0) {
        div.style.transform = 'translateX(-100%)'
    }
    else {
        div.style.transform = 'translateX(100%)'
    }

    //box, 外框, 滑鼠移入移出淡入淡出關閉按鈕(以addEventListener綁定)
    let box = document.createElement('div')
    box.setAttribute('style', `display:inline-block; color:${textColor}; background:${backgroundColor}; border:${borderWidth}px solid ${borderColor}; border-radius:${borderRadius}px; box-shadow:${shadowStyle};`)

    //inner, 內寬, 內容(圖標與訊息)以HTML插入
    let inner = document.createElement('div')
    inner.setAttribute('style', `position:relative; ${usePaddingStyle}`)
    inner.innerHTML = `<div style="display:flex; align-items:center;"><div style="margin-right:10px;"><div style="display:flex;">${icon}</div></div><div>${msg}</div></div>`

    //btnCancel, 關閉按鈕
    let shiftWrap = document.createElement('div')
    shiftWrap.setAttribute('style', useCloseIconPosition)
    let btnCancel = document.createElement('div')
    btnCancel.id = idCancel
    btnCancel.setAttribute('style', 'display:flex; cursor:pointer; opacity:0;')
    btnCancel.innerHTML = iconCancel
    shiftWrap.appendChild(btnCancel)
    inner.appendChild(shiftWrap)
    box.appendChild(inner)
    div.appendChild(box)

    //bind
    box.addEventListener('mouseenter', () => {
        domFadeIn(btnCancel)
    })
    box.addEventListener('mouseleave', () => {
        domFadeOut(btnCancel)
    })
    btnCancel.addEventListener('click', () => {
        closeItemByID(id)
    })

    //塞入至body
    let body = document.querySelector('body')
    body.appendChild(div)

    //pm
    let pm = genPm()

    //addItem
    addItem({
        id,
        position,
        time,
        pm,
        ele: div,
    })

    return pm
}


export default domAlert
