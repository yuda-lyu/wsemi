import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'


//limit0、prep0, 載入本檔當下之Error.stackTraceLimit與Error.prepareStackTrace:
//  w-package-tools之rollupFile於打包執行期間會把Error.prepareStackTrace換成其相依之stackTraceRewriter且不還原(實測: 打包前為Node內建, 打包後為stackTraceRewriter;
//  於獨立node行程內import rollupFile另會把stackTraceLimit由10改為16, mocha內已為Infinity而無變),
//  留在行程內會使mocha --parallel同一worker其後之測試(如maskDiagErr之capi #14)失敗(2026-11-02全套連跑3次中2次), 故於打包後還原(同時還原stackTraceLimit以防環境不同)
let limit0 = Error.stackTraceLimit
let prep0 = Error.prepareStackTrace


//R-UMD-EXTERNAL-01: UMD版對external之引用(ua-parser-js)於wsemi載入當下即取值, 若ua-parser-js於wsemi之後才載入, 取值為undefined
//  getUserAgent須於呼叫時再找全域UAParser, 使script載入順序(先wsemi後ua-parser-js、先ua-parser-js後wsemi)皆可用
//  以w-package-tools之rollupFile(回傳程式碼模式, 設定同toolg/gDistRollup.mjs對ua-parser-js者)把getUserAgent打包成UMD, 再於vm之新環境依各載入順序執行
describe(`getUserAgent in UMD build`, function() {

    let fdTmp = path.resolve('./test/_tmp/getUserAgentUmd')
    let fdSrc = path.join(fdTmp, 'src')
    let fpUa = path.resolve('./node_modules/ua-parser-js/dist/ua-parser.min.js')
    let ua = 'Mozilla/5.0 (compatible; Konqueror/4.1; OpenBSD) KHTML/4.1.4 (like Gecko)'
    let rr = {
        browsername: 'Konqueror',
        browserversion: '4.1',
        cpuarchitecture: '',
        devicetype: '',
        engineinfor: 'KHTML4.1.4',
        platform: 'OpenBSDundefined'
    }
    let umd = ''
    let uaCode = ''

    //newEnv, 建立瀏覽器樣貌之新環境: self與window皆指向頂層物件(UMD之getGlobal取self), 不含require與module故ua-parser-js之UMD走掛window.UAParser之分支
    let newEnv = (bSelf = true) => {
        let env = vm.createContext({ __ua: ua })
        if (bSelf) {
            vm.runInContext('var self = globalThis; var window = globalThis', env)
        }
        return env
    }

    //getUa, 於環境內呼叫wsemi.getUserAgent(__ua)並回傳其結果(經JSON轉回本領域物件, 不比對鍵順序)
    let getUa = (env) => JSON.parse(run(env, 'JSON.stringify(wsemi.getUserAgent(__ua))'))

    //run, 於環境內依序執行各段程式碼
    let run = (env, ...codes) => {
        let r
        for (let c of codes) {
            r = vm.runInContext(c, env, { timeout: 20000 })
        }
        return r
    }

    before(async function() {
        this.timeout(180000)
        fs.rmSync(fdTmp, { recursive: true, force: true })
        fs.mkdirSync(fdSrc, { recursive: true })
        let rel = path.relative(fdSrc, path.resolve('./src/getUserAgent.mjs')).split(path.sep).join('/')
        fs.writeFileSync(path.join(fdSrc, 'index.mjs'), `export { default as getUserAgent } from '${rel}'\n`, 'utf8')
        try {
            let { default: rollupFile } = await import('w-package-tools/src/rollupFile.mjs')
            umd = await rollupFile({
                fn: 'index.mjs',
                fdSrc,
                hookNameDist: () => 'wsemi',
                format: 'umd',
                targets: 'new',
                bMinify: false,
                bBanner: false,
                bLog: false,
                globals: { 'ua-parser-js': 'UAParser' },
                external: ['ua-parser-js'],
            })
        }
        finally {
            //還原相依載入時改動之全域(見limit0)
            Error.stackTraceLimit = limit0
            Error.prepareStackTrace = prep0
        }
        uaCode = fs.readFileSync(fpUa, 'utf8')
    })

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true })
    })

    it(`should not leave Error.prepareStackTrace or Error.stackTraceLimit changed by the in-memory bundling`, function() {
        //防止污染同一worker其後之測試(maskDiagErr之capi #14於Error.prepareStackTrace被換成stackTraceRewriter時失敗)
        assert.strict.deepStrictEqual([Error.stackTraceLimit, Error.prepareStackTrace === prep0], [limit0, true])
    })

    it(`should map ua-parser-js to the global UAParser as toolg/gDistRollup.mjs does`, function() {
        //此測試之打包設定須與實際打包設定一致, 否則下列順序案不代表dist之行為
        let src = fs.readFileSync(path.resolve('./toolg/gDistRollup.mjs'), 'utf8')
        assert.strict.deepStrictEqual(/globals:[\s\S]*?'ua-parser-js':\s*'UAParser'/.test(src), true)
        assert.strict.deepStrictEqual(/external:\s*\[[\s\S]*?'ua-parser-js',/.test(src), true)
        //打包產物以external之全域UAParser作為factory參數(wsemi載入當下取值)
        assert.strict.deepStrictEqual(/global\.UAParser/.test(umd), true)
    })

    it(`should work when ua-parser-js is loaded before wsemi`, function() {
        let env = newEnv()
        run(env, uaCode, umd)
        assert.strict.deepStrictEqual(getUa(env), rr)
    })

    it(`should work when ua-parser-js is loaded after wsemi`, function() {
        //先wsemi後ua-parser-js: factory取得之external為undefined, 屬性存取會拋'Cannot read properties of undefined (reading 'UAParser')'
        let env = newEnv()
        run(env, umd, uaCode)
        assert.strict.deepStrictEqual(getUa(env), rr)
    })

    it(`should work when ua-parser-js is loaded after wsemi and getUserAgent was already called once without it`, function() {
        //呼叫當下才找全域, 不得因先前失敗而快取結果
        let env = newEnv()
        run(env, umd)
        let msg = run(env, `(() => { try { wsemi.getUserAgent(__ua); return 'no error' } catch (err) { return err.message } })()`)
        assert.strict.deepStrictEqual(typeof msg, 'string')
        assert.strict.deepStrictEqual(msg !== 'no error', true)
        run(env, uaCode)
        assert.strict.deepStrictEqual(getUa(env), rr)
    })

    it(`should work for the no-argument call with navigator in both orders`, function() {
        for (let order of ['before', 'after']) {
            let env = newEnv()
            run(env, `var navigator = { userAgent: __ua }`)
            if (order === 'before') {
                run(env, uaCode, umd)
            }
            else {
                run(env, umd, uaCode)
            }
            assert.strict.deepStrictEqual(run(env, 'wsemi.getUserAgent().browsername'), 'Konqueror', order)
        }
    })

    it(`should throw an Error naming UAParser when ua-parser-js is never loaded`, function() {
        //缺少相依時須為可辨識之錯誤(同_filterXSS), 不是'Cannot read properties of undefined'或'is not a constructor'
        let env = newEnv()
        run(env, umd)
        let msg = run(env, `(() => { try { wsemi.getUserAgent(__ua); return 'no error' } catch (err) { return err instanceof Error ? err.message : 'not Error' } })()`)
        assert.strict.deepStrictEqual(/invalid UAParser/.test(msg), true, msg)
    })

    it(`should throw an Error naming UAParser when ua-parser-js is never loaded and the environment has no global object`, function() {
        //getGlobal於無self、window、global之環境回傳null, 不得因讀null之屬性而拋TypeError
        let env = newEnv(false)
        run(env, umd)
        let msg = run(env, `(() => { try { wsemi.getUserAgent(__ua); return 'no error' } catch (err) { return err instanceof Error ? err.message : 'not Error' } })()`)
        assert.strict.deepStrictEqual(/invalid UAParser/.test(msg), true, msg)
    })

    it(`should ignore a non-function global UAParser`, function() {
        let env = newEnv()
        run(env, umd, `globalThis.UAParser = {}`)
        let msg = run(env, `(() => { try { wsemi.getUserAgent(__ua); return 'no error' } catch (err) { return err instanceof Error ? err.message : 'not Error' } })()`)
        assert.strict.deepStrictEqual(/invalid UAParser/.test(msg), true, msg)
    })

})
