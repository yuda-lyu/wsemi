import assert from 'assert'
import cp from 'child_process'
import execSpawnError from '../src/_execSpawnError.mjs'


describe(`_execSpawnError`, function() {

    let SA = 'SECRET_ARG_7d1f' //機密標記

    //mkErr, 依node之錯誤形狀造Error物件, 不實際spawn
    let mkErr = (props) => {
        return Object.assign(new Error(props.message), props)
    }

    it(`should keep the message and code of a system error that has errno`, function() {
        //P01a: 有errno之系統錯誤, message為「syscall 錯誤碼」不含參數, 原樣使用; 不讀spawnargs
        let err = mkErr({ message: 'spawn C:/x.exe ENOENT', code: 'ENOENT', errno: -4058, syscall: 'spawn C:/x.exe', path: 'C:/x.exe', spawnargs: ['a', SA] })
        assert.strict.deepStrictEqual(execSpawnError(err), { code: 'ENOENT', message: 'spawn C:/x.exe ENOENT' })
    })

    it(`should strip the Received value of node argument validation errors and keep the argument name`, function() {
        //P01b: 無errno之參數檢查錯誤, 去除「. Received 值」起之尾段
        let e1 = mkErr({ message: `The argument 'args[2]' must be a string without null bytes. Received '${SA}\\x00x'`, code: 'ERR_INVALID_ARG_VALUE' })
        let e2 = mkErr({ message: `The "file" argument must be of type string. Received undefined`, code: 'ERR_INVALID_ARG_TYPE' })
        let e3 = mkErr({ message: `The property 'options.env['K']' must be a string without null bytes. Received '${SA}\\x00'\nline2`, code: 'ERR_INVALID_ARG_VALUE' })
        let r = [e1, e2, e3].map(execSpawnError)
        assert.strict.deepStrictEqual(r, [
            { code: 'ERR_INVALID_ARG_VALUE', message: `The argument 'args[2]' must be a string without null bytes` },
            { code: 'ERR_INVALID_ARG_TYPE', message: `The "file" argument must be of type string` },
            { code: 'ERR_INVALID_ARG_VALUE', message: `The property 'options.env['K']' must be a string without null bytes` },
        ])
    })

    it(`should not contain the argument value for the real error thrown by node spawn with a null byte`, function() {
        //P01b: 以node實際拋出之錯誤驗證訊息格式, node若改變格式致值外露即失敗
        let err = null
        try {
            cp.spawn(process.execPath, ['-e', '1', SA + '\u0000x'])
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null && String(err.message).includes(SA), true) //前提: node原訊息含值
        let r = execSpawnError(err)
        assert.strict.deepStrictEqual(r.code, 'ERR_INVALID_ARG_VALUE')
        assert.strict.deepStrictEqual(r.message.includes(SA), false)
        assert.strict.deepStrictEqual(r.message.includes('Received'), false)
        assert.strict.deepStrictEqual(r.message.includes(`'args[2]'`), true)
    })

    it(`should fall back to UNKNOWN when code is missing and to code when message is empty`, function() {
        //P01c、P01e
        let r1 = execSpawnError(new Error('spawn x'))
        let r2 = execSpawnError(mkErr({ message: '', code: 'EPERM', errno: -4048 }))
        assert.strict.deepStrictEqual([r1, r2], [{ code: 'UNKNOWN', message: 'spawn x' }, { code: 'EPERM', message: 'EPERM' }])
    })

    it(`should not throw for non-object input or throwing getters`, function() {
        //P01d: 任何輸入皆不拋錯
        let px = new Proxy({}, {
            get() {
                throw new Error('boom')
            },
        })
        let rs = []
        assert.doesNotThrow(() => {
            for (let v of [undefined, null, 'str', 123, {}, px]) {
                rs.push(execSpawnError(v))
            }
        })
        assert.strict.deepStrictEqual(rs.map((r) => [typeof r.code, typeof r.message, r.code]), [
            ['string', 'string', 'UNKNOWN'],
            ['string', 'string', 'UNKNOWN'],
            ['string', 'string', 'UNKNOWN'],
            ['string', 'string', 'UNKNOWN'],
            ['string', 'string', 'UNKNOWN'],
            ['string', 'string', 'UNKNOWN'],
        ])
    })

})
