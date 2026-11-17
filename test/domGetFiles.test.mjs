import assert from 'assert'
import domGetFiles from '../src/domGetFiles.mjs'


//ws492e: N-B(主控定): domGetFiles超過大小上限時之errs訊息原為`file size[${sizeMb}]mb > ${sizeMbLimit}mb`(回顯檔案大小與上限值, V20②: 比較類錯誤寫規則不寫數值), 改為V19固定字串`invalid files[索引]: must be <= sizeMbLimit`(以檔案索引定位); 檢測與預設(sizeMbLimit之isenum、0與負數用預設1000)不變, 另見optValG7dom.test.mjs
//  規格: dspec〈輸入參數之檢測機制〉V19、V20
//  測試作法: 以帶size之假檔案物件驅動(純函數, 不需DOM)
describe(`domGetFiles`, function() {

    let MB = 1024 * 1024
    let mkFile = (name, mb) => ({ name, size: mb * MB })

    //spec: 未超過上限者不產生errs; 回傳{ files, errs }, files含全部檔案(含超過者)
    it(`should return all files and no errs when every file is within the limit`, function() {
        let fs = [mkFile('a', 1), mkFile('b', 2)]
        let r = domGetFiles({ files: fs }, 2)
        assert.strict.deepStrictEqual(r.files, fs)
        assert.strict.deepStrictEqual(r.errs, {})
    })

    //spec(V19、V20): 超過上限者之errs[索引]為固定字串, 不含檔案大小與上限值, 只列出超過者之索引
    it(`should put the fixed message of V19 in errs[index] for the files over the limit, without sizes or the limit`, function() {
        let fs = [mkFile('a', 3), mkFile('b', 1), mkFile('c', 5)]
        let r = domGetFiles({ files: fs }, 2)
        assert.strict.deepStrictEqual(r.files, fs)
        assert.strict.deepStrictEqual(r.errs, {
            0: 'invalid files[0]: must be <= sizeMbLimit',
            2: 'invalid files[2]: must be <= sizeMbLimit',
        })
        for (let m of Object.values(r.errs)) {
            assert.strict.deepStrictEqual(/\d\s*mb/i.test(m), false)
            assert.strict.deepStrictEqual(/[35]/.test(m.replace(/files\[\d\]/, '')), false)
        }
    })

    it(`should not echo the sizeMbLimit value even when it is given as a numeric string`, function() {
        let r = domGetFiles({ files: [mkFile('a', 9)] }, '1.5')
        assert.strict.deepStrictEqual(r.errs, { 0: 'invalid files[0]: must be <= sizeMbLimit' })
    })

    //spec: 上限預設1000mb(0、負數與非預期視為未給)
    it(`should use the default limit 1000mb`, function() {
        assert.strict.deepStrictEqual(domGetFiles({ files: [mkFile('a', 1000)] }).errs, {})
        assert.strict.deepStrictEqual(domGetFiles({ files: [mkFile('a', 1001)] }).errs, { 0: 'invalid files[0]: must be <= sizeMbLimit' })
        assert.strict.deepStrictEqual(domGetFiles({ files: [mkFile('a', 1001)] }, 0).errs, { 0: 'invalid files[0]: must be <= sizeMbLimit' })
        assert.strict.deepStrictEqual(domGetFiles({ files: [mkFile('a', 1001)] }, -5).errs, { 0: 'invalid files[0]: must be <= sizeMbLimit' })
    })

    //spec: ele無效或無files時回空結構(既有行為不變)
    for (let [label, v] of [['undefined', undefined], ['null', null], ['{}', {}], [`'x'`, 'x'], ['5', 5]]) {
        it(`should return empty files and errs when ele is ${label}`, function() {
            assert.strict.deepStrictEqual(domGetFiles(v), { files: [], errs: {} })
        })
    }

})
