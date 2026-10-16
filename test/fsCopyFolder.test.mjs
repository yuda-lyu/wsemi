import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCopyFolder from '../src/fsCopyFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsCopyFolder`, function() {

    let testSyncEmpty = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)
        fsDeleteFolder(fpTar)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        let rc = fsCopyFolder(fpSrc, fpTar)
        ms.push({ 'sync-empty-copy-folder': rc })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'sync-empty-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'sync-empty-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'sync-empty-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'sync-empty-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testSync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        let rc = fsCopyFolder(fpSrc, fpTar)
        ms.push({ 'sync-copy-folder': rc })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'sync-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'sync-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'sync-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'sync-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testAsyncEmpty = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        await fsCopyFolder(fpSrc, fpTar, { useSync: false })
            .then((res) => {
                // console.log('res', res)
                ms.push({ 'async-empty-copy-folder': res })
            })
            .catch(() => {
                // console.log('err', err)
            })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'async-empty-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'async-empty-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'async-empty-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'async-empty-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testAsync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        await fsCopyFolder(fpSrc, fpTar, { useSync: false })
            .then((res) => {
                // console.log('res', res)
                ms.push({ 'async-copy-folder': res })
            })
            .catch(() => {
                // console.log('err', err)
            })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'async-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'async-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'async-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'async-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let test = async () => {
        let ms = []
        ms = [...ms, ...await testSyncEmpty()]
        ms = [...ms, ...await testSync()]
        ms = [...ms, ...await testAsyncEmpty()]
        ms = [...ms, ...await testAsync()]
        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    let ms = [
        {
            'sync-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'sync-empty-is-folder-1': true },
        { 'sync-empty-is-folder-2': true },
        { 'sync-empty-is-file-1': false },
        { 'sync-empty-is-file-2': false },
        { 'sync-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' } },
        { 'sync-is-folder-1': true },
        { 'sync-is-folder-2': true },
        { 'sync-is-file-1': true },
        { 'sync-is-file-2': true },
        {
            'async-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'async-empty-is-folder-1': true },
        { 'async-empty-is-folder-2': true },
        { 'async-empty-is-file-1': false },
        { 'async-empty-is-file-2': false },
        {
            'async-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'async-is-folder-1': true },
        { 'async-is-folder-2': true },
        { 'async-is-file-1': true },
        { 'async-is-file-2': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


//fsCopyFolder之失敗案例: 每案於獨立子行程執行(test/tools/fsFailRunner.mjs之CD*), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除(先解除ACL拒絕、銷毀攔得之串流)
//  結果值經執行器之dv描述: { s: 'resolve'|'return'|'reject'|'syncThrow'|'pending', k }, 結果物件為{ k: 'result', keys, error: { k, v } }; 故可分辨回傳結果物件、reject與同步拋出, 及error為null/undefined
//  串流之釋放以opt.fs代理攔得之實例判定(destroyed、fd已關閉): 開啟中之fd不是active resource, process.getActiveResourcesInfo()分辨不出, 僅附帶斷言無殘留之FSReqCallback
//  ev(r)、ev0: 子行程之未處理rejection與未捕捉例外及其期望(皆空); Windows專屬之真實觸發(ACL拒讀、拒列)於他平台skip
describe(`fsCopyFolder 失敗回報(R-FS-REJECT-01)`, function() {

    this.timeout(60000)

    let closed = { destroyed: true, fdClosed: true }

    it(`CD02 should destroy the read stream too (release its fd) when writing a file fails (parent of the target is a file)`, function() {
        let { r } = runFsFail('CD02')
        let res = r.out.res
        //R-FS-REJECT-01 規則6: 以pipe複製時讀取流或寫入流任一端出錯即destroy兩端(釋放檔案控制代碼)
        //R-FS-RESULT-01 規則1: 失敗回{ error }(Error物件)
        //R-PM-SETTLE-01 規則2: 不得產生unhandledRejection或uncaughtException(以下各案同)
        assert.strict.deepStrictEqual({ s: res.s, keys: res.keys, ek: res.error && res.error.k, streams: r.out.streams, active: r.out.active, ...ev(r) },
            { s: 'resolve', keys: ['error'], ek: 'Error', streams: [{ t: 'read', ...closed }, { t: 'write', ...closed }], active: [], ...ev0 })
    })

    it(`CD10 should destroy the read stream (release its fd) when creating the write stream throws synchronously (target folder name contains NUL)`, function() {
        let { r } = runFsFail('CD10')
        let res = r.out.res
        //R-FS-REJECT-01 規則6: 讀取流或寫入流任一端出錯即destroy兩端(釋放檔案控制代碼); 寫入流建構子同步拋錯時, 已建立之讀取流亦須銷毀
        //R-FS-RESULT-01 規則1: 失敗回{ error }(Error物件), 不觸發reject
        assert.strict.deepStrictEqual({ s: res.s, keys: res.keys, ek: res.error && res.error.k, streams: r.out.streams, active: r.out.active, ...ev(r) },
            { s: 'resolve', keys: ['error'], ek: 'Error', streams: [{ t: 'read', ...closed }], active: [], ...ev0 })
    })

    it(`CD07 should destroy the write stream too (release its fd) when reading a file in the source folder is denied`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runFsFail('CD07')
        let res = r.out.res
        //R-FS-REJECT-01 規則6: 讀取流出錯即destroy兩端(釋放寫入流之檔案控制代碼)
        assert.strict.deepStrictEqual({ s: res.s, keys: res.keys, eperm: /^Error: EPERM: /.test(res.error && res.error.v), streams: r.out.streams, active: r.out.active, ...ev(r) },
            { s: 'resolve', keys: ['error'], eperm: true, streams: [{ t: 'read', ...closed }, { t: 'write', ...closed }], active: [], ...ev0 })
    })

    it(`CD04 should resolve { error } (not reject) with useSync:false when opt.fs.lstatSync throws in the pre-check`, function() {
        let { r } = runFsFail('CD04')
        //R-FS-REJECT-01 規則2: 前置檢查之拋錯在try內, 回傳結果物件者轉為{ error }, 不觸發reject(Error物件原樣, R-FS-RESULT-01 規則5)
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'resolve', k: 'result', keys: ['error'], error: { k: 'Error', v: 'Error: lstat boom' } }, ...ev0 })
    })

    it(`CD06 should return { error } (not throw synchronously) with useSync:true when opt.fs.lstatSync throws in the pre-check`, function() {
        let { r } = runFsFail('CD06')
        //R-FS-REJECT-01 規則2: 不得同步拋出, 回傳結果物件者轉為{ error }
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'return', k: 'result', keys: ['error'], error: { k: 'Error', v: 'Error: lstat boom' } }, ...ev0 })
    })

})


describe(`fsCopyFolder 結果物件(R-FS-RESULT-01)`, function() {

    this.timeout(60000)

    it(`CD01 (守門) should resolve { error: <description string> } with useSync:false when the source does not exist`, function() {
        let { r } = runFsFail('CD01')
        //R-FS-RESULT-01 規則1、6: 所有出口回{ success }或{ error }, error為說明字串或Error物件
        assert.strict.deepStrictEqual({ res: r.out.res, ...ev(r) }, { res: { s: 'resolve', k: 'result', keys: ['error'], error: { k: 'string', v: `fpSrc[${r.out.p}] is not a folder` } }, ...ev0 })
    })

    it(`CD03 (守門) should return { error: <Error> } with useSync:true when the parent of the target is a file`, function() {
        let { r } = runFsFail('CD03')
        let res = r.out.res
        //R-FS-RESULT-01 規則1、6: error為說明字串或Error物件(捕捉之Error原樣, 規則5)
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, keys: res.keys, ek: res.error && res.error.k, ...ev(r) }, { s: 'return', k: 'result', keys: ['error'], ek: 'Error', ...ev0 })
    })

    it(`CD05 (守門) should resolve { error: <Error> } with useSync:false when listing the source folder is denied`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runFsFail('CD05')
        let res = r.out.res
        //R-FS-RESULT-01 規則1、6: error為說明字串或Error物件(捕捉之Error原樣, 規則5)
        assert.strict.deepStrictEqual({ s: res.s, k: res.k, keys: res.keys, eperm: /^Error: EPERM: /.test(res.error && res.error.v), ...ev(r) }, { s: 'resolve', k: 'result', keys: ['error'], eperm: true, ...ev0 })
    })

    it(`CD08 should resolve { error: 'null' } (truthy) and destroy the write stream when the injected read stream errors with null`, function() {
        let { r } = runFsFail('CD08')
        //R-FS-RESULT-01 規則5: error恆為truthy, 捕捉之null經_errToStr得'null'(原{ error: null })
        //R-FS-REJECT-01 規則6: 讀取流出錯即destroy兩端
        assert.strict.deepStrictEqual({ res: r.out.res, streams: r.out.streams, ...ev(r) },
            { res: { s: 'resolve', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } }, streams: [{ t: 'write', destroyed: true, fdClosed: true }], ...ev0 })
    })

    it(`CD09 should return a truthy string error with useSync:true when the injected fs.readdirSync throws null or undefined`, function() {
        let { r } = runFsFail('CD09')
        //R-FS-RESULT-01 規則5: error恆為truthy, null、undefined等非Error非字串之值經_errToStr轉字串
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, ...ev(r) }, {
            null: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } },
            undefined: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'undefined' } },
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy, 另useSync:false之getter形), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7)
    itOptUnreadable('fsCopyFolder', 'resultAsync')
    itOptUnreadable('fsCopyFolderCore', 'resultAsync')

})
