// import fs from 'fs'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import getTrace from './getTrace.mjs'
import optNum from './_optNum.mjs'
import { isBinName, isBinRel, binUrlProblem } from './_binRules.mjs'
import fsDownloadFileVerifyCore from './fsDownloadFileVerifyCore.mjs'


//GitHub原始檔網址之基底, 自有檔之網址為<RAW>/<repo>/<commit或master>/<path>
let RAW = 'https://raw.githubusercontent.com'

//主幹模式之分支
let BRANCH = 'master'

//主幹清單之大小上限(位元組)
let MANIFEST_CAP = 1024 * 1024

//解壓程式被終止後等待其結束之上限(毫秒)
let KILL_WAIT_MS = 5000

//快取校驗遇檔案於雜湊期間被換掉時重新檢查之次數上限
let CACHE_RECHECK = 3

//主幹清單於快取夾內之「最近一次成功」副本之檔名(紀錄, 不作為校驗依據)
let NAME_LAST = 'manifest-last.json'

//本函數自建之錯誤(mkErr所建), 以身分判定而非以code判定(同fsDownloadFileVerifyCore)
let _own = new WeakSet()

//同程序內進行中之取得, 鍵為最終檔之絕對路徑(Windows不分大小寫), 值為進行中工作之陣列
let _jobs = new Map()

//同程序內已校驗通過之快取檔, 鍵同上, 值為校驗時之檔案識別; 識別未變者不重複雜湊(D4: 結果於行程內記憶)
let _verified = new Map()

//暫時性檔案占用之錯誤代碼(Windows下防毒掃描常見), 更名與刪除時重試
let codesBusy = ['EPERM', 'EBUSY', 'EACCES']

//下載核心所標註之錯誤(tagErr所處理者), 以身分判定; 傳入元件所拋值即使帶同名pkg或code亦不視為已標註
let _tagged = new WeakSet()

//所需之fs方法(含fsDownloadFileVerifyCore所需者, 入口一次檢核), 於入口取出並綁定, 之後不再讀取opt.fs之屬性(下載另將opt.fs原樣交fsDownloadFileVerifyCore)
let fnsFs = ['mkdirSync', 'lstatSync', 'statSync', 'realpathSync', 'openSync', 'closeSync', 'writeSync', 'readFileSync', 'createReadStream', 'createWriteStream', 'renameSync', 'unlinkSync', 'rmSync']

let reHex64 = /^[0-9a-fA-F]{64}$/
let reCommit = /^[0-9a-f]{40}$/
let rePkg = /^[a-z0-9][a-z0-9._-]{0,213}$/
let reRepo = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9._-]{0,99}$/


function mkErr(code, msg, extra = {}) {
    let err = new Error(maskUrl(msg)) //訊息內任何出現處之網址帳密皆遮蔽(含所併入之底層錯誤文字)
    err.code = code
    Object.assign(err, extra)
    _own.add(err)
    return err
}


function isOwnErr(err) {
    return _own.has(err)
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}


//errMsg, 任意拋出值之訊息字串
function errMsg(err) {
    try {
        let m = get(err, 'message')
        if (isStr(m)) {
            return m
        }
        return String(err)
    }
    catch (e) {
        return 'unknown error'
    }
}


//codeOf, 取傳入元件所拋值之code; 其getter拋錯時視為無code
function codeOf(err) {
    try {
        return get(err, 'code')
    }
    catch (e) {
        return undefined
    }
}


//codeStr, 觀察回調(onTrace)用: 取code字串, 非字串或無code為null
function codeStr(err) {
    let c = codeOf(err)
    return isStr(c) ? c : null
}


//maskUrl, 文字內之網址若帶帳密(scheme://user:pass@host)則遮蔽之(全部出現處), 同fsDownloadFileVerifyCore之maskUrl
function maskUrl(s) {
    return String(s).replace(/([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^/?#\s]*@/g, '$1***@')
}


function isObj(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
}


function isNonNegInt(v) {
    return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
}


//isStr, 非空之原始字串(不接受包裝物件new String: 其轉換可被覆寫, 檢查之值可能不是使用之值)
function isStr(v) {
    return typeof v === 'string' && v !== ''
}


//encRel, 相對路徑逐段編碼為網址路徑
function encRel(v) {
    return v.split('/').map((s) => {
        return encodeURIComponent(s)
    }).join('/')
}


//rnd, 暫存名用之亂數字串
function rnd() {
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}


//emit, 通知進度; 不帶接收者呼叫, 其拋錯與rejection皆忽略
function emit(ctx, ev) {
    let fn = ctx.onProgress
    if (fn === null) {
        return
    }
    try {
        let r = fn({ pkg: ctx.pkg, ...ev })
        if (r && isfun(r.catch)) {
            r.catch(() => {})
        }
    }
    catch (err) {}
}


//baseOfUrl, 網址路徑之最後一段(解碼), 作為壓縮檔或分割檔之檔名
function baseOfUrl(v) {
    try {
        let segs = new URL(v).pathname.split('/')
        return decodeURIComponent(segs[segs.length - 1])
    }
    catch (err) {
        return ''
    }
}


//normManifest, 檢核清單(schema 1)並轉為內部結構; 每個欄位只讀取一次, 之後只用轉換後之值(檢查之值即使用之值); 不符拋E_MANIFEST
function normManifest(raw, src) {
    let bad = (field, msg) => {
        return mkErr('E_MANIFEST', maskUrl(`fsEnsureBins: the manifest${src} is invalid: ${field} ${msg}`), { step: 'manifest', field: maskUrl(field) })
    }
    let keysOk = (o, keys, at) => {
        for (let k of Object.keys(o)) {
            if (!keys.includes(k)) {
                throw bad(`${at}.${k}`, `is not a field of schema 1 (allowed: ${keys.join(', ')})`)
            }
        }
    }
    let file = (o, at, keys) => {
        //壓縮檔、分割檔、解出檔共用之{ sha256, size }
        let sha256 = o.sha256
        let size = o.size
        if (!isStr(sha256) || !reHex64.test(sha256)) {
            throw bad(`${at}.sha256`, 'must be a string of 64 hexadecimal characters')
        }
        if (!isNonNegInt(size)) {
            throw bad(`${at}.size`, 'must be a non-negative integer')
        }
        return { sha256: sha256.toLowerCase(), size }
    }
    let source = (o, at) => {
        //自有檔(path)或廠商檔(url)之來源, 回傳{ path, url }(未給者為null)
        let p = o.path
        let u = o.url
        if ((p === undefined) === (u === undefined)) {
            throw bad(at, 'must have exactly one of path and url')
        }
        if (p !== undefined) {
            if (!isBinRel(p)) {
                throw bad(`${at}.path`, 'must be a relative path with / separators of letters, digits, spaces and ._+- (no empty, . or .. segments)')
            }
            return { path: p, url: null }
        }
        let e = isStr(u) ? binUrlProblem(u) : 'must be a string'
        if (e !== '') {
            throw bad(`${at}.url`, `${e}: ${isStr(u) ? u : typeof u}`)
        }
        return { path: null, url: new URL(u).href }
    }
    try {
        if (!isObj(raw)) {
            throw bad('(root)', 'must be an object')
        }
        keysOk(raw, ['schema', 'pkg', 'mode', 'repo', 'commit', 'manifestPath', 'files', 'note', 'version'], '(root)')
        let schema = raw.schema
        let pkg = raw.pkg
        let mode = raw.mode
        let repo = raw.repo
        let commit = raw.commit
        let manifestPath = raw.manifestPath
        let files = raw.files
        let note = raw.note
        let version = raw.version
        if (schema !== 1) {
            throw bad('schema', 'must be 1')
        }
        if (!isStr(pkg) || !rePkg.test(pkg)) {
            throw bad('pkg', 'must be a package name of lowercase letters, digits and ._-')
        }
        if (mode !== 'pinned' && mode !== 'floating') {
            throw bad('mode', `must be 'pinned' or 'floating'`)
        }
        if (!isStr(repo) || !reRepo.test(repo)) {
            throw bad('repo', `must be '<owner>/<repository>'`)
        }
        if (commit !== undefined && (!isStr(commit) || !reCommit.test(commit))) {
            throw bad('commit', 'must be 40 lowercase hexadecimal characters')
        }
        if (manifestPath !== undefined && !isBinRel(manifestPath)) {
            throw bad('manifestPath', 'must be a relative path with / separators')
        }
        if (note !== undefined && typeof note !== 'string') {
            throw bad('note', 'must be a string')
        }
        if (version !== undefined && typeof version !== 'string') {
            throw bad('version', 'must be a string')
        }
        if (!Array.isArray(files) || files.length === 0) {
            throw bad('files', 'must be a non-empty array')
        }

        let entries = []
        let names = new Set()
        let n = files.length
        for (let i = 0; i < n; i++) {
            let f = files[i]
            let at = `files[${i}]`
            if (!isObj(f)) {
                throw bad(at, 'must be an object')
            }
            keysOk(f, ['name', 'path', 'url', 'parts', 'sha256', 'size', 'assembled', 'extract', 'note'], at)
            let name = f.name
            let parts = f.parts
            let assembled = f.assembled
            let extract = f.extract
            let fnote = f.note
            if (!isBinName(name)) {
                throw bad(`${at}.name`, 'must be a file name of letters, digits and ._+- (not a reserved device name)')
            }
            if (names.has(name.toLowerCase())) {
                throw bad(`${at}.name`, `duplicates another file name (case-insensitive): ${name}`)
            }
            names.add(name.toLowerCase())
            if (fnote !== undefined && typeof fnote !== 'string') {
                throw bad(`${at}.note`, 'must be a string')
            }

            //extract
            let ext = null
            if (extract !== undefined) {
                if (!isObj(extract)) {
                    throw bad(`${at}.extract`, 'must be an object')
                }
                keysOk(extract, ['type', 'member', 'sha256', 'size'], `${at}.extract`)
                let type = extract.type
                let member = extract.member
                if (type !== 'zip') {
                    throw bad(`${at}.extract.type`, `must be 'zip'`)
                }
                if (!isBinRel(member)) {
                    throw bad(`${at}.extract.member`, 'must be a relative path with / separators of letters, digits, spaces and ._+- (no empty, . or .. segments)')
                }
                ext = { member, ...file(extract, `${at}.extract`) }
            }

            let e = { name, final: null, direct: null, archive: null, parts: null, assembled: null, extract: ext }
            if (parts !== undefined) {
                //分割壓縮檔: 各分割與組合後之壓縮檔各有校驗值, 須解出
                if (f.path !== undefined || f.url !== undefined || f.sha256 !== undefined || f.size !== undefined) {
                    throw bad(at, 'with parts must not have path, url, sha256 or size (give them in each part and in assembled)')
                }
                if (!Array.isArray(parts) || parts.length === 0) {
                    throw bad(`${at}.parts`, 'must be a non-empty array')
                }
                if (ext === null) {
                    throw bad(`${at}.extract`, 'is required with parts')
                }
                if (!isObj(assembled)) {
                    throw bad(`${at}.assembled`, 'is required with parts and must be an object')
                }
                keysOk(assembled, ['type', 'sha256', 'size'], `${at}.assembled`)
                if (assembled.type !== 'zip') {
                    throw bad(`${at}.assembled.type`, `must be 'zip'`)
                }
                e.assembled = file(assembled, `${at}.assembled`)
                e.parts = []
                let pnames = new Set()
                let m = parts.length
                for (let j = 0; j < m; j++) {
                    let p = parts[j]
                    let atp = `${at}.parts[${j}]`
                    if (!isObj(p)) {
                        throw bad(atp, 'must be an object')
                    }
                    keysOk(p, ['name', 'path', 'url', 'sha256', 'size'], atp)
                    let pname = p.name
                    let s = source(p, atp)
                    let fz = file(p, atp)
                    if (pname === undefined) {
                        pname = s.path !== null ? s.path.split('/').pop() : baseOfUrl(s.url)
                    }
                    if (!isBinName(pname)) {
                        throw bad(`${atp}.name`, `must be a file name of letters, digits and ._+- (give name when the path or url does not end with one): ${String(pname)}`)
                    }
                    if (pnames.has(pname.toLowerCase())) {
                        throw bad(`${atp}.name`, `duplicates another part name (case-insensitive): ${pname}`)
                    }
                    pnames.add(pname.toLowerCase())
                    e.parts.push({ name: pname, ...fz, ...s })
                }
            }
            else {
                if (assembled !== undefined) {
                    throw bad(`${at}.assembled`, 'is only for parts')
                }
                let s = source(f, at)
                let fz = file(f, at)
                if (ext === null) {
                    e.direct = { name, ...fz, ...s }
                }
                else {
                    let aname = s.path !== null ? s.path.split('/').pop() : baseOfUrl(s.url)
                    if (!isBinName(aname)) {
                        throw bad(at, `can not take a file name for the archive from its path or url: ${String(aname)}`)
                    }
                    e.archive = { name: aname, ...fz, ...s }
                }
            }
            e.final = ext !== null ? { name, sha256: ext.sha256, size: ext.size } : { name, sha256: e.direct.sha256, size: e.direct.size }
            entries.push(e)
        }

        //自有檔(path)之網址: 釘選模式須有commit, 主幹模式無commit時用主幹
        let ownUsed = entries.some((e) => {
            return [e.direct, e.archive, ...(e.parts || [])].some((o) => {
                return o !== null && o.path !== null
            })
        })
        if (mode === 'pinned' && ownUsed && commit === undefined) {
            throw bad('commit', 'is required in pinned mode when a file has a path')
        }
        let ref = commit !== undefined ? commit : BRANCH
        for (let e of entries) {
            for (let o of [e.direct, e.archive, ...(e.parts || [])]) {
                if (o !== null && o.path !== null) {
                    o.url = `${RAW}/${repo}/${ref}/${encRel(o.path)}`
                }
            }
        }

        return { pkg, mode, repo, commit: commit !== undefined ? commit : null, manifestPath: manifestPath !== undefined ? manifestPath : 'bin/manifest.json', entries }
    }
    catch (err) {
        if (isOwnErr(err)) {
            throw err
        }
        throw bad('(root)', `can not be read: ${errMsg(err)}`)
    }
}


//buildCtx, 檢核opt與環境變數; 所傳入之模組方法於此一次取出, 之後不再讀取opt
function buildCtx(opt) {
    let bad = (msg, cause) => {
        let extra = { step: 'argument' }
        if (cause !== undefined) {
            extra.cause = cause
        }
        return mkErr('E_ARG', maskUrl(`fsEnsureBins: ${msg}`), extra)
    }
    let o = {}
    o.refs = [] //所取出之原始方法(綁定前), 供共用判定: 同一模組物件於兩次呼叫之間被換了方法者不共用
    try {

        //fs
        o.fsRaw = get(opt, 'fs')
        o.fs = {}
        for (let k of fnsFs) {
            let f = get(o.fsRaw, k)
            if (!isfun(f)) {
                throw bad(`opt.fs is not an effective fs (needs ${fnsFs.join(', ')})`)
            }
            o.refs.push(f)
            o.fs[k] = f.bind(o.fsRaw)
        }

        //crypto, Readable, pipeline交fsDownloadFileVerifyCore; 本函數另用crypto.createHash、Readable.toWeb
        o.cryptoRaw = get(opt, 'crypto')
        let createHash = get(o.cryptoRaw, 'createHash')
        if (!isfun(createHash)) {
            throw bad(`opt.crypto is not an effective crypto (needs createHash)`)
        }
        o.createHash = createHash.bind(o.cryptoRaw)
        o.ReadableRaw = get(opt, 'Readable')
        let toWeb = get(o.ReadableRaw, 'toWeb')
        let fromWeb = get(o.ReadableRaw, 'fromWeb')
        let from = get(o.ReadableRaw, 'from')
        if (!isfun(toWeb) || !isfun(fromWeb) || !isfun(from)) {
            throw bad(`opt.Readable is not an effective stream.Readable (needs toWeb, fromWeb, from)`)
        }
        o.refs.push(createHash, toWeb, fromWeb, from)
        o.toWeb = toWeb.bind(o.ReadableRaw)
        o.pipeline = get(opt, 'pipeline')
        if (!isfun(o.pipeline)) {
            throw bad(`opt.pipeline is not a function`)
        }

        //spawn(解壓), path
        o.spawn = get(opt, 'spawn')
        if (!isfun(o.spawn)) {
            throw bad(`opt.spawn is not a function`)
        }
        let pathRaw = get(opt, 'path')
        let resolve = get(pathRaw, 'resolve')
        let join = get(pathRaw, 'join')
        if (!isfun(resolve) || !isfun(join)) {
            throw bad(`opt.path is not an effective path (needs resolve, join)`)
        }
        o.refs.push(resolve, join)
        o.path = { resolve: resolve.bind(pathRaw), join: join.bind(pathRaw) }

        //env, 環境變數統一於此讀取(未給為不設定)
        let env = get(opt, 'env')
        let envStr = (k) => {
            let v = get(env, k)
            return typeof v === 'string' ? v.trim() : ''
        }
        o.envCache = envStr('W_BIN_CACHE')
        o.envMirror = envStr('W_BIN_MIRROR')
        o.envOffline = envStr('W_BIN_OFFLINE')
        o.envSystemRoot = envStr('SystemRoot') || envStr('SYSTEMROOT') || envStr('windir')

        //選項, 給了就須為正確型別(undefined與null為未給)
        let given = (v) => {
            return v !== undefined && v !== null
        }
        o.pkgRoot = get(opt, 'pkgRoot')
        o.names = get(opt, 'names')
        o.cacheDir = get(opt, 'cacheDir')
        o.mirror = get(opt, 'mirror')
        o.offline = get(opt, 'offline')
        o.fetchRaw = get(opt, 'fetch')
        o.onProgress = get(opt, 'onProgress')
        o.floatingManifestUrl = get(opt, 'floatingManifestUrl')
        o.maxAttempts = get(opt, 'maxAttempts')
        o.retryDelayMs = get(opt, 'retryDelayMs')
        o.stallMs = get(opt, 'stallMs')
        o.totalMs = get(opt, 'totalMs')
        o.manifestMs = optNum(opt, 'stallMs', 30000, { min: 0, minOpen: true, timer: true }) //取主幹清單之上限同停滯毫秒數
        o.extractMs = optNum(opt, 'totalMs', 600000, { min: 0, minOpen: true, timer: true }) //解壓之上限同每檔整體時間上限
        if (!isStr(o.pkgRoot)) {
            throw bad(`opt.pkgRoot must be the root folder of the package (a non-empty string)`)
        }
        if (given(o.cacheDir) && typeof o.cacheDir !== 'string') {
            throw bad(`opt.cacheDir must be a string when given ('' is the default location)`)
        }
        if (given(o.mirror) && typeof o.mirror !== 'string') {
            throw bad(`opt.mirror must be a string when given`)
        }
        if (given(o.offline) && typeof o.offline !== 'boolean') {
            throw bad(`opt.offline must be a primitive boolean when given`)
        }
        if (given(o.fetchRaw) && !isfun(o.fetchRaw)) {
            throw bad(`opt.fetch is not a function`)
        }
        if (given(o.onProgress) && !isfun(o.onProgress)) {
            throw bad(`opt.onProgress is not a function`)
        }
        if (given(o.names)) {
            let l = typeof o.names === 'string' ? [o.names] : o.names
            if (!Array.isArray(l) || l.length === 0 || !l.every((v) => isStr(v))) {
                throw bad(`opt.names must be a non-empty string or an array of them when given`)
            }
            o.names = [...new Set(l)]
        }
        else {
            o.names = null
        }
        if (given(o.floatingManifestUrl)) {
            let u = null
            try {
                u = isStr(o.floatingManifestUrl) ? new URL(o.floatingManifestUrl) : null
            }
            catch (err) {}
            if (u === null || u.protocol !== 'https:' || u.username !== '' || u.password !== '') {
                throw bad(`opt.floatingManifestUrl must be an https url without credentials: ${isStr(o.floatingManifestUrl) ? o.floatingManifestUrl : typeof o.floatingManifestUrl}`)
            }
            o.floatingManifestUrl = u.href
        }
        else {
            o.floatingManifestUrl = null
        }
    }
    catch (err) {
        if (isOwnErr(err)) {
            throw err
        }
        throw bad(`opt can not be read: ${errMsg(err)}`, err)
    }

    //平台
    let pid = 0
    let win32 = false
    try {
        pid = get(globalThis, 'process.pid', 0) || 0
        win32 = get(globalThis, 'process.platform') === 'win32'
    }
    catch (err) {}

    //offline, 選項優先, 否則W_BIN_OFFLINE為1或true(不分大小寫)
    let offline = typeof o.offline === 'boolean' ? o.offline : /^(1|true)$/i.test(o.envOffline)

    //mirror, 選項優先(空字串為不使用), 否則W_BIN_MIRROR; 本地資料夾或http(s)基底網址
    let mirror = typeof o.mirror === 'string' ? o.mirror.trim() : o.envMirror
    let mirrorKind = ''
    let mirrorBase = ''
    if (mirror !== '') {
        if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(mirror)) {
            let u = null
            try {
                u = new URL(mirror)
            }
            catch (err) {
                throw bad(`the mirror(W_BIN_MIRROR or opt.mirror) is not a valid url: ${mirror}`)
            }
            if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                throw bad(`the mirror(W_BIN_MIRROR or opt.mirror) must be a local folder or an http(s) url: ${mirror}`)
            }
            if (u.search !== '' || u.hash !== '') {
                throw bad(`the mirror(W_BIN_MIRROR or opt.mirror) url must not have a query or hash: ${mirror}`)
            }
            if ((u.username !== '' || u.password !== '') && !isfun(o.fetchRaw)) {
                throw bad(`the mirror(W_BIN_MIRROR or opt.mirror) url must not contain credentials unless opt.fetch is given to handle them: ${mirror}`)
            }
            mirrorKind = 'http'
            mirrorBase = mirror.replace(/\/+$/, '')
        }
        else {
            mirrorKind = 'dir'
            mirrorBase = o.path.resolve(mirror)
        }
    }

    let fetchRaw = isfun(o.fetchRaw) ? o.fetchRaw : null
    return {
        fs: o.fs,
        fsRaw: o.fsRaw,
        cryptoRaw: o.cryptoRaw,
        createHash: o.createHash,
        ReadableRaw: o.ReadableRaw,
        toWeb: o.toWeb,
        pipeline: o.pipeline,
        spawn: o.spawn,
        path: o.path,
        fetchRaw,
        fetchFn: fetchRaw !== null
            ? fetchRaw
            : (u, init) => {
                return globalThis.fetch(u, init)
            },
        onProgress: isfun(o.onProgress) ? o.onProgress : null,
        pkgRoot: o.path.resolve(o.pkgRoot),
        names: o.names,
        cacheDir: isStr(o.cacheDir) ? o.path.resolve(o.cacheDir) : '',
        envCache: o.envCache !== '' ? o.path.resolve(o.envCache) : '',
        mirrorKind,
        mirrorBase,
        offline,
        floatingManifestUrl: o.floatingManifestUrl,
        tarProgs: win32 ? [o.path.join(o.envSystemRoot || 'C:\\Windows', 'System32', 'tar.exe')] : ['bsdtar', 'tar'],
        dl: { maxAttempts: o.maxAttempts, retryDelayMs: o.retryDelayMs, stallMs: o.stallMs, totalMs: o.totalMs },
        manifestMs: o.manifestMs,
        extractMs: o.extractMs,
        refs: o.refs,
        leftovers: [],
        fresh: [], //離線時記下「開始時尚不存在」之資料夾, 缺檔reject前把其中仍為空者清掉(見tidyFresh)
        trace: null, //觀察回調(opt.onTrace), 由入口取得後設定
        pid,
        win32,
        pkg: '',
        cacheRoot: '',
    }
}


//keyOf, 同程序內表之鍵: 絕對路徑(Windows不分大小寫)
function keyOf(ctx, fp) {
    return ctx.win32 ? fp.toLowerCase() : fp
}


//idOf, 檔案識別: 任一項改變即視為可能被改動, 須重新雜湊
function idOf(st) {
    return `${st.dev}:${st.ino}:${st.size}:${st.mtimeMs}:${st.ctimeMs}`
}


//lstatOrNull, 不存在者回傳null, 其他錯誤拋出
function lstatOrNull(ctx, fp) {
    try {
        return ctx.fs.lstatSync(fp)
    }
    catch (err) {
        let c = codeOf(err)
        if (c === 'ENOENT' || c === 'ENOTDIR') {
            return null
        }
        throw err
    }
}


//hashFile, 串流讀檔計算SHA-256與大小
async function hashFile(ctx, fp) {
    let h = ctx.createHash('sha256')
    let size = 0
    let rs = ctx.fs.createReadStream(fp)
    try {
        for await (let chunk of rs) {
            size += chunk.length
            h.update(chunk)
        }
    }
    finally {
        try {
            rs.destroy()
        }
        catch (err) {}
    }
    return { sha256: h.digest('hex'), size }
}


//isExpected, 檔案是否為期望內容(一般檔案且大小與SHA-256皆相符); 讀取失敗視為否
async function isExpected(ctx, fp, exp) {
    try {
        let st = ctx.fs.lstatSync(fp)
        if (!st.isFile() || st.size !== exp.size) {
            return false
        }
        let r = await hashFile(ctx, fp)
        return r.size === exp.size && r.sha256 === exp.sha256
    }
    catch (err) {
        return false
    }
}


//cacheErr, 快取之磁碟錯誤
function cacheErr(ctx, e, msg, cause) {
    let extra = { step: 'cache', pkg: ctx.pkg, bin: e.name }
    if (cause !== undefined) {
        extra.cause = cause
    }
    return mkErr('E_FS', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: ${msg}`, extra)
}


//unlinkIf, 刪除不符清單之快取檔(或符號連結本身), 只在其識別與id相同時(他方剛換上之新檔不刪); 占用時重試
//回傳'deleted'(已刪或已不存在)或'changed'(識別已變, 未刪); 刪不掉拋E_FS(不符之檔不得留著而回報缺檔或成功)
async function unlinkIf(ctx, e, fp, id) {
    for (let i = 1; ; i++) {
        try {
            let st = lstatOrNull(ctx, fp)
            if (st === null) {
                return 'deleted'
            }
            if (idOf(st) !== id) {
                return 'changed'
            }
            ctx.fs.unlinkSync(fp)
            return 'deleted'
        }
        catch (err) {
            if (codeOf(err) === 'ENOENT') {
                return 'deleted'
            }
            if (!codesBusy.includes(codeOf(err)) || i >= 3) {
                throw cacheErr(ctx, e, `the cached file "${fp}" does not match the manifest and can not be removed: ${errMsg(err)}; remove it by hand`, err)
            }
            await sleep(100 * i)
        }
    }
}


//checkCache, 快取命中須校驗(D4): 一般檔案且大小與SHA-256皆符合本次清單; 本行程內已校驗且檔案識別未變、期望值相同者不重複雜湊
//雜湊期間檔案被換掉(識別改變)者重新檢查(至多CACHE_RECHECK次); 不符者刪除(識別未變才刪)並回傳false
async function checkCache(ctx, e, fp) {
    let key = keyOf(ctx, fp)
    let want = `${e.final.sha256}|${e.final.size}`
    for (let n = 0; n <= CACHE_RECHECK; n++) {
        let st = null
        try {
            st = lstatOrNull(ctx, fp)
        }
        catch (err) {
            throw cacheErr(ctx, e, `can not read the cached file "${fp}": ${errMsg(err)}`, err)
        }
        if (st === null) {
            _verified.delete(key)
            return false
        }
        if (!st.isSymbolicLink() && !st.isFile()) {
            throw cacheErr(ctx, e, `the cache path "${fp}" is not a file, remove it`)
        }
        let id = idOf(st)
        if (st.isFile() && st.size === e.final.size && _verified.get(key) === `${id}|${want}`) {
            return true
        }
        _verified.delete(key)
        let ok = false
        if (st.isFile() && st.size === e.final.size) {
            let r = null
            try {
                r = await hashFile(ctx, fp)
            }
            catch (err) {
                throw cacheErr(ctx, e, `can not read the cached file "${fp}": ${errMsg(err)}`, err)
            }
            ok = r.size === e.final.size && r.sha256 === e.final.sha256
            let st2 = null
            try {
                st2 = lstatOrNull(ctx, fp)
            }
            catch (err) {
                throw cacheErr(ctx, e, `can not read the cached file "${fp}": ${errMsg(err)}`, err) //不存在以外之讀取錯誤不當成換檔
            }
            if (st2 === null || !st2.isFile() || idOf(st2) !== id) {
                continue //雜湊期間被換掉或刪除: 所雜湊者不一定是現在之檔
            }
        }
        if (ok) {
            _verified.set(key, `${id}|${want}`)
            return true
        }
        let r = await unlinkIf(ctx, e, fp, id)
        emit(ctx, { step: 'cache', name: e.name, fp, hit: false, reason: st.isFile() ? 'mismatch' : 'symlink' })
        if (r === 'deleted') {
            return false
        }
    }
    //多次檢查期間仍持續變動: 無法穩定校驗, 不採用、不刪, 明確拒絕(不當成缺檔)
    throw cacheErr(ctx, e, `the cached file "${fp}" kept changing while being verified (${CACHE_RECHECK + 1} times), another process may be writing it; retry later`)
}


//verifyOpt, 交fsDownloadFileVerifyCore之選項
function verifyOpt(ctx, extra) {
    return {
        fs: ctx.fsRaw,
        crypto: ctx.cryptoRaw,
        Readable: ctx.ReadableRaw,
        pipeline: ctx.pipeline,
        maxAttempts: ctx.dl.maxAttempts,
        retryDelayMs: ctx.dl.retryDelayMs,
        stallMs: ctx.dl.stallMs,
        totalMs: ctx.dl.totalMs,
        useShare: false, //同程序內之共用由本函數以最終檔為鍵處理
        ...extra,
    }
}


//tagErr, 下載錯誤標註所屬之套件、檔名與來源(訊息前綴), 不改code
function tagErr(ctx, err, name, source) {
    if (!isOwnErr(err) && !isStr(codeOf(err))) {
        err = mkErr('E_FS', errMsg(err), { cause: err })
    }
    try {
        err.pkg = ctx.pkg
        err.bin = name
        err.source = source
        err.message = maskUrl(`fsEnsureBins[${ctx.pkg}] file[${name}] from ${source}: ${err.message}`)
    }
    catch (e) {}
    _tagged.add(err)
    return err
}


//addLeft, 下載核心回報之刪不掉之暫存檔(結果或錯誤之leftovers)併入本次之leftovers
function addLeft(ctx, e, x) {
    try {
        let l = get(x, 'leftovers')
        if (Array.isArray(l)) {
            for (let v of l) {
                ctx.left.push({ name: e.name, fp: get(v, 'fp'), error: maskUrl(get(v, 'error')) })
            }
        }
    }
    catch (err) {}
}


//mirrorPathOf, 鏡像內之位置: <鏡像>/<套件>/<sha256>/<name>
function mirrorPathOf(ctx, o) {
    if (ctx.mirrorKind === 'dir') {
        return ctx.path.join(ctx.mirrorBase, ctx.pkg, o.sha256, o.name)
    }
    if (ctx.mirrorKind === 'http') {
        return `${ctx.mirrorBase}/${encodeURIComponent(ctx.pkg)}/${o.sha256}/${encodeURIComponent(o.name)}`
    }
    return ''
}


//localFetch, 自本地鏡像檔讀取之fetch(交fsDownloadFileVerifyCore, 使本地鏡像與網路下載同一套暫存、校驗、原子更名)
function localFetch(ctx, fp) {
    return async (u, init) => {
        let rs = ctx.fs.createReadStream(fp)
        let signal = get(init, 'signal')
        if (signal) {
            signal.addEventListener('abort', () => {
                rs.destroy()
            }, { once: true })
        }
        return new Response(ctx.toWeb(rs), { status: 200 })
    }
}


//fromMirror, 自鏡像取得o至dest並以清單校驗; 回傳true(取得)、null(鏡像無此檔)或拒用之說明(校驗不符、讀取或連線失敗)
async function fromMirror(ctx, e, o, dest) {
    let at = mirrorPathOf(ctx, o)
    let exp = { sha256: o.sha256, size: o.size }
    try {
        if (ctx.mirrorKind === 'dir') {
            let st = lstatOrNull(ctx, at)
            if (st === null) {
                emit(ctx, { step: 'mirror', name: e.name, file: o.name, from: at, result: 'miss' })
                if (ctx.trace) {
                    ctx.trace('mirror', { name: e.name, file: o.name, result: 'miss' })
                }
                return null
            }
            if (!st.isFile()) {
                throw new Error(`"${at}" is not a file`)
            }
            let rv = await fsDownloadFileVerifyCore(at, dest, exp, verifyOpt(ctx, { fetch: localFetch(ctx, at), maxAttempts: 1, retryOnMismatch: false }))
            addLeft(ctx, e, rv)
        }
        else {
            //離線時不追隨重導(重導可指向鏡像以外之主機, 如GitHub), 重導即拒用; 傳入之fetch須遵守redirect選項
            let fn = ctx.fetchFn
            let f = ctx.offline
                ? (u, init) => {
                    return fn(u, { ...init, redirect: 'manual' })
                }
                : ctx.fetchRaw
            let rv = await fsDownloadFileVerifyCore(at, dest, exp, verifyOpt(ctx, { fetch: f, retryOnMismatch: false }))
            addLeft(ctx, e, rv)
        }
        emit(ctx, { step: 'mirror', name: e.name, file: o.name, from: maskUrl(at), result: 'ok' })
        if (ctx.trace) {
            ctx.trace('mirror', { name: e.name, file: o.name, result: 'ok' })
        }
        return true
    }
    catch (err) {
        addLeft(ctx, e, err) //拒用時下載核心刪不掉之暫存檔不得被吞掉
        //下載核心之E_FS、E_RENAME為寫入端(快取或暫存夾)之磁碟錯誤、E_ARG為參數錯誤, 皆不是鏡像之問題, 不續找下一來源(鏡像端之讀取或連線錯誤為E_NETWORK等)
        if (['E_FS', 'E_RENAME', 'E_ARG'].includes(codeOf(err))) {
            throw tagErr(ctx, err, e.name, 'mirror')
        }
        let status = get(err, 'status')
        if (codeOf(err) === 'E_HTTP' && (status === 404 || status === 410)) {
            emit(ctx, { step: 'mirror', name: e.name, file: o.name, from: maskUrl(at), result: 'miss' })
            if (ctx.trace) {
                ctx.trace('mirror', { name: e.name, file: o.name, result: 'miss' })
            }
            return null
        }
        let reason = maskUrl(`the mirror copy ${at} was rejected: ${isStr(codeOf(err)) ? `${codeOf(err)} ` : ''}${errMsg(err).split('\n')[0]}`)
        emit(ctx, { step: 'mirror', name: e.name, file: o.name, from: maskUrl(at), result: 'rejected', error: reason })
        if (ctx.trace) {
            ctx.trace('mirror', { name: e.name, file: o.name, result: 'rejected' })
        }
        return reason
    }
}


//missingOf, 離線缺檔之內部錯誤(由run彙整為E_OFFLINE_MISSING)
function missingOf(ctx, e, reasons) {
    let fp = ctx.path.join(ctx.cacheRoot, e.final.sha256, e.final.name)
    let alt = (o) => {
        return { name: o.name, sha256: o.sha256, size: o.size, url: o.url, mirrorPath: ctx.mirrorKind !== '' ? maskUrl(mirrorPathOf(ctx, o)) : null }
    }
    let src = e.direct !== null ? e.direct : null
    let m = {
        name: e.name,
        sha256: e.final.sha256,
        size: e.final.size,
        cachePath: fp,
        mirrorPath: ctx.mirrorKind !== '' ? maskUrl(mirrorPathOf(ctx, e.final)) : null,
        url: src !== null ? src.url : null,
        member: e.extract !== null ? e.extract.member : null,
        archive: e.archive !== null ? alt(e.archive) : null,
        parts: e.parts !== null ? e.parts.map(alt) : null,
        reasons,
    }
    if (ctx.trace) {
        ctx.trace('offline', { name: e.name })
    }
    return mkErr('E_OFFLINE_MISSING', `offline: ${e.name} is missing`, { step: 'offline', missing: [m] })
}


//obtain, 取得o至dest: 鏡像(有設定時)→GitHub或廠商網址(離線時不連); 任何來源皆以清單校驗
async function obtain(ctx, e, o, dest, reasons) {
    if (ctx.mirrorKind !== '') {
        let r = await fromMirror(ctx, e, o, dest)
        if (r === true) {
            return
        }
        if (r !== null) {
            reasons.push(r)
        }
    }
    if (ctx.offline) {
        throw missingOf(ctx, e, reasons)
    }
    emit(ctx, { step: 'download', name: e.name, file: o.name, url: o.url })
    if (ctx.trace) {
        ctx.trace('download', { name: e.name, file: o.name })
    }
    try {
        let rv = await fsDownloadFileVerifyCore(o.url, dest, { sha256: o.sha256, size: o.size }, verifyOpt(ctx, { fetch: ctx.fetchRaw }))
        addLeft(ctx, e, rv) //成功前之嘗試刪不掉之暫存檔
    }
    catch (err) {
        if (ctx.trace) {
            ctx.trace('downloaded', { name: e.name, file: o.name, ok: false, code: codeStr(err) })
        }
        throw tagErr(ctx, err, e.name, o.url.startsWith(`${RAW}/`) ? 'github' : 'url')
    }
    if (ctx.trace) {
        ctx.trace('downloaded', { name: e.name, file: o.name, ok: true, code: null })
    }
}


//writeFull, 同步寫完整個緩衝; 寫入量非正整數(零進度或異常回傳)即拋錯, 不無限迴圈
function writeFull(ctx, fd, buf) {
    let off = 0
    while (off < buf.length) {
        let n = ctx.fs.writeSync(fd, buf, off, buf.length - off)
        if (!Number.isSafeInteger(n) || n <= 0) {
            throw new Error(`writeSync returned ${String(n)} for ${buf.length - off} bytes`)
        }
        off += n
    }
}


//concatFiles, 依序串接分割檔為fpOut(排他建立)
async function concatFiles(ctx, fps, fpOut) {
    let fd = ctx.fs.openSync(fpOut, 'wx')
    try {
        for (let fp of fps) {
            let rs = ctx.fs.createReadStream(fp)
            try {
                for await (let chunk of rs) {
                    writeFull(ctx, fd, chunk)
                }
            }
            finally {
                rs.destroy()
            }
        }
    }
    finally {
        ctx.fs.closeSync(fd)
    }
}


//runTar, 執行解壓程式, 回傳{ code, stderr }、{ err, enoent }或{ timeout, exited }
//逾時(ctx.extractMs)則終止之, 並等其結束至多KILL_WAIT_MS(結束前不回傳, 免得清理暫存夾時解壓程式仍在寫入), exited為是否確認已結束
function runTar(ctx, name, prog, args, cwd) {
    return new Promise((resolve) => {
        let done = false
        let timedOut = false
        let timer = null
        let timerKill = null
        let stderr = ''
        let cp = null
        let fin = (r) => {
            if (done) {
                return
            }
            done = true
            clearTimeout(timer)
            clearTimeout(timerKill)
            resolve(r)
        }
        try {
            let spawn = ctx.spawn
            cp = spawn(prog, args, { cwd, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
        }
        catch (err) {
            fin({ err, enoent: codeOf(err) === 'ENOENT' })
            return
        }
        cp.on('error', (err) => {
            if (timedOut) {
                return //終止失敗之error: 續等close或等待上限, 不提早回傳
            }
            fin({ err, enoent: codeOf(err) === 'ENOENT' })
        })
        if (cp.stderr) {
            cp.stderr.on('data', (d) => {
                if (stderr.length < 2000) {
                    stderr += String(d)
                }
            })
        }
        cp.on('close', (code) => {
            fin(timedOut ? { timeout: true, exited: true, stderr } : { code, stderr })
        })
        timer = setTimeout(() => {
            timedOut = true
            if (ctx.trace) {
                ctx.trace('kill', { name })
            }
            try {
                cp.kill()
            }
            catch (err) {}
            timerKill = setTimeout(() => {
                fin({ timeout: true, exited: false, stderr })
            }, KILL_WAIT_MS)
        }, ctx.extractMs)
    })
}


//extract, 於暫存夾內以tar(Windows內建tar.exe即bsdtar)解出成員, 依清單extract校驗; 參數皆為暫存夾內之相對路徑(不經命令列傳遞非ASCII之絕對路徑)
async function extract(ctx, e, work, zipRel) {
    let x = e.extract
    ctx.fs.mkdirSync(ctx.path.join(work, 'x'), { recursive: true })
    emit(ctx, { step: 'extract', name: e.name, member: x.member })
    if (ctx.trace) {
        ctx.trace('extract', { name: e.name })
    }
    let args = ['-x', '-f', zipRel, '-C', 'x', '--', x.member]
    let r = null
    for (let prog of ctx.tarProgs) {
        r = await runTar(ctx, e.name, prog, args, work)
        if (!r.enoent) {
            break
        }
    }
    if (ctx.trace) {
        //result: 'error'為解壓程式不存在或無法啟動, 'timeout'為逾時(exited為終止後是否確認已結束), 'exit'為已結束(code為其離開碼)
        let result = 'enoent' in r ? 'error' : r.timeout ? 'timeout' : 'exit'
        ctx.trace('extracted', { name: e.name, result, code: result === 'exit' && typeof r.code === 'number' ? r.code : null, exited: result === 'timeout' ? r.exited === true : result === 'exit' ? true : null })
    }
    let fail = (msg, cause, more = {}) => {
        let extra = { step: 'extract', pkg: ctx.pkg, bin: e.name, ...more }
        if (cause !== undefined) {
            extra.cause = cause
        }
        return mkErr('E_EXTRACT', maskUrl(`fsEnsureBins[${ctx.pkg}] file[${e.name}]: can not extract "${x.member}": ${msg}`), extra)
    }
    if (r.enoent) {
        throw fail(`the extraction program is not available (${ctx.tarProgs.join(' or ')}; Windows 10 1803 and later include tar.exe, other systems need bsdtar of libarchive)`, r.err)
    }
    if (r.err) {
        throw fail(errMsg(r.err), r.err)
    }
    if (r.timeout) {
        //終止後仍未確認結束: 保留暫存夾(解壓程式可能仍在寫入), 列入leftovers
        throw fail(`the extraction did not finish within ${ctx.extractMs}ms (opt.totalMs)${r.exited ? '' : `, and the extraction program did not exit within ${KILL_WAIT_MS}ms after being terminated, the work folder "${work}" is kept`}`, undefined, r.exited ? {} : { workBusy: true })
    }
    if (r.code !== 0) {
        throw fail(`the extraction program exited with code ${r.code}: ${String(r.stderr).trim().slice(0, 500)}`)
    }
    let fp = ctx.path.join(work, 'x', ...x.member.split('/'))
    let st = lstatOrNull(ctx, fp)
    if (st === null) {
        throw fail(`the member is not in the archive`)
    }
    if (!st.isFile()) {
        throw fail(`the member is not a regular file`)
    }
    let h = await hashFile(ctx, fp)
    if (h.size !== x.size) {
        throw mkErr('E_SIZE_MISMATCH', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: the extracted "${x.member}" has ${h.size} bytes, the manifest expects ${x.size} bytes`, { step: 'extract', pkg: ctx.pkg, bin: e.name, expected: { sha256: x.sha256, size: x.size }, actual: h })
    }
    if (h.sha256 !== x.sha256) {
        throw mkErr('E_HASH_MISMATCH', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: the extracted "${x.member}" has sha256 ${h.sha256}, the manifest expects ${x.sha256}`, { step: 'extract', pkg: ctx.pkg, bin: e.name, expected: { sha256: x.sha256, size: x.size }, actual: h })
    }
    return fp
}


//place, 已校驗之解出檔原子移入快取; 失敗而最終檔已是期望內容(他方已放好)視為成功
async function place(ctx, e, fpX, dirFinal, fpFinal) {
    ctx.fs.mkdirSync(dirFinal, { recursive: true })
    for (let i = 1; i <= 5; i++) {
        try {
            ctx.fs.renameSync(fpX, fpFinal)
            return
        }
        catch (err) {
            if (await isExpected(ctx, fpFinal, e.final)) {
                return
            }
            if (!codesBusy.includes(codeOf(err)) || i === 5) {
                throw mkErr('E_RENAME', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: can not move the extracted file to "${fpFinal}": ${errMsg(err)}`, { step: 'place', pkg: ctx.pkg, bin: e.name, cause: err })
            }
            await sleep(200 * i)
        }
    }
}


//mkWork, 於快取夾內建立本次專用之暫存夾(排他建立)
function mkWork(ctx, e) {
    let fail = (err) => {
        return mkErr('E_FS', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: can not create a work folder in "${ctx.cacheRoot}": ${errMsg(err)}`, { step: 'prepare', pkg: ctx.pkg, bin: e.name, cause: err })
    }
    try {
        ctx.fs.mkdirSync(ctx.cacheRoot, { recursive: true })
    }
    catch (err) {
        throw fail(err)
    }
    for (let i = 0; i < 5; i++) {
        let fp = ctx.path.join(ctx.cacheRoot, `.work-${ctx.pid}-${rnd()}`)
        try {
            ctx.fs.mkdirSync(fp)
            return fp
        }
        catch (err) {
            if (codeOf(err) !== 'EEXIST' || i === 4) {
                throw fail(err)
            }
        }
    }
    return ''
}


//rmWork, 刪除本次之暫存夾(不跟隨連結); 刪不掉者記入本次取得之left(成功時為結果之leftovers、失敗時為錯誤之leftovers)並以進度通知, 不稱已清除
function rmWork(ctx, e, work) {
    try {
        ctx.fs.rmSync(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    }
    catch (err) {
        ctx.left.push({ name: e.name, fp: work, error: errMsg(err) })
        emit(ctx, { step: 'cleanup', name: e.name, fp: work, error: errMsg(err) })
        if (ctx.trace) {
            ctx.trace('cleanup', { name: e.name, ok: false })
        }
        return
    }
    if (ctx.trace) {
        ctx.trace('cleanup', { name: e.name, ok: true })
    }
}


//noteFresh, 離線時記下fd(本檔之<快取>/<sha256>夾)及其上層中「此刻尚不存在」之資料夾(自fd往上, 遇存在者即止)
//供缺檔reject前tidyFresh清掉其中仍為空者; 原本已存在之夾不記; 讀不到狀態(權限等)則不記
function noteFresh(ctx, fd) {
    let cur = fd
    for (;;) {
        let st = null
        try {
            st = lstatOrNull(ctx, cur)
        }
        catch (err) {
            return
        }
        if (st !== null) {
            return
        }
        if (!ctx.fresh.includes(cur)) {
            ctx.fresh.push(cur)
        }
        let up = ctx.path.join(cur, '..')
        if (up === cur) {
            return
        }
        cur = up
    }
}


//tidyFresh, 離線缺檔reject前, 把noteFresh所記之資料夾中仍為空者刪除(由深而淺, 用rmdirSync只刪空夾, 非空或刪不掉者保留不報錯); 回傳刪除之個數
//缺檔之嘗試(暫存夾、下載核心建立之<sha256>夾、鏡像失敗而留下之空夾)不得留下本次新建之空資料夾; 傳入之fs無rmdirSync者不處理
function tidyFresh(ctx) {
    let n = 0
    let fps = [...ctx.fresh].sort((a, b) => b.length - a.length)
    ctx.fresh.length = 0
    for (let fp of fps) {
        try {
            let rmdir = get(ctx.fsRaw, 'rmdirSync')
            if (isfun(rmdir)) {
                rmdir.call(ctx.fsRaw, fp)
                n++
            }
        }
        catch (err) {}
    }
    return n
}


//runEntry, 取得一個檔: 快取(校驗)→鏡像→GitHub或廠商網址; 壓縮檔於暫存夾內取得、組合、解出、校驗後才移入快取
async function runEntry(ctx, e, fd, fpFinal) {
    let hit = await checkCache(ctx, e, fpFinal)
    if (ctx.trace) {
        ctx.trace('cache', { name: e.name, hit })
    }
    if (hit) {
        emit(ctx, { step: 'cache', name: e.name, fp: fpFinal, hit: true })
        if (ctx.trace) {
            ctx.trace('ready', { name: e.name })
        }
        return fpFinal
    }
    if (ctx.offline) {
        noteFresh(ctx, fd) //離線: 記下本檔之<sha256>夾與快取根(及其上層)中尚不存在者, 缺檔reject前把仍為空者清掉
    }
    //取得後不記入行程內記憶(放入後至記錄前可能被換掉), 下次使用時再校驗一次
    let reasons = []
    if (e.extract === null) {
        await obtain(ctx, e, e.direct, fpFinal, reasons)
        emit(ctx, { step: 'ready', name: e.name, fp: fpFinal })
        if (ctx.trace) {
            ctx.trace('ready', { name: e.name })
        }
        return fpFinal
    }

    //鏡像可能已有解出之最終檔(由快取夾製成之鏡像)
    if (ctx.mirrorKind !== '') {
        let r = await fromMirror(ctx, e, e.final, fpFinal)
        if (r === true) {
            emit(ctx, { step: 'ready', name: e.name, fp: fpFinal })
            if (ctx.trace) {
                ctx.trace('ready', { name: e.name })
            }
            return fpFinal
        }
        if (r !== null) {
            reasons.push(r)
        }
    }

    //離線且無鏡像: 壓縮檔與分割檔皆無來源可取(離線不連網), 先於建暫存夾即回報缺檔, 不建立快取夾(唯讀之套件根亦得E_OFFLINE_MISSING而非建夾失敗)
    if (ctx.offline && ctx.mirrorKind === '') {
        throw missingOf(ctx, e, reasons)
    }

    let work = mkWork(ctx, e)
    if (ctx.trace) {
        ctx.trace('work', { name: e.name })
    }
    let keep = false
    try {
        let zipRel = ''
        if (e.archive !== null) {
            zipRel = `archive/${e.archive.name}`
            await obtain(ctx, e, e.archive, ctx.path.join(work, 'archive', e.archive.name), reasons)
        }
        else {
            let fps = []
            for (let p of e.parts) {
                let fp = ctx.path.join(work, 'parts', p.name)
                await obtain(ctx, e, p, fp, reasons)
                fps.push(fp)
            }
            zipRel = 'assembled.zip'
            let fpZip = ctx.path.join(work, zipRel)
            try {
                await concatFiles(ctx, fps, fpZip)
            }
            catch (err) {
                throw mkErr('E_FS', `fsEnsureBins[${ctx.pkg}] file[${e.name}]: can not assemble the parts: ${errMsg(err)}`, { step: 'assemble', pkg: ctx.pkg, bin: e.name, cause: err })
            }
            let h = await hashFile(ctx, fpZip)
            let a = e.assembled
            if (h.size !== a.size || h.sha256 !== a.sha256) {
                let code = h.size !== a.size ? 'E_SIZE_MISMATCH' : 'E_HASH_MISMATCH'
                throw mkErr(code, `fsEnsureBins[${ctx.pkg}] file[${e.name}]: the assembled archive has sha256 ${h.sha256} and ${h.size} bytes, the manifest expects ${a.sha256} and ${a.size} bytes`, { step: 'assemble', pkg: ctx.pkg, bin: e.name, expected: { sha256: a.sha256, size: a.size }, actual: h })
            }
        }
        let fpX = await extract(ctx, e, work, zipRel)
        await place(ctx, e, fpX, fd, fpFinal)
        if (ctx.trace) {
            ctx.trace('place', { name: e.name })
        }
    }
    catch (err) {
        keep = isOwnErr(err) && err.workBusy === true //解壓程式未確認結束: 不刪暫存夾
        throw err
    }
    finally {
        if (keep) {
            ctx.left.push({ name: e.name, fp: work, error: 'the extraction program did not exit, the work folder is kept' })
            if (ctx.trace) {
                ctx.trace('cleanup', { name: e.name, ok: false })
            }
        }
        else {
            rmWork(ctx, e, work)
        }
    }
    emit(ctx, { step: 'ready', name: e.name, fp: fpFinal })
    if (ctx.trace) {
        ctx.trace('ready', { name: e.name })
    }
    return fpFinal
}


//normErr, 取得一個檔之失敗一律為帶code、step、pkg、bin之錯誤: 非本函數與下載核心之錯誤(如傳入之fs所拋)轉為E_FS
function normErr(ctx, e, err) {
    //下載核心之錯誤已由tagErr標註(以身分判定, 不以可被傳入元件偽造之pkg或code判定), 原樣回傳
    if (_tagged.has(err)) {
        return err
    }
    if (!isOwnErr(err)) {
        let c = codeOf(err)
        err = mkErr('E_FS', maskUrl(`fsEnsureBins[${ctx.pkg}] file[${e.name}]: ${isStr(c) ? `${c} ` : ''}${errMsg(err)}`), { step: 'prepare', cause: err })
    }
    if (err.code === 'E_OFFLINE_MISSING') {
        return err //離線缺檔由主流程彙整
    }
    try {
        if (err.pkg === undefined) {
            err.pkg = ctx.pkg
        }
        if (err.bin === undefined) {
            err.bin = e.name
        }
    }
    catch (e2) {}
    return err
}


//ensureEntry, 同程序內同一最終檔、同樣來源設定之併發呼叫共用同一次取得; 回傳{ pm, left }, left為該次取得刪不掉之暫存(共用者共享)
function ensureEntry(ctx, e) {
    let fd = ctx.path.join(ctx.cacheRoot, e.final.sha256)
    let fpFinal = ctx.path.join(fd, e.final.name)
    let key = keyOf(ctx, fpFinal)
    let left = []
    let run = () => {
        let jctx = Object.create(ctx) //本次取得之脈絡: left為本次取得之leftovers
        jctx.left = left
        return runEntry(jctx, e, fd, fpFinal)
            .catch((err) => {
                err = normErr(ctx, e, err)
                if (left.length > 0 && err.code !== 'E_OFFLINE_MISSING') {
                    try {
                        err.leftovers = [...(Array.isArray(err.leftovers) ? err.leftovers : []), ...left]
                    }
                    catch (e2) {}
                }
                if (ctx.trace && err.code !== 'E_OFFLINE_MISSING') {
                    ctx.trace('fail', { name: e.name, code: codeStr(err) })
                }
                throw err
            })
    }

    //共用條件: 影響來源與結果之值皆相同(清單項、套件、快取與鏡像位置、離線、下載與時限選項、解壓程式), 且所傳入之模組、fetch與其方法為同一物件
    let sig = null
    try {
        sig = JSON.stringify([e, ctx.pkg, ctx.cacheRoot, ctx.mirrorKind, ctx.mirrorBase, ctx.offline, ctx.dl, ctx.extractMs, ctx.tarProgs])
    }
    catch (err) {
        //下載選項含無法序列化之值(如BigInt): 不共用
        if (ctx.trace) {
            ctx.trace('job', { name: e.name, mode: 'solo' })
        }
        return { pm: run(), left }
    }
    let mods = [ctx.fsRaw, ctx.fetchRaw, ctx.spawn, ctx.cryptoRaw, ctx.ReadableRaw, ctx.pipeline, ...ctx.refs]
    let jobs = _jobs.get(key)
    if (jobs === undefined) {
        jobs = []
        _jobs.set(key, jobs)
    }
    let cur = jobs.find((job) => {
        return job.sig === sig && job.mods.length === mods.length && job.mods.every((m, i) => m === mods[i])
    })
    if (cur !== undefined) {
        if (ctx.trace) {
            ctx.trace('job', { name: e.name, mode: 'join' })
        }
        return { pm: cur.pm, left: cur.left }
    }
    if (ctx.trace) {
        ctx.trace('job', { name: e.name, mode: 'new' })
    }
    let job = { sig, mods, left, pm: null }
    job.pm = run()
        .finally(() => {
            let l = _jobs.get(key)
            if (l !== undefined) {
                let i = l.indexOf(job)
                if (i >= 0) {
                    l.splice(i, 1)
                }
                if (l.length === 0) {
                    _jobs.delete(key)
                }
            }
        })
    jobs.push(job)
    return { pm: job.pm, left }
}


//readCapped, 讀取回應本體為UTF-8文字(上限cap位元組)
async function readCapped(res, cap, hold) {
    let body = get(res, 'body')
    let chunks = []
    let n = 0
    let reader = body.getReader()
    hold.reader = reader //供逾時或失敗時取消(不依賴串流響應中止)
    for (;;) {
        let r = await reader.read()
        if (r.done) {
            break
        }
        n += r.value.length
        if (n > cap) {
            throw mkErr('E_MANIFEST', `the manifest is larger than ${cap} bytes`, { step: 'manifest' })
        }
        chunks.push(r.value)
    }
    let buf = new Uint8Array(n)
    let off = 0
    for (let c of chunks) {
        buf.set(c, off)
        off += c.length
    }
    hold.reader = null //已讀完, 不需取消
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
}


//cancelBody, 取消回應本體(或其reader)以釋放連線; 不等待其落定, 失敗不影響結果; why為通知觀察回調用之原因
function cancelBody(ctx, why, res, reader) {
    try {
        let p = reader ? reader.cancel() : res.body.cancel()
        if (p && isfun(p.catch)) {
            p.catch(() => {})
        }
    }
    catch (err) {}
    if (ctx.trace) {
        ctx.trace('cancel', { why })
    }
}


//fetchText, 取主幹清單之文字, 以manifestMs(同opt.stallMs)為整體上限; 逾時或失敗時取消未讀完之本體, 放棄等待後才落定之回應亦取消其本體
async function fetchText(ctx, url) {
    let ac = new AbortController()
    let timer = null
    let done = false
    let hold = { reader: null }
    let pmTimeout = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            let e = mkErr('E_TIMEOUT', `getting the manifest did not finish within ${ctx.manifestMs}ms (opt.stallMs)`, { step: 'manifest' })
            ac.abort(e)
            reject(e)
        }, ctx.manifestMs)
    })
    pmTimeout.catch(() => {})
    let gotRes = null //fetch落定之回應
    let taken = false //回應已交本函數處理(其本體之取消由下方負責)
    try {
        let fn = ctx.fetchFn
        let pmFetch = Promise.resolve().then(() => {
            return fn(url, { signal: ac.signal })
        })
        pmFetch.then((r) => {
            gotRes = r
            if (done && !taken) {
                cancelBody(ctx, 'late', r, null) //放棄等待後才落定之回應(與finally之先後不定, 兩處擇一取消)
            }
        }, () => {})
        let res = await Promise.race([pmFetch, pmTimeout])
        taken = true
        if (!get(res, 'ok')) {
            cancelBody(ctx, 'status', res, null)
            throw mkErr('E_HTTP', `HTTP ${get(res, 'status')}`, { step: 'manifest', status: get(res, 'status') })
        }
        return await Promise.race([readCapped(res, MANIFEST_CAP, hold), pmTimeout])
    }
    catch (err) {
        if (isOwnErr(err)) {
            throw err
        }
        throw mkErr('E_NETWORK', maskUrl(errMsg(err)), { step: 'manifest', cause: err })
    }
    finally {
        done = true
        clearTimeout(timer)
        if (hold.reader !== null) {
            cancelBody(ctx, 'unread', null, hold.reader) //逾時、超過上限或讀取失敗時未讀完之本體
        }
        else if (gotRes !== null && !taken) {
            cancelBody(ctx, 'settled', gotRes, null) //逾時勝出而回應已落定(未交出)
        }
        ac.abort()
    }
}


//parseManifest, 文字解析並檢核, 須與基準清單同一套件與repo
function parseManifest(ctx, base, text, src) {
    let raw = null
    try {
        raw = JSON.parse(String(text).replace(/^\uFEFF/, ''))
    }
    catch (err) {
        throw mkErr('E_MANIFEST', `fsEnsureBins: the manifest${src} is not valid JSON: ${errMsg(err)}`, { step: 'manifest' })
    }
    let m = normManifest(raw, src)
    if (m.pkg !== base.pkg || m.repo !== base.repo) {
        throw mkErr('E_MANIFEST', `fsEnsureBins: the manifest${src} is for ${m.pkg}(${m.repo}), not ${base.pkg}(${base.repo})`, { step: 'manifest', field: 'pkg' })
    }
    return m
}


//writeLast, 主幹清單之「最近一次成功」副本(紀錄, 供除錯與鏡像製作時知道檔案取自哪一版清單; 不作為校驗依據): 暫存檔排他建立、寫入後原子更名
//失敗(含寫入中途)時刪除本次建立之暫存檔, 以進度通知, 不影響結果
function writeLast(ctx, text) {
    let fp = ctx.path.join(ctx.cacheRoot, NAME_LAST)
    let tmp = `${fp}.${ctx.pid}.${rnd()}.part`
    let created = false
    let renamed = false
    try {
        ctx.fs.mkdirSync(ctx.cacheRoot, { recursive: true })
        let fd = ctx.fs.openSync(tmp, 'wx')
        created = true
        try {
            writeFull(ctx, fd, new TextEncoder().encode(text))
        }
        finally {
            ctx.fs.closeSync(fd)
        }
        ctx.fs.renameSync(tmp, fp)
        renamed = true
    }
    catch (err) {
        emit(ctx, { step: 'manifest', source: 'last', write: false, error: errMsg(err) })
    }
    finally {
        if (created && !renamed) {
            try {
                ctx.fs.unlinkSync(tmp)
            }
            catch (err) {
                ctx.leftovers.push({ name: NAME_LAST, fp: tmp, error: errMsg(err) }) //刪不掉者列入結果之leftovers, 不稱已清除
                emit(ctx, { step: 'cleanup', fp: tmp, error: errMsg(err) })
            }
        }
    }
    if (ctx.trace) {
        ctx.trace('last', { ok: renamed })
    }
}


//resolveManifest, 主幹模式: 取主幹清單(schema檢核且須同pkg與repo), 失敗(含離線、無效)則用基準清單(規格M5、T8)
//「最近一次成功」之副本存於快取夾, 其可信度同快取夾(能寫入者可同改副本與執行檔), 故不作為退路, 以免使快取之校驗(D4)失效
async function resolveManifest(ctx, base) {
    if (base.mode !== 'floating') {
        return base
    }
    //信任錨為GitHub主幹(規格M5): opt.floatingManifestUrl只能是同一repo之GitHub原始檔網址(可改分支或路徑, 測試以opt.fetch改指本機)
    if (ctx.floatingManifestUrl !== null && !ctx.floatingManifestUrl.startsWith(`${RAW}/${base.repo}/`)) {
        throw mkErr('E_ARG', `fsEnsureBins[${base.pkg}]: opt.floatingManifestUrl must be under ${RAW}/${base.repo}/ (the trust anchor of the trunk manifest is GitHub), got ${ctx.floatingManifestUrl}`, { step: 'argument' })
    }
    if (!ctx.offline) {
        let url = ctx.floatingManifestUrl !== null ? ctx.floatingManifestUrl : `${RAW}/${base.repo}/${BRANCH}/${encRel(base.manifestPath)}`
        try {
            if (ctx.trace) {
                ctx.trace('trunk', { phase: 'fetch', code: null })
            }
            let text = await fetchText(ctx, url)
            let m = parseManifest(ctx, base, text, ` from ${url}`)
            writeLast(ctx, text)
            emit(ctx, { step: 'manifest', source: 'remote', url })
            if (ctx.trace) {
                ctx.trace('trunk', { phase: 'ok', code: null })
            }
            return m
        }
        catch (err) {
            emit(ctx, { step: 'manifest', source: 'remote', url, error: maskUrl(`${codeOf(err) || ''} ${errMsg(err)}`.trim()) })
            if (ctx.trace) {
                ctx.trace('trunk', { phase: 'fail', code: codeStr(err) })
            }
        }
    }
    emit(ctx, { step: 'manifest', source: 'baseline' })
    return base
}


//offlineErr, 離線缺檔之固定格式錯誤: 缺哪個檔(名稱、sha256、大小)、應放到哪(快取與鏡像之完整路徑)、怎麼準備
function offlineErr(ctx, missing) {
    let ls = [`fsEnsureBins[${ctx.pkg}]: offline (W_BIN_OFFLINE or opt.offline), ${missing.length} external executable file(s) are not in the cache or the mirror:`]
    for (let m of missing) {
        ls.push(`- ${m.name}: sha256 ${m.sha256}, ${m.size} bytes`)
        ls.push(`  put it at: ${m.cachePath} (cache)`)
        if (m.mirrorPath !== null) {
            ls.push(`  or at: ${m.mirrorPath} (mirror)`)
        }
        else {
            ls.push(`  or at: <W_BIN_MIRROR>/${ctx.pkg}/${m.sha256}/${m.name} (mirror, not set)`)
        }
        if (m.url !== null) {
            ls.push(`  source: ${m.url}`)
        }
        if (m.archive !== null) {
            let a = m.archive
            ls.push(`  it is extracted from "${m.member}" of the archive ${a.name}: sha256 ${a.sha256}, ${a.size} bytes, source: ${a.url}; the archive may instead be put at: ${a.mirrorPath !== null ? a.mirrorPath : `<W_BIN_MIRROR>/${ctx.pkg}/${a.sha256}/${a.name}`} (mirror)`)
        }
        if (m.parts !== null) {
            ls.push(`  it is extracted from "${m.member}" of an archive split into ${m.parts.length} parts, which may instead be put in the mirror:`)
            for (let p of m.parts) {
                ls.push(`    ${p.mirrorPath !== null ? p.mirrorPath : `<W_BIN_MIRROR>/${ctx.pkg}/${p.sha256}/${p.name}`}: sha256 ${p.sha256}, ${p.size} bytes, source: ${p.url}`)
            }
        }
        for (let r of m.reasons) {
            ls.push(`  note: ${r}`)
        }
    }
    ls.push(`how to prepare: on a computer with internet access, set W_BIN_CACHE to an empty folder and call ensureBins() of this package (or use its functions that need these files), then bring that folder here and set W_BIN_MIRROR to it (the folder holds <package>/<sha256>/<name>); or put each file above at the given path`)
    return mkErr('E_OFFLINE_MISSING', maskUrl(ls.join('\n')), { step: 'offline', pkg: ctx.pkg, missing })
}


/**
 * 後端nodejs依清單取得外部執行檔(快取、鏡像、GitHub)並以清單之SHA-256與大小校驗, 回傳各檔之絕對路徑, 可傳入fs、fetch、spawn與環境變數
 *
 * 規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec), 本函數為其§6之共用實作; 規則帳本R-BIN-ENSURE-01。各套件只提供清單、呼叫本函數取得路徑、匯出ensureBins(), 不得自寫下載、快取、鏡像、校驗。
 *
 * 清單manifest(schema 1)為物件或JSON檔路徑(相對路徑以opt.pkgRoot為基準): { schema: 1, pkg, mode: 'pinned'|'floating', repo: '<owner>/<repo>', commit(40碼小寫十六進位, 釘選模式有path之檔時必填), manifestPath(主幹模式之清單於repo內之路徑, 預設'bin/manifest.json'), files: [...], note, version }。files之每項: name(檔名, 英數與._+-, 不分大小寫不得重複), 來源為path(repo內之相對路徑, 自有檔, 網址為https://raw.githubusercontent.com/<repo>/<commit或master>/<path>)、url(廠商檔, 須https、不得帶帳密、不得為releases/latest)或parts(分割壓縮檔, 每項{ path或url, sha256, size, name(選填, 預設為path或url之最後一段) }, 須另給assembled: { type: 'zip', sha256, size }為組合後之校驗值), sha256(64碼十六進位)與size(位元組數)為該來源檔之校驗值(parts者不給), extract: { type: 'zip', member(壓縮檔內之相對路徑), sha256, size }為解出之檔之校驗值, note(選填)。不認得之欄位、型別不符、名稱或路徑不合白名單皆為E_MANIFEST。
 *
 * 取得順序: ①快取: 位置為<快取>/<sha256>/<name>(內容定址, sha256為最終檔之值, 壓縮檔者為extract之值), 快取資料夾為opt.cacheDir, 否則環境變數W_BIN_CACHE時為<W_BIN_CACHE>/<pkg>, 否則<opt.pkgRoot>/bin-cache; 命中亦校驗大小與SHA-256, 本行程內已校驗且檔案識別(裝置、inode、大小、修改與變更時間)未變者不重複雜湊, 不符者刪除(識別未變才刪)後重新取得。②鏡像: opt.mirror, 否則環境變數W_BIN_MIRROR, 為本地資料夾或http(s)基底網址, 結構為<鏡像>/<pkg>/<sha256>/<name>; 壓縮檔者先找解出之最終檔, 再找壓縮檔(<name>為其path或url之最後一段)或各分割檔; 鏡像之檔不符清單即拒用(不留檔)並續找下一來源。③GitHub或廠商網址(離線時不連)。任何來源皆經fsDownloadFileVerify之暫存檔、校驗、原子更名寫入, 不讀到半檔。
 *
 * 離線: opt.offline, 否則環境變數W_BIN_OFFLINE為1或true時, 只用快取與鏡像, 缺檔時reject E_OFFLINE_MISSING, 訊息列出每個缺檔之名稱、sha256、大小、應放之快取與鏡像完整路徑、來源網址與準備方法, 錯誤物件之missing為[{ name, sha256, size, cachePath, mirrorPath, url, member, archive, parts, reasons }]。
 *
 * 主幹模式(mode為floating): 先取主幹清單(opt.floatingManifestUrl, 否則https://raw.githubusercontent.com/<repo>/master/<manifestPath>, 上限1MB, 時限同opt.stallMs), 同樣檢核schema且須為同一pkg與repo; 成功時其副本存於<快取>/manifest-last.json(紀錄, 不作為校驗依據); 失敗(含離線、無效)時用傳入之基準清單。主幹清單之信任錨為GitHub主幹(規格M5), 故opt.floatingManifestUrl只能是https://raw.githubusercontent.com/<repo>/之下(同一repo, 可改分支或路徑, 否則E_ARG), 套件之ensureBins不應轉傳使用者之值。
 *
 * 壓縮檔: 於快取夾內本次專用之暫存夾(.work-<pid>-<亂數>)取得壓縮檔(或各分割檔各自校驗後依序組合並校驗assembled), 以tar解出成員(Windows為<SystemRoot>\System32\tar.exe即bsdtar, 其他系統為bsdtar或tar, 須支援zip, 參數皆為暫存夾內之相對路徑, 成員前加--), 解出之檔須為一般檔案且符合extract之大小與SHA-256, 才原子移入快取; 暫存夾於結束時刪除, 刪不掉者(含下載核心刪不掉之暫存檔、主幹清單副本之暫存檔)列於結果之leftovers(不可列舉之屬性; 失敗時為錯誤物件之leftovers; 共用同一次取得者皆得到)。解壓時限同opt.totalMs, 逾時終止後等其結束至多5秒, 仍未結束則保留暫存夾並列入leftovers。解壓失敗為E_EXTRACT。
 *
 * 清單與選項之字串一律須為原始字串(包裝物件new String與new Boolean不接受), 檢查之值即使用之值。離線時http(s)鏡像之重導不追隨(視為拒用)。
 *
 * 併發: 同程序內同一最終檔且來源設定相同之併發呼叫共用同一次取得(其onProgress只通知最先呼叫者); 跨程序以暫存檔與原子更名保證不讀到半檔, 更名失敗而最終檔已是期望內容視為成功。各檔依清單順序逐一取得。
 *
 * 錯誤: reject帶code之Error: 'E_ARG'(參數)、'E_MANIFEST'(清單, 帶field)、'E_OFFLINE_MISSING'(離線缺檔, 帶missing)、'E_EXTRACT'(解壓)、'E_RENAME'(移入快取), 以及fsDownloadFileVerify之code('E_HTTP'、'E_NETWORK'、'E_TIMEOUT'、'E_TIMEOUT_TOTAL'、'E_SIZE_MISMATCH'、'E_HASH_MISMATCH'、'E_FS'等, 訊息前綴fsEnsureBins[<pkg>] file[<name>] from <github|url>); 皆帶step, 屬某檔者另帶pkg與bin(檔名)。訊息與欄位內之網址帳密一律遮蔽(鏡像網址帶帳密者須傳入opt.fetch處理認證, 否則E_ARG)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEnsureBins.test.mjs Github}
 * @memberOf wsemi
 * @param {Object|String} manifest 輸入清單物件(schema 1), 或其JSON檔路徑(相對路徑以opt.pkgRoot為基準)
 * @param {Object} opt 輸入設定物件
 * @param {String} opt.pkgRoot 輸入套件根目錄, 必填
 * @param {String|Array} [opt.names=null] 輸入只取部分檔之名稱或其陣列, 預設null為全部
 * @param {String} [opt.cacheDir=''] 輸入快取資料夾(其下為<sha256>/<name>), 優先於W_BIN_CACHE, ''為預設位置, 預設''
 * @param {String} [opt.mirror=undefined] 輸入鏡像(本地資料夾或http(s)基底網址), 給了即優先於W_BIN_MIRROR(空字串為不使用鏡像)
 * @param {Boolean} [opt.offline=undefined] 輸入是否離線, 給了即優先於W_BIN_OFFLINE
 * @param {Function} [opt.fetch=null] 輸入fetch函數(測試注入或處理認證), 未給時用全域fetch
 * @param {Function} [opt.onProgress=null] 輸入進度通知函數, 收到{ pkg, step('manifest'、'cache'、'mirror'、'download'、'extract'、'ready'、'cleanup'), name, ... }, 其拋錯皆忽略
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數, 於內部事件發生當下同步呼叫, 傳入一個凍結之事件物件{ type, ... }, 供測試以事件(而非等待時間)同步與診斷; 與onProgress(給使用者之進度)分開, 不轉傳給內部之下載核心。type與其欄位為: 'manifest'(本次採用之清單已確定, 含source為'base'[釘選模式之傳入清單]、'remote'[取得主幹清單]、'baseline'[主幹模式退回傳入之基準清單], 與files為該清單之檔案數), 'trunk'(主幹清單, 含phase為'fetch'[開始取, 時限計時器已建立]、'ok'[取得且檢核通過]、'fail'[失敗, 逾opt.stallMs而放棄者code為'E_TIMEOUT'], 與code為失敗之錯誤碼或null), 'cancel'(已取消主幹清單回應之本體, 含why為'unread'[讀取中途被中止]、'late'[放棄等待後才落定之回應]、'settled'[逾時勝出時已落定而未交出之回應]、'status'[非2xx之回應]), 'last'(主幹清單副本寫入manifest-last.json, 含ok), 'job'(各檔取得之登記, 含name與mode為'new'[新開一次取得]、'join'[共用同程序已在進行之同一次取得, 該次取得之其餘事件只通知最先呼叫者]、'solo'[選項無法序列化而不共用]), 'cache'(快取校驗結果, 含name與hit), 'mirror'(鏡像嘗試, 含name、file與result為'ok'、'miss'、'rejected'), 'offline'(離線缺檔之判定, 含name), 'work'(已建本次專用暫存夾, 含name), 'download'(開始自GitHub或廠商網址下載, 含name與file), 'downloaded'(下載結束, 含name、file、ok與code), 'extract'(開始解壓, 含name), 'kill'(解壓逾opt.totalMs而即將終止解壓程式, 含name), 'extracted'(解壓程式已結束或放棄等待, 含name、result為'exit'、'timeout'、'error', code為離開碼或null, exited為是否確認已結束或null), 'place'(解出檔已移入快取, 含name), 'cleanup'(暫存夾刪除結果, 含name與ok; 刪不掉或因解壓程式未結束而保留者ok為false), 'ready'(該檔已就緒, 含name), 'fail'(該檔失敗[離線缺檔除外], 含name與code), 'tidy'(離線缺檔reject前清除本次新建之空資料夾, 含n為清除個數), 'settle'(整體結果, 含ok與code; ok為false時code為錯誤碼或null)。事件皆於對應動作之後、resolve或reject之前通知, 回調不帶接收者呼叫, 其拋錯與回傳值皆忽略, 不影響取得, 預設null
 * @param {String} [opt.floatingManifestUrl=null] 輸入主幹模式之清單網址, 須在https://raw.githubusercontent.com/<repo>/之下, 預設由清單之repo與manifestPath組成
 * @param {Integer} [opt.maxAttempts=3] 輸入下載之最多嘗試次數(交fsDownloadFileVerify)
 * @param {Number} [opt.retryDelayMs=1000] 輸入下載之重試間隔基數毫秒(交fsDownloadFileVerify)
 * @param {Number} [opt.stallMs=30000] 輸入下載之停滯毫秒數(交fsDownloadFileVerify)
 * @param {Number} [opt.totalMs=600000] 輸入每個檔下載之整體時間上限毫秒數(交fsDownloadFileVerify)
 * @param {Object} opt.fs 輸入fs, 須有mkdirSync、lstatSync、openSync、closeSync、writeSync、readFileSync、createReadStream、renameSync、unlinkSync、rmSync及fsDownloadFileVerifyCore所需者
 * @param {Object} opt.path 輸入path, 須有resolve、join
 * @param {Object} opt.crypto 輸入crypto, 須有createHash
 * @param {Function} opt.Readable 輸入stream之Readable, 須有toWeb、fromWeb、from
 * @param {Function} opt.pipeline 輸入stream/promises之pipeline
 * @param {Function} opt.spawn 輸入child_process之spawn(解壓用)
 * @param {Object} [opt.env={}] 輸入環境變數物件(讀W_BIN_CACHE、W_BIN_MIRROR、W_BIN_OFFLINE、SystemRoot)
 * @returns {Promise} 回傳Promise, resolve回傳物件{ [name]: 絕對路徑 }(另有不可列舉之leftovers: 刪不掉之暫存夾[{ name, fp, error }]), reject回傳帶code之Error
 * @example
 * //need test in nodejs
 *
 * //see fsEnsureBins
 *
 */
async function fsEnsureBinsCore(manifest, opt = {}) {

    //觀察回調(opt.onTrace), 未給時為null; 取於buildCtx之前使E_ARG亦通知settle; opt不可讀(getter拋錯、已撤銷之Proxy)時視為未給, 其錯誤仍由buildCtx於讀取opt時照舊回報
    let trace = null
    try {
        trace = getTrace(opt)
    }
    catch (err) {}

    try {
        let ctx = buildCtx(opt)
        ctx.trace = trace
        return await ensureMain(ctx, manifest, trace)
    }
    catch (err) {
        if (trace) {
            trace('settle', { ok: false, code: codeStr(err) })
        }
        throw err
    }
}


//ensureMain, fsEnsureBinsCore之主流程(成功時於回傳前通知settle, 失敗由呼叫端通知)
async function ensureMain(ctx, manifest, trace) {

    //清單, 物件或JSON檔路徑
    let raw = manifest
    let src = ''
    if (typeof manifest === 'string') {
        let fp = ctx.path.resolve(ctx.pkgRoot, manifest)
        src = ` ${fp}`
        try {
            raw = JSON.parse(String(ctx.fs.readFileSync(fp, 'utf8')).replace(/^\uFEFF/, ''))
        }
        catch (err) {
            throw mkErr('E_MANIFEST', `fsEnsureBins: can not read the manifest file "${fp}": ${errMsg(err)}`, { step: 'manifest', cause: err })
        }
    }
    let base = normManifest(raw, src)
    ctx.pkg = base.pkg
    ctx.cacheRoot = ctx.cacheDir !== '' ? ctx.cacheDir : ctx.envCache !== '' ? ctx.path.join(ctx.envCache, base.pkg) : ctx.path.join(ctx.pkgRoot, 'bin-cache')

    //主幹模式取清單
    let m = await resolveManifest(ctx, base)
    if (trace) {
        trace('manifest', { source: base.mode !== 'floating' ? 'base' : m === base ? 'baseline' : 'remote', files: m.entries.length })
    }

    //names
    let byName = new Map(m.entries.map((e) => {
        return [e.name, e]
    }))
    let sel = m.entries
    if (ctx.names !== null) {
        let unknown = ctx.names.filter((n) => {
            return !byName.has(n)
        })
        if (unknown.length > 0) {
            throw mkErr('E_ARG', `fsEnsureBins[${ctx.pkg}]: opt.names has names not in the manifest: ${unknown.join(', ')} (the manifest has ${[...byName.keys()].join(', ')})`, { step: 'argument' })
        }
        sel = ctx.names.map((n) => {
            return byName.get(n)
        })
    }

    //逐一取得; 離線缺檔者彙整後一併回報
    let pairs = []
    let missing = []
    for (let e of sel) {
        let j = ensureEntry(ctx, e)
        try {
            pairs.push([e.name, await j.pm])
        }
        catch (err) {
            if (isOwnErr(err) && err.code === 'E_OFFLINE_MISSING' && err.step === 'offline' && Array.isArray(err.missing) && err.pkg === undefined) {
                missing.push(...err.missing)
                continue
            }
            throw err
        }
        finally {
            ctx.leftovers.push(...j.left) //共用者共享同一次取得之leftovers
        }
    }
    if (missing.length > 0) {
        //離線缺檔: 不得留下本次建立之空資料夾(快取根、<sha256>夾), 先清掉其中仍為空者再回報
        let nTidy = tidyFresh(ctx)
        if (trace) {
            trace('tidy', { n: nTidy })
        }
        let err = offlineErr(ctx, missing)
        if (ctx.leftovers.length > 0) {
            err.leftovers = ctx.leftovers
        }
        throw err
    }
    let r = Object.fromEntries(pairs)
    if (!Object.prototype.hasOwnProperty.call(r, 'leftovers')) {
        Object.defineProperty(r, 'leftovers', { value: ctx.leftovers, enumerable: false }) //刪不掉之暫存夾[{ name, fp, error }], 不影響{ [name]: 路徑 }之形狀
    }
    if (trace) {
        trace('settle', { ok: true, code: null })
    }
    return r
}


export default fsEnsureBinsCore
