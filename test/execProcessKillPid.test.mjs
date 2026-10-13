import assert from 'assert'
import cp from 'child_process'
import execProcessKillPid from '../src/execProcessKillPid.mjs'


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

    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    it(`should resolve with success message and actually terminate the process`, async function() {
        let child = cp.spawn(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'])
        child.on('error', () => {}) //避免killed後unhandled error
        //等子進程啟動
        await delay(200)
        assert.strict.deepStrictEqual(isAlive(child.pid), true)

        let r = await execProcessKillPid(child.pid)
        // console.log('kill r', r)
        assert.strict.deepStrictEqual(typeof r === 'string' && r.includes(`pid[${child.pid}] killed`), true)

        //給OS一點時間真的清掉進程後再驗證
        await delay(300)
        assert.strict.deepStrictEqual(isAlive(child.pid), false)
    })

    it(`should accept pid as string (auto-converted to number)`, async function() {
        let child = cp.spawn(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'])
        child.on('error', () => {})
        await delay(200)

        let r = await execProcessKillPid(String(child.pid))
        // console.log('string pid r', r)
        assert.strict.deepStrictEqual(typeof r === 'string' && r.includes('killed'), true)

        await delay(300)
        assert.strict.deepStrictEqual(isAlive(child.pid), false)
    })

    it(`should kill grandchild process tree (parent + grandchild both terminated)`, async function() {
        //父node spawn子node, 父把子pid寫到stdout, 兩層都長活30s
        let script = [
            'const cp = require("child_process")',
            'const sub = cp.spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"])',
            'process.stdout.write(String(sub.pid))',
            'setTimeout(() => {}, 30000)',
        ].join(';')

        let child = cp.spawn(nodeBin, ['-e', script])
        child.on('error', () => {})
        let buf = ''
        child.stdout.on('data', (d) => {
            buf += d.toString()
        })

        //等父子進程啟動且grandchildPid流出
        await delay(500)
        let grandchildPid = parseInt(buf.trim(), 10)
        // console.log('parent', child.pid, 'grandchild', grandchildPid)
        assert.strict.deepStrictEqual(isAlive(child.pid), true)
        assert.strict.deepStrictEqual(isAlive(grandchildPid), true)

        //對父pid呼叫kill, tree-kill應連帶幹掉孫子
        await execProcessKillPid(child.pid)

        //給OS時間清理整棵樹
        await delay(500)

        assert.strict.deepStrictEqual(isAlive(child.pid), false)
        assert.strict.deepStrictEqual(isAlive(grandchildPid), false)
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

})
