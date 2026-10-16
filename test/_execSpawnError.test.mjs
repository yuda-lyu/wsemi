import assert from 'assert'
import fs from 'fs'
import path from 'path'
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


//R-EXEC-FAIL-01之7: cwd不存在或非資料夾所致之ENOENT, 訊息改指cwd(碼不變); cwd之判定跟隨連結(有效之junction為有效cwd, 懸空者為無效)
describe(`execSpawnError 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    //夾具: test/_tmp/_execSpawnError/, before建、after刪
    let fdFx = path.resolve('./test/_tmp/_execSpawnError')
    let fdOk = path.join(fdFx, 'okdir') //既存資料夾
    let fpFile = path.join(fdFx, 'afile.txt') //既存檔案
    let fdMissing = path.join(fdFx, 'no-such-dir') //不存在
    let fdJn = path.join(fdFx, 'jn') //junction, 指向既存資料夾okdir
    let fdGone = path.join(fdFx, 'gone') //junction之目標, 建立連結後刪除
    let fdDang = path.join(fdFx, 'dang') //懸空junction, 指向已刪除之gone

    before(function() {
        fs.rmSync(fdFx, { recursive: true, force: true })
        fs.mkdirSync(fdOk, { recursive: true })
        fs.writeFileSync(fpFile, 'x')
        fs.symlinkSync(fdOk, fdJn, 'junction')
        fs.mkdirSync(fdGone)
        fs.symlinkSync(fdGone, fdDang, 'junction')
        fs.rmSync(fdGone, { recursive: true, force: true })
    })
    after(function() {
        fs.rmSync(fdFx, { recursive: true, force: true })
    })

    //mkErr, 依node之錯誤形狀造Error物件(有errno之系統錯誤), 不實際spawn
    let mkErr = (code, errno) => {
        return Object.assign(new Error(`spawn x ${code}`), { code, errno, syscall: 'spawn x', path: 'x' })
    }

    it(`ENOENT且cwd不存在: 訊息改為'cwd is not an existing folder: <cwd>', 碼仍為ENOENT [R-EXEC-FAIL-01之7]`, function() {
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd: fdMissing })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'cwd is not an existing folder: ' + fdMissing })
    })

    it(`ENOENT且cwd為檔案: 同形改寫 [R-EXEC-FAIL-01之7]`, function() {
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd: fpFile })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'cwd is not an existing folder: ' + fpFile })
    })

    it(`ENOENT且cwd之上層為檔案(stat回ENOTDIR或ENOENT): 同形改寫 [R-EXEC-FAIL-01之7]`, function() {
        let cwd = path.join(fpFile, 'sub')
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'cwd is not an existing folder: ' + cwd })
    })

    it(`ENOENT且cwd為既存資料夾: 訊息原樣(指向執行檔, 非cwd之問題) [R-EXEC-FAIL-01之7, 對照]`, function() {
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd: fdOk })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'spawn x ENOENT' })
    })

    it(`ENOENT且cwd為指向既存資料夾之junction: 訊息原樣(連結跟隨至資料夾即為有效cwd, 不誤報) [R-EXEC-FAIL-01之7]`, function() {
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd: fdJn })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'spawn x ENOENT' })
    })

    it(`ENOENT且cwd為懸空junction(目標已刪): 同形改寫 [R-EXEC-FAIL-01之7]`, function() {
        let r = execSpawnError(mkErr('ENOENT', -4058), { cwd: fdDang })
        assert.strict.deepStrictEqual(r, { code: 'ENOENT', message: 'cwd is not an existing folder: ' + fdDang })
    })

    it(`碼非ENOENT(如EACCES)而cwd不存在: 訊息原樣(只改寫ENOENT) [R-EXEC-FAIL-01之7]`, function() {
        let r = execSpawnError(mkErr('EACCES', -4092), { cwd: fdMissing })
        assert.strict.deepStrictEqual(r, { code: 'EACCES', message: 'spawn x EACCES' })
    })

    it(`不給opt、opt無cwd、cwd為空字串或非字串、opt為null: 訊息原樣 [R-EXEC-FAIL-01之7]`, function() {
        let rs = [
            execSpawnError(mkErr('ENOENT', -4058)),
            execSpawnError(mkErr('ENOENT', -4058), {}),
            execSpawnError(mkErr('ENOENT', -4058), { cwd: '' }),
            execSpawnError(mkErr('ENOENT', -4058), { cwd: 123 }),
            execSpawnError(mkErr('ENOENT', -4058), null),
        ]
        assert.strict.deepStrictEqual(rs, new Array(5).fill({ code: 'ENOENT', message: 'spawn x ENOENT' }))
    })

})
