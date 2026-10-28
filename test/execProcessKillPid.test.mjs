import assert from 'assert'
import cp from 'child_process'
import execProcessKillPid from '../src/execProcessKillPid.mjs'
import { revoked, thrower } from './tools/codecThrown.mjs'
import { withGuard, untilTrue, reapTree, waitExit, waitStdout, recTrace, fiveOnTrace, collectUnhandled } from './tools/execTraceKit.mjs'


describe(`execProcessKillPid`, function() {

    let nodeBin = process.execPath

    //isAlive, 用signal 0檢查pid是否還存在(不真的送signal); 若process已結束process.kill會丟ESRCH
    let isAlive = (pid) => {
        try {
            process.kill(pid, 0)
            return true
        }
        catch (e) {
            return false
        }
    }

    //startChild, 啟動長活(30s)之子進程並回傳{ child, ready, exited }: ready於子進程輸出就緒標記(stdout含'ready\n')時resolve, exited於子進程exit事件時resolve; 子進程啟動與結束皆以可觀察事件為準, 不以固定等待
    let sReady = 'process.stdout.write("ready\\n");setTimeout(() => {}, 30000)'
    let startChild = (script) => {
        let child = cp.spawn(nodeBin, ['-e', script], { windowsHide: true })
        child.on('error', () => {}) //避免killed後unhandled error
        let ready = waitStdout(child, /ready\n/)
        let exited = waitExit(child)
        return { child, ready, exited }
    }

    //reapChild, 案例收尾: 子進程仍未結束(被測函數缺陷或斷言先失敗)時殺樹並回驗
    let reapChild = async (child, exited) => {
        if (!exited.st.done) {
            assert.strict.deepStrictEqual(await reapTree(child.pid), true, `leftover child process ${child.pid}`)
        }
    }

    it(`should resolve with success message and actually terminate the process`, async function() {
        //JSDoc returns: resolve回傳成功訊息`pid[N] killed`; 子進程啟動以其輸出之就緒標記為準, kill後以子進程之exit事件為準(不以固定等待)
        let { child, ready, exited } = startChild(sReady)
        try {
            await withGuard(ready, 15000, 'child ready')
            assert.strict.deepStrictEqual(isAlive(child.pid), true)

            let r = await execProcessKillPid(child.pid)
            // console.log('kill r', r)
            assert.strict.deepStrictEqual(typeof r === 'string' && r.includes(`pid[${child.pid}] killed`), true)

            //子進程已被終止: 等exit事件後該pid即不存在
            await withGuard(exited, 15000, 'child exit')
            assert.strict.deepStrictEqual(isAlive(child.pid), false)
        }
        finally {
            await reapChild(child, exited)
        }
    })

    it(`should accept pid as string (auto-converted to number)`, async function() {
        //JSDoc pid: Number|String; 同上, 以就緒標記與exit事件同步
        let { child, ready, exited } = startChild(sReady)
        try {
            await withGuard(ready, 15000, 'child ready')

            let r = await execProcessKillPid(String(child.pid))
            // console.log('string pid r', r)
            assert.strict.deepStrictEqual(typeof r === 'string' && r.includes('killed'), true)

            await withGuard(exited, 15000, 'child exit')
            assert.strict.deepStrictEqual(isAlive(child.pid), false)
        }
        finally {
            await reapChild(child, exited)
        }
    })

    it(`should kill grandchild process tree (parent + grandchild both terminated)`, async function() {
        //JSDoc: 強制關閉指定PID程序及其子孫程序; 父node spawn子node, 父把子pid(以換行結尾)寫到stdout, 兩層都長活30s; 父子啟動以pid輸出為就緒標記, kill後父以exit事件、孫(非本行程之子行程, 無exit事件)以條件輪詢process.kill(pid,0)直到不存在(防懸置上限用真實計時器)
        //孫以detached啟動: Windows下libuv使非detached之子行程隨父node(job object)一併結束, 只殺父pid孫也會死, 無法分辨是否真的樹殺; detached者不在父之job內, 孫須靠tree-kill依親子關係遞迴才會被終止
        let script = [
            'const cp = require("child_process")',
            'const sub = cp.spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], { detached: true, stdio: "ignore", windowsHide: true })',
            'process.stdout.write(String(sub.pid) + "\\n")',
            'setTimeout(() => {}, 30000)',
        ].join(';')

        let child = cp.spawn(nodeBin, ['-e', script], { windowsHide: true })
        child.on('error', () => {})
        let ready = waitStdout(child, /^\d+\n/)
        let exited = waitExit(child)
        let grandchildPid = null
        try {
            let buf = await withGuard(ready, 15000, 'grandchild pid')
            grandchildPid = parseInt(buf.trim(), 10)
            // console.log('parent', child.pid, 'grandchild', grandchildPid)
            assert.strict.deepStrictEqual(isAlive(child.pid), true)
            assert.strict.deepStrictEqual(isAlive(grandchildPid), true)

            //對父pid呼叫kill, tree-kill應連帶幹掉孫子
            await execProcessKillPid(child.pid)

            //整棵樹清理完成: 父exit事件、孫不存在
            await withGuard(exited, 15000, 'parent exit')
            await untilTrue(() => !isAlive(grandchildPid), { what: `grandchild ${grandchildPid} gone` })

            assert.strict.deepStrictEqual(isAlive(child.pid), false)
            assert.strict.deepStrictEqual(isAlive(grandchildPid), false)
        }
        finally {
            await reapChild(child, exited)
            if (Number.isInteger(grandchildPid) && isAlive(grandchildPid)) {
                assert.strict.deepStrictEqual(await reapTree(grandchildPid), true, `leftover grandchild process ${grandchildPid}`)
            }
        }
    })

    it(`should complete without hanging when killing a non-existent pid`, async function() {
        //取個極不可能存在的PID; 萬一系統剛好有, 跳過
        let fakePid = 999999
        if (isAlive(fakePid)) {
            this.skip()
            return
        }
        //tree-kill對不存在pid的行為跨平台分歧:
        //- Windows: taskkill失敗 → reject
        //- Linux/macOS: process.kill拋ESRCH被tree-kill內部吞掉 → resolve
        //本測試只驗證「不會hang」, 兩種行為都接受
        let completed = false
        try {
            await execProcessKillPid(fakePid)
            completed = true
        }
        catch (e) {
            completed = true
        }
        assert.strict.deepStrictEqual(completed, true)
    })

    //--- 失敗回報: reject錯誤訊息字串, 與resolve之pid[N] killed對稱 ---

    it(`should reject a string pid[N] kill failed when pid is not a number`, async function() {
        let rs = []
        for (let pid of ['abc', undefined]) {
            try {
                await execProcessKillPid(pid)
                rs.push('resolved')
            }
            catch (e) {
                rs.push(e)
            }
        }
        //P08a
        assert.strict.deepStrictEqual(rs, ['pid[abc] kill failed: pid must be a number', 'pid[undefined] kill failed: pid must be a number'])
    })

    it(`should reject a string pid[N] kill failed when killing a non-existent pid on win32`, async function() {
        //posix下tree-kill吞掉ESRCH而resolve(見上一案), 僅win32之taskkill失敗會reject
        let fakePid = 999999
        if (process.platform !== 'win32' || isAlive(fakePid)) {
            this.skip()
        }
        let err = null
        try {
            await execProcessKillPid(fakePid)
        }
        catch (e) {
            err = e
        }
        //P08b
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith(`pid[${fakePid}] kill failed: `), true)
    })

    //--- 觀察回調(opt.onTrace): 事件語意與P3/P4(規則見sgud/rule/rulebook_timer.md之R-TRACE-01) ---

    describe(`觀察回調(opt.onTrace)`, function() {

        let toRes = (pm) => pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))

        it(`should notify start then done with the pid and notify done before the promise resolves`, async function() {
            //JSDoc onTrace: start為即將呼叫tree-kill(pid)、done為tree-kill回報成功而即將resolve(pid); 事件皆於resolve之前通知
            let { child, ready, exited } = startChild(sReady)
            let tr = recTrace({ guard: 12000 })
            let order = []
            let onTrace = (e) => {
                order.push(e.type)
                tr.on(e)
            }
            try {
                await withGuard(ready, 15000, 'child ready')
                let r = await toRes(execProcessKillPid(child.pid, { onTrace }).then((v) => {
                    order.push('resolved')
                    return v
                }))
                await withGuard(exited, 15000, 'child exit')
                assert.strict.deepStrictEqual(r, { s: 'resolve', v: `pid[${child.pid}] killed` })
                assert.strict.deepStrictEqual(tr.events, [{ type: 'start', pid: child.pid }, { type: 'done', pid: child.pid }])
                assert.strict.deepStrictEqual(order, ['start', 'done', 'resolved'])
            }
            finally {
                await reapChild(child, exited)
            }
        })

        it(`should notify start with a null pid then fail with the message when pid is not a finite number`, async function() {
            //JSDoc onTrace: start之pid為傳給tree-kill之數字, 非有限數字者為null; fail為tree-kill回報失敗而即將reject(pid、msg為reject訊息冒號後之錯誤訊息)
            for (let pid of ['abc', undefined, Infinity]) {
                let tr = recTrace({ guard: 12000 })
                let r = await toRes(execProcessKillPid(pid, { onTrace: tr.on }))
                assert.strict.deepStrictEqual(r, { s: 'reject', v: `pid[${pid}] kill failed: pid must be a number` }, String(pid))
                assert.strict.deepStrictEqual(tr.events, [{ type: 'start', pid: null }, { type: 'fail', pid: null, msg: 'pid must be a number' }], String(pid))
            }
        })

        it(`should notify fail with the same message as the rejection when killing a non-existent pid on win32`, async function() {
            //JSDoc onTrace: fail之msg為reject訊息中冒號後之錯誤訊息; posix下tree-kill吞掉ESRCH而resolve, 僅win32之taskkill失敗會reject
            let fakePid = 999999
            if (process.platform !== 'win32' || isAlive(fakePid)) {
                this.skip()
            }
            let tr = recTrace({ guard: 12000 })
            let r = await toRes(execProcessKillPid(fakePid, { onTrace: tr.on }))
            assert.strict.deepStrictEqual(r.s, 'reject')
            assert.strict.deepStrictEqual(tr.events.map((e) => e.type), ['start', 'fail'])
            assert.strict.deepStrictEqual([tr.events[0].pid, tr.events[1].pid, typeof tr.events[1].msg], [fakePid, fakePid, 'string'])
            assert.strict.deepStrictEqual(r.v, `pid[${fakePid}] kill failed: ${tr.events[1].msg}`)
        })

        it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
            //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響本函數、不產生未處理之rejection; 含殺存活子進程、pid非數字、opt不可讀(已撤銷之Proxy、onTrace之getter拋錯)與opt非物件
            let un = collectUnhandled()
            let rec = recTrace({ guard: 12000 })
            let got = []
            try {
                for (let onTrace of fiveOnTrace(rec.on)) {
                    let { child, ready, exited } = startChild(sReady)
                    try {
                        await withGuard(ready, 15000, 'child ready')
                        let a = await toRes(execProcessKillPid(child.pid, { onTrace }))
                        await withGuard(exited, 15000, 'child exit')
                        if (a.s === 'resolve') {
                            a.v = a.v.replace(String(child.pid), 'N')
                        }
                        let b = await toRes(execProcessKillPid('abc', { onTrace }))
                        let optGetter = Object.defineProperty({}, 'onTrace', { enumerable: true, get: thrower(new Error('trace getter boom')) })
                        let c = await toRes(execProcessKillPid('abc', optGetter))
                        let d = await toRes(execProcessKillPid('abc', revoked()))
                        let e = []
                        for (let o of [0, null, 'abc', []]) {
                            e.push(await toRes(execProcessKillPid('abc', o)))
                        }
                        got.push([a, b, c, d, e, isAlive(child.pid)])
                    }
                    finally {
                        await reapChild(child, exited)
                    }
                }
                await new Promise((resolve) => setImmediate(resolve))
                await new Promise((resolve) => setImmediate(resolve))
            }
            finally {
                un = un.stop()
            }
            let bad = { s: 'reject', v: 'pid[abc] kill failed: pid must be a number' }
            let one = [{ s: 'resolve', v: 'pid[N] killed' }, bad, bad, bad, [bad, bad, bad, bad], false]
            assert.strict.deepStrictEqual(got, [one, one, one, one, one])
            assert.strict.deepStrictEqual(un, [])
            //紀錄器確有收到事件
            assert.strict.deepStrictEqual(rec.types(), ['start', 'done', 'start', 'fail'])
        })

        it(`should notify frozen events of primitive fields fixed per type, with no receiver`, async function() {
            //JSDoc onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
            let tr = recTrace({ guard: 12000 })
            let { child, ready, exited } = startChild(sReady)
            try {
                await withGuard(ready, 15000, 'child ready')
                await execProcessKillPid(child.pid, { onTrace: tr.on }) //start、done
                await withGuard(exited, 15000, 'child exit')
                await toRes(execProcessKillPid('abc', { onTrace: tr.on })) //start、fail
            }
            finally {
                await reapChild(child, exited)
            }
            let keys = {}
            for (let e of tr.events) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { start: 'pid,type', done: 'pid,type', fail: 'msg,pid,type' })
            assert.strict.deepStrictEqual(tr.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            assert.strict.deepStrictEqual(tr.meta.length === tr.events.length && tr.meta.every(([self, frozen]) => self === undefined && frozen), true)
        })

    })

})
