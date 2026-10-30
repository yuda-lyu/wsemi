import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'


//負載試驗執行器(test/tools/loadTrial.mjs、loadPreload.mjs)之規格: 見loadTrial.mjs檔頭之用法說明(各套件自wsemi複製之單一版本, 收回w-sync-webdata之--diag、--hang-sec、--run-max、__ltDiagDump與w-mousekey之--guard、--exit-grace)
//每案以子行程執行loadTrial(其再起mocha), 夾具(受測之mocha測試檔與guard腳本)建於test/_tmp/loadTrial/, after刪除; 夾具檔不在test/*.test.mjs之範圍內(子資料夾)


describe(`loadTrial (test tool)`, function() {

    let fd = path.resolve('./test/_tmp/loadTrial')
    let fnTrial = path.resolve('./test/tools/loadTrial.mjs')
    let fx = (name) => path.join(fd, name)

    before(function() {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(fd, { recursive: true })
        fs.writeFileSync(fx('pass.test.mjs'), `describe('fx', function() { it('ok', function() {}) })\n`)
        fs.writeFileSync(fx('fail.test.mjs'), `describe('fx', function() { it('bad', function() { throw new Error('boom1') }) })\n`)
        //hang: 留下ref之計時器, mocha(無--exit)寫出報告後不會自行結束; 20秒後自行清除(執行器未終止時亦不殘留行程), 自行結束者離開碼為0, 被終止者非0
        fs.writeFileSync(fx('hang.test.mjs'), `describe('fx', function() { it('leaves a timer', function() { globalThis.__ltHang = setInterval(function() {}, 1000); setTimeout(function() { clearInterval(globalThis.__ltHang) }, 20000) }) })\n`)
        //slow: 單案不設逾時且20秒後才完成, 供--run-max
        fs.writeFileSync(fx('slow.test.mjs'), `describe('fx', function() { it('slow', function(done) { this.timeout(0); setTimeout(done, 20000) }) })\n`)
        //dump: 於異常當下呼叫__ltDiagDump另存快照, 再使案例失敗(有失敗者保留diag)
        fs.writeFileSync(fx('dump.test.mjs'), `describe('fx', function() { it('dump', function() { globalThis.__ltDiagDump('my tag'); throw new Error('after dump') }) })\n`)
        fs.writeFileSync(fx('guardOk.mjs'), `console.log('guard ok', process.env.NODE_OPTIONS === undefined)\n`)
        fs.writeFileSync(fx('guardFail.mjs'), `process.exit(2)\n`)
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
    })

    //trial, 執行loadTrial, 回傳{ status, stdout, summary }
    let trial = (name, own, test, env) => {
        let out = fx(`out-${name}`)
        let r = spawnSync(process.execPath, [fnTrial, '--out', out, ...own, '--', '--no-parallel', fx(test), '--timeout', '180000'], { encoding: 'utf8', windowsHide: true, timeout: 150000, env })
        let fnSum = path.join(out, 'summary.json')
        let summary = fs.existsSync(fnSum) ? JSON.parse(fs.readFileSync(fnSum, 'utf8')) : null
        return { status: r.status, stdout: String(r.stdout || ''), stderr: String(r.stderr || ''), summary, out }
    }

    let alive = (pid) => {
        try {
            process.kill(pid, 0)
            return true
        }
        catch (err) {
            return err.code === 'EPERM'
        }
    }

    it(`should run K times, record the lag probe and exit 0 when every run passes and exits by itself`, function() {
        let r = trial('pass', ['--runs', '2', '--lag', '5:50'], 'pass.test.mjs')
        let s = r.summary
        //probes, 各輪之延遲量測檔(預載模組於行程結束時必寫; 取樣數依行程存活時間而定, 不斷言)
        let probes = (k) => {
            let d = path.join(r.out, `probe${k}`)
            return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /^probe-\d+\.json$/.test(f)).length : 0
        }
        //檔頭「離開碼: 各輪皆無失敗且皆自行結束為0」; 「各測試行程之事件迴圈延遲另以monitorEventLoopDelay量測」
        assert.strict.deepStrictEqual({
            status: r.status,
            runs: s.runs.map((x) => [x.run, x.code, x.passes, x.failures, x.hung, x.noExit, probes(x.run) >= 1]),
            failRate: s.failRate,
            guardFailed: s.guardFailed,
            lag: s.opt.lag,
        }, {
            status: 0,
            runs: [[1, 0, 1, 0, '', false, true], [2, 0, 1, 0, '', false, true]],
            failRate: [],
            guardFailed: null,
            lag: '5:50',
        }, r.stdout)
    })

    it(`should count failed cases into the fail rate and exit 1`, function() {
        let r = trial('fail', ['--runs', '2'], 'fail.test.mjs')
        assert.strict.deepStrictEqual({ status: r.status, failRate: r.summary.failRate }, { status: 1, failRate: [{ key: 'fail.test.mjs :: fx bad', n: 2, of: 2 }] }, r.stdout)
    })

    it(`should judge "report written but did not exit" within --hang-sec as a failure, kill the mocha tree, and keep the --diag snapshot with the creation stack`, function() {
        //--hang-sec 2: 報告寫出後至終止前至少2秒, 預載模組每秒之快照必有一份晚於受測檔建立計時器
        let r = trial('hang', ['--hang-sec', '2', '--diag'], 'hang.test.mjs')
        let x = r.summary.runs[0]
        let dirDiag = path.join(r.out, 'diag1')
        let snaps = fs.existsSync(dirDiag) ? fs.readdirSync(dirDiag).filter((f) => /^diag-\d+\.json$/.test(f)) : []
        //快照之items含撐住行程之計時器, 其建立堆疊指向受測檔(以「受測檔建立之Timeout」判定, 不依mocha自身之資源)
        let held = snaps.some((f) => JSON.parse(fs.readFileSync(path.join(dirDiag, f), 'utf8')).items.some((it) => it.type === 'Timeout' && it.frames.some((s) => s.includes('hang.test.mjs'))))
        //檔頭--hang-sec: 判為「測完不退出」(失敗), 終止其行程樹; --diag: 不退出者保留快照
        assert.strict.deepStrictEqual({
            status: r.status,
            hung: x.hung,
            noExit: x.noExit,
            passes: x.passes,
            failRate: r.summary.failRate.map((f) => f.key),
            killed: !alive(x.pid) && x.code !== 0, //被終止(自行結束者離開碼為0)且已不存在
            held,
        }, {
            status: 1,
            hung: 'mocha wrote its report but did not exit within 2s',
            noExit: true,
            passes: 1,
            failRate: ['(mocha did not exit)'],
            killed: true,
            held: true,
        }, r.stdout)
    })

    it(`should accept --exit-grace as an alias of --hang-sec`, function() {
        let r = trial('grace', ['--exit-grace', '1'], 'hang.test.mjs')
        assert.strict.deepStrictEqual([r.status, r.summary.opt.hangSec, r.summary.runs[0].hung], [1, 1, 'mocha wrote its report but did not exit within 1s'], r.stdout)
    })

    it(`should stop a run exceeding --run-max as not exited and kill the mocha tree`, function() {
        let r = trial('runmax', ['--run-max', '2'], 'slow.test.mjs')
        let x = r.summary.runs[0]
        assert.strict.deepStrictEqual({ status: r.status, hung: x.hung, killed: !alive(x.pid) && x.code !== 0, failRate: r.summary.failRate.map((f) => f.key) }, { status: 1, hung: 'mocha did not finish within 2s', killed: true, failRate: ['(no json report)', '(mocha did not exit)'] }, r.stdout)
    })

    it(`should delete the --diag snapshot of a passing run and keep the __ltDiagDump snapshot of a failing run`, function() {
        let rp = trial('diagpass', ['--diag'], 'pass.test.mjs')
        let rd = trial('diagdump', ['--diag'], 'dump.test.mjs')
        let dirDump = path.join(rd.out, 'diag1')
        let tagged = fs.existsSync(dirDump) ? fs.readdirSync(dirDump).filter((f) => /^diag-\d+-my_tag\.json$/.test(f)) : []
        //檔頭--diag: 該次無失敗且自行結束者刪除; 測試於異常當下可呼叫globalThis.__ltDiagDump(tag)另存當下快照(tag之非識別字元換_)
        assert.strict.deepStrictEqual({ pass: [rp.status, fs.existsSync(path.join(rp.out, 'diag1'))], dump: [rd.status, tagged.length] }, { pass: [0, false], dump: [1, 1] }, rd.stdout)
    })

    it(`should run --guard before every run without NODE_OPTIONS, and stop with exit code 3 when the guard fails`, function() {
        //loadTrial本身帶NODE_OPTIONS(如呼叫端之--no-warnings)啟動, guard仍不帶
        let ok = trial('guardok', ['--runs', '2', '--guard', fx('guardOk.mjs')], 'pass.test.mjs', { ...process.env, NODE_OPTIONS: '--no-warnings' })
        let bad = trial('guardbad', ['--runs', '2', '--guard', fx('guardFail.mjs')], 'pass.test.mjs')
        let g1 = fs.readFileSync(path.join(ok.out, 'guard1.log'), 'utf8')
        //檔頭--guard: 每輪前以node執行(不帶NODE_OPTIONS), 離開碼非0即停止其後各輪、記入summary.guardFailed並以離開碼3結束
        assert.strict.deepStrictEqual({
            ok: [ok.status, ok.summary.runs.length, fs.existsSync(path.join(ok.out, 'guard2.log')), g1.trim()],
            bad: [bad.status, bad.summary.runs.length, bad.summary.guardFailed],
        }, {
            ok: [0, 2, true, 'guard ok true'],
            bad: [3, 0, { run: 1, code: 2, signal: null }],
        }, bad.stdout)
    })

    it(`should stop the CPU burners and verify by PID that none is left`, function() {
        let r = trial('burn', ['--burners', '1'], 'pass.test.mjs')
        let b = r.summary.burnersAfter
        //檔頭: 壓力行程於結束時終止並以PID回驗
        assert.strict.deepStrictEqual([r.status, b.length, b.every((x) => !x.alive), b.every((x) => !alive(x.pid))], [0, 1, true, true], r.stdout)
    })

    it(`should reject unknown options and invalid values without running mocha`, function() {
        let rs = [['--bogus', '1'], ['--hang-sec', '0'], ['--run-max', '-1'], ['--lag', 'x']].map((own) => {
            let r = trial(`bad${own[0].replace(/-/g, '')}`, own, 'pass.test.mjs')
            return [r.status, r.summary === null]
        })
        assert.strict.deepStrictEqual(rs, Array(4).fill([1, true]))
    })

})
