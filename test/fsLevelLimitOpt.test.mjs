/* eslint-disable no-new-wrappers */ //本檔刻意以包裝物件(new Number)作為非物件之opt與無效之opt.levelLimit
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fsTreeFolder from '../src/fsTreeFolder.mjs'
import fsTreeFolderCore from '../src/fsTreeFolderCore.mjs'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'
import fsTreeFolderWithHashCore from '../src/fsTreeFolderWithHashCore.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'
import fsGetFilesInFolderCore from '../src/fsGetFilesInFolderCore.mjs'
import fsGetFoldersInFolder from '../src/fsGetFoldersInFolder.mjs'
import fsGetFoldersInFolderCore from '../src/fsGetFoldersInFolderCore.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import fsGetFilesWithHashInFolderCore from '../src/fsGetFilesWithHashInFolderCore.mjs'
import parseNumOpt from '../src/_numOpt.mjs'


//R-LEVEL-LIMIT-02: fs列舉家族10函數之第2參數由levelLimit(位置參數, 預設1層)改為opt(使用者2026-11-26裁定; dspec〈輸入參數之檢測機制〉K3之例外〈原位置參數改為opt之遷移期〉, 第667項)
//需求(斷言註解以此編號對應):
//  R1 簽章為(fd, opt = {}); Core之注入相依(fs、path、crypto)與opt.levelLimit同在一個opt
//  R2 opt.levelLimit為有效正整數(iseint之use:'count', 1～4294967295, 可為數字字串)才限定層數
//  R3 未給opt、opt為{}／undefined／null、或opt.levelLimit未給或無效(含0、負數、小數、NaN、Infinity、超過上限、'0x10'、包裝物件、null、假值)一律窮舉全部層級
//  R4 遷移期: 第2參數給了而非物件(舊寫法之數字等)即報錯'invalid opt: must be an object'(不帶輸入值), 依家族通道(同步回陣列者同步拋Error、回傳Promise者reject說明字串), fd無效者先報fd
//  R4d 第3個引數有給(非undefined)即報錯'invalid arguments: must be fd and opt only'(舊3參數形之第2參數為null、undefined時, 第3參數之舊opt不得被靜默忽略); 檢測順序: fd無效 → 第2參數非物件 → 第3個引數(R4e)
//  R8 對外函數只讀必要之鍵: opt.levelLimit(屬性讀取, 含原型上之存取器)讀一次, debug、funLog於levelLimit非預期時才讀(V11), 使用者自帶之內部鍵optDbg不採用
//  R6 Core注入之fs仍被使用; 對外之同步3函數固定用Node內建fs(opt.fs不採用)
//  R7 opt.debug為true時, opt.levelLimit無效則警告一次(固定詞彙, 不含輸入值), 有效時不警告
describe(`fs列舉家族之opt.levelLimit與遷移期檢查(R-LEVEL-LIMIT-02)`, function() {

    let fdRoot = path.resolve('./test/_tmp/fsLevelLimitOpt')
    let fd = path.join(fdRoot, 't')

    //夾具: 各名稱逐層相異, 看名稱即知其層級
    //  層1: f1.txt、a/、e/; 層2: a/f2.txt、e/f5.txt、a/b/; 層3: a/b/f3.txt、a/b/c/; 層4: a/b/c/f4.txt
    let items = [
        { name: 'f1.txt', level: 1, isFolder: false },
        { name: 'a', level: 1, isFolder: true },
        { name: 'e', level: 1, isFolder: true },
        { name: 'f2.txt', level: 2, isFolder: false },
        { name: 'f5.txt', level: 2, isFolder: false },
        { name: 'b', level: 2, isFolder: true },
        { name: 'f3.txt', level: 3, isFolder: false },
        { name: 'c', level: 3, isFolder: true },
        { name: 'f4.txt', level: 4, isFolder: false },
    ]

    before(function() {
        fs.rmSync(fdRoot, { recursive: true, force: true })
        fs.mkdirSync(path.join(fd, 'a', 'b', 'c'), { recursive: true })
        fs.mkdirSync(path.join(fd, 'e'), { recursive: true })
        fs.writeFileSync(path.join(fd, 'f1.txt'), 'f1')
        fs.writeFileSync(path.join(fd, 'a', 'f2.txt'), 'f2')
        fs.writeFileSync(path.join(fd, 'e', 'f5.txt'), 'f5')
        fs.writeFileSync(path.join(fd, 'a', 'b', 'f3.txt'), 'f3')
        fs.writeFileSync(path.join(fd, 'a', 'b', 'c', 'f4.txt'), 'f4')
    })

    after(function() {
        fs.rmSync(fdRoot, { recursive: true, force: true })
    })

    let real = { fs, path, crypto }

    //funs: name、kind(thr: 同步回陣列且同步拋Error; rej: 回傳Promise而reject說明字串)、core(是否須注入相依)、pick(all/file/folder)
    let defs = [
        ['fsTreeFolder', fsTreeFolder, 'thr', false, 'all'],
        ['fsTreeFolderCore', fsTreeFolderCore, 'thr', true, 'all'],
        ['fsGetFilesInFolder', fsGetFilesInFolder, 'thr', false, 'file'],
        ['fsGetFilesInFolderCore', fsGetFilesInFolderCore, 'thr', true, 'file'],
        ['fsGetFoldersInFolder', fsGetFoldersInFolder, 'thr', false, 'folder'],
        ['fsGetFoldersInFolderCore', fsGetFoldersInFolderCore, 'thr', true, 'folder'],
        ['fsTreeFolderWithHash', fsTreeFolderWithHash, 'rej', false, 'all'],
        ['fsTreeFolderWithHashCore', fsTreeFolderWithHashCore, 'rej', true, 'all'],
        ['fsGetFilesWithHashInFolder', fsGetFilesWithHashInFolder, 'rej', false, 'file'],
        ['fsGetFilesWithHashInFolderCore', fsGetFilesWithHashInFolderCore, 'rej', true, 'file'],
    ]

    //expect, 層數上限內之預期名稱(排序); lv為null表全部層級
    let expect = (pick, lv) => items
        .filter((v) => pick === 'all' || (pick === 'file' ? !v.isFolder : v.isFolder))
        .filter((v) => lv === null || v.level <= lv)
        .map((v) => v.name)
        .sort()

    let names = (rs) => rs.map((v) => v.name).sort()

    //call, 以物件opt呼叫(Core另併入注入相依); 回傳名稱陣列
    let call = async (f, core, opt) => {
        let o = core ? { ...real, ...opt } : opt
        return names(await f(fd, o))
    }

    //outcome, 以原樣之第2參數(及選用之第3參數)呼叫, 記錄同步拋出、reject、resolve之形
    let outcome = (f, args) => {
        let r
        try {
            r = f(...args)
        }
        catch (err) {
            return Promise.resolve({ s: 'throw', isError: err instanceof Error, v: err instanceof Error ? err.message : '(non-Error)' })
        }
        if (!(r instanceof Promise)) {
            return Promise.resolve({ s: 'return' })
        }
        return r.then(() => ({ s: 'resolve' }), (err) => ({ s: 'reject', t: typeof err, v: typeof err === 'string' ? err : '(non-string)' }))
    }
    let failOf = (kind, msg) => (kind === 'thr' ? { s: 'throw', isError: true, v: msg } : { s: 'reject', t: 'string', v: msg })

    let MSG_OPT = 'invalid opt: must be an object'
    let MSG_ARGS = 'invalid arguments: must be fd and opt only'

    for (let [name, f, kind, core, pick] of defs) {

        describe(name, function() {

            it(`R3: opt未給、{}、undefined、null(對外函數)或opt.levelLimit未給(Core)即窮舉全部層級`, async function() {
                let all = expect(pick, null)
                if (core) {
                    //R1、R3: Core之opt只放注入相依而不給levelLimit, 窮舉全部
                    assert.deepStrictEqual(names(await f(fd, real)), all)
                    assert.deepStrictEqual(names(await f(fd, { ...real, levelLimit: undefined })), all)
                }
                else {
                    //R3: 未給opt即窮舉全部(與舊預設1層相反)
                    assert.deepStrictEqual(names(await f(fd)), all)
                    assert.deepStrictEqual(names(await f(fd, {})), all)
                    assert.deepStrictEqual(names(await f(fd, undefined)), all)
                    //R3(dspec K3例外: undefined、null仍視為未給): null不報錯, 窮舉全部
                    assert.deepStrictEqual(names(await f(fd, null)), all)
                }
                //前提: 窮舉全部之結果確實深於第1層(夾具有鑑別力)
                assert.ok(all.length > expect(pick, 1).length)
            })

            it(`R2: opt.levelLimit為有效正整數才限定層數(1、2、'3'、4、4294967295)`, async function() {
                //R2: 1只列第1層
                assert.deepStrictEqual(await call(f, core, { levelLimit: 1 }), expect(pick, 1))
                //R2: 2列至第2層
                assert.deepStrictEqual(await call(f, core, { levelLimit: 2 }), expect(pick, 2))
                //R2: 數字字串同其數值(iseint之use:'count'可為字串型數字)
                assert.deepStrictEqual(await call(f, core, { levelLimit: '3' }), expect(pick, 3))
                assert.deepStrictEqual(await call(f, core, { levelLimit: ' 3 ' }), expect(pick, 3))
                //R2: 上限4294967295為有效, 結果同全部
                assert.deepStrictEqual(await call(f, core, { levelLimit: 4 }), expect(pick, null))
                assert.deepStrictEqual(await call(f, core, { levelLimit: 4294967295 }), expect(pick, null))
                //前提: 各層之預期彼此不同(1≠2≠3), 層數之誤差可被抓到
                let ex = [1, 2, 3].map((lv) => expect(pick, lv).join(','))
                assert.strictEqual(new Set(ex).size, 3)
            })

            it(`R3: opt.levelLimit無效(0、負數、小數、NaN、Infinity、超過上限、'0x10'、包裝物件、null、假值等)即窮舉全部層級`, async function() {
                let all = expect(pick, null)
                let vs = [0, -1, 1.5, NaN, Infinity, -Infinity, 4294967296, '0x10', 'abc', '', '1.5', true, false, null, new Number(2), {}, [], [2], () => 2]
                for (let v of vs) {
                    //R3: 非預期之opt.levelLimit視為未給, 改用預設(不限層數)
                    assert.deepStrictEqual(await call(f, core, { levelLimit: v }), all, `${name} levelLimit[${typeof v}]`)
                }
            })

            it(`R4: 第2參數給了而非物件(舊寫法之數字等)即${kind === 'thr' ? '同步拋出Error' : 'reject說明字串'}'${MSG_OPT}'`, async function() {
                let vs = [1, 2, 0, 4294967295, -1, 1.5, NaN, Infinity, '1', 'abc', '', true, false, new Number(1), [], [1], () => 1, Symbol('s'), 10n]
                for (let v of vs) {
                    //R4: 依家族通道報錯, 訊息為固定詞彙(不帶輸入值)
                    let r = await outcome(f, [fd, v])
                    assert.deepStrictEqual(r, failOf(kind, MSG_OPT), `${name} opt[${typeof v}]`)
                }
                //R4: 舊寫法之3參數形(第2參數為層數、第3參數為設定物件)亦報錯, 不靜默採用第3參數
                let r3 = await outcome(f, [fd, 1, core ? { ...real } : { type: 'sha256' }])
                assert.deepStrictEqual(r3, failOf(kind, MSG_OPT))
                //R4: 不帶輸入值(V20)
                let r4 = await outcome(f, [fd, 98765])
                assert.ok(r4.v.indexOf('98765') < 0, 'message must not contain the given value')
            })

            it(`R4: fd無效者先報fd(先於opt之遷移期檢查); fd有效而不存在者報opt`, async function() {
                //R4: 路徑無效(空字串、非字串)先於opt
                assert.deepStrictEqual(await outcome(f, ['', 1]), failOf(kind, 'invalid fd: must be a non-empty string'))
                assert.deepStrictEqual(await outcome(f, [123, 1]), failOf(kind, 'invalid fd: must be a non-empty string'))
                //R4: 路徑有效(不論是否存在)即報opt, 不走到fs
                assert.deepStrictEqual(await outcome(f, [path.join(fdRoot, 'nope'), 1]), failOf(kind, MSG_OPT))
            })

            it(`R4d: 第3個引數有給(非undefined)即報錯(舊3參數形之opt不得被靜默忽略), 第2參數為物件、undefined、null皆然`, async function() {
                //舊3參數形(fd, levelLimit, opt)之第2參數為null、undefined時不會被R4攔下, 其第3參數(舊opt)將被忽略, 故第3個引數有給即報錯(主控裁定d)
                let o3 = core ? { ...real } : { type: 'sha256' }
                let vs3 = [o3, {}, null, 0, false, '', 98765, [], () => 1]
                for (let v3 of vs3) {
                    for (let v2 of [null, undefined, {}]) {
                        let r = await outcome(f, [fd, v2, v3])
                        assert.deepStrictEqual(r, failOf(kind, MSG_ARGS), `${name} arg2[${v2 === null ? 'null' : typeof v2}] arg3[${typeof v3}]`)
                    }
                }
                //不帶輸入值(V20)
                let r98765 = await outcome(f, [fd, null, 98765])
                assert.ok(r98765.v.indexOf('98765') < 0, 'message must not contain the given value')
                //第3個引數明給undefined視為未給, 照常列舉(窮舉全部, 與未給opt同)
                let all = expect(pick, null)
                assert.deepStrictEqual(names(await f(fd, core ? { ...real } : {}, undefined)), all)
                assert.deepStrictEqual(names(await f(fd, core ? { ...real, levelLimit: 1 } : { levelLimit: 1 }, undefined)), expect(pick, 1))
                //前提: 窮舉全部與第1層之結果相異(夾具有鑑別力)
                assert.notDeepStrictEqual(all, expect(pick, 1))
            })

            it(`R4e: 檢測順序為fd無效先、第2參數非物件次之、第3個引數最後`, async function() {
                let o3 = core ? { ...real } : { type: 'sha256' }
                //fd無效先於第3個引數與opt
                assert.deepStrictEqual(await outcome(f, ['', null, o3]), failOf(kind, 'invalid fd: must be a non-empty string'))
                assert.deepStrictEqual(await outcome(f, ['', 1, o3]), failOf(kind, 'invalid fd: must be a non-empty string'))
                //第2參數非物件先於第3個引數(舊3參數形之數字層數報opt)
                assert.deepStrictEqual(await outcome(f, [fd, 1, o3]), failOf(kind, MSG_OPT))
                //fd有效(不論是否存在)而僅第3個引數有給即報arguments, 不走到fs
                assert.deepStrictEqual(await outcome(f, [path.join(fdRoot, 'nope'), null, o3]), failOf(kind, MSG_ARGS))
            })

            it(`R7: opt.debug為true時opt.levelLimit無效則警告一次(固定詞彙), 有效或debug非true時不警告`, async function() {
                let ms = []
                let funLog = (m) => ms.push(m)
                let all = expect(pick, null)
                //R7: 無效且debug → 1則警告, 結果仍為全部層級
                parseNumOpt.resetWarned()
                assert.deepStrictEqual(await call(f, core, { levelLimit: 0, debug: true, funLog }), all)
                assert.deepStrictEqual(ms, [`[wsemi fsTreeFolderCore] invalid opt.levelLimit: must be a valid integer (use 'count', min 1), using default null (no limit)`])
                //R7: 有效則不警告
                ms.length = 0
                parseNumOpt.resetWarned()
                await call(f, core, { levelLimit: 2, debug: true, funLog })
                assert.deepStrictEqual(ms, [])
                //R7: 未給opt.levelLimit(預設)不警告
                await call(f, core, { debug: true, funLog })
                assert.deepStrictEqual(ms, [])
                //R7: debug非true則無效亦不警告
                parseNumOpt.resetWarned()
                await call(f, core, { levelLimit: 0, debug: 'true', funLog })
                assert.deepStrictEqual(ms, [])
                parseNumOpt.resetWarned()
            })

        })
    }

    describe(`R6: Core注入之fs仍被使用; 對外之同步3函數固定用Node內建fs`, function() {

        //spyFs, 委派真實fs並記錄readdirSync之呼叫次數(看得出注入之物是否被用到)
        let mkSpyFs = () => {
            let n = { readdirSync: 0 }
            let spy = {
                statSync: (...a) => fs.statSync(...a),
                lstatSync: (...a) => fs.lstatSync(...a),
                readdirSync: (...a) => {
                    n.readdirSync++
                    return fs.readdirSync(...a)
                },
                createReadStream: (...a) => fs.createReadStream(...a),
            }
            return { spy, n }
        }

        for (let [name, f, , core, pick] of defs) {
            if (!core) {
                continue
            }
            it(`${name}: opt.fs為注入之物時以之列舉, 並同時依opt.levelLimit限定層數`, async function() {
                let { spy, n } = mkSpyFs()
                //R1、R6: 注入相依與levelLimit同在opt
                let rs = await f(fd, { fs: spy, path, crypto, levelLimit: 2 })
                assert.deepStrictEqual(names(rs), expect(pick, 2))
                //R6: 注入之fs確實被呼叫(層1與層2之資料夾: t、a、e 共3次)
                assert.strictEqual(n.readdirSync, 3)
            })
        }

        for (let [name, f, pick] of [['fsTreeFolder', fsTreeFolder, 'all'], ['fsGetFilesInFolder', fsGetFilesInFolder, 'file'], ['fsGetFoldersInFolder', fsGetFoldersInFolder, 'folder']]) {
            it(`${name}: opt.fs不採用(固定Node內建), 仍依opt.levelLimit`, function() {
                let { spy, n } = mkSpyFs()
                //R6: 對外之同步3函數不採用呼叫端之fs
                let rs = f(fd, { fs: spy, levelLimit: 2 })
                assert.strictEqual(n.readdirSync, 0)
                //R2: 同一opt之levelLimit仍生效
                assert.deepStrictEqual(names(rs), expect(pick, 2))
            })
        }

        it(`Core缺注入相依時仍依相依檢查報錯(R-FS-DEPS-01不變), 不因opt改為物件而略過`, async function() {
            assert.throws(() => fsTreeFolderCore(fd, { levelLimit: 1 }), /^Error: invalid opt\.fs: must be an object providing /)
            assert.throws(() => fsTreeFolderCore(fd), /^Error: invalid opt\.fs: must be an object providing /)
            assert.throws(() => fsTreeFolderCore(fd, null), /^Error: invalid opt\.fs: must be an object providing /)
            let r = await outcome(fsTreeFolderWithHashCore, [fd, { levelLimit: 1 }])
            assert.ok(r.s === 'reject' && r.v.startsWith('invalid opt.fs: must be an object providing '), JSON.stringify(r))
        })

        //R8: 對外函數只讀必要之鍵(opt.levelLimit一次), debug、funLog於levelLimit非預期時才讀(V11); 使用者自帶之內部鍵optDbg不採用
        let pubs = defs.filter((v) => !v[3])
        let syncPubs = pubs.filter((v) => v[2] === 'thr')

        for (let [name, f, kind, , pick] of pubs) {
            it(`${name}: opt.levelLimit有效時不讀opt.debug, 無效時讀一次(V11)`, async function() {
                let n = 0
                let mk = (lv) => ({
                    levelLimit: lv,
                    get debug() {
                        n++
                        return false
                    },
                })
                //R8、V11: 有效值不讀debug
                assert.deepStrictEqual(names(await f(fd, mk(1))), expect(pick, 1))
                let nValid = n
                //R8、V11: 無效值讀一次(其後只用快照)
                n = 0
                assert.deepStrictEqual(names(await f(fd, mk(0))), expect(pick, null))
                //WithHash兩個對外函數以展開合併注入(既有寫法, 至多讀一次); 同步3個至多讀一次, 且有效值時為0
                assert.ok(nValid <= 1 && n <= 1, `${name} debug reads valid ${nValid} invalid ${n}`)
                if (kind === 'thr') {
                    assert.deepStrictEqual([nValid, n], [0, 1], `${name} debug reads`)
                }
            })

            it(`${name}: 使用者自帶之內部鍵optDbg不採用(opt.debug未給即不警告)`, async function() {
                let ms = []
                parseNumOpt.resetWarned()
                let rs = await f(fd, { levelLimit: 0, optDbg: { debug: true, funLog: (m) => ms.push(m) } })
                parseNumOpt.resetWarned()
                //R8: optDbg非公開之鍵, 不得使呼叫端以之控制警告出口; levelLimit無效仍窮舉全部
                assert.deepStrictEqual(names(rs), expect(pick, null))
                assert.deepStrictEqual(ms, [])
            })
        }

        for (let [name, f, , , pick] of syncPubs) {
            it(`${name}: 原型上之存取器levelLimit(類別實例之opt)照常採用, 同Core直呼`, function() {
                class Opt {
                    get levelLimit() {
                        return 2
                    }
                }
                //R8: 只展開自有鍵者會漏掉原型上之存取器而變窮舉全部; 以屬性讀取取值則採用
                assert.deepStrictEqual(names(f(fd, new Opt())), expect(pick, 2))
            })
        }

    })

})
