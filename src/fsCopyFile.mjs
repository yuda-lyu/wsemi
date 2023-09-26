import fs from 'fs'


/**
 * 後端nodejs複製檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源資料夾路徑字串
 * @param {String} fpTar 輸入目的資料夾路徑字串
 * @example
 * need test in nodejs.
 *
 * console.log('fsCopyFile', fsCopyFile('./abc.txt', './def.txt'))
 * // fsCopyFile { success: 'done: ./def.txt' }
 *
 */
function fsCopyFile(fpSrc, fpTar) {

    //複製檔案
    try {

        //copyFileSync
        fs.copyFileSync(fpSrc, fpTar)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + fpTar
    }
}


export default fsCopyFile
