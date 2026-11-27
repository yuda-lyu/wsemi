import assert from 'assert'
import path from 'path'
import { pathToFileURL } from 'url'


//排程第678項: 遮罩器之已知秘密內建其「兩層」JSON跳脫形JSON.stringify(JSON.stringify(秘密).slice(1, -1)).slice(1, -1)
//  (JSON字串內再嵌JSON, 如派工之stream-json夾帶工具結果: 內層JSON文字為外層JSON之字串值)
//  規格來源: maskDiagText之JSDoc①(各秘密內建其一層與兩層JSON跳脫形)、genDiagStreamMasker之JSDoc(secrets同maskDiagText)與主控裁定「變體只增不減, 既有變體之比對結果不變」
//  評估(變體數、比對器建立與遮罩時間、誤遮風險、必要性)與結論見sgud/rule/rulebook_diag_ext.md 規則23與報告
//  秘密各值逐筆相異(含引號、反斜線、換行、跳格、控制字元、非ASCII與孤立代理碼元), 對照組為無特殊字元者(兩層跳脫形即原樣)
//  修前紅: 環境變數WSEMI_DIAG678_SRC指向修前之src資料夾時, 改載該處之模組


let SRC = process.env.WSEMI_DIAG678_SRC ? path.resolve(process.env.WSEMI_DIAG678_SRC) : path.resolve(import.meta.dirname, '..', 'src')
let load = async (n) => await import(pathToFileURL(path.join(SRC, `${n}.mjs`)).href)
let maskDiagText = (await load('maskDiagText')).default
let maskDiagCopy = (await load('maskDiagCopy')).default
let maskDiagErr = (await load('maskDiagErr')).default
let genDiagStreamMasker = (await load('genDiagStreamMasker')).default
let getDiag = (await load('getDiag')).default
let getDiagSecrets = (await load('getDiagSecrets')).default
let { getMatcher } = await load('_diagKit')

let SPECIAL = [
    'qk"Zy81quote',
    'qk\\Zy82slash',
    'qk\nZy83newline',
    'qk\tZy84tab',
    'qk\x01Zy85ctrl',
    'qk"\\\nZy86mixed',
    '金鑰"Zy87cjk',
    `qk${String.fromCharCode(0xD800)}Zy89lone`, //孤立代理碼元: JSON.stringify轉為6字元之跳脫
]
let esc = (s) => JSON.stringify(s).slice(1, -1)

//leaks, 輸出含秘密之原樣、一層或兩層跳脫形之任一者
let leaks = (out, s) => out.includes(s) || out.includes(esc(s)) || out.includes(esc(esc(s)))

//jsonText2, 派工之stream-json夾帶工具結果之形狀: 內層JSON文字(秘密於其中為一層跳脫形)為外層JSON之字串值(秘密於其中為兩層跳脫形)
//鍵名不得為憑證鍵名(如apiKey、token、password): 否則內建之憑證鍵值樣式即遮掉其值, 本項之變體無從鑑別(修前亦綠)
let jsonText2 = (s) => `log ${JSON.stringify({ type: 'tool_result', content: JSON.stringify({ memo: s, n: 1 }) })} end`


describe(`排程第678項: 遮罩器內建秘密之兩層JSON跳脫形`, function() {

    it(`前提: each special secret appears in the nested JSON text only in the two-layer escaped form (neither the raw form nor the one-layer form is present, otherwise they would already be masked)`, function() {
        for (let s of SPECIAL) {
            let t = jsonText2(s)
            assert.ok(esc(esc(s)) !== esc(s) && esc(s) !== s, JSON.stringify(s))
            assert.ok(!t.includes(s) && !t.includes(esc(s)) && t.includes(esc(esc(s))), JSON.stringify(s))
        }
    })

    it(`maskDiagText should mask the two-layer escaped form of a secret given as a plain string list`, function() {
        for (let s of SPECIAL) {
            let out = maskDiagText(jsonText2(s), [s])
            assert.ok(!leaks(out, s), JSON.stringify(s))
            assert.ok(out.includes('***') && out.startsWith('log {"type":"tool_result","content":"{\\"memo\\":\\"***') && out.endsWith(',\\"n\\":1}"} end'), JSON.stringify(s))
        }
    })

    it(`maskDiagText should still mask the raw and the one-layer forms, and a getDiagSecrets list should mask all three forms`, function() {
        for (let s of SPECIAL) {
            assert.strict.deepStrictEqual(maskDiagText(`a ${s} b ${esc(s)} c ${esc(esc(s))} d`, [s]), 'a *** b *** c *** d', JSON.stringify(s))
            let viaSrc = maskDiagText(jsonText2(s), getDiagSecrets({ values: [s] }))
            assert.ok(!leaks(viaSrc, s) && viaSrc.includes('***'), JSON.stringify(s))
        }
    })

    it(`genDiagStreamMasker should mask the two-layer escaped form line by line, the same as maskDiagText per line, regardless of chunking`, function() {
        for (let s of SPECIAL) {
            let text = `${jsonText2(s)}\n${jsonText2(s)}\n`
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
            assert.strict.deepStrictEqual(out1, `${maskDiagText(jsonText2(s), [s])}\n`.repeat(2), JSON.stringify(s))
        }
    })

    it(`maskDiagCopy, maskDiagErr and getDiag().mask should mask the two-layer escaped form`, function() {
        for (let s of SPECIAL) {
            let c = maskDiagCopy({ body: jsonText2(s) }, [s])
            assert.ok(!leaks(c.body, s), `copy ${JSON.stringify(s)}`)
            let e = maskDiagErr(new Error(jsonText2(s)), [s])
            assert.ok(!leaks(String(e.message), s), `err ${JSON.stringify(s)}`)
            let d = getDiag({}, { secrets: [s] })
            assert.ok(!leaks(String(d.mask(jsonText2(s))), s), `diag.mask ${JSON.stringify(s)}`)
        }
    })

    it(`a secret without characters that JSON escapes should give exactly the former result and the same variant list (its escaped forms are itself)`, function() {
        let s = 'plainZy88secret'
        assert.strict.deepStrictEqual(esc(esc(s)), s)
        assert.strict.deepStrictEqual(getMatcher([s]).ss, [s])
        assert.strict.deepStrictEqual(maskDiagText(jsonText2(s), [s]), 'log {"type":"tool_result","content":"{\\"memo\\":\\"***\\",\\"n\\":1}"} end')
        assert.strict.deepStrictEqual(maskDiagText('x plainZy88secret y plainZy88secre z', [s]), 'x *** y plainZy88secre z')
    })

    it(`the variant list of a special secret should be exactly the raw, one-layer and two-layer forms (longest first, no third layer for a plain string list)`, function() {
        for (let s of SPECIAL) {
            let want = [...new Set([s, esc(s), esc(esc(s))])].sort((a, b) => b.length - a.length)
            assert.strict.deepStrictEqual(getMatcher([s]).ss, want, JSON.stringify(s))
            assert.strict.deepStrictEqual(want.length, 3, JSON.stringify(s))
        }
    })

    it(`only adds: text that contains none of the forms keeps every other part unchanged (quotes and backslashes of other content are not over-masked)`, function() {
        let s = 'qk"Zy81quote'
        assert.strict.deepStrictEqual(maskDiagText('nothing here qk Zy81quote', [s]), 'nothing here qk Zy81quote')
        let other = '{\\"a\\":\\"b\\"} C:\\\\dir\\\\x \\\\\\"q\\\\\\" "plain"'
        assert.strict.deepStrictEqual(maskDiagText(other, [s]), other)
        //兩層跳脫形為一層跳脫形之超集時(含更多反斜線), 遮罩區間涵蓋整段兩層形(不殘留尾段)
        let s2 = 'qk\\Zy82slash'
        assert.strict.deepStrictEqual(maskDiagText(`a ${esc(esc(s2))} b`, [s2]), 'a *** b')
    })

})
