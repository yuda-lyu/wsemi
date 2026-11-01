import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fsWriteTextAtomic from '../src/fsWriteTextAtomic.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))
let fdFix = join(__dirname, '_tmp', 'fsWriteTextAtomic') //測試夾具, after刪除
let runner = join(__dirname, 'tools', 'fsWriteTextAtomicRunner.mjs')

let nCase = 0
let newDir = () => {
    nCase++
    let d = join(fdFix, `c${nCase}`)
    fs.mkdirSync(d, { recursive: true })
    return d
}
let tmps = (d) => fs.readdirSync(d).filter((v) => v.endsWith('.tmp'))
let rd = (fp) => fs.readFileSync(fp, 'utf8')


describe(`fsWriteTextAtomic`, function() {

    this.timeout(120000)

    before(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
        fs.mkdirSync(fdFix, { recursive: true })
    })

    after(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
    })

    it(`should be exported by index from its own module (with its Core)`, function() {
        //R-SCOPE-01: 對外匯出, 與其他fs函數同為Fn加Core成對; index於Node內無法整份載入(viewerjs之css), 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as fsWriteTextAtomic } from './fsWriteTextAtomic.mjs'`), true)
        assert.strict.deepStrictEqual(c.includes(`export { default as fsWriteTextAtomicCore } from './fsWriteTextAtomicCore.mjs'`), true)
    })

    //規格(建議檔§3): 自動建父目錄、原子寫入不留暫存檔、回傳檔名(信封式 { success })、覆寫既有檔
    describe(`寫入`, function() {

        it(`should create parent folders, write the utf-8 text, return { success: fp } and leave no temp file`, function() {
            let d = newDir()
            let fp = join(d, 'a', 'b', 'c.txt')
            let r = fsWriteTextAtomic(fp, '中文abc😀\n第二行')
            assert.strict.deepStrictEqual(r, { success: fp })
            assert.strict.deepStrictEqual(rd(fp), '中文abc😀\n第二行')
            assert.strict.deepStrictEqual(tmps(dirname(fp)), [])
            assert.strict.deepStrictEqual(fs.readdirSync(dirname(fp)), ['c.txt'])
        })

        it(`should overwrite an existing file with the new complete content`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old-old-old-old-old')
            assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, 'new'), { success: fp })
            assert.strict.deepStrictEqual(rd(fp), 'new')
            assert.strict.deepStrictEqual(fs.readdirSync(d), ['a.txt'])
        })

        it(`should write the empty string as a zero-length file (replacing a non-empty one)`, function() {
            let d = newDir()
            let fp = join(d, 'e.txt')
            fs.writeFileSync(fp, 'something')
            assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, ''), { success: fp })
            assert.strict.deepStrictEqual(fs.statSync(fp).size, 0)
        })

        it(`should write a large text (3 MB) completely`, function() {
            let d = newDir()
            let fp = join(d, 'big.txt')
            let c = 'x'.repeat(1024 * 1024) + '中'.repeat(1024 * 1024) + 'end'
            assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, c), { success: fp })
            assert.strict.deepStrictEqual(rd(fp) === c, true)
        })

        it(`should work with a relative path and with spaces and Chinese characters in the path`, function() {
            let d = newDir()
            let fp = join(d, '空 格 資料夾', '檔 案.json')
            assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, '{"a":1}'), { success: fp })
            assert.strict.deepStrictEqual(rd(fp), '{"a":1}')
            let rel = join('test', '_tmp', 'fsWriteTextAtomic', `c${nCase}`, 'rel.txt') //相對於本進程工作目錄(專案根)
            let r = fsWriteTextAtomic(rel, 'rel')
            assert.strict.deepStrictEqual(r, { success: rel })
            assert.strict.deepStrictEqual(rd(join(d, 'rel.txt')), 'rel')
        })

        //審查發現: 純檔名(無資料夾部分)原一律失敗(mkdir('')); 以子行程之工作目錄=夾具資料夾驗證(不在mocha行程內chdir)
        it(`should write a bare file name (no folder part) into the current folder, like fsWriteText`, function() {
            let d = newDir()
            let { r } = runChildCase(runner, 'bareName', { cwd: d })
            assert.strict.deepStrictEqual(r.r, { success: 'bare.txt' })
            assert.strict.deepStrictEqual(rd(join(d, 'bare.txt')), 'bare-content')
            assert.strict.deepStrictEqual(fs.readdirSync(d), ['bare.txt'])
        })

        //審查發現: 直接上層為連結(junction/符號連結)時原誤判為「已存在」而失敗; 與fsWriteText一致應寫進連結所指之資料夾
        it(`should write through a parent folder that is a link (junction/symlink) to a real folder`, function() {
            let d = newDir()
            let real = join(d, 'real')
            let link = join(d, 'link')
            fs.mkdirSync(real)
            fs.symlinkSync(real, link, 'junction')
            try {
                let fp = join(link, 'a.txt')
                assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, 'via-link'), { success: fp })
                assert.strict.deepStrictEqual(rd(join(real, 'a.txt')), 'via-link')
                assert.strict.deepStrictEqual(tmps(real), [])
                let fp2 = join(link, 'new', 'b.txt') //連結下再建新資料夾
                assert.strict.deepStrictEqual(fsWriteTextAtomic(fp2, 'deeper'), { success: fp2 })
                assert.strict.deepStrictEqual(rd(join(real, 'new', 'b.txt')), 'deeper')
            }
            finally {
                try {
                    fs.rmdirSync(link) //只移除連結本身(不跟隨),再由after刪除夾具
                }
                catch (e) {
                    fs.unlinkSync(link)
                }
            }
            assert.strict.deepStrictEqual(fs.existsSync(join(real, 'a.txt')), true) //連結目標完好
        })

        it(`should leave every file complete after many sequential writes (each write replaces the whole content)`, function() {
            let d = newDir()
            let fp = join(d, 'seq.txt')
            let cs = ['A'.repeat(10000), 'B'.repeat(5), 'C'.repeat(200000), '', 'D']
            for (let i = 0; i < 30; i++) {
                let c = cs[i % cs.length]
                assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, c), { success: fp })
                assert.strict.deepStrictEqual(rd(fp) === c, true, `round ${i}`)
            }
            assert.strict.deepStrictEqual(fs.readdirSync(d), ['seq.txt'])
        })

        it(`should keep several files of one folder independent (no cross-over between targets)`, function() {
            let d = newDir()
            for (let i = 0; i < 10; i++) {
                assert.ok(fsWriteTextAtomic(join(d, `f${i}.txt`), `content-${i}`).success)
            }
            for (let i = 0; i < 10; i++) {
                assert.strict.deepStrictEqual(rd(join(d, `f${i}.txt`)), `content-${i}`)
            }
            assert.strict.deepStrictEqual(tmps(d), [])
        })

    })

    //規格(建議檔§3/§6.4): 目標路徑為既存目錄時不留暫存檔且不退回覆寫(信封式回error); 真理檔不退回覆寫
    describe(`失敗(目標路徑為既存資料夾)`, function() {

        it(`should return { error }, keep the folder as it is and leave no temp file when the target path is an existing folder`, function() {
            let d = newDir()
            let target = join(d, 'adir')
            fs.mkdirSync(target)
            fs.writeFileSync(join(target, 'inner.txt'), 'inner')
            let r = fsWriteTextAtomic(target, 'x')
            assert.strict.deepStrictEqual(Object.keys(r), ['error'])
            assert.ok(r.error instanceof Error)
            assert.ok(fs.statSync(target).isDirectory())
            assert.strict.deepStrictEqual(rd(join(target, 'inner.txt')), 'inner')
            assert.strict.deepStrictEqual(tmps(d), [])
            assert.strict.deepStrictEqual(fs.readdirSync(d), ['adir'])
        })

        it(`should also return { error } (no overwritten) with fallbackOverwrite: true when even the direct overwrite is impossible (target is a folder)`, function() {
            let d = newDir()
            let target = join(d, 'adir')
            fs.mkdirSync(target)
            let r = fsWriteTextAtomic(target, 'x', { fallbackOverwrite: true })
            assert.strict.deepStrictEqual(Object.keys(r), ['error'])
            assert.ok(fs.statSync(target).isDirectory())
            assert.strict.deepStrictEqual(tmps(d), [])
        })

        it(`should return { error } when a parent path is an existing file`, function() {
            let d = newDir()
            fs.writeFileSync(join(d, 'afile'), 'x')
            let r = fsWriteTextAtomic(join(d, 'afile', 'a.txt'), 'x')
            assert.ok(r.error)
            assert.strict.deepStrictEqual(rd(join(d, 'afile')), 'x')
            assert.strict.deepStrictEqual(tmps(d), [])
        })

    })

    //規格: 輸入參數之檢測機制 K2(必須參數不合即回報,fs系家族以結果物件error回報、不拋)/K3(opt非預期改用預設)
    describe(`輸入檢測(K2/K3)`, function() {

        it(`should return { error } with an explanatory string and create nothing when fp or c is invalid`, function() {
            let d = newDir()
            for (let fp of [undefined, null, '', 5, true, {}, [], ['a.txt']]) {
                assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, 'x'), { error: 'invalid fp: must be a non-empty string' }, String(typeof fp))
            }
            for (let c of [undefined, null, 5, true, {}, [], Buffer.from('x')]) {
                assert.strict.deepStrictEqual(fsWriteTextAtomic(join(d, 'never', 'a.txt'), c), { error: 'invalid c: must be a string' }, String(typeof c))
            }
            assert.strict.deepStrictEqual(fs.readdirSync(d), []) //連父資料夾都不建
            assert.strict.deepStrictEqual(fsWriteTextAtomic(), { error: 'invalid fp: must be a non-empty string' })
        })

        it(`should use defaults when opt is null, a primitive or an array (K3), and write normally`, function() {
            let d = newDir()
            let n = 0
            for (let o of [undefined, null, 5, 'x', true, [], () => 1, { retries: 'x', fallbackOverwrite: 'y', onTrace: 5 }]) {
                n++
                let fp = join(d, `a${n}.txt`)
                assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, 'v', o), { success: fp })
            }
        })

        it(`should return { error } instead of throwing when opt is unreadable (getter throws, revoked Proxy)`, function() {
            let d = newDir()
            let p = Proxy.revocable({}, {})
            p.revoke()
            let o1 = {
                get retries() {
                    throw new Error('getter')
                }
            }
            let o2 = {
                get fallbackOverwrite() {
                    throw new Error('getter')
                }
            }
            let o3 = {
                get onTrace() {
                    throw new Error('getter')
                }
            }
            for (let o of [p.proxy, o1, o2, o3]) {
                let r
                assert.doesNotThrow(() => {
                    r = fsWriteTextAtomic(join(d, 'u.txt'), 'x', o)
                })
                assert.ok(r.error)
            }
            assert.strict.deepStrictEqual(fs.readdirSync(d), [])
        })

        it(`should always use the built-in fs (opt.fs given by the caller is ignored)`, function() {
            let d = newDir()
            let called = 0
            let fake = {
                lstatSync: () => {
                    called++
                    throw new Error('fake')
                }
            }
            let fp = join(d, 'a.txt')
            assert.strict.deepStrictEqual(fsWriteTextAtomic(fp, 'real', { fs: fake }), { success: fp })
            assert.strict.deepStrictEqual([called, rd(fp)], [0, 'real'])
        })

        it(`should accept onTrace through the public function (events: attempt, done)`, function() {
            let d = newDir()
            let evs = []
            fsWriteTextAtomic(join(d, 'a.txt'), 'x', { onTrace: (e) => evs.push(e.type) })
            assert.strict.deepStrictEqual(evs, ['attempt', 'done'])
        })

    })

    //與fsWriteText之關係: 同為信封式, 成功時回傳形狀相同
    describe(`與fsWriteText之結果形狀一致`, function() {

        it(`should return the same envelope shape as fsWriteText on success ({ success: fp }) and a truthy error on failure`, async function() {
            let { default: fsWriteText } = await import('../src/fsWriteText.mjs')
            let d = newDir()
            let a = fsWriteText(join(d, 'p.txt'), 'x')
            let b = fsWriteTextAtomic(join(d, 'q.txt'), 'x')
            assert.strict.deepStrictEqual([Object.keys(a), Object.keys(b)], [['success'], ['success']])
            fs.mkdirSync(join(d, 'dd'))
            let a2 = fsWriteText(join(d, 'dd'), 'x')
            let b2 = fsWriteTextAtomic(join(d, 'dd'), 'x')
            assert.ok(a2.error && b2.error)
        })

    })

})
