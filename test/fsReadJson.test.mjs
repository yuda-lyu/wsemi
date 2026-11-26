import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsReadJson from '../src/fsReadJson.mjs'


describe(`fsReadJson`, function() {
    let test = () => {

        let ms = []

        let fdt = './_test_fsReadJson'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.json'
        let fp = `${fdt}/${fn}`

        fsWriteText(fp, JSON.stringify({ str: '測試中文', val: 123.45, int: 5 }))

        let r = fsReadJson(fp)
        // console.log('fsReadJson', r)
        ms.push({ 'fsReadJson': JSON.stringify(r) })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    test()
    // fsReadJson { success: { str: '測試中文', val: 123.45, int: 5 } }
    let ms = [{ fsReadJson: '{"success":{"str":"測試中文","val":123.45,"int":5}}' }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

    //第559項④(V20): JSON解析失敗回傳固定訊息之SyntaxError(不帶檔案內容片段); 原SyntaxError(位置、堆疊)之細節經opt之診斷出口(預設靜默)
    it(`should return the fixed SyntaxError without the file content, and hand the original detail only to opt.funLog (silent by default)`, async function() {
        let fdt = './test/_tmp/fsReadJson559'
        fsCreateFolder(fdt)
        try {
            let fp = `${fdt}/bad.json`
            fsWriteText(fp, '{"secret559": tru}')
            let rec = { log: [], warn: [], error: [] }
            let raw = { log: console.log, warn: console.warn, error: console.error }
            for (let k of Object.keys(rec)) {
                console[k] = (...a) => rec[k].push(a)
            }
            let calls = []
            let r1
            let r2
            try {
                r1 = fsReadJson(fp) //預設靜默
                r2 = fsReadJson(fp, { funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
            }
            finally {
                for (let k of Object.keys(rec)) {
                    console[k] = raw[k]
                }
            }
            for (let r of [r1, r2]) {
                assert.strict.deepStrictEqual([r.error instanceof SyntaxError, r.error.message], [true, 'invalid json: must be a valid JSON text'])
                assert.strict.deepStrictEqual(r.error.message.includes('secret559'), false)
            }
            assert.strict.deepStrictEqual([rec.log.length, rec.warn.length, rec.error.length], [0, 0, 0])
            assert.strict.deepStrictEqual(calls.length, 1)
            assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], ['[wsemi fsReadJson] can not parse json', { errType: 'SyntaxError' }])
        }
        finally {
            fsDeleteFolder(fdt)
        }
    })

})
