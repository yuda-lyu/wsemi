import { execFileSync } from 'child_process'
import path from 'path'
import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import fsIsFile from './fsIsFile.mjs'
import fsReadText from './fsReadText.mjs'


// ── Windows .cmd/.bat 支援 ──
// npm全域安裝的命令在Windows上是.cmd批次檔, Node.js spawn無法直接執行
// (CVE-2024-27980安全修正後會回EINVAL)
// 而shell:true會導致含特殊字元的參數被cmd.exe錯誤解析
// 參考cross-spawn做法: 手動透過cmd.exe /d /s /c執行, 並正確轉義參數
// 參考來源: https://github.com/moxystudio/node-cross-spawn


/**
 * 用where指令找到命令的實際路徑(.cmd / .exe)
 *
 * @param {String} cmd 輸入命令字串
 * @returns {String} 回傳解析後之命令路徑字串
 */
function resolveCommand(cmd) {

    //非Windows無須解析
    if (process.platform !== 'win32') {
        return cmd
    }

    //已帶副檔名, 無須解析
    if (/\.(cmd|exe|bat|ps1)$/i.test(cmd)) {
        return cmd
    }

    //絕對路徑, 無須解析
    if (path.isAbsolute(cmd)) {
        return cmd
    }

    try {

        //where, 取得命令實體路徑清單
        //stdio的stderr須為ignore, 否則查無命令時where會把系統語系(如Big5)之錯誤訊息直接吐到主控台
        let out = execFileSync('where', [cmd], {
            encoding: 'utf8',
            timeout: 5000,
            windowsHide: true,
            shell: false,
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim()
        let lines = out.split(/\r?\n/)

        //優先.cmd, 次之.exe, 皆無則取首筆
        let cmdFile = lines.find((l) => /\.cmd$/i.test(l))
        if (cmdFile) {
            return cmdFile
        }
        let exeFile = lines.find((l) => /\.exe$/i.test(l))
        if (exeFile) {
            return exeFile
        }

        return lines[0] || cmd
    }
    catch {
        return cmd
    }
}


/**
 * 轉義cmd.exe的單一參數(cross-spawn escapeArgument邏輯)
 * 參考: https://qntm.org/cmd
 *
 * @param {String} arg 輸入參數字串
 * @returns {String} 回傳轉義後參數字串
 */
function escapeWinArg(arg) {

    //轉義反斜線 + 雙引號 組合
    arg = arg.replace(/(\\*)"/g, '$1$1\\"')

    //轉義尾端反斜線(避免吃掉結尾引號)
    arg = arg.replace(/(\\*)$/, '$1$1')

    //用雙引號包裹
    arg = `"${arg}"`

    //轉義cmd.exe的metacharacters(在引號外用^)
    arg = arg.replace(/[()%!^"<>&|]/g, '^$&')

    return arg
}


/**
 * 轉義cmd.exe的命令部分
 *
 * @param {String} cmd 輸入命令字串
 * @returns {String} 回傳轉義後命令字串
 */
function escapeWinCmd(cmd) {
    return cmd.replace(/[()%!^"<>&|;, ]/g, '^$&')
}


/**
 * 從.cmd shim中解析出實際入口檔案路徑(可能為JS, 亦可能為原生.exe)
 * npm全域安裝的.cmd格式固定, 末行為:
 *   ... "%_prog%"  "%dp0%\node_modules\...\entry" %*
 * 入口可能為.js / .cjs / .mjs / 無副檔名 / .exe(如opencode的bin/opencode.exe),
 * 故一律抓引號內node_modules後的相對路徑, 再以fsIsFile驗證實體檔存在
 * (只匹配.js會讓無副檔名入口落入cmd.exe fallback, 破壞多行prompt)
 * 回傳後由buildSpawnArgs依副檔名決定: .exe直接spawn, 其餘交給node
 *
 * @param {String} cmdPath 輸入.cmd檔案路徑字串
 * @returns {String|null} 回傳入口檔案路徑字串, 無法解析回傳null
 */
function parseJsEntryFromCmd(cmdPath) {

    //fsReadText, 讀取失敗回傳{ error }, 故取success驗證
    let rr = fsReadText(cmdPath)
    let content = get(rr, 'success', '')
    if (!isestr(content)) {
        return null
    }

    //匹配"%dp0%\node_modules\...\entry": 捕捉到結尾引號前, 含任何副檔名或無副檔名
    let m = content.match(/%dp0%\\(node_modules\\[^"]+)"/i)
    if (!m) {
        return null
    }

    //jsPath
    let dir = path.dirname(cmdPath)
    let jsPath = path.join(dir, m[1])

    //fsIsFile, 須為實體檔案(existsSync對資料夾亦回true, 故改用fsIsFile)
    if (fsIsFile(jsPath)) {
        return jsPath
    }

    return null
}


/**
 * 將command與args轉為可安全交給child_process.spawn之參數, 主要處理Windows下npm全域命令為.cmd批次檔而spawn無法直接執行之問題
 * 策略優先順序:
 *   1. .exe → 直接spawn
 *   2. .cmd → 解析JS入口, 用node直接執行(繞過cmd.exe, 支援多行參數)
 *   3. .cmd但無法解析JS入口 → 透過cmd.exe /d /s /c執行(fallback, 不支援多行參數)
 * 非Windows平台原樣回傳
 * 回傳物件三個分支一律帶opt鍵(無額外設定時為{}), 呼叫端可直接展開至spawn之選項物件
 *
 * @param {String} command 輸入執行檔名稱字串
 * @param {Array} [args=[]] 輸入參數陣列, 預設[]
 * @returns {Object} 回傳spawn參數物件, 內含file(執行檔), args(參數陣列), opt(spawn額外選項物件)
 */
function buildSpawnArgs(command, args = []) {

    //args
    if (!isarr(args)) {
        args = []
    }

    //非Windows直接使用
    if (process.platform !== 'win32') {
        return { file: command, args, opt: {} }
    }

    //resolved
    let resolved = resolveCommand(command)

    //.exe可直接spawn
    if (/\.exe$/i.test(resolved)) {
        return { file: resolved, args, opt: {} }
    }

    //.cmd/.bat → 嘗試解析出實際入口
    if (/\.(cmd|bat)$/i.test(resolved)) {

        let entry = parseJsEntryFromCmd(resolved)
        if (entry) {

            //入口為原生.exe(如opencode的bin/opencode.exe) → 直接spawn
            //切勿丟給node, 否則node會把PE二進位當JS解析而崩潰(MZ... SyntaxError)
            if (/\.exe$/i.test(entry)) {
                return { file: entry, args, opt: {} }
            }

            //入口為JS(.js/.cjs/.mjs/無副檔名) → 用node直接執行, 繞過cmd.exe, 支援多行參數
            return { file: process.execPath, args: [entry, ...args], opt: {} }
        }

        //fallback: 透過cmd.exe執行(注意: 不支援多行參數)
        let escaped = args.map((a) => escapeWinArg(a))
        let cmdLine = `${escapeWinCmd(resolved)} ${escaped.join(' ')}`
        let comspec = process.env.comspec || process.env.COMSPEC || 'cmd.exe'
        return {
            file: comspec,
            args: ['/d', '/s', '/c', `"${cmdLine}"`],
            opt: { windowsVerbatimArguments: true },
        }
    }

    return { file: resolved, args, opt: {} }
}


/**
 * 建立子進程之環境變數物件: 以process.env為底, 加入PYTHONIOENCODING=utf-8, 再併入envExtra(同名以envExtra為準)
 * 每次呼叫重新求值且不動本進程process.env, 故並行調用可各自帶不同值
 * Windows下環境變數大小寫不敏感但JS物件鍵敏感, 故併入前先移除大小寫不同之同名既有鍵, 否則呼叫端傳Path而process.env為PATH時兩鍵並存且Windows取原值, 注入靜默失效
 * 此刪除僅限win32: POSIX環境變數大小寫敏感, Path與PATH為兩個獨立變數, 誤刪即退化
 *
 * @param {Object} [envExtra=undefined] 輸入額外注入之環境變數物件, 值為undefined代表移除該變數, 預設undefined代表不覆寫任何變數
 * @returns {Object} 回傳可交給spawn之env物件
 */
function buildSpawnEnv(envExtra = undefined) {
    let envSpawn = { ...process.env, PYTHONIOENCODING: 'utf-8' }
    if (envExtra !== undefined) {
        if (process.platform === 'win32') {
            let ks = Object.keys(envExtra).map((k) => k.toLowerCase())
            for (let k of Object.keys(envSpawn)) {
                if (ks.includes(k.toLowerCase())) {
                    delete envSpawn[k]
                }
            }
        }
        envSpawn = { ...envSpawn, ...envExtra }
    }
    return envSpawn
}


/**
 * execCli系列函數之共用核心, 提供可獨立使用之函數: buildSpawnArgs(將命令轉為Windows安全之spawn參數)與buildSpawnEnv(建立子進程環境變數)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCliCore.test.mjs Github}
 * @memberOf wsemi
 * @example
 * //need test in nodejs
 *
 * let { buildSpawnArgs, buildSpawnEnv } = execCliCore
 *
 * //buildSpawnArgs, Windows下npm全域命令(.cmd)會被解析為以node執行其JS入口
 * let sp = buildSpawnArgs('node', ['-e', 'console.log(1)'])
 * console.log(sp)
 * // => { file: 'C:\\...\\node.exe', args: [ '-e', 'console.log(1)' ], opt: {} } (Windows)
 * // => { file: 'node', args: [ '-e', 'console.log(1)' ], opt: {} } (非Windows)
 *
 * //spawn
 * import { spawn } from 'child_process'
 * let proc = spawn(sp.file, sp.args, { stdio: 'pipe', windowsHide: true, ...sp.opt })
 *
 * //buildSpawnEnv, 以process.env為底併入額外變數, 不動本進程
 * let env = buildSpawnEnv({ API_KEY: 'abc' })
 * console.log(env.API_KEY, env.PYTHONIOENCODING, process.env.API_KEY)
 * // => abc utf-8 undefined
 *
 */
let execCliCore = {
    buildSpawnArgs,
    buildSpawnEnv,
}


export default execCliCore
