import getPathInFolder from './getPathInFolder.mjs'


/**
 * 列舉指定資料夾下的全部資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getPathInFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {string} [filterName=''] 輸入欲過濾名稱字串，預設為''
 * @returns {Array} 回傳列舉檔案或資料夾陣列
 * @example
 * let fd = 'folder p'
 * getPathInFolder(fd, true)
 * // => ['folder p4','folder p5']
 */
function getFoldersInFolder(fd, filterName = '') {
    return getPathInFolder(fd, true, filterName)
}


export default getFoldersInFolder
