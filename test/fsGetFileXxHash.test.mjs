import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileXxHash from '../src/fsGetFileXxHash.mjs'
import fsGetFileXxHashCore from '../src/fsGetFileXxHashCore.mjs'
import { thrower, thrownCases, mkFsReadStub } from './tools/codecThrown.mjs'
import { settleShown } from './tools/caseKit.mjs'


describe(`fsGetFileXxHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFileXxHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let h1 = await fsGetFileXxHash(fp)
        // console.log('fsGetFileXxHash(64mb)', h1)
        ms.push({ 'fsGetFileXxHash(64mb)': h1 })

        let h2 = await fsGetFileXxHash(fp, { chunkSize: 16 * 1024 * 1024 })
        // console.log('fsGetFileXxHash(16mb)', h2)
        ms.push({ 'fsGetFileXxHash(16mb)': h2 })

        let h3 = await fsGetFileXxHash(fp, { chunkSize: 4 * 1024 * 1024 })
        // console.log('fsGetFileXxHash(4mb)', h3)
        ms.push({ 'fsGetFileXxHash(4mb)': h3 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFileXxHash(64mb) feba48465b833ca1
    // fsGetFileXxHash(16mb) feba48465b833ca1
    // fsGetFileXxHash(4mb) feba48465b833ca1
    let ms = [
        { 'fsGetFileXxHash(64mb)': 'feba48465b833ca1' },
        { 'fsGetFileXxHash(16mb)': 'feba48465b833ca1' },
        { 'fsGetFileXxHash(4mb)': 'feba48465b833ca1' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsGetFileXxHashCore 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //載入wasm與settle逾時判定, 放寬逾時
    this.timeout(15000)

    //thrownCases(test/tools/codecThrown.mjs)為呼叫端(注入之fs)可拋出之各種值, msg為_errToStr應得之字串
    //修正前async函數之catch內err.toString()遇其任一皆再拋TypeError, 使回傳之Promise以該TypeError reject(而非以錯誤訊息字串reject)

    //fs替身(mkFsReadStub): 僅使fsIsFileCore之前置檢查通過, createReadStream(try內才呼叫)由各案注入; settleShown: 5秒內須settle, 結果值經showValue(非字串帶型別前綴)

    for (let c of thrownCases) {
        it(`should reject with '${c.msg}' when fs.createReadStream throws ${c.name} [R-CODEC-ERR-01之2]`, async function() {
            let r = await settleShown(fsGetFileXxHashCore('x.bin', { fs: mkFsReadStub(thrower(c.mk())) }))
            assert.strict.deepStrictEqual(r, { s: 'reject', v: c.msg })
        })
    }

    it(`(守門) should reject with 'Error: boom' (same as err.toString()) when fs.createReadStream throws an Error [R-CODEC-ERR-01之2]`, async function() {
        let r = await settleShown(fsGetFileXxHashCore('x.bin', { fs: mkFsReadStub(thrower(new Error('boom'))) }))
        assert.strict.deepStrictEqual(r, { s: 'reject', v: 'Error: boom' })
    })

})
