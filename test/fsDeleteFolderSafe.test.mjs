import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolderSafe from '../src/fsDeleteFolderSafe.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsDeleteFolderSafe`, function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsDeleteFolderSafe'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let rfl = fsCreateFile(`${fdt}/abc/abc.txt`, 'abc', { encoding: 'utf8' })
        // console.log('rfl', rfl)
        ms.push({ 'fsCreateFile(before)': rfl })

        let rfd = fsCreateFolder(`${fdt}/def/mno`)
        // console.log('rfd', rfd)
        ms.push({ 'fsCreateFolder(before)': rfd })

        let b1 = fsIsFile(`${fdt}/abc/abc.txt`)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        let b2 = fsIsFolder(`${fdt}/def/mno`)
        // console.log('fsIsFolder(before)', b2)
        ms.push({ 'fsIsFolder(before)': b2 })

        await fsDeleteFolderSafe(fdt)

        let b3 = fsIsFile(`${fdt}/abc/abc.txt`)
        // console.log('fsIsFile(after)', b3)
        ms.push({ 'fsIsFile(after)': b3 })

        let b4 = fsIsFolder(`${fdt}/def/mno`)
        // console.log('fsIsFolder(after)', b4)
        ms.push({ 'fsIsFolder(after)': b4 })

        // console.log('ms', ms)
        return ms
    }
    // test()
    // rfl { success: 'done: ./_test_fsDeleteFolderSafe/abc/abc.txt' }
    // rfd { success: 'done: ./_test_fsDeleteFolderSafe/def/mno' }
    // fsIsFile(before) true
    // fsIsFolder(before) true
    // fsIsFile(after) false
    // fsIsFolder(after) false
    let ms = [
        {
            'fsCreateFile(before)': { success: 'done: ./_test_fsDeleteFolderSafe/abc/abc.txt' }
        },
        {
            'fsCreateFolder(before)': { success: 'done: ./_test_fsDeleteFolderSafe/def/mno' }
        },
        { 'fsIsFile(before)': true },
        { 'fsIsFolder(before)': true },
        { 'fsIsFile(after)': false },
        { 'fsIsFolder(after)': false }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsDeleteFolderSafe 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsFailRunner.mjs之DD*), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除, 所起之子程序殺樹並回驗
    //結果值經執行器之dv描述: { s: 'resolve'|'reject'|'syncThrow'|'pending', k: 值之類別('string'、'Error'等), v }, 故可分辨以字串或以Error物件reject
    //Windows專屬之真實觸發(他程序cwd所在之資料夾)於他平台skip
    //ev(r)、ev0: 子行程之未處理rejection與未捕捉例外及其期望(皆空)
    this.timeout(60000)

    it(`DD01 (守門) should resolve 'folder does not exist: <path>' when the path does not exist`, function() {
        let { r } = runFsFail('DD01')
        //R-FS-REJECT-01 規則4b: 標的不存在仍視為成功(既有設計)
        //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException(以下各案同)
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'folder does not exist: ' + r.out.p }, ...ev0 })
    })

    it(`DD02 (守門) should reject the description string when the path is a file`, function() {
        let { r } = runFsFail('DD02')
        //R-FS-REJECT-01 規則1: 前置檢查為說明字串
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'input path is not a folder: ' + r.out.p }, ...ev0 })
    })

    it(`DD03 should reject a string of the EPERM error and keep the folder when the folder is the cwd of another process`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runFsFail('DD03')
        let res = r.out.res
        //R-FS-REJECT-01 規則1: 捕捉之Error經_errToStr得String(err)即'名稱: 訊息'(rmSync之EPERM非EBUSY, 不重試即reject)
        //R-FS-REJECT-01 規則4: 不得偽成功(資料夾仍在)
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, eperm: /^Error: EPERM/.test(res.v), exists: r.out.exists, ...ev(r) }, { s: 'reject', k: 'string', eperm: true, exists: true, ...ev0 })
    })

    it(`DD04 should reject String(err) when the injected fs.rmSync throws a real SystemError`, function() {
        let { r } = runFsFail('DD04')
        //R-FS-REJECT-01 規則1: 拒絕值一律為字串, Error得String(err)即'名稱: 訊息'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: r.out.expect }, ...ev0 })
    })

    it(`DD05 should reject 'null' when the injected fs.rmSync throws null`, function() {
        let { r } = runFsFail('DD05')
        //R-FS-REJECT-01 規則8: catch內讀錯誤值之屬性(err.code)須可承受null; 規則1: 捕捉之null經_errToStr得'null'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'null' }, ...ev0 })
    })

    it(`DD06 should reject the last error string after numRetry attempts and keep the folder when the injected fs.rmSync always throws EBUSY`, function() {
        let { r } = runFsFail('DD06')
        //R-FS-REJECT-01 規則4b: 重試耗盡而標的仍在時reject字串(含最後一次之錯誤, 第2次之'busy 2'), 不得resolve 'done: …'
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: busy 2' }, calls: 2, exists: true, ...ev0 })
    })

    it(`DD07 should reject a string (not an Error, not a sync throw) when opt.fs.lstatSync throws in the pre-check`, function() {
        let { r } = runFsFail('DD07')
        //R-FS-REJECT-01 規則2: 前置檢查(呼叫端opt.fs經{ fs, ...opt }覆蓋內建fs後之lstatSync拋錯)一律在try內, 依規則1轉字串
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: lstat boom' }, ...ev0 })
    })

    it(`DD08 should reject 'unknown error' when the injected fs.rmSync throws a revoked Proxy`, function() {
        let { r } = runFsFail('DD08')
        //R-FS-REJECT-01 規則8: catch內讀err.code須可承受任意值(已撤銷之Proxy讀屬性即拋錯); 規則1與R-CODEC-ERR-01 規則3: _errToStr無法轉字串且無字串message者為'unknown error'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'unknown error' }, ...ev0 })
    })

    //DD09~DD11(外審 opus F18、F19): numRetry=3, 注入之rmSync依序動作, 斷言結果與呼叫次數(以錯誤值為哨兵之錯誤實作、非EBUSY仍重試之錯誤實作皆測得出)
    it(`DD09 should resolve 'done: <path>' after 2 calls when the injected fs.rmSync throws EBUSY once and then succeeds`, function() {
        let { r } = runFsFail('DD09')
        //R-FS-REJECT-01 規則4b: 最後一次嘗試仍為可重試之錯誤(EBUSY)時才reject; 重試中轉成功即resolve成功訊息(R-FS-RESULT-01 規則5: 不以錯誤值為哨兵, 先前之EBUSY不得使其reject)
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'done: ' + r.out.p }, calls: 2, exists: false, ...ev0 })
    })

    it(`DD10 should reject the EPERM error string after 2 calls (no further retry) and keep the folder when the injected fs.rmSync throws EBUSY and then EPERM`, function() {
        let { r } = runFsFail('DD10')
        //R-FS-REJECT-01 規則4b: 非EBUSY之錯誤立即reject(不再重試, numRetry=3而只呼叫2次), 拒絕值為該錯誤之字串(規則1); 標的仍在
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: perm 2' }, calls: 2, exists: true, ...ev0 })
    })

    it(`DD11 (守門) should resolve 'done: <path>' when the folder vanishes during the retry (EBUSY, then the real rmSync with force)`, function() {
        let { r } = runFsFail('DD11')
        //R-FS-REJECT-01 規則4b: 標的不存在仍視為成功(既有設計); 重試期間標的消失時rmSync之force吞ENOENT而成功(外審 opus F18: 檔案版與此一致)
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'done: ' + r.out.p }, calls: 2, exists: false, ...ev0 })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-REJECT-01 規則2)
    itOptUnreadable('fsDeleteFolderSafe', 'reject')
    itOptUnreadable('fsDeleteFolderSafeCore', 'reject')

})
