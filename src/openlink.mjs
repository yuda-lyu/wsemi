import isestr from './isestr.mjs'


/**
 * 前端開啟連結
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/openLink.test.js Github}
 * @memberOf wsemi
 * @param {String} url
 * @example
 * need test in browser
 */
function openLink(url) {

    //check
    if (!isestr(url)) {
        return
    }

    //tag a
    let a = document.createElement('a')
    a.href = url
    a.target = '_blank'

    //download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

}


export default openLink
