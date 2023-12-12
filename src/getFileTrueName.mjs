import join from 'lodash-es/join'
import split from 'lodash-es/split'
import size from 'lodash-es/size'
import dropRight from 'lodash-es/dropRight'
import isestr from './isestr.mjs'
import getFileName from './getFileName.mjs'


/**
 * 由檔案位置取得檔案的不含副檔名名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileTrueName.test.mjs Github}
 * @memberOf wsemi
 * @param {string} str 輸入檔案位置字串
 * @returns {string} 檔案不含副檔名的名稱
 * @example
 *
 * let c
 *
 * c = 'C:\\temp\\myfile.html'
 * console.log(getFileTrueName(c))
 * // => myfile
 *
 * c = 'C:\\temp\\myfile.txt.html'
 * console.log(getFileTrueName(c))
 * // => myfile.txt
 *
 * c = 'C:\\temp\\myfile'
 * console.log(getFileTrueName(c))
 * // => myfile
 *
 * c = 'C:\\temp\\\\temp\\\\myfile.txt.html'
 * console.log(getFileTrueName(c))
 * // => myfile.txt
 *
 * c = 'C:\\temp\\'
 * console.log(getFileTrueName(c))
 * // => temp
 *
 * c = 'C:\\temp'
 * console.log(getFileTrueName(c))
 * // => temp
 *
 * c = 'C:\\'
 * console.log(getFileTrueName(c))
 * // => C:\\
 *
 * c = 'C:'
 * console.log(getFileTrueName(c))
 * // => C:\\
 *
 * c = '/tmp/myfile.html'
 * console.log(getFileTrueName(c))
 * // => myfile
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getFileTrueName(c))
 * // => myfile.txt
 *
 * c = '/tmp/myfile'
 * console.log(getFileTrueName(c))
 * // => myfile
 *
 * c = '//tmp////tmp//myfile.txt.html'
 * console.log(getFileTrueName(c))
 * // => myfile.txt
 *
 * c = '/tmp/'
 * console.log(getFileTrueName(c))
 * // => tmp
 *
 * c = '/tmp'
 * console.log(getFileTrueName(c))
 * // => tmp
 *
 * c = '/'
 * console.log(getFileTrueName(c))
 * // => /
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getFileTrueName(c))
 * // => quux
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getFileTrueName(c))
 * // => quux.txt
 *
 * c = '/foo/bar/baz/asdf/quux'
 * console.log(getFileTrueName(c))
 * // => quux
 *
 * c = ''
 * console.log(getFileTrueName(c))
 * // => [empty string]
 *
 */
function getFileTrueName(str) {

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
        return name
    }

    let r = ''
    try {
        s = dropRight(s)
        r = join(s, '.')
    }
    catch (err) {}

    return r
}


export default getFileTrueName
