import assert from 'assert'
import crypto from 'crypto'
import getFileBasicHash from '../src/getFileBasicHash.mjs'
import getFileXxHash from '../src/getFileXxHash.mjs'
import getFileHash from '../src/getFileHash.mjs'
import { INVALID_EINT_EXTRA } from './tools/optValKit.mjs'
import { resetWarned, capture } from './tools/numOptKit.mjs'
import { defineOptParamAsync, defineWarnEach, INVALID_WARN } from './tools/optValKitAsyncG3count.mjs'


//瀏覽器Blob版雜湊函數之opt.chunkSize(排程第221項第二批已知缺陷先修, ws270): opt類參數(JSDoc [opt.chunkSize=64*1024*1024]), iseint(use: 'count', min: 1, max: 2^30, 同fsGetFileHashCore),
//  非預期(含0、負數、小數、超過上限、Infinity、'0x10'、包裝物件)改用預設64mb, 不報錯; opt.debug為true時警告(固定詞彙、不含值)
//  規格: dspec〈輸入參數之檢測機制〉§7.1 opt類、K3、K4、§11 Infinity一律非預期; 規則R-OPT-VAL-01
//  觀察值: 以Blob子類記錄slice之切片範圍, 首次slice之(end - start)即實際使用之chunkSize; 暴走防護: slice呼叫超過8次即拋錯, 使修前不終止之原碼成為紅燈而非卡死
//  chunkSize為0或負數而不終止之真實行為(修前卡死、修後同預設雜湊)另於子行程驗(intInputHang.test.mjs)
const DEF = 64 * 1024 * 1024
const BODY = Buffer.from('abc')
const H_SHA256 = crypto.createHash('sha256').update(BODY).digest('hex')
const H_SHA512 = crypto.createHash('sha512').update(BODY).digest('hex')
const H_XXH64 = '44bc2cf5ad770999' //XXH64('abc', seed 0)


class SpyBlob extends Blob {

    constructor(parts, calls, max = 8) {
        super(parts)
        this._calls = calls
        this._max = max
    }

    slice(s, e, t) {
        this._calls.push([s, e])
        if (this._calls.length > this._max) {
            throw new Error('runaway slice loop')
        }
        return super.slice(s, e, t)
    }

}


async function probeBasic(v, o = {}) {
    let calls = []
    let h = await getFileBasicHash(new SpyBlob([BODY], calls), { type: 'sha256', chunkSize: v, ...o })
    assert.strict.deepStrictEqual(h, H_SHA256)
    return calls[0][1] - calls[0][0]
}
async function probeXx(v, o = {}) {
    let calls = []
    let h = await getFileXxHash(new SpyBlob([BODY], calls), { chunkSize: v, ...o })
    assert.strict.deepStrictEqual(h, H_XXH64)
    return calls[0][1] - calls[0][0]
}
async function probeGetXx(v, o = {}) {
    let calls = []
    let h = await getFileHash(new SpyBlob([BODY], calls), { type: 'xxhash64', chunkSize: v, ...o })
    assert.strict.deepStrictEqual(h, H_XXH64)
    return calls[0][1] - calls[0][0]
}
async function probeGetBasic(v, o = {}) {
    let calls = []
    let h = await getFileHash(new SpyBlob([BODY], calls), { type: 'sha256', chunkSize: v, ...o })
    assert.strict.deepStrictEqual(h, H_SHA256)
    return calls[0][1] - calls[0][0]
}


//有效值(上限2^30)與無效值
const VALID = [
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
const EXTRA_INVALID = [
    ...INVALID_EINT_EXTRA,
    ['0 (min is 1, was hang)', 0],
    [`'0' (was hang)`, '0'],
    ['-1 (was hang)', -1],
    [`'-1' (was hang)`, '-1'],
    ['-0.5', -0.5],
    ['0.5', 0.5],
    ['2 ** 30 + 1 (over upper bound)', 2 ** 30 + 1],
    ['2 ** 32', 2 ** 32],
    ['2 ** 53', 2 ** 53],
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['Number.MAX_VALUE', Number.MAX_VALUE],
    [`'0x10'`, '0x10'],
    [`new Number(16)`, new Number(16)], // eslint-disable-line no-new-wrappers
    [`new String('16')`, new String('16')], // eslint-disable-line no-new-wrappers
]


describe('optVal Blob hash chunkSize', function() {

    this.timeout(60000)

    let fns = [
        ['getFileBasicHash', probeBasic],
        ['getFileXxHash', probeXx],
    ]
    for (let [fn, probe] of fns) {

        //每個非預期之輸入皆警告一次
        defineWarnEach({ fn, name: 'opt.chunkSize', probe, list: [...INVALID_WARN, ...EXTRA_INVALID] })

        defineOptParamAsync({
            fn,
            name: 'opt.chunkSize',
            def: DEF,
            probe,
            valid: VALID,
            extraInvalid: EXTRA_INVALID,
        })

    }

    it('should use the default chunkSize when opt is not a plain object (null, string, number, array, undefined)', async function() {
        for (let o of [null, 'abc', 5, [], undefined]) {
            let calls = []
            let r = await getFileBasicHash(new SpyBlob([BODY], calls), o)
            assert.strict.deepStrictEqual(r, H_SHA512, `getFileBasicHash ${String(o)}`)
            assert.strict.deepStrictEqual(calls[0][1] - calls[0][0], DEF, `getFileBasicHash ${String(o)}`)

            calls = []
            r = await getFileXxHash(new SpyBlob([BODY], calls), o)
            assert.strict.deepStrictEqual(r, H_XXH64, `getFileXxHash ${String(o)}`)
            assert.strict.deepStrictEqual(calls[0][1] - calls[0][0], DEF, `getFileXxHash ${String(o)}`)
        }
    })

    it('should give the same hash for any chunkSize on a multi-chunk body (chunk 1, 2, 3, 4, "2", 0, -1, Infinity)', async function() {
        // 雜湊不因chunkSize而不同: 切成多片(1、2位元組)與非預期值(改用預設)之結果皆等於整份計算(Node crypto為獨立對照)
        let body = Buffer.from('hello world, hello wsemi')
        let hSha = crypto.createHash('sha256').update(body).digest('hex')
        let hXx = await getFileXxHash(new Blob([body]))
        for (let v of [1, 2, 3, 4, '2', 7, 0, -1, Infinity, 2.5, 'abc']) {
            assert.strict.deepStrictEqual(await getFileBasicHash(new SpyBlob([body], [], 100), { type: 'sha256', chunkSize: v }), hSha, `basic ${String(v)}`)
            assert.strict.deepStrictEqual(await getFileXxHash(new SpyBlob([body], [], 100), { chunkSize: v }), hXx, `xx ${String(v)}`)
        }
    })

    it('should slice by the given chunkSize (valid) until the whole body is read', async function() {
        // 8位元組內文, chunkSize 3: 切片範圍須為[0,3]、[3,6]、[6,9]
        let calls = []
        let h = await getFileXxHash(new SpyBlob([Buffer.from('12345678')], calls), { chunkSize: 3 })
        assert.strict.deepStrictEqual(calls, [[0, 3], [3, 6], [6, 9]])
        assert.strict.deepStrictEqual(h, await getFileXxHash(new Blob([Buffer.from('12345678')])))
    })

    it('getFileHash should hand the opt (chunkSize, debug, funLog) over to getFileXxHash and getFileBasicHash', async function() {
        // getFileHash之opt原樣轉交, chunkSize於getFileXxHash(xxhash64)或getFileBasicHash(其他type)解析; 警告之fn為實際解析者
        for (let [probe, fn] of [[probeGetXx, 'getFileXxHash'], [probeGetBasic, 'getFileBasicHash']]) {
            for (let [, v, exp] of [['16', 16, 16], ['0', 0, DEF], ['Inf', Infinity, DEF], ['str', '0x10', DEF]]) {
                resetWarned()
                let { funLog, logs } = capture()
                assert.strict.deepStrictEqual(await probe(v, { debug: true, funLog }), exp)
                assert.strict.deepStrictEqual(logs.map((l) => l.info), exp === DEF ? [{ fn, reason: 'invalid', key: 'opt.chunkSize' }] : [])
            }
        }
        resetWarned()
    })

})
