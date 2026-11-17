import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import merge from 'lodash-es/merge.js'
import iseobj from './iseobj.mjs'
import isenum from './isenum.mjs'
import isEle from './isEle.mjs'


/**
 * 滑鼠移入元素時彈出提示訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domTooltip.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入DOM元素，非元素則拋錯
 * @param {String} [content] 輸入提示html訊息字串，若不給(undefined、null)或為空字串則使用ele.innerHTML，給了而非字串則拋錯
 * @param {Object} [option={}] 輸入tippy提示設定物件，預設{}，設定物件詳見tippy官網
 * @throws {Error} ele非元素拋出Error('invalid ele: must be an element')，content給了而非字串拋出Error('invalid content: must be a string')，皆先於任何DOM變動(不設tippystate屬性、不建立提示、不起計時器)，訊息不含輸入值
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domTooltip(ele, '<b>Hello</b>World')
 *
 */
function domTooltip(ele, content, option = {}) {

    //check, 會改動畫面(屬性與提示), 輸入無效即拋錯且先於任何改動(同domAppend)
    if (!isEle(ele)) {
        throw new Error('invalid ele: must be an element')
    }
    if (content !== undefined && content !== null && typeof content !== 'string') {
        throw new Error('invalid content: must be a string')
    }

    let tp = null
    let timer = null

    function destroy() {

        //destroy
        if (tp !== null) {
            tp.destroy(true)
        }

        //reset
        ele.setAttribute('tippystate', '')

        //clearInterval
        clearInterval(timer)

    }

    //optionDef
    let optionDef = {
        arrow: true,
        theme: 'dark',
        //animation: 'fade',
        placement: 'bottom',
        //duration: [500,100],
        delay: 150,
    }

    //option
    // console.log('option', option)
    if (iseobj(option)) {
        option = merge(optionDef, option)
        // console.log('merge option', option)
    }
    else {
        option = optionDef
    }

    //h
    let h = content
    if (!content) {
        h = ele.innerHTML
    }

    //tippystate
    let tippystate = ele.getAttribute('tippystate')

    //bStop, 若還在倒數中(tippystate為函數自行寫入之倒數秒數, 有效數字)則跳出
    let bStop = isenum(tippystate)

    //set tippystate, 不論是第一次初始化還是滑鼠移入重複觸發, 皆需重設時間
    ele.setAttribute('tippystate', '5')

    //check, 顯示中, 故重設時間後才跳出
    if (bStop) {
        return
    }

    //h, 文字對齊預設靠左
    h = `<div style="text-align:left;">${h}</div>`

    //useTippy, tippy於weboack打包時會用default儲存, 調用時則需改用default
    let useTippy = tippy
    if (tippy.default) {
        useTippy = tippy.default
    }

    //tippy
    tp = useTippy(ele, {
        ...option,
        content: h,
        allowHTML: true,
        onHidden() {
            //滑鼠移開時hide完需destroy
            destroy()
        },
        onDestroy() {
            //已destroy會沒有tp可用, 需給予null避免調用其內函式
            tp = null
            destroy()
        },
    })
    tp.show()

    //auto destroy
    timer = setInterval(() => {
        let ts = ele.getAttribute('tippystate')
        if (isenum(ts)) {

            //倒數, 判定有效後取轉換值
            ts = Number(ts)
            ts -= 1

            //set tippystate
            ele.setAttribute('tippystate', ts)

            //check
            if (ts <= 0) {
                destroy()
            }

        }
        else {
            destroy()
        }
    }, 1000)

    // setTimeout(function() {

    //     //destroy
    //     if (tp !== null) {
    //         tp.destroy(true)
    //     }

    //     //reset
    //     ele.setAttribute('tippystate', '')

    // }, 5000)

}


export default domTooltip
