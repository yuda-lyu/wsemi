import fs from 'fs'
import assert from 'assert'
import genDiagStreamMasker from '../src/genDiagStreamMasker.mjs'
import maskDiagText from '../src/maskDiagText.mjs'
import getDiagSecrets from '../src/getDiagSecrets.mjs'


//genDiagStreamMasker為串流遮罩器, 規則見sgud/rule/rulebook_diag.md之R-DIAG-02(排程第486項: 兩個自有套件各寫一份串流遮罩, 收為單一實作)
//規格句(JSDoc): S1 每列之輸出等於maskDiagText(該列, secrets, opt), 與塊之切法無關; S2 收到換行才交出該列, 最後無換行之一段於flush交出; S3 已知秘密跨越列尾者該列尾不作為切點;
//S4 超過20000字元之列強制分段(每段至多16000), 切點不落在命中區間內、不切開代理對, 輸出全文不截斷且與塊之切法無關; 命中區間延伸至窗尾而列未結束者該列其餘為一個***;
//S5 chunk之型別處置; S6 secrets於建立時取快照, 清單無法使用時每段***; S7 opt同maskDiagText(patterns、credPatterns); S8 永不拋錯, flush後可再用


//run, 依切點切塊餵入, 回傳合併之輸出
let run = (secrets, opt, text, cuts) => {
    let m = genDiagStreamMasker(secrets, opt)
    let out = ''
    let last = 0
    for (let c of cuts) {
        out += m.push(text.slice(last, c))
        last = c
    }
    out += m.push(text.slice(last))
    out += m.flush()
    return out
}

//byLine, 逐列以maskDiagText遮罩之預期(S1)
let byLine = (secrets, opt, text) => {
    return text.split(/(?<=\n)/).map((l) => maskDiagText(l, secrets, opt)).join('')
}

//allCuts2, 兩刀之全部切法(第二刀步進step)不符者
let badCuts = (secrets, opt, text, want, step = 1) => {
    let bad = []
    for (let i = 0; i <= text.length; i++) {
        for (let j = i; j <= text.length; j += step) {
            let o = run(secrets, opt, text, [i, j])
            if (o !== want) {
                bad.push([i, j])
            }
        }
    }
    return bad
}


describe(`genDiagStreamMasker`, function() {

    let K = 'sk-ant-api03-STREAM-SECRET-0123456789'

    it(`should be exported from the package index and not import Node builtins (browser-loadable)`, function() {
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as genDiagStreamMasker } from './genDiagStreamMasker.mjs'`), true)
        let s = fs.readFileSync(new URL('../src/genDiagStreamMasker.mjs', import.meta.url), 'utf8')
        let deps = [...s.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1])
        assert.strict.deepStrictEqual(deps, ['./_diagKit.mjs'])
    })

    it(`S1: output equals per-line maskDiagText for every 2-cut split (secret, pair, Bearer, URL credential, last line without newline)`, function() {
        let text = `head ${K} mid\npassword=abc ${K}tail\nx Bearer zz.yy\npostgres://u1:pw@db/a\nlast ${K}`
        let want = byLine([K], undefined, text)
        assert.strict.deepStrictEqual(want.includes(K) || want.includes('abc') || want.includes('zz.yy') || want.includes('pw@'), false)
        assert.strict.deepStrictEqual(badCuts([K], undefined, text, want, 3), [])
    })

    it(`S1: a secret split at any position across three chunks is still fully masked`, function() {
        let text = `a${K}b${K}\n`
        let want = byLine([K], undefined, text)
        assert.strict.deepStrictEqual(want, 'a***b***\n')
        assert.strict.deepStrictEqual(badCuts([K], undefined, text, want, 1), [])
    })

    it(`S1: getDiagSecrets result is accepted (detail list) and equals maskDiagText`, function() {
        let ss = getDiagSecrets({ urls: ['postgres://u1:pw123456@db:5432/app'], values: ['tok-abcdef-123'] })
        let text = 'connect postgres://u1:pw123456@db:5432/app with tok-abcdef-123 failed\nuser u1 path ok\n'
        let want = text.split(/(?<=\n)/).map((l) => maskDiagText(l, ss)).join('')
        assert.strict.deepStrictEqual(run(ss, undefined, text, [10, 40]), want)
        assert.strict.deepStrictEqual(want.includes('pw123456') || want.includes('tok-abcdef'), false)
    })

    it(`S2: a line is released only when its newline arrives; the trailing part is released by flush`, function() {
        let m = genDiagStreamMasker([K])
        assert.strict.deepStrictEqual(m.push('abc'), '')
        assert.strict.deepStrictEqual(m.push('def\nghi'), 'abcdef\n')
        assert.strict.deepStrictEqual(m.push(`\n${K.slice(0, 5)}`), 'ghi\n')
        assert.strict.deepStrictEqual(m.push(`${K.slice(5)} end`), '')
        assert.strict.deepStrictEqual(m.flush(), '*** end')
        assert.strict.deepStrictEqual(m.flush(), '')
    })

    it(`S1: lines are masked independently (an unclosed quote does not swallow the next line), regardless of chunking`, function() {
        let text = 'password="abc\ndef"\nnext line\n'
        let want = byLine([], undefined, text)
        assert.strict.deepStrictEqual(want, 'password="***def"\nnext line\n')
        assert.strict.deepStrictEqual(badCuts([], undefined, text, want, 1), [])
    })

    it(`S3: a registered secret containing a newline is masked as a whole for every split, and its inner newline is not a cut point`, function() {
        let S = 'abc\ndef-SECRET'
        let text = `x ${S} y\nz\nabc\nplain\n`
        let want = maskDiagText(`x ${S} y\n`, [S]) + maskDiagText('z\n', [S]) + maskDiagText('abc\n', [S]) + maskDiagText('plain\n', [S])
        assert.strict.deepStrictEqual(want, 'x *** y\nz\nabc\nplain\n')
        assert.strict.deepStrictEqual(badCuts([S], undefined, text, want, 1), [])
    })

    it(`S3: a prefix of a newline secret at the end of the stream is released on flush unmasked only when the secret never completes`, function() {
        let S = 'abc\ndef-SECRET'
        let m = genDiagStreamMasker([S])
        assert.strict.deepStrictEqual(m.push('abc\n'), '') //等待其後文字判定是否跨列
        assert.strict.deepStrictEqual(m.flush(), 'abc\n')
        let m2 = genDiagStreamMasker([S])
        assert.strict.deepStrictEqual(m2.push('abc\n') + m2.push('def-SECRET\n') + m2.flush(), '***\n')
    })

    it(`S1/S4: a line of up to 20000 characters is masked as a whole (equal to maskDiagText even where a 16000 cut would change the context)`, function() {
        //'xBearer'前為英數字: 整列判定不遮; 若在16000(Bearer之前)強制切開, 後段以Bearer起頭而會被遮
        let line = `${'x'.repeat(16000)}Bearer abc ${'y'.repeat(1000)}\n`
        let want = maskDiagText(line, [])
        assert.strict.deepStrictEqual(want, line)
        assert.strict.deepStrictEqual(run([], undefined, line, [100, 17000]), want)
        let line2 = `${'x'.repeat(19999)}\n` //恰20000
        assert.strict.deepStrictEqual(run([], undefined, line2, []), line2)
    })

    it(`S4: a long line without secrets is output verbatim (no truncation) for different chunk sizes`, function() {
        let text = ('lorem ipsum dolor sit amet '.repeat(3000)) + '\nshort\n' + 'x'.repeat(50000)
        for (let step of [1000, 7777, text.length]) {
            let cuts = []
            for (let c = step; c < text.length; c += step) {
                cuts.push(c)
            }
            assert.strict.deepStrictEqual(run([], undefined, text, cuts), text, String(step))
        }
    })

    it(`S4: secrets and credential pairs straddling the forced cut region are fully masked, output independent of chunking`, function() {
        //空白在16000附近: 秘密與鍵值對跨越候選切點
        let pre = 'a'.repeat(15990)
        let text = `${pre} ${K} token=${'Z'.repeat(40)} ${'b'.repeat(30000)} ${K}\n`
        let ref = run([K], undefined, text, [])
        assert.strict.deepStrictEqual(ref.includes(K.slice(0, 12)) || ref.includes(K.slice(-12)) || ref.includes('ZZZZ'), false)
        assert.strict.deepStrictEqual(ref, `${pre} *** token=*** ${'b'.repeat(30000)} ***\n`)
        for (let step of [1, 333, 4096, 16001, 20003]) {
            let cuts = []
            for (let c = step; c < text.length; c += step) {
                cuts.push(c)
            }
            if (step === 1) {
                cuts = cuts.filter((c) => c > 15900 && c < 16200) //逐字只在切點區
            }
            assert.strict.deepStrictEqual(run([K], undefined, text, cuts), ref, String(step))
        }
    })

    it(`S4: a long line with no whitespace is split without breaking a secret placed exactly over the 16000 boundary`, function() {
        let text = `${'q'.repeat(15985)}${K}${'r'.repeat(25000)}\n`
        let o = run([K], undefined, text, [16000, 16010, 20001, 30000])
        assert.strict.deepStrictEqual(o, `${'q'.repeat(15985)}***${'r'.repeat(25000)}\n`)
    })

    it(`S4: a forced cut never splits a surrogate pair at a push boundary`, function() {
        for (let pre of ['', 'x']) {
            //30000碼元以上且無空白: 前段於本次push強制分段交出; pre為'x'時16000落在代理對之中間
            let m = genDiagStreamMasker([])
            let o1 = m.push(pre + '😀'.repeat(15000))
            assert.strict.deepStrictEqual(o1.length > 0, true)
            assert.strict.deepStrictEqual(/[\ud800-\udbff]$/.test(o1), false, pre)
            let o2 = m.flush()
            assert.strict.deepStrictEqual(/^[\udc00-\udfff]/.test(o2), false, pre)
            assert.strict.deepStrictEqual(o1 + o2, pre + '😀'.repeat(15000))
        }
    })

    it(`S4: a credential value longer than the window turns the rest of that line (with its key) into one *** (fail-closed) and the next line is normal`, function() {
        let text = `head token=${'V'.repeat(60000)} tail\nnext Bearer abc\n`
        let ref = run([], undefined, text, [])
        assert.strict.deepStrictEqual(ref, `head ***\nnext Bearer ***\n`)
        for (let cuts of [[5000, 30000], [6, 7, 8, 11, 12], [20001, 20002]]) {
            assert.strict.deepStrictEqual(run([], undefined, text, cuts), ref, String(cuts))
        }
    })

    it(`S4: the key and its value are never split into two segments (the value keeps being masked after a forced cut)`, function() {
        //鍵值對之值跨越16000且其後於窗內結束: 切點移至鍵之前, 值整段遮到
        let text = `${'a'.repeat(15995)} token=${'V'.repeat(3000)} ${'b'.repeat(20000)}\n`
        let o = run([], undefined, text, [16000])
        assert.strict.deepStrictEqual(o, `${'a'.repeat(15995)} token=*** ${'b'.repeat(20000)}\n`)
        //網址帳密同: scheme與帳密不分開
        let t2 = `${'a'.repeat(15990)} postgres://user:${'P'.repeat(100)}@db/x ${'b'.repeat(20000)}\n`
        let o2 = run([], undefined, t2, [])
        assert.strict.deepStrictEqual(o2, `${'a'.repeat(15990)} postgres://***@db/x ${'b'.repeat(20000)}\n`)
    })

    it(`S4: the forced cut prefers the last space or tab within 16000 (observable at the push boundary)`, function() {
        let m = genDiagStreamMasker([])
        assert.strict.deepStrictEqual(m.push(`${'a'.repeat(15000)}\t${'b'.repeat(10000)}`), 'a'.repeat(15000))
        assert.strict.deepStrictEqual(m.flush(), `\t${'b'.repeat(10000)}`)
        let m2 = genDiagStreamMasker([])
        assert.strict.deepStrictEqual(m2.push('c'.repeat(25000)), 'c'.repeat(16000)) //無空白: 16000
    })

    it(`S4: a forced cut never separates a URL scheme from '://' and its credentials`, function() {
        //'postgres:'佔15991~15999, '/'在16000: 若只避開帳密之遮罩區間, 切在':'與'//'之間則後段無'://'而帳密不被遮
        let text = `${'a'.repeat(15991)}postgres://user:${'P'.repeat(100)}@db/x${'b'.repeat(20000)}\n`
        assert.strict.deepStrictEqual(text.slice(16000, 16002), '//')
        assert.strict.deepStrictEqual(run([], undefined, text, []), `${'a'.repeat(15991)}postgres://***@db/x${'b'.repeat(20000)}\n`)
    })

    it(`S4: a URL whose credential '@' lies beyond the window (no space, /, ?, # until the window end) makes the rest of that line *** (fail-closed; independent review A1)`, function() {
        let text = `https://u:${'Q'.repeat(20500)}@h/x\nnext\n`
        for (let cuts of [[], [16000], [9, 20001, 20511]]) {
            let o = run([], undefined, text, cuts)
            assert.strict.deepStrictEqual(o, '***\nnext\n', String(cuts))
        }
        //前有一般文字者, 切點移到scheme之前
        let t2 = `head ${'h'.repeat(100)} https://u:${'Q'.repeat(20500)}@h/x\n`
        assert.strict.deepStrictEqual(run([], undefined, t2, []), `head ${'h'.repeat(100)} ***\n`)
    })

    it(`S4/S7: a forced cut never separates the context of an opt.patterns match from its masked group`, function() {
        let opt = { patterns: [{ re: /key-(\d+)/, group: 1 }] }
        let text = `${'a'.repeat(15996)}key-${'7'.repeat(50)}${'b'.repeat(20000)}\n`
        assert.strict.deepStrictEqual(run([], opt, text, []), `${'a'.repeat(15996)}key-***${'b'.repeat(20000)}\n`)
    })

    it(`S4: an unclosed quoted credential at the start of a long line is masked to the end of that line only`, function() {
        let text = `password="${'w '.repeat(15000)}\nok\n`
        let o = run([], undefined, text, [100])
        assert.strict.deepStrictEqual(o, '***\nok\n')
    })

    it(`S4: a long line whose credential ends within the window is cut at the end of that credential`, function() {
        //列長20001(>20000): 窗即整列; 值自段首延伸超過16000而於列尾前結束
        let text = `token=${'T'.repeat(19994)}\nend\n`
        assert.strict.deepStrictEqual(text.indexOf('\n') + 1, 20001)
        let o = run([], undefined, text, [])
        assert.strict.deepStrictEqual(o, 'token=***\nend\n')
    })

    it(`S4: the window covers the longest secret: a 6000-character secret straddling the 16000 cut is masked whole`, function() {
        let L = `LONGSECRET-${'s'.repeat(6000)}-END` //6015字元, 起於15990: 結尾超過16000+4000之窗
        let text = `${'a'.repeat(15990)}${L}${'b'.repeat(30000)}\n`
        for (let cuts of [[], [16000, 20000], [22005, 22006]]) {
            assert.strict.deepStrictEqual(run([L], undefined, text, cuts), `${'a'.repeat(15990)}***${'b'.repeat(30000)}\n`, String(cuts))
        }
    })

    it(`S3: a line held for a possible newline secret is released as soon as enough following text arrives (without waiting for another newline)`, function() {
        let S = 'abc\ndef-SECRET' //14字元: 換行後須再到13字元才能判定
        let m = genDiagStreamMasker([S])
        assert.strict.deepStrictEqual(m.push('abc\n'), '')
        assert.strict.deepStrictEqual(m.push('xyzxyzxyzxyz'), '') //尚差1字元
        assert.strict.deepStrictEqual(m.push('x'), 'abc\n')
        assert.strict.deepStrictEqual(m.flush(), 'xyzxyzxyzxyzx')
    })

    it(`S3/S4: in a line replaced by *** (fail-closed), a newline secret that starts inside the discarded part still keeps its newline from ending the line`, function() {
        let S = 'abc\ndef-SECRET'
        let text = `token=${'V'.repeat(60000)}abc\ndef-SECRET y\nok\n`
        let i = text.indexOf('abc\n') + 2 //在'ab'與'c'之間切開: 'ab'於丟棄時須保留供跨列判定
        for (let cuts of [[i], [30000, i], []]) {
            assert.strict.deepStrictEqual(run([S], undefined, text, cuts), '***\nok\n', String(cuts))
        }
    })

    it(`S5: chunk types: Buffer split inside a UTF-8 character, numbers, null/undefined, String wrapper, objects and symbols`, function() {
        let m = genDiagStreamMasker([])
        let u = Buffer.from('中文 password=甲乙丙\n', 'utf8')
        let o = ''
        for (let i = 0; i < u.length; i++) {
            o += m.push(u.subarray(i, i + 1))
        }
        assert.strict.deepStrictEqual(o, '中文 password=***\n')
        let ab = new TextEncoder().encode('ab\n').buffer
        assert.strict.deepStrictEqual(m.push(ab), 'ab\n')
        assert.strict.deepStrictEqual(m.push(12) + m.push(true) + m.push(3n) + m.push(null) + m.push(undefined) + m.push(new String('s')) + m.push('\n'), '12true3s\n') // eslint-disable-line no-new-wrappers
        let called = 0
        let obj = {
            toString: () => {
                called++; return 'leak'
            }
        }
        assert.strict.deepStrictEqual(m.push(obj) + m.push(Symbol('x')) + m.push(() => 1) + m.push('\n'), '*********\n')
        assert.strict.deepStrictEqual(called, 0)
        //不完整之位元組於flush補為U+FFFD
        m.push(Buffer.from([0xe4, 0xb8]))
        assert.strict.deepStrictEqual(m.flush(), '�')
        //二進位之後接字串: 先補完解碼器
        m.push(Buffer.from([0xe4]))
        assert.strict.deepStrictEqual(m.push('x\n'), '�x\n')
    })

    it(`S5/S8: a revoked Proxy chunk and a detectable Proxy chunk are replaced by *** without throwing or running traps`, function() {
        let m = genDiagStreamMasker([])
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        let traps = 0
        let p2 = new Proxy({}, {
            get: () => {
                traps++; return () => 'leak'
            },
            getPrototypeOf: () => {
                traps++; return null
            }
        })
        assert.strict.deepStrictEqual(m.push(proxy) + m.push(p2) + m.push('\n'), '******\n')
        assert.strict.deepStrictEqual(traps, 0)
    })

    it(`S6: secrets are snapshotted at creation; later mutation of the array does not change masking`, function() {
        let arr = ['SECRET-ONE-123']
        let m = genDiagStreamMasker(arr)
        arr.push('SECRET-TWO-456')
        arr[0] = 'other'
        assert.strict.deepStrictEqual(m.push('SECRET-ONE-123 SECRET-TWO-456\n'), '*** SECRET-TWO-456\n')
    })

    it(`S6: an unusable secrets list (detectable Proxy, accessor item, incomplete getDiagSecrets result) makes every segment *** (fail-closed)`, function() {
        let acc = ['a']
        Object.defineProperty(acc, 1, { get: () => 'x', enumerable: true })
        let bad = getDiagSecrets({ urls: new Proxy([], {}) })
        for (let s of [new Proxy(['k'], {}), acc, bad, 5, 'str']) {
            let m = genDiagStreamMasker(s)
            assert.strict.deepStrictEqual(m.push('line one\nline two\npart') + m.flush(), '*********')
        }
    })

    it(`S7: credPatterns false masks only registered secrets and opt.patterns (model output with password= examples kept)`, function() {
        let opt = { credPatterns: false, patterns: [{ re: /sk-ant-[A-Za-z0-9_-]{4,}/ }] }
        let text = `use password=demo and Bearer abc\nkey ${K} other sk-ant-zzzz-1\nhttp://u:p@h/\n`
        let want = byLine(['MYKEY-123456'], opt, text)
        assert.strict.deepStrictEqual(want, 'use password=demo and Bearer abc\nkey *** other ***\nhttp://u:p@h/\n')
        assert.strict.deepStrictEqual(badCuts(['MYKEY-123456'], opt, text, want, 5), [])
        //非false之值皆為預設(使用內建樣式)
        for (let v of ['false', 0, null, undefined, true]) {
            assert.strict.deepStrictEqual(run([], { credPatterns: v }, 'password=demo\n', []), 'password=***\n', String(v))
        }
        //存取器之credPatterns不執行
        let n = 0
        let o2 = {}
        Object.defineProperty(o2, 'credPatterns', {
            get: () => {
                n++; return false
            }
        })
        assert.strict.deepStrictEqual(run([], o2, 'password=demo\n', []), 'password=***\n')
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`S7: a pattern whose when() throws is treated as matched (same as maskDiagText)`, function() {
        let opt = {
            patterns: [{
                re: /ID-\d+/,
                when: () => {
                    throw new Error('x')
                }
            }]
        }
        assert.strict.deepStrictEqual(run([], opt, 'a ID-123 b\n', [4]), maskDiagText('a ID-123 b\n', [], opt))
        assert.strict.deepStrictEqual(run([], opt, 'a ID-123 b\n', [4]), 'a *** b\n')
    })

    it(`S8: flush resets state so the masker can be reused as a new stream`, function() {
        let m = genDiagStreamMasker([K])
        assert.strict.deepStrictEqual(m.push(K.slice(0, 10)), '')
        assert.strict.deepStrictEqual(m.flush(), K.slice(0, 10)) //未完成之秘密前綴於收尾時無從判定為秘密
        assert.strict.deepStrictEqual(m.push(`${K}\n`), '***\n')
    })

    it(`S8: random texts and random chunkings always give the same output, and lines up to 20000 equal maskDiagText (seeded)`, function() {
        let seed = 12345
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let parts = [K, 'password=', '"', ' ', '\n', 'Bearer ', 'token: ', 'abc', 'http://', 'u:p@h', '[', ']', '中', '😀', 'x'.repeat(300)]
        for (let t = 0; t < 60; t++) {
            let text = ''
            let n = 5 + Math.floor(rnd() * 60)
            for (let i = 0; i < n; i++) {
                text += parts[Math.floor(rnd() * parts.length)]
            }
            let want = byLine([K], undefined, text)
            for (let r = 0; r < 5; r++) {
                let cuts = []
                for (let c = 0; c < text.length; c += 1 + Math.floor(rnd() * 40)) {
                    cuts.push(c)
                }
                assert.strict.deepStrictEqual(run([K], undefined, text, cuts), want, `t=${t} r=${r}`)
            }
        }
    })

    it(`S8: many tiny chunks of a long line are processed in amortized linear time (200000 one-character pushes complete)`, function() {
        let m = genDiagStreamMasker([K])
        let o = ''
        let s = `${'y'.repeat(99990)} ${K} ${'z'.repeat(99990)}`
        for (let i = 0; i < s.length; i++) {
            o += m.push(s[i])
        }
        o += m.flush()
        assert.strict.deepStrictEqual(o, `${'y'.repeat(99990)} *** ${'z'.repeat(99990)}`)
    })

})
