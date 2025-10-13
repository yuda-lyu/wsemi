import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'


describe(`fsGetFolderBasicHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFolderBasicHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fp

        fp = `${fdt}/abc/t1.txt`
        fsWriteText(fp, 'abc-t1')

        fp = `${fdt}/def/xyz/t2.txt`
        fsWriteText(fp, 'def-xyz-t2')

        let h1 = await fsGetFolderBasicHash(fdt)
        console.log('fsGetFolderBasicHash(md5)', h1)
        ms.push({ 'fsGetFolderBasicHash(md5)': h1 })

        let h2 = await fsGetFolderBasicHash(fdt, { type: 'sha256' })
        console.log('fsGetFolderBasicHash(sha256)', h2)
        ms.push({ 'fsGetFolderBasicHash(sha256)': h2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFolderBasicHash(md5) 45d11ad27b97bc3bb664260189ec0dcc|ac8cf7366d7adf0743d6561133d404b3
    // fsGetFolderBasicHash(sha256) 2cc76b7a715d35c3b8f2d2585b144907883ea9167d230afbee4c4a5ab0634152|bf2fa34249f4dbbd72b3a754b56f4beb9b8dede8b64e21ce8b83696e6febb8bb
    // ms [
    //   {
    //     'fsGetFolderBasicHash(md5)': '45d11ad27b97bc3bb664260189ec0dcc|ac8cf7366d7adf0743d6561133d404b3'
    //   },
    //   {
    //     'fsGetFolderBasicHash(sha256)': '2cc76b7a715d35c3b8f2d2585b144907883ea9167d230afbee4c4a5ab0634152|bf2fa34249f4dbbd72b3a754b56f4beb9b8dede8b64e21ce8b83696e6febb8bb'
    //   }
    // ]
    let ms = [
        {
            'fsGetFolderBasicHash(md5)': '45d11ad27b97bc3bb664260189ec0dcc|ac8cf7366d7adf0743d6561133d404b3'
        },
        {
            'fsGetFolderBasicHash(sha256)': '2cc76b7a715d35c3b8f2d2585b144907883ea9167d230afbee4c4a5ab0634152|bf2fa34249f4dbbd72b3a754b56f4beb9b8dede8b64e21ce8b83696e6febb8bb'
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
