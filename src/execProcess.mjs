import cst from './_const.mjs'
import codec from './_execProcessCodec.mjs'
import cp from 'child_process'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import isstr from './isstr.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import strleft from './strleft.mjs'
import strright from './strright.mjs'
import arrHas from './arrHas.mjs'
import execProcessKillPid from './execProcessKillPid.mjs'
import execSpawnError from './_execSpawnError.mjs'
import callUser from './_callUser.mjs'


/**
 * 呼叫執行檔執行
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execProcess.test.mjs Github}
 * @memberOf wsemi
 * @param {String} prog 輸入執行檔或程式語言位置字串，若為註冊系統的全域指令，例如可直接給'Python'，腳本需自行接收呼叫引數，並將回傳資料轉json字串後print/log到dos視窗，即可由nodejs接收
 * @param {String|Array} args 輸入參數陣列或字串，例如腳本檔案位置字串，空陣列或空字串代表無參數；非陣列亦非字串時reject錯誤訊息(不拋錯)
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.mode='spawn'] 輸入執行模式字串，可選'spawn'、'exec'、'execFile'，預設'spawn'。'spawn'不經shell直接執行，輸出以串流處理，適合大量輸出或長時間執行，prog與args不需也不可加引號；'exec'經shell執行，prog與args以空白串接成指令字串，適合須用到shell語法之情形，陣列型args之元素含空白且未含雙引號者會自動以雙引號包住，prog含空白亦同，已含雙引號者視為呼叫端自行處理而原樣串接，字串型args視為呼叫端已自組之指令列，原樣串接不加引號；'execFile'不經shell直接執行可執行檔，args須為陣列，給字串會被當成單一參數。三種模式之stdout與stderr皆以Buffer接收後走同一條解碼路徑；惟'exec'與'execFile'之stdout或stderr超過1MB(node之maxBuffer預設值)時子程序會被node終止，reject為`code[null]:\n訊息`，大量輸出請用'spawn'
 * @param {Function} [opt.cbStdout=null] 輸入回調stdout函數，預設null。收到的是經串流解碼之字串，多位元組字元跨chunk時會等到完整才給，故不會收到空字串；codeCmd為'auto'時回調為盡力判定，該串流首次遇到非utf-8位元組後才改用系統字碼頁，之前已回調之字串不追溯，最終結果以resolve或reject之字串為準。回調內拋出之錯誤不會被攔截，將成為未捕捉例外，請於回調內自行處理(該錯誤於回調返回後立即(微任務)原樣重拋，不影響本函數之落定與結果字串)
 * @param {Function} [opt.cbStderr=null] 輸入回調stderr函數，預設null，行為同cbStdout
 * @param {String} [opt.codeCmd='utf8'] 輸入解碼stdout與stderr之編碼字串，預設'utf8'。可給TextDecoder支援之標籤，例如'utf8'、'big5'、'gbk'、'gb18030'、'shift_jis'、'euc-kr'、'euc-jp'、'latin1'、'utf-16le'，亦可給Windows字碼頁編號寫法如'cp950'、'950'、'cp936'、'cp932'、'cp949'、'cp437'、'cp1252'；給'system'表示用當前作業系統字碼頁，win32以chcp查詢一次後快取，其他平台為utf-8；給'auto'表示先以utf-8嚴格解碼，遇非utf-8位元組之串流改用系統字碼頁，適合不確定子程序輸出編碼之情形，例如Windows原生指令與以ANSI字碼頁輸出之打包程式。非有效字串視為未設定而用預設值，有效字串但不支援之編碼則於執行前reject並帶該標籤。輸出開頭之utf-8 BOM會被移除
 * @param {Boolean} [opt.useChcp=false] 輸入是否於指令前置chcp 65001，僅'exec'模式生效，預設false。可使主控台工具改以utf-8輸出，副作用是其訊息語言可能變為英文；使用時codeCmd請維持預設'utf8'或給'auto'，不要搭配'system'
 * @param {Number} [opt.timeout=null] 輸入逾時毫秒數，預設null表示不限制；逾時觸發時會調用execProcessKillPid強制關閉子進程及其子孫程序，並reject回傳逾時訊息
 * @returns {Promise} 回傳Promise，resolve回傳stdout與stderr依到達順序合併之字串，不另加換行，子程序自己的換行原樣保留；reject回傳錯誤訊息字串：離開碼非0時為`code[N]:\n訊息`，訊息為子程序之輸出，子程序因訊號結束時N為null；逾時為`timeout[Nms]:\n訊息`；無法啟動子程序時(找不到執行檔、權限不足、非有效執行檔、參數過長、參數含空字元、系統資源用盡等)為`spawn[錯誤碼]:\n訊息`，訊息為node之錯誤說明(可含執行檔路徑)，不含args之內容；args型別不符、codeCmd不支援或spawn模式prog含引號時為說明字串
 * @example
 * //need test in nodejs
 *
 * if (true) {
 *     let prog = 'taskkill'
 *     let args = ['/pid', '{pid}', '/T', '/F']
 *     let r = await execProcess(prog, args) //預設spawn
 * }
 *
 * if (true) {
 *     //Windows原生指令輸出為系統字碼頁(中文系統為big5), 給codeCmd:'auto'可自動判定, 或直接給'big5'
 *     let r = await execProcess('tasklist', ['/FI', 'IMAGENAME eq node.exe'], { codeCmd: 'auto' })
 * }
 *
 * if (true) {
 *     //execFile與spawn之args須為陣列, 每個元素為一個參數; 給字串會被當成單一參數而失敗
 *     //密碼置於命令列參數時同機其他使用者可由程序列表看到; 失敗訊息不含args, 但子程序自身之輸出可能回顯
 *     let prog = `C:\\Program Files\\7-Zip\\7z.exe`
 *     let pw = 'AbcD1234'
 *     let args = ['a', 'abc.7z', 'abc.txt', `-p${pw}`]
 *     execProcess(prog, args, { mode: 'execFile' })
 *         .then(function(data) {
 *             console.log('then', data)
 *         })
 *         .catch(function(data) {
 *             console.log('catch', data)
 *         })
 * }
 *
 */
function execProcess(prog, args, opt = {}) {

    //mode
    // spawn: 非同步執行命令，適合處理大量資料或長時間執行的程式，輸出以串流方式處理。spawnSync 為 spawn 的同步版本。
    // exec: 在 shell 中非同步執行命令，輸出被緩衝，適合輸出量較小的情況。execSync 為 exec 的同步版本。
    // execFile: 直接執行可執行檔案，不經過 shell，非同步執行，適合執行已知的可執行檔案。execFileSync 為 execFile 的同步版本。
    let mode = get(opt, 'mode')
    if (mode !== 'spawn' && mode !== 'exec' && mode !== 'execFile') {
        mode = 'spawn'
    }
    // console.log('mode',mode)

    //cbStdout
    let cbStdout = get(opt, 'cbStdout')

    //cbStderr
    let cbStderr = get(opt, 'cbStderr')

    //codeCmd, 正規化為{ mode, label }, 非有效字串為utf-8, 不支援之標籤為null於下方reject
    let codeCmd = get(opt, 'codeCmd')
    let cc = codec.normalizeCodeCmd(codeCmd)

    //useChcp
    let useChcp = get(opt, 'useChcp')
    if (!isbol(useChcp)) {
        useChcp = false
    }

    //timeout
    let timeout = get(opt, 'timeout')
    if (!isnum(timeout) || timeout <= 0) {
        timeout = null
    }
    else {
        timeout = Math.min(timeout, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs
    }

    //pm
    let pm = genPm()

    //check args, 須為陣列(可為空陣列)或字串(可為空字串), 空陣列與空字串代表無參數; 其餘型別以reject回報, 不同步拋錯, 訊息不帶args之值
    if (!isarr(args) && !isstr(args)) {
        pm.reject(`args is not an array or string`)
        return pm
    }
    let bArgsStr = isestr(args) //非空字串型args於exec模式視為呼叫端已自組之指令列
    if (isestr(args)) {
        args = [args]
    }
    else if (isstr(args)) {
        args = [] //空字串代表無參數
    }

    //check
    if (!arrHas(mode, ['spawn', 'exec', 'execFile'])) {
        pm.reject(`invalid mode[${mode}]`)
        return pm
    }
    if (cc === null) {
        //不支援之編碼於執行前reject, 不得等到data事件才拋, 因事件處理器內之拋錯不在try catch範圍也不會進error事件, 會拉倒整個程序
        pm.reject(`codeCmd[${codeCmd}] is not a supported encoding`)
        return pm
    }

    //start, 建立子進程並接線, labelSystem為系統字碼頁標籤, 僅codeCmd為'auto'或'system'時需要
    let start = (labelSystem) => {

        //spawn不經shell, prog含引號會被當成檔名之一部分, 於啟動前reject
        if (mode === 'spawn') {
            let cr = strleft(prog, 1)
            let cl = strright(prog, 1)
            if (cr === `"` || cl === `"` || cr === `'` || cl === `'`) {
                pm.reject(`prog[${prog}] of spawn does not need to add quotes`)
                return
            }
        }

        //r
        let r = null
        try {
            if (mode === 'spawn') {
                // console.log('mode',mode)
                r = cp.spawn(prog, args, {
                    windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                    shell: false,
                }) //spwan的prog與args內檔案, 都不需要用單/雙引號括住, 已內建處理機制, 額外添加單/雙引號會導致錯誤
            }
            else if (mode === 'exec') {
                // console.log('mode',mode)
                let cpre = ''
                if (useChcp) {
                    cpre = `cmd /c chcp 65001>nul &&`
                }
                //quote, 含空白且未含雙引號者以雙引號包住, 使陣列型args之元素與spawn/execFile之參數語意一致(否則shell會把'IMAGENAME eq X'拆成三個參數); 已含雙引號者視為呼叫端自行處理; 字串型args為呼叫端自組之指令列, 原樣串接
                let quote = (s) => {
                    s = String(s)
                    if (/\s/.test(s) && !s.includes('"')) {
                        return `"${s}"`
                    }
                    return s
                }
                let cprog = quote(prog)
                let cargs = bArgsStr ? args[0] : args.map(quote).join(' ')
                // console.log(`${cpre} ${cprog} ${cargs} & exit`)
                r = cp.exec(`${cpre} ${cprog} ${cargs} & exit`, {
                    windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                    encoding: 'buffer', //以Buffer接收, 與spawn走同一條解碼路徑; 若交給node之encoding, 其不支援big5等且不認識之編碼會被靜默忽略
                })
            }
            else if (mode === 'execFile') {
                // console.log('mode',mode)
                r = cp.execFile(prog, args, {
                    windowsHide: true, //執行的主程序若沒有主控台調用執行程序就不會有視窗, 但若通過pm2執行會有, 須設定windowsHide=true
                    encoding: 'buffer', //同exec
                })
            }
        }
        catch (err) {
            //同步拋錯(EPERM、UNKNOWN、ENAMETOOLONG、參數檢查錯誤等), 轉為不含參數值之字串
            let e = execSpawnError(err)
            pm.reject(`spawn[${e.code}]:\n${e.message}`)
            return
        }

        //timer, bTimeout, 逾時計時器於下方設定, 先宣告供error與close使用
        let timer = null
        let bTimeout = false

        //error, 須於存取stdout與stderr前監聽: node對EMFILE、ENFILE不建立stdio即於nextTick發出'error', 先存取會拋TypeError且'error'無人監聽而拉倒程序
        //  可能為'找不到可執行檔','權限不足','系統資源用盡'等, node所附之spawnargs含完整參數(exec模式為整條指令列), 故轉為不含參數值之字串
        r.on('error', (err) => {
            if (timer !== null) {
                clearTimeout(timer)
            }
            let e = execSpawnError(err)
            pm.reject(`spawn[${e.code}]:\n${e.message}`)
        })

        //decOut, decErr, stdout與stderr各持一個串流解碼器, 多位元組字元跨chunk時由解碼器暫存, 不會被切成U+FFFD
        let label = cc.label
        if (cc.mode === 'system') {
            label = labelSystem
        }
        else if (cc.mode === 'auto') {
            label = 'auto'
        }
        let decOut = codec.createDecoder(label, { labelSystem })
        let decErr = codec.createDecoder(label, { labelSystem })

        //segs, 依到達順序保存各chunk解碼後之字串, 'auto'時另保存原始chunk, 供該串流改判為系統字碼頁後重播
        let segs = []
        let retain = (cc.mode === 'auto')

        //onData, 解碼後推入segs並回呼, 空字串(該chunk僅含尚未完整之多位元組序列)不回呼
        let onData = (which, dec, cb) => {
            return (data) => {
                let buf = data
                if (!Buffer.isBuffer(buf)) {
                    buf = Buffer.from(String(buf))
                }
                let text = dec.write(buf)
                segs.push({ which, text, buf: retain ? buf : null })
                if (text !== '' && isfun(cb)) {
                    callUser(cb, text)
                }
            }
        }

        //stdout data, EMFILE、ENFILE時node未建立stdio(undefined), 由上方error回報
        if (r.stdout) {
            r.stdout.on('data', onData('out', decOut, cbStdout))
        }

        //stderr data, 太多程式把warning或log輸出到stderr, 已無法視為有err發生
        if (r.stderr) {
            r.stderr.on('data', onData('err', decErr, cbStderr))
        }

        //buildMsg, 於close時收尾: 各解碼器flush, 'auto'且已改判之串流以全新解碼器重播原始chunk, 最後依到達順序合併, 不另加換行(chunk切點由作業系統決定, 附加換行會落在子程序輸出的任意位置)
        let buildMsg = () => {
            let flush = (which, dec, cb) => {
                let text = dec.end()
                if (text === '') {
                    return
                }
                segs.push({ which, text, buf: null })
                if (isfun(cb)) {
                    callUser(cb, text) //收尾時回調拋錯不得中斷close之收尾(否則本函數永不落定)
                }
            }
            flush('out', decOut, cbStdout)
            flush('err', decErr, cbStderr)
            if (retain) {
                //改判前已以utf-8解出之片段須一併改判, 且系統字碼頁之多位元組字元可能跨chunk, 故以單一串流解碼器自頭重播該串流全部chunk; 已回呼之字串不追溯
                let replay = (which, dec) => {
                    if (!dec.switched) {
                        return
                    }
                    let fd = codec.createDecoder(dec.label)
                    let last = null
                    for (let seg of segs) {
                        if (seg.which !== which) {
                            continue
                        }
                        seg.text = (seg.buf !== null) ? fd.write(seg.buf) : ''
                        last = seg
                    }
                    let text = fd.end()
                    if (text !== '' && last !== null) {
                        last.text += text
                    }
                }
                replay('out', decOut)
                replay('err', decErr)
            }
            let cmsg = ''
            for (let seg of segs) {
                cmsg += seg.text
            }
            return cmsg
        }

        // //exit, 會比close先觸發故不使用
        // r.on('exit', (code) => {
        //     // console.log('exit code', code)
        // })

        //timer, 若有設定timeout, 逾時觸發時調用execProcessKillPid殺整棵程序樹
        if (timeout !== null) {
            timer = setTimeout(() => {
                bTimeout = true
                if (r && r.pid) {
                    //fire-and-forget, 殺掉子進程後close/error事件會接著觸發, 由bTimeout決定reject訊息
                    execProcessKillPid(r.pid)
                        .catch(() => {}) //pid可能已結束, 忽略error
                }
            }, timeout)
        }

        //close
        r.on('close', (code) => {
            // console.log('close code', code)
            if (timer !== null) {
                clearTimeout(timer)
            }
            let cmsg = buildMsg()
            if (bTimeout) {
                pm.reject(`timeout[${timeout}ms]:\n${cmsg}`)
            }
            else if (code !== 0) {
                pm.reject(`code[${code}]:\n${cmsg}`)
            }
            else {
                pm.resolve(cmsg)
            }
        })

    }

    //系統字碼頁僅'auto'與'system'需要, 首次會等chcp查詢完才啟動子進程, 之後為快取; 固定標籤同步啟動, 與既有時序相同
    if (cc.mode === 'fixed') {
        start(null)
    }
    else {
        codec.getSystemCodePage()
            .then(start)
            .catch((err) => {
                let e = execSpawnError(err)
                pm.reject(`spawn[${e.code}]:\n${e.message}`)
            })
    }

    return pm
}


export default execProcess
