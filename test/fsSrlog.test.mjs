import fs from 'fs'
import assert from 'assert'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsSrlog from '../src/fsSrlog.mjs'


describe(`fsSrlog`, function() {

    let test = () => {

        let gneFp = () => {
            let cdday = ot().format('YYYY-MM-DD')
            let fp = `./syslog/${cdday}.log`
            return fp
        }
        let fp = gneFp()

        fsDeleteFile(fp)

        let opt = {
            useTime: false,
        }
        let srlog = fsSrlog(opt)
        srlog('abc', 123, 4.56, { xyz: ['a', 'bc', true, { xy: 'z' }] })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('c', c)

        fsDeleteFolder(`./syslog`)

        return _.trim(c)
    }

    //for windows
    let t1 = `[/test/fsSrlog.test.mjs:27:9]
abcꓹ 123ꓹ 4.56ꓹ {"xyz":["a","bc",true,{"xy":"z"}]}`
    t1 = _.trim(t1)

    //for github
    let t2 = `[home/runner/work/wsemi/wsemi/test/fsSrlog.test.mjs:27:9]
abcꓹ 123ꓹ 4.56ꓹ {"xyz":["a","bc",true,{"xy":"z"}]}`
    t2 = _.trim(t2)

    it(`should return '${t1}' when run test`, async function() {
        let r = test()
        let rr1 = t1
        let rr2 = t2
        let b = r === rr1 || r === rr2
        assert.strict.deepStrictEqual(b, true)
    })

})


describe(`fsSrlog 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsFailRunner.mjs之EV02、EV03), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除
    //預設模式掛未處理rejection與未捕捉例外之記錄器並收集console.log; nohandler模式不掛記錄器, 未處理之rejection即使行程以離開碼1結束(無結果行)
    this.timeout(60000)

    //runFsFail、ev0以動態import取得: 上方案例斷言呼叫端位置'fsSrlog.test.mjs:27:9', 於檔首加import會使其行號改變
    let runFsFail = null
    let ev0 = null
    before(async function() {
        ({ runFsFail, ev0 } = await import('./tools/fsFailRun.mjs'))
    })

    //logged, 子行程期間之console.log是否有一筆含re
    let logged = (r, re) => r.logs.some((s) => re.test(s))

    it(`EV02 should log (console.log) instead of an unhandled rejection when an argument has a circular reference`, function() {
        let { r } = runFsFail('EV02')
        //R-FS-REJECT-01 規則7: fsSrlog之core()須接rejection並以console.log記錄, 不得成unhandledRejection(R-PM-SETTLE-01 規則2、10)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught, logged: logged(r, /Converting circular structure to JSON/) }, { ...ev0, logged: true })
    })

    it(`EV02 should not crash a process without handlers (exit code 0) when an argument has a circular reference`, function() {
        let rc = runFsFail('EV02', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

    it(`EV03 should log (console.log) instead of an unhandled rejection when the log file cannot be written (parent of fdLog is a file)`, function() {
        let { r } = runFsFail('EV03')
        //R-FS-REJECT-01 規則7: fsSrlog之core()須接rejection並以console.log記錄, 不得成unhandledRejection
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught, logged: logged(r, /E(NOENT|NOTDIR): /) }, { ...ev0, logged: true })
    })

    it(`EV03 should not crash a process without handlers (exit code 0) when the log file cannot be written`, function() {
        let rc = runFsFail('EV03', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

})
