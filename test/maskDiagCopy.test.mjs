import assert from 'assert'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import maskDiagCopy from '../src/maskDiagCopy.mjs'
import diagSuite from './tools/diagSuite.mjs'


//maskDiagCopy為診斷細節之遮罩拷貝, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01


//runHook, E14子行程: 載入前掛名為name之prepareStackTrace hook
let runHook = (name) => {
    let r = spawnSync(process.execPath, [fileURLToPath(new URL('./tools/diagPrepHookChild.mjs', import.meta.url)), name], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
    return JSON.parse(String(r.stdout).trim())
}


describe(`maskDiagCopy`, function() {

    it(`E14 known limitation: a user hook named ErrorPrepareStackTrace installed before loading is indistinguishable (recorded behavior)`, function() {
        //設計§6.4條件②之已知限制(語料E14): 載入前已掛同名之使用端hook無法分辨, hook會被呼叫; 記錄實際行為, 行為改變時本案提醒更新文件
        assert.strict.deepStrictEqual(runHook('ErrorPrepareStackTrace'), { hits: 1, stack: 'hooked-stack' })
    })

    it(`E14 control: a hook with another name installed before loading is not called`, function() {
        //設計§6.4條件②: 快照非undefined且非Node內建預設之名稱者一律視為不安全, stack為[Stack unavailable]
        assert.strict.deepStrictEqual(runHook('myHook'), { hits: 0, stack: '[Stack unavailable]' })
    })

    it(`should never throw for any input and return primitives as is`, function() {
        //dspec D4: 永不拋錯; 秘密參數無法當作清單者(型別不合)fail-closed為[Uncopyable](diag-run03 terra #10: 不當作空清單)
        let vs = [undefined, null, true, 1, 'a', 1n, Symbol('x')]
        for (let v of vs) {
            let r = maskDiagCopy(v)
            assert.strict.deepStrictEqual(typeof r === typeof v || r === v, true)
        }
        assert.strict.deepStrictEqual(maskDiagCopy({ a: 'pw1234' }, 'not a list'), '[Uncopyable]')
    })

    it(`should apply opt.patterns to strings and keys inside the copy`, function() {
        //設計§6.4(X37): 套件樣式與maskDiagText同一份cfg, 作用於副本內一切字串、鍵與錯誤
        let r = maskDiagCopy({ sql: 'PRAGMA key=\'k9\'', [`PRAGMA key='k8'`]: 1, e: new Error('PRAGMA rekey=k7') }, [], { patterns: ['pragmaKey'] })
        assert.strict.deepStrictEqual([r.sql, Object.keys(r)[1], r.e.message], ['PRAGMA key=\'***\'', 'PRAGMA key=\'***\'', 'PRAGMA rekey=***'])
    })

    it(`should mask the value of boxed credential keys in a Map (terra #10)`, function() {
        //設計§6.4: Map之憑證鍵名之值整體***; 包裝之鍵先解包
        let m = new Map([[new String('password'), 'unregABC'], [Object(Symbol('apiKey')), 'unregXYZ']]) // eslint-disable-line no-new-wrappers
        let r = maskDiagCopy(m, [])
        assert.strict.deepStrictEqual([...r.values()], ['***', '***'])
    })

    it(`should keep both Map entries whose keys collide after masking (terra #11)`, function() {
        //設計§3.4.2: 遮罩後鍵名相同者以鍵#2等序號保留
        let r = maskDiagCopy(new Map([['aabc123', 1], ['axyz789', 2]]), ['abc123', 'xyz789'])
        assert.strict.deepStrictEqual([...r.entries()], [['a***', 1], ['a***#2', 2]])
    })

    it(`should keep a cross-realm built-in error class for the shell (terra #6)`, async function() {
        //設計§6.4: 原型為內建錯誤類別者建同類別實例(跨realm以名稱判定)
        let vm = await import('vm')
        let r = maskDiagCopy(vm.runInNewContext('new TypeError("x")'), [])
        assert.strict.deepStrictEqual([r instanceof TypeError, r.name], [true, 'TypeError'])
    })

    it(`should bound the whole output when array items exhaust the node budget (terra #31)`, function() {
        //設計§6.4 X41: 每次造訪計入5000預算, 輸出展開大小不超限
        let r = maskDiagCopy(Array.from({ length: 4000 }, () => ({ a: 1, b: 2 })), [])
        let n = 0
        let walk = (v) => {
            if (v !== null && typeof v === 'object') {
                for (let k of Object.keys(v)) {
                    n++
                    walk(v[k])
                }
            }
        }
        walk(r)
        assert.strict.deepStrictEqual([n <= 5001, r[r.length - 1]], [true, '[Truncated]'])
    })

    it(`should number colliding keys in linear time (terra #34, process CPU time)`, function() {
        //設計§3.4.2: 每節點O(鍵數), 碰撞鍵仍保留; 同總鍵數(40次×1000鍵對10次×4000鍵)之CPU時間比: 線性約1倍、平方約4倍(各取3次之最小值, 降低計量粒度與GC之雜訊)
        let run = (n, times) => {
            let o = {}
            for (let i = 0; i < n; i++) {
                o[`k${i}`] = i
            }
            let best = Infinity
            for (let r = 0; r < 3; r++) {
                let t = process.cpuUsage()
                for (let j = 0; j < times; j++) {
                    maskDiagCopy(o, [], { patterns: [{ re: /^k\d+$/ }] })
                }
                let d = process.cpuUsage(t)
                best = Math.min(best, d.user + d.system)
            }
            return best
        }
        let a = run(1000, 40)
        let b = run(4000, 10)
        assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${a} ${b}`)
    })

    it(`should not run an own constructor getter of a dropped Promise when marking it handled (diag-run04 terra r3 #14)`, async function() {
        //R-DIAG-01: 拷貝不執行使用端程式; 捨棄之原生Promise只在原型恰為Promise.prototype且無自有constructor時標記(then之species取得不讀使用端getter), 其餘不標記(已知限制)
        let n = 0
        let p = Promise.reject(new Error('x'))
        Object.defineProperty(p, 'constructor', {
            get() {
                n++
                return Promise
            }
        })
        let r = maskDiagCopy({ node: p }, [])
        let n0 = n
        Promise.prototype.then.call(p, undefined, () => {}) //p未被標記(已知限制): 本案於斷言之讀數取得後自行處理, 避免留下未處理之rejection
        assert.strict.deepStrictEqual([r.node, n0], ['[Promise]', 0])
        let q = Promise.reject(new Error('y'))
        let r2 = maskDiagCopy({ node: q }, [])
        assert.strict.deepStrictEqual(r2.node, '[Promise]')
        await new Promise((resolve) => setImmediate(resolve))
    })

    diagSuite('maskDiagCopy')

})
