import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFolderBasicHash from '../src/fsGetFolderBasicHash.mjs'
import { itFsHashFail, itOptUnreadable, rejected, RULE } from './tools/fsHashFailRunner.mjs'


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


describe(`fsGetFolderBasicHash 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除(拒讀ACL先以icacls解除)
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號(GB08為規則2之補列); want以子行程回報之事實組出期望; rule為期望所對應之規則句
    this.timeout(60000)

    itFsHashFail([
        { id: 'GB01', when: '真實fs: 資料夾不存在', want: (o) => rejected(`fd[${o.fd}] is not a folder`), rule: RULE.r1pre },
        { id: 'GB02', when: '真實fs: 路徑為檔案', want: (o) => rejected(`fd[${o.fd}] is not a folder`), rule: RULE.r1pre },
        { id: 'GB03', when: '真實fs: 夾內含懸空junction', want: (o) => rejected(`fp[${o.fpDangling}] is not a file`), rule: RULE.r1pre },
        { id: 'GB04', when: '真實crypto: type不支援', want: (o) => rejected(o.errStr), rule: RULE.r1err },
        { id: 'GB05', when: '真實fs: 子資料夾ACL拒列(readdirSync EPERM)', want: (o) => rejected(o.errStr), rule: RULE.r2tree, win: true },
        { id: 'GB06', when: 'Core注入fs: readdirSync拋null', want: () => rejected('null'), rule: RULE.r2tree },
        { id: 'GB07', when: '真實fs: 夾內檔案ACL拒讀', want: (o) => rejected(o.errStr), rule: RULE.r1err, win: true },
        { id: 'GB08', when: '對外函數+opt.fs: lstatSync拋null', want: () => rejected('null'), rule: RULE.r2 },
    ])

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt)
    itOptUnreadable(['fsGetFolderBasicHash', 'fsGetFolderBasicHashCore'])

})
