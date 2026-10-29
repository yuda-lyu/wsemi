import assert from 'assert'
import util from 'util'
import maskDiagErr from '../src/maskDiagErr.mjs'
import getDiagSecrets from '../src/getDiagSecrets.mjs'
import corpus from '../src/_diagCases.mjs'
import diagSuite from './tools/diagSuite.mjs'


//maskDiagErr為對外錯誤值之憑證移除, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01


describe(`maskDiagErr`, function() {

    it(`should return new Error('***') for a detectable Proxy without running traps`, function() {
        //設計§6.5第6條: Proxy回傳new Error('***'), 永不拋錯
        let n = 0
        let p = new Proxy(new Error('x'), {
            get() {
                n++
            },
            getOwnPropertyDescriptor() {
                n++
            },
            ownKeys() {
                n++
                return []
            }
        })
        let r = maskDiagErr(p, ['pw1234'])
        assert.strict.deepStrictEqual([r instanceof Error, r.message, n], [true, '***', 0])
    })

    it(`should treat accessor properties, Map and over-limit structures as needing a copy (fail-closed)`, function() {
        //設計§6.5第3條(X26、X57): 無法檢查者視為需處理
        let e1 = new Error('x')
        Object.defineProperty(e1, 'info', { get: () => 'pw1234', enumerable: true })
        let e2 = new Error('x')
        e2.m = new Map([['a', 'pw1234']])
        let e3 = new Error('x')
        let o = e3
        for (let i = 0; i < 10; i++) {
            o.next = {}
            o = o.next
        }
        let rs = [e1, e2, e3].map((e) => [e, maskDiagErr(e, ['pw1234'])])
        assert.strict.deepStrictEqual(rs.map(([a, b]) => a !== b), [true, true, true])
        assert.strict.deepStrictEqual(rs[0][1].info, '[Getter/Setter]')
        assert.strict.deepStrictEqual(rs[1][1].m.get('a'), '***')
    })

    it(`should keep primitives other than strings and functions as is`, function() {
        //設計§3.7第5條: 其他值原樣
        let f = () => 1
        assert.strict.deepStrictEqual([maskDiagErr(1, ['1234']), maskDiagErr(null), maskDiagErr(undefined), maskDiagErr(f)], [1, null, undefined, f])
    })

    it(`should map a cycle back to the copy, not to the original`, function() {
        //設計§6.5第5條: 副本之循環指向副本(不交出含憑證之原物件)
        let e = new Error('x pw1234')
        e.self = e
        let r = maskDiagErr(e, getDiagSecrets({ password: 'pw1234' }))
        assert.strict.deepStrictEqual([r !== e, r.self === r, r.message], [true, true, 'x ***'])
    })

    it(`should keep both own properties whose keys collide after masking (terra #11)`, function() {
        //設計§6.5: 副本逐一保留自有屬性; 遮罩後同名者以序號保留
        let e = Object.assign(new Error('x'), { aabc123: 1, axyz789: 2 })
        let r = maskDiagErr(e, ['abc123', 'xyz789'])
        assert.strict.deepStrictEqual([r['a***'], r['a***#2']], [1, 2])
    })

    it(`should recognize a Map or an Error whose prototype was changed to null (terra #14, util.types available)`, function() {
        //設計§6.1、§6.5: util可用時以內部槽位判定; Map視為需處理; 錯誤副本具[[ErrorData]]
        let m = Object.setPrototypeOf(new Map([['a', 'secret9']]), null)
        let e = Object.assign(new Error('x'), { data: m })
        let r = maskDiagErr(e, ['secret9'])
        assert.strict.deepStrictEqual([r !== e, r.data.get('a')], [true, '***'])
        let e2 = Object.setPrototypeOf(new Error('secret9'), null)
        let r2 = maskDiagErr(e2, ['secret9'])
        assert.strict.deepStrictEqual([util.types.isNativeError(r2), Object.getPrototypeOf(r2), r2.message], [true, null, '***'])
    })

    it(`should not hand out data inherited from a non-class prototype (terra #16)`, function() {
        //dspec D3: 對外值不含憑證; 資料物件作原型者不沿用
        let o = Object.create({ token: 'secret9' })
        o.message = 'secret9'
        let r = maskDiagErr(o, ['secret9'])
        assert.strict.deepStrictEqual([r.message, r.token], ['***', undefined])
        class DbErr extends Error {}
        let r2 = maskDiagErr(new DbErr('secret9'), ['secret9'])
        assert.strict.deepStrictEqual(r2 instanceof DbErr, true)
    })

    it(`should check own properties of Date and boxed values (terra #24)`, function() {
        //設計§6.5第2～3條: 遞迴檢查全部自有資料屬性
        for (let x of [new Date(0), new String('ok')]) { // eslint-disable-line no-new-wrappers
            x.note = 'secret9'
            let e = Object.assign(new Error('x'), { data: x })
            let r = maskDiagErr(e, ['secret9'])
            assert.strict.deepStrictEqual(r !== e && JSON.stringify(r.data).indexOf('secret9') < 0, true)
        }
    })

    it(`should bound the copy when the check exceeds the node limit (terra #32)`, function() {
        //設計§6.5: 檢查與副本以節點2000為界, 超限fail-closed
        let e = new Error('x')
        for (let i = 0; i < 10000; i++) {
            e[`k${i}`] = i
        }
        let r = maskDiagErr(e, ['secret9'])
        assert.strict.deepStrictEqual([r !== e, Reflect.ownKeys(r).length <= 2003, typeof r['[Truncated]']], [true, true, 'number'])
    })

    it(`should check shared children once (terra #33, process CPU time)`, function() {
        //dspec D4: 節點預算限制檢查與複製成本; 同總規模(40次×250對10次×1000)之CPU時間比: 線性約1倍、平方約4倍(各取3次之最小值, 降低計量粒度與GC之雜訊)
        let run = (n, times) => {
            let child = {}
            for (let i = 0; i < n; i++) {
                child[`c${i}`] = i
            }
            let e = new Error('secret9')
            for (let i = 0; i < n; i++) {
                e[`p${i}`] = child
            }
            let best = Infinity
            for (let r = 0; r < 3; r++) {
                let t = process.cpuUsage()
                for (let j = 0; j < times; j++) {
                    maskDiagErr(e, ['secret9'])
                }
                let d = process.cpuUsage(t)
                best = Math.min(best, d.user + d.system)
            }
            return best
        }
        let a = run(250, 40)
        let b = run(1000, 10)
        assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${a} ${b}`)
    })

    it(`should mask every value form of the corpus when it sits inside a rejected error (capi #1)`, async function() {
        //設計§6.5第2、3、5條: maskDiagErr之檢查與副本涵蓋語料之形態(Symbol鍵與值、包裝值、非索引鍵、數字秘密、二進位、跨realm錯誤、AggregateError.errors、巢狀Proxy、Map、Set)
        let vm = await import('vm')
        let pw = 'Pw9xQ!z7'
        let ss = getDiagSecrets({ password: pw, values: ['48213579'] })
        let arr = [1]
        arr[`x${pw}`] = 2
        let forms = {
            symKey: { [Symbol(`s ${pw}`)]: 1 },
            symVal: Symbol(`v ${pw}`),
            boxed: new String(pw), // eslint-disable-line no-new-wrappers
            nonIndex: arr,
            num: 48213579,
            bin: new TextEncoder().encode(`postgres://u:${pw}@db`),
            realmErr: vm.runInNewContext(`new TypeError(${JSON.stringify(`x ${pw}`)})`),
            agg: new AggregateError([new Error(`a ${pw}`)], 'agg'),
            proxy: new Proxy({ a: pw }, {}),
            map: new Map([['k', pw]]),
            set: new Set([pw]),
        }
        for (let [name, f] of Object.entries(forms)) {
            let e = Object.assign(new Error('outer'), { data: f })
            let r = maskDiagErr(e, ss)
            let { ss: strs, chars } = corpus.collect(r)
            let leak = strs.some((s) => s.indexOf(pw) >= 0 || s.indexOf('48213579') >= 0) || chars.indexOf(pw) >= 0
            assert.strict.deepStrictEqual([name, r !== e, leak], [name, true, false])
        }
    })

    it(`should check a builtin stack that was cached before the message changed (capi #14)`, function() {
        //設計§6.5第3條: 檢查之值即使用之值; V8首次讀取時快取格式化之stack
        let e = new Error('connect postgres://dbuser:Pw9xQ!z7@db/app')
        assert.strict.deepStrictEqual(typeof e.stack, 'string') //首次讀取使V8格式化並快取
        e.message = 'connect failed'
        let r = maskDiagErr(e, getDiagSecrets({ urls: ['postgres://dbuser:Pw9xQ!z7@db/app'] }))
        assert.strict.deepStrictEqual([r !== e, r.stack.indexOf('Pw9xQ!z7') < 0], [true, true])
    })

    it(`should keep the classes of errors inside AggregateError.errors and not mask their storage paths (capi #15, Q3)`, function() {
        //設計§3.7第2條、§6.5第5條巢狀錯誤遞迴; Q3對外值不遮儲存路徑
        class DbErr extends Error {}
        let fe = Object.assign(new Error('ENOENT: open \'D:\\s\\db02\''), { path: 'D:\\s\\db02' })
        let ag = new AggregateError([fe, new DbErr('auth Pw9xQ!z7')], 'multi')
        let r = maskDiagErr(ag, ['Pw9xQ!z7'])
        assert.strict.deepStrictEqual([r.errors[0] === fe, r.errors[1] instanceof DbErr, r.errors[1].message, r.errors[0].path], [true, true, 'auth ***', 'D:\\s\\db02'])
    })

    it(`should keep the identity of errors with an empty Set or a long clean string (capi #16, #17)`, function() {
        //設計§6.5第4條: 無應處理者回原物件(MongoError之errorLabelSet、批次寫入之長sql)
        let e1 = Object.assign(new Error('E11000 duplicate key'), { code: 11000, errorLabelSet: new Set() })
        let e2 = Object.assign(new Error('dup'), { sql: `INSERT INTO t VALUES ${'(1),'.repeat(6000)}` })
        assert.strict.deepStrictEqual([maskDiagErr(e1, ['Pw9xQ!z7']) === e1, maskDiagErr(e2, ['Pw9xQ!z7']) === e2], [true, true])
        let e3 = Object.assign(new Error('dup'), { sql: `INSERT ${'(1),'.repeat(6000)} Pw9xQ!z7` })
        let r3 = maskDiagErr(e3, ['Pw9xQ!z7'])
        assert.strict.deepStrictEqual([r3 !== e3, r3.sql.endsWith(' ***'), r3.sql.length], [true, true, e3.sql.length - 5])
    })

    it(`should mask top-level numbers and Symbols like nested ones (capi #10)`, function() {
        //一致性: 頂層與巢狀同規則
        assert.strict.deepStrictEqual(maskDiagErr(48213579, ['48213579']), '***')
        assert.strict.deepStrictEqual(maskDiagErr(Symbol('x Pw9xQ!z7'), ['Pw9xQ!z7']).description, 'x ***')
    })

    it(`should apply the mongoHostEcho pattern to an uncut external value in linear time (diag-run03 Y05, process CPU time)`, function() {
        //dspec D4: 有界(成本與輸入長度成線性); 對外值不截長, 具名樣式於其上須線性; 同總規模(16次×2000對4次×8000)之CPU時間比: 線性約1倍、平方約4倍(各取3次之最小值)
        let run = (n, times) => {
            let s = 'Unable to parse '.repeat(n)
            let best = Infinity
            for (let r = 0; r < 3; r++) {
                let t = process.cpuUsage()
                for (let j = 0; j < times; j++) {
                    maskDiagErr(s, [], { patterns: ['mongoHostEcho'] })
                }
                let d = process.cpuUsage(t)
                best = Math.min(best, d.user + d.system)
            }
            return best
        }
        let a = run(2000, 16)
        let b = run(8000, 4)
        assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${a} ${b}`)
    })

    it(`should restore Error.stackTraceLimit after brand probes of null-prototype objects (diag-run04)`, function() {
        //R-DIAG-01: 品牌試探期間暫不擷取堆疊(V8之Error.stackTraceLimit), 同步還原; 不改變全域狀態
        let lim = Error.stackTraceLimit
        let o = { a: Object.create(null), b: Object.setPrototypeOf(new Map([['k', 'v']]), null), note: 'Pw1234zz' }
        maskDiagErr(o, ['Pw1234zz'])
        assert.strict.deepStrictEqual(Error.stackTraceLimit, lim)
        assert.strict.deepStrictEqual(new Error('x').stack.split('\n').length > 1, true)
    })

    it(`should keep mongoHostEcho and array values of credential pairs linear on repeated anchors and unbalanced quotes (diag-run04 terra #2, #3, process CPU time)`, function() {
        //dspec D4: 有界(成本與輸入長度成線性); 對外值不截長; 同總規模(16次×n對4次×4n)之CPU時間比: 線性約1倍、平方約4倍(各取3次之最小值)
        //形: ①連續之 with URL(起點皆為前一個 with URL) ②回顯成段後接無結尾之起始字樣 ③陣列值內之撇號(引號跨段成對; 只鎖定此形之線性, 引號找法掃至結尾之次數上限ARR_FAILS為防禦性之保證, 本案不據以判定)
        let shapes = [
            [(n) => ' with URL'.repeat(n), { patterns: ['mongoHostEcho'] }],
            [(n) => 'Unable to parse u:p@@x with URL '.repeat(n) + 'Unable to parse '.repeat(n), { patterns: ['mongoHostEcho'] }],
            [(n) => 'password=[it\'s x] '.repeat(n), {}],
        ]
        for (let [mk, opt] of shapes) {
            let run = (n, times) => {
                let s = mk(n)
                let best = Infinity
                for (let r = 0; r < 3; r++) {
                    let t = process.cpuUsage()
                    for (let j = 0; j < times; j++) {
                        maskDiagErr(s, [], opt)
                    }
                    let d = process.cpuUsage(t)
                    best = Math.min(best, d.user + d.system)
                }
                return best
            }
            let a = run(1000, 16)
            let b = run(4000, 4)
            assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${mk(1)} ${a} ${b}`)
        }
    })

    diagSuite('maskDiagErr')

})
