import assert from 'assert'
import maskDiagText from '../src/maskDiagText.mjs'
import { maskUrlCred } from '../src/_diagKit.mjs'
import diagSuite from './tools/diagSuite.mjs'


//maskDiagText為文字遮罩, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01; 網址帳密步驟(_diagKit之maskUrlCred)亦供fsDownloadFileVerifyCore、fsEnsureBinsCore使用(設計§6.10 X65)


//oldMaskUrl, X65改用共用步驟前之實作(fsDownloadFileVerifyCore、fsEnsureBinsCore原maskUrl), 供輸出差異之對照
let oldMaskUrl = (s) => String(s).replace(/([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^/?#\s]*@/g, '$1***@')


describe(`maskDiagText`, function() {

    it(`should return non-strings as is and unwrap boxed strings`, function() {
        //設計§6.3: 非字串原樣回傳; 包裝字串以原始值處理(R-WRAPPER-01)
        let o = { a: 1 }
        assert.strict.deepStrictEqual(maskDiagText(o, ['a']), o)
        assert.strict.deepStrictEqual(maskDiagText(12345, ['12345']), 12345)
        assert.strict.deepStrictEqual(maskDiagText(new String('x pw1234'), ['pw1234']), 'x ***') // eslint-disable-line no-new-wrappers
    })

    it(`should accept the getDiagSecrets result and use its detail list`, function() {
        //設計§6.2: maskDiagText用detail清單(診斷輸出)
        assert.strict.deepStrictEqual(maskDiagText('u dbuser', { detail: ['dbuser'], reject: [] }), 'u ***')
    })

    it(`should keep the shared URL step output equal to the former maskUrl (X65)`, function() {
        //X65: fsDownloadFileVerifyCore、fsEnsureBinsCore之maskUrl改用共用步驟, 輸出與原maskUrl逐字相同(含引號之帳密亦遮: 外審terra #17)
        let same = [
            'https://u:p@h/x', 'see https://u:p@h/x and ftp://a@b', 'http://h/x@y', 'http://h?x=a@b', 'mongodb://al@ce:p@ss@h1:27017/x', '1://u:p@h',
            'x-y+z.w://u@h', 'http://u:p@', 'http://@h', 'ahttps://u:p@h', 'no url here', '', 'http://u:p\'s@h', 'url=https://u:p@h&x=1', 'a://b://c@d',
            'http://u:p\n@h', 'HTTP://U:P@H', undefined, null, 123, '{"url":"https://x","mail":"a@b"}', 'https://alice:p",x@host/a', 'a "https://u:p\'x@h" b',
        ]
        for (let s of same) {
            assert.strict.deepStrictEqual(maskUrlCred(s), oldMaskUrl(s), String(s))
        }
    })

    it(`should mask credential values in double-encoded JSON and in arrays (capi #23)`, function() {
        //設計§3.6第4條: 憑證鍵值對盡力遮
        assert.strict.deepStrictEqual(maskDiagText('body={\\"password\\":\\"hunter22\\",\\"x\\":1}', []), 'body={\\"password\\":\\"***\\",\\"x\\":1}')
        assert.strict.deepStrictEqual(maskDiagText('"password": ["hunter22"]', []), '"password": [***]')
    })

    it(`should match long secrets with percent escapes case-insensitively (terra #22)`, function() {
        //設計§6.2第6條: 百分比編碼之十六進位不分大小寫(過長之秘密亦同)
        let sec = `${'x'.repeat(4100)}%2Fend`
        assert.strict.deepStrictEqual(maskDiagText(`a ${'x'.repeat(4100)}%2fend b`, [sec]), 'a *** b')
    })

    it(`should not run getters of the secrets list (terra #28, list part)`, function() {
        //設計§3.4.1: 不執行使用端getter; R-DIAG-01: 清單含無法檢查之項(存取器)時視為取不到(fail-closed), 文字為***
        //與樣式之flags getter分成兩次呼叫(diag-run04 F28b): 同一呼叫時清單先fail-closed, 樣式路徑不會被走到
        let n = 0
        let list = ['zz']
        Object.defineProperty(list, '0', {
            get() {
                n++
                return 'secret9'
            }
        })
        let r = maskDiagText('secret9 id=ab1', list, { patterns: [{ re: /id=(?<v>\w+)/, group: 'v' }] })
        assert.strict.deepStrictEqual({ n, r }, { n: 0, r: '***' })
    })

    it(`should not run the getter of a pattern's RegExp flags and read the flags from the built-in slots (terra #28, pattern part)`, function() {
        //設計§3.4.1: 不執行使用端getter(樣式之when為明定例外); 旗標以內建之各旗標getter取內部槽位(_diagKit之reFlags), 不經可被覆寫之flags屬性
        //清單為可用之一般陣列, 使樣式路徑確實被走到; 被覆寫之flags回傳'i'(不分大小寫), 若被讀用則'ID=AB1'亦會被遮
        let n = 0
        let re = /id=(?<v>\w+)/
        Object.defineProperty(re, 'flags', {
            get() {
                n++
                return 'i'
            }
        })
        let r = maskDiagText('secret9 id=ab1 ID=AB2', ['secret9'], { patterns: [{ re, group: 'v' }] })
        assert.strict.deepStrictEqual({ n, r }, { n: 0, r: '*** id=*** ID=AB2' })
    })

    it(`should mask the interval matched before when() runs (terra #35)`, function() {
        //設計§6.3第2條: when只決定是否遮, 不改變所遮之區間
        let r = maskDiagText('prefixsecret9', [], {
            patterns: [{
                re: /prefix(?<v>secret9)/,
                group: 'v',
                when: (m) => {
                    m.indices.groups.v = [0, 0]
                    return true
                }
            }]
        })
        assert.strict.deepStrictEqual(r, 'prefix***')
    })

    it(`should scan URL credentials in linear time for long runs of scheme characters (process CPU time)`, function() {
        //X65附帶: 原比對式於長串字母(無://)為平方回溯; 共用步驟以掃描實作, 10倍長度之CPU時間比應遠小於平方之100倍
        let cpu = (n) => {
            let s = 'a'.repeat(n)
            let t = process.cpuUsage()
            for (let i = 0; i < 5; i++) {
                maskUrlCred(s)
            }
            let d = process.cpuUsage(t)
            return d.user + d.system
        }
        cpu(20000)
        let a = cpu(20000)
        let b = cpu(200000)
        assert.strict.deepStrictEqual(b <= Math.max(a, 2000) * 40, true, `${a} ${b}`)
    })

    it(`should read a sparse secrets list in time independent of its length (diag-run03 terra #27, process CPU time)`, function() {
        //dspec D4: 成本與實有之項數成正比(不依length逐格走訪空洞); 同次數(各10次)之length 1e5對1e6: 依length約10倍、與length無關約1倍(各取3次之最小值)
        let run = (n) => {
            let list = new Array(n)
            list[n - 1] = 'zzSparse99'
            let best = Infinity
            for (let r = 0; r < 3; r++) {
                let t = process.cpuUsage()
                for (let j = 0; j < 10; j++) {
                    assert.strict.deepStrictEqual(maskDiagText('x zzSparse99', list), 'x ***')
                }
                let d = process.cpuUsage(t)
                best = Math.min(best, d.user + d.system)
            }
            return best
        }
        let a = run(1e5)
        let b = run(1e6)
        assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${a} ${b}`)
    })

    diagSuite('maskDiagText')

})
