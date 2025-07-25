import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsBuildWriteStreamText from '../src/fsBuildWriteStreamText.mjs'


describe(`fsBuildWriteStreamText`, function() {

    let test = async() => {

        let ms = []

        let fdt = './_test_fsBuildWriteStreamText'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/${fn}`

        let bdw = fsBuildWriteStreamText()

        let pm = bdw.create(fp)
        ms.push({ 'create': '' })

        bdw.write('abc')
        ms.push({ 'write': 'abc' })
        bdw.write('中文')
        ms.push({ 'write': '中文' })
        bdw.end()

        await pm

        let c = fs.readFileSync(fp, 'utf8')
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    // ms [
    //   { create: '' },
    //   { write: 'abc' },
    //   { write: '中文' },
    //   { readFileSync: 'abc\n中文\n' }
    // ]
    let ms = [
        { create: '' },
        { write: 'abc' },
        { write: '中文' },
        { readFileSync: 'abc\n中文\n' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
