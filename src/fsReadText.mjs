import fs from 'fs'


/**
 * 由檔案讀取utf-8文字
 *
 * @memberOf wsemi
 * @param {String} fn 輸入檔案名稱
 */
function fsReadText(fn) {
    return fs.readFileSync(fn, 'utf8')
}


export default fsReadText
