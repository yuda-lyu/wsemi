import assert from 'assert'
import fs from 'fs'
import path from 'path'
import chkFsPath from '../src/_chkFsPath.mjs'
import { runChildCase } from './tools/runChildCase.mjs'
import { bads, sites, expMsg } from './tools/fsPathSites.mjs'


//R-FS-INVALID-PATH-01 / 輸入規格 §5.3 C12、P4: fs系函數之路徑參數無效(非字串、空字串、含NUL字元)時,
//  依各函數之失敗通道回報(結果物件{ error }、Promise reject、同步拋出、判斷類回false), 訊息不帶輸入值, 與「路徑不存在」分開, 且不得動到任何檔案;
//  不得被當成「不存在」而回成功(原: fsDeleteFile(null)回{ success: 'file does not exist: null' }, fsCopyFolder(src, '')把內容複製進工作目錄)
//  站點全集見test/tools/fsPathSites.mjs, 於子行程之夾具資料夾內逐站點餵各種無效值(見fsInvalidPathRunner.mjs)
describe(`fs invalid path (R-FS-INVALID-PATH-01)`, function() {

    let fdTmp = path.resolve('./test/_tmp/fsInvalidPath')
    let runner = path.resolve('./test/tools/fsInvalidPathRunner.mjs')
    let results = []

    before(function() {
        this.timeout(300000)
        fs.rmSync(fdTmp, { recursive: true, force: true })
        fs.mkdirSync(fdTmp, { recursive: true })
        let r = runChildCase(runner, 'all', { cwd: fdTmp, timeout: 240000 })
        results = r.r
    })

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true })
    })

    describe(`_chkFsPath`, function() {

        it(`should return the fixed message without the input value for every invalid value`, function() {
            for (let [bn, bv] of bads) {
                let m = chkFsPath(bv, 'pah')
                assert.strict.deepStrictEqual(m, expMsg('pah', bn), bn)
            }
        })

        it(`should return null for valid path strings, including whitespace-only and non-ASCII ones`, function() {
            //空白字串於POSIX為合法檔名, 屬「有效但可能不存在」, 不歸無效(P4: 無效、不存在分開)
            let valids = ['a', ' ', '   ', 'x y', '中文', '.', '..', 'C:\\x\\y', '/tmp/x', './a/b', 'a'.repeat(5000), 'a\u0001b', 'a\uD800b', '\u0000'.slice(1) + 'ok']
            for (let v of valids) {
                assert.strict.deepStrictEqual(chkFsPath(v, 'pah'), null, JSON.stringify(v).slice(0, 20))
            }
        })

        it(`should name the given parameter in the message`, function() {
            assert.strict.deepStrictEqual(chkFsPath(null, 'fpSrc'), 'invalid fpSrc: must be a non-empty string')
            assert.strict.deepStrictEqual(chkFsPath('a\0', 'fpsIn[3]'), 'invalid fpsIn[3]: must not contain a NUL character')
        })

    })

    describe(`site list`, function() {

        it(`should cover every src/fs*.mjs or list it as excluded with a reason`, function() {
            //站點全集之完整性: 新增fs*函數時須加入fsPathSites.mjs或於此列為排除(含理由)
            let excluded = {
                fsEvem: '路徑為opt.fd(有預設值之opt類選項, 非預期改用預設, R-OPT-VAL-01), 無路徑必要參數',
                fsSrlog: '路徑為opt.fdSys與opt.fdLog(有預設值之opt類選項), 無路徑必要參數',
                fsEnsureBins: '路徑為清單內之相對路徑與opt.cache等, 另由清單檢核(E_MANIFEST, R-BIN-ENSURE-01)',
                fsEnsureBinsCore: '同fsEnsureBins',
            }
            let files = fs.readdirSync(path.resolve('./src')).filter((n) => /^fs.*\.mjs$/.test(n)).map((n) => n.replace(/\.mjs$/, ''))
            let covered = new Set(sites.map((s) => s.fn))
            let missing = files.filter((n) => !covered.has(n) && !(n in excluded))
            assert.strict.deepStrictEqual(missing, [])
            assert.strict.deepStrictEqual(Object.keys(excluded).filter((n) => !files.includes(n)), []) //排除名單之檔須存在
            assert.strict.deepStrictEqual([...covered].filter((n) => !files.includes(n)), []) //站點之檔須存在
        })

        it(`should have run every site with every invalid value`, function() {
            //防子行程少跑而使逐站點之斷言空轉
            let want = 0
            for (let s of sites) {
                want += s.params.length * (bads.length + (s.ctl === null ? 0 : 1))
            }
            assert.strict.deepStrictEqual(results.length, want)
        })

    })

    describe(`sites`, function() {

        let msgOf = (val) => (typeof val === 'string' ? val : (val && val.__error) || '')

        for (let s of sites) {
            for (let p of s.params) {

                it(`${s.name}(${p.name}) should report an invalid path per its failure channel (${s.kind}) without echoing the value and without touching any file, and keep invalid apart from absent`, function() {
                    let diffs = []
                    for (let [bn] of bads) {
                        let rec = results.find((x) => x.site === s.name && x.param === p.name && x.bad === bn)
                        assert.strict.deepStrictEqual(rec !== undefined, true, `no result for ${bn}`)
                        let em = expMsg(p.name, bn)
                        let ok = false
                        if (s.kind === 'bool') {
                            ok = rec.type === 'return' && rec.val === false
                        }
                        else if (s.kind === 'env') {
                            ok = rec.type === 'return' && JSON.stringify(rec.val) === JSON.stringify({ error: em })
                        }
                        else if (s.kind === 'rej') {
                            ok = rec.type === 'reject' && rec.val === em
                        }
                        else if (s.kind === 'thr') {
                            ok = rec.type === 'throw' && rec.val.__error === em
                        }
                        else if (s.kind === 'own') {
                            ok = rec.type === 'reject' && s.own.re.test(msgOf(rec.val))
                        }
                        if (!ok || rec.fx.length > 0) {
                            diffs.push(`${bn}: ${rec.type} ${JSON.stringify(rec.val).slice(0, 110)}${rec.fx.length ? ' fx=' + JSON.stringify(rec.fx).slice(0, 80) : ''}`)
                        }
                    }
                    assert.strict.deepStrictEqual(diffs, [])

                    //對照: 有效但不存在之路徑, 結果(若為失敗)之訊息不得是無效路徑之訊息
                    if (s.ctl !== null) {
                        let rc = results.find((x) => x.site === s.name && x.param === p.name && x.bad === '__ctl__')
                        let m = ''
                        if (s.kind === 'env' && rc.val && rc.val.error !== undefined) {
                            m = String(msgOf(rc.val.error))
                        }
                        else if (rc.type === 'reject' || rc.type === 'throw') {
                            m = msgOf(rc.val)
                        }
                        assert.strict.deepStrictEqual(/^invalid /.test(m), false, `control(${s.ctl}): ${rc.type} ${JSON.stringify(rc.val).slice(0, 100)}`)
                    }
                })

            }
        }

    })

})
