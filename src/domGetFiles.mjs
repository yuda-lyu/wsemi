import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import optVal from './_optVal.mjs'


//sizeMbLimit: opt類參數(位置參數, JSDoc與程式碼有預設1000), 有效數字(isenum, 不限範圍; 0與負數另改用預設), 非預期(含Infinity、'0x10'、包裝物件、非數字等)視為未給、改用預設1000, 不報錯(給Infinity不代表不限大小); 位置參數無opt物件可帶debug, 故不警告
let RULE_SIZE_MB_LIMIT = { fn: 'domGetFiles', name: 'sizeMbLimit', kind: 'enum' }


/**
 * 前端回傳Input元素所給予的檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element Input元素
 * @param {Number} [sizeMbLimit=1000] 輸入檔案大小上線，單位mb，須為有效數字(可為數字字串)，0或負數視為未給，非預期之輸入(Infinity、'0x10'、包裝物件、非數字等)視為未給而改用預設，不報錯(給Infinity不代表不限大小，要放寬請給足夠大之有限數)，預設為1000mb(約1g)
 * @returns {Array} 回傳檔案陣列
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * let r = domGetFiles(ele)
 *
 */
function domGetFiles(ele, sizeMbLimit = 1000) {

    //check, 有效則取Number(v), 非預期(含Infinity、'0x10'、包裝物件)改用預設1000, 0與負數亦用預設
    sizeMbLimit = optVal(sizeMbLimit, 1000, RULE_SIZE_MB_LIMIT)
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
