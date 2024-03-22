import isNumber from 'lodash-es/isNumber.js'
import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import sortBy from 'lodash-es/sortBy.js'
import getGlobal from './getGlobal.mjs'
import genID from './genID.mjs'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import replace from './replace.mjs'
import haskey from './haskey.mjs'
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


let g = getGlobal() //於瀏覽器端為window, 若直接存window會因編譯至全域導致無法於nodejs運行, 得使用getGlobal取得window
g.ttWAlertCancel = function(id) {
    removeItemByID(id)
}
g.ttWAlertFadeIn = function(id) {
    domFadeIn(document.querySelector(`#${id}`))
}
g.ttWAlertFadeOut = function(id) {
    domFadeOut(document.querySelector(`#${id}`))
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

    //刪除元素
    if (q[id].ele) {
        q[id].ele.parentNode.removeChild(q[id].ele)
    }

    //刪除佇列內key紀錄
    if (q[id]) {
        delete q[id]
    }

    //calcItemLocation
    calcItemLocation()

}


function addItem({ id, position, time, pm }) {
    //console.log('addItem', id, position, time)

    //push
    q[id] = {
        id,
        position,
        ele: null,
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

                //close
                v.pm.resolve()

                //removeItemByID
                removeItemByID(v.id)

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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAlert.test.mjs Github}
 * @memberOf wsemi
 * @param {String} msg 輸入彈窗訊息字串，可為html
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='success'] 輸入訊息種類字串，可使用'success'、'warning'、'error'，預設'success'
 * @param {String} [opt.icon=''] 輸入圖標字串，可為html，預設依照type給予指定圖標，指定圖標詳見程式碼
 * @param {String} [opt.position='top-right'] 輸入位置字串，可使用'top-right'、'top-left'、'bottom-right'、'bottom-left'，預設'top-right'
 * @param {Number} [opt.time=4000] 輸入顯示時間長度數字，單位ms，預設4000
 * @param {Object} [opt.paddingStyle={top:14,right:26,bottom:14,left:14}] 輸入內寬設定物件，可輸入top、bottom、left、right，單位為px，預設{top:14,right:26,bottom:14,left:14}
 * @param {String} [opt.textColor='#000'] 輸入文字顏色字串，預設'#000'
 * @param {String} [opt.backgroundColor='#fff'] 輸入背景顏色字串，預設'#fff'
 * @param {Number} [opt.borderWidth=1] 輸入邊框寬度數字，單位px，預設1
 * @param {String} [opt.borderColor='#ebeef5'] 輸入邊框顏色字串，預設'#ebeef5'
 * @param {Number} [opt.borderRadius=8] 輸入邊框圓角數字，單位px，預設8
 * @param {String} [opt.shadowStyle='0 2px 12px 0 rgba(0,0,0,.1)'] 輸入陰影樣式字串，預設'0 2px 12px 0 rgba(0,0,0,.1)'
 * @param {Object} [opt.closeIconShift={top:10,right:10}] 輸入關閉按鈕平移距離設定物件，可輸入top、bottom、left、right，單位為px，若需要位於右上角則需設定top與right，預設{top:10,right:10}
 * @returns {Promise} 回傳Promise，resolve代表彈窗關閉，無reject
 * @example
 * need test in browser
 *
 * domAlert('提示訊息')
 *
 * domAlert('提示訊息', {type:'error'})
 *
 * domAlert('提示訊息', {backgroundColor:'rgba(220,220,220,0.3)'})
 *
 */
function domAlert(msg, opt = {}) {

    //check
    if (!isestr(msg)) {
        return
    }

    //type
    let type = get(opt, 'type', 'success')
    if (!haskey(kpIcon, type)) {
        type = 'success'
    }

    //icon
    let icon = get(opt, 'icon', null)
    if (isestr(icon)) {
        //若為有效字串, 則優先使用icon
    }
    else {
        //否則由type與kpIcon取得icon
        icon = kpIcon[type]
    }

    //position
    let position = 'top-right'
    if (opt.position === 'top-left' || opt.position === 'bottom-right' || opt.position === 'bottom-left') {
        position = opt.position
    }

    //time
    let time = get(opt, 'time')
    if (!isNumber(time)) {
        time = 4000
    }
    if (time < 0) {
        time = 4000
    }

    //paddingStyle
    let paddingStyle = get(opt, 'paddingStyle', null)
    if (paddingStyle === null) {
        paddingStyle = { top: 14, right: 26, bottom: 14, left: 14 }
    }

    //usePaddingStyle
    let usePaddingStyle = ''
    if (true) {
        let top = get(paddingStyle, 'top', 0)
        let bottom = get(paddingStyle, 'bottom', 0)
        let left = get(paddingStyle, 'left', 0)
        let right = get(paddingStyle, 'right', 0)
        usePaddingStyle = `padding:${top}px ${right}px ${bottom}px ${left}px;`
    }

    //textColor
    let textColor = get(opt, 'textColor', '#000')
    textColor = replace(textColor, ';', '')

    //backgroundColor
    let backgroundColor = get(opt, 'backgroundColor', '#fff')
    backgroundColor = replace(backgroundColor, ';', '')

    //borderWidth
    let borderWidth = get(opt, 'borderWidth', 1)

    //borderColor
    let borderColor = get(opt, 'borderColor', '#ebeef5')
    borderColor = replace(borderColor, ';', '')

    //borderRadius
    let borderRadius = get(opt, 'borderRadius', 8)

    //shadowStyle
    let shadowStyle = get(opt, 'shadowStyle', '0 2px 12px 0 rgba(0,0,0,.1)')
    shadowStyle = replace(shadowStyle, ';', '')

    //closeIconShift
    let closeIconShift = get(opt, 'closeIconShift', null)
    if (closeIconShift === null) {
        closeIconShift = { top: 10, right: 10 }
    }

    //useCloseIconPosition
    let useCloseIconPosition = ''
    if (true) {
        let top = get(closeIconShift, 'top', '')
        let bottom = get(closeIconShift, 'bottom', '')
        let left = get(closeIconShift, 'left', '')
        let right = get(closeIconShift, 'right', '')
        if (isNumber(top)) {
            top = `top:${top}px;`
        }
        if (isNumber(bottom)) {
            bottom = `bottom:${bottom}px;`
        }
        if (isNumber(left)) {
            left = `left:${left}px;`
        }
        if (isNumber(right)) {
            right = `right:${right}px;`
        }
        useCloseIconPosition = `position:absolute; ${top} ${right} ${bottom} ${left}`
    }

    //id
    let id = `alt-${genID()}`
    let idCancel = `alt-${genID()}`

    //message
    let message = `
    <div 
        style="display:inline-block; color:${textColor}; background:${backgroundColor}; border:${borderWidth}px solid ${borderColor}; border-radius:${borderRadius}px; box-shadow:${shadowStyle};"
        onmouseenter="ttWAlertFadeIn('${idCancel}')"
        onmouseleave="ttWAlertFadeOut('${idCancel}')"
    >
        <div style="position:relative; ${usePaddingStyle}">

            <div style="display:flex; align-items:center;">
                <div style="margin-right:10px;">
                    <div style="display:flex;">${icon}</div>
                </div>
                <div>${msg}</div>
            </div>

            <div style="${useCloseIconPosition}">
                <div 
                id="${idCancel}" 
                    style="display:flex; cursor:pointer; opacity:0;" 
                    onclick="ttWAlertCancel('${id}')"
                >
                    ${iconCancel}
                </div>
            </div>

        </div>
    </div>
    `

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
    div.innerHTML = message

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
    })

    return pm
}


export default domAlert
