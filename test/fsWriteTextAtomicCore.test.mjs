import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join, basename, resolve } from 'path'
import fsWriteTextAtomicCore from '../src/fsWriteTextAtomicCore.mjs'
import fsWriteTextCore from '../src/fsWriteTextCore.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))
let fdFix = join(__dirname, '_tmp', 'fsWriteTextAtomicCore') //測試夾具, after刪除
let runner = join(__dirname, 'tools', 'fsWriteTextAtomicRunner.mjs')

let nCase = 0
let newDir = () => {
    nCase++
    let d = join(fdFix, `c${nCase}`)
    fs.mkdirSync(d, { recursive: true })
    return d
}

let err = (code, msg = 'x') => {
    return Object.assign(new Error(`${code}: ${msg}`), { code })
}

//可控之fs替身: 取自真實fs, writeFileSync/renameSync/unlinkSync逐次記錄呼叫, hooks[名稱](orig, args, n)可改寫第n次(由1起算)呼叫之行為
let mkFs = (hooks = {}) => {
    let calls = []
    let counts = {}
    let f = { ...fs }
    for (let k of ['mkdirSync', 'writeFileSync', 'renameSync', 'unlinkSync']) {
        let orig = fs[k]
        f[k] = (...a) => {
            counts[k] = (counts[k] || 0) + 1
            calls.push([k, ...a])
            if (hooks[k]) {
                return hooks[k](orig, a, counts[k])
            }
            return orig(...a)
        }
    }
    return { fs: f, calls, count: (k) => counts[k] || 0 }
}

let tmps = (d) => fs.readdirSync(d).filter((v) => v.endsWith('.tmp'))
let rd = (fp) => fs.readFileSync(fp, 'utf8')

//事件收集(含凍結檢查)
let mkTrace = () => {
    let evs = []
    return {
        evs,
        onTrace: (e) => {
            assert.ok(Object.isFrozen(e), 'trace event must be frozen')
            evs.push(e)
        },
    }
}
let types = (evs) => evs.map((e) => e.type)
let done = (evs) => evs.filter((e) => e.type === 'done')


describe(`fsWriteTextAtomicCore`, function() {

    this.timeout(120000)

    before(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
        fs.mkdirSync(fdFix, { recursive: true })
    })

    after(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
    })

    //規格(建議檔§3): 暫存檔為同目錄 ${file}.${pid}-${base36時間}-${隨機4碼}.tmp; writeFileSync(tmp,text,'utf8'); renameSync(tmp,file)成功回file; 信封式
    describe(`成功路徑`, function() {

        it(`should write to a same-folder temp file named <fp>.<pid>-<time36>-<rand4>.tmp with utf8, then rename it onto fp, and return { success: fp }`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            let { fs: f, calls } = mkFs()
            let r = fsWriteTextAtomicCore(fp, '中文abc😀', { fs: f })
            assert.strict.deepStrictEqual(r, { success: fp })
            assert.strict.deepStrictEqual(rd(fp), '中文abc😀')
            let w = calls.filter((c) => c[0] === 'writeFileSync')
            let rn = calls.filter((c) => c[0] === 'renameSync')
            assert.strict.deepStrictEqual([w.length, rn.length], [1, 1])
            assert.strict.deepStrictEqual([w[0][2], w[0][3]], ['中文abc😀', 'utf8'])
            let tmp = w[0][1]
            assert.ok(tmp.startsWith(`${fp}.${process.pid}-`) && tmp.endsWith('.tmp'), tmp)
            assert.ok(/\.\d+-[0-9a-z]+-[0-9a-z]{1,4}\.tmp$/.test(tmp), tmp)
            assert.strict.deepStrictEqual(dirname(tmp), dirname(fp)) //同資料夾
            assert.strict.deepStrictEqual(rn[0].slice(1), [tmp, fp])
            assert.strict.deepStrictEqual(tmps(d), [])
        })

        it(`should use a different temp name on every call (no collision between calls)`, function() {
            let d = newDir()
            let names = new Set()
            for (let i = 0; i < 20; i++) {
                let { fs: f, calls } = mkFs()
                fsWriteTextAtomicCore(join(d, 'a.txt'), String(i), { fs: f })
                names.add(calls.find((c) => c[0] === 'writeFileSync')[1])
            }
            assert.ok(names.size >= 19, `distinct temp names: ${names.size}`) //時間戳加4碼隨機, 極小機率碰撞
        })

        it(`should overwrite an existing file and create missing parent folders`, function() {
            let d = newDir()
            let fp = join(d, 'x', 'y', 'z.txt')
            assert.strict.deepStrictEqual(fsWriteTextAtomicCore(fp, 'v1', { fs }), { success: fp })
            assert.strict.deepStrictEqual(fsWriteTextAtomicCore(fp, 'v2', { fs }), { success: fp })
            assert.strict.deepStrictEqual(rd(fp), 'v2')
            assert.strict.deepStrictEqual(tmps(dirname(fp)), [])
        })

        it(`should accept the empty string as content (a zero-length file)`, function() {
            let d = newDir()
            let fp = join(d, 'e.txt')
            fs.writeFileSync(fp, 'old')
            assert.strict.deepStrictEqual(fsWriteTextAtomicCore(fp, '', { fs }), { success: fp })
            assert.strict.deepStrictEqual(rd(fp), '')
        })

        it(`should not carry the overwritten key on the normal success path`, function() {
            let d = newDir()
            let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs, fallbackOverwrite: true })
            assert.strict.deepStrictEqual(Object.keys(r), ['success'])
        })

    })

    //規格(建議檔§3): rename失敗且錯誤碼在EPERM/EBUSY/EACCES時重試(間隔50、100、150…ms,至多retries次); 非占用類錯誤立即停止
    describe(`占用類錯誤重試`, function() {

        for (let code of ['EPERM', 'EBUSY', 'EACCES']) {
            it(`should retry rename on ${code} with intervals 50, 100, 150 ms and succeed on the 4th attempt (retries=3 by default)`, function() {
                let d = newDir()
                let fp = join(d, 'a.txt')
                fs.writeFileSync(fp, 'old')
                let { fs: f, count } = mkFs({
                    renameSync: (orig, a, n) => {
                        if (n <= 3) {
                            throw err(code)
                        }
                        return orig(...a)
                    },
                })
                let { evs, onTrace } = mkTrace()
                let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, onTrace })
                assert.strict.deepStrictEqual(r, { success: fp })
                assert.strict.deepStrictEqual(rd(fp), 'new')
                assert.strict.deepStrictEqual(count('renameSync'), 4)
                assert.strict.deepStrictEqual(evs, [
                    { type: 'attempt', n: 1 },
                    { type: 'retry', n: 2, ms: 50, code },
                    { type: 'attempt', n: 2 },
                    { type: 'retry', n: 3, ms: 100, code },
                    { type: 'attempt', n: 3 },
                    { type: 'retry', n: 4, ms: 150, code },
                    { type: 'attempt', n: 4 },
                    { type: 'done', ok: true, reason: 'renamed' },
                ])
                assert.strict.deepStrictEqual(tmps(d), [])
            })
        }

        it(`should really wait between retries (lower bound only: at least the sum of the intervals 50 + 100 ms; load can only lengthen it)`, function() {
            let d = newDir()
            let { fs: f } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                }
            })
            let t0 = process.hrtime.bigint()
            let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, retries: 2 })
            let ms = Number(process.hrtime.bigint() - t0) / 1e6
            assert.ok(r.error)
            assert.ok(ms >= 145, `elapsed ${ms} ms`) //下界(留5 ms給計時粒度)
        })

        it(`should succeed on the 2nd attempt after a single busy failure (one retry event)`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            let { fs: f } = mkFs({
                renameSync: (orig, a, n) => {
                    if (n === 1) {
                        throw err('EBUSY')
                    }
                    return orig(...a)
                }
            })
            let { evs, onTrace } = mkTrace()
            assert.strict.deepStrictEqual(fsWriteTextAtomicCore(fp, 'new', { fs: f, onTrace }), { success: fp })
            assert.strict.deepStrictEqual(types(evs), ['attempt', 'retry', 'attempt', 'done'])
            assert.strict.deepStrictEqual(evs[1], { type: 'retry', n: 2, ms: 50, code: 'EBUSY' })
        })

        it(`should give up after retries are exhausted: return { error } with the LAST rename error, keep the old content, remove the temp file`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old')
            let k = 0
            let { fs: f, count } = mkFs({
                renameSync: () => {
                    k++
                    throw err('EBUSY', `n${k}`)
                }
            })
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, onTrace })
            assert.strict.deepStrictEqual(Object.keys(r), ['error'])
            assert.strict.deepStrictEqual(r.error.code, 'EBUSY')
            assert.strict.deepStrictEqual(r.error.message, 'EBUSY: n4') //最後一次(第4次)之錯誤
            assert.strict.deepStrictEqual(count('renameSync'), 4)
            assert.strict.deepStrictEqual(rd(fp), 'old')
            assert.strict.deepStrictEqual(tmps(d), [])
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: false, reason: 'rename' }])
            assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'retry').map((e) => e.ms), [50, 100, 150])
        })

        it(`should honor opt.retries (0: no retry; 1: one retry of 50 ms; 5: five retries 50..250)`, function() {
            let attempts = {}
            for (let retries of [0, 1, 5]) {
                let d = newDir()
                let { fs: f, count } = mkFs({
                    renameSync: () => {
                        throw err('EPERM')
                    }
                })
                let { evs, onTrace } = mkTrace()
                let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, retries, onTrace })
                assert.ok(r.error)
                attempts[retries] = [count('renameSync'), evs.filter((e) => e.type === 'retry').map((e) => e.ms)]
                assert.strict.deepStrictEqual(tmps(d), [])
            }
            assert.strict.deepStrictEqual(attempts, { 0: [1, []], 1: [2, [50]], 5: [6, [50, 100, 150, 200, 250]] })
        })

        it(`should treat an unexpected retries (negative, non-integer, NaN, non-number) as not given and use 3`, function() {
            for (let retries of [-1, 1.5, NaN, Infinity, 'x', '', null, undefined, true, {}, [], 10n]) {
                let d = newDir()
                let { fs: f, count } = mkFs({
                    renameSync: () => {
                        throw err('EBUSY')
                    }
                })
                let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, retries })
                assert.ok(r.error)
                assert.strict.deepStrictEqual(count('renameSync'), 4, `retries=${String(retries)}`)
            }
        })

        it(`should accept a numeric-string retries and use the converted value (K4)`, function() {
            let d = newDir()
            let { fs: f, count } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                }
            })
            fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, retries: '1' })
            assert.strict.deepStrictEqual(count('renameSync'), 2)
        })

    })

    //規格(建議檔§3): 非占用類錯誤立即停止(不重試), 清暫存檔
    describe(`非占用類錯誤不重試`, function() {

        for (let code of ['ENOENT', 'EISDIR', 'EEXIST', 'ENOSPC', 'EINVAL', 'ENOTEMPTY', 'EXDEV', 'eperm', 'EBUSYX']) {
            it(`should stop immediately on ${code} without retry, clean the temp file and keep the old content`, function() {
                let d = newDir()
                let fp = join(d, 'a.txt')
                fs.writeFileSync(fp, 'old')
                let { fs: f, count } = mkFs({
                    renameSync: () => {
                        throw err(code)
                    }
                })
                let { evs, onTrace } = mkTrace()
                let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, retries: 5, onTrace })
                assert.strict.deepStrictEqual(r.error.code, code)
                assert.strict.deepStrictEqual(count('renameSync'), 1)
                assert.strict.deepStrictEqual(rd(fp), 'old')
                assert.strict.deepStrictEqual(tmps(d), [])
                assert.strict.deepStrictEqual(types(evs), ['attempt', 'done'])
                assert.strict.deepStrictEqual(done(evs)[0], { type: 'done', ok: false, reason: 'rename' })
            })
        }

        it(`should not retry when the error has no code, or the code is not a string, or reading code throws`, function() {
            let errs = [new Error('plain'), Object.assign(new Error('c'), { code: 5 }), Object.assign(new Error('c'), { code: null }), new Proxy(new Error('p'), {
                get() {
                    throw new Error('getter')
                }
            })]
            for (let e of errs) {
                let d = newDir()
                let { fs: f, count } = mkFs({
                    renameSync: () => {
                        throw e
                    }
                })
                let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f })
                assert.ok(r.error)
                assert.strict.deepStrictEqual(count('renameSync'), 1)
                assert.strict.deepStrictEqual(tmps(d), [])
            }
        })

        it(`should stop retrying as soon as a non-busy error follows busy ones (busy, busy, ENOENT)`, function() {
            let d = newDir()
            let { fs: f, count } = mkFs({
                renameSync: (orig, a, n) => {
                    throw n < 3 ? err('EBUSY') : err('ENOENT')
                }
            })
            let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f })
            assert.strict.deepStrictEqual(r.error.code, 'ENOENT')
            assert.strict.deepStrictEqual(count('renameSync'), 3)
        })

    })

    //規格(建議檔§3): 重試耗盡後, fallbackOverwrite===true且最後錯誤為占用類時退回直接覆寫; 否則回error(真理檔: 寧可本次不寫)
    describe(`fallbackOverwrite`, function() {

        it(`should keep the truth file untouched (no fallback) by default when retries are exhausted by a busy error`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old')
            let { fs: f, calls } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                }
            })
            let r = fsWriteTextAtomicCore(fp, 'new', { fs: f })
            assert.ok(r.error)
            assert.strict.deepStrictEqual(rd(fp), 'old')
            assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'writeFileSync').length, 1) //只寫過暫存檔, 未直接寫目標檔
            assert.strict.deepStrictEqual(tmps(d), [])
        })

        it(`should overwrite the target directly and return { success, overwritten: true } when fallbackOverwrite is true and retries are exhausted by a busy error`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old')
            let { fs: f, calls } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                }
            })
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, fallbackOverwrite: true, onTrace })
            assert.strict.deepStrictEqual(r, { success: fp, overwritten: true })
            assert.strict.deepStrictEqual(rd(fp), 'new')
            assert.strict.deepStrictEqual(tmps(d), [])
            let w = calls.filter((c) => c[0] === 'writeFileSync')
            assert.strict.deepStrictEqual(w.map((c) => c[1] === fp), [false, true]) //先暫存檔, 後直接寫目標
            assert.strict.deepStrictEqual(w[1].slice(2), ['new', 'utf8'])
            assert.strict.deepStrictEqual(types(evs).slice(-2), ['fallback', 'done'])
            assert.strict.deepStrictEqual(evs.find((e) => e.type === 'fallback'), { type: 'fallback', code: 'EBUSY' })
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: true, reason: 'overwritten' }])
        })

        it(`should fall back only after all retries are used (fallback comes after the last retry, not before)`, function() {
            let d = newDir()
            let { fs: f } = mkFs({
                renameSync: () => {
                    throw err('EPERM')
                }
            })
            let { evs, onTrace } = mkTrace()
            fsWriteTextAtomicCore(join(d, 'a.txt'), 'new', { fs: f, fallbackOverwrite: true, retries: 2, onTrace })
            assert.strict.deepStrictEqual(types(evs), ['attempt', 'retry', 'attempt', 'retry', 'attempt', 'fallback', 'done'])
        })

        for (let code of ['ENOENT', 'EISDIR', 'ENOSPC', 'EXDEV']) {
            it(`should NOT fall back on a non-busy error (${code}) even when fallbackOverwrite is true`, function() {
                let d = newDir()
                let fp = join(d, 'a.txt')
                fs.writeFileSync(fp, 'old')
                let { fs: f, calls } = mkFs({
                    renameSync: () => {
                        throw err(code)
                    }
                })
                let { evs, onTrace } = mkTrace()
                let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, fallbackOverwrite: true, onTrace })
                assert.strict.deepStrictEqual(r.error.code, code)
                assert.strict.deepStrictEqual(rd(fp), 'old')
                assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'writeFileSync').length, 1)
                assert.ok(!types(evs).includes('fallback'))
            })
        }

        it(`should treat anything but the primitive true as false for fallbackOverwrite ('true', 1, {}, [], null, undefined, new Boolean(true) and new Boolean(false))`, function() {
            for (let v of ['true', 1, {}, [], null, undefined, 'yes', Object(true), Object(false)]) {
                let d = newDir()
                let fp = join(d, 'a.txt')
                fs.writeFileSync(fp, 'old')
                let { fs: f } = mkFs({
                    renameSync: () => {
                        throw err('EBUSY')
                    }
                })
                let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, retries: 0, fallbackOverwrite: v })
                assert.ok(r.error, String(v))
                assert.strict.deepStrictEqual(rd(fp), 'old', String(v))
            }
        })

        it(`should return the fallback's own error (without overwritten) when the direct overwrite fails too, and leave no temp file`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old')
            let { fs: f } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                },
                writeFileSync: (orig, a, n) => {
                    if (n === 2) {
                        throw err('EACCES', 'fallback write denied')
                    }
                    return orig(...a)
                },
            })
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, fallbackOverwrite: true, retries: 0, onTrace })
            assert.strict.deepStrictEqual(Object.keys(r), ['error'])
            assert.strict.deepStrictEqual(r.error.message, 'EACCES: fallback write denied')
            assert.strict.deepStrictEqual(tmps(d), [])
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: false, reason: 'fallback' }])
        })

    })

    //規格(建議檔§3): writeFileSync(tmp)失敗 → 清暫存檔並回報; 目標檔不被動到
    describe(`暫存檔寫入失敗與清理`, function() {

        it(`should return { error } and not touch the target or call rename when writing the temp file fails`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'old')
            let { fs: f, count } = mkFs({
                writeFileSync: () => {
                    throw err('ENOSPC', 'disk full')
                }
            })
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(fp, 'new', { fs: f, onTrace })
            assert.strict.deepStrictEqual(r.error.message, 'ENOSPC: disk full')
            assert.strict.deepStrictEqual(count('renameSync'), 0)
            assert.strict.deepStrictEqual(rd(fp), 'old')
            assert.strict.deepStrictEqual(tmps(d), [])
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: false, reason: 'write' }])
        })

        it(`should remove a partially written temp file and keep the old target (writes half, then fails)`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            fs.writeFileSync(fp, 'OLD-CONTENT')
            let { fs: f } = mkFs({
                writeFileSync: (orig, a) => {
                    orig(a[0], a[1].slice(0, 3), 'utf8') //半份
                    throw err('EIO', 'io failed midway')
                }
            })
            let r = fsWriteTextAtomicCore(fp, 'NEW-CONTENT-LONG', { fs: f })
            assert.ok(r.error)
            assert.strict.deepStrictEqual(rd(fp), 'OLD-CONTENT')
            assert.strict.deepStrictEqual(tmps(d), [])
        })

        it(`should keep the old target while the SAME mid-write failure leaves a half file with the non-atomic fsWriteTextCore (contrast)`, function() {
            let d = newDir()
            let fp1 = join(d, 'atomic.txt')
            let fp2 = join(d, 'plain.txt')
            fs.writeFileSync(fp1, 'OLD-CONTENT')
            fs.writeFileSync(fp2, 'OLD-CONTENT')
            let { fs: f } = mkFs({
                writeFileSync: (orig, a) => {
                    orig(a[0], a[1].slice(0, 3), 'utf8')
                    throw err('EIO')
                }
            })
            assert.ok(fsWriteTextAtomicCore(fp1, 'NEW-CONTENT-LONG', { fs: f }).error)
            assert.ok(fsWriteTextCore(fp2, 'NEW-CONTENT-LONG', { fs: f }).error)
            assert.strict.deepStrictEqual([rd(fp1), rd(fp2)], ['OLD-CONTENT', 'NEW']) //非原子版留下半份
        })

        it(`should return the original error even if removing the temp file also fails (cleanup never masks or throws)`, function() {
            let d = newDir()
            let fp = join(d, 'a.txt')
            let { fs: f, count } = mkFs({
                renameSync: () => {
                    throw err('ENOENT', 'rename failed')
                },
                unlinkSync: () => {
                    throw err('EPERM', 'unlink failed')
                },
            })
            let r = fsWriteTextAtomicCore(fp, 'x', { fs: f })
            assert.strict.deepStrictEqual(r.error.message, 'ENOENT: rename failed')
            assert.strict.deepStrictEqual(count('unlinkSync'), 1)
        })

        it(`should not call unlink when the temp file has already become the target`, function() {
            let d = newDir()
            let { fs: f, count } = mkFs()
            fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f })
            assert.strict.deepStrictEqual(count('unlinkSync'), 0)
        })

        it(`should clean the temp file after busy exhaustion (the temp is written once, removed once)`, function() {
            let d = newDir()
            let { fs: f, calls } = mkFs({
                renameSync: () => {
                    throw err('EBUSY')
                }
            })
            fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, retries: 1 })
            let tmpW = calls.filter((c) => c[0] === 'writeFileSync')[0][1]
            assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'unlinkSync').map((c) => c[1]), [tmpW])
        })

    })

    //規格: 輸入參數之檢測機制 K2(必須參數不合即回報,fs系家族以結果物件的error回報、不拋)/K3
    describe(`輸入檢測(K2/K3)與不同步拋錯`, function() {

        it(`should return { error: 'invalid fp: ...' } and touch nothing when fp is not a non-empty string`, function() {
            for (let fp of [undefined, null, '', 5, true, {}, [], ['a.txt'], () => 'a', Symbol('x'), 10n, Object('a.txt')]) {
                let { fs: f, calls } = mkFs()
                let r = fsWriteTextAtomicCore(fp, 'x', { fs: f })
                assert.strict.deepStrictEqual(r, { error: 'invalid fp: must be a non-empty string' }, String(typeof fp))
                assert.strict.deepStrictEqual(calls, [])
            }
        })

        it(`should return { error: 'invalid c: ...' } and touch nothing when c is not a string`, function() {
            let d = newDir()
            for (let c of [undefined, null, 5, true, {}, [], ['x'], Buffer.from('x'), new Uint8Array(2), () => 'x', Object('x')]) {
                let { fs: f, calls } = mkFs()
                let r = fsWriteTextAtomicCore(join(d, 'never.txt'), c, { fs: f })
                assert.strict.deepStrictEqual(r, { error: 'invalid c: must be a string' }, String(typeof c))
                assert.strict.deepStrictEqual(calls, [])
            }
            assert.strict.deepStrictEqual(fs.readdirSync(d), []) //未建立任何檔案
        })

        it(`should report fp problems before c problems (both invalid -> fp first), and not echo the values`, function() {
            let r = fsWriteTextAtomicCore('', 5, { fs })
            assert.strict.deepStrictEqual(r, { error: 'invalid fp: must be a non-empty string' })
            let secret = 'SECRET-PATH-12345'
            let r2 = fsWriteTextAtomicCore(secret, { toString: () => 'SECRET-CONTENT' }, { fs })
            assert.ok(!JSON.stringify(r2).includes('SECRET'))
        })

        it(`should return { error } instead of throwing when opt is unreadable (getter throws, revoked Proxy) or opt.fs is missing`, function() {
            let o1 = {
                get fs() {
                    throw new Error('getter fs')
                }
            }
            let o2 = {
                fs,
                get retries() {
                    throw new Error('getter retries')
                }
            }
            let o3 = {
                fs,
                get fallbackOverwrite() {
                    throw new Error('getter fb')
                }
            }
            let o4 = {
                fs,
                get onTrace() {
                    throw new Error('getter trace')
                }
            }
            let p = Proxy.revocable({}, {})
            p.revoke()
            let d = newDir()
            for (let o of [o1, o2, o3, o4, p.proxy, {}, { fs: null }, { fs: undefined }]) {
                let r
                assert.doesNotThrow(() => {
                    r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', o)
                })
                assert.ok(r.error, 'error key must be present and truthy')
                assert.strict.deepStrictEqual(r.success, undefined)
            }
            assert.strict.deepStrictEqual(tmps(d), [])
        })

        it(`should return { error } (not throw) when opt is null, undefined or a primitive, because opt.fs is required`, function() {
            for (let o of [undefined, null, 5, 'x', true]) {
                let r = fsWriteTextAtomicCore(join(newDir(), 'a.txt'), 'x', o)
                assert.ok(r.error, String(o))
            }
        })

        it(`should return { error } (not throw) when the injected fs functions throw non-Error values (null, undefined, string, object)`, function() {
            let d = newDir()
            let cases = [[null, 'null'], [undefined, 'undefined'], ['str-throw', 'str-throw'], [{ k: 1 }, null]]
            for (let [v, want] of cases) {
                for (let which of ['writeFileSync', 'renameSync']) {
                    let { fs: f } = mkFs({
                        [which]: () => {
                            throw v
                        }
                    })
                    let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f })
                    assert.ok(r.error, `${which}:${String(v)}`) //error恆為truthy
                    if (want !== null) {
                        assert.strict.deepStrictEqual(r.error, want, `${which}`)
                    }
                    assert.strict.deepStrictEqual(r.success, undefined)
                }
            }
        })

        it(`should return { error } (not throw) when creating the parent folder (mkdirSync) throws, and write nothing`, function() {
            let d = newDir()
            let { fs: f, calls } = mkFs({
                mkdirSync: () => {
                    throw err('EACCES', 'mkdir boom')
                }
            })
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs: f, onTrace })
            assert.strict.deepStrictEqual(r.error.message, 'EACCES: mkdir boom')
            assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'writeFileSync'), [])
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: false, reason: 'prepare' }])
        })

        //審查發現: 純檔名(無資料夾部分)原因getPathParent回''而mkdir('')失敗, 一律失敗; 同庫fsWriteText可寫(寫至本進程工作目錄)
        it(`should not try to create a folder for a bare file name (no folder part) and write it by name (the current folder)`, function() {
            let { fs: f, calls } = mkFs({
                writeFileSync: () => {},
                renameSync: () => {},
                unlinkSync: () => {},
            })
            let r = fsWriteTextAtomicCore('bare.txt', 'x', { fs: f })
            assert.strict.deepStrictEqual(r, { success: 'bare.txt' })
            assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'mkdirSync'), [])
            let rn = calls.find((c) => c[0] === 'renameSync')
            assert.strict.deepStrictEqual(rn[2], 'bare.txt')
            assert.ok(rn[1].startsWith('bare.txt.') && rn[1].endsWith('.tmp'), rn[1])
        })

        it(`should create the parent folder with mkdirSync recursive (an existing folder, or a link to a folder, is not an error)`, function() {
            let d = newDir()
            let fp = join(d, 'x', 'y', 'a.txt')
            let { fs: f, calls } = mkFs()
            assert.strict.deepStrictEqual(fsWriteTextAtomicCore(fp, 'v', { fs: f }), { success: fp })
            let mk = calls.filter((c) => c[0] === 'mkdirSync')
            assert.strict.deepStrictEqual(mk.length, 1)
            assert.strict.deepStrictEqual(mk[0][2], { recursive: true })
            assert.strict.deepStrictEqual(resolve(mk[0][1]), resolve(join(d, 'x', 'y')))
        })

        it(`should return { error } when a parent folder cannot be created (a parent path is a file) and write nothing`, function() {
            let d = newDir()
            fs.writeFileSync(join(d, 'afile'), 'x')
            let { fs: f, calls } = mkFs()
            let { evs, onTrace } = mkTrace()
            let r = fsWriteTextAtomicCore(join(d, 'afile', 'sub', 'a.txt'), 'x', { fs: f, onTrace })
            assert.ok(r.error)
            assert.strict.deepStrictEqual(calls.filter((c) => c[0] === 'writeFileSync'), [])
            assert.strict.deepStrictEqual(done(evs), [{ type: 'done', ok: false, reason: 'prepare' }])
        })

    })

    //規格: 計時器相關函數之觀察回調(R-TRACE-01): 同步, 凍結事件, 拋錯與rejection忽略, 未傳回調時行為不變
    describe(`觀察回調 onTrace(R-TRACE-01)`, function() {

        it(`should emit 'done' exactly once for every outcome (success, invalid input, errors), with ok and reason`, function() {
            let d = newDir()
            let rs = []
            let run = (fp, c, opt) => {
                let { evs, onTrace } = mkTrace()
                fsWriteTextAtomicCore(fp, c, { onTrace, ...opt })
                rs.push(done(evs).map((e) => [e.ok, e.reason]))
            }
            run(join(d, 'ok.txt'), 'x', { fs })
            run('', 'x', { fs })
            run(join(d, 'ok2.txt'), 5, { fs })
            run(join(d, 'w.txt'), 'x', {
                fs: mkFs({
                    writeFileSync: () => {
                        throw err('EIO')
                    }
                }).fs
            })
            run(join(d, 'r.txt'), 'x', {
                fs: mkFs({
                    renameSync: () => {
                        throw err('ENOENT')
                    }
                }).fs
            })
            assert.strict.deepStrictEqual(rs, [[[true, 'renamed']], [[false, 'prepare']], [[false, 'prepare']], [[false, 'write']], [[false, 'rename']]])
        })

        it(`should not break the write when the callback throws or returns a rejected promise (errors and rejections are ignored)`, function() {
            let d = newDir()
            let r1 = fsWriteTextAtomicCore(join(d, 'a.txt'), '1', {
                fs,
                onTrace: () => {
                    throw new Error('trace-boom')
                }
            })
            let r2 = fsWriteTextAtomicCore(join(d, 'b.txt'), '2', { fs, onTrace: () => Promise.reject(new Error('trace-rej')) })
            assert.strict.deepStrictEqual([r1, r2], [{ success: join(d, 'a.txt') }, { success: join(d, 'b.txt') }])
            assert.strict.deepStrictEqual([rd(join(d, 'a.txt')), rd(join(d, 'b.txt'))], ['1', '2'])
        })

        it(`should return the same results with no onTrace, a non-function onTrace (undefined, null, number, string, object) and a function onTrace`, function() {
            let expectErr = []
            for (let t of [undefined, null, 5, 'x', {}, () => {}]) {
                let d = newDir()
                let { fs: f } = mkFs({
                    renameSync: () => {
                        throw err('ENOENT', 'same')
                    }
                })
                let r1 = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs, onTrace: t })
                let r2 = fsWriteTextAtomicCore(join(d, 'b.txt'), 'x', { fs: f, onTrace: t })
                expectErr.push([r1.success === join(d, 'a.txt'), r2.error.message])
            }
            assert.strict.deepStrictEqual(expectErr, new Array(6).fill([true, 'ENOENT: same']))
        })

        it(`should call the callback synchronously, before the function returns (not deferred)`, function() {
            let d = newDir()
            let seen = []
            fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', { fs, onTrace: (e) => seen.push(e.type) })
            assert.strict.deepStrictEqual(seen, ['attempt', 'done'])
        })

        it(`should call the callback without a receiver and ignore its return value`, function() {
            let d = newDir()
            let thisSeen = 'unset'
            let r = fsWriteTextAtomicCore(join(d, 'a.txt'), 'x', {
                fs,
                onTrace: function() {
                    thisSeen = this
                    return { shouldBeIgnored: true }
                }
            })
            assert.strict.deepStrictEqual(thisSeen, undefined)
            assert.strict.deepStrictEqual(r, { success: join(d, 'a.txt') })
        })

    })

    //規格(建議檔§3,核心保證): 寫到一半行程被終止時, 目標檔不會是半份; 非原子版則會(子行程以process.exit模擬中止)
    describe(`寫到一半行程被終止(子行程)`, function() {

        it(`should leave the target as the complete old content when the process dies midway through writing the temp file (the temp residue is documented)`, function() {
            let d = newDir()
            let fp = join(d, 'state.json')
            fs.writeFileSync(fp, 'OLD-STATE-OLD-STATE')
            let { status } = runChildCase(runner, 'crashAtomic', { env: { ...process.env, WSEMI41_TARGET: fp }, allowNoResult: true })
            assert.strict.deepStrictEqual(status, 7)
            assert.strict.deepStrictEqual(rd(fp), 'OLD-STATE-OLD-STATE')
            let left = tmps(d)
            assert.strict.deepStrictEqual(left.length, 1) //強制終止無從清理: 殘留之暫存檔(文件已載)
            assert.ok(left[0].startsWith('state.json.') && basename(left[0]).endsWith('.tmp'))
        })

        it(`should show the non-atomic fsWriteTextCore leaving a half file under the same crash (contrast)`, function() {
            let d = newDir()
            let fp = join(d, 'state.json')
            fs.writeFileSync(fp, 'OLD-STATE-OLD-STATE')
            let { status } = runChildCase(runner, 'crashPlain', { env: { ...process.env, WSEMI41_TARGET: fp }, allowNoResult: true })
            assert.strict.deepStrictEqual(status, 7)
            assert.strict.deepStrictEqual(rd(fp), 'NEW-')
        })

    })

})
