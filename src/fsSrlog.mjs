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


/**
 * 後端顯示與紀錄log訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSrlog.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fdSys=path.resolve()] 輸入工作路徑字串，若useLocRela=true時取代用，預設path.resolve()
 * @param {String} [opt.fdLog='./syslog'] 輸入儲存log檔案之資料夾位置字串，預設'./syslog'
 * @param {String} [opt.dlm='ꓹ'] 輸入分隔log參數字串，預設'ꓹ'
 * @param {Boolean} [opt.useTime=true] 輸入是否給予紀錄時間布林值，預設true
 * @param {Boolean} [opt.useLoc=true] 輸入是否紀錄觸發程式碼位置布林值，預設true
 * @param {Boolean} [opt.useLocRela=true] 輸入當useLoc=true時，是否紀錄觸發程式碼位置改用相對工作路徑之位置布林值，預設true
 * @returns {Function} 回傳log函數，比照console.log使用
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

    //fdLog
    let fdLog = get(opt, 'fdLog', '')
    if (!isestr(fdLog)) {
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
                    console.log(err)
                }

                //locInforRela
                locInforRela = locInfor.replace(fdSys, '')
                locInforRela = strdelleft(locInforRela, 8)

            }
            else {
                console.log('stackLines', stackLines)
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

        //save log
        core(time, loc, ...args)

    }

    return srlog
}


export default fsSrlog
