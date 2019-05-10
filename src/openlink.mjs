import isestr from './isestr.mjs'


/**
 * 前端開啟連結
 *
 * @memberOf wsemi
 * @param {String} url
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
