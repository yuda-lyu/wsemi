import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import getDiagSecrets from '../src/getDiagSecrets.mjs'
import diagSuite from './tools/diagSuite.mjs'


let dirThis = path.dirname(fileURLToPath(import.meta.url))


//getDiagSecrets由套件宣告之秘密來源導出detail與reject兩份清單, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01


describe(`getDiagSecrets`, function() {

    it(`should never throw and return frozen empty lists for invalid sources`, function() {
        //設計§6.2: 任何輸入皆不拋錯(不合者略過), 回傳凍結之清單
        let vs = [undefined, null, 1, 'x', [], {}, { urls: 1 }, { urls: [null, {}, 1] }, new Proxy({}, {
            get() {
                throw new Error('x')
            }
        })]
        for (let v of vs) {
            let r = getDiagSecrets(v)
            assert.strict.deepStrictEqual(Object.isFrozen(r) && Object.isFrozen(r.detail) && Object.isFrozen(r.reject), true)
        }
        assert.strict.deepStrictEqual(getDiagSecrets(null), { detail: [], reject: [] })
    })

    it(`should not run getters of the source object`, function() {
        //R-DIAG-01: 不執行使用端程式(來源物件只讀自有資料屬性)
        let n = 0
        let src = Object.defineProperty({}, 'password', {
            enumerable: true,
            get() {
                n++
                return 'zzz9'
            }
        })
        getDiagSecrets(src)
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`should keep other sources when one source cannot be read (terra #20)`, function() {
        //dspec D4: 單一無法讀取之來源不影響其他來源
        let { proxy, revoke } = Proxy.revocable([], {})
        revoke()
        let r = getDiagSecrets({ urls: proxy, password: 'secret9' })
        assert.strict.deepStrictEqual([r.detail.includes('secret9'), r.reject.includes('secret9')], [true, true])
    })

    it(`should not put a lone username or user:(empty) pair into the reject list (capi #9)`, function() {
        //設計§6.2: reject不含單獨帳號
        let r = getDiagSecrets({ username: 'dbuser' })
        assert.strict.deepStrictEqual([r.detail.includes('dbuser'), r.reject.length], [true, 0])
    })

    it(`should list every value without a silent cap (terra #21)`, function() {
        //設計§6.2: values全部列入; 來源為套件宣告, 少列即漏遮
        let vs = Array.from({ length: 1001 }, (v, i) => `token${String(i).padStart(5, '0')}`)
        let r = getDiagSecrets({ values: vs })
        assert.strict.deepStrictEqual(r.reject.includes('token01000'), true)
    })

    it(`should decode valid percent escapes next to invalid ones leniently (terra #23)`, function() {
        //設計§6.2第1條寬鬆解碼: 合法之%XX解碼, 不合法者原樣
        let r = getDiagSecrets({ urls: ['mongodb://u:abc%21%FFdef@host/db'] })
        assert.strict.deepStrictEqual(r.reject.includes('abc!%FFdef'), true)
    })

    it(`should sort lists longest first without duplicates`, function() {
        //設計§3.5第6條: 去重、長者在前
        let r = getDiagSecrets({ urls: ['postgres://u1:pw1234@h/db'], password: 'pw1234' })
        for (let a of [r.detail, r.reject]) {
            assert.strict.deepStrictEqual(new Set(a).size, a.length)
            assert.strict.deepStrictEqual(a.every((s, i) => i === 0 || a[i - 1].length >= s.length), true)
        }
    })

    it(`should be recognized as unusable by another loaded copy of the masking functions when a source cannot be read (diag-run04 terra #20)`, async function() {
        //dspec D4: 失敗標記為陣列內之字串(非各模組副本各自之Symbol), 另一份載入之模組取用時仍fail-closed; 夾具建於test/_tmp/diagTwoCopies/並於案例結束刪除
        let dir = path.join(dirThis, '_tmp', 'diagTwoCopies')
        fs.rmSync(dir, { recursive: true, force: true })
        fs.mkdirSync(dir, { recursive: true })
        try {
            for (let f of ['_diagKit', '_diagCodes', '_pmMarkHandled', 'maskDiagText']) {
                fs.copyFileSync(path.join(dirThis, '..', 'src', `${f}.mjs`), path.join(dir, `${f}.mjs`))
            }
            let maskB = (await import(pathToFileURL(path.join(dir, 'maskDiagText.mjs')).href)).default
            let src = { values: ['zzTok4455'] }
            Object.defineProperty(src, 'password', { get: () => 'qqPw88', enumerable: true })
            let s = getDiagSecrets(src)
            assert.strict.deepStrictEqual([maskB('x qqPw88', s), maskB('x qqPw88', s.reject), maskB('x zzTok4455', getDiagSecrets({ values: ['zzTok4455'] }))], ['***', '***', 'x ***'])
        }
        finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    diagSuite('getDiagSecrets')

})
