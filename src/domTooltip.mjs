import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import merge from 'lodash/merge'
import iseobj from './iseobj.mjs'
import isnum from './isnum.mjs'
import cint from './cint.mjs'


/**
 * 滑鼠移入元素時彈出提示訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domTooltip.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入DOM元素
 * @param {String} content 輸入提示html訊息字串，若不給則使用ele.innerHTML
 * @param {Object} [option={}] 輸入tippy提示設定物件，預設{}，設定物件詳見tippy官網
 * @example
 * let ele = {HTMLElement}
 * domTooltip(ele, '<b>Hello</b>World')
 */
function domTooltip(ele, content, option = {}) {
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

    //bStop, 若還在倒數中則跳出
    let bStop = isnum(tippystate)

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
        if (isnum(ts)) {

            //倒數
            ts = cint(ts)
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
