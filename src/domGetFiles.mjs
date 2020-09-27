import each from 'lodash/each'
import cdbl from './cdbl.mjs'


/**
 * 前端回傳Input元素所給予的檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFiles.test.js Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element Input元素
 * @param {Number} [sizelimit=500] 輸入檔案大小上線，單位mb，預設為500mb
 * @returns {Array} 回傳檔案陣列
 * @example
 * need test in browser
 * 
 */
function domGetFiles(ele, sizelimit = 500) {

    //check
    sizelimit = cdbl(sizelimit)
    if (sizelimit <= 0) {
        sizelimit = 500
    }

    //files
    let errs = {}
    let files = []
    each(ele.files, function(file, k) {

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
