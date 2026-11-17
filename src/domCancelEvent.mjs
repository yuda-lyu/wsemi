import isIE from './isIE.mjs'


/**
 * 前端針對DOM元素事件設定停止傳遞事件
 *
 * 回傳布林值表示是否已取消：e無效(假值、非物件)或不可取消(e.cancelable為假值或無此屬性，如拖曳自己會捲動螢幕而觸發之不可取消事件)時不動作回傳false(判定為真值而非嚴格等於true，同修改前)；可取消者呼叫stopPropagation(IE11為設cancelBubble)與preventDefault後回傳true，呼叫過程拋錯(有些情形preventDefault是passive無法呼叫)回傳false，不外拋；passive監聽器內preventDefault被瀏覽器忽略而不拋錯者無從偵測，仍回傳true。不以訊息字串作回傳值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domCancelEvent.test.mjs Github}
 * @memberOf wsemi
 * @param {Event} e 輸入event物件
 * @returns {Boolean} 回傳是否已取消，true為已呼叫stopPropagation與preventDefault且未拋錯，其餘(含e無效、事件不可取消、呼叫拋錯)皆為false
 * @example
 * need test in browser
 *
 * window.addEventListener('touchstart', (e) => {
 *     domCancelEvent(e)
 * })
 *
 */
function domCancelEvent(e) {

    //try, 有些情形preventDefault是passive無法呼叫; 讀取e之屬性拋錯(如已撤銷之Proxy)亦視為無法取消
    try {

        //check
        if (!e) {
            return false
        }

        //check, 拖曳事件因拖曳自己會捲動螢幕, 會觸發不可取消事件, 故需偵測直接跳出
        if (!e.cancelable) {
            return false
        }

        //stopPropagation
        if (isIE()) {
            e.cancelBubble = true //IE11
        }
        else {
            e.stopPropagation()
        }

        //preventDefault
        e.preventDefault()

        return true
    }
    catch (err) {
        return false
    }

}


export default domCancelEvent
