import fs from 'fs'
import assert from 'assert'
import { Writable, Readable } from 'stream'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsMergeFiles from '../src/fsMergeFiles.mjs'
import fsMergeFilesCore from '../src/fsMergeFilesCore.mjs'
import { thrower, revoked } from './tools/codecThrown.mjs'
import { settleShown } from './tools/caseKit.mjs'


describe(`fsMergeFiles`, function() {

    let test = async () => {
        let ms = []

        let fdt = './_test_fsMergeFiles'
        fsCreateFolder(fdt) //創建任務資料夾

        fs.writeFileSync(`${fdt}/t1.txt`, 'abc', 'utf8')
        fs.writeFileSync(`${fdt}/t2.txt`, 'def', 'utf8')
        fs.writeFileSync(`${fdt}/t3.txt`, '中文', 'utf8')
        fs.writeFileSync(`${fdt}/t4.txt`, '測 試', 'utf8')
        fs.writeFileSync(`${fdt}/t5.txt`, '&*#$%', 'utf8')

        let fnOut = '合併檔案.txt'
        let fpsIn = [
            `${fdt}/t1.txt`,
            `${fdt}/t2.txt`,
            `${fdt}/t3.txt`,
            `${fdt}/t4.txt`,
            `${fdt}/t5.txt`,
        ]
        let fpOut = `${fdt}/m.txt`
        await fsMergeFiles(fpsIn, fpOut, { fnOut })
            .then((res) => {
                // console.log('res', res)
                ms.push(res)
            })
            .catch(() => {
                // console.log('err', err)
            })

        let c = fs.readFileSync(fpOut, 'utf8')
        // console.log('c', c)
        ms.push({ content: c })

        fsDeleteFolder(fdt) //最終階段清除任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    let ms = [
        { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' },
        { content: 'abcdef中文測 試&*#$%' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsMergeFiles error paths`, function() {

    //失敗路徑涉及stream事件與樹殺等待, 放寬逾時
    this.timeout(15000)

    let fdt = './_test_fsMergeFiles_err'

    //計數: 任何失敗路徑皆不得產生uncaughtException或unhandledRejection(寫入流之error若無監聽者即為uncaughtException, 於worker內即崩潰)
    let nUncaught = 0
    let nUnhandled = 0
    let onUncaught = () => {
        nUncaught += 1
    }
    let onUnhandled = () => {
        nUnhandled += 1
    }

    before(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
        fs.mkdirSync(fdt, { recursive: true })
        process.on('uncaughtException', onUncaught)
        process.on('unhandledRejection', onUnhandled)
    })

    after(function() {
        process.off('uncaughtException', onUncaught)
        process.off('unhandledRejection', onUnhandled)
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    //settle: 5秒內須settle, 否則視為懸置(hang)
    let settle = (pm) => Promise.race([
        pm
            .then((v) => ({ state: 'resolve', v }))
            .catch((e) => ({ state: 'reject', e })),
        new Promise((resolve) => setTimeout(() => resolve({ state: 'hang' }), 5000)),
    ])

    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    //mkProxy: 以fs代理攔截createWriteStream取得寫入流實例, 供斷言失敗後是否destroy(fd是否釋放)
    //failOnWriteIndex為第N次_write時模擬ENOSPC, 且以setImmediate非同步回呼仿真實fs(此時序會讓「read end即刪切片」之舊作法誤刪資料未寫成功之切片)
    //highWaterMark可縮小寫入流緩衝以逼出背壓(drain)路徑
    let mkProxy = (failOnWriteIndex = null, highWaterMark = undefined) => {
        let st = { ws: null, nWrite: 0 }
        let fsProxy = { ...fs }
        fsProxy.createWriteStream = (p) => {
            let ws = (highWaterMark === undefined) ? fs.createWriteStream(p) : fs.createWriteStream(p, { highWaterMark })
            st.ws = ws
            let _write = ws._write.bind(ws)
            ws._write = (chunk, enc, cb) => {
                st.nWrite += 1
                if (failOnWriteIndex !== null && st.nWrite === failOnWriteIndex) {
                    return setImmediate(() => {
                        let e = new Error('ENOSPC: no space left on device, write')
                        e.code = 'ENOSPC'
                        cb(e)
                    })
                }
                return _write(chunk, enc, cb)
            }
            return ws
        }
        return { fsProxy, st }
    }

    it(`should reject (not hang) without uncaughtException when output path is a directory, and keep the slice`, async function() {
        fs.writeFileSync(`${fdt}/b_0`, 'AAA')
        fs.mkdirSync(`${fdt}/b.out`)
        let before = nUncaught
        let r = await settle(fsMergeFiles([`${fdt}/b_0`], `${fdt}/b.out`))
        await delay(200)
        // console.log('dir r', r)
        assert.strict.deepStrictEqual(r.state, 'reject')
        assert.strict.deepStrictEqual(typeof r.e, 'string')
        assert.strict.deepStrictEqual(r.e.includes('EISDIR'), true)
        assert.strict.deepStrictEqual(nUncaught - before, 0)
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/b_0`), true) //失敗時不得誤刪切片
    })

    it(`should reject when a slice is missing and destroy the write stream (release fd)`, async function() {
        let { fsProxy, st } = mkProxy()
        fs.writeFileSync(`${fdt}/c_0`, 'AAA')
        let r = await settle(fsMergeFilesCore([`${fdt}/c_0`, `${fdt}/c_1`], `${fdt}/c.out`, { fs: fsProxy }))
        await delay(300) //等open完成
        // console.log('missing r', r, st.ws.destroyed, st.ws.fd)
        assert.strict.deepStrictEqual(r.state, 'reject')
        assert.strict.deepStrictEqual(r.e.includes('is not a file'), true)
        //throw路徑之寫入流已成功開檔, 若未destroy則fd殘留
        assert.strict.deepStrictEqual(st.ws.destroyed, true)
        assert.strict.deepStrictEqual(st.ws.fd, null)
    })

    it(`should reject (not hang) when output file is read-only`, async function() {
        //root不受檔案權限位元限制, 此案於root下無法成立
        if (typeof process.getuid === 'function' && process.getuid() === 0) {
            this.skip()
        }
        fs.writeFileSync(`${fdt}/d_0`, 'AAA')
        fs.writeFileSync(`${fdt}/d.out`, 'OLD')
        fs.chmodSync(`${fdt}/d.out`, 0o444)
        let before = nUncaught
        let r = await settle(fsMergeFiles([`${fdt}/d_0`], `${fdt}/d.out`))
        await delay(200)
        fs.chmodSync(`${fdt}/d.out`, 0o666)
        // console.log('readonly r', r)
        assert.strict.deepStrictEqual(r.state, 'reject')
        assert.strict.deepStrictEqual(/EPERM|EACCES/.test(r.e), true)
        assert.strict.deepStrictEqual(nUncaught - before, 0)
        assert.strict.deepStrictEqual(fs.readFileSync(`${fdt}/d.out`, 'utf8'), 'OLD')
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/d_0`), true)
    })

    it(`should reject (not hang) when write fails mid-stream (ENOSPC on 2nd slice), destroy write stream, keep unmerged slices`, async function() {
        let { fsProxy, st } = mkProxy(2)
        fs.writeFileSync(`${fdt}/e_0`, 'AAA')
        fs.writeFileSync(`${fdt}/e_1`, 'BBB')
        fs.writeFileSync(`${fdt}/e_2`, 'CCC')
        let before = nUncaught
        let r = await settle(fsMergeFilesCore([`${fdt}/e_0`, `${fdt}/e_1`, `${fdt}/e_2`], `${fdt}/e.out`, { fs: fsProxy }))
        await delay(300)
        // console.log('enospc r', r, st.ws.destroyed)
        assert.strict.deepStrictEqual(r.state, 'reject')
        assert.strict.deepStrictEqual(r.e.includes('ENOSPC'), true)
        assert.strict.deepStrictEqual(nUncaught - before, 0)
        assert.strict.deepStrictEqual(st.ws.destroyed, true)
        //已合併之切片刪除, 出錯與其後之切片保留
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/e_0`), false)
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/e_1`), true)
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/e_2`), true)
    })

    it(`should merge large slices correctly under backpressure (small highWaterMark forces drain waits)`, async function() {
        let { fsProxy, st } = mkProxy(null, 1024)
        let a = 'A'.repeat(300 * 1024)
        let b = '中'.repeat(100 * 1024)
        let c = 'C'.repeat(300 * 1024)
        fs.writeFileSync(`${fdt}/g_0`, a)
        fs.writeFileSync(`${fdt}/g_1`, b)
        fs.writeFileSync(`${fdt}/g_2`, c)
        let r = await settle(fsMergeFilesCore([`${fdt}/g_0`, `${fdt}/g_1`, `${fdt}/g_2`], `${fdt}/g.out`, { fs: fsProxy }))
        await delay(200)
        assert.strict.deepStrictEqual(r.state, 'resolve')
        assert.strict.deepStrictEqual(st.nWrite > 3, true) //確有多次_write(多chunk), 背壓路徑被走到
        assert.strict.deepStrictEqual(fs.readFileSync(`${fdt}/g.out`, 'utf8'), a + b + c)
        assert.strict.deepStrictEqual([0, 1, 2].map((i) => fs.existsSync(`${fdt}/g_${i}`)), [false, false, false])
        assert.strict.deepStrictEqual(st.ws.destroyed, true)
    })

    it(`should reject (not hang) when write fails while waiting for drain under backpressure, keeping the failing slice`, async function() {
        //highWaterMark 1024 + 64KB chunk → 每次write皆回傳false而等drain; 第7次_write(落在第2片)失敗, 驗證drain競速不懸置
        let { fsProxy, st } = mkProxy(7, 1024)
        let a = 'A'.repeat(300 * 1024)
        let b = 'B'.repeat(300 * 1024)
        let c = 'C'.repeat(300 * 1024)
        fs.writeFileSync(`${fdt}/h_0`, a)
        fs.writeFileSync(`${fdt}/h_1`, b)
        fs.writeFileSync(`${fdt}/h_2`, c)
        let before = nUncaught
        let r = await settle(fsMergeFilesCore([`${fdt}/h_0`, `${fdt}/h_1`, `${fdt}/h_2`], `${fdt}/h.out`, { fs: fsProxy }))
        await delay(300)
        // console.log('drain-fail r', r, st.nWrite)
        assert.strict.deepStrictEqual(r.state, 'reject')
        assert.strict.deepStrictEqual(r.e.includes('ENOSPC'), true)
        assert.strict.deepStrictEqual(nUncaught - before, 0)
        assert.strict.deepStrictEqual(st.ws.destroyed, true)
        assert.strict.deepStrictEqual([0, 1, 2].map((i) => fs.existsSync(`${fdt}/h_${i}`)), [false, true, true])
    })

    it(`should still resolve on a normal merge through the same code path (regression)`, async function() {
        let { fsProxy, st } = mkProxy()
        fs.writeFileSync(`${fdt}/f_0`, 'AAA')
        fs.writeFileSync(`${fdt}/f_1`, 'BBB')
        let r = await settle(fsMergeFilesCore([`${fdt}/f_0`, `${fdt}/f_1`], `${fdt}/f.out`, { fs: fsProxy, fnOut: 'f.out' }))
        await delay(200)
        assert.strict.deepStrictEqual(r.state, 'resolve')
        assert.strict.deepStrictEqual(r.v, { filename: 'f.out', path: `${fdt}/f.out` })
        assert.strict.deepStrictEqual(fs.readFileSync(`${fdt}/f.out`, 'utf8'), 'AAABBB')
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/f_0`), false)
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/f_1`), false)
        assert.strict.deepStrictEqual(st.ws.destroyed, true) //正常結束亦關閉
    })

    it(`should not produce any uncaughtException or unhandledRejection across all error paths`, async function() {
        await delay(300)
        assert.strict.deepStrictEqual([nUncaught, nUnhandled], [0, 0])
    })

})


describe(`fsMergeFilesCore 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //settle逾時判定, 放寬逾時
    this.timeout(15000)

    //reject值規則: 取拋出值之message; message為undefined者轉字串(_errToStr: 先String(err), 拋錯則讀字串message, 再無則'unknown error')
    //  故Error只得message('boom', 不是err.toString()之'Error: boom'), 帶字串message之一般物件得其message(不是'[object Object]'), 與其餘站點之_errToStr結果不同, 不共用thrownCases
    //修正前catch內以get(err, 'message', String(err))求值, 預設值引數先求String(err): 無原型物件、已撤銷之Proxy使其拋TypeError, async函數改以該TypeError reject, 且跳過其後寫入流之destroy
    //same為true者修正前後結果相同(守門: 防止機械替換成err.toString()或errToStr(err), 或不防null、undefined之直接讀message); sameL為寫入流error監聽之注入點(注入點3)之同義旗標
    let mergeCases = [
        { name: 'an Error', mk: () => new Error('boom'), msg: 'boom', same: true, sameL: true },
        { name: 'a plain object with a string message', mk: () => ({ message: 'plain-msg' }), msg: 'plain-msg', same: true, sameL: true },
        { name: 'null', mk: () => null, msg: 'null', same: true, sameL: false },
        { name: 'undefined', mk: () => undefined, msg: 'undefined', same: true, sameL: false },
        { name: 'an object without prototype', mk: () => Object.create(null), msg: 'unknown error', same: false, sameL: false },
        { name: 'a revoked Proxy', mk: () => revoked(), msg: 'unknown error', same: false, sameL: false },
        { name: 'an object without prototype but with a string message', mk: () => Object.assign(Object.create(null), { message: 'np-msg' }), msg: 'np-msg', same: false, sameL: false },
    ]

    //fs替身(不觸及實體檔案): 輸出資料夾視為已存在(statSync、lstatSync), 寫入流(createWriteStream)與切片檢查(lstatSync)由各案注入
    let fpIn = 'fake/in.bin'
    let fpOut = 'fake/out.bin'
    let statFolder = { isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false }
    let mkFs = ({ createWriteStream, lstatSync = () => statFolder }) => ({
        statSync: () => ({}),
        lstatSync,
        createWriteStream,
    })

    //settleShown(test/tools/caseKit.mjs): 5秒內須settle, 結果值經showValue(非字串帶型別前綴, 已撤銷之Proxy等不進入assert之實際值)

    //注入點1: fs.createWriteStream拋出(寫入流尚未建立)
    for (let c of mergeCases) {
        it(`${c.same ? '(守門) ' : ''}should reject with '${c.msg}' when fs.createWriteStream throws ${c.name} [R-CODEC-ERR-01之2]`, async function() {
            let fsFake = mkFs({ createWriteStream: thrower(c.mk()) })
            let r = await settleShown(fsMergeFilesCore([fpIn], fpOut, { fs: fsFake }))
            assert.strict.deepStrictEqual(r, { s: 'reject', v: c.msg })
        })
    }

    //注入點2: 寫入流已建立後, 切片檢查(fsIsFileCore內fs.lstatSync)拋出: reject同上, 且寫入流須destroy(釋放fd)
    for (let c of mergeCases) {
        it(`${c.same ? '(守門) ' : ''}should reject with '${c.msg}' and destroy the write stream when fs.lstatSync throws ${c.name} for the slice after the write stream was created [R-CODEC-ERR-01之2]`, async function() {
            let ws = new Writable({
                write(chunk, enc, cb) {
                    cb()
                },
            })
            let thrown = thrower(c.mk())
            let fsFake = mkFs({
                createWriteStream: () => ws,
                lstatSync: (p) => {
                    if (p === fpIn) {
                        thrown()
                    }
                    return statFolder
                },
            })
            let r = await settleShown(fsMergeFilesCore([fpIn], fpOut, { fs: fsFake }))
            assert.strict.deepStrictEqual(r, { s: 'reject', v: c.msg })
            assert.strict.deepStrictEqual(ws.destroyed, true)
        })
    }

    //注入點3: 寫入流建立後(監聽器已掛上)以值v發出'error'(注入之fs所產寫入流可以非Error之值出錯), 早於切片之寫入完成
    //  監聽器內不得拋錯(修正前讀err.message: null、undefined、已撤銷之Proxy即拋TypeError成未捕捉例外, pm不reject), 不得以null判定寫入流未出錯(修正前errWrite為null時續寫並刪除切片、以成功resolve)
    //  reject同上, 切片不得被刪除, 寫入流須destroy
    let statFile = { isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false }
    for (let c of mergeCases) {
        it(`${c.sameL ? '(守門) ' : ''}should reject with '${c.msg}' without deleting the slice when the write stream emits an 'error' event whose value is ${c.name} [R-CODEC-ERR-01之2]`, async function() {
            let ws = new Writable({
                write(chunk, enc, cb) {
                    cb()
                },
            })
            let v = c.mk()
            let fsFake = mkFs({
                createWriteStream: () => {
                    process.nextTick(() => ws.emit('error', v))
                    return ws
                },
                lstatSync: (p) => (p === fpIn ? statFile : statFolder),
            })
            fsFake.createReadStream = () => Readable.from([Buffer.from('abc')])
            let unlinked = []
            fsFake.unlinkSync = (p) => {
                unlinked.push(p)
            }
            let r = await settleShown(fsMergeFilesCore([fpIn], fpOut, { fs: fsFake }))
            assert.strict.deepStrictEqual({ r, unlinked, destroyed: ws.destroyed }, { r: { s: 'reject', v: c.msg }, unlinked: [], destroyed: true })
        })
    }

})
