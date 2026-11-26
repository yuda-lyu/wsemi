import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { hostileValues, withGetter } from './tools/hostileValues.mjs'
import { scanOptReads, scanErrEcho } from './tools/optReadScan.mjs'


//第663項(排程第492項批11): 轉型、編碼、字串、時間字串轉換類函數之opt讀取不拋錯(dspec〈輸入參數之檢測機制〉§5.3 C1: 無法轉型回預設值、不拋錯; K3: opt給了而讀取即拋錯視為未給)
//  原拋錯點: 以get(opt, 鍵, 預設)讀opt, 對已撤銷之Proxy、陷阱拋錯之物件與鍵之存取器拋錯而外拋至呼叫端
//  修法: 入口以內部_pickOpt取快照(只讀所需之鍵、各鍵一次、讀取拋錯之鍵視為未給); 站點全集與判準見sgud/rule/rulebook_judge_nothrow.md R-C1-HOSTILE-01規則4
//  oracle: 「opt不可讀」之結果須與「未給opt」之結果相同(deepStrictEqual); 期望值取自同一函數於同引數不帶opt之呼叫, 夾具之輸入手寫(逐筆相異之值)


let here = path.dirname(fileURLToPath(import.meta.url))
let srcDir = path.join(here, '..', 'src')


//載入全部目標函數(動態匯入, 於修前鏡像根與本庫根皆可跑)
let NAMES = [
    'ab2blob', 'ab2u8arr', 'aes2str', 'b642obj', 'b642str', 'b642u16arr', 'b642u8arr', 'bs2u8arr',
    'htmlDecode', 'htmlEncode', 'j2o', 'keysmat2ltdt', 'ltdt2vrtsable', 'ltdtkeys2mat', 'ltdtkeysheads2mat', 'mat2ltdt',
    'o2j', 'obj2b64', 'obj2pb64', 'obj2str', 'obj2stru8arr', 'obj2u8arr', 'pb642obj', 'round',
    'str2aes', 'str2b64', 'str2hint', 'str2md5', 'str2obj', 'str2sha', 'str2sha512', 'str2u8arr', 'strTruncate', 'stru8arr2obj',
    'time2day', 'time2hour', 'time2min', 'timems2day', 'timems2hour', 'timems2min', 'timems2time',
    'timemsTZ2day', 'timemsTZ2expire', 'timemsTZ2hour', 'timemsTZ2min', 'timemsTZ2past', 'timemsTZ2time',
    'timeTZ2day', 'timeTZ2expire', 'timeTZ2hour', 'timeTZ2min', 'timeTZ2past', 'trim',
    'u16arr2b64', 'u16arr2u8arr', 'u8arr2ab', 'u8arr2b64', 'u8arr2blob', 'u8arr2bs', 'u8arr2obj', 'u8arr2str', 'u8arr2u16arr',
]
let M = {}
for (let n of NAMES) {
    M[n] = (await import(`../src/${n}.mjs`)).default
}


//輸入夾具(各值逐筆相異)
let u8 = () => new Uint8Array([66, 97, 115, 101, 200, 31])
let u16 = () => new Uint16Array([7, 513, 300, 41])
let ab = () => new Uint8Array([9, 8, 7, 250, 3]).buffer
let AES = M.str2aes('hello-aes', 'k1-secret', false)
let OBJ_B64 = M.obj2b64({ a: 1, b: [2, 3], c: 'x' })
let OBJ_PB64 = M.obj2pb64({ a: 1, d: 'y' }, 'key-663')
let OBJ_STR = M.obj2str({ a: 1, b: u8() }, 'Uint8Array')
let OBJ_U8 = () => M.obj2u8arr({ a: 1, b: u8() })
let T = '2019-01-01T12:34:56'
let TMS = '2019-01-01T12:34:56.789'
let TTZ = '2019-01-01T12:34:56+08:00'
let TMSTZ = '2019-01-01T12:34:56.789+08:00'
let TNOW_TZ = '2019-01-01T12:30:00+08:00'
let TNOW_MSTZ = '2019-01-01T12:30:00.123+08:00'


//norm, 比對用之正規化: Blob取size與type; 密文(每次加密之鹽不同)取解密後之明文
let normBlob = (v) => ((v instanceof Blob) ? { blob: true, size: v.size, type: v.type } : v)
let normAes = (v) => M.aes2str(v, 'k1-secret', false)


//spec: n函數名, a有效引數(不含opt, opt接在其後), state是否有returnWithStateAndMsg, norm正規化(預設normBlob)
let SPECS = [
    { n: 'ab2blob', a: () => [ab()], state: true },
    { n: 'ab2u8arr', a: () => [ab()], state: true },
    { n: 'aes2str', a: () => [AES, 'k1-secret', false], state: true },
    { n: 'b642obj', a: () => [OBJ_B64], state: true },
    { n: 'b642str', a: () => [M.str2b64('abc 中文')], state: true },
    { n: 'b642u16arr', a: () => [M.u16arr2b64(u16())], state: true },
    { n: 'b642u8arr', a: () => [M.u8arr2b64(u8())], state: true },
    { n: 'bs2u8arr', a: () => [M.u8arr2bs(u8())], state: true },
    { n: 'htmlDecode', a: () => ['&amp;&lt;&#x26;'], state: false },
    { n: 'htmlEncode', a: () => ['<a&b>'], state: false },
    { n: 'j2o', a: () => ['{"a":1,"b":[2]}'], state: true },
    { n: 'keysmat2ltdt', a: () => [['a', 'b'], [[1, 2], [3, 4]]], state: true },
    { n: 'ltdt2vrtsable', a: () => [[{ a: { value: 11, style: { c: 'r' } }, b: { value: 2 } }, { a: { value: 11 }, b: { value: 3 } }], ['a']], state: true },
    { n: 'ltdtkeys2mat', a: () => [[{ a: 1, b: 2 }, { a: 5, b: 6 }], ['a', 'b']], state: true },
    { n: 'ltdtkeysheads2mat', a: () => [[{ a: 1, b: 2 }], ['a', 'b'], { a: 'A', b: 'B' }], state: true },
    { n: 'mat2ltdt', a: () => [[['a', 'b'], [1, 2], [3, 4]]], state: true },
    { n: 'o2j', a: () => [{ a: 1, b: 'x' }, false], state: true },
    { n: 'obj2b64', a: () => [{ a: 1, b: 'y' }], state: true },
    { n: 'obj2pb64', a: () => [{ a: 1, d: 'y' }, 'key-663'], state: true, norm: (v) => M.pb642obj(v, 'key-663') },
    { n: 'obj2str', a: () => [{ a: 1, b: u8() }, 'Uint8Array'], state: true },
    { n: 'obj2stru8arr', a: () => [{ a: 1, b: u8() }], state: true },
    { n: 'obj2u8arr', a: () => [{ a: 1, b: u8() }], state: true },
    { n: 'pb642obj', a: () => [OBJ_PB64, 'key-663'], state: true },
    { n: 'round', a: () => [12.3456, 2], state: false },
    { n: 'str2aes', a: () => ['hello-aes', 'k1-secret', false], state: true, norm: normAes },
    { n: 'str2b64', a: () => ['abc 中文'], state: true },
    { n: 'str2hint', a: () => ['abc 中文'], state: true },
    { n: 'str2md5', a: () => ['abc', false], state: true },
    { n: 'str2obj', a: () => [OBJ_STR, 'Uint8Array'], state: true },
    { n: 'str2sha', a: () => ['abc', 256, false], state: true },
    { n: 'str2sha512', a: () => ['abc', false], state: true },
    { n: 'str2u8arr', a: () => ['abc 中文'], state: true },
    { n: 'strTruncate', a: () => ['abcdefghij', 3], state: false },
    { n: 'stru8arr2obj', a: () => [{ results: '{"a":1}', binarys: [] }], state: true },
    { n: 'time2day', a: () => [T], state: true },
    { n: 'time2hour', a: () => [T], state: true },
    { n: 'time2min', a: () => [T], state: true },
    { n: 'timems2day', a: () => [TMS], state: true },
    { n: 'timems2hour', a: () => [TMS], state: true },
    { n: 'timems2min', a: () => [TMS], state: true },
    { n: 'timems2time', a: () => [TMS], state: true },
    { n: 'timemsTZ2day', a: () => [TMSTZ], state: true },
    { n: 'timemsTZ2expire', a: () => [TMSTZ, TNOW_MSTZ], state: true },
    { n: 'timemsTZ2hour', a: () => [TMSTZ], state: true },
    { n: 'timemsTZ2min', a: () => [TMSTZ], state: true },
    { n: 'timemsTZ2past', a: () => [TMSTZ, '2019-01-01T12:40:00.000+08:00'], state: true },
    { n: 'timemsTZ2time', a: () => [TMSTZ], state: true },
    { n: 'timeTZ2day', a: () => [TTZ], state: true },
    { n: 'timeTZ2expire', a: () => [TTZ, TNOW_TZ], state: true },
    { n: 'timeTZ2hour', a: () => [TTZ], state: true },
    { n: 'timeTZ2min', a: () => [TTZ], state: true },
    { n: 'timeTZ2past', a: () => [TTZ, '2019-01-01T12:40:00+08:00'], state: true },
    { n: 'trim', a: () => [' abc12 '], state: false },
    { n: 'u16arr2b64', a: () => [u16()], state: true },
    { n: 'u16arr2u8arr', a: () => [u16()], state: true },
    { n: 'u8arr2ab', a: () => [u8()], state: true },
    { n: 'u8arr2b64', a: () => [u8()], state: true },
    { n: 'u8arr2blob', a: () => [u8()], state: true },
    { n: 'u8arr2bs', a: () => [u8()], state: true },
    { n: 'u8arr2obj', a: () => [OBJ_U8()], state: true },
    { n: 'u8arr2str', a: () => [new TextEncoder().encode('Base 中文 663')], state: true },
    { n: 'u8arr2u16arr', a: () => [new Uint8Array([1, 0, 2, 0, 3, 1])], state: true },
]


//call, 呼叫並回傳{ threw, r }
let call = (n, args) => {
    try {
        return { threw: false, r: M[n](...args) }
    }
    catch (err) {
        return { threw: true, r: null, msg: String(err && err.message) }
    }
}


let hv = hostileValues()


describe(`第663項: 指定函數表涵蓋全部目標函數`, function() {

    it(`SPECS共 ${NAMES.length} 個, 與NAMES逐一對應(無漏列、無重複)`, function() {
        assert.strict.deepStrictEqual(SPECS.map((s) => s.n).sort(), [...NAMES].sort())
        assert.strict.deepStrictEqual(new Set(NAMES).size, NAMES.length)
    })

    it(`對照: 不帶opt時每個函數於有效引數皆成功(夾具有鑑別力: 輸出非空)`, function() {
        for (let s of SPECS) {
            let c = call(s.n, s.a())
            assert.ok(!c.threw, `${s.n} no opt must not throw`)
            if (s.state) {
                let cs = call(s.n, [...s.a(), { returnWithStateAndMsg: true }])
                assert.ok(!cs.threw && cs.r && cs.r.state === 'success', `${s.n} state mode must succeed with the fixture`)
            }
        }
    })

})


describe(`第663項: opt為惡意值(已撤銷之Proxy、陷阱拋錯之物件等19種) → 視為未給, 結果同不帶opt、不拋錯`, function() {

    for (let s of SPECS) {
        it(`${s.n}: 19種惡意值作opt皆不拋錯且結果同不帶opt`, function() {
            let norm = s.norm || normBlob
            let ref = call(s.n, s.a())
            assert.ok(!ref.threw, `${s.n} reference call`)
            for (let h of hv) {
                let c = call(s.n, [...s.a(), h.value])
                assert.ok(!c.threw, `${s.n} must not throw for opt ${h.name}`)
                assert.ok(c.r !== undefined, `${s.n} must return for opt ${h.name}`)
                assert.strict.deepStrictEqual(norm(c.r), norm(ref.r), `${s.n} opt ${h.name}`)
            }
        })
    }

})


describe(`第663項: opt之鍵讀取即拋錯 → 該鍵視為未給, 其餘鍵與未涉及之鍵照常`, function() {

    for (let s of SPECS.filter((x) => x.state)) {
        it(`${s.n}: returnWithStateAndMsg之存取器拋錯視為未給(回純值); 另一無關鍵之存取器拋錯不影響狀態模式`, function() {
            let norm = s.norm || normBlob
            let ref = call(s.n, s.a())

            //鍵之存取器拋錯 → 視為未給 → 回傳同不帶opt
            let o1 = withGetter({}, 'returnWithStateAndMsg')
            let c1 = call(s.n, [...s.a(), o1])
            assert.ok(!c1.threw, `${s.n} getter on returnWithStateAndMsg must not throw`)
            assert.strict.deepStrictEqual(norm(c1.r), norm(ref.r), `${s.n} getter returnWithStateAndMsg`)

            //無關鍵之存取器拋錯, returnWithStateAndMsg為true → 狀態模式照常(快照不觸及未宣告之鍵)
            let o2 = withGetter({ returnWithStateAndMsg: true }, 'unrelatedKeyForTest')
            let c2 = call(s.n, [...s.a(), o2])
            assert.ok(!c2.threw, `${s.n} getter on an unrelated key must not throw`)
            assert.ok(c2.r && c2.r.state === 'success', `${s.n} state mode must still work`)
            assert.strict.deepStrictEqual(norm(c2.r.msg), norm(ref.r), `${s.n} state msg`)
        })
    }

    it(`trim: excludeString之存取器拋錯視為未給(不去除非數字字元); excludeString為true仍生效`, function() {
        assert.strict.deepStrictEqual(M.trim(' a3b ', withGetter({}, 'excludeString')), 'a3b')
        assert.strict.deepStrictEqual(M.trim(' a3b ', { excludeString: true }), '3')
    })

    it(`round: rounding之存取器拋錯視為未給(ROUND_HALF_UP); ROUND_HALF_EVEN仍生效`, function() {
        assert.strict.deepStrictEqual(M.round(12.65, 1, withGetter({}, 'rounding')), 12.7)
        assert.strict.deepStrictEqual(M.round(12.65, 1, { rounding: 'ROUND_HALF_EVEN' }), 12.6)
    })

    it(`strTruncate: funWithMsg之存取器拋錯視為未給(只補刪節號); 函數仍生效; 未超長時不讀funWithMsg`, function() {
        assert.strict.deepStrictEqual(M.strTruncate('abcdefghij', 3, withGetter({}, 'funWithMsg')), 'abc...')
        assert.strict.deepStrictEqual(M.strTruncate('abcdefghij', 3, { funWithMsg: (s) => `(${s.length})` }), 'abc...(10)')
        let reads = 0
        let opt = {}
        Object.defineProperty(opt, 'funWithMsg', {
            enumerable: true,
            get() {
                reads += 1
                return undefined
            },
        })
        assert.strict.deepStrictEqual(M.strTruncate('ab', 3, opt), 'ab')
        assert.strict.deepStrictEqual(reads, 0)
    })

    it(`htmlDecode／htmlEncode: he之可用鍵之存取器拋錯視為未給; 有效鍵仍生效; 只認自有鍵(同he, 繼承之鍵不採用)`, function() {
        //decode: strict為true時, 無分號之具名參照(&amp)為解析錯誤而拋出(he之行為)
        assert.throws(() => M.htmlDecode('&amp', { strict: true }), /not terminated/)
        assert.strict.deepStrictEqual(M.htmlDecode('&amp', withGetter({}, 'strict')), '&')
        assert.strict.deepStrictEqual(M.htmlDecode('&amp', withGetter({}, 'isAttributeValue')), '&')
        assert.strict.deepStrictEqual(M.htmlDecode('&amp=', { isAttributeValue: true }), '&amp=')
        //繼承之鍵不採用
        assert.strict.deepStrictEqual(M.htmlDecode('&amp', Object.create({ strict: true })), '&')
        //encode
        assert.strict.deepStrictEqual(M.htmlEncode('<a>', { useNamedReferences: true }), '&lt;a&gt;')
        assert.strict.deepStrictEqual(M.htmlEncode('<a>', withGetter({}, 'useNamedReferences')), '&#x3C;a&#x3E;')
        assert.strict.deepStrictEqual(M.htmlEncode('<a>', { decimal: true }), '&#60;a&#62;')
        assert.strict.deepStrictEqual(M.htmlEncode('<a>', Object.create({ decimal: true })), '&#x3C;a&#x3E;')
    })

})


describe(`第663項: 診斷出口(opt.logDetail、opt.funLog)於快照後仍生效, 且讀取時機不變`, function() {

    it(`o2j／obj2str／obj2stru8arr／obj2u8arr: 序列化失敗時funLog仍被呼叫一次(label固定); funLog之存取器拋錯視為未給`, function() {
        let circ = {}
        circ.self = circ
        let cases = [
            ['o2j', [circ, false], '[wsemi o2j] can not serialize'],
            ['obj2str', [circ, 'Uint8Array'], '[wsemi obj2str] can not serialize'],
            ['obj2stru8arr', [circ], '[wsemi obj2stru8arr] can not serialize'],
        ]
        for (let [n, a, label] of cases) {
            let logs = []
            let r = M[n](...a, { returnWithStateAndMsg: true, funLog: (l) => logs.push(l) })
            assert.ok(r && r.state === 'error', `${n} state error`)
            assert.ok(logs.length >= 1 && logs.every((l) => l === label), `${n} funLog label`)
            let r2 = M[n](...a, withGetter({ returnWithStateAndMsg: true }, 'funLog'))
            assert.ok(r2 && r2.state === 'error', `${n} getter funLog`)
        }
    })

    it(`o2j JSDoc範例: 以opt.funLog取回序列化失敗之原生錯誤並接為Error.cause, 回傳msg為固定訊息、funLog未給logDetail時不另輸出`, function() {
        let hasCause = false
        let cause = null
        let circ = {}
        circ.self = circ
        let printed = []
        let saved = console.error
        let savedLog = console.log
        let savedWarn = console.warn
        console.error = (...a) => printed.push(a)
        console.log = (...a) => printed.push(a)
        console.warn = (...a) => printed.push(a)
        let r = null
        try {
            r = M.o2j(circ, false, {
                returnWithStateAndMsg: true,
                funLog: (label, safe, detail) => {
                    hasCause = true
                    cause = detail
                },
            })
        }
        finally {
            console.error = saved
            console.log = savedLog
            console.warn = savedWarn
        }
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid v: must be serializable to JSON' })
        assert.ok(hasCause && cause instanceof TypeError, 'funLog must hand over the native error')
        let err = hasCause ? new Error(r.msg, { cause }) : new Error(r.msg)
        assert.strict.deepStrictEqual(err.message, 'invalid v: must be serializable to JSON')
        assert.ok(err.cause instanceof TypeError, 'cause is the native error')
        assert.strict.deepStrictEqual(printed.length, 0)
    })

})


describe(`第663項: state模式不原樣轉出呼叫端所拋之文字(V20: 固定詞彙, 細節經opt.funLog)`, function() {

    let SECRET = 'SECRET-663-text'
    let S = { returnWithStateAndMsg: true }
    let boom = () => {
        throw new Error(SECRET)
    }
    let noLeak = (r, label) => {
        assert.ok(r && r.state === 'error', `${label} state error`)
        assert.ok(typeof r.msg === 'string' && !r.msg.includes(SECRET), `${label} msg must not echo the thrown text`)
    }

    it(`ab2u8arr: 已分離(detached)之ArrayBuffer → 'invalid ab: must be readable binary'`, function() {
        let b = new ArrayBuffer(8)
        structuredClone(b, { transfer: [b] })
        let r = M.ab2u8arr(b, S)
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid ab: must be readable binary' })
        assert.strict.deepStrictEqual(M.ab2u8arr(b).length, 0)
        let logs = []
        M.ab2u8arr(b, { funLog: (l) => logs.push(l) })
        assert.ok(logs.length === 1 && logs[0] === '[wsemi ab2u8arr] can not read', 'ab2u8arr diag')
    })

    it(`str2obj: ext為元素存取拋錯之陣列 → 'invalid ext: must be a readable array'; 過深之JSON → 'invalid data: must be a valid JSON text'`, function() {
        let ext = ['Uint8Array']
        Object.defineProperty(ext, '0', { get: boom, enumerable: true, configurable: true })
        let r = M.str2obj('{"a":"x"}', ext, S)
        noLeak(r, 'str2obj ext')
        assert.strict.deepStrictEqual(r.msg, 'invalid ext: must be a readable array')
        assert.strict.deepStrictEqual(M.str2obj('{"a":"x"}', ext), {})
        let deep = '['.repeat(200000) + ']'.repeat(200000)
        let r2 = M.str2obj(deep, 'Uint8Array', S)
        assert.strict.deepStrictEqual(r2, { state: 'error', msg: 'invalid data: must be a valid JSON text' })
    })

    it(`stru8arr2obj: data之存取器拋錯 → 'invalid data: must be a readable object'; binarys之存取拋錯 → 'invalid data.binarys: must be a readable array'`, function() {
        let d1 = {
            get results() {
                throw new Error(SECRET)
            },
            binarys: [],
        }
        let r1 = M.stru8arr2obj(d1, S)
        noLeak(r1, 'stru8arr2obj getter')
        assert.strict.deepStrictEqual(r1.msg, 'invalid data: must be a readable object')
        let bin = new Proxy([new Uint8Array([1, 2])], {
            get(t, k, rc) {
                if (k === 'length') {
                    throw new Error(SECRET)
                }
                return Reflect.get(t, k, rc)
            },
        })
        let r2 = M.stru8arr2obj({ results: '{"a":"[BlazeForUint8Array]::0"}', binarys: bin }, S)
        noLeak(r2, 'stru8arr2obj binarys')
        assert.strict.deepStrictEqual(r2.msg, 'invalid data.binarys: must be a readable array')
        let r3 = M.stru8arr2obj({ results: '['.repeat(200000) + ']'.repeat(200000), binarys: [] }, S)
        assert.strict.deepStrictEqual(r3, { state: 'error', msg: 'invalid data.results: must be a valid JSON text' })
    })

    it(`stru8arr2obj: 呼叫端拋出之值本身為陷阱拋錯之Proxy或已撤銷之Proxy(對其instanceof會拋錯)時, 不外拋、不轉出文字、固定訊息(含預設模式)`, function() {
        let trapThrower = (v) => new Proxy([new Uint8Array([1])], {
            get(t, k) {
                if (k === 'length') {
                    throw v
                }
                return Reflect.get(t, k)
            },
        })
        let hostiles = [
            new Proxy({}, {
                getPrototypeOf() {
                    throw new Error(SECRET)
                },
            }),
            hv.find((h) => h.name === 'revoked-object-proxy').value,
            hv.find((h) => h.name === 'all-traps-throw-object-proxy').value,
        ]
        for (let v of hostiles) {
            let r = null
            assert.doesNotThrow(() => {
                r = M.stru8arr2obj({ results: '{"a":"[BlazeForUint8Array]::0"}', binarys: trapThrower(v) }, S)
            })
            assert.ok(r && r.state === 'error' && r.msg === 'invalid data.binarys: must be a readable array', 'fixed message for a hostile thrown value')
            assert.doesNotThrow(() => {
                assert.ok(Object.keys(M.stru8arr2obj({ results: '{"a":"[BlazeForUint8Array]::0"}', binarys: trapThrower(v) })).length === 0, 'default mode returns {}')
            })
        }
    })

    it(`u8arr2obj: 讀取呼叫端之Uint8Array時拋錯(覆寫slice) → 'invalid u8a: must be readable binary'`, function() {
        let u = new Uint8Array(20)
        u.slice = boom
        let r = M.u8arr2obj(u, S)
        noLeak(r, 'u8arr2obj')
        assert.strict.deepStrictEqual(r.msg, 'invalid u8a: must be readable binary')
        assert.strict.deepStrictEqual(M.u8arr2obj(u), {})
    })

    it(`timemsTZ2expire／timemsTZ2past: 轉換期間拋出非預期錯誤(以Date替身於無引數建構時拋錯) → 狀態模式為固定訊息 'can not convert time', 預設模式之err維持'時間轉換失敗'`, function() {
        let RealDate = globalThis.Date
        class BoomDate extends RealDate {
            constructor(...a) {
                if (a.length === 0) {
                    throw new Error(SECRET)
                }
                super(...a)
            }
        }
        for (let n of ['timemsTZ2expire', 'timemsTZ2past', 'timeTZ2expire', 'timeTZ2past']) {
            let isMs = /^timems/.test(n)
            let a = [isMs ? TMSTZ : TTZ]
            globalThis.Date = BoomDate
            let r1
            let r2
            try {
                r1 = M[n](...a, null, S)
                r2 = M[n](...a, null)
            }
            finally {
                globalThis.Date = RealDate
            }
            noLeak(r1, n)
            assert.strict.deepStrictEqual(r1.msg, 'can not convert time', n)
            assert.strict.deepStrictEqual(r2.err, '時間轉換失敗', n)
        }
    })

})


describe(`第663項: 原始碼盤點(AST): 讀returnWithStateAndMsg者一律經_pickOpt取快照`, function() {

    //已改之目標檔: 不得再以opt直接讀取(get(opt, …)、opt.xxx、opt['xxx']、解構自opt)
    it(`目標函數之原始碼: 無對opt之直接讀取, 且匯入_pickOpt(站點 ${NAMES.length} 檔, 每檔皆掃到opt讀取站點之快照後之讀取)`, function() {
        let bad = []
        for (let n of NAMES) {
            let code = fs.readFileSync(path.join(srcDir, `${n}.mjs`), 'utf8')
            let r = scanOptReads(code)
            if (r.direct.length > 0) {
                bad.push(`${n}: ${r.direct.length}`)
            }
            if (!/from '\.\/_pickOpt\.mjs'/.test(code)) {
                bad.push(`${n}: no _pickOpt import`)
            }
        }
        assert.ok(bad.length === 0, `direct opt reads remain: ${bad.join('; ')}`)
    })

    //全庫: 讀returnWithStateAndMsg之站點(任一變數名)皆須在已匯入_pickOpt之檔內; 允許清單 cint、isUserPw 先以opt = pickOpt(opt, …)取快照再讀
    it(`全庫src: 讀returnWithStateAndMsg之檔 → 皆匯入_pickOpt(新增之同家族函數自動入表)`, function() {
        let files = fs.readdirSync(srcDir).filter((f) => /\.mjs$/.test(f))
        let readers = []
        let bad = []
        for (let f of files) {
            let code = fs.readFileSync(path.join(srcDir, f), 'utf8')
            let r = scanOptReads(code)
            if (r.keys.includes('returnWithStateAndMsg')) {
                readers.push(f)
                if (!/from '\.\/_pickOpt\.mjs'/.test(code)) {
                    bad.push(f)
                }
            }
        }
        assert.ok(readers.length >= 58, `scan range (found ${readers.length}, expected at least 58)`)
        assert.ok(bad.length === 0, `files reading returnWithStateAndMsg without _pickOpt: ${bad.join(', ')}`)
    })

    //掃描器自測: 各種讀取寫法皆抓得到(盲點自測)
    it(`掃描器自測: get、點、括號、解構、鏈式存取皆被判為直接讀取; 讀快照者不計`, function() {
        let pos = [
            `function f(opt = {}) { let x = get(opt, 'returnWithStateAndMsg', null) }`,
            `function f(opt = {}) { let x = opt.returnWithStateAndMsg }`,
            `function f(opt = {}) { let x = opt['returnWithStateAndMsg'] }`,
            `function f(opt = {}) { let { returnWithStateAndMsg } = opt }`,
            `function f(opt = {}) { let x = opt?.returnWithStateAndMsg }`,
            `function f(opt = {}) { let x = lodashGet(opt, 'returnWithStateAndMsg') }`,
        ]
        for (let code of pos) {
            let r = scanOptReads(code)
            assert.ok(r.direct.length === 1, `must detect: ${code}`)
            assert.ok(r.keys.includes('returnWithStateAndMsg'), `must find the key: ${code}`)
        }
        let neg = [
            `function f(opt = {}) { let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], []); let x = get(optSnap, 'returnWithStateAndMsg', null) }`,
            `// get(opt, 'returnWithStateAndMsg', null)\nfunction f(opt = {}) { return 1 }`,
            `function f(opt = {}) { let s = "get(opt, 'returnWithStateAndMsg')"; return s }`,
        ]
        for (let code of neg) {
            let r = scanOptReads(code)
            assert.ok(r.direct.length === 0, `must not flag: ${code}`)
        }
    })

    //state模式不得原樣轉出errToStr(err): 站點全集(9站)已改, 不得再出現retError(…errToStr(…)…)
    it(`全庫src: 不得再有 retError(…errToStr(…)…) 站點(state模式之訊息為固定詞彙; 掃描 ${fs.readdirSync(srcDir).filter((f) => /\.mjs$/.test(f)).length} 檔)`, function() {
        let files = fs.readdirSync(srcDir).filter((f) => /\.mjs$/.test(f))
        let hits = []
        for (let f of files) {
            let code = fs.readFileSync(path.join(srcDir, f), 'utf8')
            for (let h of scanErrEcho(code)) {
                hits.push(`${f}:${h.line}`)
            }
        }
        assert.ok(hits.length === 0, `retError(errToStr( sites remain: ${hits.join(', ')}`)
    })

    it(`errToStr站點掃描器自測: 直接、條件式內、樣板字串內皆抓到; 非retError之引數、註解、字串不計`, function() {
        let pos = [
            `function f() { try {} catch (err) { return retError(errToStr(err)) } }`,
            `function f() { try {} catch (err) { return retError(own.has(err) ? err.message : (err instanceof SyntaxError ? 'x' : errToStr(err))) } }`,
            `function f() { try {} catch (err) { return retError(\`a: \${errToStr(err)}\`) } }`,
            `function f() { try {} catch (err) { return retError(errToStr(err), '時間轉換失敗') } }`,
        ]
        for (let code of pos) {
            assert.ok(scanErrEcho(code).length === 1, `must detect: ${code}`)
        }
        let neg = [
            `function f() { let m = errToStr(1); return m }`,
            `// retError(errToStr(err))\nfunction f() { return 1 }`,
            `function f() { let s = "retError(errToStr(err))"; return s }`,
            `function f() { try {} catch (err) { return retError('invalid x: must be y') } }`,
        ]
        for (let code of neg) {
            assert.ok(scanErrEcho(code).length === 0, `must not flag: ${code}`)
        }
    })

})
