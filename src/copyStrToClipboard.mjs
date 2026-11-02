import get from 'lodash-es/get.js'
import isstr from './isstr.mjs'
import isEle from './isEle.mjs'
import domIsFocused from './domIsFocused.mjs'


/**
 * 複製字串至剪貼簿
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/copyStrToClipboard.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲複製至剪貼簿的字串，非字串則拋錯
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {HTMLElement} [opt.eleParent=document.body] 輸入臨時插入的父層元素，因例如於鎖定焦點(focus)的區域內要複製字串，會因臨時創建的textarea元素無法聚焦導致無法複製至剪貼簿，故得由外部傳入可聚焦的父層元素供創建textarea之用，非元素則使用document.body，預設document.body
 * @returns {String} 回傳字串，複製成功則為空字串，失敗(含非預期輸入)皆經拋錯回報而不回傳訊息字串
 * @throws {Error} str非字串拋出Error('invalid str: must be a string')且不建立任何元素；臨時textarea無法取得焦點拋出Error('ele can not be focused')；document.execCommand('copy')拋錯或回傳false拋出Error('can not copy str to clipboard')；訊息不含輸入值且不外洩內部錯誤，臨時建立之textarea不論成敗皆已移除
 * @example
 *
 * copyStrToClipboard('The Woodman(樵夫) set to work at once, and so...')
 *
 * let ele = document.querySelector('#id')
 * copyStrToClipboard('The Woodman(樵夫) set to work at once, and so...', { eleParent: ele })
 *
 */
function copyStrToClipboard(str, opt = {}) {

    //check
    if (!isstr(str)) {
        throw new Error('invalid str: must be a string')
    }

    //eleParent
    let eleParent = get(opt, 'eleParent')
    if (!isEle(eleParent)) {
        eleParent = document.body
    }

    //創造textarea儲存字串並選擇
    let ele = document.createElement('textarea')
    ele.style.position = 'fixed'
    ele.style.left = 0
    ele.style.top = 0
    ele.style.zIndex = -1 //100000
    ele.style.background = 'transparent'
    ele.style.color = 'transparent'
    ele.value = str
    eleParent.appendChild(ele)

    //不論成功或失敗(取不到焦點、execCommand拋錯或回傳false), 臨時textarea皆須移除(finally)
    try {
        ele.select()

        //check
        if (!domIsFocused(ele)) {
            throw new Error('ele can not be focused')
        }

        //copy, execCommand回傳false代表瀏覽器拒絕複製; 其拋出之原錯誤不外洩, 改拋固定訊息
        let ok = true
        try {
            ok = (document.execCommand('copy') !== false)
        }
        catch (err) {
            ok = false
        }
        if (!ok) {
            throw new Error('can not copy str to clipboard')
        }

    }
    finally {
        //removeChild
        //清理本身不得拋錯覆蓋原結果或原錯誤(頁面腳本可能已自行移除臨時元素)
        try {
            eleParent.removeChild(ele)
        }
        catch (err) {}
    }

    return ''
}


export default copyStrToClipboard
