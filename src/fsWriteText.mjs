import fs from 'fs'


/**
 * 寫入utf-8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fn 輸入檔案名稱
 * @param {String} c 輸入utf-8文字數據
 * @example
 * need test in nodejs.
 *
 */
function fsWriteText(fn, c) {
    fs.writeFileSync(fn, c, 'utf8')
}


export default fsWriteText
