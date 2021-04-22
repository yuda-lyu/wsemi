import isestr from './isestr.mjs'
import getClearPathName from './getClearPathName.mjs'


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
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = 'C:\\temp\\myfile'
 * console.log(getFileName(c))
 * // => myfile
 *
 * c = 'C:\\temp\\\\temp\\\\myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = 'C:\\temp\\'
 * console.log(getFileName(c))
 * // => temp
 *
 * c = 'C:\\temp'
 * console.log(getFileName(c))
 * // => temp
 *
 * c = 'C:\\'
 * console.log(getFileName(c))
 * // => C:\
 *
 * c = 'C:'
 * console.log(getFileName(c))
 * // => C:\
 *
 * c = '/tmp/myfile.html'
 * console.log(getFileName(c))
 * // => myfile.html
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = '/tmp/myfile'
 * console.log(getFileName(c))
 * // => myfile
 *
 * c = '//tmp////tmp//myfile.txt.html'
 * console.log(getFileName(c))
 * // => myfile.txt.html
 *
 * c = '/tmp/'
 * console.log(getFileName(c))
 * // => tmp
 *
 * c = '/tmp'
 * console.log(getFileName(c))
 * // => tmp
 *
 * c = '/'
 * console.log(getFileName(c))
 * // => /
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getFileName(c))
 * // => quux.html
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getFileName(c))
 * // => quux.txt.html
 *
 * c = '/foo/bar/baz/asdf/quux'
 * console.log(getFileName(c))
 * // => quux
 *
 * c = ''
 * console.log(getFileName(c))
 * // => [empty string]
 *
 */
function getFileName(str) {

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

    let r = o.path
    try {
        r = r.split('\\').pop().split('/').pop()
    }
    catch (err) {}

    return r
}


export default getFileName
