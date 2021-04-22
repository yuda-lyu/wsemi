import isestr from './isestr.mjs'


/**
 * 由檔案位置取得檔案名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileName.test.js Github}
 * @memberOf wsemi
 * @param {string} str 輸入檔案位置字串
 * @returns {string} 檔案名稱
 * @example
 *
 * let c
 *
 * c = 'C:\\temp\\myfile.html'
 * console.log(getFileName(c))
 * // => myfile.html
 *
 *
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = 'C:\\temp\\'
 * console.log(getFileName(c))
 * // => [empty string]
 *
 * c = '/tmp/myfile.html'
 * console.log(getFileName(c))
 * // => myfile.html
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = '/tmp/'
 * console.log(getFileName(c))
 * // => [empty string]
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getFileName(c))
 * // => quux.html
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getFileName(c))
 * // => quux.html.txt
 *
 */
function getFileName(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let r = ''
    try {
        r = str.split('\\').pop().split('/').pop()
    }
    catch (err) {}

    return r
}


export default getFileName
