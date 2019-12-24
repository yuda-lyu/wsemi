import fs from 'fs'


/**
 * 由檔案讀取utf-8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadText.test.js Github}
 * @memberOf wsemi
 * @param {String} fn 輸入檔案名稱
 * @example
 * need test in nodejs.
 */
function fsReadText(fn) {
    return fs.readFileSync(fn, 'utf8')
}


export default fsReadText
