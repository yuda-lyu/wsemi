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

    it(`should return { state: 'error', msg: 'invalid ab' } when input NaN with returnWithStateAndMsg`, function() {
        let r = ab2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ab' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = ab2u8arr(new Uint8Array([66, 97, 115]).buffer, { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`ab2u8arr 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //Proxy(ArrayBuffer): isab僅讀Symbol.toStringTag, 回'ArrayBuffer'即通過檢查; try內new Uint8Array(ab)讀其Symbol.iterator等其餘屬性時於陷阱拋出指定值
    //thrownCases(test/tools/codecThrown.mjs)為呼叫端可拋出之各種值, msg為_errToStr應得之字串; 修正前catch內err.toString()遇其任一皆再拋TypeError, 使函數同步外拋至呼叫端
    let mkAb = (v) => new Proxy(new ArrayBuffer(8), {
        get(target, key) {
            if (key === Symbol.toStringTag) {
                return 'ArrayBuffer'
            }
            throw v
        },
    })

    //預設模式失敗時回傳空Uint8Array, 錯誤字串不外露, 故任何拋出值皆為同一結果
    it(`should not throw but return an empty Uint8Array whatever the Proxy(ArrayBuffer) trap throws without opt [R-CODEC-ERR-01之2]`, function() {
        for (let c of thrownCases) {
            let r = null
            assert.doesNotThrow(() => {
                r = ab2u8arr(mkAb(c.mk()))
            }, c.name)
            assert.strict.deepStrictEqual(showDeep(r), new Uint8Array(), c.name)
        }
    })

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: '${c.msg}' } when the Proxy(ArrayBuffer) trap throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = ab2u8arr(mkAb(c.mk()), { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: c.msg })
        })
    }

    it(`(守門) should return { state: 'error', msg: 'Error: boom' } (same as err.toString()) when the Proxy(ArrayBuffer) trap throws an Error with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
        let r = ab2u8arr(mkAb(new Error('boom')), { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'Error: boom' })
    })

})
