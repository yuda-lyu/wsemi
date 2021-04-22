import size from 'lodash/size'
import isestr from './isestr.mjs'
import getClearPathName from './getClearPathName.mjs'
import getFileName from './getFileName.mjs'
import strdelright from './strdelright.mjs'


/**
 * 由檔案位置取得檔案所在資料夾名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDirName.test.js Github}
 * @memberOf wsemi
 * @param {string} str 輸入檔案位置字串
 * @returns {string} 檔案名稱
 * @example
 *
 * let c
 *
 * c = 'C:\\temp\\myfile.html'
 * console.log(getDirName(c))
 * // => C:\\temp
 *
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getDirName(c))
 * // => C:\\temp
 *
 * c = 'C:\\temp\\myfile'
 * console.log(getDirName(c))
 * // => C:\\temp
 *
 * c = 'C:\\temp\\\\temp\\\\myfile.txt.html'
 * console.log(getDirName(c))
 * // => C:\\temp\\temp
 *
 * c = 'C:\\temp\\'
 * console.log(getDirName(c))
 * // => C:\\
 *
 * c = 'C:\\temp'
 * console.log(getDirName(c))
 * // => C:\\
 *
 * c = 'C:\\'
 * console.log(getDirName(c))
 * // => C:\\
 *
 * c = 'C:'
 * console.log(getDirName(c))
 * // => C:\\
 *
 * c = '/tmp/myfile.html'
 * console.log(getDirName(c))
 * // => /tmp
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getDirName(c))
 * // => /tmp
 *
 * c = '/tmp/myfile'
 * console.log(getDirName(c))
 * // => /tmp
 *
 * c = '//tmp////tmp//myfile.txt.html'
 * console.log(getDirName(c))
 * // => /tmp/tmp
 *
 * c = '/tmp/'
 * console.log(getDirName(c))
 * // => /
 *
 * c = '/tmp'
 * console.log(getDirName(c))
 * // => /
 *
 * c = '/'
 * console.log(getDirName(c))
 * // => /
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getDirName(c))
 * // => /foo/bar/baz/asdf
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getDirName(c))
 * // => /foo/bar/baz/asdf
 *
 * c = '/foo/bar/baz/asdf/quux'
 * console.log(getDirName(c))
 * // => /foo/bar/baz/asdf
 *
 * c = ''
 * console.log(getDirName(c))
 * // => [empty string]
 *
 */
function getDirName(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    //getClearPathName
    let o = getClearPathName(str)

    //check
    if (o.isRoot) {
        return o.path
    }

    //use path
    str = o.path

    //getFileName
    let name = getFileName(str)

    //check
    if (!isestr(name)) {
        return str
    }

    //strdelright
    let n = size(name)
    str = strdelright(str, n)

    //getClearPathName
    let p = getClearPathName(str)

    //check
    if (p.isRoot) {
        return p.path
    }

    //use path
    let r = p.path

    return r
}


export default getDirName
