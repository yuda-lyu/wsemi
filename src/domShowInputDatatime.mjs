import ot from 'dayjs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import isday from './isday.mjs'
import istime from './istime.mjs'
import isEle from './isEle.mjs'
import domRemove from './domRemove.mjs'
import domFind from './domFind.mjs'


/**
 * 前端開啟選擇時間視窗並回傳新時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputDatatime.test.mjs Github}
 * @memberOf wsemi
 * @param {String} [time=''] 輸入時間字串，可不提供，時間視窗預設為今日，預設為''
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Element} [opt.eleRef=null] 輸入觸發點擊Element元素，若不給則使用document.activeElement取得，預設為null
 * @param {String} [opt.type='datetime-local'] 輸入時間類型字串，可選為'datetime-local'與'date'，預設為'datetime-local'
 * @returns {Promise} 回傳Promise，resolve回傳選擇新時間，無reject
 * @example
 * need test in browser
 *
 * let timePrev
 *
 * timePrev = '2000-01-01T00:00:00'
 * domShowInputDatatime(timePrev)
 *     .then((timeNew)=>{
 *         console.log('timeNew', timeNew)
 *     })
 *
 * timePrev = '2000-01-01'
 * domShowInputDatatime(timePrev, { type: 'date' })
 *     .then((timeNew)=>{
 *         console.log('timeNew', timeNew)
 *     })
 *
 */
function domShowInputDatatime(time, opt = {}) {

    //type
    let type = get(opt, 'type', '')
    if (type !== 'date' && type !== 'datetime-local') {
        type = 'datetime-local'
    }

    //eleRef
    let eleRef = get(opt, 'eleRef', null)
    if (!isEle(eleRef)) {
        eleRef = document.activeElement
    }
    // console.log('eleRef', eleRef)

    //pm
    let pm = genPm()

    //id
    let id = 'drf' + genID() //若全英文數字可能會導致出現特例如hex問題, 添加字首以避免

    //gname
    let gname = 'GrpDomShowDatatime'

    //remove
    domRemove(`[name=${gname}]`)

    //v, inp顯示用時間
    let b = false
    let v = ''
    if (type === 'date') {
        if (isday(time)) {
            b = true
            v = time
        }
    }
    else {
        if (istime(time)) {
            b = true
            let vt = ot(time)
            v = vt.format('YYYY-MM-DDTHH:mm')
        }
    }
    if (isestr(v)) {
        // console.log(type, 'v', v)
        v = `value="${v}"`
    }
    // console.log(type, 'v', v)

    //div, inp會放在div內, div會依照有無提供
    let div = document.createElement('div')
    div.setAttribute('name', gname) //div非表單元素沒有name, 不能使用div.name = gname
    div.style.width = 0
    div.style.height = 0
    div.style.overflow = 'hidden'
    div.innerHTML = `
        <div style="transform:translateY(-100%);">
            <input id="${id}" type="${type}" style="opacity:0;" ${b ? v : ''} />
        </div>
    `

    //inp, 函數內取用
    let inp = null

    //check
    if (!isEle(eleRef)) {

        //appendChild
        document.querySelector('body').appendChild(div)

    }
    else {

        //insertBefore
        eleRef.parentNode.insertBefore(div, eleRef.nextSibling)

    }

    //bTrigger
    let bTrigger = false

    //trigger
    function trigger() {

        //check, 因可能change與focusout皆會觸發, 故通過bTrigger只觸發1次
        if (bTrigger) {
            return
        }
        bTrigger = true

        //removeEventListener
        try {
            inp.removeEventListener('change', evChange, true)
            eleRef.removeEventListener('focusout', evFocusout, true)
            // console.log('removeEventListener')
        }
        catch (err) {}

        //remove element
        domRemove(`[name=${gname}]`)
        // console.log('domRemove')

        //check
        if (isestr(timeChange)) {
            // console.log('取得變更時間')

            //timeNew
            let timeNew = ''
            if (type === 'date') {
                timeNew = timeChange
            }
            else {
                timeNew = `${timeChange}:00`
            }
            // console.log(type, 'timeNew', timeNew)

            //resolve
            pm.resolve(timeNew)

        }
        else {
            // console.log('未變更時間')
        }

    }

    //evChange
    let timeChange = ''
    function evChange(msg) {
        // console.log('evChange', msg)

        //save
        try {
            timeChange = msg.target.value
            // console.log('timeChange', timeChange)
        }
        catch (err) {
            console.log(err)
        }

        //trigger
        trigger()

    }

    //evFocusout
    function evFocusout(msg) {
        // console.log('evFocusout', msg)

        //setTimeout, picker取消時靠觸發元素的focusout事件來得知, focusout會比change觸發還快, 故得要延遲觸發
        setTimeout(() => {
            trigger()
        }, 50) //不能給1, 觸發時間最小可能為20ms, 手速過快, 可能會導致focusout仍比change還快觸發, 導致無法接收與處理change事件

    }

    //setTimeout, 因若是順發太快, 瀏覽器inp位置尚未出現, 挑選日曆時間視窗無法定位會出現至瀏覽器左上角, 故須延遲觸發
    setTimeout(() => {

        //inp, 須更新函數內取用, 才能於結束階段inp取消監聽
        inp = domFind('#' + id)

        //change
        inp.addEventListener('change', evChange, true)

        //showPicker
        inp.showPicker() //彈出日曆視窗
        // inp.focus() //自動聚焦至年選項

    }, 1)

    //監聽觸發者取消焦點
    eleRef.addEventListener('focusout', evFocusout, true)

    return pm
}


export default domShowInputDatatime
