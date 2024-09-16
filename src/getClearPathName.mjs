import isestr from './isestr.mjs'
import strright from './strright.mjs'
import strdelright from './strdelright.mjs'


/**
 * 清理檔案或資料夾位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getClearPathName.test.mjs Github}
 * @memberOf wsemi
 * @param {string} str 輸入檔案或資料夾位置字串
 * @returns {string} 清理後檔案或資料夾位置
 * @example
 *
 * let c
 *
 * c = 'C:\\temp\\myfile.html'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\temp\\myfile.html', isRoot: false }
 *
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\temp\\myfile.txt.html', isRoot: false }
 *
 * c = 'C:\\temp\\\\temp\\\\myfile.txt.html'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\temp\\temp\\myfile.txt.html', isRoot: false }
 *
 * c = 'C:\\temp\\'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\temp', isRoot: false }
 *
 * c = 'C:\\temp'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\temp', isRoot: false }
 *
 * c = 'C:\\'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\', isRoot: true }
 *
 * c = 'C:'
 * console.log(getClearPathName(c))
 * // => { path: 'C:\\', isRoot: true }
 *
 * c = '/tmp/myfile.html'
 * console.log(getClearPathName(c))
 * // => { path: '/tmp/myfile.html', isRoot: false }
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getClearPathName(c))
 * // => { path: '/tmp/myfile.txt.html', isRoot: false }
 *
 * c = '//tmp////tmp//myfile.txt.html'
 * console.log(getClearPathName(c))
 * // => { path: '/tmp/tmp/myfile.txt.html', isRoot: false }
 *
 * c = '/tmp/'
 * console.log(getClearPathName(c))
 * // => { path: '/tmp', isRoot: false }
 *
 * c = '/tmp'
 * console.log(getClearPathName(c))
 * // => { path: '/tmp', isRoot: false }
 *
 * c = '/'
 * console.log(getClearPathName(c))
 * // => { path: '/', isRoot: true }
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getClearPathName(c))
 * // => { path: '/foo/bar/baz/asdf/quux.html', isRoot: false }
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getClearPathName(c))
 * // => { path: '/foo/bar/baz/asdf/quux.txt.html', isRoot: false }
 *
 * c = ''
 * console.log(getClearPathName(c))
 * // => { path: '', isRoot: false }
 *
 */
function getClearPathName(str) {

    //check
    if (!isestr(str)) {
        return {
            path: '',
            isRoot: false,
        }
    }

    //replace
    while (str.indexOf('\\\\') >= 0) {
        str = str.replace('\\\\', '\\')
    }
    while (str.indexOf('//') >= 0) {
        str = str.replace('//', '/')
    }

    if (strright(str, 1) === ':') { //若為windows根目錄
        return {
            path: `${str}\\`,
            isRoot: true,
        }
    }
    if (strright(str, 1) === '\\') {
        let r = strdelright(str, 1)
        if (strright(r, 1) === ':') { //若為windows根目錄
            return {
                path: str,
                isRoot: true,
            }
        }
        return {
            path: r,
            isRoot: false,
        }
    }
    else if (strright(str, 1) === '/') {
        let r = strdelright(str, 1)
        //if (size(r) === 0) { //若為根目錄
        if (r.length === 0) { //若為根目錄
            return {
                path: str,
                isRoot: true,
            }
        }
        return {
            path: r,
            isRoot: false,
        }
    }
    return {
        path: str,
        isRoot: false,
    }
}


export default getClearPathName
