import assert from 'assert'
import { mock } from 'node:test'
import browserView from '../src/browserView.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§3.4、§5; 本套件R-BROWSER-OPEN-01規則1(內部槽判定之單一擁有者src/_browserData.mjs)
//外審terra複核N1(執行環境無ArrayBuffer.prototype.detached存取器時須仍能排除已分離之緩衝區)、N5(模組載入後才提供Blob之環境)、N2(通過檢查卻無法建立Blob者以固定訊息拋出)
//_browserData於載入時取內建存取器, 以查詢字串載入新的模組實例模擬不同之執行環境; 測完還原全域


let MSG_DATA = 'invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView'


//detachedPair, 已分離之ArrayBuffer與分離前建立之檢視
function detachedPair() {
    let ab = new ArrayBuffer(4)
    let u8 = new Uint8Array(ab)
    let dv = new DataView(ab)
    structuredClone(ab, { transfer: [ab] })
    return { ab, u8, dv }
}


describe(`_browserData`, function() {

    it(`should reject detached ArrayBuffer and views, and accept a valid zero-length ArrayBuffer, when ArrayBuffer.prototype.detached is absent [N1 無detached存取器之環境]`, async function() {
        let d = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'detached')
        let bd = null
        try {
            delete ArrayBuffer.prototype.detached
            bd = (await import('../src/_browserData.mjs?noDetached=1')).default
        }
        finally {
            if (d !== undefined) {
                Object.defineProperty(ArrayBuffer.prototype, 'detached', d) // eslint-disable-line no-extend-native -- 還原原生描述符(模擬無detached存取器之環境後)
            }
        }
        let { ab, u8, dv } = detachedPair()
        let out = [
            bd.isBlobPart(ab), bd.isBlobPart(u8), bd.isBlobPart(dv), bd.isU8arrBrand(u8),
            bd.isBlobPart(new ArrayBuffer(0)), bd.isBlobPart(new Uint8Array(0)), bd.isU8arrBrand(new Uint8Array(0)), bd.isBlobPart(new ArrayBuffer(3)),
        ]
        assert.strict.deepStrictEqual(out, [false, false, false, false, true, true, true, true])
    })

    it(`should reject detached buffers with the detached accessor(current runtime) as well [N1 對照]`, async function() {
        let bd = (await import('../src/_browserData.mjs')).default
        let { ab, u8, dv } = detachedPair()
        assert.strict.deepStrictEqual([bd.isBlobPart(ab), bd.isBlobPart(u8), bd.isBlobPart(dv), bd.isU8arrBrand(u8), bd.isBlobPart(new ArrayBuffer(0))], [false, false, false, false, true])
    })

    it(`should recognize a genuine Blob when Blob becomes available after the module is loaded [N5 延後提供Blob]`, async function() {
        let d = Object.getOwnPropertyDescriptor(globalThis, 'Blob')
        let bd = null
        try {
            delete globalThis.Blob
            bd = (await import('../src/_browserData.mjs?lateBlob=1')).default
        }
        finally {
            Object.defineProperty(globalThis, 'Blob', d)
        }
        assert.strict.deepStrictEqual([bd.isBlobBrand(new Blob(['a'])), bd.isBlobPart(new Blob(['a'])), bd.isBlobBrand({ [Symbol.toStringTag]: 'Blob' })], [true, true, false])
    })

    it(`browserView should throw '${MSG_DATA}' without leaking the native error when a checked value still can not build a Blob(Blob subclass whose size getter throws) [N2]`, function() {
        mock.timers.enable({ apis: ['setTimeout'] })
        let env = mkBrowserFake()
        try {
            class Sub extends Blob {
                get size() {
                    throw new Error('SUB_SIZE')
                }
            }
            let msg = null
            try {
                browserView(new Sub(['abc']), 'text/plain')
            }
            catch (err) {
                msg = err.message
            }
            //通過內部槽檢查之子類, Node建立Blob時讀其覆寫之size而拋錯(外審terra複核N2實測): 以固定訊息拋出、不外洩原生錯誤、不開分頁
            assert.strict.deepStrictEqual([msg, env.opens.length, env.urls.length], [MSG_DATA, 0, 0])
        }
        finally {
            clearBrowserFake()
            mock.timers.reset()
        }
    })

})
