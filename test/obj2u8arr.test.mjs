import assert from 'assert'
import obj2u8arr from '../src/obj2u8arr.mjs'
import u8arr2obj from '../src/u8arr2obj.mjs'
import { thrower, thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`obj2u8arr`, function() {
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
    }
    let cdata = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`
    let u8a = new Uint8Array([
        64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44,
        51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
        52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
        184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
        123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101,
        70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97,
        121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115
    ])
    let cu8a = `new Uint8Array([ 64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44, 51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44, 52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228, 184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58, 123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101, 70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115 ])`

    it(`should return ${cu8a} when input ${cdata}`, function() {
        let r = obj2u8arr(data)
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = obj2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = obj2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = obj2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = obj2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = obj2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = obj2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input an object with BigInt`, function() {
        //序列化失敗時不得產出結構合法但內容為空之封包(解碼端無從辨識)
        let r = obj2u8arr({ id: 1n, name: 'x' })
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input a circular object`, function() {
        let o = { x: 1 }
        o.self = o
        let r = obj2u8arr(o)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should encode an effective array (not an empty packet) when input [1, 2, 3]`, function() {
        //陣列為契約內之輸入型別, 不得回空Uint8Array
        let r = obj2u8arr([1, 2, 3])
        assert.strict.deepStrictEqual(r.length > 0, true, `陣列應可編碼, got ${JSON.stringify(Array.from(r))}`)
    })

    it(`should return { state: 'success', msg } when input [1, 2, 3] with returnWithStateAndMsg`, function() {
        let r = obj2u8arr([1, 2, 3], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(r.msg.length > 0, true)
    })

    it(`should return { state: 'success', msg: ${cu8a} } when input ${cdata} with returnWithStateAndMsg`, function() {
        let r = obj2u8arr(data, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: u8a }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data: must be a non-empty object or a non-empty array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = obj2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data: must be a non-empty object or a non-empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep every block intact when merging many blocks`, function() {
        //各分塊內容互異, 確認合併後之偏移量正確
        let n = 64
        let o = {}
        for (let i = 0; i < n; i++) {
            o[`b${i}`] = new Uint8Array([i % 256, (i * 7) % 256, (i * 13) % 256])
        }
        let r = u8arr2obj(obj2u8arr(o))
        assert.strict.deepStrictEqual(r, o)
    })

    it(`should merge many blocks in linear time (not quadratic)`, function() {
        //原以逐次concatU8arr合併, 每次都重新配置並複製已累積全部, 總計為O(n^2); 須先算總長一次配置後依偏移寫入
        //實測(4MB): 修前1024塊約484ms、4096塊約1938ms; 修後皆為個位數ms, 故200ms之門檻對修後有數十倍餘裕
        this.timeout(60000)
        let n = 1024
        let sz = 4096
        let o = {}
        for (let i = 0; i < n; i++) {
            o[`b${i}`] = new Uint8Array(sz)
        }
        let t0 = Date.now()
        let r = obj2u8arr(o)
        let ms = Date.now() - t0
        assert.strict.deepStrictEqual(r.length > n * sz, true)
        assert.strict.deepStrictEqual(ms < 200, true, `${n}個分塊之合併應為線性, 實測 ${ms} ms`)
    })

    it(`should encode a single-element array whose only element is an empty value`, function() {
        //不可用isearr判斷: 其於長度為1時會額外檢查該元素是否有效, 使單元素陣列因元素為空值而被整個拒絕
        for (let o of [[''], [null], [0], [false]]) {
            let r = obj2u8arr(o)
            assert.strict.deepStrictEqual(r.length > 0, true, `${JSON.stringify(o)} 應可編碼, got ${JSON.stringify(Array.from(r))}`)
        }
    })

    it(`should not throw but return { state: 'error', msg: 'obj2stru8arr: <Error>' } when input data has a throwing getter`, function() {
        //序列化之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get a() {
                throw new Error('boom-getter')
            },
        }
        let r = obj2u8arr(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' } //第559項④: 轉交前綴('obj2stru8arr: ')為合規形式, 其後為固定訊息, 不含getter所拋之文字'boom-getter'(V20)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' } when input an object with BigInt with returnWithStateAndMsg`, function() {
        //內部呼叫之錯誤須前置來源函數名, 供辨識是哪一步出錯
        let r = obj2u8arr({ id: 1n, name: 'x' }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' })
    })

    it(`should return ${cu8a} when input ${cdata} with invalid returnWithStateAndMsg`, function() {
        let r = obj2u8arr(data, { returnWithStateAndMsg: 'yes' })
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`obj2u8arr 呼叫端拋出任意值(R-CODEC-ERR-01之2)`, function() {

    //mkProxyAb, 讀取buffer時拋出v之真Uint8Array(第552項: isab、isu8arr改以內部槽判定, 包裝成Proxy之ArrayBuffer不再被判為ArrayBuffer; 真Uint8Array通過判定後, 合併時toU8arrView以b.buffer取位元組視圖而讀到自有之buffer存取器)
    //  函數名沿用mkProxyAb(原為讀取Symbol.iterator時拋出v之ArrayBuffer Proxy)
    let mkProxyAb = (v) => {
        let u8a = new Uint8Array(4)
        Object.defineProperty(u8a, 'buffer', {
            get() {
                throw v
            },
        })
        return u8a
    }
    let mkProxyAbOld = (v) => {
        return new Proxy(new ArrayBuffer(4), {
            get(t, k) {
                if (k === Symbol.iterator) {
                    throw v
                }
                return Reflect.get(t, k)
            },
        })
    }

    //第552項: isab以內部槽判定, Proxy包裝之ArrayBuffer(無內部槽)不再被判為ArrayBuffer, 依一般物件序列化(不進入打包步驟, 不拋錯)
    it(`should treat a Proxy-wrapped ArrayBuffer as a plain object (not packed as binary, no error) [第552項]`, function() {
        let r = obj2u8arr({ ab: mkProxyAbOld(null) }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
    })

    //第559項④(V20): 合併二進位時讀取拋錯之msg為固定詞彙, 不含呼叫端所拋出之文字(原為拋出值之文字, 如'null'、'Error: boom'); 細節經opt.funLog之診斷出口(預設靜默)
    it(`should not throw but return { state: 'error', msg: 'invalid data: must be readable binary' } (not the thrown text 'null') when packing a Uint8Array whose buffer getter throws null with returnWithStateAndMsg [R-CODEC-ERR-01之2, 第559項④]`, function() {
        let r = null
        assert.doesNotThrow(() => {
            r = obj2u8arr({ ab: mkProxyAb(null) }, { returnWithStateAndMsg: true })
        })
        assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'invalid data: must be readable binary' })
    })

    it(`should hand the thrown detail only to opt.funLog and not leak the thrown text into msg`, function() {
        let u8a = new Uint8Array(4)
        Object.defineProperty(u8a, 'buffer', {
            get() {
                throw new Error('SECRET-559-merge')
            },
        })
        let calls = []
        let r = obj2u8arr({ b: u8a }, { returnWithStateAndMsg: true, funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid data: must be readable binary' })
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], ['[wsemi obj2u8arr] can not pack', { errType: 'Error' }])
        //序列化失敗(obj2stru8arr)之診斷亦經同一funLog(opt.funLog轉交)
        let calls2 = []
        let o = {}
        o.self = o
        let r2 = obj2u8arr(o, { returnWithStateAndMsg: true, funLog: (label) => calls2.push(label) })
        assert.strict.deepStrictEqual(r2, { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' })
        assert.strict.deepStrictEqual(calls2, ['[wsemi obj2stru8arr] can not serialize'])
    })

    it(`should not throw but return new Uint8Array() when packing a Uint8Array whose buffer getter throws null without opt [R-CODEC-ERR-01之2]`, function() {
        let r = null
        assert.doesNotThrow(() => {
            r = obj2u8arr({ ab: mkProxyAb(null) })
        })
        assert.strict.deepStrictEqual(showDeep(r), new Uint8Array())
    })

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' } (not the thrown text '${c.msg}') when toJSON throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2, 第559項④]`, function() {
            //序列化步驟(obj2stru8arr)之錯誤須前置來源函數名, 其後為obj2stru8arr之固定訊息(不含呼叫端所拋出之文字)
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2u8arr(data, { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'obj2stru8arr: invalid o: must be serializable to JSON' })
        })
    }

    it(`should not throw but return new Uint8Array() when toJSON throws any value without opt [R-CODEC-ERR-01之2]`, function() {
        for (let c of thrownCases) {
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2u8arr(data)
            })
            assert.strict.deepStrictEqual(showDeep(r), new Uint8Array(), `toJSON throws ${c.name}`)
        }
    })

})
