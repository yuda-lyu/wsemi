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

        it(`should throw ENOENT pointing to the entry when .cmd shim entry file is missing on Windows`, function() {
            if (!isWin) {
                this.skip()
            }
            //R-EXEC-FAIL-01之6a: npm shim已辨識(入口位於執行行)而入口檔不存在者, 同規則6拋ENOENT且訊息指入口路徑, 不交cmd.exe(原「fallback to cmd.exe」之規格改寫, 2026-10-16裁示)
            let fp = path.join(fdTest, 'w.cmd')
            let err = null
            try {
                buildSpawnArgs(fp, [])
            }
            catch (e) {
                err = e
            }
            let entry = path.join(fdTest, 'node_modules', 'pkg', 'bin', 'missing.js')
            assert.strict.deepStrictEqual(err instanceof Error, true, 'buildSpawnArgs須拋出Error') //規則6a: 拋出(由呼叫端之同步catch回報)
            assert.strict.deepStrictEqual([err.code, err.message, err.path], ['ENOENT', `spawn ${entry} ENOENT`, entry]) //規則6a: 'spawn <入口檔路徑> ENOENT', path同node之形
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


//R-EXEC-FAIL-01之6、6a: 命令解析與批次檔存在(.cmd/.bat不存在者、npm shim之入口檔不存在者不交cmd.exe, 拋與node同形之ENOENT, 由呼叫端之同步catch以結果物件回報)
describe(`buildSpawnArgs 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    let { buildSpawnArgs } = execCliCore
    let isWin = (process.platform === 'win32')

    //夾具: test/_tmp/execCliCore/, before建、after刪
    let fdFx = path.resolve('./test/_tmp/execCliCore')
    before(function() {
        fs.rmSync(fdFx, { recursive: true, force: true })
        fs.mkdirSync(fdFx, { recursive: true })
        fs.writeFileSync(path.join(fdFx, 'user.cmd'), '@echo off\r\necho hello-from-user-cmd\r\n')
        fs.writeFileSync(path.join(fdFx, 'user.bat'), '@echo off\r\necho hello-from-user-bat\r\n')
    })
    after(function() {
        fs.rmSync(fdFx, { recursive: true, force: true })
    })

    for (let [name, cmd, opt] of [
        ['絕對路徑之.cmd', path.join(fdFx, 'missing.cmd'), {}],
        ['絕對路徑之.bat', path.join(fdFx, 'missing.bat'), {}],
        ['只給檔名之.cmd', 'wsemi-not-exist-zz.cmd', {}],
        ['只給檔名之.bat', 'wsemi-not-exist-zz.bat', {}],
        ['含目錄之相對路徑(以opt.cwd為基準)', '.\\missing.cmd', { cwd: fdFx }],
    ]) {
        it(`不存在之${name}拋出code為ENOENT、訊息為'spawn <路徑> ENOENT'(同node)之錯誤, 不交cmd.exe [R-EXEC-FAIL-01之6]`, function() {
            if (!isWin) {
                this.skip()
            }
            let err = null
            try {
                buildSpawnArgs(cmd, [], opt)
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(err instanceof Error, true, 'buildSpawnArgs須拋出Error')
            assert.strict.deepStrictEqual([err.code, err.message], ['ENOENT', `spawn ${cmd} ENOENT`])
        })
    }

    for (let [name, cmd, opt] of [
        ['絕對路徑之.cmd', path.join(fdFx, 'user.cmd'), {}],
        ['絕對路徑之.bat', path.join(fdFx, 'user.bat'), {}],
        ['含目錄之相對路徑(以opt.cwd為基準)', '.\\user.cmd', { cwd: fdFx }],
    ]) {
        it(`存在之${name}不拋錯, 無node入口者經cmd.exe退路(file為cmd.exe、windowsVerbatimArguments) [R-EXEC-FAIL-01之6, 對照]`, function() {
            if (!isWin) {
                this.skip()
            }
            let r = buildSpawnArgs(cmd, [], opt)
            assert.strict.deepStrictEqual([/(^|[\\/])cmd\.exe$/i.test(r.file), r.opt], [true, { windowsVerbatimArguments: true }], `file=${r.file}`)
        })
    }

    for (let [name, file, content, entryRel] of [
        ['node shebang形狀(cmd-shim 8)', 'shimjs.cmd', ['@ECHO off', 'GOTO start', ':find_dp0', 'SET dp0=%~dp0', 'EXIT /b', ':start', 'SETLOCAL', 'CALL :find_dp0', '', 'IF EXIST "%dp0%\\node.exe" (', '  SET "_prog=%dp0%\\node.exe"', ') ELSE (', '  SET "_prog=node"', ')', '', 'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%"  "%dp0%\\node_modules\\zz\\bin\\cli.js" %*', ''], 'node_modules\\zz\\bin\\cli.js'],
        ['無shebang形狀(原生.exe入口)', 'shimexe.cmd', ['@ECHO off', 'GOTO start', ':find_dp0', 'SET dp0=%~dp0', 'EXIT /b', ':start', 'SETLOCAL', 'CALL :find_dp0', '"%dp0%\\node_modules\\zz\\bin\\zz.exe"   %*', ''], 'node_modules\\zz\\bin\\zz.exe'],
    ]) {
        it(`npm shim(${name})之入口檔不存在時拋出code為ENOENT、訊息為'spawn <入口> ENOENT'之錯誤, 不交cmd.exe [R-EXEC-FAIL-01之6a]`, function() {
            if (!isWin) {
                this.skip()
            }
            fs.writeFileSync(path.join(fdFx, file), content.join('\r\n'))
            let entry = path.join(fdFx, entryRel)
            let err = null
            try {
                buildSpawnArgs(path.join(fdFx, file), ['a'])
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(err instanceof Error, true, 'buildSpawnArgs須拋出Error') //規則6a: 入口位於cmd-shim之執行行(行首或&之後, 可前置"%_prog%", 之後只接%*)者拋出
            assert.strict.deepStrictEqual([err.code, err.message, err.path], ['ENOENT', `spawn ${entry} ENOENT`, entry]) //規則6a: 訊息指入口路徑, errno/syscall/path同node之形
        })
    }

    it(`自訂批次檔於判斷句內引用"%dp0%\\node_modules\\…"(非cmd-shim之執行行)而該檔不存在時不拋錯, 仍經cmd.exe退路 [R-EXEC-FAIL-01之6a, 對照]`, function() {
        if (!isWin) {
            this.skip()
        }
        let fp = path.join(fdFx, 'userpat.cmd')
        fs.writeFileSync(fp, ['@echo off', 'SET dp0=%~dp0', 'IF EXIST "%dp0%\\node_modules\\optional\\cli.js" (', '  node "%dp0%\\node_modules\\optional\\cli.js" %*', ') ELSE (', '  echo fallback-ok', ')', ''].join('\r\n'))
        let r = buildSpawnArgs(fp, [])
        assert.strict.deepStrictEqual([/(^|[\\/])cmd\.exe$/i.test(r.file), r.opt], [true, { windowsVerbatimArguments: true }], `file=${r.file}`) //規則6a: 入口樣式位於判斷句(如IF EXIST)等非執行行者仍交cmd.exe
    })

    it(`Windows之App Execution Alias(WindowsApps內之reparse point, 如winget)解析為該別名之路徑(不因fsIsFile以lstat判定連結為假而漏掉) (守門) [R-EXEC-FAIL-01之6]`, function() {
        if (!isWin) {
            this.skip()
        }

        //前提: %LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe存在(lstat, 別名之stat可能失敗)且該目錄在PATH內, 否則無從驗證而跳過
        let dirApps = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WindowsApps')
        let fpAlias = path.join(dirApps, 'winget.exe')
        let bExist = true
        try {
            fs.lstatSync(fpAlias)
        }
        catch (e) {
            bExist = false
        }
        let bInPath = (process.env.PATH || '').split(';').some((d) => d.replace(/"/g, '').trim().replace(/[\\/]+$/, '').toLowerCase() === dirApps.toLowerCase())
        if (!bExist || !bInPath) {
            this.skip()
        }

        let r = buildSpawnArgs('winget', [])
        assert.strict.deepStrictEqual(r.file.toLowerCase(), fpAlias.toLowerCase())
    })

})
