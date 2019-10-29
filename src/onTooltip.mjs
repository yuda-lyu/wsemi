import tippy from 'tippy.js'


/**
 * 滑鼠移入元素時彈出提示訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/onTooltip.test.js Github}
 * @memberOf wsemi
 * @param {*} ele DOM元素物件
 * @param {*} ct 提示html訊息字串
 * @example
 * need test in browser
 */
function onTooltip(ele, ct) {

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

    //tippy
    let tp = tippy(ele, {
        content: h,
        arrow: true,
        theme: 'dark',
        //animation: 'fade',
        placement: 'bottom',
        //duration: [500,100],
        delay: 150,
    })
    tp.show()

    //auto destroy
    setTimeout(function() {
        tp.destroy(true)
        ele.setAttribute('tippystate', '')
    }, 5000)

}


export default onTooltip
