import isstr from './isstr.mjs'


/**
 * 複製字串至剪貼簿
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strClipboard.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲複製至剪貼簿的字串
 * @returns {Number} 回傳字串相似度0~1
 * @example
 * strClipboard('The Woodman(樵夫) set to work at once, and so...')
 */
function strClipboard(str) {
    let r = ''

    if (!isstr(str)) {
        return 'invalid input'
    }

    //使用textarea儲存並選擇字串
    let ele = document.createElement('textarea')
    ele.style.background = 'transparent'
    ele.value = str
    document.body.appendChild(ele)
    ele.select()

    //copy
    try {
        document.execCommand('copy')
    }
    catch (err) {
        r = 'unable to copy'
    }

    //removeChild
    document.body.removeChild(ele)

    return r
}


export default strClipboard
