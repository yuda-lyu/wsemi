/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件驗證非預期之opt(iseint不拆包) */
import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { fileURLToPath } from 'url'
import execCli from '../src/execCli.mjs'
import execCliJsonRpc from '../src/execCliJsonRpc.mjs'
import execCliSession from '../src/execCliSession.mjs'
import fsTreeFolder from '../src/fsTreeFolder.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'
import crypto from 'crypto'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'
import fsTreeFolderWithHashCore from '../src/fsTreeFolderWithHashCore.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'
import isUserPw from '../src/isUserPw.mjs'
import dig from '../src/dig.mjs'
import parseNumOpt from '../src/_numOpt.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-h〈檢查「要拿來計算之opt」之處一律用ise*〉(使用者2026-11-12「2. 依你建議」)、§11第19～21項(Infinity之opt一律改用預設)、主控規則帳本G17(opt之數值以ise*判定)
//站點: execCli之maxRetries/retryDelayMs/timeoutMs/maxBuffer、execCliJsonRpc之timeoutMs、execCliSession之timeoutMs/exitGraceMs/killWaitMs/stderrKeep、fsTreeFolderCore之levelLimit、isUserPw之numLenMin/numLenMax/consecutiveCharsMinMatch、dig之idig
//觀察: 能以子行程之onTrace事件或回傳值於短時間觀察者以之斷言(Infinity等非預期改用預設); 只在很久之後才可觀察者(逾時毫秒)以opt.debug之警告斷言所判定之預設(警告與取值同一路徑optVal)


let __dirname = path.dirname(fileURLToPath(import.meta.url))
let nodeBin = process.execPath


//debug警告收集器
function mkWarn() {
    let ms = []
    return { ms, opt: { debug: true, funLog: (m) => ms.push(m) } }
}


//spyTimeouts, 側錄fn執行期間交給setTimeout之毫秒(不改變計時器行為), 直接驗證實際交給原生計時器之值(外審terra 11: 只驗警告抓不到「仍警告但使用舊夾限值」)
async function spyTimeouts(fn) {
    let ds = []
    let st = globalThis.setTimeout
    globalThis.setTimeout = function(f, ms, ...a) {
        ds.push(ms)
        return st.call(this, f, ms, ...a)
    }
    try {
        await fn()
    }
    finally {
        globalThis.setTimeout = st
    }
    return ds
}


//以onTrace收集事件, 並等待呼叫完成
async function runCli(args, opt) {
    let evs = []
    let r = await execCli(nodeBin, args, { ...opt, onTrace: (e) => evs.push(e) })
    return { r, evs }
}


describe(`opt numeric values judged by iseint(G17): execCli`, function() {

    beforeEach(function() {
        parseNumOpt.resetWarned()
    })

    afterEach(function() {
        parseNumOpt.resetWarned()
    })

    //maxRetries: Infinity改用預設0即不重試(修前: cint(Infinity)為Number.MAX_VALUE, 近乎無限重試); 以「第2次嘗試事件」或「done」先到者判定, 修前亦不懸置
    it(`maxRetries: Infinity, new Number(1), '0x10', 1.5, -1 should use default 0(no retry) [§11第19～21項, 語意反轉]`, async function() {
        let vs = [Infinity, new Number(1), '0x10', 1.5, -1]
        let out = []
        for (let v of vs) {
            let r = await new Promise((resolve) => {
                execCli(nodeBin, ['-e', 'process.exit(1)'], {
                    maxRetries: v,
                    retryDelayMs: 1,
                    onTrace: (e) => {
                        if (e.type === 'retry') {
                            resolve('retried')
                        }
                        if (e.type === 'done') {
                            resolve(`done n=${e.n} ${e.reason}`)
                        }
                    },
                })
            })
            out.push(r)
        }
        assert.strict.deepStrictEqual(out, vs.map(() => 'done n=1 exhausted'))
    })

    it(`maxRetries: valid count(1, '1') should retry once [有效值, 行為不改]`, async function() {
        let out = []
        for (let v of [1, '1']) {
            let { r, evs } = await runCli(['-e', 'process.exit(1)'], { maxRetries: v, retryDelayMs: 1 })
            out.push([r.attempts, evs.filter((e) => e.type === 'attempt').length])
        }
        assert.strict.deepStrictEqual(out, [[2, 2], [2, 2]])
    })

    //retryDelayMs: Infinity改用預設5000(修前: cint(Infinity)乘以重試次數後夾為15000)
    it(`retryDelayMs: Infinity should use default 5000(retry event ms is 5000) [§11第19～21項]`, async function() {
        this.timeout(60000)
        let { evs } = await runCli(['-e', 'process.exit(1)'], { maxRetries: 1, retryDelayMs: Infinity })
        assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'retry').map((e) => e.ms), [5000])
    })

    it(`retryDelayMs: valid value(1, '2') should be used [有效值, 行為不改]`, async function() {
        let out = []
        for (let v of [1, '2']) {
            let { evs } = await runCli(['-e', 'process.exit(1)'], { maxRetries: 1, retryDelayMs: v })
            out.push(evs.filter((e) => e.type === 'retry').map((e) => e.ms))
        }
        assert.strict.deepStrictEqual(out, [[1], [2]])
    })

    //timeoutMs: Infinity、超過計時器上限、'0x10'、包裝物件改用預設120000, 不夾至上限(修前: 夾至2147483647或採16); 逾時要120秒後才可觀察, 以debug警告斷言
    it(`timeoutMs: Infinity, 3e9, 2147483648, '0x10', new Number(300), 1.5 should use default 120000(not clamped) [§11第19～21項, K3超出範圍]`, async function() {
        let vs = [Infinity, 3e9, 2147483648, '0x10', new Number(300), 1.5]
        let out = []
        for (let v of vs) {
            parseNumOpt.resetWarned()
            let w = mkWarn()
            await execCli(nodeBin, ['-e', ''], { timeoutMs: v, ...w.opt })
            out.push(w.ms.filter((m) => m.startsWith('[wsemi execCli] invalid opt.timeoutMs: must be a valid integer') && m.endsWith('using default 120000')).length)
        }
        assert.strict.deepStrictEqual(out, vs.map(() => 1))
    })

    it(`timeoutMs: valid value('300') should be used(timeout event ms is 300) [有效值, 行為不改]`, async function() {
        let { r, evs } = await runCli(['-e', 'setTimeout(()=>{},30000)'], { timeoutMs: '300' })
        assert.strict.deepStrictEqual([evs.filter((e) => e.type === 'timeout').map((e) => e.ms), r.ok], [[300], false])
    })

    //maxBuffer: Infinity改用預設10MB(修前: Number.MAX_VALUE即不限); 子行程輸出11MB, 新版達10MB即full
    //超過count上限之4294967296亦以實際累積量驗證(外審terra複核M6: 只驗警告抓不到「仍警告但沿用原值」)
    it(`maxBuffer: Infinity and 4294967296 should use default 10485760(full event at 10485760, stdout cut at 10485760) [§11第19～21項, 實際使用之值]`, async function() {
        this.timeout(120000)
        let sc = 'let s="x".repeat(1024*1024);let n=0;function w(){while(n<11){n++;if(!process.stdout.write(s)){process.stdout.once("drain",w);return}}}w()'
        let out = []
        for (let v of [Infinity, 4294967296]) {
            let { r, evs } = await runCli(['-e', sc], { maxBuffer: v })
            let full = evs.filter((e) => e.type === 'full' && e.stream === 'stdout').map((e) => e.size)
            out.push([full, r.stdout.length])
        }
        assert.strict.deepStrictEqual(out, [[[10485760], 10485760], [[10485760], 10485760]])
    })

    it(`timeoutMs: Infinity and 3e9 should hand 120000(not 2147483647) to setTimeout; '300' should hand 300 [§11第19～21項, 實際使用之值]`, async function() {
        let out = []
        for (let v of [Infinity, 3e9, '300']) {
            let ds = await spyTimeouts(() => execCli(nodeBin, ['-e', ''], { timeoutMs: v }))
            out.push([ds.includes(120000), ds.includes(2147483647), ds.includes(300)])
        }
        assert.strict.deepStrictEqual(out, [[true, false, false], [true, false, false], [false, false, true]])
    })

    //maxBuffer: 個數(count, 1~4294967295; 外審terra 9), 超過者非預期改用預設
    it(`maxBuffer: 4294967296 should use default 10485760, 4294967295 is valid [count 上限]`, async function() {
        let out = []
        for (let v of [4294967296, 4294967295]) {
            parseNumOpt.resetWarned()
            let w = mkWarn()
            await execCli(nodeBin, ['-e', ''], { maxBuffer: v, ...w.opt })
            out.push(w.ms.filter((m) => m.startsWith('[wsemi execCli] invalid opt.maxBuffer: must be a valid integer') && m.endsWith('using default 10485760')).length)
        }
        assert.strict.deepStrictEqual(out, [1, 0])
    })

    //maxBuffer以片段為單位截止: 累積量未達上限時該片段整段累積, 達上限後之片段不再累積(JSDoc「超過部分將不再累積」)
    it(`maxBuffer: valid value('1048576') should be used(full at >= 1048576, far less than 3MB output) [有效值, 行為不改]`, async function() {
        this.timeout(60000)
        let sc = 'let s="x".repeat(1024*1024);let n=0;function w(){while(n<3){n++;if(!process.stdout.write(s)){process.stdout.once("drain",w);return}}}w()'
        let { r, evs } = await runCli(['-e', sc], { maxBuffer: '1048576' })
        let full = evs.filter((e) => e.type === 'full' && e.stream === 'stdout').map((e) => e.size)
        assert.strict.deepStrictEqual([full.length, full[0] >= 1048576, r.stdout.length < 2 * 1048576], [1, true, true])
    })

})


describe(`opt numeric values judged by iseint(G17): execCliJsonRpc, execCliSession`, function() {

    beforeEach(function() {
        parseNumOpt.resetWarned()
    })

    afterEach(function() {
        parseNumOpt.resetWarned()
    })

    //execCliJsonRpc之timeoutMs: Infinity等改用預設120000(修前: 原值轉交execCliSession後夾為2147483647)
    it(`execCliJsonRpc timeoutMs: Infinity, 3e9, '0x10', 1.5 should use default 120000 [§11第19～21項]`, async function() {
        let vs = [Infinity, 3e9, '0x10', 1.5]
        let out = []
        for (let v of vs) {
            parseNumOpt.resetWarned()
            let w = mkWarn()
            let r = await execCliJsonRpc(nodeBin, ['-e', 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'], [], { timeoutMs: v, ...w.opt })
            out.push([r.ok, w.ms.filter((m) => m.startsWith('[wsemi execCliJsonRpc] invalid opt.timeoutMs: must be a valid integer') && m.endsWith('using default 120000')).length])
        }
        assert.strict.deepStrictEqual(out, vs.map(() => [true, 1]))
    })

    it(`execCliJsonRpc timeoutMs: null(not given) should use default 120000 without warning [V5, 下游以null轉傳]`, async function() {
        let w = mkWarn()
        let r = await execCliJsonRpc(nodeBin, ['-e', 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'], [], { timeoutMs: null, ...w.opt })
        assert.strict.deepStrictEqual([r.ok, w.ms], [true, []])
    })

    it(`execCliJsonRpc timeoutMs: valid value('300') should be used(times out at 300ms) [有效值, 行為不改]`, async function() {
        let evs = []
        let r = await execCliJsonRpc(nodeBin, ['-e', 'process.stdin.resume()'], [{ method: 'never' }], { timeoutMs: '300', onTrace: (e) => evs.push(e) })
        assert.strict.deepStrictEqual([r.errorType, evs.filter((e) => e.type === 'timeout').map((e) => e.ms)], ['timeout', [300]])
    })

    //execCliSession之exitGraceMs: Infinity改用預設2000(修前: 夾為2147483647); stop事件之ms即exitGraceMs
    it(`execCliSession exitGraceMs: Infinity, 3e9, '0x10', 1.5, -1 should use default 2000 [§11第19～21項]`, async function() {
        let vs = [Infinity, 3e9, '0x10', 1.5, -1]
        let out = []
        for (let v of vs) {
            let evs = []
            let s = execCliSession(nodeBin, ['-e', 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'], { exitGraceMs: v, onTrace: (e) => evs.push(e) })
            await s.stop()
            out.push(evs.filter((e) => e.type === 'stop').map((e) => e.ms))
        }
        assert.strict.deepStrictEqual(out, vs.map(() => [2000]))
    })

    //killWaitMs: Infinity改用預設3000(修前: 夾為2147483647); 子行程不理會EOF, 寬限50ms後樹殺, kill事件之ms即killWaitMs
    it(`execCliSession killWaitMs: Infinity, '0x10', new Number(10) should use default 3000 [§11第19～21項]`, async function() {
        this.timeout(60000)
        let vs = [Infinity, '0x10', new Number(10)]
        let out = []
        for (let v of vs) {
            let evs = []
            let s = execCliSession(nodeBin, ['-e', 'setInterval(()=>{},1000)'], { exitGraceMs: 50, killWaitMs: v, onTrace: (e) => evs.push(e) })
            await s.stop()
            out.push(evs.filter((e) => e.type === 'kill').map((e) => e.ms))
        }
        assert.strict.deepStrictEqual(out, vs.map(() => [3000]))
    })

    it(`execCliSession exitGraceMs and killWaitMs: valid values('100', 0) should be used [有效值, 行為不改]`, async function() {
        let evs = []
        let s = execCliSession(nodeBin, ['-e', 'setInterval(()=>{},1000)'], { exitGraceMs: '100', killWaitMs: 0, onTrace: (e) => evs.push(e) })
        await s.stop()
        assert.strict.deepStrictEqual([evs.filter((e) => e.type === 'stop').map((e) => e.ms), evs.filter((e) => e.type === 'kill').map((e) => e.ms)], [[100], [0]])
    })

    //stderrKeep: Infinity改用預設4000(修前: Number.MAX_VALUE即全部保留)
    it(`execCliSession stderrKeep: Infinity, '0x10', 1.5 should use default 4000(keeps last 4000 chars) [§11第19～21項]`, async function() {
        let out = []
        for (let v of [Infinity, '0x10', 1.5]) {
            let r = await runStderr(5000, v)
            out.push(r.stderr.length)
        }
        assert.strict.deepStrictEqual(out, [4000, 4000, 4000])
    })

    it(`execCliSession stderrKeep: valid value('10', 0) should be used [有效值, 行為不改]`, async function() {
        let r1 = await runStderr(50, '10')
        let r2 = await runStderr(50, 0)
        assert.strict.deepStrictEqual([r1.stderr.length, r2.stderr.length], [10, 0])
    })

    //timeoutMs: Infinity等改用預設null(不限制)(修前: 夾為2147483647); 不限制與約24.8天無從於短時間觀察, 以debug警告斷言
    it(`execCliJsonRpc timeoutMs Infinity hands 120000 to execCliSession's setTimeout; execCliSession timeoutMs Infinity sets no 2147483647 timer, '300' sets 300 [實際使用之值]`, async function() {
        let sc = 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'
        let dsRpc = await spyTimeouts(() => execCliJsonRpc(nodeBin, ['-e', sc], [], { timeoutMs: Infinity }))
        let dsS1 = await spyTimeouts(() => execCliSession(nodeBin, ['-e', sc], { timeoutMs: Infinity }).stop())
        let dsS2 = await spyTimeouts(() => execCliSession(nodeBin, ['-e', sc], { timeoutMs: '300' }).stop())
        //session之Infinity不限時: 除stop之寬限計時器(exitGraceMs 2000)外不得建立任何計時器(外審terra複核11: 不只排除特定毫秒數)
        assert.strict.deepStrictEqual([
            dsRpc.includes(120000), dsRpc.includes(2147483647),
            dsS1.filter((d) => d !== 2000),
            dsS2.includes(300),
        ], [true, false, [], true])
    })

    //V11: 本層與下層之opt.debug於全部業務鍵讀完後才讀, 且只讀一次(外審terra第5、6條與複核N3)
    it(`execCliSession and execCliJsonRpc should read opt.debug once, after all business keys, and still warn for every invalid key [V11, 外審terra 5、6、N3]`, async function() {
        let sc = 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'
        let mkOpt = (order, ms) => ({
            timeoutMs: 'bad',
            get exitGraceMs() {
                order.push('exitGraceMs')
                return this._eg
            },
            _eg: Infinity,
            get debug() {
                order.push('debug')
                let first = !this._read
                this._read = true
                this._eg = 1234 //若早於exitGraceMs讀取即會改變其值
                return first //首次true其後false: 只讀一次者兩個警告皆在
            },
            funLog: (m) => ms.push(m),
        })
        let out = []
        //session
        parseNumOpt.resetWarned()
        let o1 = []
        let m1 = []
        let evs1 = []
        let opt1 = mkOpt(o1, m1) //直接傳入帶存取器之物件(展開會先行觸發存取器)
        opt1.onTrace = (e) => evs1.push(e)
        await execCliSession(nodeBin, ['-e', sc], opt1).stop()
        out.push([o1.filter((k) => k === 'debug').length, o1.indexOf('debug') > o1.indexOf('exitGraceMs'), evs1.filter((e) => e.type === 'stop').map((e) => e.ms), m1.length])
        //jsonrpc
        parseNumOpt.resetWarned()
        let o2 = []
        let m2 = []
        let evs2 = []
        let opt2 = mkOpt(o2, m2)
        opt2.onTrace = (e) => evs2.push(e)
        await execCliJsonRpc(nodeBin, ['-e', sc], [], opt2)
        out.push([o2.filter((k) => k === 'debug').length, o2.indexOf('debug') > o2.indexOf('exitGraceMs'), evs2.filter((e) => e.type === 'stop').map((e) => e.ms), m2.length])
        parseNumOpt.resetWarned()
        //session: timeoutMs與exitGraceMs兩個警告; jsonrpc: 本層timeoutMs與session之exitGraceMs兩個警告; exitGraceMs皆為預設2000(未被debug之存取器改成1234)
        assert.strict.deepStrictEqual(out, [[1, true, [2000], 2], [1, true, [2000], 2]])
    })

    //有效值時不讀debug(外審terra複核N3): levelLimit有效之WithHash路徑
    it(`fsTreeFolderWithHash should not read opt.debug when levelLimit is valid, and read it once when invalid [V11, 外審terra複核N3]`, async function() {
        let fd2 = path.join(__dirname, '_tmp', `ws430-dbg-${process.pid}`)
        fs.rmSync(fd2, { recursive: true, force: true })
        fs.mkdirSync(fd2, { recursive: true })
        fs.writeFileSync(path.join(fd2, 'a.txt'), 'a')
        try {
            //Core直呼: 有效值不讀、無效值讀一次
            let n = 0
            let optCore = {
                path,
                fs,
                crypto,
                get debug() {
                    n++
                    return false
                },
            }
            await fsTreeFolderWithHashCore(fd2, 1, optCore)
            let n1 = n
            await fsTreeFolderWithHashCore(fd2, Infinity, optCore)
            let n2 = n
            //公開包裝以{ ...opt }展開(既有寫法)時已讀各鍵一次, 其後只用副本: 每次呼叫至多讀一次
            let m = 0
            let opt = {
                get debug() {
                    m++
                    return false
                },
            }
            await fsTreeFolderWithHash(fd2, 1, opt)
            let m1 = m
            await fsTreeFolderWithHash(fd2, Infinity, opt)
            assert.strict.deepStrictEqual([n1, n2, m1, m], [0, 1, 1, 2])
        }
        finally {
            fs.rmSync(fd2, { recursive: true, force: true })
        }
    })

    //execCliJsonRpc轉交debug、funLog, 使execCliSession對原樣轉交之exitGraceMs之非預期亦警告(外審terra 6)
    it(`execCliJsonRpc should forward opt.debug/opt.funLog so that execCliSession warns on invalid exitGraceMs [R-OPT-VAL-01 debug]`, async function() {
        let w = mkWarn()
        let evs = []
        await execCliJsonRpc(nodeBin, ['-e', 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'], [], { exitGraceMs: Infinity, onTrace: (e) => evs.push(e), ...w.opt })
        assert.strict.deepStrictEqual([
            w.ms.filter((m) => m.startsWith('[wsemi execCliSession] invalid opt.exitGraceMs: must be a valid integer') && m.endsWith('using default 2000')).length,
            evs.filter((e) => e.type === 'stop').map((e) => e.ms),
        ], [1, [2000]])
    })

    it(`execCliSession timeoutMs: Infinity, 3e9, '0x10', 1.5 should use default null(no limit) [§11第19～21項]`, async function() {
        let vs = [Infinity, 3e9, '0x10', 1.5]
        let out = []
        for (let v of vs) {
            parseNumOpt.resetWarned()
            let w = mkWarn()
            let s = execCliSession(nodeBin, ['-e', 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0))'], { timeoutMs: v, ...w.opt })
            let r = await s.stop()
            out.push([r.timeout, w.ms.filter((m) => m.startsWith('[wsemi execCliSession] invalid opt.timeoutMs: must be a valid integer') && m.endsWith('using default null (no limit)')).length])
        }
        assert.strict.deepStrictEqual(out, vs.map(() => [false, 1]))
    })

})


//子行程輸出n個字元至stderr後等待EOF; 以onStderr事件確認已收到n個字元(事件同步, 不以延時)後stop取結果
async function runStderr(n, stderrKeep) {
    let got = 0
    let ready = null
    let pReady = new Promise((resolve) => {
        ready = resolve
    })
    let s = execCliSession(nodeBin, ['-e', `process.stderr.write("e".repeat(${n}));process.stdin.resume();process.stdin.on("end",()=>{})`], {
        stderrKeep,
        onStderr: (c) => {
            got += String(c).length
            if (got >= n) {
                ready()
            }
        },
    })
    await pReady
    return s.stop()
}


describe(`opt numeric values judged by iseint(G17): fsTreeFolderCore levelLimit`, function() {

    let fd = path.join(__dirname, '_tmp', `ws430-tree-${process.pid}`)

    before(function() {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(path.join(fd, 'a', 'b', 'c'), { recursive: true })
        fs.writeFileSync(path.join(fd, 'f1.txt'), '1')
        fs.writeFileSync(path.join(fd, 'a', 'f2.txt'), '2')
        fs.writeFileSync(path.join(fd, 'a', 'b', 'f3.txt'), '3')
        fs.writeFileSync(path.join(fd, 'a', 'b', 'c', 'f4.txt'), '4')
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
    })

    let maxLevel = (rs) => Math.max(...rs.map((v) => v.level))

    //levelLimit: Infinity、小數、'0x10'、包裝物件改用預設1(修前: Infinity與'0x10'為無窮遍歷、2.5為2層、包裝物件採其值)
    it(`levelLimit: Infinity, 2.5, '0x10', new Number(3), 0, -1, 'abc' should use default 1 [§11第19～21項]`, function() {
        let vs = [Infinity, 2.5, '0x10', new Number(3), 0, -1, 'abc']
        let out = vs.map((v) => maxLevel(fsTreeFolder(fd, v)))
        assert.strict.deepStrictEqual(out, vs.map(() => 1))
    })

    //count上限(外審terra 16): 4294967295有效(遍歷全部4層), 4294967296非預期改用預設1
    it(`levelLimit: 4294967295 is valid, 4294967296 uses default 1 [count 上限]`, function() {
        assert.strict.deepStrictEqual([maxLevel(fsTreeFolder(fd, 4294967295)), maxLevel(fsTreeFolder(fd, 4294967296))], [4, 1])
    })

    //有opt物件之對外函數轉交debug、funLog(外審terra 7, R-OPT-VAL-01規則4): fsTreeFolderWithHash、fsGetFilesWithHashInFolder
    it(`fsTreeFolderWithHash and fsGetFilesWithHashInFolder should warn on invalid levelLimit when opt.debug is true, and use default 1 [R-OPT-VAL-01 debug, 接線]`, async function() {
        let out = []
        for (let f of [fsTreeFolderWithHash, fsGetFilesWithHashInFolder]) {
            parseNumOpt.resetWarned()
            let w = mkWarn()
            let rs = await f(fd, Infinity, { ...w.opt })
            out.push([maxLevel(rs), w.ms.filter((m) => m.startsWith('[wsemi fsTreeFolderCore] invalid levelLimit: must be a valid integer') && m.endsWith('using default 1')).length])
        }
        assert.strict.deepStrictEqual(out, [[1, 1], [1, 1]])
    })

    it(`levelLimit: null should traverse all levels, valid values(2, '3') should be used [行為不改]`, function() {
        assert.strict.deepStrictEqual([maxLevel(fsTreeFolder(fd, null)), maxLevel(fsTreeFolder(fd, 2)), maxLevel(fsTreeFolder(fd, '3'))], [4, 2, 3])
    })

    it(`fsGetFilesInFolder should pass levelLimit to fsTreeFolderCore(Infinity uses default 1) [接線]`, function() {
        let names = (rs) => rs.map((v) => v.name).sort()
        assert.strict.deepStrictEqual([names(fsGetFilesInFolder(fd, Infinity)), names(fsGetFilesInFolder(fd, null))], [['f1.txt'], ['f1.txt', 'f2.txt', 'f3.txt', 'f4.txt']])
    })

})


describe(`opt numeric values judged by iseint(G17): isUserPw`, function() {

    let base = { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] }
    let chk = (pw, opt) => {
        try {
            return isUserPw(pw, { ...base, ...opt })
        }
        catch (err) {
            return err.message
        }
    }

    //numLenMin: Infinity改用預設8(修前: Number.MAX_VALUE使任何密碼不合格)
    it(`numLenMin: Infinity, 1.5, -1, '0x10', new Number(2) should use default 8 [§11第19～21項]`, function() {
        let vs = [Infinity, 1.5, -1, '0x10', new Number(2)]
        let out = vs.map((v) => [chk('Ab@12345', { numLenMin: v }), chk('Ab@1234', { numLenMin: v })])
        assert.strict.deepStrictEqual(out, vs.map(() => [true, 'keyLimNumLenMin']))
    })

    //numLenMax: Infinity改用預設30(修前: 不限長)
    it(`numLenMax: Infinity, 1.5, '0x10' should use default 30 [§11第19～21項]`, function() {
        let pw31 = 'Ab@1' + 'x'.repeat(27)
        let pw30 = 'Ab@1' + 'x'.repeat(26)
        let vs = [Infinity, 1.5, '0x10']
        let out = vs.map((v) => [chk(pw30, { numLenMax: v }), chk(pw31, { numLenMax: v })])
        assert.strict.deepStrictEqual(out, vs.map(() => [true, 'keyLimNumLenMax']))
    })

    //consecutiveCharsMinMatch: Infinity改用預設3(修前: 帳號長度恆小於MAX_VALUE而不比對)
    it(`consecutiveCharsMinMatch: Infinity, 1.5, 0, '0x10' should use default 3 [§11第19～21項]`, function() {
        let vs = [Infinity, 1.5, 0, '0x10']
        let out = vs.map((v) => chk('Qabc@123x', { account: 'zabcz', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: v }))
        assert.strict.deepStrictEqual(out, vs.map(() => 'keyLimConsecutiveCharsFromAccount'))
    })

    it(`numLenMin/numLenMax/consecutiveCharsMinMatch: valid values('10', 9, '4') should be used [有效值, 行為不改]`, function() {
        assert.strict.deepStrictEqual([
            chk('Ab@12345', { numLenMin: '10' }),
            chk('Ab@123456', { numLenMax: 9 }),
            chk('Qabc@123x', { account: 'zabcz', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: '4' }),
        ], ['keyLimNumLenMin', true, true])
    })

})


describe(`opt numeric values judged by iseint(G17): dig idig`, function() {

    //idig: Infinity、超過100、負數、小數、'0x10'、包裝物件改用預設0(修前: Infinity與101拋RangeError, 負數與小數回'')
    it(`idig: Infinity, 101, -1, 2.5, '0x10', new Number(2), 'abc' should use default 0 [§11第19～21項]`, function() {
        let vs = [Infinity, 101, -1, 2.5, '0x10', new Number(2), 'abc']
        let out = vs.map((v) => {
            try {
                return dig(1.25, v)
            }
            catch (err) {
                return 'throw'
            }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => '1'))
    })

    it(`idig: valid values(2, '3', 0, 100) should be used [有效值, 行為不改]`, function() {
        let out = [dig(1.25, 2), dig(1.25, '3'), dig(1.25, 0), dig(1.25, 100).length]
        assert.strict.deepStrictEqual(out, ['1.25', '1.250', '1', 102])
    })

})
