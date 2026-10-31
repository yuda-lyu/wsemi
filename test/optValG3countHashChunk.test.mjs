import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Readable } from 'stream'
import fsGetFileXxHashCore from '../src/fsGetFileXxHashCore.mjs'
import fsGetFileHashCore from '../src/fsGetFileHashCore.mjs'
import { INVALID_EINT_EXTRA } from './tools/optValKit.mjs'
import { resetWarned, capture } from './tools/numOptKit.mjs'
import { defineOptParamAsync, defineWarnEach, INVALID_WARN } from './tools/optValKitAsyncG3count.mjs'


//雜湊類函數之opt.chunkSize: opt類參數(JSDoc [opt.chunkSize=64*1024*1024]), iseint(use: 'count', min: 1), 非預期(含0、負數、小數、超出範圍、Infinity)改用預設64mb
//  fsGetFileXxHashCore、fsGetFileHashCore: 另有上限2^30(同Node之Readable.read(n)之上限1GiB), 超過者亦改用預設(原既有行為, 併入判定範圍)
//  本輪(第一級發布A)只納入fsGetFileXxHashCore與fsGetFileHashCore; getFileBasicHash、getFileXxHash(瀏覽器Blob版, 有Infinity邊界)與getFileHash(僅JSDoc, 轉交前二者)維持1.9.36原碼, 其測試不在此
const DEF = 64 * 1024 * 1024


//fs替身: 僅使fsIsFileCore前置檢查通過, createReadStream記錄所收之highWaterMark並回傳含3位元組之可讀串流
function mkFs(hwm) {
    return {
        statSync: () => ({}),
        lstatSync: () => ({ isDirectory: () => false, isSymbolicLink: () => false }),
        createReadStream: (p, o) => {
            hwm.push(o ? o.highWaterMark : undefined)
            return Readable.from([Buffer.from('abc')])
        },
    }
}


//Node版之觀察值: createReadStream所收之highWaterMark(恰一次)
async function probeFsXx(v, o = {}) {
    let hwm = []
    let r = await fsGetFileXxHashCore('x.bin', { fs: mkFs(hwm), chunkSize: v, ...o })
    assert.ok(typeof r === 'string' && r.length === 16, `hash ${r}`)
    assert.strict.deepStrictEqual(hwm.length, 1)
    return hwm[0]
}
async function probeFsHash(v, o = {}) {
    let hwm = []
    let r = await fsGetFileHashCore('x.bin', { fs: mkFs(hwm), type: 'xxhash64', chunkSize: v, ...o })
    assert.ok(typeof r === 'string' && r.length === 16, `hash ${r}`)
    assert.strict.deepStrictEqual(hwm.length, 1)
    return hwm[0]
}


//Node版之有效值與無效值(上限2^30)
const VALID_FS = [
    ['1 (lower bound)', 1, 1],
    ['2', 2, 2],
    ['4096', 4096, 4096],
    ['16 * 1024 * 1024', 16 * 1024 * 1024, 16 * 1024 * 1024],
    ['2 ** 30 (upper bound)', 2 ** 30, 2 ** 30],
    [`'4096'`, '4096', 4096],
    [`' 4096 '`, ' 4096 ', 4096],
    [`'\\t512\\n'`, '\t512\n', 512],
    [`'1e3'`, '1e3', 1000],
    [`'+8.'`, '+8.', 8],
    [`'00016'`, '00016', 16],
    [`'1073741824' (2 ** 30)`, '1073741824', 2 ** 30],
]
const EXTRA_INVALID_FS = [
    ...INVALID_EINT_EXTRA,
    ['0 (min is 1)', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    ['0.5', 0.5],
    ['2 ** 30 + 1 (over upper bound)', 2 ** 30 + 1],
    ['2 ** 31 (was hang)', 2 ** 31],
    ['2 ** 32 (was empty hash)', 2 ** 32],
    ['4294967295', 4294967295],
    ['2 ** 53 (was RangeError)', 2 ** 53],
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['Number.MAX_VALUE', Number.MAX_VALUE],
    [`'0x10'`, '0x10'],
    [`new Number(16)`, new Number(16)], // eslint-disable-line no-new-wrappers
    [`new String('16')`, new String('16')], // eslint-disable-line no-new-wrappers
]


describe('optVal hash chunkSize', function() {

    this.timeout(60000)

    //每個非預期之輸入皆警告一次(補足單一字串輸入之不足; 超出範圍或收下與否在結果上恰與預設相同者亦能偵測)
    defineWarnEach({ fn: 'fsGetFileXxHashCore', name: 'opt.chunkSize', probe: probeFsXx, list: [...INVALID_WARN, ...EXTRA_INVALID_FS] })
    defineWarnEach({ fn: 'fsGetFileHashCore', name: 'opt.chunkSize', probe: probeFsHash, list: [...INVALID_WARN, ...EXTRA_INVALID_FS] })

    defineOptParamAsync({
        fn: 'fsGetFileXxHashCore',
        name: 'opt.chunkSize',
        def: DEF,
        probe: probeFsXx,
        valid: VALID_FS,
        extraInvalid: EXTRA_INVALID_FS,
    })

    defineOptParamAsync({
        fn: 'fsGetFileHashCore',
        name: 'opt.chunkSize',
        def: DEF,
        probe: probeFsHash,
        valid: VALID_FS,
        extraInvalid: EXTRA_INVALID_FS,
    })

    it('should give the same hash for Node fs variants whatever the chunkSize (real file, small chunk and unexpected)', async function() {
        // 臨時檔置於本檔所在資料夾之test/_tmp/<案名>/, 結束刪除
        let fd = path.join(path.dirname(fileURLToPath(import.meta.url)), '_tmp', 'optValG3countHashChunk')
        let fp = path.join(fd, 'a.bin')
        fs.mkdirSync(fd, { recursive: true })
        fs.writeFileSync(fp, Buffer.from('hello world, hello wsemi'))
        try {
            let h0 = await fsGetFileXxHashCore(fp, { fs })
            for (let v of [1, 3, '4', 0, -1, 2.5, Infinity, 'abc', 2 ** 31]) {
                assert.strict.deepStrictEqual(await fsGetFileXxHashCore(fp, { fs, chunkSize: v }), h0, `xx ${String(v)}`)
                assert.strict.deepStrictEqual(await fsGetFileHashCore(fp, { fs, type: 'xxhash64', chunkSize: v }), h0, `hash ${String(v)}`)
            }
        }
        finally {
            fs.rmSync(fd, { recursive: true, force: true })
        }
    })

    it('should warn once from fsGetFileHashCore (not again from fsGetFileXxHashCore) for an unexpected chunkSize', async function() {
        // fsGetFileHashCore於入口即判定並改用預設, 再傳給fsGetFileXxHashCore者為解析後之值; 警告為固定詞彙、不含值
        resetWarned()
        let { funLog, logs } = capture()
        let hwm = []
        await fsGetFileHashCore('x.bin', { fs: mkFs(hwm), type: 'xxhash64', chunkSize: 'SECRET-VALUE-123', debug: true, funLog })
        //fsGetFileHashCore已解析並改用預設, 再傳給fsGetFileXxHashCore者為解析後之值, 故只警告一次(來自fsGetFileHashCore)
        assert.strict.deepStrictEqual(logs.map((l) => l.info), [{ fn: 'fsGetFileHashCore', reason: 'invalid', key: 'opt.chunkSize' }])
        assert.ok(!logs[0].msg.includes('SECRET'))
        assert.strict.deepStrictEqual(hwm, [DEF])
        resetWarned()
    })

})
