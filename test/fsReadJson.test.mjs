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

})
