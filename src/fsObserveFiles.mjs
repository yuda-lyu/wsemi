import fs from 'fs'
import ot from 'dayjs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import evem from './evem.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import ispnum from './ispnum.mjs'
import cdbl from './cdbl.mjs'
import haskey from './haskey.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsGetFilesWithHashInFolder from './fsGetFilesWithHashInFolder.mjs'


/**
 * 後端nodejs偵測指定資料夾下之檔案變化，僅偵測新增與變更檔案，不偵測刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsObserveFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {String} [opt.type='md5'] 輸入計算HASH方法，預設'md5'
 * @param {Number} [opt.interval=60000] 輸入定時器偵測時長正整數，預設60000，為1分鐘
 * @param {Boolean} [opt.useReadContent=true] 輸入是否自動讀取檔案內容並用字串儲存至鍵content內布林值，預設true
 * @param {Boolean} [opt.useShowLog=false] 輸入是否顯示內建log訊息布林值，預設false
 * @returns {Object} 回傳物件，包含ev、run、stop，ev為EventEmitter，run為啟動偵測函數，stop為停止偵測函數
 * @example
 * //need test in nodejs
 *
 * let p = fsObserveFiles(fd, { levelLimit: 1, type: 'md5', interval: 60000 })
 * console.log(rs)
 * p.ev.on('change', (rs) => {
 *   console.log('rs', rs)
 * })
 * p.run()
 *
 */
function fsObserveFiles(fd, opt = {}) {

    //levelLimit
    let levelLimit = get(opt, 'levelLimit', '')
    if (!ispint(levelLimit)) {
        levelLimit = 1
    }

    //type
    let type = get(opt, 'type', '')
    if (!isestr(type)) {
        type = 'md5'
    }

    //interval
    let m = get(opt, 'interval')
    if (!ispnum(m)) {
        m = 60 * 1000 //1min
    }
    m = cdbl(m)

    //useReadContent
    let useReadContent = get(opt, 'useReadContent')
    if (!isbol(useReadContent)) {
        useReadContent = true
    }

    //useShowLog
    let useShowLog = get(opt, 'useShowLog')
    if (!isbol(useShowLog)) {
        useShowLog = false
    }

    let ev = evem()
    let t = null
    let b = false
    let kp = {}

    //core
    let core = () => {

        //check
        if (b) {
            return
        }
        b = true
        if (useShowLog) {
            console.log('fsObserveFiles run...', ot().format('YYYY-MM-DDTHH:mm:ss'))
        }

        //check
        if (!fsIsFolder(fd)) {
            if (useShowLog) {
                console.log('fsObserveFiles finish')
            }
            return
        }

        //fsGetFilesWithHashInFolder
        let fps = fsGetFilesWithHashInFolder(fd, levelLimit, { type })
        // console.log('fps', fps)

        //rs
        let rs = []
        each(fps, (v) => {

            //check
            if (!haskey(kp, v.path)) {
                kp[v.path] = {
                    hash: '',
                    content: '',
                }
            }

            //hash_ori
            let hash_ori = get(kp, v.path, {})
            hash_ori = get(hash_ori, 'hash', '')

            //hash_new
            let hash_new = get(v, 'hash', '')

            //check
            if (!isestr(hash_new)) {
                return true //跳出換下一個
            }

            //check
            if (hash_ori === hash_new) {
                return true //跳出換下一個
            }

            //readFileSync
            let content = ''
            if (useReadContent) {
                content = fs.readFileSync(v.path, 'utf8')
            }

            //save
            kp[v.path] = {
                hash: hash_new,
                content,
            }

            //r
            let r = {
                path: v.path,
            }
            if (useReadContent) {
                r.content = content
            }

            //push
            rs.push(r)

        })
        // console.log('size(rs)', size(rs))

        //check
        if (size(rs) > 0) {

            //emit
            ev.emit('change', rs)

        }

        b = false
        if (useShowLog) {
            console.log('fsObserveFiles finish')
        }
    }

    let run = () => {
        core()
        t = setInterval(() => {
            core()
        }, m)
    }

    let stop = () => {
        clearInterval(t)
    }

    return {
        ev,
        run,
        stop,
    }
}


export default fsObserveFiles
