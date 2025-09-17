import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import evem from './evem.mjs'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import isarr from './isarr.mjs'
import ispnum from './ispnum.mjs'
import cint from './cint.mjs'
import j2o from './j2o.mjs'
import o2j from './o2j.mjs'
import sep from './sep.mjs'
import getFileName from './getFileName.mjs'
import ltdtDiffByKey from './ltdtDiffByKey.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsGetFilesWithHashInFolder from './fsGetFilesWithHashInFolder.mjs'


/**
 * 後端nodejs偵測指定資料夾下之檔案變化
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTask.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.levelLimit=1] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案，設定null為無窮遍歷所有檔案，預設1
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
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
 *         let fpc = './_tkfs'
 *         fsDeleteFolder(fpc) //預先清除fsTask持久化數據資料夾
 *
 *         let fpt = './_test_fsTask'
 *         fsDeleteFolder(fpt) //預先清除任務資料夾
 *
 *         let fpr = './_test_fsTask_result'
 *         fsCreateFolder(fpr) //創建結果資料夾
 *
 *         let ev = fsTask(fpt, { timeInterval: 500 })
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
 *             if (msg.fn === 'abc.txt') {
 *                 //僅針對abc.txt任務
 *
 *                 if (msg.type === 'add' || msg.type === 'diff') {
 *                     //針對新增或變更任務
 *
 *                     console.log(`task[${msg.fn}]`, `content[${c}]`, 'calculating')
 *                     ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'calculating' })
 *
 *                     //模擬計算延遲
 *                     setTimeout(() => {
 *
 *                         //模擬計算完儲存結果
 *                         fs.writeFileSync(`${fpr}/res1.json`, 'res1', 'utf8')
 *                         fs.writeFileSync(`${fpr}/res2.json`, 'res2', 'utf8')
 *
 *                         //使用setResult紀錄完成分析後之關聯結果檔
 *                         ev.setResult(msg.fp, msg.hash, [
 *                             {
 *                                 type: 'file',
 *                                 path: `${fpr}/res1.json`,
 *                             },
 *                             {
 *                                 type: 'file',
 *                                 path: `${fpr}/res2.json`,
 *                             },
 *                         ])
 *
 *                         console.log(`task[${msg.fn}]`, `content[${c}]`, 'save-result')
 *                         ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'save-result' })
 *
 *                         msg.pm.resolve()
 *                     }, 2000)
 *
 *                 }
 *                 else { //msg.type === 'del'
 *                     //針對任務刪除
 *
 *                     console.log(`task[${msg.fn}]`, 'remove-task')
 *                     ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-task' })
 *
 *                     //刪除任務時, 自動刪除關聯結果檔
 *                     let rrs = ev.getAndEliminateResult(msg.fp, msg.hash)
 *                     // console.log('rrs', rrs)
 *                     for (let k = 0; k < rrs.length; k++) {
 *                         fsDeleteFile(rrs[k].path)
 *                     }
 *
 *                     console.log(`task[${msg.fn}]`, 'remove-result')
 *                     ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-result' })
 *
 *                     msg.pm.resolve()
 *                 }
 *
 *             }
 *             else {
 *                 //針對其他任務
 *
 *                 console.log(`task[${msg.fn}]`, `content[${c}]`, 'skip')
 *                 ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'skip' })
 *                 msg.pm.resolve()
 *             }
 *
 *         })
 *
 *         setTimeout(() => {
 *             fsCreateFolder(fpt)
 *         }, 1)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fpt}/abc.txt`, 'abc', 'utf8')
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fpt}/abc.txt`, 'mnop', 'utf8')
 *             fs.writeFileSync(`${fpt}/def.txt`, 'def', 'utf8')
 *         }, 6000)
 *
 *         setTimeout(() => {
 *             fsDeleteFile(`${fpt}/abc.txt`)
 *         }, 9000)
 *
 *         setTimeout(() => {
 *             fsDeleteFolder(fpt) //最終階段清除任務資料夾
 *         }, 12000)
 *
 *         setTimeout(() => {
 *             ev.clear() //結束後中止ev
 *             fsDeleteFolder(fpc) //結束後清除fsTask持久化數據資料夾
 *             fsDeleteFolder(fpr) //結束後清除結果資料夾
 *             console.log('ms', ms)
 *             resolve(ms)
 *         }, 15000)
 *
 *     })
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // add abc.txt
 * // task[abc.txt] content[abc] calculating
 * // task[abc.txt] content[abc] save-result
 * // add def.txt
 * // task[def.txt] content[def] skip
 * // diff abc.txt
 * // task[abc.txt] content[mnop] calculating
 * // task[abc.txt] content[mnop] save-result
 * // del abc.txt
 * // task[abc.txt] remove-task
 * // task[abc.txt] remove-result
 * // del def.txt
 * // task[def.txt] content[] skip
 * // ms [
 * //   { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'calculating' },
 * //   { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'save-result' },
 * //   { type: 'add', fp: 'def.txt', content: 'def', mode: 'skip' },
 * //   { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'calculating' },
 * //   { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'save-result' },
 * //   { type: 'del', fp: 'abc.txt', mode: 'remove-task' },
 * //   { type: 'del', fp: 'abc.txt', mode: 'remove-result' },
 * //   { type: 'del', fp: 'def.txt', content: '', mode: 'skip' }
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

    //fpHash, fpResult
    let fpHash = `${fdStorage}/fpHash.json`
    // let fpState = `${fdStorage}/fpState.json`
    let fpResult = `${fdStorage}/fpResult.json`

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
    let calcHash = async () => {

        //kpHash
        let kpHash = {}

        //check
        if (!fsIsFolder(fd)) {
            return kpHash
        }

        //fsGetFilesWithHashInFolder
        let fps = await fsGetFilesWithHashInFolder(fd, levelLimit, { type: typeHash })
        // console.log('fps', fps)

        //push
        each(fps, (v) => {
            kpHash[v.path] = v.hash
        })

        return kpHash
    }

    //compareHashAndEmitOne
    let compareHashAndEmitOne = async () => {

        //check
        if (lock === true) {
            // console.log('locking')
            return
        }

        //kpHashsOld
        let kpHashsOld = readObHash()
        // console.log('kpHashsOld', kpHashsOld)

        //kpHashNew
        let kpHashNew = await calcHash()
        // console.log('kpHashNew', kpHashNew)

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
            // console.log('state', state)

            //hashOld
            let hashOld = get(kpHashsOld, k, '')
            // console.log(v, 'hashOld', hashOld)

            //hashNew
            let hashNew = get(kpHashNew, k, '')
            // console.log(v, 'hashNew', hashNew)

            //hash
            let hash = ''
            if (v === 'del') {
                hash = hashOld
            }
            else {
                hash = hashNew
            }

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
            ev.emit('change', { type, fp, fn, hash, pm })

            //wait
            pm
                .then(() => {

                    //kpHashsModify
                    let kpHashsModify = cloneDeep(kpHashsOld)

                    //update
                    kpHashsModify[fp] = kpHashNew[fp]

                    //writeObHash
                    writeObHash(kpHashsModify)

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

    //readObResult
    let readObResult = () => {
        let r = {} //儲存格式為物件
        try {
            let j = fs.readFileSync(fpResult, 'utf8')
            r = j2o(j)
        }
        catch (err) {}
        return r
    }

    //writeObResult
    let writeObResult = (r = {}) => {
        try {
            let j = o2j(r)
            fs.writeFileSync(fpResult, j, 'utf8')
        }
        catch (err) {}
    }

    //getObResult
    let getObResult = (fp, hash) => {

        //key
        let key = `${fp}|${hash}`

        //readObResult
        let kpResult = readObResult()
        // console.log('kpResult', kpResult)

        //result
        let result = get(kpResult, key, [])
        // console.log(key, 'result', result)

        //check
        if (!isarr(result)) {
            console.log(`result for key[${key}] is not an array`)
        }

        return result
    }

    //eliminateObResult
    let eliminateObResult = (kpResult, fp) => {
        let kp = {}
        each(kpResult, (rs, key) => {
            let s = sep(key, '|')
            let _fp = get(s, 0, '')
            // let _hash = get(s, 1, '')
            if (_fp !== fp) {
                kp[key] = rs
            }
        })
        return kp
    }

    //getAndEliminateObResult
    let getAndEliminateObResult = (fp, hash) => {

        //key
        let key = `${fp}|${hash}`

        //readObResult
        let kpResult = readObResult()
        // console.log('kpResult', kpResult)

        //result
        let result = get(kpResult, key, [])
        // console.log(key, 'result', result)

        //check
        if (!isarr(result)) {
            console.log(`result for key[${key}] is not an array`)
        }

        //eliminateObResult
        kpResult = eliminateObResult(kpResult, fp)
        // console.log('kpResult(modify)', kpResult)

        //writeObResult
        writeObResult(kpResult)

        return result
    }

    //setObResult
    let setObResult = (fp, hash, result) => {

        //check
        if (!isarr(result)) {
            console.log(`result is not an array, default to []`)
            result = []
        }

        //key
        let key = `${fp}|${hash}`

        //readObResult
        let kpResult = readObResult()
        // console.log('kpResult', kpResult)

        //update
        kpResult[key] = result
        // console.log('kpResult(modify)', kpResult)

        //writeObResult
        writeObResult(kpResult)

    }

    //timer
    let t = setInterval(() => {

        //compareHashAndEmitOne
        compareHashAndEmitOne()
            .catch(() => {})

    }, timeInterval)

    //clear
    let clear = () => {
        clearInterval(t)
    }

    //save
    // ev.getState = getObState
    // ev.setState = setObState
    ev.getResult = getObResult
    ev.getAndEliminateResult = getAndEliminateObResult
    ev.setResult = setObResult
    ev.clear = clear

    return ev
}


export default fsTask
