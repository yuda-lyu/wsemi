import assert from 'assert'
import maskDiagText from '../src/maskDiagText.mjs'
import maskDiagCopy from '../src/maskDiagCopy.mjs'
import maskDiagErr from '../src/maskDiagErr.mjs'
import genDiagStreamMasker from '../src/genDiagStreamMasker.mjs'
import getDiag from '../src/getDiag.mjs'
import getDiagSecrets from '../src/getDiagSecrets.mjs'


//排程第650項: 遮罩器之已知秘密內建其JSON跳脫形(JSON.stringify(秘密).slice(1, -1))
//  規格來源: maskDiagText之JSDoc①「各秘密另內建其JSON跳脫形…使含引號、反斜線、換行之秘密於JSON文字內仍被遮」、genDiagStreamMasker之JSDoc(secrets同maskDiagText)
//  與主控裁定「變體只增不減, 既有變體之比對結果不變」
//  秘密各值逐筆相異(含引號、反斜線、換行、跳格、控制字元、非ASCII與代理對), 對照組為無特殊字元者(JSON跳脫形即原樣)


let SPECIAL = [
    'qk"Zx81quote',
    'qk\\Zx82slash',
    'qk\nZx83newline',
    'qk\tZx84tab',
    'qk\x01Zx85ctrl',
    'qk"\\\nZx86mixed',
    '金鑰"Zx87cjk',
    `qk${String.fromCharCode(0xD800)}Zx89lone`, //孤立代理碼元: JSON.stringify轉為6字元之跳脫(獨立複審wsr1補)
]
let esc = (s) => JSON.stringify(s).slice(1, -1)

//leaks, 輸出含秘密之原樣或其JSON跳脫形之任一者
let leaks = (out, s) => out.includes(s) || out.includes(esc(s))

//jsonText, 以JSON紀錄攜帶秘密之文字(秘密於其中只以跳脫形出現)
//鍵名不得為憑證鍵名(如apiKey、token、password): 否則內建之憑證鍵值樣式即遮掉其值, 本項之變體無從鑑別(修前亦綠)
let jsonText = (s) => `log ${JSON.stringify({ memo: s, n: 1 })} end`


describe(`排程第650項: 遮罩器內建秘密之JSON跳脫形`, function() {

    it(`前提: each special secret appears in its JSON text only in the escaped form (otherwise the raw form would already be masked)`, function() {
        for (let s of SPECIAL) {
            let t = jsonText(s)
            assert.ok(!t.includes(s) && t.includes(esc(s)) && esc(s) !== s, JSON.stringify(s))
        }
    })

    it(`maskDiagText should mask the JSON-escaped form of a secret given as a plain string list`, function() {
        for (let s of SPECIAL) {
            let out = maskDiagText(jsonText(s), [s])
            assert.ok(!leaks(out, s), JSON.stringify(s))
            assert.ok(out.includes('***') && out.startsWith('log {') && out.endsWith(',"n":1} end'), JSON.stringify(s))
        }
    })

    it(`maskDiagText should still mask the raw form, and a getDiagSecrets list (which already carried the escaped form) should still mask it`, function() {
        for (let s of SPECIAL) {
            assert.strict.deepStrictEqual(maskDiagText(`a ${s} b`, [s]), 'a *** b', JSON.stringify(s))
            let viaSrc = maskDiagText(jsonText(s), getDiagSecrets({ values: [s] }))
            assert.ok(!leaks(viaSrc, s) && viaSrc.includes('***'), JSON.stringify(s))
        }
    })

    it(`genDiagStreamMasker should mask the JSON-escaped form line by line, the same as maskDiagText per line, regardless of chunking`, function() {
        for (let s of SPECIAL) {
            let text = `${jsonText(s)}\n${jsonText(s)}\n`
            let m1 = genDiagStreamMasker([s])
            let out1 = m1.push(text) + m1.flush()
            let m2 = genDiagStreamMasker([s])
            let out2 = ''
            for (let ch of text) {
                out2 += m2.push(ch)
            }
            out2 += m2.flush()
            assert.ok(!leaks(out1, s) && !leaks(out2, s), JSON.stringify(s))
            assert.strict.deepStrictEqual(out1, out2, JSON.stringify(s))
            assert.strict.deepStrictEqual(out1, `${maskDiagText(jsonText(s), [s])}\n`.repeat(2), JSON.stringify(s))
        }
    })

    it(`maskDiagCopy, maskDiagErr and getDiag().mask should mask the JSON-escaped form`, function() {
        for (let s of SPECIAL) {
            let c = maskDiagCopy({ body: jsonText(s) }, [s])
            assert.ok(!leaks(c.body, s), `copy ${JSON.stringify(s)}`)
            let e = maskDiagErr(new Error(jsonText(s)), [s])
            assert.ok(!leaks(String(e.message), s), `err ${JSON.stringify(s)}`)
            let d = getDiag({}, { secrets: [s] })
            assert.ok(!leaks(String(d.mask(jsonText(s))), s), `diag.mask ${JSON.stringify(s)}`)
        }
    })

    it(`a secret without characters that JSON escapes should give exactly the former result (its escaped form is itself)`, function() {
        let s = 'plainZx88secret'
        assert.strict.deepStrictEqual(esc(s), s)
        assert.strict.deepStrictEqual(maskDiagText(jsonText(s), [s]), 'log {"memo":"***","n":1} end')
        assert.strict.deepStrictEqual(maskDiagText('x plainZx88secret y plainZx88secre z', [s]), 'x *** y plainZx88secre z')
    })

    it(`only adds: text that contains neither form keeps every other part unchanged, and an escaped form inside a longer escape sequence is masked as a whole region`, function() {
        let s = 'qk"Zx81quote'
        assert.strict.deepStrictEqual(maskDiagText('nothing here qk Zx81quote', [s]), 'nothing here qk Zx81quote')
        //JSON跳脫形為原樣之超集時(含反斜線), 遮罩區間不小於原樣之命中
        let s2 = 'qk\\Zx82slash'
        assert.strict.deepStrictEqual(maskDiagText(`a ${s2} b ${esc(s2)} c`, [s2]), 'a *** b *** c')
    })

})
