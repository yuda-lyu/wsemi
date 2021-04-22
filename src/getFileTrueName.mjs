import join from 'lodash/join'
import dropRight from 'lodash/dropRight'
import isestr from './isestr.mjs'
import getFileName from './getFileName.mjs'


/**
 * 由檔案位置取得檔案的不含副檔名名稱
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileTrueName.test.js Github}
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
 * c = 'C:\\temp\\'
 * console.log(getFileTrueName(c))
 * // => [empty string]
 *
 * c = '/tmp/myfile.html'
 * console.log(getFileTrueName(c))
 * // => myfile
 *
 * c = '/tmp/myfile.txt.html'
 * console.log(getFileTrueName(c))
 * // => myfile.txt
 *
 * c = '/tmp/'
 * console.log(getFileTrueName(c))
 * // => [empty string]
 *
 * c = '/foo/bar/baz/asdf/quux.html'
 * console.log(getFileTrueName(c))
 * // => quux
 *
 * c = '/foo/bar/baz/asdf/quux.txt.html'
 * console.log(getFileTrueName(c))
 * // => quux.txt
 *
 */
function getFileTrueName(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    //getFileName
    let name = getFileName(str)

    let r = ''
    try {
        r = join(dropRight(name.split('.')), '.')
    }
    catch (err) {}

    return r
}


export default getFileTrueName
