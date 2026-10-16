import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFileSafe from '../src/fsDeleteFileSafe.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsDeleteFileSafe`, function() {

    let test = async() => {

        let ms = []

        let fdt = './_test_fsDeleteFileSafe'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 'abc.txt'
        let fp = `${fdt}/${fn}`

        fsCreateFile(fp, 'abc', 'utf8')

        let b1 = fsIsFile(fp)
        // console.log('fsDeleteFileSafe(before)', b1)
        ms.push({ 'fsDeleteFileSafe(before)': b1 })

        await fsDeleteFileSafe(fp)

        let b2 = fsIsFile(fp)
        // console.log('fsDeleteFileSafe(after)', b2)
        ms.push({ 'fsDeleteFileSafe(after)': b2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsDeleteFileSafe(before) true
    // fsDeleteFileSafe(after) false
    let ms = [{ 'fsDeleteFileSafe(before)': true }, { 'fsDeleteFileSafe(after)': false }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsDeleteFileSafe 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsFailRunner.mjs之DF*), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除, 所起之子程序殺樹並回驗
    //結果值經執行器之dv描述: { s: 'resolve'|'reject'|'syncThrow'|'pending', k: 值之類別('string'、'Error'等), v }, 故可分辨以字串或以Error物件reject
    //Windows專屬之真實觸發(他程序持有檔案之EBUSY)於他平台skip
    //ev(r)、ev0: 子行程之未處理rejection與未捕捉例外及其期望(皆空)
    this.timeout(60000)

    it(`DF01 (守門) should resolve 'file does not exist: <path>' when the path does not exist`, function() {
        let { r } = runFsFail('DF01')
        //R-FS-REJECT-01 規則4b: 標的不存在仍視為成功(既有設計)
        //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException(以下各案同)
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'file does not exist: ' + r.out.p }, ...ev0 })
    })

    it(`DF02 (守門) should reject the description string when the path is a folder`, function() {
        let { r } = runFsFail('DF02')
        //R-FS-REJECT-01 規則1: 前置檢查為說明字串
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'input path is not a file: ' + r.out.p }, ...ev0 })
    })

    it(`DF03 should reject a string of the last EBUSY error and keep the file when retries are exhausted (file held by another process)`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runFsFail('DF03')
        let res = r.out.res
        //R-FS-REJECT-01 規則4b: 重試耗盡(EBUSY)而標的仍在時reject字串(含最後一次之錯誤), 不得resolve 'done: …'
        //R-FS-REJECT-01 規則1: 捕捉之Error經_errToStr得String(err)即'名稱: 訊息'
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, ebusy: /^Error: EBUSY: /.test(res.v), exists: r.out.exists, ...ev(r) }, { s: 'reject', k: 'string', ebusy: true, exists: true, ...ev0 })
    })

    it(`DF04 should reject String(err) when the injected fs.unlinkSync throws a real SystemError`, function() {
        let { r } = runFsFail('DF04')
        //R-FS-REJECT-01 規則1: 拒絕值一律為字串, Error得String(err)即'名稱: 訊息'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: r.out.expect }, ...ev0 })
    })

    it(`DF05 should reject 'null' when the injected fs.unlinkSync throws null`, function() {
        let { r } = runFsFail('DF05')
        //R-FS-REJECT-01 規則8: catch內讀錯誤值之屬性(err.code)須可承受null; 規則1: 捕捉之null經_errToStr得'null'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'null' }, ...ev0 })
    })

    it(`DF06 (守門) should reject the thrown string as is when the injected fs.unlinkSync throws a string`, function() {
        let { r } = runFsFail('DF06')
        //R-FS-REJECT-01 規則1: 拒絕值一律為字串(字串之_errToStr為其本身)
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'str' }, ...ev0 })
    })

    it(`DF07 should reject the last error string after numRetry attempts and keep the file when the injected fs.unlinkSync always throws EBUSY`, function() {
        let { r } = runFsFail('DF07')
        //R-FS-REJECT-01 規則4b: 重試耗盡而標的仍在時reject字串(含最後一次之錯誤, 第2次之'busy 2'), 不得resolve 'done: …'
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: busy 2' }, calls: 2, exists: true, ...ev0 })
    })

    it(`DF08 should reject a string (not an Error, not a sync throw) when opt.fs.lstatSync throws in the pre-check`, function() {
        let { r } = runFsFail('DF08')
        //R-FS-REJECT-01 規則2: 前置檢查(呼叫端opt.fs經{ fs, ...opt }覆蓋內建fs後之lstatSync拋錯)一律在try內, 依規則1轉字串
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: lstat boom' }, ...ev0 })
    })

    it(`DF09 should reject 'unknown error' when the injected fs.unlinkSync throws a revoked Proxy`, function() {
        let { r } = runFsFail('DF09')
        //R-FS-REJECT-01 規則8: catch內讀err.code須可承受任意值(已撤銷之Proxy讀屬性即拋錯); 規則1與R-CODEC-ERR-01 規則3: _errToStr無法轉字串且無字串message者為'unknown error'
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'unknown error' }, ...ev0 })
    })

    //DF10~DF12(外審 opus F18、F19): numRetry=3, 注入之unlinkSync依序動作, 斷言結果與呼叫次數(以錯誤值為哨兵之錯誤實作、非EBUSY仍重試之錯誤實作皆測得出)
    it(`DF10 should resolve 'done: <path>' after 2 calls when the injected fs.unlinkSync throws EBUSY once and then succeeds`, function() {
        let { r } = runFsFail('DF10')
        //R-FS-REJECT-01 規則4b: 最後一次嘗試仍為可重試之錯誤(EBUSY)時才reject; 重試中轉成功即resolve成功訊息(R-FS-RESULT-01 規則5: 不以錯誤值為哨兵, 先前之EBUSY不得使其reject)
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'done: ' + r.out.p }, calls: 2, exists: false, ...ev0 })
    })

    it(`DF11 should reject the EPERM error string after 2 calls (no further retry) and keep the file when the injected fs.unlinkSync throws EBUSY and then EPERM`, function() {
        let { r } = runFsFail('DF11')
        //R-FS-REJECT-01 規則4b: 非EBUSY之錯誤立即reject(不再重試, numRetry=3而只呼叫2次), 拒絕值為該錯誤之字串(規則1); 標的仍在
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'reject', k: 'string', v: 'Error: perm 2' }, calls: 2, exists: true, ...ev0 })
    })

    it(`DF12 should resolve 'file does not exist: <path>' when the file vanishes during the retry (EBUSY, then ENOENT)`, function() {
        let { r } = runFsFail('DF12')
        //R-FS-REJECT-01 規則4b: 標的不存在仍視為成功(既有設計); 增訂(外審 opus F18): 重試期間標的消失(ENOENT而標的已不存在)亦視為成功, 與fsDeleteFolderSafe一致, 訊息同前置檢查之標的不存在
        assert.strict.deepStrictEqual({ res: r.out.res, calls: r.out.calls, exists: r.out.exists, ...ev(r) }, { res: { s: 'resolve', k: 'string', v: 'file does not exist: ' + r.out.p }, calls: 2, exists: false, ...ev0 })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-REJECT-01 規則2)
    itOptUnreadable('fsDeleteFileSafe', 'reject')
    itOptUnreadable('fsDeleteFileSafeCore', 'reject')

})
