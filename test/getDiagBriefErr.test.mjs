import assert from 'assert'
import getDiagBriefErr from '../src/getDiagBriefErr.mjs'
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
