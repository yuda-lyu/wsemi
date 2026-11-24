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

    it(`EV02 should log through the diag exit (fixed label and safe summary, no error text) instead of an unhandled rejection when an argument has a circular reference`, function() {
        let { r } = runFsFail('EV02')
        //R-FS-REJECT-01 規則7: fsSrlog之core()須接rejection並記錄, 不得成unhandledRejection(R-PM-SETTLE-01 規則2、10)
        //twsm1b(R-DIAG-01規則20): 記錄經getDiag出口, 預設為固定詞彙label與安全摘要, 不輸出錯誤本體之訊息(JSON.stringify之原文)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught, logged: r.logs.includes('[wsemi fsSrlog] can not save log {"errType":"TypeError"}'), echoesText: logged(r, /circular/i) }, { ...ev0, logged: true, echoesText: false })
    })

    it(`EV02 should not crash a process without handlers (exit code 0) when an argument has a circular reference`, function() {
        let rc = runFsFail('EV02', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

    it(`EV03 should log (console.log) instead of an unhandled rejection when the log file cannot be written (parent of fdLog is a file)`, function() {
        let { r } = runFsFail('EV03')
        //R-FS-REJECT-01 規則7: fsSrlog之core()須接rejection並以console.log記錄, 不得成unhandledRejection
        //ws492j(V20): 不帶Node原生訊息(含log資料夾之路徑); twsm1b(R-DIAG-01規則20): 經getDiag出口之固定詞彙label與安全摘要{ errType, errCode }
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught, logged: logged(r, /^\[wsemi fsSrlog\] can not save log \{"errType":"Error","errCode":"E(NOENT|NOTDIR)"\}$/), echoesPath: logged(r, /fsFail/) }, { ...ev0, logged: true, echoesPath: false })
    })

    it(`EV04 should throw 'can not parse stackLines' and log only the fixed label (no stack lines, no paths) when no caller file location is on the stack`, function() {
        let { r } = runFsFail('EV04')
        //JSDoc: useLoc=true而呼叫堆疊中無呼叫端之file:位置時log函數同步拋出Error('can not parse stackLines'); twsm1b: 其前之診斷只出固定詞彙label, 堆疊行(含本機路徑)只在logDetail或funLog時交出
        assert.strict.deepStrictEqual({ uncaught: r.uncaught.some((s) => s.includes('can not parse stackLines')), logs: r.logs }, { uncaught: true, logs: ['[wsemi fsSrlog] can not parse stackLines'] })
    })

    it(`EV03 should not crash a process without handlers (exit code 0) when the log file cannot be written`, function() {
        let rc = runFsFail('EV03', { exitMode: 'nohandler', allowNoResult: true })
        //R-FS-REJECT-01 規則7: 不得成unhandledRejection致無處理器時行程以離開碼1結束
        assert.strict.deepStrictEqual({ status: rc.status, hasResult: rc.r !== null }, { status: 0, hasResult: true })
    })

})


//排程第610項⑤之常駐路徑(twsm1b; R-DIAG-01規則20): 本函數自身之診斷經getDiag(opt)出口——opt.funLog為函數時只交給它(不寫console), opt.logDetail為true時console輸出遮罩後之細節; log函數本身之console.log顯示不受影響
describe(`fsSrlog 診斷出口(opt.funLog、opt.logDetail)`, function() {

    let fd = './test/_tmp/fsSrlogDiag'

    before(function() {
        fs.mkdirSync(fd, { recursive: true })
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
    })

    //capture, 攔console.log與console.error至記錄陣列(回呼期間)
    let capture = () => {
        let rec = { log: [], error: [] }
        let raw = { log: console.log, error: console.error }
        console.log = (...a) => rec.log.push(a)
        console.error = (...a) => rec.error.push(a)
        return { rec, restore: () => Object.assign(console, raw) }
    }

    //waitFor, 以事件同步: 等cond成立(防懸置上限3秒)
    let waitFor = (cond) => new Promise((resolve, reject) => {
        let t0 = Date.now()
        let tick = () => {
            if (cond()) {
                resolve()
            }
            else if (Date.now() - t0 > 3000) {
                reject(new Error('waitFor: condition not met'))
            }
            else {
                setImmediate(tick)
            }
        }
        tick()
    })

    it(`should hand a save failure only to opt.funLog as (label, { errType }, detail), not to console.error, while the log line itself is still shown`, async function() {
        let calls = []
        let { rec, restore } = capture()
        try {
            let f = fsSrlog({ fdLog: `${fd}/a`, useLoc: false, useTime: false, funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
            let o = { a: 1 }
            o.self = o
            f('x', o)
            await waitFor(() => calls.length >= 1)
        }
        finally {
            restore()
        }
        assert.strict.deepStrictEqual([calls.length, calls[0][0], calls[0][1]], [1, '[wsemi fsSrlog] can not save log', { errType: 'TypeError' }])
        assert.strict.deepStrictEqual(calls[0][2] instanceof Error, true) //細節為遮罩後之拷貝(TypeError保型)
        assert.strict.deepStrictEqual(rec.error.length, 0)
        assert.strict.deepStrictEqual(rec.log.length, 1) //log函數本身之顯示照舊
    })

    it(`should print the masked detail to console.error with opt.logDetail true, and only the safe summary otherwise (non-true logDetail, non-function funLog)`, async function() {
        for (let [o, detail] of [[{ logDetail: true }, true], [{ logDetail: 'true' }, false], [{ funLog: 'x' }, false], [{}, false]]) {
            let { rec, restore } = capture()
            try {
                let f = fsSrlog({ fdLog: `${fd}/b`, useLoc: false, useTime: false, ...o })
                let x = { a: 1 }
                x.self = x
                f('x', x)
                await waitFor(() => rec.error.length >= 1)
            }
            finally {
                restore()
            }
            assert.strict.deepStrictEqual(rec.error.length, 1)
            assert.strict.deepStrictEqual(rec.error[0][0], '[wsemi fsSrlog] can not save log')
            if (detail) {
                assert.strict.deepStrictEqual(rec.error[0][1] instanceof Error, true)
            }
            else {
                assert.strict.deepStrictEqual(rec.error[0][1], { errType: 'TypeError' })
            }
        }
    })

    it(`should report an undecodable caller location (a caller frame named with 'file:%zz') with the fixed label and safe summary only, and still show the log line`, function() {
        //useLoc=true: 堆疊中第一個含'file:'之呼叫端字樣為函數名'Object.file:%zz'時decodeURIComponent拋URIError, 原console.log錯誤本體; twsm1b起經getDiag出口(預設只出label與{ errType })
        let { rec, restore } = capture()
        try {
            let f = fsSrlog({ fdLog: `${fd}/c`, useTime: false })
            let o = {
                'file:%zz'() {
                    f('y')
                },
            }
            o['file:%zz']()
        }
        finally {
            restore()
        }
        assert.strict.deepStrictEqual(rec.error, [['[wsemi fsSrlog] can not decode the caller location', { errType: 'URIError' }]])
        assert.strict.deepStrictEqual(rec.log.length, 1)
    })

})
