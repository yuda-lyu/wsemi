import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolderSafe from '../src/fsDeleteFolderSafe.mjs'
import fsDeleteFolderSafeCore from '../src/fsDeleteFolderSafeCore.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'
import { thrower, revoked } from './tools/codecThrown.mjs'
import { fmt, mkRec, mkFake, runFake, fiveOnTrace } from './tools/delTraceKit.mjs'


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
        let { r } = runFsFail('DD03') //執行器於子行程已啟動並輸出就緒標記(其cwd把手於行程啟動時即持有)後才呼叫被測函數(不以固定毫秒猜子行程何時成為該資料夾之cwd; 見fsFailRunner.mjs之spawnHold)
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


describe(`fsDeleteFolderSafe 觀察回調(R-TRACE-01)`, function() {

    //以注入之假fs(test/tools/delTraceKit.mjs之mkFake, 不觸及實體資料夾)驗證opt.onTrace之事件語意; 重試間隔(300ms)本身即規格, 於假時鐘下以事件之虛擬時刻斷言(P5), 其餘斷言事件序列與結果(P1、P2)
    //未傳回調時行為不變、回調之拋錯與回傳rejection不影響刪除、不產生未處理之rejection(P3、P4)
    //事件簡式見delTraceKit.mjs之fmt: attempt1、retry1/EBUSY/300(n/code/ms)、done3、skip:not-exist/0(reason/n)、giveup3/EBUSY(n/code)、fail1/EPERM(n/code), '@'之後為通知當下之虛擬時刻

    //go, 以假fs(rmSync依plan動作)呼叫Core並推進假時鐘ms毫秒; fakeOpt見mkFake(missing、wrongKind), opt覆寫傳給Core之設定(含onTrace)
    let go = async (plan, { fakeOpt = {}, opt = {}, ms = 0 } = {}) => {
        let { fs: fsFake, st } = mkFake('rmSync', plan, fakeOpt)
        let tr = mkRec()
        let r = await runFake(() => fsDeleteFolderSafeCore('x', { fs: fsFake, onTrace: tr.on, ...opt }), ms)
        return { r, tr, st }
    }

    it(`should notify attempt and retry at exact 300ms intervals and then done when the injected fs.rmSync throws EBUSY twice and then succeeds`, async function() {
        let { r, tr, st } = await go(['EBUSY', 'EBUSY'], { opt: { numRetry: 5 }, ms: 700 })
        //JSDoc onTrace: attempt為即將嘗試(n由1起算); retry為第n次遇EBUSY而即將等待ms毫秒(固定300); done為第n次成功而即將resolve; 重試間隔300ms本身即規格(假時鐘之虛擬時刻)
        assert.strict.deepStrictEqual(tr.lines(), ['attempt1@0', 'retry1/EBUSY/300@0', 'attempt2@300', 'retry2/EBUSY/300@300', 'attempt3@600', 'done3@600'])
        //JSDoc @returns: resolve回傳成功訊息; R-FS-REJECT-01 規則4b: 先前之EBUSY不得使其reject
        assert.strict.deepStrictEqual({ r, calls: st.calls }, { r: { s: 'resolve', v: 'done: x' }, calls: 3 })
    })

    it(`should notify giveup right after the last failed attempt, without waiting again, and reject the last EBUSY error string when retries are exhausted (numRetry 3)`, async function() {
        //wsemi-run09: 最後一次嘗試失敗後已無下一次嘗試, 不再等待300ms也不通知retry; 假時鐘只推進600ms(= 前兩次重試間隔)即須已reject(修前多等300ms而於900ms才reject, 推進600ms時尚未settle)
        let { r, tr, st } = await go(['EBUSY', 'EBUSY', 'EBUSY'], { opt: { numRetry: 3 }, ms: 600 })
        //JSDoc onTrace: retry為第n次遇EBUSY而即將等待ms毫秒(只在之後還有下一次嘗試時通知, n小於numRetry); giveup為重試耗盡而即將reject(含n為numRetry、code為EBUSY), 於最後一次嘗試失敗當下通知, 其後不再有事件
        assert.strict.deepStrictEqual(tr.lines(), ['attempt1@0', 'retry1/EBUSY/300@0', 'attempt2@300', 'retry2/EBUSY/300@300', 'attempt3@600', 'giveup3/EBUSY@600'])
        //JSDoc @returns: 重試耗盡仍被占用reject錯誤訊息字串(最後一次之錯誤); 不偽成功
        assert.strict.deepStrictEqual({ r, calls: st.calls, exists: st.exists }, { r: { s: 'reject', v: 'Error: EBUSY 3' }, calls: 3, exists: true })
    })

    it(`should reject a string and notify fail with n 0, instead of resolving as if the folder did not exist, when opt.fs is null or has no statSync`, async function() {
        //wsemi-run09: 修前fsExistsCore吞掉對null呼叫statSync之TypeError而視為標的不存在, 回傳'folder does not exist: x'(成功)卻沒有刪除任何東西
        //JSDoc opt.fs: null或缺少statSync時reject字串(R-FS-REJECT-01 規則1), 不視為標的不存在
        let { fs: full } = mkFake('rmSync', [])
        let cases = [
            ['null', null],
            ['undefined', undefined],
            ['string', 'fs'],
            ['number', 1],
            ['empty object', {}],
            ['no statSync', { lstatSync: full.lstatSync, rmSync: () => {} }],
            ['statSync not a function', { statSync: 'x', lstatSync: full.lstatSync, rmSync: () => {} }],
        ]
        for (let [name, fsBad] of cases) {
            let tr = mkRec()
            let r = await runFake(() => fsDeleteFolderSafeCore('x', { fs: fsBad, onTrace: tr.on }), 0)
            assert.strict.deepStrictEqual({ name, s: r.s, str: typeof r.v === 'string' && r.v.startsWith('opt.fs is invalid'), lines: tr.lines() }, { name, s: 'reject', str: true, lines: ['fail0/null@0'] })
        }
        //JSDoc opt.fs: 缺少lstatSync或rmSync時其呼叫之TypeError不被吞, 以字串reject(不成功、不通知opt.fs不合)
        for (let [name, fsPart] of [['no rmSync', { statSync: full.statSync, lstatSync: full.lstatSync }], ['no lstatSync', { statSync: full.statSync, rmSync: () => {} }]]) {
            let r = await runFake(() => fsDeleteFolderSafeCore('x', { fs: fsPart }), 0)
            assert.strict.deepStrictEqual({ name, s: r.s, str: typeof r.v === 'string' && !r.v.startsWith('opt.fs is invalid') }, { name, s: 'reject', str: true })
        }
    })

    it(`should notify fail with the error code and reject at once (no retry) when the attempt throws a non-retryable error`, async function() {
        //JSDoc onTrace: fail為第n次遇不可重試之錯誤而即將reject(含n、code為該錯誤之code字串, 無或非字串則null); 資料夾版不另判ENOENT(rmSync以force吞ENOENT), 注入之ENOENT亦不重試
        let cases = [
            ['EPERM', 'fail1/EPERM', 'Error: EPERM 1'],
            ['ENOENT', 'fail1/ENOENT', 'Error: ENOENT 1'],
            ['null', 'fail1/null', 'null'], //拋出null: 讀code須可承受(R-FS-REJECT-01 規則8)
            ['revoked', 'fail1/null', 'unknown error'], //拋出已撤銷之Proxy: 讀code即拋錯, 以null通知
            ['num', 'fail1/null', 'Error: num 1'], //code非字串: 以null通知
        ]
        for (let [step, line, msg] of cases) {
            let { r, tr, st } = await go([step, 'EBUSY'], { opt: { numRetry: 3 } })
            assert.strict.deepStrictEqual({ step, lines: tr.lines(), r, calls: st.calls }, { step, lines: ['attempt1@0', `${line}@0`], r: { s: 'reject', v: msg }, calls: 1 })
        }
    })

    it(`should notify skip not-exist or not-folder without any attempt when the pre-check ends the call`, async function() {
        //JSDoc onTrace: skip(n為0)為前置檢查即結束; reason為not-exist代表標的不存在而resolve, not-folder代表標的非資料夾而reject; 皆無attempt
        let a = await go([], { fakeOpt: { missing: true } })
        assert.strict.deepStrictEqual({ lines: a.tr.lines(), r: a.r, calls: a.st.calls }, { lines: ['skip:not-exist/0@0'], r: { s: 'resolve', v: 'folder does not exist: x' }, calls: 0 })
        let b = await go([], { fakeOpt: { wrongKind: true } })
        assert.strict.deepStrictEqual({ lines: b.tr.lines(), r: b.r, calls: b.st.calls }, { lines: ['skip:not-folder/0@0'], r: { s: 'reject', v: 'input path is not a folder: x' }, calls: 0 })
    })

    it(`should notify fail with n 0 and reject the string when the pre-check throws (opt.fs.lstatSync throws)`, async function() {
        //JSDoc onTrace: fail之n為0代表前置檢查拋錯; R-FS-REJECT-01 規則2: 前置檢查之拋錯在try內, 依規則1轉字串
        let tr = mkRec()
        let fsBoom = { statSync: () => ({}), lstatSync: thrower(Object.assign(new Error('lstat boom'), { code: 'EACCES' })) }
        let r = await runFake(() => fsDeleteFolderSafeCore('x', { fs: fsBoom, onTrace: tr.on }), 0)
        assert.strict.deepStrictEqual({ lines: tr.lines(), r }, { lines: ['fail0/EACCES@0'], r: { s: 'reject', v: 'Error: lstat boom' } })
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響刪除、不產生未處理之rejection; 含opt不可讀(fs之getter拋錯)與前置檢查拋錯之既有失敗路徑
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rec = mkRec()
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                let a = await go(['EBUSY'], { opt: { onTrace }, ms: 400 }) //重試後成功
                let b = await go(['EBUSY', 'EBUSY'], { opt: { onTrace, numRetry: 2 }, ms: 700 }) //重試耗盡
                let c = await go(['EPERM'], { opt: { onTrace } }) //不可重試之錯誤
                let d = await go([], { fakeOpt: { missing: true }, opt: { onTrace } }) //標的不存在
                let optBad = Object.defineProperty({ onTrace }, 'fs', { enumerable: true, get: thrower(new Error('getter boom')) })
                let e = await runFake(() => fsDeleteFolderSafeCore('x', optBad), 0) //opt不可讀
                let fsBoom = { statSync: () => ({}), lstatSync: thrower(new Error('lstat boom')) }
                let f = await runFake(() => fsDeleteFolderSafeCore('x', { fs: fsBoom, onTrace }), 0) //前置檢查拋錯
                got.push([a.r, a.st.calls, b.r, b.st.calls, c.r, c.st.calls, d.r, e, f])
            }
            await new Promise((resolve) => setImmediate(resolve))
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            process.off('unhandledRejection', onUn)
        }
        let one = [
            { s: 'resolve', v: 'done: x' }, 2,
            { s: 'reject', v: 'Error: EBUSY 2' }, 2,
            { s: 'reject', v: 'Error: EPERM 1' }, 1,
            { s: 'resolve', v: 'folder does not exist: x' },
            { s: 'reject', v: 'Error: getter boom' },
            { s: 'reject', v: 'Error: lstat boom' },
        ]
        assert.strict.deepStrictEqual(got, [one, one, one, one, one])
        assert.strict.deepStrictEqual(un, [])
        //紀錄器確有收到事件(含前置檢查拋錯之fail事件)
        assert.strict.deepStrictEqual(rec.events.length > 0, true)
        assert.strict.deepStrictEqual(rec.events.some((e) => fmt(e) === 'fail0/null'), true)
    })

    it(`should reject the string without notifying when the opt is unreadable before the callback is taken (fs getter throws, revoked Proxy)`, async function() {
        //R-FS-REJECT-01 規則2: opt本身或其屬性不可讀不得同步拋出、不得以非字串reject; JSDoc: 取回調置於numRetry與fs之讀取之後, 既有失敗路徑之結果不變且無事件
        let tr = mkRec()
        let optGetter = Object.defineProperty({ onTrace: tr.on }, 'fs', { enumerable: true, get: thrower(new Error('getter boom')) })
        let a = await runFake(() => fsDeleteFolderSafeCore('x', optGetter), 0)
        let b = await runFake(() => fsDeleteFolderSafeCore('x', revoked()), 0)
        assert.strict.deepStrictEqual({ a, b: { s: b.s, k: typeof b.v, typeError: /^TypeError: /.test(b.v) }, events: tr.events.length }, { a: { s: 'reject', v: 'Error: getter boom' }, b: { s: 'reject', k: 'string', typeError: true }, events: 0 })
        //onTrace屬性本身不可讀(getter拋錯)屬opt不可讀之一種: 同樣以字串reject, 不同步拋出
        let { fs: fsFake } = mkFake('rmSync', [])
        let optTraceBad = Object.defineProperty({ fs: fsFake }, 'onTrace', { enumerable: true, get: thrower(new Error('trace getter boom')) })
        let c = await runFake(() => fsDeleteFolderSafeCore('x', optTraceBad), 0)
        assert.strict.deepStrictEqual(c, { s: 'reject', v: 'Error: trace getter boom' })
    })

    it(`should notify attempt, retry, done, skip, giveup and fail with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let meta = []
        let rec = mkRec()
        let onTrace = function(e) {
            meta.push([this, Object.isFrozen(e)])
            rec.on(e)
        }
        await go(['EBUSY'], { opt: { onTrace }, ms: 400 }) //attempt、retry、done
        await go(['EBUSY', 'EBUSY'], { opt: { onTrace, numRetry: 2 }, ms: 700 }) //giveup
        await go([], { fakeOpt: { missing: true }, opt: { onTrace } }) //skip
        await go(['EPERM'], { opt: { onTrace } }) //fail
        //各type之欄位固定(排序後)
        let keys = {}
        for (let e of rec.events) {
            keys[e.type] = Object.keys(e).sort().join(',')
        }
        assert.strict.deepStrictEqual(keys, { attempt: 'n,type', retry: 'code,ms,n,type', done: 'n,type', giveup: 'code,n,type', skip: 'n,reason,type', fail: 'code,n,type' })
        //欄位皆為原始值(數字、字串、布林或null)
        assert.strict.deepStrictEqual(rec.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
        //事件為凍結物件, 回調不帶接收者(this為undefined)
        assert.strict.deepStrictEqual(meta.length > 0 && meta.length === rec.events.length && meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

    describe(`對外函數fsDeleteFolderSafe轉傳opt.onTrace(以真實資料夾)`, function() {

        let fdt = fileURLToPath(new URL('./_tmp/fsDeleteFolderSafe-trace/', import.meta.url))

        before(function() {
            fs.rmSync(fdt, { recursive: true, force: true })
            fs.mkdirSync(fdt, { recursive: true })
        })

        after(function() {
            fs.rmSync(fdt, { recursive: true, force: true })
        })

        it(`should pass opt.onTrace through to the core: attempt and done for an existing folder, skip not-exist for a missing one, skip not-folder for a file`, async function() {
            //對外函數以{ fs, ...opt }展開, onTrace隨opt轉傳(JSDoc opt.onTrace)
            let fd = fdt + 'd'
            fs.mkdirSync(fd + '/sub', { recursive: true })
            fs.writeFileSync(fd + '/sub/a.txt', 'a')
            let fp = fdt + 'f.txt'
            fs.writeFileSync(fp, 'f')
            let rec = mkRec()
            let r1 = await fsDeleteFolderSafe(fd, { onTrace: rec.on })
            let r2 = await fsDeleteFolderSafe(fdt + 'nope', { onTrace: rec.on })
            let r3 = await fsDeleteFolderSafe(fp, { onTrace: rec.on }).catch((err) => 'rejected: ' + err)
            assert.strict.deepStrictEqual({ r1, exists: fs.existsSync(fd), r2, r3, lines: rec.events.map(fmt) }, {
                r1: 'done: ' + fd,
                exists: false,
                r2: 'folder does not exist: ' + fdt + 'nope',
                r3: 'rejected: input path is not a folder: ' + fp,
                lines: ['attempt1', 'done1', 'skip:not-exist/0', 'skip:not-folder/0'],
            })
        })

        it(`should reject a string and keep the folder, instead of resolving as if it did not exist, when the caller passes opt.fs null`, async function() {
            //wsemi-run09: 對外函數以{ fs, ...opt }展開, 呼叫端給opt.fs為null會覆蓋內建fs; 修前Core將其當作標的不存在而回成功, 資料夾仍在
            let fd = fdt + 'keep'
            fs.mkdirSync(fd, { recursive: true })
            let r = await fsDeleteFolderSafe(fd, { fs: null }).then((v) => ({ s: 'resolve', v }), (e) => ({ s: 'reject', v: e }))
            assert.strict.deepStrictEqual({ s: r.s, str: typeof r.v === 'string' && r.v.startsWith('opt.fs is invalid'), exists: fs.existsSync(fd) }, { s: 'reject', str: true, exists: true })
        })

    })

})
