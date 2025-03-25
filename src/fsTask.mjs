import path from 'path'
import fs from 'fs'
import ot from 'dayjs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import values from 'lodash-es/values.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import evem from './evem.mjs'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import ispnum from './ispnum.mjs'
import cint from './cint.mjs'
import j2o from './j2o.mjs'
import o2j from './o2j.mjs'
import haskey from './haskey.mjs'
import getFileName from './getFileName.mjs'
import ltdtDiffByKey from './ltdtDiffByKey.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsGetFilesWithHashInFolder from './fsGetFilesWithHashInFolder.mjs'


/**
 * 後端nodejs偵測指定資料夾下之檔案變化，僅偵測新增與變更檔案，不偵測刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTask.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {String} [opt.type='md5'] 輸入計算HASH方法，預設'md5'
 * @param {Number} [opt.timeInterval=60000] 輸入定時器偵測時長正整數，單位為毫秒ms，預設60000，為1分鐘
 * @returns {Object} 回傳事件物件，包含run、stop函數，on可進行監聽指定事件，run為啟動偵測函數，stop為停止偵測函數
 * @example
 * //need test in nodejs
 *
 * import fsDeleteFile from './src/fsDeleteFile.mjs'
 * import fsCreateFolder from './src/fsCreateFolder.mjs'
 * import fsDeleteFolder from './src/fsDeleteFolder.mjs'
 * import fsTask from './src/fsTask.mjs'
 *
 * let test = async () => {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *
 *         fsDeleteFolder('./_tkfs')
 *
 *         let fp = './_test_for_fsTask'
 *         fsDeleteFolder(fp)
 *
 *         let ev = fsTask(fp, { timeInterval: 500 })
 *         ev.on('change', (msg) => {
 *             console.log(msg.type, msg.fn)
 *
 *             //content
 *             let c = ''
 *             try {
 *                 c = fs.readFileSync(msg.fp, 'utf8')
 *             }
 *             catch (err) {}
 *
 *             if ((msg.type === 'add' || msg.type === 'diff') && (msg.fn === 'abc.txt')) {
 *                 console.log(`task[${msg.fn}]`, `content[${c}]`, 'calculating')
 *                 ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'calculating' })
 *                 setTimeout(() => {
 *                     console.log(`task[${msg.fn}]`, `content[${c}]`, 'finish')
 *                     ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'finish' })
 *                     msg.pm.resolve()
 *                 }, 2000)
 *             }
 *             else if (msg.type === 'del') {
 *                 console.log(`task[${msg.fn}]`, 'remove result')
 *                 ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-result' })
 *                 msg.pm.resolve()
 *             }
 *             else {
 *                 console.log(`task[${msg.fn}]`, `content[${c}]`, 'skip')
 *                 ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'skip' })
 *                 msg.pm.resolve()
 *             }
 *
 *         })
 *
 *         setTimeout(() => {
 *             fsCreateFolder(fp)
 *         }, 1)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
 *             fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
 *         }, 6000)
 *
 *         setTimeout(() => {
 *             fsDeleteFile(`${fp}/abc.txt`)
 *         }, 9000)
 *
 *         setTimeout(() => {
 *             fsDeleteFolder(fp)
 *         }, 12000)
 *
 *         setTimeout(() => {
 *             ev.clear()
 *             fsDeleteFolder('./_tkfs')
 *             console.log('ms', ms)
 *             resolve(ms)
 *         }, 15000)
 *
 *     })
 * }
 * test()
 *     .catch(() => {})
 * // add abc.txt
 * // task[abc.txt] content[abc] calculating
 * // task[abc.txt] content[abc] finish
 * // diff abc.txt
 * // task[abc.txt] content[mnop] calculating
 * // task[abc.txt] content[mnop] finish
 * // add def.txt
 * // task[def.txt] content[def] skip
 * // del abc.txt
 * // task[abc.txt] remove result
 * // del def.txt
 * // task[def.txt] remove result
 * // ms [
 * //   { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'calculating' },
 * //   { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'finish' },
 * //   { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'calculating' },
 * //   { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'finish' },
 * //   { type: 'add', fp: 'def.txt', content: 'def', mode: 'skip' },
 * //   { type: 'del', fp: 'abc.txt', mode: 'remove-result' },
 * //   { type: 'del', fp: 'def.txt', mode: 'remove-result' }
 * // ]
 *
 */
function fsTask(fd, opt = {}) {

    //fdStorage
    let fdStorage = get(opt, 'fdStorage', '')
    if (!isestr(fdStorage)) {
        fdStorage = './_tkfs'
    }

    //levelLimit
    let levelLimit = get(opt, 'levelLimit', '')
    if (!ispint(levelLimit)) {
        levelLimit = 1
    }
    levelLimit = cint(levelLimit)

    //typeHash
    let typeHash = get(opt, 'typeHash', '')
    if (!isestr(typeHash)) {
        typeHash = 'md5'
    }

    //timeInterval
    let timeInterval = get(opt, 'timeInterval')
    if (!ispnum(timeInterval)) {
        timeInterval = 60 * 1000 //1min
    }
    timeInterval = cint(timeInterval)

    //fsCreateFolder
    fsCreateFolder(fdStorage)

    //ev
    let ev = evem()

    //lock
    let lock = false

    //fpHash
    let fpHash = `${fdStorage}/fpHash.json`
    // let fpState = `${fdStorage}/fpState.json`
    // let fpResult = `${fdStorage}/fpResult.json`

    //readObHash
    let readObHash = () => {
        let r = {} //儲存格式為物件
        try {
            let j = fs.readFileSync(fpHash, 'utf8')
            r = j2o(j)
        }
        catch (err) {}
        return r
    }

    //writeObHash
    let writeObHash = (r) => {
        try {
            let j = o2j(r)
            fs.writeFileSync(fpHash, j, 'utf8')
        }
        catch (err) {}
    }

    //calcHash
    let calcHash = () => {

        //kpHash
        let kpHash = {}

        //check
        if (!fsIsFolder(fd)) {
            return kpHash
        }

        //fsGetFilesWithHashInFolder
        let fps = fsGetFilesWithHashInFolder(fd, levelLimit, { type: typeHash })
        // console.log('fps', fps)

        //push
        each(fps, (v) => {
            kpHash[v.path] = v.hash
        })

        return kpHash
    }

    //compareHashAndEmitOne
    let compareHashAndEmitOne = () => {

        //check
        if (lock === true) {
            // console.log('locking')
            return
        }

        //kpHashsOld
        let kpHashsOld = readObHash()
        // console.log('kpHashsOld', kpHashsOld)

        //kpHashNew
        let kpHashNew = calcHash()
        // console.log('kpHashNew', kpHashNew)

        // //getObKpState
        // let kpState = getObKpState(kpHashNew)
        // // console.log('kpState', kpState)

        // //_getObState
        // let _getObState = (fp) => {
        //     let state = get(kpState, fp, 'none')
        //     return state //可能為none, doing, finish
        // }

        // //check state
        // if (true) {
        //     let b = false
        //     each(kpHashNew, (_, path) => {
        //         let state = _getObState(path)
        //         if (state === 'doing') {
        //             // console.log(`state of path[${path}] is ${state}`)
        //             b = true
        //             return false //跳出
        //         }
        //     })
        //     if (b) {
        //         return
        //     }
        // }

        //hsOld
        let hsOld = map(kpHashsOld, (hash, path) => {
            return { path, hash }
        })
        // console.log('hsOld', hsOld)

        //hsNew
        let hsNew = map(kpHashNew, (hash, path) => {
            return { path, hash }
        })
        // console.log('hsNew', hsNew)

        //rd
        let rd = ltdtDiffByKey(hsOld, hsNew, 'path')
        // console.log('rd.infor', rd.infor)

        //emit
        each(rd.infor, (v, k) => {

            //check, 未變更則跳出
            if (v === 'same') {
                return true //跳出換下一個
            }

            // //check, 刪除監聽檔案時清除state
            // if (v === 'del') {
            //     setObState(k, 'none')
            // }

            // //states
            // let state = _getObState(k)
            // // console.log('state', state)

            // //hashNew
            // let hashNew = get(kpHashNew, k, '')

            // //result
            // let result = getObResult(k, hashNew)

            // //check, 若有結果則跳出
            // if (result === 'yes') {
            //     return true //跳出換下一個
            // }

            //type, fp, fn
            let type = v
            let fp = k
            let fn = getFileName(k)

            //lock
            lock = true

            //pm
            let pm = genPm()

            //emit
            // ev.emit('change', { type, state, fp, fn, pm })
            ev.emit('change', { type, fp, fn, pm })

            //wait
            pm
                .then(() => {

                    //kpHashsModify
                    let kpHashsModify = cloneDeep(kpHashsOld)

                    //update
                    kpHashsModify[fp] = kpHashNew[fp]

                    //writeObHash
                    writeObHash(kpHashsModify)

                    // setObResult

                })
                .finally(() => {

                    //unlock
                    lock = false

                })

            return false //跳出
        })

    }

    // //readObState
    // let readObState = () => {
    //     let r = {} //儲存格式為物件
    //     try {
    //         let j = fs.readFileSync(fpState, 'utf8')
    //         r = j2o(j)
    //     }
    //     catch (err) {}
    //     return r
    // }

    // //writeObState
    // let writeObState = (r = {}) => {
    //     try {
    //         let j = o2j(r)
    //         fs.writeFileSync(fpState, j, 'utf8')
    //     }
    //     catch (err) {}
    // }

    // //getObKpState, 基於指定任務hs與已儲存狀態kpStateOld, 回傳各任務狀態kpStateNow
    // let getObKpState = (kpHash) => {

    //     //kpStateOld
    //     let kpStateOld = readObState()
    //     // console.log('kpStateOld', kpStateOld)

    //     //kpStateNow, 當前任務狀態
    //     let kpStateNow = {}
    //     each(kpHash, (_, path) => {
    //         // console.log('h', h)

    //         //state
    //         let state = get(kpStateOld, path, '')
    //         if (state !== 'doing' && state !== 'finish') {
    //             state = 'none'
    //         }
    //         // console.log('state', state)

    //         //update
    //         kpStateNow[path] = state

    //     })
    //     // console.log('kpStateNow', kpStateNow)

    //     return kpStateNow
    // }

    // //getObState, 基於已儲存狀態kpState, 取得fp(絕對檔名或檔名)之狀態
    // let getObState = (fp) => {

    //     //readObState
    //     let kpState = readObState()
    //     // console.log('kpState', kpState)

    //     //check fp
    //     if (haskey(kpState, fp)) {
    //         let state = get(kpState, fp, 'none')
    //         return state
    //     }

    //     //check fn
    //     if (true) {
    //         let state = 'none'
    //         each(kpState, (_state, _fp) => {
    //             let _fn = getFileName(_fp)
    //             if (fp === _fn) { //輸入fp實際是fn
    //                 state = _state
    //                 return false //跳出
    //             }
    //         })
    //         return state
    //     }

    // }

    // //setObState, 針對絕對檔名fp變更儲存狀態
    // let setObState = (fp, state) => {

    //     //check
    //     if (state !== 'none' && state !== 'doing' && state !== 'finish') {
    //         throw new Error(`state[${state}] must be one of ['none', 'doing', 'finish']`)
    //     }

    //     //readObState
    //     let kpState = readObState()
    //     // console.log('kpState', kpState)

    //     //update
    //     kpState[fp] = state

    //     //writeObState
    //     writeObState(kpState)

    // }

    // //compareState
    // let compareState = () => {
    // }

    // //writeObState
    // writeObState({}) //一啟動就清空fpState

    // //readObResult
    // let readObResult = () => {
    //     let r = {} //儲存格式為物件
    //     try {
    //         let j = fs.readFileSync(fpResult, 'utf8')
    //         r = j2o(j)
    //     }
    //     catch (err) {}
    //     return r
    // }

    // //writeObResult
    // let writeObResult = (r = {}) => {
    //     try {
    //         let j = o2j(r)
    //         fs.writeFileSync(fpResult, j, 'utf8')
    //     }
    //     catch (err) {}
    // }

    // //getObResult
    // let getObResult = (fp, hash) => {

    //     //key
    //     let key = `${fp}|${hash}`

    //     //readObResult
    //     let kpResult = readObResult()
    //     // console.log('kpResult', kpResult)

    //     //result
    //     let result = get(kpResult, key, 'no')

    //     return result
    // }

    // //setObResult
    // let setObResult = (fp, hash, result) => {

    //     //check
    //     if (result !== 'no' && result !== 'yes') {
    //         throw new Error(`result[${result}] must be one of ['no', 'yes']`)
    //     }

    //     //key
    //     let key = `${fp}|${hash}`

    //     //readObResult
    //     let kpResult = readObResult()
    //     // console.log('kpResult', kpResult)

    //     //update
    //     kpResult[key] = result

    //     //writeObResult
    //     writeObResult(kpResult)

    // }

    //timer
    let t = setInterval(() => {

        //compareHashAndEmitOne
        compareHashAndEmitOne()

    }, timeInterval)

    // // let rs = []
    // each(fps, (v) => {

    //     //default
    //     if (!haskey(kpHash, v.path)) {
    //         kpHash[v.path] = ''
    //     }

    //     //hash_ori
    //     let hash_ori = get(kpHash, v.path, '')

    //     //hash_new
    //     let hash_new = get(v, 'hash', '')

    //     //check
    //     if (!isestr(hash_new)) {
    //         return true //跳出換下一個
    //     }

    //     //check
    //     if (hash_ori === hash_new) {
    //         return true //跳出換下一個
    //     }

    //     //save
    //     kpHash[v.path] = hash_new

    //     // //push
    //     // rs.push(v.path)

    //     //emit

    // })
    // console.log('size(rs)', size(rs))

    // //core
    // let t = null
    // let b = false
    // let kpHash = {}
    // let core = () => {

    //     //check
    //     if (b) {
    //         return
    //     }

    //     //lock
    //     b = true

    //     //compareHashAndEmitOne
    //     compareHashAndEmitOne()

    //     // //check
    //     // if (!fsIsFolder(fd)) {
    //     //     console.log(`fd[${fd}] does not exist`)
    //     //     return
    //     // }

    //     // //fsGetFilesWithHashInFolder
    //     // let fps = fsGetFilesWithHashInFolder(fd, levelLimit, { type: typeHash })
    //     // // console.log('fps', fps)

    //     // // let rs = []
    //     // each(fps, (v) => {

    //     //     //default
    //     //     if (!haskey(kpHash, v.path)) {
    //     //         kpHash[v.path] = ''
    //     //     }

    //     //     //hash_ori
    //     //     let hash_ori = get(kpHash, v.path, '')

    //     //     //hash_new
    //     //     let hash_new = get(v, 'hash', '')

    //     //     //check
    //     //     if (!isestr(hash_new)) {
    //     //         return true //跳出換下一個
    //     //     }

    //     //     //check
    //     //     if (hash_ori === hash_new) {
    //     //         return true //跳出換下一個
    //     //     }

    //     //     //save
    //     //     kpHash[v.path] = hash_new

    //     //     // //push
    //     //     // rs.push(v.path)

    //     //     //emit

    //     // })
    //     // // console.log('size(rs)', size(rs))

    //     // //check
    //     // if (size(rs) > 0) {

    //     //     //emit
    //     //     ev.emit('change', rs)

    //     // }

    //     //unlock
    //     b = false

    // }

    //clear
    let clear = () => {
        clearInterval(t)
    }

    //save
    // ev.getState = getObState
    // ev.setState = setObState
    ev.clear = clear

    return ev
}


export default fsTask
