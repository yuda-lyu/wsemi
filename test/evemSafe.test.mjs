import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import assert from 'assert'
import cache from '../src/cache.mjs'
import alive from '../src/alive.mjs'
import cacheSt from '../src/cacheSt.mjs'
import fsBuildReadStreamText from '../src/fsBuildReadStreamText.mjs'
import fsTask from '../src/fsTask.mjs'
import fsTaskCp from '../src/fsTaskCp.mjs'
import queue from '../src/queue.mjs'
import fsWatchFile from '../src/fsWatchFile.mjs'
import fsWatchFolder from '../src/fsWatchFolder.mjs'
import fsEvem from '../src/fsEvem.mjs'


//整合測試: src內以evem({ type: 'safe' })建立事件物件之10個模組, 監聽器拋錯或async reject時
//  (1) 不得產生uncaughtException/unhandledRejection(行程不死)
//  (2) 以error事件回報{ fun: 'listener', name, msg, args }
//  (3) 同事件其他監聽器不受影響, 模組後續流程仍正常(含事件帶pm者之pm被reject而不懸置)
describe(`evem safe integration (src modules)`, function() {

    this.timeout(60000)

    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    let waitFor = async (fn, ms = 5000, step = 50) => {
        let t0 = Date.now()
        while (Date.now() - t0 < ms) {
            if (fn()) {
                return true
            }
            await delay(step)
        }
        return fn()
    }

    let nUncaught = 0
    let nUnhandled = 0
    let onUncaught = () => {
        nUncaught += 1
    }
    let onUnhandled = () => {
        nUnhandled += 1
    }
    let fds = ['./_test_evemSafe_rs', './_test_evemSafe_fsTask', './_test_evemSafe_fsTask_storage', './_test_evemSafe_tcpSrc', './_test_evemSafe_tcpTar', './_test_evemSafe_wf', './_test_evemSafe_wfd', './_test_evemSafe_evps', './_test_evemSafe_werr']
    before(function() {
        process.on('uncaughtException', onUncaught)
        process.on('unhandledRejection', onUnhandled)
        for (let fd of fds) {
            fs.rmSync(fd, { recursive: true, force: true })
        }
    })
    after(function() {
        process.off('uncaughtException', onUncaught)
        process.off('unhandledRejection', onUnhandled)
        for (let fd of fds) {
            fs.rmSync(fd, { recursive: true, force: true })
        }
    })

    //collect, 僅收監聽器錯誤(fun==='listener'), 模組自身之error事件(如cache之fun:'get')不計
    let collector = () => {
        let errs = []
        let fn = (e) => {
            if (e && e.fun === 'listener') {
                errs.push({ name: e.name, msg: e.msg && e.msg.message })
            }
        }
        return { errs, fn }
    }

    it(`cache: message listener throwing under timer-decoupled emit → error event, get still works`, async function() {
        let oc = cache()
        let { errs, fn } = collector()
        oc.on('error', fn)
        oc.on('message', () => {
            throw new Error('boom')
        })
        oc.set('k', { fun: async () => 42, inputs: [], timeExpired: 30000 })
        let v = await oc.get('k')
        await waitFor(() => errs.length >= 1, 3000)
        assert.strict.deepStrictEqual(v, 42)
        assert.strict.deepStrictEqual(errs.length >= 1, true)
        assert.strict.deepStrictEqual(errs.every((e) => e.name === 'message' && e.msg === 'boom'), true)
    })

    it(`alive: message listener throwing inside setTimeout/setInterval → error events, other listener still gets enter/leave`, async function() {
        let oAL = alive({ timeAlive: 200, timeDetect: 30 })
        let { errs, fn } = collector()
        let ok = []
        oAL.on('error', fn)
        oAL.on('message', () => {
            throw new Error('boom')
        })
        oAL.on('message', (m) => {
            ok.push(m.eventName)
        })
        oAL.trigger('a', { x: 1 })
        await waitFor(() => ok.length >= 2, 3000)
        assert.strict.deepStrictEqual(ok, ['enter', 'leave'])
        assert.strict.deepStrictEqual(errs.map((e) => e.name), ['message', 'message'])
    })

    it(`cacheSt: detect listener throwing inside setInterval and set listener rejecting → error events`, async function() {
        let cs = cacheSt({ timeExpire: 10000, timeDetect: 30 })
        let { errs, fn } = collector()
        cs.on('error', fn)
        cs.on('detect', () => {
            throw new Error('boom')
        })
        cs.on('set', async () => {
            throw new Error('async-boom')
        })
        await cs.set('k', 1)
        await waitFor(() => errs.filter((e) => e.name === 'detect').length >= 2 && errs.some((e) => e.name === 'set'), 3000)
        cs.clear()
        assert.strict.deepStrictEqual(errs.filter((e) => e.name === 'detect').length >= 2, true)
        assert.strict.deepStrictEqual(errs.filter((e) => e.name === 'set'), [{ name: 'set', msg: 'async-boom' }])
    })

    it(`fsBuildReadStreamText: line listener throwing inside readline callback → error per line, other listener and close still fire`, async function() {
        let fd = './_test_evemSafe_rs'
        fs.mkdirSync(fd, { recursive: true })
        let fp = `${fd}/t.txt`
        fs.writeFileSync(fp, 'a\n中文\nc\n', 'utf8')
        let ev = fsBuildReadStreamText(fp)
        let { errs, fn } = collector()
        let lines = []
        ev.on('error', fn)
        ev.on('line', () => {
            throw new Error('boom')
        })
        ev.on('line', (l) => {
            lines.push(l)
        })
        await new Promise((resolve) => ev.on('close', resolve))
        assert.strict.deepStrictEqual(lines, ['a', '中文', 'c'])
        assert.strict.deepStrictEqual(errs.map((e) => e.name), ['line', 'line', 'line'])
    })

    it(`queue: async message listener rejecting → error event, other listener still gets the queue`, async function() {
        let q = queue(0)
        let { errs, fn } = collector()
        let got = []
        q.on('error', fn)
        q.on('message', async () => {
            throw new Error('async-boom')
        })
        q.on('message', (qs) => {
            got.push(qs.length)
        })
        q.push('x')
        await waitFor(() => errs.length >= 1 && got.length >= 1, 3000)
        assert.strict.deepStrictEqual(got, [1])
        assert.strict.deepStrictEqual(errs, [{ name: 'message', msg: 'async-boom' }])
    })

    it(`fsTask: change listener throwing (never resolving msg.pm) → pm rejected by policy so lock releases and next change still fires; error events`, async function() {
        let fdt = './_test_evemSafe_fsTask'
        let fdStorage = './_test_evemSafe_fsTask_storage'
        fs.mkdirSync(fdt, { recursive: true })
        let ev = fsTask(fdt, { timeInterval: 150, fdStorage })
        let { errs, fn } = collector()
        let changes = []
        let n = 0
        ev.on('error', fn)
        ev.on('change', (msg) => {
            n += 1
            changes.push(msg.fn)
            if (n === 1) {
                throw new Error('boom') //第1次拋錯且不resolve msg.pm; 若pm未被政策reject則lock永久卡住, 之後不會再有任何change
            }
            msg.pm.resolve() //之後正常完成: fsTask每tick只處理一個檔, 失敗者(hash未寫入)下tick會重試, 成功後才輪到下一個
        })
        fs.writeFileSync(`${fdt}/a.txt`, 'A', 'utf8')
        let okRetry = await waitFor(() => changes.length >= 2, 5000) //a.txt失敗後之重試, 即lock已釋放之證據
        fs.writeFileSync(`${fdt}/b.txt`, 'B', 'utf8')
        let okB = await waitFor(() => changes.includes('b.txt'), 5000)
        ev.clear()
        await delay(100)
        // console.log('fsTask changes', changes, errs)
        assert.strict.deepStrictEqual(changes[0], 'a.txt')
        assert.strict.deepStrictEqual(okRetry, true, 'lock 未釋放: 第 1 個 change 之 pm 未被 reject, 之後無任何 change')
        assert.strict.deepStrictEqual(okB, true, 'a.txt 重試成功後 b.txt 應被處理')
        assert.strict.deepStrictEqual(errs.filter((e) => e.name === 'change' && e.msg === 'boom').length, 1)
    })

    it(`fsTaskCp: src set listener throwing (sync emit) and tar change listener throwing (watcher+debounce, msg.pm rejected) → error events`, async function() {
        let fpc = './_test_evemSafe_tcpSrc'
        let fpt = './_test_evemSafe_tcpTar'
        let otk = fsTaskCp(fpc, fpt)
        let otkSrc = otk.buildSrc()
        let otkTar = otk.buildTar()
        let cSrc = collector()
        let cTar = collector()
        let sets = []
        let changes = []
        otkSrc.on('error', cSrc.fn)
        otkSrc.on('set', () => {
            throw new Error('src-boom')
        })
        otkSrc.on('set', (m) => {
            sets.push(m.fp)
        })
        otkTar.on('error', cTar.fn)
        otkTar.on('change', (msg) => {
            changes.push(msg.kpCmp.add.map((x) => x.fp))
            throw new Error('tar-boom') //不resolve msg.pm, 由政策reject
        })
        await delay(500) //待watcher就緒
        otkSrc.set('abc.txt', 'h1')
        await waitFor(() => changes.length >= 1, 8000)
        await delay(200)
        otkTar.clear()
        assert.strict.deepStrictEqual(sets, ['abc.txt'])
        assert.strict.deepStrictEqual(cSrc.errs, [{ name: 'set', msg: 'src-boom' }])
        assert.strict.deepStrictEqual(changes.length >= 1, true)
        assert.strict.deepStrictEqual(changes[0], ['abc.txt'])
        assert.strict.deepStrictEqual(cTar.errs.some((e) => e.name === 'change' && e.msg === 'tar-boom'), true)
        //msg.pm(pmm)被政策reject → 視為執行失敗, tar端紀錄不得更新(fpHash.json不存在或不含abc.txt)
        let fpTarHash = `${fpt}/fpHash.json`
        let kpTar = fs.existsSync(fpTarHash) ? JSON.parse(fs.readFileSync(fpTarHash, 'utf8')) : {}
        assert.strict.deepStrictEqual(Object.prototype.hasOwnProperty.call(kpTar, 'abc.txt'), false, 'change 監聽器失敗時 tar 紀錄不得更新')
    })

    it(`[review] fsTask: overlapping scans must not dispatch the same file again while its msg.pm is still pending (busy guard)`, async function() {
        let fdt = './_test_evemSafe_fsTask_race'
        let fdStorage = './_test_evemSafe_fsTask_race_storage'
        fs.rmSync(fdt, { recursive: true, force: true })
        fs.rmSync(fdStorage, { recursive: true, force: true })
        fs.mkdirSync(fdt, { recursive: true })
        for (let i = 0; i < 80; i++) {
            fs.writeFileSync(`${fdt}/f${i}.txt`, 'x'.repeat(20000), 'utf8')
        }
        //timeInterval遠小於單次掃描耗時, 使多輪掃描重疊; 監聽器刻意不settle pm
        let ev = fsTask(fdt, { timeInterval: 2, fdStorage })
        let changes = []
        ev.on('error', () => {})
        ev.on('change', (msg) => {
            changes.push(msg.fn)
        })
        await waitFor(() => changes.length >= 1, 8000)
        await delay(700)
        ev.clear()
        await delay(100)
        fs.rmSync(fdt, { recursive: true, force: true })
        fs.rmSync(fdStorage, { recursive: true, force: true })
        // console.log('race changes', changes)
        assert.strict.deepStrictEqual(changes.length >= 1, true)
        assert.strict.deepStrictEqual(changes.length, 1, `pm 未 settle 期間不得重複派工, got ${JSON.stringify(changes)}`)
    })

    it(`fsWatchFile: change listener throwing inside chokidar callback → error event, other listener still gets change`, async function() {
        let fd = './_test_evemSafe_wf'
        fs.mkdirSync(fd, { recursive: true })
        let fp = `${fd}/t.txt`
        fs.writeFileSync(fp, 'v1', 'utf8')
        let ev = fsWatchFile(fp, { timeInterval: 50 })
        let { errs, fn } = collector()
        let got = []
        ev.on('error', fn)
        ev.on('change', () => {
            throw new Error('boom')
        })
        ev.on('change', (m) => {
            got.push(m.type)
        })
        await waitFor(() => got.includes('add'), 8000) //watcher就緒後之初始add
        fs.writeFileSync(fp, 'v2', 'utf8')
        await waitFor(() => got.includes('change'), 10000)
        ev.clear()
        await delay(300)
        assert.strict.deepStrictEqual(got.includes('add') && got.includes('change'), true, `got=${JSON.stringify(got)}`)
        assert.strict.deepStrictEqual(errs.length, got.length)
        assert.strict.deepStrictEqual(errs.every((e) => e.name === 'change' && e.msg === 'boom'), true)
    })

    it(`fsWatchFolder: change listener throwing inside chokidar callback and inside timer-synthesized unlinkDir → error events; synthesized unlinkDir carries stats undefined`, async function() {
        let fd = './_test_evemSafe_wfd'
        fs.mkdirSync(fd, { recursive: true })
        let ev = fsWatchFolder(fd, { timeInterval: 50 })
        let { errs, fn } = collector()
        let got = []
        ev.on('error', fn)
        ev.on('change', () => {
            throw new Error('boom')
        })
        ev.on('change', (m) => {
            got.push({ type: m.type, hasStats: Object.prototype.hasOwnProperty.call(m, 'stats'), statsType: typeof m.stats })
        })
        await waitFor(() => got.some((g) => g.type === 'addDir'), 8000)
        fs.writeFileSync(`${fd}/t.txt`, 'v1', 'utf8')
        await waitFor(() => got.some((g) => g.type === 'add'), 10000)
        fs.rmSync(fd, { recursive: true, force: true }) //刪除受監聽資料夾本身 → 由timer合成unlinkDir
        await waitFor(() => got.some((g) => g.type === 'unlinkDir' && g.hasStats), 10000)
        ev.clear()
        await delay(300)
        let u = got.find((g) => g.type === 'unlinkDir' && g.hasStats)
        assert.strict.deepStrictEqual(u, { type: 'unlinkDir', hasStats: true, statsType: 'undefined' }, `got=${JSON.stringify(got)}`) //原碼誤塞fs.fstatSync函數(statsType='function')
        assert.strict.deepStrictEqual(errs.length, got.length)
        assert.strict.deepStrictEqual(errs.every((e) => e.name === 'change' && e.msg === 'boom'), true)
    })

    it(`fsEvem: listener throwing inside watcher callback → local error event (not broadcast as event file), other listener still gets message`, async function() {
        let fd = './_test_evemSafe_evps'
        let ev = fsEvem({ fd, timeInterval: 50 })
        let { errs, fn } = collector()
        let got = []
        ev.on('error', fn)
        ev.on('ping', () => {
            throw new Error('boom')
        })
        ev.on('ping', (m) => {
            got.push(m)
        })
        await delay(500) //待watcher就緒
        ev.emit('ping', { n: 1 })
        await waitFor(() => got.length >= 1 && errs.length >= 1, 10000)
        await delay(300)
        let files = fs.readdirSync(fd)
        ev.clear()
        await delay(300)
        assert.strict.deepStrictEqual(got, [{ n: 1 }])
        assert.strict.deepStrictEqual(errs, [{ name: 'ping', msg: 'boom' }])
        assert.strict.deepStrictEqual(files.includes('error'), false, `listener error 不得寫成事件檔廣播, files=${JSON.stringify(files)}`)
    })

    it(`fsWatchFolder: chokidar watcher error (EPERM on a permission-denied subfolder) → error { fun: 'watcher' } instead of crash [windows only]`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let fd = './_test_evemSafe_werr'
        let fdDeny = `${fd}/deny`
        let user = process.env.USERNAME
        let restore = () => {
            try {
                execSync(`icacls "${path.resolve(fdDeny)}" /remove:d "${user}"`, { stdio: 'ignore' })
            }
            catch (e) {}
            fs.rmSync(fd, { recursive: true, force: true })
        }
        restore()
        fs.mkdirSync(fdDeny, { recursive: true })
        fs.writeFileSync(`${fdDeny}/x.txt`, 'x', 'utf8')
        execSync(`icacls "${path.resolve(fdDeny)}" /deny "${user}:(OI)(CI)F"`, { stdio: 'ignore' })
        let denied = false
        try {
            fs.readdirSync(fdDeny)
        }
        catch (e) {
            denied = true
        }
        if (!denied) {
            restore()
            this.skip() //環境無法製造拒絕存取(如以管理員執行)
        }
        let errs = []
        let ev = fsWatchFolder(fd, { timeInterval: 50 })
        ev.on('change', () => {})
        ev.on('error', (e) => {
            errs.push({ fun: e.fun, code: e.msg && e.msg.code })
        })
        await waitFor(() => errs.length >= 1, 10000)
        ev.clear()
        await delay(300)
        restore()
        assert.strict.deepStrictEqual(errs.length >= 1, true)
        assert.strict.deepStrictEqual(errs[0], { fun: 'watcher', code: 'EPERM' })
    })

    it(`hygiene: no uncaughtException or unhandledRejection leaked from any module above`, async function() {
        await delay(300)
        assert.strict.deepStrictEqual([nUncaught, nUnhandled], [0, 0])
    })

})
