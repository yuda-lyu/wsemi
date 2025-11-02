// import fs from 'fs'
import get from 'lodash-es/get.js'
import getPathParent from './getPathParent.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs寫入utf-8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteTextCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @param {String} c 輸入檔案內容utf-8字串
 * @example
 * need test in nodejs.
 *
 * //see fsWriteText
 *
 */
function fsWriteTextCore(fp, c, opt = {}) {
    let errTemp = null

    //fs
    let fs = get(opt, 'fs')

    //fd
    let fd = getPathParent(fp)

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        fsCreateFolderCore(fd, { fs })
    }

    //writeFileSync
    try {
        fs.writeFileSync(fp, c, 'utf8')
    }
    catch (err) {
        // console.log(err)
        errTemp = err
    }

    if (errTemp !== null) {
        return {
            error: errTemp,
        }
    }
    return {
        success: fp,
    }
}


export default fsWriteTextCore
