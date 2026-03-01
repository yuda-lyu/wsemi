import get from 'lodash-es/get.js'


/**
 * 後端nodejs判斷是否為檔案或資料夾或符號連結
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsExistsCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * //see fsExists
 *
 */
function fsExistsCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    let b = false
    try {
        fs.statSync(pah)
        b = true
    }
    catch {
        b = false
    }

    return b
}


export default fsExistsCore
