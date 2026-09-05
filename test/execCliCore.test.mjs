import assert from 'assert'
import fs from 'fs'
import path from 'path'
import execCliCore from '../src/execCliCore.mjs'


describe(`execCliCore`, function() {

    let { buildSpawnArgs, buildSpawnEnv } = execCliCore
    let isWin = (process.platform === 'win32')

    //暫存目錄, 於cwd下之_test_*(已gitignore)
    let fdTest = path.resolve('./_test_execCliCore')
    let mk = (fp, content) => {
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, content, 'utf8')
    }
    before(function() {
        fs.rmSync(fdTest, { recursive: true, force: true })
        fs.mkdirSync(fdTest, { recursive: true })
        //x.cmd: 仿npm shim, 末行含"%dp0%\node_modules\pkg\bin\x.js", 且該檔存在
        mk(path.join(fdTest, 'x.cmd'), '@ECHO off\r\nSETLOCAL\r\nSET dp0=%~dp0\r\n"%_prog%"  "%dp0%\\node_modules\\pkg\\bin\\x.js" %*\r\n')
        mk(path.join(fdTest, 'node_modules', 'pkg', 'bin', 'x.js'), 'console.log(1)\n')
        //y.cmd: 不含%dp0%, 無法解析入口
        mk(path.join(fdTest, 'y.cmd'), '@ECHO off\r\necho y\r\n')
        //z.cmd: 入口為原生.exe
        mk(path.join(fdTest, 'z.cmd'), '@ECHO off\r\n"%_prog%"  "%dp0%\\node_modules\\pkg\\bin\\z.exe" %*\r\n')
        mk(path.join(fdTest, 'node_modules', 'pkg', 'bin', 'z.exe'), '')
        //w.cmd: 入口路徑存在於文字但實體檔不存在
        mk(path.join(fdTest, 'w.cmd'), '@ECHO off\r\n"%_prog%"  "%dp0%\\node_modules\\pkg\\bin\\missing.js" %*\r\n')
    })
    after(function() {
        fs.rmSync(fdTest, { recursive: true, force: true })
    })

    describe(`buildSpawnArgs`, function() {

        it(`should return { file, args, opt } with opt always present and fallback args to [] when args is not an array`, function() {
            let r = buildSpawnArgs(process.execPath, 'not-array')
            assert.strict.deepStrictEqual(Object.keys(r).sort(), ['args', 'file', 'opt'])
            assert.strict.deepStrictEqual(r.args, [])
            assert.strict.deepStrictEqual(r.opt, {})
        })

        it(`should return command as-is with opt {} on non-Windows`, function() {
            if (isWin) {
                this.skip()
            }
            let r = buildSpawnArgs('node', ['-e', '1'])
            assert.strict.deepStrictEqual(r, { file: 'node', args: ['-e', '1'], opt: {} })
        })

        it(`should resolve a global command to its .exe on Windows (e.g. node)`, function() {
            if (!isWin) {
                this.skip()
            }
            let r = buildSpawnArgs('node', ['-e', '1'])
            // console.log('exe r', r)
            assert.strict.deepStrictEqual(/\.exe$/i.test(r.file), true)
            assert.strict.deepStrictEqual(r.args, ['-e', '1'])
            assert.strict.deepStrictEqual(r.opt, {})
        })

        it(`should pass absolute .exe path through unchanged on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            let r = buildSpawnArgs(process.execPath, ['-v'])
            assert.strict.deepStrictEqual(r, { file: process.execPath, args: ['-v'], opt: {} })
        })

        it(`should map .cmd with JS entry to node + entry path on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            let fp = path.join(fdTest, 'x.cmd')
            let r = buildSpawnArgs(fp, ['--flag', 'multi\nline'])
            // console.log('cmd-js r', r)
            assert.strict.deepStrictEqual(r.file, process.execPath)
            assert.strict.deepStrictEqual(r.args[0], path.join(fdTest, 'node_modules', 'pkg', 'bin', 'x.js'))
            assert.strict.deepStrictEqual(r.args.slice(1), ['--flag', 'multi\nline'])
            assert.strict.deepStrictEqual(r.opt, {})
        })

        it(`should map .cmd whose entry is a native .exe to that .exe on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            let fp = path.join(fdTest, 'z.cmd')
            let r = buildSpawnArgs(fp, ['a'])
            // console.log('cmd-exe r', r)
            assert.strict.deepStrictEqual(r.file, path.join(fdTest, 'node_modules', 'pkg', 'bin', 'z.exe'))
            assert.strict.deepStrictEqual(r.args, ['a'])
            assert.strict.deepStrictEqual(r.opt, {})
        })

        it(`should fallback to cmd.exe /d /s /c with windowsVerbatimArguments for unparsable .cmd on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            let fp = path.join(fdTest, 'y.cmd')
            let r = buildSpawnArgs(fp, ['a b', 'c"d'])
            // console.log('cmd-fallback r', r)
            let comspec = process.env.comspec || process.env.COMSPEC || 'cmd.exe'
            assert.strict.deepStrictEqual(r.file, comspec)
            assert.strict.deepStrictEqual(r.args.slice(0, 3), ['/d', '/s', '/c'])
            assert.strict.deepStrictEqual(r.args.length, 4)
            assert.strict.deepStrictEqual(r.args[3].startsWith('"'), true)
            assert.strict.deepStrictEqual(r.args[3].endsWith('"'), true)
            assert.strict.deepStrictEqual(r.args[3].includes('y.cmd'), true)
            assert.strict.deepStrictEqual(r.opt, { windowsVerbatimArguments: true })
        })

        it(`should fallback to cmd.exe when .cmd entry text exists but file is missing on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            let fp = path.join(fdTest, 'w.cmd')
            let r = buildSpawnArgs(fp, [])
            let comspec = process.env.comspec || process.env.COMSPEC || 'cmd.exe'
            assert.strict.deepStrictEqual(r.file, comspec)
            assert.strict.deepStrictEqual(r.opt, { windowsVerbatimArguments: true })
        })

    })

    describe(`buildSpawnEnv`, function() {

        it(`should inherit process.env and add PYTHONIOENCODING=utf-8 when envExtra is undefined`, function() {
            let env = buildSpawnEnv()
            assert.strict.deepStrictEqual(env.PYTHONIOENCODING, 'utf-8')
            for (let k of Object.keys(process.env)) {
                if (k.toUpperCase() === 'PYTHONIOENCODING') {
                    continue
                }
                assert.strict.deepStrictEqual(env[k], process.env[k])
            }
        })

        it(`should merge envExtra with precedence and not mutate process.env`, function() {
            let env = buildSpawnEnv({ WSEMI_TEST_ENV_A: 'va', PYTHONIOENCODING: 'latin1' })
            assert.strict.deepStrictEqual(env.WSEMI_TEST_ENV_A, 'va')
            assert.strict.deepStrictEqual(env.PYTHONIOENCODING, 'latin1')
            assert.strict.deepStrictEqual(process.env.WSEMI_TEST_ENV_A, undefined)
        })

        it(`should keep key with undefined value (spawn drops it) to allow removing an inherited variable`, function() {
            process.env.WSEMI_TEST_ENV_B = 'inherited'
            try {
                let env = buildSpawnEnv({ WSEMI_TEST_ENV_B: undefined })
                assert.strict.deepStrictEqual('WSEMI_TEST_ENV_B' in env, true)
                assert.strict.deepStrictEqual(env.WSEMI_TEST_ENV_B, undefined)
            }
            finally {
                delete process.env.WSEMI_TEST_ENV_B
            }
        })

        it(`should treat differently-cased same-name keys as one variable on Windows only`, function() {
            process.env.WSEMI_TEST_ENV_C = 'upper'
            try {
                let env = buildSpawnEnv({ wsemi_test_env_c: 'lower' })
                assert.strict.deepStrictEqual(env.wsemi_test_env_c, 'lower')
                if (isWin) {
                    //win32: 大小寫不同之既有鍵須被移除, 否則兩鍵並存且Windows取原值
                    assert.strict.deepStrictEqual('WSEMI_TEST_ENV_C' in env, false)
                }
                else {
                    //POSIX: 大小寫敏感, 兩者為獨立變數
                    assert.strict.deepStrictEqual(env.WSEMI_TEST_ENV_C, 'upper')
                }
            }
            finally {
                delete process.env.WSEMI_TEST_ENV_C
            }
        })

    })

})
