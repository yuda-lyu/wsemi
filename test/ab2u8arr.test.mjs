import assert from 'assert'
import ab2u8arr from '../src/ab2u8arr.mjs'
import u8arr2ab from '../src/u8arr2ab.mjs'
import { thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`ab2u8arr`, function() {

    let u8a = new Uint8Array([66, 97, 115])
    let ab = u8arr2ab(u8a)
    it(`should return ${u8a} when input ${ab}`, function() {
        let r = ab2u8arr(ab)
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input '1.25'`, function() {
        let r = ab2u8arr('1.25')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = ab2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = ab2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = ab2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = ab2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = ab2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = ab2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = ab2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input an ArrayBuffer with returnWithStateAndMsg`, function() {
        let r = ab2u8arr(new Uint8Array([66, 97, 115]).buffer, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint8Array([66, 97, 115]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid ab: must be an ArrayBuffer' } when input NaN with returnWithStateAndMsg`, function() {
        let r = ab2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ab: must be an ArrayBuffer' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = ab2u8arr(new Uint8Array([66, 97, 115]).buffer, { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`ab2u8arr 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //第552項: isab改以內部槽判定, Proxy(ArrayBuffer)不再通過檢查(其陷阱不可能被觸發); 真ArrayBuffer之new Uint8Array(ab)無使用端程式可拋值,
    //  故以暫時換掉全域Uint8Array(Proxy, 只對以ArrayBuffer為首引數之建構拋出指定值, 其餘建構照舊)模擬「建構時拋出任意值」, 覆蓋catch內之_errToStr(非Error之值不致使catch再拋)
    //thrownCases(test/tools/codecThrown.mjs)為可拋出之各種值, msg為_errToStr應得之字串; 修正前catch內err.toString()遇其任一皆再拋TypeError, 使函數同步外拋至呼叫端
    //  斷言於還原全域之後才做(替換期間不呼叫assert)
    let mkAb = () => new ArrayBuffer(8)
    let withThrowingCtor = (v, f) => {
        let saved = globalThis.Uint8Array
        globalThis.Uint8Array = new Proxy(saved, {
            construct(t, args, nt) {
                if (args[0] instanceof ArrayBuffer) {
                    throw v
                }
                return Reflect.construct(t, args, nt)
            },
        })
        let r = null
        let threw = null
        try {
            r = f()
        }
        catch (err) {
            threw = String(err && err.message)
        }
        finally {
            globalThis.Uint8Array = saved
        }
        return { r, threw }
    }

    //預設模式失敗時回傳空Uint8Array, 錯誤字串不外露, 故任何拋出值皆為同一結果
    it(`should not throw but return an empty Uint8Array whatever the Uint8Array construction throws without opt [R-CODEC-ERR-01之2]`, function() {
        for (let c of thrownCases) {
            let { r, threw } = withThrowingCtor(c.mk(), () => ab2u8arr(mkAb()))
            assert.strict.deepStrictEqual(threw, null, c.name)
            assert.strict.deepStrictEqual(showDeep(r), new Uint8Array(), c.name)
        }
    })

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: '${c.msg}' } when the Uint8Array construction throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
            let { r, threw } = withThrowingCtor(c.mk(), () => ab2u8arr(mkAb(), { returnWithStateAndMsg: true }))
            assert.strict.deepStrictEqual(threw, null)
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: c.msg })
        })
    }

    //第552項: isab以內部槽判定, Proxy(ArrayBuffer)(含偽造標籤者)不是ArrayBuffer, 以固定訊息回報而不觸發其陷阱
    it(`should reject a Proxy(ArrayBuffer) without triggering its traps (isab uses the internal slot) [第552項]`, function() {
        let hits = 0
        let p = new Proxy(new ArrayBuffer(8), {
            get(target, key) {
                hits += 1
                return key === Symbol.toStringTag ? 'ArrayBuffer' : undefined
            },
        })
        let r = ab2u8arr(p, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual([r, hits], [{ state: 'error', msg: 'invalid ab: must be an ArrayBuffer' }, 0])
    })

    it(`(守門) should return { state: 'error', msg: 'Error: boom' } (same as err.toString()) when the Uint8Array construction throws an Error with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
        let { r } = withThrowingCtor(new Error('boom'), () => ab2u8arr(mkAb(), { returnWithStateAndMsg: true }))
        assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'Error: boom' })
    })

})
