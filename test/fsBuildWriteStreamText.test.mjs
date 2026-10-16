import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsBuildWriteStreamText from '../src/fsBuildWriteStreamText.mjs'
import { runFsFail, ev, ev0 } from './tools/fsFailRun.mjs'


describe(`fsBuildWriteStreamText`, function() {

    let test = async() => {

        let ms = []

        let fdt = './_test_fsBuildWriteStreamText'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/${fn}`

        let bdw = fsBuildWriteStreamText()

        let pm = bdw.create(fp)
        ms.push({ 'create': '' })

        bdw.write('abc')
        ms.push({ 'write': 'abc' })
        bdw.write('中文')
        ms.push({ 'write': '中文' })
        bdw.end()

        await pm

        let c = fs.readFileSync(fp, 'utf8')
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    // ms [
    //   { create: '' },
    //   { write: 'abc' },
    //   { write: '中文' },
    //   { readFileSync: 'abc\n中文\n' }
    // ]
    let ms = [
        { create: '' },
        { write: 'abc' },
        { write: '中文' },
        { readFileSync: 'abc\n中文\n' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsBuildWriteStreamText 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsFailRunner.mjs之WS*), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除
    //結果值經執行器之dv描述: { s: 'resolve'|'reject'|'syncThrow'|'pending', k: 值之類別('string'、'Error'、'undefined'等), v }; end()之settle逾時1.5秒即為'pending'(懸置)
    //ev(r)、ev0: 子行程之未處理rejection與未捕捉例外及其期望(皆空)
    this.timeout(60000)

    it(`WS01 should reject String(err) from create() when the path is an existing folder`, function() {
        let { r } = runFsFail('WS01')
        let res = r.out.res
        //R-FS-REJECT-01 規則1: 拒絕值一律為字串, 捕捉之Error(串流'error')經_errToStr得'名稱: 訊息'
        //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException(以下各案同)
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, eisdir: /^Error: EISDIR: /.test(res.v), ...ev(r) }, { s: 'reject', k: 'string', eisdir: true, ...ev0 })
    })

    it(`WS02 should reject String(err) from create() when the parent of the path is a file`, function() {
        let { r } = runFsFail('WS02')
        let res = r.out.res
        //R-FS-REJECT-01 規則1: 拒絕值一律為字串, 捕捉之Error經_errToStr得'名稱: 訊息'
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, code: /^Error: (ENOENT|ENOTDIR): /.test(res.v), ...ev(r) }, { s: 'reject', k: 'string', code: true, ...ev0 })
    })

    it(`WS03 should return a Promise that rejects a string (not throw synchronously) from create() when the path is undefined`, function() {
        let { r } = runFsFail('WS03')
        let res = r.out.res
        //R-FS-REJECT-01 規則2: 不得同步拋出; 規則5: create回傳Promise; 規則1: 拒絕值為_errToStr之字串
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, typeError: /^TypeError \[ERR_INVALID_ARG_TYPE\]/.test(res.v), ...ev(r) }, { s: 'reject', k: 'string', typeError: true, ...ev0 })
    })

    it(`WS05 should settle end() (resolve) after create() failed`, function() {
        let { r } = runFsFail('WS05')
        //R-FS-REJECT-01 規則5: create失敗後呼叫end()須settle(無開啟中之串流時resolve), 不得懸置
        assert.strict.deepStrictEqual({ create: r.out.create, end: r.out.end, ...ev(r) }, { create: 'reject', end: { s: 'resolve', k: 'undefined' }, ...ev0 })
    })

    it(`WS06 should settle end() (resolve) when create() was never called`, function() {
        let { r } = runFsFail('WS06')
        //R-FS-REJECT-01 規則5: 未create即呼叫end()須settle(無開啟中之串流時resolve), 不得同步拋出(規則2)
        assert.strict.deepStrictEqual({ end: r.out.end, ...ev(r) }, { end: { s: 'resolve', k: 'undefined' }, ...ev0 })
    })

    it(`WS07 (守門) should resolve the Promise of create() at finish and the Promise of end() at close on a normal write`, function() {
        let { r } = runFsFail('WS07')
        //R-FS-REJECT-01 規則5與規則9: create回傳Promise(寫入完成resolve), end回傳Promise(串流關閉後resolve)
        assert.strict.deepStrictEqual({ create: r.out.create, end: r.out.end, content: r.out.content, ...ev(r) }, { create: { s: 'resolve', k: 'undefined' }, end: { s: 'resolve', k: 'undefined' }, content: 'abc\n', ...ev0 })
    })

    //WS08~WS10(外審 opus F14): 依JSDoc範例之流程(create→write→write→end→await pm)整段包try呼叫, 任一步同步拋出即跳至catch而不再await pm(呼叫端之寫法)
    it(`WS08 should not throw synchronously and let 'await pm' reject a string when the doc example flow is given an undefined fp`, function() {
        let { r } = runFsFail('WS08')
        let o = r.out
        //R-FS-REJECT-01 規則2: 不得同步拋出(create同步失敗後write、end不動作不拋錯, 流程走到await pm); 規則5: end須settle(resolve)
        assert.strict.deepStrictEqual({ stage: o.stage, end: o.end }, { stage: 'awaitPm', end: { s: 'resolve', k: 'undefined' } })
        //R-FS-REJECT-01 規則1: await pm者收到以字串reject之開檔錯誤(_errToStr之'TypeError [ERR_INVALID_ARG_TYPE]: …')
        assert.strict.deepStrictEqual({ k: o.caught.k, typeError: /^TypeError \[ERR_INVALID_ARG_TYPE\]/.test(o.caught.v) }, { k: 'string', typeError: true })
        //R-FS-REJECT-01 規則7之精神: create之Promise不得成unhandledRejection
        assert.strict.deepStrictEqual(ev(r), ev0)
    })

    it(`WS08 should not crash a process without handlers (exit code 0) in the doc example flow with an undefined fp`, function() {
        let rc = runFsFail('WS08', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7之精神: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

    it(`WS09 should not throw synchronously nor cause an unhandledRejection when the Promise of create() with an undefined fp is not handled by the caller`, function() {
        let { r } = runFsFail('WS09')
        //R-FS-REJECT-01 規則2: create不得同步拋出; 規則7之精神: create回傳之Promise先標記已處理(await者仍收到rejection, 見WS08), 呼叫端未接時不得成unhandledRejection
        assert.strict.deepStrictEqual({ syncThrow: r.out.syncThrow, ...ev(r) }, { syncThrow: null, ...ev0 })
    })

    it(`WS09 should not crash a process without handlers (exit code 0) when the Promise of create() is not handled`, function() {
        let rc = runFsFail('WS09', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7之精神: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

    it(`WS10 (守門) should not throw synchronously (also on a write after the stream errored) and let 'await pm' reject a string when the doc example flow is given an existing folder`, function() {
        let { r } = runFsFail('WS10')
        let o = r.out
        //R-FS-REJECT-01 規則2: 不得同步拋出(串流'error'後之write不動作不拋錯); 規則5: end須settle(resolve)
        assert.strict.deepStrictEqual({ stage: o.stage, end: o.end }, { stage: 'awaitPm', end: { s: 'resolve', k: 'undefined' } })
        //R-FS-REJECT-01 規則1: await pm者收到以字串reject之開檔錯誤('Error: EISDIR: …')
        assert.strict.deepStrictEqual({ k: o.caught.k, eisdir: /^Error: EISDIR: /.test(o.caught.v), ...ev(r) }, { k: 'string', eisdir: true, ...ev0 })
    })

    it(`WS11 (守門) should throw a TypeError synchronously from write() when create() was never called`, function() {
        let { r } = runFsFail('WS11')
        let res = r.out.res
        //R-FS-REJECT-01 站點全集之刻意不套: 未呼叫create即write維持同步拋TypeError(JSDoc載須於create後呼叫; 外審 opus F14之裁定只及已呼叫create而失敗者)
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, typeError: /^TypeError: /.test(res.v), ...ev(r) }, { s: 'syncThrow', k: 'Error', typeError: true, ...ev0 })
    })

})
