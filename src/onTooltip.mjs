import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import merge from 'lodash/merge'
import iseobj from './iseobj.mjs'


/**
 * 滑鼠移入元素時彈出提示訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/onTooltip.test.js Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入DOM元素
 * @param {String} ct 輸入提示html訊息字串，若不給則使用ele.innerHTML
 * @param {Object} [option={}] 輸入tippy提示設定物件，預設{}，設定物件詳見tippy官網
 * @example
 * need test in browser
 */
function onTooltip(ele, ct, option = {}) {

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
    let h = ct
    if (!ct) {
        h = ele.innerHTML
    }

    //tippystate
    let tippystate = ele.getAttribute('tippystate')
    if (tippystate === 'uesd') {
        return
    }
    ele.setAttribute('tippystate', 'uesd')

    //h, 文字對齊預設靠左
    h = `<div style="text-align:left;">${h}</div>`

    //useTippy, tippy於weboack打包時會用default儲存, 調用時則需改用default
    let useTippy = tippy
    if (tippy.default) {
        useTippy = tippy.default
    }

    //tippy
    let tp = useTippy(ele, {
        ...option,
        content: h,
        allowHTML: true,
    })
    tp.show()

    //auto destroy
    setTimeout(function() {
        tp.destroy(true)
        ele.setAttribute('tippystate', '')
    }, 5000)

}


export default onTooltip
