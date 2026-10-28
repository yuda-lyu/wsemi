import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFileSafe from '../src/fsDeleteFileSafe.mjs'
import fsDeleteFileSafeCore from '../src/fsDeleteFileSafeCore.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'
import { thrower, revoked } from './tools/codecThrown.mjs'
import { fmt, mkRec, mkFake, runFake, fiveOnTrace } from './tools/delTraceKit.mjs'


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
        let { r } = runFsFail('DF03') //執行器於busy.txt確已被cmd.exe以不共享刪除之方式持有後才呼叫被測函數(waitFor輪詢, 不以固定毫秒猜cmd.exe何時啟動; 見fsFailRunner.mjs之spawnHold)
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


describe(`fsDeleteFileSafe 觀察回調(R-TRACE-01)`, function() {

    //以注入之假fs(test/tools/delTraceKit.mjs之mkFake, 不觸及實體檔案)驗證opt.onTrace之事件語意; 重試間隔(300ms)本身即規格, 於假時鐘下以事件之虛擬時刻斷言(P5), 其餘斷言事件序列與結果(P1、P2)
    //未傳回調時行為不變、回調之拋錯與回傳rejection不影響刪除、不產生未處理之rejection(P3、P4)
    //事件簡式見delTraceKit.mjs之fmt: attempt1、retry1/EBUSY/300(n/code/ms)、done3、skip:not-exist/0(reason/n)、giveup3/EBUSY(n/code)、fail1/EPERM(n/code), '@'之後為通知當下之虛擬時刻

    //go, 以假fs(unlinkSync依plan動作)呼叫Core並推進假時鐘ms毫秒; fakeOpt見mkFake(missing、wrongKind), opt覆寫傳給Core之設定(含onTrace)
    let go = async (plan, { fakeOpt = {}, opt = {}, ms = 0 } = {}) => {
        let { fs: fsFake, st } = mkFake('unlinkSync', plan, fakeOpt)
        let tr = mkRec()
        let r = await runFake(() => fsDeleteFileSafeCore('x', { fs: fsFake, onTrace: tr.on, ...opt }), ms)
        return { r, tr, st }
    }

    it(`should notify attempt and retry at exact 300ms intervals and then done when the injected fs.unlinkSync throws EBUSY twice and then succeeds`, async function() {
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

    it(`should reject a string and notify fail with n 0, instead of resolving as if the file did not exist, when opt.fs is null or has no statSync`, async function() {
        //wsemi-run09: 修前fsExistsCore吞掉對null呼叫statSync之TypeError而視為標的不存在, 回傳'file does not exist: x'(成功)卻沒有刪除任何東西
        //JSDoc opt.fs: null或缺少statSync時reject字串(R-FS-REJECT-01 規則1), 不視為標的不存在
        let { fs: full } = mkFake('unlinkSync', [])
        let cases = [
            ['null', null],
            ['undefined', undefined],
            ['string', 'fs'],
            ['number', 1],
            ['empty object', {}],
            ['no statSync', { lstatSync: full.lstatSync, unlinkSync: () => {} }],
            ['statSync not a function', { statSync: 'x', lstatSync: full.lstatSync, unlinkSync: () => {} }],
        ]
        for (let [name, fsBad] of cases) {
            let tr = mkRec()
            let r = await runFake(() => fsDeleteFileSafeCore('x', { fs: fsBad, onTrace: tr.on }), 0)
            assert.strict.deepStrictEqual({ name, s: r.s, str: typeof r.v === 'string' && r.v.startsWith('opt.fs is invalid'), lines: tr.lines() }, { name, s: 'reject', str: true, lines: ['fail0/null@0'] })
        }
        //JSDoc opt.fs: 缺少lstatSync或unlinkSync時其呼叫之TypeError不被吞, 以字串reject(不成功、不通知opt.fs不合)
        for (let [name, fsPart] of [['no unlinkSync', { statSync: full.statSync, lstatSync: full.lstatSync }], ['no lstatSync', { statSync: full.statSync, unlinkSync: () => {} }]]) {
            let r = await runFake(() => fsDeleteFileSafeCore('x', { fs: fsPart }), 0)
            assert.strict.deepStrictEqual({ name, s: r.s, str: typeof r.v === 'string' && !r.v.startsWith('opt.fs is invalid') }, { name, s: 'reject', str: true })
        }
    })

    it(`should notify skip vanished and resolve when the injected fs.unlinkSync throws ENOENT and the target is gone during the retry`, async function() {
        let { r, tr } = await go(['EBUSY', 'gone'], { opt: { numRetry: 3 }, ms: 400 })
        //JSDoc onTrace: skip(reason為vanished)代表第n次嘗試得ENOENT且標的確已不存在(重試期間被他方刪除)而resolve
        assert.strict.deepStrictEqual(tr.lines(), ['attempt1@0', 'retry1/EBUSY/300@0', 'attempt2@300', 'skip:vanished/2@300'])
        //R-FS-REJECT-01 規則4b: 標的不存在仍視為成功, 訊息同前置檢查之標的不存在
        assert.strict.deepStrictEqual(r, { s: 'resolve', v: 'file does not exist: x' })
    })

    it(`should notify fail with the error code and reject at once (no retry) when the attempt throws a non-retryable error`, async function() {
        //JSDoc onTrace: fail為第n次遇不可重試之錯誤而即將reject(含n、code為該錯誤之code字串, 無或非字串則null); 標的仍在之ENOENT亦不可重試
        let cases = [
            ['EPERM', 'fail1/EPERM', 'Error: EPERM 1'],
            ['ENOENT', 'fail1/ENOENT', 'Error: ENOENT 1'], //ENOENT而標的仍在: 非重試期間被刪, 仍reject
            ['null', 'fail1/null', 'null'], //拋出null: 讀code須可承受(R-FS-REJECT-01 規則8)
            ['revoked', 'fail1/null', 'unknown error'], //拋出已撤銷之Proxy: 讀code即拋錯, 以null通知
            ['num', 'fail1/null', 'Error: num 1'], //code非字串: 以null通知
        ]
        for (let [step, line, msg] of cases) {
            let { r, tr, st } = await go([step, 'EBUSY'], { opt: { numRetry: 3 } })
            assert.strict.deepStrictEqual({ step, lines: tr.lines(), r, calls: st.calls }, { step, lines: ['attempt1@0', `${line}@0`], r: { s: 'reject', v: msg }, calls: 1 })
        }
    })

    it(`should notify skip not-exist or not-file without any attempt when the pre-check ends the call`, async function() {
        //JSDoc onTrace: skip(n為0)為前置檢查即結束; reason為not-exist代表標的不存在而resolve, not-file代表標的非檔案而reject; 皆無attempt
        let a = await go([], { fakeOpt: { missing: true } })
        assert.strict.deepStrictEqual({ lines: a.tr.lines(), r: a.r, calls: a.st.calls }, { lines: ['skip:not-exist/0@0'], r: { s: 'resolve', v: 'file does not exist: x' }, calls: 0 })
        let b = await go([], { fakeOpt: { wrongKind: true } })
        assert.strict.deepStrictEqual({ lines: b.tr.lines(), r: b.r, calls: b.st.calls }, { lines: ['skip:not-file/0@0'], r: { s: 'reject', v: 'input path is not a file: x' }, calls: 0 })
    })

    it(`should notify fail with n 0 and reject the string when the pre-check throws (opt.fs.lstatSync throws)`, async function() {
        //JSDoc onTrace: fail之n為0代表前置檢查拋錯; R-FS-REJECT-01 規則2: 前置檢查之拋錯在try內, 依規則1轉字串
        let tr = mkRec()
        let fsBoom = { statSync: () => ({}), lstatSync: thrower(Object.assign(new Error('lstat boom'), { code: 'EACCES' })) }
        let r = await runFake(() => fsDeleteFileSafeCore('x', { fs: fsBoom, onTrace: tr.on }), 0)
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
                let e = await runFake(() => fsDeleteFileSafeCore('x', optBad), 0) //opt不可讀
                let fsBoom = { statSync: () => ({}), lstatSync: thrower(new Error('lstat boom')) }
                let f = await runFake(() => fsDeleteFileSafeCore('x', { fs: fsBoom, onTrace }), 0) //前置檢查拋錯
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
            { s: 'resolve', v: 'file does not exist: x' },
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
        let a = await runFake(() => fsDeleteFileSafeCore('x', optGetter), 0)
        let b = await runFake(() => fsDeleteFileSafeCore('x', revoked()), 0)
        assert.strict.deepStrictEqual({ a, b: { s: b.s, k: typeof b.v, typeError: /^TypeError: /.test(b.v) }, events: tr.events.length }, { a: { s: 'reject', v: 'Error: getter boom' }, b: { s: 'reject', k: 'string', typeError: true }, events: 0 })
        //onTrace屬性本身不可讀(getter拋錯)屬opt不可讀之一種: 同樣以字串reject, 不同步拋出
        let { fs: fsFake } = mkFake('unlinkSync', [])
        let optTraceBad = Object.defineProperty({ fs: fsFake }, 'onTrace', { enumerable: true, get: thrower(new Error('trace getter boom')) })
        let c = await runFake(() => fsDeleteFileSafeCore('x', optTraceBad), 0)
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
        await go(['gone'], { opt: { onTrace } }) //skip(vanished, n為嘗試序號)
        await go([], { fakeOpt: { missing: true }, opt: { onTrace } }) //skip(not-exist)
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

    describe(`對外函數fsDeleteFileSafe轉傳opt.onTrace(以真實檔案)`, function() {

        let fdt = fileURLToPath(new URL('./_tmp/fsDeleteFileSafe-trace/', import.meta.url))

        before(function() {
            fs.rmSync(fdt, { recursive: true, force: true })
            fs.mkdirSync(fdt, { recursive: true })
        })

        after(function() {
            fs.rmSync(fdt, { recursive: true, force: true })
        })

        it(`should pass opt.onTrace through to the core: attempt and done for an existing file, skip not-exist for a missing one`, async function() {
            //對外函數以{ fs, ...opt }展開, onTrace隨opt轉傳(JSDoc opt.onTrace)
            let fp = fdt + 'a.txt'
            fs.writeFileSync(fp, 'a')
            let rec = mkRec()
            let r1 = await fsDeleteFileSafe(fp, { onTrace: rec.on })
            let r2 = await fsDeleteFileSafe(fdt + 'nope.txt', { onTrace: rec.on })
            assert.strict.deepStrictEqual({ r1, exists: fs.existsSync(fp), r2, lines: rec.events.map(fmt) }, { r1: 'done: ' + fp, exists: false, r2: 'file does not exist: ' + fdt + 'nope.txt', lines: ['attempt1', 'done1', 'skip:not-exist/0'] })
        })

        it(`should reject a string and keep the file, instead of resolving as if it did not exist, when the caller passes opt.fs null`, async function() {
            //wsemi-run09: 對外函數以{ fs, ...opt }展開, 呼叫端給opt.fs為null會覆蓋內建fs; 修前Core將其當作標的不存在而回成功, 檔案仍在
            let fp = fdt + 'keep.txt'
            fs.writeFileSync(fp, 'a')
            let r = await fsDeleteFileSafe(fp, { fs: null }).then((v) => ({ s: 'resolve', v }), (e) => ({ s: 'reject', v: e }))
            assert.strict.deepStrictEqual({ s: r.s, str: typeof r.v === 'string' && r.v.startsWith('opt.fs is invalid'), exists: fs.existsSync(fp) }, { s: 'reject', str: true, exists: true })
        })

    })

})
