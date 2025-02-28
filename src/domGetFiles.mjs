import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import cdbl from './cdbl.mjs'


/**
 * 前端回傳Input元素所給予的檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element Input元素
 * @param {Number} [sizeMbLimit=1000] 輸入檔案大小上線，單位mb，預設為1000mb(約1g)
 * @returns {Array} 回傳檔案陣列
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * let r = domGetFiles(ele)
 *
 */
function domGetFiles(ele, sizeMbLimit = 1000) {

    //check
    sizeMbLimit = cdbl(sizeMbLimit)
    if (sizeMbLimit <= 0) {
        sizeMbLimit = 1000
    }

    //files
    let errs = {}
    let files = []
    each(get(ele, 'files', []), function(file, k) {

        //sizeB, 單位bytes
        let sizeB = file.size

        //sizeMb
        let sizeMb = sizeB / 1024 / 1024

        //check
        if (sizeMb > sizeMbLimit) {

            //push err
            errs[k] = `file size[${sizeMb}]mb > ${sizeMbLimit}mb`

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
