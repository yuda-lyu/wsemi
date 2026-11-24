import path from 'path'
import fs from 'fs'
import ot from 'dayjs'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import join from 'lodash-es/join.js'
import trim from 'lodash-es/trim.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import cstr from './cstr.mjs'
import now2str from './now2str.mjs'
import sep from './sep.mjs'
import strleft from './strleft.mjs'
import strright from './strright.mjs'
import strdelleft from './strdelleft.mjs'
import strdelright from './strdelright.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import chkFsPath from './_chkFsPath.mjs'
import getDiag from './getDiag.mjs'


/**
 * 後端顯示與紀錄log訊息
 *
 * log函數之本務為以console.log顯示並寫入log檔；本函數自身之診斷(寫入log檔失敗、呼叫端位置無法解碼、useLoc=true而無法解析呼叫堆疊)經getDiag(opt)之出口(R-DIAG-01規則14、20)：
 * 預設以console.error只輸出固定詞彙之label('[wsemi fsSrlog] can not save log'、'[wsemi fsSrlog] can not decode the caller location'、'[wsemi fsSrlog] can not parse stackLines')與安全摘要{ errType, errCode }(不輸出錯誤本體、路徑與堆疊行)；
 * opt.logDetail為true時改輸出遮罩後之細節；opt.funLog為函數時只交給它而不寫console；opt於建立時取快照
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSrlog.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fdSys=path.resolve()] 輸入工作路徑字串，若useLocRela=true時取代用，預設path.resolve()
 * @param {String} [opt.fdLog='./syslog'] 輸入儲存log檔案之資料夾位置字串，須為非空字串且不含NUL字元，非預期之輸入(非字串、空字串、含NUL字元)視為未給而改用預設，不報錯，預設'./syslog'
 * @param {String} [opt.dlm='ꓹ'] 輸入分隔log參數字串，預設'ꓹ'
 * @param {Boolean} [opt.useTime=true] 輸入是否給予紀錄時間布林值，預設true
 * @param {Boolean} [opt.useLoc=true] 輸入是否紀錄觸發程式碼位置布林值，預設true
 * @param {Boolean} [opt.useLocRela=true] 輸入當useLoc=true時，是否紀錄觸發程式碼位置改用相對工作路徑之位置布林值，預設true
 * @param {Boolean} [opt.logDetail=false] 輸入本函數自身之診斷是否於console輸出遮罩後之細節，須為true才生效，同getDiag，建立時取快照，預設false(只輸出安全摘要)
 * @param {Function} [opt.funLog=null] 輸入本函數自身之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷只交給它而不寫console(log函數本身之console.log顯示不受影響)，同getDiag，預設null
 * @returns {Function} 回傳log函數，比照console.log使用，寫入log檔失敗(如參數含循環參照、資料夾無法寫入)時經診斷出口記錄不外拋；useLoc=true而呼叫堆疊中無呼叫端之file:位置(如以setTimeout(srlog, 0, ...)直接排程呼叫)時，log函數同步拋出Error物件(can not parse stackLines)，呼叫端須自行try或改設useLoc=false
 * @example
 * need test in nodejs.
 *
 * let opt = {
 *     useTime: false,
 * }
 * let srlog = fsSrlog(opt)
 * srlog('abc', 123, 4.56, { xyz: ['a', 'bc', true, { xy: 'z' }] })
 *
 */
function fsSrlog(opt = {}) {

    //fdSys
    let fdSys = get(opt, 'fdSys', '')
    if (!isestr(fdSys)) {
        fdSys = path.resolve()
        fdSys = fdSys.replaceAll('\\', '/')
    }
    // console.log('fdSys', fdSys)

    //fdLog
    let fdLog = get(opt, 'fdLog', '')
    if (typeof fdLog !== 'string' || !isestr(fdLog) || chkFsPath(fdLog, 'opt.fdLog') !== null) { //先以typeof排除非原始字串, 免得isestr讀取物件之Symbol.toStringTag拋錯 //路徑型opt鍵: 非字串、空字串、含NUL者視為非預期而改用預設(K3、R-FS-INVALID-PATH-01), 否則建立資料夾失敗被忽略而寫檔靜默失敗
        fdLog = `./syslog`
    }
    if (!fsIsFolder(fdLog)) {
        fsCreateFolder(fdLog)
    }

    //dlm
    let dlm = get(opt, 'dlm', '')
    if (!isestr(dlm)) {
        dlm = 'ꓹ' //用特殊符號取代逗號, 供切分資料之需求
    }

    //useTime
    let useTime = get(opt, 'useTime', null)
    if (!isbol(useTime)) {
        useTime = true
    }

    //useLoc
    let useLoc = get(opt, 'useLoc', null)
    if (!isbol(useLoc)) {
        useLoc = true
    }

    //useLocRela
    let useLocRela = get(opt, 'useLocRela', null)
    if (!isbol(useLocRela)) {
        useLocRela = true
    }

    //diag, 本函數自身之診斷出口(opt.logDetail、opt.funLog, 建立時取快照; 錯誤本體、路徑與堆疊行不原樣console輸出, R-DIAG-01規則14、20; 永不拋錯)
    let diag = getDiag(opt)

    //gneFp
    let gneFp = () => {
        let cdday = ot().format('YYYY-MM-DD')
        let fp = `${fdLog}/${cdday}.log`
        return fp
    }

    async function core(time, loc, ...args) {

        //fp
        let fp = gneFp()

        //cargs
        let cargs = map(args, (v) => {
            let t = ''
            if (isobj(v) || isarr(v)) {
                t = JSON.stringify(v)
            }
            else if (isbol(v)) {
                t = v ? 'true' : 'false'
            }
            else {
                t = cstr(v)
            }
            return t
        })

        //appendFileSync
        let c = ''
        if (useTime) {
            c = `[${time}]\n`
            fs.appendFileSync(fp, c, 'utf8')
        }
        if (useLoc) {
            c = `[${loc}]\n`
            fs.appendFileSync(fp, c, 'utf8')
        }
        if (true) {
            c = `${join(cargs, `${dlm} `)}\n\n`
            fs.appendFileSync(fp, c, 'utf8')
        }

    }

    function srlog(...args) {
        // console.log(...args)

        //time
        let time = ''
        if (useTime) {
            time = now2str()
        }

        //locInfor, locInforRela
        let locInfor = ''
        let locInforRela = ''
        let stackLines = []
        if (useLoc) {

            //e
            let e = new Error()

            //stackLines
            stackLines = sep(e.stack, '\n')
            // console.log('stackLines', stackLines)

            //locInfor
            each(stackLines, (s) => {

                //trim
                s = trim(s)

                //check
                if (s.indexOf(`file:`) < 0) { //沒有file資訊則跳出
                    return true //跳出換下一個
                }
                if (s.indexOf('fsSrlog.mjs') >= 0) { //為srlog則跳出
                    return true //跳出換下一個
                }

                //ss, 依照空白切分
                let ss = sep(s, ' ')

                //尋找file:
                each(ss, (v) => {
                    if (v.indexOf('file:') >= 0) {
                        locInfor = v
                        return false //跳出
                    }
                })

                //check
                if (isestr(locInfor)) {
                    return false //跳出
                }

            })

            //清理locInfor, locInforRela
            if (isestr(locInfor)) {

                //locInfor
                if (strleft(locInfor, 1) === '(') {
                    locInfor = strdelleft(locInfor, 1)
                }
                if (strright(locInfor, 1) === ')') {
                    locInfor = strdelright(locInfor, 1)
                }
                try {
                    locInfor = decodeURIComponent(locInfor)
                }
                catch (err) {
                    diag('[wsemi fsSrlog] can not decode the caller location', diag.brief(err), () => err, 'error') //解碼失敗時照用原字串
                }

                // console.log('locInfor', locInfor, locInfor.length)
                // console.log('fdSys', fdSys, fdSys.length)

                //locInforRela
                locInforRela = locInfor
                locInforRela = strdelleft(locInforRela, 8) //去除「file:///」
                // console.log('locInforRela(strdelleft)', locInforRela)
                locInforRela = locInforRela.replace(fdSys, '')
                // console.log('locInforRela(replace)', locInforRela)

            }
            else {
                let lines = stackLines
                diag('[wsemi fsSrlog] can not parse stackLines', undefined, () => ({ stackLines: lines }), 'error') //堆疊行含本機路徑, 只在logDetail或funLog時以遮罩後細節交出
                throw new Error(`can not parse stackLines`)
            }
            // console.log('locInfor', locInfor)
            // console.log('locInforRela', locInforRela)

        }

        //ags
        let ags = []
        if (useTime) {
            ags = [
                ...ags,
                `[${time}]`
            ]
        }
        let loc = ''
        if (useLoc) {
            loc = locInfor
            if (useLocRela) {
                loc = locInforRela
            }
            ags = [
                ...ags,
                `[${loc}]`
            ]
        }
        if (true) {
            ags = [
                ...ags,
                ...args
            ]
        }

        //show log
        console.log(...ags)

        //save log, core為async且無人持有其Promise: 參數含循環參照(JSON.stringify拋錯)或寫檔失敗時即成unhandledRejection(未掛處理器之行程崩潰), 改經診斷出口記錄(diag永不拋錯; 預設只出label與{ errType, errCode }, 不帶路徑)
        core(time, loc, ...args)
            .catch((err) => {
                diag('[wsemi fsSrlog] can not save log', diag.brief(err), () => err, 'error')
            })

    }

    return srlog
}


export default fsSrlog
