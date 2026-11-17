import assert from 'assert'
import files2data from '../src/files2data.mjs'
import { getRes } from './tools/resKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): files2data一律以固定訊息reject(不同步throw、不含輸入值、不外洩原生錯誤); 元素須為File
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、§5.1(回傳Promise者reject不同步throw)、V19、V20
//  測試作法: Node 20以上有全域File; 成功路徑以假window與假FileReader(依序回傳固定data url)驅動, 真實FileReader屬瀏覽器語義, 另以真瀏覽器實測
describe('files2data', function() {

    let MSG_FILES = 'invalid files: must be an array of File'

    //spec: files非陣列reject固定字串(含類陣列物件), 不同步throw
    for (let [label, v] of [['NaN', NaN], ['undefined', undefined], ['null', null], [`'abc'`, 'abc'], ['5', 5], ['{}', {}], ['{ length: 1, 0: file }', { length: 1, 0: new File(['a'], 'a.txt') }], ['true', true], ['function', () => {}]]) {
        it(`should reject with the fixed message when files is ${label}`, async function() {
            let r = await getRes(() => files2data(v))
            assert.strict.deepStrictEqual(r, { mode: 'reject', msg: MSG_FILES })
        })
    }

    //spec: 陣列內有非File元素reject固定字串, 帶第一個無效元素之索引(含Blob: 無name不收)
    let f0 = new File(['a'], 'a.txt', { type: 'text/plain' })
    for (let [label, bad] of [['null', null], ['undefined', undefined], ['a Blob', new Blob(['x'])], [`a string`, 'x'], ['a number', 5], ['an object with name', { name: 'a.txt', size: 1, type: 'text/plain' }], ['an array', []]]) {
        it(`should reject with the index of the first element that is ${label}`, async function() {
            let r = await getRes(() => files2data([f0, bad, f0, 7]))
            assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid files[1]: must be a File' })
        })
    }

    it(`should reject for a sparse array hole and report its index`, async function() {
        // eslint-disable-next-line no-sparse-arrays
        let r = await getRes(() => files2data([f0, , f0]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid files[1]: must be a File' })
    })

    it(`should reject for a first element that is null (the former synchronous native TypeError)`, async function() {
        let r = await getRes(() => files2data([null]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid files[0]: must be a File' })
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the rejection`, async function() {
        let r1 = await getRes(() => files2data('SECRET-files-9f3a'))
        assert.strict.deepStrictEqual(r1.msg.includes('SECRET'), false)
        let r2 = await getRes(() => files2data([{ name: 'SECRET-name-9f3a' }]))
        assert.strict.deepStrictEqual(r2.msg.includes('SECRET'), false)
    })

    //spec: 空陣列為合法輸入, resolve空陣列
    it('should resolve [] when input is an empty array', async function() {
        let r = await getRes(() => files2data([]))
        assert.strict.deepStrictEqual(r.mode, 'resolve')
        assert.strict.deepStrictEqual(r.msg, [])
    })

    //spec: 讀取失敗reject固定字串(不懸置、不外洩原生錯誤; 非瀏覽器環境下blobs2b64s回'no window'亦改固定字串)
    it('should reject (not hang) with the fixed message when the underlying blobs2b64s fails', async function() {
        //原碼之.then無.catch, blobs2b64s一旦reject則pm永不settle, 呼叫端await會永久掛住
        let r = await getRes(() => files2data([new File([new Uint8Array([1])], 'a.bin')]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'can not convert files to base64' })
    })

    //spec: 成功路徑(假window與FileReader): 各File轉為{ name, size, type, b64 }, 順序同輸入
    it('should resolve name, size, type and b64 of each File in order', async function() {
        let hadWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window')
        let rawWindow = globalThis.window
        let hadFR = Object.prototype.hasOwnProperty.call(globalThis, 'FileReader')
        let rawFR = globalThis.FileReader
        globalThis.window = { document: {} }
        globalThis.FileReader = class FileReader {
            readAsDataURL(bb) {
                this.result = `data:${bb.type};base64,B64-${bb.size}`
                setTimeout(() => this.onload(), 0)
            }
        }
        try {
            let a = new File(['aaa'], 'a.txt', { type: 'text/plain' })
            let b = new File(['bb'], 'b.png', { type: 'image/png' })
            let r = await getRes(() => files2data([a, b]))
            assert.strict.deepStrictEqual(r.mode, 'resolve')
            assert.strict.deepStrictEqual(r.msg, [
                { name: 'a.txt', size: 3, type: 'text/plain', b64: 'data:text/plain;base64,B64-3' },
                { name: 'b.png', size: 2, type: 'image/png', b64: 'data:image/png;base64,B64-2' },
            ])
        }
        finally {
            if (hadWindow) {
                globalThis.window = rawWindow
            }
            else {
                delete globalThis.window
            }
            if (hadFR) {
                globalThis.FileReader = rawFR
            }
            else {
                delete globalThis.FileReader
            }
        }
    })

})
