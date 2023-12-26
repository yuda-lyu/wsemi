import split from 'lodash-es/split'
import size from 'lodash-es/size'
import last from 'lodash-es/last'
import isestr from './isestr.mjs'
import getFileName from './getFileName.mjs'


/**
 * 由檔案位置取得檔案的副檔名
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileNameExt.test.mjs Github}
 * @memberOf wsemi
 * @param {string} str 輸入檔案位置字串
 * @returns {string} 檔案的副檔名
 * @example
 *
 * let c
 *
 * c = 'C:\\temp\\myfile.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = 'C:\\temp\\myfile'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = 'C:\\temp\\\\temp\\\\myfile.txt.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = 'C:\\temp\\'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = 'C:\\temp'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = 'C:\\'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = 'C:'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = '/tmp/myfile.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = '/tmp/myfile'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = '//tmp////tmp//myfile.txt.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = '/tmp/'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = '/tmp'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = '/'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getFileNameExt(c))
 * // => html
 *
 * c = '/foo/bar/baz/asdf/quux'
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 * c = ''
 * console.log(getFileNameExt(c))
 * // => [empty string]
 *
 */
function getFileNameExt(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    //getFileName
    let name = getFileName(str)

    //s
    let s = split(name, '.')

    //check
    if (size(s) <= 1) {
        return ''
    }

    let r = ''
    try {
        r = last(s)
    }
    catch (err) {}

    return r
}


export default getFileNameExt
