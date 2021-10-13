import path from 'path'
import fs from 'fs'
import fsCreateFolder from './fsCreateFolder.mjs'


/**
 * 後端nodejs複製資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源資料夾路徑字串
 * @param {String} fpTar 輸入目的資料夾路徑字串
 * @example
 * need test in nodejs.
 *
 * import fs from 'fs'
 * import fsCreateFolder from './src/fsCreateFolder.mjs'
 * import fsCleanFolder from './src/fsCleanFolder.mjs'
 * import fsDeleteFolder from './src/fsDeleteFolder.mjs'
 * import fsCopyFolder from './src/fsCopyFolder.mjs'
 *
 * console.log('fsCreateFolder', fsCreateFolder('./d/dd/ddd'))
 *
 * fs.writeFileSync('./d/a.txt', 'd-a', 'utf8')
 * fs.writeFileSync('./d/dd/b.txt', 'd-b', 'utf8')
 * fs.writeFileSync('./d/dd/ddd/c.txt', 'd-c', 'utf8')
 *
 * console.log('fsCleanFolder', fsCleanFolder('./d'))
 *
 * console.log('fsCreateFolder 1', fsCreateFolder('./d/ee/eee'))
 *
 * fs.writeFileSync('./d/a.txt', 'e-a', 'utf8')
 * fs.writeFileSync('./d/ee/b.txt', 'e-b', 'utf8')
 * fs.writeFileSync('./d/ee/eee/c.txt', 'e-c', 'utf8')
 *
 * console.log('fsDeleteFolder', fsDeleteFolder('./d'))
 *
 * console.log('fsCreateFolder 2', fsCreateFolder('./d/ff/fff'))
 *
 * fs.writeFileSync('./d/a.txt', 'f-a', 'utf8')
 * fs.writeFileSync('./d/ff/b.txt', 'f-b', 'utf8')
 * fs.writeFileSync('./d/ff/fff/c.txt', 'f-c', 'utf8')
 *
 * console.log('fsCopyFolder', fsCopyFolder('./d', './e'))
 *
 * // fsCreateFolder { success: 'done: ./d/dd/ddd' }
 * // fsCleanFolder { success: 'done: ./d' }
 * // fsCreateFolder 1 { success: 'done: ./d/ee/eee' }
 * // fsDeleteFolder { success: 'done: ./d' }
 * // fsCreateFolder 2 { success: 'done: ./d/ff/fff' }
 * // fsCopyFolder { success: 'done: ./e' }
 */
function fsCopyFolder(fpSrc, fpTar) {

    //複製資料夾
    try {

        fs.readdirSync(fpSrc).forEach(function(file) {

            //fpSrcTemp, fpTarTemp
            let fpSrcTemp = fpSrc + '/' + file
            let fpTarTemp = fpTar + '/' + file

            //current
            let current = fs.lstatSync(fpSrcTemp)

            //proc
            if (current.isDirectory()) {

                //fsCreateFolder
                fsCreateFolder(path.dirname(fpTarTemp))

                //fsCopyFolder
                fsCopyFolder(fpSrcTemp, fpTarTemp)

            }
            else if (current.isSymbolicLink()) {

                //symlinkSync
                let symlink = fs.readlinkSync(fpSrcTemp)
                fs.symlinkSync(symlink, fpTarTemp)

            }
            else {

                //fsCreateFolder
                fsCreateFolder(path.dirname(fpTarTemp))

                //copyFileSync
                fs.copyFileSync(fpSrcTemp, fpTarTemp)

            }

        })

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


export default fsCopyFolder
