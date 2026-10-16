//fsHashFailRunner.mjs: R-FS-REJECT-01(fs系回傳Promise者: 拒絕值一律為字串、不同步拋出、失敗不偽成功、不懸置)之雜湊與同步族(fsGetFileBasicHash、fsGetFileXxHash、fsGetFileHash、fsGetFolderBasicHash、fsTreeFolderWithHash、fsGetFilesWithHashInFolder、fsSyncFolder及其Core)之子行程執行器
//  每個案例於獨立子行程執行(不污染mocha之worker), 預設掛unhandledRejection與uncaughtException記錄器, 受測Promise逾時(看門狗)回{ s: 'pending' }
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得); 夾具建於本檔往上一層之_tmp/fsHashFail-<案名>/, 用到才建(mkFx), 結束(finally)先以icacls解除本案設定之拒讀ACL再刪除該案資料夾, 不動_tmp根目錄
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught, cleanupError })輸出至stdout; out為案例回傳之物件, 其got為受測呼叫之結果{ s, t, v }(s: 'reject'|'resolve'|'pending'|'syncThrow'|'return', t: 值之typeof, v: 字串原樣、其餘經showValue), 其餘鍵為測試端組期望值所需之事實(路徑、同一錯誤以直接呼叫取得之String(err)等)
//用法: node test/tools/fsHashFailRunner.mjs <caseName> [exitMode]
//  exitMode=nohandler: 不掛記錄器, 案例完成後立即process.exit(0); 用於驗證監聽器內注入物拋錯時無處理器之行程仍以離開碼0結束(未成為未捕捉例外)
//測試端: import { itFsHashFail, itNoHandler, rejected, resolved, RULE } from './tools/fsHashFailRunner.mjs'(本檔被匯入時不執行案例, 只在作為主程式執行時執行)
/* eslint-disable no-throw-literal */ //本執行器刻意拋出非Error之值(null)作為注入物之受測輸入
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import { execFileSync } from 'child_process'
import { pathToFileURL, fileURLToPath } from 'url'
import xxhashWasm from 'xxhash-wasm'
import { safeStr, showValue, revoked } from './caseKit.mjs'
import { runChildCase } from './runChildCase.mjs'


let fpSelf = fileURLToPath(import.meta.url)
let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let fdTmp = fileURLToPath(new URL('../_tmp/', import.meta.url))


/**
 * 於獨立子行程執行本檔之一個案例並剖析其輸出
 *
 * @param {String} caseName 輸入案例名稱字串(本檔cases之鍵)
 * @param {Object} [opt={}] 輸入設定物件, 傳給runChildCase
 * @param {String} [opt.exitMode=''] 輸入結束模式字串, 為'nohandler'時不掛未捕捉例外記錄器(驗無處理器時之離開碼), 預設''
 * @param {Number} [opt.timeout=30000] 輸入子行程逾時毫秒數, 預設30000
 * @param {Boolean} [opt.allowNoResult=false] 輸入無結果行是否不視為錯誤布林值(nohandler模式下子行程崩潰時無結果行), 預設false
 * @returns {Object} 回傳{ out, stray, status, stderr }, out為案例回傳之物件(無結果行時為null), stray為未捕捉例外與未處理rejection之描述陣列(nohandler模式恆為[]), status為離開碼, stderr為子行程之stderr字串
 */
function runFsHashFail(caseName, opt = {}) {
    let rc = runChildCase(fpSelf, caseName, { timeout: 30000, ...opt })
    let r = rc.r

    //子行程崩潰(無結果行, 僅allowNoResult時)則其finally未執行, 由此刪除該案夾具資料夾(無處理器之案例不設拒讀ACL)
    if (r === null) {
        fs.rmSync(path.join(fdTmp, 'fsHashFail-' + caseName), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    }

    //夾具未能清除(含ACL未能解除)屬測試基礎設施問題, 直接擲出而不讓其殘留
    if (r !== null && r.cleanupError) {
        throw new Error(`${caseName}: 夾具未能清除: ${r.cleanupError}`)
    }

    //執行器自身出錯(夾具建立失敗等)非受測結果, 直接擲出可判讀之錯誤
    if (r !== null && r.out && r.out.runnerError) {
        throw new Error(`${caseName}: 執行器出錯: ${r.out.runnerError}`)
    }

    let stray = []
    if (r !== null) {
        for (let u of r.unhandled || []) {
            stray.push('unhandledRejection: ' + u)
        }
        for (let u of r.uncaught || []) {
            stray.push('uncaughtException: ' + u)
        }
    }

    return { out: r === null ? null : r.out, stray, status: rc.status, stderr: rc.stderr }
}


/**
 * 以字串reject之結果形(與案例回傳之got同形), 供測試端組期望值
 *
 * @param {String} v 輸入拒絕值字串
 * @returns {Object} 回傳{ s: 'reject', t: 'string', v }
 */
function rejected(v) {
    return { s: 'reject', t: 'string', v }
}


/**
 * 以字串resolve之結果形(與案例回傳之got同形), 供測試端組期望值
 *
 * @param {String} v 輸入解析值字串
 * @returns {Object} 回傳{ s: 'resolve', t: 'string', v }
 */
function resolved(v) {
    return { s: 'resolve', t: 'string', v }
}


//RULE, 各測試檔案例表之期望所對應之規則句(CLAUDE_rulebook.md), 同一規則句只寫於此
let RULE = {
    r1pre: 'R-FS-REJECT-01 規則1: 拒絕值一律為字串, 前置檢查為說明字串',
    r1err: 'R-FS-REJECT-01 規則1: 捕捉之錯誤值經_errToStr, Error得String(err)即名稱: 訊息(R-CODEC-ERR-01 規則3)',
    r1any: 'R-FS-REJECT-01 規則1: 注入物拋出之任意值(null、undefined、字串)經_errToStr轉字串(R-CODEC-ERR-01 規則3: null得\'null\')',
    r2: 'R-FS-REJECT-01 規則2: 前置檢查(含opt.fs經{ fs, ...opt }覆蓋後之lstatSync拋錯)在try內, 不得同步拋出、不得以非字串reject',
    r2tree: 'R-FS-REJECT-01 規則2: fsTreeFolderCore、fsGetFilesInFolderCore之同步拋錯經雜湊族傳上者依規則1轉字串',
    r2opt: 'R-FS-REJECT-01 規則2: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)同, 對外函數之{ fs, ...opt }展開與Core之get(opt, …)皆在try內, 不得同步拋出、不得以非字串reject',
    r3: 'R-FS-REJECT-01 規則3: 串流事件監聽器本體包try, 呼叫注入物拋錯即以規則1之字串reject, 不得懸置、不得以出錯後之雜湊resolve',
    r4a: 'R-FS-REJECT-01 規則4a: fsGetFileXxHash之chunkSize非正整數(0、負數、非數字)時改用預設值',
    r4aMax: 'R-FS-REJECT-01 規則4a(增訂, 外審 opus F21): chunkSize超過上限2^30時改用預設值(64*1024*1024), 不得懸置、不得以空內容之雜湊resolve',
    r4c: 'R-FS-REJECT-01 規則4c: fsSyncFolder之內部複製回傳error時即reject該錯誤之字串, 不得resolve true',
    r4cDel: 'R-FS-REJECT-01 規則4c(增訂, 外審 opus F13): 含刪除目標內多出之項目, 其結果物件帶error鍵即reject該錯誤之字串, 不得resolve true',
    stray: 'R-FS-REJECT-01 規則3、R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException',
    exit0: 'R-FS-REJECT-01 規則3、R-PM-SETTLE-01 規則2: 監聽器內拋錯不得成未捕捉例外(無處理器時行程以離開碼0結束且Promise以字串reject)',
}


/**
 * 依案例表定義mocha之it(於describe內呼叫): 每案於子行程執行, 斷言受測結果等於want所組之期望, 且無未捕捉例外與未處理rejection
 * 案例win為true者為Windows專屬之真實觸發(icacls拒讀), 他平台skip
 *
 * @param {Array} cases 輸入案例陣列, 每項為{ id, when, want, rule, win }, id為本檔cases之鍵(同審計輸入空間表之列號), when為觸發之描述, want為(out) => 期望之got, rule為期望所對應之規則句(RULE之值)
 */
function itFsHashFail(cases) {
    for (let c of cases) {
        let f = c.win && process.platform !== 'win32' ? it.skip : it
        f(`${c.id} ${c.when} [${c.rule}]`, function() {
            let r = runFsHashFail(c.id)
            //c.rule: settle型態(reject/resolve/syncThrow/pending)、值之型別(typeof)與內容須等於依該規則句組出之期望
            assert.strict.deepStrictEqual(r.out.got, c.want(r.out))
            //RULE.stray: 不得產生unhandledRejection或uncaughtException
            assert.strict.deepStrictEqual(r.stray, [])
        })
    }
}


/**
 * 依案例id定義「無處理器」之mocha之it(於describe內呼叫): 子行程不掛未捕捉例外記錄器, 斷言離開碼0且Promise以字串reject(RULE.exit0)
 *
 * @param {Array} ids 輸入案例id陣列(本檔cases之鍵)
 */
function itNoHandler(ids) {
    for (let id of ids) {
        it(`${id} 無處理器時 [${RULE.exit0}]`, function() {
            let r = runFsHashFail(id, { exitMode: 'nohandler', allowNoResult: true })
            //RULE.exit0: 監聽器內拋錯不得成未捕捉例外, 無處理器時行程以離開碼0結束(未捕捉例外時離開碼1且無結果行)
            assert.strict.deepStrictEqual({ status: r.status, hasResult: r.out !== null }, { status: 0, hasResult: true }, r.stderr.slice(0, 300))
            //RULE.exit0: 且Promise以字串reject(非懸置、非resolve)
            assert.strict.deepStrictEqual({ s: r.out.got.s, t: r.out.got.t }, { s: 'reject', t: 'string' })
        })
    }
}


/**
 * 依函數名稱定義「opt不可讀」之mocha之it(於describe內呼叫): 每個函數一案(本檔cases之'OU-<函數>'), 子行程內以getter拋錯與已撤銷之Proxy兩形之opt呼叫, 斷言皆不同步拋出而以字串reject, 且無未捕捉例外與未處理rejection(RULE.r2opt)
 *
 * @param {Array} names 輸入函數名稱陣列(對外與Core, 如['fsGetFileBasicHash', 'fsGetFileBasicHashCore'])
 */
function itOptUnreadable(names) {
    for (let nm of names) {
        it(`OU-${nm} opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy) [${RULE.r2opt}]`, function() {
            let r = runFsHashFail('OU-' + nm)
            //RULE.r2opt、RULE.r1err: getter拋Error('getter boom')者不同步拋出而以字串reject, 其值為String(err)
            assert.strict.deepStrictEqual(r.out.got.getter, rejected('Error: getter boom'))
            //RULE.r2opt、RULE.r1err: 已撤銷之Proxy(展開或讀取即拋TypeError)者不同步拋出而以字串reject, 其值為String(err)即'TypeError: 訊息'(訊息全文為引擎之陷阱描述, 不屬規格)
            let rv = r.out.got.revoked
            assert.strict.deepStrictEqual({ s: rv.s, t: rv.t, typeErrorStr: /^TypeError: /.test(String(rv.v)) }, { s: 'reject', t: 'string', typeErrorStr: true })
            //RULE.stray: 不得產生unhandledRejection或uncaughtException
            assert.strict.deepStrictEqual(r.stray, [])
        })
    }
}


/**
 * 作為主程式時執行argv所指之一個案例並輸出結果行
 *
 * @returns {Promise} 回傳Promise, 輸出結果行後以process.exit(0)結束
 */
async function main() {
    let [caseName, exitMode] = process.argv.slice(2)
    let fx = path.join(fdTmp, 'fsHashFail-' + caseName) //本案夾具資料夾, 需要夾具之案例以mkFx()建立
    let user = process.env.USERNAME || process.env.USER || ''
    let denied = [] //本案以icacls設定拒讀之路徑, finally逐一解除

    let unhandled = []
    let uncaught = []
    if (exitMode !== 'nohandler') {
        process.on('unhandledRejection', (r) => {
            unhandled.push(safeStr(r))
        })
        process.on('uncaughtException', (e) => {
            uncaught.push(safeStr(e))
        })
    }

    async function imp(name) {
        return (await import(pathToFileURL(path.join(implDir, name + '.mjs')).href)).default
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    //shown, 結果值之描述: 字串原樣, 其餘經showValue(帶'<型別>'前綴, 可分辨以Error物件reject與以其訊息字串reject)
    function shown(v) {
        return typeof v === 'string' ? v : showValue(v)
    }

    //settle, 等待p之結果, 逾時(看門狗)回{ s: 'pending' }; p非thenable時回{ s: 'return' }
    //  與pmSettleRunner、execFailRunner之settle契約不同而分立: 本檔須分辨同步回傳值與Promise, 且結果須可JSON化並保留拒絕值之型別
    function settle(p, ms = 3000) {
        let isThenable = p !== null && (typeof p === 'object' || typeof p === 'function') && typeof p.then === 'function'
        if (!isThenable) {
            return Promise.resolve({ s: 'return', t: typeof p, v: shown(p) })
        }
        return new Promise((resolve) => {
            let t = setTimeout(() => resolve({ s: 'pending' }), ms)
            p.then((v) => {
                clearTimeout(t)
                resolve({ s: 'resolve', t: typeof v, v: shown(v) })
            }, (e) => {
                clearTimeout(t)
                resolve({ s: 'reject', t: typeof e, v: shown(e) })
            })
        })
    }

    //run, 同步呼叫fn並記錄是否同步拋出, 未拋出則settle其回傳值
    function run(fn) {
        let p
        try {
            p = fn()
        }
        catch (e) {
            return Promise.resolve({ s: 'syncThrow', t: typeof e, v: shown(e) })
        }
        return settle(p)
    }

    //thrower, 回傳「呼叫即拋出v」之函數(以變數拋出null等非Error之值)
    function thrower(v) {
        return () => {
            throw v
        }
    }

    //errOf, 直接執行fn取得其拋出之錯誤之String(err), 作為「同一錯誤經_errToStr應得之字串」之對照(未拋錯為'<no error>')
    function errOf(fn) {
        try {
            fn()
        }
        catch (e) {
            return String(e)
        }
        return '<no error>'
    }

    //mkFx, 建立本案夾具資料夾(先清除殘留)並回傳其路徑
    function mkFx() {
        fs.mkdirSync(fdTmp, { recursive: true })
        fs.rmSync(fx, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
        fs.mkdirSync(fx, { recursive: true })
        return fx
    }

    //mkFile, 寫出夾具檔(上層資料夾不存在則先建立)並回傳其路徑
    function mkFile(fp, content = 'abc') {
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, content)
        return fp
    }

    //mkDangling, 於資料夾d內建立懸空junction(建立指向暫時資料夾之junction後刪除該資料夾)並回傳其路徑
    function mkDangling(d, name) {
        let t = path.join(d, '_jt_' + name)
        fs.mkdirSync(t, { recursive: true })
        let l = path.join(d, name)
        fs.symlinkSync(t, l, 'junction')
        fs.rmSync(t, { recursive: true, force: true })
        return l
    }

    //denyRead, 以icacls對本使用者設定拒讀(檔案: stat成功而開檔EPERM; 資料夾: readdirSync EPERM), 僅win32
    function denyRead(p) {
        execFileSync('icacls', [p, '/deny', `${user}:(RD)`], { stdio: 'pipe' })
        denied.push(p)
    }

    //fakeStream, 由案例控制之事件串流(EventEmitter), 支援read/pipe/destroy之最小介面
    function fakeStream() {
        let s = new EventEmitter()
        s.read = () => null
        s.pipe = (d) => d
        s.destroy = () => {}
        return s
    }

    //emitLater, 延後ms毫秒派發事件(使受測函數先掛上監聽器)
    function emitLater(s, ev, v, ms) {
        setTimeout(() => s.emit(ev, v), ms)
    }

    //stubFile、stubFolder, 使fsIsFileCore或fsIsFolderCore之前置檢查視為檔案或資料夾之fs替身, 其餘鍵由ext覆蓋
    function stubFile(ext = {}) {
        return {
            ...fs,
            statSync: () => ({ isDirectory: () => false }),
            lstatSync: () => ({ isDirectory: () => false, isSymbolicLink: () => false, isFile: () => true }),
            ...ext,
        }
    }
    function stubFolder(ext = {}) {
        return {
            ...fs,
            statSync: () => ({ isDirectory: () => true }),
            lstatSync: () => ({ isDirectory: () => true, isSymbolicLink: () => false, isFile: () => false }),
            ...ext,
        }
    }

    //fsLstatThrows, 對外函數之opt.fs(經{ fs, ...opt }覆蓋內建fs): statSync正常而lstatSync拋出v
    function fsLstatThrows(v) {
        return { ...fs, statSync: () => ({}), lstatSync: thrower(v) }
    }

    //mkHashStub, 注入之crypto: createHash回傳以upd、dig為update、digest之hash物件
    function mkHashStub(upd, dig) {
        return { createHash: () => ({ update: upd, digest: dig }) }
    }

    //errCrypto, 真實crypto對不支援之type拋出之錯誤
    let errCrypto = () => errOf(() => crypto.createHash('nope'))

    //errOpen, 真實fs開檔之錯誤(與createReadStream之'error'同一錯誤)
    let errOpen = (fp) => errOf(() => fs.closeSync(fs.openSync(fp, 'r')))

    //errReaddir, 真實fs列舉資料夾之錯誤(與fsTreeFolderCore之readdirSync同一呼叫)
    let errReaddir = (fd) => errOf(() => fs.readdirSync(fd))

    //copyErr, 對外fsCopyFolder(async)對同一來源與目標回傳之結果物件之error之String(無error鍵為'<no error>'), 作為fsSyncFolder內部複製失敗應得之字串
    let copyErr = async (src, tar) => {
        let fsCopyFolder = await imp('fsCopyFolder')
        let rc = await fsCopyFolder(src, tar, { useSync: false })
        return Object.prototype.hasOwnProperty.call(rc, 'error') ? String(rc.error) : '<no error>'
    }

    let cases = {

        //======== fsGetFileBasicHash(Core) ========

        BH01: async () => {
            let f = await imp('fsGetFileBasicHash')
            let fp = path.join(mkFx(), 'nope.txt')
            return { fp, got: await run(() => f(fp)) }
        },

        BH02: async () => {
            let f = await imp('fsGetFileBasicHash')
            let fp = mkFx()
            return { fp, got: await run(() => f(fp)) }
        },

        BH03: async () => {
            let f = await imp('fsGetFileBasicHash')
            let fp = path.join(mkFile(path.join(mkFx(), 'fileP.txt')), 'x.txt')
            return { fp, got: await run(() => f(fp)) }
        },

        BH04: async () => {
            let f = await imp('fsGetFileBasicHash')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { errStr: errCrypto(), got: await run(() => f(fp, { type: 'nope' })) }
        },

        BH05: async () => {
            let f = await imp('fsGetFileBasicHash')
            let fp = mkFile(path.join(mkFx(), 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fp)) }
        },

        BH06: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let fpNope = path.join(mkFx(), 'nope2.txt')
            return { errStr: errOpen(fpNope), got: await run(() => f('x', { fs: stubFile({ createReadStream: () => fs.createReadStream(fpNope) }), crypto })) }
        },

        BH07: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let s = fakeStream()
            emitLater(s, 'error', null, 20)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }), crypto })) }
        },

        BH08: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { got: await run(() => f(fp, { fs, crypto: { createHash: thrower(null) } })) }
        },

        BH09: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            return { got: await run(() => f('x', { fs: fsLstatThrows(new Error('lstat boom')), crypto })) }
        },

        BH10: async () => {
            let f = await imp('fsGetFileBasicHash')
            return { got: await run(() => f('x', { fs: fsLstatThrows(null) })) }
        },

        BH11: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { got: await run(() => f(fp, { fs, crypto: mkHashStub(thrower(new Error('update boom')), () => 'h') })) }
        },

        BH12: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { got: await run(() => f(fp, { fs, crypto: mkHashStub(thrower(null), () => 'h') })) }
        },

        BH13: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { got: await run(() => f(fp, { fs, crypto: mkHashStub(() => {}, thrower(new Error('digest boom'))) })) }
        },

        BH14: async () => {
            let f = await imp('fsGetFileBasicHashCore')
            let s = fakeStream()
            s.read = thrower(new Error('read boom'))
            emitLater(s, 'readable', undefined, 20)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }), crypto })) }
        },

        BH15: async () => {
            let f = await imp('fsGetFileBasicHash')
            return { got: await run(() => f(123)) }
        },

        //======== fsGetFileXxHash(Core) ========

        XH01: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = path.join(mkFx(), 'nope.txt')
            return { got: await run(() => f(fp)) }
        },

        XH02: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFx()
            return { got: await run(() => f(fp)) }
        },

        XH03: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFile(path.join(mkFx(), 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fp)) }
        },

        XH04: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let fpNope = path.join(mkFx(), 'nope2.txt')
            return { errStr: errOpen(fpNope), got: await run(() => f('x', { fs: stubFile({ createReadStream: () => fs.createReadStream(fpNope) }) })) }
        },

        //XH05~XH07、XH15: 注入之串流以null、undefined、字串、Error出錯
        XH05: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let s = fakeStream()
            emitLater(s, 'error', null, 50)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }) })) }
        },

        XH06: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let s = fakeStream()
            emitLater(s, 'error', undefined, 50)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }) })) }
        },

        XH07: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let s = fakeStream()
            emitLater(s, 'error', 'str', 50)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }) })) }
        },

        XH15: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let s = fakeStream()
            emitLater(s, 'error', new Error('boom'), 50)
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }) })) }
        },

        XH08: async () => {
            let f = await imp('fsGetFileXxHashCore')
            return { got: await run(() => f('x', { fs: stubFile({ createReadStream: thrower(new Error('boom')) }) })) }
        },

        XH09: async () => {
            let f = await imp('fsGetFileXxHashCore')
            return { got: await run(() => f('x', { fs: fsLstatThrows(new Error('lstat boom')) })) }
        },

        XH10: async () => {
            let f = await imp('fsGetFileXxHash')
            return { got: await run(() => f('x', { fs: fsLstatThrows(null) })) }
        },

        //XH11: 注入之串流之data為null, 'data'監聽器內hasher.update拋錯; errStr為同一呼叫直接執行之錯誤
        XH11: async () => {
            let f = await imp('fsGetFileXxHashCore')
            let { create64 } = await xxhashWasm()
            let errStr = errOf(() => create64().update(null))
            let s = fakeStream()
            emitLater(s, 'data', null, 300)
            return { errStr, got: await run(() => f('x', { fs: stubFile({ createReadStream: () => s }) })) }
        },

        //XH13、XH14、XH16、XH17: chunkSize為-1、0、0.5、'abc'(非正整數)時與預設chunkSize之雜湊比較; hashEmpty為空內容之雜湊(檔案內容非空, 預設之雜湊不應等於此)
        XH13: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { hashDefault: await f(fp), got: await run(() => f(fp, { chunkSize: -1 })) }
        },

        XH14: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            let { create64 } = await xxhashWasm()
            let hashEmpty = create64().digest().toString(16).padStart(16, '0')
            return { hashEmpty, hashDefault: await f(fp), got: await run(() => f(fp, { chunkSize: 0 })) }
        },

        XH16: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { hashDefault: await f(fp), got: await run(() => f(fp, { chunkSize: 0.5 })) }
        },

        XH17: async () => {
            let f = await imp('fsGetFileXxHash')
            let fp = mkFile(path.join(mkFx(), 'file.txt'))
            return { hashDefault: await f(fp), got: await run(() => f(fp, { chunkSize: 'abc' })) }
        },

        //XH18~XH20: chunkSize為2^31(原懸置)、2^32(原不讀資料即end而得空內容之雜湊)、2^53(原RangeError); 經opt.fs攔得createReadStream之highWaterMark(hwm), 與預設chunkSize之雜湊比較(外審 opus F21)
        XH18: () => xxBigCase('fsGetFileXxHash', {}, 2 ** 31),
        XH19: () => xxBigCase('fsGetFileXxHash', {}, 2 ** 32),
        XH20: () => xxBigCase('fsGetFileXxHash', {}, 2 ** 53),

        //======== fsGetFileHash(Core) ========

        FH01: async () => {
            let f = await imp('fsGetFileHash')
            let fp = path.join(mkFx(), 'nope.txt')
            return { fp, got: await run(() => f(fp)) }
        },

        FH02: async () => {
            let f = await imp('fsGetFileHash')
            let fp = path.join(mkFx(), 'nope.txt')
            return { fp, got: await run(() => f(fp, { type: 'xxhash64' })) }
        },

        FH03: async () => {
            let f = await imp('fsGetFileHash')
            let fp = mkFile(path.join(mkFx(), 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fp, { type: 'xxhash64' })) }
        },

        FH04: async () => {
            let f = await imp('fsGetFileHash')
            let fp = mkFile(path.join(mkFx(), 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fp)) }
        },

        FH05: async () => {
            let f = await imp('fsGetFileHashCore')
            return { got: await run(() => f('x', { fs: fsLstatThrows(new Error('lstat boom')), crypto })) }
        },

        //FH06: type=xxhash64分支之chunkSize為2^31(同XH18, 經fsGetFileHashCore傳入fsGetFileXxHashCore)
        FH06: () => xxBigCase('fsGetFileHash', { type: 'xxhash64' }, 2 ** 31),

        //======== fsGetFolderBasicHash(Core) ========

        GB01: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = path.join(mkFx(), 'nopeDir')
            return { fd, got: await run(() => f(fd)) }
        },

        GB02: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = mkFile(path.join(mkFx(), 'file.txt'))
            return { fd, got: await run(() => f(fd)) }
        },

        GB03: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            let fpDangling = mkDangling(fd, 'dj1')
            return { fpDangling, got: await run(() => f(fd)) }
        },

        GB04: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            return { errStr: errCrypto(), got: await run(() => f(fd, { type: 'nope' })) }
        },

        GB05: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = mkFx()
            let sub = path.join(fd, 'sub')
            mkFile(path.join(sub, 'a.txt'))
            denyRead(sub)
            return { errStr: errReaddir(sub), got: await run(() => f(fd)) }
        },

        GB06: async () => {
            let f = await imp('fsGetFolderBasicHashCore')
            return { got: await run(() => f('x', { path, fs: stubFolder({ readdirSync: thrower(null) }), crypto })) }
        },

        GB07: async () => {
            let f = await imp('fsGetFolderBasicHash')
            let fd = mkFx()
            let fp = mkFile(path.join(fd, 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fd)) }
        },

        //GB08(補列): 對外函數+opt.fs之lstatSync拋null
        GB08: async () => {
            let f = await imp('fsGetFolderBasicHash')
            return { got: await run(() => f('x', { fs: fsLstatThrows(null) })) }
        },

        //======== fsTreeFolderWithHash(Core) ========

        TW01: async () => {
            let f = await imp('fsTreeFolderWithHash')
            let fd = path.join(mkFx(), 'nopeDir')
            return { fd, got: await run(() => f(fd)) }
        },

        TW02: async () => {
            let f = await imp('fsTreeFolderWithHash')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            let fpDangling = mkDangling(fd, 'dj1')
            return { fpDangling, got: await run(() => f(fd)) }
        },

        TW03: async () => {
            let f = await imp('fsTreeFolderWithHash')
            let fd = mkFx()
            let sub = path.join(fd, 'sub')
            mkFile(path.join(sub, 'a.txt'))
            let fpDangling = mkDangling(sub, 'dj2')
            return { fpDangling, got: await run(() => f(fd, 1, { forFile: false, forFolder: true })) }
        },

        TW04: async () => {
            let f = await imp('fsTreeFolderWithHash')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            return { errStr: errCrypto(), got: await run(() => f(fd, 1, { type: 'nope' })) }
        },

        TW05: async () => {
            let f = await imp('fsTreeFolderWithHash')
            let fd = mkFx()
            let sub = path.join(fd, 'sub')
            fs.mkdirSync(sub)
            denyRead(sub)
            return { errStr: errReaddir(sub), got: await run(() => f(fd, null)) }
        },

        //TW06(補列): 對外函數+opt.fs之lstatSync拋null
        TW06: async () => {
            let f = await imp('fsTreeFolderWithHash')
            return { got: await run(() => f('x', 1, { fs: fsLstatThrows(null) })) }
        },

        //======== fsGetFilesWithHashInFolder(Core) ========

        FW01: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = path.join(mkFx(), 'nopeDir')
            return { fd, got: await run(() => f(fd)) }
        },

        FW02: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            let fpDangling = mkDangling(fd, 'dj1')
            return { fpDangling, got: await run(() => f(fd)) }
        },

        FW03: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = mkFx()
            mkFile(path.join(fd, 'a.txt'))
            return { errStr: errCrypto(), got: await run(() => f(fd, 1, { type: 'nope' })) }
        },

        FW04: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = mkFx()
            let fp = mkFile(path.join(fd, 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fd, 1, { type: 'xxhash64' })) }
        },

        FW05: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = mkFx()
            let fp = mkFile(path.join(fd, 'deny.txt'))
            denyRead(fp)
            return { errStr: errOpen(fp), got: await run(() => f(fd, 1)) }
        },

        FW06: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            let fd = mkFx()
            let sub = path.join(fd, 'sub')
            fs.mkdirSync(sub)
            denyRead(sub)
            return { errStr: errReaddir(sub), got: await run(() => f(fd, null)) }
        },

        //FW07(補列): 對外函數+opt.fs之lstatSync拋null
        FW07: async () => {
            let f = await imp('fsGetFilesWithHashInFolder')
            return { got: await run(() => f('x', 1, { fs: fsLstatThrows(null) })) }
        },

        //======== fsSyncFolder(Core) ========

        SY01: async () => {
            let f = await imp('fsSyncFolder')
            let fd = mkFx()
            let fdSrc = path.join(fd, 'nopeDir')
            return { fdSrc, got: await run(() => f(fdSrc, path.join(fd, 'tar'))) }
        },

        //SY02: 目標為既有檔案(來源含檔案), errStr為對外fsCopyFolder對同一來源與目標回傳之error之字串
        SY02: async () => {
            let f = await imp('fsSyncFolder')
            let fd = mkFx()
            let src = path.join(fd, 'src')
            mkFile(path.join(src, 'a.txt'))
            let tar = mkFile(path.join(fd, 'tar.txt'), 'T')
            let got = await run(() => f(src, tar))
            return { errStr: await copyErr(src, tar), got }
        },

        SY03: async () => {
            let f = await imp('fsSyncFolder')
            let fd = mkFx()
            let src = path.join(fd, 'src')
            mkFile(path.join(src, 'a.txt'))
            let fpDangling = mkDangling(src, 'dj1')
            let tar = path.join(fd, 'tar')
            fs.mkdirSync(tar)
            return { fpDangling, got: await run(() => f(src, tar)) }
        },

        //SY04: 目標之上層為檔案(ENOTDIR), errStr同SY02
        SY04: async () => {
            let f = await imp('fsSyncFolder')
            let fd = mkFx()
            let src = path.join(fd, 'src')
            mkFile(path.join(src, 'a.txt'))
            let tar = path.join(mkFile(path.join(fd, 'fileP.txt')), 'sub')
            let got = await run(() => f(src, tar))
            return { errStr: await copyErr(src, tar), got }
        },

        //SY05: 目標存在, 來源新增之檔案複製時createWriteStream拋Error; 已開啟之讀取流於結束前銷毀(使夾具可刪除)
        SY05: async () => {
            let f = await imp('fsSyncFolderCore')
            let fd = mkFx()
            let src = path.join(fd, 'src')
            mkFile(path.join(src, 'new.txt'), 'N')
            let tar = path.join(fd, 'tar')
            fs.mkdirSync(tar)
            let rss = []
            let fsInj = {
                ...fs,
                createReadStream: (...a) => {
                    let s = fs.createReadStream(...a)
                    rss.push(s)
                    return s
                },
                createWriteStream: thrower(new Error('ws boom')),
            }
            let got = await run(() => f(src, tar, { path, fs: fsInj, crypto }))
            for (let s of rss) {
                s.destroy()
            }
            await sleep(100)
            return { got }
        },

        //SY06(補列): 對外函數+opt.fs之lstatSync拋null
        SY06: async () => {
            let f = await imp('fsSyncFolder')
            return { got: await run(() => f('x', 'y', { fs: fsLstatThrows(null) })) }
        },

        //SY07: 目標存在且多出檔案old.txt, Core注入之unlinkSync拋code為EBUSY之Error('busy')(刪除目標內多出之檔案失敗; 外審 opus F13); left為old.txt是否仍在
        SY07: async () => {
            let f = await imp('fsSyncFolderCore')
            let { src, tar } = mkSyncFx()
            mkFile(path.join(tar, 'old.txt'), 'O')
            let fsInj = { ...fs, unlinkSync: thrower(Object.assign(new Error('busy'), { code: 'EBUSY' })) }
            let got = await run(() => f(src, tar, { path, fs: fsInj, crypto }))
            return { got, left: fs.existsSync(path.join(tar, 'old.txt')) }
        },

        //SY08: 目標存在且多出資料夾oldDir(內含x.txt), Core注入之rmSync拋code為EPERM之Error('perm')(刪除目標內多出之資料夾失敗); left為oldDir是否仍在
        SY08: async () => {
            let f = await imp('fsSyncFolderCore')
            let { src, tar } = mkSyncFx()
            mkFile(path.join(tar, 'oldDir', 'x.txt'), 'X')
            let fsInj = { ...fs, rmSync: thrower(Object.assign(new Error('perm'), { code: 'EPERM' })) }
            let got = await run(() => f(src, tar, { path, fs: fsInj, crypto }))
            return { got, left: fs.existsSync(path.join(tar, 'oldDir')) }
        },

    }

    //mkSyncFx, fsSyncFolder之夾具: 來源與目標皆含相同之a.txt(目標存在, 只差多出之項目)
    function mkSyncFx() {
        let fd = mkFx()
        let src = path.join(fd, 'src')
        let tar = path.join(fd, 'tar')
        mkFile(path.join(src, 'a.txt'), 'A')
        mkFile(path.join(tar, 'a.txt'), 'A')
        return { src, tar }
    }

    //xxBigCase, 以name(fsGetFileXxHash或fsGetFileHash)與基本opt(base)計算7位元組夾具檔之雜湊: hashDefault為預設chunkSize之結果, got為chunkSize=v之結果, hwm為got之呼叫中createReadStream所收之highWaterMark(經opt.fs攔得)
    async function xxBigCase(name, base, v) {
        let f = await imp(name)
        let fp = mkFile(path.join(mkFx(), 'file.txt'), 'abcdefg')
        let hashDefault = await f(fp, base)
        let hwm = []
        let rss = []
        let fsCap = {
            ...fs,
            createReadStream: (p, o) => {
                hwm.push(o ? o.highWaterMark : undefined)
                let s = fs.createReadStream(p, o)
                rss.push(s)
                return s
            },
        }
        let got = await run(() => f(fp, { ...base, chunkSize: v, fs: fsCap }))
        //懸置者(修前2^31)之讀取流仍持有檔案, 先銷毀使夾具可刪除
        for (let s of rss) {
            s.destroy()
        }
        await sleep(50)
        return { hashDefault, hwm, got }
    }

    //======== OU-<函數>: opt本身或其屬性不可讀(R-FS-REJECT-01 規則2, 外審 opus F02) ========
    //  兩形: getter拋Error('getter boom')之opt、已撤銷之Proxy; 路徑一律為本案夾具資料夾內不存在之路徑(不建夾具, 不以repo內既有檔為標的)
    let ouArgs = {
        fsGetFileBasicHash: () => [path.join(fx, 'nope.txt')],
        fsGetFileXxHash: () => [path.join(fx, 'nope.txt')],
        fsGetFileHash: () => [path.join(fx, 'nope.txt')],
        fsGetFolderBasicHash: () => [path.join(fx, 'nopeDir')],
        fsTreeFolderWithHash: () => [path.join(fx, 'nopeDir'), 1],
        fsGetFilesWithHashInFolder: () => [path.join(fx, 'nopeDir'), 1],
        fsSyncFolder: () => [path.join(fx, 'nopeSrc'), path.join(fx, 'nopeTar')],
    }
    for (let [name, args] of Object.entries(ouArgs)) {
        for (let nm of [name, name + 'Core']) {
            cases['OU-' + nm] = async () => {
                let f = await imp(nm)
                let getter = await run(() => f(...args(), Object.defineProperty({}, 'fs', { enumerable: true, get: thrower(new Error('getter boom')) })))
                let rv = await run(() => f(...args(), revoked()))
                return { got: { getter, revoked: rv } }
            }
        }
    }

    //看門狗: 案例本身未於時限內完成(夾具或受測呼叫卡住)時輸出結果行並結束
    let wd = setTimeout(() => {
        console.log('@@R@@' + JSON.stringify({ out: { runnerError: 'runner watchdog' }, unhandled, uncaught, cleanupError: null }))
        process.exit(0)
    }, 20000)

    let out
    let cleanupError = null
    try {
        if (!Object.prototype.hasOwnProperty.call(cases, caseName)) {
            throw new Error('unknown case: ' + caseName)
        }
        out = await cases[caseName]()
    }
    catch (e) {
        out = { runnerError: safeStr(e) }
    }
    finally {
        //先解除本案設定之拒讀ACL, 再刪除本案夾具資料夾(不動_tmp根目錄); 失敗不吞掉, 記入結果由runFsHashFail擲出
        let errs = []
        for (let p of denied) {
            try {
                execFileSync('icacls', [p, '/remove:d', user], { stdio: 'pipe' })
            }
            catch (e) {
                errs.push('icacls ' + p + ': ' + safeStr(e))
            }
        }
        try {
            fs.rmSync(fx, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
            if (fs.existsSync(fx)) {
                errs.push('fx still exists: ' + fx)
            }
        }
        catch (e) {
            errs.push('rm ' + fx + ': ' + safeStr(e))
        }
        if (errs.length > 0) {
            cleanupError = errs.join('; ')
        }
    }
    clearTimeout(wd)
    if (exitMode === 'nohandler') {
        await sleep(100) //延後發生之未捕捉例外須於結束前發生(使行程以離開碼1結束而被測得)
        console.log('@@R@@' + JSON.stringify({ out, cleanupError }))
        process.exit(0)
    }
    await sleep(300) //收集延後發生之未捕捉例外與未處理rejection
    console.log('@@R@@' + JSON.stringify({ out, unhandled, uncaught, cleanupError }))
    process.exit(0)
}


//僅於作為主程式執行時執行案例(被測試檔匯入時不執行)
let isMain = !!process.argv[1] && path.resolve(process.argv[1]) === fpSelf
if (isMain) {
    await main()
}


export { runFsHashFail, rejected, resolved, RULE, itFsHashFail, itNoHandler, itOptUnreadable }
