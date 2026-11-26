import assert from 'assert'
import execCli from '../src/execCli.mjs'
import execCliSession from '../src/execCliSession.mjs'
import execCliJsonRpc from '../src/execCliJsonRpc.mjs'
import execCliJsonFile from '../src/execCliJsonFile.mjs'
import execCliCore from '../src/execCliCore.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


//第559項①②(排程第492項第10批): exec家族輸入不可讀之訊息為V19固定詞彙(不含呼叫端所拋出之文字、不帶輸入值, V20); command含NUL於入口擋下
//  對應dspec〈輸入參數之檢測機制〉§6 V19、V20; 帳本R-EXEC-FAIL-01規則13、14、16
let node = process.execPath
let SECRET = 'SECRET-boom-7f3a'


//thrower, 於obj定義讀取即拋出SECRET之自有存取器鍵
let thrower = (obj, key) => {
    return Object.defineProperty(obj, key, {
        enumerable: true,
        get() {
            throw new Error(SECRET)
        },
    })
}


describe(`execCli系列: command含NUL於入口擋下(第559項②)`, function() {

    let MSG = 'invalid command: must not contain a NUL character'

    it(`execCli: command含NUL時不啟動, error為固定訊息, attempts為0(原為1)且不帶pid鍵, 設maxRetries亦不重試`, async function() {
        let tr = []
        let r = await execCli('a\u0000b', ['x'], { maxRetries: 2, retryDelayMs: 1, onTrace: (e) => tr.push(e.type) })
        assert.strict.deepStrictEqual(r, { ok: false, stdout: '', stderr: '', code: null, error: MSG, durationMs: 0, attempts: 0 })
        assert.strict.deepStrictEqual('pid' in r, false)
        assert.strict.deepStrictEqual(tr, []) //啟動前即回報, 無事件
    })

    it(`execCli: command之NUL位於開頭與結尾亦擋下; 無NUL之命令不受影響(不存在之命令仍為ENOENT)`, async function() {
        for (let c of ['\u0000', '\u0000node', 'node\u0000']) {
            let r = await execCli(c, [])
            assert.strict.deepStrictEqual([r.error, r.attempts], [MSG, 0], JSON.stringify(c))
        }
        let r2 = await execCli('wsemi-not-exist-zz-559', [])
        assert.strict.deepStrictEqual([r2.attempts, r2.error.startsWith('ENOENT: ')], [1, true])
    })

    it(`execCliSession: command含NUL時不spawn, onExit與stop()之結果error為固定訊息、pid為null, write回false`, async function() {
        let exits = []
        let s = execCliSession('a\u0000b', [], { onExit: (r) => exits.push(r) })
        assert.strict.deepStrictEqual(await s.write('x'), false)
        let r = await s.stop()
        assert.strict.deepStrictEqual([r.error, r.pid, r.exited, r.code], [MSG, null, true, null])
        assert.strict.deepStrictEqual(exits.length, 1)
        assert.strict.deepStrictEqual(exits[0], r)
    })

    it(`execCliJsonRpc: command含NUL時不啟動, errorType為params(原進spawn後為notfound), error為固定訊息`, async function() {
        let r = await execCliJsonRpc('a\u0000b', [], [{ method: 'x' }])
        assert.strict.deepStrictEqual([r.ok, r.errorType, r.error, r.exitCode], [false, 'params', MSG, null])
    })

    it(`execCliJsonFile: opt.exe含NUL時結果物件之message不含NUL之命令(同execCli)`, async function() {
        let r = await execCliJsonFile({ script: 'x.mjs', outputPath: 'o.json', exe: 'a\u0000b' })
        assert.strict.deepStrictEqual(r.status, 'error')
        assert.strict.deepStrictEqual(r.message.includes(MSG), true, r.message)
    })

    it(`execCliCore.buildSpawnArgs: command非非空字串或含NUL時拋TypeError, 訊息固定不帶值(原Windows下拋含該值描述之原生TypeError)`, function() {
        let bad = [undefined, null, 5, {}, [], true, '', new String('abc'), Symbol('v559'), { toString: () => 'sEcReT-559' }] // eslint-disable-line no-new-wrappers
        for (let v of bad) {
            let err = null
            try {
                execCliCore.buildSpawnArgs(v, [])
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(err instanceof TypeError, true)
            assert.strict.deepStrictEqual(err.message, 'invalid command: must be a non-empty string')
        }
        let err2 = null
        try {
            execCliCore.buildSpawnArgs('a\u0000sEcReT', [])
        }
        catch (e) {
            err2 = e
        }
        assert.strict.deepStrictEqual([err2 instanceof TypeError, err2.message], [true, 'invalid command: must not contain a NUL character'])
    })

    it(`execCliCore.buildSpawnArgs: 有效命令照常回傳(不受入口檢測影響)`, function() {
        let r = execCliCore.buildSpawnArgs(node, ['-e', '1'])
        assert.strict.deepStrictEqual([typeof r.file, Array.isArray(r.args), typeof r.opt], ['string', true, 'object'])
    })

})


describe(`execCli系列: 輸入不可讀之訊息為V19固定詞彙(第559項①)`, function() {

    it(`args之元素讀取即拋錯: execCli、execCliSession、execCliJsonRpc皆為'invalid args: must be a readable array', 不含拋出之文字, 不啟動子進程`, async function() {
        let args = ['-e', '1']
        thrower(args, '1')
        let r1 = await execCli(node, args, { maxRetries: 2, retryDelayMs: 1 })
        assert.strict.deepStrictEqual([r1.ok, r1.code, r1.error, r1.attempts, 'pid' in r1, r1.pid], [false, null, 'invalid args: must be a readable array', 1, true, undefined])
        let s = execCliSession(node, args)
        let r2 = await s.stop()
        assert.strict.deepStrictEqual([r2.error, r2.pid, r2.exited], ['invalid args: must be a readable array', null, true])
        let r3 = await execCliJsonRpc(node, args, [{ method: 'x' }])
        assert.strict.deepStrictEqual([r3.ok, r3.errorType, r3.error], [false, 'notfound', 'x: invalid args: must be a readable array'])
        for (let r of [r1, r2, r3]) {
            assert.strict.deepStrictEqual(JSON.stringify(r).includes(SECRET), false)
        }
    })

    it(`opt.env讀取即拋錯: execCli、execCliSession、execCliJsonRpc皆為'invalid opt.env: must be a readable object', 不含拋出之文字`, async function() {
        let env = { A: '1' }
        thrower(env, 'B')
        let r1 = await execCli(node, ['-e', '1'], { env, maxRetries: 2, retryDelayMs: 1 })
        assert.strict.deepStrictEqual([r1.ok, r1.code, r1.error, r1.attempts], [false, null, 'invalid opt.env: must be a readable object', 1])
        let r2 = await execCliSession(node, ['-e', '1'], { env }).stop()
        assert.strict.deepStrictEqual([r2.error, r2.pid], ['invalid opt.env: must be a readable object', null])
        let r3 = await execCliJsonRpc(node, ['-e', '1'], [{ method: 'x' }], { env })
        assert.strict.deepStrictEqual([r3.errorType, r3.error], ['notfound', 'x: invalid opt.env: must be a readable object'])
        for (let r of [r1, r2, r3]) {
            assert.strict.deepStrictEqual(JSON.stringify(r).includes(SECRET), false)
        }
    })

    //複審(F1): 快照時即轉字串, 呼叫端物件之toString所拋之文字不致留待spawn時由node原樣拋出而外露
    it(`args元素與env值之toString拋錯: 快照時即以固定訊息回報(不含拋出之文字); 數字等非字串值照常轉字串(語意不變)`, async function() {
        let bad = {
            toString() {
                throw new Error(SECRET)
            },
        }
        let r1 = await execCli(node, ['-e', '1', bad])
        assert.strict.deepStrictEqual([r1.ok, r1.error, r1.attempts], [false, 'invalid args: must be a readable array', 1])
        let r2 = await execCliSession(node, ['-e', '1', bad]).stop()
        assert.strict.deepStrictEqual([r2.error, r2.pid], ['invalid args: must be a readable array', null])
        let r3 = await execCli(node, ['-e', '1'], { env: { A: bad } })
        assert.strict.deepStrictEqual([r3.ok, r3.error, r3.attempts], [false, 'invalid opt.env: must be a readable object', 1])
        let r4 = await execCliSession(node, ['-e', '1'], { env: { A: bad } }).stop()
        assert.strict.deepStrictEqual([r4.error, r4.pid], ['invalid opt.env: must be a readable object', null])
        for (let r of [r1, r2, r3, r4]) {
            assert.strict.deepStrictEqual(JSON.stringify(r).includes(SECRET), false)
        }
        //非字串之有效值轉字串(同node之spawn): 數字參數、數字與布林之環境變數值
        let r5 = await execCli(node, ['-e', 'process.stdout.write(process.argv[1] + process.env.WSEMI_N559 + process.env.WSEMI_B559)', 42], { env: { WSEMI_N559: 5, WSEMI_B559: true } })
        assert.strict.deepStrictEqual([r5.ok, r5.stdout], [true, '42' + '5' + 'true'])
        //值為undefined之環境變數代表移除(可遮蔽繼承值)
        process.env.WSEMI_RM559 = 'inherited'
        try {
            let r6 = await execCli(node, ['-e', 'process.stdout.write(String(process.env.WSEMI_RM559))'], { env: { WSEMI_RM559: undefined } })
            assert.strict.deepStrictEqual([r6.ok, r6.stdout], [true, 'undefined'])
        }
        finally {
            delete process.env.WSEMI_RM559
        }
    })

    it(`偽造標籤之類陣列物件(length極大)作args: 不耗盡記憶體, 以固定訊息回報`, async function() {
        //isarr以標籤判型(停於該函數, 見第552項): 偽造標籤者通過, 個數逾上限(1e6)即不可讀, 且不讀任何元素
        let reads = 0
        let fake = { length: 2e6, [Symbol.toStringTag]: 'Array' }
        Object.defineProperty(fake, '0', {
            get() {
                reads += 1
                return 'a'
            },
        })
        let r = await execCli(node, fake, { timeoutMs: 5000 })
        assert.strict.deepStrictEqual([r.ok, r.error, reads], [false, 'invalid args: must be a readable array', 0])
        let huge = { length: 1e9, [Symbol.toStringTag]: 'Array' }
        let r2 = await execCli(node, huge, { timeoutMs: 5000 })
        assert.strict.deepStrictEqual([r2.ok, r2.error], [false, 'invalid args: must be a readable array'])
        let s = await execCliSession(node, huge).stop()
        assert.strict.deepStrictEqual(s.error, 'invalid args: must be a readable array')
    })

    it(`execCliJsonRpc: 長度只讀一次(requests為Proxy陣列時, 迭代不再讀length)`, async function() {
        let lenReads = 0
        let reqs = new Proxy([{ method: 'x' }], {
            get(t, k, r) {
                if (k === 'length') {
                    lenReads += 1
                }
                return Reflect.get(t, k, r)
            },
        })
        await execCliJsonRpc(node, ['-e', '1'], reqs)
        assert.strict.deepStrictEqual(lenReads, 1)
    })

    it(`execCliJsonRpc: requests之長度讀取拋錯為'invalid requests: must be a readable array', 單一請求讀取拋錯為'invalid requests[i]: must be a readable object'(i為該請求之索引)`, async function() {
        let reqs = new Proxy([{ method: 'x' }], {
            get(t, k, r) {
                if (k === 'length') {
                    throw new Error(SECRET)
                }
                return Reflect.get(t, k, r)
            },
        })
        let r1 = await execCliJsonRpc(node, ['-e', '1'], reqs)
        assert.strict.deepStrictEqual([r1.ok, r1.errorType, r1.error], [false, 'params', 'invalid requests: must be a readable array'])
        let q1 = { method: 'ok1' }
        let q2 = {}
        thrower(q2, 'method')
        let r2 = await execCliJsonRpc(node, ['-e', '1'], [q1, q2])
        assert.strict.deepStrictEqual([r2.ok, r2.errorType, r2.error], [false, 'params', 'invalid requests[1]: must be a readable object'])
        for (let r of [r1, r2]) {
            assert.strict.deepStrictEqual(JSON.stringify(r).includes(SECRET), false)
        }
    })

    it(`execCliJsonRpc: params無法序列化(BigInt、循環參照、toJSON拋錯)時error為'invalid requests[i].params: must be serializable to JSON', 不含method名稱、構造器名與屬性名`, async function() {
        let CtorSecret = function Sec3tCtor() {}
        let circ = new CtorSecret()
        circ.sec3tProp = circ
        let cases = [
            [0, { method: 'sEcReT-method', params: { n: 1n } }],
            [0, { method: 'sEcReT-method', params: circ }],
            [0, {
                notify: 'sEcReT-notify',
                params: {
                    toJSON() {
                        throw new Error(SECRET)
                    },
                },
            }],
        ]
        for (let [i, q] of cases) {
            let r = await execCliJsonRpc(node, ['-e', 'setTimeout(()=>{},30000)'], [q], { timeoutMs: 20000 })
            assert.strict.deepStrictEqual([r.ok, r.errorType, r.error], [false, 'params', `invalid requests[${i}].params: must be serializable to JSON`])
            let s = JSON.stringify(r)
            assert.strict.deepStrictEqual([s.includes('sEcReT'), s.includes('Sec3t'), s.includes(SECRET)], [false, false, false])
        }
    })

    //hostileValues全集(19值)作opt: 結果之任何欄位皆不含拋出之文字'boom'(hostileValues之存取器拋Error('boom')); 不throw、不reject
    for (let h of hostileValues()) {
        it(`hostileValues全集作opt: ${h.name} → execCli、execCliSession、execCliJsonRpc之結果不含拋出之文字, 不throw、不reject`, async function() {
            let opt = h.value
            let r1 = await execCli(node, ['-e', '1'], opt)
            let s = execCliSession(node, ['-e', '1'], opt)
            let r2 = await s.stop()
            let r3 = await execCliJsonRpc(node, ['-e', '1'], [], opt)
            let ok = [r1, r2, r3].every((r) => !JSON.stringify(r).includes('boom'))
            assert.ok(ok, `${h.name}: result must not contain the thrown text`)
        })
    }

})
