import assert from 'assert'
import { spawnSync } from 'child_process'
import { pathToFileURL } from 'url'
import path from 'path'
import isProxy from '../src/isProxy.mjs'


//isProxy之規格(JSDoc isProxy、R-DIAG-01): util.types可用時判定可偵測之Proxy(含已撤銷者、以函數為目標者), 不觸發陷阱、不拋錯; 取不到util.types之環境恆為false; 非物件與非函數一律false


describe(`isProxy`, function() {

    //h, 各陷阱皆計數之處理器(判定不得觸發任何陷阱)
    let n = 0
    let h = {}
    for (let t of ['get', 'set', 'has', 'ownKeys', 'getOwnPropertyDescriptor', 'defineProperty', 'deleteProperty', 'getPrototypeOf', 'setPrototypeOf', 'isExtensible', 'preventExtensions', 'apply', 'construct']) {
        h[t] = (...args) => {
            n++
            return Reflect[t](...args)
        }
    }

    it(`should detect Proxy objects (including revoked and function-target) without running traps`, function() {
        n = 0
        let { proxy: rv, revoke } = Proxy.revocable({}, h)
        revoke()
        let rs = [new Proxy({}, h), new Proxy([], h), new Proxy(() => {}, h), rv].map(isProxy)
        assert.strict.deepStrictEqual({ rs, n }, { rs: [true, true, true, true], n: 0 })
    })

    it(`should return false for non-Proxy values`, function() {
        let rs = [{}, [], () => {}, new Error('x'), Promise.resolve(1), null, undefined, 0, '', 's', true, Symbol('s'), BigInt(1), Object.create(new Proxy({}, h))].map(isProxy)
        //Object.create(Proxy)之結果本身非Proxy(只有其原型為Proxy)
        assert.strict.deepStrictEqual(rs, Array(14).fill(false))
    })

    it(`should return false without throwing where util.types is unavailable (browser / Node<20.16 fallback)`, function() {
        //子行程於載入受測模組前刪除process.getBuiltinModule, 模擬取不到util.types之環境
        let url = pathToFileURL(path.resolve('./src/isProxy.mjs')).href
        let code = `process.getBuiltinModule = undefined; const { default: isProxy } = await import(${JSON.stringify(url)}); let { proxy, revoke } = Proxy.revocable({}, {}); revoke(); process.stdout.write(JSON.stringify([isProxy(new Proxy({}, {})), isProxy(proxy), isProxy({}), isProxy(null)]))`
        let r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        assert.strict.deepStrictEqual([r.status, r.stdout], [0, '[false,false,false,false]'], r.stderr)
    })

})
