import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileXxHash from '../src/fsGetFileXxHash.mjs'
import fsGetFileXxHashCore from '../src/fsGetFileXxHashCore.mjs'
import { thrower, thrownCases, mkFsReadStub } from './tools/codecThrown.mjs'
import { settleShown } from './tools/caseKit.mjs'
import { itFsHashFail, itNoHandler, itOptUnreadable, rejected, resolved, RULE } from './tools/fsHashFailRunner.mjs'


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


describe(`fsGetFileXxHash 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除(拒讀ACL先以icacls解除)
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號(XH16、XH17為規則4a之補列); want以子行程回報之事實組出期望; rule為期望所對應之規則句
    this.timeout(60000)

    //hwmDefault, 子行程攔得之highWaterMark恰為一次且為預設值64*1024*1024時回預設chunkSize之雜湊, 否則回說明字串(使斷言不成立)
    let hwmDefault = (o) => (o.hwm.length === 1 && o.hwm[0] === 64 * 1024 * 1024 ? o.hashDefault : `<highWaterMark應為預設值67108864, 實為${JSON.stringify(o.hwm)}>`)

    itFsHashFail([
        { id: 'XH01', when: '真實fs: 路徑不存在', want: () => rejected('fp is not a file'), rule: RULE.r1pre },
        { id: 'XH02', when: '真實fs: 路徑為資料夾', want: () => rejected('fp is not a file'), rule: RULE.r1pre },
        { id: 'XH03', when: '真實fs: 檔案ACL拒讀(串流error EPERM)', want: (o) => rejected(o.errStr), rule: RULE.r1err, win: true },
        { id: 'XH04', when: '注入fs: createReadStream回真實ReadStream(開檔ENOENT)', want: (o) => rejected(o.errStr), rule: RULE.r1err },
        { id: 'XH05', when: '注入fs: 串流以null出錯', want: () => rejected('null'), rule: RULE.r1any },
        { id: 'XH06', when: '注入fs: 串流以undefined出錯', want: () => rejected('undefined'), rule: RULE.r1any },
        { id: 'XH07', when: '注入fs: 串流以字串str出錯', want: () => rejected('str'), rule: RULE.r1any },
        { id: 'XH15', when: '注入fs: 串流以Error(boom)出錯', want: () => rejected('Error: boom'), rule: RULE.r1err },
        { id: 'XH08', when: '注入fs: createReadStream拋Error(boom)', want: () => rejected('Error: boom'), rule: RULE.r1err },
        { id: 'XH09', when: 'Core注入fs: lstatSync拋Error', want: () => rejected('Error: lstat boom'), rule: RULE.r2 },
        { id: 'XH10', when: '對外函數+opt.fs: lstatSync拋null', want: () => rejected('null'), rule: RULE.r2 },
        { id: 'XH11', when: '注入fs: 串流data事件給null(data監聽器內hasher.update拋錯)', want: (o) => rejected(o.errStr), rule: RULE.r3 },
        //XH13、XH14、XH16、XH17: 與同一檔案以預設chunkSize計算之雜湊相同(XH14另須不為空內容之雜湊, 否則期望值即不成立)
        { id: 'XH13', when: '輸入: chunkSize=-1', want: (o) => resolved(o.hashDefault), rule: RULE.r4a },
        { id: 'XH14', when: '輸入: chunkSize=0', want: (o) => resolved(o.hashDefault !== o.hashEmpty ? o.hashDefault : '<預設chunkSize之雜湊不應為空內容之雜湊>'), rule: RULE.r4a },
        { id: 'XH16', when: '輸入: chunkSize=0.5(非整數)', want: (o) => resolved(o.hashDefault), rule: RULE.r4a },
        { id: 'XH17', when: '輸入: chunkSize為字串abc(非數字)', want: (o) => resolved(o.hashDefault), rule: RULE.r4a },
        //XH18~XH20(外審 opus F21): 與預設chunkSize之雜湊相同, 且createReadStream所收之highWaterMark為預設值64*1024*1024(hwmDefault, 否則期望值即不成立)
        { id: 'XH18', when: '輸入: chunkSize=2^31(原懸置)', want: (o) => resolved(hwmDefault(o)), rule: RULE.r4aMax },
        { id: 'XH19', when: '輸入: chunkSize=2^32(原得空內容之雜湊)', want: (o) => resolved(hwmDefault(o)), rule: RULE.r4aMax },
        { id: 'XH20', when: '輸入: chunkSize=2^53(原RangeError)', want: (o) => resolved(hwmDefault(o)), rule: RULE.r4aMax },
    ])

    //監聽器內注入物拋錯, 無處理器時須不崩潰
    itNoHandler(['XH11'])

    //XH12: 已知限制(R-FS-REJECT-01 已知限制, 不修): 注入之串流以非Buffer之data(如數字123)餵入時仍得空雜湊, 僅注入可觸發
    it(`XH12 注入fs: 串流data給數字123後end [R-FS-REJECT-01 已知限制, 不修]`)

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt)
    itOptUnreadable(['fsGetFileXxHash', 'fsGetFileXxHashCore'])

})
