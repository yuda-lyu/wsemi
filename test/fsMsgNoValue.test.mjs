import fs from 'fs'
import path from 'path'
import http from 'http'
import assert from 'assert'
import fsCopyFile from '../src/fsCopyFile.mjs'
import fsCopyFolder from '../src/fsCopyFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsDeleteFileCore from '../src/fsDeleteFileCore.mjs'
import fsDeleteFileSafe from '../src/fsDeleteFileSafe.mjs'
import fsDeleteFolderSafe from '../src/fsDeleteFolderSafe.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import fsRenameFolder from '../src/fsRenameFolder.mjs'
import fsWriteJson from '../src/fsWriteJson.mjs'
import fsReadText from '../src/fsReadText.mjs'
import fsReadJson from '../src/fsReadJson.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsCleanFolder from '../src/fsCleanFolder.mjs'
import fsCleanFolderCore from '../src/fsCleanFolderCore.mjs'
import fsGetFileHash from '../src/fsGetFileHash.mjs'
import fsGetFileBasicHash from '../src/fsGetFileBasicHash.mjs'
import fsGetFileXxHash from '../src/fsGetFileXxHash.mjs'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'
import fsTreeFolder from '../src/fsTreeFolder.mjs'
import fsTreeFolderCore from '../src/fsTreeFolderCore.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'
import fsGetFoldersInFolder from '../src/fsGetFoldersInFolder.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import fsMergeFiles from '../src/fsMergeFiles.mjs'
import fsEvem from '../src/fsEvem.mjs'
import fsTask from '../src/fsTask.mjs'
import fsDownloadFile from '../src/fsDownloadFile.mjs'
import fsDownloadFileVerify from '../src/fsDownloadFileVerify.mjs'
import fsEnsureBins from '../src/fsEnsureBins.mjs'
import fsGetBinManifestEntry from '../src/fsGetBinManifestEntry.mjs'
import toResultError from '../src/_toResultError.mjs'
import fsErrMsg, { fsErrCode, fsErrSan, fsErrMsgNet, fsErrCause } from '../src/_fsErrMsg.mjs'


//第492項第3批 N-C、W-23: 錯誤訊息、console輸出、{ error }／reject之內容不得回顯路徑、網址、輸入值(V20), 依參數位置與期望寫(V19); 原生錯誤改固定詞彙加錯誤碼(R-FS-ERRMSG-01)
//  成功訊息(done: <路徑>等, R-FS-RESULT-01)維持既有契約不動(見fsMsgNoValue之末段對照)
describe(`fs 訊息不帶值(V20)與原生錯誤固定詞彙(R-FS-ERRMSG-01)`, function() {

    let tok = 'leak-tok-7f3a'
    let fx = path.resolve('./test/_tmp/fsMsgNoValue')
    let fdT = path.join(fx, tok) //夾具根(其路徑含辨識字樣tok)
    let fpFile = path.join(fdT, 'f.txt')
    let fdSub = path.join(fdT, 'sub')
    let fpNope = path.join(fdT, 'nope.txt')
    let fdNope = path.join(fdT, 'nope-dir')

    before(function() {
        fs.rmSync(fx, { recursive: true, force: true })
        fs.mkdirSync(fdSub, { recursive: true })
        fs.writeFileSync(fpFile, 'abc')
    })

    after(function() {
        fs.rmSync(fx, { recursive: true, force: true })
        assert.strict.deepStrictEqual(fs.existsSync(fx), false)
    })

    //noLeak, 文字不得含路徑(完整路徑、夾具根、辨識字樣)
    let noLeak = (s, label) => {
        let t = typeof s === 'string' ? s : (s instanceof Error ? `${s.name}: ${s.message}` : JSON.stringify(s))
        for (let v of [fx, fdT, tok, fpFile, fpNope, fdNope]) {
            assert.strict.deepStrictEqual(t.includes(v), false, `${label}: leaks ${v} in ${t}`)
        }
    }

    let rej = async (pm) => {
        try {
            return { ok: await pm }
        }
        catch (err) {
            return { err }
        }
    }

    let thr = (f) => {
        try {
            return { ok: f() }
        }
        catch (err) {
            return { err }
        }
    }

    describe(`「不是檔案/資料夾/已存在」之訊息(結果物件)`, function() {

        let cases = [
            ['fsCopyFile(來源不存在)', () => fsCopyFile(fpNope, path.join(fdT, 'o1.txt')), 'invalid fpSrc: must be an existing file'],
            ['fsCopyFile(來源為資料夾)', () => fsCopyFile(fdSub, path.join(fdT, 'o2.txt')), 'invalid fpSrc: must be an existing file'],
            ['fsCopyFile(useSync:false)', () => fsCopyFile(fpNope, path.join(fdT, 'o3.txt'), { useSync: false }), 'invalid fpSrc: must be an existing file'],
            ['fsCopyFolder(來源不存在)', () => fsCopyFolder(fdNope, path.join(fdT, 'o4')), 'invalid fpSrc: must be an existing folder'],
            ['fsCopyFolder(useSync:false)', () => fsCopyFolder(fpFile, path.join(fdT, 'o5'), { useSync: false }), 'invalid fpSrc: must be an existing folder'],
            ['fsCreateFile(已存在之檔)', () => fsCreateFile(fpFile, 'x'), 'invalid pah: must not already exist'],
            ['fsCreateFile(已存在之資料夾)', () => fsCreateFile(fdSub, 'x'), 'invalid pah: must not already exist'],
            ['fsCreateFolder(已存在之檔)', () => fsCreateFolder(fpFile), 'invalid pah: must be a folder or not exist'],
            ['fsDeleteFile(為資料夾)', () => fsDeleteFile(fdSub), 'invalid pah: must be a file or not exist'],
            ['fsDeleteFolder(為檔案)', () => fsDeleteFolder(fpFile), 'invalid pah: must be a folder or not exist'],
            ['fsRenameFile(原路徑不存在)', () => fsRenameFile(fpNope, path.join(fdT, 'r1.txt')), 'invalid pahOld: must be an existing file'],
            ['fsRenameFile(新路徑已存在)', () => fsRenameFile(fpFile, fdSub), 'invalid pahNew: must not already exist'],
            ['fsRenameFolder(原路徑不存在)', () => fsRenameFolder(fdNope, path.join(fdT, 'r2')), 'invalid pahOld: must be an existing folder'],
            ['fsRenameFolder(新路徑已存在)', () => fsRenameFolder(fdSub, fpFile), 'invalid pahNew: must not already exist'],
            ['fsWriteJson(inp非物件)', () => fsWriteJson(path.join(fdT, 'j.json'), 5), 'invalid inp: must be an object or array'],
        ]

        for (let [n, f, msg] of cases) {
            it(`${n} should return error '${msg}' without the path`, async function() {
                //規格: V19(invalid <名稱>: must be <種類>)、V20(不帶值)
                let r = await f()
                assert.strict.deepStrictEqual(r.error, msg)
                assert.strict.deepStrictEqual(Object.keys(r), ['error'])
                noLeak(r.error, n)
            })
        }

    })

    describe(`「不是檔案/資料夾」之訊息(Promise reject 與同步拋出)`, function() {

        let fp = fpNope
        let rejCases = [
            ['fsDeleteFileSafe(為資料夾)', () => fsDeleteFileSafe(fdSub), 'invalid pah: must be a file or not exist'],
            ['fsDeleteFolderSafe(為檔案)', () => fsDeleteFolderSafe(fpFile), 'invalid pah: must be a folder or not exist'],
            ['fsGetFileHash(不存在)', () => fsGetFileHash(fp), 'invalid fp: must be an existing file'],
            ['fsGetFileBasicHash(不存在)', () => fsGetFileBasicHash(fp), 'invalid fp: must be an existing file'],
            ['fsGetFileXxHash(不存在)', () => fsGetFileXxHash(fp), 'invalid fp: must be an existing file'],
            ['fsGetFolderBasicHash(不存在)', () => fsGetFolderBasicHash(fdNope), 'invalid fd: must be an existing folder'],
            ['fsGetFilesWithHashInFolder(不存在)', () => fsGetFilesWithHashInFolder(fdNope), 'invalid fd: must be an existing folder'],
            ['fsTreeFolderWithHash(為檔案)', () => fsTreeFolderWithHash(fpFile), 'invalid fd: must be an existing folder'],
            ['fsSyncFolder(來源不存在)', () => fsSyncFolder(fdNope, path.join(fdT, 's1')), 'invalid fdSrc: must be an existing folder'],
            ['fsMergeFiles(切片不存在)', () => fsMergeFiles([fpNope], path.join(fdT, 'm1.txt')), 'invalid fpsIn[0]: must be an existing file'],
            ['fsMergeFiles(空陣列)', () => fsMergeFiles([], path.join(fdT, 'm2.txt')), 'invalid fpsIn: must be a non-empty array'],
            ['fsMergeFiles(第二片不存在)', () => {
                //合併成功之切片會被刪除, 故用專屬切片檔, 不動共用之夾具檔
                let piece = path.join(fdT, 'm3-piece.txt')
                fs.writeFileSync(piece, 'p')
                return fsMergeFiles([piece, fpNope], path.join(fdT, 'm3.txt'))
            }, 'invalid fpsIn[1]: must be an existing file'],
            ['fsGetBinManifestEntry(為資料夾)', () => fsGetBinManifestEntry(fdSub), 'Error: invalid fp: must be an existing file'],
            ['fsGetBinManifestEntry(不存在, 原生錯誤)', () => fsGetBinManifestEntry(fpNope), 'operation failed (code ENOENT)'],
        ]

        for (let [n, f, msg] of rejCases) {
            it(`${n} should reject the string '${msg}' without the path`, async function() {
                let r = await rej(f())
                assert.strict.deepStrictEqual(r.err, msg)
                noLeak(r.err, n)
            })
        }

        let thrCases = [
            ['fsTreeFolder(不存在)', () => fsTreeFolder(fdNope)],
            ['fsTreeFolder(為檔案)', () => fsTreeFolder(fpFile)],
            ['fsGetFilesInFolder(不存在)', () => fsGetFilesInFolder(fdNope)],
            ['fsGetFoldersInFolder(不存在)', () => fsGetFoldersInFolder(fdNope)],
        ]

        for (let [n, f] of thrCases) {
            it(`${n} should throw an Error 'invalid fd: must be an existing folder' without the path`, function() {
                let r = thr(f)
                assert.strict.deepStrictEqual([r.err instanceof Error, r.err.message], [true, 'invalid fd: must be an existing folder'])
                noLeak(r.err, n)
            })
        }

    })

    describe(`fsEvem 之事件名稱不合法之訊息不帶事件名稱`, function() {

        it(`should throw 'invalid evName: <期望>' for each illegal name, without echoing the name`, function() {
            let fd = path.join(fx, 'evps')
            let ev = fsEvem({ fd, timeInterval: 3600000 })
            try {
                let names = [
                    [`a/${tok}`, 'must not contain a path separator, a control character or any of < > : " | ? *'],
                    [`${tok}\u0001`, 'must not contain a path separator, a control character or any of < > : " | ? *'],
                    ['', 'must not be empty'],
                    ['..', 'must not be . or ..'],
                    [`${tok}.`, 'must not end with . or a space'],
                    ['CON', 'must not be a Windows device name'],
                    [tok.repeat(40), 'must not be longer than 200 bytes'],
                    [123, 'must be a string'],
                ]
                for (let [nm, why] of names) {
                    let r = thr(() => ev.emit(nm, 'x'))
                    assert.strict.deepStrictEqual(r.err.message, `invalid evName: ${why}`, String(nm).slice(0, 20))
                    noLeak(r.err.message, 'evem')
                }
            }
            finally {
                ev.clear()
            }
        })

    })

    describe(`fsTask 之 console 輸出不帶 key(檔案路徑與雜湊)`, function() {

        it(`should log the fixed text without the key when a stored result is not an array (getResult and getAndEliminateResult)`, function() {
            let fdStorage = path.join(fx, 'task-st')
            fs.mkdirSync(fdStorage, { recursive: true })
            fs.writeFileSync(path.join(fdStorage, 'fpResult.json'), JSON.stringify({ [`${fpFile}|HASH-${tok}`]: 'not-an-array' }), 'utf8')
            let ev = fsTask(fdSub, { fdStorage, timeInterval: 3600000 })
            let logs = []
            let orig = console.log
            console.log = (...args) => {
                logs.push(args.join(' '))
            }
            try {
                ev.getResult(fpFile, `HASH-${tok}`)
                ev.getAndEliminateResult(fpFile, `HASH-${tok}`)
            }
            finally {
                console.log = orig
                ev.clear()
            }
            assert.strict.deepStrictEqual(logs, ['result for the key is not an array', 'result for the key is not an array'])
        })

    })

    //W-23: 原生錯誤(帶code之真Error)改固定詞彙加錯誤碼, 不回傳含路徑之原文
    describe(`原生錯誤改固定詞彙加錯誤碼(W-23)`, function() {

        let nativeErr = (code, p) => {
            let e = new Error(`${code}: operation failed, open '${p}'`)
            e.code = code
            e.errno = -4058
            e.syscall = 'open'
            e.path = p
            e.dest = p
            return e
        }

        it(`fsReadText of a missing file should return { error } as a new Error with the fixed message, the code only and no path properties`, function() {
            let r = fsReadText(fpNope)
            assert.strict.deepStrictEqual([r.error instanceof Error, r.error.message, r.error.code, Object.keys(r.error)], [true, 'operation failed (code ENOENT)', 'ENOENT', ['code']])
            noLeak(r.error, 'fsReadText')
            noLeak(r.error.stack, 'fsReadText stack')
        })

        it(`fsReadJson, fsWriteText, fsCleanFolder should also return the sanitized Error for a native error`, function() {
            let r1 = fsReadJson(fpNope)
            let r2 = fsWriteText(path.join(fpFile, 'child.txt'), 'x') //父為檔案: ENOTDIR(或平台之ENOENT)
            let r3 = fsCleanFolder(fpFile) //一般檔案: 走「不是資料夾」之固定字串分支(未經原生錯誤), 僅確認不帶路徑
            assert.strict.deepStrictEqual(r1.error.message, 'operation failed (code ENOENT)')
            assert.strict.deepStrictEqual(/^operation failed \(code (ENOTDIR|ENOENT)\)$/.test(r2.error.message), true, r2.error.message)
            assert.strict.deepStrictEqual(r3.error, 'input path is not a folder')
            for (let r of [r1, r2, r3]) {
                noLeak(r.error, 'result')
            }
        })

        it(`fsCleanFolderCore should return a new Error with the fixed message when readdirSync of the injected fs throws a native error carrying path and syscall`, function() {
            //外審(terra)指出: 原案以一般檔案呼叫, 只走固定字串分支, 對舊實作亦通過; 改注入readdirSync拋原生錯誤(帶path、syscall), 才經toResultError之去路徑處理
            let e0 = nativeErr('EPERM', fdSub)
            let r = fsCleanFolderCore(fdSub, {
                path,
                fs: {
                    ...fs,
                    readdirSync() {
                        throw e0
                    }
                }
            })
            assert.strict.deepStrictEqual([r.error === e0, r.error.message, r.error.code, Object.keys(r.error), r.error.path, r.error.syscall], [false, 'operation failed (code EPERM)', 'EPERM', ['code'], undefined, undefined])
            noLeak(r.error, 'fsCleanFolderCore')
        })

        it(`a Core with an injected fs that throws a native error carrying path, dest and syscall should return a new Error without them`, function() {
            let e0 = nativeErr('EPERM', fpFile)
            let r = fsDeleteFileCore(fpFile, {
                fs: {
                    ...fs,
                    unlinkSync() {
                        throw e0
                    }
                }
            })
            assert.strict.deepStrictEqual([r.error === e0, r.error.message, r.error.code, Object.keys(r.error), r.error.path, r.error.syscall, r.error.cause], [false, 'operation failed (code EPERM)', 'EPERM', ['code'], undefined, undefined, undefined])
            assert.strict.deepStrictEqual(fs.existsSync(fpFile), true)
        })

        it(`the public wrappers should reject the fixed string when expanding opt throws a native error (an option getter), not the message of the native error`, async function() {
            //外審(terra)指出: 展開opt之getter拋出原生錯誤(ENOENT帶path)時, 對外包裝以errToStr或原message reject, 繞過固定詞彙
            let nat = nativeErr('ENOENT', fpNope)
            let opt = {
                get fs() {
                    throw nat
                }
            }
            let fpOut = path.join(fdT, 'merge-out.txt')
            let fns = [
                ['fsGetFileHash', () => fsGetFileHash(fpFile, opt)],
                ['fsGetFileBasicHash', () => fsGetFileBasicHash(fpFile, opt)],
                ['fsGetFileXxHash', () => fsGetFileXxHash(fpFile, opt)],
                ['fsGetFolderBasicHash', () => fsGetFolderBasicHash(fdSub, opt)],
                ['fsGetFilesWithHashInFolder', () => fsGetFilesWithHashInFolder(fdSub, 1, opt)],
                ['fsTreeFolderWithHash', () => fsTreeFolderWithHash(fdSub, 1, opt)],
                ['fsSyncFolder', () => fsSyncFolder(fdSub, path.join(fdT, 'sync-tar'), opt)],
                ['fsMergeFiles', () => fsMergeFiles([fpFile], fpOut, opt)],
                ['fsDeleteFileSafe', () => fsDeleteFileSafe(fpFile, opt)],
                ['fsDeleteFolderSafe', () => fsDeleteFolderSafe(fdSub, opt)],
            ]
            for (let [n, f] of fns) {
                let r = await rej(f())
                assert.strict.deepStrictEqual([n, r.err], [n, 'operation failed (code ENOENT)'])
            }
            //無code之錯誤(使用端自拋)維持原form: 以其message(fsMergeFiles)或'Error: 訊息'(其餘)reject
            let own = {
                get fs() {
                    throw new Error('caller getter failed')
                }
            }
            assert.strict.deepStrictEqual([(await rej(fsMergeFiles([fpFile], fpOut, own))).err, (await rej(fsGetFileHash(fpFile, own))).err], ['caller getter failed', 'Error: caller getter failed'])
        })

        it(`fsMergeFilesCore should reject a string (not an Error object) when reading an element of fpsIn throws a native error`, async function() {
            let nat = nativeErr('ENOENT', fpNope)
            //第2個元素之讀取拋原生錯誤(isearr只於長度為1時讀取第1個元素, 長度為2時不讀, 故錯誤於合併處理讀取元素時才拋出, 走固定詞彙之失敗通道)
            let arr = [fpFile, fpFile]
            Object.defineProperty(arr, 1, {
                get() {
                    throw nat
                }
            })
            let r = await rej(fsMergeFiles(arr, path.join(fdT, 'merge-out2.txt')))
            assert.strict.deepStrictEqual([typeof r.err, r.err], ['string', 'operation failed (code ENOENT)'])
            assert.strict.deepStrictEqual(fs.existsSync(path.join(fdT, 'merge-out2.txt')), false)
        })

        it(`fsMergeFilesCore should reject 'invalid fpsIn: must be a non-empty array' when the only element of fpsIn is unreadable (isearr judges unreadable content as invalid and never throws; was the native error form before W-20/批6裁定③)`, async function() {
            let nat = nativeErr('ENOENT', fpNope)
            let arr = [fpFile]
            Object.defineProperty(arr, 0, {
                get() {
                    throw nat
                }
            })
            let r = await rej(fsMergeFiles(arr, path.join(fdT, 'merge-out3.txt')))
            assert.strict.deepStrictEqual([typeof r.err, r.err], ['string', 'invalid fpsIn: must be a non-empty array'])
            assert.strict.deepStrictEqual(fs.existsSync(path.join(fdT, 'merge-out3.txt')), false)
        })

        it(`an Error without a code (own fixed messages, injected TypeError) and non-Error values keep their old form`, function() {
            let e1 = new TypeError('fs.unlinkSync is not a function')
            let r = fsDeleteFileCore(fpFile, {
                fs: {
                    ...fs,
                    unlinkSync() {
                        throw e1
                    }
                }
            })
            assert.strict.deepStrictEqual([r.error === e1, toResultError('boom'), toResultError(null), toResultError({ x: 1 })], [true, 'boom', 'null', '[object Object]'])
        })

        it(`fsTreeFolderCore should throw a new Error with the fixed message when readdirSync fails with a native error`, function() {
            let e0 = nativeErr('EPERM', fdSub)
            let r = thr(() => fsTreeFolderCore(fdSub, 1, {
                path,
                fs: {
                    ...fs,
                    readdirSync() {
                        throw e0
                    }
                }
            }))
            assert.strict.deepStrictEqual([r.err === e0, r.err.message, r.err.code, Object.keys(r.err)], [false, 'operation failed (code EPERM)', 'EPERM', ['code']])
        })

        it(`_fsErrMsg: fsErrCode, fsErrMsg, fsErrSan, fsErrMsgNet, fsErrCause`, function() {
            let nat = nativeErr('ENOENT', fpFile)
            let own = new Error('own fixed message')
            own.code = 'E_ARG'
            let net = new TypeError('fetch failed')
            net.cause = nativeErr('ECONNREFUSED', 'http://127.0.0.1:1/secret')
            let weird = new Error('x')
            weird.code = 'bad code!'
            assert.strict.deepStrictEqual([fsErrCode(nat), fsErrCode(own), fsErrCode(net), fsErrCode(weird), fsErrCode('ENOENT'), fsErrCode(null)], ['ENOENT', null, null, null, null, null])
            assert.strict.deepStrictEqual([fsErrMsg(nat), fsErrMsg(own), fsErrMsg('s'), fsErrMsg(null), fsErrMsg(net)], ['operation failed (code ENOENT)', 'Error: own fixed message', 's', 'null', 'TypeError: fetch failed'])
            assert.strict.deepStrictEqual([fsErrSan(nat) === nat, fsErrSan(own) === own, fsErrSan('s')], [false, true, 's'])
            assert.strict.deepStrictEqual([fsErrMsgNet(net), fsErrMsgNet(nat)], ['TypeError: fetch failed (code ECONNREFUSED)', 'operation failed (code ENOENT)'])
            let c = fsErrCause(net)
            assert.strict.deepStrictEqual([c instanceof Error, c.message, c.code, Object.keys(c)], [true, 'TypeError: fetch failed (code ECONNREFUSED)', undefined, []])
            let c2 = fsErrCause(nat)
            assert.strict.deepStrictEqual([c2.message, c2.code, Object.keys(c2)], ['operation failed (code ENOENT)', 'ENOENT', ['code']])
        })

    })

    //下載: 本機HTTP服務, 訊息與cause不帶網址、檔案路徑、期望值與實際值
    describe(`下載之失敗訊息不帶網址與檔案路徑`, function() {

        let server = null
        let port = 0

        before(async function() {
            server = http.createServer((req, res) => {
                if (req.url.startsWith('/ok')) {
                    res.writeHead(200, { 'content-length': '3' })
                    res.end('abc')
                }
                else {
                    res.writeHead(404, 'Not Found')
                    res.end('nf')
                }
            })
            await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
            port = server.address().port
        })

        after(async function() {
            await new Promise((resolve) => server.close(resolve))
        })

        it(`fsDownloadFile should reject 'failed to download: status[404] Not Found' without the url and the path`, async function() {
            let url = `http://127.0.0.1:${port}/${tok}/a.bin`
            let fpOut = path.join(fdT, 'dl1', 'a.bin')
            let r = await rej(fsDownloadFile(url, fpOut))
            assert.strict.deepStrictEqual(r.err, 'failed to download: status[404] Not Found')
            assert.strict.deepStrictEqual([r.err.includes(String(port)), fs.existsSync(fpOut), fs.existsSync(`${fpOut}.download`)], [false, false, false])
            noLeak(r.err, 'fsDownloadFile')
        })

        it(`fsDownloadFileVerify should reject E_HTTP with a message free of the url, the path and the hashes, keeping them in the structured fields`, async function() {
            let url = `http://127.0.0.1:${port}/${tok}/b.bin`
            let fpOut = path.join(fdT, 'dl2', 'b.bin')
            let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
            let r = await rej(fsDownloadFileVerify(url, fpOut, { sha256: sha, size: 3 }, { maxAttempts: 1 }))
            let e = r.err
            assert.strict.deepStrictEqual([e.code, e.step, e.status, e.url, e.fp, e.expected], ['E_HTTP', 'request', 404, url, fpOut, { sha256: sha, size: 3 }])
            assert.strict.deepStrictEqual(e.message.split('\n')[0], 'failed to download (code E_HTTP, step request, attempt 1): HTTP 404 Not Found')
            for (let v of [tok, String(port), fpOut, fx, sha, '127.0.0.1']) {
                assert.strict.deepStrictEqual(e.message.includes(v), false, v)
            }
        })

        it(`fsDownloadFileVerify should give a cause that carries only the fixed message and the code when the output folder can not be prepared`, async function() {
            let url = `http://127.0.0.1:${port}/ok`
            let fpOut = path.join(fpFile, 'c.bin') //父為檔案: 無法建立資料夾
            let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
            let r = await rej(fsDownloadFileVerify(url, fpOut, { sha256: sha }, { maxAttempts: 1 }))
            let e = r.err
            assert.strict.deepStrictEqual([e.code, e.step], ['E_FS', 'prepare'])
            //e.cause為本函數自建之E_FS(其message已不含路徑), 其cause才是原錯誤之去路徑版
            let c = e.cause.cause
            assert.strict.deepStrictEqual(/^operation failed \(code (ENOTDIR|ENOENT|EEXIST)\)$/.test(c.message), true, c.message)
            assert.strict.deepStrictEqual([Object.keys(c), c.code === c.message.match(/code (\w+)/)[1], e.message.includes(fpOut), e.message.includes('can not prepare the output folder: operation failed (code ')], [['code'], true, false, true])
        })

        it(`fsDownloadFileVerify should report a network failure as 'fetch failed (code ECONNREFUSED)' without host and port`, async function() {
            //取一個已關閉之埠(作業系統配發後關閉)
            let s2 = http.createServer()
            await new Promise((resolve) => s2.listen(0, '127.0.0.1', resolve))
            let p2 = s2.address().port
            await new Promise((resolve) => s2.close(resolve))
            let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
            let r = await rej(fsDownloadFileVerify(`http://127.0.0.1:${p2}/x.bin`, path.join(fdT, 'dl4', 'x.bin'), { sha256: sha }, { maxAttempts: 1 }))
            let e = r.err
            assert.strict.deepStrictEqual([e.code, e.step], ['E_NETWORK', 'request'])
            assert.strict.deepStrictEqual(e.message.split('\n')[0], 'failed to download (code E_NETWORK, step request, attempt 1): fetch failed (code ECONNREFUSED)')
            //e.cause為本函數自建之E_NETWORK(message不含主機與埠), 其cause為只含固定詞彙之Error(不保留原錯誤之cause鏈與其訊息)
            let c = e.cause.cause
            assert.strict.deepStrictEqual([e.message.includes(String(p2)), e.message.includes('127.0.0.1'), e.cause.message.includes('127.0.0.1'), c.message, c.code, Object.keys(c)], [false, false, false, 'TypeError: fetch failed (code ECONNREFUSED)', undefined, []])
        })

    })

    describe(`fsEnsureBins 之清單與選項訊息不帶路徑、網址與欄位值`, function() {

        let sha = '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913'
        let mk = (files) => ({ schema: 1, pkg: 'w-sec-test', mode: 'pinned', repo: 'o/r', files })
        let fdRoot = path.join(fx, 'ensure')

        before(function() {
            fs.mkdirSync(fdRoot, { recursive: true })
        })

        let rejE = async (manifest, opt = {}) => {
            let r = await rej(fsEnsureBins(manifest, { pkgRoot: fdRoot, offline: true, ...opt }))
            return r.err
        }

        it(`E_MANIFEST for a bad url should name the field only, not the url value`, async function() {
            let e = await rejE(mk([{ name: 'a.bin', url: `http://example.com/${tok}/a.bin?secret=1`, sha256: sha, size: 3 }]))
            assert.strict.deepStrictEqual([e.code, e.field], ['E_MANIFEST', 'files[0].url'])
            assert.strict.deepStrictEqual(e.message.startsWith('fsEnsureBins: the manifest is invalid: files[0].url '), true, e.message)
            for (let v of [tok, 'secret=1', 'example.com']) {
                assert.strict.deepStrictEqual(e.message.includes(v), false, v)
            }
        })

        it(`E_MANIFEST for a bad name, a duplicate name and a bad path should not echo the manifest values`, async function() {
            let e1 = await rejE(mk([{ name: `bad name ${tok}`, url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 }]))
            let e2 = await rejE(mk([
                { name: `dup-${tok}.bin`, url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 },
                { name: `DUP-${tok}.bin`, url: 'https://github.com/o/r/releases/download/v1/b.bin', sha256: sha, size: 3 },
            ]))
            let e3 = await rejE(mk([{ name: 'a.bin', path: `../${tok}/x`, sha256: sha, size: 3 }]))
            assert.strict.deepStrictEqual([e1.field, e2.field, e3.field], ['files[0].name', 'files[1].name', 'files[0].path'])
            for (let e of [e1, e2, e3]) {
                assert.strict.deepStrictEqual(e.message.includes(tok), false, e.message)
            }
        })

        it(`should not echo the manifest file path or the JSON text when the manifest file can not be read or parsed`, async function() {
            let fpBad = path.join(fdRoot, `bad-${tok}.json`)
            fs.writeFileSync(fpBad, `{ "secret": "${tok}" `, 'utf8')
            let e1 = await rejE(fpBad)
            let e2 = await rejE(path.join(fdRoot, `missing-${tok}.json`))
            assert.strict.deepStrictEqual([e1.code, e1.message, e2.code, e2.message], ['E_MANIFEST', 'fsEnsureBins: the manifest file is not valid JSON', 'E_MANIFEST', 'fsEnsureBins: can not read the manifest file: operation failed (code ENOENT)'])
            assert.strict.deepStrictEqual([e2.cause.message, e2.cause.code, Object.keys(e2.cause)], ['operation failed (code ENOENT)', 'ENOENT', ['code']])
        })

        it(`should not echo the mirror value, and E_OFFLINE_MISSING should keep the details in the missing field only`, async function() {
            let e1 = await rejE(mk([{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 }]), { mirror: `ftp://user:pw@${tok}.example/` })
            assert.strict.deepStrictEqual([e1.code, e1.message], ['E_ARG', 'fsEnsureBins: invalid opt.mirror (or W_BIN_MIRROR): must be a local folder or an http(s) url'])
            let e2 = await rejE(mk([{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 }]), { cacheDir: path.join(fdRoot, `cache-${tok}`) })
            assert.strict.deepStrictEqual(e2.code, 'E_OFFLINE_MISSING')
            for (let v of [tok, sha, fdRoot, 'github.com', '3 bytes']) {
                assert.strict.deepStrictEqual(e2.message.includes(v), false, `${v} in ${e2.message}`)
            }
            assert.strict.deepStrictEqual(e2.message.includes('- a.bin: missing from the cache and the mirror'), true)
            let m = e2.missing[0]
            assert.strict.deepStrictEqual([m.name, m.sha256, m.size, m.url, m.cachePath.includes(tok)], ['a.bin', sha, 3, 'https://github.com/o/r/releases/download/v1/a.bin', true])
        })

        it(`should not echo the unknown names of opt.names`, async function() {
            let e = await rejE(mk([{ name: 'a.bin', url: 'https://github.com/o/r/releases/download/v1/a.bin', sha256: sha, size: 3 }]), { names: [`x-${tok}`] })
            assert.strict.deepStrictEqual([e.code, e.message], ['E_ARG', 'fsEnsureBins[w-sec-test]: invalid opt.names: has names not in the manifest'])
        })

    })

    describe(`成功訊息之既有契約不變(R-FS-RESULT-01)`, function() {

        it(`should keep 'done: <path>' and 'file does not exist: <path>' as they are`, async function() {
            let fp = path.join(fdT, 'ok', 'a.txt')
            assert.strict.deepStrictEqual(fsCreateFile(fp, 'x'), { success: `done: ${fp}` })
            assert.strict.deepStrictEqual(fsDeleteFile(fp), { success: `done: ${fp}` })
            assert.strict.deepStrictEqual(fsDeleteFile(fp), { success: `file does not exist: ${fp}` })
            assert.strict.deepStrictEqual(await fsDeleteFileSafe(fp), `file does not exist: ${fp}`)
            assert.strict.deepStrictEqual(fsCreateFolder(path.join(fdT, 'ok')), { success: `input folder is already exists: ${path.join(fdT, 'ok')}` })
        })

    })

})
