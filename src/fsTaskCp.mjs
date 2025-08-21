import fs from 'fs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import evem from './evem.mjs'
import genPm from './genPm.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'
import j2o from './j2o.mjs'
import o2j from './o2j.mjs'
import debounce from './debounce.mjs'
import ltdtDiffByKey from './ltdtDiffByKey.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsWatchFile from './fsWatchFile.mjs'


/**
 * 後端nodejs偵測指定資料夾下之檔案變化，分來源與偵測端
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTaskCp.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源端更新紀錄之資料夾路徑字串
 * @param {String} fdTar 輸入偵測端已紀錄之資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @returns {Object} 回傳物件，包含buildSrc與buildTar函數，buildSrc回傳監聽事件物件ev, 可使用ev.set進行紀錄變更，buildTar回傳監聽事件物件，可監聽change事件，並使用接收事件資訊msg內的pm做為回傳執行成功與否狀態
 * @example
 * //need test in nodejs
 *
 * import fsDeleteFile from './src/fsDeleteFile.mjs'
 * import fsCreateFolder from './src/fsCreateFolder.mjs'
 * import fsDeleteFolder from './src/fsDeleteFolder.mjs'
 * import fsTaskCp from './src/fsTaskCp.mjs'
 *
 * let test = async () => {
 *     return new Promise((resolve, reject) => {
 *         let msSrc = []
 *         let msTar = []
 *
 *         let fp = './_taskcp'
 *         fsDeleteFolder(fp) //預先清除fsTaskCp持久化數據資料夾
 *
 *         let fpc = './_taskcpSrc'
 *         fsDeleteFolder(fpc) //預先清除fsTaskCp持久化數據資料夾
 *
 *         let fpt = './_taskcpTar'
 *         fsDeleteFolder(fpt) //預先清除fsTaskCp持久化數據資料夾
 *
 *         let otk = fsTaskCp(fpc, fpt)
 *
 *         let otkSrc = otk.buildSrc()
 *         otkSrc.on('set', (msg) => {
 *             console.log(`src send task...`, msg)
 *             msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
 *         })
 *         otkSrc.on('remove', (msg) => {
 *             console.log(`src send task...`, msg)
 *             msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
 *         })
 *
 *         let otkTar = otk.buildTar()
 *         otkTar.on('change', (msg) => {
 *             // console.log('otkTar change', msg)
 *
 *             //接收任務
 *             console.log(`tar recv task...`, msg.kpCmp)
 *             msTar.push({ type: 'tar-recv', msg: JSON.stringify(msg.kpCmp) })
 *
 *             setTimeout(() => {
 *                 console.log(`tar deal task done`)
 *                 msTar.push({ type: 'tar-done', msg: JSON.stringify(msg.kpCmp) })
 *                 msg.pm.resolve()
 *             }, 1000)
 *
 *         })
 *
 *         setTimeout(() => {
 *             fsCreateFolder(fp)
 *         }, 1)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
 *             otkSrc.set('abc.txt', 'hash_a1')
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
 *             otkSrc.set('abc.txt', 'hash_a2')
 *             fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
 *             otkSrc.set('def.txt', 'hash_b1')
 *         }, 6000)
 *
 *         setTimeout(() => {
 *             fsDeleteFile(`${fp}/abc.txt`)
 *             otkSrc.remove('abc.txt')
 *         }, 9000)
 *
 *         setTimeout(() => {
 *             otkTar.clear()
 *         }, 12000)
 *
 *         setTimeout(() => {
 *             fsDeleteFolder(fp)
 *             fsDeleteFolder(fpc)
 *             fsDeleteFolder(fpt)
 *             let ms = {
 *                 msSrc,
 *                 msTar,
 *             }
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
 * // src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a1' }
 * // tar recv task... {
 * //   del: [],
 * //   add: [ { fp: 'abc.txt', hash: 'hash_a1' } ],
 * //   same: [],
 * //   diff: []
 * // }
 * // tar deal task done
 * // src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a2' }
 * // src send task... { type: 'set', fp: 'def.txt', hash: 'hash_b1' }
 * // tar recv task... {
 * //   del: [],
 * //   add: [ { fp: 'def.txt', hash: 'hash_b1' } ],
 * //   same: [],
 * //   diff: [ { fp: 'abc.txt', hash: 'hash_a2' } ]
 * // }
 * // src send task... { type: 'remove', fp: 'abc.txt' }
 * // tar deal task done
 * // tar recv task... {
 * //   del: [ { fp: 'abc.txt', hash: 'hash_a2' } ],
 * //   add: [],
 * //   same: [ { fp: 'def.txt', hash: 'hash_b1' } ],
 * //   diff: []
 * // }
 * // tar deal task done
 * // ms {
 * //   msSrc: [
 * //     {
 * //       type: 'src-send',
 * //       msg: '{"type":"set","fp":"abc.txt","hash":"hash_a1"}'
 * //     },
 * //     {
 * //       type: 'src-send',
 * //       msg: '{"type":"set","fp":"abc.txt","hash":"hash_a2"}'
 * //     },
 * //     {
 * //       type: 'src-send',
 * //       msg: '{"type":"set","fp":"def.txt","hash":"hash_b1"}'
 * //     },
 * //     { type: 'src-send', msg: '{"type":"remove","fp":"abc.txt"}' }
 * //   ],
 * //   msTar: [
 * //     {
 * //       type: 'tar-recv',
 * //       msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
 * //     },
 * //     {
 * //       type: 'tar-done',
 * //       msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
 * //     },
 * //     {
 * //       type: 'tar-recv',
 * //       msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
 * //     },
 * //     {
 * //       type: 'tar-done',
 * //       msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
 * //     },
 * //     {
 * //       type: 'tar-recv',
 * //       msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
 * //     },
 * //     {
 * //       type: 'tar-done',
 * //       msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
 * //     }
 * //   ]
 * // }
 *
 */
function fsTaskCp(fdSrc, fdTar, opt = {}) {

    //check fdSrc
    // let fdSrc = get(opt, 'fdSrc', '')
    // if (!isestr(fdSrc)) {
    //     fdSrc = './_taskcpSrc'
    // }
    if (!fsIsFolder(fdSrc)) {
        fsCreateFolder(fdSrc)
    }

    //check fdTar
    // let fdTar = get(opt, 'fdTar', '')
    // if (!isestr(fdTar)) {
    //     fdTar = './_taskcpTar'
    // }
    if (!fsIsFolder(fdTar)) {
        fsCreateFolder(fdTar)
    }

    //fpHashSrc, fpHashTar
    let fpHashSrc = `${fdSrc}/fpHash.json`
    let fpHashTar = `${fdTar}/fpHash.json`

    //_readKpOb
    let _readKpOb = (fpHash) => {
        let r = {} //儲存格式為物件
        try {
            let j = fs.readFileSync(fpHash, 'utf8')
            r = j2o(j)
        }
        catch (err) {}
        return r
    }

    //_writeKpOb
    let _writeKpOb = (fpHash, kp) => {
        try {
            let j = o2j(kp)
            fs.writeFileSync(fpHash, j, 'utf8')
        }
        catch (err) {}
    }

    //_getOb
    let _getOb = (fpHash, fp) => {

        //_readKpOb
        let kpOb = _readKpOb(fpHash)
        // console.log('kpOb', kpOb)

        //r
        let r = get(kpOb, fp, '')
        // console.log(fp, r)

        return r
    }

    //_setOb
    let _setOb = (fpHash, fp, hash) => {

        //_readKpOb
        let kpOb = _readKpOb(fpHash)
        // console.log('kpOb', kpOb)

        //save
        kpOb[fp] = hash

        //_writeKpOb
        _writeKpOb(fpHash, kpOb)

    }

    //_removeOb
    let _removeOb = (fpHash, fp) => {

        //_readKpOb
        let kpOb = _readKpOb(fpHash)
        // console.log('kpOb', kpOb)

        //delete
        if (haskey(kpOb, fp)) {
            delete kpOb[fp]
        }

        //_writeKpOb
        _writeKpOb(fpHash, kpOb)

    }

    let readKpObSrc = () => {
        return _readKpOb(fpHashSrc)
    }
    let writeKpObSrc = (kp) => {
        return _writeKpOb(fpHashSrc, kp)
    }
    let getObSrc = (fp) => {
        return _getOb(fpHashSrc, fp)
    }
    let setObSrc = (fp, hash) => {
        return _setOb(fpHashSrc, fp, hash)
    }
    let removeObSrc = (fp) => {
        return _removeOb(fpHashSrc, fp)
    }

    let readKpObTar = () => {
        return _readKpOb(fpHashTar)
    }
    let writeKpObTar = (kp) => {
        return _writeKpOb(fpHashTar, kp)
    }
    let getObTar = (fp) => {
        return _getOb(fpHashTar, fp)
    }
    let setObTar = (fp, hash) => {
        return _setOb(fpHashTar, fp, hash)
    }
    let removeObTar = (fp) => {
        return _removeOb(fpHashTar, fp)
    }

    let cvKpToLtdt = (kp) => {
        let ltdt = []
        each(kp, (v, k) => {
            ltdt.push({ fp: k, hash: v })
        })
        return ltdt
    }

    //buildSrc
    let buildSrc = () => {
        //紀錄檔案變更至fpHashSrc, 供buildTar偵測驅動使用

        //ev
        let ev = evem()

        //_set
        let _set = (fp, hash) => {
            setObSrc(fp, hash)
            ev.emit('set', { type: 'set', fp, hash })
        }

        //_remove
        let _remove = (fp) => {
            removeObSrc(fp)
            ev.emit('remove', { type: 'remove', fp })
        }

        //save
        ev.set = _set
        ev.get = getObSrc
        ev.remove = _remove
        ev.readKp = readKpObSrc
        ev.writeKp = writeKpObSrc

        return ev
    }

    //buildTar
    let buildTar = () => {
        //讀取對方紀錄fpHashSrc, 讀取自己備份紀錄fpHashTar, 偵測差異後emit觸發事件使用

        //ev
        let ev = evem()

        //dbc
        let dbc = debounce(300)

        //core
        let core = async (msg) => {
            // console.log('core', msg)

            //pm
            let pm = genPm()

            //kpSrc
            let kpSrc = readKpObSrc()

            //check
            if (!iseobj(kpSrc)) {
                //來源無紀錄檔案, 故不偵測
                pm.resolve('no src')
                return pm
            }

            //kpTar
            let kpTar = readKpObTar()

            //ltdtSrc, ltdtTar
            let ltdtSrc = cvKpToLtdt(kpSrc)
            let ltdtTar = cvKpToLtdt(kpTar)
            // console.log('kpSrc', kpSrc)
            // console.log('kpTar', kpTar)

            //ltdtDiffByKey
            let r = ltdtDiffByKey(ltdtTar, ltdtSrc, 'fp', { withInfor: false })
            // console.log('ltdtDiffByKey', r)

            //pmm, 供外部提供任務執行狀態
            let pmm = genPm()
            pmm
                .then((res) => {
                    // console.log('執行任務成功, 更新紀錄檔案', kpSrc)
                    writeKpObTar(kpSrc)
                })
                .catch(() => {
                    //執行任務失敗, 不更新紀錄檔
                })

            //emit
            ev.emit('change', { kpSrc, kpTar, kpCmp: r, pm: pmm })

            return pm
        }

        //evFile
        let evFile = fsWatchFile(fpHashSrc)
        evFile.on('change', (msg) => {
            // console.log(msg.type, getFileName(msg.fp))

            dbc(() => {
                core(msg)
                    .catch(() => {})
            })

        })

        //save
        ev.set = setObTar
        ev.get = getObTar
        ev.remove = removeObTar
        ev.readKp = readKpObTar
        ev.writeKp = writeKpObTar
        ev.clear = evFile.clear

        return ev
    }

    //r
    let r = {
        buildSrc,
        buildTar,
    }

    return r
}


export default fsTaskCp
