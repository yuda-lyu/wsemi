import fs from 'fs'


/**
 * 寫入文字至檔案
 *
 * @export
 * @param {String} fn 輸入檔案名稱
 * @param {String} c 輸入文字數據
 */
export default function srvWriteText(fn, c) {
    fs.writeFileSync(fn, c)
}
