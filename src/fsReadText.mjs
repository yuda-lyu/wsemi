import fs from 'fs'


/**
 * 由檔案讀取utf-8文字
 *
 * @export
 * @param {String} fn 輸入檔案名稱
 */
export default function fsReadText(fn) {
    return fs.readFileSync(fn, 'utf8')
}
