import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCleanFolder from '../src/fsCleanFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'


describe(`fsCleanFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsCleanFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        fsCreateFolder(`${fdt}/abc1`)
        fsCreateFolder(`${fdt}/def1/def2/def3`)
        fsCreateFile(`${fdt}/zzz.txt`, 'zzz', { encoding: 'utf8' })
        fsCreateFile(`${fdt}/def1/def2/def3/def3.txt`, 'def', { encoding: 'utf8' })

        let b1 = fsIsFile(`${fdt}/zzz.txt`)
        // console.log('fsIsFile1(before)', b1)
        ms.push({ 'fsIsFile1(before)': b1 })

        let b2 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
        // console.log('fsIsFile2(before)', b2)
        ms.push({ 'fsIsFile2(before)': b2 })

        let b3 = fsIsFolder(`${fdt}/abc1`)
        // console.log('fsIsFolder1(before)', b3)
        ms.push({ 'fsIsFolder1(before)': b3 })

        let b4 = fsIsFolder(`${fdt}/def1/def2/def3`)
        // console.log('fsIsFolder2(before)', b4)
        ms.push({ 'fsIsFolder2(before)': b4 })

        let r = fsCleanFolder(fdt)
        ms.push({ 'fsCleanFolder': r })

        let b5 = fsIsFile(`${fdt}/zzz.txt`)
        // console.log('fsIsFile1(after)', b5)
        ms.push({ 'fsIsFile1(after)': b5 })

        let b6 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
        // console.log('fsIsFile2(after)', b6)
        ms.push({ 'fsIsFile2(after)': b6 })

        let b7 = fsIsFolder(`${fdt}/abc1`)
        // console.log('fsIsFolder1(after)', b7)
        ms.push({ 'fsIsFolder1(after)': b7 })

        let b8 = fsIsFolder(`${fdt}/def1/def2/def3`)
        // console.log('fsIsFolder2(after)', b8)
        ms.push({ 'fsIsFolder2(after)': b8 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile1(before) true
    // fsIsFile2(before) true
    // fsIsFolder1(before) true
    // fsIsFolder2(before) true
    // fsIsFile1(after) false
    // fsIsFile2(after) false
    // fsIsFolder1(after) false
    // fsIsFolder2(after) false
    let ms = [
        { 'fsIsFile1(before)': true },
        { 'fsIsFile2(before)': true },
        { 'fsIsFolder1(before)': true },
        { 'fsIsFolder2(before)': true },
        { fsCleanFolder: { success: 'done: ./_test_fsCleanFolder' } },
        { 'fsIsFile1(after)': false },
        { 'fsIsFile2(after)': false },
        { 'fsIsFolder1(after)': false },
        { 'fsIsFolder2(after)': false }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsCleanFolder 結果物件(R-FS-RESULT-01)`, function() {

    let fdTmp = path.resolve('./test/_tmp/fsCleanFolder') //夾具, 測完即刪(只刪本夾具, 不刪上層test/_tmp)

    before(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true }) //先清除前次中斷可能殘留者
        fs.mkdirSync(fdTmp, { recursive: true })
    })

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
    })

    //mkd, 於夾具下建立子資料夾並回傳其絕對路徑
    let mkd = (name) => {
        let fd = path.join(fdTmp, name)
        fs.mkdirSync(fd, { recursive: true })
        return fd
    }

    //shape, 回傳值之形狀: 失敗須為帶error鍵之物件, 不得是裸Error, 不得帶success鍵
    let shape = (r) => {
        let isObj = r !== null && typeof r === 'object' && !(r instanceof Error)
        let has = (k) => {
            return isObj && Object.prototype.hasOwnProperty.call(r, k)
        }
        return { isObj, hasError: has('error'), errorTruthy: isObj && !!r.error, hasSuccess: has('success') }
    }

    let failInputs = [
        {
            name: 'a path whose parent is a file',
            mk: () => {
                let fp = path.join(mkd('parent-is-file'), 'afile')
                fs.writeFileSync(fp, 'x')
                return path.join(fp, 'sub')
            },
        },
        { name: 'undefined', mk: () => undefined },
        { name: 'an empty string', mk: () => '' },
    ]

    for (let c of failInputs) {
        it(`should return an object with the error key (not a bare Error, without the success key) when the input is ${c.name} [R-FS-RESULT-01]`, function() {
            let r = fsCleanFolder(c.mk())
            assert.strict.deepStrictEqual(shape(r), { isObj: true, hasError: true, errorTruthy: true, hasSuccess: false })
        })
    }

    it(`should return { error: 'input path is not a folder' } and keep the file when the target is a regular file [R-FS-RESULT-01]`, function() {
        let fp = path.join(mkd('target-is-file'), 'afile')
        fs.writeFileSync(fp, 'x')
        let r = fsCleanFolder(fp)
        assert.strict.deepStrictEqual(r, { error: 'input path is not a folder' })
        assert.strict.deepStrictEqual(fs.readFileSync(fp, 'utf8'), 'x')
    })

    it(`should empty the folder and return { success } when it holds a dangling junction and regular files [R-FS-RESULT-01]`, function() {
        let fdBase = mkd('dangling-junction')
        let fdGone = path.join(fdBase, 'gone') //junction之目標, 建立後即刪成懸空
        let fdD = path.join(fdBase, 'd')
        let fpLink = path.join(fdD, 'dangling')
        fs.mkdirSync(fdGone)
        fs.mkdirSync(fdD)
        fs.writeFileSync(path.join(fdD, 'a.txt'), 'a') //排序在懸空連結前後各置一般檔, 確保不論走訪順序皆有項目排在懸空連結之後
        fs.symlinkSync(fdGone, fpLink, 'junction')
        fs.writeFileSync(path.join(fdD, 'z.txt'), 'z')
        fs.rmSync(fdGone, { recursive: true, force: true })
        //前置條件: 連結本身仍在, 但目標已不存在
        assert.strict.deepStrictEqual([fs.lstatSync(fpLink).isSymbolicLink(), fs.existsSync(fpLink)], [true, false])
        let r = fsCleanFolder(fdD)
        assert.strict.deepStrictEqual(r, { success: 'done: ' + fdD })
        assert.strict.deepStrictEqual(fs.readdirSync(fdD), [])
    })

    it(`should empty the folder without touching the content of the outside folder that a junction inside points to [R-FS-RESULT-01]`, function() {
        let fdBase = mkd('junction-to-outside')
        let fdOut = path.join(fdBase, 'outside') //被清空資料夾之外的資料夾, 內有檔
        let fdD = path.join(fdBase, 'd')
        fs.mkdirSync(path.join(fdOut, 'sub'), { recursive: true })
        fs.writeFileSync(path.join(fdOut, 'keep.txt'), 'keep')
        fs.writeFileSync(path.join(fdOut, 'sub', 'deep.txt'), 'deep')
        fs.mkdirSync(fdD)
        fs.writeFileSync(path.join(fdD, 'b.txt'), 'b')
        fs.symlinkSync(fdOut, path.join(fdD, 'jn'), 'junction')
        let r = fsCleanFolder(fdD)
        assert.strict.deepStrictEqual(r, { success: 'done: ' + fdD })
        assert.strict.deepStrictEqual(fs.readdirSync(fdD), [])
        assert.strict.deepStrictEqual(fs.readdirSync(fdOut).sort(), ['keep.txt', 'sub'])
        assert.strict.deepStrictEqual(fs.readFileSync(path.join(fdOut, 'keep.txt'), 'utf8'), 'keep')
        assert.strict.deepStrictEqual(fs.readFileSync(path.join(fdOut, 'sub', 'deep.txt'), 'utf8'), 'deep')
    })

    it(`should return { error: 'input path is not a folder' } and keep the pointed folder when the target itself is a junction [R-FS-RESULT-01]`, function() {
        //設計事實: 目標本身為連結(junction)時不經連結清空他處, 一律視為非資料夾
        let fdBase = mkd('target-is-junction')
        let fdReal = path.join(fdBase, 'real')
        let fdLnk = path.join(fdBase, 'lnk')
        fs.mkdirSync(fdReal)
        fs.writeFileSync(path.join(fdReal, 'x.txt'), 'x')
        fs.symlinkSync(fdReal, fdLnk, 'junction')
        let r = fsCleanFolder(fdLnk)
        assert.strict.deepStrictEqual(r, { error: 'input path is not a folder' })
        assert.strict.deepStrictEqual(fs.readdirSync(fdReal), ['x.txt'])
        assert.strict.deepStrictEqual(fs.lstatSync(fdLnk).isSymbolicLink(), true)
    })

    it(`should return { error } whose message keeps the original full path without the extended-length prefix when a file in the folder is running on win32 [R-FS-RESULT-01]`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        this.timeout(60000)

        //守門: 修正前之unlinkSync訊息亦正確, 本案防止逐項刪除改用rmSync之退化(Windows下rmSync之訊息帶\\?\前綴且非ASCII路徑成亂碼)
        let fdD = mkd('running-exe')
        let fpExe = path.join(fdD, 'm-running.exe')
        fs.copyFileSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'PING.EXE'), fpExe)
        let child = spawn(fpExe, ['-n', '30', '127.0.0.1'], { stdio: 'ignore', windowsHide: true })
        child.on('error', () => {
            //spawn失敗由下方pmStart判定; 此處僅確保error事件不成為未捕捉例外
        })
        let pmStart = new Promise((resolve, reject) => {
            child.once('spawn', resolve)
            child.once('error', reject)
        })
        let pmExit = new Promise((resolve) => {
            child.once('exit', resolve)
            child.once('error', resolve)
        })
        let r = null
        try {
            await pmStart
            await new Promise((resolve) => setTimeout(resolve, 500)) //待其啟動並載入映像
            assert.strict.deepStrictEqual(child.exitCode, null, 'ping 應仍在執行')
            r = fsCleanFolder(fdD)
        }
        finally {
            child.kill()
            await pmExit //行程結束後才可清夾具
        }
        let msg = String((r.error && r.error.message) || r.error)
        assert.strict.deepStrictEqual(Object.keys(r), ['error'])
        assert.strict.deepStrictEqual(msg.includes(fpExe), true, `message 應含完整原始路徑 ${fpExe}, got ${msg}`)
        assert.strict.deepStrictEqual(msg.includes('\\\\?\\'), false, `message 不應含 \\\\?\\ 前綴, got ${msg}`)
        assert.strict.deepStrictEqual(fs.existsSync(fpExe), true)
    })

})
