import { spawnSync } from 'child_process'
import path from 'path'
import vm from 'vm'
import util from 'util'
import { fileURLToPath, pathToFileURL } from 'url'


//_diagCases語料之執行器(getDiag系列測試共用)
//
//runCases({ dirSrc, util, ids }): 於本行程載入dirSrc內之8個函數與語料, 逐案執行, 回傳{ id: null(通過)|'失敗原因' }
//runNoUtil({ dirSrc, ids }): 以子行程(載入前刪除process.getBuiltinModule, 模擬瀏覽器與Node<20.16)執行, 回傳同上
//直接執行本檔(子行程模式): node diagCaseRunner.mjs --noutil --src <dir>, 結果以一行JSON寫至stdout(前綴__DIAG__)


let dirThis = path.dirname(fileURLToPath(import.meta.url))
let dirSrcDef = path.join(dirThis, '..', '..', 'src')
let names = ['getDiag', 'getDiagSecrets', 'maskDiagText', 'maskDiagCopy', 'maskDiagErr', 'maskDiagUrl', 'getDiagBriefErr', 'genDiagFunLog']


//loadApi, 載入dirSrc內之函數與語料與_diagKit
let loadApi = async (dirSrc) => {
    let api = {}
    for (let n of names) {
        api[n] = (await import(pathToFileURL(path.join(dirSrc, `${n}.mjs`)).href)).default
    }
    let corpus = (await import(pathToFileURL(path.join(dirSrc, '_diagCases.mjs')).href)).default
    let kit = await import(pathToFileURL(path.join(dirSrc, '_diagKit.mjs')).href)
    return { api, corpus, kit }
}


//runCases, 逐案執行
let runCases = async ({ dirSrc = dirSrcDef, ids = null, useUtil = true } = {}) => {
    let { api, corpus, kit } = await loadApi(dirSrc)
    let nUnhandled = 0
    let onUnhandled = () => {
        nUnhandled++
    }
    process.on('unhandledRejection', onUnhandled)
    let env = {
        util: kit.hasUtil(),
        realm: (code) => vm.runInNewContext(code),
        isNativeError: (v) => util.types.isNativeError(v), //測試工具自身可用util(受測模組於無util環境仍走退路)
        unhandled: () => nUnhandled,
        tick: () => new Promise((resolve) => setImmediate(() => setImmediate(resolve))),
    }
    let rs = {}
    try {
        for (let c of corpus.cases) {
            if (ids !== null && !ids.includes(c.id)) {
                continue
            }
            if (c.need === 'child') {
                rs[c.id] = 'child'
                continue
            }
            let ctx = corpus.mkCtx(env)
            let out
            try {
                out = await c.call(api, ctx)
            }
            catch (err) {
                rs[c.id] = `threw: ${err && err.message}`
                continue
            }
            rs[c.id] = corpus.verify(c, out, ctx)
        }
    }
    finally {
        process.off('unhandledRejection', onUnhandled)
    }
    return { rs, util: env.util, n: corpus.cases.length }
}


//runNoUtil, 子行程(無process.getBuiltinModule)執行
let runNoUtil = ({ dirSrc = dirSrcDef, ids = null } = {}) => {
    let args = [path.join(dirThis, 'diagCaseRunner.mjs'), '--noutil', '--src', dirSrc]
    if (ids !== null) {
        args.push('--ids', ids.join(','))
    }
    let r = spawnSync(process.execPath, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: 170000 })
    let line = String(r.stdout || '').split('\n').find((s) => s.startsWith('__DIAG__'))
    if (!line) {
        throw new Error(`child failed: status=${r.status} ${String(r.stderr || '').slice(0, 2000)}`)
    }
    return JSON.parse(line.slice('__DIAG__'.length))
}


//子行程模式
let isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain && process.argv.includes('--noutil')) {
    let i = process.argv.indexOf('--src')
    let dirSrc = i >= 0 ? process.argv[i + 1] : dirSrcDef
    let j = process.argv.indexOf('--ids')
    let ids = j >= 0 ? process.argv[j + 1].split(',') : null
    process.getBuiltinModule = undefined //模擬無getBuiltinModule之環境(瀏覽器、Node<20.16): 須於載入受測模組前
    let r = await runCases({ dirSrc, ids, useUtil: false })
    process.stdout.write(`__DIAG__${JSON.stringify(r)}\n`)
}


export { runCases, runNoUtil, names }
