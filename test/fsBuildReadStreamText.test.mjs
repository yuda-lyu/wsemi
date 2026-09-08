import fs from 'fs'
import assert from 'assert'
import genPm from '../src/genPm.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsBuildReadStreamText from '../src/fsBuildReadStreamText.mjs'


describe(`fsBuildReadStreamText`, function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsBuildReadStreamText'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/${fn}`

        fs.writeFileSync(fp, `abc
測試中文
def123xyz
`, 'utf8')

        let ev = fsBuildReadStreamText(fp)

        ev.on('create', () => { //create於回傳ev後延後派發, 呼叫端可監聽且必先於line與close
            ms.push({ 'create': '' })
        })

        ev.on('line', (line) => {
            // console.log('line', line)
            ms.push({ line })
        })

        let pm = genPm()
        ev.on('close', () => {
            // console.log('close')
            pm.resolve()
            ms.push({ 'close': '' })
        })
        await pm

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
        { line: 'abc' },
        { line: '測試中文' },
        { line: 'def123xyz' },
        { close: '' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should emit error { fun: 'stream' } then close (not crash) when file disappears before stream opens`, async function() {
        let fdt = './_test_fsBuildReadStreamText_err'
        fsCreateFolder(fdt)
        let fp = `${fdt}/t.txt`
        fs.writeFileSync(fp, 'a\nb\n', 'utf8')
        let got = []
        let ev = fsBuildReadStreamText(fp) //fsIsFile通過
        ev.on('create', () => {
            got.push('create')
        })
        ev.on('error', (e) => {
            got.push(`error:${e.fun}:${e.msg && e.msg.code}`)
        })
        ev.on('line', () => {
            got.push('line')
        })
        let pm = genPm()
        ev.on('close', () => {
            got.push('close')
            pm.resolve()
        })
        fs.unlinkSync(fp) //stream之open為非同步, 此刻刪檔使open得ENOENT
        await pm
        fsDeleteFolder(fdt)
        assert.strict.deepStrictEqual(got, ['create', 'error:stream:ENOENT', 'close'])
    })

})
