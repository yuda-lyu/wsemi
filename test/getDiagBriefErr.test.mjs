import assert from 'assert'
import getDiagBriefErr from '../src/getDiagBriefErr.mjs'
import { CODES } from '../src/_diagCodes.mjs'
import strCompareForVersion from '../src/strCompareForVersion.mjs'
import diagSuite from './tools/diagSuite.mjs'


//getDiagBriefErr為錯誤之安全摘要, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01


describe(`getDiagBriefErr`, function() {

    it(`should not accept codes by pattern, only listed members`, function() {
        //設計§3.3: 不用任何樣式, 整數只收集合明列者
        let f = (c, codes) => getDiagBriefErr(Object.assign(new Error('x'), { code: c }), { codes }).errCode
        assert.strict.deepStrictEqual([f('SQLITE_FOO', ['sqlite']), f('MDB_X', ['lmdb']), f(2627, ['mssql']), f(2627, []), f('DuplicateKey', ['mongoServer'])], [undefined, undefined, 2627, undefined, 'DuplicateKey'])
    })

    it(`should ignore unknown code set names and invalid opt`, function() {
        //設計§3.3: 宣告之集合名稱不存在者不收; opt任何值不拋錯
        let e = Object.assign(new Error('x'), { code: '23505' })
        assert.strict.deepStrictEqual([getDiagBriefErr(e, { codes: ['nope', 'toString'] }), getDiagBriefErr(e, null), getDiagBriefErr(e, 'x')], [{ errType: 'Error' }, { errType: 'Error' }, { errType: 'Error' }])
    })

    diagSuite('getDiagBriefErr')

})


//排程第610項①⑧(twsm1): opt.format恰為'text'時回行內字串'(errType errCode)'; fetch(undici)之系統錯誤碼在cause.code, 須nested: ['cause'](JSDoc範例)
describe(`getDiagBriefErr format text and fetch cause`, function() {

    let mk = (msg, code) => Object.assign(new Error(msg), { code })

    it(`should return '(errType errCode)' or '(errType)' when opt.format is 'text', with the same whitelist as the object form`, function() {
        let r = [
            getDiagBriefErr(mk('no such file /home/u/secret.txt', 'ENOENT'), { format: 'text' }),
            getDiagBriefErr(new RangeError('bad 123'), { format: 'text' }),
            getDiagBriefErr(mk('dup', '23505'), { format: 'text' }), //不在允許集合之代碼不列
            getDiagBriefErr(mk('dup', '23505'), { format: 'text', codes: ['sqlstate'] }),
            getDiagBriefErr(mk('m', 2), { format: 'text', codes: ['mongoServer'] }),
            getDiagBriefErr(Object.assign(new Error('x'), { name: 'Evil name here' }), { format: 'text' }), //非白名單之類別名一律Error
            getDiagBriefErr('plain string', { format: 'text' }),
            getDiagBriefErr(null, { format: 'text' }),
            getDiagBriefErr(Object.assign(new TypeError('fetch failed'), { cause: mk('c', 'ECONNREFUSED') }), { format: 'text', nested: ['cause'] }),
        ]
        assert.strict.deepStrictEqual(r, ['(Error ENOENT)', '(RangeError)', '(Error)', '(Error 23505)', '(Error 2)', '(Error)', '(string)', '(null)', '(TypeError ECONNREFUSED)'])
    })

    it(`should keep the object form for any format other than exactly 'text' (missing, other strings, non-strings, accessor not executed)`, function() {
        let e = mk('x', 'ENOENT')
        let n = 0
        let acc = {}
        Object.defineProperty(acc, 'format', {
            get: () => {
                n++; return 'text'
            },
            enumerable: true
        })
        let inherited = Object.create({ format: 'text' })
        for (let o of [undefined, null, {}, { format: 'TEXT' }, { format: 'text ' }, { format: true }, { format: ['text'] }, acc, inherited, new Proxy({ format: 'text' }, {}), 'text']) {
            assert.strict.deepStrictEqual(getDiagBriefErr(e, o), { errType: 'Error', errCode: 'ENOENT' }, String(o))
        }
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`should read the system error code of a real fetch failure only from cause.code with nested ['cause'] (JSDoc example)`, async function() {
        let net = await import('net')
        //取一個剛關閉之本機埠(無服務監聽, 不連外)
        let port = await new Promise((resolve) => {
            let sv = net.createServer()
            sv.listen(0, '127.0.0.1', () => {
                let p = sv.address().port
                sv.close(() => resolve(p))
            })
        })
        let err = null
        try {
            await fetch(`http://127.0.0.1:${port}/`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null, true)
        assert.strict.deepStrictEqual(getDiagBriefErr(err), { errType: 'TypeError' })
        assert.strict.deepStrictEqual(getDiagBriefErr(err, { nested: ['cause'] }), { errType: 'TypeError', errCode: 'ECONNREFUSED' })
        assert.strict.deepStrictEqual(getDiagBriefErr(err, { nested: ['cause'], format: 'text' }), '(TypeError ECONNREFUSED)')
    })

})


//排程第621項②(twsm2): NODE集合納入undici(Node內建fetch)之連線與回應層代碼; 以真實fetch失敗(本機服務, 不連外網)之cause.code驗證(ERR_SSL_PROTOCOL_ERROR原亦列入, 第663項經主控裁定移除: 為Chromium之網路錯誤名, Node不產生)
describe(`getDiagBriefErr undici codes of real fetch failures`, function() {
    this.timeout(30000)

    let net = null
    let http = null
    before(async function() {
        net = await import('net')
        http = await import('http')
    })
    let listen = (sv) => {
        return new Promise((resolve) => {
            sv.listen(0, '127.0.0.1', () => resolve(sv.address().port))
        })
    }
    let close = (sv, socks) => {
        return new Promise((resolve) => {
            socks.forEach((s) => s.destroy())
            if (sv.closeAllConnections) {
                sv.closeAllConnections()
            }
            sv.close(() => resolve())
        })
    }
    let brief = (e) => getDiagBriefErr(e, { nested: ['cause'] })
    //rawServer, 原始TCP服務: 收到請求後交onReq寫出回應
    let rawServer = async (onReq) => {
        let socks = []
        let sv = net.createServer((s) => {
            socks.push(s)
            s.once('data', () => onReq(s))
        })
        let port = await listen(sv)
        return { sv, socks, url: `http://127.0.0.1:${port}/` }
    }

    it(`should list UND_ERR_SOCKET of a body cut off in the middle (TypeError terminated)`, async function() {
        let socks = []
        let sv = http.createServer((req, res) => {
            socks.push(req.socket)
            res.writeHead(200, { 'content-length': '1000' })
            res.write('x'.repeat(10))
        })
        let port = await listen(sv)
        let err = null
        try {
            let res = await fetch(`http://127.0.0.1:${port}/`) //已收到標頭
            socks.forEach((s) => s.destroy()) //本體中途斷線
            await res.arrayBuffer()
        }
        catch (e) {
            err = e
        }
        await close(sv, socks)
        assert.strict.deepStrictEqual([err && err.message, err && err.cause && err.cause.code], ['terminated', 'UND_ERR_SOCKET'])
        assert.strict.deepStrictEqual(brief(err), { errType: 'TypeError', errCode: 'UND_ERR_SOCKET' })
        assert.strict.deepStrictEqual(getDiagBriefErr(err, { nested: ['cause'], format: 'text' }), '(TypeError UND_ERR_SOCKET)')
    })

    it(`should list UND_ERR_HEADERS_OVERFLOW and UND_ERR_RES_CONTENT_LENGTH_MISMATCH of real responses`, async function() {
        let a = await rawServer((s) => {
            s.write(`HTTP/1.1 200 OK\r\nX-Big: ${'a'.repeat(70000)}\r\nContent-Length: 2\r\n\r\nok`)
        })
        let e1 = null
        try {
            await fetch(a.url)
        }
        catch (e) {
            e1 = e
        }
        await close(a.sv, a.socks)
        let b = await rawServer((s) => {
            s.write('HTTP/1.1 200 OK\r\nContent-Length: 20\r\nConnection: close\r\n\r\nok')
            s.end()
        })
        let e2 = null
        try {
            let res = await fetch(b.url)
            await res.arrayBuffer()
        }
        catch (e) {
            e2 = e
        }
        await close(b.sv, b.socks)
        assert.strict.deepStrictEqual([brief(e1), brief(e2)], [{ errType: 'TypeError', errCode: 'UND_ERR_HEADERS_OVERFLOW' }, { errType: 'TypeError', errCode: 'UND_ERR_RES_CONTENT_LENGTH_MISMATCH' }])
    })

    it(`should list UND_ERR_HEADERS_TIMEOUT and UND_ERR_BODY_TIMEOUT of a slow local server (fetch with an undici Agent of short timeouts; skipped without the undici package)`, async function() {
        let Agent = null
        try {
            Agent = (await import('undici')).Agent
        }
        catch (e) {
            this.skip() //undici套件為間接相依(非本套件之相依), 不存在時略過
        }
        //標頭逾時: 接受連線而不回應
        let a = await rawServer(() => {})
        let e1 = null
        try {
            await fetch(a.url, { dispatcher: new Agent({ headersTimeout: 200 }) })
        }
        catch (e) {
            e1 = e
        }
        await close(a.sv, a.socks)
        //本體逾時: 送標頭與1位元組後不再送
        let b = await rawServer((s) => {
            s.write('HTTP/1.1 200 OK\r\nContent-Length: 1000\r\n\r\nx')
        })
        let e2 = null
        try {
            let res = await fetch(b.url, { dispatcher: new Agent({ bodyTimeout: 200 }) })
            await res.arrayBuffer()
        }
        catch (e) {
            e2 = e
        }
        await close(b.sv, b.socks)
        assert.strict.deepStrictEqual([brief(e1), brief(e2)], [{ errType: 'TypeError', errCode: 'UND_ERR_HEADERS_TIMEOUT' }, { errType: 'TypeError', errCode: 'UND_ERR_BODY_TIMEOUT' }])
    })

    it(`should list the undici codes not reproducible locally, and not list undici codes of argument or usage errors nor ERR_SSL_PROTOCOL_ERROR (a Chromium network error name that Node does not produce; 第663項)`, function() {
        let f = (c) => brief(Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('x'), { code: c }) })).errCode
        assert.strict.deepStrictEqual(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_CLOSED', 'UND_ERR_DESTROYED', 'UND_ERR_PRX_TLS'].map(f), ['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_CLOSED', 'UND_ERR_DESTROYED', 'UND_ERR_PRX_TLS'])
        assert.strict.deepStrictEqual(['UND_ERR_INVALID_ARG', 'UND_ERR_NOT_SUPPORTED', 'UND_ERR_INFO', 'HPE_INVALID_CONSTANT', 'UND_ERR_', 'ERR_SSL_PROTOCOL_ERROR'].map(f), [undefined, undefined, undefined, undefined, undefined, undefined])
        assert.ok(!CODES.NODE.includes('ERR_SSL_PROTOCOL_ERROR'), 'ERR_SSL_PROTOCOL_ERROR must not be listed')
    })

    //第663項(主控裁定): NODE集合限以Node或undici實證之代碼; 以執行中之Node之內建原始碼(errors、undici、crypto與tls之常數)逐一核對, 唯OpenSSL之原因碼(ERR_SSL_*)只在握手時動態產生, 以真實連線核對
    it(`(第663項) every code of CODES.NODE should be evidenced by the running Node: its built-in sources, or a real TLS handshake for the OpenSSL reason codes`, async function() {
        let src = ''
        try {
            src = Object.values(process.binding('natives')).map((v) => String(v)).join('\n') // eslint-disable-line n/no-deprecated-api
        }
        catch (err) {
            src = ''
        }
        assert.ok(src.length > 100000, 'the built-in sources of the running Node should be readable (process.binding natives)')
        let dynamic = ['ERR_SSL_WRONG_VERSION_NUMBER'] //OpenSSL之原因碼, 於握手時動態產生為ERR_SSL_+原因
        let missing = CODES.NODE.filter((c) => !dynamic.includes(c) && !src.includes(c))
        assert.strict.deepStrictEqual(missing, [], `codes without evidence in the running Node: ${missing.join(' ')}`)

        //ERR_SSL_WRONG_VERSION_NUMBER: 以內建fetch之https連到純http之本機服務(不連外網), cause.code為該碼(node:https之request則為EPROTO)
        let sv = http.createServer((q, s) => s.end('x'))
        let port = await listen(sv)
        let got = null
        try {
            await fetch(`https://127.0.0.1:${port}/`)
        }
        catch (e) {
            got = e && e.cause && e.cause.code
        }
        await new Promise((resolve) => sv.close(() => resolve()))
        assert.strict.deepStrictEqual(got, 'ERR_SSL_WRONG_VERSION_NUMBER')
        assert.ok(CODES.NODE.includes(got), 'the code obtained from the real handshake must be listed')
    })

    //排程第621項②複核(2026-11-27): 代碼集合以「執行中之Node所內建之undici」之實際代碼核對, 不憑記憶列
    it(`(第621項) every listed UND_ERR_* code should exist in the undici bundled with the running Node, and UND_ERR_SOCKS (connection layer, as UND_ERR_PRX_TLS) should pass while UND_ERR_HTTP_PARSER should not`, function() {
        let src = ''
        try {
            //內建之undici原始碼只能經process.binding('natives')讀出(無公開API); 唯讀、只取代碼字串; 日後Node移除此途徑時本案轉紅, 須改核對來源
            src = String(process.binding('natives')['internal/deps/undici/undici'] || '') // eslint-disable-line n/no-deprecated-api
        }
        catch (err) {
            src = ''
        }
        assert.ok(src.length > 0, 'the bundled undici source of the running Node should be readable (process.binding natives)')
        let real = new Set(src.match(/UND_ERR_[A-Z_]+/g) || [])
        let listed = CODES.NODE.filter((c) => c.startsWith('UND_ERR_'))
        assert.ok(listed.length >= 10, 'listed UND_ERR_* codes should be found')
        //NEWER, 只見於較新undici之代碼 → 核實所用之版本(npm之7.24.8尚無; 執行中之Node內建版低於此版時允許不在, 以免舊版Node誤紅)
        let NEWER = { UND_ERR_SOCKS: '7.30.1' }
        let ver = String(process.versions.undici || '0.0.0')
        for (let c of listed) {
            let older = NEWER[c] !== undefined && strCompareForVersion(ver, NEWER[c]) < 0
            assert.ok(real.has(c) || older, `${c} should exist in the bundled undici ${ver}`)
        }
        let f = (c) => brief(Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error('x'), { code: c }) })).errCode
        assert.strict.deepStrictEqual([f('UND_ERR_SOCKS'), f('UND_ERR_HTTP_PARSER')], ['UND_ERR_SOCKS', undefined])
    })

})
