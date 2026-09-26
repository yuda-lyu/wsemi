import isfun from './isfun.mjs'


/**
 * 前端檢測DOM元素當下是否被繪製：在頁面中，且自身與祖先皆非display:none
 *
 * 有checkVisibility時以其判定(另涵蓋content-visibility:hidden等display以外之不被繪製)，否則或其拋錯時逐層檢查display，Shadow DOM內之頂層節點改查其宿主
 *
 * 只計算樣式而不讀外框(不強制重排版)，故被繪製而尺寸為0者亦為true；未被繪製之元素量得之尺寸皆為0，可供量測前確認，避免把0寫入須持久化之狀態(如列高、內容高度)
 *
 * 非元素(null、文字節點、document等)一律為false；因供頻繁呼叫之偵測使用，以nodeType判定是否為元素而不經isEle
 *
 * 無checkVisibility之瀏覽器(逐層檢查display)不涵蓋：content-visibility:hidden之子孫、display:contents之元素自身、未分配至slot之宿主子元素、所在slot被隱藏、關閉之details內容，以上皆判為true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsRendered.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入元素
 * @returns {Boolean} 回傳是否被繪製布林值
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * console.log(domIsRendered(ele))
 * // => true or false
 *
 */
function domIsRendered(ele) {

    //check
    if (!ele || ele.nodeType !== 1 || !ele.isConnected) {
        return false
    }

    //checkVisibility
    if (isfun(ele.checkVisibility)) {
        try {
            return ele.checkVisibility()
        }
        catch (err) {}
    }

    //逐層檢查display
    let e = ele
    while (e && e.nodeType === 1) {
        let display = ''
        try {
            display = window.getComputedStyle(e).display
        }
        catch (err) {
            display = ''
        }
        if (display === 'none') {
            return false
        }
        e = e.parentElement || (e.parentNode && e.parentNode.host) || null //Shadow DOM內之頂層節點改查其宿主
    }

    return true
}


export default domIsRendered
