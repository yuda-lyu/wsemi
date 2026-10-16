import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileHash from '../src/fsGetFileHash.mjs'
import { itFsHashFail, itOptUnreadable, rejected, resolved, RULE } from './tools/fsHashFailRunner.mjs'


describe(`fsGetFileHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFileHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let h1 = await fsGetFileHash(fp)
        // console.log('fsGetFileHash(sha512)', h1)
        ms.push({ 'fsGetFileHash(sha512)': h1 })

        let h2 = await fsGetFileHash(fp, { type: 'sha256' })
        // console.log('fsGetFileHash(sha256)', h2)
        ms.push({ 'fsGetFileHash(sha256)': h2 })

        let h3 = await fsGetFileHash(fp, { type: 'xxhash64' })
        // console.log('fsGetFileHash(xxhash64)', h3)
        ms.push({ 'fsGetFileHash(xxhash64)': h3 })

        let h4 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
        // console.log('fsGetFileHash(xxhash64,chunkSize=16mb)', h4)
        ms.push({ 'fsGetFileHash(xxhash64,chunkSize=16mb)': h4 })

        let h5 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
        // console.log('fsGetFileHash(xxhash64,chunkSize=4mb)', h5)
        ms.push({ 'fsGetFileHash(xxhash64,chunkSize=4mb)': h5 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
    // fsGetFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
    // fsGetFileHash(xxhash64) feba48465b833ca1
    // fsGetFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
    // fsGetFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
    let ms = [
        {
            'fsGetFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
        },
        {
            'fsGetFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
        },
        { 'fsGetFileHash(xxhash64)': 'feba48465b833ca1' },
        { 'fsGetFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
        { 'fsGetFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsGetFileHash 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除(拒讀ACL先以icacls解除)
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號; want以子行程回報之事實組出期望; rule為期望所對應之規則句
    this.timeout(60000)

    itFsHashFail([
        { id: 'FH01', when: '真實fs: 路徑不存在', want: (o) => rejected(`fp[${o.fp}] is not a file`), rule: RULE.r1pre },
        { id: 'FH02', when: '真實fs: 路徑不存在, type=xxhash64', want: (o) => rejected(`fp[${o.fp}] is not a file`), rule: RULE.r1pre },
        { id: 'FH03', when: '真實fs: ACL拒讀, type=xxhash64', want: (o) => rejected(o.errStr), rule: RULE.r1err, win: true },
        { id: 'FH04', when: '真實fs: ACL拒讀, type預設sha512', want: (o) => rejected(o.errStr), rule: RULE.r1err, win: true },
        { id: 'FH05', when: 'Core注入fs: lstatSync拋Error(非async函數)', want: () => rejected('Error: lstat boom'), rule: RULE.r2 },
        //FH06(外審 opus F21): type=xxhash64分支之chunkSize=2^31(原懸置)與預設chunkSize之雜湊相同, 且createReadStream所收之highWaterMark為預設值64*1024*1024(否則期望值即不成立)
        { id: 'FH06', when: '輸入: type=xxhash64, chunkSize=2^31', want: (o) => resolved(o.hwm.length === 1 && o.hwm[0] === 64 * 1024 * 1024 ? o.hashDefault : `<highWaterMark應為預設值67108864, 實為${JSON.stringify(o.hwm)}>`), rule: RULE.r4aMax },
    ])

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt)
    itOptUnreadable(['fsGetFileHash', 'fsGetFileHashCore'])

})
