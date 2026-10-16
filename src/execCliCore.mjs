import fs from 'fs'
import path from 'path'
import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import fsReadText from './fsReadText.mjs'


// ── Windows .cmd/.bat 支援 ──
// npm全域安裝的命令在Windows上是.cmd批次檔, Node.js spawn無法直接執行
// (CVE-2024-27980安全修正後會回EINVAL)
// 而shell:true會導致含特殊字元的參數被cmd.exe錯誤解析
// 參考cross-spawn做法: 手動透過cmd.exe /d /s /c執行, 並正確轉義參數
// 參考來源: https://github.com/moxystudio/node-cross-spawn


/**
 * 由環境變數物件取值, 鍵不分大小寫(Windows環境變數大小寫不敏感, 但{...process.env}展開後之物件鍵敏感, 如Path與PATH)
 *
 * @param {Object} env 輸入環境變數物件
 * @param {String} key 輸入變數名稱字串
 * @returns {*} 回傳變數值, 無則為undefined
 */
function getEnvValue(env, key) {
    let k = Object.keys(env).find((k) => k.toUpperCase() === key)
    return k === undefined ? undefined : env[k]
}


/**
 * 判定路徑是否為檔案(跟隨連結), 用於命令搜尋: 一般檔案與指向檔案之符號連結為真; stat讀不到但本身為連結者亦為真(如WindowsApps之App Execution Alias, 其stat失敗而lstat為連結, where.exe亦列出); 資料夾與不存在者為假
 * 不用fsIsFile: 其以lstat判定且連結一律為假, 會漏掉以連結安裝之執行檔
 *
 * @param {String} fp 輸入路徑字串
 * @returns {Boolean} 回傳是否為檔案布林值
 */
function isFileFollowLink(fp) {
    try {
        return fs.statSync(fp).isFile()
    }
    catch (err) {}
    try {
        return fs.lstatSync(fp).isSymbolicLink()
    }
    catch (err) {}
    return false
}


/**
 * 判定路徑是否為實體檔案(跟隨連結, 懸空連結為假), 用於批次檔是否存在
 *
 * @param {String} fp 輸入路徑字串
 * @returns {Boolean} 回傳是否為檔案布林值
 */
function isFileStat(fp) {
    try {
        return fs.statSync(fp).isFile()
    }
    catch (err) {}
    return false
}


/**
 * 依序列出命令之實體路徑: 先搜dirFirst(有給時)再依序搜PATH各目錄, 每個目錄先比對原名再依PATHEXT逐一補上副檔名
 * 不呼叫where.exe: 其輸出為系統字碼頁(如Big5), 以utf-8解碼時含非ASCII字元之路徑(如中文使用者名稱下之%APPDATA%\npm, 或於中文資料夾內npm run時所加入之node_modules\.bin)會成亂碼而解析失敗; 亦免每次解析都啟動子程序(參考cross-spawn以which於JS內搜尋PATH)
 *
 * @param {String} cmd 輸入命令字串(不含目錄)
 * @param {Object} o 輸入設定物件
 * @param {String} [o.dirFirst=undefined] 輸入最先搜尋之目錄字串, 預設undefined代表不搜
 * @param {Object} o.env 輸入環境變數物件, 取其PATH與PATHEXT
 * @param {String} o.base 輸入PATH內相對目錄之基準目錄字串
 * @param {Boolean} o.useExt 輸入是否依PATHEXT補副檔名布林值
 * @returns {Array} 回傳實體路徑字串陣列, 無則為[]
 */
function whereList(cmd, { dirFirst, env, base, useExt }) {

    //exts, 原名在前(同where: 名稱已含.亦補PATHEXT, 如zz.v1可找到zz.v1.cmd)
    let exts = ['']
    if (useExt) {
        let pathext = getEnvValue(env, 'PATHEXT')
        if (!isestr(pathext)) {
            pathext = '.COM;.EXE;.BAT;.CMD'
        }
        for (let e of pathext.split(';')) {
            e = e.trim()
            if (e !== '') {
                exts.push(e.toLowerCase())
            }
        }
    }

    //dirs, PATH以;分隔(引號內之;不分隔), 相對目錄以base為基準; 一律轉絕對路徑, 回傳之路徑方不依本進程之工作目錄
    let dirs = []
    if (isestr(dirFirst)) {
        dirs.push(path.resolve(dirFirst))
    }
    let envPath = getEnvValue(env, 'PATH')
    if (isestr(envPath)) {
        for (let d of envPath.match(/(?:"[^"]*"|[^;"])+/g) || []) {
            d = d.replace(/"/g, '').trim()
            if (d !== '') {
                dirs.push(path.resolve(base, d))
            }
        }
    }

    //rs
    let rs = []
    for (let d of dirs) {
        for (let e of exts) {
            let fp = path.join(d, cmd + e)
            if (isFileFollowLink(fp) && !rs.some((r) => r.toLowerCase() === fp.toLowerCase())) {
                rs.push(fp)
            }
        }
    }
    return rs
}


/**
 * 找到命令的實際路徑(.cmd / .exe)
 * 未帶副檔名者同where: 先搜本進程之工作目錄再搜本進程之PATH, 並依PATHEXT補副檔名
 * 只給檔名之.cmd/.bat同cmd.exe(退路即由cmd.exe搜尋): 先搜子進程之工作目錄(子進程env有NoDefaultCurrentDirectoryInExePath時不搜)再搜子進程env之PATH, 不補副檔名
 * 含目錄(絕對或相對)者原樣回傳
 *
 * @param {String} cmd 輸入命令字串
 * @param {String} [cwd=undefined] 輸入子進程工作目錄字串, 預設undefined代表本進程之工作目錄
 * @param {Object} [env=undefined] 輸入子進程環境變數物件, 預設undefined代表本進程之process.env
 * @returns {String} 回傳解析後之命令路徑字串, 查無時回傳原命令字串
 */
function resolveCommand(cmd, cwd = undefined, env = undefined) {

    //非Windows無須解析
    if (process.platform !== 'win32') {
        return cmd
    }

    //含目錄(絕對或相對路徑), 無須解析(where對含目錄之樣式亦查無而原樣回傳)
    if (path.basename(cmd) !== cmd) {
        return cmd
    }

    try {

        //只給檔名之.cmd/.bat
        if (/\.(cmd|bat)$/i.test(cmd)) {
            let envChild = env !== undefined ? env : process.env
            let dirChild = isestr(cwd) ? path.resolve(cwd) : process.cwd() //相對之cwd以本進程之工作目錄為基準(同spawn), 轉絕對路徑
            let bNoCwd = getEnvValue(envChild, 'NODEFAULTCURRENTDIRECTORYINEXEPATH') !== undefined
            let lines = whereList(cmd, { dirFirst: bNoCwd ? undefined : dirChild, env: envChild, base: dirChild, useExt: false })
            return lines[0] || cmd
        }

        //已帶其他副檔名, 無須解析
        if (/\.(exe|ps1)$/i.test(cmd)) {
            return cmd
        }

        //whereList, 取得命令實體路徑清單(同where)
        let lines = whereList(cmd, { dirFirst: process.cwd(), env: process.env, base: process.cwd(), useExt: true })

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

    //String, 非字串元素比照node之spawn轉為字串(否則.replace拋TypeError)
    arg = String(arg)

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
 * 故一律抓引號內node_modules後的相對路徑, 再以isFileStat驗證實體檔存在
 * (只匹配.js會讓無副檔名入口落入cmd.exe fallback, 破壞多行prompt)
 * 回傳後由buildSpawnArgs依副檔名決定: .exe直接spawn, 其餘交給node
 *
 * 入口不存在時不回傳null(與「不是npm shim」區分), 而回傳exists為false; 是否據以判定為「未能啟動」另看isExecLine:
 * 僅當入口出現於cmd-shim之執行行(行首或&之後, 可前置"%_prog%"與shebang參數, 以%*結尾)時為true, 自訂批次檔於IF EXIST等判斷句內引用同樣式者為false, 仍交cmd.exe退路
 *
 * @param {String} cmdPath 輸入.cmd檔案路徑字串
 * @returns {Object|null} 回傳{ entry, exists, isExecLine }, entry為入口檔案路徑字串, exists為其是否為實體檔案, isExecLine為是否位於cmd-shim之執行行; 不含shim樣式或讀取失敗回傳null
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

    //isFileStat, 須為實體檔案(existsSync對資料夾亦回true); 跟隨連結, 以連結安裝之入口亦可(fsIsFile以lstat判定且連結一律為假)
    let exists = isFileStat(jsPath)

    //isExecLine, cmd-shim之執行行: 行首或&之後, 可前置"%_prog%"(及shebang參數), 入口以引號包住, 其後僅接%*; 捕捉值須與上方首個匹配相同
    let mExec = content.match(/(?:^|&)[ \t]*(?:"%_prog%"[^\r\n]*?[ \t])?"%dp0%\\(node_modules\\[^"\r\n]+)"[ \t]+%\*[ \t]*\r?$/im)
    let isExecLine = mExec !== null && mExec[1].toLowerCase() === m[1].toLowerCase()

    return { entry: jsPath, exists, isExecLine }
}


/**
 * 將command與args轉為可安全交給child_process.spawn之參數, 主要處理Windows下npm全域命令為.cmd批次檔而spawn無法直接執行之問題
 * 策略優先順序:
 *   1. .exe → 直接spawn
 *   2. .cmd → 解析JS入口, 用node直接執行(繞過cmd.exe, 支援多行參數)
 *   3. .cmd為npm shim(cmd-shim之執行行)而入口檔不存在 → 拋ENOENT(同不存在之批次檔)
 *   4. 其餘.cmd → 透過cmd.exe /d /s /c執行(fallback, 不支援多行參數)
 * 非Windows平台原樣回傳
 * 回傳物件三個分支一律帶opt鍵(無額外設定時為{}), 呼叫端可直接展開至spawn之選項物件
 *
 * @param {String} command 輸入執行檔名稱字串
 * @param {Array} [args=[]] 輸入參數陣列, 預設[]
 * @param {Object} [opt={}] 輸入設定物件, 預設{}
 * @param {String} [opt.cwd=undefined] 輸入子進程工作目錄字串, 用於解析只給檔名或相對路徑之.cmd/.bat並判定其是否存在, 預設undefined代表本進程之工作目錄
 * @param {Object} [opt.env=undefined] 輸入子進程環境變數物件, 用於解析只給檔名之.cmd/.bat(取其PATH與NoDefaultCurrentDirectoryInExePath), 預設undefined代表本進程之process.env
 * @returns {Object} 回傳spawn參數物件, 內含file(執行檔), args(參數陣列), opt(spawn額外選項物件); Windows下.cmd/.bat不存在時拋出code為'ENOENT'之錯誤(訊息同node之'spawn <路徑> ENOENT'); .cmd為npm shim(cmd-shim之執行行含"%dp0%\node_modules\...")而其入口檔不存在時亦拋出code為'ENOENT'之錯誤, 訊息為'spawn <入口檔路徑> ENOENT'
 */
function buildSpawnArgs(command, args = [], opt = {}) {

    //args
    if (!isarr(args)) {
        args = []
    }

    //非Windows直接使用
    if (process.platform !== 'win32') {
        return { file: command, args, opt: {} }
    }

    //cwd
    let cwd = get(opt, 'cwd', null)
    if (!isestr(cwd)) {
        cwd = undefined
    }

    //env
    let env = get(opt, 'env', null)
    if (!isobj(env)) {
        env = undefined
    }

    //resolved
    let resolved = resolveCommand(command, cwd, env)

    //.exe可直接spawn
    if (/\.exe$/i.test(resolved)) {
        return { file: resolved, args, opt: {} }
    }

    //.cmd/.bat → 嘗試解析出實際入口
    if (/\.(cmd|bat)$/i.test(resolved)) {

        //fpBatch, 只給檔名者已由resolveCommand解析為絕對路徑, 仍為檔名即查無; 含目錄之相對路徑以子進程之工作目錄為準(cmd.exe退路亦於該目錄解析)
        let fpBatch = ''
        if (path.isAbsolute(resolved)) {
            fpBatch = resolved
        }
        else if (path.basename(resolved) !== resolved) {
            fpBatch = path.resolve(cwd || process.cwd(), resolved)
        }

        //不存在之批次檔: 不可交cmd.exe退路(cmd.exe本身可啟動, 會得離開碼1與系統字碼頁之訊息且被重試), 以與node之非同步ENOENT同形之錯誤拋出, 由呼叫端之try以結果物件回報(code null、pid undefined、不重試)
        //node對.cmd/.bat直接spawn會同步拋EINVAL(CVE-2024-27980防護), 故不能改為直接spawn取得ENOENT
        if (!isFileStat(fpBatch)) {
            let e = new Error(`spawn ${resolved} ENOENT`)
            e.code = 'ENOENT'
            e.errno = -4058
            e.syscall = `spawn ${resolved}`
            e.path = resolved
            throw e
        }

        let shim = parseJsEntryFromCmd(fpBatch)
        if (shim !== null && shim.exists) {
            let entry = shim.entry

            //入口為原生.exe(如opencode的bin/opencode.exe) → 直接spawn
            //切勿丟給node, 否則node會把PE二進位當JS解析而崩潰(MZ... SyntaxError)
            if (/\.exe$/i.test(entry)) {
                return { file: entry, args, opt: {} }
            }

            //入口為JS(.js/.cjs/.mjs/無副檔名) → 用node直接執行, 繞過cmd.exe, 支援多行參數
            return { file: process.execPath, args: [entry, ...args], opt: {} }
        }

        //npm shim已辨識而入口不存在(全域套件資料夾被刪而shim殘留、安裝中斷): 同不存在之批次檔, 不交cmd.exe退路(cmd.exe會啟動而得離開碼1且被重試, .exe入口之訊息為系統字碼頁), 拋與node同形之ENOENT, 訊息指入口路徑(批次檔本身存在)
        //僅限入口位於cmd-shim之執行行者(isExecLine), 自訂批次檔於判斷句內引用同樣式而另有退路者仍交cmd.exe
        if (shim !== null && !shim.exists && shim.isExecLine) {
            let e = new Error(`spawn ${shim.entry} ENOENT`)
            e.code = 'ENOENT'
            e.errno = -4058
            e.syscall = `spawn ${shim.entry}`
            e.path = shim.entry
            throw e
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
 * PYTHONIOENCODING對一般python直譯器有效(sys.stdout.encoding變utf-8); 對PyInstaller打包之exe無效, 其以隔離模式嵌入直譯器且文件明載刻意忽略PYTHONIOENCODING與PYTHONUTF8, 該類程式須於打包時以-X utf8_mode=1指定, 或由本進程以execProcess之codeCmd('auto'或系統字碼頁)解碼其輸出
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
