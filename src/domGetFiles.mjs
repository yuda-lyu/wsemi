import each from 'lodash/each'
import ispint from './ispint.mjs'


/**
 * 前端回傳Input元素所給予的檔案
 *
 * @memberOf wsemi
 * @param {Element} ele 輸入Element Input元素
 * @param {Number} [sizelimit=500] 輸入檔案大小上線，單位mb，預設為500mb
 * @returns {Array} 回傳檔案陣列
 */
function domGetFiles(ele, sizelimit = 500) {

    //check
    if (ispint(sizelimit)) {
        sizelimit = 500
    }

    //files
    let err = []
    let files = []
    each(ele.files, function(file) {

        //name
        let name = file.name

        //size
        let size = file.size

        //check
        if (size / 1024 / 1024 > sizelimit) { //轉mb

            //push err
            err.push(`檔案大小超過上限${sizelimit}mb：${name}`)

        }

        //push file
        files.push(file)

    })

    return {
        files: files,
        err: err
    }
}


export default domGetFiles
