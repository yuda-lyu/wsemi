import get from 'lodash-es/get'
import each from 'lodash-es/each'
import cdbl from './cdbl.mjs'


/**
 * 前端回傳Input元素所給予的檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element Input元素
 * @param {Number} [sizelimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @returns {Array} 回傳檔案陣列
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * let r = domGetFiles(ele)
 *
 */
function domGetFiles(ele, sizelimit = 1000) {

    //check
    sizelimit = cdbl(sizelimit)
    if (sizelimit <= 0) {
        sizelimit = 1000
    }

    //files
    let errs = {}
    let files = []
    each(get(ele, 'files', []), function(file, k) {

        //size, 單位bytes
        let size = file.size

        //check
        if (size / 1024 / 1024 > sizelimit) { //轉mb

            //push err
            errs[k] = `檔案大小超過上限${sizelimit}mb`

        }

        //push file
        files.push(file)

    })

    return {
        files,
        errs,
    }
}


export default domGetFiles
